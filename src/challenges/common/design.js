// design.js — what the student has set up with sliders and dragging, as plain
// values (for the learning record): build records the design it tests,
// explore sums up which of these the student changed.

import { getPath } from "../../core/paths.js";

// The design as submitted: the value at each slider's path, and where each
// draggable thing is (its `at` / `position`, or a force's size and direction),
// e.g. { "forces.#T_AB.direction.angle": 35 }.
export function designOf(stage, setup) {
  const out = {};
  for (const c of stage.editable || []) {
    // A slider has one path; a choice list sets several (e.g. an angle's "from" and "toward").
    const paths = c.path ? [c.path] : c.options && c.options[0] && c.options[0].set ? Object.keys(c.options[0].set) : [];
    for (const path of paths) out[path] = getPath(setup, path) ?? null;
  }
  for (const id of stage.draggable || []) {
    const name = typeof id === "string" ? id : id.id;
    for (const list of Object.values(setup)) {
      const item = Array.isArray(list) && list.find((x) => x && x.id === name);
      if (item) out[name] = item.at ?? item.position ?? (item.magnitude != null ? { magnitude: item.magnitude, direction: item.direction } : null);
    }
  }
  return JSON.parse(JSON.stringify(out)); // a copy: later edits to the setup mustn't change it
}

// Explore: a tally of the student's changes, so the record gets ONE summary
// per version instead of an event for every slider step. A change is a
// parameter taking a new value; moving the same slider (or dragging the same
// arrow) again within SAME_MOVE_MS counts as the same change.
const SAME_MOVE_MS = 1000;
export function changeTally(stage, setup, now = () => Date.now()) {
  let last = designOf(stage, setup);
  let lastKey = null;
  let lastAt = -Infinity;
  const touched = new Set();
  let changes = 0;
  return {
    // Call after every update of the picture.
    // One update is one adjustment, however many values it moved (a slider can
    // move a dragged arrow too).
    note(setupNow) {
      const cur = designOf(stage, setupNow);
      const moved = Object.keys(cur).filter((k) => JSON.stringify(cur[k]) !== JSON.stringify(last[k]));
      last = cur;
      if (!moved.length) return;
      moved.forEach((k) => touched.add(k));
      const key = moved.join("|");
      const t = now();
      if (key !== lastKey || t - lastAt > SAME_MOVE_MS) changes++;
      lastKey = key;
      lastAt = t;
    },
    // { changes, params: [paths touched], final: { path: value } for those }.
    summary() {
      const params = [...touched];
      return { changes, params, final: Object.fromEntries(params.map((k) => [k, last[k]])) };
    },
  };
}
