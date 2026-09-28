// course.js — the statics course: its chapters and units, in teaching order.
// Chapters follow the textbook's chapters (reading.js). Each unit teaches one
// concept, with the six stages explore → predict → build → debug →
// concept check → solve. Units are numbered by chapter: 2.1, 2.2, 3.1 … (the chapter
// number is the textbook's).
//
// A chapter's `units` lists unit folders (built units) and soon(...) entries:
// planned units, shown on the course page as "Coming soon" so students can see
// the whole course. To build one: create its folder (unit.js and stage files)
// and put the folder name in place of its soon(...) entry.
// See docs/CURRICULUM.md for what each unit will teach.
import reading from "./reading.js"; // the textbook linked from each chapter

// A planned unit: its title and one line on what it will teach.
const soon = (title, concept) => ({ title, concept, comingSoon: true });

// The chapters match the textbook's chapter for chapter (agreed with the owner),
// so Chapter 5 here is the book's Chapter 5, and unit 5.2 is read with it.
const chapters = [
  // 3D units come at the end of the chapter whose 2D ideas they build on.
  {
    id: "intro", title: "Introduction to statics",
    units: [
      soon("Newton's laws and units", "Newton's three laws, SI units (m, kg, s, N) and why $W = mg$."),
      soon("Solving a statics problem", "The steps every problem follows: a sketch, the free-body diagram, the equations, the answer and a check."),
    ],
  },
  {
    id: "forces", title: "Forces and other vectors",
    units: [
      "force-components", "cartesian-vectors",
      "forces-3d",
      "vector-challenge", // the chapter's challenge unit: harder problems mixing all three
    ],
  },
  {
    id: "particles", title: "Equilibrium of particles",
    units: [
      "cables", "springs", "pulleys",
      "particles-3d",
      "particle-challenge", // the chapter's challenge unit: harder problems mixing its units with Chapter 2
    ],
  },
  {
    id: "moments", title: "Moments and static equivalence",
    units: [
      "moments", "varignon", "couples", "moving-forces", "equivalent-systems", "distributed-loads",
      "moments-3d",
      "moment-about-axis",
    ],
  },
  {
    id: "rigid-bodies", title: "Rigid body equilibrium",
    units: [
      "supports", "rigid-body-equilibrium",
      "equation-sets",
      "stability",
      "two-force-members",
      soon("Rigid body equilibrium in 3D", "Six equations, supports in space, and solving for their reactions."),
    ],
  },
  {
    id: "structures", title: "Equilibrium of structures",
    units: [
      "trusses",
      "zero-force-members",
      "truss-sections",
      "frames",
    ],
  },
  {
    id: "centroids", title: "Centroids and centers of gravity",
    units: [
      "centroids",
      "holes",
    ],
  },
  {
    id: "internal-forces", title: "Internal forces",
    units: [
      "internal-forces",
      "shear-moment-diagrams",
      "shear-moment-equations",
    ],
  },
  {
    id: "friction", title: "Friction",
    units: [
      "dry-friction",
      "tipping",
      "wedges-belts",
    ],
  },
  {
    id: "inertia", title: "Moments of inertia",
    units: [
      soon("Area moments of inertia", "$I = \\int y^2\\,dA$ and the parallel axis theorem: why I-beams are so stiff."),
    ],
  },
];

export default {
  id: "statics",
  title: "Statics",
  subject: "statics",
  reading,
  description: "The whole of an intro statics course, chapter by chapter: forces, equilibrium, moments, structures, friction and more.",
  chapters,
  units: chapters.flatMap((c) => c.units.filter((u) => typeof u === "string")), // the built units, in order
};
