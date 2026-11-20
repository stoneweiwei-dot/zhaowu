import handler from "../../api/zhaowu-doctor.js";
import { runVercelCompat } from "./_shared/vercel-compat";

export default (request: Request) => runVercelCompat(handler, request);
export const config = { path: "/api/zhaowu-doctor" };
