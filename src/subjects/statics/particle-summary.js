// particle-summary.js — the lines shown under ΣFx and ΣFy:
// the resultant's size and angle (Unit 1) or the solved unknowns (Unit 2).
// Returned as KaTeX strings.

import { fixedTex, sigFig } from "../../core/units.js";

// mode: "symbolic" | "numeric";  reveal: false hides numbers the student must find
export function particleSummary(setup, result, { mode = "symbolic", reveal = true } = {}) {
  const v = result.values;
  const lines = [];
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
