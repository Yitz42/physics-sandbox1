// crate.js — the standard picture for this unit: a crate hanging from ring A,
// held by cable AB (up-left) and cable AC (up-right). Stages copy this and
// change the numbers. (Not a stage itself: it isn't listed in unit.js.)
export function crateSetup({ angleAB = 30, angleAC = 45, mass = 50 } = {}) {
  return {
    analysis: "equilibrium",
    point: { at: [0, 0], label: "A" },
    forces: [
      { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { angle: angleAB, from: "-x", toward: "+y" }, anchor: { label: "B", length: 2 } },
      { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { angle: angleAC, from: "+x", toward: "+y" }, anchor: { label: "C", length: 2 } },
      { id: "W", symbol: "W", kind: "weight", mass },
    ],
  };
}
