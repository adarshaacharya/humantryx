ALTER TABLE "public"."ai_screening_results" ALTER COLUMN "recommendation" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."ai_recommendation";--> statement-breakpoint
CREATE TYPE "public"."ai_recommendation" AS ENUM('shortlist', 'reject');--> statement-breakpoint
ALTER TABLE "public"."ai_screening_results" ALTER COLUMN "recommendation" SET DATA TYPE "public"."ai_recommendation" USING "recommendation"::"public"."ai_recommendation";