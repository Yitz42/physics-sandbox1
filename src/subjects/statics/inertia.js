// inertia.js — area moments of inertia of beam cross-sections (Unit 10.1).
//
// I = ∫ y² dA: how far the area lies from an axis, squared. A beam bends about the
// horizontal axis through its section's centroid; the bigger I_x there, the stiffer it is.
// For a composite section, each part's own I about ITS centroid (Ī) is moved to the
// shared axis by the PARALLEL-AXIS THEOREM:
//     I = Ī + A d²      d: from the part's centroid to the axis
// so   I_x = Σ (Ī_i + A_i d_i²),  d_i = ỹ_i − ȳ   (holes count negative, as in Unit 7.2).
//
// Lengths are in millimetres (sections are small); I is reported in 10⁶ mm⁴, the textbook's
// usual size (values.Ix6), and in mm⁴ (values.Ix).
//
// setup: either parts (as centroid.js: rect, tri, semi, circle, quarter; hole: true), or a
//   section, built into rectangles here so sliders can change it:
//     { kind: "plank", b, h, cy | y0 }   a b × h rectangle, its centroid at height cy (or its bottom at y0)
//     { kind: "T", b, tf, hw, tw }       a flange b × tf on top of a web tw × hw
//     { kind: "I", b, tf, hw, tw, b2? }  flanges b × tf top and bottom (b2: the bottom one's width)
//     { kind: "box", B, H, t }           a B × H hollow box, walls t thick
//   axis: { y } — also find I about a horizontal axis at height y (values.Ia, e.g. the base).
// values: A, xbar, ybar, Ix, Iy (about the centroid), Ix6, Iy6, Ia6 (with an axis), kx = √(Ix/A);
//   per part: A_<id>, y_<id>, Ib_<id> (its Ī, 10⁶ mm⁴), d_<id> (ỹ − ȳ), Ad2_<id> (10⁶ mm⁴).

import { partInfo } from "./centroid.js";

const M6 = 1e6;

// The parts of a section.
export function partsOf(setup) {
  const s = setup.section;
  if (!s) return setup.parts || [];
  const rect = (id, x, y, w, h, name, hole = false) => ({ id, shape: "rect", at: [x, y], w, h, name, ...(hole ? { hole: true } : {}) });
  if (s.kind === "plank") return [rect("1", 0, s.y0 != null ? s.y0 : s.cy - s.h / 2, s.b, s.h, "plank")];
  if (s.kind === "T") return [rect("1", (s.b - s.tw) / 2, 0, s.tw, s.hw, "web"), rect("2", 0, s.hw, s.b, s.tf, "flange")];
  if (s.kind === "I") {
    const b2 = s.b2 ?? s.b, W = Math.max(s.b, b2);
    return [rect("1", (W - b2) / 2, 0, b2, s.tf, "bottom flange"), rect("2", (W - s.tw) / 2, s.tf, s.tw, s.hw, "web"), rect("3", (W - s.b) / 2, s.tf + s.hw, s.b, s.tf, "top flange")];
  }
  if (s.kind === "box") return [rect("1", 0, 0, s.B, s.H, "outside"), rect("2", s.t, s.t, s.B - 2 * s.t, s.H - 2 * s.t, "hole", true)];
  throw new Error(`Unknown section "${s.kind}"`);
}

// A part's own moments of inertia about its centroid (mm⁴): [Īx, Īy].
export function ownI(p) {
  const i = partInfo(p);
  if (i.kind === "rect") return [Math.abs(p.w * p.h ** 3) / 12, Math.abs(p.h * p.w ** 3) / 12];
  if (i.kind === "tri") return [Math.abs(p.w * p.h ** 3) / 36, Math.abs(p.h * p.w ** 3) / 36];
  if (i.kind === "circle") return [(Math.PI * p.r ** 4) / 4, (Math.PI * p.r ** 4) / 4];
  if (i.kind === "semi") {
    const across = (Math.PI / 8 - 8 / (9 * Math.PI)) * p.r ** 4, along = (Math.PI * p.r ** 4) / 8;
    return ["up", "down"].includes(p.dir || "up") ? [across, along] : [along, across];
  }
  if (i.kind === "quarter") { const q = (Math.PI / 16 - 4 / (9 * Math.PI)) * p.r ** 4; return [q, q]; }
  throw new Error(`No Ī for ${i.kind}`);
}

// opts: slips for the mistakes list — noTransfer (no A d²), baseD (d measured from y = 0),
// third (b h³/3 for rectangles), swapBH (h b³/12), holeAdded.
export function sectionI(setup, opts = {}) {
  const parts = partsOf(setup);
  let A = 0, Qx = 0, Qy = 0;
  const infos = parts.map((p) => {
    const i = partInfo(p), sgn = p.hole && !opts.holeAdded ? -1 : 1;
    A += sgn * i.A; Qx += sgn * i.A * i.y; Qy += sgn * i.A * i.x;
    return { p, i, sgn };
  });
  const ybar = Qx / A, xbar = Qy / A;
  let Ix = 0, Iy = 0;
  const each = {};
  for (const { p, i, sgn } of infos) {
    let [Ibx, Iby] = ownI(p);
    if (opts.third && i.kind === "rect") Ibx *= 4;
    if (opts.swapBH && i.kind === "rect") Ibx = Math.abs(p.h * p.w ** 3) / 12;
    const d = opts.baseD ? i.y : i.y - ybar, dx = i.x - xbar;
    const transfer = opts.noTransfer ? 0 : i.A * d * d;
    Ix += sgn * (Ibx + transfer);
    Iy += sgn * (Iby + i.A * dx * dx);
    each[p.id] = { A: i.A, y: i.y, Ib: Ibx, d, Ad2: i.A * d * d };
  }
  let Ia = null;
  if (setup.axis && setup.axis.y != null) Ia = Ix + A * (ybar - setup.axis.y) ** 2; // parallel axis, whole section
  return { A, xbar, ybar, Ix, Iy, Ia, each };
}

export function solveInertia(setup) {
  const r = sectionI(setup);
  const values = { A: r.A, xbar: r.xbar, ybar: r.ybar, Ix: r.Ix, Iy: r.Iy, Ix6: r.Ix / M6, Iy6: r.Iy / M6, kx: Math.sqrt(r.Ix / r.A) };
  if (r.Ia != null) values.Ia6 = r.Ia / M6;
  for (const [id, e] of Object.entries(r.each)) {
    Object.assign(values, { [`A_${id}`]: e.A, [`y_${id}`]: e.y, [`Ib_${id}`]: e.Ib / M6, [`d_${id}`]: e.d, [`Ad2_${id}`]: e.Ad2 / M6 });
  }
  // (A plank alone: its own Ī, and the parallel-axis part A d² about the axis, for the explore stage.)
  if (setup.section && setup.section.kind === "plank" && r.Ia != null) values.Ad2axis6 = (r.Ia - r.Ix) / M6;
  return { status: "resultant", values };
}

export function inertiaQuantities(setup) {
  const q = {
    A: { label: "A", unit: "mm^2" }, xbar: { label: "\\bar{x}", unit: "mm" }, ybar: { label: "\\bar{y}", unit: "mm" },
    Ix6: { label: "\\bar{I}_x", unit: "10^6 mm^4" }, Iy6: { label: "\\bar{I}_y", unit: "10^6 mm^4" }, Ia6: { label: "I_{\\text{axis}}", unit: "10^6 mm^4" },
    kx: { label: "k_x", unit: "mm" },
  };
  for (const p of partsOf(setup)) {
    q[`Ib_${p.id}`] = { label: `\\bar{I}_{${p.id}}`, unit: "10^6 mm^4" };
    q[`d_${p.id}`] = { label: `d_{${p.id}}`, unit: "mm" };
  }
  return q;
}
