// allowable-stress-tools.js — equations, summary, quantities, and debug steps for allowable stress design (Unit 1.4).

import { fixedTex, sigFig } from "../../core/units.js";
import { solveAllowableStress } from "./allowable-stress.js";

// KaTeX equations for allowable stress design and simultaneous failure modes.
export function allowableStressEquations(setup = {}, result) {
  const res = result || solveAllowableStress(setup);
  const v = res.values;
  const kN = (x) => `${sigFig(x, 4)}\\,\\text{kN}`;

  return [
    // 1. Tensile capacity of the rod
    {
      id: "tensile-capacity",
      lhs: "P_{\\text{tension}}",
      form: "define",
      terms: [
        {
          id: "Pt_calc",
          sign: 1,
          symbol: "\\sigma_{\\text{allow}} \\cdot A_{\\text{rod}}",
          value: v.P_tension,
          numTex: `(${sigFig(v.sigma_allow, 4)}\\,\\text{MPa})(${sigFig(v.A_rod, 4)}\\,\\text{mm}^2)`,
        },
      ],
      result: { value: v.P_tension, unit: "kN" },
    },
    // 2. Shear capacity of the pin
    {
      id: "shear-capacity",
      lhs: "P_{\\text{shear}}",
      form: "define",
      terms: [
        {
          id: "Ps_calc",
          sign: 1,
          symbol: v.n === 1 ? "\\tau_{\\text{allow}} \\cdot A_{\\text{pin}}" : `2 \\cdot \\tau_{\\text{allow}} \\cdot A_{\\text{pin}}`,
          value: v.P_shear,
          numTex: v.n === 1
            ? `(${sigFig(v.tau_allow, 4)}\\,\\text{MPa})(${sigFig(v.A_pin, 4)}\\,\\text{mm}^2)`
            : `2(${sigFig(v.tau_allow, 4)}\\,\\text{MPa})(${sigFig(v.A_pin, 4)}\\,\\text{mm}^2)`,
        },
      ],
      result: { value: v.P_shear, unit: "kN" },
    },
    // 3. Bearing capacity of the plate hole
    {
      id: "bearing-capacity",
      lhs: "P_{\\text{bearing}}",
      form: "define",
      terms: [
        {
          id: "Pb_calc",
          sign: 1,
          symbol: "\\sigma_{b,\\text{allow}} \\cdot (t \\cdot d)",
          value: v.P_bearing,
          numTex: `(${sigFig(v.sigma_b_allow, 4)}\\,\\text{MPa})(${sigFig(v.A_b, 4)}\\,\\text{mm}^2)`,
        },
      ],
      result: { value: v.P_bearing, unit: "kN" },
    },
    // 4. Overall allowable load: minimum of the three failure limits
    {
      id: "allowable-load",
      lhs: "P_{\\text{allow}}",
      form: "define",
      terms: [
        {
          id: "Pallow_calc",
          sign: 1,
          symbol: "\\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}})",
          value: v.P_allow,
          numTex: `\\min(${kN(v.P_tension)}, ${kN(v.P_shear)}, ${kN(v.P_bearing)})`,
        },
      ],
      result: { value: v.P_allow, unit: "kN" },
    },
  ];
}

// The full working under the equations panel, once the answer is revealed.
export function allowableStressSummary(setup = {}, result, { reveal = true } = {}) {
  if (!reveal) return [];
  const res = result || solveAllowableStress(setup);
  const v = res.values;

  const lines = [
    `P_{\\text{tension}} = \\sigma_{\\text{allow}} A_{\\text{rod}} = (${fixedTex(v.sigma_allow, "", 1)}\\,\\text{MPa})(${fixedTex(v.A_rod, "", 1)}\\,\\text{mm}^2) = ${fixedTex(v.P_tension, "kN", 1)}`,
    v.n === 2
      ? `P_{\\text{shear}} = 2 \\tau_{\\text{allow}} A_{\\text{pin}} = 2 (${fixedTex(v.tau_allow, "", 1)}\\,\\text{MPa})(${fixedTex(v.A_pin, "", 1)}\\,\\text{mm}^2) = ${fixedTex(v.P_shear, "kN", 1)}`
      : `P_{\\text{shear}} = \\tau_{\\text{allow}} A_{\\text{pin}} = (${fixedTex(v.tau_allow, "", 1)}\\,\\text{MPa})(${fixedTex(v.A_pin, "", 1)}\\,\\text{mm}^2) = ${fixedTex(v.P_shear, "kN", 1)}`,
    `P_{\\text{bearing}} = \\sigma_{b,\\text{allow}} (t \\cdot d) = (${fixedTex(v.sigma_b_allow, "", 1)}\\,\\text{MPa})(${fixedTex(v.A_b, "", 1)}\\,\\text{mm}^2) = ${fixedTex(v.P_bearing, "kN", 1)}`,
    `P_{\\text{allow}} = \\min(P_{\\text{tension}}, P_{\\text{shear}}, P_{\\text{bearing}}) = ${fixedTex(v.P_allow, "kN", 1)}\\quad\\text{(governed by ${v.governing})}`,
  ];

  if (v.FS != null) {
    lines.push(`FS = \\dfrac{P_{\\text{allow}}}{P} = \\dfrac{${fixedTex(v.P_allow, "kN", 1)}}{${fixedTex(v.P, "kN", 1)}} = ${fixedTex(v.FS, "", 2)}`);
  }

  return lines;
}

export function allowableStressQuantities() {
  return {
    P: { label: "P", unit: "kN", name: "Applied load" },
    P_allow: { label: "P_{\\text{allow}}", unit: "kN", name: "Allowable load" },
    P_tension: { label: "P_{\\text{tension}}", unit: "kN", name: "Tension limit" },
    P_shear: { label: "P_{\\text{shear}}", unit: "kN", name: "Shear limit" },
    P_bearing: { label: "P_{\\text{bearing}}", unit: "kN", name: "Bearing limit" },
    sigma: { label: "\\sigma", unit: "MPa", name: "Tensile stress" },
    tau: { label: "\\tau", unit: "MPa", name: "Shear stress" },
    sigma_b: { label: "\\sigma_b", unit: "MPa", name: "Bearing stress" },
    FS: { label: "FS", unit: "", name: "Factor of safety" },
  };
}

// Wrong answers common slips give: [{ value, message, kind }].
export function allowableStressMistakes(setup = {}, name) {
  const res = solveAllowableStress(setup);
  const v = res.values;
  const right = v[name];
  if (right == null) return [];

  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };

  if (name === "P_allow") {
    // Slip: took maximum instead of minimum (overdesigning / unsafe!)
    const maxVal = Math.max(v.P_tension, v.P_shear, v.P_bearing);
    add(maxVal, "The allowable load is governed by the WEAKEST link: take the minimum of the capacities, not the maximum.", "concept");

    // Slip: forgot double shear
    if (v.n === 2) {
      const halfShearP = Math.min(v.P_tension, v.P_shear / 2, v.P_bearing);
      add(halfShearP, "Did you treat the pin as single shear instead of double shear? In double shear, $P_{\\text{shear}} = 2 \\tau_{\\text{allow}} A_{\\text{pin}}$.", "concept");
    }

    // Slip: units slip (forgot / 1000)
    add(right * 1000, "Units slip: allowable load is in kN ($1\\text{ kN} = 1000\\text{ N}$).", "units");
  }

  if (name === "FS") {
    // Slip: inverted FS (P / P_allow)
    if (v.P_allow > 0) {
      add(v.P / v.P_allow, "Factor of safety is capacity over demand: $FS = P_{\\text{allow}} / P$, not $P / P_{\\text{allow}}$.", "algebra");
    }
  }

  return list;
}

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
    studPt = corrPt * 1000;
    studPs = corrPs * 1000;
    studPb = corrPb * 1000;
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
