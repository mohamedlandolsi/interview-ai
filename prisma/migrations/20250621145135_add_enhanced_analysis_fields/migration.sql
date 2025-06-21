-- AlterTable
ALTER TABLE "interview_sessions" ADD COLUMN     "category_scores" JSONB,
ADD COLUMN     "hiring_recommendation" TEXT,
ADD COLUMN     "interview_metrics" JSONB,
ADD COLUMN     "key_insights" TEXT[];
