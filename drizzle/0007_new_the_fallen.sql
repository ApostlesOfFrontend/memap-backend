ALTER TYPE "public"."statuses" ADD VALUE 'marked_for_deletion';--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "isVisible" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "trip" ADD COLUMN "markedForDeletion" boolean DEFAULT false NOT NULL;