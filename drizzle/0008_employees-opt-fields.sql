ALTER TABLE "employees" ALTER COLUMN "id" TYPE uuid USING id::uuid;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ALTER COLUMN "member_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "employees" ADD COLUMN "invitation_id" text;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_invitation_id_invitations_id_fk" FOREIGN KEY ("invitation_id") REFERENCES "public"."invitations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" DROP COLUMN "status";