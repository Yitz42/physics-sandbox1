// belt-steps.js — a student's working for a rope round a post, with one wrong line
// (Unit 9.3's debug stage). The rope holds a load back (the load side is tight, T₂); the
// student finds the hand's pull T₁. mutation.slip:
//   "degrees"  β left in degrees in e^{μβ}
//   "linear"   e^{μβ} written as 1 + μβ (friction as if from one contact)
//   "swap"     the hand taken as the tight side (T₂) — so the hand pull comes out BIGGER
//   "turns"    only the whole turns counted in β (the extra part of a turn dropped)

import { fixedTex, sigFig } from "../../core/units.js";
import { solveBelt } from "./belt.js";

const num = (v) => sigFig(v, 4);

export function beltSteps(setup, mutation) {
  const v = solveBelt(setup).values;
  const slip = mutation.slip;
  const betaDeg = slip === "turns" ? Math.floor(v.beta / 360) * 360 : v.beta;
  const rad = (betaDeg * Math.PI) / 180;
  const E = slip === "degrees" ? Math.exp(v.mus * betaDeg) : slip === "linear" ? 1 + v.mus * rad : Math.exp(v.mus * rad);
  const T1 = slip === "swap" ? v.load * E : v.load / E;
  const lines = [
    { id: "beta", tex: `\\beta = ${num(betaDeg)}^\\circ = ${num(betaDeg)}\\cdot\\tfrac{\\pi}{180} = ${num(rad)}\\ \\text{rad}` },
    { id: "factor", tex: slip === "degrees" ? `e^{\\mu_s\\beta} = e^{(${num(v.mus)})(${num(betaDeg)})} = ${num(E)}`
      : slip === "linear" ? `1 + \\mu_s\\beta = 1 + (${num(v.mus)})(${num(rad)}) = ${num(E)}` : `e^{\\mu_s\\beta} = e^{(${num(v.mus)})(${num(rad)})} = ${num(E)}` },
    { id: "sides", tex: slip === "swap" ? "\\text{Tight side } T_2\\text{: the hand;}\\ \\ T_1\\text{: the load}" : "\\text{Tight side } T_2\\text{: the load;}\\ \\ T_1\\text{: the hand}" },
    { id: "answer", tex: slip === "swap" ? `T_{\\text{hand}} = T_{\\text{load}}\\,e^{\\mu_s\\beta} = ${fixedTex(T1, "N")}` : `T_{\\text{hand}} = \\dfrac{T_{\\text{load}}}{${slip === "linear" ? "1 + \\mu_s\\beta" : "e^{\\mu_s\\beta}"}} = ${fixedTex(T1, "N")}` },
  ];
  const E0 = Math.exp(v.mus * v.betaRad);
  const corrected = [
    `\\beta = ${num(v.beta)}^\\circ = ${num(v.beta)}\\cdot\\tfrac{\\pi}{180} = ${num(v.betaRad)}\\ \\text{rad}`,
    `e^{\\mu_s\\beta} = e^{(${num(v.mus)})(${num(v.betaRad)})} = ${num(E0)}`,
    "\\text{Tight side } T_2\\text{: the load;}\\ \\ T_1\\text{: the hand}",
    `T_{\\text{hand}} = \\dfrac{T_{\\text{load}}}{e^{\\mu_s\\beta}} = ${fixedTex(v.hand, "N")}`,
  ];
  const WHY = {
    degrees: { wrong: "factor", kind: "calculator", fix: "Use β in radians in the exponent",
      explain: "The formula $T_2 = T_1 e^{\\mu_s\\beta}$ needs β in RADIANS. The first line had it right; the second put the degrees back in." },
    linear: { wrong: "factor", kind: "concept", fix: "Use $e^{\\mu_s\\beta}$, not $1 + \\mu_s\\beta$",
      explain: "Friction builds up all along the contact, each bit in proportion to the tension there — so the tension grows exponentially: $e^{\\mu_s\\beta}$." },
    swap: { wrong: "sides", kind: "direction", fix: "The load is the tight side, $T_2$",
      explain: "The rope is about to slip toward the load, so the load pulls harder: the load is $T_2$ and the hand, which friction helps, is the slack side $T_1$." },
    turns: { wrong: "beta", kind: "concept", fix: `Count the whole angle of contact: ${num(v.beta)}°`,
      explain: "β is ALL the rope in contact with the post — the whole turns and the part of a turn too." },
  }[slip];
  const ids = lines.map((l) => l.id);
  const follows = lines.filter((l, i) => l.id !== WHY.wrong && ids.indexOf(l.id) > ids.indexOf(WHY.wrong) && l.tex !== corrected[i]).map((l) => l.id);
  const others = [
    { label: "Use $\\log_{10}$ instead", feedback: "There's no log in this working — and where one is needed (to find β), it's the natural log, ln." },
    { label: "Include the post's radius", feedback: "The radius doesn't appear: only the angle of contact β and $\\mu_s$ matter." },
    { label: "Use $\\mu_k$", feedback: "The rope isn't slipping yet — it's about to. Static friction, $\\mu_s$, applies." },
  ];
  return { lines, wrong: WHY.wrong, follows, fixes: [{ label: WHY.fix, correct: true }, ...others.slice(0, 2)], explain: WHY.explain, kind: WHY.kind, corrected };
}
