import handler from "../../api/owner-data.js";
import { runVercelCompat } from "./_shared/vercel-compat";

export default (request: Request) => runVercelCompat(handler, request);

export const config = { path: "/api/owner-data" };
