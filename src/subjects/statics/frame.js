// frame.js — frames and machines (Unit 5.4): structures made of several bodies
// pinned together, at least one of them a multi-force member (not just pulled
// at two ends, like a truss member).
//
// Take the structure apart: every body is a rigid body in equilibrium, with its
// own three equations (ΣF_x, ΣF_y, ΣM). Where two bodies share a pin, the pin
// pushes on them EQUALLY AND OPPOSITELY: C_x, C_y on the first body, −C_x, −C_y
// on the second (Newton's third law). A two-force member (a "link": pinned at
// both ends, nothing else on it) carries one force along its own line, so it is
// not a body with three equations but a single unknown, F (tension +).
//   bodies × 3 equations;  unknowns: support reactions + 2 per pin + 1 per link.
//
// setup = {
//   bodies:   [{ id: "AC", points: [[x, y], …], about?: "C" | { at, label } }]   (drawn as beams)
//   pins:     [{ id: "C", at: [x, y], bodies: ["AC", "BC"] }]     C_x, C_y act on the FIRST body
//   links:    [{ id: "DE", from: "D", to: "E", ends: { D: [x, y], E: [x, y] }, bodies: ["AC", "BC"] }]
//             a two-force member from point D (on the first body) to E (on the second);
//             or, instead of ends, height: h — it meets each body where the body is h
//             high (a crossbar a slider can raise and lower)
//   supports: [{ id: "A", type, at, body, normal? }]   (see supports.js)
//   forces:   [{ id, symbol, magnitude, direction, at, body, push? }]
//   body:     "BC" (optional) the body a stage works on: its three equations only
//   knownReactions: true — the support reactions are shown as already found
//   Drawing only: view "apart" (taken apart: each body moved by apart[bodyId]),
//             apart: { AC: [dx, dy], … }, showReactions, dims, texts, showTwoForce
// }
// result.values: every unknown; "R_<pin>" (the pin force's size); "n" (unknowns),
// "eqs" (3 × bodies); link forces "F_<link>" (tension +).

import { sub, unit, mag } from "../../core/vector.js";
import { sigFig } from "../../core/units.js";
import { solveEquations } from "../../core/equations.js";
import { componentFactors } from "./directions.js";
import { armOf } from "./moment.js";
import { magnitudeOf } from "./particle.js";
import { reactionsOf } from "./supports.js";
import { memberDirection } from "./truss.js";

const numM = (v) => `(${sigFig(Math.abs(v), 3)}\\,\\text{m})`;

// Where a link's ends are: given (l.ends), or where each of its two bodies is at l.height.
export function linkEnds(setup, l) {
  if (l.height == null) return l.ends;
  const at = (bodyId) => {
    const pts = setup.bodies.find((b) => b.id === bodyId).points;
    for (let i = 1; i < pts.length; i++) {
      const [a, b] = [pts[i - 1], pts[i]];
      const lo = Math.min(a[1], b[1]), hi = Math.max(a[1], b[1]);
      if (l.height >= lo - 1e-9 && l.height <= hi + 1e-9 && Math.abs(b[1] - a[1]) > 1e-9) {
        const t = (l.height - a[1]) / (b[1] - a[1]);
        return [a[0] + t * (b[0] - a[0]), l.height];
      }
    }
    return pts[0];
  };
  return { [l.from]: at(l.bodies[0]), [l.to]: at(l.bodies[1]) };
}

// Every support reaction, with the body it acts on.
export function frameReactions(setup) {
  return (setup.supports || []).flatMap((s) => reactionsOf(s).map((r) => ({ ...r, body: s.body })));
}

// The moment point of a body: body.about (a pin, support or link end name, or a point),
// else its first pin.
export function bodyPoint(setup, b) {
  const named = (n) => {
    const p = (setup.pins || []).find((q) => q.id === n) || (setup.supports || []).find((q) => q.id === n);
    if (p) return { at: p.at, label: n };
    for (const l of setup.links || []) if (linkEnds(setup, l)[n]) return { at: linkEnds(setup, l)[n], label: n };
    return null;
  };
  if (b.about && typeof b.about === "object") return { at: b.about.at, label: b.about.label || "P" };
  if (b.about) return named(b.about);
  const pin = (setup.pins || []).find((q) => q.bodies.includes(b.id));
  return pin ? { at: pin.at, label: pin.id } : { at: b.points[0], label: "O" };
}

// Every force on one body: { id, symbol, direction, at, value (null = unknown), sign (±1: on this body) }.
export function forcesOn(setup, bodyId, known = {}) {
  const out = [];
  for (const f of setup.forces || []) if (f.body === bodyId) out.push({ id: f.id, symbol: f.symbol, direction: f.direction, at: f.at, value: magnitudeOf(f), sign: 1 });
  for (const r of frameReactions(setup)) if (r.body === bodyId) out.push({ id: r.id, symbol: r.symbol, direction: r.direction, at: r.at, value: known[r.id] ?? null, sign: 1, reaction: true });
  for (const p of setup.pins || []) {
    const i = p.bodies.indexOf(bodyId);
    if (i < 0) continue;
    const sign = i === 0 ? 1 : -1; // equal and opposite on the second body
    out.push({ id: `${p.id}_x`, symbol: `${p.id}_x`, direction: sign > 0 ? "right" : "left", at: p.at, value: null, sign, pin: p.id });
    out.push({ id: `${p.id}_y`, symbol: `${p.id}_y`, direction: sign > 0 ? "up" : "down", at: p.at, value: null, sign, pin: p.id });
  }
  for (const l of setup.links || []) {
    const i = l.bodies.indexOf(bodyId);
    if (i < 0) continue;
    // Tension pulls each end toward the other end.
    const [here, there] = i === 0 ? [l.from, l.to] : [l.to, l.from];
    const e = linkEnds(setup, l);
    out.push({ id: `F_${l.id}`, symbol: `F_{${l.id}}`, direction: memberDirection(sub(e[there], e[here])), at: e[here], value: null, sign: 1, link: l.id });
  }
  return out;
}

// One body's three equations. known: values treated as found (the reactions).
export function bodyEquations(setup, b, known = {}) {
  const P = bodyPoint(setup, b);
  const t = `\\text{${b.id}: } `;
  const fx = { id: `${b.id}_x`, lhs: `${t}\\Sigma F_x`, form: "zero", terms: [] };
  const fy = { id: `${b.id}_y`, lhs: `${t}\\Sigma F_y`, form: "zero", terms: [] };
  const mm = { id: `${b.id}_M`, lhs: `${t}\\Sigma M_{${P.label}}`, form: "zero", terms: [] };
  for (const f of forcesOn(setup, b.id, known)) {
    const c = componentFactors(f.direction);
    if (c.x) fx.terms.push({ id: f.id, sign: c.x.sign, symbol: f.symbol, value: f.value, unit: "N", factor: c.x.factor });
    if (c.y) fy.terms.push({ id: f.id, sign: c.y.sign, symbol: f.symbol, value: f.value, unit: "N", factor: c.y.factor });
    const a = armOf({ about: { at: P.at } }, { direction: f.direction }, f.at);
    if (a.d < 1e-9) continue;
    const arm = `d_{${f.symbol.replace(/[{}]/g, "")}}`;
    const factor = { tex: arm, numTex: numM(a.d), value: a.d };
    if (Math.abs(a.rLen - a.d) > 1e-6) {
      Object.assign(factor, {
        alt: { tex: arm.replace(/^d/, "r"), numTex: numM(a.rLen), value: a.rLen },
        swapLabel: "Use the perpendicular distance d",
        swapReason: `uses the distance to ${P.label} instead of the perpendicular distance to the line of action`,
        swapKind: "momentArm",
      });
    }
    mm.terms.push({ id: f.id, sign: Math.sign(a.perNewton), symbol: f.symbol, value: f.value, unit: "N", factor });
  }
  return [fx, fy, mm];
}

export function frameUnknowns(setup) {
  return [
    ...frameReactions(setup).map((r) => r.id),
    ...(setup.pins || []).flatMap((p) => [`${p.id}_x`, `${p.id}_y`]),
    ...(setup.links || []).map((l) => `F_${l.id}`),
  ];
}

export function solveFrame(setup) {
  const bodies = setup.bodies || [];
  const ids = frameUnknowns(setup);
  const all = bodies.flatMap((b) => bodyEquations(setup, b));
  const values = { n: ids.length, eqs: all.length };
  for (const f of setup.forces || []) values[f.id] = magnitudeOf(f);
  let status, message;
  const count = `${ids.length} unknowns and ${bodies.length} bodies × 3 = ${all.length} equations`;
  if (ids.length < all.length) {
    status = "unstable";
    message = `${count}: too few — the frame can move (it's a mechanism).`;
  } else if (ids.length > all.length) {
    status = "indeterminate";
    message = `${count}: more unknowns than equations, so the frame is statically indeterminate.`;
  } else {
    const sol = solveEquations(all, ids);
    if (sol.status !== "unique") {
      status = "unstable";
      message = `${count}, but the parts are arranged so the frame can still move.`;
    } else {
      status = "determinate";
      Object.assign(values, sol.values);
      for (const p of setup.pins || []) values[`R_${p.id}`] = Math.hypot(values[`${p.id}_x`], values[`${p.id}_y`]);
      const pulled = frameReactions(setup).find((r) => r.kind === "push" && values[r.id] < -1e-6);
      if (pulled) {
        status = "unstable";
        message = `$${pulled.symbol}$ would have to pull (${sigFig(values[pulled.id], 3)} N), but a roller can only push: the frame lifts off it.`;
      }
    }
  }
  // The equations shown: the stage's body only (setup.body), else every body's.
  const known = {};
  if (setup.knownReactions && status === "determinate") for (const r of frameReactions(setup)) known[r.id] = values[r.id];
  const shown = setup.body ? bodyEquations(setup, bodies.find((b) => b.id === setup.body), known) : all;
  return { status, message, values, equations: shown, unknowns: ids };
}

// Names and units for result.values (answer boxes and labels).
export function frameQuantities(setup) {
  const q = { n: { label: "\\text{unknowns}", unit: "" }, eqs: { label: "\\text{equations}", unit: "" } };
  for (const r of frameReactions(setup)) q[r.id] = { label: r.symbol, unit: "N" };
  for (const p of setup.pins || []) {
    q[`${p.id}_x`] = { label: `${p.id}_x`, unit: "N" };
    q[`${p.id}_y`] = { label: `${p.id}_y`, unit: "N" };
    q[`R_${p.id}`] = { label: `R_${p.id}`, unit: "N" };
  }
  for (const l of setup.links || []) q[`F_${l.id}`] = { label: `F_{${l.id}}`, unit: "N" };
  for (const f of setup.forces || []) q[f.id] = { label: f.symbol, unit: "N" };
  return q;
}

// The frame's overall size (arrow lengths, the picture).
export function frameSize(setup) {
  const pts = (setup.bodies || []).flatMap((b) => b.points);
  let s = 0;
  for (const a of pts) for (const b of pts) s = Math.max(s, mag(sub(a, b)));
  return s || 1;
}


// Likely wrong answers for one unknown, each with what probably happened.
export function frameMistakes(setup, name) {
  const res = solveFrame(setup);
  const correct = res.values[name];
  if (res.status !== "determinate" || !Number.isFinite(correct) || Math.abs(correct) < 1e-9) return [];
  const pin = (setup.pins || []).find((p) => name === `${p.id}_x` || name === `${p.id}_y`);
  const link = (setup.links || []).find((l) => name === `F_${l.id}`);
  const why = pin
    ? `Right size, wrong sign. $${name}$ is the force on ${pin.bodies[0]} (positive ${name.endsWith("x") ? "right" : "up"}); on ${pin.bodies[1]} the pin pushes the opposite way. Check which body you wrote it for.`
    : link
      ? `Right size, wrong sign: tension is positive. ${link.id} ${correct > 0 ? "pulls — it's in tension" : "pushes — it's in compression"}.`
      : "Right size, wrong sign: check which way this force points on your free-body diagram.";
  return [{ value: -correct, message: why, kind: "sign" }];
}
