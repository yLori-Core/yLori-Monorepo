CREATE TYPE "public"."attendee_status" AS ENUM('pending', 'approved', 'waitlisted', 'declined', 'cancelled', 'checked_in', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'cancelled', 'completed', 'postponed');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('in_person', 'virtual', 'hybrid');--> statement-breakpoint
CREATE TYPE "public"."event_visibility" AS ENUM('public', 'private', 'unlisted');--> statement-breakpoint
CREATE TYPE "public"."organizer_role" AS ENUM('host', 'co_host', 'moderator', 'speaker');--> statement-breakpoint
CREATE TYPE "public"."ticket_type" AS ENUM('free', 'paid', 'donation', 'rsvp');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin', 'moderator');--> statement-breakpoint
CREATE TABLE "event_analytics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"metric" text NOT NULL,
	"value" integer DEFAULT 1,
	"metadata" json,
	"user_id" text,
	"session_id" text,
	"ip_address" text,
	"user_agent" text,
	"referrer" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_attendees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" text,
	"status" "attendee_status" DEFAULT 'pending' NOT NULL,
	"application_answers" json,
	"approved_at" timestamp,
	"approved_by_id" text,
	"rejection_reason" text,
	"guest_name" text,
	"guest_email" text,
	"guest_phone" text,
	"guest_company" text,
	"guest_job_title" text,
	"registered_at" timestamp DEFAULT now() NOT NULL,
	"registration_source" text,
	"referral_code" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"checked_in" boolean DEFAULT false,
	"checked_in_at" timestamp,
	"checked_in_by_id" text,
	"attendance_confirmed" boolean DEFAULT false,
	"waitlist_position" integer,
	"waitlisted_at" timestamp,
	"email_reminders" boolean DEFAULT true,
	"sms_reminders" boolean DEFAULT false,
	"is_vip" boolean DEFAULT false,
	"special_requests" text,
	"dietary_restrictions" text,
	"accessibility_needs" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"color" text DEFAULT '#6366f1',
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "event_categories_name_unique" UNIQUE("name"),
	CONSTRAINT "event_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "event_organizers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"role" "organizer_role" DEFAULT 'co_host' NOT NULL,
	"permissions" json,
	"display_name" text,
	"bio" text,
	"is_visible" boolean DEFAULT true,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"question" text NOT NULL,
	"question_type" text NOT NULL,
	"options" json,
	"is_required" boolean DEFAULT false,
	"order" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"is_public" boolean DEFAULT true,
	"is_verified_attendee" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_to_categories" (
	"event_id" uuid NOT NULL,
	"category_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"is_public" boolean DEFAULT true,
	"send_email" boolean DEFAULT false,
	"created_by_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"summary" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"all_day" boolean DEFAULT false,
	"event_type" "event_type" DEFAULT 'in_person' NOT NULL,
	"location" text,
	"address" text,
	"city" text,
	"state" text,
	"country" text,
	"postal_code" text,
	"latitude" numeric(10, 8),
	"longitude" numeric(11, 8),
	"virtual_url" text,
	"virtual_platform" text,
	"cover_image" text,
	"banner_image" text,
	"logo_image" text,
	"theme" text DEFAULT 'minimal',
	"custom_colors" json,
	"status" "event_status" DEFAULT 'draft',
	"visibility" "event_visibility" DEFAULT 'public',
	"capacity" integer,
	"waitlist_enabled" boolean DEFAULT false,
	"waitlist_capacity" integer,
	"requires_approval" boolean DEFAULT false,
	"ticket_type" "ticket_type" DEFAULT 'free',
	"ticket_price" numeric(10, 2),
	"currency" text DEFAULT 'USD',
	"ticket_sale_start" timestamp,
	"ticket_sale_end" timestamp,
	"ticket_description" text,
	"registration_start" timestamp,
	"registration_end" timestamp,
	"allow_guest_registration" boolean DEFAULT true,
	"max_guests_per_registration" integer DEFAULT 1,
	"collect_guest_info" boolean DEFAULT false,
	"custom_email_template" text,
	"confirmation_message" text,
	"reminder_settings" json,
	"total_views" integer DEFAULT 0,
	"total_shares" integer DEFAULT 0,
	"total_registrations" integer DEFAULT 0,
	"total_checkins" integer DEFAULT 0,
	"slug" varchar(255),
	"meta_title" text,
	"meta_description" text,
	"tags" json,
	"is_private" boolean DEFAULT false,
	"unlisted" boolean DEFAULT false,
	"created_by_id" text NOT NULL,
	"last_modified_by_id" text,
	"published_at" timestamp,
	"archived_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "events_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"event_id" uuid,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" text NOT NULL,
	"following_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"email_verified" timestamp,
	"image" text,
	"username" varchar(50),
	"first_name" text,
	"last_name" text,
	"bio" text,
	"tagline" text,
	"website" text,
	"location" text,
	"timezone" text DEFAULT 'UTC',
	"company" text,
	"job_title" text,
	"twitter_handle" text,
	"instagram_handle" text,
	"linkedin_handle" text,
	"youtube_handle" text,
	"github_handle" text,
	"facebook_handle" text,
	"is_public_profile" boolean DEFAULT true,
	"allow_messaging" boolean DEFAULT true,
	"show_upcoming_events" boolean DEFAULT true,
	"show_past_events" boolean DEFAULT true,
	"role" "user_role" DEFAULT 'user',
	"is_verified" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "event_analytics" ADD CONSTRAINT "event_analytics_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_analytics" ADD CONSTRAINT "event_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_approved_by_id_users_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_attendees" ADD CONSTRAINT "event_attendees_checked_in_by_id_users_id_fk" FOREIGN KEY ("checked_in_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_organizers" ADD CONSTRAINT "event_organizers_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_organizers" ADD CONSTRAINT "event_organizers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_questions" ADD CONSTRAINT "event_questions_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_reviews" ADD CONSTRAINT "event_reviews_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_reviews" ADD CONSTRAINT "event_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_to_categories" ADD CONSTRAINT "event_to_categories_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_to_categories" ADD CONSTRAINT "event_to_categories_category_id_event_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."event_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_updates" ADD CONSTRAINT "event_updates_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_updates" ADD CONSTRAINT "event_updates_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_id_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_last_modified_by_id_users_id_fk" FOREIGN KEY ("last_modified_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_follows" ADD CONSTRAINT "user_follows_following_id_users_id_fk" FOREIGN KEY ("following_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "event_analytics_event_id_idx" ON "event_analytics" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_analytics_metric_idx" ON "event_analytics" USING btree ("metric");--> statement-breakpoint
CREATE INDEX "event_analytics_created_at_idx" ON "event_analytics" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "event_attendees_event_user_idx" ON "event_attendees" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "event_attendees_event_id_idx" ON "event_attendees" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_attendees_status_idx" ON "event_attendees" USING btree ("status");--> statement-breakpoint
CREATE INDEX "event_attendees_user_id_idx" ON "event_attendees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "event_attendees_guest_email_idx" ON "event_attendees" USING btree ("guest_email");--> statement-breakpoint
CREATE UNIQUE INDEX "event_organizers_event_user_idx" ON "event_organizers" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "event_organizers_event_id_idx" ON "event_organizers" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_questions_event_id_idx" ON "event_questions" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_questions_order_idx" ON "event_questions" USING btree ("event_id","order");--> statement-breakpoint
CREATE UNIQUE INDEX "event_reviews_event_user_idx" ON "event_reviews" USING btree ("event_id","user_id");--> statement-breakpoint
CREATE INDEX "event_reviews_event_id_idx" ON "event_reviews" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_reviews_rating_idx" ON "event_reviews" USING btree ("rating");--> statement-breakpoint
CREATE UNIQUE INDEX "event_to_categories_event_category_idx" ON "event_to_categories" USING btree ("event_id","category_id");--> statement-breakpoint
CREATE INDEX "event_updates_event_id_idx" ON "event_updates" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "event_updates_created_at_idx" ON "event_updates" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "events_slug_idx" ON "events" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "events_start_date_idx" ON "events" USING btree ("start_date");--> statement-breakpoint
CREATE INDEX "events_created_by_idx" ON "events" USING btree ("created_by_id");--> statement-breakpoint
CREATE INDEX "events_visibility_idx" ON "events" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "user_follows_follower_following_idx" ON "user_follows" USING btree ("follower_id","following_id");--> statement-breakpoint
CREATE INDEX "user_follows_follower_id_idx" ON "user_follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "user_follows_following_id_idx" ON "user_follows" USING btree ("following_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");