// comprehension-view.js — the "Comprehension" window on the Courses page, and
// each course's comprehension page (#/comprehension/statics).
//
// The numbers come from core/comprehension.js, which scores the quiet record
// of every answer (core/evidence.js). Students play as normal; this is where
// the results show up: a score per course, chapter and unit, and where the
// mistakes are — math errors (working out the numbers) vs. object errors
// (reading the physical situation).

import { el } from "./controls.js";
import { AREAS } from "../core/comprehension.js";

const AREA_ORDER = ["math", "object", "unknown"];

// A score bar, e.g. 72% filled, coloured by how good it is.
function scoreBar(score) {
  const band = score == null ? "none" : score >= 85 ? "strong" : score >= 65 ? "good" : score >= 40 ? "developing" : "weak";
  return el("div", { className: "comp-bar", title: score == null ? "No answers yet" : `${score}%` }, [
    el("div", { className: `comp-fill comp-${band}`, style: `width: ${score ?? 0}%` }),
  ]);
}

const pct = (score) => (score == null ? "—" : `${score}%`);
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

// Math / object / not identified, as one stacked bar with a key underneath.
function errorSplit(mistakes, { key = true } = {}) {
  const { total, byArea } = mistakes;
  if (!total) return el("div", { className: "comp-muted", textContent: "No mistakes recorded yet." });
  const bar = el("div", { className: "comp-split" }, AREA_ORDER.filter((a) => byArea[a]).map((a) =>
    el("span", { className: `comp-area-${a}`, style: `width: ${(100 * byArea[a]) / total}%`, title: `${AREAS[a].label}: ${byArea[a]}` })));
  if (!key) return bar;
  return el("div", {}, [
    bar,
    el("div", { className: "comp-key" }, AREA_ORDER.filter((a) => byArea[a]).map((a) =>
      el("span", { className: "comp-key-item" }, [
        el("span", { className: `comp-dot comp-area-${a}` }),
        `${AREAS[a].label}: ${byArea[a]} (${Math.round((100 * byArea[a]) / total)}%)`,
      ]))),
  ]);
}

// ---- The window on the Courses page ----------------------------------------------

// courses: the course list; summaries: { courseId: courseComprehension(...) }
export function comprehensionPanel(courses, summaries) {
  return el("section", { className: "comp-panel" }, [
    el("h2", { className: "comp-panel-title", textContent: "Comprehension" }),
    el("p", { className: "comp-muted", textContent: "Worked out in the background from every answer on this computer — how well each course is understood, and where the mistakes are." }),
    el("div", { className: "card-grid" }, courses.map((c) => {
      const s = summaries[c.id];
      if (c.comingSoon || !s) {
        return el("div", { className: "card card-disabled comp-card" }, [
          el("h2", { textContent: `${c.title} comprehension` }),
          el("span", { className: "chip", textContent: "Coming later" }),
        ]);
      }
      return el("a", { className: "card comp-card", href: `#/comprehension/${c.id}` }, [
        el("h2", { textContent: `${c.title} comprehension` }),
        el("div", { className: "comp-big" }, [el("span", { className: "comp-score", textContent: pct(s.score) }), el("span", { className: "comp-level", textContent: s.level })]),
        scoreBar(s.score),
        el("div", { className: "comp-muted", textContent: s.answered ? `From ${plural(s.answered, "answer")}` : "No answers yet" }),
        s.mistakes.total ? errorSplit(s.mistakes, { key: false }) : null,
      ]);
    })),
  ]);
}

// ---- A course's comprehension page ------------------------------------------------

function mistakeList(mistakes) {
  if (!mistakes.byKind.length) return null;
  return el("div", { className: "comp-box" }, [
    el("h2", { textContent: "Where the mistakes are" }),
    el("ol", { className: "comp-kinds" }, mistakes.byKind.slice(0, 6).map((k) =>
      el("li", {}, [
        el("span", { className: `comp-dot comp-area-${k.area}` }),
        el("span", { className: "comp-kind-label", textContent: k.label }),
        el("span", { className: "comp-muted", textContent: ` — ${plural(k.count, "time")}${k.rounds > 1 ? `, in ${k.rounds} different problems` : ""}` }),
        k.rounds >= 3 ? el("span", { className: "chip comp-chip-pattern", textContent: "keeps happening" }) : null,
      ]))),
  ]);
}

function unitRow(u) {
  if (u.comingSoon) {
    return el("div", { className: "comp-unit comp-unit-soon" }, [
      el("span", { className: "comp-unit-num", textContent: u.number }),
      el("span", { textContent: u.title }),
      el("span", { className: "chip chip-soon", textContent: "Coming soon" }),
    ]);
  }
  const m = u.mistakes.byArea;
  return el("div", { className: "comp-unit" }, [
    el("span", { className: "comp-unit-num", textContent: u.number }),
    el("a", { href: `#/${u.course}/${u.id}`, textContent: u.title }),
    el("div", { className: "comp-unit-score" }, [scoreBar(u.score), el("span", { textContent: `${pct(u.score)} ${u.answered ? u.level : ""}` })]),
    el("span", { className: "comp-muted comp-unit-detail", textContent: u.answered
      ? `${plural(u.answered, "answer")} · ${plural(u.types, "challenge type")} · ${plural(u.situations, "problem")} · math errors ${m.math}, object errors ${m.object}${m.unknown ? `, not identified ${m.unknown}` : ""}`
      : "Not tried yet" }),
  ]);
}

// course: the course object; summary: courseComprehension(events, course, units)
export function renderComprehension(root, course, summary) {
  root.innerHTML = "";
  const chapters = summary.chapters.map((ch) => {
    const allSoon = ch.units.every((u) => u.comingSoon);
    return el("section", { className: "comp-chapter" + (allSoon ? " comp-chapter-soon" : "") }, [
      el("div", { className: "comp-chapter-head" }, [
        el("h2", {}, [el("span", { className: "chapter-num", textContent: `Chapter ${ch.number}` }), " ", ch.title]),
        allSoon
          ? el("span", { className: "chip chip-soon", textContent: "Coming soon" })
          : el("div", { className: "comp-chapter-score" }, [scoreBar(ch.score), el("span", { textContent: `${pct(ch.score)} ${ch.answered ? ch.level : ""} · ${ch.tried} of ${ch.built} units tried` })]),
      ]),
      allSoon ? null : el("div", { className: "comp-units" }, ch.units.map((u) => unitRow({ ...u, course: course.id }))),
    ]);
  });
  root.append(
    el("nav", { className: "crumbs" }, [el("a", { href: "#/", textContent: "Courses" }), " › ", el("a", { href: `#/${course.id}`, textContent: course.title })]),
    el("header", { className: "page-header" }, [
      el("h1", { textContent: `${course.title} comprehension` }),
      el("p", { className: "lead", textContent: "Worked out in the background from every answer on this computer. Students don't see these scores while they play; they just complete units." }),
    ]),
    el("div", { className: "comp-top" }, [
      el("div", { className: "comp-box" }, [
        el("h2", { textContent: "Overall" }),
        el("div", { className: "comp-big" }, [el("span", { className: "comp-score", textContent: pct(summary.score) }), el("span", { className: "comp-level", textContent: summary.level })]),
        scoreBar(summary.score),
        el("div", { className: "comp-muted", textContent: summary.answered ? `From ${plural(summary.answered, "answer")}. Each unit counts its 20 most recent answers: right first time counts fully, after one slip 60%, after more 30%, with "Show answer" 0.` : "No answers yet — play some stages and come back." }),
      ]),
      el("div", { className: "comp-box" }, [
        el("h2", { textContent: "Math or object errors?" }),
        errorSplit(summary.mistakes),
        el("div", { className: "comp-muted comp-about" }, AREA_ORDER.slice(0, 2).map((a) => el("div", {}, [el("strong", { textContent: `${AREAS[a].label}: ` }), AREAS[a].about]))),
      ]),
    ]),
    mistakeList(summary.mistakes),
    ...chapters,
  );
}
