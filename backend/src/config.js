import dotenv from "dotenv";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
dotenv.config({ path: path.resolve(backendRoot, "..", ".env") });

// Central place for environment defaults so the route code can stay focused.
// These values are intentionally friendly for local development.
const DEFAULT_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/calendar.events.readonly",
  "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
];

function parseList(value) {
  return (value ?? "")
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const port = Number(process.env.PORT ?? 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";
const configuredScopes = parseList(process.env.GOOGLE_SCOPES);
const mongoDatabaseName = process.env.MONGODB_DB_NAME ?? "dashboard";

export const config = {
  port,
  frontendOrigin,
  allowedOrigins: parseList(process.env.CORS_ORIGINS ?? frontendOrigin),
  // Signs OAuth state values. Set this in .env so pending OAuth callbacks
  // still validate if the backend restarts during development.
  oauthStateSecret:
    process.env.OAUTH_STATE_SECRET ?? crypto.randomBytes(32).toString("hex"),
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri:
      process.env.GOOGLE_REDIRECT_URI ??
      `http://localhost:${port}/auth/google/callback`,
    // Keep these scopes narrow. Add write scopes later only when the app
    // actually needs to create or edit calendar events.
    scopes: configuredScopes.length ? configuredScopes : DEFAULT_SCOPES,
  },
  mongo: {
    uri:
      process.env.MONGODB_URI ??
      `mongodb://127.0.0.1:27017/${mongoDatabaseName}`,
    databaseName: mongoDatabaseName,
    googleConnectionsCollection:
      process.env.MONGODB_GOOGLE_CONNECTIONS_COLLECTION ??
      "google_connections",
  },
};
