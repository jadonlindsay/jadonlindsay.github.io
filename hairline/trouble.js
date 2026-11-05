/**
 * Trouble: the board game. A square board, a ring of track holes, a home row
 * of four pegs in each corner, and the clear dome over the die in the middle.
 * The peg under the pointer hops; the others in its home hop after it, less.
 * The read-out names the player and the peg. The slider is the hop.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, and a hit test
 * on each peg's resting screen point.
 */
const { Cam, fit, facing, flatDot, hull, open, poly, prism, proj, rings, rrect, run, ringAt, circ, place, tset, tval, tween, tdone, disposer, mk, pointer, put, register, solid } = HL;

const B2 = 70, TH = 7, TR = 48, HOLES = 28, DR = 20, PR = 3, PH = 9, STEP = 60;

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let hop = value, act = null;
  const C = Cam(45, 0.5, 1.62);
  fit(C, [[-B2, -B2, 0], [B2, B2, 0], [B2, -B2, 0], [-B2, B2, 0], [0, 0, TH + DR + 2], [-B2 + 10, -B2 + 10, TH + PH + 20]], 200, 166);
  const P = proj(C), front = facing(C);
  const g = mk("g", {}, svg);
  const bo = rrect(-B2, -B2, B2, B2, 12, 10), bi = rrect(-B2 + 2.2, -B2 + 2.2, B2 - 2.2, B2 - 2.2, 9.8, 10);
  put(solid(g), prism(P, front, bo, bi, 0, TH));

  // the track: a ring of holes
  for (let k = 0; k < HOLES; k++) {
    const a = (k / HOLES) * 2 * Math.PI;
    place(flatDot(g, C, 1.6, "dot off"), P(TR * Math.cos(a), TR * Math.sin(a), TH));
  }

  // pegs in the four homes, from the far corner (smallest x + y) to the near one
  const homes = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  const pegs = [];
  homes.forEach(([sx, sy], h) => {
    for (let k = 0; k < 4; k++) {
      const x = sx * (B2 - 12 - (k % 2) * 9), y = sy * (B2 - 12 - Math.floor(k / 2) * 9);
      const [o, i] = rings(x - PR, y - PR, x + PR, y + PR, PR, 0.9);
      pegs.push({ h, k, x, y, o, i, t: tween(0), drawn: NaN, q: P(x, y, TH + PH) });
    }
  });
  pegs.sort((a, b) => a.x + a.y - (b.x + b.y));

  // the dome sits in the middle: paint the pegs behind it, then it, then the pegs in front
  const domeKey = 0;
  pegs.filter((p) => p.x + p.y < domeKey).forEach((p) => { p.el = solid(g); });
  // the dome is clear, so the die shows through it. At rest the die is bright: every turn starts with the roll.
  // Paint order: collar, die, then the dome's outline alone.
  let die;
  {
    const co = rrect(-DR - 3, -DR - 3, DR + 3, DR + 3, DR + 3, 12), ci = rrect(-DR - 1.5, -DR - 1.5, DR + 1.5, DR + 1.5, DR + 1.5, 12);
    put(solid(g), prism(P, front, co, ci, TH, TH + 2));
    const [dO, dI] = rings(-6, -6, 6, 6, 2.5, 1);
    die = solid(g);
    put(die, prism(P, front, dO, dI, TH + 2, TH + 14));
    const base = circ(DR, 40), c = P(0, 0, TH + 2);
    const d = P(DR / Math.SQRT2, -DR / Math.SQRT2, TH + 2), r = Math.hypot(d[0] - c[0], d[1] - c[1]);
    const cap = Array.from({ length: 33 }, (_, k) => { const a = Math.PI + (k / 32) * Math.PI; return [c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]; });
    const foot = ringAt(P, base, TH + 2);
    mk("path", { class: "nf lo", d: open(ringAt(P, run(base, (q) => !front(q)), TH + 2)) }, g);
    mk("path", { class: "nf sil", d: poly(hull(foot.concat(cap))) }, g);
  }
  pegs.filter((p) => p.x + p.y >= domeKey).forEach((p) => { p.el = solid(g); });

  const tick = (_dt, now) => {
    let moving = false;
    for (const p of pegs) {
      const z = tval(p.t, now);
      if (z !== p.drawn) { p.drawn = z; put(p.el, prism(P, front, p.o, p.i, TH + z, TH + PH + z)); }
      if (!tdone(p.t, now)) moving = true;
    }
    return moving;
  };
  const Bk = register(stage, tick);
  bag.add(Bk.unregister);

  die.sil.classList.add("hi");
  function hit([x, y]) {
    let best = null, bd = 13;
    for (const p of pegs) { const d = Math.hypot(p.q[0] - x, p.q[1] - y + 4); if (d < bd) { bd = d; best = p; } }
    return best;
  }
  function choose(a) {
    if (a === act) return;
    act = a;
    const now = performance.now();
    for (const p of pegs) {
      const same = a && p.h === a.h, d = same ? Math.hypot(p.x - a.x, p.y - a.y) / 9 : 0;
      tset(p.t, !a ? 0 : p === a ? hop : same ? hop * 0.35 : 0, now, d * STEP);
      p.el.sil.classList.toggle("hi", p === a);
    }
    die.sil.classList.toggle("hi", !a);
    read.textContent = a ? `P${a.h + 1}·${a.k + 1}` : "rest";
    Bk.wake();
  }
  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(null) }));
  bag.add(() => svg.replaceChildren());
  Bk.wake();
  return { set: (v) => { hop = v; if (act) { const a = act; act = null; choose(a); } }, destroy: bag.dispose };
}

hairline({
  name: "trouble",
  means: "A Trouble board: the track, four homes of pegs and the dome over the die. Point at a peg to make it hop.",
  rules: [1, 2, 4, 6],
  range: [6, 10, 16],
  tour: [[200, 90], [320, 160], [200, 240], null],
  mount,
});
