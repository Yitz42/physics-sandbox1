// controls.js — small helpers that build buttons, sliders and inputs.
//
// Building DOM elements by hand is wordy; these helpers keep challenge code
// short and make every control look and behave the same way.

import { getPath, setPath } from "../core/paths.js";
import { unitLabel } from "../core/units.js";

// el("div", { className: "x", onclick: fn }, [children]) → element
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === "dataset") Object.assign(node.dataset, v);
    else if (k in node) node[k] = v;
    else node.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

export function button(text, onClick, className = "btn") {
  return el("button", { type: "button", className, textContent: text, onclick: onClick });
}

// The big "Test" button (predict and build stages), with a clipboard-and-tick icon.
export function testButton(onClick, text = "Test") {
  const b = el("button", { type: "button", className: "btn btn-play btn-test", onclick: onClick });
  b.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 4h6v3H9zM8 5.5H6.5A1.5 1.5 0 0 0 5 7v12.5A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V7a1.5 1.5 0 0 0-1.5-1.5H16M8.5 14l2.5 2.5 4.5-5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  b.append(el("span", { textContent: text }));
  return b;
}

// A labelled slider bound to a path in the setup. Calls onChange() after edits.
//   spec: { path, label, min, max, step, unit }
// The value can also be typed into the box beside the slider (for exact
// numbers like 36.5°); typed values are kept within the slider's range.
export function slider(getSetup, spec, onChange) {
  const input = el("input", { type: "range", min: spec.min, max: spec.max, step: spec.step || 1 });
  const box = el("input", { type: "number", className: "slider-number", min: spec.min, max: spec.max, step: "any", inputMode: "decimal" });
  const value = el("span", { className: "slider-value" }, [box, spec.unit ? el("span", { className: "slider-unit", textContent: unitLabel(spec.unit) }) : null]);
  const sync = () => {
    const v = getPath(getSetup(), spec.path);
    input.value = v;
    // How far along the slider is, for the filled part of its track (style.css).
    input.style.setProperty("--fill", `${(100 * (v - spec.min)) / (spec.max - spec.min || 1)}%`);
    if (document.activeElement !== box) box.value = +Number(v).toFixed(3); // don't overwrite while typing
  };
  const apply = (v) => {
    if (!Number.isFinite(v)) return sync(); // not a number: put the old value back
    setPath(getSetup(), spec.path, Math.min(spec.max, Math.max(spec.min, v)));
    onChange();
    sync();
  };
  input.addEventListener("input", () => apply(Number(input.value)));
  // Typed values apply when you press Enter or leave the box.
  box.addEventListener("change", () => {
    apply(parseFloat(String(box.value).replace("−", "-")));
    box.value = +Number(getPath(getSetup(), spec.path)).toFixed(3);
  });
  box.addEventListener("keydown", (e) => e.key === "Enter" && box.blur());
  sync();
  const row = el("div", { className: "control-row" }, [el("span", { className: "control-label", textContent: spec.label }), input, value]);
  row.sync = sync; // lets the stage refresh the display after a drag
  return row;
}

// A dropdown whose options each set one or more paths.
//   spec: { label, options: [{ label, set: { "path": value, ... } }] }
export function select(getSetup, spec, onChange) {
  const input = el("select", {}, spec.options.map((o, i) => el("option", { value: i, textContent: o.label })));
  const sync = () => {
    const s = getSetup();
    const i = spec.options.findIndex((o) => Object.entries(o.set).every(([p, v]) => JSON.stringify(getPath(s, p)) === JSON.stringify(v)));
    if (i >= 0) input.value = i;
  };
  input.addEventListener("change", () => {
    const o = spec.options[Number(input.value)];
    for (const [p, v] of Object.entries(o.set)) setPath(getSetup(), p, v);
    onChange();
  });
  sync();
  const row = el("label", { className: "control-row" }, [el("span", { className: "control-label", textContent: spec.label }), input]);
  row.sync = sync;
  return row;
}

// Build the right control for each entry of a stage's `editable` list.
export function buildControls(container, getSetup, specs, onChange) {
  const rows = specs.map((spec) => (spec.options ? select(getSetup, spec, onChange) : slider(getSetup, spec, onChange)));
  rows.forEach((r) => container.appendChild(r));
  return { syncAll: () => rows.forEach((r) => r.sync()) };
}

// Two-way toggle (e.g. Symbols | Numbers). Returns the element.
export function toggle(options, current, onChange) {
  const wrap = el("div", { className: "toggle", role: "group" });
  for (const o of options) {
    const b = button(o.label, () => {
      wrap.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
      onChange(o.value);
    }, "toggle-btn" + (o.value === current ? " on" : ""));
    wrap.appendChild(b);
  }
  return wrap;
}
