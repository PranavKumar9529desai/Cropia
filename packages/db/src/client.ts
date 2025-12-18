// packages/database/src/client.ts
import { PrismaClient } from "@prisma/client";

// 1. Create the base client
const basePrisma = new PrismaClient();

// 2. Define the extension to fix Better Auth stringification for MongoDB
export const prisma = basePrisma.$extends({
  query: {
    invitation: {
      async create({ args, query }) {
        // If Better Auth stringified the jurisdiction object, parse it back
        if (
          args.data.jurisdiction &&
          typeof args.data.jurisdiction === "string"
        ) {
          try {
            args.data.jurisdiction = JSON.parse(args.data.jurisdiction);
          } catch (e) {
            // Silently fail if it's already an object or invalid JSON
          }
        }
        return query(args);
      },
    },
    member: {
      async create({ args, query }) {
        if (
          args.data.jurisdiction &&
          typeof args.data.jurisdiction === "string"
        ) {
          try {
            args.data.jurisdiction = JSON.parse(args.data.jurisdiction);
          } catch (e) {}
        }
        return query(args);
      },
    },
    session: {
      async create({ args, query }) {
        if (
          args.data.jurisdiction &&
          typeof args.data.jurisdiction === "string"
        ) {
          try {
            args.data.jurisdiction = JSON.parse(args.data.jurisdiction);
          } catch (e) {}
        }
        return query(args);
      },
    },
  },
});

// 3. Keep your singleton pattern for the extended client
const globalForPrisma = globalThis as unknown as { prisma: typeof prisma };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
