const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const SESSION_COOKIE = "__Host-new_order_session";
const PASSWORD_ITERATIONS = 100000;
const PASSWORD_BYTES = 32;
const SESSION_BYTES = 32;

function base64url(bytes) {
  let value = "";
  for (const byte of bytes) value += String.fromCharCode(byte);
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64url(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  try {
    return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  } catch {
    return null;
  }
}

function equalBytes(left, right) {
  if (!(left instanceof Uint8Array) || !(right instanceof Uint8Array)) return false;
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

async function pbkdf2(password, salt, iterations = PASSWORD_ITERATIONS) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-512", salt, iterations },
    key,
    PASSWORD_BYTES * 8,
  );
  return new Uint8Array(bits);
}

async function hmac(secret, message) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(message)));
}

async function sha256(value) {
  return base64url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}

function sessionTtl(env) {
  const configured = Number.parseInt(env.SESSION_TTL_SECONDS ?? "", 10);
  if (!Number.isFinite(configured)) return 8 * 60 * 60;
  return Math.min(Math.max(configured, 15 * 60), 30 * 24 * 60 * 60);
}

function sessionSecret(env) {
  if (typeof env.SESSION_SECRET !== "string" || env.SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET is not configured");
  }
  return env.SESSION_SECRET;
}

function cookieValue(request, name) {
  const cookies = request.headers.get("Cookie") ?? "";
  for (const item of cookies.split(";")) {
    const [key, ...parts] = item.trim().split("=");
    if (key === name) return parts.join("=");
  }
  return null;
}

export function normalizeEmail(value) {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

export function validatePassword(value) {
  return typeof value === "string" && value.length >= 12 && value.length <= 512;
}

export async function hashPassword(password) {
  if (!validatePassword(password)) throw new Error("Password does not meet the minimum requirements");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await pbkdf2(password, salt);
  return `pbkdf2_sha512$${PASSWORD_ITERATIONS}$${base64url(salt)}$${base64url(derived)}`;
}

export async function verifyPassword(password, stored) {
  if (typeof password !== "string" || typeof stored !== "string") return false;
  const [algorithm, iterationValue, saltValue, hashValue] = stored.split("$");
  const iterations = Number.parseInt(iterationValue, 10);
  const salt = fromBase64url(saltValue ?? "");
  const expected = fromBase64url(hashValue ?? "");
  if (algorithm !== "pbkdf2_sha512" || !Number.isInteger(iterations) || iterations < 100000 || !salt || !expected) return false;
  const actual = await pbkdf2(password, salt, iterations);
  return equalBytes(actual, expected);
}

function serializeCookie(value, maxAge) {
  return `${SESSION_COOKIE}=${value}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSessionCookie() {
  return serializeCookie("", 0);
}

export async function createSession(env, userId) {
  const secret = sessionSecret(env);
  const sessionId = base64url(crypto.getRandomValues(new Uint8Array(SESSION_BYTES)));
  const signature = base64url(await hmac(secret, sessionId));
  const expiresAt = Math.floor(Date.now() / 1000) + sessionTtl(env);
  await env.DB.prepare(
    "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
  ).bind(await sha256(sessionId), userId, expiresAt).run();
  return { cookie: serializeCookie(`${sessionId}.${signature}`, sessionTtl(env)), expiresAt };
}

export async function getAuthenticatedUser(request, env) {
  const token = cookieValue(request, SESSION_COOKIE);
  if (!token) return null;
  const [sessionId, signature, ...rest] = token.split(".");
  if (!sessionId || !signature || rest.length || !fromBase64url(sessionId) || !fromBase64url(signature)) return null;

  const expectedSignature = base64url(await hmac(sessionSecret(env), sessionId));
  const actualBytes = fromBase64url(signature);
  const expectedBytes = fromBase64url(expectedSignature);
  if (!actualBytes || !expectedBytes || !equalBytes(actualBytes, expectedBytes)) return null;

  const now = Math.floor(Date.now() / 1000);
  return env.DB.prepare(`
    SELECT u.id, u.name, u.email, u.role
    FROM sessions AS s
    INNER JOIN users AS u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1
  `).bind(await sha256(sessionId), now).first();
}

export async function destroySession(request, env) {
  const token = cookieValue(request, SESSION_COOKIE);
  const sessionId = token?.split(".")[0];
  if (sessionId && fromBase64url(sessionId)) {
    await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(sessionId)).run();
  }
}

async function loginAttemptKey(request, env, email) {
  const ip = request.headers.get("CF-Connecting-IP") ?? "local";
  return base64url(await hmac(sessionSecret(env), `login-attempt:${ip}:${email}`));
}

export async function loginIsRateLimited(request, env, email) {
  const key = await loginAttemptKey(request, env, email);
  const now = Math.floor(Date.now() / 1000);
  const record = await env.DB.prepare(
    "SELECT locked_until FROM login_attempts WHERE attempt_key = ?",
  ).bind(key).first();
  return Number(record?.locked_until ?? 0) > now;
}

export async function recordLoginFailure(request, env, email) {
  const key = await loginAttemptKey(request, env, email);
  const now = Math.floor(Date.now() / 1000);
  const record = await env.DB.prepare(
    "SELECT attempts, window_started_at FROM login_attempts WHERE attempt_key = ?",
  ).bind(key).first();
  const windowStartedAt = Number(record?.window_started_at ?? 0);
  const attempts = windowStartedAt > now - 15 * 60 ? Number(record?.attempts ?? 0) + 1 : 1;
  const lockedUntil = attempts >= 5 ? now + 15 * 60 : null;
  await env.DB.prepare(`
    INSERT INTO login_attempts (attempt_key, attempts, window_started_at, locked_until)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(attempt_key) DO UPDATE SET
      attempts = excluded.attempts,
      window_started_at = excluded.window_started_at,
      locked_until = excluded.locked_until
  `).bind(key, attempts, now, lockedUntil).run();
}

export async function clearLoginFailures(request, env, email) {
  await env.DB.prepare("DELETE FROM login_attempts WHERE attempt_key = ?")
    .bind(await loginAttemptKey(request, env, email)).run();
}

export function json(data, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { ...init, headers });
}
