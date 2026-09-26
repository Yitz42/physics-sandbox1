// canvas.js — a drawing surface measured in metres, with y pointing UP.
//
// The screen measures pixels with y pointing DOWN. Physics uses metres with
// y pointing UP. This file converts between the two so everything else can
// think in physics coordinates: toScreen([1, 2]) gives the pixel for the
// point 1 m right and 2 m up.
//
// It also keeps the picture sharp on high-resolution screens and passes mouse,
// pen and finger input along (already converted to metres).

const PAD = 36; // pixels of breathing room around the picture

export function createCanvas(container) {
  const canvas = document.createElement("canvas");
  canvas.className = "stage-canvas";
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  // bounds = the region of the world we want visible: { xmin, xmax, ymin, ymax }
  let bounds = { xmin: -3, xmax: 3, ymin: -2, ymax: 2 };
  let view = { scale: 50, ox: 0, oy: 0, width: 0, height: 0 };
  let redraw = () => {};
  let onResize = null;
  let handlers = {};

  // Choose scale and origin so `bounds` fits inside the canvas, centred.
  function layout() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return false; // hidden or not on the page yet
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width;
    const height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // draw in CSS pixels
    const pad = PAD; // pixels of breathing room around the picture
    const bw = bounds.xmax - bounds.xmin || 1;
    const bh = bounds.ymax - bounds.ymin || 1;
    const scale = Math.min((width - 2 * pad) / bw, (height - 2 * pad) / bh);
    const cx = (bounds.xmin + bounds.xmax) / 2;
    const cy = (bounds.ymin + bounds.ymax) / 2;
    view = { scale, ox: width / 2 - cx * scale, oy: height / 2 + cy * scale, width, height };
    return true;
  }

  const api = {
    canvas,
    ctx,
    get view() {
      return view;
    },
    toScreen: (p) => [view.ox + p[0] * view.scale, view.oy - p[1] * view.scale],
    toWorld: (px) => [(px[0] - view.ox) / view.scale, (view.oy - px[1]) / view.scale],
    // Pixel distance → metres (used for "how close is the click to this arrow").
    pxToWorld: (px) => px / view.scale,
    // { width, height } in pixels, or null before the canvas is on the page.
    // Side-by-side diagrams use it to centre each one in its half (render/panels.js).
    size() {
      const r = canvas.getBoundingClientRect();
      return r.width > 2 * PAD && r.height > 2 * PAD ? { width: r.width, height: r.height } : null;
    },
    fit(newBounds) {
      bounds = { ...newBounds };
      if (layout()) redraw();
    },
    // Called when the canvas changes size (after it first appears). Return false to
    // let the canvas simply redraw at the new size, keeping the same view.
    onResize(fn) {
      onResize = fn;
    },
    clear() {
      ctx.clearRect(0, 0, view.width, view.height);
    },
    onRedraw(fn) {
      redraw = fn;
    },
    // handlers: { down(point, event), move(point, event), up(point, event) }
    // Calling this again replaces the previous handlers.
    onPointer(h) {
      handlers = h;
    },
    // Convert a window position (e.g. a finger dragged in from the palette).
    clientToWorld(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      return api.toWorld([clientX - r.left, clientY - r.top]);
    },
    isInside(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
    },
  };

  // Pointer input (mouse, pen, finger), converted to metres before it's passed on.
  const worldOf = (e) => {
    const r = canvas.getBoundingClientRect();
    return api.toWorld([e.clientX - r.left, e.clientY - r.top]);
  };
  canvas.addEventListener("pointerdown", (e) => {
    canvas.setPointerCapture(e.pointerId); // keep receiving moves while dragging
    handlers.down && handlers.down(worldOf(e), e);
  });
  canvas.addEventListener("pointermove", (e) => handlers.move && handlers.move(worldOf(e), e));
  canvas.addEventListener("pointerup", (e) => handlers.up && handlers.up(worldOf(e), e));

  // Re-layout when the window (and so the canvas) changes size.
  let lastWidth = 0;
  const observer = new ResizeObserver(() => {
    // The page moved on to another stage: stop watching this old canvas.
    if (!canvas.isConnected) return observer.disconnect();
    const width = canvas.getBoundingClientRect().width;
    const resized = lastWidth && Math.abs(width - lastWidth) > 0.5;
    lastWidth = width;
    // onResize may take over (e.g. re-centre side-by-side diagrams); returning false means "not needed".
    if (resized && onResize && onResize() !== false) return;
    if (layout()) redraw();
  });
  observer.observe(canvas);
  layout();
  return api;
}

// Smallest box around a list of shapes, plus a margin (metres).
export function boundsOf(shapes, margin = 0.6) {
  let xmin = Infinity, xmax = -Infinity, ymin = Infinity, ymax = -Infinity;
  const include = (p) => {
    if (!Array.isArray(p) || !Number.isFinite(p[0]) || !Number.isFinite(p[1])) return; // only real points
    xmin = Math.min(xmin, p[0]);
    xmax = Math.max(xmax, p[0]);
    ymin = Math.min(ymin, p[1]);
    ymax = Math.max(ymax, p[1]);
  };
  for (const s of shapes) {
    include(s.at);
    include(s.from);
    include(s.to);
    if (s.points) s.points.forEach(include);
    if (s.profile) s.profile.forEach(include); // a distributed load's outline
    if (s.center) {
      include([s.center[0] - s.r, s.center[1] - s.r]);
      include([s.center[0] + s.r, s.center[1] + s.r]);
    }
    if (s.type === "box") {
      include([s.at[0] - s.w / 2, s.at[1] - s.h / 2]);
      include([s.at[0] + s.w / 2, s.at[1] + s.h / 2]);
    }
  }
  if (!Number.isFinite(xmin)) return { xmin: -3, xmax: 3, ymin: -2, ymax: 2 };
  return { xmin: xmin - margin, xmax: xmax + margin, ymin: ymin - margin, ymax: ymax + margin };
}
