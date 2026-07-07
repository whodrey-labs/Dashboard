import crypto from "node:crypto";
import { config } from "./config.js";

// This file owns the Google-specific work:
// building the consent URL, exchanging OAuth codes, refreshing tokens,
// and making Calendar API requests.
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_BASE_URL = "https://www.googleapis.com/calendar/v3";
const ACCESS_TOKEN_EXPIRY_BUFFER_MS = 60_000;
const STATE_TTL_MS = 10 * 60 * 1000;

function createHttpError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

function assertGoogleConfigured() {
  if (!config.google.clientId || !config.google.clientSecret) {
    throw createHttpError(
      500,
      "Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend/.env.",
    );
  }
}

function getSafeReturnTo(returnTo) {
  const fallback = config.frontendOrigin;

  try {
    const candidate = new URL(returnTo || fallback, fallback);
    const allowedOrigin = new URL(config.frontendOrigin).origin;

    if (candidate.origin !== allowedOrigin) {
      return fallback;
    }

    return candidate.toString();
  } catch {
    return fallback;
  }
}

function signStatePayload(encodedPayload) {
  return crypto
    .createHmac("sha256", config.oauthStateSecret)
    .update(encodedPayload)
    .digest("base64url");
}

// State protects the callback from forged requests and also carries a safe
// frontend return URL after Google finishes the OAuth flow.
export function createOAuthState(returnTo) {
  const payload = {
    exp: Date.now() + STATE_TTL_MS,
    nonce: crypto.randomUUID(),
    returnTo: getSafeReturnTo(returnTo),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signature = signStatePayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifyOAuthState(state) {
  if (!state || typeof state !== "string") {
    throw createHttpError(400, "Missing OAuth state.");
  }

  const [encodedPayload, signature] = state.split(".");
  const expectedSignature = signStatePayload(encodedPayload);
  const signatureBuffer = Buffer.from(signature ?? "");
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    !signature ||
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    throw createHttpError(400, "Invalid OAuth state.");
  }

  let payload;

  try {
    payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    );
  } catch {
    throw createHttpError(400, "Invalid OAuth state.");
  }

  if (!payload.exp || payload.exp < Date.now()) {
    throw createHttpError(400, "Expired OAuth state.");
  }

  return getSafeReturnTo(payload.returnTo);
}

// Redirect target for the "Connect Google Calendar" button.
export function buildGoogleAuthUrl(returnTo) {
  assertGoogleConfigured();

  const url = new URL(GOOGLE_AUTH_URL);
  url.search = new URLSearchParams({
    access_type: "offline",
    client_id: config.google.clientId,
    include_granted_scopes: "true",
    prompt: "consent",
    redirect_uri: config.google.redirectUri,
    response_type: "code",
    scope: config.google.scopes.join(" "),
    state: createOAuthState(returnTo),
  });

  return url.toString();
}

async function parseGoogleResponse(response) {
  const text = await response.text();

  try {
    return text ? JSON.parse(text) : {};
  } catch {
  return { raw: text };
  }
}

// The backend exchanges the short-lived code so the client secret never goes
// into frontend code.
export async function exchangeCodeForTokens(code) {
  assertGoogleConfigured();

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: config.google.redirectUri,
    }),
  });
  const body = await parseGoogleResponse(response);

  if (!response.ok) {
    throw createHttpError(
      response.status,
      "Google rejected the OAuth code exchange.",
      body,
    );
  }

  return {
    accessToken: body.access_token,
    expiryDate: Date.now() + body.expires_in * 1000,
    refreshToken: body.refresh_token,
    scope: body.scope,
    tokenType: body.token_type,
  };
}

// Access tokens expire quickly. The stored refresh token lets the backend get
// fresh access tokens without asking the user to reconnect each time.
async function refreshAccessToken(refreshToken) {
  assertGoogleConfigured();

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: config.google.clientId,
      client_secret: config.google.clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  const body = await parseGoogleResponse(response);

  if (!response.ok) {
    throw createHttpError(
      response.status,
      "Google rejected the refresh token.",
      body,
    );
  }

  return {
    accessToken: body.access_token,
    expiryDate: Date.now() + body.expires_in * 1000,
    scope: body.scope,
    tokenType: body.token_type,
  };
}

export async function saveOAuthTokens(tokenStore, newTokens) {
  const existingTokens = await tokenStore.read();
  const refreshToken = newTokens.refreshToken ?? existingTokens?.refreshToken;

  if (!refreshToken) {
    throw createHttpError(
      400,
      "Google did not return a refresh token. Try disconnecting the app from your Google Account permissions, then connect again.",
    );
  }

  const tokens = {
    ...existingTokens,
    ...newTokens,
    connectedAt: existingTokens?.connectedAt ?? new Date().toISOString(),
    refreshToken,
    updatedAt: new Date().toISOString(),
  };

  await tokenStore.write(tokens);
  return tokens;
}

// Returns an access token that is safe to use for Calendar API calls.
export async function getValidAccessToken(tokenStore) {
  const tokens = await tokenStore.read();

  if (!tokens?.refreshToken) {
    throw createHttpError(401, "Google Calendar is not connected yet.");
  }

  if (
    tokens.accessToken &&
    tokens.expiryDate &&
    tokens.expiryDate > Date.now() + ACCESS_TOKEN_EXPIRY_BUFFER_MS
  ) {
    return tokens.accessToken;
  }

  const refreshedTokens = await refreshAccessToken(tokens.refreshToken);
  const mergedTokens = {
    ...tokens,
    ...refreshedTokens,
    updatedAt: new Date().toISOString(),
  };

  await tokenStore.write(mergedTokens);
  return mergedTokens.accessToken;
}

// Small wrapper around Google's Calendar REST API.
async function fetchCalendarApi(tokenStore, path, params = {}) {
  const accessToken = await getValidAccessToken(tokenStore);
  const url = new URL(`${GOOGLE_CALENDAR_BASE_URL}${path}`);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const body = await parseGoogleResponse(response);

  if (!response.ok) {
    throw createHttpError(
      response.status,
      "Google Calendar API request failed.",
      body,
    );
  }

  return body;
}

export async function listCalendars(tokenStore) {
  return fetchCalendarApi(tokenStore, "/users/me/calendarList", {
    minAccessRole: "reader",
  });
}

export async function listEvents(tokenStore, options = {}) {
  const calendarId = encodeURIComponent(options.calendarId || "primary");

  return fetchCalendarApi(tokenStore, `/calendars/${calendarId}/events`, {
    maxResults: options.maxResults ?? 20,
    orderBy: "startTime",
    singleEvents: true,
    timeMax: options.timeMax,
    timeMin: options.timeMin ?? new Date().toISOString(),
    timeZone: options.timeZone,
  });
}
