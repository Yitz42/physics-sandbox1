# Picture rules (agreed with the owner)

How every picture is drawn: arrows, labels, supports, dimensions, angles, and the object-boundaries rule.
Read this before changing anything in src/render/ or a subject's *-scene.js, or adding a picture.
Every picture is checked automatically (tests/content/pictures.test.js) and can be looked at in the gallery (#/gallery).

- Picture rules (agreed with the owner): an arrow pushing on a body ends ON its
  surface and is labelled at its outer end; other arrows start exactly at their
  point and are labelled just past the tip, in line (below a downward arrow).
  A resultant (F_R) is labelled at its top. Point and support letters sit as
  close to their point as they can (below first, else right beside it). Angle
  numbers sit just outside the arc, inside the angle next to its reference line,
  which is extended past the number. Dimension values sit IN their line (with a
  break); thin extension lines run from each dimension's ends to just short of
  the body; dimension lines stay close to the drawing (replaced 2026-09-27:
  they no longer move below arrows) and BREAK where an arrow crosses them or
  where they'd run through a drawn object; any faint line under a label breaks
  around it. Beams on supports with
  no dimensions of their own are dimensioned automatically (supports, loads,
  overall length). Labels have no background box. A moment label that runs into something becomes its name
  ("M") with the value in the corner list; a stage can list every value there
  (`listValues: true`). Pictures without sliders or dragging are zoomed to fill
  the canvas. Real objects are drawn as themselves (wrench, trailer, eyebolt …).
- Supports in pictures (agreed with the owner): a reaction arrow never runs
  through its support symbol — at a pin, roller or smooth surface it stops past
  the symbol (below a pin). A fixed support is a hatched block the body is
  mounted in, and the beam's end is square against it. Force arrows at a point
  with a moment arrow (M_A) stop outside the moment's circle.
- Whatever a slider controls is marked in the picture, in the sliders' colour:
  a block shows its symbol and value ("K = 25", "set by slider"), a
  signal-flow branch shows "−k (k = 0.1)". The workspace passes the slider
  paths to every picture as sceneOpts.tunable.
- Block diagrams: a block that shows numbers (10, 1/(s + 2)) also has its name
  (G_1, H_2 …) written above it, so the symbols in the equations and choices
  can be matched to the picture.
- Pictures (agreed with the owner): a slanted load on a beam shows its slope
  triangle or angle; a support on a slope draws the slope's angle at its base;
  rigid-body beams are drawn wide, with the mass caption ("40 kg beam") inside;
  dimension rows sit below any prop anchored under the beam, and a link
  anchored on a wall gets its height dimensioned. A link's anchor pin on the
  same wall as another support sits square on that wall, like the other pin.
- **Object boundaries** (a rule for every picture, agreed with the owner): every
  drawn object reports its true outline — a symbol's triangle, wheels and
  hatching, a bar's whole thickness (beams, truss members, links: barBoxes) —
  and every label keeps at least CLEAR (4 px, render/labels.js) away from any
  outline or solid line. Only faint guides and dimension lines may be broken by
  a label. Pins are one drawing (render/supports.js PIN), so every pin — a
  support or a link's anchor — is the same size.
- **Checking pictures**: `#/gallery` (a small link at the bottom of the home
  page, which the gallery can hide) shows every picture a student can meet —
  per part, situation, concept-check question and debug mistake — at the real
  sizes (computer 750 × 440, phone 343 × 340), with "Show boundaries" (outlines,
  lines and label boxes; rule-breaking labels in red), "Show answers" and "New
  numbers". tests/content/pictures.test.js checks every picture at computer
  size, before and after the answers, with the same check (render/bounds.js):
  a new or changed picture must pass. Soft areas (plates, loads, the inside of
  a moment's circle) may be covered. Helpers that keep pictures passing: a
  too-narrow angle puts its number just outside, beside the arc; a crowded
  moment-arm label keeps its name and lists its value in the corner; the corner
  list avoids where labels want to go; moment circles shrink so they never overlap.
- **Values on bars**: a value that belongs to a bar (a truss member's force) is
  written along the bar, just beside it, upright, on the side away from the
  truss's middle (render/bar-label.js); a bar too short for it falls back to
  an ordinary label kept next to the bar.
- Side-by-side diagrams (space diagram | FBD, a couple | its replacement): every
  drawing and label stays in its own half — each half is sized for the picture
  both before and after the answer is shown, and anything that would still
  reach across the divider is clipped at it.
- Angle numbers stay with their arc: if the spot is taken, the arc grows outward
  and the dashed reference line extends to meet the number (render/angles.js).
- **Arrows, marks and letters around bodies** (agreed with the owner, 2026-09-27):
  no arrow runs inside a body — a push ends at a beam's surface, a pull starts at
  it; a slanted load's slope triangle or angle stays out of the body (a push's by
  its outer end, a pull's halfway out); a force's label sits by its arrow, at its
  outer end when it can. Slanted loads use many slope triangles and angles, not
  only 3-4-5 (library DOWN_RIGHT). Point and support letters go straight below
  their pin or symbol, closest of all labels — a dimension line may be hidden
  behind a letter; a dimension's value slides along its line (centre first) to
  make room. A moment's name ("M") goes inside its curved arrow when it fits, and
  the arrow turns so its head lands on free space.
- **Boundaries outside the gallery**: the "Show boundaries" switch stays on only for a
  stage opened straight from a gallery card (with a button there to turn it off);
  any other way out of the gallery turns it off.
- **Dimensions close, with breaks** (agreed with the owner): grey dimension lines sit
  close to the model; arrows, support symbols and letters break them rather than
  pushing them away (render/dims.js cuts, the dim drawing's gaps). Text written
  inside a bar ("40 kg beam") is centred on it. Answer options have room around them.
- **Letters hug their points; extension lines reach them** (agreed with the owner):
  a point's or support's letter keeps only a 2 px gap from its own drawing
  (LETTER_CLEAR, labels.js; other labels keep 4 px). A dimension's extension lines
  run out to what it measures — a beam, a plate, a truss bar or a joint straight
  across from it (up to ~420 px) — and break where they'd cross a drawn object.
- **Model | free-body diagram** (agreed with the owner): a rigid body's picture shows
  the full model on the left (captioned "Model") (the body as it is, supports, loads, dimensions) and its
  FBD on the right: the body simplified to a plain thin bar with no details, the
  supports replaced by their reactions (their letters kept at their points), the loads
  and the weight (rigid-body-scene.js, fbdLayout; the FBD drawing tool follows it,
  fbdShiftX). The beam above a shear and moment diagram stays one picture (overlay).
- **Letters as close as possible**: point and support letters are measured by a tight
  box round the letter itself (labelBox `tight`), and points and pin/roller symbols
  report their true outlines (ring, triangle slices, wheels, hatch), so a letter sits
  about 2 px from its point. Extension lines stop 2 px short of a body.
- **Distributed loads touch, never enter**: their arrowheads end on the beam's top
  surface (touchBeams sets the load's gap to the beam's half-thickness). A point load
  drawn through a distributed load starts above it and is a slightly different shade
  (indigo, role "knownOver"), so it reads as a separate force.
- **Room round the model**: dimension rows under a rigid body sit at least 0.24 × its
  size below the body and its supports — the automatic ones and a stage's own, moved
  down together (rigid-body-scene.js, roomyDims).
