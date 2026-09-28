// allowable-stress.js — solver for allowable stress design and factor of safety (Unit 1.4).
//
// Unifies the three fundamental stresses from Chapter 1:
//   1. Normal tensile stress in the rod / bar:  σ = P / A_rod   ≤ σ_allow
//   2. Direct shear stress in the pin / bolt:    τ = V / A_pin   ≤ τ_allow  (V = P / n)
//   3. Bearing stress on the hole / plate:       σ_b = P / A_b   ≤ σ_b,allow (A_b = t · d_pin)
//
// Governing failure mode:
//   P_tension = σ_allow · A_rod
//   P_shear   = n · τ_allow · A_pin
//   P_bearing = σ_b,allow · (t · d_pin)
//   P_allow   = min(P_tension, P_shear, P_bearing)
//   FS        = min(FS_tension, FS_shear, FS_bearing)

export const PI = Math.PI;

export function solveAllowableStress(setup = {}) {
  const load = setup.load || {};
  const rod = setup.rod || {};
  const joint = setup.joint || {};

  // Applied load P in kN
  const P = load.P ?? 40; // kN
  const P_N = P * 1000;   // N

  // 1. Tension Member (Rod / Bar)
  const d_rod = rod.diameter ?? 22; // mm
  const A_rod = (PI / 4) * d_rod * d_rod; // mm²
  const sigma_allow = rod.allowableStress ?? 140; // MPa
  const sigma = A_rod > 0 ? P_N / A_rod : 0; // MPa
  const FS_tension = sigma > 1e-6 ? sigma_allow / sigma : 999;
  const P_tension_N = sigma_allow * A_rod; // N
  const P_tension = P_tension_N / 1000; // kN

  // 2. Pin Shear
  const n = joint.planes ?? (joint.type === "clevis" || joint.doubleShear ? 2 : 1);
  const d_pin = joint.pinDiameter ?? 18; // mm
  const A_pin = (PI / 4) * d_pin * d_pin; // mm²
  const tau_allow = joint.allowableShear ?? 80; // MPa
  const V_N = n > 0 ? P_N / n : P_N;
  const V = n > 0 ? P / n : P;
  const tau = A_pin > 0 ? V_N / A_pin : 0; // MPa
  const FS_shear = tau > 1e-6 ? tau_allow / tau : 999;
  const P_shear_N = n * tau_allow * A_pin; // N
  const P_shear = P_shear_N / 1000; // kN

  // 3. Plate Bearing
  const t_plate = joint.plateThickness ?? 12; // mm
  const A_b = t_plate * d_pin; // mm²
  const sigma_b_allow = joint.allowableBearing ?? 160; // MPa
  const sigma_b = A_b > 0 ? P_N / A_b : 0; // MPa
  const FS_bearing = sigma_b > 1e-6 ? sigma_b_allow / sigma_b : 999;
  const P_bearing_N = sigma_b_allow * A_b; // N
  const P_bearing = P_bearing_N / 1000; // kN

  // Overall allowable load and governing mode
  const P_allow = Math.min(P_tension, P_shear, P_bearing);
  const FS = Math.min(FS_tension, FS_shear, FS_bearing);

  let governing = "tension";
  if (P_shear <= P_tension && P_shear <= P_bearing) {
    governing = "shear";
  } else if (P_bearing <= P_tension && P_bearing <= P_shear) {
    governing = "bearing";
  }

  // Minimum required dimensions to support load P safely
  const d_rod_min = Math.sqrt((4 * P_N) / (PI * sigma_allow));
  const d_pin_min = Math.sqrt((4 * P_N) / (n * PI * tau_allow));
  const t_plate_min = P_N / (d_pin * sigma_b_allow);

  return {
    status: "determinate",
    values: {
      P,
      P_N,
      // Tension
      d_rod,
      A_rod,
      sigma,
      sigma_allow,
      FS_tension,
      P_tension,
      d_rod_min,
      // Shear
      n,
      d_pin,
      A_pin,
      V,
      V_N,
      tau,
      tau_allow,
      FS_shear,
      P_shear,
      d_pin_min,
      // Bearing
      t_plate,
      A_b,
      sigma_b,
      sigma_b_allow,
      FS_bearing,
      P_bearing,
      t_plate_min,
      // Overall
      P_allow,
      FS,
      governing,
    },
  };
}
