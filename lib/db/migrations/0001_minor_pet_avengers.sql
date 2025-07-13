ALTER TABLE "events" ALTER COLUMN "ticket_type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "ticket_type" SET DEFAULT 'qr_code'::text;--> statement-breakpoint
DROP TYPE "public"."ticket_type";--> statement-breakpoint
CREATE TYPE "public"."ticket_type" AS ENUM('qr_code', 'nft');--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "ticket_type" SET DEFAULT 'qr_code'::"public"."ticket_type";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "ticket_type" SET DATA TYPE "public"."ticket_type" USING "ticket_type"::"public"."ticket_type";