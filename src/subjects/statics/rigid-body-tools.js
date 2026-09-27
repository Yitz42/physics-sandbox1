// rigid-body-tools.js — extras for rigid bodies on supports (Unit 7 on):
//   • what the FBD drawing tool needs (fbd), and wrong FBDs for debug (mutate),
//   • the answers common mistakes give, with what went wrong (mistakes),
//   • the lines under the equations (summary) and a shadow of wrong answers.

import { scale } from "../../core/vector.js";
import { clone } from "../../core/paths.js";
import { fixedTex, format } from "../../core/units.js";
import { placeArrow } from "../../render/fbd.js";
import { allReactions, SUPPORT_NAMES } from "./supports.js";
import { solveRigidBody, weightOf, bodySize, outwardAt, bodyCentre } from "./rigid-body.js";
import { swapTrig } from "./directions.js";

// ---- Drawing the FBD (solve challenge) -----------------------------------------

// { forces, directions, points, arrowLength, origin } — see challenges/common/fbd-tool.js.
// forces: every reaction, plus the weight if the body has mass.
export function rigidBodyFbd(setup) {
  const forces = allReactions(setup).map((r) => ({
    id: r.id, symbol: r.symbol, dir: r.dir, at: r.at, outward: r.moment ? null : outwardAt(setup, r),
    either: r.either, kind: r.kind, moment: !!r.moment, sense: r.sense,
  }));
  const W = weightOf(setup);
  if (W) forces.push({ id: "W", symbol: "W", dir: [0, -1], at: W.at, outward: [0, -1], kind: "weight", body: true });
  // Arrows snap to the 8 compass directions, plus both ways along every reaction.
  const directions = [];
  for (let k = 0; k < 8; k++) directions.push([Math.cos((k * Math.PI) / 4), Math.sin((k * Math.PI) / 4)]);
  for (const f of forces) if (!f.moment) directions.push(f.dir, scale(f.dir, -1));
  // Named points where a (tempting, wrong) palette force can be placed: the supports and G.
  const points = {};
  for (const s of setup.supports || []) points[s.id] = { at: s.at, outward: outwardAt(setup, { support: s.id, at: s.at, kind: "component" }) };
  points.G = { at: W ? W.at : bodyCentre(setup), outward: [0, -1] };
  return { forces, directions: dedupe(directions), points, arrowLength: 0.2 * bodySize(setup), origin: (setup.supports[0] || { at: [0, 0] }).at };
}

function dedupe(dirs) {
  const out = [];
  for (const d of dirs) if (!out.some((e) => Math.abs(e[0] - d[0]) < 1e-6 && Math.abs(e[1] - d[1]) < 1e-6)) out.push(d);
  return out;
}

// ---- Debug challenges: a deliberately wrong FBD ----------------------------------
//   { kind: "remove", force: "A_x" }     a reaction (or the weight "W") is missing
//   { kind: "reverse", force: "T_C" }    an arrow points the wrong way
//   { kind: "extra", force: "B_x", extra: { support: "B", direction: "right" } }
//                                        a reaction the support can't provide
//                                        (extra: { support, moment: true } for a moment)
export function rigidBodyMutate(setup, mutation) {
  const s = clone(setup);
  const e = (s.fbdEdits = { remove: [], reverse: [], extra: [] });
  if (mutation.kind === "remove") e.remove.push(mutation.force);
  else if (mutation.kind === "reverse") e.reverse.push(mutation.force);
  else if (mutation.kind === "extra") e.extra.push({ id: mutation.force, symbol: mutation.force, ...mutation.extra });
  else throw new Error(`Unknown FBD mutation "${mutation.kind}"`);
  return s;
}

// ---- Common mistakes -----------------------------------------------------------

// Why a count of unknowns at one support is wrong, by support type.
const COUNT_WHY = {
  pin: "A pin stops the body sliding in x AND in y, but lets it turn: two unknowns, $A_x$ and $A_y$.",
  roller: "A roller rolls along its surface, so it only stops motion into the surface: one unknown, a push perpendicular to the surface.",
  smooth: "A smooth surface can't grip, so there's no force along it: one unknown, a push perpendicular to the surface.",
  cable: "A cable can only pull along its own length: one unknown, its tension.",
  fixed: "A fixed support stops sliding in x and y AND stops turning: three unknowns, $A_x$, $A_y$ and a moment $M_A$.",
  none: "Nothing is attached here, so there's no reaction.",
};

// [{ value, message }] for quantity `name`.
export function rigidBodyMistakes(setup, name) {
  const res = solveRigidBody(setup);
  const correct = res.values[name];
  const list = [];
  // kind: what sort of mistake it is (see src/core/diagnosis.js), for the comprehension page.
  const add1 = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - correct) < 1e-6 * Math.max(1, Math.abs(correct))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };
  const m = name.match(/^n_(.+)$/);
  if (m) {
    const s = setup.supports.find((q) => q.id === m[1]);
    const why = COUNT_WHY[s.type].replace(/A_x/g, `${s.id}_x`).replace(/A_y/g, `${s.id}_y`).replace(/M_A/g, `M_${s.id}`);
    for (let v = 0; v <= 3; v++) add1(v, `The support at ${s.id} is a ${SUPPORT_NAMES[s.type]}. ${why}`, "supports");
    return list;
  }
  if (name === "n") {
    for (let v = 0; v <= 6; v++) add1(v, "Count each support's unknowns and add them: a pin 2, a roller, surface or cable 1, a fixed support 3.", "supports");
    return list;
  }
  const r = allReactions(setup).find((x) => x.id === name);
  if (!r) return list;
  const again = (s) => solveRigidBody(s).values[name];
  const sym = r.symbol.replace(/[{}]/g, "");
  if (Math.abs(correct) > 1e-9) {
    add1(-correct, r.moment
      ? `Right size, wrong sign: counterclockwise is positive, so a clockwise ${sym} is negative.`
      : r.kind === "component" ? `Right size, wrong sign: ${sym} is positive if it points ${r.direction === "right" ? "right (+x)" : "up (+y)"}.` : "Right size, wrong sign: this support can only push (or pull), so its reaction is positive.", "sign");
  }
  const b = setup.body || {};
  if (b.mass) {
    add1(again({ ...setup, body: { ...b, mass: 0 } }), "Did you forget the body's weight? $W = mg$ acts at its centre of gravity.", "missing");
    add1(again({ ...setup, body: { ...b, mass: b.mass / 9.81 } }), "Did you use the mass (kg) as a force? The weight is $W = mg$, in newtons.", "weight");
  }
  for (const f of setup.forces || []) {
    if (typeof f.direction !== "object") continue; // only slanted forces have sin/cos to mix up
    const s = clone(setup);
    s.forces.find((x) => x.id === f.id).direction = swapTrig(f.direction);
    add1(again(s), `Check ${f.symbol}'s components: its x and y parts look swapped (sin ↔ cos).`, "trig");
  }
  return list;
}

// ---- Lines under the equations ----------------------------------------------------

export function rigidBodySummary(setup, result, { mode = "symbolic", reveal = true } = {}) {
  const reactions = allReactions(setup);
  const lines = [];
  const names = reactions.map((r) => r.symbol).join(",\\ ") || "\\text{none}";
  lines.push(`\\text{Unknowns: } ${names} \\;(${reactions.length}) \\qquad \\text{Equations: } 3`);
  const W = weightOf(setup);
  if (W && mode === "numeric") lines.push(`W = mg = (${W.mass}\\,\\text{kg})(9.81\\,\\text{m/s}^2) = ${fixedTex(W.mass * 9.81, "N")}`);
  if (reveal && result.status === "determinate" && setup.analysis !== "count") {
    lines.push(reactions.map((r) => `${r.symbol} = ${fixedTex(result.values[r.id], r.moment ? "N·m" : "N")}`).join(",\\quad "));
  }
  return lines;
}

// Their numbers as a faint red shadow: each guessed reaction drawn at its
// support with their size and sense.
export function rigidBodyShadow(setup, res, guesses, { k, size }) {
  const out = [];
  for (const r of allReactions(setup)) {
    const g = guesses[r.id];
    if (!Number.isFinite(g) || Math.abs(g) < 1e-9) continue;
    if (r.moment) {
      out.push({ type: "moment", center: r.at, sense: Math.sign(g), rPx: 40, role: "shadow", label: `your ${r.symbol} = ${format(g, "N·m")}` });
      continue;
    }
    const dir = g < 0 ? scale(r.dir, -1) : r.dir;
    const len = Math.min(0.6 * size, Math.max(0.1 * size, Math.abs(g) * k));
    out.push({ type: "arrow", id: `shadow-${r.id}`, ...placeArrow(r.at, dir, len, outwardAt(setup, { ...r, dir })), role: "shadow", label: `your ${r.symbol} = ${format(g, "N")}` });
  }
  return out;
}

