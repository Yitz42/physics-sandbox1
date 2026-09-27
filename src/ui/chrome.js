// chrome.js — the parts of the page around the lesson itself:
//   topNav()      the tab at the top centre of every page ("STATICS SIMULATION LAB").
//                 Pointing at it (or tapping it) opens a menu: Home, then the courses
//                 (on the all-chapters page), the chapters (on a chapter page) or the
//                 way back and the unit's stages (inside a unit), and a place for
//                 student accounts, which come later.
//   progressBar() "67% COMPLETE": how many stages of the current unit are done.

import { el } from "./controls.js";
import { getStatus } from "../core/progress.js";
import { unitPlace } from "../core/content.js";

// Stages of a unit that are complete, as { done, total }.
export function unitProgress(course, unit) {
  const keys = unit.stages.map((s) => `${course.id}/${unit.id}/${s}`);
  return { done: keys.filter((k) => getStatus(k) === "complete").length, total: keys.length };
}

// A bar that fills with the unit's progress. Returns the element; call
// .refresh() on it after a stage is completed.
export function progressBar(course, unit) {
  const fill = el("div", { className: "progress-fill" });
  // "67%" and " complete" are separate so small screens can show just "67%".
  const pct = el("span");
  const text = el("div", { className: "progress-text" }, [pct, el("span", { className: "progress-word", textContent: "complete" })]);
  const bar = el("div", { className: "progress-bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100" }, [fill, text]);
  bar.refresh = () => {
    const { done, total } = unitProgress(course, unit);
    const value = total ? Math.round((100 * done) / total) : 0;
    fill.style.width = `${value}%`;
    pct.textContent = `${value}%`;
    bar.setAttribute("aria-valuenow", String(value));
    bar.title = `${done} of ${total} stages in this unit complete`;
  };
  bar.refresh();
  // The bar's width follows the space the title leaves; when it's narrow,
  // show just "83%" instead of "83% complete".
  if (globalThis.ResizeObserver) new ResizeObserver(() => bar.classList.toggle("compact", bar.clientWidth < 170)).observe(bar);
  return bar;
}

// One listener for the whole page: a tap outside the menu closes it.
let shownNav = null;
document.addEventListener("pointerdown", (e) => shownNav && !shownNav.contains(e.target) && shownNav.close());

// The top tab and its menu (agreed with the owner):
//   where: { course?, courses?: [every course], chapter?, unit?, unitNumber?,
//            stages?: [loaded stage objects], current?: stage file, units?: [loaded units] }
// Looking at all the chapters (the course page, given `courses`): Home and every course.
// On a chapter page: Home and every chapter of the course. Inside a unit (its page
// or a stage): Home, the way back (to the chapter, or to the unit) and the unit's stages.
// A course without chapters: Home and every unit.
export function topNav(where = {}) {
  const { course, courses = [], chapter, unit, unitNumber, stages = [], current, units = [] } = where;
  const label = course ? `${course.title} Simulation Lab` : "Engineering Mechanics Sandbox";
  const tab = el("button", { type: "button", className: "topnav-tab", "aria-haspopup": "true", "aria-expanded": "false", textContent: label });
  const menu = el("div", { className: "topnav-menu", role: "menu" });

  const link = (href, text, extra = {}) => el("a", { className: "topnav-item", href, role: "menuitem", textContent: text, ...extra });
  const heading = (text) => menu.appendChild(el("div", { className: "topnav-heading", textContent: text }));
  // A line with a tick (done) and an optional count, marked when it's the page we're on.
  const row = (href, text, { here = false, done = false, count = null } = {}) => {
    const item = el("a", { className: "topnav-item topnav-stage" + (here ? " is-current" : ""), href, role: "menuitem" }, [
      el("span", { className: "topnav-tick" + (done ? " done" : ""), textContent: done ? "✓" : "" }),
      el("span", { textContent: text }),
      count ? el("span", { className: "topnav-count", textContent: count }) : null,
    ]);
    if (here) item.setAttribute("aria-current", "page");
    return menu.appendChild(item);
  };
  menu.appendChild(link("#/", "⌂  Home"));

  if (courses.length) {
    // All the chapters are showing: switch course.
    heading("Courses");
    for (const c of courses) {
      if (c.comingSoon) menu.appendChild(el("span", { className: "topnav-item is-disabled", "aria-disabled": "true", textContent: `${c.title} — coming later` }));
      else row(`#/${c.id}`, c.title, { here: course && c.id === course.id });
    }
  } else if (course && course.chapters && unit) {
    // Inside a unit (its page or a stage): the way back — to the chapter from the
    // unit's page, to the unit from a stage — and the unit's stages. (No chapter list.)
    const place = unitPlace(course, unit.id);
    if (current) menu.appendChild(link(`#/${course.id}/${unit.id}`, `←  Back to Unit ${unitNumber}: ${unit.title}`));
    else if (place.chapter) menu.appendChild(link(`#/${course.id}/ch/${place.chapter.id}`, `←  Back to Chapter ${place.chapterNumber}: ${place.chapter.title}`));
    if (stages.length) {
      heading(`Unit ${unitNumber} stages`);
      stages.forEach((st, i) => {
        const file = unit.stages[i];
        row(`#/${course.id}/${unit.id}/${file}`, `${i + 1}. ${st.title}`, { here: file === current, done: getStatus(`${course.id}/${st.id}`) === "complete" });
      });
    }
  } else if (course && course.chapters && chapter) {
    // A chapter's page: every chapter.
    const mine = chapter;
    heading(`${course.title} chapters`);
    course.chapters.forEach((ch, c) => {
      const built = ch.units.filter((u) => typeof u === "string");
      if (!built.length) return; // (planned chapters: on the course page, as "Coming soon")
      const loaded = built.map((id) => units.find((u) => u.id === id)).filter(Boolean);
      const done = loaded.length === built.length && loaded.every((u) => { const p = unitProgress(course, u); return p.done === p.total; });
      row(`#/${course.id}/ch/${ch.id}`, `${c + 1}. ${ch.title}`, { here: ch === mine, done });
    });
    menu.appendChild(link(`#/${course.id}`, `▦  All ${course.title} chapters`));
  } else if (course && units.length && !current) {
    // A course without chapters: every unit.
    heading(`${course.title} units`);
    units.forEach((u) => {
      const { done, total } = unitProgress(course, u);
      row(`#/${course.id}/${u.id}`, `${unitPlace(course, u.id).number} ${u.title}`, { here: unit && u.id === unit.id, done: done === total, count: `${done}/${total}` });
    });
  } else if (course && unit) {
    menu.appendChild(link(`#/${course.id}/${unit.id}`, `←  Back to Unit ${unitNumber}: ${unit.title}`));
    stages.forEach((st, i) => row(`#/${course.id}/${unit.id}/${unit.stages[i]}`, `${i + 1}. ${st.title}`, { here: unit.stages[i] === current, done: getStatus(`${course.id}/${st.id}`) === "complete" }));
  } else if (course) {
    menu.appendChild(link(`#/${course.id}`, `${course.title}: all units`));
  }
  // Student accounts come later; the menu keeps a place for them.
  menu.appendChild(el("div", { className: "topnav-divider" }));
  menu.appendChild(el("span", { className: "topnav-item is-disabled", "aria-disabled": "true", textContent: "👤  Account — coming soon" }));

  const nav = el("nav", { className: "topnav" }, [tab, menu]);
  // Pointing at it opens the menu (CSS :hover). Touchscreens have no hover,
  // so a tap toggles it, and a tap anywhere else closes it.
  const setOpen = (open) => {
    nav.classList.toggle("open", open);
    tab.setAttribute("aria-expanded", String(open));
  };
  tab.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
  nav.close = () => setOpen(false);
  shownNav = nav;
  nav.addEventListener("keydown", (e) => e.key === "Escape" && (setOpen(false), tab.blur()));
  return nav;
}
