import { DrizzleAdapter } from '@auth/drizzle-adapter';
import bcrypt from 'bcryptjs';
import { type DefaultSession, type NextAuthConfig } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import { env } from '@/env.js';
import { db } from '@/server/db';
import { accounts, sessions, users, verificationTokens } from '@/server/db/schema';
import { eq } from 'drizzle-orm';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      organizationId: string | null;
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    organizationId: string | null;
    role: string;
  }
}

// Note: JWT type augmentation has version conflicts, using any for now

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const config: NextAuthConfig = {
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        (token as any).organizationId = user.organizationId;
        (token as any).role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string;
        session.user.organizationId = (token as any).organizationId;
        session.user.role = (token as any).role;
      }
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const { email, password } = loginSchema.parse(credentials);

          const user = await db.query.users.findFirst({
            where: eq(users.email, email),
            with: {
              organization: true,
            },
          });

          // Debug logging
          console.log('Auth attempt for:', email);
          console.log('User found:', !!user);
          if (user) {
            console.log('User has hashedPassword:', !!user.hashedPassword);
            console.log('User keys:', Object.keys(user));
          }

          if (!user || !user.hashedPassword) {
            console.log('Auth failed: no user or password');
            return null;
          }

          const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
          console.log('Password match:', passwordMatch);
          
          if (!passwordMatch) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            organizationId: user.organizationId,
            role: user.role ?? 'member',
          };
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);