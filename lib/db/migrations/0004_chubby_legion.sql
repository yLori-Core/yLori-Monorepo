CREATE TYPE "public"."achievement_type" AS ENUM('first_steps', 'profile_complete', 'first_event_create', 'first_event_attend', 'host_hero', 'social_butterfly', 'early_bird', 'community_leader', 'streak_master', 'event_creator', 'super_attendee', 'point_collector', 'level_achiever');--> statement-breakpoint
CREATE TYPE "public"."manual_review_status" AS ENUM('none', 'pending', 'approved', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."transaction_status" AS ENUM('completed', 'pending', 'cancelled', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('event_create', 'event_publish', 'event_complete', 'event_register', 'event_checkin', 'event_complete_attend', 'early_bird', 'profile_complete', 'first_event_create', 'first_event_attend', 'event_share', 'event_review', 'invite_friend', 'custom_questions', 'weekly_active', 'attendee_milestone_10', 'attendee_milestone_25', 'attendee_milestone_50', 'attendee_milestone_100', 'manual_adjustment', 'achievement_bonus');--> statement-breakpoint
CREATE TYPE "public"."redemption_status" AS ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."verification_level" AS ENUM('none', 'email', 'phone', 'social', 'id', 'kyc');--> statement-breakpoint
CREATE TABLE "points_rules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rule_type" varchar(50) NOT NULL,
	"rule_name" varchar(100) NOT NULL,
	"base_points" integer NOT NULL,
	"multiplier_conditions" json DEFAULT '{}'::json,
	"verification_level_required" "verification_level" DEFAULT 'none',
	"max_daily_earnings" integer,
	"max_per_event" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "points_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"event_id" uuid,
	"points_earned" integer NOT NULL,
	"transaction_type" "transaction_type" NOT NULL,
	"description" text NOT NULL,
	"metadata" json DEFAULT '{}'::json,
	"risk_score" integer DEFAULT 0,
	"status" "transaction_status" DEFAULT 'completed',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "token_redemptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"points_redeemed" integer NOT NULL,
	"tokens_issued" numeric(18, 8),
	"exchange_rate" numeric(10, 6),
	"verification_level_used" "verification_level" NOT NULL,
	"risk_score_at_redemption" integer NOT NULL,
	"manual_review_required" boolean DEFAULT false,
	"status" "redemption_status" DEFAULT 'pending',
	"transaction_hash" varchar(66),
	"rejection_reason" text,
	"processed_by" uuid,
	"requested_at" timestamp DEFAULT now(),
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_type" "achievement_type" NOT NULL,
	"achievement_name" varchar(100) NOT NULL,
	"description" text,
	"points_earned" integer DEFAULT 0,
	"metadata" json DEFAULT '{}'::json,
	"achieved_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"lifetime_points" integer DEFAULT 0 NOT NULL,
	"current_level" integer DEFAULT 1 NOT NULL,
	"level_progress" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_security" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"risk_score" integer DEFAULT 0 NOT NULL,
	"verification_level" "verification_level" DEFAULT 'none' NOT NULL,
	"red_flags" json DEFAULT '[]'::json,
	"device_fingerprints" json DEFAULT '[]'::json,
	"ip_addresses" json DEFAULT '[]'::json,
	"last_risk_assessment" timestamp DEFAULT now(),
	"manual_review_status" "manual_review_status" DEFAULT 'none',
	"manual_review_notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "points_transactions" ADD CONSTRAINT "points_transactions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_redemptions" ADD CONSTRAINT "token_redemptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "token_redemptions" ADD CONSTRAINT "token_redemptions_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_points" ADD CONSTRAINT "user_points_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_security" ADD CONSTRAINT "user_security_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "points_rules_rule_type_unique" ON "points_rules" USING btree ("rule_type");--> statement-breakpoint
CREATE INDEX "idx_points_rules_active" ON "points_rules" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_points_rules_type" ON "points_rules" USING btree ("rule_type");--> statement-breakpoint
CREATE INDEX "idx_points_transactions_user_id" ON "points_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_points_transactions_event_id" ON "points_transactions" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_points_transactions_type" ON "points_transactions" USING btree ("transaction_type");--> statement-breakpoint
CREATE INDEX "idx_points_transactions_created_at" ON "points_transactions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_points_transactions_status" ON "points_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_token_redemptions_user_id" ON "token_redemptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_token_redemptions_status" ON "token_redemptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_token_redemptions_requested_at" ON "token_redemptions" USING btree ("requested_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_achievements_user_achievement_unique" ON "user_achievements" USING btree ("user_id","achievement_type");--> statement-breakpoint
CREATE INDEX "idx_user_achievements_user_id" ON "user_achievements" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_achievements_type" ON "user_achievements" USING btree ("achievement_type");--> statement-breakpoint
CREATE INDEX "idx_user_achievements_achieved_at" ON "user_achievements" USING btree ("achieved_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_points_user_id_unique" ON "user_points" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_points_total_points" ON "user_points" USING btree ("total_points" desc);--> statement-breakpoint
CREATE INDEX "idx_user_points_level" ON "user_points" USING btree ("current_level" desc);--> statement-breakpoint
CREATE UNIQUE INDEX "user_security_user_id_unique" ON "user_security" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_security_risk_score" ON "user_security" USING btree ("risk_score");--> statement-breakpoint
CREATE INDEX "idx_user_security_verification_level" ON "user_security" USING btree ("verification_level");