// Unit 4.2, stage 4 — debug: one mistake in a student's equilibrium equations.
// The beam: 6 m, 40 kg (W = 392.4 N at 3 m), pin A (0), roller B (4 m), and a
// slanted push P = 500 N at the end (6 m), on a 3-4-5 slope down and to the right.
// P's line of action is (6, 0) + t(3, −4): its perpendicular distance from A is
// d_P = 6 × 4/5 = 4.8 m (not the 6 m along the beam).
// Correct:  ΣF_x = A_x + (3/5)P = 0,  ΣF_y = A_y + B_y − W − (4/5)P = 0,
//           ΣM_A = 4B_y − 3W − 4.8P = 0  → B_y = (1177.2 + 2400)/4 = 894.3 N

export default {
  id: "rigid-body-equilibrium/4-debug",
  challenge: "debug",
  solver: "statics.rigidBody",
  title: "Check the Working",
  mission: "Find and fix the mistake in a student's equilibrium equations.",
  instructions:
    "A student drew a correct free-body diagram of this beam and wrote the three equilibrium equations, taking moments about A. One term is wrong. Click it, then choose the fix.",
  setup: {
    body: { points: [[0, 0], [6, 0]], mass: 40 },
    supports: [
      { id: "A", type: "pin", at: [0, 0] },
      { id: "B", type: "roller", at: [4, 0] },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 500, direction: { slope: [3, -4] }, at: [6, 0], push: true }],
    massLabel: { at: [1.4, 0.5], text: "beam" },
  },
  view: { xmin: -1.2, xmax: 7.4, ymin: -2.2, ymax: 2.6 },
  vary: [
    { path: "forces.#P.magnitude", min: 300, max: 700, step: 50 },
    { path: "body.mass", min: 30, max: 60, step: 5 },
  ],
  debug: {
    view: "equations",
    mode: "numeric",
    intro: "The student's equations (moments about A, counterclockwise positive):",
    mutations: [
      { equation: "sumM", kind: "swap", term: "P",
        explain: "The moment of $P$ used the 6 m distance along the beam. A moment arm is the **perpendicular** distance from A to $P$'s line of action: $d_P = 6 \\times \\tfrac{4}{5} = 4.8$ m." },
      { equation: "sumM", kind: "sign", term: "B_y",
        explain: "$B_y$ pushes up at B, to the right of A: it turns the beam **counterclockwise** about A, so its moment is positive." },
      { equation: "sumM", kind: "missing", term: "W",
        explain: "The beam's weight $W$ acts at its middle, 3 m from A, so it has a moment about A too. Every force whose line misses A belongs in $\\Sigma M_A$." },
      { equation: "sumFy", kind: "sign", term: "W",
        explain: "The weight points down, so it enters $\\Sigma F_y$ with a minus sign." },
    ],
    notes: {
      A_x: "$A_x$ is right: it acts at A, so it has no moment about A, and it's the only unknown in $\\Sigma F_x$ besides $P$'s x-part.",
      A_y: "$A_y$ is right: it acts at A, so it's missing from $\\Sigma M_A$ on purpose — that's why A was chosen.",
    },
  },
  hints: [
    "Check each moment: force × perpendicular distance, + for counterclockwise and − for clockwise about A.",
    "Is every force whose line misses A in $\\Sigma M_A$? Is its arm the perpendicular distance?",
    "Check the signs in the force equations against the arrows: + right, + up.",
  ],
  explanation:
    "Three checks catch most mistakes in equilibrium equations: every force is in every equation it belongs in; each moment arm is the perpendicular distance to the line of action; " +
    "and each sign matches the picture (right, up and counterclockwise are positive).",
};
