import { json } from "../_lib/auth.js";

export function onRequestGet(context) {
  const user = context.data.user;
  return json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
