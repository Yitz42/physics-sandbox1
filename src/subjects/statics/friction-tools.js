// friction-tools.js — a block's equations, the lines under them, the answers common
// slips give, and a student's working with one wrong line (Unit 9.1). The physics is
// in friction.js; a body with rough contacts (a ladder) uses the rigid-body tools.

import { fixedTex, sigFig } from "../../core/units.js";
import { clone } from "../../core/paths.js";
import { rigidBodyEquations } from "./rigid-body.js";
import { rigidBodyMistakes } from "./rigid-body-tools.js";
import { surfaceAxes, weightOfBlock, forceDir, isBody, placeAlong, solveFriction, criticalValue, blockState } from "./friction.js";

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
  return [
    { id: "sumFy", lhs: level ? "\\Sigma F_y" : "\\Sigma F_{y'}", form: "zero", terms: [{ id: "N", sign: 1, symbol: "N", value: null }, ...pushes.map((p) => p.y).filter(Boolean), wy] },
    { id: "sumFx", lhs: level ? "\\Sigma F_x" : "\\Sigma F_{x'}", form: "zero", terms: [{ id: "F", sign: 1, symbol: "F", value: null }, ...pushes.map((p) => p.x).filter(Boolean), ...(wx ? [wx] : [])] },
  ];
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
  lines.push(STATE_TEXT[res.state]);
  if (res.state === "slides" && setup.muk != null) lines.push(`F = \\mu_k N = (${setup.muk})(${num(v.N)}) = ${fixedTex(Math.abs(v.F), "N")},\\ \\text{against the motion (${res.moves === "down" ? "down" : "up"} the slope)}`);
  if (setup.find && Number.isFinite(v.critical)) {
    lines.push(`\\text{Impending motion ${setup.find.motion} — friction at its limit, } F = ${["up", "right"].includes(setup.find.motion) ? "-" : ""}\\mu_s N: \\quad ${setup.find.symbol} = ${fixedTex(v.critical, setup.find.unit || "", setup.find.unit === "deg" ? 1 : 1)}`);
  }
  return lines;
}

// ---- Answers that common slips give ------------------------------------------------------

export function frictionMistakes(setup, name) {
  if (isBody(setup)) return bodyMistakes(setup, name);
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

// ---- A student's working with one wrong line (debug, view "steps") -----------------------
// mutation.slip: "noCos" (N = W on a ramp), "swap" (sin ↔ cos in F), "limit" (F = μ_s N
// though it holds), "weight" (μ_s W instead of μ_s N), "direction" (the wrong way).

export function frictionSteps(setup, mutation) {
  const res = solveFriction(setup);
  const v = res.values;
  const { angle } = surfaceAxes(setup);
  const W = weightOfBlock(setup);
  const th = `${num(angle)}^\\circ`;
  const eqs = blockEquations(setup);
  const Fy = eqs[0].terms.filter((t) => t.id !== "N" && t.id !== "W");
  const Fx = eqs[1].terms.filter((t) => t.id !== "F" && t.id !== "W");
  // One force's term, flipped to the other side of the equation (N = W cos θ − …).
  const moved = (t) => `${t.sign > 0 ? "-" : "+"} ${t.symbol}${t.factor ? t.factor.tex : ""}`;
  const pushY = Fy.map(moved).join(" "), pushX = Fx.map(moved).join(" ");
  const up = angle ? "up the slope" : "to the right", down = angle ? "down the slope" : "to the left";
  const slip = mutation.slip;
  const Nw = slip === "noCos" ? W : v.N;
  const Fw = slip === "swap" ? W * Math.cos(angle * deg) - (W * Math.sin(angle * deg) - v.Fneed) : v.Fneed;
  const limitW = slip === "weight" ? setup.mus * W : setup.mus * Nw;
  const holdsW = Math.abs(Fw) < limitW;
  const line = (id, tex) => ({ id, tex });
  const Ntex = (n, wTex) => `\\Sigma F_{y'} = 0: \\quad N = ${wTex} ${pushY} = ${fixedTex(n, "N")}`;
  const Ftex = (f, wTex) => `\\Sigma F_{x'} = 0: \\quad F = ${wTex} ${pushX} = ${fixedTex(f, "N")}`;
  const lim = (n, wTex) => `\\mu_s ${wTex} = (${setup.mus})(${num(n)}) = ${fixedTex(setup.mus * n, "N")}`;
  const verdict = (f, max, holds, dir) => holds
    ? `|F| = ${fixedTex(Math.abs(f), "N")} < ${fixedTex(max, "N")}: \\text{ it holds; friction } ${fixedTex(Math.abs(f), "N")} \\text{ ${dir}}`
    : `|F| > \\mu_s N: \\text{ it slides}`;
  const dirOf = (f) => (f >= 0 ? up : down);
  const correct = [
    Ntex(v.N, `W\\cos ${th}`), Ftex(v.Fneed, `W\\sin ${th}`), lim(v.N, "N"), verdict(v.Fneed, v.Fmax, res.state !== "slides", dirOf(v.Fneed)),
  ];
  const lines = [
    line("N", slip === "noCos" ? `\\Sigma F_{y'} = 0: \\quad N = W ${pushY} = ${fixedTex(Nw, "N")}` : correct[0]),
    line("F", slip === "swap" ? Ftex(Fw, `W\\cos ${th}`) : correct[1]),
    line("max", slip === "weight" ? lim(W, "W") : lim(Nw, "N")),
    line("verdict", slip === "limit"
      ? `\\text{Friction: } F = \\mu_s N = ${fixedTex(setup.mus * v.N, "N")} \\text{ ${dirOf(v.Fneed)}}`
      : slip === "direction" ? verdict(Fw, limitW, holdsW, dirOf(-Fw)) : verdict(Fw, limitW, holdsW, dirOf(Fw))),
  ];
  const WHY = {
    noCos: { wrong: "N", kind: "trig", fix: "Use the part of W across the slope: $W\\cos\\theta$",
      explain: "On a ramp only the part of the weight ACROSS the slope, $W\\cos\\theta$, presses the crate into it. N is not the whole weight." },
    swap: { wrong: "F", kind: "trig", fix: "Swap sin and cos: the part of W down the slope is $W\\sin\\theta$",
      explain: "θ is between the slope and the level, so the part of W along the slope is $W\\sin\\theta$ (and across it, $W\\cos\\theta$)." },
    limit: { wrong: "verdict", kind: "concept", fix: "Friction is what equilibrium needs: F from $\\Sigma F_{x'} = 0$",
      explain: "$\\mu_s N$ is only the LIMIT. While the crate holds, friction is just as big as equilibrium needs — the F from $\\Sigma F_{x'} = 0$." },
    weight: { wrong: "max", kind: "concept", fix: "Multiply $\\mu_s$ by N, not W",
      explain: "Friction's limit is $\\mu_s N$: it depends on how hard the surfaces press together, the normal force — not the weight." },
    direction: { wrong: "verdict", kind: "sign", fix: `Friction acts ${dirOf(v.Fneed)} (the sign of F)`,
      explain: `F came out ${v.Fneed >= 0 ? "positive" : "negative"}, and F was taken positive ${up}: friction acts ${dirOf(v.Fneed)}, against the way the crate tends to slide.` },
  }[slip];
  const follows = [];
  const ids = ["N", "F", "max", "verdict"];
  lines.forEach((l, i) => { if (l.id !== WHY.wrong && ids.indexOf(l.id) > ids.indexOf(WHY.wrong) && l.tex !== correct[i]) follows.push(l.id); });
  const others = [
    { label: "Flip the sign of F", feedback: "The signs are right in that line. Check which part of W it uses." },
    { label: "Use $\\mu_k$ instead of $\\mu_s$", feedback: "The crate isn't sliding yet: static friction, $\\mu_s$, is the one that applies." },
    { label: "Add the push again", feedback: "The push is in the line already. Look at the weight's part, or at what friction really is." },
  ];
  return { lines, wrong: WHY.wrong, follows, fixes: [{ label: WHY.fix, correct: true }, ...others.slice(0, 2)], explain: WHY.explain, kind: WHY.kind, corrected: correct };
}
