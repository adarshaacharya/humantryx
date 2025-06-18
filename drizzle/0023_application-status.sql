-- Step 1: Convert column to text to allow any value
ALTER TABLE "public"."ai_screening_results" ALTER COLUMN "recommendation" SET DATA TYPE text;--> statement-breakpoint

-- Step 2: Update existing data to map old values to new ones
UPDATE "public"."ai_screening_results" 
SET "recommendation" = 'shortlist' 
WHERE "recommendation" IN ('hire', 'interview');--> statement-breakpoint

-- Step 3: Update any remaining invalid values to 'reject' as fallback
UPDATE "public"."ai_screening_results" 
SET "recommendation" = 'reject' 
WHERE "recommendation" NOT IN ('shortlist', 'reject');--> statement-breakpoint

-- Step 4: Drop the old enum type
DROP TYPE "public"."ai_recommendation";--> statement-breakpoint

-- Step 5: Create new enum with correct values
CREATE TYPE "public"."ai_recommendation" AS ENUM('shortlist', 'reject');--> statement-breakpoint

-- Step 6: Convert column back to enum type
ALTER TABLE "public"."ai_screening_results" ALTER COLUMN "recommendation" SET DATA TYPE "public"."ai_recommendation" USING "recommendation"::"public"."ai_recommendation";