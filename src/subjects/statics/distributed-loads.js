// distributed-loads.js — the shapes of distributed loads, and their resultants.
//
// A DISTRIBUTED load is spread along a beam (sand, snow, water pressure …).
// Its intensity w is a force per metre of beam (N/m). Its effect on the beam
// as a whole is the same as ONE force:
//   size     F = area under the load curve   (F = ∫ w dx)
//   position x̃ = centroid of that area        (x̃ = ∫ x w dx / ∫ w dx)
//
// Shared by the Unit 6 solver (distributed.js) and the rigid-body solver,
// which turns each load into its resultant force(s).
//
// A load in setup.loads (every load pushes DOWN on a horizontal beam):
//   { id: "w", shape: "uniform",  from: 0, to: 6, w: 400 }
//   { id: "w", shape: "triangle", from: 0, to: 6, w: 600, peak: "right" }
//   { id: "w", shape: "linear",   from: 0, to: 6, w: [200, 600] }     w at `from`, w at `to`
//   { id: "w", shape: "power",    from: 0, to: 4, w: 600, n: 2 }       w = w₀(x/L)ⁿ, zero at
//                                  `from`, w₀ at `to` (peak: "left" mirrors it)
//   Optional: y (height of the beam, default 0), symbol ("w", "w_0"), symbols
//   (["w_A", "w_B"] for the two ends of a linear load), spanSymbol ("L").
//
// A trapezoid (linear, both ends non-zero and different) is split the
// textbook way: a rectangle under the smaller end plus a triangle on top
// (pieces "<id>_rect" and "<id>_tri"; ids avoid dots so equation terms can link to them).

const LOAD_SHAPES = ["uniform", "triangle", "linear", "power"];

// Intensities at the two ends: [w at `from`, w at `to`] (a power load: [0, w₀] or mirrored).
export function endValues(load) {
  if (!LOAD_SHAPES.includes(load.shape)) throw new Error(`Unknown load shape "${load.shape}" (use ${LOAD_SHAPES.join(", ")})`);
  if (load.shape === "uniform") return [load.w, load.w];
  if (load.shape === "linear") return load.w.slice();
  return load.peak === "left" ? [load.w, 0] : [0, load.w];
}

export const spanOf = (load) => load.to - load.from;

// Intensity w (N/m) at position x along the beam (0 outside the load).
export function intensityAt(load, x) {
  if (x < load.from - 1e-9 || x > load.to + 1e-9) return 0;
  const L = spanOf(load);
  const t = L > 0 ? (x - load.from) / L : 0; // 0 at `from`, 1 at `to`
  if (load.shape === "power") return load.w * Math.pow(load.peak === "left" ? 1 - t : t, load.n);
  const [a, b] = endValues(load);
  return a + (b - a) * t;
}

// Names used in equations: the load's own symbol, its two ends, and its span.
export const loadSymbol = (load) => load.symbol || (load.shape === "uniform" ? "w" : "w_0");
export const spanSymbol = (load) => load.spanSymbol || "L";
export function endSymbols(load) {
  if (load.symbols) return load.symbols;
  const s = loadSymbol(load);
  return load.shape === "linear" ? ["w_A", "w_B"] : [s, s];
}

// The pieces a load is replaced by, each with its own resultant:
//   { id, load, kind: "rect" | "tri" | "curve", F (N), x (centroid, m),
//     height (N/m), heightSymbol, L, from, to, peak }
// A rectangle's resultant acts at its middle; a triangle's at ⅓ of the base
// from its TALL end; a curve w₀(x/L)ⁿ has F = w₀L/(n+1), at (n+1)L/(n+2) from its zero end.
export function partsOf(load) {
  const L = spanOf(load);
  const base = { load: load.id, L, from: load.from, to: load.to, y: load.y ?? 0 };
  if (L <= 0) return [];
  if (load.shape === "power") {
    const n = load.n;
    const fromZero = ((n + 1) / (n + 2)) * L; // centroid, measured from the zero end
    const x = load.peak === "left" ? load.to - fromZero : load.from + fromZero;
    return [{ ...base, id: load.id, kind: "curve", F: (load.w * L) / (n + 1), x, height: load.w, heightSymbol: loadSymbol(load), n, peak: load.peak || "right" }];
  }
  const [a, b] = endValues(load);
  const [sa, sb] = endSymbols(load);
  const low = Math.min(a, b);
  const parts = [];
  const tri = (height, heightSymbol, id) => {
    const peak = b > a ? "right" : "left";
    const x = peak === "right" ? load.to - L / 3 : load.from + L / 3;
    return { ...base, id, kind: "tri", F: (height * L) / 2, x, height, heightSymbol, peak };
  };
  if (Math.abs(a - b) < 1e-9) {
    if (a > 0) parts.push({ ...base, id: load.id, kind: "rect", F: a * L, x: load.from + L / 2, height: a, heightSymbol: sa });
  } else if (low < 1e-9) {
    parts.push(tri(Math.max(a, b), a > b ? sa : sb, load.id));
  } else {
    // A trapezoid: rectangle under the lower end, triangle for the rest.
    parts.push({ ...base, id: `${load.id}_rect`, kind: "rect", F: low * L, x: load.from + L / 2, height: low, heightSymbol: a < b ? sa : sb });
    parts.push(tri(Math.abs(b - a), b > a ? `(${sb} - ${sa})` : `(${sa} - ${sb})`, `${load.id}_tri`));
  }
  return parts;
}

// Where the WRONG centroid of a part would be — the classic slip, used for
// mistakes: a triangle's resultant put ⅓ from its SHORT end; a curve's put
// at the middle of its span.
export function wrongCentroid(part) {
  if (part.kind === "tri") return part.peak === "right" ? part.from + part.L / 3 : part.to - part.L / 3;
  if (part.kind === "curve") return part.from + part.L / 2;
  return null;
}

// The same resultant found by adding up thin slices (numerical integration,
// Simpson's rule). Tests use it to check the formulas above.
export function integrate(load, slices = 200) {
  const L = spanOf(load);
  const h = L / slices;
  let F = 0, M = 0;
  for (let i = 0; i <= slices; i++) {
    const x = load.from + i * h;
    const k = i === 0 || i === slices ? 1 : i % 2 ? 4 : 2;
    const w = intensityAt(load, x);
    F += k * w;
    M += k * w * x;
  }
  F *= h / 3;
  M *= h / 3;
  return { F, x: F > 0 ? M / F : null };
}
