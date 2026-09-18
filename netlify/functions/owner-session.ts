import handler from "../../api/owner-session.js";
import { runVercelCompat } from "./_shared/vercel-compat";

export default (request: Request) => runVercelCompat(handler, request);
export const config = { path: "/api/owner-session" };
