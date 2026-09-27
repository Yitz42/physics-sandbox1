// Unit 5.1, stage 2 — predict member forces in a triangular truss.
// Joints A (0, 0) pin, B (8, 0) roller, C (4, 3): AC and BC on 4-3-5 slopes (5 m).
// Hand checks (tension +):
//   Apex load P: joint C: −(3/5)(F_AC + F_BC) − P = 0 and F_AC = F_BC → F_AC = −5P/6;
//     joint A: F_AB + (4/5)F_AC = 0 → F_AB = +2P/3.   (P = 1200 → −1000, +800)
//   Apex load P plus a push H to the right at C: ΣF_x at C: −(4/5)F_AC + (4/5)F_BC + H = 0
//     → F_AC = −5P/6 + 5H/8, F_BC = −5P/6 − 5H/8.   (P = 1200, H = 400 → −750, −1250)
// (Same numbers as tests/statics/truss.test.js.)

const joints = { A: [0, 0], B: [8, 0], C: [4, 3] };
const base = {
  joints, members: ["AB", "AC", "BC"],
  supports: [{ id: "A", type: "pin" }, { id: "B", type: "roller" }],
  showReactions: "reveal",
  dims: [{ from: [0, -0.9], to: [8, -0.9] }, { from: [8.9, 0], to: [8.9, 3] }],
};
const P = { id: "P", symbol: "P", magnitude: 1200, direction: "down", joint: "C", push: true };

export default {
  id: "trusses/2-predict",
  challenge: "predict",
  solver: "statics.truss",
  title: "Predict the Member Forces",
  mission: "Predict the member forces, joint by joint.",
  instructions: "Predict the member forces. Assume every member is in tension: a member in compression gets a **negative** answer.",
  situations: [
    {
      name: "apex load",
      instructions: "A triangular truss carries a load $P$ at its top joint C. Predict $F_{AC}$ and $F_{AB}$ (tension positive).",
      setup: { ...base, forces: [P] },
      vary: [{ path: "forces.#P.magnitude", min: 600, max: 2400, step: 30 }],
      ask: [{ quantity: "F_AC" }, { quantity: "F_AB" }],
      hints: [
        "Start at joint C: only two unknowns meet there, $F_{AC}$ and $F_{BC}$.",
        "Each slanted member's up-down part is $\\tfrac{3}{5}$ of its force, its sideways part $\\tfrac{4}{5}$.",
        "Then go to joint A: $F_{AB}$ must balance the sideways part of $F_{AC}$.",
      ],
    },
    {
      name: "load and wind",
      instructions: "The truss carries a load $P$ and a sideways push $H$ at C. Predict $F_{AC}$ and $F_{BC}$ (tension positive).",
      setup: { ...base, forces: [P, { id: "H", symbol: "H", magnitude: 400, direction: "right", joint: "C", push: true }] },
      vary: [
        { path: "forces.#P.magnitude", min: 600, max: 2400, step: 100 },
        { path: "forces.#H.magnitude", min: 100, max: 500, step: 50 },
      ],
      ask: [{ quantity: "F_AC" }, { quantity: "F_BC" }],
      hints: [
        "Joint C: two unknowns, $F_{AC}$ and $F_{BC}$, and two equations.",
        "ΣF_y: $-\\tfrac{3}{5}F_{AC} - \\tfrac{3}{5}F_{BC} - P = 0$. ΣF_x: $-\\tfrac{4}{5}F_{AC} + \\tfrac{4}{5}F_{BC} + H = 0$.",
        "Add and subtract the two equations to get each force.",
      ],
    },
  ],
  view: { xmin: -1.6, xmax: 10, ymin: -2.4, ymax: 4.6 },
  hints: [],
  explanation:
    "Start at a joint with only two unknowns — here the apex C — and use $\\Sigma F_x = 0$ and $\\Sigma F_y = 0$. " +
    "Assuming tension everywhere keeps the signs honest: a negative answer is a member in compression. The two sloping members push; the bottom tie pulls.",
};
