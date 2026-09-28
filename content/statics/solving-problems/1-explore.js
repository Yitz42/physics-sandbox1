// Unit 1.2, stage 1 — explore: slide a load along a beam on a pin and a roller and watch the reactions
// share it; the check ΣM_B = 0 holds too. Pin A at 0, roller B at 6 m, P down at x:
//   ΣM_A: 6B_y − P x = 0 → B_y = P x/6;  A_y = P − B_y.  Start: P = 600 N at 2 m → A_y = 400 N, B_y = 200 N.
// Checks: B_y = 2 A_y (x = 4 m);  A_y = P (x = 0);  P = 800 N with B_y = 200 N (x = 1.5 m).

export default {
  id: "solving-problems/1-explore",
  challenge: "explore",
  solver: "statics.rigidBody",
  title: "Share the Load",
  mission: "Slide a load along a beam and see how the two supports share it.",
  instructions:
    "A beam rests on a pin at A and a roller at B. Move the load P and change its size, and watch the reactions. " +
    "The equations panel shows the working — FBD, equations, answers — and every answer can be checked with an equation that wasn't used.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [{ id: "A", type: "pin", at: [0, 0] }, { id: "B", type: "roller", at: [6, 0] }],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [2, 0], push: true }],
    showReactions: "always",
  },
  view: { xmin: -1.3, xmax: 7.3, ymin: -2.6, ymax: 2.4 },
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**The load is a third of the way from A to B. Which support pushes up harder?**",
    options: [
      { text: "A, the nearer one", correct: true },
      { text: "B, the further one", feedback: "Moments about A: B's push has a long arm, so it needs only a little force to balance P's small moment." },
      { text: "They share it equally", feedback: "Only when the load is in the middle." },
    ],
    explain: "$\\Sigma M_A$: $6B_y = P(2)$, so B carries a third and A two thirds — the nearer support carries more.",
  },
  editable: [
    { path: "forces.#P.at.0", label: "Load position", min: 0, max: 6, step: 0.5, unit: "m" },
    { path: "forces.#P.magnitude", label: "Load P", min: 100, max: 1000, step: 50, unit: "N" },
  ],
  tasks: [
    { text: "Make B push up **twice** as hard as A.", check: (v) => Math.abs(v.B_y - 2 * v.A_y) < 1e-6 },
    { text: "Make A carry the **whole** load.", check: (v, s) => Math.abs(v.A_y - s.forces[0].magnitude) < 1e-6 },
    { text: "Make the load **800 N** and place it so B carries exactly **200 N**.", check: (v, s) => s.forces[0].magnitude === 800 && Math.abs(v.B_y - 200) < 1e-6 },
  ],
  hints: [
    "Moments about A: $6B_y = P x$. The further the load is from A, the more B carries.",
    "A carries it all when the load sits right on A.",
    "$B_y = 800x/6 = 200$ gives the position.",
  ],
  explanation:
    "Each support carries more the nearer the load is to it. The five steps give the reactions: sketch, FBD (A_x, A_y, B_y and P), " +
    "equations (ΣF_x, ΣF_y, ΣM_A), solve — then CHECK: moments about B, which you didn't use, also balance. The reactions always add up to the load.",
};
