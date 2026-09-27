// truss-section.js — the method of sections (Unit 5.3).
//
// Cut the truss through (usually) three members, so it falls into two parts.
// Either part is a rigid body in equilibrium: three equations, ΣF_x, ΣF_y and
// ΣM — and the three cut members' forces are its only unknowns (the support
// reactions are found first, from the whole truss). A smart moment point, where
// two of the cut members' lines cross, leaves one unknown in ΣM: a member force
// in ONE equation, without solving the truss joint by joint.
//
// setup.section = {
//   members: ["FG", "CF", "BC"]   the members the cut goes through
//   keep:    "A"                  a joint on the side kept (drawn and used)
//   about:   "C" | { at, label }  the moment point (a joint name or any point)
//   sums?:   [{ M: "C" }, { M: "F" }, { F: "y" }]   another set of three equations
// }
// Each cut member's force acts at the cut, on the kept part, pulling it toward
// the part cut away (tension assumed, as in the method of joints).

import { sub, unit, add, scale } from "../../core/vector.js";
import { sigFig, fixedTex } from "../../core/units.js";
import { componentFactors } from "./directions.js";
import { armOf } from "./moment.js";
import { magnitudeOf } from "./particle.js";
import { memberId, memberSymbol, memberDirection, trussLoads, trussReactions } from "./truss.js";

const numM = (v) => `(${sigFig(Math.abs(v), 3)}\\,\\text{m})`;

// Which joints the kept part holds, and whether the cut really splits the truss.
// → { ok, kept: [joint names], cut: [{ m, id, keptEnd, awayEnd, at }], message }
export function sectionParts(setup) {
  const sec = setup.section;
  const cutSet = new Set(sec.members);
  const kept = new Set([sec.keep]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const m of setup.members || []) {
      if (cutSet.has(m)) continue;
      const [a, b] = m;
      if (kept.has(a) !== kept.has(b)) {
        kept.add(a);
        kept.add(b);
        grew = true;
      }
    }
  }
  const cut = sec.members.map((m) => {
    const keptEnd = kept.has(m[0]) ? m[0] : m[1];
    const awayEnd = keptEnd === m[0] ? m[1] : m[0];
    const A = setup.joints[keptEnd], B = setup.joints[awayEnd];
    return { m, id: memberId(m), keptEnd, awayEnd, at: scale(add(A, B), 0.5), dir: unit(sub(B, A)) };
  });
  const whole = kept.size === Object.keys(setup.joints).length;
  const both = cut.every((c) => kept.has(c.keptEnd) && !kept.has(c.awayEnd));
  if (whole || !both) {
    return { ok: false, kept: [...kept], cut, message: `This cut doesn't split the truss in two: ${whole ? "the parts are still joined by members it misses" : "a cut member has both ends on the same side"}. A section must cut through every member joining the two parts.` };
  }
  return { ok: true, kept: [...kept], cut, message: "" };
}

// The moment point of a sum: a joint's name, or { at, label }.
export function sectionPoint(setup, p) {
  if (p && typeof p === "object") return { at: p.at, label: p.label || "P" };
  return { at: setup.joints[p], label: p };
}

// The kept part's three equations. known: reaction values (the whole truss's).
export function sectionEquations(setup, known = {}) {
  const sec = setup.section;
  const parts = sectionParts(setup);
  const kept = new Set(parts.kept);
  const sums = sec.sums || [{ F: "x" }, { F: "y" }, { M: sec.about }];
  const eqs = sums.map((q) => {
    if (q.F) return { id: q.F === "x" ? "sumFx" : "sumFy", lhs: q.F === "x" ? "\\Sigma F_x" : "\\Sigma F_y", form: "zero", terms: [], F: q.F };
    const P = sectionPoint(setup, q.M);
    return { id: `sumM_${P.label}`, lhs: `\\Sigma M_{${P.label}}`, form: "zero", terms: [], P };
  });
  const put = (id, symbol, direction, at, value, arm) => {
    const c = componentFactors(direction);
    for (const e of eqs) {
      if (e.F === "x" && c.x) e.terms.push({ id, sign: c.x.sign, symbol, value, unit: "N", factor: c.x.factor });
      if (e.F === "y" && c.y) e.terms.push({ id, sign: c.y.sign, symbol, value, unit: "N", factor: c.y.factor });
      if (e.P) {
        const a = armOf({ about: { at: e.P.at } }, { direction }, at);
        if (a.d < 1e-9) continue; // its line passes through the moment point
        const factor = { tex: `d_{${arm}}`, numTex: numM(a.d), value: a.d };
        if (Math.abs(a.rLen - a.d) > 1e-6) {
          factor.alt = { tex: `r_{${arm}}`, numTex: numM(a.rLen), value: a.rLen };
          factor.swapLabel = "Use the perpendicular distance d";
          factor.swapReason = `uses the distance to ${e.P.label} instead of the perpendicular distance to the line of action`;
          factor.swapKind = "momentArm";
        }
        e.terms.push({ id, sign: Math.sign(a.perNewton), symbol, value, unit: "N", factor });
      }
    }
  };
  const on = (at) => [...kept].some((J) => Math.hypot(setup.joints[J][0] - at[0], setup.joints[J][1] - at[1]) < 1e-9);
  for (const f of trussLoads(setup)) if (on(f.at)) put(f.id, f.symbol, f.direction, f.at, magnitudeOf(f), f.symbol.replace(/[{}]/g, ""));
  for (const r of trussReactions(setup)) if (on(r.at)) put(r.id, r.symbol, r.direction, r.at, known[r.id] ?? null, r.symbol.replace(/[{}]/g, ""));
  for (const c of parts.cut) put(c.id, memberSymbol(c.m), memberDirection(sub(setup.joints[c.awayEnd], setup.joints[c.keptEnd])), c.at, null, c.m);
  for (const e of eqs) {
    delete e.F;
    delete e.P;
  }
  return eqs;
}

// For result.values: whether the section is sound, and how many unknown member
// forces the first moment equation holds ("secM": 1 = a member force at once).
export function sectionValues(setup, equations) {
  const parts = sectionParts(setup);
  const cutIds = parts.cut.map((c) => c.id);
  const inEq = equations.map((e) => [...new Set(e.terms.filter((t) => cutIds.includes(t.id)).map((t) => t.id))]);
  const firstM = equations.findIndex((e) => e.id.startsWith("sumM"));
  return { secOk: parts.ok ? 1 : 0, secM: firstM >= 0 ? inEq[firstM].length : 3, inEq, parts };
}

// ---- Pictures and lines ------------------------------------------------------------------

// The cut: a dashed line through the cut members' middles (reaching a little past
// them), the kept part's joints, and each cut member's force as an arrow at the cut,
// pulling the kept part toward the part cut away. v: solved values, or null ("?").
// Returns shapes for truss-scene.js.
export function sectionShapes(setup, v, { arrowLength, fmt, tc, hide = [] }) {
  const parts = sectionParts(setup);
  const out = [];
  const pts = parts.cut.map((c) => c.at);
  if (pts.length >= 2) {
    // The line through the first and last cut points, extended a bit past both.
    const a = pts[0], b = pts[pts.length - 1];
    const u = unit(sub(b, a)), ext = 0.35 * arrowLength;
    out.push({ type: "line", from: sub(a, scale(u, ext)), to: add(b, scale(u, ext)), style: "dashed" });
  }
  for (const c of parts.cut) {
    if (hide.includes(c.id)) continue;
    const val = v ? v[c.id] : null;
    const dir = val != null && val < 0 ? scale(c.dir, -1) : c.dir;
    // A pull starts at the cut and points away; a push (compression) points INTO the cut.
    const from = val != null && val < 0 ? add(c.at, scale(c.dir, arrowLength)) : c.at;
    out.push({ type: "arrow", id: c.id, from, to: add(from, scale(dir, arrowLength)), role: "unknown", label: `${memberSymbol(c.m)} = ${val == null ? "?" : fmt(Math.abs(val), "N") + tc(val)}` });
  }
  const sums = setup.section.sums || [{ M: setup.section.about }];
  for (const q of sums) {
    if (!q.M) continue;
    const P = sectionPoint(setup, q.M);
    if (!setup.joints[P.label]) out.push({ type: "point", at: P.at, label: P.label, style: "ring" });
  }
  return { shapes: out, kept: new Set(parts.kept), parts };
}

// Lines under the equations: which cut members each equation holds (setup.showSectionUnknowns),
// and, once revealed, the cut members' forces.
export function sectionSummary(setup, result, { reveal = true } = {}, tc) {
  const eqs = result.sectionEquations;
  const lines = [];
  const sym = (id) => memberSymbol(id.slice(2));
  if (!result.values.secOk) lines.push(`\\text{${result.sectionMessage}}`);
  else if (setup.showSectionUnknowns) {
    lines.push(eqs.map((e, i) => `${e.lhs}\\text{: } ${result.sectionUnknowns[i].map(sym).join(",\\ ") || "\\text{none}"}`).join(" \\qquad "));
  }
  if (reveal && result.status === "determinate" && result.values.secOk) {
    lines.push(result.sectionParts.cut.map((c) => `${memberSymbol(c.m)} = ${fixedTex(result.values[c.id], "N")}${tc(result.values[c.id])}`).join(",\\quad "));
  }
  return lines;
}
