// force3d-balance-tools.js — for a particle in equilibrium in 3D (Unit 3.4): the lines under
// the equations (each cable's r and u, then the solved forces) and the answers that common
// slips give, so wrong answers can be explained.

import { fixedTex, sigFig } from "../../core/units.js";
import { clone } from "../../core/paths.js";
import { solveBalance3d, sizeOf3 } from "./force3d-balance.js";
import { vecTex } from "./force3d-tools.js";

const n4 = (v) => sigFig(v, 4);
const n3 = (v) => (Math.abs(v) < 0.0005 ? 0 : v).toFixed(3);
const AX = ["x", "y", "z"];
const plain = (sym) => String(sym).replace(/[{}]/g, "");

// The lines under ΣF_x, ΣF_y, ΣF_z: each line force's r and u (the directions — shown once the
// equations are, even before the answer), then the solved sizes (only once revealed).
export function balanceSummary(setup, res, { reveal = true, hideAnswers = false } = {}) {
  const v = res.values;
  if (!reveal && !hideAnswers) return [];
  const lines = [];
  for (const f of setup.forces || []) {
    if (!f.dir || !f.dir.from) continue;
    const AB = `${f.dir.from}${f.dir.to}`;
    const r = AX.map((k) => v[`${f.id}.r${k}`]);
    const len = v[`${f.id}.r`];
    lines.push(`\\mathbf{r}_{${AB}} = ${vecTex(r, "m", n4)}, \\quad r_{${AB}} = ${fixedTex(len, "m", 3)}, \\quad \\mathbf{u}_{${AB}} = ${vecTex(r.map((c) => c / len), "", n3)}`);
  }
  if (!reveal || hideAnswers || res.status !== "determinate") return lines;
  for (const id of res.unknowns) {
    const f = setup.forces.find((x) => x.id === id);
    lines.push(`${f.symbol} = ${fixedTex(v[id], "N")}`);
  }
  for (const f of (setup.forces || []).filter((x) => x.kind === "spring" && v[`${x.id}.s`] != null)) {
    const n = f.dir && f.dir.from ? `${f.dir.from}${f.dir.to}` : f.id;
    const L = f.unstretched != null ? `, \\quad l_{${n}} = l_0 + s = ${fixedTex(v[`${f.id}.l`], "m", 3)}` : "";
    lines.push(`s_{${n}} = \\dfrac{${f.symbol}}{k} = \\dfrac{${n4(v[f.id])}}{${n4(f.k)}} = ${fixedTex(v[`${f.id}.s`], "m", 3)}${L}`);
  }
  return lines;
}

// Wrong answers common slips give for quantity `name`: [{ value, kind, message }].
export function balanceMistakes(setup, name) {
  const right = solveBalance3d(setup).values[name];
  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || right == null || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };
  // Re-solve with a slip built in; take the student's quantity from that.
  const tryWith = (edit, message, kind) => {
    const s = clone(setup);
    edit(s);
    const r = solveBalance3d(s);
    if (r.status === "determinate" || r.status === "unstable") add(r.values[name], message, kind);
  };
  for (const f of setup.forces || []) {
    if (f.dir && f.dir.from) {
      tryWith((s) => { const g = s.forces.find((x) => x.id === f.id); g.dir = { from: f.dir.to, to: f.dir.from }; },
        `Check the direction of ${plain(f.symbol)}: it pulls ${f.dir.from} TOWARD ${f.dir.to}, so its position vector is END minus START, $\\mathbf{r}_{${f.dir.to}} - \\mathbf{r}_{${f.dir.from}}$.`, "direction");
    }
    if (f.kind === "weight" && f.mass != null) {
      tryWith((s) => { const g = s.forces.find((x) => x.id === f.id); g.magnitude = f.mass; g.mass = null; },
        `Did you use the mass (${f.mass} kg) as the force? The weight is $W = mg$ = ${f.mass}(9.81) N.`, "weight");
    }
  }
  const [id, part] = name.split(".");
  const f = (setup.forces || []).find((x) => x.id === id);
  if (f && part === undefined && sizeOf3(f, setup) == null && f.dir && f.dir.from) {
    const len = solveBalance3d(setup).values[`${id}.r`];
    add(right / len, `Did you multiply ${plain(f.symbol)} by $\\mathbf{r}_{${f.dir.from}${f.dir.to}}$ itself? Divide by its length first: $\\mathbf{u} = \\mathbf{r}/r$ has length 1.`, "vector");
  }
  if (f && f.kind === "spring") {
    const v = solveBalance3d(setup).values;
    const F = v[id], k = f.k, s = v[`${id}.s`], l0 = f.unstretched;
    if (part === "s") {
      add(F * k, "Divide the force by the stiffness, don't multiply: $F = ks$, so $s = F/k$.", "algebra");
      add(k / F, "Upside down: $F = ks$, so $s = F/k$ (force on top).", "algebra");
      if (l0 != null) add(l0 + s, "That's the stretched length. The stretch is only the extra length: $s = F/k$.", "springLength");
    }
    if (part === "l" && l0 != null) {
      add(s, `That's only the stretch. The spring's length is $l = l_0 + s$, with $l_0$ = ${l0} m.`, "springLength");
      add(l0 - s, "The spring is stretched (it pulls), so it gets LONGER: $l = l_0 + s$.", "springLength");
    }
  }
  if (right != null && Math.abs(right) > 1e-9) add(-right, "Right size, wrong sign. A cable's tension is positive when it pulls — check each direction, END minus START.", "sign");
  return list;
}
