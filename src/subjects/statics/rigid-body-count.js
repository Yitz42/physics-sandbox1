// rigid-body-count.js — stability and determinacy (Unit 4.4), and three-force
// bodies (Unit 4.5), for the rigid-body solver:
//   • classifySteps: a student's working when classifying a structure (count
//     each support's unknowns, add them, compare with 3, check the
//     arrangement, conclude), with one deliberate mistake — the debug
//     challenge's "steps" view;
//   • concurrency: for a body held by exactly three forces, the point where
//     their lines of action meet (a three-force body's forces are concurrent).

import { add, sub, scale, mag, cross2 } from "../../core/vector.js";
import { allReactions, reactionsOf, SUPPORT_NAMES } from "./supports.js";
import { solveRigidBody, knownForces } from "./rigid-body.js";
import { directionOf } from "./particle.js";

const NAME = (t) => SUPPORT_NAMES[t].replace(/^./, (c) => c.toUpperCase());

// ---- The classifying working, with one mistake --------------------------------
//
// mutation: { kind: "miscount", support: "A", as: 2 }  one support's unknowns counted wrong
//           { kind: "arrangement" }  improper supports (parallel / concurrent) called fine
//           { kind: "degree" }       the degree of indeterminacy taken as n, not n − 3
// Returns { lines, wrong, follows, fixes, explain, corrected, kind } (see debug.js).
export function classifySteps(setup, mutation) {
  const res = solveRigidBody({ ...setup, analysis: undefined }); // the real verdict, even on a "count" stage
  const sups = (setup.supports || []).filter((s) => s.type !== "none");
  const count = (s) => reactionsOf(s).length;
  const names = (s) => reactionsOf(s).map((r) => r.symbol).join(",\\ ");
  const improper = res.status === "unstable" && res.unknowns.length === 3;
  const parallel = improper && /parallel/.test(res.message);

  // The correct working, then the student's.
  const build = (counts, { arrangementOk, degreeAsN } = {}) => {
    const n = counts.reduce((a, b) => a + b, 0);
    const lines = sups.map((s, i) => ({ id: `s_${s.id}`, tex: `\\text{${NAME(s.type)} at ${s.id}: } ${counts[i]} \\text{ unknown${counts[i] === 1 ? "" : "s"}}${counts[i] === count(s) ? ` \\;(${names(s)})` : ""}` }));
    lines.push({ id: "total", tex: `n = ${counts.join(" + ")} = ${n}` });
    const deg = degreeAsN ? n : n - 3;
    if (n > 3) lines.push({ id: "compare", tex: `n > 3:\\ \\text{degree of indeterminacy} = ${degreeAsN ? "n" : "n - 3"} = ${deg}` });
    else if (n < 3) lines.push({ id: "compare", tex: `n < 3:\\ \\text{not enough unknowns}` });
    else lines.push({ id: "compare", tex: `n = 3 = \\text{number of equations}` });
    let verdict;
    if (n === 3) {
      const ok = arrangementOk ?? !improper;
      lines.push({ id: "arrangement", tex: ok ? "\\text{The reactions are not all parallel and don't all meet at one point}" : `\\text{The reactions ${parallel ? "are all parallel" : "all meet at one point"}}` });
      verdict = ok ? "\\text{Stable and statically determinate}" : "\\text{Improperly supported: unstable}";
    } else verdict = n > 3 ? `\\text{Stable, statically indeterminate to degree } ${deg}` : "\\text{Unstable: it moves}";
    lines.push({ id: "verdict", tex: verdict });
    return lines;
  };
  const right = sups.map(count);
  const correct = build(right);

  let lines, wrong, follows, fixes, explain, kind;
  if (mutation.kind === "miscount") {
    const i = sups.findIndex((s) => s.id === mutation.support);
    const counts = right.slice();
    counts[i] = mutation.as;
    lines = build(counts);
    wrong = `s_${mutation.support}`;
    follows = ["total", "compare", "arrangement", "verdict"].filter((id) => lines.some((l) => l.id === id) && lines.find((l) => l.id === id).tex !== (correct.find((l) => l.id === id) || {}).tex);
    const s = sups[i];
    fixes = [
      { label: `A ${SUPPORT_NAMES[s.type]} gives ${count(s)} unknown${count(s) === 1 ? "" : "s"}`, correct: true },
      { label: `A ${SUPPORT_NAMES[s.type]} gives ${mutation.as + 1} unknowns`, feedback: "Count the motions it stops: one unknown for each." },
      { label: "The total is added up wrong", feedback: "The adding is right — it's what went into it." },
    ];
    explain = `A ${SUPPORT_NAMES[s.type]} gives ${count(s)} unknown${count(s) === 1 ? "" : "s"} (${"$" + names(s) + "$"}), one for each motion it stops. With that corrected, the count and the conclusion change.`;
    kind = "supports";
  } else if (mutation.kind === "arrangement") {
    lines = build(right, { arrangementOk: true });
    wrong = "arrangement";
    follows = ["verdict"];
    fixes = [
      { label: parallel ? "The reactions are all parallel: improperly supported" : "The reactions all meet at one point: improperly supported", correct: true },
      { label: "There are too few unknowns", feedback: "There are exactly 3 — the count is fine. Look at WHERE and WHICH WAY the reactions act." },
      { label: "It is statically indeterminate", feedback: "3 unknowns and 3 equations isn't indeterminate. The problem is the arrangement." },
    ];
    explain = parallel
      ? "3 unknowns isn't enough on its own: all three reactions are parallel, so nothing stops the body sliding across them. It's improperly supported, and it moves."
      : "3 unknowns isn't enough on its own: all three reactions' lines pass through one point, so nothing stops the body turning about it. It's improperly supported, and it moves.";
    kind = "supports";
  } else if (mutation.kind === "degree") {
    lines = build(right, { degreeAsN: true });
    wrong = "compare";
    follows = ["verdict"];
    fixes = [
      { label: "Degree = unknowns − 3", correct: true },
      { label: "Degree = unknowns + 3", feedback: "The degree says how many unknowns are LEFT OVER after the 3 equations are used." },
      { label: "Degree = number of supports", feedback: "It's about unknowns, not supports: a fixed support alone gives 3." },
    ];
    explain = "The degree of indeterminacy is how many more unknowns there are than equations: $n - 3$. Those extra unknowns need something beyond equilibrium (how the beam bends) to find.";
    kind = "algebra";
  } else throw new Error(`Unknown classifying mistake "${mutation.kind}"`);

  return { lines, wrong, follows, fixes, explain: mutation.explain || explain, corrected: correct.map((l) => l.tex), kind: mutation.errorKind || kind };
}

// ---- Three-force bodies ---------------------------------------------------------

// Where two lines P + s·u and Q + t·v meet, or null if they're parallel.
function meet(P, u, Q, v) {
  const d = cross2(u, v);
  if (Math.abs(d) < 1e-9) return null;
  return add(P, scale(u, cross2(sub(Q, P), v) / d));
}

// For a body held by exactly three forces — two with known lines of action
// (loads, the weight, rollers, cables, links) and one pin — the point O where
// the known lines meet, and the pin's line A → O. Returns
// { at: O, lines: [{ from, to }], pin } or null (not a three-force body, or
// the two lines are parallel: then all three forces are parallel).
export function concurrency(setup) {
  const reactions = allReactions(setup);
  const pins = (setup.supports || []).filter((s) => s.type === "pin");
  if (pins.length !== 1 || reactions.some((r) => r.moment)) return null;
  const lines = [
    ...knownForces(setup).map((f) => ({ at: f.at, dir: f.kind === "weight" ? [0, -1] : directionOf(f) })),
    ...reactions.filter((r) => r.support !== pins[0].id).map((r) => ({ at: r.at, dir: r.dir })),
  ];
  if (lines.length !== 2) return null;
  const O = meet(lines[0].at, lines[0].dir, lines[1].at, lines[1].dir);
  if (!O || mag(sub(O, pins[0].at)) < 1e-9) return null;
  return { at: O, pin: pins[0].id, lines: [...lines.map((l) => ({ from: l.at, to: O })), { from: pins[0].at, to: O }] };
}
