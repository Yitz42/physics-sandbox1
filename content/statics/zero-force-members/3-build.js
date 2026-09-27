// Unit 5.2, stage 3 — build: choose how to brace the bridge. The diagonals are thin
// steel rods (they can only pull, or carry nothing) and the verticals are light posts
// (at most one may carry force), with the load P hanging at C.
// Bracings (the bridge from library/trusses.js):
//   Pratt (FC, HC, down to the middle): FC, HC in tension (0.7071P); BF, CG, DH zero — meets both limits.
//   Howe (BG, DG, up to the middle): the diagonals push (compression), CG pulls with P — fails.
//   All one way (FC, DG): DG pushes — fails.
// The numbers to work out for your design: zero-force members, and F_FG (Pratt: 3 and −P).

import { bridgeSetup, BRIDGE_VIEW, CHORDS, VERTICALS, PRATT } from "../library/trusses.js";

const BRACINGS = [
  ["Diagonals up to the middle (BG, DG)", ["BG", "DG"]],
  ["Diagonals down to the middle (FC, HC)", PRATT],
  ["Diagonals all one way (FC, DG)", ["CF", "DG"]],
];
const brace = (label, diagonals) => ({ label, set: { members: [...CHORDS, ...VERTICALS, ...diagonals] } });
const base = bridgeSetup("C", 1200, BRACINGS[0][1]);

export default {
  id: "zero-force-members/3-build",
  challenge: "build",
  solver: "statics.truss",
  title: "Brace the Bridge",
  mission: "Choose the diagonals so the rods only pull and the posts stay idle.",
  instructions:
    "The bridge's diagonals are thin steel **rods**: they can pull, but would buckle if pushed. Its verticals are light **posts** that shouldn't carry the load. " +
    "Choose which way the diagonals run, work out on paper how many members carry nothing and the force in the top chord FG for YOUR bracing, then press **Test**.",
  setup: base,
  view: BRIDGE_VIEW,
  vary: [{ path: "forces.#P.magnitude", min: 600, max: 2400, step: 20 }],
  editable: [{ label: "Bracing", options: BRACINGS.map(([label, d]) => brace(label, d)) }],
  goal: {
    text: "Every diagonal pulls or carries nothing (never pushes), and **at most one** vertical post carries force.",
    predict: [{ quantity: "zeroCount", whole: true, min: 0, max: 13 }, { quantity: "F_FG" }],
    check(result, setup) {
      if (result.status !== "determinate") return { ok: false, message: result.message };
      const v = result.values;
      const diagonals = setup.members.filter((m) => !CHORDS.includes(m) && !VERTICALS.includes(m));
      const problems = [], flagged = [];
      for (const m of diagonals) {
        if (v[`F_${m}`] < -1e-6) {
          flagged.push(`F_${m}`);
          problems.push(`Rod ${m} would have to PUSH with ${Math.abs(v[`F_${m}`]).toFixed(1)} N — a thin rod buckles.`);
        }
      }
      const busy = VERTICALS.filter((m) => Math.abs(v[`F_${m}`]) > 1e-6);
      if (busy.length > 1) {
        flagged.push(...busy.map((m) => `F_${m}`));
        problems.push(`${busy.length} posts carry force (${busy.join(", ")}): at most one may.`);
      }
      if (problems.length) return { ok: false, flagged, message: problems.join("\n\n") };
      return { ok: true, message: `Every rod pulls, and ${v.zeroCount} members — the posts — carry nothing. That's why the Pratt truss suits steel rods.` };
    },
  },
  hints: [
    "Look at joint G first, for each bracing: which members meet there, and is any pair in line?",
    "A diagonal that slopes DOWN toward the load hangs it from the top: it pulls. One that slopes UP toward the load props it: it pushes.",
    "With the diagonals down to the middle, B, D and G each have two members in line and nothing else: all three posts are idle.",
  ],
  explanation:
    "In the Pratt truss the diagonals slope down toward the middle, so under a load there they hang it from the top chord — tension, ideal for thin steel rods — " +
    "and the three posts are zero-force members. Reverse the diagonals (a Howe truss) and they push instead, while the middle post carries the load.",
};
