// graphs.js — signal-flow graphs used by several Mason's rule stages.
// (Not a stage itself.) See src/subjects/controls/signal-flow.js for the format.
// Loops drawn above the line bow "up" (negative bend on a right-to-left branch).

// Two forward paths, three loops, one non-touching pair:
//   P1 = G1G2G3 (R → A → B → X → D → C), P2 = G4G3 (R → X → D → C)
//   loops: −G1H1 (A,B), −G3H2 (X,D), −G1G2G3H3 (A,B,X,D); the first two don't touch.
//   Δ = 1 + G1H1 + G3H2 + G1G2G3H3 + G1G3H1H2;  Δ1 = 1;  Δ2 = 1 + G1H1
// Default numbers: Δ = 6.6, T = 9 / 6.6 = 1.364 (tests/controls/signal-flow.test.js).
export const twoPaths = () => ({
  input: "R",
  output: "C",
  nodes: [
    { id: "R", at: [0, 0], label: "R(s)" },
    { id: "A", at: [1.6, 0], label: "V_1" },
    { id: "B", at: [3.2, 0], label: "V_2" },
    { id: "X", at: [4.8, 0], label: "V_3" },
    { id: "D", at: [6.4, 0], label: "V_4" },
    { id: "C", at: [8, 0], label: "C(s)" },
  ],
  branches: [
    { from: "R", to: "A", gain: 1 },
    { from: "A", to: "B", gain: "G1" },
    { from: "B", to: "X", gain: "G2" },
    { from: "X", to: "D", gain: "G3" },
    { from: "D", to: "C", gain: 1 },
    { from: "B", to: "A", gain: "-H1", bend: -0.75 },
    { from: "D", to: "X", gain: "-H2", bend: -0.75 },
    { from: "D", to: "A", gain: "-H3", bend: 1.5 },
    { from: "R", to: "X", gain: "G4", bend: 1.7 },
  ],
  symbols: {
    G1: { value: 2 }, G2: { value: 3 }, G3: { value: 1 }, G4: { value: 1.5 },
    H1: { value: 0.5 }, H2: { value: 2 }, H3: { value: 0.1 },
  },
});

// A chain of three loops (the first and last don't touch), and a feedforward
// branch straight from R to C that touches no loop:
//   P1 = G1G2G3 (Δ1 = 1),  P2 = G4 (Δ2 = Δ)
//   Δ = 1 + G1H1 + G2H2 + G3H3 + G1G3H1H3
// Default numbers: Δ = 1 + 1 + 1 + 0.6 + 0.6 = 4.2, T = (6 + 0.5·4.2)/4.2 = 1.929.
export const loopChain = () => ({
  input: "R",
  output: "C",
  nodes: [
    { id: "R", at: [0, 0], label: "R(s)" },
    { id: "V1", at: [1.6, 0], label: "V_1" },
    { id: "V2", at: [3.2, 0], label: "V_2" },
    { id: "V3", at: [4.8, 0], label: "V_3" },
    { id: "V4", at: [6.4, 0], label: "V_4" },
    { id: "C", at: [8, 0], label: "C(s)" },
  ],
  branches: [
    { from: "R", to: "V1", gain: 1 },
    { from: "V1", to: "V2", gain: "G1" },
    { from: "V2", to: "V3", gain: "G2" },
    { from: "V3", to: "V4", gain: "G3" },
    { from: "V4", to: "C", gain: 1 },
    { from: "V2", to: "V1", gain: "-H1", bend: -0.75 },
    { from: "V3", to: "V2", gain: "-H2", bend: -0.75 },
    { from: "V4", to: "V3", gain: "-H3", bend: -0.75 },
    { from: "R", to: "C", gain: "G4", bend: -1.6 },
  ],
  symbols: {
    G1: { value: 2 }, G2: { value: 1 }, G3: { value: 3 }, G4: { value: 0.5 },
    H1: { value: 0.5 }, H2: { value: 1 }, H3: { value: 0.2 },
  },
});
