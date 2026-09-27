// stage-view.js — the page layout for one stage.
//
//              [ STATICS SIMULATION LAB ]  ← menu tab (chrome.js)
//  Stage title                                   [████████──  67% COMPLETE]
//  ┌──────────────────────────────┬───────────────────────────┐
//  │  picture (canvas)            │ MISSION: one-line goal     │
//  │                              │ instructions               │
//  ├──────────────────────────────┤ sliders / objectives / …   │
//  │  equations                   │ feedback, "why", hints     │
//  └──────────────────────────────┤ [💡 Show a hint]  [ Test ] │  ← the dock
//                                 └───────────────────────────┘
// A stage split into parts shows "Part 2 of 3: …" with a dot per part at the
// top of the panel (see stageParts in core/content.js).
// The dock at the bottom of the panel holds the hint button (left) and the
// stage's main button (right): Test, then Continue → when the stage is done.

import { el } from "./controls.js";
import { renderMixed } from "../render/panel.js";
import { topNav, progressBar } from "./chrome.js";

export const CHALLENGE_NAMES = {
  explore: "Explore", predict: "Predict", build: "Build",
  debug: "Debug", "concept-check": "Concept check", solve: "Solve",
};

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

// where: { course, unit, unitNumber, stages (the unit's loaded stages), current (stage file) }
export function createStageView(root, stage, where) {
  root.innerHTML = "";
  // A tool (e.g. the workbench) isn't graded: no progress bar.
  const bar = where.unit.tool ? null : progressBar(where.course, where.unit);
  const header = el("header", { className: "stage-header" }, [
    el("h1", { textContent: stage.title }),
    bar,
  ]);
  const body = el("div", { className: "stage-body" });
  root.append(topNav(where), header, body);

  return {
    // A stage was just completed (or needs practice): refresh the unit's progress bar.
    setStatus() {
      if (bar) bar.refresh();
    },
    // Fresh, empty areas for a new round (a new version of the problem).
    // part: the part being played (the stage itself if it has no parts);
    // partInfo: { index, count, titles } when the stage has several parts.
    resetBody(part = stage, partInfo = { index: 0, count: 1, titles: [] }) {
      body.innerHTML = "";
      const parts = {
        // tallPicture: drawings stacked one above another (a beam and its shear and
        // moment diagrams) get a taller picture, so each stays a readable size.
        figure: el("div", { className: part.tallPicture || stage.tallPicture ? "figure figure-tall" : "figure" }),
        equations: el("div", { className: "equations" }),
        mission: el("div", { className: "mission" }),
        instructions: el("div", { className: "instructions" }),
        controls: el("div", { className: "controls" }),
        area: el("div", { className: "area" }),
        feedback: el("div", { className: "feedback", "aria-live": "polite" }),
        status: el("div", { className: "round-status" }),
        explanation: el("div", { className: "explanation-box" }),
        hintList: el("div", { className: "hint-box" }), // hints the student has opened
        hints: el("div", { className: "hints" }), // the "Show a hint" button
        actions: el("div", { className: "actions finish-actions" }), // Test, Continue →
      };
      // MISSION: the goal in one line (the part's own mission, else the stage's), then the details.
      const mission = part.mission || stage.mission;
      if (mission) {
        parts.mission.appendChild(el("span", { className: "mission-label", textContent: "Mission: " }));
        const m = el("span", { className: "mission-text" });
        renderMixed(m, mission);
        parts.mission.appendChild(m);
      }
      renderMixed(parts.instructions, part.instructions);
      body.append(
        el("section", { className: "stage-left" }, [parts.figure, parts.equations]),
        el("aside", { className: "stage-right" }, [
          partBar(partInfo), parts.mission, parts.instructions, parts.controls, parts.area, parts.feedback,
          parts.status, parts.explanation, parts.hintList,
          el("div", { className: "dock" }, [parts.hints, parts.actions]),
        ]),
      );
      return parts;
    },
  };
}
