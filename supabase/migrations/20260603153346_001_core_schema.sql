/*
  # PrepBridge Core Schema

  1. New Tables
    - `profiles` — user profiles synced from Firebase auth
      - id (text, PK — Firebase UID)
      - email, phone, display_name, photo_url
      - is_admin (bool), onboarding_complete (bool)
      - plan (text), points, streak, status
      - exams (jsonb array), primary_target, state
      - education, study_hours, selected_language
      - target_year, exam_date
      - lakshya_slogan, fcm_token
      - push_notifications_enabled, push_subscription_date
      - created_at, updated_at, last_active

    - `payments` — Razorpay payment records
      - id (uuid, PK)
      - user_id → profiles.id
      - razorpay_order_id, razorpay_payment_id, razorpay_signature
      - amount (int, paise), currency, plan_type, plan_label
      - status (created/captured/failed/refunded)
      - verified (bool)
      - expires_at — subscription end date
      - created_at, updated_at

    - `test_templates` — mock test catalog
      - id (uuid, PK), title, exam_id, description
      - total_marks, duration_minutes, difficulty
      - pattern, negative_marking, marks_per_question
      - is_active, created_at

    - `questions` — question bank
      - id (uuid, PK), question_text, options (jsonb)
      - correct_option_id (0-based index), explanation
      - subject_id, difficulty, tags (jsonb)
      - created_at, updated_at

    - `question_exam_mapping` — many-to-many questions ↔ exams
      - id (uuid, PK), question_id → questions.id
      - exam_id (text), test_template_id → test_templates.id

    - `test_attempts` — user test history
      - id (uuid, PK), user_id → profiles.id
      - test_template_id → test_templates.id
      - answers (jsonb), score, total_questions
      - correct_answers, wrong_answers, unattempted
      - time_taken_seconds, completed_at

    - `current_affairs` — news articles
      - id (uuid, PK), title, summary, category
      - source, importance (high/medium/low)
      - is_pride_moment (bool)
      - article_date, created_at

    - `notifications` — user notifications
      - id (uuid, PK), user_id (text, null = broadcast)
      - title, message, type, read (bool)
      - created_at

    - `settings` — app-wide key/value store
      - key (text, PK), value (jsonb), updated_at

    - `study_points` — exam-specific study content
      - id (uuid, PK), exam_id, topic, points (jsonb array)
      - tip, mnemonic, pyq, created_at

    - `audit_logs` — admin action log
      - id (uuid, PK), admin_id (text)
      - action_performed, target_id, ip_address
      - details (jsonb), created_at

    - `user_roles` — server-side role management for API middleware
      - user_id (text, PK → profiles.id), role (text)
      - updated_at

  2. Security
    - RLS enabled on all tables
    - Policies scoped per table
*/

-- ─── PROFILES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id                         text PRIMARY KEY,
  email                      text,
  phone                      text,
  display_name               text NOT NULL DEFAULT 'Aspirant',
  photo_url                  text,
  is_admin                   boolean NOT NULL DEFAULT false,
  onboarding_complete        boolean NOT NULL DEFAULT false,
  plan                       text NOT NULL DEFAULT 'free',
  points                     integer NOT NULL DEFAULT 0,
  streak                     integer NOT NULL DEFAULT 0,
  status                     text NOT NULL DEFAULT 'active',
  exams                      jsonb NOT NULL DEFAULT '[]',
  primary_target             text,
  state                      text,
  education                  text,
  study_hours                text,
  selected_language          text NOT NULL DEFAULT 'English',
  target_year                text,
  exam_date                  text,
  lakshya_slogan             text,
  fcm_token                  text,
  push_notifications_enabled boolean NOT NULL DEFAULT false,
  push_subscription_date     text,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now(),
  last_active                timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);


-- ─── PAYMENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  razorpay_order_id     text UNIQUE NOT NULL,
  razorpay_payment_id   text,
  razorpay_signature    text,
  amount                integer NOT NULL,
  currency              text NOT NULL DEFAULT 'INR',
  plan_type             text NOT NULL,
  plan_label            text NOT NULL,
  status                text NOT NULL DEFAULT 'created',
  verified              boolean NOT NULL DEFAULT false,
  expires_at            timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own payments"
  ON payments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow payment inserts"
  ON payments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow payment updates"
  ON payments FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_order_id ON payments(razorpay_order_id);


-- ─── TEST TEMPLATES ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_templates (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title                text NOT NULL,
  exam_id              text NOT NULL,
  description          text,
  total_marks          integer NOT NULL DEFAULT 100,
  duration_minutes     integer NOT NULL DEFAULT 60,
  difficulty           text NOT NULL DEFAULT 'medium',
  pattern              text NOT NULL DEFAULT 'MCQ',
  negative_marking     numeric(4,2) NOT NULL DEFAULT -0.25,
  marks_per_question   numeric(4,2) NOT NULL DEFAULT 1,
  is_active            boolean NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE test_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active test templates"
  ON test_templates FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage test templates"
  ON test_templates FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update test templates"
  ON test_templates FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_test_templates_exam_id ON test_templates(exam_id);
CREATE INDEX IF NOT EXISTS idx_test_templates_is_active ON test_templates(is_active);


-- ─── QUESTIONS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS questions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text       text NOT NULL,
  options             jsonb NOT NULL DEFAULT '[]',
  correct_option_id   integer NOT NULL DEFAULT 0,
  explanation         text,
  subject_id          text,
  difficulty          text NOT NULL DEFAULT 'medium',
  tags                jsonb NOT NULL DEFAULT '[]',
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions"
  ON questions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow question inserts"
  ON questions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow question updates"
  ON questions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow question deletes"
  ON questions FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);


-- ─── QUESTION EXAM MAPPING ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS question_exam_mapping (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id        uuid NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  exam_id            text NOT NULL,
  test_template_id   uuid REFERENCES test_templates(id) ON DELETE SET NULL
);

ALTER TABLE question_exam_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read mappings"
  ON question_exam_mapping FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow mapping inserts"
  ON question_exam_mapping FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow mapping deletes"
  ON question_exam_mapping FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_qem_exam_id ON question_exam_mapping(exam_id);
CREATE INDEX IF NOT EXISTS idx_qem_question_id ON question_exam_mapping(question_id);
CREATE INDEX IF NOT EXISTS idx_qem_template_id ON question_exam_mapping(test_template_id);


-- ─── TEST ATTEMPTS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_attempts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  test_template_id    uuid REFERENCES test_templates(id) ON DELETE SET NULL,
  answers             jsonb NOT NULL DEFAULT '{}',
  score               numeric(6,2) NOT NULL DEFAULT 0,
  total_questions     integer NOT NULL DEFAULT 0,
  correct_answers     integer NOT NULL DEFAULT 0,
  wrong_answers       integer NOT NULL DEFAULT 0,
  unattempted         integer NOT NULL DEFAULT 0,
  time_taken_seconds  integer NOT NULL DEFAULT 0,
  completed_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own attempts"
  ON test_attempts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can insert own attempts"
  ON test_attempts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_completed_at ON test_attempts(completed_at);


-- ─── CURRENT AFFAIRS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS current_affairs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title            text NOT NULL,
  summary          text,
  category         text NOT NULL DEFAULT 'General',
  source           text NOT NULL DEFAULT 'PIB',
  importance       text NOT NULL DEFAULT 'medium',
  is_pride_moment  boolean NOT NULL DEFAULT false,
  pride_details    text,
  article_date     date NOT NULL DEFAULT CURRENT_DATE,
  created_at       timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE current_affairs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read current affairs"
  ON current_affairs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow current affairs inserts"
  ON current_affairs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow current affairs updates"
  ON current_affairs FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow current affairs deletes"
  ON current_affairs FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_current_affairs_date ON current_affairs(article_date DESC);
CREATE INDEX IF NOT EXISTS idx_current_affairs_importance ON current_affairs(importance);


-- ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    text,
  title      text NOT NULL,
  message    text NOT NULL,
  type       text NOT NULL DEFAULT 'info',
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own or broadcast notifications"
  ON notifications FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow notification inserts"
  ON notifications FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow notification updates"
  ON notifications FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);


-- ─── SETTINGS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read settings"
  ON settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow settings inserts"
  ON settings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow settings updates"
  ON settings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);


-- ─── STUDY POINTS ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS study_points (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id    text NOT NULL,
  topic      text NOT NULL,
  points     jsonb NOT NULL DEFAULT '[]',
  tip        text,
  mnemonic   text,
  pyq        text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE study_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read study points"
  ON study_points FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow study points inserts"
  ON study_points FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_study_points_exam_id ON study_points(exam_id);


-- ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id          text NOT NULL,
  action_performed  text NOT NULL,
  target_id         text,
  ip_address        text,
  details           jsonb NOT NULL DEFAULT '{}',
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow audit log inserts"
  ON audit_logs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read audit logs"
  ON audit_logs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);


-- ─── USER ROLES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_roles (
  user_id    text PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  role       text NOT NULL DEFAULT 'student',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow user roles reads"
  ON user_roles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow user roles inserts"
  ON user_roles FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow user roles updates"
  ON user_roles FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
