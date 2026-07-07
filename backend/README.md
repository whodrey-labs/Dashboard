# Dashboard Backend

Small Express API for connecting a Google account and reading Google Calendar data.

## What Was Added

- `server.js`: Express app, routes, CORS, and error handling.
- `src/googleOAuth.js`: Google OAuth flow, token refresh, and Calendar API calls.
- `src/tokenStore.js`: local development storage for Google tokens.
- `src/config.js`: `.env` loading and default configuration.
- `.env.example`: the environment variables you need to fill in.

## Setup

1. Install dependencies:

   ```sh
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Google OAuth client values.

3. In Google Cloud, add this authorized redirect URI to your Web OAuth client:

   ```txt
   http://localhost:4000/auth/google/callback
   ```

4. Start the backend:

   ```sh
   npm run dev
   ```

## Useful URLs

- Health check: `GET http://localhost:4000/health`
- Start Google connect flow: `GET http://localhost:4000/auth/google`
- Calendar connection status: `GET http://localhost:4000/api/google/status`
- List calendars: `GET http://localhost:4000/api/calendar/calendars`
- List upcoming events: `GET http://localhost:4000/api/calendar/events`

## Development Note

This starter stores the Google refresh token in a local `.tokens` file so you can test with your own account quickly. For a real multi-user app, move token storage to your database and associate tokens with your app's user records.
