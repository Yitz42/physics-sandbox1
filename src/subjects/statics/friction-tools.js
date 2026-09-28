// friction-tools.js — a block's equations, the lines under them, the answers common
// slips give, and a student's working with one wrong line (Unit 9.1). The physics is
// in friction.js; a body with rough contacts (a ladder) uses the rigid-body tools.

import { fixedTex, sigFig } from "../../core/units.js";
import { clone } from "../../core/paths.js";
import { rigidBodyEquations } from "./rigid-body.js";
import { rigidBodyMistakes } from "./rigid-body-tools.js";
import { surfaceAxes, weightOfBlock, forceDir, isBody, placeAlong, solveFriction, criticalValue, blockState } from "./friction.js";
import { tipEquation, tipSummary } from "./friction-tip.js";
import { tipMistakes } from "./friction-tip-tools.js";

const deg = Math.PI / 180;
const dot = (u, v) => u[0] * v[0] + u[1] * v[1];
const num = (v) => sigFig(v, 4);

// ---- Equations ---------------------------------------------------------------------

// The trig factor for a component: cos/sin of an angle in degrees, with the swapped
// one as its likely slip (equations.js factor.alt).
function trig(fn, a) {
  const other = fn === "cos" ? "sin" : "cos";
  const v = (f) => (f === "cos" ? Math.cos(a * deg) : Math.sin(a * deg));
  return { tex: `\\${fn} ${num(a)}^\\circ`, value: v(fn), alt: { tex: `\\${other} ${num(a)}^\\circ`, value: v(other) } };
}

// A push's parts along the slope (x') and away from it (y'), as terms. A force given
// along the slope with a tilt b: P cos b along, P sin b away (signs from the picture).
function pushTerms(f, setup) {
  const { t, n } = surfaceAxes(setup);
  const u = forceDir(f, setup);
  const c = dot(u, t), d = dot(u, n);
  // The angle between the force and the slope (0 … 90°), for its cos and sin.
  const b = Math.round((Math.acos(Math.min(1, Math.abs(c))) / deg) * 10) / 10;
  const term = (part, fn) => (Math.abs(part) < 1e-9 ? null : { id: f.id, sign: Math.sign(part), symbol: f.symbol, value: f.magnitude, factor: b < 1e-9 || b > 90 - 1e-9 ? null : trig(fn, b) });
  return { x: term(c, "cos"), y: term(d, "sin") };
}

// ΣF_y' = 0 (gives N), then ΣF_x' = 0 (gives F, assumed up the slope).
export function blockEquations(setup) {
  const { angle } = surfaceAxes(setup);
  const level = Math.abs(angle) < 1e-9;
  const W = weightOfBlock(setup);
  const pushes = (setup.forces || []).map((f) => pushTerms(f, setup));
  const wy = { id: "W", sign: -1, symbol: "W", value: W, factor: level ? null : trig("cos", angle) };
  const wx = level ? null : { id: "W", sign: -1, symbol: "W", value: W, factor: trig("sin", angle) };
  const eqs = [
    { id: "sumFy", lhs: level ? "\\Sigma F_y" : "\\Sigma F_{y'}", form: "zero", terms: [{ id: "N", sign: 1, symbol: "N", value: null }, ...pushes.map((p) => p.y).filter(Boolean), wy] },
    { id: "sumFx", lhs: level ? "\\Sigma F_x" : "\\Sigma F_{x'}", form: "zero", terms: [{ id: "F", sign: 1, symbol: "F", value: null }, ...pushes.map((p) => p.x).filter(Boolean), ...(wx ? [wx] : [])] },
  ];
  // A crate that can tip (Unit 9.2): ΣM_O = 0 about the corner it would tip about, for x.
  if (setup.tipping) eqs.push(tipEquation(setup, blockState(setup).N));
  return eqs;
}

export function frictionEquations(setup, result) {
  return isBody(setup) ? rigidBodyEquations(placeAlong(setup)) : blockEquations(setup);
}

// ---- The lines under the equations -------------------------------------------------------

const STATE_TEXT = {
  holds: "|F| < \\mu_s N: \\text{ friction holds it}",
  impending: "|F| = \\mu_s N: \\text{ motion is impending (about to slip)}",
  slides: "|F| > \\mu_s N \\text{ would be needed: it slides}",
  lifts: "N < 0: \\text{ it would lift off}",
  tips: "x < 0 \\text{ would be needed: N can't act outside the base — it tips about } O",
  tipImpending: "x = 0: \\text{ N at the corner } O \\text{ — tipping is impending}",
};

export function frictionSummary(setup, result, { mode = "symbolic", reveal = true } = {}) {
  const res = result || solveFriction(setup);
  const v = res.values;
  const lines = [];
  const numbers = mode === "numeric";
  if (res.kind === "body") {
    if (!reveal || res.status !== "determinate") return lines;
    for (const [id, c] of Object.entries(res.contacts)) {
      const q = setup.supports.find((s) => s.id === id);
      lines.push(`N_${id} = ${fixedTex(c.N, "N")},\\quad F_${id} = ${fixedTex(c.Fneed, "N")},\\quad \\mu_s N_${id} = (${q.mus})(${num(c.N)}) = ${fixedTex(c.Fmax, "N")}`);
      lines.push(`\\text{Needed: } \\mu_s \\ge \\dfrac{|F_${id}|}{N_${id}} = ${num(v[`mu_${id}`])} \\qquad ${STATE_TEXT[c.state].replace(/N\b/g, `N_${id}`).replace(/F\b/g, `F_${id}`)}`);
    }
    if (setup.find && Number.isFinite(v.critical)) lines.push(`\\text{Slipping starts at } ${setup.find.symbol} = ${fixedTex(v.critical, setup.find.unit || "", 2)}`);
    return lines;
  }
  if (numbers && setup.mass != null) lines.push(`W = mg = (${setup.mass}\\,\\text{kg})(9.81\\,\\text{m/s}^2) = ${fixedTex(v.W, "N")}`);
  if (!reveal || res.status === "unstable" && res.state === "lifts") {
    if (res.state === "lifts" && reveal) lines.push(STATE_TEXT.lifts);
    return lines;
  }
  const up = surfaceAxes(setup).angle ? "up the slope" : "to the right";
  lines.push(`N = ${fixedTex(v.N, "N")},\\quad \\mu_s N = (${setup.mus})(${num(v.N)}) = ${fixedTex(v.Fmax, "N")}`);
  lines.push(`\\text{Friction needed: } F = ${fixedTex(v.Fneed, "N")} \\;(\\text{+ ${up}})`);
  if (setup.tipping) lines.push(...tipSummary(setup, v));
  lines.push(STATE_TEXT[res.state]);
  if (res.state === "slides" && setup.muk != null) lines.push(`F = \\mu_k N = (${setup.muk})(${num(v.N)}) = ${fixedTex(Math.abs(v.F), "N")},\\ \\text{against the motion (${res.moves === "down" ? "down" : "up"} the slope)}`);
  if (setup.find && Number.isFinite(v.critical) && !setup.tipping) {
    lines.push(`\\text{Impending motion ${setup.find.motion} — friction at its limit, } F = ${["up", "right"].includes(setup.find.motion) ? "-" : ""}\\mu_s N: \\quad ${setup.find.symbol} = ${fixedTex(v.critical, setup.find.unit || "", setup.find.unit === "deg" ? 1 : 1)}`);
  }
  return lines;
}

// ---- Answers that common slips give ------------------------------------------------------

export function frictionMistakes(setup, name) {
  if (isBody(setup)) return bodyMistakes(setup, name);
  if (setup.tipping && ["critical", "criticalSlip", "criticalTip", "x"].includes(name)) return tipMistakes(setup, name, frictionMistakes);
  const res = solveFriction(setup);
  const right = res.values[name];
  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };
  const { angle } = surfaceAxes(setup);
  const W = weightOfBlock(setup);
  const sin = Math.sin(angle * deg), cos = Math.cos(angle * deg);
  const v = res.values;
  const plain = blockState(setup, { plainN: true });
  if (name === "N") {
    if (angle) add(W, "On a ramp the crate doesn't press with its whole weight: only the part of W across the slope, $W\\cos\\theta$, pushes into it.", "trig");
    if (angle) add(W * sin + (v.N - W * cos), "Sin and cos swapped: the part of W across the slope is $W\\cos\\theta$ (θ is measured from the level, and so is the slope).", "trig");
    add(plain.N, "The push has a part across the surface too: it presses the crate in (or lifts it off), changing N.", "missing");
  }
  if (name === "F" || name === "Fneed") {
    if (res.state === "holds") add(Math.sign(right || 1) * v.Fmax, "That's $\\mu_s N$, the MOST friction can give. The crate holds, so friction is only as big as equilibrium needs: find it from $\\Sigma F_{x'} = 0$.", "concept");
    add(-right, "Right size, wrong direction: F is positive up the slope. Which way does the crate tend to slide?", "sign");
    if (angle) add(W * cos - (W * sin - right), "Sin and cos swapped: the part of W down the slope is $W\\sin\\theta$.", "trig");
  }
  if (name === "Fmax") {
    add(setup.mus * W, "$\\mu_s$ multiplies the NORMAL force N, not the weight — on a ramp, or with a slanted push, they differ.", "concept");
    if (setup.muk != null) add(setup.muk * v.N, "That's $\\mu_k N$, for sliding. The most friction can give while it holds uses $\\mu_s$.", "concept");
  }
  if (name === "critical" && setup.find) {
    const again = (s, opts) => criticalValue(s, opts);
    if (setup.muk != null) add(again({ ...setup, mus: setup.muk }), "That uses $\\mu_k$. Motion is only about to START, so friction is at its static limit $\\mu_s N$.", "concept");
    add(again(setup, { plainN: true }), "The push changes N: its part across the surface presses the crate in (or eases it off). Put it in $\\Sigma F_{y'} = 0$.", "missing");
    const flip = clone(setup);
    for (const f of flip.forces || []) if (f.tilt) f.tilt = -f.tilt;
    add(again(flip), "Check the push's angle: does it press the crate into the surface or lift it off? That decides the sign of its part in N.", "sign");
    const other = { ...setup, find: { ...setup.find, motion: { up: "down", down: "up", right: "left", left: "right" }[setup.find.motion] } };
    add(again(other), "That's for motion the OTHER way. Friction always acts against the motion that's about to happen.", "direction");
    if (setup.find.unit === "deg") {
      add(Math.atan(setup.mus), "That's in radians. Switch your calculator to degrees.", "calculator");
      add(Math.atan(1 / setup.mus) / deg, "Upside down: at the slip angle $\\tan\\theta = F/N = \\mu_s$, so $\\theta = \\tan^{-1}\\mu_s$.", "trig");
    }
  }
  if (name === "mu") add(v.N / Math.abs(v.Fneed), "Upside down: $\\mu_s = F/N$ — friction over the normal force.", "algebra");
  return list;
}

function bodyMistakes(setup, name) {
  const s = placeAlong(setup);
  const res = solveFriction(setup);
  const right = res.values[name];
  const list = rigidBodyMistakes(s, name).slice();
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };
  const m = name.match(/^(mu|Fmax)_(.+)$/);
  if (m) {
    const c = res.contacts[m[2]];
    const q = setup.supports.find((x) => x.id === m[2]);
    if (m[1] === "mu") add(c.N / Math.abs(c.Fneed), `Upside down: $\\mu_s = F_${m[2]}/N_${m[2]}$ — friction over the normal force.`, "algebra");
    if (m[1] === "Fmax") add(q.mus * Math.abs(c.Fneed), `$\\mu_s$ multiplies the normal force $N_${m[2]}$, not the friction.`, "concept");
  }
  const F = name.match(/^F_(.+)$/);
  if (F) {
    const c = res.contacts[F[1]];
    const q = setup.supports.find((x) => x.id === F[1]);
    if (c && c.state === "holds") add(Math.sign(right || 1) * q.mus * c.N, `That's $\\mu_s N_${F[1]}$, the MOST friction can give. Unless it's about to slip, friction is only what equilibrium needs.`, "concept");
  }
  return list;
}
