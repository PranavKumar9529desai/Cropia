import type { AppType } from "@repo/api";
import { hc } from "hono/client";

// to send the cookies with the request
export const apiClient = hc<AppType>(import.meta.env.VITE_BACKEND_URL, {
  init: {
    credentials: "include",
  },
});
