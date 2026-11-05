/**
 * Rover: the Triphibian Rover's chassis. Two axle tubes with a foam wheel at
 * each end, an electronics box between them, and a motor pod with a
 * two-blade prop on each axle. The part under the pointer lifts out of the
 * assembly and takes the bright edge; its neighbours follow, less, in turn.
 * The slider is how far a part lifts.
 *
 * The pattern: discrete items. Tweens, a stagger by distance, and a hit test
 * on each part's resting screen point, which never moves.
 */
const { Cam, fit, hull, poly, proj, rrect, rings, facing, prism, tset, tval, tween, tdone, disposer, mk, pointer, put, register, solid } = HL;

const AX = 64, AY = 34, RA = 4, RW = 19, WW = 15, ZA = RW, PX = 30, PR = 20, SEG = 40;
// At rest the four wheels are bright: their shape is where the ~17% drag reduction came from.
const isMark = (p) => p.name.startsWith("wheel");

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let lift = value, act = null;
  const C = Cam(45, 0.5, 1.5);
  fit(C, [[-AX - WW, -AY - RW, 0], [AX + WW, AY + RW, 0], [AX + WW, -AY - RW, 0], [-AX - WW, AY + RW, 0], [0, -AY, ZA + 30 + lift], [0, AY, ZA + 30 + lift]], 200, 166);
  const P = proj(C), front = facing(C);
  const ring = (fn) => Array.from({ length: SEG }, (_, s) => fn(Math.cos((s / SEG) * 2 * Math.PI), Math.sin((s / SEG) * 2 * Math.PI)));
  const rX = (x, y, z, r) => ring((c, s) => P(x, y + r * c, z + r * s));
  const tube = (a, b) => poly(hull(a.concat(b)));

  // Each part: a name, where it sits, and how it draws when lifted by h.
  const parts = [];
  const add = (name, x, y, z, draw) => parts.push({ name, x, y, z, draw, t: tween(0), drawn: NaN });
  for (const y of [-AY, AY]) {
    for (const sx of [-1, 1]) {
      const x0 = sx * AX, x1 = sx * (AX + WW), lo = Math.min(x0, x1), hi = Math.max(x0, x1);
      add(`wheel ${y < 0 ? (sx < 0 ? 1 : 2) : (sx < 0 ? 3 : 4)}`, (x0 + x1) / 2, y, ZA, (h) => {
        // the face toward +x is the one the camera sees
        const far = rX(lo, y, ZA + h, RW), near = rX(hi, y, ZA + h, RW);
        return { sil: tube(far, near), crease: poly(near) + poly(rX(hi, y, ZA + h, RW * 0.35)) };
      });
    }
    add(y < 0 ? "axle 1" : "axle 2", 0, y, ZA, (h) => ({
      sil: tube(rX(-AX, y, ZA + h, RA), rX(AX, y, ZA + h, RA)),
      crease: poly(rX(AX, y, ZA + h, RA * 0.5)),
    }));
  }
  add("electronics", 0, 0, ZA, (h) => {
    const [o, i] = rings(-17, -AY + 5, 17, AY - 5, 3, 1.4);
    return prism(P, front, o, i, ZA - 8 + h, ZA + 7 + h);
  });
  let n = 0;
  for (const y of [-AY, AY]) for (const sx of [-1, 1]) {
    const x = sx * PX, k = ++n;
    add(`prop ${k}`, x, y, ZA + 14, (h) => {
      const [o, i] = rings(x - 4, y - 4, x + 4, y + 4, 4, 1);
      const pod = prism(P, front, o, i, ZA + RA - 1 + h, ZA + 12 + h);
      const a = (k * 47 + 20) * Math.PI / 180, z = ZA + 13 + h;
      const blade = rrect(-PR, -2.2, PR, 2.2, 2.2, 3).map((q) => P(x + q.u * Math.cos(a) - q.v * Math.sin(a), y + q.u * Math.sin(a) + q.v * Math.cos(a), z));
      const hub = ring((c, s) => P(x + 3 * c, y + 3 * s, z));
      return { sil: pod.sil + poly(blade) + poly(hub), crease: pod.crease };
    });
  }
  // back to front: by x + y, the props last because they ride above everything.
  const key = (p) => (p.name.startsWith("prop") ? 1000 : 0) + (p.name.startsWith("axle") ? p.y * 2 - 0.5 : p.x + p.y);
  parts.sort((a, b) => key(a) - key(b));
  const g = mk("g", {}, svg);
  parts.forEach((p) => { p.el = solid(g); p.q = P(p.x, p.y, p.z); });

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const p of parts) {
      const h = tval(p.t, now);
      if (h !== p.drawn) { p.drawn = h; put(p.el, p.draw(h)); }
      if (!tdone(p.t, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  const byName = (s) => parts.find((p) => p.name === s);
  parts.filter(isMark).forEach((p) => p.el.sil.classList.add("hi"));
  function hit([x, y]) {
    let best = null, bd = 26;
    for (const p of parts) { const d = Math.hypot(p.q[0] - x, p.q[1] - y); if (d < bd) { bd = d; best = p; } }
    return best;
  }
  function choose(a) {
    if (a === act) return;
    act = a;
    const now = performance.now();
    for (const p of parts) {
      const d = a ? Math.hypot(p.x - a.x, p.y - a.y) : 0;
      tset(p.t, a ? (p === a ? lift : Math.max(0, lift * 0.3 * (1 - d / 60))) : 0, now, a ? (d / 30) * 45 : 0);
      p.el.sil.classList.toggle("hi", a ? p === a : isMark(p));
    }
    read.textContent = a ? a.name : "rest";
    B.wake();
  }
  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(null) }));
  bag.add(() => svg.replaceChildren());
  B.wake();
  return { set: (v) => { lift = v; if (act) { const a = act; act = null; choose(a); } }, destroy: bag.dispose };
}

hairline({
  name: "rover",
  means: "The rover's chassis: axles, foam wheels, the electronics box and four props. Point at a part to lift it out.",
  rules: [1, 2, 4, 9],
  range: [6, 10, 16],
  tour: [[150, 120], [250, 210], [200, 166], null],
  mount,
});
