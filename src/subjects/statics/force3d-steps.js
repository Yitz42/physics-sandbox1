// force3d-steps.js — a student's working with one wrong line (debug "steps") for forces in 3D:
// a force along a line (Unit 2.3), r × F (Unit 4.7) and a rigid body's six equations (Unit 5.6).
// Split from force3d-tools.js to keep it small.

import { fixedTex, sigFig } from "../../core/units.js";
import { solveForce3d } from "./force3d.js";
import { vecTex } from "./force3d-tools.js";
import { momentSteps } from "./force3d-moment-steps.js";
import { rigid3dSteps } from "./force3d-rigid-tools.js";

const n4 = (v) => sigFig(v, 4);
const AX = ["x", "y", "z"];
const n3 = (v) => (Math.abs(v) < 0.0005 ? 0 : v).toFixed(3);

// ---- A student's working for a force along a line, one line wrong (debug "steps") ----------
// mutation.slip: "backwards" (r_A − r_B), "noRoot" (r = x² + y² + z²), "sign" (one difference's
// sign), "noUnit" (F r_AB instead of F u_AB).

export function force3dSteps(setup, mutation) {
  if (setup.analysis === "moment") return momentSteps(setup, mutation); // r × F working (Unit 4.7)
  if (setup.analysis === "rigid") return rigid3dSteps(setup, mutation); // a 3D body's working (Unit 5.6)
  const f = setup.forces.find((x) => x.dir && x.dir.from);
  const v = solveForce3d(setup).values;
  const [A, B] = [f.dir.from, f.dir.to];
  const AB = `${A}${B}`;
  const F = f.magnitude;
  const r = [v[`${f.id}.rx`], v[`${f.id}.ry`], v[`${f.id}.rz`]];
  const len = v[`${f.id}.r`];
  const slip = mutation.slip;
  const signAt = r.findIndex((c) => Math.abs(c) > 1e-9);
  const rW = slip === "backwards" ? r.map((c) => -c) : slip === "sign" ? r.map((c, i) => (i === signAt ? -c : c)) : r;
  const lenW = slip === "noRoot" ? len * len : len;
  const uW = rW.map((c) => c / lenW);
  const FW = slip === "noUnit" ? rW.map((c) => F * c) : uW.map((c) => F * c);
  const lineR = (rv) => `\\mathbf{r}_{${AB}} = \\mathbf{r}_${B} - \\mathbf{r}_${A} = ${vecTex(rv, "m", (x) => n4(x))}`;
  // (The length line squares the student's own components.)
  const lineLen = (L, root = true, rv = r) => `r_{${AB}} = ${root ? "\\sqrt{" : ""}${rv.map((c) => `(${n4(c)})^2`).join(" + ")}${root ? "}" : ""} = ${fixedTex(L, "m", 3)}`;
  const lineU = (u) => `\\mathbf{u}_{${AB}} = \\dfrac{\\mathbf{r}_{${AB}}}{r_{${AB}}} = ${vecTex(u, "", n3)}`;
  const lineF = (Fv, viaR = false) => `\\mathbf{${f.symbol}} = ${f.symbol}\\,\\mathbf{${viaR ? "r" : "u"}}_{${AB}} = (${F})${viaR ? "\\mathbf{r}" : "\\mathbf{u}"}_{${AB}} = ${vecTex(Fv, "N")}`;
  const correct = [lineR(r), lineLen(len), lineU(r.map((c) => c / len)), lineF(r.map((c) => (F * c) / len))];
  const lines = [
    { id: "r", tex: slip === "backwards" ? `\\mathbf{r}_{${AB}} = \\mathbf{r}_${A} - \\mathbf{r}_${B} = ${vecTex(rW, "m", (x) => n4(x))}` : lineR(rW) },
    { id: "len", tex: slip === "noRoot" ? lineLen(lenW, false, rW) : lineLen(lenW, true, rW) },
    { id: "u", tex: lineU(uW) },
    { id: "F", tex: slip === "noUnit" ? lineF(FW, true) : lineF(FW) },
  ];
  const WHY = {
    backwards: { wrong: "r", kind: "direction", fix: "Subtract the other way: $\\mathbf{r}_B - \\mathbf{r}_A$ (from A to B)",
      explain: `The cable pulls from ${A} toward ${B}, so the position vector goes from ${A} to ${B}: $\\mathbf{r}_{${AB}} = \\mathbf{r}_${B} - \\mathbf{r}_${A}$ — the END minus the START. Backwards, every component has the wrong sign.` },
    sign: { wrong: "r", kind: "sign", fix: `Fix the sign of the ${AX[signAt]} part`,
      explain: `The ${AX[signAt]} part is $${AX[signAt]}_${B} - ${AX[signAt]}_${A}$ = ${n4(r[signAt])} m: check the signs of the coordinates in the key.` },
    noRoot: { wrong: "len", kind: "algebra", fix: "Take the square root: $r = \\sqrt{x^2 + y^2 + z^2}$",
      explain: "The length of a vector is the SQUARE ROOT of the sum of its components squared (Pythagoras, in 3D)." },
    noUnit: { wrong: "F", kind: "missing", fix: "Multiply F by the UNIT vector $\\mathbf{u}_{AB}$, not by $\\mathbf{r}_{AB}$",
      explain: "$\\mathbf{r}_{AB}$ is in metres and as long as the cable. Only the unit vector (length 1) carries just the direction: $\\mathbf{F} = F\\,\\mathbf{u}_{AB}$." },
  }[slip];
  const ids = lines.map((l) => l.id);
  const follows = lines.filter((l, i) => ids.indexOf(l.id) > ids.indexOf(WHY.wrong) && l.tex !== correct[i]).map((l) => l.id);
  // Two tempting wrong fixes: any of these that isn't this slip's own fix.
  const others = [
    { key: "noRoot", label: "Take the square root in the length", feedback: "The length line is right. Look at where the numbers first go wrong." },
    { key: "swap", label: "Swap two of the components", feedback: "The components are in the right places. Check their signs, or what F multiplies." },
    { key: "backwards", label: "Subtract the other way round", feedback: "The subtraction is the right way round: B minus A." },
    { key: "noUnit", label: "Multiply F by the unit vector", feedback: "It does use the unit vector. Check the lines before it." },
  ].filter((o) => o.key !== slip).slice(0, 2).map(({ label, feedback }) => ({ label, feedback }));
  return { lines, wrong: WHY.wrong, follows, fixes: [{ label: WHY.fix, correct: true }, ...others], explain: WHY.explain, kind: WHY.kind, corrected: correct };
}

