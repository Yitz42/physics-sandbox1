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
