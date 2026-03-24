CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_key" text NOT NULL,
	"payload" jsonb NOT NULL,
	"headers" jsonb NOT NULL,
	"received_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pipelines" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_key" text NOT NULL,
	"target" text NOT NULL,
	"action" jsonb
);
