// Offline preview only: redirects api.salla.dev to the local snapshot server
// when VITE_API_URL is set, and is inert otherwise. See app/dev/offline-api.ts.
import './dev/offline-api';
import { withThemeSentry } from '@salla.sa/twilight-theme-engine/sentry/server';
import handler from '@tanstack/react-start/server-entry';

export default withThemeSentry(handler, 'optimalx');
