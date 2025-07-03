import { eq, desc, and, count, or, asc, sql, inArray } from 'drizzle-orm';
import { db } from './index';
import crypto from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  users, 
  events, 
  eventAttendees, 
  eventOrganizers,
  eventQuestions,
  eventAnalytics,
  notifications,
  eventReviews,
  userFollows,
  type NewEvent, 
  type NewUser,
  type NewEventAttendee,
  type NewEventOrganizer,
  type NewNotification
} from './schema';

// Session and authorization utilities
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return null;
  }
  
  return await getUserByEmail(session.user.email);
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function isEventOrganizer(eventId: string, userId: string): Promise<boolean> {
  // Check if user is the event creator
  const event = await getEventById(eventId);
  if (event?.createdById === userId) {
    return true;
  }
  
  // Check if user is listed as an organizer
  const organizer = await db.select()
    .from(eventOrganizers)
    .where(and(
      eq(eventOrganizers.eventId, eventId),
      eq(eventOrganizers.userId, userId)
    ))
    .limit(1);
    
  return organizer.length > 0;
}

export async function requireEventOrganizer(eventId: string) {
  const user = await requireAuth();
  const isOrganizer = await isEventOrganizer(eventId, user.id);
  
  if (!isOrganizer) {
    throw new Error('Only event organizers can perform this action');
  }
  
  return user;
}

// User queries
export async function getUserByEmail(email: string) {
  try {
    console.log('🔍 Searching for user with email:', email);
    const user = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      emailVerified: users.emailVerified,
      image: users.image,
      username: users.username,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt
    }).from(users).where(eq(users.email, email)).limit(1);
    console.log('✅ Query successful, found user:', user[0] ? 'Yes' : 'No');
    return user[0] || null;
  } catch (error) {
    console.error('❌ Error in getUserByEmail:', error);
    throw error;
  }
}

function generateUsername(email: string, name?: string | null): string {
  // Try to use name first, fallback to email prefix
  const baseName = name ? name.toLowerCase().replace(/\s+/g, '') : email.split('@')[0];
  
  // Clean the base name - remove special characters and limit length
  const cleanBaseName = baseName
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  
  // Add a random suffix to make it unique
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${cleanBaseName}${randomSuffix}`;
}

export async function getOrCreateUser(email: string, name?: string | null, image?: string | null) {
  try {
    console.log('🚀 Starting getOrCreateUser for:', email);
    
    // First try to find the user
    const existingUser = await getUserByEmail(email);
    
    // If user exists, return it
    if (existingUser) {
      console.log('👤 User found, returning existing user');
      return existingUser;
    }
    
    console.log('👥 User not found, creating new user');
    
    // Generate a unique username
    let username = generateUsername(email, name);
    
    // Ensure username is unique
    let attempts = 0;
    while (attempts < 5) {
      const existingUsername = await getUserByUsername(username);
      if (!existingUsername) {
        break;
      }
      // If username exists, try a new one
      username = generateUsername(email, name);
      attempts++;
    }
    
      // Otherwise create a new user
  const newUser: NewUser = {
    id: crypto.randomUUID(), // Generate a UUID for the user ID
    email,
    name: name || null,
    image: image || null,
    username,
    emailVerified: new Date(),
  };
    
    console.log('📝 Creating user with data:', { id: newUser.id, email: newUser.email, username: newUser.username });
    const createdUser = await createUser(newUser);
    console.log('✅ User created successfully:', createdUser.id);
    return createdUser;
  } catch (error) {
    console.error('❌ Error in getOrCreateUser:', error);
    throw error;
  }
}

export async function getUserById(id: string) {
  const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user[0] || null;
}

export async function getUserByUsername(username: string) {
  const user = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    emailVerified: users.emailVerified,
    image: users.image,
    username: users.username,
    firstName: users.firstName,
    lastName: users.lastName,
    bio: users.bio,
    tagline: users.tagline,
    website: users.website,
    location: users.location,
    timezone: users.timezone,
    company: users.company,
    jobTitle: users.jobTitle,
    twitterHandle: users.twitterHandle,
    instagramHandle: users.instagramHandle,
    linkedinHandle: users.linkedinHandle,
    youtubeHandle: users.youtubeHandle,
    githubHandle: users.githubHandle,
    facebookHandle: users.facebookHandle,
    isPublicProfile: users.isPublicProfile,
    allowMessaging: users.allowMessaging,
    showUpcomingEvents: users.showUpcomingEvents,
    showPastEvents: users.showPastEvents,
    role: users.role,
    isVerified: users.isVerified,
    isActive: users.isActive,
    lastLoginAt: users.lastLoginAt,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt
  }).from(users).where(eq(users.username, username)).limit(1);
  return user[0] || null;
}

export async function createUser(userData: NewUser) {
  console.log('📝 Creating user:', userData.email);
  const result = await db.insert(users).values(userData).returning();
  console.log('✅ User created successfully');
  return result[0];
}

export async function updateUser(id: string, userData: Partial<NewUser>) {
  const result = await db.update(users)
    .set({ ...userData, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return result[0];
}

// Event queries
export async function createEvent(eventData: Omit<NewEvent, 'createdById'>) {
  // Require authentication
  const user = await requireAuth();
  
  const eventWithCreator: NewEvent = {
    ...eventData,
    createdById: user.id,
  };
  
  const result = await db.insert(events).values(eventWithCreator).returning();
  return result[0];
}

export async function getEventById(id: string) {
  const event = await db.select().from(events).where(eq(events.id, id)).limit(1);
  return event[0] || null;
}

export async function getEventBySlug(slug: string) {
  const event = await db.select().from(events).where(eq(events.slug, slug)).limit(1);
  return event[0] || null;
}

export async function getEventWithDetails(eventId: string) {
  return await db.query.events.findFirst({
    where: eq(events.id, eventId),
    with: {
      createdBy: true,
      organizers: {
        with: {
          user: true
        }
      },
      questions: {
        where: eq(eventQuestions.isActive, true),
        orderBy: asc(eventQuestions.order)
      }
    }
  });
}

export async function getUserEvents(userId: string) {
  return await db.select()
    .from(events)
    .where(eq(events.createdById, userId))
    .orderBy(desc(events.startDate));
}

export async function getCurrentUserEvents() {
  const user = await requireAuth();
  return getUserEvents(user.id);
}

export async function getUserOrganizedEvents(userId: string) {
  return await db.select({
    event: events,
    role: eventOrganizers.role
  })
  .from(eventOrganizers)
  .innerJoin(events, eq(eventOrganizers.eventId, events.id))
  .where(eq(eventOrganizers.userId, userId))
  .orderBy(desc(events.startDate));
}

export async function getPublicEvents(limit: number = 20, offset: number = 0) {
  return await db.select()
    .from(events)
    .where(and(
      eq(events.visibility, 'public'),
      eq(events.status, 'published')
    ))
    .orderBy(desc(events.startDate))
    .limit(limit)
    .offset(offset);
}

export async function getUpcomingEvents(limit: number = 20) {
  const now = new Date();
  return await db.select()
    .from(events)
    .where(and(
      eq(events.visibility, 'public'),
      eq(events.status, 'published'),
      sql`${events.startDate} > ${now}`
    ))
    .orderBy(asc(events.startDate))
    .limit(limit);
}

export async function updateEvent(eventId: string, eventData: Partial<Omit<NewEvent, 'createdById' | 'id'>>) {
  // Check if current user is an event organizer
  const organizer = await requireEventOrganizer(eventId);
  
  const result = await db.update(events)
    .set({ 
      ...eventData, 
      lastModifiedById: organizer.id,
      updatedAt: new Date() 
    })
    .where(eq(events.id, eventId))
    .returning();
  return result[0];
}

export async function deleteEvent(eventId: string) {
  // Check if current user is an event organizer
  await requireEventOrganizer(eventId);
  
  await db.delete(events).where(eq(events.id, eventId));
}

export async function publishEvent(eventId: string) {
  // Check if current user is an event organizer
  const organizer = await requireEventOrganizer(eventId);
  
  const result = await db.update(events)
    .set({ 
      status: 'published',
      publishedAt: new Date(),
      lastModifiedById: organizer.id,
      updatedAt: new Date()
    })
    .where(eq(events.id, eventId))
    .returning();
  return result[0];
}

// Event organizer queries
export async function addEventOrganizer(eventId: string, userId: string, role: 'host' | 'co_host' | 'moderator' | 'speaker' = 'co_host') {
  // Check if current user is an event organizer (only existing organizers can add new ones)
  const currentOrganizer = await requireEventOrganizer(eventId);
  
  // Check if user is already an organizer
  const existingOrganizer = await db.select()
    .from(eventOrganizers)
    .where(and(
      eq(eventOrganizers.eventId, eventId),
      eq(eventOrganizers.userId, userId)
    ))
    .limit(1);
    
  if (existingOrganizer.length > 0) {
    throw new Error('User is already an organizer for this event');
  }
  
  const organizerData: NewEventOrganizer = {
    eventId,
    userId,
    role,
  };
  
  const result = await db.insert(eventOrganizers).values(organizerData).returning();
  return result[0];
}

export async function getEventOrganizers(eventId: string) {
  return await db.select({
    id: eventOrganizers.id,
    role: eventOrganizers.role,
    displayName: eventOrganizers.displayName,
    bio: eventOrganizers.bio,
    isVisible: eventOrganizers.isVisible,
    user: {
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      username: users.username,
      company: users.company,
      jobTitle: users.jobTitle
    }
  })
  .from(eventOrganizers)
  .innerJoin(users, eq(eventOrganizers.userId, users.id))
  .where(and(
    eq(eventOrganizers.eventId, eventId),
    eq(eventOrganizers.isVisible, true)
  ));
}

export async function removeEventOrganizer(eventId: string, userId: string) {
  // Check if current user is an event organizer
  const currentOrganizer = await requireEventOrganizer(eventId);
  
  // Prevent removing the event creator (they should always be an organizer)
  const event = await getEventById(eventId);
  if (event?.createdById === userId) {
    throw new Error('Cannot remove the event creator as an organizer');
  }
  
  // Users can remove themselves, or main organizers can remove others
  if (currentOrganizer.id !== userId) {
    // Check if current user has permission to remove others (only event creator can do this)
    if (event?.createdById !== currentOrganizer.id) {
      throw new Error('Only the event creator can remove other organizers');
    }
  }
  
  await db.delete(eventOrganizers)
    .where(and(
      eq(eventOrganizers.eventId, eventId),
      eq(eventOrganizers.userId, userId)
    ));
}

// Event attendee queries
export async function registerForEvent(eventId: string, guestData?: {
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestCompany?: string;
  guestJobTitle?: string;
  applicationAnswers?: any;
}) {
  // Get current user from session
  const user = await getCurrentUser();
  
  // Check if user is already registered
  if (user) {
    const existingRegistration = await getUserEventStatus(eventId, user.id);
    if (existingRegistration) {
      throw new Error('You are already registered for this event');
    }
  }
  
  // Get event details to check requirements
  const event = await getEventById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }
  
  if (event.status !== 'published') {
    throw new Error('Event is not available for registration');
  }
  
  // Check if registration is open
  const now = new Date();
  if (event.registrationStart && now < event.registrationStart) {
    throw new Error('Registration has not started yet');
  }
  
  if (event.registrationEnd && now > event.registrationEnd) {
    throw new Error('Registration has ended');
  }
  
  // Determine initial status based on event settings
  let initialStatus: 'pending' | 'approved' = event.requiresApproval ? 'pending' : 'approved';
  
  // Check capacity
  if (event.capacity) {
    const currentCount = await getEventAttendeesCount(eventId);
    if (currentCount >= event.capacity) {
      if (event.waitlistEnabled) {
        initialStatus = 'waitlisted' as any;
      } else {
        throw new Error('Event is at full capacity');
      }
    }
  }
  
  const attendeeData: NewEventAttendee = {
    eventId,
    userId: user?.id || null,
    status: initialStatus,
    ...guestData,
    registrationSource: 'web',
  };
  
  const result = await db.insert(eventAttendees).values(attendeeData).returning();
  return result[0];
}

export async function getEventAttendeesByStatus(eventId: string, status?: ('pending' | 'approved' | 'waitlisted' | 'declined' | 'cancelled' | 'checked_in' | 'no_show')[]) {
  const whereConditions = [eq(eventAttendees.eventId, eventId)];
  if (status && status.length > 0) {
    whereConditions.push(inArray(eventAttendees.status, status));
  }

  return await db.select({
    id: eventAttendees.id,
    status: eventAttendees.status,
    registeredAt: eventAttendees.registeredAt,
    checkedIn: eventAttendees.checkedIn,
    checkedInAt: eventAttendees.checkedInAt,
    waitlistPosition: eventAttendees.waitlistPosition,
    isVip: eventAttendees.isVip,
    guestName: eventAttendees.guestName,
    guestEmail: eventAttendees.guestEmail,
    applicationAnswers: eventAttendees.applicationAnswers,
    user: {
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      username: users.username,
      company: users.company,
      jobTitle: users.jobTitle
    }
  })
  .from(eventAttendees)
  .leftJoin(users, eq(eventAttendees.userId, users.id))
  .where(and(...whereConditions))
  .orderBy(eventAttendees.registeredAt);
}

export async function getApprovedAttendees(eventId: string) {
  // Check if current user is an event organizer
  await requireEventOrganizer(eventId);
  return getEventAttendeesByStatus(eventId, ['approved', 'checked_in']);
}

export async function getPendingAttendees(eventId: string) {
  // Check if current user is an event organizer
  await requireEventOrganizer(eventId);
  return getEventAttendeesByStatus(eventId, ['pending']);
}

export async function getWaitlistedAttendees(eventId: string) {
  // Check if current user is an event organizer
  await requireEventOrganizer(eventId);
  return getEventAttendeesByStatus(eventId, ['waitlisted']);
}

export async function approveAttendee(eventId: string, attendeeId: string) {
  // Check if current user is an event organizer
  const organizer = await requireEventOrganizer(eventId);
  
  // Check if attendee exists and is pending
  const attendee = await db.select()
    .from(eventAttendees)
    .where(and(
      eq(eventAttendees.id, attendeeId),
      eq(eventAttendees.eventId, eventId)
    ))
    .limit(1);
    
  if (!attendee.length) {
    throw new Error('Attendee not found');
  }
  
  if (attendee[0].status !== 'pending') {
    throw new Error('Attendee is not in pending status');
  }
  
  // Check event capacity before approving
  const event = await getEventById(eventId);
  if (event?.capacity) {
    const currentCount = await getEventAttendeesCount(eventId);
    if (currentCount >= event.capacity) {
      throw new Error('Event is at full capacity. Consider moving to waitlist instead.');
    }
  }
  
  const result = await db.update(eventAttendees)
    .set({ 
      status: 'approved',
      approvedAt: new Date(),
      approvedById: organizer.id,
      updatedAt: new Date()
    })
    .where(and(
      eq(eventAttendees.id, attendeeId),
      eq(eventAttendees.eventId, eventId)
    ))
    .returning();
  return result[0];
}

export async function moveToWaitlist(eventId: string, attendeeId: string) {
  // Check if current user is an event organizer
  await requireEventOrganizer(eventId);
  
  // Get current waitlist position
  const waitlistCount = await db.select({ count: count() })
    .from(eventAttendees)
    .where(and(
      eq(eventAttendees.eventId, eventId),
      eq(eventAttendees.status, 'waitlisted')
    ));

  const result = await db.update(eventAttendees)
    .set({ 
      status: 'waitlisted',
      waitlistPosition: (waitlistCount[0]?.count || 0) + 1,
      waitlistedAt: new Date(),
      updatedAt: new Date()
    })
    .where(and(
      eq(eventAttendees.id, attendeeId),
      eq(eventAttendees.eventId, eventId)
    ))
    .returning();
  return result[0];
}

export async function checkInAttendee(eventId: string, attendeeId: string) {
  // Check if current user is an event organizer
  const organizer = await requireEventOrganizer(eventId);
  
  // Verify attendee is approved
  const attendee = await db.select()
    .from(eventAttendees)
    .where(and(
      eq(eventAttendees.id, attendeeId),
      eq(eventAttendees.eventId, eventId)
    ))
    .limit(1);
    
  if (!attendee.length) {
    throw new Error('Attendee not found');
  }
  
  if (attendee[0].status !== 'approved') {
    throw new Error('Only approved attendees can be checked in');
  }
  
  if (attendee[0].checkedIn) {
    throw new Error('Attendee is already checked in');
  }
  
  const result = await db.update(eventAttendees)
    .set({ 
      checkedIn: true,
      checkedInAt: new Date(),
      checkedInById: organizer.id,
      status: 'checked_in',
      updatedAt: new Date()
    })
    .where(and(
      eq(eventAttendees.id, attendeeId),
      eq(eventAttendees.eventId, eventId)
    ))
    .returning();
  return result[0];
}

export async function getUserEventStatus(eventId: string, userId: string) {
  const result = await db.select()
    .from(eventAttendees)
    .where(and(
      eq(eventAttendees.eventId, eventId),
      eq(eventAttendees.userId, userId)
    ))
    .limit(1);
  return result[0] || null;
}

export async function getEventAttendeesCount(eventId: string) {
  const result = await db.select({ count: count() })
    .from(eventAttendees)
    .where(and(
      eq(eventAttendees.eventId, eventId),
      inArray(eventAttendees.status, ['approved', 'checked_in'])
    ));
  return result[0]?.count || 0;
}

export async function getEventWaitlistCount(eventId: string) {
  const result = await db.select({ count: count() })
    .from(eventAttendees)
    .where(and(
      eq(eventAttendees.eventId, eventId),
      eq(eventAttendees.status, 'waitlisted')
    ));
  return result[0]?.count || 0;
}

// Analytics queries
export async function trackEventAnalytic(analyticData: {
  eventId: string;
  metric: string;
  value?: number;
  metadata?: any;
  userId?: string;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
}) {
  const result = await db.insert(eventAnalytics).values(analyticData).returning();
  return result[0];
}

export async function getEventAnalytics(eventId: string, metric?: string) {
  const whereConditions = [eq(eventAnalytics.eventId, eventId)];
  if (metric) {
    whereConditions.push(eq(eventAnalytics.metric, metric));
  }

  return await db.select()
    .from(eventAnalytics)
    .where(and(...whereConditions))
    .orderBy(desc(eventAnalytics.createdAt));
}

// Notification queries
export async function createNotification(notificationData: NewNotification) {
  const result = await db.insert(notifications).values(notificationData).returning();
  return result[0];
}

export async function getUserNotifications(userId: string, limit: number = 20) {
  return await db.select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function markNotificationAsRead(notificationId: string) {
  const result = await db.update(notifications)
    .set({ 
      isRead: true, 
      readAt: new Date() 
    })
    .where(eq(notifications.id, notificationId))
    .returning();
  return result[0];
}

export async function getUnreadNotificationsCount(userId: string) {
  const result = await db.select({ count: count() })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));
  return result[0]?.count || 0;
}

// User stats
export async function getUserStats(userId: string) {
  const hostedEvents = await db.select({ count: count() })
    .from(events)
    .where(eq(events.createdById, userId));

  const organizedEvents = await db.select({ count: count() })
    .from(eventOrganizers)
    .where(eq(eventOrganizers.userId, userId));

  const attendedEvents = await db.select({ count: count() })
    .from(eventAttendees)
    .where(and(
      eq(eventAttendees.userId, userId),
      inArray(eventAttendees.status, ['approved', 'checked_in'])
    ));

  const followersCount = await db.select({ count: count() })
    .from(userFollows)
    .where(eq(userFollows.followingId, userId));

  const followingCount = await db.select({ count: count() })
    .from(userFollows)
    .where(eq(userFollows.followerId, userId));

  return {
    hostedEvents: hostedEvents[0]?.count || 0,
    organizedEvents: organizedEvents[0]?.count || 0,
    attendedEvents: attendedEvents[0]?.count || 0,
    followersCount: followersCount[0]?.count || 0,
    followingCount: followingCount[0]?.count || 0
  };
}

export async function getUserProfileData(username: string) {
  // Get user by username
  const user = await getUserByUsername(username);
  if (!user) {
    return null;
  }

  // Get user stats
  const stats = await getUserStats(user.id);

  // Get user's public events (only published and public events)
  const userEvents = await db.select()
    .from(events)
    .where(and(
      eq(events.createdById, user.id),
      eq(events.status, 'published'),
      eq(events.visibility, 'public')
    ))
    .orderBy(desc(events.startDate))
    .limit(10);

  return {
    user,
    stats,
    events: userEvents
  };
}

// Event dashboard data
export async function getEventDashboardData(eventId: string) {
  const [
    eventDetails,
    totalRegistrations,
    approvedCount,
    pendingCount,
    waitlistCount,
    checkedInCount,
    recentRegistrations
  ] = await Promise.all([
    getEventWithDetails(eventId),
    getEventAttendeesCount(eventId),
    db.select({ count: count() }).from(eventAttendees).where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.status, 'approved'))),
    db.select({ count: count() }).from(eventAttendees).where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.status, 'pending'))),
    getEventWaitlistCount(eventId),
    db.select({ count: count() }).from(eventAttendees).where(and(eq(eventAttendees.eventId, eventId), eq(eventAttendees.status, 'checked_in'))),
    getEventAttendeesByStatus(eventId).then(attendees => attendees.slice(0, 10))
  ]);

  return {
    event: eventDetails,
    stats: {
      totalRegistrations,
      approved: approvedCount[0]?.count || 0,
      pending: pendingCount[0]?.count || 0,
      waitlisted: waitlistCount,
      checkedIn: checkedInCount[0]?.count || 0
    },
    recentRegistrations
  };
} 