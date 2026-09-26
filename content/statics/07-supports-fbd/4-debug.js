// Unit 7, stage 4 — debug: a student's FBD of a boom has one mistake.
// The boom: pinned to a wall at A, held up by a cable from C (4, 0) to the wall
// at (0, 3) (a 3-4-5 slope), with its weight W and a load P hanging at 2.5 m.
// Correct FBD: A_x, A_y (pin), T_C (cable, pulling toward the wall), W, P.
// Hand check (default numbers, P = 600 N, 30 kg): T_C = 870.3 N, A_x = 696.2 N, A_y = 372.2 N.

export default {
  id: "07-supports-fbd/4-debug",
  challenge: "debug",
  solver: "statics.rigidBody",
  title: "What's Wrong with This FBD?",
  instructions:
    "A student replaced the pin and the cable with reactions and wrote the equations from their free-body diagram. " +
    "The faded symbols show the real supports. One thing on their FBD is wrong.",
  setup: {
    body: { points: [[0, 0], [4, 0]], mass: 30 },
    supports: [
      { id: "A", type: "pin", at: [0, 0], normal: [1, 0] },
      { id: "C", type: "cable", at: [4, 0], anchor: [0, 3] },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [2.5, 0] }],
    massLabel: { at: [0.9, -0.5], text: "boom" },
  },
  view: { xmin: -1.4, xmax: 5.4, ymin: -1.9, ymax: 3.4 },
  vary: [
    { path: "forces.#P.magnitude", min: 400, max: 900, step: 25 },
    { path: "forces.#P.at.0", values: [2, 2.5, 3, 3.5] },
  ],
  debug: {
    view: "fbd",
    intro: "The student's equations (from their FBD):",
    mutations: [
      { kind: "extra", force: "C_x", extra: { support: "C", direction: "right" },
        explain: "$C_x$ doesn't belong: a cable can only pull along its own length, so it gives just ONE reaction, its tension $T_C$." },
      { kind: "remove", force: "A_x" },
      { kind: "reverse", force: "T_C",
        explain: "$T_C$ points the wrong way: it pushes on the boom. A cable can only pull, so its arrow points from C along the cable, toward the wall." },
      { kind: "remove", force: "W" },
      { kind: "extra", force: "M_A", extra: { support: "A", moment: true },
        explain: "$M_A$ doesn't belong: a pin lets the boom turn freely, so it can't resist a moment. Only a fixed support gives one." },
    ],
    missingChoices: [
      { id: "A_x", label: "A sideways reaction A_x at the pin" },
      { id: "W", label: "The boom's weight W" },
      { id: "M_A", label: "A moment M_A at the pin", feedback: "A pin lets the boom turn, so it gives no moment — only $A_x$ and $A_y$." },
      { id: "C_y", label: "A second force at C, straight up", feedback: "The cable gives one force, $T_C$, along the cable. Its upward part is already inside $T_C$." },
    ],
    notes: {
      A_x: "$A_x$ is right: the pin stops the boom sliding sideways (either direction is fine on an FBD).",
      A_y: "$A_y$ is right: the pin stops the boom sliding up or down.",
      T_C: "$T_C$ is right: the cable pulls C toward the wall, along the cable.",
      W: "$W$ is right: the boom's weight acts down at its middle.",
      P: "$P$ is right: the hanging load pulls down at its hook.",
    },
  },
  hints: [
    "Go support by support: a pin gives $A_x$ and $A_y$; a cable gives one pull along itself.",
    "Does the boom have mass? Then its weight belongs on the FBD.",
    "A cable can never push, and a pin can never resist turning.",
  ],
  explanation:
    "A correct FBD has every reaction the supports can give — and nothing they can't: the pin gives $A_x$ and $A_y$ (no moment), the cable gives one pull $T_C$ along itself. " +
    "Add the weight and the loads, and the three equations can find the three unknowns.",
};
