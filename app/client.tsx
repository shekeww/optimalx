// Offline preview only: redirects api.salla.dev to the local snapshot server
// when VITE_API_URL is set, and is inert otherwise. See app/dev/offline-api.ts.
import './dev/offline-api';
import { StrictMode, startTransition } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { StartClient } from '@tanstack/react-start/client';
import { initThemeSentry } from '@salla.sa/twilight-theme-engine/sentry/client';

initThemeSentry('optimalx');

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>
  );
});
