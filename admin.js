import { db, initDb, send, method, auth } from "./_lib.js";
export default async function handler(req, res) {
  if (!method(req, res, ["GET"])) return;
  const session = auth(req);
  if (!session || session.role !== "admin") return send(res, 403, { error: "Admin access required." });
  try {
    await initDb();
    const [users, tx, audits] = await Promise.all([
      db().query("SELECT id,full_name,email,role,created_at FROM users ORDER BY created_at DESC LIMIT 100"),
      db().query("SELECT t.id,t.reference,t.description,t.amount,t.currency,t.status,t.created_at,u.email FROM demo_transactions t JOIN users u ON u.id=t.user_id ORDER BY t.created_at DESC LIMIT 100"),
      db().query("SELECT id,event,created_at FROM audit_events ORDER BY created_at DESC LIMIT 50")
    ]);
    return send(res, 200, { users: users.rows, transactions: tx.rows, auditEvents: audits.rows });
  } catch (e) { console.error(e); return send(res, 500, { error: "Could not load admin preview." }); }
}
