// menus.js — the course list, the unit list, and a unit's stage list.

import { el, button } from "./controls.js";
import { renderMixed } from "../render/panel.js";
import { getStatus, resetAll } from "../core/progress.js";
import { unitPlace, readingFor } from "../core/content.js";
import { CHALLENGE_NAMES } from "./stage-view.js";

// "practice" (answer was shown) is an internal record: students just see "not done yet".
// A block of content text that may contain math like $\\Sigma F_x = 0$.
// (Plain textContent would show the dollar signs and backslashes.)
function mixed(text, className = "") {
  const div = el("div", { className });
  renderMixed(div, text || "");
  return div;
}

const ICON = { none: "○", practice: "○", complete: "●" };
const ICON_TITLE = { none: "Not done yet", practice: "Not done yet", complete: "Complete" };

export function renderHome(root, courses) {
  root.innerHTML = "";
  root.append(
    el("header", { className: "page-header" }, [
      el("h1", { textContent: "Engineering Mechanics Sandbox" }),
      el("p", { className: "lead", textContent: "Build it, load it, press Test — and see how forces become equations." }),
    ]),
    el("div", { className: "card-grid" }, courses.map((c) =>
      el("a", { className: "card" + (c.comingSoon ? " card-disabled" : ""), href: c.comingSoon ? "#/" : `#/${c.id}` }, [
        el("h2", { textContent: c.title }),
        mixed(c.description),
        c.comingSoon ? el("span", { className: "chip", textContent: "Coming later" }) : null,
      ]))),
  );
}

// "Read more in the textbook": a link to the textbook chapter (opens in a new tab).
function readMore(reading, { compact = false } = {}) {
  if (!reading) return null;
  return el("div", { className: "read-more" + (compact ? " read-more-compact" : "") }, [
    el("span", { className: "read-more-icon", textContent: "📖" }),
    el("div", {}, [
      el("div", { className: "read-more-title", textContent: "Read more in the textbook" }),
      el("a", { href: reading.url, target: "_blank", rel: "noopener", textContent: reading.chapter }),
      compact ? null : el("div", { className: "read-more-book", textContent: `${reading.book.title}, by ${reading.book.authors} (free online)` }),
    ]),
  ]);
}

// One unit's card on the course page.
function unitCard(course, u) {
  const keys = u.stages.map((s) => `${course.id}/${u.id}/${s}`);
  const done = keys.filter((k) => getStatus(k) === "complete").length;
  return el("a", { className: "unit-card", href: `#/${course.id}/${u.id}` }, [
    el("div", { className: "unit-num", textContent: `Unit ${unitPlace(course, u.id).number}` }),
    el("div", { className: "unit-text" }, [el("h2", { textContent: u.title }), mixed(u.concept)]),
    el("div", { className: "unit-progress", textContent: `${done} / ${keys.length} complete` }),
  ]);
}

// A planned unit (course.js soon(...)): shown greyed out, not a link.
function soonCard(number, u) {
  return el("div", { className: "unit-card unit-soon", "aria-disabled": "true" }, [
    el("div", { className: "unit-num", textContent: `Unit ${number}` }),
    el("div", { className: "unit-text" }, [el("h2", { textContent: u.title }), mixed(u.concept)]),
    el("span", { className: "chip chip-soon", textContent: "Coming soon" }),
  ]);
}

// units: [{ id, title, concept, stages: [files] }]. With chapters, the units
// are listed under their chapter's heading (with its textbook link); planned
// units appear as "Coming soon".
export function renderCourse(root, course, units) {
  root.innerHTML = "";
  const byId = Object.fromEntries(units.map((u) => [u.id, u]));
  const list = el("div", { className: "unit-list" });
  if (course.chapters) {
    course.chapters.forEach((ch, c) => {
      const allSoon = ch.units.every((u) => typeof u !== "string");
      list.appendChild(el("section", { className: "chapter" + (allSoon ? " chapter-soon" : "") }, [
        el("div", { className: "chapter-head" }, [
          el("h2", { className: "chapter-title" }, [
            el("span", { className: "chapter-num", textContent: `Chapter ${c + 1}` }), ch.title,
            allSoon ? el("span", { className: "chip chip-soon", textContent: "Coming soon" }) : null,
          ]),
          readMore(readingFor(course, ch), { compact: true }),
        ]),
        ...ch.units.map((u, i) => (typeof u === "string" ? unitCard(course, byId[u]) : soonCard(`${c + 1}.${i + 1}`, u))),
      ]));
    });
  } else {
    units.forEach((u) => list.appendChild(unitCard(course, u)));
  }
  root.append(
    el("nav", { className: "crumbs" }, [el("a", { href: "#/", textContent: "Courses" })]),
    el("header", { className: "page-header" }, [el("h1", { textContent: course.title }), mixed(course.description, "lead")]),
    list,
    el("footer", { className: "page-footer" }, [
      button("Reset my progress", () => {
        if (confirm("Erase all saved progress on this computer?")) {
          resetAll();
          renderCourse(root, course, units);
        }
      }, "btn btn-quiet btn-small"),
    ]),
  );
}

// stages: loaded stage objects, in order
export function renderUnit(root, course, unit, stages) {
  const place = unitPlace(course, unit.id);
  root.innerHTML = "";
  const goals = el("ul", { className: "goals" }, (unit.goals || []).map((g) => {
    const li = el("li");
    renderMixed(li, g);
    return li;
  }));
  const list = el("ol", { className: "stage-list" });
  stages.forEach((s, i) => {
    const status = getStatus(`${course.id}/${s.id}`);
    list.appendChild(el("li", {}, [
      el("a", { className: `stage-link status-${status === "complete" ? "complete" : "none"}`, href: `#/${course.id}/${unit.id}/${unit.stages[i]}` }, [
        el("span", { className: "stage-icon", title: ICON_TITLE[status], textContent: ICON[status] }),
        el("span", { className: `chip chip-${s.challenge}`, textContent: CHALLENGE_NAMES[s.challenge] }),
        el("span", { className: "stage-name", textContent: s.title }),
        s.parts && s.parts.length > 1 ? el("span", { className: "stage-parts", textContent: `${s.parts.length} parts` }) : null,
      ]),
    ]));
  });
  const concept = el("p", { className: "lead" });
  renderMixed(concept, unit.concept);
  root.append(
    el("nav", { className: "crumbs" }, [
      el("a", { href: "#/", textContent: "Courses" }), " › ", el("a", { href: `#/${course.id}`, textContent: course.title }),
      place.chapter ? ` › Chapter ${place.chapterNumber}: ${place.chapter.title}` : "",
    ]),
    el("header", { className: "page-header" }, [el("div", { className: "unit-num", textContent: `Unit ${place.number}` }), el("h1", { textContent: unit.title }), concept]),
    el("h3", { textContent: "You will be able to:" }), goals,
    el("h3", { textContent: "Stages" }), list,
    readMore(readingFor(course, place.chapter)),
  );
}
