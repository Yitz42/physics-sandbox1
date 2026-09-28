// Unit 4.7, stage 3 — build: choose the force at the end B of the pipe so it only TWISTS the pipe
// about the vertical (no bending: M_x = M_y = 0) with a tightening moment between 60 and 80 N·m
// clockwise seen from above (M_z from −60 to −80 N·m), and work out M_z before each Test.
// r = {0.4 i + 0.5 j} m: M_x = 0.5 F_z, M_y = −0.4 F_z (so F_z = 0), M_z = 0.4 F_y − 0.5 F_x.
// E.g. F = {140 i + 0 j} N → M_z = −70 N·m; F = {0 i − 180 j} → −72; F = {100 i − 40 j} → −66.
// Start F = {0, 0, 200} N: it only bends the pipe.

const LOW = 60, HIGH = 80;

export default {
  id: "moments-3d/3-build",
  challenge: "build",
  solver: "statics.force3d",
  title: "Tighten, Don't Bend",
  mission: "Push on the pipe so it only twists (no bending) with a moment of 60–80 N·m.",
  instructions:
    `The pipe's end O is screwed into a fitting on the wall. Set the force at B so it **only tightens** the fitting — turns the pipe clockwise about the vertical, seen from above — ` +
    `**without bending it** ($M_x = M_y = 0$), with a moment of **${LOW}–${HIGH} N·m**. Work out $M_z$ for your force, then press **Test**.`,
  setup: {
    analysis: "moment",
    about: "O",
    points: { O: [0, 0, 0], A: [0, 0.5, 0], B: [0.4, 0.5, 0] },
    body: ["O", "A", "B"],
    forces: [{ id: "F", symbol: "F", at: "B", dir: { components: [0, 0, 200] } }],
    showR: true,
    axisLength: 0.8,
    fullScale: 1200,
    reach: [300, 300, 300],
  },
  editable: [
    { path: "forces.0.dir.components.0", label: "F: x component", min: -300, max: 300, step: 10, unit: "N" },
    { path: "forces.0.dir.components.1", label: "F: y component", min: -300, max: 300, step: 10, unit: "N" },
    { path: "forces.0.dir.components.2", label: "F: z component", min: -300, max: 300, step: 10, unit: "N" },
  ],
  goal: {
    text: `$M_x = M_y = 0$ and $-${HIGH} \\le M_z \\le -${LOW}$ N·m.`,
    predict: [{ quantity: "M.z" }],
    check(result) {
      const v = result.values;
      if (Math.abs(v["M.x"]) > 0.5 || Math.abs(v["M.y"]) > 0.5) return { ok: false, message: `It bends the pipe: $M_x$ = ${v["M.x"].toFixed(1)} and $M_y$ = ${v["M.y"].toFixed(1)} N·m. Any up-or-down part of F bends it — keep $F_z = 0$.` };
      if (v["M.z"] > 0) return { ok: false, message: "It twists the pipe the wrong way (counterclockwise from above): that loosens the fitting." };
      const t = -v["M.z"];
      if (t < LOW) return { ok: false, message: `The twist is only ${t.toFixed(1)} N·m. Push harder, or more across the line from O to B.` };
      if (t > HIGH) return { ok: false, message: `The twist is ${t.toFixed(1)} N·m — too much. Ease off.` };
      return { ok: true, message: `A pure twist of ${t.toFixed(1)} N·m: $\\mathbf{M}_O$ points straight down, clockwise seen from above.` };
    },
  },
  hints: [
    "$M_x = r_y F_z$ and $M_y = -r_x F_z$ here: bending comes only from $F_z$.",
    "$M_z = r_x F_y - r_y F_x = 0.4F_y - 0.5F_x$. Clockwise from above is negative.",
    "Try a force along +x only: $M_z = -0.5F_x$.",
  ],
  explanation:
    "Each part of $\\mathbf{M}_O$ is a turning effect about one axis: here $M_z$ twists the pipe in its fitting and $M_x$, $M_y$ bend it. A force in the level plane can only twist it, " +
    "and the part of it along OB does nothing — only the part across that line turns the pipe.",
};
