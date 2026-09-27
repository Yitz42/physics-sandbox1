// choice-pick.js — "which of these is the right next line?", from the solver.
//
// Like equation-pick.js, but the options come ready-made from the solver
// (solver.choices(setup)), so any subject can use it — e.g. each step of a
// block diagram reduction, or the parts of Mason's rule:
//   groups: [{ title, options: [{ tex, correct?, feedback?, kind? }] }]
// (kind: what sort of mistake a wrong option is — see src/core/diagnosis.js)
// title may contain $math$; tex is KaTeX. Every wrong option carries the
// feedback shown when it's picked.

import { renderTex, renderMixed } from "../../render/panel.js";
import { el, button } from "../../ui/controls.js";

// A copy in random order (solvers list the right option first: shown as listed,
// it would always be at the top).
function shuffled(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function createChoicePick(groups, { onCorrect, onWrong }) {
  const made = groups.map((g) => {
    const order = shuffled(g.options);
    const wrap = el("div", { className: "eq-pick" });
    const title = el("div", { className: "eq-pick-title" });
    renderMixed(title, g.title);
    wrap.appendChild(title);
    let selected = null;
    const buttons = order.map((o) => {
      const b = el("button", { type: "button", className: "btn btn-choice eq-choice" });
      renderTex(b, o.tex);
      b.onclick = () => {
        selected = o;
        buttons.forEach((x) => x.classList.toggle("selected", x === b));
      };
      wrap.appendChild(b);
      return b;
    });
    return { g, order, wrap, buttons, get selected() { return selected; }, select(o) { selected = o; } };
  });

  function check() {
    const problems = [];
    const kinds = []; // what sort of mistake each wrong pick is (option.kind), for comprehension
    for (const m of made) {
      m.buttons.forEach((b) => b.classList.remove("is-wrong", "is-right"));
      const s = m.selected;
      if (!s) {
        problems.push("Pick one line in each group.");
        continue;
      }
      const b = m.buttons[m.order.indexOf(s)];
      b.classList.add(s.correct ? "is-right" : "is-wrong");
      if (!s.correct) {
        problems.push(s.feedback || "That line has a slip in it. Check it against the rule.");
        kinds.push(s.kind || "unexplained");
      }
    }
    if (problems.length) onWrong([...new Set(problems)], kinds);
    else {
      made.forEach((m) => m.buttons.forEach((b) => (b.disabled = true)));
      checkBtn.remove();
      onCorrect();
    }
  }

  const checkBtn = button("Check", check, "btn btn-play");
  const element = el("div", { className: "eq-picker" }, [...made.map((m) => m.wrap), el("div", { className: "actions" }, [checkBtn])]);
  return {
    element,
    reveal() {
      made.forEach((m) => {
        const i = m.order.findIndex((o) => o.correct);
        m.select(m.order[i]);
        m.buttons.forEach((b, j) => b.classList.toggle("selected", j === i));
      });
      check();
    },
  };
}
