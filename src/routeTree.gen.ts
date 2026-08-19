/* eslint-disable */
// This file is intentionally checked in so the repo can build on Vercel before a router generator is added.
import { Route as rootRoute } from './routes/__root';
import { Route as IndexRouteImport } from './routes/index';

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any);

export const routeTree = rootRoute.addChildren({
  IndexRoute,
} as any);
