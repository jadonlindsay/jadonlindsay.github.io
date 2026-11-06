/**
 * PBE: the chapter's mark, standing as a sign on a plinth. Each letter is a
 * solid block with its ruled stripes, as in the logo; the B's upper lobe is cut
 * on the diagonal. The stripes sit shallower than the blocks. The letter under
 * the pointer pushes its stripes out flush, so the letter closes up. The
 * read-out names the word. The slider is how far the stripes come out.
 *
 * The pattern: discrete items. Every piece is convex (prism draws a hull), so
 * the letters are built from blocks and bands, each a rounded polygon drawn in
 * the sign's plane (world x and z) and extruded towards the viewer along y.
 */
const { Cam, fit, facing, poly, prism, proj, rings, tset, tval, tween, tdone, disposer, mk, pointer, put, register, solid } = HL;

const K = 0.3, X0 = 120, Y0 = 185, TOP = 7, LOW = 3.5, STEP = 55;
// logo pixels (y down) to the sign's plane: world x, and height z
const W = (x, y) => [(x - X0) * K, (Y0 - y) * K];
const WORDS = ["Professional", "Brotherhood", "Engineers"];
// The B is the logo's one coloured letter, so it carries the bright edge at rest.
const MARK = 1;

/** A convex polygon (logo pixels) with a radius per corner, as {ring, inner(b)}: samples {u, v, nu, nv}. */
function shape(pts, radii, n = 5) {
  const p = pts.map(([x, y]) => W(x, y)), m = p.length;
  const cx = p.reduce((s, q) => s + q[0], 0) / m, cy = p.reduce((s, q) => s + q[1], 0) / m;
  const norm = (a, b) => {
    let nx = b[1] - a[1], ny = a[0] - b[0];
    const l = Math.hypot(nx, ny);
    nx /= l; ny /= l;
    if (nx * ((a[0] + b[0]) / 2 - cx) + ny * ((a[1] + b[1]) / 2 - cy) < 0) { nx = -nx; ny = -ny; }
    return [nx, ny];
  };
  const corners = p.map((v, i) => {
    const n1 = norm(p[(i + m - 1) % m], v), n2 = norm(v, p[(i + 1) % m]);
    const r = Math.max((Array.isArray(radii) ? radii[i] : radii) * K, 0.2);
    let bx = n1[0] + n2[0], by = n1[1] + n2[1];
    const bl = Math.hypot(bx, by); bx /= bl; by /= bl;
    const half = Math.acos(Math.max(-1, Math.min(1, n1[0] * n2[0] + n1[1] * n2[1]))) / 2;
    const d = r / Math.cos(half);
    const a1 = Math.atan2(n1[1], n1[0]);
    let da = Math.atan2(n2[1], n2[0]) - a1;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    return { c: [v[0] - bx * d, v[1] - by * d], r, a1, da };
  });
  const at = (inset) => {
    const out = [];
    for (const k of corners) for (let s = 0; s <= n; s++) {
      const a = k.a1 + k.da * s / n, ca = Math.cos(a), sa = Math.sin(a), rr = Math.max(0.3, k.r - inset);
      out.push({ u: k.c[0] + rr * ca, v: k.c[1] + rr * sa, nu: ca, nv: sa });
    }
    return out;
  };
  return { ring: at(0), inner: (b) => at(b) };
}

/** Keeps the part of a convex polygon where dot(m, p) lies in [s0, s1]. */
function band(pts, m, s0, s1) {
  const clip = (poly, keep) => {
    const out = [];
    poly.forEach((a, i) => {
      const b = poly[(i + 1) % poly.length], fa = keep(a), fb = keep(b);
      if (fa >= 0) out.push(a);
      if ((fa >= 0) !== (fb >= 0)) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    });
    return out;
  };
  const dot = (q) => m[0] * q[0] + m[1] * q[1];
  return clip(clip(pts, (q) => dot(q) - s0), (q) => s1 - dot(q));
}

const stripes = (x0, x1, ys, h) => ys.map((y) => ({ pts: [[x0, y], [x1, y], [x1, y + h], [x0, y + h]], r: 2, stripe: true }));

function letters() {
  const P = [
    { pts: [[125, 5], [295, 5], [295, 96], [125, 96]], r: [1, 50, 50, 1] },
    ...stripes(125, 213, [103, 122, 140, 158, 176], 8),
  ];
  // The B: diagonal stripes in its upper left, ending on a vertical at x 390; solid to the right
  // and below. The solid is three blocks set flush, their seams covered (see mount).
  const D = 0.46, XS = 390, quad = (y0, y1) => [[300, y0], [XS, y0 + (XS - 300) * D], [XS, y1 + (XS - 300) * D], [300, y1]];
  const lines = [10, 28.5, 47.5, 66.5, 85], LW = 5;
  const B = [{ pts: [[300, 7], [XS, 7], [XS, lines[0] + (XS - 300) * D], [300, lines[0]]], r: [1, 1, 1, 0.6], stripe: true }];
  for (let k = 0; k < lines.length - 1; k++) B.push({ pts: quad(lines[k] + LW, lines[k + 1]), r: 1, stripe: true });
  B.push(
    { pts: [[XS, 7], [470, 7], [470, 97], [XS, 97]], r: [1, 46, 32, 1] },
    { pts: [[XS, 97], [470, 97], [470, 185], [XS, 185]], r: [1, 32, 50, 1], seams: [[XS + 1, 97, 470 - 32, 97]] },
    { pts: quad(lines[4] + LW, 185 - (XS - 300) * D).map(([x, y], i) => [x, i > 1 ? 185 : y]), r: 1, seams: [[XS, 131, XS, 184]] },
  );
  // The E: a head with a slot cut into its right side, then the stripes. Three flush blocks.
  const E = [
    { pts: [[478, 7], [649, 7], [649, 56], [478, 56]], r: 1 },
    { pts: [[478, 56], [567, 56], [567, 100], [478, 100]], r: 1, seams: [[479, 56, 566, 56]] },
    { pts: [[567, 62], [622, 62], [622, 100], [567, 100]], r: 1, seams: [[567, 63, 567, 99]] },
    ...stripes(478, 657, [104, 122, 140, 158, 176], 8),
  ];
  return [P, B, E];
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let rise = value, act = -1;
  const C = Cam(36, 0.4, 1.62);
  const [x0] = W(108, 0), [x1] = W(667, 0), zt = W(0, 5)[1];
  fit(C, [[x0, -4, -3], [x1, TOP + 8, -3], [x1, -4, zt], [x0, TOP + 8, zt], [x0, -4, zt]], 200, 160);
  const P = proj(C), front = facing(C);
  // the sign's plane: a ring's (u, v) is world (x, z), and a prism's height runs along world y
  const S = (u, v, w) => P(u, w, v);
  const zf = Math.sqrt(1 - C.k * C.k), cam = [Math.sin(C.az), Math.cos(C.az), C.k / zf];
  const faceS = (q) => q.nu * cam[0] + q.nv * cam[2] > 0;
  const g = mk("g", {}, svg);

  const [po, pi] = rings(x0, -4, x1, TOP + 8, 3, 1.4);
  put(solid(g), prism(P, front, po, pi, -3, 0));

  const pieces = [];
  letters().forEach((parts, L) => parts.forEach((part) => {
    const s = shape(part.pts, part.r);
    const c = s.ring.reduce((a, q) => [a[0] + q.u / s.ring.length, a[1] + q.v / s.ring.length], [0, 0]);
    const h = part.stripe ? LOW : TOP;
    pieces.push({ L, stripe: part.stripe, seams: part.seams, ring: s.ring, inner: s.inner(0.9), key: cam[0] * c[0] + cam[1] * h + cam[2] * c[1], t: tween(h), drawn: NaN });
  }));
  // farther from the camera first, so nearer pieces cover them
  pieces.sort((a, b) => a.key - b.key);
  pieces.forEach((q) => { q.el = solid(g); if (q.L === MARK) q.el.sil.classList.add("hi"); });
  // Fill-only patches over the seams between flush blocks on a letter's face, each laid just after
  // the later of the two blocks, so the seam line disappears and the solid reads as one piece.
  for (const q of pieces.filter((p) => p.seams)) for (const [xa, ya, xb, yb] of q.seams) {
    const [ua, va] = W(xa, ya), [ub, vb] = W(xb, yb), e = 0.6, hz = va === vb;
    const d = poly(hz
      ? [S(ua, va - e, TOP), S(ub, va - e, TOP), S(ub, va + e, TOP), S(ua, va + e, TOP)]
      : [S(ua - e, va, TOP), S(ua + e, va, TOP), S(ua + e, vb, TOP), S(ua - e, vb, TOP)]);
    const patch = mk("path", { class: "fo", d }, g);
    const later = pieces.filter((p) => p.L === q.L && !p.stripe).map((p) => p.el.g).pop();
    g.insertBefore(patch, later.nextSibling);
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const q of pieces) {
      const h = tval(q.t, now);
      if (h !== q.drawn) { q.drawn = h; put(q.el, prism(S, faceS, q.ring, q.inner, 0, h)); }
      if (!tdone(q.t, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  // letter columns at rest, in screen x along the plinth's front edge: P 125–295, B 300–470, E 478–655
  const mid = W(0, 95)[1];
  const cols = [[115, 297], [297, 474], [474, 665]].map(([a, b]) => [S(W(a, 0)[0], mid, TOP)[0], S(W(b, 0)[0], mid, TOP)[0]]);
  const ys = [[x0, -4, -3], [x1, -4, -3], [x0, TOP + 8, -3], [x1, TOP + 8, -3], [x0, 0, zt], [x1, 0, zt]].map(([x, y, z]) => P(x, y, z)[1]);
  const yTop = Math.min(...ys) - 10, yBot = Math.max(...ys) + 10;
  function hit([sx, sy]) {
    if (sy < yTop || sy > yBot) return -1;
    return cols.findIndex(([a, b]) => sx >= a && sx < b);
  }
  function choose(a) {
    if (a === act) return;
    act = a;
    const now = performance.now();
    for (const q of pieces) {
      if (q.stripe) tset(q.t, q.L === a ? LOW + rise : LOW, now, q.L === a ? 0 : STEP);
      q.el.sil.classList.toggle("hi", a < 0 ? q.L === MARK : q.L === a);
    }
    read.textContent = a < 0 ? "rest" : WORDS[a];
    B.wake();
  }
  bag.add(pointer(stage, { move: (p) => choose(hit(p)), leave: () => choose(-1) }));
  bag.add(() => svg.replaceChildren());
  B.wake();
  return { set: (v) => { rise = v; if (act >= 0) { const a = act; act = -1; choose(a); } }, destroy: bag.dispose };
}

hairline({
  name: "pbe",
  means: "The PBE mark standing as a sign. Point at a letter and its stripes come out flush, closing the letter up.",
  rules: [1, 4, 5, 9],
  range: [1.5, 3.5, 5],
  tour: [[120, 140], [200, 165], [275, 185], null],
  mount,
});
