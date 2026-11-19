import pg from "pg";
import jwt from "jsonwebtoken";

const { Pool } = pg;
let pool;
export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured.");
  if (!pool) pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 10000
  });
  return pool;
}

export async function initDb() {
  await db().query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGSERIAL PRIMARY KEY, full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer','admin')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS demo_transactions (
      id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reference TEXT NOT NULL UNIQUE,
      kind TEXT NOT NULL CHECK (kind IN ('demo_transfer','demo_deposit','demo_withdrawal')),
      description TEXT NOT NULL, amount NUMERIC(14,2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD', status TEXT NOT NULL DEFAULT 'SIMULATED',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS audit_events (
      id BIGSERIAL PRIMARY KEY, user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
      event TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

export function send(res, status, payload) {
  res.status(status).json(payload);
}
export function method(req, res, allowed) {
  if (!allowed.includes(req.method)) { send(res, 405, { error: "Method not allowed." }); return false; }
  return true;
}
export function setAuthCookie(res, token) {
  res.setHeader("Set-Cookie", `fmb_token=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`);
}
export function clearAuthCookie(res) {
  res.setHeader("Set-Cookie", "fmb_token=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0");
}
export function createToken(user) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be at least 32 characters.");
  return jwt.sign({ id: String(user.id), email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}
export function auth(req) {
  const cookie = req.headers.cookie || "";
  const token = cookie.split(";").map(x => x.trim()).find(x => x.startsWith("fmb_token="))?.slice(10);
  if (!token || !process.env.JWT_SECRET) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET); } catch { return null; }
}
export async function recordAudit(userId, event) {
  await db().query("INSERT INTO audit_events(user_id,event) VALUES($1,$2)", [userId || null, event]);
}
