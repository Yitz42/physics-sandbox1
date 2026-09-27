// truss-zero.js — zero-force members, found by inspection (Unit 5.2).
//
// Before solving, look at each joint. The textbook's two rules:
//   • two members meet at a joint, not in line, with no load or support
//     there → both carry no force;
//   • three members meet at a joint, two of them in line, with no load or
//     support there → the third carries no force.
// Both are one idea: at a joint, if every force but one lies along one line,
// nothing can balance the odd one's part across that line — so it's zero. We use
// that general form, so a load or a support push along the line counts too
// (e.g. a roller pushing along a member). A member found to be zero is then
// ignored, and the joints are looked at again: one zero can reveal the next.
//
// zeroByInspection(setup) → { zero: [member ids], steps: [{ joint, rule, zero: [ids],
//   line: [ids of the forces in line], others: [ids of loads/supports at the joint] }] }
//   rule: "two" (two members, nothing else) | "line" (all but one in line)

import { sub, unit, cross2 } from "../../core/vector.js";
import { memberId, membersAt, trussLoads, trussReactions, solveTruss } from "./truss.js";
import { trussSummary } from "./truss-scene.js";
import { sectionEquations, sectionValues, sectionSummary } from "./truss-section.js";
import { directionVector } from "./directions.js";

const parallel = (u, v) => Math.abs(cross2(u, v)) < 1e-9;
const near = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 1e-9;

export function zeroByInspection(setup) {
  const zero = new Set();
  const steps = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (const J of Object.keys(setup.joints)) {
      const at = setup.joints[J];
      // Every force at J, with its direction: the members still in play, the loads, the reactions.
      const members = membersAt(setup, J).filter(({ m }) => !zero.has(memberId(m)))
        .map(({ m, other }) => ({ id: memberId(m), member: true, dir: unit(sub(setup.joints[other], at)) }));
      const loads = trussLoads(setup).filter((f) => near(f.at, at)).map((f) => ({ id: f.id, dir: directionVector(f.direction) }));
      const reactions = trussReactions(setup).filter((r) => near(r.at, at)).map((r) => ({ id: r.id, dir: r.dir }));
      const forces = [...members, ...loads, ...reactions];
      if (!members.length) continue;
      const found = [];
      for (const m of members) {
        const rest = forces.filter((f) => f !== m);
        // All the others along one line, and m off it (or m alone, with nothing else).
        if (rest.every((f) => parallel(f.dir, rest[0] ? rest[0].dir : m.dir)) && !(rest.length && parallel(m.dir, rest[0].dir))) found.push(m.id);
      }
      if (!found.length) continue;
      const two = forces.length === 2 && members.length === 2;
      steps.push({
        joint: J,
        rule: two ? "two" : "line",
        zero: found,
        line: two ? [] : forces.filter((f) => !found.includes(f.id)).map((f) => f.id),
        others: [...loads, ...reactions].map((f) => f.id),
      });
      found.forEach((id) => zero.add(id));
      changed = true;
    }
  }
  return { zero: [...zero], steps };
}

// ---- In words and symbols -------------------------------------------------------------

// The KaTeX name of a force at a joint: a member (F_AB), a load or a reaction.
function symbolOf(setup, id) {
  const m = (setup.members || []).find((x) => memberId(x) === id);
  if (m) return `F_{${m}}`;
  const f = trussLoads(setup).find((x) => x.id === id) || trussReactions(setup).find((x) => x.id === id);
  return f ? f.symbol : id;
}
const list = (setup, ids) => ids.map((id) => symbolOf(setup, id)).join(",\\ ");

// One line of the working for a step: "Joint B: F_AB, F_BC in line ⇒ F_BF = 0".
export function stepTex(setup, s) {
  const zeros = s.zero.map((id) => symbolOf(setup, id)).join(" = ");
  if (s.rule === "two") return `\\text{Joint ${s.joint}: only } ${list(setup, s.zero)}\\text{, not in line, no load} \\;\\Rightarrow\\; ${zeros} = 0`;
  return `\\text{Joint ${s.joint}: } ${list(setup, s.line)} \\text{ in line} \\;\\Rightarrow\\; ${zeros} = 0`;
}

const totalTex = (setup, ids) => `\\text{Zero-force members: } ${ids.length ? list(setup, ids) : "\\text{none}"} \\;(${ids.length})`;

// The summary line under the equations (setup.showZero).
export function zeroSummary(setup) {
  const z = zeroByInspection(setup);
  return [...z.steps.map((s) => stepTex(setup, s)), totalTex(setup, z.zero)];
}

// ---- The debug challenge's "steps" view: a student's inspection, one line wrong --------
//
// mutation: { kind, joint, line?: [member names], member?: name }
//   "loaded"    the rule used at a joint that carries a load across the line (line, member)
//   "support"   the two-member rule used at a support joint (its two members are "zero")
//   "notInLine" two members called "in line" that aren't (line, member)
//   "wrongOne"  at a real rule joint, the wrong member called zero (line, member)
export function zeroSteps(setup, mutation) {
  const z = zeroByInspection(setup);
  const id = (name) => memberId(name);
  const correct = z.steps.map((s, i) => ({ id: `s${i}`, tex: stepTex(setup, s), joint: s.joint }));
  const lines = correct.map((l) => ({ ...l }));
  const J = mutation.joint;
  let wrongStep, fixes, explain, zeroList = z.zero.slice();
  const claimed = mutation.member ? id(mutation.member) : null;
  if (mutation.kind === "wrongOne") {
    const i = z.steps.findIndex((s) => s.joint === J);
    wrongStep = { joint: J, rule: "line", line: mutation.line.map(id), zero: [claimed] };
    lines[i] = { id: "wrong", tex: stepTex(setup, wrongStep) };
    zeroList = zeroList.map((m) => (z.steps[i].zero.includes(m) ? claimed : m));
    const odd = symbolOf(setup, z.steps[i].zero[0]);
    fixes = [
      { label: `The two in line are ${z.steps[i].line.map((m) => symbolOf(setup, m).replace(/[{}_]/g, "").replace(/^F/, "")).join(" and ")}: the odd one out is zero`, correct: true },
      { label: "All three members at the joint are zero", feedback: "Only the member OFF the line must be zero; the two in line can still carry force (equal and opposite)." },
      { label: "None of them is zero", feedback: "Two members here ARE in line, so the third, off that line, has nothing to balance it." },
    ];
    explain = `At joint ${J}, the members in line are ${list(setup, z.steps[i].line)}. The one OFF that line, $${odd}$, is the zero-force member — the two in line just pass their force through.`;
  } else {
    const at = z.steps.filter((s) => Object.keys(setup.joints).indexOf(s.joint) < Object.keys(setup.joints).indexOf(J)).length;
    if (mutation.kind === "support") {
      const ms = membersAt(setup, J).map(({ m }) => id(m));
      wrongStep = { joint: J, rule: "two", zero: ms, line: [] };
      zeroList = [...zeroList, ...ms];
      fixes = [
        { label: `${J} is a support: its reactions act there too, so the rule doesn't apply`, correct: true },
        { label: "Only one of the two members is zero", feedback: "The rule would make both zero — but it doesn't apply here at all. What else acts at this joint?" },
        { label: "They're zero because they meet at an angle", feedback: "Meeting at an angle is only half the rule: NOTHING else may act at the joint. Look at what holds it." },
      ];
      explain = `Joint ${J} is a support, so its reactions act on it as well as the two members: the two-member rule needs a joint with NO load or support.`;
    } else {
      wrongStep = { joint: J, rule: "line", line: mutation.line.map(id), zero: [claimed] };
      zeroList = [...zeroList, claimed];
      if (mutation.kind === "loaded") {
        fixes = [
          { label: `Joint ${J} carries a load across that line, so ${mutation.member} isn't zero`, correct: true },
          { label: `The two in line are zero instead`, feedback: "Members in line can carry force. And here something else acts at the joint — look at the picture." },
          { label: "Only the count at the end is wrong", feedback: "The count only adds up the lines above it. Find the line that uses a rule where it doesn't apply." },
        ];
        explain = `A load acts at joint ${J}, across the line of ${list(setup, wrongStep.line)}. The member off the line must hold it, so $${symbolOf(setup, claimed)}$ is NOT zero. The rule only works where nothing else acts across the line.`;
      } else {
        fixes = [
          { label: `${mutation.line.join(" and ")} aren't in line, so the rule doesn't apply`, correct: true },
          { label: `${mutation.member} is zero, but for another reason`, feedback: "Check the picture: do those two members really lie along one straight line?" },
          { label: "All three members are zero", feedback: "No rule makes all three zero here. Check whether the two members are really in line." },
        ];
        explain = `${mutation.line.join(" and ")} meet at an angle at joint ${J}, so they're not in line and the three-member rule doesn't apply.`;
      }
    }
    lines.splice(at, 0, { id: "wrong", tex: stepTex(setup, wrongStep) });
  }
  lines.push({ id: "total", tex: totalTex(setup, zeroList) });
  return {
    lines,
    wrong: "wrong",
    follows: ["total"],
    fixes,
    explain,
    corrected: [...correct.map((l) => l.tex), totalTex(setup, z.zero)],
    kind: "concept",
  };
}

// ---- For the solver ---------------------------------------------------------------------

// The truss solved, plus what inspection finds: values.zeroCount, result.zeroByInspection.
export function solveTrussZero(setup) {
  const r = solveTruss(setup);
  const z = zeroByInspection(setup);
  r.values.zeroCount = z.zero.length;
  r.zeroByInspection = z;
  // A section (Unit 5.3): the kept part's equations, with the reactions found first.
  if (setup.section) {
    const known = {};
    if (r.status === "determinate") for (const x of trussReactions(setup)) known[x.id] = r.values[x.id];
    const eqs = sectionEquations(setup, known);
    const sv = sectionValues(setup, eqs);
    Object.assign(r, { sectionEquations: eqs, sectionUnknowns: sv.inEq, sectionParts: sv.parts, sectionMessage: sv.parts.message });
    r.values.secOk = sv.secOk;
    r.values.secM = sv.secM;
  }
  return r;
}

// The summary lines, plus the inspection working when the stage asks for it
// (setup.showZero: true, or "reveal" — only once the answer is shown).
export function trussZeroSummary(setup, result, opts = {}) {
  const tc = (v) => (Math.abs(v) < 1e-6 ? "" : v > 0 ? "\\,(\\text{T})" : "\\,(\\text{C})");
  const lines = setup.section ? [trussSummary(setup, result, { ...opts, reveal: false })[0], ...sectionSummary(setup, result, opts, tc)] : trussSummary(setup, result, opts);
  if (setup.showZero === true || (setup.showZero === "reveal" && opts.reveal)) lines.push(...zeroSummary(setup));
  return lines;
}

// Likely wrong counts of zero-force members, each with what probably happened.
export function zeroMistakes(setup) {
  const n = zeroByInspection(setup).zero.length;
  const out = [
    { value: n + 1, kind: "concept", message: "One too many. Check each joint you used: the rule only works where NO load or support acts across the line (and two members must really be in line)." },
    { value: n - 1, kind: "concept", message: "One too few. Check every joint without a load — and after finding a zero-force member, look again: ignoring it can reveal the next one." },
    { value: 0, kind: "concept", message: "Some members here do carry nothing. Look for an unloaded joint with only two members at an angle, or three members with two of them in line." },
  ];
  return out.filter((m, i) => m.value >= 0 && m.value !== n && out.findIndex((x) => x.value === m.value) === i);
}
