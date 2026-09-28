// friction-tip-tools.js — tipping versus slipping (Unit 9.2): the answers common slips
// give, and a student's working with one wrong line. The physics is in friction-tip.js;
// friction-tools.js hands tipping setups over to these.

import { fixedTex, sigFig } from "../../core/units.js";
import { clone } from "../../core/paths.js";
import { solveFriction, criticalValue, weightOfBlock } from "./friction.js";

const num = (v) => sigFig(v, 4);

// A setup with every push's height changed by dh (a height measured from the centre).
function shiftHeights(setup, dh) {
  const s = clone(setup);
  for (const f of s.forces || []) if (f.height != null) f.height += dh;
  return s;
}

// ---- Answers that common slips give --------------------------------------------------

export function tipMistakes(setup, name, plainMistakes) {
  const res = solveFriction(setup);
  const v = res.values;
  const right = v[name];
  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };
  const { w, h } = setup.block;
  const tip = (s) => criticalValue(s, { event: "tip" });
  if (name === "criticalTip") {
    add(tip(shiftHeights(setup, -h / 2)), "That measures the push's height from the crate's CENTRE. Take moments about the corner O on the floor: the push's arm is its height above the floor.", "momentArm");
    add(tip({ ...setup, block: { ...setup.block, w: 2 * w } }), "The weight acts at the crate's centre, HALF its width from the corner O — not the whole width.", "momentArm");
    add(tip({ ...setup, block: { ...setup.block, w: h, h: w } }), "Width and height swapped: the weight's arm about O is half the WIDTH (across the base).", "momentArm");
    if (setup.find.unit === "deg") {
      add(Math.atan(w / h), "That's in radians. Switch your calculator to degrees.", "calculator");
    }
    add(v.criticalSlip, "That's where it starts to SLIP (friction at $\\mu_s N$). Tipping is a moment question: when does N reach the corner O?", "concept");
  }
  if (name === "criticalSlip") {
    for (const m of plainMistakes({ ...setup, tipping: undefined }, "critical")) add(m.value, m.message, m.kind);
    add(v.criticalTip, "That's where it TIPS (N at the corner). Slipping is a friction question: when does the friction needed reach $\\mu_s N$?", "concept");
  }
  if (name === "critical") {
    const other = v.critical === v.criticalSlip ? v.criticalTip : v.criticalSlip;
    const first = v.critical === v.criticalSlip ? "slips" : "tips";
    add(other, `That's where it would ${first === "slips" ? "tip" : "slip"} — but it ${first} first, at the SMALLER value. Work out both, then take the smaller.`, "concept");
  }
  if (name === "x") {
    add(w / 2 - right, "That's measured from the crate's middle. x is measured from the corner O.", "momentArm");
    add(w - right, "That's measured from the other corner. x is measured from O, the corner it would tip about.", "momentArm");
    add(-right, "Check the sign: x is how far N acts BEHIND O, into the base.", "sign");
  }
  return list;
}

// ---- A student's working with one wrong line (debug, view "steps") -------------------
// A crate on a level floor, pushed level at height h_P (one push, P). mutation.slip:
//   "halfHeight" (the push's arm measured from the centre), "fullWidth" (the weight's arm
//   is w, not w/2), "tipMu" (μ_s put into the tipping equation), "biggerFirst" (the larger
//   push taken as the one that happens first).

export function tipSteps(setup, mutation) {
  const v = solveFriction(setup).values;
  const W = weightOfBlock(setup);
  const { w, h } = setup.block;
  const P = setup.forces[0];
  const hp = P.height;
  const slip = mutation.slip;
  const Ps = v.criticalSlip, Pt = v.criticalTip;
  const m = (d) => `(${num(d)}\\,\\text{m})`;
  const hArm = slip === "halfHeight" ? hp - h / 2 : hp;
  const wArm = slip === "fullWidth" ? w : w / 2;
  const PtW = slip === "tipMu" ? (setup.mus * W * wArm) / hArm : (W * wArm) / hArm;
  const tipLine = (arm, warm, value, mu = false) =>
    `\\text{Tip: } N \\text{ at } O,\\ \\Sigma M_O = P_{\\text{tip}}${m(arm)} - ${mu ? "\\mu_s " : ""}W${m(warm)} = 0 \\;\\Rightarrow\\; P_{\\text{tip}} = ${fixedTex(value, "N")}`;
  const slipLine = `\\text{Slip: } N = W,\\ F = \\mu_s N \\;\\Rightarrow\\; P_{\\text{slip}} = (${setup.mus})(${num(W)}) = ${fixedTex(Ps, "N")}`;
  const verdict = (ps, pt, pickBigger) => {
    const slipsFirst = pickBigger ? ps > pt : ps <= pt;
    return `${slipsFirst ? `P_{\\text{slip}} ${pickBigger ? ">" : "<"} P_{\\text{tip}}` : `P_{\\text{tip}} ${pickBigger ? ">" : "<"} P_{\\text{slip}}`}: \\text{ it ${slipsFirst ? "slips" : "tips"} first, at } P = ${fixedTex(slipsFirst ? ps : pt, "N")}`;
  };
  const correct = [slipLine, tipLine(hp, w / 2, Pt), verdict(Ps, Pt, false)];
  const lines = [
    { id: "slip", tex: slipLine },
    { id: "tip", tex: slip === "biggerFirst" ? correct[1] : tipLine(hArm, wArm, PtW, slip === "tipMu") },
    { id: "verdict", tex: verdict(Ps, slip === "biggerFirst" ? Pt : PtW, slip === "biggerFirst") },
  ];
  const WHY = {
    halfHeight: { wrong: "tip", kind: "momentArm", fix: "Use the push's full height above the floor as its arm",
      explain: "Moments are about the corner O, ON the floor. The push's arm about O is its whole height above the floor, $h_P$ — not its height above the centre." },
    fullWidth: { wrong: "tip", kind: "momentArm", fix: "The weight's arm is half the width, $w/2$",
      explain: "The weight acts at the crate's centre, which is half the width from the corner O." },
    tipMu: { wrong: "tip", kind: "concept", fix: "Take $\\mu_s$ out: tipping is a balance of moments",
      explain: "Friction acts along the floor, right through O: it has no moment about O. Tipping needs only $P h_P = W\\,w/2$ — $\\mu_s$ has nothing to do with it." },
    biggerFirst: { wrong: "verdict", kind: "concept", fix: "The SMALLER push happens first",
      explain: "Push harder and harder from zero: the first limit you reach — the smaller push — is what happens." },
  }[slip];
  const follows = [];
  const ids = lines.map((l) => l.id);
  lines.forEach((l, i) => { if (l.id !== WHY.wrong && ids.indexOf(l.id) > ids.indexOf(WHY.wrong) && l.tex !== correct[i]) follows.push(l.id); });
  const others = [
    { label: "Use $N = W + P$", feedback: "The push is level: it has no part up or down, so it doesn't change N." },
    { label: "Take moments about the centre instead", feedback: "About the centre, N's unknown position stays in the equation. About O, at the moment of tipping N acts right at O and drops out — that's why O is the smart point." },
    { label: "Use $\\mu_k$ for slipping", feedback: "The crate isn't sliding yet: to START it, friction is at its static limit, $\\mu_s N$." },
  ];
  return { lines, wrong: WHY.wrong, follows, fixes: [{ label: WHY.fix, correct: true }, ...others.slice(0, 2)], explain: WHY.explain, kind: WHY.kind, corrected: correct };
}
