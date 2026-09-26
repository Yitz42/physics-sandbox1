// crate.js — the standard pictures for this unit. crateSetup: a crate hanging from ring A,
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

// A crate hanging from ring A, held by cable AB (up-left) and a spring AC
// (straight out to the right, to a wall at C). The spring's stiffness k is in N/m
// and `unstretched` is its length l₀ before it is stretched.
export function springSetup({ angleAB = 40, k = 800, unstretched = 0.5, mass = 20, springLength = 1.9 } = {}) {
  return {
    analysis: "equilibrium",
    point: { at: [0, 0], label: "A" },
    forces: [
      { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { angle: angleAB, from: "-x", toward: "+y" }, anchor: { label: "B", length: 2 } },
      { id: "F_AC", symbol: "F_{AC}", kind: "spring", k, unstretched, magnitude: null, direction: "right", anchor: { label: "C", length: springLength } },
      { id: "W", symbol: "W", kind: "weight", mass },
    ],
  };
}

// A small pulley A riding on cable BAC, with a crate hanging from it. The same
// cable passes over the pulley, so both sides pull with the SAME tension T
// (shared: "T" makes them one unknown). Rope AD holds the pulley from the left.
export function pulleySetup({ angleAB = 60, angleAC = 30, mass = 30 } = {}) {
  return {
    analysis: "equilibrium",
    point: { at: [0, 0], label: "A", object: "pulley" },
    forces: [
      { id: "T_AB", symbol: "T", shared: "T", kind: "cable", magnitude: null, direction: { angle: angleAB, from: "-x", toward: "+y" }, anchor: { label: "B", length: 2 } },
      { id: "T_AC", symbol: "T", shared: "T", kind: "cable", magnitude: null, direction: { angle: angleAC, from: "+x", toward: "+y" }, anchor: { label: "C", length: 2.2 } },
      { id: "T_AD", symbol: "T_{AD}", kind: "cable", magnitude: null, direction: "left", anchor: { label: "D", length: 1.4 } },
      { id: "W", symbol: "W", kind: "weight", mass },
    ],
  };
}
