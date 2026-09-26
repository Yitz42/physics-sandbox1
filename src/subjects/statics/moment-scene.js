// moment-scene.js — the picture for moment problems (Unit 3).
//
// Draws the body (wrench, bracket, plank), the point O (with a pivot for a
// seesaw), each force at the point where it acts, position dimensions, and —
// when asked — each force's line of action with its moment arm d, plus a
// curved arrow showing the total moment M_O and which way it turns.

import { add, sub, scale, mag, unit, angleDeg } from "../../core/vector.js";
import { format } from "../../core/units.js";
import { magnitudeOf, directionOf } from "./particle.js";
import { angleMarks } from "./particle-scene.js";
import { forcePoint, armOf, armAngle } from "./moment.js";
import { momentShadow } from "./moment-tools.js";

// Overall size of the body, so arrows and boxes scale with the picture.
function sizeOf(setup) {
  const pts = [setup.about.at, ...((setup.body && setup.body.points) || [])];
  let s = 0;
  for (const a of pts) for (const b of pts) s = Math.max(s, mag(sub(a, b)));
  return s || 1;
}

// Picture metres per newton (fixed by setup.forceScale on drag-able stages).
export function momentLengthPerNewton(setup) {
  if (setup.forceScale) return 1 / setup.forceScale;
  const maxF = Math.max(1, ...setup.forces.map(magnitudeOf).filter((v) => v != null));
  // The biggest force is drawn this fraction of the body's size (stages can change it).
  return ((setup.arrowFraction ?? 0.4) * sizeOf(setup)) / maxF;
}

// Where an unknown-position force is drawn before it's solved (faint, "?").
function placeholder(setup, f) {
  return add(setup.about.at, scale(f.along.dir, f.along.placeholder ?? 0.6 * sizeOf(setup) / 2));
}

// opts: { reveal, arms (always show moment arms), hideMoment, guesses }
export function momentScene(setup, result, opts = {}) {
  const O = setup.about.at;
  const vals = result ? result.values : {};
  const size = sizeOf(setup);
  const k = momentLengthPerNewton(setup);
  const balance = setup.analysis === "balance";
  const shapes = [{ type: "axes" }];
  // The body: a beam, or (body.kind "wrench") a wrench whose ring is on the bolt at O.
  if (setup.body) {
    const pts = setup.body.points;
    shapes.push(setup.body.kind === "wrench" ? { type: "wrench", from: pts[0], to: pts[pts.length - 1] } : { type: "beam", points: pts });
  }
  if (setup.listValues) shapes.push({ type: "listValues" }); // every force's value in the corner list
  if (setup.about.pivot) shapes.push({ type: "pivot", at: O });

  setup.forces.forEach((f, i) => {
    const solved = forcePoint(setup, f, opts.reveal ? vals : {});
    const ghost = !solved; // unknown position, not revealed yet
    const P = solved || placeholder(setup, f);
    const F = magnitudeOf(f);
    const u = directionOf(f);
    const len = Math.max(0.12 * size, F * k);
    if (f.kind === "weight") {
      const b = setup.boxSize ?? 0.12 * size;
      shapes.push({ type: "box", id: f.id, at: add(P, [0, b / 2 + 0.02 * size]), w: b, h: b, label: `${+f.mass.toFixed(2)} kg`, alpha: ghost ? 0.35 : 1, dashed: ghost });
    }
    shapes.push({ type: "arrow", id: f.id, from: P, to: add(P, scale(u, len)), label: `${f.symbol} = ${format(F, "N")}`, role: ghost ? "unknown" : "known", alpha: ghost ? 0.5 : undefined });
    if (f.kind !== "weight") shapes.push(...angleMarks(f, P, len, i));
    if (f.pointLabel) shapes.push({ type: "point", at: P, label: f.pointLabel, style: "dot" });

    // Line of action and moment arm d (the key idea of this unit).
    // (A plank loaded by weights can switch these off: setup.hideArms — its
    // moment arms are just the distances along the plank, already dimensioned.)
    if (!ghost && !balance && !setup.hideArms && (opts.arms || opts.reveal)) {
      const a = armOf(setup, f, P);
      // The line of action belongs to the force, so it's dashed in the force's colour.
      shapes.push({ type: "line", from: add(P, scale(u, -0.45 * size)), to: add(P, scale(u, 0.45 * size)), style: "action" });
      if (a.d > 1e-6) {
        const angled = Math.abs(a.rLen - a.d) > 1e-6; // force not at 90° to OA
        const dSide = Math.sign(a.perNewton) || 1; // which side of OA the moment arm lies on
        if (angled) {
          // How d is found. The picture only gets short labels (r, φ, d); the
          // numbers go in a colour-coded key in a free corner, so it stays readable.
          const phi = armAngle(setup, f, P);
          const toO = sub(O, P);
          const along = toO[0] * u[0] + toO[1] * u[1] >= 0 ? u : scale(u, -1); // the line's half that leans toward O
          const name = setup.forces.length > 1 ? ` (${f.symbol})` : "";
          shapes.push({ type: "dim", from: O, to: P, label: "r", dashed: true, labelSide: dSide });
          shapes.push({ type: "arc", center: P, r: Math.min(0.3 * a.rLen, 0.25 * size), start: angleDeg(toO), end: angleDeg(along), label: "φ" });
          shapes.push({ type: "note", lines: [
            { text: `d${name} = r sin φ = ${format(a.d, "m")}`, role: "arm" },
            { text: `r = OA = ${format(a.rLen, "m")}` },
            { text: `φ = ${phi.toFixed(1)}° (between r and F)` },
          ] });
        }
        shapes.push({ type: "dim", id: f.id, from: O, to: a.foot, role: "arm", label: angled ? "d" : `d = ${format(a.d, "m")}`, labelSide: -dSide });
        shapes.push({ type: "rightangle", at: a.foot, u, v: unit(sub(O, a.foot)), role: "arm" });
      }
    }
  });

  // Position dimensions from O to where a force acts:
  //   { force: "W_A", offset: -0.4 }            horizontal distance, drawn at y = O.y + offset
  //   { force: "F", axis: "y", offset: -0.12 }  vertical distance, drawn at x = O.x + offset
  for (const d of setup.dims || []) {
    const f = setup.forces.find((x) => x.id === d.force);
    const P = forcePoint(setup, f, opts.reveal ? vals : {}) || placeholder(setup, f);
    const known = !!(f.at || opts.reveal);
    const off = d.offset ?? -0.08 * size;
    const i = d.axis === "y" ? 1 : 0;
    const label = known ? format(Math.abs(P[i] - O[i]), "m") : `${f.posSymbol} = ?`;
    shapes.push(d.axis === "y"
      ? { type: "dim", from: [O[0] + off, O[1]], to: [O[0] + off, P[1]], label, labelSide: -1 }
      : { type: "dim", from: [O[0], O[1] + off], to: [P[0], O[1] + off], label, labelSide: -1 });
  }

  // The total moment about O: a curved arrow showing which way it turns.
  // (opts.hideMoment keeps it hidden until reveal, when M_O is the answer.)
  if (result && (opts.reveal || (opts.arms && !opts.hideMoment))) {
    const M = vals.M;
    if (balance) {
      shapes.push({ type: "text", at: add(O, [0, 0.26 * size]), text: "ΣM_O = 0: balanced" });
    } else if (Math.abs(M) > 1e-9) {
      const sense = M > 0 ? "counterclockwise" : "clockwise";
      shapes.push({ type: "moment", center: O, sense: Math.sign(M), role: "resultant", label: `M_O = ${M.toFixed(1)} N·m (${sense})` });
    } else {
      shapes.push({ type: "text", at: add(O, [0, 0.26 * size]), text: "M_O = 0" });
    }
  }

  if (opts.guesses) shapes.push(...momentShadow(setup, result, opts.guesses, { k, size }));
  shapes.push({ type: "point", at: O, label: setup.about.label || "O", style: "ring" });
  return shapes;
}
