import type { AppType } from "@repo/api";
import { hc } from "hono/client";

// to send the cookies with the request
export const apiClient = hc<AppType>("http://localhost:4000/", {
  init: {
    credentials: "include",
  },
});
