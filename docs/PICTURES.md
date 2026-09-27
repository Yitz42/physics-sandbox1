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
  the body; a dimension an arrow crosses moves down below the arrow and its
  label; any faint line under a label breaks around it. Beams on supports with
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
