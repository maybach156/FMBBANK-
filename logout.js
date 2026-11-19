import { send, method, clearAuthCookie } from "./_lib.js";
export default function handler(req, res) {
  if (!method(req, res, ["POST"])) return;
  clearAuthCookie(res);
  return send(res, 200, { ok: true });
}
