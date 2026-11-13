const form = document.querySelector("#ask-form");
const input = document.querySelector("#question");
const button = document.querySelector("#submit");
const history = document.querySelector("#history");
const status = document.querySelector("#status");
const setupNote = document.querySelector("#setup-note");
const endpoint = window.HELPDESK_API_URL || "";

function line(className, text, parent = history) {
  const p = document.createElement("p");
  p.className = className;
  p.textContent = text;
  parent.append(p);
  return p;
}

function showAnswer(data, question, failed = false) {
  const entry = document.createElement("div");
  entry.className = "entry";
  line("command", `brightpath@helpdesk:~$ ${question}`, entry);
  line(failed ? "answer error" : "answer", failed ? `error: ${data.error || data.message || "request failed"}` : data.answer, entry);
  if (!failed) {
    const sources = data.sources?.length ? data.sources.join(", ") : "none — no matching document";
    line("sources", `sources: ${sources}${data.mode ? ` · ${data.mode}` : ""}`, entry);
  }
  history.append(entry);
  history.scrollTop = history.scrollHeight;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = input.value.trim();
  if (!question) return;
  input.value = "";
  if (question === "/help") {
    line("command", "brightpath@helpdesk:~$ /help");
    line("answer", "Enter a question and press Enter. Use /clear to clear the screen.");
    return;
  }
  if (question === "/clear") {
    history.replaceChildren();
    return;
  }
  if (!endpoint || endpoint.includes("YOUR-VERCEL-PROJECT")) {
    showAnswer({ message: "API URL not configured. Set HELPDESK_API_URL in config.js." }, question, true);
    return;
  }
  button.disabled = true;
  input.disabled = true;
  status.textContent = "working…";
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const raw = await response.text();
    let data;
    try {
      data = raw ? JSON.parse(raw) : {};
    } catch {
      const contentType = response.headers.get("content-type") || "unknown content type";
      const preview = raw.replace(/\s+/g, " ").slice(0, 140);
      throw new Error(`API returned HTTP ${response.status} (${contentType}), not JSON. Check that config.js points to the Vercel /api/ask URL. ${preview}`);
    }
    if (!raw) throw new Error(`API returned an empty response (HTTP ${response.status}). Check the Vercel deployment and /api/ask route.`);
    if (!response.ok) throw new Error(data.error || `request failed (HTTP ${response.status})`);
    if (typeof data.answer !== "string") throw new Error(`API returned JSON without an answer (HTTP ${response.status}). Check the Vercel function logs.`);
    showAnswer(data, question);
    status.textContent = "ready";
  } catch (error) {
    const message = error instanceof TypeError
      ? "Could not reach the API. Check the Vercel URL and ALLOWED_ORIGIN setting."
      : error.message;
    showAnswer({ error: message }, question, true);
    status.textContent = "error";
  } finally {
    button.disabled = false;
    input.disabled = false;
    input.focus();
  }
});

if (!endpoint || endpoint.includes("YOUR-VERCEL-PROJECT")) {
  status.textContent = "not connected";
  setupNote.hidden = false;
} else {
  status.textContent = "ready";
}
