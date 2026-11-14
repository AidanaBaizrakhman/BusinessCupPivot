const DEFAULT_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-flash-latest";
const MAX_CHARS = 20000; // protects your quota from oversized requests

function toContents(body) {
  if (typeof body.prompt === "string" && body.prompt.trim()) {
    return [{ role: "user", parts: [{ text: body.prompt }] }];
  }
  if (Array.isArray(body.messages) && body.messages.length) {
    const contents = [];
    for (const m of body.messages) {
      const role = m.role === "assistant" ? "model" : "user";
      const text = String(m.content || "");
      if (!text) continue;
      const last = contents[contents.length - 1];
      if (last && last.role === role)
        last.parts[0].text += "\n\n" + text; // Gemini prefers alternating turns
      else contents.push({ role, parts: [{ text }] });
    }
    return contents;
  }
  return null;
}

async function callGeminiOnce(model, apiKey, contents, json) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents,
      generationConfig: Object.assign(
        { temperature: 0.6, maxOutputTokens: 4096 },
        json ? { responseMimeType: "application/json" } : {},
      ),
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || `Gemini error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const text = (data.candidates?.[0]?.content?.parts || [])
    .map((p) => p.text || "")
    .join("")
    .trim();
  if (!text)
    throw Object.assign(new Error("Gemini returned an empty answer"), {
      status: 502,
    });
  return text;
}

async function generate(body) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    throw Object.assign(new Error("GEMINI_API_KEY is not set on the server"), {
      status: 503,
    });
  const contents = toContents(body || {});
  if (!contents)
    throw Object.assign(new Error('Send "prompt" or "messages"'), {
      status: 400,
    });
  const size = JSON.stringify(contents).length;
  if (size > MAX_CHARS)
    throw Object.assign(new Error("Request too large"), { status: 413 });

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  try {
    return await callGeminiOnce(model, apiKey, contents, !!body.json);
  } catch (e) {
    // If the model name was retired, retry once with Google's "latest flash" alias.
    if (e.status === 404 && model !== FALLBACK_MODEL)
      return callGeminiOnce(FALLBACK_MODEL, apiKey, contents, !!body.json);
    throw e;
  }
}

// Tiny in-memory rate limit: 30 requests per minute per IP (per server instance).
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < 60000);
  list.push(now);
  hits.set(ip, list);
  return list.length > 30;
}

async function handle(method, body, ip) {
  if (method === "GET")
    return {
      status: 200,
      json: { ok: !!process.env.GEMINI_API_KEY, provider: "gemini" },
    };
  if (method !== "POST")
    return { status: 405, json: { error: "Method not allowed" } };
  if (rateLimited(ip || "unknown"))
    return {
      status: 429,
      json: { error: "Too many requests, try again in a minute" },
    };
  try {
    const text = await generate(body);
    return { status: 200, json: { text } };
  } catch (e) {
    return { status: e.status || 500, json: { error: e.message } };
  }
}

module.exports = { handle };
