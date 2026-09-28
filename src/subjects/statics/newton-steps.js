// newton-steps.js — a student's working for a crate hanging at rest from a cable, with one wrong
// line (Unit 1.1's debug stage). mutation.slip:
//   "noG"      W = m (a mass in kg written as a force)
//   "divideG"  W = m / g
//   "kN"       newtons to kilonewtons the wrong way (× 1000)
//   "thirdLaw" the crate said to pull the cable UP (the pair's direction)

import { fixedTex, sigFig } from "../../core/units.js";
import { solveNewton } from "./newton.js";

const num = (v) => sigFig(v, 4);

export function newtonSteps(setup, mutation) {
  const v = solveNewton(setup).values;
  const slip = mutation.slip;
  const W = slip === "noG" ? v.m : slip === "divideG" ? v.m / v.g : v.W;
  const Wline = (w, how) => ({ id: "W", tex: `W = ${how} = ${fixedTex(w, "N", 2)}` });
  const kN = (w, wrong) => ({ id: "kN", tex: `W = ${wrong ? `${num(w)} \\times 1000` : `\\dfrac{${num(w)}}{1000}`} = ${fixedTex(wrong ? w * 1000 : w / 1000, "kN", 4)}` });
  const T = (w) => ({ id: "T", tex: `\\text{At rest: } \\Sigma F_y = T - W = 0 \;\\Rightarrow\; T = ${fixedTex(w, "N", 2)}` });
  const pair = (up) => ({ id: "pair", tex: `\\text{Third law: the crate pulls the cable ${up ? "UP" : "DOWN"} with } ${fixedTex(v.W, "N", 2)}` });
  const correct = [Wline(v.W, `mg = (${num(v.m)})(${num(v.g)})`), kN(v.W, false), T(v.W), pair(false)];
  const lines = [
    slip === "noG" ? Wline(W, `m = ${num(v.m)}`) : slip === "divideG" ? Wline(W, `\\dfrac{m}{g} = \\dfrac{${num(v.m)}}{${num(v.g)}}`) : correct[0],
    slip === "kN" ? kN(W, true) : kN(W, false),
    T(W),
    slip === "thirdLaw" ? pair(true) : pair(false),
  ];
  const WHY = {
    noG: { wrong: "W", kind: "weight", fix: "Multiply by g: $W = mg$",
      explain: "The mass (kg) says how much stuff there is; the weight is the force gravity puts on it, $W = mg$ in newtons." },
    divideG: { wrong: "W", kind: "weight", fix: "Multiply by g, don't divide",
      explain: "$W = mg$: a 1 kg mass weighs 9.81 N on Earth, not 0.1 N." },
    kN: { wrong: "kN", kind: "calculator", fix: "Divide by 1000 to get kN",
      explain: "1 kN = 1000 N, so a number of newtons becomes a SMALLER number of kilonewtons: divide by 1000." },
    thirdLaw: { wrong: "pair", kind: "direction", fix: "The crate pulls the cable DOWN",
      explain: "The cable pulls the crate up; the crate pulls back on the cable just as hard, the OPPOSITE way — down." },
  }[slip];
  const tex = correct.map((l) => l.tex);
  const ids = lines.map((l) => l.id);
  const follows = lines.filter((l, i) => l.id !== WHY.wrong && ids.indexOf(l.id) > ids.indexOf(WHY.wrong) && l.tex !== tex[i]).map((l) => l.id);
  const others = [
    { label: "The cable must pull harder than W to hold it up", feedback: "At rest nothing speeds up, so ΣF = 0 (the first law): T = W exactly." },
    { label: "Use g = 10 m/s²", feedback: "g = 9.81 m/s² on Earth; rounding to 10 puts the answer off by 2%." },
    { label: "The crate's weight changes when it hangs", feedback: "Weight is mg wherever it is on Earth — hanging, standing or falling." },
  ];
  return { lines, wrong: WHY.wrong, follows, fixes: [{ label: WHY.fix, correct: true }, ...others.slice(0, 2)], explain: WHY.explain, kind: WHY.kind, corrected: tex };
}
