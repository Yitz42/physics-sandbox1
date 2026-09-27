// Unit 4.2, stage 6 — solve: an L-shaped jib crane.
// A vertical post (A at the ground, 3 m tall) carries an arm reaching a (2.5 m) out
// from its top. The post stands on a pin (thrust bearing) at A and leans against a
// roller B fixed to a wall 1.5 m up, which can only push it to the left.
// The hoist hangs a load P at the arm's tip. (The crane's own weight is small.)
// Hand check (default numbers, P = 800 N, a = 2.5 m):
//   ΣM_A: 1.5B_x − 2.5P = 0        → B_x = 2.5(800)/1.5 = 1333.3 N   (B_x pushes left: +1.5B_x is CCW)
//   ΣF_x: A_x − B_x = 0            → A_x = 1333.3 N (right)
//   ΣF_y: A_y − P = 0              → A_y = 800 N
// (Same numbers as tests/statics/rigid-body.test.js.)

export default {
  id: "rigid-body-equilibrium/6-solve",
  challenge: "solve",
  solver: "statics.rigidBody",
  title: "The Jib Crane",
  mission: "Draw the crane's free-body diagram and find the reactions at A and B.",
  instructions:
    "A jib crane's post stands on a pin at A and leans against a roller at B, 1.5 m up a wall. The hoist hangs a load $P$ from the end of the arm. " +
    "Draw the crane's free-body diagram, choose the equations, then find the reactions. ($A_x$ and $A_y$ are positive if they point right and up.)",
  setup: {
    body: { points: [[0, 0], [0, 3], [2.5, 3]] },
    supports: [
      { id: "A", type: "pin", at: [0, 0] },
      { id: "B", type: "roller", at: [0, 1.5], normal: [-1, 0] }, // (low enough that B_x's label clears P)
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 800, direction: "down", at: [2.5, 3] }],
    dims: [
      { from: [-0.9, 0], to: [-0.9, 1.5], label: "1.5 m" },
      { from: [0, 3.6], to: [2.5, 3.6] },
    ],
  },
  view: { xmin: -2, xmax: 4.4, ymin: -1, ymax: 4.3 },
  vary: [
    { path: "forces.#P.magnitude", min: 500, max: 1200, step: 25 },
    { paths: ["body.points.2.0", "forces.#P.at.0", "dims.1.to.0"], values: [2, 2.5, 3] },
  ],
  solve: {
    steps: ["fbd", "equations", "answer"],
    equationMode: "numeric",
    intros: {
      fbd: "Draw the free-body diagram: isolate the crane — replace the pin and the roller with the reactions they give — and show **every** force acting on it.",
      equations: "Choose the correct equation in each group. The moments are about A, where two of the three unknowns act.",
    },
    candidates: [
      { id: "A_x" },
      { id: "A_y" },
      { id: "B_x", wrongDirection: "The roller can only **push** on the post, away from the wall: $B_x$ points left." },
      { id: "B_y", symbol: "B_y", at: "B", feedback: "The roller just rolls up and down the wall: it can't push along it. It only pushes perpendicular to the wall, $B_x$." },
      { id: "M_A", symbol: "M_A", at: "A", moment: true, feedback: "A pin lets the post turn, so it can't resist a moment. That's the roller's job: its push $B_x$, 1.5 m up, stops the turning." },
    ],
  },
  ask: [{ quantity: "B_x", min: 0 }, { quantity: "A_x" }, { quantity: "A_y" }],
  hints: [
    "The pin gives $A_x$ and $A_y$; the roller on the wall gives one push, $B_x$, to the left.",
    "Moments about A: $A_x$ and $A_y$ drop out. $B_x$ acts 1.5 m above A; $P$ acts the arm's length to the right.",
    "Then $\\Sigma F_x = 0$ gives $A_x$ and $\\Sigma F_y = 0$ gives $A_y$.",
  ],
  explanation:
    "The load tries to tip the crane clockwise about A; the roller's push $B_x$, 1.5 m up, stops it: $1.5\\,B_x = aP$. " +
    "Then $A_x$ must balance $B_x$ (the post is pushed left at B and held at A), and $A_y$ carries the whole load. " +
    "Taking moments about A turned three unknowns into one equation with one unknown — the smart-point trick.",
};
