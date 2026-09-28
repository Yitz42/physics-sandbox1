// bearing-stress.js — solver for bearing stress in pinned and bolted connections (Unit 1.3).
//
// Governing equations (Hibbeler §1.4, Beer & Johnston §1.5):
//   Average bearing stress:  σ_b = P / A_b
//   Projected bearing area:  A_b = t · d
//   where:
//     P = bearing force transmitted by the pin to the plate (kN or N)
//     t = plate thickness (mm)
//     d = pin / bolt diameter (mm)
//   In megapascals:          σ_b (MPa) = P (N) / A_b (mm²) = [P (N) / (t · d)]

export function bearingArea(thickness, diameter) {
  const t = Math.max(0, thickness || 0);
  const d = Math.max(0, diameter || 0);
  return t * d;
}

export function solveBearingStress(setup = {}) {
  const joint = setup.joint || {};
  const load = setup.load || {};

  // Load P in kN
  const P = load.P ?? 30; // kN
  const P_N = P * 1000;   // N

  // Plate thickness t in mm
  const t = joint.plateThickness ?? joint.thickness ?? joint.t ?? 12; // mm

  // Pin diameter d in mm
  const d = joint.pinDiameter ?? joint.diameter ?? joint.d ?? 20; // mm

  // Projected bearing area A_b in mm²: rectangle of dimensions t × d
  const A_b = bearingArea(t, d); // mm²

  // Cylindrical contact surface area (for diagnosis of common mistakes): (π / 2) · d · t
  const A_cyl = (Math.PI / 2) * d * t;

  // Pin shear cross-section (for diagnosis of common mistakes): (π / 4) · d²
  const A_pin = (Math.PI / 4) * d * d;

  // Average bearing stress σ_b in MPa (N/mm²)
  const sigma_b = A_b > 0 ? Math.abs(P_N) / A_b : 0; // MPa

  // Allowable bearing stress and factor of safety (if specified)
  const sigma_allow = joint.allowableStress ?? joint.allowableBearingStress ?? null;
  const FS = sigma_allow && sigma_b > 1e-6 ? sigma_allow / sigma_b : null;

  // Minimum required thickness to meet allowable bearing stress
  const t_min = sigma_allow && sigma_allow > 0 && d > 0
    ? Math.abs(P_N) / (d * sigma_allow)
    : null;

  // Minimum required pin diameter to meet allowable bearing stress
  const d_min = sigma_allow && sigma_allow > 0 && t > 0
    ? Math.abs(P_N) / (t * sigma_allow)
    : null;

  // Maximum allowable load P_max in kN
  const P_max = sigma_allow && sigma_allow > 0
    ? (A_b * sigma_allow) / 1000
    : null;

  return {
    status: "determinate",
    values: {
      P,
      P_N,
      t,
      d,
      A_b,
      A_cyl,
      A_pin,
      sigma_b,
      sigma_allow,
      FS,
      t_min,
      d_min,
      P_max,
    },
  };
}
