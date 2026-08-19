/* eslint-disable */
import { Route as rootRoute } from "./routes/__root";
import { Route as IndexRouteImport } from "./routes/index";
import { Route as LoginRouteImport } from "./routes/login";
import { Route as AccountRouteImport } from "./routes/account";
import { Route as AdminRouteImport } from "./routes/admin";

const IndexRoute = IndexRouteImport.update({ id: "/", path: "/", getParentRoute: () => rootRoute } as any);
const LoginRoute = LoginRouteImport.update({ id: "/login", path: "/login", getParentRoute: () => rootRoute } as any);
const AccountRoute = AccountRouteImport.update({ id: "/account", path: "/account", getParentRoute: () => rootRoute } as any);
const AdminRoute = AdminRouteImport.update({ id: "/admin", path: "/admin", getParentRoute: () => rootRoute } as any);

export const routeTree = rootRoute.addChildren({ IndexRoute, LoginRoute, AccountRoute, AdminRoute } as any);
