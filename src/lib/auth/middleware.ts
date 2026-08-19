import { createMiddleware } from "@tanstack/react-start";

export const authMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const userId = process.env.ZHAOWU_USER_ID?.trim();
  if (!userId) throw new Error("Unauthorized");
  return next({ context: { userId } });
});
