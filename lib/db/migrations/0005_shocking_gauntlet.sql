ALTER TABLE "points_transactions" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "token_redemptions" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "token_redemptions" ALTER COLUMN "processed_by" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_achievements" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_points" ALTER COLUMN "user_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "user_security" ALTER COLUMN "user_id" SET DATA TYPE text;