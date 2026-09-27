// course.js — the Automatic Controls course: its chapters and units, in teaching order.
// Built the same way as statics (content/statics/course.js). The chapters follow
// the class textbook, Nise, "Control Systems Engineering" (7th ed.), chapter for
// chapter; each unit teaches one concept with the six stages explore → predict →
// build → debug → concept check → solve, and units are numbered by chapter (4.3).
//
// A chapter's `units` lists unit folders (built units) and soon(...) entries:
// planned units, shown on the course page as "Coming soon". To build one:
// create its folder (unit.js and stage files) and put the folder name in place
// of its soon(...) entry. See docs/CURRICULUM.md for what each unit will teach.
import reading from "./reading.js"; // the textbook chapter for each course chapter

// A planned unit: its title and one line on what it will teach.
const soon = (title, concept) => ({ title, concept, comingSoon: true });

const chapters = [
  {
    id: "introduction", title: "Introduction",
    units: [
      soon("Open and closed loop", "A closed-loop system measures its output and corrects itself, like cruise control; an open-loop one can't."),
      soon("What a control system must do", "The three goals: a good transient response, a small steady-state error, and stability."),
    ],
  },
  {
    id: "frequency-modeling", title: "Modeling in the frequency domain",
    units: [
      soon("Laplace transforms", "Turn a differential equation into algebra in $s$, solve it, and transform back with partial fractions."),
      soon("Transfer functions", "$G(s) = C(s)/R(s)$: a system's output over its input, with zero initial conditions."),
      soon("Electrical networks", "RLC circuits as transfer functions, using impedances $R$, $Ls$ and $\\frac{1}{Cs}$."),
      soon("Translational mechanical systems", "Masses, springs and dampers: impedances $Ms^2$, $K$ and $f_v s$, and equations of motion."),
      soon("Rotational systems and gears", "Inertias, torsional springs and dampers, and how gears scale them."),
      soon("Electromechanical systems", "The DC motor: from armature voltage to shaft angle."),
      soon("Linearization", "Replace a nonlinear system with a straight-line model near its operating point."),
    ],
  },
  {
    id: "time-modeling", title: "Modeling in the time domain",
    units: [
      soon("State-space representation", "$\\dot{x} = Ax + Bu$, $y = Cx + Du$: a system as first-order equations in its state variables."),
      soon("Transfer functions and state space", "Converting between the two: $G(s) = C(sI - A)^{-1}B + D$."),
    ],
  },
  {
    id: "time-response", title: "Time response",
    units: [
      soon("Poles, zeros and the response", "Where the poles are decides the shape of the response; zeros change how much of each part appears."),
      soon("First-order systems", "$\\frac{a}{s + a}$: the time constant $1/a$, rise time and settling time."),
      soon("Second-order systems", "Damping ratio $\\zeta$ and natural frequency $\\omega_n$: underdamped, critically damped, overdamped."),
      soon("Underdamped specifications", "Percent overshoot, peak time, settling time and rise time from $\\zeta$ and $\\omega_n$."),
      soon("Higher-order systems", "Dominant poles, and when a pole or zero can be ignored."),
    ],
  },
  {
    id: "reduction", title: "Reduction of multiple subsystems",
    units: ["block-diagrams", "signal-flow-graphs"],
  },
  {
    id: "stability", title: "Stability",
    units: [
      soon("Stability and pole locations", "Poles in the left half-plane die out; any in the right half-plane grow without limit."),
      soon("Routh–Hurwitz criterion", "Count the right half-plane poles from the characteristic equation, including the special cases."),
      soon("Stability with a gain", "The range of gain $K$ that keeps a closed loop stable."),
    ],
  },
  {
    id: "steady-state", title: "Steady-state errors",
    units: [
      soon("Steady-state error", "The error left after the response settles, from the final value theorem."),
      soon("System type and error constants", "Type 0, 1, 2 systems and $K_p$, $K_v$, $K_a$: the error for step, ramp and parabola inputs."),
      soon("Errors from disturbances", "How much a disturbance moves the output, and how feedback reduces it."),
    ],
  },
  {
    id: "root-locus", title: "Root locus techniques",
    units: [
      soon("Sketching the root locus", "Where the closed-loop poles go as the gain $K$ rises from 0: the basic sketching rules."),
      soon("Refining the sketch", "Asymptotes, breakaway points, $j\\omega$-axis crossings and angles of departure."),
      soon("Transient response via gain", "Choose $K$ on the root locus for a damping ratio or percent overshoot."),
    ],
  },
  {
    id: "root-locus-design", title: "Design via root locus",
    units: [
      soon("Improving steady-state error", "Ideal integral (PI) and lag compensation."),
      soon("Improving transient response", "Ideal derivative (PD) and lead compensation."),
      soon("PID and lag-lead design", "Improving both at once."),
    ],
  },
  {
    id: "frequency-response", title: "Frequency response techniques",
    units: [
      soon("Frequency response", "A sinusoid in gives a sinusoid out: its gain and phase shift, $G(j\\omega)$."),
      soon("Bode plots", "Magnitude in dB and phase against frequency, built from straight-line asymptotes."),
      soon("Nyquist criterion", "Encirclements of $-1$ tell you how many closed-loop poles are unstable."),
      soon("Gain and phase margins", "How far a loop is from instability, from the Nyquist diagram or Bode plot."),
    ],
  },
  {
    id: "frequency-design", title: "Design via frequency response",
    units: [
      soon("Transient response via gain", "Setting the gain for a phase margin, and so a percent overshoot."),
      soon("Lag compensation", "Cut the steady-state error without changing the transient response much."),
      soon("Lead compensation", "Add phase margin and speed up the response."),
    ],
  },
  {
    id: "state-design", title: "Design via state space",
    units: [
      soon("Controllability and pole placement", "State feedback $u = -Kx$ puts the closed-loop poles where you want them."),
      soon("Observers", "Estimate the states you can't measure, from the output."),
    ],
  },
  {
    id: "digital", title: "Digital control systems",
    units: [
      soon("Sampling and the z-transform", "Computers control in samples: the z-transform does for them what Laplace does for continuous systems."),
      soon("Digital stability and design", "Stability inside the unit circle, and turning a continuous design into a digital one."),
    ],
  },
];

export default {
  id: "controls",
  title: "Automatic Controls",
  subject: "controls",
  reading,
  description: "An intro automatic controls course following Nise's Control Systems Engineering: modeling, time response, stability, steady-state error, root locus, frequency response and design.",
  chapters,
  units: chapters.flatMap((c) => c.units.filter((u) => typeof u === "string")), // the built units, in order
};
