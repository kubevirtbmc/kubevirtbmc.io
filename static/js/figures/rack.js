/**
 * Rack: an open server rack holding six 2U machines, each one a virtual
 * machine with a front bezel: two pull handles, three drive bays and a power
 * light. The pointer's height picks a machine; it slides out on its rails and
 * its light comes on, and its neighbours follow it out, the farther the less,
 * staggered outwards from it. At rest a few machines sit half out where they
 * were last serviced, and one light is on. The slider is how far the chosen
 * machine slides out, in world units.
 */
const {
  Cam, circ, clamp, facing, fit, prism, proj, rings, rrect, poly,
  tdone, tset, tval, tween, disposer, mk, place, pointer, put, register, solid,
} = HL;

const N = 6, W = 84, D = 92, UH = 12, PITCH = 14.5, Z0 = 5, POST = 6, GAP = 2;
const ZTOP = Z0 + N * PITCH + 1.5, CAP = 4;
const REST = [2, 9, 0, 16, 4, 0], LIT = 3, FALL = [1, 0.42, 0.16, 0.05];

/** A unit's front details, drawn on its face plane y = yf: handles, bays and the light's place. */
function bezel(P, yf, z0, z1) {
  const on = (ring) => poly(ring.map((q) => P(q.u, yf, q.v)));
  const zc = (z0 + z1) / 2;
  return {
    ears: on(rrect(3, z0 + 3, 8, z1 - 3, 1.2, 3)) + on(rrect(W - 8, z0 + 3, W - 3, z1 - 3, 1.2, 3)),
    bays: [0, 1, 2].map((k) => on(rrect(14 + k * 17, zc - 2.2, 28 + k * 17, zc + 2.2, 1, 3))).join(""),
    led: P(W - 15, yf, zc),
  };
}

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let out = value;

  // Fitted to the rack with every machine out at the slider's far end, so nothing leaves the frame.
  const C = Cam(45, 0.5, 1.5);
  const far = 40;
  fit(C, [[-POST - 6, -6, -6], [W + POST + 6, D + 6, -6], [W + POST + 6, -6, -6], [-POST - 6, D + 6, -6],
    [-POST, 0, ZTOP + CAP], [W + POST, 0, ZTOP + CAP], [0, D + far, Z0], [W, D + far, Z0]], 200, 160);
  const P = proj(C), front = facing(C);
  const box = (x0, y0, x1, y1, z0, z1, r, b, parent) => {
    const [ring, inner] = rings(x0, y0, x1, y1, r, b);
    const s = solid(parent);
    put(s, prism(P, front, ring, inner, z0, z1));
    return s;
  };

  const g = mk("g", {}, svg);
  // back to front: plinth, rear posts, the near-left post, the machines bottom up, the near-right post, the cap
  box(-POST - 6, -6, W + POST + 6, D + 6, -6, 0, 6, 1.6, g);
  box(-POST - GAP, 0, -GAP, POST, 0, ZTOP, 1.4, 0.6, g);
  box(W + GAP, 0, W + GAP + POST, POST, 0, ZTOP, 1.4, 0.6, g);
  const postL = box(-POST - GAP, D - POST, -GAP, D, 0, ZTOP, 1.4, 0.6, g);
  // the rail holes, one pair per unit, punched down the near-left post
  for (let i = 0; i < N; i++) for (const dz of [3.5, PITCH - 5]) {
    place(mk("circle", { r: 0.75, class: "dot off" }, postL.g), P(-POST / 2 - GAP, D, Z0 + i * PITCH + dz));
  }

  const units = [];
  for (let i = 0; i < N; i++) {
    const grp = mk("g", {}, g);
    const s = solid(grp);
    const ears = mk("path", { class: "nf" }, grp), bays = mk("path", { class: "nf lo" }, grp);
    const led = mk("circle", { r: 1.4, class: i === LIT ? "dot" : "dot off" }, grp);
    units.push({ s, ears, bays, led, o: tween(REST[i]), drawn: NaN });
  }

  const postR = box(W + GAP, D - POST, W + GAP + POST, D, 0, ZTOP, 1.4, 0.6, g);
  for (let i = 0; i < N; i++) for (const dz of [3.5, PITCH - 5]) {
    place(mk("circle", { r: 0.75, class: "dot off" }, postR.g), P(W + GAP, D - POST / 2, Z0 + i * PITCH + dz));
  }
  const cap = box(-POST - GAP, 0, W + GAP + POST, D, ZTOP, ZTOP + CAP, 3, 1.2, g);
  // two roof fans, set into the cap
  const zt = ZTOP + CAP, fan = (cx, cy, R) => poly(circ(R, 40).map((q) => P(cx + q.u, cy + q.v, zt)));
  for (const cy of [D * 0.3, D * 0.68]) {
    mk("path", { d: fan(W / 2, cy, 15), class: "nf lo" }, cap.g);
    mk("path", { d: fan(W / 2, cy, 4), class: "nf lo" }, cap.g);
  }

  function draw(i, o) {
    const u = units[i];
    if (o === u.drawn) return;
    u.drawn = o;
    const z0 = Z0 + i * PITCH, z1 = z0 + UH;
    const [ring, inner] = rings(0, o, W, D + o, 2.4, 1.1);
    put(u.s, prism(P, front, ring, inner, z0, z1));
    const b = bezel(P, D + o, z0, z1);
    u.ears.setAttribute("d", b.ears);
    u.bays.setAttribute("d", b.bays);
    place(u.led, b.led);
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    units.forEach((u, i) => { draw(i, tval(u.o, now)); if (!tdone(u.o, now)) moving = true; });
    return moving;
  });
  bag.add(B.unregister);

  // Hit test: the screen height of each machine's resting front, which never moves.
  const rows = units.map((_, i) => P(W / 2, D, Z0 + i * PITCH + UH / 2)[1]);
  const pick = ([, y]) => rows.reduce((a, r, i) => (Math.abs(r - y) < Math.abs(rows[a] - y) ? i : a), 0);

  let act = -1;
  function setActive(a, force) {
    if (a === act && !force) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    units.forEach((u, i) => {
      const k = Math.abs(i - from);
      const to = a < 0 ? REST[i] : out * FALL[clamp(Math.abs(i - a), 0, FALL.length - 1)];
      tset(u.o, to, now, k * 45);
      u.s.sil.classList.toggle("hi", i === a);
      u.led.setAttribute("class", "dot" + ((a < 0 ? i === LIT : i === a) ? "" : " off"));
    });
    read.textContent = a < 0 ? "rest" : "vm " + String(N - a).padStart(2, "0");
    B.wake();
  }

  bag.add(pointer(stage, { move: (p) => setActive(pick(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { out = v; if (act >= 0) setActive(act, true); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "rack",
  means: "Six virtual machines racked like servers: the one under the pointer slides out and powers on, its neighbours following.",
  rules: [1, 2, 3, 5],
  range: [18, 28, 40],
  mount,
});
