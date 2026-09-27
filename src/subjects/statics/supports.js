// supports.js — what each kind of support does to a body (Unit 7 on).
//
// The rule: a support gives a REACTION for every motion it stops.
//   pin     stops sliding in x and y (lets the body turn)   → A_x, A_y
//   roller  stops motion into its surface only (it rolls)   → one push, ⟂ to the surface
//   smooth  a smooth surface: no grip, so the same as a roller → one push N, ⟂ to the surface
//   rough   a rough surface (Unit 9.1, friction): it grips, so it stops sliding along
//           it too                                          → a push N_A ⟂ to it, and
//           friction F_A along it (either way on an FBD; the answer's sign tells)
//   cable   can only pull, along itself                     → one pull T, toward its anchor
//   fixed   stops sliding AND turning                       → A_x, A_y and a moment M_A
//   link    a two-force member (a strut or tie, pinned at both ends, nothing
//           else on it): one force along its own line, pulling (tension, +)
//           or pushing (compression, −)                     → one force F along the link
//   none    nothing is attached here                        → no reactions
//
// A support in setup.supports:
//   { id: "A", type, at: [x, y],
//     normal: [0, 1]      unit vector from the support INTO the body: the way a
//                         roller or surface pushes (default up: support below the body)
//     direction           for a slanted roller/surface, its push direction in textbook
//                         form (e.g. { angle: 30, from: "+y", toward: "-x" })
//     anchor: [x, y]      a cable's or link's other end (a cable pulls toward it;
//                         a link's force is along it, + meaning tension: toward it)
//     symbol              name of a one-force reaction (default B_y, N_B, T_C …)
//     friction            a rough surface's assumed friction direction, a textbook
//                         word or form (default: along the surface, +x-ish) }
//
// Reaction directions are what a free-body diagram ASSUMES: pin and fixed
// components point +x and +y and moments counterclockwise (a negative answer
// means the other way); rollers and surfaces push; cables pull.

import { sub, mag, scale } from "../../core/vector.js";
import { directionVector, reverse } from "./directions.js";

export const SUPPORT_TYPES = ["pin", "roller", "smooth", "rough", "cable", "fixed", "link", "none"];

// Plain-language names, for messages.
export const SUPPORT_NAMES = { pin: "pin", roller: "roller", smooth: "smooth surface", rough: "rough surface", cable: "cable", fixed: "fixed support", link: "two-force member (link)", none: "no support" };

// A unit vector along an axis, as a textbook word ("up", "left" …), or null if slanted.
function wordFor(v) {
  const words = { up: [0, 1], down: [0, -1], right: [1, 0], left: [-1, 0] };
  return Object.keys(words).find((w) => Math.abs(words[w][0] - v[0]) < 1e-9 && Math.abs(words[w][1] - v[1]) < 1e-9) || null;
}

// Textbook-form direction from a vector: a word when it lies along an axis,
// otherwise a slope triangle (e.g. a cable from C to its anchor).
export function textbookDirection(v) {
  const m = mag(v);
  const u = scale(v, 1 / m);
  return wordFor(u) || { slope: [+v[0].toFixed(6), +v[1].toFixed(6)] };
}

export const normalOf = (s) => s.normal || [0, 1];

// The one-force reaction's direction for a roller, smooth surface or cable.
function pushDirection(s) {
  if (s.type === "cable" || s.type === "link") return s.direction || textbookDirection(sub(s.anchor, s.at));
  return s.direction || wordFor(normalOf(s)) || textbookDirection(normalOf(s));
}

// Default name of a one-force reaction: B_y (vertical roller), B_x, N_B, T_C.
function oneForceSymbol(s, direction) {
  if (s.symbol) return s.symbol;
  if (s.type === "cable") return `T_${s.id}`;
  if (s.type === "link") return `F_${s.id}`;
  if (s.type === "smooth") return `N_${s.id}`;
  if (direction === "up" || direction === "down") return `${s.id}_y`;
  if (direction === "left" || direction === "right") return `${s.id}_x`;
  return `N_${s.id}`;
}

// The reactions a support provides, as the FBD assumes them:
//   [{ id, symbol, support, at, moment?: true, direction, dir, either, kind }]
//   either: true  → either sense is fine on an FBD (the answer's sign tells)
//   kind: "component" | "push" | "pull" | "moment" | "link" (either sign: tension or compression)
export function reactionsOf(s) {
  const base = { support: s.id, supportType: s.type, at: s.at };
  const comp = (axis) => {
    const direction = axis === "x" ? "right" : "up";
    return { ...base, id: `${s.id}_${axis}`, symbol: `${s.id}_${axis}`, direction, dir: directionVector(direction), either: true, kind: "component" };
  };
  switch (s.type) {
    case "pin":
      return [comp("x"), comp("y")];
    case "fixed":
      return [comp("x"), comp("y"), { ...base, id: `M_${s.id}`, symbol: `M_${s.id}`, moment: true, sense: 1, either: true, kind: "moment" }];
    case "roller":
    case "smooth":
    case "cable":
    case "link": {
      const direction = pushDirection(s);
      const symbol = oneForceSymbol(s, direction);
      const kind = { cable: "pull", link: "link" }[s.type] || "push";
      return [{ ...base, id: symbol.replace(/[{}]/g, ""), symbol, direction, dir: directionVector(direction), either: s.type === "link", kind }];
    }
    case "rough": {
      // The push, as on a smooth surface, and friction along the surface: by default
      // the surface's direction turned a quarter clockwise from the push (level
      // ground: to the right), or the stage's choice (e.g. toward a wall).
      const n = normalOf(s);
      const push = s.direction || wordFor(n) || textbookDirection(n);
      const along = s.friction || wordFor([n[1], -n[0]]) || textbookDirection([n[1], -n[0]]);
      return [
        { ...base, id: `N_${s.id}`, symbol: `N_${s.id}`, direction: push, dir: directionVector(push), either: false, kind: "push" },
        { ...base, id: `F_${s.id}`, symbol: `F_${s.id}`, direction: along, dir: directionVector(along), either: true, kind: "friction" },
      ];
    }
    case "none":
      return [];
    default:
      throw new Error(`Unknown support type "${s.type}" (use ${SUPPORT_TYPES.join(", ")})`);
  }
}

// Every reaction on the body. setup.fbdEdits (debug stages) makes a deliberately
// WRONG free-body diagram: { remove: [ids], reverse: [ids], extra: [reactions] }.
export function allReactions(setup) {
  const edits = setup.fbdEdits || {};
  let list = (setup.supports || []).flatMap(reactionsOf);
  list = list.filter((r) => !(edits.remove || []).includes(r.id));
  list = list.map((r) => ((edits.reverse || []).includes(r.id) ? reversed(r) : r));
  for (const x of edits.extra || []) {
    const s = setup.supports.find((q) => q.id === x.support);
    const direction = x.direction || (x.moment ? null : "right");
    list.push({ support: x.support, at: s.at, either: true, kind: x.moment ? "moment" : "component", sense: 1, ...x, id: x.id, symbol: x.symbol || x.id, direction, dir: direction ? directionVector(direction) : null });
  }
  return list;
}

function reversed(r) {
  if (r.moment) return { ...r, sense: -r.sense };
  const direction = reverse(r.direction);
  return { ...r, direction, dir: directionVector(direction) };
}

// How many unknowns each support gives, by support id: { A: 2, B: 1 }.
export function countBySupport(setup) {
  const out = {};
  for (const s of setup.supports || []) out[s.id] = reactionsOf(s).length;
  return out;
}
