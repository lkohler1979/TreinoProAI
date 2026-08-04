import { randomInt } from "node:crypto";

const PASSWORD_CHARSET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export const generateRandomPassword = (length = 12): string => {
  return Array.from(
    { length },
    () => PASSWORD_CHARSET[randomInt(PASSWORD_CHARSET.length)],
  ).join("");
};
