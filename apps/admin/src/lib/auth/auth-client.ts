import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import type { auth } from "@repo/api/auth";

// type ErrorTypes = Partial<
//   Record<
//     keyof typeof authClient.$ERROR_CODES,
//     {
//       en: string;
//       es: string;
//     }
//   >
// >;

// const errorCodes = {
//   USER_ALREADY_EXISTS: {
//     en: "user already registered",
//     es: "usuario ya registrada",
//   },
// } satisfies ErrorTypes;

// const getErrorMessage = (code: string, lang: "en" | "es") => {
//   if (code in errorCodes) {
//     return errorCodes[code as keyof typeof errorCodes][lang];
//   }
//   return "";
// };

console.log("VITE_BACKEND_URL", import.meta.env.VITE_BACKEND_URL);
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL ?? "http://localhost:4000",

  plugins: [organizationClient(), inferAdditionalFields<typeof auth>()],
  advanced: {
    cookiePrefix: "cropia-admin",
  },
});
