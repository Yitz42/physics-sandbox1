// hanging.js — more "ring A held by two cables" setups, each a different
// real situation with its own picture (used as a stage's `situations`, so a
// new version can show a different one). Same idea every time — ΣFx = 0 and
// ΣFy = 0 at A — but students have to read each picture afresh.
//
//   trafficLightSetup  a traffic light on two nearly flat wires between poles
//   balloonSetup       a balloon held DOWN by two tethers to the ground
//   lampAsideSetup     a lamp on a cable to the ceiling, pulled aside by a level cord
//
// Every setup names its two cables T_AB (to the left) and T_AC (to the right),
// so a stage's `ask` and `vary` paths work for all of them.

// A traffic light hangs at A; wires AB and AC run up to the tops of two poles.
// Angles are small (streets are wide and wires nearly level), so the tensions
// come out much bigger than the light's weight — the surprise of this picture.
export function trafficLightSetup({ angleAB = 10, angleAC = 15, mass = 25 } = {}) {
  return {
    analysis: "equilibrium",
    point: { at: [0, 0], label: "A" },
    poleBase: -2.6, // the street, below A
    forces: [
      { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { angle: angleAB, from: "-x", toward: "+y" }, anchor: { label: "B", length: 2.3, mount: "pole" } },
      { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { angle: angleAC, from: "+x", toward: "+y" }, anchor: { label: "C", length: 2.3, mount: "pole" } },
      { id: "W", symbol: "W", kind: "weight", mass, object: "trafficLight" },
    ],
  };
}

// A balloon pulls ring A UP with its net lift F_L (buoyancy minus its own
// weight); tethers AB and AC hold it DOWN to the ground. The cables pull
// below the horizontal, so the signs in ΣFy flip compared with a hanging crate.
export function balloonSetup({ angleAB = 40, angleAC = 55, lift = 600, ground = -1.6 } = {}) {
  return {
    analysis: "equilibrium",
    point: { at: [0, 0], label: "A" },
    ground: { y: ground, from: -3, to: 3 },
    forces: [
      { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { angle: angleAB, from: "-x", toward: "-y" }, anchor: { label: "B" } },
      { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: { angle: angleAC, from: "+x", toward: "-y" }, anchor: { label: "C" } },
      { id: "F_L", symbol: "F_L", magnitude: lift, direction: "up", object: "balloon" },
    ],
  };
}

// A lamp hangs from cable AB to the ceiling, and a level cord AC pulls it
// aside to a wall. The cord is horizontal, so ΣFy alone gives T_AB.
export function lampAsideSetup({ angleAB = 60, mass = 12 } = {}) {
  return {
    analysis: "equilibrium",
    point: { at: [0, 0], label: "A" },
    ceiling: { y: 1.6, from: -2.2, to: 0.6 },
    forces: [
      { id: "T_AB", symbol: "T_{AB}", kind: "cable", magnitude: null, direction: { angle: angleAB, from: "-x", toward: "+y" }, anchor: { label: "B" } },
      { id: "T_AC", symbol: "T_{AC}", kind: "cable", magnitude: null, direction: "right", anchor: { label: "C", length: 1.6 } },
      { id: "W", symbol: "W", kind: "weight", mass, object: "lamp" },
    ],
  };
}
