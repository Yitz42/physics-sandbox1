// Unit 4.8, stage 3 — build: aim a 100 N push on the door handle (azimuth θ in the floor plane,
// elevation φ up from it) so the door turns with 50–60 N·m about its hinges, and work out M_a first.
// M_a = 0.8 F_y = 0.8 (100 cos φ sin θ): needs cos φ sin θ from 0.625 to 0.75, e.g. θ = 45°, φ = 0°
// (56.6 N·m) or θ = 90°, φ = 40° (61.3 — too much) … Start θ = 0°, φ = 0° (along the door): M_a = 0.

import { doorSetup } from "../library/moments3d.js";

const LOW = 50, HIGH = 60;

export default {
  id: "moment-about-axis/3-build",
  challenge: "build",
  solver: "statics.force3d",
  title: "Aim the Push",
  mission: "Aim a 100 N push on the door handle so it turns the door with 50–60 N·m.",
  instructions:
    `You push the handle P with **100 N**. Aim it with the two angles — θ round from +x in the floor plane, φ up from the floor plane — so the door turns about its hinges with **${LOW}–${HIGH} N·m**. ` +
    "Work out $M_a$ for your aim, then press **Test**.",
  setup: { ...doorSetup({ azimuth: 0, elevation: 0 }), forces: [{ id: "F", symbol: "F", magnitude: 100, at: "P", dir: { azimuth: 0, elevation: 0 } }] },
  editable: [
    { path: "forces.0.dir.azimuth", label: "Aim θ (round)", min: 0, max: 180, step: 5, unit: "deg" },
    { path: "forces.0.dir.elevation", label: "Aim φ (up)", min: -60, max: 60, step: 5, unit: "deg" },
  ],
  goal: {
    text: `${LOW} N·m $\\le M_a \\le$ ${HIGH} N·m.`,
    predict: [{ quantity: "Ma" }],
    check(result) {
      const Ma = result.values.Ma;
      if (Ma < 0) return { ok: false, message: `$M_a$ = ${Ma.toFixed(1)} N·m: that closes the door. Aim toward +y.` };
      if (Ma < LOW) return { ok: false, message: `$M_a$ = ${Ma.toFixed(1)} N·m — not enough. Aim more squarely across the door, and less up or down.` };
      if (Ma > HIGH) return { ok: false, message: `$M_a$ = ${Ma.toFixed(1)} N·m — too much. Aim a little less squarely across the door.` };
      return { ok: true, message: `$M_a$ = ${Ma.toFixed(1)} N·m: only the part of your 100 N across the door, ${(Ma / 0.8).toFixed(1)} N, turns it.` };
    },
  },
  hints: [
    "$F_y = F\\cos\\phi\\sin\\theta$ is the only part across the door.",
    "$M_a = 0.8\\,F_y$ (the handle is 0.8 m from the hinges).",
    "Straight across ($\\theta = 90^\\circ$, $\\phi = 0$) gives 80 N·m — too much. Tilt the aim away from that.",
  ],
  explanation:
    "Of any push, only its part across the door, at the handle's distance from the hinges, turns the door: $M_a = \\mathbf{u}_a \\cdot (\\mathbf{r} \\times \\mathbf{F}) = 0.8\\,F_y$ here. The rest just pushes on the hinges.",
};
