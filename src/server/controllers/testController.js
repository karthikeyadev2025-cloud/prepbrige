// =====================================================================
// PREPBRIDGE SERVER-SIDE VALIDATED TEST ENGINE CONTROLLER
// Complete Production-Ready Controller with Zod Verification,
// Bulletproof Time Tampering Lockout, and Automated Grading Engine.
// =====================================================================

const { z } = require('zod');
const { getSupabaseCredentials } = require('../../services/supabaseService');

// ─── 1. STRONGLY TYPED APIS (ZOD SCHEMAS) ──────────────────────────
const startAttemptSchema = z.object({
  testTemplateId: z.string().uuid({ message: "Invalid test template format. Must be a valid UUID." })
});

const saveAnswersSchema = z.object({
  attemptId: z.string().uuid({ message: "Invalid attempt tracking token." }),
  answers: z.record(
    z.string().uuid({ message: "Invalid question reference key." }),
    z.number().int().min(0, { message: "Selected option must be a non-negative integer index." })
  )
});

const submitTestSchema = z.object({
  attemptId: z.string().uuid({ message: "Invalid attempt tracking token." }),
  answers: z.record(
    z.string().uuid({ message: "Invalid question reference key." }),
    z.number().int().min(0, { message: "Selected option must be a non-negative integer index." })
  )
});

// Helper: fetch credentials for PostgreSQL queries via custom REST patterns
async function queryDatabase(endpoint, method, payload = null) {
  let url = process.env.VITE_SUPABASE_URL || '';
  let anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!url || !anonKey) {
    throw new Error('Supabase integration credentials are not configured in environment variables.');
  }

  const cleanUrl = url.trim().replace(/\/$/, '');
  const targetUrl = `${cleanUrl}/rest/v1/${endpoint}`;

  const headers = {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  const response = await fetch(targetUrl, {
    method: method,
    headers: headers,
    body: payload ? JSON.stringify(payload) : null
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Database query failed (HTTP ${response.status}): ${errText}`);
  }

  return response.json();
}

// ─── 2. TEST CONTROLLER ACTION CONTROLS ─────────────────────────────

/**
 * Initiates an active test session for an authenticated student.
 * Creates an expected expiry timestamp based strictly on server time + template duration.
 */
async function startAttempt(req, res) {
  try {
    const { testTemplateId } = startAttemptSchema.parse(req.body);
    const userId = req.profile.uid;

    // A. Verify test template exists and load duration
    const templates = await queryDatabase(`test_templates?id=eq.${testTemplateId}&select=*`, 'GET');
    if (!templates || templates.length === 0) {
      return res.status(404).json({ success: false, error: 'TEMPLATE_NOT_FOUND', message: 'The specified mock test template does not exist.' });
    }
    const template = templates[0];

    // B. Check if user already has an active ongoing attempt for this test (to prevent duplicate concurrent sessions)
    const existing = await queryDatabase(`user_test_attempts?user_id=eq.${userId}&test_template_id=eq.${testTemplateId}&status=eq.ongoing`, 'GET');
    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'ACTIVE_SESSION_EXISTS',
        message: 'You already have an ongoing attempt session active. Please resume or submit it.',
        attemptId: existing[0].id,
        expectedExpiryAt: existing[0].expected_expiry_at
      });
    }

    // C. Calculate strict server-side timestamps
    const now = new Date();
    const durationMs = template.duration_minutes * 60 * 1000;
    const expectedExpiryAt = new Date(now.getTime() + durationMs);

    // D. Create new attempt in database
    const payload = {
      user_id: userId,
      test_template_id: testTemplateId,
      started_at: now.toISOString(),
      expected_expiry_at: expectedExpiryAt.toISOString(),
      answers: {},
      status: 'ongoing'
    };

    const newAttempts = await queryDatabase('user_test_attempts', 'POST', payload);
    const newAttempt = newAttempts[0];

    return res.status(201).json({
      success: true,
      message: 'Test session successfully locked and initialized.',
      attemptId: newAttempt.id,
      startedAt: newAttempt.started_at,
      expectedExpiryAt: newAttempt.expected_expiry_at,
      durationMinutes: template.duration_minutes
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'VALIDATION_FAILED', details: err.errors });
    }
    console.error('[TestController] startAttempt exception:', err);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
}

/**
 * Periodically saves current progress/answers mid-test.
 * Implements strict server-side clock verification to block save inputs after expiry.
 */
async function saveAnswers(req, res) {
  try {
    const { attemptId, answers } = saveAnswersSchema.parse(req.body);
    const userId = req.profile.uid;

    // A. Fetch ongoing test attempt
    const attempts = await queryDatabase(`user_test_attempts?id=eq.${attemptId}&user_id=eq.${userId}`, 'GET');
    if (!attempts || attempts.length === 0) {
      return res.status(404).json({ success: false, error: 'SESSION_NOT_FOUND', message: 'Test attempt session not found.' });
    }
    const attempt = attempts[0];

    if (attempt.status !== 'ongoing') {
      return res.status(400).json({ success: false, error: 'SESSION_NOT_ACTIVE', message: `Answers cannot be updated. This session has been ${attempt.status}.` });
    }

    // B. Strict clock validation: prevent save if server time has crossed expiry
    const now = new Date();
    const expiry = new Date(attempt.expected_expiry_at);
    if (now > expiry) {
      // Auto-remediation: server-side force submission of last saved progress due to expiration
      const processed = await evaluateAndSubmit(attempt, attempt.answers);
      return res.status(400).json({
        success: false,
        error: 'SESSION_EXPIRED',
        message: 'Time expired. The test has been automatically graded and closed.',
        results: processed
      });
    }

    // C. Save current progress
    const updated = await queryDatabase(`user_test_attempts?id=eq.${attemptId}`, 'POST', {
      answers: answers,
      updated_at: now.toISOString()
    });

    return res.json({
      success: true,
      message: 'Progress successfully synced to server.',
      lastSaved: updated[0].updated_at
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'VALIDATION_FAILED', details: err.errors });
    }
    console.error('[TestController] saveAnswers exception:', err);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
}

/**
 * Grades and submits the quiz attempt.
 * Evaluates points by looking up correct answers from database in complete isolation from the client.
 */
async function submitTest(req, res) {
  try {
    const { attemptId, answers } = submitTestSchema.parse(req.body);
    const userId = req.profile.uid;

    // A. Fetch ongoing test attempt
    const attempts = await queryDatabase(`user_test_attempts?id=eq.${attemptId}&user_id=eq.${userId}`, 'GET');
    if (!attempts || attempts.length === 0) {
      return res.status(404).json({ success: false, error: 'SESSION_NOT_FOUND', message: 'Test attempt session not found.' });
    }
    const attempt = attempts[0];

    if (attempt.status !== 'ongoing') {
      return res.status(400).json({ success: false, error: 'ALREADY_SUBMITTED', message: 'This test session has already been closed and evaluated.' });
    }

    // B. Verify time limit (allow a grace-buffer of 15 seconds for network latency during push)
    const now = new Date();
    const expiry = new Date(attempt.expected_expiry_at);
    const graceExpiry = new Date(expiry.getTime() + 15000);

    if (now > graceExpiry) {
      // Discard client payload to block late answers, grade their last saved progress on database
      console.warn(`[Security Intervention] late submit attempt caught for UID: ${userId}. Grading last-saved database state instead.`);
      const processed = await evaluateAndSubmit(attempt, attempt.answers);
      return res.status(400).json({
        success: false,
        error: 'SESSION_EXPIRED',
        message: 'Submit rejected due to expiration. Graded using last saved progress.',
        results: processed
      });
    }

    // C. Evaluate and score submission
    const results = await evaluateAndSubmit(attempt, answers);

    return res.json({
      success: true,
      message: 'Test successfully submitted and graded.',
      results: results
    });

  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: 'VALIDATION_FAILED', details: err.errors });
    }
    console.error('[TestController] submitTest exception:', err);
    return res.status(500).json({ success: false, error: 'SERVER_ERROR', message: err.message });
  }
}

// ─── 3. GRADING EVALUATION HELPER ENGINE ────────────────────────────
async function evaluateAndSubmit(attempt, finalAnswers) {
  const templateId = attempt.test_template_id;
  const now = new Date();

  // A. Fetch questions mapped to this template from the database
  const mappedQuestions = await queryDatabase(`test_template_questions?test_template_id=eq.${templateId}&select=question_id,questions(*)`, 'GET');

  let score = 0.00;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  // B. Loop over actual correct options mapped in PostgreSQL and grade
  mappedQuestions.forEach(map => {
    const q = map.questions;
    if (!q) return;

    const userAns = finalAnswers[q.id];

    if (userAns === undefined || userAns === null) {
      skippedCount++;
    } else if (parseInt(userAns, 10) === parseInt(q.correct_option_id, 10)) {
      correctCount++;
      score += parseFloat(q.marks_weight || 1);
    } else {
      incorrectCount++;
      // Apply negative penalization
      score -= parseFloat(q.negative_marks_weight || 0.25);
    }
  });

  const finalScore = Math.max(0.00, score);

  // C. Commit results to PostgreSQL
  const payload = {
    status: 'submitted',
    submitted_at: now.toISOString(),
    answers: finalAnswers,
    score: finalScore,
    correct_count: correctCount,
    incorrect_count: incorrectCount,
    skipped_count: skippedCount,
    updated_at: now.toISOString()
  };

  const updatedAttempts = await queryDatabase(`user_test_attempts?id=eq.${attempt.id}`, 'POST', payload);
  const updated = updatedAttempts[0];

  // D. Reward daily study streaks / experience points asynchronously
  try {
    const earnedPoints = correctCount * 10;
    if (earnedPoints > 0) {
      // Async profile points sync via Syncer
      const profileUrl = `profiles?id=eq.${attempt.user_id}`;
      const profiles = await queryDatabase(profileUrl, 'GET');
      if (profiles && profiles.length > 0) {
        const p = profiles[0];
        await queryDatabase(profileUrl, 'POST', {
          points: (p.points || 0) + earnedPoints,
          streak: (p.streak || 0) + 1,
          last_active: now.toISOString()
        });
      }
    }
  } catch (syncErr) {
    console.warn('[TestController] Failed to credit reward points to user profile:', syncErr.message);
  }

  return {
    attemptId: attempt.id,
    status: 'submitted',
    score: finalScore,
    correctCount,
    incorrectCount,
    skippedCount,
    submittedAt: now.toISOString()
  };
}

module.exports = {
  startAttempt,
  saveAnswers,
  submitTest
};
