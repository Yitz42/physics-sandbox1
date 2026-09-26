// stage-view.js — the page layout for one stage.
//
//  ┌ breadcrumbs ─────────────────────────────────────────────┐
//  │ [Predict]  Stage title                     status badge  │
//  ├──────────────────────────────┬───────────────────────────┤
//  │  picture (canvas)            │ instructions              │
//  │                              │ sliders / answers / etc.  │
//  │  equations                   │ feedback, hints, "why"    │
//  └──────────────────────────────┴───────────────────────────┘

import { el } from "./controls.js";
import { renderMixed } from "../render/panel.js";

export const CHALLENGE_NAMES = {
  explore: "Explore", predict: "Predict", build: "Build",
  debug: "Debug", "concept-check": "Concept check", solve: "Solve",
};

// Only "complete" is shown. "practice" is an internal record, so to the
// student it looks the same as not finished yet.
const STATUS_TEXT = { none: "", practice: "", complete: "Complete ★" };

// "Part 2 of 3: Unit vectors", with a dot per part (done ● / now ◉ / to do ○).
// Nothing for a stage with only one part.
function partBar({ index, count, titles }) {
  if (count < 2) return null;
  const dots = el("span", { className: "part-dots", "aria-hidden": "true" });
  for (let i = 0; i < count; i++) {
    dots.appendChild(el("span", { className: `part-dot ${i < index ? "done" : i === index ? "now" : ""}`, title: titles[i] || `Part ${i + 1}` }));
  }
  const title = titles[index] ? `: ${titles[index]}` : "";
  return el("div", { className: "part-bar" }, [
    el("span", { className: "part-label", textContent: `Part ${index + 1} of ${count}${title}` }),
    dots,
  ]);
}

// links: { course: {href, title}, unit: {href, title} }
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
  // No previous/next buttons at the bottom (they confused students): moving on
  // happens from the "Stage complete" card, and the breadcrumbs lead back.
  root.append(header, body);

  return {
    setStatus(status) {
      badge.textContent = STATUS_TEXT[status] || "";
      badge.className = `status-badge status-${status}`;
      badge.hidden = !badge.textContent;
    },
    // Fresh, empty areas for a new round (a new version of the problem).
    // stage: the part being played; partInfo: { index, count, titles } when
    // the stage has several parts (see stageParts in core/content.js).
    resetBody(stage, partInfo = { index: 0, count: 1, titles: [] }) {
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
          partBar(partInfo),
          parts.instructions, parts.controls, parts.area, parts.feedback,
          parts.status, parts.actions, parts.explanation, parts.hints,
        ]),
      );
      return parts;
    },
  };
}
