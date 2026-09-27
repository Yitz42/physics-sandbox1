// force3d-choices.js — the lines a 3D solve stage's "choices" step offers (Units 2.3, 2.4):
// for each force, the right line and classic slips, each wrong one with its kind of
// mistake and what to fix; then the resultant.

import { sigFig } from "../../core/units.js";
import { solveForce3d, cosd, DEG } from "./force3d.js";
import { vecTex } from "./force3d-tools.js";

const n4 = (v) => sigFig(v, 4);
const AX = ["x", "y", "z"];

// ---- Lines to choose from (solve, "choices") ------------------------------------------------
// For every force, in order: along a line, r then F; by direction angles or by an azimuth
// and elevation, F as a Cartesian vector. Then the resultant.

export function force3dChoices(setup, result) {
  const v = (result || solveForce3d(setup)).values;
  const groups = [];
  for (const f of setup.forces || []) {
    const d = f.dir || {};
    if (d.angles || d.azimuth != null) groups.push(angledChoice(f, v));
    if (!d.from) continue;
    const [A, B] = [f.dir.from, f.dir.to];
    const AB = `${A}${B}`;
    const r = [v[`${f.id}.rx`], v[`${f.id}.ry`], v[`${f.id}.rz`]];
    const len = v[`${f.id}.r`];
    const k = r.findIndex((c) => Math.abs(c) > 1e-9);
    groups.push({
      title: `The position vector from ${A} to ${B}`,
      options: [
        { tex: `\\mathbf{r}_{${AB}} = ${vecTex(r, "m", (x) => n4(x))}`, correct: true },
        { tex: `\\mathbf{r}_{${AB}} = ${vecTex(r.map((c) => -c), "m", (x) => n4(x))}`, kind: "direction", feedback: `That's from ${B} to ${A}: subtract the START from the END, $\\mathbf{r}_${B} - \\mathbf{r}_${A}$.` },
        { tex: `\\mathbf{r}_{${AB}} = ${vecTex(r.map((c, i) => (i === k ? -c : c)), "m", (x) => n4(x))}`, kind: "sign", feedback: `Check the ${AX[k]} part: $${AX[k]}_${B} - ${AX[k]}_${A}$.` },
      ],
    });
    const F = v[f.id];
    const Fv = AX.map((c) => v[`${f.id}.${c}`]);
    groups.push({
      title: `The force $${f.symbol}$ = ${n4(F)} N along ${AB} ($r_{${AB}}$ = ${n4(len)} m)`,
      options: [
        { tex: `\\mathbf{${f.symbol}} = ${vecTex(Fv, "N")}`, correct: true },
        { tex: `\\mathbf{${f.symbol}} = ${vecTex(r.map((c) => F * c), "N")}`, kind: "missing", feedback: "That multiplies F by $\\mathbf{r}_{AB}$ itself. Divide by its length first: $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$." },
        { tex: `\\mathbf{${f.symbol}} = ${vecTex(r.map((c) => (F * c) / (len * len)), "N")}`, kind: "algebra", feedback: "That divides by $r^2$ — the length is $\\sqrt{x^2 + y^2 + z^2}$, not the sum of squares." },
      ],
    });
  }
  if (setup.resultant) {
    const R = AX.map((c) => v[`R.${c}`]);
    // Wrong: the last force subtracted, or left out.
    const last = setup.forces[setup.forces.length - 1];
    const diff = AX.map((c) => v[`R.${c}`] - 2 * v[`${last.id}.${c}`]);
    const only = AX.map((c) => v[`R.${c}`] - v[`${last.id}.${c}`]);
    groups.push({
      title: "The resultant, $\\mathbf{F}_R = \\Sigma\\mathbf{F}$",
      options: [
        { tex: `\\mathbf{F}_R = ${vecTex(R, "N")}`, correct: true },
        { tex: `\\mathbf{F}_R = ${vecTex(diff, "N")}`, kind: "sign", feedback: "That subtracts one force. The resultant ADDS them, component by component." },
        { tex: `\\mathbf{F}_R = ${vecTex(only, "N")}`, kind: "missing", feedback: setup.forces.length > 2 ? `That leaves out $${last.symbol}$. Add every force's components.` : "That's just one of the forces. Add every force's components." },
      ],
    });
  }
  return groups;
}

// A force given by direction angles, or by an azimuth and elevation, as a Cartesian
// vector: the right one and two classic slips.
function angledChoice(f, v) {
  const d = f.dir;
  const F = v[f.id];
  const Fv = AX.map((c) => v[`${f.id}.${c}`]);
  const options = [{ tex: `\\mathbf{${f.symbol}} = ${vecTex(Fv, "N")}`, correct: true }];
  if (d.angles) {
    const [a, b, g] = ["alpha", "beta", "gamma"].map((k) => v[`${f.id}.${k}`]);
    options.push({ tex: `\\mathbf{${f.symbol}} = ${vecTex([a, b, g].map((x) => F * Math.sin(x * DEG)), "N")}`, kind: "trig",
      feedback: "Each component uses the COSINE of its own direction angle: $F_x = F\\cos\\alpha$, $F_y = F\\cos\\beta$, $F_z = F\\cos\\gamma$." });
    if (d.angles[2] == null) options.push({ tex: `\\mathbf{${f.symbol}} = ${vecTex([Fv[0], Fv[1], -Fv[2]], "N")}`, kind: "sign",
      feedback: `$\\cos\\gamma = \\pm\\sqrt{1 - \\cos^2\\alpha - \\cos^2\\beta}$ has two answers: the picture shows $${f.symbol}$ pointing ${Fv[2] >= 0 ? "UP, so γ < 90° and $F_z > 0$" : "DOWN, so γ > 90° and $F_z < 0$"}.` });
    else if (Fv.some((c) => c < -1e-9)) options.push({ tex: `\\mathbf{${f.symbol}} = ${vecTex(Fv.map(Math.abs), "N")}`, kind: "sign",
      feedback: "A direction angle past 90° has a negative cosine: that component points the negative way." });
  } else {
    const [t, p] = [d.azimuth, d.elevation];
    options.push({ tex: `\\mathbf{${f.symbol}} = ${vecTex([F * cosd(t), F * Math.sin(t * DEG), F * Math.sin(p * DEG)], "N")}`, kind: "missing",
      feedback: "First find the part in the x-y plane, $F' = F\\cos\\phi$ — then split THAT with θ: $F_x = F'\\cos\\theta$, $F_y = F'\\sin\\theta$." });
    options.push({ tex: `\\mathbf{${f.symbol}} = ${vecTex([F * Math.sin(p * DEG) * cosd(t), F * Math.sin(p * DEG) * Math.sin(t * DEG), F * cosd(p)], "N")}`, kind: "trig",
      feedback: "φ is measured UP from the x-y plane: the vertical part is $F\\sin\\phi$ and the part in the plane is $F\\cos\\phi$." });
  }
  const how = d.angles ? "by its direction angles" : "by an azimuth and an elevation";
  return { title: `The force $${f.symbol}$ = ${n4(F)} N, given ${how}`, options };
}
