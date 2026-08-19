import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { SiteShell } from "@/components/site-shell";

export const Route = createRootRoute({
  component: () => (
    <AuthProvider>
      <SiteShell>
        <Outlet />
      </SiteShell>
    </AuthProvider>
  ),
});
