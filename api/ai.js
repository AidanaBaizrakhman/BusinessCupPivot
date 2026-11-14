const { handle } = require("../lib/gemini");

module.exports = async (req, res) => {
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch (e) {
      body = {};
    }
  }
  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress;
  const out = await handle(req.method, body || {}, ip);
  res.status(out.status).json(out.json);
};
