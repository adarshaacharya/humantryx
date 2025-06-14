CREATE TYPE "public"."attendance_status" AS ENUM('clocked_in', 'clocked_out', 'break_start', 'break_end');--> statement-breakpoint
CREATE TABLE "attendance_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"clock_in_time" timestamp NOT NULL,
	"clock_out_time" timestamp,
	"break_start_time" timestamp,
	"break_end_time" timestamp,
	"total_working_minutes" integer DEFAULT 0,
	"total_break_minutes" integer DEFAULT 0,
	"status" "attendance_status" DEFAULT 'clocked_out' NOT NULL,
	"notes" text,
	"location_clock_in" text,
	"location_clock_out" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;