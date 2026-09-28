// Unit 10.1, stage 1 — explore: a plank's cross-section — change its width, height and how far it
// sits from the x axis; watch its own Ī = bh³/12 and its I about the x axis, Ī + A d².
// Start: 100 × 60 mm, centroid 20 mm above the axis: Ī = 100(60)³/12 = 1.8 ×10⁶, A d² = 6000(20)² = 2.4 ×10⁶,
//   I_axis = 4.2 ×10⁶ mm⁴ (no task done yet).
// Checks: Ī ≥ 8 ×10⁶ with A ≤ 6000 mm² (e.g. 40 × 150: 11.25 ×10⁶);  I_axis ≥ 10 Ī (d ≥ 0.87 h);  d = 0 (A d² = 0).

export default {
  id: "inertia/1-explore",
  challenge: "explore",
  solver: "statics.inertia",
  title: "Stand the Plank on Edge",
  mission: "Resize and move a plank's cross-section; see what makes I big.",
  instructions:
    "This is a plank's cross-section (sizes in mm). Its own moment of inertia about its centroid is $\\bar{I} = bh^3/12$; about the x axis (dashed) it is " +
    "$\\bar{I} + A d^2$, where d is how far its centroid is from that axis. Change its width, height and position, and watch both under the picture.",
  setup: { section: { kind: "plank", b: 100, h: 60, cy: 20 }, axis: { y: 0, name: "x axis" }, showAxis: true },
  view: { xmin: -60, xmax: 300, ymin: -260, ymax: 260 },
  // Predict first (owner, 2026-09-27): one quick guess before the numbers show.
  guess: {
    prompt: "**Stand the plank on edge: twice as tall, half as wide (same area). Its Ī about the horizontal axis…**",
    options: [
      { text: "becomes 4 times bigger", correct: true },
      { text: "stays the same — same area", feedback: "Area alone doesn't decide I: WHERE the area is does. Taller puts it further from the axis." },
      { text: "doubles", feedback: "The height is cubed: $(b/2)(2h)^3 = 4\\,bh^3$." },
      { text: "becomes 8 times bigger", feedback: "Close — $h^3$ grows 8×, but halving the width halves it again: 4×." },
    ],
    explain: "$\\bar{I} = bh^3/12$: the height is cubed, so standing a plank on edge makes it 4× stiffer.",
  },
  editable: [
    { path: "section.b", label: "Width b", min: 20, max: 200, step: 10, unit: "mm" },
    { path: "section.h", label: "Height h", min: 20, max: 200, step: 10, unit: "mm" },
    { path: "section.cy", label: "Distance d", min: -150, max: 150, step: 10, unit: "mm" },
  ],
  tasks: [
    { text: "Make its own $\\bar{I}$ at least **8 ×10⁶ mm⁴** using no more than **6000 mm²** of area.", check: (v) => v.Ix6 >= 8 - 1e-9 && v.A <= 6000 + 1e-9 },
    { text: "Move it so its I about the x axis is at least **10 times** its own $\\bar{I}$.", check: (v) => v.Ia6 >= 10 * v.Ix6 - 1e-9 },
    { text: "Put it where the $A d^2$ part is **zero**.", check: (v, s) => Math.abs(s.section.cy) < 1e-9 },
  ],
  hints: [
    "$\\bar{I} = bh^3/12$: the height is cubed, the width isn't. For the same area, go tall and thin.",
    "$I = \\bar{I} + A d^2$: moving the plank away from the axis adds $A d^2$, which grows with d squared.",
    "$A d^2$ is zero only when the axis passes through the plank's own centroid.",
  ],
  explanation:
    "I measures how far the area is from the axis, squared. So height is cubed in $bh^3/12$, and every bit of area moved away from the axis adds $A d^2$. " +
    "The smallest I of all is about the centroid — any other parallel axis adds $A d^2$.",
};
