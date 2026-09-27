import { readJson, requireAdmin } from "../../../_lib/admin.js";
import { hashPassword, json, validatePassword } from "../../../_lib/auth.js";

export async function onRequestPut(context) {
  const denied = requireAdmin(context);
  if (denied) return denied;
  const id = Number.parseInt(context.params.id, 10);
  const body = await readJson(context.request);
  if (!Number.isInteger(id) || id < 1 || !body) return json({ error: "Dados inválidos." }, { status: 400 });

  const target = await context.env.DB.prepare("SELECT id, role FROM users WHERE id = ?").bind(id).first();
  if (!target) return json({ error: "Usuário não encontrado." }, { status: 404 });
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const role = body.role === "admin" || body.role === "user" ? body.role : null;
  const active = body.active === true || body.active === 1 ? 1 : body.active === false || body.active === 0 ? 0 : null;
  if (!name || name.length > 120 || !role || active === null) return json({ error: "Dados inválidos." }, { status: 400 });
  if (id === context.data.user.id && (role !== "admin" || active !== 1)) {
    return json({ error: "Você não pode remover seu próprio acesso administrativo." }, { status: 400 });
  }

  try {
    if (body.password !== undefined) {
      if (!validatePassword(body.password)) return json({ error: "A nova senha deve ter ao menos 12 caracteres." }, { status: 400 });
      await context.env.DB.prepare(
        "UPDATE users SET name = ?, role = ?, active = ?, password_hash = ? WHERE id = ?",
      ).bind(name, role, active, await hashPassword(body.password), id).run();
      await context.env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(id).run();
    } else {
      await context.env.DB.prepare("UPDATE users SET name = ?, role = ?, active = ? WHERE id = ?")
        .bind(name, role, active, id).run();
      if (!active) await context.env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(id).run();
    }
    return json({ ok: true });
  } catch (error) {
    console.error("Admin user update error", error);
    return json({ error: "Não foi possível salvar o usuário." }, { status: 500 });
  }
}
