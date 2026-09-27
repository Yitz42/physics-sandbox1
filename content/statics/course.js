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
  { id: "forces", title: "Forces and vectors", units: ["force-components", "cartesian-vectors"] },
  { id: "particles", title: "Equilibrium of a particle", units: ["cables", "springs", "pulleys"] },
  {
    id: "moments", title: "Moments and static equivalence",
    units: [
      "moments", "varignon", "couples", "moving-forces", "equivalent-systems",
      soon("Distributed loads", "A load spread along a beam is replaced by one force: its area, acting at its centroid."),
    ],
  },
  {
    id: "rigid-bodies", title: "Equilibrium of a rigid body",
    units: [
      soon("Supports and free-body diagrams", "Each kind of support — roller, pin, fixed, cable, smooth surface — pushes or pulls in its own way."),
      soon("Equilibrium of a rigid body", "$\\Sigma F_x = 0$, $\\Sigma F_y = 0$ and $\\Sigma M = 0$, and how to choose a smart point for moments."),
      soon("Alternative equation sets", "Two moment equations plus one force equation — and when that works."),
      soon("Stability and determinacy", "Too few supports and it moves; too many and equilibrium can't find the forces."),
      soon("Two-force and three-force members", "A two-force member pulls or pushes along its own line; three forces must meet at a point."),
    ],
  },
  {
    id: "structures", title: "Structures",
    units: [
      soon("Trusses: method of joints", "Pin-jointed members in pure tension or compression, solved joint by joint."),
      soon("Zero-force members", "Spot the members that carry no force, just by looking, before solving."),
      soon("Trusses: method of sections", "Cut through the truss and find up to three member forces at once."),
      soon("Frames and machines", "Take multi-part structures apart into separate free-body diagrams."),
    ],
  },
  {
    id: "centroids", title: "Centroids",
    units: [
      soon("Centroids and center of gravity", "Where a shape's weight acts, found from simple pieces."),
      soon("Composite shapes with holes", "A hole counts as negative area."),
    ],
  },
  {
    id: "internal-forces", title: "Internal forces",
    units: [
      soon("Internal forces at a point", "Cut a beam: the cut face carries a normal force N, a shear V and a moment M."),
      soon("Shear and moment diagrams", "How V and M change along a beam, and where the biggest moment is."),
      soon("V(x) and M(x) equations", "Write the shear and moment as equations for each part of the beam."),
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
  {
    id: "statics-3d", title: "Statics in 3D",
    units: [
      soon("3D forces and particle equilibrium", "Forces with x, y and z components, and $\\Sigma \\mathbf{F} = 0$ in space."),
      soon("Moments in 3D", "The moment as a cross product, and the moment about an axis."),
      soon("3D rigid body equilibrium", "Six equations, supports in space, and solving for their reactions."),
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
