-- Complete AI Job Interviewer Database Schema
-- This file contains the comprehensive database setup for the AI Job Interviewer application

-- Create custom types
DO $$ BEGIN
    CREATE TYPE interview_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE question_type AS ENUM ('text', 'multiple_choice', 'rating', 'boolean', 'open_ended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE template_category AS ENUM ('technical', 'behavioral', 'general', 'custom');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE call_status AS ENUM ('initiated', 'ringing', 'answered', 'ended', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'hr_manager', 'interviewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    role user_role DEFAULT 'interviewer',
    job_title TEXT,
    phone TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview templates table
CREATE TABLE IF NOT EXISTS interview_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category template_category DEFAULT 'custom',
    is_public BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    estimated_duration INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_id UUID REFERENCES interview_templates(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    question_type question_type DEFAULT 'open_ended',
    options JSONB,
    required BOOLEAN DEFAULT TRUE,
    order_index INTEGER NOT NULL,
    scoring_criteria TEXT,
    max_score INTEGER DEFAULT 10,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    resume_url TEXT,
    linkedin_url TEXT,
    notes TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, email)
);

-- Interviews table
CREATE TABLE IF NOT EXISTS interviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    candidate_id UUID REFERENCES candidates(id) ON DELETE CASCADE NOT NULL,
    template_id UUID REFERENCES interview_templates(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    status interview_status DEFAULT 'scheduled',
    vapi_call_id TEXT,
    vapi_assistant_id TEXT,
    interview_config JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview calls table
CREATE TABLE IF NOT EXISTS interview_calls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE NOT NULL,
    vapi_call_id TEXT UNIQUE NOT NULL,
    call_status call_status DEFAULT 'initiated',
    phone_number TEXT,
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    duration INTEGER,
    cost DECIMAL(10,4),
    transcript JSONB,
    recording_url TEXT,
    call_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview responses table
CREATE TABLE IF NOT EXISTS interview_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    answer_text TEXT,
    answer_metadata JSONB,
    score INTEGER,
    feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Interview analysis table
CREATE TABLE IF NOT EXISTS interview_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE NOT NULL,
    overall_score DECIMAL(5,2),
    strengths TEXT[],
    weaknesses TEXT[],
    recommendations TEXT[],
    technical_score DECIMAL(5,2),
    communication_score DECIMAL(5,2),
    cultural_fit_score DECIMAL(5,2),
    sentiment_analysis JSONB,
    ai_summary TEXT,
    analysis_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    key_prefix TEXT NOT NULL,
    permissions TEXT[],
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Webhooks table
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    events TEXT[] NOT NULL,
    secret TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_success_at TIMESTAMPTZ,
    last_failure_at TIMESTAMPTZ,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE interview_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin policies for profiles
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can delete all profiles" ON profiles FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can view own templates" ON interview_templates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public templates" ON interview_templates FOR SELECT USING (is_public = true);
CREATE POLICY "Users can insert own templates" ON interview_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own templates" ON interview_templates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own templates" ON interview_templates FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view questions from accessible templates" ON questions FOR SELECT USING (
    template_id IN (SELECT id FROM interview_templates WHERE user_id = auth.uid() OR is_public = true)
);
CREATE POLICY "Users can insert questions to own templates" ON questions FOR INSERT WITH CHECK (
    template_id IN (SELECT id FROM interview_templates WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update questions in own templates" ON questions FOR UPDATE USING (
    template_id IN (SELECT id FROM interview_templates WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete questions from own templates" ON questions FOR DELETE USING (
    template_id IN (SELECT id FROM interview_templates WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own candidates" ON candidates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own candidates" ON candidates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own candidates" ON candidates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own candidates" ON candidates FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own interviews" ON interviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own interviews" ON interviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own interviews" ON interviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own interviews" ON interviews FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view calls for own interviews" ON interview_calls FOR SELECT USING (
    interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert calls for own interviews" ON interview_calls FOR INSERT WITH CHECK (
    interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update calls for own interviews" ON interview_calls FOR UPDATE USING (
    interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view responses for own interviews" ON interview_responses FOR SELECT USING (
    interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert responses for own interviews" ON interview_responses FOR INSERT WITH CHECK (
    interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update responses for own interviews" ON interview_responses FOR UPDATE USING (
    interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view analysis for own interviews" ON interview_analysis FOR SELECT USING (
    interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert analysis for own interviews" ON interview_analysis FOR INSERT WITH CHECK (
    interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update analysis for own interviews" ON interview_analysis FOR UPDATE USING (
    interview_id IN (SELECT id FROM interviews WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own API keys" ON api_keys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own API keys" ON api_keys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own API keys" ON api_keys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own API keys" ON api_keys FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own webhooks" ON webhooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own webhooks" ON webhooks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own webhooks" ON webhooks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own webhooks" ON webhooks FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for optimal performance
-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON profiles(company_name);

-- Interview templates indexes
CREATE INDEX IF NOT EXISTS idx_interview_templates_user_id ON interview_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_templates_category ON interview_templates(category);
CREATE INDEX IF NOT EXISTS idx_interview_templates_is_public ON interview_templates(is_public);

-- Questions indexes
CREATE INDEX IF NOT EXISTS idx_questions_template_id ON questions(template_id);
CREATE INDEX IF NOT EXISTS idx_questions_order_index ON questions(template_id, order_index);

-- Candidates indexes
CREATE INDEX IF NOT EXISTS idx_candidates_user_id ON candidates(user_id);
CREATE INDEX IF NOT EXISTS idx_candidates_email ON candidates(user_id, email);

-- Interviews indexes
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate_id ON interviews(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interviews_template_id ON interviews(template_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON interviews(status);
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled_at ON interviews(scheduled_at);

-- Interview calls indexes
CREATE INDEX IF NOT EXISTS idx_interview_calls_interview_id ON interview_calls(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_calls_status ON interview_calls(status);

-- Interview responses indexes
CREATE INDEX IF NOT EXISTS idx_interview_responses_interview_id ON interview_responses(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_responses_question_id ON interview_responses(question_id);

-- Interview analysis indexes
CREATE INDEX IF NOT EXISTS idx_interview_analysis_interview_id ON interview_analysis(interview_id);
CREATE INDEX IF NOT EXISTS idx_interview_analysis_overall_score ON interview_analysis(overall_score);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- API keys indexes
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(user_id, is_active);

-- Webhooks indexes
CREATE INDEX IF NOT EXISTS idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_is_active ON webhooks(user_id, is_active);
