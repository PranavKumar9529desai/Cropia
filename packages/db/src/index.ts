// packages/database/src/index.ts
import { prisma } from "./client";
export * from "@prisma/client"; // Export types
export * from "./client"; // Export the singleton instance
export default prisma;
