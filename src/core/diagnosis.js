// diagnosis.js — what KIND of mistake a wrong answer was, so the game can
// work out in the background where a student is failing.
//
// Every mistake the game recognises (the likely-slip feedback, a wrong force
// on an FBD, a wrong equation line …) carries a `kind`. Each kind belongs to
// one of two AREAS:
//   math    working out the numbers: signs, sin/cos, algebra, rounding …
//   object  reading the physical situation: which forces act on the object,
//           which way they point, what a cable or a spring does …
// A wrong answer the game can't explain gets the kind "unexplained".
//
// This file knows no physics: it holds the general kinds, and each subject
// registers its own (see src/subjects/statics/index.js), the same way it
// registers its solvers.

export const AREAS = {
  math: { label: "Math errors", about: "Working out the numbers: signs, sin and cos, algebra, rounding." },
  object: { label: "Object errors", about: "Reading the situation: which forces act on the object, which way they point, what each part does." },
  unknown: { label: "Not identified", about: "Wrong answers that didn't match any known slip." },
};

const KINDS = {
  // math
  sign: { area: "math", label: "Signs (+ and −)" },
  trig: { area: "math", label: "Mixing up sin and cos" },
  algebra: { area: "math", label: "Algebra and arithmetic" },
  rounding: { area: "math", label: "Rounding too early" },
  calculator: { area: "math", label: "Calculator in radians" },
  vector: { area: "math", label: "Vector working (r = B − A, dividing by the length)" },
  // object
  missing: { area: "object", label: "Leaving out a force or part" },
  extra: { area: "object", label: "Adding a force or part that isn't there" },
  direction: { area: "object", label: "Wrong direction or turning sense" },
  concept: { area: "object", label: "Concept questions" },
  // neither
  unexplained: { area: "unknown", label: "Wrong answer, cause not identified" },
};

// A subject adds its own kinds: { weight: { area: "object", label: "…" }, … }.
export function registerErrorKinds(kinds) {
  for (const [id, k] of Object.entries(kinds)) {
    if (!AREAS[k.area]) throw new Error(`Error kind "${id}": unknown area "${k.area}"`);
    KINDS[id] = k;
  }
}

// { area, label } for a kind; an unknown kind counts as "unexplained".
export function errorKind(id) {
  return KINDS[id] || KINDS.unexplained;
}

export const isKnownKind = (id) => Object.prototype.hasOwnProperty.call(KINDS, id);
export const allKinds = () => ({ ...KINDS });
