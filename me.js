import { db, initDb, send, method, auth } from "./_lib.js";
export default async function handler(req, res) {
  if (!method(req, res, ["GET"])) return;
  const session = auth(req);
  if (!session) return send(res, 401, { error: "Please sign in." });
  try {
    await initDb();
    const q = await db().query("SELECT id,full_name,email,role,created_at FROM users WHERE id=$1", [session.id]);
    if (!q.rowCount) return send(res, 401, { error: "Account not found." });
    return send(res, 200, { user: q.rows[0] });
  } catch (e) { console.error(e); return send(res, 500, { error: "Could not load account." }); }
}
