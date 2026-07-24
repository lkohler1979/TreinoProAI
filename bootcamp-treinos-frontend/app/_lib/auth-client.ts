import { createAuthClient } from "better-auth/react";
import { anonymousClient } from "better-auth/client/plugins";
import { getApiBaseUrl } from "./api-base-url";

export const authClient = createAuthClient({
  baseURL: getApiBaseUrl(),
  plugins: [anonymousClient()],
});
