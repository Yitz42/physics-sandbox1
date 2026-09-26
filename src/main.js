// main.js — the entry point. Reads the address bar and shows the right page:
//   #/                                   list of courses
//   #/statics                            the units of a course
//   #/statics/01-force-vectors           one unit's stages
//   #/statics/01-force-vectors/2-predict one stage
// Using the part after "#" means the browser's Back button works and every
// stage has its own link, with no server needed.

import { loadCourseList, loadCourse, loadUnit, loadUnitStages, loadStage } from "./core/content.js";
import { runStage } from "./core/runner.js";
import { renderHome, renderCourse, renderUnit } from "./ui/menus.js";
import { createStageView } from "./ui/stage-view.js";

const app = document.getElementById("app");

async function route() {
  const [courseId, unitId, stageFile] = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  window.scrollTo(0, 0);
  document.querySelector(".center-card-backdrop")?.remove(); // close a "Stage complete" card
  try {
    if (!courseId) return renderHome(app, await loadCourseList());
    const course = await loadCourse(courseId);
    const units = await Promise.all(course.units.map((u) => loadUnit(courseId, u)));
    if (!unitId) return renderCourse(app, course, units);

    const unitIndex = course.units.indexOf(unitId);
    const unit = units[unitIndex];
    if (!unit) throw new Error(`No unit called "${unitId}" in ${course.title}.`);
    if (!stageFile) return renderUnit(app, course, unit, unitIndex + 1, await loadUnitStages(courseId, unit), units);

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
      course, unit, unitNumber: unitIndex + 1, current: stageFile,
      stages: await loadUnitStages(courseId, unit),
    });
    document.title = `${stage.title} — Mechanics Sandbox`;
    runStage({ stage, view, key: `${courseId}/${stage.id}`, next, nextLabel });
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
route();
