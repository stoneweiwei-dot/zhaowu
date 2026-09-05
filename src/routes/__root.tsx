import { createRootRoute, Outlet } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { IntroGate } from "@/components/intro-gate";
import { SiteShell } from "@/components/site-shell";
import { OwnerBackgroundMusicManager } from "@/components/owner-background-music-manager";

export const Route = createRootRoute({
  component: () => (
    <>
      <PreviewHostBridge />
      <AuthProvider>
        <IntroGate />
        <SiteShell>
          <Outlet />
        </SiteShell>
        <OwnerBackgroundMusicManager />
      </AuthProvider>
    </>
  ),
});
