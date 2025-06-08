CREATE TYPE "public"."employee_status" AS ENUM('active', 'invited', 'terminated', 'resigned', 'on_leave');--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "status" "employee_status" DEFAULT 'invited';--> statement-breakpoint
UPDATE "employees" SET "status" = 'invited' WHERE "status" IS NULL;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "status" DROP DEFAULT;