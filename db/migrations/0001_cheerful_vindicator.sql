ALTER TABLE "documents" ADD COLUMN "session_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "documents" ADD COLUMN "last_accessed" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "documents_session_index" ON "documents" USING btree ("session_id");