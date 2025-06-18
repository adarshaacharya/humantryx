CREATE TYPE "public"."ai_recommendation" AS ENUM('hire', 'interview', 'reject');--> statement-breakpoint
CREATE TABLE "ai_screening_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_application_id" uuid NOT NULL,
	"organization_id" text NOT NULL,
	"match_score" integer NOT NULL,
	"confidence" integer NOT NULL,
	"recommendation" "ai_recommendation" NOT NULL,
	"matched_skills" json DEFAULT '[]'::json NOT NULL,
	"missing_skills" json DEFAULT '[]'::json NOT NULL,
	"summary" text NOT NULL,
	"ai_model" text,
	"processing_time" integer,
	"screened_at" timestamp DEFAULT now() NOT NULL,
	"screened_by_employee_id" uuid
);
--> statement-breakpoint
ALTER TABLE "ai_screening_results" ADD CONSTRAINT "ai_screening_results_job_application_id_job_applications_id_fk" FOREIGN KEY ("job_application_id") REFERENCES "public"."job_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_screening_results" ADD CONSTRAINT "ai_screening_results_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_screening_results" ADD CONSTRAINT "ai_screening_results_screened_by_employee_id_employees_id_fk" FOREIGN KEY ("screened_by_employee_id") REFERENCES "public"."employees"("id") ON DELETE set null ON UPDATE no action;