// gallery.js — the picture gallery (#/gallery): every picture of a unit (or of
// every unit) on one page, for checking how they look. Not for students.
//
//   • Show boundaries: every object's outline (orange), solid line (blue) and
//     label box (green) drawn on top; a label that breaks the object-boundaries
//     rule is filled red, and its card says so (render/bounds.js).
//   • Show answers: the pictures as they look once solved.
//   • New numbers: another version from the stage's `vary` rules.
//   • Size: the stage's real picture size on a computer, or on a phone
//     (labels keep their size, so a smaller picture is more crowded).
// The home page has a small link here, which this page can hide; the page
// itself always works by typing #/gallery after the address.
//
// With boundaries on, a stage opened from a card shows them too, while it's played
// (a button turns them off); anywhere else they're off (see boundsOnRoute).

import { el, button } from "./controls.js";
import { galleryUnits, unitPictures, mountPicture } from "./gallery-items.js";
import { makeVariant } from "../core/paths.js";
import { showBounds, setShowBounds } from "../render/bounds.js";

// Small settings kept in this browser only (wrapped: storage may be blocked).
const read = (k, d) => {
  try {
    const v = localStorage.getItem(`ems.gallery.${k}`);
    return v == null ? d : JSON.parse(v);
  } catch {
    return d;
  }
};
const write = (k, v) => {
  try {
    localStorage.setItem(`ems.gallery.${k}`, JSON.stringify(v));
  } catch {
    /* not saved: fine */
  }
};

// The home page's link to the gallery (none once it's hidden).
export function galleryLink() {
  if (read("hidden", false)) return null;
  return el("p", { className: "gal-home-link" }, [el("a", { href: "#/gallery", textContent: "Picture gallery (for checking pictures)" })]);
}

// The boundaries switch outside the gallery: it stays on ONLY for a stage opened
// straight from a gallery card ("Open stage →"), with a button there to turn it off.
// Leaving the gallery any other way, or moving on from that stage, turns it off.
let openedFromGallery = false;
export function boundsOnRoute(isGallery) {
  document.querySelector(".gal-badge-float")?.remove();
  if (isGallery) return;
  const keep = openedFromGallery && showBounds();
  openedFromGallery = false;
  if (!keep) return setShowBounds(false);
  document.body.appendChild(button("Boundaries on — turn off", () => {
    setShowBounds(false);
    document.querySelector(".gal-badge-float")?.remove();
    window.dispatchEvent(new HashChangeEvent("hashchange")); // redraw the page without them
  }, "btn btn-small gal-badge-float"));
}

export async function renderGallery(root) {
  root.innerHTML = "";
  document.title = "Picture gallery — Mechanics Sandbox";
  const units = await galleryUnits();
  const keyOf = (u) => `${u.courseId}/${u.unit.id}`;
  const settings = { unit: read("unit", keyOf(units[0])), answers: false, size: read("size", "desktop"), onlyClashes: false };

  const unitSelect = el("select", { className: "wb-select" }, [
    ...units.map((u) => el("option", { value: keyOf(u), textContent: `${u.courseTitle} · ${u.number === "tool" ? "Tool" : u.number} ${u.unit.title}` })),
    el("option", { value: "*", textContent: "Every unit (slow)" }),
  ]);
  unitSelect.value = units.some((u) => keyOf(u) === settings.unit) || settings.unit === "*" ? settings.unit : keyOf(units[0]);
  const check = (label, value, onChange) => {
    const box = el("input", { type: "checkbox", checked: value });
    box.addEventListener("change", () => onChange(box.checked));
    return el("label", { className: "gal-check" }, [box, ` ${label}`]);
  };
  const sizeSelect = el("select", { className: "wb-select" }, [el("option", { value: "desktop", textContent: "Computer size (750 px)" }), el("option", { value: "phone", textContent: "Phone size (343 px)" })]);
  sizeSelect.value = settings.size;
  const summary = el("p", { className: "gal-summary" });
  const grid = el("div", { className: "gal-grid" });
  const hideLink = button("", () => {
    write("hidden", !read("hidden", false));
    hideLabel();
  }, "btn btn-quiet btn-small");
  const hideLabel = () => (hideLink.textContent = read("hidden", false) ? "Show the gallery link on the home page" : "Hide the gallery link from the home page");
  hideLabel();

  root.append(
    el("header", { className: "page-header" }, [
      el("p", {}, [el("a", { href: "#/", textContent: "← Home" })]),
      el("h1", { textContent: "Picture gallery" }),
      el("p", { className: "lead", textContent: "Every picture a student can meet, for checking how they look. Students don't see this page." }),
    ]),
    el("div", { className: "gal-bar" }, [
      unitSelect, sizeSelect,
      check("Show boundaries", showBounds(), (on) => {
        setShowBounds(on);
        cards.forEach((c) => c.redraw());
      }),
      check("Show answers", false, (on) => {
        settings.answers = on;
        cards.forEach((c) => c.setReveal(on));
      }),
      check("Only pictures with clashes", false, (on) => {
        settings.onlyClashes = on;
        if (on) cards.forEach((c) => c.mount()); // every picture must be drawn to know
        filter();
      }),
      hideLink,
    ]),
    el("p", { className: "gal-legend" }, [
      "With boundaries on: ", el("span", { className: "gal-key gal-key-obj", textContent: "object outline" }), " ",
      el("span", { className: "gal-key gal-key-line", textContent: "solid line" }), " ",
      el("span", { className: "gal-key gal-key-label", textContent: "label" }), " ",
      el("span", { className: "gal-key gal-key-bad", textContent: "label breaking the rule" }),
    ]),
    summary, grid,
  );

  let cards = [];
  // Draw a card's picture only when it scrolls into view (a unit can have dozens).
  const seen = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.target.mountCard()), { rootMargin: "300px" });

  async function show() {
    write("unit", unitSelect.value);
    write("size", sizeSelect.value);
    seen.disconnect();
    grid.innerHTML = "";
    grid.className = `gal-grid gal-${sizeSelect.value}`;
    summary.textContent = "Loading…";
    const chosen = unitSelect.value === "*" ? units : units.filter((u) => keyOf(u) === unitSelect.value);
    const pictures = [];
    for (const u of chosen) pictures.push(...(await unitPictures(u)));
    cards = pictures.map((p) => makeCard(p, settings, tally));
    for (const c of cards) {
      grid.appendChild(c.element);
      seen.observe(c.element);
    }
    if (settings.onlyClashes) cards.forEach((c) => c.mount());
    tally();
  }
  function tally() {
    const drawn = cards.filter((c) => c.clashes != null);
    const bad = drawn.filter((c) => c.clashes > 0);
    summary.textContent = `${cards.length} pictures · ${drawn.length} drawn · ${bad.length} with clashes`;
    filter();
  }
  function filter() {
    for (const c of cards) c.element.hidden = settings.onlyClashes && c.clashes === 0;
  }
  unitSelect.addEventListener("change", show);
  sizeSelect.addEventListener("change", show);
  await show();
}

// One picture: its title, the picture, what the clash check found, and buttons.
function makeCard(p, settings, onChecked) {
  const figure = el("div", { className: p.stage.tallPicture ? "figure gal-figure figure-tall" : "figure gal-figure" });
  const badge = el("span", { className: "gal-count", textContent: "not drawn yet" });
  const details = el("div", { className: "gal-details" });
  const { courseId, unitId, file } = p.where;
  const tools = el("div", { className: "gal-tools" }, [
    badge,
    p.stage.vary && p.stage.vary.length ? button("New numbers", () => renumber(), "btn btn-quiet btn-small") : null,
    el("a", { className: "btn btn-quiet btn-small", href: `#/${courseId}/${unitId}/${file}`, textContent: "Open stage →", onclick: () => (openedFromGallery = true) }),
  ]);
  const element = el("section", { className: "gal-card" }, [el("div", { className: "gal-title", textContent: p.title }), figure, tools, details]);
  let ws = null;
  const card = { element, clashes: null };
  function report(r) {
    card.clashes = r.clashes.length;
    badge.textContent = r.clashes.length ? `⚠ ${r.clashes.length} clash${r.clashes.length > 1 ? "es" : ""}` : "✓ no clashes";
    badge.className = `gal-count ${r.clashes.length ? "gal-bad" : "gal-ok"}`;
    details.textContent = r.clashes.map((c) => `“${c.text}”: ${c.why.join(", ")}`).join(" · ");
    onChecked();
  }
  card.mount = () => {
    if (ws) return;
    try {
      ws = mountPicture(p, figure, { reveal: settings.answers, onDraw: report });
    } catch (e) {
      badge.textContent = "⚠ couldn't draw";
      badge.className = "gal-count gal-bad";
      details.textContent = String(e.message || e);
      card.clashes = 1;
      onChecked();
    }
  };
  element.mountCard = card.mount;
  card.redraw = () => ws && ws.redraw();
  card.setReveal = (on) => ws && ws.setReveal(on || p.reveal);
  function renumber() {
    if (!ws) return;
    const setup = makeVariant(p.setup, p.stage.vary, Math.random, ws.setup);
    Object.assign(ws.sceneOpts, p.sceneOpts(setup));
    ws.setSetup(setup, true);
  }
  return card;
}
