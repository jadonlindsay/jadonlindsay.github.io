/**
 * Weld map: a pipe header with six identical branches, each
 * branch carrying three weld collars. The weld under the pointer takes the
 * bright stroke and goes to the read-out by its field ID (H-03, 5-02). Its
 * branch tips up from the header, its neighbours less, and the same collar on
 * every other branch swells in turn: weld 2 is the same place on every branch.
 * The slider is how far the chosen branch tips.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, and a hit test on
 * the welds' resting screen points, which never move.
 */
const {
  Cam, clamp, fit, hull, poly, proj, seg, tset, tval, tween, tdone,
  disposer, mk, pointer, put, register, solid,
} = HL;

const N = 6, WELDS = 3, G = 40, PITCH = 32, L = 112, HR = 6.5, BR = 4, ZC = 11;
const REST = [2, 5, 9, 6, 3, 1], MARK = [2, 1], STEP = 45, SEG = 20;
const X = (i) => i * G, Y = (k) => (k + 1) * PITCH, HX = (j) => X(j) - G / 2;
const X0 = -G - 4, X1 = X(N - 1) + G * 0.75;

/** How much of the full tip a branch takes, d branches from the pointer: it reaches a floor. */
const falloff = (d) => Math.max(0.08, Math.exp(-0.95 * d));

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let tip = value, act = null;

  // The camera is fitted to the branches at the slider's far end, so nothing leaves the frame.
  const C = Cam(45, 0.5, 1.16);
  fit(C, [[X0, -HR, ZC - HR - 3], [X1, -HR, ZC - HR - 3], [X0, L + 4, ZC - BR - 3], [X1, L + 4, ZC - BR - 3], [X(N - 1), L + 4, ZC + 34 + BR + 3], [X0, 0, ZC + HR + 3]], 200, 166);
  const P = proj(C);

  /** Rings across a branch (in the x-z plane) and across the header (in the y-z plane). */
  const circle = (fn) => Array.from({ length: SEG }, (_, s) => fn(Math.cos((s / SEG) * 2 * Math.PI), Math.sin((s / SEG) * 2 * Math.PI)));
  const rY = (x, y, z, r) => circle((c, s) => P(x + r * c, y, z + r * s));
  const rX = (x, y, z, r) => circle((c, s) => P(x, y + r * c, z + r * s));
  const tube = (a, b) => poly(hull(a.concat(b)));
  const zAt = (lift, y) => ZC + (lift * y) / L;

  const g = mk("g", {}, svg);

  // the branches, nearest last, each painted from its root out to its flange
  const branches = [];
  for (let i = 0; i < N; i++) {
    const grp = mk("g", {}, g), pipe = solid(grp), collars = [];
    for (let k = 0; k < WELDS; k++) collars.push({ k, el: solid(grp), s: tween(0), drawn: NaN });
    branches.push({ i, pipe, collars, flange: solid(grp), l: tween(REST[i]), drawn: NaN });
  }

  // the header over the branches' roots, so each branch ends cleanly at its tee
  put(solid(g), { sil: tube(rX(X0 - 2, 0, ZC, HR + 2.6), rX(X0, 0, ZC, HR + 2.6)), crease: "" });
  put(solid(g), {
    sil: tube(rX(X0, 0, ZC, HR), rX(X1, 0, ZC, HR)),
    crease: seg(P(X0 + 4, HR * 0.45, ZC + HR * 0.6), P(X1 - 4, HR * 0.45, ZC + HR * 0.6)),
  });
  // the header's welds, one between each pair of branches
  const heads = [];
  for (let j = 0; j < N; j++) heads.push({ j, el: solid(g), s: tween(0), drawn: NaN });
  const endFace = rX(X1 + 2, 0, ZC, HR + 2.6);
  put(solid(g), { sil: tube(rX(X1, 0, ZC, HR + 2.6), endFace), crease: poly(endFace) + poly(rX(X1 + 2, 0, ZC, HR)) });

  function drawHead(h, s) {
    const x = HX(h.j), r = HR + 1 + s * 2.6, w = 1.1 + s * 2.2, face = rX(x + w, 0, ZC, r);
    put(h.el, { sil: tube(rX(x - w, 0, ZC, r), face), crease: poly(face) });
  }
  function drawCollar(b, c, lift, s) {
    const x = X(b.i), y = Y(c.k), r = BR + 1 + s * 2.6, w = 1.1 + s * 2.2;
    const face = rY(x, y + w, zAt(lift, y + w), r);
    put(c.el, { sil: tube(rY(x, y - w, zAt(lift, y - w), r), face), crease: poly(face) });
  }
  function drawBranch(b, lift) {
    const x = X(b.i), z = (y) => zAt(lift, y), y0 = HR * 0.5;
    put(b.pipe, {
      sil: tube(rY(x, y0, z(y0), BR), rY(x, L, z(L), BR)),
      crease: seg(P(x + BR * 0.45, y0 + 8, z(y0 + 8) + BR * 0.6), P(x + BR * 0.45, L - 3, z(L - 3) + BR * 0.6)),
    });
    const face = rY(x, L + 2, z(L + 2), BR + 2.6);
    put(b.flange, { sil: tube(rY(x, L, z(L), BR + 2.6), face), crease: poly(face) + poly(rY(x, L + 2, z(L + 2), BR)) });
  }

  const elOf = (a) => (a.h ? heads[a.j].el : branches[a.b].collars[a.k].el);
  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const h of heads) {
      const s = tval(h.s, now);
      if (s !== h.drawn) { h.drawn = s; drawHead(h, s); }
      if (!tdone(h.s, now)) moving = true;
    }
    for (const b of branches) {
      const lift = tval(b.l, now), liftMoved = lift !== b.drawn;
      if (liftMoved) { b.drawn = lift; drawBranch(b, lift); }
      if (!tdone(b.l, now)) moving = true;
      for (const c of b.collars) {
        const s = tval(c.s, now);
        if (liftMoved || s !== c.drawn) { c.drawn = s; drawCollar(b, c, lift, s); }
        if (!tdone(c.s, now)) moving = true;
      }
    }
    return moving;
  });
  bag.add(B.unregister);

  // the hit test: where each weld sits at rest. These points never move, and nothing draws them.
  const spots = [];
  heads.forEach((h) => { const q = P(HX(h.j), 0, ZC + HR * 0.5); spots.push({ h: true, j: h.j, q }); });
  branches.forEach((b) => b.collars.forEach((c) => {
    const q = P(X(b.i), Y(c.k), zAt(REST[b.i], Y(c.k)));
    spots.push({ h: false, b: b.i, k: c.k, q });
  }));
  function hit([x, y]) {
    let best = null, bd = 22;
    for (const sp of spots) {
      const d = Math.hypot(sp.q[0] - x, sp.q[1] - y);
      if (d < bd) { bd = d; best = sp; }
    }
    return best;
  }

  const restMark = branches[MARK[0]].collars[MARK[1]].el.sil;
  restMark.classList.add("hi");
  const name = (a) => (a.h ? `H-0${a.j + 1}` : `${a.b + 1}-0${a.k + 1}`);

  /** Tips the branches for the weld chosen (null lets them back), spreading out from it. */
  function apply(now) {
    const from = act ? (act.h ? act.j - 0.5 : act.b) : MARK[0];
    for (const b of branches) {
      const d = Math.abs(b.i - from);
      tset(b.l, act ? clamp(tip * falloff(d), 0, tip) : REST[b.i], now, d * STEP);
      for (const c of b.collars) {
        const same = act && !act.h && c.k === act.k;
        tset(c.s, same ? (b.i === act.b ? 1 : 0.28) : 0, now, d * STEP);
      }
    }
    for (const h of heads) tset(h.s, act && act.h && act.j === h.j ? 1 : 0, now, 0);
    B.wake();
  }
  function choose(a) {
    if (a === act) return;
    if (act) elOf(act).sil.classList.remove("hi");
    act = a;
    if (act) elOf(act).sil.classList.add("hi");
    restMark.classList.toggle("hi", !act || elOf(act).sil === restMark);
    read.textContent = act ? name(act) : "rest";
    apply(performance.now());
  }

  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(null) }));
  bag.add(() => svg.replaceChildren());
  apply(performance.now());

  return {
    set: (v) => { tip = v; if (act) apply(performance.now()); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "weld-map",
  means: "A header with six identical branches. Point at a weld for its field ID; the same weld lifts on every branch.",
  rules: [1, 2, 4, 5],
  range: [9, 13, 20],
  tour: [[182, 155], [254, 224], [283, 160], null],
  mount,
});
