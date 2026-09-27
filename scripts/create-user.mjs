import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { webcrypto } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const execFileAsync = promisify(execFile);
const encoder = new TextEncoder();

function base64url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

async function hashPassword(password) {
  if (password.length < 12 || password.length > 512) throw new Error("A senha deve ter entre 12 e 512 caracteres.");
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const key = await webcrypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await webcrypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-512", salt, iterations: 210000 }, key, 256);
  return `pbkdf2_sha512$210000$${base64url(salt)}$${base64url(new Uint8Array(bits))}`;
}

function quote(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

const local = process.argv.includes("--local");
const rl = createInterface({ input: stdin, output: stdout });
try {
  const database = (process.env.D1_DATABASE_NAME ?? await rl.question("Nome do banco D1: ")).trim();
  const name = (await rl.question("Nome: ")).trim();
  const email = (await rl.question("E-mail: ")).trim().toLowerCase();
  const password = await rl.question("Senha (mínimo 12 caracteres): ");
  const role = (await rl.question("Perfil [admin/user] (admin): ")).trim() || "admin";
  if (!database || !name || name.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !["admin", "user"].includes(role)) {
    throw new Error("Dados inválidos.");
  }
  const passwordHash = await hashPassword(password);
  const sql = `INSERT INTO users (name, email, password_hash, role, active) VALUES (${quote(name)}, ${quote(email)}, ${quote(passwordHash)}, ${quote(role)}, 1);`;
  const args = ["wrangler", "d1", "execute", database, "--command", sql];
  if (local) args.push("--local"); else args.push("--remote");
  await execFileAsync(process.platform === "win32" ? "npx.cmd" : "npx", args, { windowsHide: true });
  console.log(`Usuário ${email} criado com perfil ${role}.`);
} finally {
  rl.close();
}
