// reading.js — the textbook students can read alongside the game.
//
// Each unit page shows a "Read more" link to the matching chapter. We only
// LINK to the book (nothing is copied into the game), so its licence places no
// limits on how the game is used.
//
// To switch to a different book: change `book`, and the chapter for each unit
// below. Nothing else in the game needs to change. A unit may give its own
// `url` (e.g. a direct link to one chapter); otherwise the link goes to the
// book's front page.
export default {
  book: {
    title: "Engineering Statics: Open and Interactive",
    authors: "Daniel Baker and William Haynes",
    url: "https://engineeringstatics.org",
  },
  // unit folder → the chapter to read (chapter titles from the book's contents)
  units: {
    "01-force-vectors": { chapter: "Chapter 2: Forces and Other Vectors" },
    "02-particle-equilibrium": { chapter: "Chapter 3: Equilibrium of Particles" },
    "03-moments": { chapter: "Chapter 4: Moments and Static Equivalence" },
    "04-couples": { chapter: "Chapter 4: Moments and Static Equivalence" },
    "05-equivalent-systems": { chapter: "Chapter 4: Moments and Static Equivalence" },
    // Planned units (add them here when their folders exist):
    //   distributed loads → Ch 4;  supports, rigid bodies, determinacy → Ch 5
    //   trusses, frames and machines → Ch 6;  centroids → Ch 7
    //   internal forces, shear and moment diagrams → Ch 8;  friction → Ch 9
    //   moments of inertia → Ch 10
  },
};
