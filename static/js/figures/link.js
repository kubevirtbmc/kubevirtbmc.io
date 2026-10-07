/**
 * Link: a server lying on a plate with its rear panel turned to us: two power
 * supplies, a row of data ports, and one management port standing apart. A
 * network cable lies on the plate with its plug loose. The nearer the pointer
 * comes to the management port, the further the plug lifts toward it, on a
 * spring; close enough and it seats, and the port's two link lights come on.
 * At rest the empty port is the bright mark. The slider is the reach: how far
 * from the port the pointer starts to draw the plug.
 */
const {
  Cam, circ, clamp, facing, fit, lerp, open, poly, prism, proj, rings, rrect, seg, unproj, spring, stepS,
  disposer, mk, place, pointer, put, register, solid,
} = HL;

const BX = 64, BY = 100, BZ = 30;                  // the server
const PL = 19, PW = 12, PH = 10, BL = 10;            // the plug, and its boot
const SEAT = [BX + 0.5, 74, 7], LOOSE = [118, 16, 0];
const PORT = [SEAT[1] - 1, SEAT[2] - 1, SEAT[1] + PW + 1, SEAT[2] + PH + 1];
const X0 = -10, Y0 = -10, X1 = 176, Y1 = 118, ANCHOR = [X1, 104, 0];

/** Where the plug's front-bottom corner is at t: a lift on an arc from the plate to the port. */
const at = (t) => [lerp(LOOSE[0], SEAT[0], t), lerp(LOOSE[1], SEAT[1], t), lerp(LOOSE[2], SEAT[2], t) + 16 * Math.sin(Math.PI * t)];

function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let reach = value;

  const C = Cam(45, 0.5, 1.46);
  fit(C, [[X0, Y0, -5], [X1, Y1, -5], [X1, Y0, -5], [X0, Y1, -5], [0, 0, BZ], [ANCHOR[0], ANCHOR[1], -18], [90, 52, 30]], 200, 168);
  const P = proj(C), front = facing(C);
  const box = (x0, y0, x1, y1, z0, z1, r, b, s) => { const [o, i] = rings(x0, y0, x1, y1, r, b); put(s, prism(P, front, o, i, z0, z1)); };
  // the rear panel is the face x = BX: u runs along y, v up z
  const rear = (ring, du = 0, dv = 0) => poly(ring.map((q) => P(BX, q.u + du, q.v + dv)));

  const g = mk("g", {}, svg);
  box(X0, Y0, X1, Y1, -5, 0, 8, 1.8, solid(g));
  const srv = solid(g);
  box(0, 0, BX, BY, 0, BZ, 3, 1.3, srv);
  for (const y of [6, 34]) {
    mk("path", { d: rear(rrect(y, 4, y + 24, 16, 1.6, 3)), class: "nf" }, srv.g);
    mk("path", { d: rear(circ(4, 24), y + 7, 10), class: "nf lo" }, srv.g);
  }
  // vents along the top, just behind the rear panel
  mk("path", { d: Array.from({ length: 9 }, (_, k) => seg(P(BX - 16, 14 + k * 9, BZ), P(BX - 5, 14 + k * 9, BZ))).join(""), class: "nf lo" }, srv.g);
  for (let k = 0; k < 3; k++) mk("path", { d: rear(rrect(38 + k * 11, 21, 46 + k * 11, 26, 0.8, 3)), class: "nf lo" }, srv.g);
  const port = mk("path", { d: rear(rrect(PORT[0], PORT[1], PORT[2], PORT[3], 1, 3)), class: "nf hi" }, srv.g);
  mk("path", { d: rear(rrect(PORT[0] + 2, PORT[1] + 2, PORT[2] - 2, PORT[3] - 2, 0.6, 3)), class: "nf lo" }, srv.g);
  const leds = [PORT[0] + 1.5, PORT[2] - 1.5].map((u) => {
    const el = mk("circle", { r: 1.1, class: "dot off" }, srv.g);
    place(el, P(BX, u, PORT[3] + 2.6));
    return el;
  });

  const cable = mk("path", { class: "nf sil" }, g);
  const plug = solid(g), boot = solid(g), latch = mk("path", { class: "nf lo" }, g);

  function draw(t) {
    const [x, y, z] = at(t);
    box(x, y, x + PL, y + PW, z, z + PH, 1.4, 0.7, plug);
    box(x + PL, y + 1.6, x + PL + BL, y + PW - 1.6, z + 1.2, z + PH - 1.6, 1.6, 0.6, boot);
    latch.setAttribute("d", poly(rrect(x + 3, y + 3, x + PL - 3, y + PW - 3, 1, 3).map((q) => P(q.u, q.v, z + PH))));
    // the cable leaves the boot straight, curves over the plate, and drops off its near edge
    const s = [x + PL + BL, y + PW / 2, z + PH / 2 - 0.2], pts = [];
    for (let k = 0; k <= 24; k++) {
      const u = k / 24, a = (1 - u) ** 3, b = 3 * u * (1 - u) ** 2, c = 3 * u * u * (1 - u), d = u ** 3;
      const c1 = [s[0] + 34, s[1], s[2]], c2 = [ANCHOR[0] - 40, ANCHOR[1] - 4, 0];
      pts.push(P(a * s[0] + b * c1[0] + c * c2[0] + d * ANCHOR[0], a * s[1] + b * c1[1] + c * c2[1] + d * ANCHOR[1], Math.max(0, a * s[2] + b * c1[2])));
    }
    pts.push(P(ANCHOR[0] + 1.5, ANCHOR[1], -5), P(ANCHOR[0] + 1.5, ANCHOR[1], -18));
    cable.setAttribute("d", open(pts));
  }

  const sp = spring(0, { eps: 0.002 });
  let drawn = NaN;
  const B = register(stage, (dt) => {
    const m = stepS(sp, dt);
    const t = clamp(sp.x, 0, 1);
    if (t !== drawn) { drawn = t; draw(t); }
    return m;
  });
  bag.add(B.unregister);

  let over = null;
  function retarget() {
    let t = 0;
    if (over) {
      const d = Math.hypot(over[0] - BX, over[1] - (PORT[0] + PORT[2]) / 2);
      t = clamp((reach - d) / (reach - 16), 0, 1);
      if (t > 0.8) t = 1;
    }
    sp.t = t;
    const seated = t === 1, near = t > 0;
    port.classList.toggle("hi", !near);
    plug.sil.classList.toggle("hi", near);
    leds.forEach((el) => el.setAttribute("class", seated ? "dot" : "dot off"));
    const gap = Math.hypot(...at(t).map((v, k) => v - SEAT[k]));
    read.textContent = !over ? "rest" : seated ? "link up" : "gap " + Math.round(gap);
    B.wake();
  }

  bag.add(pointer(stage, {
    move: (p) => { over = unproj(C, p[0], p[1], 0); retarget(); },
    leave: () => { over = null; retarget(); },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { reach = v; retarget(); },
    destroy: bag.dispose,
  };
}

hairline({
  name: "link",
  means: "A server's management port and a loose cable: bring the pointer near and the plug lifts, seats, and the link comes up.",
  rules: [1, 3, 4, 8],
  range: [60, 90, 130],
  mount,
});
