// Unit 4.8, stage 1 — explore: push on a door's handle P (0.8, 0, 1) in any direction; the door
// turns about its hinge line O → H (the z axis). M_a = u_a · (r × F) = 0.8 F_y: only the push
// ACROSS the door counts. Start F = {−50 i} N (straight toward the hinges): M_a = 0 (no task done).
// Checks: M_a ≥ 60 N·m — F_y ≥ 75 N; a push over 150 N that doesn't turn it — F_y = 0, e.g.
// {150 i + 150 k}; closing — F_y < 0.

import { doorSetup } from "../library/moments3d.js";

export default {
  id: "moment-about-axis/1-explore",
  challenge: "explore",
  solver: "statics.force3d",
  title: "Open the Door",
  mission: "Push on a door's handle in 3D and see which pushes actually turn it about its hinges.",
  instructions:
    "A door turns about its hinges, the line O → H. Set the three components of your push $\\mathbf{F}$ on the handle P and watch two things: the moment about O, $\\mathbf{M}_O$ (purple), " +
    "and the moment about the hinge line, $M_a$ (green, along the hinges) — the only part that turns the door.",
  setup: { ...doorSetup({ components: [-50, 0, 0] }), fullScale: 450, reach: [150, 150, 150], view3d: { yaw: 65, pitch: 20 } },
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "You pull the handle straight toward the hinges, along the door. **How hard does it turn the door?**",
    options: [
      { text: "Not at all", correct: true },
      { text: "As hard as any 50 N push", feedback: "A pull along the door passes through the hinge line: no moment arm about it." },
      { text: "Harder than a push across the door", feedback: "Only a push ACROSS the door turns it; one along the door just loads the hinges." },
    ],
    explain: "A force whose line crosses the axis can't turn the body about it: $M_a = 0$.",
  },
  editable: [
    { path: "forces.0.dir.components.0", label: "F: x (along the door)", min: -150, max: 150, step: 10, unit: "N" },
    { path: "forces.0.dir.components.1", label: "F: y (across the door)", min: -150, max: 150, step: 10, unit: "N" },
    { path: "forces.0.dir.components.2", label: "F: z (up)", min: -150, max: 150, step: 10, unit: "N" },
    { path: "view3d.yaw", label: "Turn the view", min: 0, max: 90, step: 5, unit: "deg" },
  ],
  tasks: [
    { text: "Open the door with $M_a$ of at least **60 N·m**.", check: (v) => v.Ma >= 60 },
    { text: "Push with **more than 150 N** that doesn't turn the door at all.", check: (v) => v.F > 150 && Math.abs(v.Ma) < 0.5 },
    { text: "**Close** the door instead ($M_a$ negative).", check: (v) => v.Ma < -1 },
  ],
  hints: [
    "Here $M_a = r_x F_y - r_y F_x$ with $\\mathbf{r} = \\{0.8\\,\\mathbf{i} + 1\\,\\mathbf{k}\\}$ m: only $F_y$ matters.",
    "Pushes along the door (x) or up and down (z, parallel to the hinges) can't turn it.",
    "$M_a$ = 0.8 m × $F_y$: for 60 N·m you need $F_y$ = 75 N.",
  ],
  explanation:
    "About an axis, only the part of the force that is BOTH across the axis AND off it turns the body. A force parallel to the hinges, or one whose line crosses them, gives $M_a = 0$ — " +
    "however big it is. That's why handles are far from the hinges and you push across the door.",
};
