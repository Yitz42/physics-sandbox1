// stage-view.js — the page layout for one stage.
//
//  ┌ breadcrumbs ─────────────────────────────────────────────┐
//  │ [Predict]  Stage title                     status badge  │
//  ├──────────────────────────────┬───────────────────────────┤
//  │  picture (canvas)            │ instructions              │
//  │                              │ sliders / answers / etc.  │
//  │  equations                   │ feedback, hints, "why"    │
//  ├──────────────────────────────┴───────────────────────────┤
//  │ ← previous stage                          next stage →   │
//  └──────────────────────────────────────────────────────────┘

import { el } from "./controls.js";
import { renderMixed } from "../render/panel.js";

export const CHALLENGE_NAMES = {
  explore: "Explore", predict: "Predict", build: "Build",
  debug: "Debug", "concept-check": "Concept check", solve: "Solve",
};

// Only "complete" is shown. "practice" is an internal record, so to the
// student it looks the same as not finished yet.
const STATUS_TEXT = { none: "", practice: "", complete: "Complete ★" };

// links: { course: {href, title}, unit: {href, title}, prev, next }
export function createStageView(root, stage, links) {
  root.innerHTML = "";
  const badge = el("span", { className: "status-badge" });
  const header = el("header", { className: "stage-header" }, [
    el("nav", { className: "crumbs" }, [
      el("a", { href: "#/", textContent: "Courses" }), " › ",
      el("a", { href: links.course.href, textContent: links.course.title }), " › ",
      el("a", { href: links.unit.href, textContent: links.unit.title }),
    ]),
    el("div", { className: "stage-title-row" }, [
      el("span", { className: `chip chip-${stage.challenge}`, textContent: CHALLENGE_NAMES[stage.challenge] }),
      el("h1", { textContent: stage.title }),
      badge,
    ]),
  ]);
  const body = el("div", { className: "stage-body" });
  const footer = el("footer", { className: "stage-nav" }, [
    links.prev ? el("a", { href: links.prev, className: "btn btn-quiet", textContent: "← Previous stage" }) : el("span"),
    links.next ? el("a", { href: links.next, className: "btn btn-quiet", textContent: "Next stage →" }) : el("a", { href: links.unit.href, className: "btn btn-quiet", textContent: "Back to unit" }),
  ]);
  root.append(header, body, footer);

  return {
    setStatus(status) {
      badge.textContent = STATUS_TEXT[status] || "";
      badge.className = `status-badge status-${status}`;
      badge.hidden = !badge.textContent;
    },
    // Fresh, empty areas for a new round (a new version of the problem).
    resetBody() {
      body.innerHTML = "";
      const parts = {
        figure: el("div", { className: "figure" }),
        equations: el("div", { className: "equations" }),
        instructions: el("div", { className: "instructions" }),
        controls: el("div", { className: "controls" }),
        area: el("div", { className: "area" }),
        feedback: el("div", { className: "feedback", "aria-live": "polite" }),
        status: el("div", { className: "round-status" }),
        actions: el("div", { className: "actions finish-actions" }),
        explanation: el("div", { className: "explanation-box" }),
        hints: el("div", { className: "hints" }),
      };
      renderMixed(parts.instructions, stage.instructions);
      body.append(
        el("section", { className: "stage-left" }, [parts.figure, parts.equations]),
        el("aside", { className: "stage-right" }, [
          parts.instructions, parts.controls, parts.area, parts.feedback,
          parts.status, parts.actions, parts.explanation, parts.hints,
        ]),
      );
      return parts;
    },
  };
}
