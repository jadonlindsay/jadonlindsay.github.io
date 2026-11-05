/**
 * Labor: a stack of three timesheets with a week-by-week bar chart standing on
 * the top one. The bar under the pointer rises and takes the bright edge; its
 * neighbours rise less, staggered outwards. The read-out names the week.
 * The slider is how far the chosen bar rises.
 *
 * The pattern: discrete items, as Riffle. The hit test uses each bar's resting
 * foot, which never moves.
 */
const { Cam, fit, facing, prism, proj, rings, seg, tset, tval, tween, tdone, disposer, mk, pointer, put, register, solid } = HL;

const N = 8, BW = 9, GAP = 15, SW = 150, SD = 96, TH = 2.4;
const REST = [10, 16, 13, 27, 44, 36, 21, 12], MARK = 4, STEP = 45;
const X = (i) => 18 + i * GAP;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let rise = value, act = -1;
  const C = Cam(45, 0.5, 1.5);
  fit(C, [[0, 0, 0], [SW + 10, SD + 10, 0], [SW + 10, 0, 0], [0, SD + 10, 0], [X(MARK), SD / 2, 3 * TH + 44 + 24]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);

  // three sheets, each nudged out from the one under it
  [[10, 10, 0], [5, 5, 1], [0, 0, 2]].forEach(([dx, dy, k]) => {
    const [o, i] = rings(dx, dy, dx + SW, dy + SD, 4, 1.2);
    put(solid(g), prism(P, front, o, i, k * TH, (k + 1) * TH));
  });
  const top = 3 * TH;
  // the ruled rows of the top sheet
  const rules = mk("path", { class: "nf lo" }, g);
  rules.setAttribute("d", [22, 38, 54, 70].map((y) => seg(P(8, y, top), P(SW - 8, y, top))).join(""));

  const y0 = SD / 2 - BW / 2;
  const bars = [];
  for (let i = 0; i < N; i++) {
    const [o, inn] = rings(X(i), y0, X(i) + BW, y0 + BW, 1.8, 0.8);
    bars.push({ i, o, inn, el: solid(g), t: tween(REST[i]), drawn: NaN, q: P(X(i) + BW / 2, y0 + BW / 2, top + REST[i] / 2) });
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const b of bars) {
      const h = tval(b.t, now);
      if (h !== b.drawn) { b.drawn = h; put(b.el, prism(P, front, b.o, b.inn, top, top + h)); }
      if (!tdone(b.t, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);
  bars[MARK].el.sil.classList.add("hi");

  /** The bar whose resting column is nearest the pointer's x, if the pointer is near the chart at all. */
  function hit([x, y]) {
    let best = -1, bd = 12;
    for (const b of bars) {
      const foot = P(X(b.i) + BW / 2, y0 + BW / 2, top), head = P(X(b.i) + BW / 2, y0 + BW / 2, top + REST[b.i]);
      const dx = Math.abs(x - foot[0]), inY = y < foot[1] + 14 && y > head[1] - 22;
      if (inY && dx < bd) { bd = dx; best = b.i; }
    }
    return best;
  }
  function choose(a) {
    if (a === act) return;
    act = a;
    const now = performance.now();
    for (const b of bars) {
      const d = a < 0 ? 0 : Math.abs(b.i - a);
      const boost = a < 0 ? 0 : rise * Math.max(0, 1 - d / 3);
      tset(b.t, REST[b.i] + boost, now, d * STEP);
      b.el.sil.classList.toggle("hi", a < 0 ? b.i === MARK : b.i === a);
    }
    read.textContent = a < 0 ? "rest" : `wk ${String(a + 1).padStart(2, "0")}`;
    B.wake();
  }
  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());
  B.wake();
  return { set: (v) => { rise = v; if (act >= 0) { const a = act; act = -1; choose(a); } }, destroy: bag.dispose };
}

hairline({
  name: "labor",
  means: "A stack of timesheets with weekly hours charted on top. Point at a bar to raise that week.",
  rules: [1, 2, 3, 5],
  range: [8, 14, 24],
  tour: [[170, 150], [230, 180], [280, 210], null],
  mount,
});
