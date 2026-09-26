// directions.js — describing which way a force points, textbook style.
//
// Textbooks rarely say "210° counterclockwise from +x". They say
// "30° below the −x axis" and let the student work out the signs by looking.
// Stage files describe directions the same way:
//
//   "up" | "down" | "left" | "right"
//   { angle: 30, from: "-x", toward: "-y" }   30° measured from the −x axis,
//                                              rotating toward the −y axis
//   { slope: [-4, 3] }                         a 3-4-5 slope triangle: 4 left, 3 up
//
// From that description we compute:
//   • the unit vector (which way it really points),
//   • each component's factor for the equations (cos 30°, sin 30°, 4/5 …),
//     together with the "swapped" factor used to create sin/cos mistakes.

import { DEG, unit } from "../../core/vector.js";
import { sigFig } from "../../core/units.js";

const AXES = { "+x": [1, 0], "-x": [-1, 0], "+y": [0, 1], "-y": [0, -1] };
const WORDS = { up: [0, 1], down: [0, -1], left: [-1, 0], right: [1, 0] };

const isX = (axis) => axis === "+x" || axis === "-x";
const signOf = (axis) => (axis[0] === "-" ? -1 : 1);
const pretty = (axis) => axis.replace("-", "−"); // real minus sign for display

// Check a direction is written correctly; throws a helpful message if not.
function check(dir) {
  if (typeof dir === "string" && WORDS[dir]) return;
  if (dir && Array.isArray(dir.slope)) return;
  if (dir && AXES[dir.from] && AXES[dir.toward] && isX(dir.from) !== isX(dir.toward)) return;
  throw new Error(`Bad direction ${JSON.stringify(dir)}: "from" and "toward" must be one x-axis and one y-axis`);
}

// Unit vector for a direction. `radians: true` deliberately misreads the
// angle as radians — that is how we predict the "calculator in RAD mode" mistake.
export function directionVector(dir, { radians = false } = {}) {
  check(dir);
  if (typeof dir === "string") return WORDS[dir].slice();
  if (dir.slope) return unit(dir.slope);
  const a = radians ? dir.angle : dir.angle * DEG;
  const u = AXES[dir.from];
  const w = AXES[dir.toward];
  return [Math.cos(a) * u[0] + Math.sin(a) * w[0], Math.cos(a) * u[1] + Math.sin(a) * w[1]];
}

// The factor multiplying the magnitude in each component, as equation data.
// Returns { x, y }; each is null when that component is zero, otherwise
// { sign, factor } where factor = { tex, value, pre, alt } (see core/equations.js).
export function componentFactors(dir) {
  check(dir);
  if (typeof dir === "string") {
    const [vx, vy] = WORDS[dir];
    return {
      x: vx ? { sign: Math.sign(vx), factor: null } : null,
      y: vy ? { sign: Math.sign(vy), factor: null } : null,
    };
  }
  if (dir.slope) {
    const [dx, dy] = dir.slope;
    const h = Math.hypot(dx, dy);
    const frac = (n) => ({ tex: `\\tfrac{${sigFig(Math.abs(n), 4)}}{${sigFig(h, 4)}}`, value: Math.abs(n) / h, pre: true });
    const make = (n, other) => (n === 0 ? null : { sign: Math.sign(n), factor: { ...frac(n), alt: frac(other) } });
    return { x: make(dx, dy), y: make(dy, dx) };
  }
  const deg = sigFig(dir.angle, 4);
  const cos = { tex: `\\cos ${deg}^\\circ`, value: Math.cos(dir.angle * DEG) };
  const sin = { tex: `\\sin ${deg}^\\circ`, value: Math.sin(dir.angle * DEG) };
  // The component along the "from" axis gets cos; the other one gets sin.
  const along = { sign: signOf(dir.from), factor: { ...cos, pre: false, alt: sin } };
  const across = { sign: signOf(dir.toward), factor: { ...sin, pre: false, alt: cos } };
  return isX(dir.from) ? { x: along, y: across } : { x: across, y: along };
}

// Plain-language description, e.g. "30° above the +x axis".
export function describe(dir) {
  check(dir);
  if (typeof dir === "string") return `straight ${dir}`;
  if (dir.slope) {
    const [dx, dy] = dir.slope;
    const h = sigFig(Math.hypot(dx, dy), 3);
    return `slope ${Math.abs(dy)} ${dy >= 0 ? "up" : "down"} for ${Math.abs(dx)} ${dx >= 0 ? "right" : "left"} (hypotenuse ${h})`;
  }
  const deg = `${sigFig(dir.angle, 3)}°`;
  if (isX(dir.from)) return `${deg} ${dir.toward === "+y" ? "above" : "below"} the ${pretty(dir.from)} axis`;
  return `${deg} to the ${dir.toward === "+x" ? "right" : "left"} of the ${pretty(dir.from)} axis`;
}

// Turn a dragged vector back into textbook form: angle from the nearest
// horizontal (x) axis, rounded to `step` degrees.
export function fromVector(v, step = 1) {
  const from = v[0] >= 0 ? "+x" : "-x";
  const toward = v[1] >= 0 ? "+y" : "-y";
  const exact = Math.atan2(Math.abs(v[1]), Math.abs(v[0])) / DEG;
  return { angle: Math.round(exact / step) * step, from, toward };
}

// The same direction pointing the opposite way (used to build "reversed arrow" mistakes).
export function reverse(dir) {
  check(dir);
  if (typeof dir === "string") return { up: "down", down: "up", left: "right", right: "left" }[dir];
  if (dir.slope) return { slope: [-dir.slope[0], -dir.slope[1]] };
  const flip = (a) => (a[0] === "-" ? "+" : "-") + a[1];
  return { ...dir, from: flip(dir.from), toward: flip(dir.toward) };
}

// The same direction with sin and cos swapped: measure the angle from the
// other axis instead. Used to predict the classic sin/cos mistake.
export function swapTrig(dir) {
  check(dir);
  if (typeof dir === "string") return dir;
  if (dir.slope) {
    const [dx, dy] = dir.slope;
    return { slope: [Math.sign(dx || 1) * Math.abs(dy), Math.sign(dy || 1) * Math.abs(dx)] };
  }
  return { ...dir, from: dir.toward, toward: dir.from };
}
