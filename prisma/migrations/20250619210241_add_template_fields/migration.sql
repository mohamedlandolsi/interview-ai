-- AlterTable
ALTER TABLE "interview_templates" ADD COLUMN     "category" TEXT,
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "is_built_in" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_used" TIMESTAMP(3),
ADD COLUMN     "name" TEXT,
ADD COLUMN     "rawQuestions" JSONB,
ADD COLUMN     "tags" TEXT[],
ADD COLUMN     "usage_count" INTEGER NOT NULL DEFAULT 0;
