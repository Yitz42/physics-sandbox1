// course.js — the Mechanics of Materials course: chapters and units, in teaching order.
// Built the same way as statics and controls. Chapters follow standard university
// mechanics of materials courses (Hibbeler, Beer & Johnston). Each unit teaches one
// concept with the six stages explore → predict → build → debug → concept check → solve,
// and units are numbered by chapter (e.g. Unit 1.1).
//
// The chapters match Hibbeler's (reading.js) chapter for chapter, as statics does, so Chapter 12
// here is the book's Chapter 12 (the page numbers chapters by their place in this list).
// A chapter's `units` lists unit folders (built units) and soon(...) entries:
// planned units, shown on the course page as "Coming soon".

import reading from "./reading.js";

// A planned unit: its title and one line on what it will teach.
const soon = (title, concept) => ({ title, concept, comingSoon: true });

const chapters = [
  {
    id: "stress",
    title: "Stress",
    units: [
      "normal-stress",    // Unit 1.1: Normal stress
      "shear-stress",     // Unit 1.2: Direct shear stress
      "bearing-stress",   // Unit 1.3: Bearing stress
      "allowable-stress", // Unit 1.4: Allowable stress and factor of safety

    ],
  },
  {
    id: "strain",
    title: "Strain",
    units: [
      soon("Normal strain", "$\\epsilon = \\Delta L / L_0$: deformation, elongation, and proportional stretch."),
      soon("Shear strain", "$\\gamma$: angular distortion and change in right angles under shear loading."),
    ],
  },
  {
    id: "properties",
    title: "Mechanical properties of materials",
    units: [
      soon("Stress-strain diagram", "Proportional limit, yield strength, ultimate tensile strength, and fracture."),
      soon("Hooke's law and Young's modulus", "$\\sigma = E\\epsilon$: elastic behavior, stiffness, and comparing materials."),
      soon("Poisson's ratio", "$\\nu = -\\epsilon_{\\text{lat}} / \\epsilon_{\\text{long}}$: lateral contraction and shear modulus $G = \\frac{E}{2(1+\\nu)}$."),
    ],
  },
  {
    id: "axial",
    title: "Axial load and deformation",
    units: [
      soon("Elastic axial deformation", "$\\delta = \\frac{PL}{AE}$: bar elongation under uniform and stepped loads."),
      soon("Statically indeterminate axial members", "Compatibility equations: displacement equations when statics alone is not enough."),
      soon("Thermal stress", "$\\delta_T = \\alpha \\Delta T L$: expansion, contraction and thermal stresses in constrained bars."),
    ],
  },
  {
    id: "torsion",
    title: "Torsion",
    units: [
      soon("Torsion of circular shafts", "$\\tau = \\frac{T\\rho}{J}$: shear stress distribution and polar moment of inertia $J$."),
      soon("Angle of twist", "$\\phi = \\frac{TL}{JG}$: rotation of circular shafts and power transmission."),
      soon("Statically indeterminate shafts", "Shafts fixed at both ends or stepped shafts with torque balance."),
    ],
  },
  {
    id: "bending",
    title: "Bending",
    units: [
      soon("The flexure formula", "$\\sigma = -\\frac{My}{I}$: bending stress in beams, neutral axis, and section modulus $S = I/c$."),
    ],
  },
  {
    id: "shear",
    title: "Transverse shear",
    units: [
      soon("Transverse shear stress", "$\\tau = \\frac{VQ}{It}$: horizontal and vertical shear in beams, first moment of area $Q$."),
      soon("Shear flow in built-up beams", "$q = \\frac{VQ}{I}$: spacing of nails, bolts and welds in composite members."),
    ],
  },
  {
    id: "combined",
    title: "Combined loadings",
    units: [
      soon("Thin-walled pressure vessels", "Hoop stress $\\sigma_1 = \\frac{pr}{t}$ and longitudinal stress $\\sigma_2 = \\frac{pr}{2t}$ in cylinders and spheres."),
      soon("Combined states of stress", "Superposition of axial, bending, torsional and transverse shear stresses at a point."),
    ],
  },
  {
    id: "transformation",
    title: "Stress transformation",
    units: [
      soon("Plane-stress transformation", "Stresses $\\sigma_{x'}$, $\\tau_{x'y'}$ on an inclined plane rotated by angle $\\theta$."),
      soon("Principal stresses and maximum shear", "Principal planes, principal stresses $\\sigma_1, \\sigma_2$, and maximum in-plane shear $\\tau_{\\max}$."),
      soon("Mohr's circle for stress", "Graphical representation of plane stress: center $(\\sigma_{\\text{avg}}, 0)$, radius $R$, and stress states."),
    ],
  },
  {
    id: "strain-transformation",
    title: "Strain transformation",
    units: [
      soon("Plane-strain transformation", "Strains on rotated axes, principal strains, and Mohr's circle for strain."),
      soon("Strain gauges and rosettes", "Finding the state of strain at a point from three gauge readings."),
    ],
  },
  {
    id: "design",
    title: "Design of beams and shafts",
    units: [
      soon("Beam design", "Choosing a section so both bending and shear stresses stay within their allowable values."),
      soon("Shaft design", "Sizing a shaft that carries bending and torsion together."),
    ],
  },
  {
    id: "deflection",
    title: "Deflection of beams",
    units: [
      soon("Beam deflection by integration", "$EI \\frac{d^2v}{dx^2} = M(x)$: slope and displacement curves from boundary conditions."),
      soon("Beam deflection by superposition", "Standard deflection formulas for point, distributed and moment loads."),
    ],
  },
  {
    id: "buckling",
    title: "Buckling of columns",
    units: [
      soon("Euler's buckling formula", "$P_{\\text{cr}} = \\frac{\\pi^2 EI}{(KL)^2}$: column stability, critical load, and effective length factor $K$."),
    ],
  },
];

export default {
  id: "materials",
  title: "Mechanics of Materials",
  subject: "materials",
  reading,
  description: "Stress, strain, axial deformation, torsion, bending, transverse shear, Mohr's circle and column buckling.",
  chapters,
  units: chapters.flatMap((c) => c.units.filter((u) => typeof u === "string")), // the built units, in order
};
