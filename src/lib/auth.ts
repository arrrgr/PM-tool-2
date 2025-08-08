import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/server/db';
import { users, organizations } from '@/server/db/schema';

export async function createUser({
  email,
  password,
  name,
  organizationName,
}: {
  email: string;
  password: string;
  name: string;
  organizationName?: string;
}) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existingUser) {
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  let organizationId: string | null = null;

  if (organizationName) {
    const orgSlug = organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const organizationData = {
      id: randomUUID(),
      name: organizationName,
      slug: orgSlug,
      settings: {
        defaultTaskStatuses: ['To Do', 'In Progress', 'In Review', 'Done'],
        defaultPriorities: ['Low', 'Medium', 'High'],
        features: {
          knowledgeBase: true,
          timeTracking: true,
          reporting: true,
        },
      },
    };

    const [organization] = await db.insert(organizations).values(organizationData).returning();
    organizationId = organization!.id;
  }

  const userData = {
    id: randomUUID(),
    email,
    name,
    hashedPassword,
    organizationId,
    role: organizationId ? 'admin' : 'member',
  };

  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

export async function validatePassword(password: string): Promise<boolean> {
  return password.length >= 6;
}

export function generateProjectKey(projectName: string): string {
  return projectName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 5);
}