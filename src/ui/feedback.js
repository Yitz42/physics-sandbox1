// feedback.js — messages to the student: right, wrong, hints, explanations.
//
// Wrong answers always come with a reason (see CLAUDE.md), so every message
// here takes a title AND a body.

import { el } from "./controls.js";
import { renderMixed } from "../render/panel.js";

// kind: "good" | "bad" | "info" | "warn"
export function showMessage(container, kind, title, body = "") {
  container.innerHTML = "";
  if (!title && !body) return;
  const box = el("div", { className: `msg msg-${kind}`, role: kind === "bad" ? "alert" : "status" });
  if (title) box.appendChild(el("div", { className: "msg-title", textContent: title }));
  if (body) {
    const b = el("div", { className: "msg-body" });
    renderMixed(b, body);
    box.appendChild(b);
  }
  container.appendChild(box);
  return box;
}

export function clearMessage(container) {
  container.innerHTML = "";
}

// Hints are revealed one at a time, so students try before reading them all.
export function buildHints(container, hints = []) {
  container.innerHTML = "";
  if (!hints.length) return;
  let shown = 0;
  const list = el("ol", { className: "hint-list" });
  const btn = el("button", { type: "button", className: "btn btn-quiet", textContent: "💡 Show a hint" });
  btn.onclick = () => {
    const li = el("li");
    renderMixed(li, hints[shown++]);
    list.appendChild(li);
    btn.textContent = shown < hints.length ? "💡 Another hint" : "No more hints";
    btn.disabled = shown >= hints.length;
  };
  container.append(btn, list);
}

// Shown when a stage is finished (or when the answer was revealed).
export function showExplanation(container, text) {
  container.innerHTML = "";
  if (!text) return;
  const box = el("div", { className: "explanation" }, [el("div", { className: "msg-title", textContent: "Why this works" })]);
  const body = el("div");
  renderMixed(body, text);
  box.appendChild(body);
  container.appendChild(box);
}

// "Stage complete" card in the middle of the screen, over a dimmed page.
//   body:        short line under the title (optional)
//   explanation: the stage's "Why this works" text (optional)
//   buttons:     [{ label, onClick, primary }]
// The × button, clicking outside, or Esc closes it so the student can look
// at their finished work.
export function showCenterCard({ title, body = "", explanation = "", buttons = [] }) {
  document.querySelector(".center-card-backdrop")?.remove();
  const backdrop = el("div", { className: "center-card-backdrop" });
  const card = el("div", { className: "center-card", role: "dialog", "aria-modal": "true", "aria-label": title });
  const close = () => {
    backdrop.remove();
    document.removeEventListener("keydown", onKey);
  };
  const onKey = (e) => e.key === "Escape" && close();
  card.appendChild(el("button", { type: "button", className: "center-card-close", "aria-label": "Close", textContent: "×", onclick: close }));
  card.appendChild(el("div", { className: "center-card-star", textContent: "★" }));
  card.appendChild(el("h2", { textContent: title }));
  if (body) {
    const b = el("div", { className: "center-card-body" });
    renderMixed(b, body);
    card.appendChild(b);
  }
  if (explanation) {
    const why = el("div", { className: "center-card-why" }, [el("div", { className: "msg-title", textContent: "Why this works" })]);
    const t = el("div");
    renderMixed(t, explanation);
    why.appendChild(t);
    card.appendChild(why);
  }
  const row = el("div", { className: "actions center-card-actions" });
  for (const btn of buttons) {
    row.appendChild(el("button", {
      type: "button", className: btn.primary ? "btn btn-play" : "btn btn-quiet", textContent: btn.label,
      onclick: () => { close(); btn.onClick(); },
    }));
  }
  card.appendChild(row);
  backdrop.appendChild(card);
  backdrop.addEventListener("click", (e) => e.target === backdrop && close());
  document.addEventListener("keydown", onKey);
  document.body.appendChild(backdrop);
  row.querySelector("button")?.focus();
  return close;
}
