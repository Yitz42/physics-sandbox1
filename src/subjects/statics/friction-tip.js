// friction-tip.js — tipping versus slipping (Unit 9.2).
//
// A crate is not really a particle: it has a width w and a height h, and a push
// meets it at some height. The floor's push N is spread over the crate's base; its
// resultant acts wherever the moments need it to. Push harder (or higher) and N moves
// toward the front corner. The crate TIPS once N would have to act beyond that corner.
//
// So a crate can lose its footing two ways:
//   slip — the friction it needs reaches μ_s N (friction.js);
//   tip  — N reaches the corner O it would tip about.
// Whichever needs the smaller push (or the gentler slope) happens first.
//
// setup.tipping: { about } turns this on for a block (friction.js). `about` names the
// corner O: "up" / "right" (the corner up the slope, or on the right on a floor) or
// "down" / "left". Default: the way setup.find.motion says, else "right".
// forces[i].height: how far above the surface the push (or rope) meets the crate (m).
//
// x: how far N acts behind O, measured along the base into the crate (0 … w while it
// stands; x < 0 would put N outside the base: it tips about O). The moment equation
// used is ΣM_O = 0, so N's arm is x and friction (along the floor, through O) has none.
//
// Axes as in friction.js: t up the slope, n away from it; CCW moments positive.

import { surfaceAxes, weightOfBlock, forceDir } from "./friction.js";
import { fixedTex, sigFig } from "../../core/units.js";

const deg = Math.PI / 180;
const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const num = (v) => sigFig(v, 4);

// +1: O is the corner up the slope (on the right on a floor); −1: the other one.
export function tipSide(setup) {
  const about = (setup.tipping && setup.tipping.about) || (setup.find && setup.find.motion) || "right";
  return ["up", "right"].includes(about) ? 1 : -1;
}

// Where a push meets the crate, relative to C (the middle of its base), as [along t, along n].
// With a height: on the face it pushes on (the back face; a rope pulls on the front face).
// Without one: where its line through the crate's centre meets the crate's outline.
export function pushPoint(f, setup) {
  const { w, h } = setup.block;
  const { t, n } = surfaceAxes(setup);
  const u = forceDir(f, setup);
  const a = dot(u, t), b = dot(u, n);
  if (f.height != null) {
    const way = Math.sign(a) || 1; // the way the push acts along the surface
    const side = f.rope ? way : -way; // a push meets the back face, a rope the front
    return [side * (w / 2), f.height];
  }
  // (Aimed at the centre G = (0, h/2): back along −u to the outline.)
  const back = [-a, -b];
  const k = Math.min(Math.abs(back[0]) > 1e-9 ? w / 2 / Math.abs(back[0]) : Infinity, Math.abs(back[1]) > 1e-9 ? h / 2 / Math.abs(back[1]) : Infinity);
  const k2 = f.rope ? -k : k; // a rope starts on the far side, where its line leaves the crate
  return [back[0] * k2, h / 2 + back[1] * k2];
}

// Each force's moment about O, in parts (components along and across the surface),
// for the equation and for the numbers. N is left out: it is the unknown N·x.
export function tipMomentParts(setup) {
  const { w, h } = setup.block;
  const { angle } = surfaceAxes(setup);
  const s = tipSide(setup);
  const W = weightOfBlock(setup);
  const sin = Math.sin(angle * deg), cos = Math.cos(angle * deg);
  const O = [s * (w / 2), 0]; // (surface coordinates: [along t, along n], from C)
  const parts = [];
  // W at G = (0, h/2): its part down the slope (W sin θ, arm h/2) and into it (W cos θ, arm w/2).
  if (Math.abs(sin) > 1e-12) parts.push({ id: "W", part: "along", value: W * sin, arm: h / 2, moment: cross([-O[0], h / 2], [-W * sin, 0]), trig: { fn: "sin", angle } });
  parts.push({ id: "W", part: "across", value: W * (angle ? cos : 1), arm: w / 2, moment: cross([-O[0], h / 2], [0, -W * cos]), trig: angle ? { fn: "cos", angle } : null });
  const { t, n } = surfaceAxes(setup);
  for (const f of setup.forces || []) {
    if (!(f.magnitude > 0)) continue;
    const u = forceDir(f, setup);
    const a = dot(u, t), b = dot(u, n);
    const p = pushPoint(f, setup);
    const r = [p[0] - O[0], p[1] - O[1]];
    const tilt = Math.round((Math.acos(Math.min(1, Math.abs(a))) / deg) * 10) / 10;
    if (Math.abs(a) > 1e-9) parts.push({ id: f.id, symbol: f.symbol, part: "along", value: f.magnitude * Math.abs(a), arm: Math.abs(r[1]), moment: cross(r, [f.magnitude * a, 0]), trig: tilt > 1e-9 ? { fn: "cos", angle: tilt } : null });
    if (Math.abs(b) > 1e-9) parts.push({ id: f.id, symbol: f.symbol, part: "across", value: f.magnitude * Math.abs(b), arm: Math.abs(r[0]), moment: cross(r, [0, f.magnitude * b]), trig: tilt < 90 - 1e-9 ? { fn: "sin", angle: tilt } : null });
  }
  return parts;
}

// Where N acts (x behind O), how near the crate is to tipping, given N from ΣF_y' = 0.
// N acts x behind O (at −s·x along t from O) and pushes along n: its moment about O is −s·x·N.
export function tipState(setup, N) {
  const { w } = setup.block;
  const s = tipSide(setup);
  const others = tipMomentParts(setup).reduce((sum, p) => sum + p.moment, 0);
  if (!(N > 1e-9)) return { x: NaN, tipRatio: Infinity };
  const x = others / (s * N); // −s x N + others = 0
  // How far N has moved from the middle toward O, as a share of the way (1 = at O).
  const tipRatio = (w / 2 - x) / (w / 2);
  return { x, tipRatio };
}

// ---- The moment equation (added to the block's two force equations) --------------------

const trigTex = (tr) => (tr ? `\\${tr.fn} ${num(tr.angle)}^\\circ` : "");
const trigVal = (tr) => (tr ? (tr.fn === "cos" ? Math.cos(tr.angle * deg) : Math.sin(tr.angle * deg)) : 1);

// ΣM_O = 0 with N's term N·x (x unknown). Each other force's part: its size, its trig factor,
// and its arm about O (the arm's wrong twin — the distance to the centre, or the whole
// width — is the equation's "swap" mistake).
export function tipEquation(setup, N) {
  const { w, h } = setup.block;
  const s = tipSide(setup);
  const W = weightOfBlock(setup);
  const terms = [{ id: "x", sign: -s, symbol: "x", value: null, factor: { tex: "N", numTex: `(${num(N)}\\,\\text{N})`, pre: true, value: N } }];
  for (const p of tipMomentParts(setup)) {
    if (Math.abs(p.moment) < 1e-12) continue;
    const wrongArm = p.id === "W" ? (p.part === "across" ? w : h) : p.part === "along" ? p.arm - h / 2 : w;
    const armTex = (d) => `(${num(d)}\\,\\text{m})`;
    const tr = trigTex(p.trig), tv = trigVal(p.trig);
    const factor = {
      tex: `${tr}\\,${armTex(p.arm)}`, value: tv * p.arm,
      alt: Math.abs(wrongArm - p.arm) > 1e-9 && wrongArm > 0 ? { tex: `${tr}\\,${armTex(wrongArm)}`, value: tv * wrongArm } : undefined,
      swapKind: "momentArm",
      swapReason: p.id === "W" ? "uses the wrong arm: the weight acts at the centre, half the width (or half the height) from O" : "uses the wrong arm: measure the push's height from O, on the floor — not from the centre",
    };
    if (!factor.alt) delete factor.alt;
    // (The term's value is the force's whole size; its factor holds the trig and the arm.)
    const size = p.id === "W" ? W : (setup.forces || []).find((q) => q.id === p.id).magnitude;
    terms.push({ id: p.id, sign: Math.sign(p.moment), symbol: p.id === "W" ? "W" : p.symbol, value: size, factor });
  }
  return { id: "sumMO", lhs: "\\Sigma M_O", form: "zero", terms };
}

// ---- The lines under the equations ---------------------------------------------------

export function tipSummary(setup, v) {
  const { w } = setup.block;
  const lines = [];
  if (!Number.isFinite(v.x)) return lines;
  const inside = v.x >= -1e-9;
  lines.push(`x = ${fixedTex(v.x, "m", 3)}\\ \\text{behind } O \\qquad ${inside ? `0 \\le x \\le ${num(w)}\\,\\text{m}: \\text{ N acts under the crate — it doesn't tip}` : "x < 0: \\text{ N would act outside the base — it tips about } O"}`);
  if (Number.isFinite(v.criticalSlip) && Number.isFinite(v.criticalTip)) {
    const sym = setup.find.symbol || "P", unit = setup.find.unit || "";
    lines.push(`\\text{Slips at } ${sym} = ${fixedTex(v.criticalSlip, unit)},\\quad \\text{tips at } ${sym} = ${fixedTex(v.criticalTip, unit)} \\;\\Rightarrow\\; \\text{it ${v.criticalSlip <= v.criticalTip ? "slips" : "tips"} first}`);
  }
  return lines;
}
