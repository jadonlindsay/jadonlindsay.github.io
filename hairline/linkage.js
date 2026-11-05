/**
 * Linkage: the hand-cranked diorama. A base board and back wall, a crown gear
 * set into the floor, a figure standing on it, and a link from his raised hand
 * up to a bunch of balloons. The part under the pointer lifts and takes the
 * bright edge; the parts near it follow, less. The slider is the lift.
 *
 * The pattern: discrete items, as Riffle, with a hit test on each part's
 * resting screen point.
 */
const { Cam, fit, facing, hull, open, poly, prism, proj, rings, run, ringAt, tset, tval, tween, tdone, disposer, mk, pointer, put, register, solid } = HL;

const W = 130, D = 92, BT = 5, WH = 74, GX = 78, GY = 56, GR = 26, TEETH = 32;
const HAND = [94, 30, 46], TOP = [108, 12, 74], MARK = "balloons";

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value, act = null;
  const C = Cam(45, 0.5, 1.55);
  fit(C, [[0, 0, 0], [W, D, 0], [W, 0, 0], [0, D, 0], [0, 0, WH + BT], [TOP[0], TOP[1], TOP[2] + 22 + lift]], 200, 166);
  const P = proj(C), front = facing(C);
  const unit = Math.hypot(...[0, 1].map((k) => P(1 / Math.SQRT2, -1 / Math.SQRT2, 0)[k] - P(0, 0, 0)[k]));
  const ball = (x, y, z, r) => { const c = P(x, y, z); return poly(Array.from({ length: 36 }, (_, s) => [c[0] + r * unit * Math.cos(s / 36 * 2 * Math.PI), c[1] + r * unit * Math.sin(s / 36 * 2 * Math.PI)])); };
  const disc = (cx, cy, r, n, f = () => r) => Array.from({ length: n }, (_, s) => { const a = (s / n) * 2 * Math.PI, rr = f(s); return { u: cx + rr * Math.cos(a), v: cy + rr * Math.sin(a), nu: Math.cos(a), nv: Math.sin(a) }; });
  const rod = (a, b, r) => { const ra = disc(0, 0, r, 12); return poly(hull(ra.map((q) => P(a[0] + q.u, a[1] + q.v, a[2])).concat(ra.map((q) => P(b[0] + q.u, b[1] + q.v, b[2]))))); };

  const parts = [];
  const add = (name, at, draw) => parts.push({ name, at, draw, t: tween(0), drawn: NaN });
  add("wall", [W / 2, 2, WH * 0.6], (h) => { const [o, i] = rings(0, 0, W, 4, 2, 0.9); return prism(P, front, o, i, BT + h, BT + WH + h); });
  add("gear", [GX, GY, BT + 3], (h) => {
        const top = disc(GX, GY, GR - 7, 40);
    const p = prism(P, front, disc(GX, GY, GR, 48), top, BT + h, BT + 4 + h), z = BT + 4 + h;
    // the crown's teeth, cut radially into its top face
    const ticks = Array.from({ length: TEETH }, (_, k) => { const a = (k / TEETH) * 2 * Math.PI, c = Math.cos(a), s = Math.sin(a); return open([P(GX + (GR - 6) * c, GY + (GR - 6) * s, z), P(GX + (GR - 1) * c, GY + (GR - 1) * s, z)]); });
    return { sil: p.sil, crease: poly(ringAt(P, top, z)) + ticks.join("") };
  });
  add("figure", [GX, GY, BT + 26], (h) => {
    const body = disc(GX, GY, 7, 28), z0 = BT + 4 + h, z1 = BT + 30 + h;
    return [
      { sil: poly(hull(ringAt(P, body, z0).concat(ringAt(P, body, z1)))), crease: open(ringAt(P, run(body, front), z1 - 8)) },
      { sil: rod([GX + 4, GY - 4, z1 - 4], [HAND[0], HAND[1], HAND[2] + h], 2.2), crease: "" },
      { sil: ball(GX, GY, z1 + 6, 7), crease: "" },
    ];
  });
  add("link", [(HAND[0] + TOP[0]) / 2, (HAND[1] + TOP[1]) / 2, (HAND[2] + TOP[2]) / 2], (h) => ({
    sil: rod([HAND[0], HAND[1], HAND[2] + h], [TOP[0], TOP[1], TOP[2] + h], 1.6),
    crease: "",
  }));
  add("balloons", [TOP[0], TOP[1], TOP[2] + 12], (h) => {
    // back to front, so each balloon covers the ones behind it
    const z = TOP[2] + 10 + h, spots = [[-6, -4, 2], [6, -5, 6], [1, 0, 16], [-3, 7, 9], [9, 6, 0]];
    return spots.map(([dx, dy, dz]) => ({ sil: ball(TOP[0] + dx, TOP[1] + dy, z + dz, 8), crease: "" }));
  });

  const g = mk("g", {}, svg);
  { const [o, i] = rings(0, 0, W, D, 5, 1.6); put(solid(g), prism(P, front, o, i, 0, BT)); }
  parts.forEach((p) => {
    const n = [].concat(p.draw(0)).length;
    p.els = Array.from({ length: n }, () => solid(g));
    p.q = P(...p.at);
  });
  const hi = (p, on) => p.els.forEach((e) => e.sil.classList.toggle("hi", on));

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const p of parts) {
      const h = tval(p.t, now);
      if (h !== p.drawn) { p.drawn = h; [].concat(p.draw(h)).forEach((d, k) => put(p.els[k], d)); }
      if (!tdone(p.t, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);
  const isMark = (p) => p.name === MARK;
  hi(parts.find(isMark), true);

  function hit([x, y]) {
    let best = null, bd = 34;
    for (const p of parts) { const d = Math.hypot(p.q[0] - x, p.q[1] - y); if (d < bd) { bd = d; best = p; } }
    return best;
  }
  function choose(a) {
    if (a === act) return;
    act = a;
    const now = performance.now(), ia = parts.indexOf(a);
    parts.forEach((p, i) => {
      const d = a ? Math.abs(i - ia) : 0;
      tset(p.t, !a ? 0 : p === a ? lift : p.name === "wall" ? 0 : lift * 0.25 / d, now, d * 50);
      hi(p, a ? p === a : isMark(p));
    });
    read.textContent = a ? a.name : "rest";
    B.wake();
  }
  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(null) }));
  bag.add(() => svg.replaceChildren());
  B.wake();
  return { set: (v) => { lift = v; if (act) { const a = act; act = null; choose(a); } }, destroy: bag.dispose };
}

hairline({
  name: "linkage",
  means: "The hand-cranked diorama: a crown gear, a figure on it, and a link up to the balloons. Point at a part to lift it.",
  rules: [1, 2, 4, 9],
  range: [6, 10, 16],
  tour: [[230, 210], [260, 90], [150, 130], null],
  mount,
});
