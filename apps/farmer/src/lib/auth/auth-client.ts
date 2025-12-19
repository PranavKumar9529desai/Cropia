import { createAuthClient } from "better-auth/react";

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

import { organizationClient } from "better-auth/client/plugins";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

if (!backendUrl && import.meta.env.PROD) {
  throw new Error("Missing VITE_BACKEND_URL in production environment");
}

export const authClient = createAuthClient({
  baseURL: backendUrl ?? "http://localhost:4000",

  plugins: [organizationClient()],
});
