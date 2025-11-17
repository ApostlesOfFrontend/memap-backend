CREATE TYPE "public"."statuses" AS ENUM('pending_upload', 'upload_confirmed', 'awaiting_processing', 'pricessing_started', 'processing_error', 'processing_finised');--> statement-breakpoint
CREATE TABLE "image" (
	"uuid" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"originalName" text NOT NULL,
	"userSize" integer NOT NULL,
	"originalSize" integer DEFAULT 0,
	"type" text NOT NULL,
	"status" "statuses" DEFAULT 'pending_upload' NOT NULL,
	"tripId" integer NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_tripId_trip_id_fk" FOREIGN KEY ("tripId") REFERENCES "public"."trip"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "image" ADD CONSTRAINT "image_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;