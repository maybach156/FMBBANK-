import { db, initDb, send, method, auth } from "./_lib.js";
export default async function handler(req, res) {
  if (!method(req, res, ["GET"])) return;
  const session = auth(req);
  if (!session) return send(res, 401, { error: "Please sign in." });
  try {
    await initDb();
    const q = await db().query(
      "SELECT id,reference,kind,description,amount,currency,status,created_at FROM demo_transactions WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50",
      [session.id]
    );
    return send(res, 200, { transactions: q.rows });
  } catch (e) { console.error(e); return send(res, 500, { error: "Could not load demo activity." }); }
}
