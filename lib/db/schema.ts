import { pgTable, text, timestamp, boolean, integer, uuid, varchar, json, decimal, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'moderator']);
export const eventStatusEnum = pgEnum('event_status', ['draft', 'published', 'cancelled', 'completed', 'postponed']);
export const eventVisibilityEnum = pgEnum('event_visibility', ['public', 'private', 'unlisted']);
export const ticketTypeEnum = pgEnum('ticket_type', ['qr_code', 'nft']);
export const attendeeStatusEnum = pgEnum('attendee_status', ['pending', 'approved', 'waitlisted', 'declined', 'cancelled', 'checked_in', 'no_show']);
export const eventTypeEnum = pgEnum('event_type', ['in_person', 'virtual', 'hybrid']);
export const organizerRoleEnum = pgEnum('organizer_role', ['host', 'co_host', 'moderator', 'speaker']);

// Users table - Enhanced with comprehensive profile fields
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  username: varchar('username', { length: 50 }).unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  bio: text('bio'),
  tagline: text('tagline'), // Short professional tagline
  website: text('website'),
  location: text('location'),
  timezone: text('timezone').default('UTC'),
  company: text('company'),
  jobTitle: text('job_title'),
  
  // Social media handles
  twitterHandle: text('twitter_handle'),
  instagramHandle: text('instagram_handle'),
  linkedinHandle: text('linkedin_handle'),
  youtubeHandle: text('youtube_handle'),
  githubHandle: text('github_handle'),
  facebookHandle: text('facebook_handle'),
  
  // Profile settings
  isPublicProfile: boolean('is_public_profile').default(true),
  allowMessaging: boolean('allow_messaging').default(true),
  showUpcomingEvents: boolean('show_upcoming_events').default(true),
  showPastEvents: boolean('show_past_events').default(true),
  
  // System fields
  role: userRoleEnum('role').default('user'),
  isVerified: boolean('is_verified').default(false),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    usernameIdx: uniqueIndex('users_username_idx').on(table.username),
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  };
});

// Events table - Comprehensive event management
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  // Basic event details
  title: text('title').notNull(),
  description: text('description'),
  summary: text('summary'), // Short description for previews
  
  // Date and time
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  timezone: text('timezone').notNull().default('UTC'),
  allDay: boolean('all_day').default(false),
  
  // Location details
  eventType: eventTypeEnum('event_type').notNull().default('in_person'),
  location: text('location'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  postalCode: text('postal_code'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  virtualUrl: text('virtual_url'), // For virtual/hybrid events
  virtualPlatform: text('virtual_platform'), // Zoom, Meet, etc.
  
  // Media and branding
  coverImage: text('cover_image'),
  bannerImage: text('banner_image'),
  logoImage: text('logo_image'),
  theme: text('theme').default('minimal'),
  customColors: json('custom_colors'), // Theme customization
  
  // Event configuration
  status: eventStatusEnum('status').default('draft'),
  visibility: eventVisibilityEnum('visibility').default('public'),
  capacity: integer('capacity'), // null = unlimited
  waitlistEnabled: boolean('waitlist_enabled').default(false),
  waitlistCapacity: integer('waitlist_capacity'),
  requiresApproval: boolean('requires_approval').default(true),
  
  // Ticketing
  ticketType: ticketTypeEnum('ticket_type').default('qr_code'),
  ticketPrice: decimal('ticket_price', { precision: 10, scale: 2 }), // in currency units
  currency: text('currency').default('USD'),
  ticketSaleStart: timestamp('ticket_sale_start'),
  ticketSaleEnd: timestamp('ticket_sale_end'),
  ticketDescription: text('ticket_description'),
  
  // Registration settings
  registrationStart: timestamp('registration_start'),
  registrationEnd: timestamp('registration_end'),
  allowGuestRegistration: boolean('allow_guest_registration').default(true),
  maxGuestsPerRegistration: integer('max_guests_per_registration').default(1),
  collectGuestInfo: boolean('collect_guest_info').default(false),
  
  // Communication
  customEmailTemplate: text('custom_email_template'),
  confirmationMessage: text('confirmation_message'),
  reminderSettings: json('reminder_settings'), // Email reminder configuration
  
  // Analytics and engagement
  totalViews: integer('total_views').default(0),
  totalShares: integer('total_shares').default(0),
  totalRegistrations: integer('total_registrations').default(0),
  totalCheckins: integer('total_checkins').default(0),
  
  // SEO and discovery
  slug: varchar('slug', { length: 255 }).unique(),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  tags: json('tags'), // Array of tags for categorization
  isPrivate: boolean('is_private').default(false),
  unlisted: boolean('unlisted').default(false),
  
  // System fields
  createdById: text('created_by_id').notNull().references(() => users.id),
  lastModifiedById: text('last_modified_by_id').references(() => users.id),
  publishedAt: timestamp('published_at'),
  archivedAt: timestamp('archived_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    slugIdx: uniqueIndex('events_slug_idx').on(table.slug),
    statusIdx: index('events_status_idx').on(table.status),
    startDateIdx: index('events_start_date_idx').on(table.startDate),
    createdByIdx: index('events_created_by_idx').on(table.createdById),
    visibilityIdx: index('events_visibility_idx').on(table.visibility),
  };
});

// Event organizers table - Manage multiple organizers per event
export const eventOrganizers = pgTable('event_organizers', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  role: organizerRoleEnum('role').notNull().default('co_host'),
  permissions: json('permissions'), // Array of permissions
  displayName: text('display_name'), // Custom display name for this event
  bio: text('bio'), // Custom bio for this event
  isVisible: boolean('is_visible').default(true), // Show on event page
  invitedAt: timestamp('invited_at').defaultNow().notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    eventUserIdx: uniqueIndex('event_organizers_event_user_idx').on(table.eventId, table.userId),
    eventIdIdx: index('event_organizers_event_id_idx').on(table.eventId),
  };
});

// Event attendees table - Comprehensive attendee management
export const eventAttendees = pgTable('event_attendees', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id), // Can be null for guest registrations
  
  // Registration details
  status: attendeeStatusEnum('status').notNull().default('pending'),
  applicationAnswers: json('application_answers'), // Answers to custom questions
  approvedAt: timestamp('approved_at'),
  approvedById: text('approved_by_id').references(() => users.id),
  rejectionReason: text('rejection_reason'),
  
  // Guest information (when userId is null)
  guestName: text('guest_name'),
  guestEmail: text('guest_email'),
  guestPhone: text('guest_phone'),
  guestCompany: text('guest_company'),
  guestJobTitle: text('guest_job_title'),
  
  // Registration metadata
  registeredAt: timestamp('registered_at').defaultNow().notNull(),
  registrationSource: text('registration_source'), // web, mobile, api, etc.
  referralCode: text('referral_code'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  
  // Check-in and attendance
  checkedIn: boolean('checked_in').default(false),
  checkedInAt: timestamp('checked_in_at'),
  checkedInById: text('checked_in_by_id').references(() => users.id),
  attendanceConfirmed: boolean('attendance_confirmed').default(false),
  
  // Waitlist management
  waitlistPosition: integer('waitlist_position'),
  waitlistedAt: timestamp('waitlisted_at'),
  
  // Communication preferences
  emailReminders: boolean('email_reminders').default(true),
  smsReminders: boolean('sms_reminders').default(false),
  
  // Special attributes
  isVip: boolean('is_vip').default(false),
  specialRequests: text('special_requests'),
  dietaryRestrictions: text('dietary_restrictions'),
  accessibilityNeeds: text('accessibility_needs'),
  
  // System fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    eventUserIdx: uniqueIndex('event_attendees_event_user_idx').on(table.eventId, table.userId),
    eventIdIdx: index('event_attendees_event_id_idx').on(table.eventId),
    statusIdx: index('event_attendees_status_idx').on(table.status),
    userIdIdx: index('event_attendees_user_id_idx').on(table.userId),
    guestEmailIdx: index('event_attendees_guest_email_idx').on(table.guestEmail),
  };
});

// Event categories table
export const eventCategories = pgTable('event_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color').default('#6366f1'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Event to categories junction table
export const eventToCategories = pgTable('event_to_categories', {
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  categoryId: uuid('category_id').notNull().references(() => eventCategories.id, { onDelete: 'cascade' }),
}, (table) => {
  return {
    eventCategoryIdx: uniqueIndex('event_to_categories_event_category_idx').on(table.eventId, table.categoryId),
  };
});

// Event registration questions - Custom questions for event registration
export const eventQuestions = pgTable('event_questions', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  question: text('question').notNull(),
  questionType: text('question_type').notNull(), // text, textarea, select, multiselect, checkbox, radio
  options: json('options'), // For select/radio/checkbox questions
  isRequired: boolean('is_required').default(false),
  order: integer('order').notNull(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    eventIdIdx: index('event_questions_event_id_idx').on(table.eventId),
    orderIdx: index('event_questions_order_idx').on(table.eventId, table.order),
  };
});

// Event updates/announcements
export const eventUpdates = pgTable('event_updates', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  isPublic: boolean('is_public').default(true),
  sendEmail: boolean('send_email').default(false),
  createdById: text('created_by_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    eventIdIdx: index('event_updates_event_id_idx').on(table.eventId),
    createdAtIdx: index('event_updates_created_at_idx').on(table.createdAt),
  };
});

// Event analytics and tracking
export const eventAnalytics = pgTable('event_analytics', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  metric: text('metric').notNull(), // page_view, share, registration_start, registration_complete, etc.
  value: integer('value').default(1),
  metadata: json('metadata'), // Additional data like source, user agent, etc.
  userId: text('user_id').references(() => users.id),
  sessionId: text('session_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  referrer: text('referrer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    eventIdIdx: index('event_analytics_event_id_idx').on(table.eventId),
    metricIdx: index('event_analytics_metric_idx').on(table.metric),
    createdAtIdx: index('event_analytics_created_at_idx').on(table.createdAt),
  };
});

// User notifications
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // event_reminder, event_update, registration_approved, etc.
  title: text('title').notNull(),
  message: text('message').notNull(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  isRead: boolean('is_read').default(false),
  readAt: timestamp('read_at'),
  metadata: json('metadata'), // Additional context data
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('notifications_user_id_idx').on(table.userId),
    typeIdx: index('notifications_type_idx').on(table.type),
    isReadIdx: index('notifications_is_read_idx').on(table.isRead),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
  };
});

// User follows - Users can follow other users
export const userFollows = pgTable('user_follows', {
  id: uuid('id').defaultRandom().primaryKey(),
  followerId: text('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: text('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    followerFollowingIdx: uniqueIndex('user_follows_follower_following_idx').on(table.followerId, table.followingId),
    followerIdIdx: index('user_follows_follower_id_idx').on(table.followerId),
    followingIdIdx: index('user_follows_following_id_idx').on(table.followingId),
  };
});

// Event reviews/feedback
export const eventReviews = pgTable('event_reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id),
  rating: integer('rating').notNull(), // 1-5 stars
  review: text('review'),
  isPublic: boolean('is_public').default(true),
  isVerifiedAttendee: boolean('is_verified_attendee').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    eventUserIdx: uniqueIndex('event_reviews_event_user_idx').on(table.eventId, table.userId),
    eventIdIdx: index('event_reviews_event_id_idx').on(table.eventId),
    ratingIdx: index('event_reviews_rating_idx').on(table.rating),
  };
});



// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  organizedEvents: many(eventOrganizers),
  attendees: many(eventAttendees),
  notifications: many(notifications),
  followers: many(userFollows, { relationName: 'follower' }),
  following: many(userFollows, { relationName: 'following' }),
  eventReviews: many(eventReviews),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [events.createdById],
    references: [users.id],
  }),
  lastModifiedBy: one(users, {
    fields: [events.lastModifiedById],
    references: [users.id],
  }),
  organizers: many(eventOrganizers),
  attendees: many(eventAttendees),
  categories: many(eventToCategories),
  questions: many(eventQuestions),
  updates: many(eventUpdates),
  analytics: many(eventAnalytics),
  reviews: many(eventReviews),
}));

export const eventOrganizersRelations = relations(eventOrganizers, ({ one }) => ({
  event: one(events, {
    fields: [eventOrganizers.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventOrganizers.userId],
    references: [users.id],
  }),
}));

export const eventAttendeesRelations = relations(eventAttendees, ({ one }) => ({
  event: one(events, {
    fields: [eventAttendees.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventAttendees.userId],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [eventAttendees.approvedById],
    references: [users.id],
  }),
  checkedInBy: one(users, {
    fields: [eventAttendees.checkedInById],
    references: [users.id],
  }),
}));

export const eventCategoriesRelations = relations(eventCategories, ({ many }) => ({
  events: many(eventToCategories),
}));

export const eventToCategoriesRelations = relations(eventToCategories, ({ one }) => ({
  event: one(events, {
    fields: [eventToCategories.eventId],
    references: [events.id],
  }),
  category: one(eventCategories, {
    fields: [eventToCategories.categoryId],
    references: [eventCategories.id],
  }),
}));

export const eventQuestionsRelations = relations(eventQuestions, ({ one }) => ({
  event: one(events, {
    fields: [eventQuestions.eventId],
    references: [events.id],
  }),
}));

export const eventUpdatesRelations = relations(eventUpdates, ({ one }) => ({
  event: one(events, {
    fields: [eventUpdates.eventId],
    references: [events.id],
  }),
  createdBy: one(users, {
    fields: [eventUpdates.createdById],
    references: [users.id],
  }),
}));

export const eventAnalyticsRelations = relations(eventAnalytics, ({ one }) => ({
  event: one(events, {
    fields: [eventAnalytics.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventAnalytics.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  event: one(events, {
    fields: [notifications.eventId],
    references: [events.id],
  }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
    relationName: 'follower',
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
    relationName: 'following',
  }),
}));

export const eventReviewsRelations = relations(eventReviews, ({ one }) => ({
  event: one(events, {
    fields: [eventReviews.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventReviews.userId],
    references: [users.id],
  }),
}));



// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type EventOrganizer = typeof eventOrganizers.$inferSelect;
export type NewEventOrganizer = typeof eventOrganizers.$inferInsert;
export type EventAttendee = typeof eventAttendees.$inferSelect;
export type NewEventAttendee = typeof eventAttendees.$inferInsert;
export type EventCategory = typeof eventCategories.$inferSelect;
export type NewEventCategory = typeof eventCategories.$inferInsert;
export type EventQuestion = typeof eventQuestions.$inferSelect;
export type NewEventQuestion = typeof eventQuestions.$inferInsert;
export type EventUpdate = typeof eventUpdates.$inferSelect;
export type NewEventUpdate = typeof eventUpdates.$inferInsert;
export type EventAnalytic = typeof eventAnalytics.$inferSelect;
export type NewEventAnalytic = typeof eventAnalytics.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type UserFollow = typeof userFollows.$inferSelect;
export type NewUserFollow = typeof userFollows.$inferInsert;
export type EventReview = typeof eventReviews.$inferSelect;
export type NewEventReview = typeof eventReviews.$inferInsert; 