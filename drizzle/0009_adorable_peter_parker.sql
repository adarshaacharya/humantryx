CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."org_member_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TYPE "public"."invitation_role" AS ENUM('admin', 'member', 'guest');--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "role" SET DATA TYPE invitation_role USING(role::invitation_role);--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "status" SET DATA TYPE invitation_status USING(status::invitation_status);--> statement-breakpoint
ALTER TABLE "invitations" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "role" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "role" SET DATA TYPE org_member_role USING(role::org_member_role);--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "role" SET DEFAULT 'member';