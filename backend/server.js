import cors from "cors";
import express from "express";
import { config } from "./src/config.js";
import {
  buildGoogleAuthUrl,
  exchangeCodeForTokens,
  listCalendars,
  listEvents,
  saveOAuthTokens,
  verifyOAuthState,
} from "./src/googleOAuth.js";
import { TokenStore } from "./src/tokenStore.js";

// Express entry point for the backend API.
// The frontend can call these routes once it needs Google Calendar data.
const app = express();
const tokenStore = new TokenStore(config.google.tokenFile);

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || config.allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin is not allowed by CORS: ${origin}`));
    },
  }),
);
app.use(express.json());

// Basic health route for Docker, uptime checks, or quick local verification.
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "dashboard-backend",
  });
});

// Starts the Google OAuth flow. Link your "Connect Google Calendar" button here.
app.get("/auth/google", (req, res, next) => {
  try {
    res.redirect(buildGoogleAuthUrl(req.query.returnTo));
  } catch (error) {
    next(error);
  }
});

// Google redirects back here with a short-lived code. The backend exchanges it
// for tokens and stores them locally for development.
app.get("/auth/google/callback", async (req, res, next) => {
  try {
    if (req.query.error) {
      throw Object.assign(new Error(String(req.query.error)), { status: 400 });
    }

    if (!req.query.code || typeof req.query.code !== "string") {
      throw Object.assign(new Error("Missing Google OAuth code."), {
        status: 400,
      });
    }

    const returnTo = verifyOAuthState(req.query.state);
    const tokens = await exchangeCodeForTokens(req.query.code);
    await saveOAuthTokens(tokenStore, tokens);

    const redirectUrl = new URL(returnTo);
    redirectUrl.searchParams.set("googleCalendar", "connected");
    res.redirect(redirectUrl.toString());
  } catch (error) {
    next(error);
  }
});

// Lets the frontend know whether a Google Calendar account is connected.
app.get("/api/google/status", async (req, res, next) => {
  try {
    const tokens = await tokenStore.read();

    res.json({
      connected: Boolean(tokens?.refreshToken),
      scopes: tokens?.scope?.split(" ") ?? [],
      updatedAt: tokens?.updatedAt ?? null,
    });
  } catch (error) {
    next(error);
  }
});

// Development convenience route for removing the local Google token.
app.post("/api/google/disconnect", async (req, res, next) => {
  try {
    await tokenStore.clear();
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

// Returns calendars visible to the connected Google account.
app.get("/api/calendar/calendars", async (req, res, next) => {
  try {
    res.json(await listCalendars(tokenStore));
  } catch (error) {
    next(error);
  }
});

// Returns upcoming events from the primary calendar by default.
app.get("/api/calendar/events", async (req, res, next) => {
  try {
    res.json(
      await listEvents(tokenStore, {
        calendarId: req.query.calendarId,
        maxResults: req.query.maxResults,
        timeMax: req.query.timeMax,
        timeMin: req.query.timeMin,
        timeZone: req.query.timeZone,
      }),
    );
  } catch (error) {
    next(error);
  }
});

// Consistent JSON errors for the frontend.
app.use((error, req, res, next) => {
  const status = error.status || 500;

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    error: error.message || "Unexpected server error.",
    details: process.env.NODE_ENV === "development" ? error.details : undefined,
  });
});

app.listen(config.port, () => {
  console.log(`Dashboard backend listening on http://localhost:${config.port}`);
});

export { app };
