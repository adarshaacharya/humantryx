CREATE TYPE "public"."attachment_types" AS ENUM('image', 'video', 'audio', 'document');--> statement-breakpoint
CREATE TABLE "attachments" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" text NOT NULL,
    "file_name" text NOT NULL,
    "mime_type" text NOT NULL,
    "extension" text NOT NULL,
    "file_url" text NOT NULL,
    "type" "attachment_types",
    "title" text,
    "description" text,
    "metadata" jsonb DEFAULT '{}'::jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    "deleted_at" timestamp
);
--> statement-breakpoint
-- Add column as nullable first
ALTER TABLE "documents" ADD COLUMN "attachment_id" uuid;--> statement-breakpoint
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint

-- Create default attachments for existing documents
INSERT INTO attachments (user_id, file_name, mime_type, extension, file_url, type, title, description)
SELECT 
    d.uploaded_by as user_id,
    COALESCE(d.title, 'Legacy Document') as file_name,
    'application/octet-stream' as mime_type,
    'unknown' as extension,
    COALESCE(d.url, '') as file_url,
    'document' as type,
    d.title,
    d.description
FROM documents d
WHERE d.attachment_id IS NULL;

-- Update documents to reference the newly created attachments
UPDATE documents 
SET attachment_id = a.id
FROM attachments a
WHERE documents.attachment_id IS NULL 
AND a.user_id = documents.uploaded_by 
AND COALESCE(a.title, '') = COALESCE(documents.title, '')
AND a.id = (
    SELECT id FROM attachments 
    WHERE user_id = documents.uploaded_by 
    AND COALESCE(title, '') = COALESCE(documents.title, '')
    ORDER BY created_at DESC 
    LIMIT 1
);

-- Now make the column NOT NULL and add foreign key constraint
ALTER TABLE "documents" ALTER COLUMN "attachment_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_attachment_id_attachments_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachments"("id") ON DELETE cascade ON UPDATE no action;