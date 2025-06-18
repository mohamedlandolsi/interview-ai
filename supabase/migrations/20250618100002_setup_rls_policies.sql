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

-- RLS Policies

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Interview templates policies
CREATE POLICY "Users can view own templates" ON interview_templates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public templates" ON interview_templates
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own templates" ON interview_templates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON interview_templates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON interview_templates
    FOR DELETE USING (auth.uid() = user_id);

-- Questions policies
CREATE POLICY "Users can view questions from accessible templates" ON questions
    FOR SELECT USING (
        template_id IN (
            SELECT id FROM interview_templates 
            WHERE user_id = auth.uid() OR is_public = true
        )
    );

CREATE POLICY "Users can insert questions to own templates" ON questions
    FOR INSERT WITH CHECK (
        template_id IN (
            SELECT id FROM interview_templates WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update questions in own templates" ON questions
    FOR UPDATE USING (
        template_id IN (
            SELECT id FROM interview_templates WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete questions from own templates" ON questions
    FOR DELETE USING (
        template_id IN (
            SELECT id FROM interview_templates WHERE user_id = auth.uid()
        )
    );

-- Candidates policies
CREATE POLICY "Users can view own candidates" ON candidates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own candidates" ON candidates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own candidates" ON candidates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own candidates" ON candidates
    FOR DELETE USING (auth.uid() = user_id);

-- Interviews policies
CREATE POLICY "Users can view own interviews" ON interviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interviews" ON interviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interviews" ON interviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interviews" ON interviews
    FOR DELETE USING (auth.uid() = user_id);

-- Interview calls policies
CREATE POLICY "Users can view calls for own interviews" ON interview_calls
    FOR SELECT USING (
        interview_id IN (
            SELECT id FROM interviews WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert calls for own interviews" ON interview_calls
    FOR INSERT WITH CHECK (
        interview_id IN (
            SELECT id FROM interviews WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update calls for own interviews" ON interview_calls
    FOR UPDATE USING (
        interview_id IN (
            SELECT id FROM interviews WHERE user_id = auth.uid()
        )
    );

-- Interview responses policies
CREATE POLICY "Users can view responses for own interviews" ON interview_responses
    FOR SELECT USING (
        interview_id IN (
            SELECT id FROM interviews WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert responses for own interviews" ON interview_responses
    FOR INSERT WITH CHECK (
        interview_id IN (
            SELECT id FROM interviews WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update responses for own interviews" ON interview_responses
    FOR UPDATE USING (
        interview_id IN (
            SELECT id FROM interviews WHERE user_id = auth.uid()
        )
    );

-- Interview analysis policies
CREATE POLICY "Users can view analysis for own interviews" ON interview_analysis
    FOR SELECT USING (
        interview_id IN (
            SELECT id FROM interviews WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert analysis for own interviews" ON interview_analysis
    FOR INSERT WITH CHECK (
        interview_id IN (
            SELECT id FROM interviews WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update analysis for own interviews" ON interview_analysis
    FOR UPDATE USING (
        interview_id IN (
            SELECT id FROM interviews WHERE user_id = auth.uid()
        )
    );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notifications" ON notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON notifications
    FOR DELETE USING (auth.uid() = user_id);

-- API keys policies
CREATE POLICY "Users can view own API keys" ON api_keys
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own API keys" ON api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own API keys" ON api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own API keys" ON api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- Webhooks policies
CREATE POLICY "Users can view own webhooks" ON webhooks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own webhooks" ON webhooks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own webhooks" ON webhooks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own webhooks" ON webhooks
    FOR DELETE USING (auth.uid() = user_id);
