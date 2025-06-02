CREATE TYPE "public"."user_role" AS ENUM('superadmin', 'hr', 'employee');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE user_role USING (role::user_role);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET NOT NULL;