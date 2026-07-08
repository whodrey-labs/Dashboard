# Dashboard Backend

Small Express API for connecting a Google account and reading Google Calendar data.

## What Was Added

- `server.js`: Express app, routes, CORS, and error handling.
- `src/googleOAuth.js`: Google OAuth flow, token refresh, and Calendar API calls.
- `src/tokenStore.js`: MongoDB storage for the Google connection and tokens.
- `src/config.js`: `.env` loading and default configuration.
- Root `.env`: the environment variables you need to fill in.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Fill in the Google OAuth values in the root `.env`.

3. In Google Cloud, add this authorized redirect URI to your Web OAuth client:

   ```txt
   http://localhost:3000/auth/google/callback
   ```

4. Start the backend:

   ```sh
   npm run dev
   ```

## Useful URLs

- Health check: `GET http://localhost:3000/health`
- Start Google connect flow: `GET http://localhost:3000/auth/google`
- Calendar connection status: `GET http://localhost:3000/api/google/status`
- List calendars: `GET http://localhost:3000/api/calendar/calendars`
- List upcoming events: `GET http://localhost:3000/api/calendar/events`

## Storage

The backend stores the Google connection, refresh token, and granted scopes in MongoDB.
