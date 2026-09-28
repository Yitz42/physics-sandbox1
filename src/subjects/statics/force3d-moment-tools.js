// force3d-moment-tools.js — for moments in 3D (Units 4.7, 4.8): the equations
// (M_x = r_y F_z − r_z F_y …), the lines under them (r, F, the determinant, M, M_a) and the
// answers common slips give. (A student's working for debug, and the solve lines, are in
// force3d-moment-steps.js.)

import { fixedTex, sigFig } from "../../core/units.js";
import { solveMoment3d, momentOf, axisUnit, pointNameOf, dot3 } from "./force3d-moment.js";
import { vecTex, componentSymbol } from "./force3d-tools.js";

const AX = ["x", "y", "z"];
const n4 = (v) => sigFig(v, 4);
const about = (setup) => setup.about || "O";
// The pieces of each moment component: M_i = r_j F_k − r_k F_j.
const PAIRS = { x: ["y", "z"], y: ["z", "x"], z: ["x", "y"] };
const I = { x: 0, y: 1, z: 2 };

// ---- Equations -----------------------------------------------------------------------------
export function momentEquations(setup, result) {
  const v = (result || solveMoment3d(setup)).values;
  const O = about(setup);
  const eqs = AX.map((k) => {
    const [a, b] = PAIRS[k];
    const terms = [];
    for (const f of setup.forces || []) {
      const m = momentOf(f, setup);
      if (m.error) continue;
      const P = pointNameOf(f);
      const term = (rc, fc, sign) => ({
        id: f.id, sign, symbol: `r_{${P}${rc}}`, value: m.r[I[rc]],
        factor: { tex: componentSymbol(f.symbol, fc), numTex: `(${n4(m.F[I[fc]])})`, value: m.F[I[fc]],
          // The classic slip: pairing r's part with the SAME part of F.
          alt: { tex: componentSymbol(f.symbol, rc), numTex: `(${n4(m.F[I[rc]])})`, value: m.F[I[rc]], kind: "vector",
            reason: "pairs r's part with the SAME part of F — each moment component pairs r with the OTHER two parts of F" } },
      });
      terms.push(term(a, b, 1), term(b, a, -1));
    }
    return { id: `M${k}`, valueKey: `M.${k}`, lhs: `(M_{${O}})_${k}`, form: "define", terms, result: { value: v[`M.${k}`], unit: "N·m" } };
  });
  if (setup.axis) {
    const ax = axisUnit(setup);
    eqs.push({
      id: "Ma", valueKey: "Ma", lhs: "M_a = \\mathbf{u}_a \\cdot \\mathbf{M}_" + O, form: "define",
      terms: AX.map((k, i) => ({ id: "M", sign: 1, symbol: `(M_{${O}})_${k}`, value: v[`M.${k}`], factor: { tex: `u_{a${k}}`, numTex: `(${n4(ax.u[i])})`, value: ax.u[i] } })),
      result: { value: v.Ma, unit: "N·m" },
    });
  }
  return eqs;
}

// ---- The lines under the equations ---------------------------------------------------------
// hideAnswers (a solve stage before its answer step): r, F and the determinant show; M doesn't.
export function momentSummary(setup, res, { reveal = true, hideAnswers = false } = {}) {
  const v = res.values;
  if (res.status !== "resultant" || (!reveal && !hideAnswers)) return [];
  const O = about(setup);
  const lines = [];
  for (const f of setup.forces || []) {
    const m = momentOf(f, setup);
    const P = pointNameOf(f);
    lines.push(`\\mathbf{r}_{${O}${P}} = ${vecTex(m.r, "m", n4)}, \\quad \\mathbf{${f.symbol}} = ${vecTex(m.F, "N")}`);
    const row = (w) => w.map((c) => n4(c)).join(" & ");
    lines.push(`\\mathbf{M}_{${f.symbol}} = \\mathbf{r}_{${O}${P}} \\times \\mathbf{${f.symbol}} = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ ${row(m.r)} \\\\ ${row(m.F)} \\end{vmatrix}` +
      (hideAnswers || !reveal ? "" : ` = ${vecTex(m.M, "N·m")}`));
  }
  if (hideAnswers || !reveal) return lines;
  const M = AX.map((k) => v[`M.${k}`]);
  if ((setup.forces || []).length > 1) lines.push(`\\mathbf{M}_{${O}} = \\Sigma\\,\\mathbf{r} \\times \\mathbf{F} = ${vecTex(M, "N·m")}`);
  lines.push(`M_{${O}} = \\sqrt{${M.map((c) => `(${n4(c)})^2`).join(" + ")}} = ${fixedTex(v.M, "N·m")}`);
  if (setup.axis) {
    const ax = axisUnit(setup);
    lines.push(`\\mathbf{u}_a = ${vecTex(ax.u, "", (c) => n4(c))}, \\quad M_a = \\mathbf{u}_a \\cdot \\mathbf{M}_{${O}} = ${fixedTex(v.Ma, "N·m")}`);
  }
  return lines;
}

// ---- Answers that common slips give --------------------------------------------------------
export function momentMistakes(setup, name) {
  const v = solveMoment3d(setup).values;
  const right = v[name];
  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || right == null || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };
  const forces = (setup.forces || []).map((f) => ({ f, m: momentOf(f, setup) })).filter((x) => !x.m.error);
  const k = name.startsWith("M.") ? name.slice(2) : null;
  if (k && I[k] != null) {
    if (k === "y") add(-right, "Check the middle (j) term of the determinant: it has a minus in front, $M_y = -(r_x F_z - r_z F_x) = r_z F_x - r_x F_z$. (Or was it $\\mathbf{F} \\times \\mathbf{r}$? The order matters: $\\mathbf{M} = \\mathbf{r} \\times \\mathbf{F}$.)", "sign");
    add(-right, "Right size, wrong sign: that's $\\mathbf{F} \\times \\mathbf{r}$. The order matters — $\\mathbf{M}_O = \\mathbf{r} \\times \\mathbf{F}$ (r first).", "sign");
    const [a, b] = PAIRS[k];
    add(forces.reduce((s, { m }) => s + m.r[I[a]] * m.F[I[a]] - m.r[I[b]] * m.F[I[b]], 0), `Each moment part pairs r with the OTHER two parts of F: $M_${k} = r_${a} F_${b} - r_${b} F_${a}$.`, "vector");
    if (forces.length > 1) for (const { f, m } of forces) add(right - m.M[I[k]], `Did you leave out $${f.symbol}$? Every force's moment goes in the sum.`, "missing");
  }
  if (name === "M") {
    add(AX.reduce((s, c) => s + Math.abs(v[`M.${c}`]), 0), "The parts are at right angles: $M = \\sqrt{M_x^2 + M_y^2 + M_z^2}$, not their sum.", "vector");
    if (forces.length === 1) {
      const { m } = forces[0];
      add(Math.hypot(...m.r) * Math.hypot(...m.F), "That's $rF$ — the size only when r is at right angles to F. In general $M = rF\\sin\\theta$: work out $\\mathbf{r} \\times \\mathbf{F}$.", "vector");
    }
  }
  if (name === "Ma") {
    const ax = axisUnit(setup);
    const M = AX.map((c) => v[`M.${c}`]);
    add(v.M, "That's the size of the WHOLE moment about O. Only its part along the axis turns the body about it: $M_a = \\mathbf{u}_a \\cdot \\mathbf{M}_O$.", "concept");
    add(dot3(ax.v, M), `Divide the axis vector by its length (${n4(ax.len)} m) first: $\\mathbf{u}_a$ must have length 1.`, "vector");
    add(-right, "Right size, wrong sign: + means turning the right-hand way about $\\mathbf{u}_a$ (thumb along it).", "sign");
  }
  if (right != null && Math.abs(right) > 1e-9) add(-right, "Right size, wrong sign: check the order, $\\mathbf{r} \\times \\mathbf{F}$, and each sign in the determinant.", "sign");
  return list;
}
