// panel.js — shows equations with KaTeX and links terms to arrows.
//
// Each term in an equation is wrapped in a CSS class like "term-T_AB"
// (see core/equations.js). Clicking a term tells the stage which force it
// belongs to, so the matching arrow can glow — and the reverse.

import { equationTex, termClass } from "../core/equations.js";

// Render KaTeX source into an element. Falls back to plain text if KaTeX
// failed to load, so the game never shows a blank box.
export function renderTex(el, tex, display = false) {
  if (globalThis.katex) {
    try {
      globalThis.katex.render(tex, el, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        // \htmlClass is what makes terms clickable; nothing else is trusted.
        trust: (ctx) => ctx.command === "\\htmlClass",
      });
      return;
    } catch {
      /* fall through to plain text */
    }
  }
  el.textContent = tex;
}

// Text with inline math between dollar signs, e.g. "Use $F\\cos\\theta$ here."
// A blank line starts a new paragraph; **double stars** make bold text.
export function renderMixed(el, text) {
  el.innerHTML = "";
  String(text).split(/\n\s*\n/).forEach((para) => {
    const p = document.createElement("p");
    para.split(/(\$[^$]+\$)/).forEach((chunk) => {
      if (chunk.startsWith("$") && chunk.endsWith("$") && chunk.length > 1) {
        // One unbreakable box per formula (style.css .mixed-math): a formula split
        // over two lines let tall fractions overlap the line above.
        const span = document.createElement("span");
        span.className = "mixed-math";
        renderTex(span, chunk.slice(1, -1));
        p.appendChild(span);
      } else {
        chunk.split(/(\*\*[^*]+\*\*)/).forEach((part) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            const b = document.createElement("strong");
            b.textContent = part.slice(2, -2);
            p.appendChild(b);
          } else if (part) {
            p.appendChild(document.createTextNode(part));
          }
        });
      }
    });
    el.appendChild(p);
  });
}

// Build an equation list inside `container`.
//   equations: list from the solver
//   mode: "symbolic" | "numeric"
//   extra: additional KaTeX lines (e.g. the solved values) shown underneath
//   onTermClick(id): called when a term is clicked
//   showResult: false hides the final "= 173 N" of resultant equations
export function renderEquations(container, equations, { mode = "symbolic", extra = [], onTermClick, showResult = true } = {}) {
  container.innerHTML = "";
  for (const eq of equations) {
    const row = document.createElement("div");
    row.className = "eq-row";
    renderTex(row, equationTex(eq, mode, { showResult }), true);
    container.appendChild(row);
  }
  for (const tex of extra) {
    const row = document.createElement("div");
    row.className = "eq-row eq-extra";
    renderTex(row, tex, true);
    container.appendChild(row);
  }
  if (onTermClick) {
    container.onclick = (e) => {
      const el = e.target.closest(".eqterm");
      if (!el) return;
      const cls = [...el.classList].find((c) => c.startsWith("term-"));
      if (cls) onTermClick(cls.slice(5), el);
    };
  }
}

// Light up every term belonging to force `id` (or clear with null).
export function highlightTerms(container, id) {
  container.querySelectorAll(".eqterm.lit").forEach((el) => el.classList.remove("lit"));
  if (id == null) return;
  container.querySelectorAll("." + termClass(id)).forEach((el) => el.classList.add("lit"));
}
