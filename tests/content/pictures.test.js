// Checks every picture a student can meet against the object-boundaries rule:
// no label on another label, none closer than CLEAR to an object's outline or
// a solid line, none off the edge (render/bounds.js). Each picture is drawn
// the way its stage first shows it, and again with the answers showing, at the
// stage's picture size on a computer (750 × 440 px) — the same pictures as
// the gallery page (#/gallery), where a failing one can be looked at with
// "Show boundaries" on.
import { test, ok, setFile } from "../harness.js";
import { galleryUnits, unitPictures, mountPicture } from "../../src/ui/gallery-items.js";

setFile("content / every picture keeps labels clear");

// A drawing area the size of a stage's picture, kept out of sight.
// (The test page doesn't load the game's style.css: the canvas needs its sizing rule.)
const holder = document.createElement("div");
holder.style.cssText = "position:absolute;left:-10000px;top:0;";
document.body.appendChild(holder);
const css = document.createElement("style");
css.textContent = ".stage-canvas { width: 100%; height: 100%; display: block; }";
document.head.appendChild(css);

function clashesOf(p, reveal) {
  const figure = document.createElement("div");
  figure.style.cssText = `width:750px;height:${p.stage.tallPicture ? 720 : 440}px;`; // (as the gallery's, style.css)
  holder.appendChild(figure);
  let last = null;
  try {
    mountPicture(p, figure, { reveal, onDraw: (r) => (last = r) });
  } finally {
    holder.innerHTML = ""; // (the picture, and any buttons a stage adds under it)
  }
  return last ? last.clashes : [{ text: "(not drawn)", why: ["the picture didn't draw"] }];
}

for (const u of await galleryUnits()) {
  const pictures = await unitPictures(u);
  if (!pictures.length) continue;
  test(`${u.number === "tool" ? "tool" : u.number} ${u.unit.title}: ${pictures.length} picture${pictures.length > 1 ? "s" : ""}, before and after the answers`, () => {
    const problems = [];
    for (const p of pictures) {
      for (const reveal of [false, true]) {
        for (const c of clashesOf(p, reveal)) problems.push(`${p.title}${reveal ? " (answers shown)" : ""}: “${c.text}” ${c.why.join(", ")}`);
      }
    }
    ok(!problems.length, problems.join("\n"));
  });
}
