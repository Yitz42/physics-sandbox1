// angle-options.js — the "θ measured from … toward …" dropdown for stages
// that let the student set a force's direction. Uses axis names (x and y)
// rather than words like "above/below", matching how directions are written
// in stage files: { angle, from: "+x", toward: "+y" }.
//
// forcePath: path to the force, e.g. "forces.0" or "forces.#F2"

const AXES_FROM_X = [["+x", "+y"], ["+x", "-y"], ["-x", "+y"], ["-x", "-y"]];
const AXES_FROM_Y = [["+y", "+x"], ["+y", "-x"], ["-y", "+x"], ["-y", "-x"]];
const pretty = (axis) => axis.replace("-", "−"); // real minus sign

export function angleOptions(forcePath, label = "θ measured") {
  return {
    label,
    options: [...AXES_FROM_X, ...AXES_FROM_Y].map(([from, toward]) => ({
      label: `from ${pretty(from)} toward ${pretty(toward)}`,
      set: { [`${forcePath}.direction.from`]: from, [`${forcePath}.direction.toward`]: toward },
    })),
  };
}
