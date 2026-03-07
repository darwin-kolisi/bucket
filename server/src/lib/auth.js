import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import prismaPkg from "@prisma/client";
const { PrismaClient } = prismaPkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
const trustedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const authBaseURL = process.env.BETTER_AUTH_URL || 'http://localhost:4000';
const useSecureCrossSiteCookies = authBaseURL.startsWith('https://');

export const auth = betterAuth({
  baseURL: authBaseURL,
  trustedOrigins:
    trustedOrigins.length > 0 ? trustedOrigins : ['http://localhost:3000'],
  advanced: useSecureCrossSiteCookies
    ? {
        useSecureCookies: true,
        defaultCookieAttributes: {
          sameSite: 'none',
          secure: true,
        },
      }
    : undefined,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      beforeCreate: async (data) => {
        if (!data?.email) {
          return false;
        }
        const invite = await prisma.invite.findUnique({
          where: { email: data.email },
        });
        if (!invite) {
          return false;
        }
        return data;
      },
      afterCreate: async (user) => {
        const workspaceName = user?.name
          ? `${user.name.split(' ')[0] || 'Personal'} Workspace`
          : 'Personal Workspace';
        await prisma.workspace.create({
          data: {
            name: workspaceName,
            ownerId: user.id,
            members: {
              create: {
                userId: user.id,
                role: 'owner',
              },
            },
          },
        });
        await prisma.invite.deleteMany({
          where: { email: user.email },
        });
        return user;
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      disableImplicitSignUp: true,
    },
  },
});
