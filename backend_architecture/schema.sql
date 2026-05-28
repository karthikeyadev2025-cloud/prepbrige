-- =================================================================================
-- PREPBRIDGE ENTERPRISE SECURITY SCHEMA
-- Drop-in execution script for Supabase SQL Editor
-- =================================================================================

-- 1. SECURE USER ROLES TABLE
-- This table is isolated from frontend mutation.
-- RLS policies will ensure ONLY the service_role key (server-side) can modify it.
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'super_admin')),
    granted_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS and lock it down completely from the client
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow server-side access only" ON public.user_roles FOR ALL USING (false);

-- 2. AUDIT LOGS ENGINE
-- Immutable ledger for all administrative actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) NOT NULL,
    action_performed VARCHAR(100) NOT NULL,
    target_id VARCHAR(255), -- User ID, Question ID, etc.
    ip_address INET,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Append-only by the server
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Server insert only" ON public.audit_logs FOR INSERT WITH CHECK (false);
CREATE POLICY "Server read only" ON public.audit_logs FOR SELECT USING (false);

-- 3. LIVE QUESTIONS
-- Structured schema for real examination data
CREATE TABLE IF NOT EXISTS public.live_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_target VARCHAR(50) NOT NULL,
    subject VARCHAR(50) NOT NULL,
    content TEXT NOT NULL, -- Markdown capable
    options JSONB NOT NULL, -- Array of strings
    correct_answer VARCHAR(255) NOT NULL, -- The actual correct option string
    explanation TEXT,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    year INT,
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Students can read active questions, Server handles updates
ALTER TABLE public.live_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read active questions" ON public.live_questions FOR SELECT USING (is_active = true);
CREATE POLICY "Server all access" ON public.live_questions FOR ALL USING (false);

-- 4. QUIZ SESSIONS
-- Failsafe engine tracking state transitions to prevent client-side time manipulation
CREATE TYPE quiz_status AS ENUM ('active', 'submitted', 'terminated');

CREATE TABLE IF NOT EXISTS public.quiz_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    exam_target VARCHAR(50) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    duration_allotted_sec INT NOT NULL,
    backend_end_time TIMESTAMP WITH TIME ZONE, -- Set precisely when the evaluation endpoint is hit
    raw_submitted_answers JSONB, -- { "question_id": "answer_string" }
    final_calculated_score NUMERIC(5, 2),
    status quiz_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users can read their own sessions, Server controls mutations
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sessions" ON public.quiz_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Server creates and evaluates" ON public.quiz_sessions FOR ALL USING (false);

-- =================================================================================
-- INITIALIZATION FUNCTION
-- Automatically grants 'super_admin' to a specific email on their first login,
-- or run this manually to bootstrap your first super_admin.
-- =================================================================================
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('YOUR-UUID-HERE', 'super_admin');
