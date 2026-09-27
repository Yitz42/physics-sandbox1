// force3d-tools.js — for forces in 3D (Unit 2.3): the component equations, the lines
// under them (r_AB, u_AB, size, direction angles), the answers common slips give, a
// student's working with one wrong line (debug) and the lines to choose from (solve).

import { fixedTex, sigFig } from "../../core/units.js";
import { solveForce3d, directionOf3, pointOf, componentSymbol, cosd, acosd, DEG } from "./force3d.js";

const n4 = (v) => sigFig(v, 4);
const AX = ["x", "y", "z"];
const n1 = (v) => (Math.abs(v) < 0.05 ? 0 : v).toFixed(1);
const n3 = (v) => (Math.abs(v) < 0.0005 ? 0 : v).toFixed(3);

// {a i + b j + c k} with a unit, e.g. {120.0 i − 160.0 j + 90.0 k} N.
export function vecTex(v, unit = "", fmt = n1) {
  const parts = v.map((c, i) => {
    const t = fmt(Math.abs(c));
    const sign = c < 0 && Number(t) !== 0 ? "-" : "+";
    return `${i === 0 ? (sign === "-" ? "-" : "") : ` ${sign} `}${t}\\,\\mathbf{${["i", "j", "k"][i]}}`;
  });
  return `\\{${parts.join("")}\\}${unit ? `\\,\\text{${unit}}` : ""}`;
}

const lineName = (f) => `${f.dir.from}${f.dir.to}`;

// ---- Equations: F_x = F cos α …, each force; F_Rx = ΣF_x … for a resultant ----------------

function factorFor(f, setup, i) {
  const d = f.dir || {};
  if (d.angles) {
    const ang = d.angles[i] ?? acosd(directionOf3(f, setup).u[i]);
    const a = `${n4(ang)}^\\circ`;
    return { tex: `\\cos ${a}`, value: cosd(ang), alt: { tex: `\\sin ${a}`, value: Math.sin(ang * DEG) } };
  }
  if (d.azimuth != null) {
    const [t, p] = [`${n4(d.azimuth)}^\\circ`, `${n4(d.elevation)}^\\circ`];
    const [ct, st, cp, sp] = [cosd(d.azimuth), Math.sin(d.azimuth * DEG), cosd(d.elevation), Math.sin(d.elevation * DEG)];
    if (i === 0) return { tex: `\\cos ${p} \\cos ${t}`, value: cp * ct, alt: { tex: `\\cos ${t}`, value: ct } };
    if (i === 1) return { tex: `\\cos ${p} \\sin ${t}`, value: cp * st, alt: { tex: `\\sin ${t}`, value: st } };
    return { tex: `\\sin ${p}`, value: sp, alt: { tex: `\\cos ${p}`, value: cp } };
  }
  if (d.from) {
    const g = directionOf3(f, setup);
    const [A, B] = [d.from, d.to];
    return { tex: `\\dfrac{${AX[i]}_${B} - ${AX[i]}_${A}}{r_{${A}${B}}}`, numTex: `\\left(\\dfrac{${n4(g.r[i])}}{${n4(g.len)}}\\right)`, value: g.u[i] };
  }
  return null;
}

export function force3dEquations(setup, result) {
  const res = result || solveForce3d(setup);
  const v = res.values;
  const eqs = [];
  for (const f of setup.forces || []) {
    if (!f.dir || f.dir.components) continue;
    AX.forEach((k, i) => {
      const factor = factorFor(f, setup, i);
      if (!factor) return;
      eqs.push({ id: `${f.id}.${k}`, lhs: componentSymbol(f.symbol, k), form: "define", terms: [{ id: f.id, sign: 1, symbol: f.symbol, value: f.magnitude, factor }], result: { value: v[`${f.id}.${k}`], unit: "N" } });
    });
  }
  if (setup.resultant) {
    AX.forEach((k) => {
      const terms = (setup.forces || []).map((f) => {
        const c = v[`${f.id}.${k}`];
        return { id: f.id, sign: c < 0 ? -1 : 1, symbol: componentSymbol(f.symbol, k), value: Math.abs(c) };
      });
      eqs.push({ id: `R.${k}`, lhs: `F_{R${k}} = \\Sigma F_${k}`, form: "define", terms, result: { value: v[`R.${k}`], unit: "N" } });
    });
  }
  return eqs;
}

// ---- The lines under the equations ------------------------------------------------------

// hideAnswers (a solve stage before its answer step is done): the resultant's size and
// angles — what that step asks for — stay hidden; its components show.
export function force3dSummary(setup, result, { reveal = true, hideAnswers = false } = {}) {
  const res = result || solveForce3d(setup);
  const v = res.values;
  const lines = [];
  if (res.status === "unstable") return lines; // (the message says why)
  if (!reveal) return lines;
  for (const f of setup.forces || []) {
    const d = f.dir || {};
    const F = v[f.id];
    const vec = AX.map((k) => v[`${f.id}.${k}`]);
    if (d.from) {
      const AB = lineName(f), r = [v[`${f.id}.rx`], v[`${f.id}.ry`], v[`${f.id}.rz`]];
      lines.push(`\\mathbf{r}_{${AB}} = \\mathbf{r}_${d.to} - \\mathbf{r}_${d.from} = ${vecTex(r, "m", (x) => n4(x))}, \\quad r_{${AB}} = \\sqrt{${r.map((c) => `(${n4(c)})^2`).join(" + ")}} = ${fixedTex(v[`${f.id}.r`], "m", 3)}`);
      lines.push(`\\mathbf{u}_{${AB}} = \\dfrac{\\mathbf{r}_{${AB}}}{r_{${AB}}} = ${vecTex(r.map((c) => c / v[`${f.id}.r`]), "", n3)}, \\quad \\mathbf{${f.symbol}} = ${f.symbol}\\,\\mathbf{u}_{${AB}} = ${vecTex(vec, "N")}`);
    } else if (d.components) {
      lines.push(`${f.symbol} = \\sqrt{${vec.map((c) => `(${n4(c)})^2`).join(" + ")}} = ${fixedTex(F, "N")}`);
    } else {
      lines.push(`\\mathbf{${f.symbol}} = ${vecTex(vec, "N")}`);
    }
    if (d.angles && d.angles[2] == null) {
      const [a, b] = d.angles;
      lines.push(`\\cos\\gamma = ${d.gamma === "obtuse" ? "-" : "+"}\\sqrt{1 - \\cos^2 ${n4(a)}^\\circ - \\cos^2 ${n4(b)}^\\circ} = ${n4(vec[2] / F)}, \\quad \\gamma = ${fixedTex(v[`${f.id}.gamma`], "deg")}`);
    }
    if (d.components || d.from) {
      lines.push(`\\alpha = \\cos^{-1}\\dfrac{${componentSymbol(f.symbol, "x")}}{${f.symbol}} = ${fixedTex(v[`${f.id}.alpha`], "deg")}, \\quad \\beta = ${fixedTex(v[`${f.id}.beta`], "deg")}, \\quad \\gamma = ${fixedTex(v[`${f.id}.gamma`], "deg")}`);
    }
  }
  if (setup.resultant) {
    const R = AX.map((k) => v[`R.${k}`]);
    if (hideAnswers) return [...lines, `\\mathbf{F}_R = ${vecTex(R, "N")}`];
    lines.push(`\\mathbf{F}_R = ${vecTex(R, "N")}, \\quad F_R = \\sqrt{${R.map((c) => `(${n4(c)})^2`).join(" + ")}} = ${fixedTex(v.R, "N")}`);
    lines.push(`\\alpha = \\cos^{-1}\\dfrac{F_{Rx}}{F_R} = ${fixedTex(v["R.alpha"], "deg")}, \\quad \\beta = ${fixedTex(v["R.beta"], "deg")}, \\quad \\gamma = ${fixedTex(v["R.gamma"], "deg")}`);
  }
  return lines;
}

// ---- Answers that common slips give ------------------------------------------------------

export function force3dMistakes(setup, name) {
  const res = solveForce3d(setup);
  const v = res.values;
  const right = v[name];
  const list = [];
  const add = (value, message, kind) => {
    if (!Number.isFinite(value) || Math.abs(value - right) < 1e-6 * Math.max(1, Math.abs(right))) return;
    if (!list.some((m) => Math.abs(m.value - value) < 1e-9)) list.push({ value, message, kind });
  };
  const [id, part] = name.split(".");
  const f = (setup.forces || []).find((x) => x.id === id);
  if (f) {
    const d = f.dir || {};
    const F = v[id];
    const i = AX.indexOf(part);
    if (i >= 0) {
      add(-right, "Right size, wrong sign: check which way the force points along that axis.", "sign");
      if (d.angles) add(F * Math.sin(Math.acos(v[`${id}.u${part}`])), "Each component uses the COSINE of its own direction angle: $F_x = F\\cos\\alpha$, $F_y = F\\cos\\beta$, $F_z = F\\cos\\gamma$.", "trig");
      if (d.azimuth != null && i < 2) add(F * (i === 0 ? cosd(d.azimuth) : Math.sin(d.azimuth * DEG)), "First find the part in the x-y plane, $F' = F\\cos\\phi$ — then split THAT with θ.", "missing");
      if (d.azimuth != null && i === 2) add(F * cosd(d.elevation), "φ is measured UP from the x-y plane, so the vertical part is $F\\sin\\phi$.", "trig");
      if (d.from) {
        const r = v[`${id}.r`], rc = v[`${id}.r${part}`];
        add(F * rc, "Divide by the length: $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$ has length 1 — then multiply by F.", "missing");
        add((F * rc) / (r * r), "The length is the SQUARE ROOT of the sum of squares: $r = \\sqrt{x^2 + y^2 + z^2}$.", "algebra");
      }
    }
    if (part === "gamma" && d.angles && d.angles[2] == null) {
      const [a, b] = d.angles;
      add(180 - right, "There are two directions with these α and β — one pointing up, one down. The picture shows which: γ is acute if the force points up.", "sign");
      add(acosd(1 - cosd(a) ** 2 - cosd(b) ** 2), "Take the square root: $\\cos\\gamma = \\sqrt{1 - \\cos^2\\alpha - \\cos^2\\beta}$.", "algebra");
      add(right * DEG, "That's in radians. Switch your calculator to degrees.", "calculator");
    }
    if (["alpha", "beta", "gamma"].includes(part)) {
      const j = ["alpha", "beta", "gamma"].indexOf(part);
      add(90 - right, `That's the angle from the other side: the direction angle uses $\\cos^{-1}(${componentSymbol(f.symbol, AX[j])}/${f.symbol})$ — cosine, from its own axis.`, "trig");
      add(right * DEG, "That's in radians. Switch your calculator to degrees.", "calculator");
    }
    if (part === undefined && d.components) {
      const c = d.components;
      add(c[0] + c[1] + c[2], "The components are at right angles: add them like Pythagoras, $F = \\sqrt{F_x^2 + F_y^2 + F_z^2}$.", "vector");
      add(c[0] ** 2 + c[1] ** 2 + c[2] ** 2, "Take the square root of the sum of squares.", "algebra");
    }
    if (part === "r" && d.from) {
      const r = v[`${id}.r`];
      add(r * r, "Take the square root of the sum of squares.", "algebra");
      add(Math.abs(v[`${id}.rx`]) + Math.abs(v[`${id}.ry`]) + Math.abs(v[`${id}.rz`]), "The three differences are at right angles: $r = \\sqrt{\\Delta x^2 + \\Delta y^2 + \\Delta z^2}$, not their sum.", "vector");
    }
  }
  if (id === "R") {
    if (part === undefined) add((setup.forces || []).reduce((s, g) => s + v[g.id], 0), "Forces in different directions don't add by size: add their components, then $F_R = \\sqrt{F_{Rx}^2 + F_{Ry}^2 + F_{Rz}^2}$.", "vector");
    if (["alpha", "beta", "gamma"].includes(part)) add(right * DEG, "That's in radians. Switch your calculator to degrees.", "calculator");
    if (AX.includes(part)) for (const g of setup.forces || []) add(right - v[`${g.id}.${part}`], `Did you leave out ${g.symbol}? Every force's component goes in the sum.`, "missing");
  }
  return list;
}

// ---- A student's working for a force along a line, one line wrong (debug "steps") ----------
// mutation.slip: "backwards" (r_A − r_B), "noRoot" (r = x² + y² + z²), "sign" (one difference's
// sign), "noUnit" (F r_AB instead of F u_AB).

export function force3dSteps(setup, mutation) {
  const f = setup.forces.find((x) => x.dir && x.dir.from);
  const v = solveForce3d(setup).values;
  const [A, B] = [f.dir.from, f.dir.to];
  const AB = `${A}${B}`;
  const F = f.magnitude;
  const r = [v[`${f.id}.rx`], v[`${f.id}.ry`], v[`${f.id}.rz`]];
  const len = v[`${f.id}.r`];
  const slip = mutation.slip;
  const signAt = r.findIndex((c) => Math.abs(c) > 1e-9);
  const rW = slip === "backwards" ? r.map((c) => -c) : slip === "sign" ? r.map((c, i) => (i === signAt ? -c : c)) : r;
  const lenW = slip === "noRoot" ? len * len : len;
  const uW = rW.map((c) => c / lenW);
  const FW = slip === "noUnit" ? rW.map((c) => F * c) : uW.map((c) => F * c);
  const lineR = (rv) => `\\mathbf{r}_{${AB}} = \\mathbf{r}_${B} - \\mathbf{r}_${A} = ${vecTex(rv, "m", (x) => n4(x))}`;
  // (The length line squares the student's own components.)
  const lineLen = (L, root = true, rv = r) => `r_{${AB}} = ${root ? "\\sqrt{" : ""}${rv.map((c) => `(${n4(c)})^2`).join(" + ")}${root ? "}" : ""} = ${fixedTex(L, "m", 3)}`;
  const lineU = (u) => `\\mathbf{u}_{${AB}} = \\dfrac{\\mathbf{r}_{${AB}}}{r_{${AB}}} = ${vecTex(u, "", n3)}`;
  const lineF = (Fv, viaR = false) => `\\mathbf{${f.symbol}} = ${f.symbol}\\,\\mathbf{${viaR ? "r" : "u"}}_{${AB}} = (${F})${viaR ? "\\mathbf{r}" : "\\mathbf{u}"}_{${AB}} = ${vecTex(Fv, "N")}`;
  const correct = [lineR(r), lineLen(len), lineU(r.map((c) => c / len)), lineF(r.map((c) => (F * c) / len))];
  const lines = [
    { id: "r", tex: slip === "backwards" ? `\\mathbf{r}_{${AB}} = \\mathbf{r}_${A} - \\mathbf{r}_${B} = ${vecTex(rW, "m", (x) => n4(x))}` : lineR(rW) },
    { id: "len", tex: slip === "noRoot" ? lineLen(lenW, false, rW) : lineLen(lenW, true, rW) },
    { id: "u", tex: lineU(uW) },
    { id: "F", tex: slip === "noUnit" ? lineF(FW, true) : lineF(FW) },
  ];
  const WHY = {
    backwards: { wrong: "r", kind: "direction", fix: "Subtract the other way: $\\mathbf{r}_B - \\mathbf{r}_A$ (from A to B)",
      explain: `The cable pulls from ${A} toward ${B}, so the position vector goes from ${A} to ${B}: $\\mathbf{r}_{${AB}} = \\mathbf{r}_${B} - \\mathbf{r}_${A}$ — the END minus the START. Backwards, every component has the wrong sign.` },
    sign: { wrong: "r", kind: "sign", fix: `Fix the sign of the ${AX[signAt]} part`,
      explain: `The ${AX[signAt]} part is $${AX[signAt]}_${B} - ${AX[signAt]}_${A}$ = ${n4(r[signAt])} m: check the signs of the coordinates in the key.` },
    noRoot: { wrong: "len", kind: "algebra", fix: "Take the square root: $r = \\sqrt{x^2 + y^2 + z^2}$",
      explain: "The length of a vector is the SQUARE ROOT of the sum of its components squared (Pythagoras, in 3D)." },
    noUnit: { wrong: "F", kind: "missing", fix: "Multiply F by the UNIT vector $\\mathbf{u}_{AB}$, not by $\\mathbf{r}_{AB}$",
      explain: "$\\mathbf{r}_{AB}$ is in metres and as long as the cable. Only the unit vector (length 1) carries just the direction: $\\mathbf{F} = F\\,\\mathbf{u}_{AB}$." },
  }[slip];
  const ids = lines.map((l) => l.id);
  const follows = lines.filter((l, i) => ids.indexOf(l.id) > ids.indexOf(WHY.wrong) && l.tex !== correct[i]).map((l) => l.id);
  // Two tempting wrong fixes: any of these that isn't this slip's own fix.
  const others = [
    { key: "noRoot", label: "Take the square root in the length", feedback: "The length line is right. Look at where the numbers first go wrong." },
    { key: "swap", label: "Swap two of the components", feedback: "The components are in the right places. Check their signs, or what F multiplies." },
    { key: "backwards", label: "Subtract the other way round", feedback: "The subtraction is the right way round: B minus A." },
    { key: "noUnit", label: "Multiply F by the unit vector", feedback: "It does use the unit vector. Check the lines before it." },
  ].filter((o) => o.key !== slip).slice(0, 2).map(({ label, feedback }) => ({ label, feedback }));
  return { lines, wrong: WHY.wrong, follows, fixes: [{ label: WHY.fix, correct: true }, ...others], explain: WHY.explain, kind: WHY.kind, corrected: correct };
}

// ---- Lines to choose from (solve, "choices") ------------------------------------------------
// For every force along a line: r, then F; then the resultant.

export function force3dChoices(setup, result) {
  const v = (result || solveForce3d(setup)).values;
  const groups = [];
  const lined = (setup.forces || []).filter((f) => f.dir && f.dir.from);
  for (const f of lined) {
    const [A, B] = [f.dir.from, f.dir.to];
    const AB = `${A}${B}`;
    const r = [v[`${f.id}.rx`], v[`${f.id}.ry`], v[`${f.id}.rz`]];
    const len = v[`${f.id}.r`];
    const k = r.findIndex((c) => Math.abs(c) > 1e-9);
    groups.push({
      title: `The position vector from ${A} to ${B}`,
      options: [
        { tex: `\\mathbf{r}_{${AB}} = ${vecTex(r, "m", (x) => n4(x))}`, correct: true },
        { tex: `\\mathbf{r}_{${AB}} = ${vecTex(r.map((c) => -c), "m", (x) => n4(x))}`, kind: "direction", feedback: `That's from ${B} to ${A}: subtract the START from the END, $\\mathbf{r}_${B} - \\mathbf{r}_${A}$.` },
        { tex: `\\mathbf{r}_{${AB}} = ${vecTex(r.map((c, i) => (i === k ? -c : c)), "m", (x) => n4(x))}`, kind: "sign", feedback: `Check the ${AX[k]} part: $${AX[k]}_${B} - ${AX[k]}_${A}$.` },
      ],
    });
    const F = v[f.id];
    const Fv = AX.map((c) => v[`${f.id}.${c}`]);
    groups.push({
      title: `The force $${f.symbol}$ = ${n4(F)} N along ${AB} ($r_{${AB}}$ = ${n4(len)} m)`,
      options: [
        { tex: `\\mathbf{${f.symbol}} = ${vecTex(Fv, "N")}`, correct: true },
        { tex: `\\mathbf{${f.symbol}} = ${vecTex(r.map((c) => F * c), "N")}`, kind: "missing", feedback: "That multiplies F by $\\mathbf{r}_{AB}$ itself. Divide by its length first: $\\mathbf{u}_{AB} = \\mathbf{r}_{AB}/r_{AB}$." },
        { tex: `\\mathbf{${f.symbol}} = ${vecTex(r.map((c) => (F * c) / (len * len)), "N")}`, kind: "algebra", feedback: "That divides by $r^2$ — the length is $\\sqrt{x^2 + y^2 + z^2}$, not the sum of squares." },
      ],
    });
  }
  if (setup.resultant) {
    const R = AX.map((c) => v[`R.${c}`]);
    const [f1, f2] = setup.forces;
    const only = AX.map((c) => v[`${f1.id}.${c}`]);
    const diff = AX.map((c) => v[`${f1.id}.${c}`] - v[`${f2.id}.${c}`]);
    groups.push({
      title: "The resultant, $\\mathbf{F}_R = \\Sigma\\mathbf{F}$",
      options: [
        { tex: `\\mathbf{F}_R = ${vecTex(R, "N")}`, correct: true },
        { tex: `\\mathbf{F}_R = ${vecTex(diff, "N")}`, kind: "sign", feedback: "That subtracts one force. The resultant ADDS them, component by component." },
        { tex: `\\mathbf{F}_R = ${vecTex(only, "N")}`, kind: "missing", feedback: "That's just one of the forces. Add every force's components." },
      ],
    });
  }
  return groups;
}

export { pointOf };
