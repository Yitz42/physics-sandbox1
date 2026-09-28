// friction-ladder.js — a body with rough contacts (a ladder, Unit 9.1) as the rigid-body
// picture draws it: forces placed along it, its length, and its angle with the floor.
// Split from friction-scene.js, which draws crates.

import { add, scale } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { placeAlong } from "./friction.js";

// A body's setup as the rigid-body picture draws it: forces placed along it, and
// its marks. (The FBD drawing tool uses the same, so the two lay out alike.)
export function bodyPicture(setup) {
  const placed = placeAlong(setup);
  const extras = setup.ladderMarks ? ladderMarks(placed) : [];
  return { ...placed, extras: [...(placed.extras || []), ...extras] };
}

// setup.ladderMarks (a straight body leaning on a wall, foot first): its length along
// it, how far up each force given `along` it acts, and its angle with the floor at the foot.
function ladderMarks(setup) {
  const [A, B] = [setup.body.points[0], setup.body.points[setup.body.points.length - 1]];
  const L = Math.hypot(B[0] - A[0], B[1] - A[1]);
  const u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L];
  // The side away from the wall: of the two directions square to the ladder, the one
  // pointing the way the foot is from the top.
  const sq = [u[1], -u[0]];
  const out = sq[0] * (A[0] - B[0]) >= 0 ? sq : [-sq[0], -sq[1]];
  const off = (P, k) => add(P, scale(out, k * L));
  const marks = [{ type: "dim", from: off(A, 0.28), to: off(B, 0.28), label: format(L, "m") }];
  for (const f of setup.forces || []) {
    if (typeof f.along !== "number") continue;
    marks.push({ type: "dim", from: off(A, 0.1), to: off(f.at, 0.1), label: `${format(f.along, "m")}` });
  }
  const up = (Math.atan2(u[1], u[0]) * 180) / Math.PI;
  marks.push({ type: "arc", center: A, r: 0.14 * L, start: u[0] < 0 ? 180 : 0, end: up, label: format(Math.round(Math.abs(u[0] < 0 ? 180 - up : up) * 10) / 10, "deg") });
  return marks;
}

