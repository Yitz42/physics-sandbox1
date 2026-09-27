// Signal-flow graphs, stage 1 — explore: light up each forward path, each loop
// and the non-touching loops of a graph, and watch Mason's rule build T.

import { twoPaths } from "../shared/graphs.js";

export default {
  id: "signal-flow-graphs/1-explore",
  challenge: "explore",
  solver: "controls.signalFlow",
  title: "Trace Paths and Loops",
  mission: "Trace the forward paths and loops that Mason's rule needs.",
  instructions:
    "In a signal-flow graph every dot is a signal and every arrow multiplies it by its gain. Mason's rule needs three things: " +
    "the **forward paths** (input to output, no node twice), the **loops** (back to the start, no node twice), and which loops **don't touch** (share no node). " +
    "Choose what to light up, and step through them with the slider. The equations list them all.",
  setup: { ...twoPaths(), show: { kind: "paths", index: 0 } },
  editable: [
    {
      label: "Light up",
      options: [
        { label: "Forward paths", set: { "show.kind": "paths" } },
        { label: "Loops", set: { "show.kind": "loops" } },
        { label: "Non-touching loops", set: { "show.kind": "sets" } },
      ],
    },
    { path: "show.index", label: "Which one", min: 0, max: 2, step: 1, unit: "" },
  ],
  tasks: [
    { text: "Light up the second forward path, $P_2$.", check: (v, s) => s.show.kind === "paths" && s.show.index === 1 },
    { text: "Find the loop that touches both of the others.", check: (v, s) => s.show.kind === "loops" && s.show.index === 2 },
    { text: "Light up the pair of loops that don't touch.", check: (v, s) => s.show.kind === "sets" && s.show.index === 0 },
  ],
  hints: [
    "Pick \"Forward paths\" and set the slider to 1 (counting starts at 0).",
    "The big loop runs all the way from $V_4$ back to $V_1$: it shares nodes with both small loops.",
    "The loop around $V_1$–$V_2$ and the loop around $V_3$–$V_4$ have no node in common.",
  ],
  explanation:
    "Mason's rule: $T = \\dfrac{P_1\\Delta_1 + P_2\\Delta_2}{\\Delta}$ with $\\Delta = 1 - \\Sigma L + \\Sigma(\\text{non-touching pairs})$. " +
    "$P_1$ touches every loop, so $\\Delta_1 = 1$; $P_2$ skips the first loop, so $\\Delta_2 = 1 + G_1H_1$.",
};
