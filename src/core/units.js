// units.js — formatting numbers with units for display.
//
// Engineering textbooks usually show 3 significant figures (e.g. 346 N,
// 2.45 kN, 0.866). We follow that so the game's numbers look like the book's.

// Round to `sig` significant figures and return a string without
// scientific notation (e.g. 0.000123 → "0.000123", 12345 → "12300").
export function sigFig(value, sig = 3) {
  if (!Number.isFinite(value)) return String(value);
  if (value === 0) return "0";
  const digits = Math.floor(Math.log10(Math.abs(value)));
  const decimals = Math.max(0, sig - 1 - digits);
  const factor = Math.pow(10, digits - sig + 1);
  const rounded = Math.round(value / factor) * factor;
  // toFixed removes floating-point noise like 346.40000000000003
  let text = rounded.toFixed(Math.min(decimals, 10));
  if (text.includes(".")) text = text.replace(/\.?0+$/, "");
  return text === "-0" ? "0" : text;
}

// Units we know how to show. `tex` is the KaTeX version, `text` is plain text.
const UNITS = {
  N: { text: "N", tex: "\\text{N}" },
  kN: { text: "kN", tex: "\\text{kN}" },
  m: { text: "m", tex: "\\text{m}" },
  kg: { text: "kg", tex: "\\text{kg}" },
  "N·m": { text: "N·m", tex: "\\text{N}\\!\\cdot\\!\\text{m}" },
  "N/m": { text: "N/m", tex: "\\text{N/m}" }, // a distributed load: newtons per metre of beam
  mm: { text: "mm", tex: "\\text{mm}" },
  "mm^2": { text: "mm²", tex: "\\text{mm}^2" },
  "m^2": { text: "m²", tex: "\\text{m}^2" },
  "m/s^2": { text: "m/s²", tex: "\\text{m/s}^2" }, // acceleration (g = 9.81 m/s²)
  // (Area moments of inertia of beam sections, in the textbook's usual size.)
  "10^6 mm^4": { text: "×10⁶ mm⁴", tex: "\\times 10^6\\,\\text{mm}^4" },
  Pa: { text: "Pa", tex: "\\text{Pa}" },
  kPa: { text: "kPa", tex: "\\text{kPa}" },
  MPa: { text: "MPa", tex: "\\text{MPa}" },
  GPa: { text: "GPa", tex: "\\text{GPa}" },
  deg: { text: "°", tex: "^\\circ" },
  "": { text: "", tex: "" },
};

function texOfUnit(unit) {
  if (!unit) return "";
  if (UNITS[unit]) return UNITS[unit].tex;
  if (unit.startsWith("\\") || unit.includes("\\text")) return unit;
  if (unit.includes("^")) {
    return unit.replace(/([a-zA-Z]+)\^([0-9]+)/g, "\\text{$1}^{$2}");
  }
  return `\\text{${unit}}`;
}

// Plain-text value with unit, e.g. format(346.41, "N") → "346 N".
// Forces of 10 000 N or more switch to kN so numbers stay readable.
export function format(value, unit = "", sig = 3) {
  if (unit === "N" && Math.abs(value) >= 10000) return format(value / 1000, "kN", sig);
  if (unit === "deg") return `${sigFig(value, sig)}°`;
  const u = UNITS[unit] ? UNITS[unit].text : unit;
  return u ? `${sigFig(value, sig)} ${u}` : sigFig(value, sig);
}

// Same as format() but as KaTeX source, e.g. "346\,\text{N}".
export function formatTex(value, unit = "", sig = 3) {
  if (unit === "N" && Math.abs(value) >= 10000) return formatTex(value / 1000, "kN", sig);
  const num = sigFig(value, sig);
  if (unit === "deg") return `${num}^\\circ`;
  const u = texOfUnit(unit);
  return u ? `${num}\\,${u}` : num;
}

// KaTeX for a unit on its own, e.g. unitTex("N·m") → "\text{N}\!\cdot\!\text{m}".
// (KaTeX can't put the "·" character inside \text{}, so N·m is built from parts.)
export function unitTex(unit) {
  return texOfUnit(unit);
}

// Unit label for an input box, e.g. "N" or "°".
export function unitLabel(unit) {
  return UNITS[unit] ? UNITS[unit].text : unit;
}

// KaTeX for a value to a fixed number of decimals, e.g. fixedTex(359.07, "N") → "359.1\,\text{N}".
// Used for final answers, which students must match to ±0.1.
export function fixedTex(value, unit = "", decimals = 1) {
  const num = (Math.abs(value) < 0.5 * 10 ** -decimals ? 0 : value).toFixed(decimals);
  if (unit === "deg") return `${num}^\\circ`;
  const u = texOfUnit(unit);
  return u ? `${num}\\,${u}` : num;
}
