// truss-scene.js — the picture of a truss (Unit 5.1), and the tools that go
// with it: the joint free-body diagram (fbd), common mistakes, and the lines
// under the equations.
//
// Members are bars between pinned joints; once solved they turn red
// (tension) or blue (compression), grey if they carry nothing, with their
// forces written beside them. setup.joint picks a joint to study: its member
// forces are drawn as arrows AT the joint (pulling away from it = tension).
//   opts: { reveal, hide: [ids] (the student is drawing these) }

import { add, sub, scale, mag, unit } from "../../core/vector.js";
import { format, fixedTex } from "../../core/units.js";
import { placeArrow } from "../../render/fbd.js";
import { solveEquations, swapFactor } from "../../core/equations.js";
import { magnitudeOf, directionOf } from "./particle.js";
import { solveTruss, trussSupports, trussLoads, trussReactions, trussEquations, membersAt, memberId, memberSymbol, trussSize } from "./truss.js";

const centreOf = (setup) => {
  const pts = Object.values(setup.joints);
  return scale(pts.reduce((a, p) => add(a, p), [0, 0]), 1 / pts.length);
};

// Away from the truss and from the support's surface: the side a reaction's arrow goes.
function outwardAt(setup, r) {
  const s = trussSupports(setup).find((q) => q.id === r.support);
  const n = (s && s.normal) || [0, 1];
  const away = sub(r.at, centreOf(setup));
  const v = add(scale(n, -1), mag(away) > 1e-9 ? scale(unit(away), 0.7) : [0, 0]);
  return mag(v) > 1e-9 ? unit(v) : scale(n, -1);
}

const tc = (v) => (Math.abs(v) < 1e-6 ? "" : v > 0 ? " (T)" : " (C)");

export function trussScene(setup, result, opts = {}) {
  const res = result || solveTruss(setup);
  const size = trussSize(setup);
  const hide = opts.hide || [];
  const shown = setup.showReactions !== "reveal" || opts.reveal;
  const solved = opts.reveal && res.status === "determinate";
  const k = (0.2 * size) / Math.max(1, ...trussLoads(setup).map(magnitudeOf), ...(solved ? res.reactions.map((r) => Math.abs(res.values[r.id])) : []));
  const shapes = [{ type: "axes" }];
  for (const d of setup.dims || []) shapes.push({ type: "dim", from: d.from, to: d.to, label: d.label || format(mag(sub(d.to, d.from)), "m") });
  for (const t of setup.texts || []) shapes.push({ type: "text", at: t.at, text: t.text });

  for (const s of trussSupports(setup)) shapes.push({ type: "supportSymbol", kind: s.type, at: s.at, normal: s.normal || [0, 1], label: "", alpha: shown || hide.length ? 0.28 : 1 });
  const focus = setup.joint ? membersAt(setup, setup.joint).map(({ m }) => memberId(m)) : [];
  const middle = centreOf(setup);
  for (const m of setup.members || []) {
    const id = memberId(m), v = res.values[id];
    const from = setup.joints[m[0]], to = setup.joints[m[1]];
    // Just the value and T/C, written along each bar (the bar itself says which member it is).
    const label = solved && !focus.includes(id) ? `${format(Math.abs(v), "N")}${tc(v)}` : null;
    // side: the force is written along the bar, on the side away from the truss's middle.
    shapes.push({ type: "member", id, from, to, side: sub(scale(add(from, to), 0.5), middle), state: solved ? res.states[id] : null, label, alpha: setup.joint ? 0.55 : 1 });
  }
  // Joint letters sit on the outside of the truss, away from its middle.
  const mid = centreOf(setup);
  for (const [J, at] of Object.entries(setup.joints)) shapes.push({ type: "point", at, label: J, style: "ring", labelAway: mag(sub(at, mid)) > 1e-9 ? sub(at, mid) : [0, -1] });

  // Loads at the joints.
  for (const f of trussLoads(setup)) {
    const u = directionOf(f), len = Math.max(0.12 * size, magnitudeOf(f) * k);
    const tail = f.push ? add(f.at, scale(u, -len)) : f.at;
    // (A push ends on its joint and is labelled at its outer end, like any push on a body.)
    shapes.push({ type: "arrow", id: f.id, from: tail, to: add(tail, scale(u, len)), role: "known", onBody: !!f.push, label: `${f.symbol} = ${format(magnitudeOf(f), "N")}` });
  }
  // Support reactions: "?" until solved.
  if (shown) {
    for (const r of trussReactions(setup)) {
      if (hide.includes(r.id)) continue;
      const v = solved || (setup.knownReactions && res.status === "determinate") ? res.values[r.id] : null;
      const dir = v != null && v < 0 ? scale(r.dir, -1) : r.dir;
      const len = v == null ? 0.18 * size : Math.max(0.1 * size, Math.abs(v) * k);
      shapes.push({ type: "arrow", id: r.id, ...placeArrow(r.at, dir, len, outwardAt(setup, { ...r, dir })), role: "unknown", label: `${r.symbol} = ${v == null ? "?" : format(Math.abs(v), "N")}` });
    }
  }
  // The joint being studied: its member forces as arrows at the joint (drawn
  // even when the support reactions wait for Test: this joint is the question).
  if (setup.joint) {
    const J = setup.joints[setup.joint];
    for (const { m, other } of membersAt(setup, setup.joint)) {
      const id = memberId(m);
      if (hide.includes(id)) continue;
      const toward = unit(sub(setup.joints[other], J));
      const v = solved ? res.values[id] : null;
      const dir = v != null && v < 0 ? scale(toward, -1) : toward;
      shapes.push({ type: "arrow", id, ...placeArrow(J, dir, 0.22 * size, toward), role: "unknown", label: `${memberSymbol(m)} = ${v == null ? "?" : format(Math.abs(v), "N") + tc(v)}` });
    }
  }
  if (solved) shapes.push({ type: "note", lines: [{ text: "red: tension (pulls)", role: "tension" }, { text: "blue: compression (pushes)", role: "compression" }] });
  return shapes;
}

// ---- The joint free-body diagram (solve challenge) ---------------------------------

export function trussFbd(setup) {
  const J = setup.joint;
  const at = setup.joints[J];
  const forces = membersAt(setup, J).map(({ m, other }) => {
    const dir = unit(sub(setup.joints[other], at));
    return { id: memberId(m), symbol: memberSymbol(m), dir, at, outward: dir, either: true, kind: "member" };
  });
  for (const r of trussReactions(setup)) {
    if (mag(sub(r.at, at)) > 1e-9) continue;
    forces.push({ id: r.id, symbol: r.symbol, dir: r.dir, at, outward: outwardAt(setup, r), either: r.either, kind: r.kind });
  }
  const directions = [];
  for (let i = 0; i < 8; i++) directions.push([Math.cos((i * Math.PI) / 4), Math.sin((i * Math.PI) / 4)]);
  for (const f of forces) directions.push(f.dir, scale(f.dir, -1));
  const points = {};
  for (const [name, p] of Object.entries(setup.joints)) points[name] = { at: p, outward: unit(sub(p, centreOf(setup))) };
  return { forces, directions, points, arrowLength: 0.22 * trussSize(setup), origin: at };
}

// ---- Common mistakes ---------------------------------------------------------------

export function trussMistakes(setup, name) {
  const res = solveTruss(setup);
  const correct = res.values[name];
  const list = [];
  const add1 = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - correct) < 1e-6 * Math.max(1, Math.abs(correct))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };
  const isMember = (setup.members || []).some((m) => memberId(m) === name);
  if (isMember && Math.abs(correct) > 1e-9) {
    add1(-correct, `Right size, wrong sign. Tension is positive and compression negative: this member is in ${correct > 0 ? "tension — it pulls on its joints" : "compression — it pushes on its joints"}.`, "sign");
  }
  // The x and y fractions of the slanted members swapped (their "sin/cos" mix-up).
  const eqs = res.equations.map((eq) => eq.terms.reduce((e, t) => (t.factor && t.factor.alt ? swapFactor(e, t.id) : e), eq));
  const swapped = solveEquations(eqs, res.unknowns);
  if (swapped.status === "unique") add1(swapped.values[name], "Check the fractions: a member's x-part uses its run along x over its length, its y-part its rise over its length. They look swapped.", "trig");
  return list;
}

// ---- Lines under the equations -----------------------------------------------------

export function trussSummary(setup, result, { reveal = true } = {}) {
  const v = result.values;
  const lines = [`m + r = ${v.m} + ${v.n - v.m} = ${v.n} \\qquad 2j = 2 \\times ${v.j} = ${2 * v.j}`];
  if (reveal && result.status === "determinate") {
    const ids = setup.joint ? membersAt(setup, setup.joint).map(({ m }) => m) : setup.members;
    lines.push(ids.map((m) => `${memberSymbol(m)} = ${fixedTex(v[memberId(m)], "N")}${tc(v[memberId(m)]).replace(/\((.)\)/, "\\,(\\text{$1})")}`).join(",\\quad "));
  }
  return lines;
}

export { trussEquations };
