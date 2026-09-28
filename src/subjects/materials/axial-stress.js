// axial-stress.js — calculates cross-sectional area, axial normal force, and normal stress (σ = P / A).
//
// In Mechanics of Materials (Chapter 1), an axial member (tie rod, column, strut)
// carries an internal normal force P along its axis. The force is distributed over
// the cross-sectional area A, creating average normal stress:
//   σ = P / A
// Tension (pulling apart) is positive (+); compression (pushing together) is negative (−).
//
// Supported cross-section shapes:
//   circle:    diameter d (mm)           → A = (π/4) d²
//   rectangle: width b (mm), height h (mm) → A = b · h
//   tube:      outer d_o (mm), inner d_i (mm) → A = (π/4) (d_o² − d_i²)
//
// Units:
//   Force P: kN or N
//   Dimensions: mm
//   Area A: mm² (and m² = mm² × 10⁻⁶)
//   Stress σ: MPa (= N/mm²)

export const PI = Math.PI;

// Compute cross-sectional area in mm² from bar geometry.
export function barArea(bar = {}) {
  const shape = bar.shape || "circle";
  if (shape === "circle") {
    const d = bar.diameter ?? 20;
    return (PI / 4) * d * d;
  }
  if (shape === "rectangle") {
    const b = bar.width ?? 30;
    const h = bar.height ?? bar.thickness ?? 10;
    return b * h;
  }
  if (shape === "tube") {
    const dO = bar.dOuter ?? 30;
    const dI = bar.dInner ?? 20;
    return (PI / 4) * Math.max(0, dO * dO - dI * dI);
  }
  return bar.area ?? 100;
}

// Solve for area, force, normal stress, and factor of safety.
// Returns { status, values, equations }.
export function solveAxialStress(setup = {}) {
  const bar = setup.bar || {};
  const load = setup.load || {};
  const values = {};

  // Axial load P: given in kN or N, or derived from hanging mass (W = mg).
  let P_N = 0;
  if (load.P != null) {
    P_N = load.P * 1000; // load.P in kN
  } else if (load.P_N != null) {
    P_N = load.P_N;
  } else if (load.mass != null) {
    P_N = (load.compression ? -1 : 1) * load.mass * 9.81; // (a hanging mass pulls: tension, unless said)
  } else {
    P_N = 25000; // default 25 kN
  }

  const P_kN = P_N / 1000;
  const A_mm2 = barArea(bar);
  const A_m2 = A_mm2 * 1e-6;

  // Normal stress σ = P / A.
  // 1 N / 1 mm² = 10⁶ N/m² = 1 MPa.
  const sigma_MPa = A_mm2 > 1e-9 ? P_N / A_mm2 : 0;
  const sigma_abs = Math.abs(sigma_MPa);

  values.P = P_kN;
  values.P_N = P_N;
  values.A = A_mm2;
  values.A_m2 = A_m2;
  values.sigma = sigma_MPa;
  values.sigma_abs = sigma_abs;

  if (bar.diameter != null) values.d = bar.diameter;
  if (bar.width != null) values.b = bar.width;
  if (bar.height != null || bar.thickness != null) values.h = bar.height ?? bar.thickness;
  if (bar.dOuter != null) values.dOuter = bar.dOuter;
  if (bar.dInner != null) values.dInner = bar.dInner;
  if (bar.length != null) values.L = bar.length;

  // Factor of safety FS = σ_allow / |σ| (when allowable stress is set).
  const allow = bar.allowableStress ?? setup.allowableStress;
  if (allow != null && sigma_abs > 1e-6) {
    values.FS = allow / sigma_abs;
    values.allowable = allow;
  }

  // Stepped bar (multiple segments): solve each segment if present.
  if (Array.isArray(setup.segments)) {
    setup.segments.forEach((seg, i) => {
      const segA = barArea(seg);
      const segP = (seg.P != null ? seg.P : P_kN) * 1000;
      const segSigma = segA > 1e-9 ? segP / segA : 0;
      const idx = i + 1;
      values[`P_${idx}`] = segP / 1000;
      values[`A_${idx}`] = segA;
      values[`sigma_${idx}`] = segSigma;
      values[`sigma_abs_${idx}`] = Math.abs(segSigma);
      if (seg.diameter != null) values[`d_${idx}`] = seg.diameter;
    });
  }

  return {
    status: "determinate",
    values,
    unknowns: [],
  };
}
