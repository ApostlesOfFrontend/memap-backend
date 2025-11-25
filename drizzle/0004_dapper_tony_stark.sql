ALTER TABLE "image" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "image" ALTER COLUMN "status" SET DEFAULT 'pending_upload'::text;--> statement-breakpoint
DROP TYPE "public"."statuses";--> statement-breakpoint
CREATE TYPE "public"."statuses" AS ENUM('pending_upload', 'upload_confirmed', 'awaiting_processing', 'processing_started', 'processing_error', 'processing_finised');--> statement-breakpoint
ALTER TABLE "image" ALTER COLUMN "status" SET DEFAULT 'pending_upload'::"public"."statuses";--> statement-breakpoint
ALTER TABLE "image" ALTER COLUMN "status" SET DATA TYPE "public"."statuses" USING "status"::"public"."statuses";