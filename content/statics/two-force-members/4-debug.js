// Unit 5.5, stage 4 — debug: a student's FBD of a propped boom has one mistake.
// The boom: pinned to the wall at A, 4 m long, 30 kg, a load P at its tip, and a
// prop (a two-force member) from B (3, 0) down to D (0, −2) on the wall.
// Correct FBD: A_x, A_y (pin), F_BD (along the prop), W (at 2 m), P.

export default {
  id: "two-force-members/4-debug",
  challenge: "debug",
  solver: "statics.rigidBody",
  title: "Two Forces, One Line",
  mission: "Find the mistake in a student's free-body diagram of a propped boom.",
  instructions:
    "A student replaced the pin and the prop with the forces they give, and wrote the equations from their free-body diagram. " +
    "The faded symbols show the real supports. One thing on their FBD is wrong.",
  setup: {
    body: { points: [[0, 0], [4, 0]], mass: 30 },
    supports: [
      { id: "A", type: "pin", at: [0, 0], normal: [1, 0] },
      { id: "B", type: "link", at: [3, 0], anchor: [0, -2], anchorLabel: "D", symbol: "F_{BD}" },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 600, direction: "down", at: [4, 0], push: true }],
    massLabel: { at: [1.2, 0.45], text: "boom" },
  },
  view: { xmin: -1.8, xmax: 5.2, ymin: -3, ymax: 2.4 },
  vary: [
    { path: "forces.#P.magnitude", min: 400, max: 900, step: 25 },
    { path: "body.mass", values: [20, 25, 30, 35, 40] },
  ],
  debug: {
    view: "fbd",
    intro: "The student's equations (from their FBD):",
    mutations: [
      { kind: "extra", force: "B_y", extra: { support: "B", direction: "up" },
        explain: "$B_y$ doesn't belong: the prop is a two-force member, so it pushes on the boom only along its own line, BD. Its one force $F_{BD}$ already has an upward part." },
      { kind: "remove", force: "W" },
      { kind: "extra", force: "M_A", extra: { support: "A", moment: true },
        explain: "$M_A$ doesn't belong: a pin lets the boom turn, so it gives no moment. The prop is what stops the boom turning." },
      { kind: "remove", force: "A_x" },
    ],
    missingChoices: [
      { id: "W", label: "The boom's weight W" },
      { id: "A_x", label: "A sideways force A_x at the pin" },
      { id: "B_y", label: "A vertical force at B, from the prop", feedback: "The prop gives ONE force, along BD. Its vertical part is already inside $F_{BD}$." },
      { id: "M_A", label: "A moment M_A at the pin", feedback: "A pin can't resist turning — no moment." },
    ],
    notes: {
      A_x: "$A_x$ is right: the prop pushes the boom toward the wall, and the pin must hold it (either direction is fine on an FBD).",
      A_y: "$A_y$ is right: the pin can push or pull vertically.",
      F_BD: "$F_{BD}$ is right: a two-force member's force lies along the line between its pins.",
      W: "$W$ is right: the boom's weight acts down at its middle.",
      P: "$P$ is right: the load pushes down at the tip.",
    },
  },
  hints: [
    "Is the prop pinned at both ends with nothing else on it? Then it gives ONE force, along itself.",
    "What can a pin do: push and pull in x and y, or also resist turning?",
    "Does the boom have mass? Then the weight belongs on the FBD.",
  ],
  explanation:
    "A two-force member gives exactly one force along the line between its pins — never extra components at its end. " +
    "With the pin's $A_x$ and $A_y$, the weight and the load, that's the whole FBD: three unknowns, three equations.",
};
