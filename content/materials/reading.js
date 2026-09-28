// reading.js — textbook reference for the Mechanics of Materials course.
//
// Follows standard mechanics of materials textbooks:
//   R. C. Hibbeler, "Mechanics of Materials" (10th ed.)
//   Beer, Johnston, DeWolf, Mazurek, "Mechanics of Materials" (8th ed.)

export default {
  book: {
    title: "Mechanics of Materials, 10th edition",
    authors: "R. C. Hibbeler",
    url: null, // not free online: students use their own copy
    free: { title: "Mechanics of Materials (LibreTexts)", url: "https://eng.libretexts.org/Bookshelves/Civil_Engineering/Book%3A_Mechanics_of_Materials_(Muralikrishnan)" },
  },
  chapters: {
    stress: { chapter: "Chapter 1: Stress" },
    strain: { chapter: "Chapter 2: Strain" },
    properties: { chapter: "Chapter 3: Mechanical Properties of Materials" },
    axial: { chapter: "Chapter 4: Axial Load and Deformation" },
    torsion: { chapter: "Chapter 5: Torsion" },
    bending: { chapter: "Chapter 6: Pure Bending" },
    shear: { chapter: "Chapter 7: Transverse Shear" },
    combined: { chapter: "Chapter 8: Combined Loadings" },
    transformation: { chapter: "Chapter 9: Stress Transformation" },
    deflection: { chapter: "Chapter 10: Deflection of Beams" },
    buckling: { chapter: "Chapter 11: Buckling of Columns" },
  },
};
