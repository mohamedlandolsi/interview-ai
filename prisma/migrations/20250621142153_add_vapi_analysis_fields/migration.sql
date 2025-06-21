-- AlterTable
ALTER TABLE "interview_sessions" ADD COLUMN     "analysis_feedback" TEXT,
ADD COLUMN     "analysis_score" DOUBLE PRECISION,
ADD COLUMN     "areas_for_improvement" TEXT[],
ADD COLUMN     "question_scores" JSONB,
ADD COLUMN     "strengths" TEXT[],
ADD COLUMN     "vapi_structured_data" JSONB,
ADD COLUMN     "vapi_success_evaluation" JSONB,
ADD COLUMN     "vapi_summary" JSONB;
