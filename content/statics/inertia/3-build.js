// Unit 10.1, stage 3 — build: design an I-beam (flange thickness tf, web 10 mm thick): choose its flange
// width b and web height h_w so it uses no more area than allowed and is at least as stiff as asked.
// Before Test the student works out Ī_x of their design (goal.predict), so it can't be passed by guessing.
// Area A = 2 b tf + 10 h_w. Hardest version (A ≤ 7000, Ī ≥ 120, tf = 15): b = 60, h_w = 500 → A = 6800,
//   Ī = 10(500)³/12 + 2[60(15)³/12 + 900(257.5)²] = 104.2 + 119.4 = 223.6 ×10⁶ mm⁴ — every version has a design.
// Start: b = 200, h_w = 150, tf = 20: A = 9500 mm² — over every limit.

export default {
  id: "inertia/3-build",
  challenge: "build",
  solver: "statics.inertia",
  title: "Design the I-Beam",
  mission: "Shape an I-beam that is stiff enough without using too much steel.",
  instructions:
    "Design an I-beam: choose its flange width b and its web height $h_w$ (the web is 10 mm thick). It must stay within the area limit and reach the stiffness ($\\bar{I}_x$) shown in the picture. " +
    "Before you press **Test**, work out $\\bar{I}_x$ for your design.",
  setup: { section: { kind: "I", b: 200, tf: 20, hw: 150, tw: 10 }, limits: { A: 8000, I: 100 } },
  view: { xmin: -80, xmax: 380, ymin: -90, ymax: 560 },
  vary: [
    { path: "limits.A", values: [7000, 7500, 8000, 8500, 9000] },
    { path: "limits.I", values: [80, 90, 100, 110, 120] },
    { path: "section.tf", values: [15, 20] },
  ],
  editable: [
    { path: "section.b", label: "Flange width b", min: 60, max: 300, step: 10, unit: "mm" },
    { path: "section.hw", label: "Web height h_w", min: 100, max: 500, step: 10, unit: "mm" },
  ],
  goal: {
    text: "Area within its limit, and $\\bar{I}_x$ at least the target (both in the picture).",
    predict: [{ quantity: "Ix6", precision: 0.05 }],
    check(result, setup) {
      const v = result.values, lim = setup.limits;
      if (v.A > lim.A + 1e-9) return { ok: false, message: `Too much steel: ${v.A.toFixed(0)} mm², over the ${lim.A} mm² limit. Thin the flanges' width or shorten the web.` };
      if (v.Ix6 < lim.I - 1e-9) return { ok: false, message: `Not stiff enough: Ī_x = ${v.Ix6.toFixed(2)} ×10⁶ mm⁴. Move steel further from the centroid — a taller web pushes the flanges out, and their A d² grows with d².` };
      return { ok: true, message: `Stiff enough (${v.Ix6.toFixed(2)} ×10⁶ mm⁴) with ${v.A.toFixed(0)} mm² of steel.` };
    },
  },
  hints: [
    "Area: two flanges $2\\,b\\,t_f$ plus the web $10\\,h_w$.",
    "Each flange adds its own tiny $bt_f^3/12$ plus $A d^2$, with d from the flange's middle to the beam's centre: $d = h_w/2 + t_f/2$.",
    "Tall and narrow wins: a taller web moves the flanges further out, and d is squared.",
  ],
  explanation:
    "For bending, steel far from the centroid does almost all the work (its $A d^2$). An I-beam puts its steel in two flanges held far apart by a thin web — " +
    "the stiffest shape for the steel it uses.",
};
