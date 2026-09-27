import { hashPassword, json, normalizeEmail, validatePassword } from "./auth.js";

export function requireAdmin(context) {
  if (context.data.user?.role !== "admin") return json({ error: "Sem permissão." }, { status: 403 });
  return null;
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function createUser(env, body) {
  const email = normalizeEmail(body?.email);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const password = body?.password;
  const role = body?.role === "admin" ? "admin" : body?.role === "user" ? "user" : null;
  if (!email || !name || name.length > 120 || !role || !validatePassword(password)) {
    return { error: "Confira nome, e-mail, senha (mínimo de 12 caracteres) e perfil." };
  }
  try {
    await env.DB.prepare(
      "INSERT INTO users (name, email, password_hash, role, active) VALUES (?, ?, ?, ?, 1)",
    ).bind(name, email, await hashPassword(password), role).run();
    return { ok: true };
  } catch (error) {
    if (String(error).includes("UNIQUE")) return { error: "Não foi possível criar este usuário." };
    throw error;
  }
}
