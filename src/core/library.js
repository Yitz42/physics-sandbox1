// library.js — the LESSON LIBRARY: situations written once and used by any
// stage, in any unit or chapter, each taking what its question needs.
//
// A library entry (a "scenario") is one real situation with its picture:
//   {
//     name:   "overhang"                       (shown to no one; used in the record of answers)
//     story:  "A beam rests on a pin at A …"   the picture in words (starts the instructions)
//     setup:  { … }                            the stage setup, as in any stage file
//     vary:   [ … ]                            its usual number changes (see paths.js)
//     view?:  { xmin, xmax, ymin, ymax }       a fixed window, for stages with sliders
//     questions: {                             what can be asked about it, by kind:
//       reactions: { instruction, ask, hints, solve?, explanation? … },
//       …
//     },
//   }
// A question kind's fields are written like a stage's (ask, hints, solve,
// goal, editable …); `instruction` is the sentence after the story.
//
// A stage takes scenarios with use(), one situation each:
//   situations: [overhang, cantilever].map((s) => use(s, "reactions"))
// …and can change one for its own question with edit() — take a load away,
// change a number, add a force — to make more versions from the same picture:
//   use(edit(overhang, { name: "overhang, no end load", remove: ["forces.#P"] }), "reactions")
// Everything here is plain data, so a stage file can still set anything itself:
//   use(overhang, "reactions", { hints: [ … ] })   (its own fields win)
//
// Knows nothing about physics: the scenarios live in content/<course>/library/.

import { clone, getPath, setPath } from "./paths.js";

// A scenario, checked for the fields every stage will need.
export function scenario(s) {
  const missing = ["name", "story", "setup"].filter((k) => s[k] == null);
  if (missing.length) throw new Error(`Library scenario "${s.name || "?"}" is missing ${missing.join(", ")}`);
  return { vary: [], questions: {}, ...s };
}

// One situation for a stage: the scenario's picture and numbers, the chosen
// question's fields, and the stage's own fields on top.
// question: a key of scenario.questions (or null: just the picture).
export function use(sc, question = null, own = {}) {
  const q = question == null ? {} : sc.questions[question];
  if (!q) throw new Error(`Library scenario "${sc.name}" has no question "${question}" (it has: ${Object.keys(sc.questions).join(", ") || "none"})`);
  const { instruction, ...fields } = q;
  const out = {
    name: sc.name,
    setup: clone(sc.setup),
    vary: clone(sc.vary),
    instructions: instruction ? `${sc.story} ${instruction}` : sc.story,
    ...(sc.view ? { view: sc.view } : {}),
    ...fields,
    ...own,
  };
  return out;
}

// A changed copy of a scenario. changes:
//   name, story        its new name and words (a changed picture needs both)
//   remove: [paths]    take things out: "forces.#P" (an item, by id), "loads.#w",
//                      or a field ("forces.#P.push"). Number changes (vary) on
//                      what's removed go too. (So library vary rules name list
//                      items by id — "loads.#w.w", not "loads.0.w" — which stays
//                      right when something before them is removed.)
//   set: { path: v }   new values (e.g. a different span); vary may still change them
//   fix: [paths]       stop these from changing between versions
//   add: { path: [items] }  put more items in a list, e.g. { forces: [ … ] }
//   vary: [rules]      more number changes, after the scenario's own
//   questions: { kind: { … } }  new or changed questions (merged with the old;
//                      null drops a question that no longer fits the picture)
//   (anything else, e.g. view, replaces the scenario's own)
export function edit(sc, changes = {}) {
  const { remove = [], set = {}, fix = [], add = {}, vary = [], questions = {}, ...rest } = changes;
  const setup = clone(sc.setup);
  let rules = clone(sc.vary);
  for (const path of remove) {
    removePath(setup, path);
    rules = rules.filter((r) => !pathsOf(r).some((p) => p === path || p.startsWith(`${path}.`)));
  }
  for (const [path, value] of Object.entries(set)) setPath(setup, path, clone(value));
  rules = rules.filter((r) => !pathsOf(r).some((p) => fix.includes(p)));
  for (const [path, items] of Object.entries(add)) {
    const list = getPath(setup, path);
    if (!Array.isArray(list)) throw new Error(`edit(${sc.name}): "${path}" isn't a list to add to`);
    list.push(...clone(items));
  }
  const qs = { ...sc.questions };
  for (const [k, v] of Object.entries(questions)) {
    if (v === null) delete qs[k]; // a question that no longer fits the changed picture
    else qs[k] = { ...(sc.questions[k] || {}), ...v };
  }
  return scenario({ ...sc, ...rest, setup, vary: [...rules, ...clone(vary)], questions: qs });
}

// The setup paths a vary rule changes ({ path } or { paths: [...] }).
const pathsOf = (rule) => (rule.paths ? rule.paths : [rule.path]);

// Remove what a path points to: a list item (by "#id" or index) or a field.
function removePath(obj, path) {
  const keys = String(path).split(".");
  const last = keys.pop();
  const parent = keys.length ? getPath(obj, keys.join(".")) : obj;
  if (parent == null) throw new Error(`remove: "${path}" not found`);
  if (Array.isArray(parent)) {
    const i = last.startsWith("#") ? parent.findIndex((x) => x && x.id === last.slice(1)) : Number(last);
    if (!(i >= 0 && i < parent.length)) throw new Error(`remove: "${path}" not found`);
    parent.splice(i, 1);
  } else {
    if (!(last in parent)) throw new Error(`remove: "${path}" not found`);
    delete parent[last];
  }
}
