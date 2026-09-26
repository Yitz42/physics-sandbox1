// particle-summary.js — the lines shown under ΣFx and ΣFy:
// the resultant's size and angle (Unit 1) or the solved unknowns (Unit 2).
// Returned as KaTeX strings.

import { fixedTex, sigFig, unitTex } from "../../core/units.js";
import { pointsDelta } from "./directions.js";
import { lineName, unitVectorSymbol } from "./particle.js";

// A vector symbol in bold, the way textbooks print vectors: F_1 → **F**_1.
export const bold = (symbol) => String(symbol).replace(/^([A-Za-z])/, "\\mathbf{$1}");

// {a i + b j} with a unit, e.g. {120.0 i − 160.0 j} N.
function cartesianTex(x, y, unit, decimals = 1) {
  const n = (v) => (Math.abs(v) < 0.5 * 10 ** -decimals ? 0 : v).toFixed(decimals);
  const op = y < 0 && Math.abs(Number(n(y))) > 0 ? "-" : "+";
  const u = unit ? `\\,${unitTex(unit)}` : "";
  return `\\{${n(x)}\\,\\mathbf{i} ${op} ${n(Math.abs(y))}\\,\\mathbf{j}\\}${u}`;
}

// setup.cartesian: write each force (and the resultant) as a Cartesian vector,
// F = {F_x i + F_y j} N. A force given by two points also shows its position
// vector r_AB = r_B − r_A, its length and its unit vector u_AB = r_AB / r_AB.
function cartesianLines(setup, result, { mode, reveal }) {
  const v = result.values;
  const numbers = mode === "numeric" && reveal;
  const lines = [];
  for (const f of setup.forces) {
    const F = bold(f.symbol);
    const u = unitVectorSymbol(f).replace(/^u/, "\\mathbf{u}");
    if (f.direction && f.direction.points) {
      const [A, B] = f.direction.names || ["A", "B"];
      const r = `\\mathbf{r}_{${lineName(f)}}`, rLen = `r_{${lineName(f)}}`;
      const [dx, dy] = pointsDelta(f.direction);
      if (!numbers) {
        lines.push(`${r} = (x_{${B}} - x_{${A}})\\,\\mathbf{i} + (y_{${B}} - y_{${A}})\\,\\mathbf{j}, \\quad ${u} = \\dfrac{${r}}{${rLen}}, \\quad ${F} = ${f.symbol}\\,${u}`);
        continue;
      }
      lines.push(`${r} = ${cartesianTex(dx, dy, "m", 2)}, \\quad ${rLen} = \\sqrt{(${sigFig(dx, 4)})^2 + (${sigFig(dy, 4)})^2} = ${fixedTex(v[`${f.id}.r`], "m", 2)}`);
      const inner = cartesianTex(v[`${f.id}.ux`], v[`${f.id}.uy`], "", 3).replace(/^\\\{|\\\}$/g, "");
      if (v[f.id] != null) lines.push(`${u} = ${inner}, \\quad ${F} = (${sigFig(v[f.id], 4)})\\,${u} = ${cartesianTex(v[`${f.id}.x`], v[`${f.id}.y`], "N")}`);
      else lines.push(`${u} = ${inner}`);
    } else if (v[`${f.id}.x`] != null) {
      lines.push(numbers ? `${F} = ${cartesianTex(v[`${f.id}.x`], v[`${f.id}.y`], "N")}` : `${F} = ${f.symbol}\\,${u}`);
    }
  }
  if (result.status === "resultant" && setup.analysis === "resultant") {
    lines.push(numbers
      ? `\\mathbf{F}_R = \\Sigma\\mathbf{F} = ${cartesianTex(v["R.x"], v["R.y"], "N")}`
      : "\\mathbf{F}_R = \\Sigma\\mathbf{F} = F_{Rx}\\,\\mathbf{i} + F_{Ry}\\,\\mathbf{j}");
  }
  return lines;
}

// mode: "symbolic" | "numeric";  reveal: false hides numbers the student must find
export function particleSummary(setup, result, opts = {}) {
  const { mode = "symbolic", reveal = true } = opts;
  const v = result.values;
  const lines = setup.cartesian ? cartesianLines(setup, result, { mode, reveal }) : [];
  if (setup.analysis === "components") return lines; // each component already has its own line
  if (result.status === "resultant") {
    const showNums = mode === "numeric" && reveal;
    lines.push(showNums
      ? `F_R = \\sqrt{(${sigFig(v["R.x"], 4)})^2 + (${sigFig(v["R.y"], 4)})^2} = ${fixedTex(v.R, "N")}`
      : "F_R = \\sqrt{F_{Rx}^2 + F_{Ry}^2}");
    lines.push(showNums
      ? `\\theta = \\tan^{-1}\\left|\\dfrac{${sigFig(v["R.y"], 4)}}{${sigFig(v["R.x"], 4)}}\\right| = ${fixedTex(v["R.angle"], "deg")}`
      : "\\theta = \\tan^{-1}\\left|\\dfrac{F_{Ry}}{F_{Rx}}\\right|");
    return lines;
  }
  if (!reveal || result.status !== "determinate") return lines;
  for (const id of result.unknowns) {
    const f = setup.forces.find((x) => x.id === id);
    lines.push(`${f.symbol} = ${fixedTex(v[id], "N")}`);
  }
  return lines;
}
