-- =====================================================================
-- PREPBRIDGE ENTERPRISE DATABASE SCHEMA (POSTGRESQL MIGRATION)
-- Designed for High Scalability, Role-Based Access Control, LaTeX/Markdown
-- Questions, and Server-Side Time-Tracked Attempt Captures.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. USER PROFILES TABLE WITH ROLE-BASED ACCESS CONTROL ──────────
CREATE TYPE user_role AS ENUM ('student', 'admin', 'super-admin');
CREATE TYPE subscription_tier AS ENUM ('free', 'trial', 'paid');

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(30) UNIQUE,
    display_name VARCHAR(150) NOT NULL DEFAULT 'Anonymous User',
    photo_url TEXT,
    state VARCHAR(100) DEFAULT 'N/A',
    education VARCHAR(150) DEFAULT 'N/A',
    study_hours VARCHAR(50) DEFAULT '3-4 hours',
    role user_role NOT NULL DEFAULT 'student',
    subscription_plan subscription_tier NOT NULL DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    points INT NOT NULL DEFAULT 0,
    streak INT NOT NULL DEFAULT 0,
    fcm_token TEXT,
    push_notifications_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for authentication lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);

-- ─── 2. EXAMS AND SUBJECT TABLES ──────────
CREATE TABLE IF NOT EXISTS public.exams (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(150) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.subjects (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Joint table for exam syllabus mapping
CREATE TABLE IF NOT EXISTS public.exam_syllabus_mapping (
    exam_id VARCHAR(100) REFERENCES public.exams(id) ON DELETE CASCADE,
    subject_id VARCHAR(100) REFERENCES public.subjects(id) ON DELETE CASCADE,
    weightage_pct INT DEFAULT 0,
    PRIMARY KEY (exam_id, subject_id)
);

-- ─── 3. COMPLEX MARKDOWN & LATEX QUESTIONS TABLE ──────────
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id VARCHAR(100) REFERENCES public.subjects(id) ON DELETE SET NULL,
    question_text TEXT NOT NULL, -- Rich Markdown & LaTeX compatible (e.g. $$\int x dx$$)
    question_image_url TEXT,     -- For multimodal uploads or diagrams
    options JSONB NOT NULL,       -- Array of objects: [{"id": 0, "text": "Opt A"}, {"id": 1, "text": "Opt B"}]
    correct_option_id INT NOT NULL,
    explanation TEXT,            -- Step-by-step guidance including memory shortcuts
    difficulty difficulty_level NOT NULL DEFAULT 'medium',
    exam_year INT,               -- To keep track of PYQ relevance (e.g. UPSC 2024)
    marks_weight INT NOT NULL DEFAULT 1,
    negative_marks_weight NUMERIC(3,2) NOT NULL DEFAULT 0.25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for rapid target-specific question pools
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);

-- Many-to-many question-exam mapping (questions can belong to multiple exams)
CREATE TABLE IF NOT EXISTS public.question_exam_mapping (
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    exam_id VARCHAR(100) REFERENCES public.exams(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, exam_id)
);

-- ─── 4. TEST TEMPLATES (MOCK TESTS) TABLE ──────────
CREATE TABLE IF NOT EXISTS public.test_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    exam_id VARCHAR(100) REFERENCES public.exams(id) ON DELETE CASCADE,
    duration_minutes INT NOT NULL DEFAULT 60,
    total_marks INT NOT NULL DEFAULT 100,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Junction table for test questions
CREATE TABLE IF NOT EXISTS public.test_template_questions (
    test_template_id UUID REFERENCES public.test_templates(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY (test_template_id, question_id)
);

-- ─── 5. TIMED USER TEST ATTEMPTS TABLE (SERVER-SIDE TIME TRACKING) ──────────
CREATE TYPE attempt_status AS ENUM ('ongoing', 'submitted', 'abandoned');

CREATE TABLE IF NOT EXISTS public.user_test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    test_template_id UUID REFERENCES public.test_templates(id) ON DELETE CASCADE NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expected_expiry_at TIMESTAMPTZ NOT NULL, -- Sever-side defined limit: started_at + duration
    submitted_at TIMESTAMPTZ,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb, -- Key-value pairs: {"question_uuid": selected_option_id}
    status attempt_status NOT NULL DEFAULT 'ongoing',
    score NUMERIC(5,2) DEFAULT 0.00,
    correct_count INT DEFAULT 0,
    incorrect_count INT DEFAULT 0,
    skipped_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_attempts_user ON public.user_test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON public.user_test_attempts(status);

-- ─── 6. PAYMENTS AND AUDITING TABLE ──────────
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    razorpay_order_id VARCHAR(100) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(100) UNIQUE,
    amount_paise INT NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    status VARCHAR(50) NOT NULL, -- 'created', 'authorized', 'captured', 'failed'
    plan_tier subscription_tier NOT NULL DEFAULT 'paid',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user ON public.payments(user_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 1. Profiles Policies
CREATE POLICY user_read_own_profile ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY user_update_own_profile ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY admin_all_profiles ON public.profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
        )
    );

-- 2. Test Attempt Policies
CREATE POLICY user_read_own_attempts ON public.user_test_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY user_insert_own_attempts ON public.user_test_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY user_update_own_ongoing_attempts ON public.user_test_attempts
    FOR UPDATE USING (auth.uid() = user_id AND status = 'ongoing');

CREATE POLICY admin_all_attempts ON public.user_test_attempts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
        )
    );

-- 3. Payments Policies
CREATE POLICY user_read_own_payments ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY admin_all_payments ON public.payments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('admin', 'super-admin')
        )
    );
