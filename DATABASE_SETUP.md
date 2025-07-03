# Database Setup with Neon and Drizzle

This project uses [Neon](https://neon.tech) as the PostgreSQL database and [Drizzle ORM](https://orm.drizzle.team) for database operations.

## Schema Overview

The database includes comprehensive tables for a full-featured event hosting platform similar to Luma:

### Core Tables
- **Users** - Enhanced user profiles with social media, professional details, and privacy settings
- **Events** - Comprehensive event management with status tracking, ticketing, and analytics
- **Event Organizers** - Multi-organizer support with role-based permissions
- **Event Attendees** - Advanced attendee management with approval workflows and waitlists
- **Event Categories** - Flexible categorization system
- **Event Questions** - Custom registration questions
- **Event Updates** - Event announcements and updates
- **Event Analytics** - Detailed tracking and metrics
- **Notifications** - User notification system
- **User Follows** - Social following system
- **Event Reviews** - Post-event feedback and ratings

### Authentication Tables (NextAuth.js)
- **accounts** - OAuth provider accounts
- **sessions** - User session management  
- **verification_tokens** - Email verification tokens

## Quick Setup

1. **Create a Neon Database**:
   - Sign up at [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Set Environment Variables**:
   ```bash
   # Copy the example file and add your database URL
   DATABASE_URL="postgresql://username:password@hostname/database?sslmode=require"
   ```

3. **Push Schema to Database**:
   ```bash
   npm run db:push
   ```

4. **Optional - Generate and Run Migrations**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

## Available Scripts

```bash
# Push schema changes directly to database (development)
npm run db:push

# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (database browser)
npm run db:studio
```

## Schema Features

### User Management
- **Comprehensive Profiles**: Social media handles, professional info, timezone settings
- **Privacy Controls**: Public/private profiles, messaging preferences, event visibility
- **Role-Based Access**: User, admin, moderator roles with permissions
- **Social Features**: Following system and user interactions

### Event Management
- **Event Lifecycle**: Draft → Published → Completed with full status tracking
- **Multi-Format Support**: In-person, virtual, and hybrid events
- **Advanced Location**: GPS coordinates, structured address fields, virtual platform integration
- **Flexible Capacity**: Unlimited or capped attendance with waitlist support
- **Approval Workflows**: Automatic approval or manual review processes

### Attendee Management
- **Registration Status**: Pending → Approved → Checked-in with waitlist support
- **Guest Registration**: Support for non-registered users with detailed guest info
- **Custom Questions**: Configurable registration forms with various question types
- **VIP Management**: Special attendee designation and handling
- **Check-in System**: Digital check-in with staff tracking

### Organizer Collaboration
- **Multi-Organizer Events**: Host, co-host, moderator, and speaker roles
- **Permission System**: Granular permissions for different organizer roles
- **Custom Display**: Personalized bio and display name per event
- **Visibility Control**: Show/hide organizers on event pages

### Analytics & Insights
- **Event Metrics**: Views, shares, registrations, check-ins
- **User Tracking**: Session tracking, referral sources, UTM parameters
- **Custom Analytics**: Flexible metadata for custom tracking needs
- **Dashboard Data**: Comprehensive event dashboard with real-time stats

### Communication Features
- **Notification System**: Email and in-app notifications with type categorization
- **Event Updates**: Announcements with optional email distribution
- **Reminder System**: Configurable email and SMS reminders
- **Custom Templates**: Personalized email templates and confirmation messages

### Review & Feedback
- **Post-Event Reviews**: 5-star rating system with written feedback
- **Verified Attendees**: Reviews from confirmed attendees
- **Public/Private Reviews**: Organizer and public review visibility

## Environment Variables

```bash
# Database
DATABASE_URL="your_neon_connection_string"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# OAuth Providers
GOOGLE_ID="your_google_oauth_client_id"
GOOGLE_SECRET="your_google_oauth_client_secret"
GITHUB_ID="your_github_oauth_client_id"
GITHUB_SECRET="your_github_oauth_client_secret"
```

## Production Deployment

For production deployments:

1. **Use Migrations Instead of Push**:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

2. **Set Production Environment Variables** in your hosting platform

3. **Run Migrations** as part of your deployment process

## Query Functions

The `lib/db/queries.ts` file contains extensive pre-built query functions:

### Event Management
```typescript
import { 
  createEvent, 
  getEventWithDetails, 
  publishEvent,
  getEventDashboardData 
} from '@/lib/db/queries';

// Create and publish an event
const event = await createEvent({
  title: 'My Event',
  description: 'Event description',
  startDate: new Date(),
  endDate: new Date(),
  createdById: user.id
});

await publishEvent(event.id, user.id);

// Get comprehensive event dashboard data
const dashboardData = await getEventDashboardData(event.id);
```

### Attendee Management
```typescript
import { 
  registerForEvent, 
  approveAttendee, 
  moveToWaitlist,
  getApprovedAttendees,
  getPendingAttendees 
} from '@/lib/db/queries';

// Register for event
await registerForEvent({
  eventId: event.id,
  userId: user.id,
  status: 'pending'
});

// Approve attendee
await approveAttendee(event.id, attendeeId, organizerId);

// Get attendees by status
const approved = await getApprovedAttendees(event.id);
const pending = await getPendingAttendees(event.id);
```

### Analytics & Notifications
```typescript
import { 
  trackEventAnalytic, 
  createNotification,
  getUserStats 
} from '@/lib/db/queries';

// Track event view
await trackEventAnalytic({
  eventId: event.id,
  metric: 'page_view',
  userId: user.id,
  metadata: { source: 'web' }
});

// Send notification
await createNotification({
  userId: user.id,
  type: 'registration_approved',
  title: 'Registration Approved',
  message: 'Your registration has been approved!',
  eventId: event.id
});
```

This schema provides enterprise-grade event management capabilities with comprehensive attendee tracking, organizer collaboration, and analytics - matching the functionality of platforms like Luma. 