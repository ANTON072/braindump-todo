CREATE TYPE "public"."priority" AS ENUM('low', 'med', 'high');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('open', 'done');--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todos" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"notes" text,
	"due_date" date,
	"priority" "priority" DEFAULT 'med' NOT NULL,
	"status" "status" DEFAULT 'open' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "todos_to_tags" (
	"todo_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "todos_to_tags_todo_id_tag_id_pk" PRIMARY KEY("todo_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "todos_to_tags" ADD CONSTRAINT "todos_to_tags_todo_id_todos_id_fk" FOREIGN KEY ("todo_id") REFERENCES "public"."todos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "todos_to_tags" ADD CONSTRAINT "todos_to_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tags_user_id_name_unique" ON "tags" USING btree ("user_id","name");
