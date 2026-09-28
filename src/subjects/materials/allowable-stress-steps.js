// allowable-stress-steps.js — a student's working for a connection's allowable load, with one
// wrong line (Unit 1.4's debug stage). Split from allowable-stress-tools.js to keep it small.

import { fixedTex } from "../../core/units.js";
import { solveAllowableStress } from "./allowable-stress.js";

export function allowableStressDebug(setup = {}, mutation = {}) {
  const res = solveAllowableStress(setup);
  const v = res.values;

  const slip = mutation.slip || "tookMaximum";

  // Correct capacities in kN
  const corrPt = v.P_tension;
  const corrPs = v.P_shear;
  const corrPb = v.P_bearing;
  const corrPallow = v.P_allow;

  // Student's flawed values
  let studPt = corrPt;
  let studPs = corrPs;
  let studPb = corrPb;
  let studPallow = corrPallow;

  if (slip === "tookMaximum") {
    studPallow = Math.max(corrPt, corrPs, corrPb);
  } else if (slip === "forgotDoubleShear") {
    studPs = corrPs / 2;
    studPallow = Math.min(corrPt, studPs, corrPb);
  } else if (slip === "noKilo") {
    // (One line only: the rod's capacity left in newtons but written as kN. It is then far the
    // biggest, so the minimum — and the lines after it — are still right.)
    studPt = corrPt * 1000;
    studPallow = Math.min(studPt, studPs, studPb);
  }

  const linePt = (val) =>
    `P_{\\text{tension}} = \\sigma_{\\text{allow}} A_{\\text{rod}} = ${fixedTex(val, "kN", 1)}`;

  const linePs = (val, isSingle = false) =>
    isSingle
      ? `P_{\\text{shear}} = \\tau_{\\text{allow}} A_{\\text{pin}} = ${fixedTex(val, "kN", 1)}`
      : `P_{\\text{shear}} = 2 \\tau_{\\text{allow}} A_{\\text{pin}} = ${fixedTex(val, "kN", 1)}`;

  const linePb = (val) =>
    `P_{\\text{bearing}} = \\sigma_{b,\\text{allow}} (t \\cdot d) = ${fixedTex(val, "kN", 1)}`;

  const linePallow = (val, isMax = false) =>
    isMax
      ? `P_{\\text{allow}} = \\max(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}}) = ${fixedTex(val, "kN", 1)}`
      : `P_{\\text{allow}} = \\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}}) = ${fixedTex(val, "kN", 1)}`;

  const correct = [
    linePt(corrPt),
    linePs(corrPs, false),
    linePb(corrPb),
    linePallow(corrPallow, false),
  ];

  const lines = [
    { id: "tensile-capacity", tex: linePt(studPt) },
    { id: "shear-capacity", tex: linePs(studPs, slip === "forgotDoubleShear") },
    { id: "bearing-capacity", tex: linePb(studPb) },
    { id: "allowable-load", tex: linePallow(studPallow, slip === "tookMaximum") },
  ];

  const WHY = {
    tookMaximum: {
      wrong: "allowable-load",
      kind: "concept",
      fix: "Take the MINIMUM of the allowable loads: a structure fails at its weakest limit",
      explain: "The overall allowable load is governed by the earliest failure mode: $P_{\\text{allow}} = \\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}})$.",
    },
    forgotDoubleShear: {
      wrong: "shear-capacity",
      kind: "concept",
      fix: "Multiply pin shear capacity by 2: double shear provides two shear planes ($P_{\\text{shear}} = 2 \\tau_{\\text{allow}} A$)",
      explain: "Because the clevis pin is supported on both sides, two cross-sections must be cut simultaneously, doubling the shear capacity.",
    },
    noKilo: {
      wrong: "tensile-capacity",
      kind: "units",
      fix: "Divide capacity in newtons by 1000 to convert to kilonewtons ($1\\text{ kN} = 1000\\text{ N}$)",
      explain: "Stress in MPa (N/mm²) times area in mm² gives force in newtons. Dividing by 1000 converts to kilonewtons.",
    },
  }[slip];

  const ids = lines.map((l) => l.id);
  const follows = lines.filter((l, i) => ids.indexOf(l.id) > ids.indexOf(WHY.wrong) && l.tex !== correct[i]).map((l) => l.id);

  const others = [
    { key: "allowable-load", label: "Average the three capacities together", feedback: "Structures are not governed by averages; they fail when the weakest component fails." },
    { key: "shear-capacity", label: "Divide shear capacity by pin circumference", feedback: "Shear capacity is allowable stress multiplied by cross-sectional area." },
  ].slice(0, 2).map(({ label, feedback }) => ({ label, feedback }));

  return {
    lines,
    wrong: WHY.wrong,
    follows,
    fixes: [{ label: WHY.fix, correct: true }, ...others],
    explain: WHY.explain,
    kind: WHY.kind,
    corrected: correct,
  };
}
