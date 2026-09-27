// course.js — the statics course: its chapters and units, in teaching order.
// Chapters follow the textbook's chapters (reading.js). Each unit teaches one
// concept, with the six stages explore → predict → build → debug →
// concept check → solve. Units are numbered by chapter: 1.1, 1.2, 2.1 …
// To add a unit: create its folder (with unit.js and stage files) and list it
// in its chapter here. See docs/CURRICULUM.md for the full plan.
import reading from "./reading.js"; // the textbook linked from each chapter

const chapters = [
  { id: "forces", title: "Forces and vectors", units: ["force-components", "cartesian-vectors"] },
  { id: "particles", title: "Equilibrium of a particle", units: ["cables", "springs", "pulleys"] },
  { id: "moments", title: "Moments and static equivalence", units: ["moments", "varignon", "couples", "moving-forces", "equivalent-systems"] },
];

export default {
  id: "statics",
  title: "Statics",
  subject: "statics",
  reading,
  description: "Forces as vectors, equilibrium of a particle, moments, couples and equivalent systems.",
  chapters,
  units: chapters.flatMap((c) => c.units), // every unit, in order
};
