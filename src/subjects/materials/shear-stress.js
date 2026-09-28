// shear-stress.js — solver for direct shear stress in pins, bolts, and lap joints (Unit 1.2).
//
// Governing equations:
//   Average shear stress:  τ = V / A
//   Shear force per plane: V = P / n  (n = 1 for single shear; n = 2 for double shear)
//   Pin cross-section:     A = (π / 4) · d²
//   In megapascals:        τ (MPa) = V (N) / A (mm²) = [P (N) / (n · A (mm²))]

export const PI = Math.PI;

export function pinArea(diameter) {
  const d = Math.max(0, diameter || 0);
  return (PI / 4) * d * d;
}

export function solveShearStress(setup = {}) {
  const joint = setup.joint || {};
  const load = setup.load || {};

  // Load P in kN
  const P = load.P ?? 24; // kN
  const P_N = P * 1000;   // N

  // Number of shear planes n:
  // Default to 2 for clevis/double-shear; 1 for single-shear lap joint
  const n = joint.planes ?? (joint.type === "clevis" || joint.doubleShear ? 2 : 1);

  // Pin diameter d in mm
  const d = joint.pinDiameter ?? joint.diameter ?? 20; // mm

  // Cross-sectional area of one shear plane in mm²
  const A = pinArea(d); // mm²

  // Total shear area resisting load P in mm²
  const A_total = n * A; // mm²

  // Shear force carried by each shear plane in kN and N
  const V = n > 0 ? P / n : P;
  const V_N = n > 0 ? P_N / n : P_N;

  // Average shear stress τ in MPa (N/mm²)
  const tau = A > 0 ? Math.abs(V_N) / A : 0; // MPa

  // Factor of safety and allowable stress (if specified)
  const tau_allow = joint.allowableStress ?? null;
  const FS = tau_allow && tau > 1e-6 ? tau_allow / tau : null;

  // Minimum required diameter to meet allowable shear stress (if specified)
  const d_min = tau_allow && tau_allow > 0 && n > 0
    ? Math.sqrt((4 * Math.abs(P_N)) / (n * PI * tau_allow))
    : null;

  return {
    status: "determinate",
    values: {
      P,
      P_N,
      n,
      d,
      A,
      A_total,
      V,
      V_N,
      tau,
      tau_allow,
      FS,
      d_min,
    },
  };
}
