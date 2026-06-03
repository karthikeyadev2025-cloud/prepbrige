/*
  # Add missing columns to quiz_attempts
  
  QuizEngine.tsx and saveQuizAttempt() send correct_answers, wrong_answers, skipped_answers
  but these columns are missing from the table.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quiz_attempts' AND column_name='correct_answers') THEN
    ALTER TABLE quiz_attempts ADD COLUMN correct_answers integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quiz_attempts' AND column_name='wrong_answers') THEN
    ALTER TABLE quiz_attempts ADD COLUMN wrong_answers integer NOT NULL DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='quiz_attempts' AND column_name='skipped_answers') THEN
    ALTER TABLE quiz_attempts ADD COLUMN skipped_answers integer NOT NULL DEFAULT 0;
  END IF;
END $$;
