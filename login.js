import bcrypt from "bcryptjs";
import { db, initDb, send, method, createToken, setAuthCookie, recordAudit } from "./_lib.js";
export default async function handler(req, res) {
  if (!method(req, res, ["POST"])) return;
  try {
    await initDb();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");
    const q = await db().query("SELECT id,full_name,email,password_hash,role,created_at FROM users WHERE email=$1", [email]);
    if (!q.rowCount || !(await bcrypt.compare(password, q.rows[0].password_hash))) return send(res, 401, { error: "Email or password is incorrect." });
    const u = q.rows[0];
    const user = { id: u.id, full_name: u.full_name, email: u.email, role: u.role, created_at: u.created_at };
    setAuthCookie(res, createToken(user));
    await recordAudit(user.id, "login");
    return send(res, 200, { user });
  } catch (e) { console.error(e); return send(res, 500, { error: "Login service is unavailable." }); }
}
