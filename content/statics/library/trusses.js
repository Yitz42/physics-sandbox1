// library/trusses.js — the lesson library's trusses (see src/core/library.js).
// Questions:
//   zero       how many members carry no force (found by inspection), and one member force
//
// The Pratt bridge: bottom chord A (0, 0) pin, B (3, 0), C (6, 0), D (9, 0), E (12, 0) roller;
// top chord F (3, 3), G (6, 3), H (9, 3); end posts AF, EH; verticals BF, CG, DH;
// diagonals FC and HC sloping down to the middle. m = 13, r = 3, j = 8: 16 = 2 × 8.
// Hand checks (load P):
//   P at C: A_y = E_y = P/2. Zero by inspection: BF (B: AB, BC in line), DH (D), CG
//           (G: FG, GH in line, no load) — 3 members.
//           Joint A: F_AF = −(P/2)/sin 45° = −0.7071P;  F_AB = +P/2.  Joint B: F_BC = F_AB = +P/2.
//           Joint F: F_FC = +0.7071P (tension), F_FG = −P.   (P = 1200: F_FC = 848.5 N, F_FG = −1200 N)
//   P at G: the load acts across FG–GH's line at G, so CG holds it: F_CG = −P. Zero: BF, DH (2).
//   P at B (or D): BF (or DH) now carries P; zero: the other vertical and CG (2).
//   P at F or H: all three verticals are still zero (3).
//
// The wall bracket (Unit 6.1's): A (0, 0) on a roller pushing right, B (0, 3) pinned, tip C (4, 0)
// with P down. At A the roller pushes along AC, so AB is off the line: F_AB = 0 (1 member).
//   Joint C: F_BC = 5P/3 (tension), F_AC = −4P/3.   (P = 900: 1500 N, −1200 N)

import { scenario } from "../../../src/core/library.js";

export const BRIDGE_JOINTS = { A: [0, 0], B: [3, 0], C: [6, 0], D: [9, 0], E: [12, 0], F: [3, 3], G: [6, 3], H: [9, 3] };
export const CHORDS = ["AB", "BC", "CD", "DE", "FG", "GH", "AF", "EH"];
export const VERTICALS = ["BF", "CG", "DH"];
export const PRATT = ["CF", "CH"];

// The bridge with the load at a joint (bottom joints: hanging; top joints: pushing on it).
export function bridgeSetup(joint = "C", magnitude = 1200, diagonals = PRATT) {
  return {
    joints: { ...BRIDGE_JOINTS },
    members: [...CHORDS, ...VERTICALS, ...diagonals],
    supports: [{ id: "A", type: "pin" }, { id: "E", type: "roller" }],
    forces: [{ id: "P", symbol: "P", magnitude, direction: "down", joint, push: ["F", "G", "H"].includes(joint) }],
    showReactions: "reveal",
    dims: [{ from: [0, -2.2], to: [12, -2.2], label: "4 × 3 m = 12 m" }, { from: [12.9, 0], to: [12.9, 3] }], // close to the truss, just under the joint letters (arrows break the line)
  };
}
export const BRIDGE_VIEW = { xmin: -1.6, xmax: 14, ymin: -3.6, ymax: 5 };

const zeroHints = (last) => [
  "Look at each joint with no load and no support. Two members at an angle, and nothing else? Both are zero.",
  "Three members, two of them in one straight line, and nothing else? The third one is zero: nothing can balance it across that line.",
  last,
];

export const bridgeBottom = scenario({
  name: "bridge, load below",
  story: "A Pratt bridge truss is pinned at A and rests on a roller at E. A load $P$ hangs from the middle of the bottom chord, at C.",
  setup: bridgeSetup("C"),
  view: BRIDGE_VIEW,
  vary: [{ path: "forces.#P.magnitude", min: 600, max: 2400, step: 20 }],
  questions: {
    zero: {
      instruction: "First, by inspection: how many members carry no force? Then predict $F_{FC}$ (tension positive).",
      ask: [{ quantity: "zeroCount", whole: true, min: 0, max: 13 }, { quantity: "F_CF" }],
      hints: zeroHints("With the zero members gone, joint F has three unknowns — but joint A has two. Find $F_{AF}$ there, then go to F: $F_{FC}$ must balance $F_{AF}$'s vertical part."),
    },
  },
});

export const bridgeTop = scenario({
  name: "bridge, load on top",
  story: "The same Pratt bridge truss, pinned at A and on a roller at E, now carries a load $P$ pushing down on the top chord at G.",
  setup: bridgeSetup("G"),
  view: BRIDGE_VIEW,
  vary: [{ path: "forces.#P.magnitude", min: 600, max: 2400, step: 20 }],
  questions: {
    zero: {
      instruction: "By inspection: how many members carry no force? Then predict $F_{CG}$ (tension positive).",
      ask: [{ quantity: "zeroCount", whole: true, min: 0, max: 13 }, { quantity: "F_CG" }],
      hints: zeroHints("At G, FG and GH are in line, but the load $P$ pushes across that line — so the rule doesn't apply there, and CG must hold $P$."),
    },
  },
});

export const wallBracket = scenario({
  name: "wall bracket",
  story: "A small truss sticks out from a wall: A rests on a roller that pushes it away from the wall, B is pinned, and the load $P$ hangs at the tip C.",
  setup: {
    joints: { A: [0, 0], B: [0, 3], C: [4, 0] },
    members: ["AB", "AC", "BC"],
    supports: [{ id: "A", type: "roller", normal: [1, 0] }, { id: "B", type: "pin", normal: [1, 0] }],
    forces: [{ id: "P", symbol: "P", magnitude: 900, direction: "down", joint: "C" }],
    showReactions: "reveal",
    dims: [{ from: [0, -0.9], to: [4, -0.9] }, { from: [-1.1, 0], to: [-1.1, 3] }],
  },
  view: { xmin: -2.2, xmax: 5.6, ymin: -2.6, ymax: 3.8 },
  vary: [{ path: "forces.#P.magnitude", min: 300, max: 1500, step: 20 }],
  questions: {
    zero: {
      instruction: "By inspection: how many members carry no force? Then predict $F_{AC}$ (tension positive).",
      ask: [{ quantity: "zeroCount", whole: true, min: 0, max: 13 }, { quantity: "F_AC" }],
      hints: zeroHints("At A, the roller pushes straight along AC's line. Only AB is off that line — so nothing balances it."),
    },
  },
});

// ---- Sections through the bridge (Unit 6.3) ----------------------------------------------
// LEFT cut through FG, CF, BC (keep A, B, F); RIGHT cut through GH, CH, CD (keep D, E, H).
// Hand checks — P at C (1200 N), keep the left part (A_y = 600 N):
//   ΣM_C: −6A_y − 3F_FG = 0 → F_FG = −P;   ΣM_F: −3A_y + 3F_BC = 0 → F_BC = +P/2;   ΣF_y → F_CF = +0.7071P
// Two loads, P = 600 N at B and Q = 1200 N at C: E_y = (3P + 6Q)/12 = 750 N, A_y = 1050 N.
//   Left part:  ΣM_C: −6(1050) + 3(600) − 3F_FG = 0 → F_FG = −1500 N;  ΣM_F: −3(1050) + 3F_BC = 0 → F_BC = +1050 N;
//               ΣF_y: 1050 − 600 − (1/√2)F_CF = 0 → F_CF = +636.4 N
//   Right part: ΣM_C: 6(750) + 3F_GH = 0 → F_GH = −1500 N;  ΣM_H: 3(750) − 3F_CD = 0 → F_CD = +750 N;
//               ΣF_y: 750 − (1/√2)F_CH = 0 → F_CH = +1060.7 N
export const LEFT_CUT = { members: ["FG", "CF", "BC"], keep: "A" };
export const RIGHT_CUT = { members: ["GH", "CH", "CD"], keep: "E" };

export function twoLoadSetup(P = 600, Q = 1200) {
  const s = bridgeSetup("B", P);
  s.forces.push({ id: "Q", symbol: "Q", magnitude: Q, direction: "down", joint: "C" });
  return s;
}

const sectionHints = (moment1, moment2, force) => [
  "Keep one part and draw its FBD: its support reaction (found first, from the whole truss), its loads, and a pull (tension) in each cut member.",
  `${moment1} Two of the cut members pass through that joint, so they drop out.`,
  `${moment2} ${force}`,
];

export const leftSection = scenario({
  name: "one load, left part",
  story: "The Pratt bridge carries a load $P$ at C. It's cut through FG, CF and BC, and the left part is kept (its reaction $A_y$ is found first from the whole truss).",
  setup: { ...bridgeSetup("C"), section: { ...LEFT_CUT, sums: [{ M: "C" }, { M: "F" }, { F: "y" }] }, showReactions: "always", knownReactions: true },
  view: BRIDGE_VIEW,
  vary: [{ path: "forces.#P.magnitude", min: 600, max: 2400, step: 20 }],
  questions: {
    members: {
      instruction: "Predict $F_{FG}$ and $F_{BC}$ (tension positive), one equation each.",
      ask: [{ quantity: "F_FG" }, { quantity: "F_BC" }],
      hints: sectionHints("For $F_{FG}$, take moments about C.", "For $F_{BC}$, take moments about F.", "Each arm is the truss's height, 3 m; $A_y$ acts 6 m (about C) or 3 m (about F) from the point."),
    },
  },
});

export const twoLoadLeft = scenario({
  name: "two loads, left part",
  story: "The Pratt bridge carries $P$ at B and $Q$ at C. It's cut through FG, CF and BC, and the left part is kept ($A_y$ is found first from the whole truss).",
  setup: { ...twoLoadSetup(), section: { ...LEFT_CUT, sums: [{ M: "C" }, { M: "F" }, { F: "y" }] }, showReactions: "always", knownReactions: true },
  view: BRIDGE_VIEW,
  vary: [
    { path: "forces.#P.magnitude", min: 300, max: 1200, step: 20 },
    { path: "forces.#Q.magnitude", min: 600, max: 1800, step: 20 },
  ],
  questions: {
    members: {
      instruction: "Predict $F_{FG}$ and $F_{BC}$ (tension positive), one equation each.",
      ask: [{ quantity: "F_FG" }, { quantity: "F_BC" }],
      hints: sectionHints("For $F_{FG}$, take moments about C: $A_y$ (6 m) and $P$ at B (3 m) turn the part, $F_{FG}$ (3 m up) balances them.", "For $F_{BC}$, take moments about F.", "$P$ at B is straight below F: about F it has no moment."),
    },
  },
});

export const rightSection = scenario({
  name: "two loads, right part",
  story: "The Pratt bridge carries $P$ at B and $Q$ at C. It's cut through GH, CH and CD, and the right part is kept ($E_y$ is found first from the whole truss).",
  setup: { ...twoLoadSetup(), section: { ...RIGHT_CUT, sums: [{ M: "C" }, { M: "H" }, { F: "y" }] }, showReactions: "always", knownReactions: true },
  view: BRIDGE_VIEW,
  vary: [
    { path: "forces.#P.magnitude", min: 300, max: 1200, step: 20 },
    { path: "forces.#Q.magnitude", min: 600, max: 1800, step: 20 },
  ],
  questions: {},
});
