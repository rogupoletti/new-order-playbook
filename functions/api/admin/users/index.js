import { createUser, readJson, requireAdmin } from "../../../_lib/admin.js";
import { json } from "../../../_lib/auth.js";

export async function onRequestGet(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;
  const result = await context.env.DB.prepare(
    "SELECT id, name, email, role, active, created_at, updated_at FROM users ORDER BY name COLLATE NOCASE",
  ).all();
  return json({ users: result.results });
}

export async function onRequestPost(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;
  const body = await readJson(context.request);
  if (!body) return json({ error: "Dados inválidos." }, { status: 400 });
  try {
    const result = await createUser(context.env, body);
    return result.error ? json(result, { status: 400 }) : json(result, { status: 201 });
  } catch (error) {
    console.error("Admin user creation error", error);
    return json({ error: "Não foi possível salvar o usuário." }, { status: 500 });
  }
}
