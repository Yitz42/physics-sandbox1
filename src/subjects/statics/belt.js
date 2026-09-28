// belt.js — belt (rope) friction on a fixed drum or post (Unit 9.3).
//
// A rope wrapped round a rough post, about to slip, has a tight side T₂ and a slack side
// T₁ (T₂ > T₁). Friction all along the contact adds up to (textbook, Euler–Eytelwein):
//     T₂ = T₁ e^{μ β}      β: the angle of contact, in RADIANS (one turn = 2π)
// So every extra turn MULTIPLIES what a hand can hold — a sailor holds a ship with a
// few turns round a bollard.
//
// setup:
//   drum:  { r }            the post's radius (m) — for the picture only; the answer doesn't use it
//   beta:  degrees of contact (may be more than 360: several turns)
//   mus:   the coefficient of static friction between rope and post
//   hand, load:  the two rope ends' pulls (N), or loadMass (kg) for a hanging load
//   tight: "load" (holding a load back: the load side is T₂) or "hand" (hoisting: the hand is T₂)
//   find:  "hand" | "load" | "beta" | "mus" — the one number worked out from the others
//
// values: T1, T2, hand, load, beta (degrees), betaRad, turns, ratio (T₂/T₁), mus.

import { fixedTex, sigFig } from "../../core/units.js";
import { G } from "./particle.js";

const num = (v) => sigFig(v, 4);

const loadOf = (setup) => (setup.loadMass != null ? setup.loadMass * G : setup.load);

export function solveBelt(setup) {
  const tightLoad = (setup.tight || "load") === "load";
  let hand = setup.hand, load = loadOf(setup), beta = setup.beta, mus = setup.mus;
  const find = setup.find || "hand";
  const T = (h, l) => (tightLoad ? { T1: h, T2: l } : { T1: l, T2: h }); // (which end is tight)
  if (find === "hand") hand = tightLoad ? load / Math.exp(mus * beta * Math.PI / 180) : load * Math.exp(mus * beta * Math.PI / 180);
  if (find === "load") load = tightLoad ? hand * Math.exp(mus * beta * Math.PI / 180) : hand / Math.exp(mus * beta * Math.PI / 180);
  const { T1, T2 } = T(hand, load);
  if (find === "beta") beta = (Math.log(T2 / T1) / mus) * 180 / Math.PI;
  if (find === "mus") mus = Math.log(T2 / T1) / (beta * Math.PI / 180);
  const ok = T1 > 0 && T2 >= T1 && Number.isFinite(beta) && beta >= 0 && Number.isFinite(mus);
  return {
    status: ok ? "determinate" : "unstable",
    message: ok ? "" : "The tight side must pull harder than the slack side.",
    values: { T1, T2, hand, load, beta, betaRad: (beta * Math.PI) / 180, turns: beta / 360, ratio: T2 / T1, mus },
  };
}

// Names and units of everything a stage can ask about.
export function beltQuantities() {
  return {
    T1: { label: "T_1", unit: "N" }, T2: { label: "T_2", unit: "N" },
    hand: { label: "T_{\\text{hand}}", unit: "N" }, load: { label: "T_{\\text{load}}", unit: "N" },
    beta: { label: "\\beta", unit: "deg" }, betaRad: { label: "\\beta", unit: "rad" },
    turns: { label: "\\text{turns}", unit: "" }, ratio: { label: "T_2/T_1", unit: "" }, mus: { label: "\\mu_s", unit: "" },
  };
}

// T₂ = T₁ e^{μβ}, as the equation panel's data (the unknown side has no value).
export function beltEquations(setup, result) {
  const v = (result || solveBelt(setup)).values;
  const find = setup.find || "hand";
  const tightLoad = (setup.tight || "load") === "load";
  const unknownT = (find === "hand" && !tightLoad) || (find === "load" && tightLoad) ? "T2" : (find === "hand" || find === "load") ? "T1" : null;
  const e = Math.exp(v.mus * v.betaRad);
  const factor = { tex: "e^{\\mu_s \\beta}", numTex: `e^{(${num(v.mus)})(${num(v.betaRad)})}`, value: e, pre: false,
    alt: { tex: "e^{\\mu_s \\beta}", numTex: `e^{(${num(v.mus)})(${num(v.beta)})}`, value: Math.exp(v.mus * v.beta) },
    swapKind: "calculator", swapReason: "puts β in degrees — the exponent needs β in RADIANS" };
  // (A "define" line: T₂ = T₁ e^{μβ} = … N, its value shown once the answer is.)
  return [{
    id: "belt", lhs: "T_2", title: "T_2", form: "define", result: { value: v.T2, unit: "N" },
    terms: [{ id: "T1", sign: 1, symbol: "T_1", value: unknownT === "T1" ? null : v.T1, unit: "N", factor }],
  }];
}

// The lines under the equation.
export function beltSummary(setup, result, { reveal = true } = {}) {
  const v = (result || solveBelt(setup)).values;
  const lines = [`\\beta = ${num(v.beta)}^\\circ = ${num(v.beta)}\\cdot\\dfrac{\\pi}{180} = ${fixedTex(v.betaRad, "", 3)}\\ \\text{rad}\\quad (${num(v.turns)}\\ \\text{turns})`];
  if (!reveal) return lines;
  lines.push(`e^{\\mu_s\\beta} = e^{(${num(v.mus)})(${num(v.betaRad)})} = ${num(v.ratio)}`);
  lines.push(`T_1 = ${fixedTex(v.T1, "N")},\\quad T_2 = ${fixedTex(v.T2, "N")}\\quad (\\text{tight side: the ${(setup.tight || "load") === "load" ? "load" : "hand"}})`);
  return lines;
}

// Answers that common slips give.
export function beltMistakes(setup, name) {
  const res = solveBelt(setup);
  const v = res.values;
  const right = v[name];
  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };
  const other = (changes) => solveBelt({ ...setup, ...changes }).values[name];
  const eDeg = Math.exp(v.mus * v.beta);
  if (name === "hand" || name === "load" || name === "T1" || name === "T2") {
    // β in degrees in the exponent.
    const known = (setup.find || "hand") === "hand" ? loadOf(setup) : setup.hand;
    const tightKnown = ((setup.find || "hand") === "hand") === ((setup.tight || "load") === "load");
    add(tightKnown ? known / eDeg : known * eDeg, "β must be in RADIANS in $e^{\\mu_s\\beta}$: multiply degrees by $\\pi/180$.", "calculator");
    add(other({ tight: (setup.tight || "load") === "load" ? "hand" : "load" }), "Tight and slack sides swapped. The TIGHT side, $T_2$, is the one the rope is about to slip toward — the bigger pull.", "direction");
    // The linear slip: T₂ = T₁(1 + μβ) — friction as if μ times a single normal force.
    const lin = 1 + v.mus * v.betaRad;
    add(tightKnown ? known / lin : known * lin, "Belt friction grows exponentially: $T_2 = T_1 e^{\\mu_s\\beta}$, not $T_1(1 + \\mu_s\\beta)$.", "concept");
  }
  if (name === "beta" || name === "turns" || name === "betaRad") {
    const rad = Math.log(v.T2 / v.T1) / v.mus;
    if (name === "beta") add(rad, "That's in radians. The question wants degrees: multiply by $180/\\pi$.", "calculator");
    if (name === "turns") {
      add(rad, "That's β in radians. One turn is $2\\pi$ rad: divide by $2\\pi$.", "calculator");
      add(Math.log(v.T1 / v.T2) / v.mus / (2 * Math.PI), "Upside down: $\\beta = \\ln(T_2/T_1)/\\mu_s$ with the TIGHT side on top.", "sign");
      add(Math.log10(v.T2 / v.T1) / v.mus / (2 * Math.PI), "That uses $\\log_{10}$. The equation needs the natural log, ln.", "calculator");
    }
  }
  if (name === "mus") add(Math.log(v.T2 / v.T1) / v.beta, "β must be in RADIANS: $\\mu_s = \\ln(T_2/T_1)/\\beta$ with β in rad.", "calculator");
  return list;
}
