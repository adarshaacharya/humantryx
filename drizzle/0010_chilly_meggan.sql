ALTER TABLE "public"."invitations" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "public"."invitations" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."invitation_status";--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'rejected', 'canceled');--> statement-breakpoint
ALTER TABLE "public"."invitations" ALTER COLUMN "status" SET DATA TYPE "public"."invitation_status" USING (
  CASE 
    WHEN "status" = 'pending' THEN 'pending'::invitation_status
    WHEN "status" = 'accepted' THEN 'accepted'::invitation_status
    WHEN "status" = 'revoked' THEN 'canceled'::invitation_status
    WHEN "status" = 'expired' THEN 'rejected'::invitation_status
    WHEN "status" = 'rejected' THEN 'rejected'::invitation_status
    WHEN "status" = 'canceled' THEN 'canceled'::invitation_status
    ELSE 'pending'::invitation_status
  END
);--> statement-breakpoint
ALTER TABLE "public"."invitations" ALTER COLUMN "status" SET DEFAULT 'pending';