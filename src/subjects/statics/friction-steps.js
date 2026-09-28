// friction-steps.js — a student's working for a crate on a ramp, with one wrong line
// (Unit 9.1's debug stage). Split from friction-tools.js to keep each file small.

import { fixedTex, sigFig } from "../../core/units.js";
import { surfaceAxes, weightOfBlock, solveFriction } from "./friction.js";
import { blockEquations } from "./friction-tools.js";

const deg = Math.PI / 180;
const num = (v) => sigFig(v, 4);

// ---- A student's working with one wrong line (debug, view "steps") -----------------------
// mutation.slip: "noCos" (N = W on a ramp), "swap" (sin ↔ cos in F), "limit" (F = μ_s N
// though it holds), "weight" (μ_s W instead of μ_s N), "direction" (the wrong way).

export function frictionSteps(setup, mutation) {
  const res = solveFriction(setup);
  const v = res.values;
  const { angle } = surfaceAxes(setup);
  const W = weightOfBlock(setup);
  const th = `${num(angle)}^\\circ`;
  const eqs = blockEquations(setup);
  const Fy = eqs[0].terms.filter((t) => t.id !== "N" && t.id !== "W");
  const Fx = eqs[1].terms.filter((t) => t.id !== "F" && t.id !== "W");
  // One force's term, flipped to the other side of the equation (N = W cos θ − …).
  const moved = (t) => `${t.sign > 0 ? "-" : "+"} ${t.symbol}${t.factor ? t.factor.tex : ""}`;
  const pushY = Fy.map(moved).join(" "), pushX = Fx.map(moved).join(" ");
  const up = angle ? "up the slope" : "to the right", down = angle ? "down the slope" : "to the left";
  const slip = mutation.slip;
  const Nw = slip === "noCos" ? W : v.N;
  const Fw = slip === "swap" ? W * Math.cos(angle * deg) - (W * Math.sin(angle * deg) - v.Fneed) : v.Fneed;
  const limitW = slip === "weight" ? setup.mus * W : setup.mus * Nw;
  const holdsW = Math.abs(Fw) < limitW;
  const line = (id, tex) => ({ id, tex });
  const Ntex = (n, wTex) => `\\Sigma F_{y'} = 0: \\quad N = ${wTex} ${pushY} = ${fixedTex(n, "N")}`;
  const Ftex = (f, wTex) => `\\Sigma F_{x'} = 0: \\quad F = ${wTex} ${pushX} = ${fixedTex(f, "N")}`;
  const lim = (n, wTex) => `\\mu_s ${wTex} = (${setup.mus})(${num(n)}) = ${fixedTex(setup.mus * n, "N")}`;
  const verdict = (f, max, holds, dir) => holds
    ? `|F| = ${fixedTex(Math.abs(f), "N")} < ${fixedTex(max, "N")}: \\text{ it holds; friction } ${fixedTex(Math.abs(f), "N")} \\text{ ${dir}}`
    : `|F| > \\mu_s N: \\text{ it slides}`;
  const dirOf = (f) => (f >= 0 ? up : down);
  const correct = [
    Ntex(v.N, `W\\cos ${th}`), Ftex(v.Fneed, `W\\sin ${th}`), lim(v.N, "N"), verdict(v.Fneed, v.Fmax, res.state !== "slides", dirOf(v.Fneed)),
  ];
  const lines = [
    line("N", slip === "noCos" ? `\\Sigma F_{y'} = 0: \\quad N = W ${pushY} = ${fixedTex(Nw, "N")}` : correct[0]),
    line("F", slip === "swap" ? Ftex(Fw, `W\\cos ${th}`) : correct[1]),
    line("max", slip === "weight" ? lim(W, "W") : lim(Nw, "N")),
    line("verdict", slip === "limit"
      ? `\\text{Friction: } F = \\mu_s N = ${fixedTex(setup.mus * v.N, "N")} \\text{ ${dirOf(v.Fneed)}}`
      : slip === "direction" ? verdict(Fw, limitW, holdsW, dirOf(-Fw)) : verdict(Fw, limitW, holdsW, dirOf(Fw))),
  ];
  const WHY = {
    noCos: { wrong: "N", kind: "trig", fix: "Use the part of W across the slope: $W\\cos\\theta$",
      explain: "On a ramp only the part of the weight ACROSS the slope, $W\\cos\\theta$, presses the crate into it. N is not the whole weight." },
    swap: { wrong: "F", kind: "trig", fix: "Swap sin and cos: the part of W down the slope is $W\\sin\\theta$",
      explain: "θ is between the slope and the level, so the part of W along the slope is $W\\sin\\theta$ (and across it, $W\\cos\\theta$)." },
    limit: { wrong: "verdict", kind: "concept", fix: "Friction is what equilibrium needs: F from $\\Sigma F_{x'} = 0$",
      explain: "$\\mu_s N$ is only the LIMIT. While the crate holds, friction is just as big as equilibrium needs — the F from $\\Sigma F_{x'} = 0$." },
    weight: { wrong: "max", kind: "concept", fix: "Multiply $\\mu_s$ by N, not W",
      explain: "Friction's limit is $\\mu_s N$: it depends on how hard the surfaces press together, the normal force — not the weight." },
    direction: { wrong: "verdict", kind: "sign", fix: `Friction acts ${dirOf(v.Fneed)} (the sign of F)`,
      explain: `F came out ${v.Fneed >= 0 ? "positive" : "negative"}, and F was taken positive ${up}: friction acts ${dirOf(v.Fneed)}, against the way the crate tends to slide.` },
  }[slip];
  const follows = [];
  const ids = ["N", "F", "max", "verdict"];
  lines.forEach((l, i) => { if (l.id !== WHY.wrong && ids.indexOf(l.id) > ids.indexOf(WHY.wrong) && l.tex !== correct[i]) follows.push(l.id); });
  const others = [
    { label: "Flip the sign of F", feedback: "The signs are right in that line. Check which part of W it uses." },
    { label: "Use $\\mu_k$ instead of $\\mu_s$", feedback: "The crate isn't sliding yet: static friction, $\\mu_s$, is the one that applies." },
    { label: "Add the push again", feedback: "The push is in the line already. Look at the weight's part, or at what friction really is." },
  ];
  return { lines, wrong: WHY.wrong, follows, fixes: [{ label: WHY.fix, correct: true }, ...others.slice(0, 2)], explain: WHY.explain, kind: WHY.kind, corrected: correct };
}
