-- Functions and triggers

-- Function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER interview_templates_updated_at
    BEFORE UPDATE ON interview_templates
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER interviews_updated_at
    BEFORE UPDATE ON interviews
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER interview_calls_updated_at
    BEFORE UPDATE ON interview_calls
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER interview_analysis_updated_at
    BEFORE UPDATE ON interview_analysis
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER webhooks_updated_at
    BEFORE UPDATE ON webhooks
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, full_name, company_name, role)
    VALUES (
        NEW.id, 
        NEW.email, 
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'company_name',
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'interviewer'::user_role)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to get interview statistics
CREATE OR REPLACE FUNCTION get_interview_stats(user_uuid UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    WITH interview_counts AS (
        SELECT 
            COUNT(*) as total_interviews,
            COUNT(*) FILTER (WHERE status = 'completed') as completed_interviews,
            COUNT(*) FILTER (WHERE status = 'scheduled') as scheduled_interviews,
            COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_interviews,
            COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_interviews
        FROM interviews
        WHERE user_id = user_uuid
    ),
    avg_scores AS (
        SELECT 
            AVG(overall_score) as avg_overall_score,
            AVG(technical_score) as avg_technical_score,
            AVG(communication_score) as avg_communication_score
        FROM interview_analysis ia
        JOIN interviews i ON ia.interview_id = i.id
        WHERE i.user_id = user_uuid
    )
    SELECT json_build_object(
        'total_interviews', ic.total_interviews,
        'completed_interviews', ic.completed_interviews,
        'scheduled_interviews', ic.scheduled_interviews,
        'in_progress_interviews', ic.in_progress_interviews,
        'cancelled_interviews', ic.cancelled_interviews,
        'avg_overall_score', COALESCE(av.avg_overall_score, 0),
        'avg_technical_score', COALESCE(av.avg_technical_score, 0),
        'avg_communication_score', COALESCE(av.avg_communication_score, 0)
    ) INTO stats
    FROM interview_counts ic, avg_scores av;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND read = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
