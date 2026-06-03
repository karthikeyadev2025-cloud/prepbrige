import { requireAuth } from '../../_middleware/auth.js'
import { getSupabaseAdmin } from '../../_lib/env.js'

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const user = await requireAuth(req, res)
    const { testTemplateId, answers, timeTakenSeconds } = req.body

    if (!testTemplateId || !answers) {
      return res.status(400).json({ error: 'Missing testTemplateId or answers' })
    }

    const supabase = getSupabaseAdmin()

    // Fetch correct answers from DB (server-side authority)
    const { data: mappings, error: mappingError } = await supabase
      .from('question_exam_mapping')
      .select('question_id, questions(id, correct_option_id, options)')
      .eq('test_template_id', testTemplateId)

    if (mappingError) throw mappingError

    let correct = 0, wrong = 0, unattempted = 0
    const total = mappings?.length || 0

    mappings?.forEach(m => {
      const q = m.questions
      if (!q) return
      const userAnswer = answers[q.id]
      if (userAnswer === null || userAnswer === undefined) {
        unattempted++
      } else if (Number(userAnswer) === Number(q.correct_option_id)) {
        correct++
      } else {
        wrong++
      }
    })

    const score = Math.max(0, correct - wrong * 0.25)

    // Save attempt
    const { error: saveError } = await supabase.from('test_attempts').insert({
      user_id: user.id,
      test_template_id: testTemplateId,
      answers,
      score,
      total_questions: total,
      correct_answers: correct,
      wrong_answers: wrong,
      unattempted,
      time_taken_seconds: timeTakenSeconds || 0,
    })

    if (saveError) throw saveError

    return res.status(200).json({ success: true, score, correct, wrong, unattempted, total })
  } catch (err) {
    if (err.message !== 'Unauthorized' && err.message !== 'Forbidden') {
      console.error('[Quiz Eval Error]', err)
      return res.status(500).json({ error: 'Internal Server Error' })
    }
  }
}
