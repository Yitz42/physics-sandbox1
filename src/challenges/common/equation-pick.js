// equation-pick.js — "which of these is the correct ΣFx equation?"
//
// For each equation the student sees the correct one plus two versions with
// a single classic mistake (sin/cos swapped, a sign flipped, a term missing).
// Wrong picks get feedback naming the exact mistake.

import { equationTex, mistakesOf } from "../../core/equations.js";
import { renderTex } from "../../render/panel.js";
import { el, button } from "../../ui/controls.js";

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick two different kinds of mistake when possible (a swap and a sign error);
// if only one kind is possible (e.g. two wrong versions of a single term), take two of it.
function pickMistakes(eq) {
  const all = shuffle(mistakesOf(eq));
  const chosen = [];
  for (const kind of ["swap", "sign", "missing"]) {
    const m = all.find((x) => x.kind === kind && !chosen.includes(x));
    if (m && chosen.length < 2) chosen.push(m);
  }
  for (const m of all) if (chosen.length < 2 && !chosen.includes(m)) chosen.push(m);
  return chosen;
}

// A group's title: eq.title if the equation has one (e.g. "F_R" for a long
// integral), else the last part of its left side (e.g. "ΣF_x").
const groupName = (eq) => eq.title || eq.lhs.split("=").pop().trim();

const REASONS = {
  // A wrong version can bring its own reason (reason), or its term can (swapReason).
  swap: (s, term, reason) => `the $${s}$ term ${reason || (term && term.factor && term.factor.swapReason) || "has sin and cos swapped — cos goes with the axis the angle is measured from"}`,
  sign: (s) => `the $${s}$ term has the wrong sign — check which way that component points`,
  missing: (s) => `the $${s}$ term is missing — every force with a component along this axis belongs`,
};

// symbolOf(termId) → KaTeX symbol, for messages
// mode: "symbolic" or "numeric" (numbers make e.g. a wrong moment arm visible)
export function createEquationPick(equations, symbolOf, { onCorrect, onWrong, mode = "symbolic" }) {
  const groups = equations.map((eq) => {
    const options = shuffle([{ eq, kind: "correct" }, ...pickMistakes(eq)]);
    const wrap = el("div", { className: "eq-pick" });
    const title = el("div", { className: "eq-pick-title" });
    renderTex(title, groupName(eq)); // e.g. "ΣF_x"
    wrap.appendChild(title);
    let selected = null;
    const buttons = options.map((o) => {
      const b = el("button", { type: "button", className: "btn btn-choice eq-choice" });
      renderTex(b, equationTex(o.eq, mode, { highlight: false, showResult: false }));
      b.onclick = () => {
        selected = o;
        buttons.forEach((x) => x.classList.toggle("selected", x === b));
      };
      wrap.appendChild(b);
      return b;
    });
    return { eq, wrap, options, buttons, get selected() { return selected; }, select(o) { selected = o; } };
  });

  function check() {
    const problems = [];
    for (const g of groups) {
      g.buttons.forEach((b) => b.classList.remove("is-wrong", "is-right"));
      const s = g.selected;
      if (!s) {
        problems.push("Pick one equation in each group.");
        continue;
      }
      const b = g.buttons[g.options.indexOf(s)];
      if (s.kind === "correct") b.classList.add("is-right");
      else {
        b.classList.add("is-wrong");
        const name = groupName(g.eq);
        problems.push(`In your $${name}$ choice, ${REASONS[s.kind](symbolOf(s.termId), s.term, s.reason)}.`);
      }
    }
    if (problems.length) onWrong(problems);
    else {
      groups.forEach((g) => g.buttons.forEach((b) => (b.disabled = true)));
      checkBtn.remove();
      onCorrect();
    }
  }

  const checkBtn = button("Check equations", check, "btn btn-play");
  const element = el("div", { className: "eq-picker" }, [
    ...groups.map((g) => g.wrap),
    el("div", { className: "actions" }, [checkBtn]),
  ]);

  return {
    element,
    actions: checkBtn.parentNode,
    reveal() {
      groups.forEach((g) => {
        const i = g.options.findIndex((o) => o.kind === "correct");
        g.select(g.options[i]);
        g.buttons.forEach((b, j) => b.classList.toggle("selected", j === i));
      });
      check();
    },
  };
}
