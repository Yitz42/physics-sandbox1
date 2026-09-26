// particle-tools.js — the interactive extras for particle problems:
//   • drag handles on arrow tips (explore/build),
//   • the set of forces and snap directions for drawing an FBD (solve),
//   • deliberately-wrong setups for debug challenges.

import { add, scale, sub, mag } from "../../core/vector.js";
import { clone } from "../../core/paths.js";
import { directionOf, magnitudeOf } from "./particle.js";
import { fromVector, reverse } from "./directions.js";
import { anchorPoint, fbdOrigin } from "./particle-scene.js";

// ---- Dragging arrow tips ---------------------------------------------------

// Tip positions of the forces a stage lets the student drag.
// Only works for pictures drawn to scale (setup.forceScale).
export function particleHandles(setup, ids = []) {
  if (!setup.forceScale) return [];
  return setup.forces
    .filter((f) => ids.includes(f.id) && magnitudeOf(f) != null)
    .map((f) => ({ id: f.id, at: add(setup.point.at, scale(directionOf(f), magnitudeOf(f) / setup.forceScale)) }));
}

// Student dragged the tip of force `id` to `point`: update magnitude and angle.
// Magnitudes snap to setup.dragStep (default 10 N) and angles to whole degrees,
// so values stay tidy, like the numbers in a textbook problem.
export function particleDrag(setup, id, point) {
  const f = setup.forces.find((x) => x.id === id);
  if (!f) return setup;
  const v = sub(point, setup.point.at);
  const step = setup.dragStep || 10;
  const limit = setup.dragMax || Infinity;
  f.magnitude = Math.min(limit, Math.max(step, Math.round((mag(v) * setup.forceScale) / step) * step));
  f.direction = fromVector(v, 1);
  return setup;
}

// ---- Drawing the FBD (solve challenge) ----------------------------------------

// Everything the FBD drawing tool needs:
//   origin      where the point is drawn on the FBD
//   forces      the correct forces: { id, symbol, dir }
//   directions  directions a placed arrow can snap to
export function particleFbd(setup) {
  const forces = setup.forces.map((f) => ({ id: f.id, symbol: f.symbol, dir: directionOf(f), kind: f.kind || "applied" }));
  const directions = [];
  // Eight compass directions …
  for (let k = 0; k < 8; k++) directions.push([Math.cos((k * Math.PI) / 4), Math.sin((k * Math.PI) / 4)]);
  // … plus both ways along every cable and every force, so a correct arrow
  // is always reachable and a backwards one is too (a common mistake to catch).
  for (const f of forces) directions.push(f.dir, scale(f.dir, -1));
  for (const f of setup.forces.filter((x) => x.kind === "cable")) {
    const d = sub(anchorPoint(setup, f), setup.point.at);
    directions.push(scale(d, 1 / mag(d)), scale(d, -1 / mag(d)));
  }
  return { origin: fbdOrigin(setup), forces, directions: dedupe(directions) };
}

function dedupe(dirs) {
  const out = [];
  for (const d of dirs) if (!out.some((e) => Math.abs(e[0] - d[0]) < 1e-6 && Math.abs(e[1] - d[1]) < 1e-6)) out.push(d);
  return out;
}

// ---- Debug challenges ---------------------------------------------------------

// Make a deliberately wrong FBD.
//   { kind: "remove",  force: "W" }     a force is missing
//   { kind: "reverse", force: "T_AB" }  an arrow points the wrong way
export function particleMutate(setup, mutation) {
  const s = clone(setup);
  const f = s.forces.find((x) => x.id === mutation.force);
  if (!f) throw new Error(`Debug mutation names unknown force ${mutation.force}`);
  if (mutation.kind === "remove") {
    s.forces = s.forces.filter((x) => x !== f);
  } else if (mutation.kind === "reverse") {
    if (f.kind === "weight") {
      f.kind = "applied";
      f.magnitude = magnitudeOf(f);
      f.direction = "up";
    } else {
      f.direction = reverse(f.direction);
    }
    f.mutated = true;
  }
  return s;
}
