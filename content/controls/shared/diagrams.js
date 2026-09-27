// diagrams.js — block diagrams used by several block diagram stages.
// (Not a stage itself.) See src/subjects/controls/block-diagram.js for the format.

// G1, an inner loop (G2 with feedback H2), and G3 in series, inside an outer
// loop with feedback H1 — negative feedback everywhere. Reduces in 3 steps:
//   inner loop → series → outer loop:  T = G1G2G3 / (1 + G2H2 + G1G2G3H1)
export const nestedLoops = () => ({
  input: "R(s)",
  output: "C(s)",
  diagram: {
    loop: { series: [{ block: "G1" }, { loop: { block: "G2" }, back: { block: "H2" }, sign: -1 }, { block: "G3" }] },
    back: { block: "H1" },
    sign: -1,
  },
});
