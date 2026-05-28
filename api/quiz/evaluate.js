const { requireAuth } = require('../../_middleware/auth');
const { getSupabaseAdmin } = require('../../_lib/env');

/**
 * FAILSAFE QUIZ EVALUATOR
 * 
 * Prevents client-side manipulation by strictly evaluating answers on the server.
 * 
 * METHOD: POST
 * REQUIRED ROLE: student (or higher)
 */
module.exports = async function handler(req, res) {
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        // 1. Authorize User
        const user = await requireAuth(req, res);
        const { sessionId, submittedAnswers } = req.body;
        
        if (!sessionId || !submittedAnswers) {
            return res.status(400).json({ error: 'Missing sessionId or submittedAnswers payload' });
        }

        const supabase = getSupabaseAdmin();

        // 2. Fetch the Active Session securely via Admin Client
        const { data: session, error: sessionError } = await supabase
            .from('quiz_sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('user_id', user.id)
            .single();

        if (sessionError || !session) {
            return res.status(404).json({ error: 'Active session not found or access denied.' });
        }

        if (session.status !== 'active') {
            return res.status(403).json({ error: `Session already closed (Status: ${session.status}). Multiple submissions denied.` });
        }

        // 3. Time Manipulation Failsafe Check
        const startTime = new Date(session.start_time).getTime();
        const now = Date.now();
        const elapsedSecs = Math.floor((now - startTime) / 1000);
        
        // Add a 10 second grace period for network latency
        if (elapsedSecs > (session.duration_allotted_sec + 10)) {
            console.warn(`[TIME MANIPULATION FLAG] User ${user.id} submitted ${elapsedSecs}s after start, but was only allotted ${session.duration_allotted_sec}s.`);
            // Depending on strictness, we could terminate immediately with score 0, 
            // but we will allow calculation and flag it in logs.
        }

        // 4. Fetch the authoritative Correct Answers from the isolated live_questions table
        // (Assuming submittedAnswers is an object: { "question_uuid": "User Answer" })
        const questionIds = Object.keys(submittedAnswers);
        
        if (questionIds.length === 0) {
            return res.status(400).json({ error: 'No answers provided.' });
        }

        const { data: questions, error: questionsError } = await supabase
            .from('live_questions')
            .select('id, correct_answer')
            .in('id', questionIds);

        if (questionsError) throw questionsError;

        // 5. Server-Side Score Calculation
        let correctCount = 0;
        let incorrectCount = 0;

        questions.forEach(q => {
            const userAnswer = submittedAnswers[q.id];
            if (userAnswer === q.correct_answer) {
                correctCount++;
            } else if (userAnswer !== null && userAnswer !== undefined && userAnswer !== '') {
                // If they answered but it's wrong (allows skipping logic)
                incorrectCount++;
            }
        });

        // Example Scoring Logic: +1 for correct, -0.25 for incorrect
        const score = (correctCount * 1.0) - (incorrectCount * 0.25);
        const finalCalculatedScore = Math.max(0, score); // Prevent negative scores

        // 6. Terminate Session & Commit Score
        const { error: updateError } = await supabase
            .from('quiz_sessions')
            .update({
                backend_end_time: new Date().toISOString(),
                raw_submitted_answers: submittedAnswers,
                final_calculated_score: finalCalculatedScore,
                status: 'submitted'
            })
            .eq('id', sessionId);

        if (updateError) throw updateError;

        // 7. Return Evaluated Results securely
        return res.status(200).json({
            success: true,
            score: finalCalculatedScore,
            correctCount,
            incorrectCount,
            totalQuestions: questionIds.length,
            message: 'Session evaluated securely on the backend.'
        });

    } catch (err) {
        if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
            console.error('[QUIZ EVAL ERROR]', err);
            return res.status(500).json({ error: 'Internal Server Error during evaluation' });
        }
    }
};
