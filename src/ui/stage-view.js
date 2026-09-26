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
// The dock at the bottom of the panel holds the hint button (left) and the
// stage's main button (right): Test, then Continue → when the stage is done.

import { el } from "./controls.js";
import { renderMixed } from "../render/panel.js";
import { topNav, progressBar } from "./chrome.js";

export const CHALLENGE_NAMES = {
  explore: "Explore", predict: "Predict", build: "Build",
  debug: "Debug", "concept-check": "Concept check", solve: "Solve",
};

// where: { course, unit, unitNumber, stages (the unit's loaded stages), current (stage file) }
export function createStageView(root, stage, where) {
  root.innerHTML = "";
  const bar = progressBar(where.course, where.unit);
  const header = el("header", { className: "stage-header" }, [
    el("h1", { textContent: stage.title }),
    bar,
  ]);
  const body = el("div", { className: "stage-body" });
  root.append(topNav(where), header, body);

  return {
    // A stage was just completed (or needs practice): refresh the unit's progress bar.
    setStatus() {
      bar.refresh();
    },
    // Fresh, empty areas for a new round (a new version of the problem).
    resetBody() {
      body.innerHTML = "";
      const parts = {
        figure: el("div", { className: "figure" }),
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
      // MISSION: the stage's goal in one line (stage.mission), then the details.
      if (stage.mission) {
        parts.mission.appendChild(el("span", { className: "mission-label", textContent: "Mission: " }));
        const m = el("span", { className: "mission-text" });
        renderMixed(m, stage.mission);
        parts.mission.appendChild(m);
      }
      renderMixed(parts.instructions, stage.instructions);
      body.append(
        el("section", { className: "stage-left" }, [parts.figure, parts.equations]),
        el("aside", { className: "stage-right" }, [
          parts.mission, parts.instructions, parts.controls, parts.area, parts.feedback,
          parts.status, parts.explanation, parts.hintList,
          el("div", { className: "dock" }, [parts.hints, parts.actions]),
        ]),
      );
      return parts;
    },
  };
}
