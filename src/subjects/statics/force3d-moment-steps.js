// force3d-moment-steps.js — moments in 3D (Units 4.7, 4.8): a student's working with one wrong
// line (debug "steps") and the lines to choose from (solve "choices").

import { fixedTex, sigFig } from "../../core/units.js";
import { momentOf, pointNameOf, cross } from "./force3d-moment.js";
import { vecTex } from "./force3d-tools.js";

const AX = ["x", "y", "z"];
const n4 = (v) => sigFig(v, 4);
const about = (setup) => setup.about || "O";

// ---- A student's working, one line wrong (debug "steps") ------------------------------------
// mutation.slip: "backwards" (r = r_O − r_A), "order" (F × r), "jSign" (no minus on the j term),
// "pairing" (M_z = r_x F_x − r_y F_y).
export function momentSteps(setup, mutation) {
  const f = setup.forces[0];
  const m = momentOf(f, setup);
  const O = about(setup), P = pointNameOf(f), S = f.symbol;
  const slip = mutation.slip;
  const r = slip === "backwards" ? m.r.map((c) => -c) : m.r;
  const det = slip === "order" ? cross(m.F, r) : cross(r, m.F);
  const M = [...det];
  if (slip === "jSign") M[1] = -M[1];
  if (slip === "pairing") M[2] = r[0] * m.F[0] - r[1] * m.F[1];
  const rLine = (w, back = false) => `\\mathbf{r}_{${O}${P}} = ${back ? `\\mathbf{r}_${O} - \\mathbf{r}_${P}` : `\\mathbf{r}_${P} - \\mathbf{r}_${O}`} = ${vecTex(w, "m", n4)}`;
  const row = (w) => w.map((c) => n4(c)).join(" & ");
  const detLine = (top, bottom, swapped = false) => `\\mathbf{M}_{${O}} = ${swapped ? `\\mathbf{${S}} \\times \\mathbf{r}` : `\\mathbf{r} \\times \\mathbf{${S}}`} = \\begin{vmatrix} \\mathbf{i} & \\mathbf{j} & \\mathbf{k} \\\\ ${row(top)} \\\\ ${row(bottom)} \\end{vmatrix}`;
  const comp = (k, val, formula) => `(M_{${O}})_${k} = ${formula} = ${fixedTex(val, "N·m")}`;
  const f4 = (w) => `(${n4(w)})`;
  const formulas = (rr, FF) => ({
    x: `${f4(rr[1])}${f4(FF[2])} - ${f4(rr[2])}${f4(FF[1])}`,
    y: `-[${f4(rr[0])}${f4(FF[2])} - ${f4(rr[2])}${f4(FF[0])}]`,
    z: `${f4(rr[0])}${f4(FF[1])} - ${f4(rr[1])}${f4(FF[0])}`,
  });
  const top = slip === "order" ? m.F : r, bottom = slip === "order" ? r : m.F;
  const fw = formulas(top, bottom);
  if (slip === "jSign") fw.y = `${f4(r[0])}${f4(m.F[2])} - ${f4(r[2])}${f4(m.F[0])}`;
  if (slip === "pairing") fw.z = `${f4(r[0])}${f4(m.F[0])} - ${f4(r[1])}${f4(m.F[1])}`;
  const lines = [
    { id: "r", tex: rLine(r, slip === "backwards") },
    { id: "F", tex: `\\mathbf{${S}} = ${vecTex(m.F, "N")}` },
    { id: "det", tex: detLine(top, bottom, slip === "order") },
    { id: "Mx", tex: comp("x", M[0], fw.x) },
    { id: "My", tex: comp("y", M[1], fw.y) },
    { id: "Mz", tex: comp("z", M[2], fw.z) },
  ];
  const good = formulas(m.r, m.F);
  const corrected = [rLine(m.r), lines[1].tex, detLine(m.r, m.F), comp("x", m.M[0], good.x), comp("y", m.M[1], good.y), comp("z", m.M[2], good.z)];
  const WHY = {
    backwards: { wrong: "r", kind: "direction", fix: `Subtract the other way: $\\mathbf{r}_${P} - \\mathbf{r}_${O}$ (from ${O} to ${P})`,
      explain: `r goes FROM the moment point ${O} TO the point on the force's line: END minus START. Backwards, the moment flips.` },
    order: { wrong: "det", kind: "sign", fix: "Put r in the middle row and F in the bottom row: $\\mathbf{r} \\times \\mathbf{F}$",
      explain: "The order of a cross product matters: $\\mathbf{F} \\times \\mathbf{r} = -\\,\\mathbf{r} \\times \\mathbf{F}$. The moment is $\\mathbf{r} \\times \\mathbf{F}$ — every component flips otherwise." },
    jSign: { wrong: "My", kind: "sign", fix: "Put the minus back in front of the j term",
      explain: "Expanding the determinant, the j term has a minus: $M_y = -(r_x F_z - r_z F_x)$. It's the most common slip in 3D moments." },
    pairing: { wrong: "Mz", kind: "vector", fix: "Pair each r part with the OTHER parts of F: $r_x F_y - r_y F_x$",
      explain: "Each moment component uses the two OTHER axes: $M_z = r_x F_y - r_y F_x$ — never $r_x F_x$." },
  }[slip];
  const order = lines.map((l) => l.id);
  const follows = lines.filter((l, i) => order.indexOf(l.id) > order.indexOf(WHY.wrong) && l.tex !== corrected[i]).map((l) => l.id);
  const others = [
    { key: "backwards", label: "Subtract the other way in r", feedback: "r is the right way round: from the moment point to the force's point." },
    { key: "order", label: "Swap the determinant's rows", feedback: "The rows are in the right order: r above F." },
    { key: "jSign", label: "Change the sign of the j term", feedback: "The j term already has its minus." },
  ].filter((o) => o.key !== slip).slice(0, 2).map(({ label, feedback }) => ({ label, feedback }));
  return { lines, wrong: WHY.wrong, follows, fixes: [{ label: WHY.fix, correct: true }, ...others], explain: WHY.explain, kind: WHY.kind, corrected };
}

// ---- Lines to choose from (solve, "choices") -------------------------------------------------
export function momentChoices(setup, result) {
  const O = about(setup);
  const groups = [];
  const all = [];
  for (const f of setup.forces || []) {
    const m = momentOf(f, setup);
    if (m.error) continue;
    const P = pointNameOf(f), S = f.symbol;
    all.push({ f, m });
    groups.push({
      title: `The position vector from ${O} to ${P}`,
      options: [
        { tex: `\\mathbf{r}_{${O}${P}} = ${vecTex(m.r, "m", n4)}`, correct: true },
        { tex: `\\mathbf{r}_{${O}${P}} = ${vecTex(m.r.map((c) => -c), "m", n4)}`, kind: "direction", feedback: `That's from ${P} to ${O}. r goes from the moment point to the force: $\\mathbf{r}_${P} - \\mathbf{r}_${O}$.` },
      ],
    });
    if (f.dir && f.dir.from) {
      const d = m.d;
      groups.push({
        title: `The force $${S}$ = ${n4(Math.hypot(...m.F))} N along ${f.dir.from}${f.dir.to}`,
        options: [
          { tex: `\\mathbf{${S}} = ${vecTex(m.F, "N")}`, correct: true },
          { tex: `\\mathbf{${S}} = ${vecTex(d.r.map((c) => c * Math.hypot(...m.F)), "N")}`, kind: "missing", feedback: "That multiplies by $\\mathbf{r}_{AB}$ itself. Divide by its length first: $\\mathbf{u} = \\mathbf{r}/r$." },
        ],
      });
    }
    const flipJ = [m.M[0], -m.M[1], m.M[2]];
    groups.push({
      title: `The moment of $${S}$ about ${O}, $\\mathbf{r} \\times \\mathbf{${S}}$`,
      options: [
        { tex: `\\mathbf{M}_{${S}} = ${vecTex(m.M, "N·m")}`, correct: true },
        { tex: `\\mathbf{M}_{${S}} = ${vecTex(m.M.map((c) => -c), "N·m")}`, kind: "sign", feedback: "That's $\\mathbf{F} \\times \\mathbf{r}$: every part has the wrong sign. The order is $\\mathbf{r} \\times \\mathbf{F}$." },
        ...(Math.abs(m.M[1]) > 1e-9 ? [{ tex: `\\mathbf{M}_{${S}} = ${vecTex(flipJ, "N·m")}`, kind: "sign", feedback: "Check the j part: the determinant's middle term has a minus, $M_y = -(r_x F_z - r_z F_x)$." }] : []),
      ],
    });
  }
  if (all.length > 1) {
    const M = AX.map((_, i) => all.reduce((s, { m }) => s + m.M[i], 0));
    const last = all[all.length - 1];
    groups.push({
      title: `The total moment about ${O}, $\\Sigma\\,\\mathbf{r} \\times \\mathbf{F}$`,
      options: [
        { tex: `\\mathbf{M}_{${O}} = ${vecTex(M, "N·m")}`, correct: true },
        { tex: `\\mathbf{M}_{${O}} = ${vecTex(M.map((c, i) => c - last.m.M[i]), "N·m")}`, kind: "missing", feedback: `That leaves out $${last.f.symbol}$'s moment. Add every force's.` },
        { tex: `\\mathbf{M}_{${O}} = ${vecTex(M.map((c, i) => c - 2 * last.m.M[i]), "N·m")}`, kind: "sign", feedback: "That subtracts one moment. Moments add, part by part." },
      ],
    });
  }
  return groups;
}
