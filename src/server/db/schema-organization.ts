import { 
  pgTableCreator,
  text, 
  timestamp, 
  uuid, 
  varchar, 
  integer,
  jsonb,
  boolean,
  primaryKey
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Create table function
const createTable = pgTableCreator((name) => `pmtool_${name}`);

// Organization Invitations
export const organizationInvitations = createTable('organization_invitation', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  organizationId: varchar('organization_id', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull().default('member'),
  invitedBy: varchar('invited_by', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  status: varchar('status', { length: 50 }).default('pending'), // pending, accepted, expired, cancelled
  expiresAt: timestamp('expires_at').notNull(),
  acceptedAt: timestamp('accepted_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Teams/Departments within Organizations
export const teams = createTable('team', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  organizationId: varchar('organization_id', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  parentTeamId: varchar('parent_team_id', { length: 255 }),
  leaderId: varchar('leader_id', { length: 255 }),
  settings: jsonb('settings').$type<{
    permissions?: string[];
    workingHours?: {
      timezone: string;
      schedule: Record<string, { start: string; end: string }>;
    };
  }>(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Team Members (many-to-many relationship)
export const teamMembers = createTable('team_member', {
  teamId: varchar('team_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('member'),
  joinedAt: timestamp('joined_at').defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.teamId, table.userId] }),
}));

// Organization Billing
export const organizationBilling = createTable('organization_billing', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  organizationId: varchar('organization_id', { length: 255 })
    .notNull()
    .unique(),
  customerId: varchar('customer_id', { length: 255 }), // Stripe/payment provider customer ID
  subscriptionId: varchar('subscription_id', { length: 255 }),
  plan: varchar('plan', { length: 50 }).default('free'),
  status: varchar('status', { length: 50 }).default('active'),
  currentPeriodStart: timestamp('current_period_start'),
  currentPeriodEnd: timestamp('current_period_end'),
  cancelAt: timestamp('cancel_at'),
  canceledAt: timestamp('canceled_at'),
  trialEndsAt: timestamp('trial_ends_at'),
  
  // Usage tracking
  monthlyActiveUsers: integer('monthly_active_users').default(0),
  storageUsedMb: integer('storage_used_mb').default(0),
  apiCallsCount: integer('api_calls_count').default(0),
  
  // Billing details
  billingEmail: varchar('billing_email', { length: 255 }),
  billingAddress: jsonb('billing_address').$type<{
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }>(),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Organization Activity Log
export const organizationActivityLog = createTable('organization_activity_log', {
  id: varchar('id', { length: 255 }).notNull().primaryKey(),
  organizationId: varchar('organization_id', { length: 255 }).notNull(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: varchar('entity_id', { length: 255 }),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});