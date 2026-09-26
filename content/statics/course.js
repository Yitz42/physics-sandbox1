// course.js — the statics course: its units, in teaching order.
// To add a unit: create its folder (with unit.js and stage files) and list it here.
// See docs/CURRICULUM.md for the full plan.
import reading from "./reading.js"; // the textbook linked from each unit page

export default {
  id: "statics",
  title: "Statics",
  subject: "statics",
  reading,
  description: "Forces as vectors, equilibrium of a particle, moments, couples and equivalent systems.",
  units: [
    "01-force-vectors",
    "02-particle-equilibrium",
    "03-moments",
    "04-couples",
    "05-equivalent-systems",
  ],
};
