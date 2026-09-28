// menus.js — the course list, the unit list, and a unit's stage list.

import { el, button } from "./controls.js";
import { renderMixed } from "../render/panel.js";
import { getStatus, resetAll } from "../core/progress.js";
import { unitPlace, readingFor } from "../core/content.js";
import { CHALLENGE_NAMES } from "./stage-view.js";
import { topNav, progressBar } from "./chrome.js";

// "started" and "practice" (answer was shown) are internal records: students just see "not done yet".
// A block of content text that may contain math like $\\Sigma F_x = 0$.
// (Plain textContent would show the dollar signs and backslashes.)
function mixed(text, className = "") {
  const div = el("div", { className });
  renderMixed(div, text || "");
  return div;
}

const ICON = { none: "○", started: "○", practice: "○", complete: "●" };
const ICON_TITLE = { none: "Not done yet", started: "Not done yet", practice: "Not done yet", complete: "Complete" };

export function renderHome(root, courses) {
  root.innerHTML = "";
  root.append(
    topNav(),
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

// "Read more in the textbook": the textbook chapter, as a link when the book is
// free online (opens in a new tab), else as plain text to read in your own copy.
// A free alternative book, if the course names one, is linked underneath.
function readMore(reading, { compact = false } = {}) {
  if (!reading) return null;
  const link = (url, text) => el("a", { href: url, target: "_blank", rel: "noopener", textContent: text });
  const book = reading.book;
  return el("div", { className: "read-more" + (compact ? " read-more-compact" : "") }, [
    el("span", { className: "read-more-icon", textContent: "📖" }),
    el("div", {}, [
      el("div", { className: "read-more-title", textContent: "Read more in the textbook" }),
      reading.url ? link(reading.url, reading.chapter) : el("span", { className: "read-more-chapter", textContent: reading.chapter }),
      compact ? null : el("div", { className: "read-more-book", textContent: `${book.title}, by ${book.authors}${reading.url ? " (free online)" : ""}` }),
      !compact && reading.free ? el("div", { className: "read-more-book" }, ["No copy? Free alternative: ", link(reading.free.url, reading.free.title)]) : null,
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

// A page title with a "back" arrow right beside it (agreed with the owner): a plain blue
// chevron — two lines — leading one level up (a unit → its chapter, a chapter → all chapters).
// The small label above the title ("Chapter 3") lines up with the title's text, not the arrow.
function titleWithBack(text, href, label, kicker = null) {
  const arrow = el("a", { className: "title-back", href, title: label, "aria-label": label });
  arrow.innerHTML = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M15 4l-8 8 8 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const parts = [arrow, el("h1", { textContent: text })];
  if (kicker) parts.unshift(el("div", { className: "unit-num title-kicker", textContent: kicker }));
  return el("div", { className: "title-row" }, parts);
}

// A planned unit (course.js soon(...)): shown greyed out, not a link.
function soonCard(number, u) {
  return el("div", { className: "unit-card unit-soon", "aria-disabled": "true" }, [
    el("div", { className: "unit-num", textContent: `Unit ${number}` }),
    el("div", { className: "unit-text" }, [el("h2", { textContent: u.title }), mixed(u.concept)]),
    el("span", { className: "chip chip-soon", textContent: "Coming soon" }),
  ]);
}

// A chapter's built units that are finished (every stage complete), as { done, built }.
function chapterProgress(course, ch, byId) {
  const built = ch.units.filter((u) => typeof u === "string" && byId[u]);
  const done = built.filter((id) => byId[id].stages.every((s) => getStatus(`${course.id}/${id}/${s}`) === "complete")).length;
  return { done, built: built.length };
}

// One chapter as a square folder (agreed with the owner): its number and title open
// the chapter's page; its textbook link sits inside the folder, underneath.
function chapterFolder(course, ch, c, byId) {
  const { done, built } = chapterProgress(course, ch, byId);
  const soon = built === 0;
  const count = soon ? "Coming soon" : `${built} unit${built === 1 ? "" : "s"} · ${done} complete`;
  const reading = readingFor(course, ch);
  const book = reading ? el("div", { className: "folder-book" }, [
    el("span", { textContent: "📖 " }),
    reading.url ? el("a", { href: reading.url, target: "_blank", rel: "noopener", textContent: reading.chapter }) : el("span", { textContent: reading.chapter }),
  ]) : null;
  // "Chapter 1" sits on the folder's tab, at its top edge; the title just under it.
  const inner = [
    el("span", { className: "folder-num", textContent: `Chapter ${c + 1}` }),
    el("h2", { className: "folder-title", textContent: ch.title }),
    el("span", { className: "folder-count" + (soon ? " chip chip-soon" : ""), textContent: count }),
  ];
  return el("div", { className: "folder" + (soon ? " folder-soon" : "") }, [
    soon ? el("div", { className: "folder-link", "aria-disabled": "true" }, inner) : el("a", { className: "folder-link", href: `#/${course.id}/ch/${ch.id}` }, inner),
    book,
  ]);
}

// units: [{ id, title, concept, stages: [files] }]. With chapters, the course
// page shows one square folder per chapter (its units are on the chapter's own
// page, renderChapter); without, the units are listed straight away.
// tools: loaded tool folders (course.tools), shown as cards above the chapters.
// courses: every course (the top menu switches between them).
export function renderCourse(root, course, units, tools = [], courses = []) {
  root.innerHTML = "";
  const byId = Object.fromEntries(units.map((u) => [u.id, u]));
  const list = el("div", { className: "unit-list" });
  if (course.chapters) {
    list.appendChild(el("div", { className: "folder-grid" }, course.chapters.map((ch, c) => chapterFolder(course, ch, c, byId))));
  } else {
    units.forEach((u) => list.appendChild(unitCard(course, u)));
  }
  if (tools.length) {
    // First on the page, so the free tools are easy to find.
    list.prepend(el("section", { className: "chapter tools" }, [
      el("div", { className: "chapter-head" }, [el("h2", { className: "chapter-title" }, [el("span", { className: "chapter-num", textContent: "Tools" }), "Practice freely"])]),
      ...tools.map((t) => el("a", { className: "unit-card tool-card", href: `#/${course.id}/${t.id}` }, [
        el("div", { className: "unit-num", textContent: "Tool" }),
        el("div", { className: "unit-text" }, [el("h2", { textContent: t.title }), mixed(t.concept)]),
        el("div", { className: "unit-progress", textContent: "Open →" }),
      ])),
    ]));
  }
  root.append(
    topNav({ course, courses }), // the top tab's menu: Home and every course
    el("header", { className: "page-header" }, [
      el("h1", { textContent: course.title }), mixed(course.description, "lead"),
      el("a", { className: "comp-link", href: `#/comprehension/${course.id}`, textContent: `${course.title} comprehension →` }),
    ]),
    list,
    el("footer", { className: "page-footer" }, [
      button("Reset my progress", () => {
        if (confirm("Erase all saved progress on this computer?")) {
          resetAll();
          renderCourse(root, course, units, tools, courses);
        }
      }, "btn btn-quiet btn-small"),
    ]),
  );
}

// One chapter's page: its units (planned ones as "Coming soon") and its textbook reading.
export function renderChapter(root, course, chapterId, units) {
  const c = (course.chapters || []).findIndex((ch) => ch.id === chapterId);
  if (c < 0) throw new Error(`No chapter called "${chapterId}" in ${course.title}.`);
  const ch = course.chapters[c];
  const byId = Object.fromEntries(units.map((u) => [u.id, u]));
  root.innerHTML = "";
  root.append(
    topNav({ course, chapter: ch, units }), // the top tab's menu: Home and every chapter
    el("header", { className: "page-header" }, [
      titleWithBack(ch.title, `#/${course.id}`, `Back to all ${course.title} chapters`, `Chapter ${c + 1}`),
    ]),
    el("div", { className: "unit-list" }, ch.units.map((u, i) => (typeof u === "string" ? unitCard(course, byId[u]) : soonCard(`${c + 1}.${i + 1}`, u)))),
    readMore(readingFor(course, ch)),
  );
}

// stages: loaded stage objects, in order
// units: every built unit of the course (the top menu lets the student switch unit)
export function renderUnit(root, course, unit, stages, units = []) {
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
  // The top tab replaces the old breadcrumb links; the unit's progress bar sits beside its title.
  const where = place.chapter ? `Chapter ${place.chapterNumber}: ${place.chapter.title} · Unit ${place.number}` : `Unit ${place.number}`;
  root.append(
    topNav({ course, unit, unitNumber: place.number, stages, units }),
    el("header", { className: "page-header unit-header" }, [
      el("div", {}, place.chapter
        ? [titleWithBack(unit.title, `#/${course.id}/ch/${place.chapter.id}`, `Back to Chapter ${place.chapterNumber}: ${place.chapter.title}`, where)]
        : [el("div", { className: "unit-num", textContent: where }), el("h1", { textContent: unit.title })]),
      progressBar(course, unit),
    ]),
    concept,
    el("h3", { textContent: "You will be able to:" }), goals,
    el("h3", { textContent: "Stages" }), list,
    readMore(readingFor(course, place.chapter)),
  );
}
