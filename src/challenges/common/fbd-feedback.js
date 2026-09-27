// fbd-feedback.js — checking a student's FBD arrow, and what to tell them
// when an arrow points the wrong way or a force is missing (used by fbd-tool.js).

import { dot } from "../../core/vector.js";

const SAME_DIRECTION = Math.cos((3 * Math.PI) / 180); // within 3°

// Is the placed arrow (a direction, or a moment's sense) the right way round?
// Where the sense doesn't matter (f.either), both ways along the right line count.
export function sameWay(f, v) {
  if (f.moment) return f.either || v === (f.sense || 1);
  const d = dot(v, f.dir);
  return d >= SAME_DIRECTION || (f.either && d <= -SAME_DIRECTION);
}

export function wrongDirectionText(f) {
  if (f.kind === "cable" || f.kind === "pull") return "A cable can only **pull**: its arrow points away from the body, along the cable.";
  if (f.kind === "spring") return "A stretched spring **pulls**: its arrow points away from the point, along the spring.";
  if (f.kind === "push") return "A roller or a smooth surface can only **push** on the body, perpendicular to the surface.";
  if (f.kind === "component") return "A support's reaction components act along x and y. Point each one along its axis (either way is fine: a negative answer means the other way).";
  if (f.kind === "weight") return "Weight always points **straight down**, toward the Earth.";
  return "One arrow points the wrong way. Compare each arrow's direction with the picture.";
}

export function missingText(f) {
  if (f.kind === "weight" && f.body) return "A force is missing. The body has mass: what does gravity do to it?";
  if (f.kind === "weight") return "A force is missing. What does gravity do to the hanging object?";
  if (f.kind === "cable") return "A force is missing. Every cable attached to the point pulls on it.";
  if (f.kind === "spring") return "A force is missing. The spring attached to the point pulls on it too.";
  if (["component", "push", "pull", "moment"].includes(f.kind)) return "A reaction is missing. For each support ask: which motions does it stop? It pushes or pulls for each direction it stops, and gives a moment if it stops turning.";
  return "A force is missing. Look at everything touching or pulling on the point.";
}
