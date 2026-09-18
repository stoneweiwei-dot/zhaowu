import handler from "../../api/mingshu-locations.js";
import { runVercelCompat } from "./_shared/vercel-compat";

export default (request: Request) => runVercelCompat(handler, request);
export const config = { path: "/api/mingshu-locations" };
