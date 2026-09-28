import {
  clearLoginFailures,
  createSession,
  json,
  loginIsRateLimited,
  normalizeEmail,
  recordLoginFailure,
  verifyPassword,
} from "../_lib/auth.js";

// Equaliza o custo de uma senha inválida quando o e-mail não existe, sem guardar
// nenhuma credencial de usuário no código.
const DUMMY_PASSWORD_HASH = "pbkdf2_sha512$210000$SUJsToH_B_y8ocM6MUwkaA$vuy93ivsVphl4A3mBWxNDmLF2Oi4sApdN5Grmr5MCtI";

export async function onRequestPost(context) {
  let body;
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }
  const email = normalizeEmail(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || password.length > 512) return json({ error: "E-mail ou senha inválidos." }, { status: 401 });

  try {
    if (await loginIsRateLimited(context.request, context.env, email)) {
      return json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429, headers: { "Retry-After": "900" } });
    }
    const user = await context.env.DB.prepare(
      "SELECT id, password_hash FROM users WHERE email = ? AND active = 1",
    ).bind(email).first();
    const passwordIsValid = await verifyPassword(password, user?.password_hash ?? DUMMY_PASSWORD_HASH);
    if (!user || !passwordIsValid) {
      await recordLoginFailure(context.request, context.env, email);
      return json({ error: "E-mail ou senha inválidos." }, { status: 401 });
    }
    await clearLoginFailures(context.request, context.env, email);
    const session = await createSession(context.env, user.id);
    return json({ ok: true }, { headers: { "Set-Cookie": session.cookie } });
  } catch (error) {
    console.error("Login error", error);
    const message = error instanceof Error ? error.message : "unknown";
    const diagnostic = message.includes("SESSION_SECRET")
      ? "session-secret"
      : message.includes("D1") || message.includes("SQLITE") || message.includes("prepare") || message.includes("first") || message.includes("run")
        ? "database-binding"
        : message.includes("crypto") || message.includes("Crypto") || message.includes("PBKDF2") || message.includes("derive")
          ? "cryptography"
          : "runtime";
    return json({ error: "Não foi possível entrar agora." }, {
      status: 503,
      headers: { "X-Auth-Diagnostic": diagnostic },
    });
  }
}
