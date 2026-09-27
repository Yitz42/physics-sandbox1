// data-panel.js — "Learning data" on the home page: download everything this
// browser has gathered as one file, or load such a file back in.
//
// For now this is for the programmer (looking over what students did, testing).
// Files are anonymous and plain JSON; see core/record-file.js for the format.
// Loading a file ADDS to what this browser has: nothing here is deleted.

import { el, button } from "./controls.js";
import { showMessage } from "./feedback.js";
import { loadCourseList, loadCourse, loadUnit, loadUnitStages, unitPlace } from "../core/content.js";
import { getEvents, setEvents, getRecordId, MAX_EVENTS } from "../core/evidence.js";
import { getAllProgress, setAllProgress } from "../core/progress.js";
import { allKinds } from "../core/diagnosis.js";
import { buildRecordFile, readRecordFile, mergeEvents, mergeProgress, RecordFileError } from "../core/record-file.js";

// The game as it is now: every course, unit and stage, with titles (saved in
// the file so renamed stages can be matched up later).
async function gameCatalog() {
  const out = [];
  for (const c of (await loadCourseList()).filter((x) => !x.comingSoon)) {
    const course = await loadCourse(c.id);
    const units = [];
    for (const uid of course.units) {
      const unit = await loadUnit(c.id, uid);
      const stages = await loadUnitStages(c.id, unit);
      const place = unitPlace(course, uid);
      units.push({
        id: uid, title: unit.title, number: place.number, chapter: place.chapter ? place.chapter.title : null,
        stages: stages.map((s, i) => ({ id: s.id, file: unit.stages[i], title: s.title, challenge: s.challenge, parts: (s.parts || []).map((p) => p.title || null) })),
      });
    }
    out.push({ id: c.id, title: course.title, units });
  }
  return out;
}

// Hand the browser a file to save.
function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  const a = el("a", { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// onChange(): called after a file is loaded (the home page redraws its numbers).
export function dataPanel(onChange) {
  const status = el("div", { className: "data-status" });
  const events = getEvents();
  const done = Object.values(getAllProgress()).filter((p) => p.status === "complete").length;
  const summary = el("p", { className: "data-summary", textContent: `This browser has recorded ${events.length} checked answer${events.length === 1 ? "" : "s"} and ${done} finished stage${done === 1 ? "" : "s"}.` });

  const exportBtn = button("Export all data", async () => {
    exportBtn.disabled = true;
    try {
      const file = buildRecordFile({ events: getEvents(), progress: getAllProgress(), catalog: await gameCatalog(), kinds: allKinds(), recordId: getRecordId() });
      const day = file.exportedAt.slice(0, 10);
      download(`learning-record-${day}.json`, JSON.stringify(file, null, 1));
      showMessage(status, "good", "Exported", `Saved **${file.events.length}** answers and **${file.progress.length}** stage records in one file (anonymous).`);
    } catch (err) {
      showMessage(status, "bad", "Couldn't export", err.message);
    } finally {
      exportBtn.disabled = false;
    }
  }, "btn");

  // Loading: a hidden file picker behind a normal button.
  const picker = el("input", { type: "file", accept: ".json,application/json", hidden: true });
  const importBtn = button("Import data…", () => picker.click(), "btn btn-quiet");
  picker.addEventListener("change", async () => {
    const f = picker.files && picker.files[0];
    picker.value = ""; // the same file can be picked again later
    if (!f) return;
    try {
      let json;
      try {
        json = JSON.parse(await f.text());
      } catch {
        throw new RecordFileError("That file isn't readable JSON.");
      }
      const got = readRecordFile(json, await gameCatalog());
      const ok = confirm(`Add ${got.events.length} answers and ${Object.keys(got.progress).length} stage records from "${f.name}" to this browser?\n\nNothing already here is deleted; answers that are already here aren't added twice.`);
      if (!ok) return;
      const merged = mergeEvents(getEvents(), got.events);
      const kept = setEvents(merged.events);
      setAllProgress(mergeProgress(getAllProgress(), got.progress));
      const notes = [...got.warnings];
      if (kept < merged.events.length) notes.push(`This browser keeps the newest ${MAX_EVENTS} answers, so the oldest ${merged.events.length - kept} were left out.`);
      showMessage(status, "good", "Imported", [`Added **${merged.added}** new answers (${got.events.length - merged.added} were already here) and merged the stage records.`, ...notes].join("\n\n"));
      if (onChange) setTimeout(onChange, 1200); // let the message be read, then refresh the numbers
    } catch (err) {
      showMessage(status, "bad", "Couldn't import", err instanceof RecordFileError ? err.message : `Something went wrong reading the file: ${err.message}`);
    }
  });

  return el("section", { className: "data-panel" }, [
    el("h2", { textContent: "Learning data" }),
    el("p", { className: "lead", textContent: "Everything gathered in this browser — finished stages and every checked answer, with timing and the kind of each mistake — in one anonymous file. Import adds a file's data to this browser." }),
    summary,
    el("div", { className: "actions" }, [exportBtn, importBtn, picker]),
    status,
  ]);
}
