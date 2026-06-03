/*
  # Align paper_questions and user_progress schemas with frontend expectations

  1. paper_questions — add option_a/b/c/d columns, correct_option, negative_marks, question_order
     from options JSONB so QuizEngine.tsx can read typed columns directly
  2. user_progress — add total_score, total_marks, attempts_count columns
     (frontend upsertUserProgress writes these)
  3. boards — add display_order, state_code alias columns so fetchBoards() works
  4. exams — add display_order alias
  5. courses — add display_order
  6. subjects — add display_order
  7. question_papers — add language, thumbnail_url, tags, file_url columns
*/

-- ── paper_questions ───────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paper_questions' AND column_name='option_a') THEN
    ALTER TABLE paper_questions ADD COLUMN option_a text NOT NULL DEFAULT '';
    ALTER TABLE paper_questions ADD COLUMN option_b text NOT NULL DEFAULT '';
    ALTER TABLE paper_questions ADD COLUMN option_c text NOT NULL DEFAULT '';
    ALTER TABLE paper_questions ADD COLUMN option_d text NOT NULL DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paper_questions' AND column_name='correct_option') THEN
    ALTER TABLE paper_questions ADD COLUMN correct_option text NOT NULL DEFAULT 'A' CHECK (correct_option IN ('A','B','C','D'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paper_questions' AND column_name='negative_marks') THEN
    ALTER TABLE paper_questions ADD COLUMN negative_marks numeric NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paper_questions' AND column_name='question_order') THEN
    ALTER TABLE paper_questions ADD COLUMN question_order integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='paper_questions' AND column_name='subject_tag') THEN
    ALTER TABLE paper_questions ADD COLUMN subject_tag text;
  END IF;
END $$;

-- Back-fill option columns from existing options JSONB if present
UPDATE paper_questions
SET
  option_a = COALESCE(options->0->>'text', options->>0, ''),
  option_b = COALESCE(options->1->>'text', options->>1, ''),
  option_c = COALESCE(options->2->>'text', options->>2, ''),
  option_d = COALESCE(options->3->>'text', options->>3, ''),
  correct_option = CASE
    WHEN correct_answer = 'A' OR correct_answer = '0' THEN 'A'
    WHEN correct_answer = 'B' OR correct_answer = '1' THEN 'B'
    WHEN correct_answer = 'C' OR correct_answer = '2' THEN 'C'
    WHEN correct_answer = 'D' OR correct_answer = '3' THEN 'D'
    ELSE 'A'
  END,
  question_order = COALESCE(sort_order, 0)
WHERE option_a = '';

-- ── user_progress ─────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_progress' AND column_name='total_score') THEN
    ALTER TABLE user_progress ADD COLUMN total_score numeric NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_progress' AND column_name='total_marks') THEN
    ALTER TABLE user_progress ADD COLUMN total_marks numeric NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_progress' AND column_name='attempts_count') THEN
    ALTER TABLE user_progress ADD COLUMN attempts_count integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_progress' AND column_name='last_attempted_at') THEN
    ALTER TABLE user_progress ADD COLUMN last_attempted_at timestamptz DEFAULT now();
  END IF;
END $$;

-- ── boards ────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='boards' AND column_name='display_order') THEN
    ALTER TABLE boards ADD COLUMN display_order integer NOT NULL DEFAULT 0;
    UPDATE boards SET display_order = sort_order WHERE sort_order IS NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='boards' AND column_name='state_code') THEN
    ALTER TABLE boards ADD COLUMN state_code text;
  END IF;
END $$;

-- ── exams ─────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='display_order') THEN
    ALTER TABLE exams ADD COLUMN display_order integer NOT NULL DEFAULT 0;
    UPDATE exams SET display_order = sort_order WHERE sort_order IS NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exams' AND column_name='exam_type') THEN
    ALTER TABLE exams ADD COLUMN exam_type text;
  END IF;
END $$;

-- ── courses ───────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='courses' AND column_name='display_order') THEN
    ALTER TABLE courses ADD COLUMN display_order integer NOT NULL DEFAULT 0;
    UPDATE courses SET display_order = sort_order WHERE sort_order IS NOT NULL;
  END IF;
END $$;

-- ── subjects ──────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='subjects' AND column_name='display_order') THEN
    ALTER TABLE subjects ADD COLUMN display_order integer NOT NULL DEFAULT 0;
    UPDATE subjects SET display_order = sort_order WHERE sort_order IS NOT NULL;
  END IF;
END $$;

-- ── question_papers ───────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='question_papers' AND column_name='language') THEN
    ALTER TABLE question_papers ADD COLUMN language text NOT NULL DEFAULT 'English';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='question_papers' AND column_name='thumbnail_url') THEN
    ALTER TABLE question_papers ADD COLUMN thumbnail_url text;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='question_papers' AND column_name='tags') THEN
    ALTER TABLE question_papers ADD COLUMN tags jsonb DEFAULT '[]';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='question_papers' AND column_name='description') THEN
    ALTER TABLE question_papers ADD COLUMN description text;
  END IF;
END $$;
