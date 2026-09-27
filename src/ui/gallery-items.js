// gallery-items.js — every picture a student can meet, for the gallery page
// (gallery.js) and the picture tests.
//
// A stage can hold several pictures: one per part and per situation, one per
// concept-check question that has its own picture, and one per mistake of a
// debug stage whose mistake is drawn (debug view "fbd"). Each picture is
//   { key, title, where: { courseId, unitId, file }, stage, setup, sceneOpts(setup),
//     reveal, solverName }
// where `stage` is the part/situation as the runner would play it, and
// sceneOpts(setup) gives the scene options for a (possibly re-numbered) setup.

import { loadCourseList, loadCourse, loadUnit, loadStage, stageParts, stageSituations, unitPlace } from "../core/content.js";
import { getSolver } from "../core/registry.js";
import { clone } from "../core/paths.js";
import { createCanvas } from "../render/canvas.js";
import { createWorkspace } from "../challenges/common/workspace.js";

// Every unit (and tool page) of every course that exists:
// [{ courseId, courseTitle, unit, number }] in course order.
export async function galleryUnits() {
  const out = [];
  for (const c of (await loadCourseList()).filter((x) => !x.comingSoon)) {
    const course = await loadCourse(c.id); // (also registers the subject's solvers)
    for (const u of course.units) out.push({ courseId: c.id, courseTitle: course.title, unit: await loadUnit(c.id, u), number: unitPlace(course, u).number });
    for (const t of course.tools || []) out.push({ courseId: c.id, courseTitle: course.title, unit: await loadUnit(c.id, t), number: "tool" });
  }
  return out;
}

// Which challenges start with the answers showing (explore's live values, the workbench).
const startsRevealed = (stage) => stage.challenge === "explore" || !!stage.workbench;

// Every picture in one unit.
export async function unitPictures({ courseId, unit, number }) {
  const out = [];
  for (const file of unit.stages) {
    const whole = await loadStage(courseId, unit.id, file);
    const parts = stageParts(whole);
    parts.forEach((part, pi) => {
      const situations = stageSituations(part);
      situations.forEach((stage, si) => {
        const bits = [`${number} ${unit.title}`, file];
        if (parts.length > 1) bits.push(`part ${pi + 1}`);
        if (situations.length > 1) bits.push(stage.situation.name || `situation ${si + 1}`);
        const base = { where: { courseId, unitId: unit.id, file }, stage, solverName: stage.solver, reveal: startsRevealed(stage) };
        const add = (extra, key, label) => out.push({ ...base, sceneOpts: () => ({ ...(stage.sceneOpts || {}) }), ...extra, key: `${courseId}/${unit.id}/${file}/${pi}/${si}${key}`, title: [...bits, label].filter(Boolean).join(" · ") });

        if (stage.challenge === "concept-check") {
          // One picture per question that has one (its own, or the stage's).
          (stage.questions || []).forEach((q, qi) => {
            const setup = q.setup || stage.setup;
            if (setup && stage.solver) add({ setup, reveal: !!q.reveal, sceneOpts: () => ({ ...(q.sceneOpts || stage.sceneOpts || {}) }) }, `/q${qi}`, `question ${qi + 1}`);
          });
          return;
        }
        if (!stage.setup || !stage.solver) return;
        if (stage.challenge === "debug" && stage.debug && stage.debug.view === "fbd") {
          // The wrong free-body diagram the student must fix, one per mistake.
          stage.debug.mutations.forEach((m, mi) => {
            add({ setup: stage.setup, sceneOpts: (setup) => ({ ...(stage.sceneOpts || {}), fbdSetup: getSolver(stage.solver).mutate(setup, m) }) }, `/m${mi}`, `mistake ${mi + 1}`);
          });
          return;
        }
        add({ setup: stage.setup }, "", "");
      });
    });
  }
  return out;
}

// Draw one picture into `figure` (an element on the page, with a size), as the
// stage would first show it. reveal: show the answers too. onDraw(report):
// after every drawing, with its clash report (render/bounds.js).
// Returns the workspace (ws.redraw, ws.setReveal, ws.setSetup …).
export function mountPicture(p, figure, { reveal = false, onDraw } = {}) {
  const setup = clone(p.setup);
  const ctx = { stage: p.stage, solver: getSolver(p.solverName), setup, canvas: createCanvas(figure), el: { equations: document.createElement("div"), controls: document.createElement("div"), figure } };
  return createWorkspace(ctx, {
    editable: p.stage.editable, draggable: p.stage.draggable, equations: "never",
    reveal: reveal || p.reveal, sceneOpts: p.sceneOpts(setup), onDraw,
  });
}
