// course.js — the statics course: its chapters and units, in teaching order.
// Chapters follow the textbook's chapters (reading.js). Each unit teaches one
// concept, with the six stages explore → predict → build → debug →
// concept check → solve. Units are numbered by chapter: 1.1, 1.2, 2.1 …
//
// A chapter's `units` lists unit folders (built units) and soon(...) entries:
// planned units, shown on the course page as "Coming soon" so students can see
// the whole course. To build one: create its folder (unit.js and stage files)
// and put the folder name in place of its soon(...) entry.
// See docs/CURRICULUM.md for what each unit will teach.
import reading from "./reading.js"; // the textbook linked from each chapter

// A planned unit: its title and one line on what it will teach.
const soon = (title, concept) => ({ title, concept, comingSoon: true });

const chapters = [
  // 3D units come at the end of the chapter whose 2D ideas they build on.
  {
    id: "forces", title: "Forces and vectors",
    units: [
      "force-components", "cartesian-vectors",
      soon("Forces in 3D", "Forces with x, y and z components: $\\mathbf{F} = F_x\\,\\mathbf{i} + F_y\\,\\mathbf{j} + F_z\\,\\mathbf{k}$, and a force along a line in space."),
    ],
  },
  {
    id: "particles", title: "Equilibrium of a particle",
    units: [
      "cables", "springs", "pulleys",
      soon("Particle equilibrium in 3D", "$\\Sigma F_x = 0$, $\\Sigma F_y = 0$, $\\Sigma F_z = 0$: three equations for up to three unknown forces."),
    ],
  },
  {
    id: "moments", title: "Moments and static equivalence",
    units: [
      "moments", "varignon", "couples", "moving-forces", "equivalent-systems", "distributed-loads",
      soon("Moments in 3D", "The moment as a cross product, $\\mathbf{M}_O = \\mathbf{r} \\times \\mathbf{F}$, pointing along the axis it turns about."),
      soon("Moment about an axis", "How hard a force turns something about a given axis, like a door about its hinges."),
    ],
  },
  {
    id: "rigid-bodies", title: "Equilibrium of a rigid body",
    units: [
      "supports", "rigid-body-equilibrium",
      "equation-sets",
      "stability",
      "two-force-members",
      soon("Rigid body equilibrium in 3D", "Six equations, supports in space, and solving for their reactions."),
    ],
  },
  {
    id: "structures", title: "Structures",
    units: [
      "trusses",
      "zero-force-members",
      "truss-sections",
      "frames",
    ],
  },
  {
    id: "centroids", title: "Centroids",
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
      soon("Dry friction", "Friction holds up to $F = \\mu N$; at impending motion it reaches that limit."),
      soon("Tipping versus slipping", "Which happens first, and why."),
      soon("Wedges and belt friction", "Wedges, and how a rope wrapped around a post holds a big load."),
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
