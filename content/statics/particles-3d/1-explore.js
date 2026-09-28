// Unit 3.4, stage 1 — explore: a crate on three cables; the student moves anchor D on the ceiling
// and watches the three tensions (library/particles3d.js, roomSetup; hand checks there).
// Checks: D on the line from B through A's foot, e.g. (3, 2, 9): T_AC = 0 exactly;
//   D straight above A (0, 0, 9): T_AD = W and the others 0; D outside the triangle, e.g. (−2, −3, 9):
//   a cable would have to push. Start D (2, 3, 9): 228.9 / 95.4 / 248.0 N (no task done).

import { roomSetup } from "../library/particles3d.js";

const pulling = (v) => ["T_AB", "T_AC", "T_AD"].every((id) => v[id] > -0.5);

export default {
  id: "particles-3d/1-explore",
  challenge: "explore",
  solver: "statics.force3d",
  title: "Three Cables in a Room",
  mission: "Move one anchor on the ceiling and see how three cables share a crate's weight.",
  instructions:
    "A crate hangs from ring A on three cables to the ceiling. Move anchor D with the sliders (the ceiling is at z = 9 m) and change the crate's mass. " +
    "The game solves $\\Sigma F_x = 0$, $\\Sigma F_y = 0$, $\\Sigma F_z = 0$ live: watch the three tensions, and turn the view to see where D is.",
  setup: {
    ...roomSetup(),
    view3d: { yaw: 30, pitch: 22 },
    groundCentre: [0, 0], // (the floor stays put while D moves)
    keepInView: [[-6, -6, 9], [6, -6, 9], [6, 6, 9], [-6, 6, 9]], // (everywhere D can go)
  },
  editable: [
    { path: "points.D.0", label: "Anchor D: x", min: -6, max: 6, step: 0.5, unit: "m" },
    { path: "points.D.1", label: "Anchor D: y", min: -6, max: 6, step: 0.5, unit: "m" },
    { path: "forces.#W.mass", label: "Crate mass", min: 10, max: 100, step: 5, unit: "kg" },
    { path: "view3d.yaw", label: "Turn the view", min: 0, max: 90, step: 5, unit: "deg" },
  ],
  tasks: [
    { text: "Move D so that cable **AC carries nothing** (under 1 N), with the other two still pulling.", check: (v) => pulling(v) && Math.abs(v.T_AC) < 1 },
    { text: "Move D so that **one cable holds the whole crate**: $T_{AD} = W$ (within 1 N).", check: (v) => Math.abs(v.T_AD - v.W) < 1 },
    { text: "Move D so that a cable would have to **push** (it goes slack and the crate swings). Where is D, seen from above?", check: (v) => ["T_AB", "T_AC", "T_AD"].some((id) => v[id] < -1) },
  ],
  hints: [
    "Seen from above, A must lie inside the triangle B, C, D for all three cables to pull.",
    "For AC to carry nothing, AB and AD alone must hold the crate: A (seen from above) must be on the line from B to D.",
    "A cable straight above the ring lifts the crate on its own.",
  ],
  explanation:
    "Only the cables' vertical parts hold the crate up: $\\Sigma F_z = 0$. Their sideways parts must cancel in BOTH x and y — and three pulls can only cancel sideways " +
    "if, seen from above, they point out in directions that surround A. Move an anchor so A falls outside the triangle and one cable would have to push: it goes slack.",
};
