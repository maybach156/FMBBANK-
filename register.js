import bcrypt from "bcryptjs";
import { db, initDb, send, method, createToken, setAuthCookie, recordAudit } from "./_lib.js";

export default async function handler(req, res) {
  if (!method(req, res, ["POST"])) return;
  try {
    await initDb();
    const { fullName, email, password } = req.body || {};
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!fullName || String(fullName).trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || String(password || "").length < 8) {
      return send(res, 400, { error: "Enter your name, a valid email, and a password of at least 8 characters." });
    }
    const role = cleanEmail === String(process.env.ADMIN_EMAIL || "").trim().toLowerCase() ? "admin" : "customer";
    const hash = await bcrypt.hash(password, 12);
    const result = await db().query(
      "INSERT INTO users(full_name,email,password_hash,role) VALUES($1,$2,$3,$4) RETURNING id,full_name,email,role,created_at",
      [String(fullName).trim(), cleanEmail, hash, role]
    );
    const user = result.rows[0];
    setAuthCookie(res, createToken(user));
    await recordAudit(user.id, "account_registered");
    return send(res, 201, { user });
  } catch (e) {
    if (e.code === "23505") return send(res, 409, { error: "An account with this email already exists." });
    console.error(e);
    return send(res, 500, { error: "Could not create account. Check your database and environment settings." });
  }
}
