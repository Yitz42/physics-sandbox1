// Unit 6.1, stage 1 — explore: a small bridge truss; choose where the load
// goes and how big it is, and watch which members pull (red) and push (blue).
// Joints: A (0, 0) pin, C (6, 0), E (12, 0) roller; D (3, 4), F (9, 4).
// Every slanted member rises 4 for 3 across (length 5 m). m = 7, r = 3, j = 5: 7 + 3 = 2 × 5.
// Hand checks (load P):
//   at C: A_y = E_y = P/2; joint A: F_AD = −P/1.6 = −0.625P, F_AC = −0.6F_AD = +0.375P;
//         joint D: F_CD = +0.625P, F_DF = −0.75P  (DF pushes > 1000 N once P > 1333 N)
//   at D: A_y = 0.75P, E_y = 0.25P; F_AC = +0.5625P, F_CD = −0.3125P (the diagonal now pushes)
//   at F: the mirror image: E_y = 0.75P > A_y.
//   F_AC = 450 N: P = 1200 N at C, or P = 800 N at D.

const at = (label, joint, push) => ({ label, set: { "forces.#P.joint": joint, "forces.#P.push": push } });

export default {
  id: "trusses/1-explore",
  challenge: "explore",
  solver: "statics.truss",
  title: "Pull or Push?",
  mission: "See which truss members pull and which push, as the load moves.",
  instructions:
    "A small bridge truss is pinned at A and rests on a roller at E. Choose the joint that carries the load $P$ and how big it is. " +
    "Red members are in **tension** (they pull on their joints), blue ones in **compression** (they push).",
  setup: {
    joints: { A: [0, 0], C: [6, 0], E: [12, 0], D: [3, 4], F: [9, 4] },
    members: ["AC", "CE", "DF", "AD", "CD", "CF", "EF"],
    supports: [{ id: "A", type: "pin" }, { id: "E", type: "roller" }],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", joint: "C", push: false }],
  },
  view: { xmin: -1.6, xmax: 13.6, ymin: -3.5, ymax: 5.2 },
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "The load hangs from C, in the middle of the bottom. **Is the bottom chord (AC, CE) in tension or compression?**",
    options: [
      { text: "Tension", correct: true },
      { text: "Compression", feedback: "A loaded bridge sags like a hammock: its bottom is stretched, its top squeezed." },
      { text: "No force", feedback: "The bottom chord holds the bridge's feet from spreading: it's working hard." },
    ],
    explain: "Loaded from above, a simple bridge truss has its bottom chord in tension and its top chord in compression.",
  },
  editable: [
    { label: "Load P at joint", options: [at("C — bottom middle (hanging)", "C", false), at("D — top left", "D", true), at("F — top right", "F", true)] },
    { path: "forces.#P.magnitude", label: "Size of P", min: 200, max: 1500, step: 50, unit: "N" },
  ],
  tasks: [
    { text: "Make the top member DF push with more than **1000 N**.", check: (v) => v.F_DF < -1000 },
    { text: "Find a load position where the diagonal CD is in **compression**.", check: (v) => v.F_CD < -1 },
    { text: "Make the bottom member AC pull with exactly **450 N**.", check: (v) => Math.abs(v.F_AC - 450) < 1 },
    { text: "Make the roller at E carry more of the load than the pin at A.", check: (v) => v.E_y > v.A_y + 1 },
  ],
  hints: [
    "A bridge truss sags under its load: the top members get squeezed (compression), the bottom ones stretched (tension).",
    "The diagonals change with the load's position. Try a top joint.",
    "Each member's force grows in proportion to $P$. With P at C, $F_{AC} = 0.375P$; with P at D, $F_{AC} = 0.5625P$.",
  ],
  explanation:
    "Every member of a truss is a two-force member, so it only pulls or pushes along itself. Under a load the truss bends like a beam: " +
    "the top chord is squeezed and the bottom chord stretched, while the diagonals carry the shear — and whether a diagonal pulls or pushes depends on where the load is.",
};
