// force3d-scene.js — the picture for forces in 3D (Unit 2.3), drawn in perspective
// on the flat canvas (render/projection.js): the x, y and z axes from O, named points,
// a pole and its cables, the ground, and each force as an arrow in space.
//   setup.view3d: { yaw, pitch }  where it's looked at from (default: the textbook look)
//   setup.ground: [xmin, xmax, ymin, ymax]  a faint patch of the x-y plane (the ground)
//   setup.pole: ["O", "A"]  a post between two points;  setup.cables: [["A", "B"], …]
//   setup.showComponents: the box of F_x, F_y, F_z (dashed) and their arrows — or
//     "reveal": once the answer is shown
//   setup.showAngles: { alpha, beta, gamma, theta, phi } each "given" (its number) or
//     "ask" ("?" until revealed) — direction angles drawn in space
//   setup.hideMagnitude: the force's size is asked for ("F = ?" until revealed)
// Each force starts at its point (f.at, a point name; along a line: its first point;
// else O). The coordinates of the named points are listed in a key.

import { format } from "../../core/units.js";
import { projector } from "../../render/projection.js";
import { solveForce3d, pointOf, directionOf3 } from "./force3d.js";

const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale3 = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const nice = (v) => format(v, "").replace(/^-/, "−");

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

export function force3dScene(setup, result, opts = {}) {
  const res = result || solveForce3d(setup);
  const v = res.values;
  const P = projector(setup.view3d);
  const at = P.at;
  const pts = setup.points || {};
  const reveal = !!opts.reveal;
  const shown = (mode) => mode === true || mode === "always" || (mode === "reveal" && reveal);
  const coords = Object.values(pts);
  const size = setup.axisLength ?? Math.max(3, ...coords.flatMap((p) => p.map((c) => Math.abs(c)))) * 1.1;
  const shapes = [];
  const fixed = []; // points (3D) that set the frame: they don't move when numbers change

  // The ground, the axes (with a short faint stub on the negative side where points go).
  if (setup.ground) {
    const [x0, x1, y0, y1] = setup.ground;
    const corners = [[x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0]];
    shapes.push({ type: "region", points: corners.map(at), tint: 0, alpha: 0.35 });
    fixed.push(...corners);
  }
  const axes = [[1, 0, 0, "x"], [0, 1, 0, "y"], [0, 0, 1, "z"]];
  axes.forEach(([a, b, c, name], i) => {
    const e = [a, b, c];
    const neg = Math.min(0, ...coords.map((p) => p[i]));
    if (neg < -1e-9) shapes.push({ type: "line", from: at(scale3(e, neg - 0.15 * size)), to: at([0, 0, 0]), style: "reference" });
    shapes.push({ type: "arrow", id: `axis-${name}`, from: at([0, 0, 0]), to: at(scale3(e, size)), role: "axis", label: name });
    fixed.push(scale3(e, size), scale3(e, Math.min(0, neg - 0.15 * size)));
  });

  // A pole, cables, the named points.
  if (setup.pole) shapes.push({ type: "beam", points: setup.pole.map((n) => at(pointOf(setup, n))), width: 10 });
  for (const [a, b] of setup.cables || []) shapes.push({ type: "line", from: at(pointOf(setup, a)), to: at(pointOf(setup, b)), style: "cable" });
  for (const [name, p] of Object.entries(pts)) {
    shapes.push({ type: "point", at: at(p), label: name, style: "dot" });
    fixed.push(p);
  }

  // The forces: arrows in space, all to one scale (the biggest 0.55 of the axes).
  const vecs = (setup.forces || []).map((f) => ({ f, d: directionOf3(f, setup) })).filter((x) => !x.d.error);
  const sizeOf = (x) => x.d.size ?? x.f.magnitude;
  const k = (0.55 * size) / Math.max(1e-9, ...vecs.map(sizeOf), ...(setup.resultant && v.R ? [v.R] : []));
  for (const { f, d } of vecs) {
    const start = f.at ? pointOf(setup, f.at) : f.dir && f.dir.from ? pointOf(setup, f.dir.from) : [0, 0, 0];
    const F = sizeOf({ f, d });
    const tip = add3(start, scale3(d.u, F * k));
    const asked = setup.hideMagnitude && !reveal;
    shapes.push({ type: "arrow", id: f.id, from: at(start), to: at(tip), role: "known", label: `${f.symbol} = ${asked ? "?" : format(F, "N")}` });
    fixed.push(add3(start, scale3(d.u, 0.55 * size)));
    if (shown(setup.showComponents)) shapes.push(...componentBox(f, start, scale3(d.u, F * k), d.u, F, at, reveal || setup.showComponents === "always"));
    if (setup.showAngles) shapes.push(...angleMarks(setup, f, start, d.u, 0.28 * size, at, reveal));
  }
  // The resultant, once found.
  if (setup.resultant && reveal && v.R > 0) {
    const R = [v["R.x"], v["R.y"], v["R.z"]];
    const start = setup.resultantAt ? pointOf(setup, setup.resultantAt) : [0, 0, 0];
    shapes.push({ type: "arrow", id: "R", from: at(start), to: at(add3(start, scale3(R, k))), role: "resultant", label: `F_R = ${format(v.R, "N")}` });
  }

  // The key: each named point's coordinates.
  const named = Object.entries(pts).filter(([n]) => n !== "O");
  if (named.length && setup.showCoords !== false) shapes.push({ type: "note", lines: named.map(([n, p]) => `${n} (${p.map(nice).join(", ")}) m`) });

  // The frame: round the fixed geometry, with room for labels.
  const flat = fixed.map(at);
  const xs = flat.map((p) => p[0]), ys = flat.map((p) => p[1]);
  const m = 0.14 * size;
  shapes.push({ type: "frame", frame: { xmin: Math.min(...xs) - m, xmax: Math.max(...xs) + m, ymin: Math.min(...ys) - m, ymax: Math.max(...ys) + m } });
  return shapes;
}

// The box of a force's components: dashed edges from its tip down to the x-y plane
// and across to the axes, and the three component arrows along the axes from its start.
function componentBox(f, start, drawn, u, F, at, withValues) {
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
function angleMarks(setup, f, start, u, r, at, reveal) {
  const want = setup.showAngles;
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
