import { clearSessionCookie, destroySession, json } from "../_lib/auth.js";

export async function onRequestPost(context) {
  try {
    await destroySession(context.request, context.env);
  } catch (error) {
    console.error("Logout error", error);
  }
  return json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie() } });
}
