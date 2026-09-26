// Unit 7, stage 1 — explore: choose the support at each end and see its reactions.
// Hand check (pin at A, roller at B, P = 800 N on a 3-4-5 slope at 2 m):
//   P = (480, −640) N;  ΣF_x: A_x + 480 = 0 → A_x = −480 N
//   ΣM_A: 6B_y − 640(2) = 0 → B_y = 213.3 N;  ΣF_y: A_y = 640 − 213.3 = 426.7 N

// Each end's choices. A fixed support is a wall the beam is built into.
const choices = (id, wall) => [
  { label: "Nothing", set: { [`supports.#${id}.type`]: "none", [`supports.#${id}.normal`]: [0, 1] } },
  { label: "Roller", set: { [`supports.#${id}.type`]: "roller", [`supports.#${id}.normal`]: [0, 1] } },
  { label: "Pin", set: { [`supports.#${id}.type`]: "pin", [`supports.#${id}.normal`]: [0, 1] } },
  { label: "Cable (straight up)", set: { [`supports.#${id}.type`]: "cable", [`supports.#${id}.normal`]: [0, 1] } },
  { label: "Fixed (built into a wall)", set: { [`supports.#${id}.type`]: "fixed", [`supports.#${id}.normal`]: wall } },
];
const types = (s) => s.supports.map((q) => q.type).sort().join("+");

export default {
  id: "07-supports-fbd/1-explore",
  challenge: "explore",
  solver: "statics.rigidBody",
  title: "Swap the Supports",
  mission: "Try different supports and see which reactions each one gives.",
  instructions:
    "Choose what holds each end of the beam. The faded symbols are the supports; the orange arrows are the **reactions** they push and pull with — one for each motion the support stops. " +
    "A body in a plane can move 3 ways (slide sideways, slide up and down, turn), and there are 3 equations to find the reactions.",
  setup: {
    body: { points: [[0, 0], [6, 0]] },
    supports: [
      { id: "A", type: "none", at: [0, 0], normal: [0, 1], anchor: [0, 2.2] },
      { id: "B", type: "roller", at: [6, 0], normal: [0, 1], anchor: [6, 2.2] },
    ],
    forces: [{ id: "P", symbol: "P", magnitude: 800, direction: { slope: [3, -4] }, at: [2, 0], push: true }],
  },
  view: { xmin: -1.3, xmax: 7.3, ymin: -1.6, ymax: 2.6 },
  editable: [
    { label: "Support at A (left)", options: choices("A", [1, 0]) },
    { label: "Support at B (right)", options: choices("B", [-1, 0]) },
    { path: "forces.#P.at.0", label: "P acts at x", min: 0.5, max: 5.5, step: 0.5, unit: "m" },
  ],
  tasks: [
    { text: "Hold the beam with a **pin** and a **roller**.", check: (v, s, r) => r.status === "determinate" && types(s) === "pin+roller" },
    { text: "Hold the beam with just **one** support.", check: (v, s, r) => r.status === "determinate" && s.supports.some((q) => q.type === "none") },
    { text: "Make it **statically indeterminate**: more unknowns than equations.", check: (v, s, r) => r.status === "indeterminate" },
    { text: "Use **two** supports that still can't hold it.", check: (v, s, r) => r.status === "unstable" && s.supports.every((q) => q.type !== "none") },
  ],
  hints: [
    "A roller only stops the beam moving into the ground (1 unknown). A pin stops sliding both ways (2). A fixed support also stops turning (3).",
    "3 equations can find exactly 3 unknowns. Fewer, and something can move; more, and equilibrium can't decide how the supports share the load.",
    "Two supports that each only push straight up can't stop the beam sliding sideways under the slanted load.",
  ],
  explanation:
    "Every support gives a reaction for each motion it prevents. A rigid body in a plane needs 3 well-placed unknown reactions: " +
    "fewer and it moves (unstable), more and the 3 equilibrium equations can't find them all (statically indeterminate). A pin at one end and a roller at the other is the classic choice.",
};
