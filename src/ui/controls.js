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

// A labelled slider bound to a path in the setup. Calls onChange() after edits.
//   spec: { path, label, min, max, step, unit }
export function slider(getSetup, spec, onChange) {
  const value = el("span", { className: "slider-value" });
  const input = el("input", { type: "range", min: spec.min, max: spec.max, step: spec.step || 1 });
  const sync = () => {
    const v = getPath(getSetup(), spec.path);
    input.value = v;
    value.textContent = `${v}${spec.unit ? " " + unitLabel(spec.unit) : ""}`;
  };
  input.addEventListener("input", () => {
    setPath(getSetup(), spec.path, Number(input.value));
    sync();
    onChange();
  });
  sync();
  const row = el("label", { className: "control-row" }, [el("span", { className: "control-label", textContent: spec.label }), input, value]);
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
