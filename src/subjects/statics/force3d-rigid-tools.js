// force3d-rigid-tools.js — for a rigid body in 3D (Unit 5.6): the lines under the six equations
// (each cable's r and u, then the solved reactions), and a student's working with one wrong line.
// The physics is in force3d-rigid.js.

import { fixedTex, sigFig } from "../../core/units.js";
import { equationTex, swapFactor, flipSign, solveEquations } from "../../core/equations.js";
import { vecTex } from "./force3d-tools.js";
import { solveRigid3d, rigid3dEquations, allForces3 } from "./force3d-rigid.js";
import { directionOf3 } from "./force3d.js";

const n4 = (v) => sigFig(v, 4);
const n3 = (v) => (Math.abs(v) < 0.0005 ? 0 : v).toFixed(3);

// Each cable's r and u (shown with the equations), then — once revealed — every reaction.
export function rigid3dSummary(setup, res, { reveal = true, hideAnswers = false } = {}) {
  const v = res.values;
  if (!reveal && !hideAnswers) return [];
  const lines = [];
  for (const f of (setup.forces || []).filter((x) => x.dir && x.dir.from)) {
    const d = directionOf3(f, setup);
    if (d.error) continue;
    lines.push(`\\mathbf{r}_{${f.dir.from}${f.dir.to}} = ${vecTex(d.r, "m", n4)}, \\quad r = ${fixedTex(d.len, "m", 3)}, \\quad \\mathbf{u} = ${vecTex(d.u, "", n3)}`);
  }
  if (!reveal || hideAnswers || res.status !== "determinate") return lines;
  const found = allForces3(setup).filter((f) => (res.unknowns || []).includes(f.id));
  for (let k = 0; k < found.length; k += 3) lines.push(found.slice(k, k + 3).map((f) => `${f.symbol} = ${fixedTex(v[f.id], "N")}`).join(",\\quad "));
  return lines;
}

// ---- A student's working, one line wrong (debug "steps") ----------------------------------
// setup.steps3d: [{ eq: "sumMx", find: "T" }, …] — the order the equations are used in, each
// giving one unknown (moments about well-chosen axes first). The first line is the cable's r
// and u. mutation.slip:
//   "noUnit"   the cable's r used as its unit vector (its line, and every line after it)
//   "arm"      the weight's moment arm about the first axis: its coordinate along that axis
//   "sign"     the cable's term in the second equation with the wrong sign
//   "drop"     a reaction (mutation.reaction) left out of the last equation

export function rigid3dSteps(setup, mutation) {
  const plan = setup.steps3d;
  const unknowns = solveRigid3d(setup).unknowns;
  const cable = (setup.forces || []).find((f) => f.kind === "cable");
  const slip = mutation.slip;
  const good = rigid3dEquations(setup);
  let bad = slip === "noUnit" ? rigid3dEquations(setup, { rNotU: true }) : good.map((e) => JSON.parse(JSON.stringify(e)));
  const at = (id) => bad.findIndex((e) => e.id === id);
  let wrongLine = "cable";
  if (slip === "arm") { const i = at(plan[0].eq); bad[i] = swapFactor(bad[i], mutation.force || "W"); wrongLine = plan[0].eq; }
  if (slip === "sign") { const i = at(plan[1].eq); bad[i] = flipSign(bad[i], cable.id); wrongLine = plan[1].eq; }
  if (slip === "drop") { const i = at(plan[2].eq); bad[i] = { ...bad[i], terms: bad[i].terms.filter((t) => t.id !== mutation.reaction) }; wrongLine = plan[2].eq; }
  // Each equation in turn: substitute what earlier lines found, solve for its own unknown.
  const work = (eqs) => {
    const known = {};
    return plan.map(({ eq, find }) => {
      const e = eqs.find((x) => x.id === eq);
      const filled = { ...e, terms: e.terms.map((t) => (t.value == null && known[t.id] != null ? { ...t, value: known[t.id] } : t)) };
      const sol = solveEquations([filled], [find]).values[find];
      known[find] = sol;
      const f = allForces3(setup).find((x) => x.id === find);
      return { id: eq, tex: `${equationTex(e, "symbolic", { highlight: false })} \;\\Rightarrow\; ${f.symbol} = ${fixedTex(sol, "N")}` };
    });
  };
  const d = directionOf3(cable, setup);
  const cableLine = (rNotU) => ({ id: "cable", tex: `\\mathbf{r} = ${vecTex(d.r, "m", n4)},\\ r = ${fixedTex(d.len, "m", 3)},\\ \\mathbf{u} = ${rNotU ? vecTex(d.r, "", n4) : vecTex(d.u, "", n3)}` });
  const corrected = [cableLine(false), ...work(good)].map((l) => l.tex);
  const lines = [cableLine(slip === "noUnit"), ...work(bad)];
  const WHY = {
    noUnit: { kind: "vector", fix: "Divide r by its length: $\\mathbf{u} = \\mathbf{r}/r$",
      explain: "A cable's force is $T\\,\\mathbf{u}$, with $\\mathbf{u} = \\mathbf{r}/r$ a UNIT vector. Using r itself makes every one of its parts too big by the cable's length." },
    arm: { kind: "momentArm", fix: "Use the distance square to the axis and the force",
      explain: "A force's moment arm about an axis is the distance measured square to BOTH the axis and the force — not the point's coordinate along the axis." },
    sign: { kind: "sign", fix: "Flip the sign of the cable's term",
      explain: "Find the sign from $\\mathbf{r} \\times \\mathbf{F}$ (or the right-hand rule): the cable turns the body the other way about this axis." },
    drop: { kind: "missing", fix: `Put $${(allForces3(setup).find((f) => f.id === mutation.reaction) || {}).symbol}$ back in`,
      explain: "Every force on the body belongs in ΣF along an axis it has a part along — the reaction found earlier too." },
  }[slip];
  const wrong = slip === "noUnit" ? "cable" : wrongLine;
  const ids = lines.map((l) => l.id);
  const follows = lines.filter((l, i) => l.id !== wrong && ids.indexOf(l.id) > ids.indexOf(wrong) && l.tex !== corrected[i]).map((l) => l.id);
  const others = [
    { label: "Take moments about the centre of gravity instead", feedback: "Any point works, but about a support the reactions there drop out — that's why the working uses it." },
    { label: "Add a moment reaction at the ball-and-socket", feedback: "A ball-and-socket lets the body turn every way: it gives three forces and no moments." },
    { label: "Use six unknowns in one equation", feedback: "Each line uses an axis that leaves one unknown — that's the point of choosing axes through the supports." },
  ];
  return { lines, wrong, follows, fixes: [{ label: WHY.fix, correct: true }, ...others.slice(0, 2)], explain: WHY.explain, kind: WHY.kind, corrected };
}
