CREATE TABLE "audio_presets" (
	"id" serial PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "comments" ALTER COLUMN "content" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "audio_preset_id" integer;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_audio_preset_id_audio_presets_id_fk" FOREIGN KEY ("audio_preset_id") REFERENCES "public"."audio_presets"("id") ON DELETE set null ON UPDATE no action;