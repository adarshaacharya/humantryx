-- Create department enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "public"."department" AS ENUM('engineering', 'product', 'system_administration', 'business_analysis', 'founder_office', 'human_resources');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint

-- Add department column as nullable first
ALTER TABLE "employees" ADD COLUMN IF NOT EXISTS "department" "department";--> statement-breakpoint

-- Update all existing employees to have 'founder_office' department
UPDATE "employees" SET "department" = 'founder_office' WHERE "department" IS NULL;--> statement-breakpoint

-- Now make the column NOT NULL
ALTER TABLE "employees" ALTER COLUMN "department" SET NOT NULL;