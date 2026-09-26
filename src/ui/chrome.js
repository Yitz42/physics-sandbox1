// chrome.js — the parts of the page around the lesson itself:
//   topNav()      the tab at the top centre of every page ("STATICS SIMULATION LAB").
//                 Pointing at it (or tapping it) opens a menu: Home, back to the
//                 unit, the unit's stages (a tick on finished ones), and a place
//                 for student accounts, which come later.
//   progressBar() "67% COMPLETE": how many stages of the current unit are done.

import { el } from "./controls.js";
import { getStatus } from "../core/progress.js";

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
  return bar;
}

// One listener for the whole page: a tap outside the menu closes it.
let shownNav = null;
document.addEventListener("pointerdown", (e) => shownNav && !shownNav.contains(e.target) && shownNav.close());

// The top tab and its menu.
//   where: { course?, unit?, unitNumber?, stages?: [loaded stage objects], current?: stage file,
//            units?: [loaded units] }
// On a stage page it offers: Home, back to the unit, the unit's stages.
// On a unit page (or the course page), given `units`: Home and every unit, to switch unit.
export function topNav(where = {}) {
  const { course, unit, unitNumber, stages = [], current, units = [] } = where;
  const label = course ? `${course.title} Simulation Lab` : "Engineering Mechanics Sandbox";
  const tab = el("button", { type: "button", className: "topnav-tab", "aria-haspopup": "true", "aria-expanded": "false", textContent: label });
  const menu = el("div", { className: "topnav-menu", role: "menu" });

  const link = (href, text, extra = {}) => el("a", { className: "topnav-item", href, role: "menuitem", textContent: text, ...extra });
  menu.appendChild(link("#/", "⌂  Home"));
  if (course && units.length && !current) {
    menu.appendChild(el("div", { className: "topnav-heading", textContent: `${course.title} units` }));
    units.forEach((u, i) => {
      const { done, total } = unitProgress(course, u);
      const here = unit && u.id === unit.id;
      const item = el("a", { className: "topnav-item topnav-stage" + (here ? " is-current" : ""), href: `#/${course.id}/${u.id}`, role: "menuitem" }, [
        el("span", { className: "topnav-tick" + (done === total ? " done" : ""), textContent: done === total ? "✓" : "" }),
        el("span", { textContent: `${i + 1}. ${u.title}` }),
        el("span", { className: "topnav-count", textContent: `${done}/${total}` }),
      ]);
      if (here) item.setAttribute("aria-current", "page");
      menu.appendChild(item);
    });
  } else if (course && unit) {
    menu.appendChild(link(`#/${course.id}/${unit.id}`, `←  Back to Unit ${unitNumber}: ${unit.title}`));
    if (stages.length) {
      menu.appendChild(el("div", { className: "topnav-heading", textContent: `Unit ${unitNumber} stages` }));
      stages.forEach((s, i) => {
        const file = unit.stages[i];
        const done = getStatus(`${course.id}/${s.id}`) === "complete";
        const item = el("a", { className: "topnav-item topnav-stage" + (file === current ? " is-current" : ""), href: `#/${course.id}/${unit.id}/${file}`, role: "menuitem" }, [
          el("span", { className: "topnav-tick" + (done ? " done" : ""), textContent: done ? "✓" : "" }),
          el("span", { textContent: `${i + 1}. ${s.title}` }),
        ]);
        if (file === current) item.setAttribute("aria-current", "page");
        menu.appendChild(item);
      });
    }
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
