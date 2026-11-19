import { randomUUID } from "node:crypto";
import { db, initDb, send, method, auth, recordAudit } from "./_lib.js";
export default async function handler(req, res) {
  if (!method(req, res, ["POST"])) return;
  const session = auth(req);
  if (!session) return send(res, 401, { error: "Please sign in." });
  try {
    await initDb();
    const { action, amount, currency = "USD", description } = req.body || {};
    if (!["transfer","deposit","withdrawal"].includes(action)) return send(res, 400, { error: "Unsupported demo action." });
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0 || n > 1000000) return send(res, 400, { error: "Enter a valid demo amount." });
    if (!["USD","GBP","EUR","NGN"].includes(currency)) return send(res, 400, { error: "Unsupported currency." });
    const kind = `demo_${action}`;
    const ref = `FMB-DEMO-${randomUUID().slice(0,8).toUpperCase()}`;
    const label = String(description || `Simulated ${action}`).slice(0,100);
    const q = await db().query(
      "INSERT INTO demo_transactions(user_id,reference,kind,description,amount,currency,status) VALUES($1,$2,$3,$4,$5,$6,'SIMULATED') RETURNING id,reference,kind,description,amount,currency,status,created_at",
      [session.id, ref, kind, label, n, currency]
    );
    await recordAudit(session.id, `demo_${action}_created`);
    return send(res, 201, { transaction: q.rows[0], notice: "Demo record created. No money was moved, deposited, or withdrawn." });
  } catch (e) { console.error(e); return send(res, 500, { error: "Could not create demo record." }); }
}
