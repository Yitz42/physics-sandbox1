// axial-stress-steps.js — a student's working for a bar's normal stress, with one wrong line
// (Unit 1.1's debug stage). Split from axial-stress-tools.js to keep it small.

import { sigFig, fixedTex } from "../../core/units.js";
import { solveAxialStress, PI } from "./axial-stress.js";

const n4 = (v) => sigFig(v, 4);

// Student's working for normal stress: one line wrong (debug challenge, view: "steps").
export function axialStressDebug(setup = {}, mutation = {}) {
  const v = solveAxialStress(setup).values;
  const bar = setup.bar || {};
  const d = bar.diameter ?? 20;
  const P_kN = v.P;
  const P_N = v.P_N;
  const slip = mutation.slip || "diameterAsRadius";

  // Correct values
  const corrA = v.A;
  const corrP = P_N;
  const corrSigma = v.sigma;
  const corrKind = corrSigma >= 0 ? "\\text{Tension (stretching)}" : "\\text{Compression (squashing)}";

  // Student's potentially flawed values
  let studA = corrA;
  let studP = corrP;
  let studSigma = corrSigma;
  let studKind = corrKind;

  if (slip === "diameterAsRadius") {
    studA = PI * d * d;
    studSigma = studP / studA;
  } else if (slip === "perimeter") {
    studA = PI * d;
    studSigma = studP / studA;
  } else if (slip === "noKilo") {
    studP = P_kN; // forgot to multiply by 1000
    studSigma = studP / studA;
  } else if (slip === "wrongSign") {
    studKind = corrSigma >= 0 ? "\\text{Compression (squashing)}" : "\\text{Tension (stretching)}";
  }

  const lineA = (a, isWrongFormula = false) =>
    `A = ${isWrongFormula ? "\\pi d^2" : "\\dfrac{\\pi}{4} d^2"} = ${fixedTex(a, "", 1)}\\,\\text{mm}^2`;
  const lineP = (p, inKilo = false) =>
    `P = ${inKilo ? `${P_kN}\\,\\text{N}` : `${P_kN}\\,\\text{kN} = ${n4(p)}\\,\\text{N}`}`;
  const lineSigma = (p, a, s) =>
    `\\sigma = \\dfrac{P}{A} = \\dfrac{${n4(p)}\\,\\text{N}}{${fixedTex(a, "", 1)}\\,\\text{mm}^2} = ${fixedTex(s, "", 1)}\\,\\text{MPa}`;
  const lineKind = (k) => `\\text{Type: } ${k}`;

  const correct = [
    lineA(corrA),
    lineP(corrP),
    lineSigma(corrP, corrA, corrSigma),
    lineKind(corrKind),
  ];

  const lines = [
    { id: "area", tex: slip === "diameterAsRadius" ? lineA(studA, true) : (slip === "perimeter" ? `A = \\pi d = ${fixedTex(studA, "", 1)}\\,\\text{mm}^2` : lineA(corrA)) },
    // (The slipped line looks like any other line: no note saying what went wrong.)
    { id: "load", tex: slip === "noKilo" ? `P = ${P_kN}\\,\\text{N}` : lineP(corrP) },
    { id: "stress", tex: lineSigma(studP, studA, studSigma) },
    { id: "type", tex: lineKind(studKind) },
  ];

  const WHY = {
    diameterAsRadius: {
      wrong: "area",
      kind: "algebra",
      fix: "Divide by 4: the area is $A = \\frac{\\pi}{4} d^2$, not $\\pi d^2$",
      explain: "The diameter is $d = 2r$. In terms of diameter, $A = \\pi (d/2)^2 = \\frac{\\pi}{4} d^2$. Using $\\pi d^2$ makes the area 4 times too large!",
    },
    perimeter: {
      wrong: "area",
      kind: "geometry",
      fix: "Use the circle area formula $A = \\frac{\\pi}{4} d^2$, not the perimeter $\\pi d$",
      explain: "$\\pi d$ is the circumference (perimeter) of the circle, measured in millimetres. The cross-sectional area is $A = \\frac{\\pi}{4} d^2$ in $\\text{mm}^2$.",
    },
    noKilo: {
      wrong: "load",
      kind: "units",
      fix: "Convert kN to N: $1\\text{ kN} = 1000\\text{ N}$",
      explain: `The load was given as $${n4(Math.abs(P_kN))}\\text{ kN}$. Since $1\\text{ MPa} = 1\\text{ N/mm}^2$, the force must be in newtons: $${n4(Math.abs(P_kN))}\\text{ kN} = ${n4(Math.abs(P_N))}\\text{ N}$.`,
    },
    wrongSign: {
      wrong: "type",
      kind: "sign",
      // (Whichever way this bar is loaded: the fix names what it really is.)
      fix: corrSigma >= 0 ? "A load pulling on the ends causes TENSION, not compression" : "A load pushing on the ends causes COMPRESSION, not tension",
      explain: "Tension stretches the member ($P > 0, \\sigma > 0$); compression squashes it ($P < 0, \\sigma < 0$).",
    },
  }[slip];

  const ids = lines.map((l) => l.id);
  const follows = lines.filter((l, i) => ids.indexOf(l.id) > ids.indexOf(WHY.wrong) && l.tex !== correct[i]).map((l) => l.id);

  const others = [
    { key: "area", label: "Use radius instead of diameter", feedback: "The diameter was measured directly; the formula just needed $\\pi/4$." },
    { key: "load", label: "Convert the load to kilograms", feedback: "Force belongs in newtons, not kilograms." },
    { key: "stress", label: "Multiply load by area instead of dividing", feedback: "Stress is force PER area, so dividing is correct." },
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

