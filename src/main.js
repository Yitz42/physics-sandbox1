// main.js — the entry point. Reads the address bar and shows the right page:
//   #/                                   list of courses
//   #/statics                            the units of a course
//   #/statics/force-components           one unit's stages
//   #/statics/force-components/2-predict one stage
//   #/comprehension/statics              how well the course is understood (from every answer)
// Using the part after "#" means the browser's Back button works and every
// stage has its own link, with no server needed.

import { loadCourseList, loadCourse, loadUnit, loadUnitStages, loadStage, unitPlace } from "./core/content.js";
import { runStage } from "./core/runner.js";
import { renderHome, renderCourse, renderUnit } from "./ui/menus.js";
import { createStageView } from "./ui/stage-view.js";
import { comprehensionPanel, renderComprehension } from "./ui/comprehension-view.js";
import { courseComprehension } from "./core/comprehension.js";
import { getEvents } from "./core/evidence.js";
import { dataPanel } from "./ui/data-panel.js";

const app = document.getElementById("app");

// A course with its built units loaded, and its comprehension from the record of answers.
async function courseSummary(courseId, events) {
  const course = await loadCourse(courseId);
  const units = await Promise.all(course.units.map((u) => loadUnit(courseId, u)));
  return { course, summary: courseComprehension(events, course, units) };
}

// The stage being played (runner.js), so leaving it can be recorded.
let playing = null;

async function route() {
  if (playing) playing.leave();
  playing = null;
  const [courseId, unitId, stageFile] = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  window.scrollTo(0, 0);
  document.querySelector(".center-card-backdrop")?.remove(); // close a "Stage complete" card
  try {
    if (!courseId) {
      // The course cards, then the Comprehension window (one card per course).
      const courses = await loadCourseList();
      renderHome(app, courses);
      const events = getEvents();
      const summaries = {};
      for (const c of courses.filter((x) => !x.comingSoon)) summaries[c.id] = (await courseSummary(c.id, events)).summary;
      if (location.hash.replace(/^#\/?/, "") === "") {
        // still on the home page: the Comprehension window, then the learning data (export / import)
        app.appendChild(comprehensionPanel(courses, summaries));
        app.appendChild(dataPanel(route));
      }
      return;
    }
    if (courseId === "comprehension") {
      if (!unitId) return (location.hash = "#/");
      const { course, summary } = await courseSummary(unitId, getEvents());
      document.title = `${course.title} comprehension — Mechanics Sandbox`;
      return renderComprehension(app, course, summary);
    }
    const course = await loadCourse(courseId);
    const units = await Promise.all(course.units.map((u) => loadUnit(courseId, u)));
    // Tools (course.tools): free pages such as the block diagram workbench.
    const tools = await Promise.all((course.tools || []).map((t) => loadUnit(courseId, t)));
    if (!unitId) return renderCourse(app, course, units, tools);

    const tool = tools.find((t) => t.id === unitId);
    if (tool) {
      const file = stageFile || tool.stages[0];
      const stage = await loadStage(courseId, unitId, file);
      const view = createStageView(app, stage, { course, unit: tool, unitNumber: "", current: file, stages: [stage], units });
      document.title = `${stage.title} — Mechanics Sandbox`;
      playing = runStage({ stage, view, key: `${courseId}/${stage.id}`, next: `#/${courseId}`, nextLabel: `Back to ${course.title} →` });
      return;
    }

    const unitIndex = course.units.indexOf(unitId);
    const unit = units[unitIndex];
    if (!unit) throw new Error(`No unit called "${unitId}" in ${course.title}.`);
    // (units: the top menu on a unit page lets the student switch unit)
    if (!stageFile) return renderUnit(app, course, unit, await loadUnitStages(courseId, unit), units);

    const i = unit.stages.indexOf(stageFile);
    if (i < 0) throw new Error(`No stage called "${stageFile}" in ${unit.title}.`);
    const stage = await loadStage(courseId, unitId, stageFile);
    const base = `#/${courseId}/${unitId}/`;
    // Next stage: the next one in this unit, or the first stage of the next unit.
    const nextUnit = units[unitIndex + 1];
    // After the very last stage, "next" leads back to the course page.
    let next = i + 1 < unit.stages.length ? base + unit.stages[i + 1] : nextUnit ? `#/${courseId}/${nextUnit.id}/${nextUnit.stages[0]}` : null;
    let nextLabel = "Next stage →";
    if (!next) {
      next = `#/${courseId}`;
      nextLabel = `Back to ${course.title} →`;
    }
    // The page's top menu lists every stage of this unit.
    const view = createStageView(app, stage, {
      course, unit, unitNumber: unitPlace(course, unitId).number, current: stageFile,
      stages: await loadUnitStages(courseId, unit),
    });
    document.title = `${stage.title} — Mechanics Sandbox`;
    playing = runStage({ stage, view, key: `${courseId}/${stage.id}`, next, nextLabel });
  } catch (err) {
    // Never leave a blank page: show what went wrong and a way back.
    console.error(err);
    app.innerHTML = "";
    const box = document.createElement("div");
    box.className = "error-page";
    box.innerHTML = `<h1>Something went wrong</h1><pre></pre><p><a href="#/">Back to the start</a></p>`;
    box.querySelector("pre").textContent = err.message;
    app.appendChild(box);
  }
}

window.addEventListener("hashchange", route);
// Closing the tab (or the browser putting the page away) also leaves the stage;
// a page brought back from the browser's cache starts a new visit.
window.addEventListener("pagehide", () => playing && playing.leave());
window.addEventListener("pageshow", (e) => e.persisted && playing && playing.resume());
route();
