-- AlterTable
ALTER TABLE "interview_sessions" ADD COLUMN     "conversation_summary" TEXT,
ADD COLUMN     "final_transcript" TEXT,
ADD COLUMN     "real_time_messages" JSONB[],
ADD COLUMN     "recording_url" TEXT,
ADD COLUMN     "stereo_recording_url" TEXT,
ADD COLUMN     "vapi_assistant_id" TEXT,
ADD COLUMN     "vapi_call_id" TEXT,
ADD COLUMN     "vapi_cost" DOUBLE PRECISION,
ADD COLUMN     "vapi_cost_breakdown" JSONB;
