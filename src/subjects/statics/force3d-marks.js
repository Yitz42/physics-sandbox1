// force3d-marks.js — the marks on a 3D force (force3d-scene.js): the dashed box of its
// components, and its direction angles (α, β, γ, or an azimuth θ and elevation φ) drawn in space.

import { format } from "../../core/units.js";

const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];

// Points on the arc from direction a to direction b (unit vectors), radius r, round c.
function arcPoints(c, a, b, r, n = 18) {
  const th = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
  if (th < 1e-6) return [add3(c, scale3(a, r))];
  const out = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const ka = Math.sin((1 - t) * th) / Math.sin(th), kb = Math.sin(t * th) / Math.sin(th);
    out.push(add3(c, scale3(add3(scale3(a, ka), scale3(b, kb)), r)));
  }
  return out;
}

// The box of a force's components: dashed edges from its tip down to the x-y plane
// and across to the axes, and the three component arrows along the axes from its start.
export function componentBox(f, start, drawn, u, F, at, withValues) {
  const [dx, dy, dz] = drawn;
  const s = start;
  const P = (x, y, z) => at(add3(s, [x, y, z]));
  const out = [];
  const dash = (a, b) => out.push({ type: "line", from: a, to: b, style: "reference" });
  dash(P(dx, dy, dz), P(dx, dy, 0)); // down from the tip
  dash(P(dx, dy, 0), P(dx, 0, 0)); // across to the x axis
  dash(P(dx, dy, 0), P(0, dy, 0)); // and to the y axis
  dash(P(dx, dy, dz), P(0, 0, dz)); // over to the z axis
  const names = ["x", "y", "z"];
  [[dx, 0, 0], [0, dy, 0], [0, 0, dz]].forEach((c, i) => {
    if (Math.abs(c[i]) < 1e-9) return;
    const val = F * u[i];
    const sym = /^([A-Za-z])_\{?([^}]*)\}?$/.test(f.symbol) ? f.symbol.replace(/^([A-Za-z])_\{?([^}]*)\}?$/, `$1_{$2${names[i]}}`) : `${f.symbol}_${names[i]}`;
    out.push({ type: "arrow", id: `${f.id}.${names[i]}`, from: P(0, 0, 0), to: P(...c), role: "component", label: withValues ? `${sym} = ${format(val, "N")}` : sym });
  });
  return out;
}

// Direction angles drawn in space: α, β, γ from the axes to the force; or, for an
// azimuth and elevation, θ in the x-y plane (with the force's shadow F′ there) and φ up from it.
// Which angles to draw for force f: its own choice, else the picture's.
export const anglesFor = (setup, f) => (f.showAngles !== undefined ? f.showAngles : setup.showAngles);

export function angleMarks(want, start, u, r, at, reveal) {
  const out = [];
  const label = (name, sym, deg) => (want[name] === "ask" && !reveal ? `${sym} = ?` : `${sym} = ${format(deg, "deg")}`);
  const deg = (a, b) => (Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))) * 180) / Math.PI;
  const axesU = { alpha: [1, 0, 0], beta: [0, 1, 0], gamma: [0, 0, 1] };
  const syms = { alpha: "α", beta: "β", gamma: "γ" };
  for (const name of ["alpha", "beta", "gamma"]) {
    if (!want[name]) continue;
    out.push({ type: "curve", points: arcPoints(start, axesU[name], u, r * (name === "gamma" ? 0.8 : 1)).map(at), role: "component", label: label(name, syms[name], deg(axesU[name], u)), labelAway: at(start) });
  }
  if (want.theta || want.phi) {
    const flat = [u[0], u[1], 0];
    const L = Math.hypot(flat[0], flat[1]) || 1;
    const fu = [flat[0] / L, flat[1] / L, 0];
    // F′: the force's shadow in the x-y plane, as a faint line.
    out.push({ type: "line", from: at(start), to: at(add3(start, scale3(fu, r * 2.2))), style: "reference" });
    if (want.theta) out.push({ type: "curve", points: arcPoints(start, [1, 0, 0], fu, r).map(at), role: "component", label: label("theta", "θ", deg([1, 0, 0], fu)), labelAway: at(start) });
    if (want.phi) out.push({ type: "curve", points: arcPoints(start, fu, u, r * 1.5).map(at), role: "component", label: label("phi", "φ", deg(fu, u)), labelAway: at(start) });
  }
  return out;
}
