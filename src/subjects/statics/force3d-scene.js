// force3d-scene.js — the picture for forces in 3D (Unit 2.3), drawn in perspective
// on the flat canvas (render/projection.js): named points, a pole and its cables, the
// ground, and each force as an arrow in space. The axes are a little x-y-z icon in the
// corner, as in the 2D pictures; faint dashed lines along the axes mark where angles
// and components are measured from.
//   setup.view3d: { yaw, pitch }  where it's looked at from (default: the textbook look)
//   setup.ground: [xmin, xmax, ymin, ymax]  the patch of the x-y plane drawn (gridded; default:
//                 round O and under everything); setup.gridStep: its grid spacing
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
const unit2 = (d) => { const m = Math.hypot(d[0], d[1]) || 1; return [d[0] / m, d[1] / m]; };

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

  // The coordinate axes: a little x-y-z icon in the corner, as in the 2D pictures
  // (agreed with the owner). Where an angle or a component is measured from an axis,
  // a faint dashed line along it through the force's point, as a 2D picture does.
  shapes.push({ type: "axes", dirs: { x: unit2(P.screenDir([1, 0, 0])), y: unit2(P.screenDir([0, 1, 0])), z: unit2(P.screenDir([0, 0, 1])) } });
  // A pole, cables, the named points.
  if (setup.pole) shapes.push({ type: "beam", points: setup.pole.map((n) => at(pointOf(setup, n))), width: 10 });
  for (const [a, b] of setup.cables || []) shapes.push({ type: "line", from: at(pointOf(setup, a)), to: at(pointOf(setup, b)), style: "cable" });
  for (const [name, p] of Object.entries(pts)) {
    shapes.push({ type: "point", at: at(p), label: name, style: "dot" });
    fixed.push(p);
  }

  // Forces whose components sliders set (setup.reach: the sliders' limits, N per axis):
  // room for the whole box they can reach, so the picture never rescales as they move.
  const kFixed = setup.fullScale ? size / setup.fullScale : null;
  if (setup.reach && kFixed) {
    const [rx, ry, rz] = setup.reach.map((n) => n * kFixed);
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) fixed.push([sx * rx, sy * ry, sz * rz]);
  }

  // The forces: arrows in space, all to one scale — the biggest 0.8 of an axis, or
  // setup.fullScale newtons to a whole axis (fixed, so a slider shows the size change).
  const vecs = (setup.forces || []).map((f) => ({ f, d: directionOf3(f, setup) })).filter((x) => !x.d.error);
  const sizeOf = (x) => x.d.size ?? x.f.magnitude;
  const k = setup.fullScale ? size / setup.fullScale : (0.8 * size) / Math.max(1e-9, ...vecs.map(sizeOf), ...(setup.resultant && v.R ? [v.R] : []));
  for (const { f, d } of vecs) {
    const start = f.at ? pointOf(setup, f.at) : f.dir && f.dir.from ? pointOf(setup, f.dir.from) : [0, 0, 0];
    const F = sizeOf({ f, d });
    const tip = add3(start, scale3(d.u, F * k));
    const asked = setup.hideMagnitude && !reveal;
    shapes.push({ type: "arrow", id: f.id, from: at(start), to: at(tip), role: "known", label: `${f.symbol} = ${asked ? "?" : format(F, "N")}` });
    // (The frame keeps room for the arrow at its longest — unless sliders set it: then
    // the box they can reach is already in, setup.reach.)
    fixed.push(start, ...(setup.reach ? [] : [add3(start, scale3(d.u, 0.8 * size))]));
    // Reference lines along the axes the picture measures from (dashed, unlabelled).
    const want = setup.showAngles || {};
    const refs = [];
    if (want.alpha || want.theta || shown(setup.showComponents)) refs.push([1, 0, 0]);
    if (want.beta || shown(setup.showComponents)) refs.push([0, 1, 0]);
    if (want.gamma || shown(setup.showComponents)) refs.push([0, 0, 1]);
    for (const e of refs) {
      const end = add3(start, scale3(e, (setup.reach ? 0.45 : 0.6) * size));
      shapes.push({ type: "line", from: at(start), to: at(end), style: "reference" });
      fixed.push(end);
    }
    if (shown(setup.showComponents)) shapes.push(...componentBox(f, start, scale3(d.u, F * k), d.u, F, at, reveal || setup.showComponents === "always"));
    if (setup.showAngles) shapes.push(...angleMarks(setup, f, start, d.u, 0.3 * size, at, reveal));
  }
  // The resultant, once found.
  if (setup.resultant && reveal && v.R > 0) {
    const R = [v["R.x"], v["R.y"], v["R.z"]];
    const start = setup.resultantAt ? pointOf(setup, setup.resultantAt) : [0, 0, 0];
    shapes.push({ type: "arrow", id: "R", from: at(start), to: at(add3(start, scale3(R, k))), role: "resultant", label: `F_R = ${format(v.R, "N")}` });
  }

  // The ground — the x-y plane — lightly filled with a grid on it, so the plane (and
  // what's above or below it) is easy to see (agreed with the owner). setup.ground sets
  // its extent; otherwise it's a patch round O under everything in the picture.
  // (With sliders, setup.reach: exactly the patch under the box they can reach, so
  // the floor doesn't make the picture any smaller.)
  const reachFloor = setup.reach && kFixed ? [-setup.reach[0] * kFixed, setup.reach[0] * kFixed, -setup.reach[1] * kFixed, setup.reach[1] * kFixed] : null;
  const [gx0, gx1, gy0, gy1] = setup.ground || reachFloor || floorAround(fixed, size);
  const corners = [[gx0, gy0, 0], [gx1, gy0, 0], [gx1, gy1, 0], [gx0, gy1, 0]];
  shapes.push({ type: "region", points: corners.map(at), tint: 0, alpha: 0.3, background: true });
  const step = setup.gridStep ?? (Math.max(gx1 - gx0, gy1 - gy0) > 5 ? 1 : 0.5);
  const first = (v) => Math.ceil(v / step - 1e-9) * step;
  const lines = [];
  for (let x = first(gx0); x <= gx1 + 1e-9; x += step) lines.push([at([x, gy0, 0]), at([x, gy1, 0])]);
  for (let y = first(gy0); y <= gy1 + 1e-9; y += step) lines.push([at([gx0, y, 0]), at([gx1, y, 0])]);
  shapes.push({ type: "grid", lines });
  fixed.push(...corners);

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

// A patch of the x-y plane under everything (and round O), a little bigger than it,
// its edges on a half-metre.
function floorAround(pts, size) {
  const pad = 0.15 * size, snap = (v, up) => (up ? Math.ceil(v * 2) : Math.floor(v * 2)) / 2;
  const xs = [0, ...pts.map((p) => p[0])], ys = [0, ...pts.map((p) => p[1])];
  return [snap(Math.min(...xs) - pad, false), snap(Math.max(...xs) + pad, true), snap(Math.min(...ys) - pad, false), snap(Math.max(...ys) + pad, true)];
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
