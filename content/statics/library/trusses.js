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
// The wall bracket (Unit 5.1's): A (0, 0) on a roller pushing right, B (0, 3) pinned, tip C (4, 0)
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
    dims: [{ from: [0, -2.1], to: [12, -2.1], label: "4 × 3 m = 12 m" }, { from: [13, 0], to: [13, 3] }], // (low enough for the joint letters above it)
  };
}
export const BRIDGE_VIEW = { xmin: -1.6, xmax: 14.2, ymin: -4, ymax: 5 };

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
