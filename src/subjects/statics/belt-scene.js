// belt-scene.js — the picture for belt friction (Unit 9.3): a fixed post (drawn like a
// pulley that can't turn), the rope lying on it over the angle of contact β, and the pulls
// at its two ends.
//
// The load end leaves the post on its right, straight down (from the point at 0°). The rope
// wraps counterclockwise from there — over the top first — and leaves at β (after any whole
// turns) along the post's tangent: that end is the hand's. β itself is marked by an arc just
// outside the post, from the load end round to the hand end; whole turns are named in its label.

import { format } from "../../core/units.js";
import { solveBelt } from "./belt.js";

const deg = Math.PI / 180;

export function beltScene(setup, result, opts = {}) {
  const res = result || solveBelt(setup);
  const v = res.values;
  const r = (setup.drum && setup.drum.r) || 0.3;
  const find = setup.find || "hand";
  const tightLoad = (setup.tight || "load") === "load";
  const shown = opts.reveal && res.status === "determinate";
  // β in the picture: the part after the whole turns (the rope's end leaves there).
  const beta = find === "beta" && !shown ? 180 : v.beta;
  let last = beta % 360;
  if (last < 1e-6 && beta > 0) last = 360;
  const turns = Math.floor((beta - 1e-6) / 360);
  const L = 3.2 * r; // how far each rope end is drawn from the post
  const arrow = 2.2 * r; // the pull arrows' length (not to scale: the pulls can differ a thousandfold)

  const shapes = [{ type: "axes" }];
  // The rope in the post's groove: all of it when it goes round more than once.
  shapes.push({ type: "pulley", at: [0, 0], r, cableR: r * 0.86, wrap: turns > 0 ? [0, 359.9] : [0, last] });
  // The load end: down from the post's right side.
  const loadEnd = [r * 0.86, -L];
  shapes.push({ type: "line", from: [r * 0.86, 0], to: loadEnd, style: "cable" });
  // The hand end: along the tangent where the wrap ends.
  const a = last * deg;
  const leave = [r * 0.86 * Math.cos(a), r * 0.86 * Math.sin(a)];
  const t = [-Math.sin(a), Math.cos(a)];
  const handEnd = [leave[0] + t[0] * L, leave[1] + t[1] * L];
  shapes.push({ type: "line", from: leave, to: handEnd, style: "cable" });

  // The pulls: each arrow starts at its rope's end and points away from the post.
  const name = (end) => ((end === "load") === tightLoad ? "T_2" : "T_1");
  const value = (end) => {
    const unknown = find === end;
    if (unknown && !shown) return "?";
    return format(end === "load" ? v.load : v.hand, "N");
  };
  shapes.push({ type: "arrow", id: name("load"), from: loadEnd, to: [loadEnd[0], loadEnd[1] - arrow], role: find === "load" ? "unknown" : "known",
    label: `${name("load")} = ${value("load")}` });
  shapes.push({ type: "arrow", id: name("hand"), from: handEnd, to: [handEnd[0] + t[0] * arrow, handEnd[1] + t[1] * arrow], role: find === "hand" ? "unknown" : "known",
    label: `${name("hand")} = ${value("hand")}` });

  // The angle of contact, from the load end round to the hand end.
  const bText = find === "beta" && !shown ? "β = ?" : turns > 0 ? `β = ${format(v.beta, "deg")}` : format(v.beta, "deg");
  if (last < 359) shapes.push({ type: "arc", center: [0, 0], r: 1.45 * r, start: 0, end: last, label: bText });
  // The key: what each end is, μs, and the turns (a wrap over 360° can't show in one arc).
  const lines = [`μ_s = ${find === "mus" && !shown ? "?" : num2(v.mus)}`, `load end: ${name("load")}${tightLoad ? " (tight)" : ""}`, `hand end: ${name("hand")}${tightLoad ? "" : " (tight)"}`];
  if (turns > 0 || last >= 359) lines.push(`${find === "beta" && !shown ? "β = ?" : `β = ${format(v.beta, "deg")} (${num2(v.turns)} turns)`}`);
  shapes.push({ type: "note", lines });

  // A fixed window round the post and both rope ends at their longest, so a slider that turns
  // the hand end round never rescales the picture.
  const reach = r + L + arrow + 0.6 * r;
  shapes.push({ type: "frame", frame: { xmin: -reach - 1.4 * r, xmax: reach + 1.4 * r, ymin: -reach, ymax: reach } });
  return shapes;
}

const num2 = (x) => String(Math.round(x * 100) / 100);
