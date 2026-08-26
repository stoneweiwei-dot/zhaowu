import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';
import './styles.css';
import './intro-extra.css';
import './emblems.css';
import './client-hotfix.css';
import './visual-refresh.css';
import './stone-visual-fix.css';
import './motif-row-lock.css';
import './focused-report.css';
import './login-breathing.css';
import './palm-light-refinement.css';
import './wallpaper-visibility-fix.css';
import './green-dragon-guide.css';
import './tea-guardian.css';
import './landscape-paper.css';
import './production-visual-reset.css';
import './gallery-unification.css';
import './approved-mobile-ui-v2.css';

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing root element');
}

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
