/*
 * The page's own behaviour: the theme switch, the narrow-screen menu, the
 * copy button, and the host that mounts the isometric figures.
 *
 * Each figure in static/js/figures is written for Hairline's kernel (the
 * global HL) and ends with `hairline({ name, means, range, mount })`. This
 * file defines that call and mounts each figure into the element that names
 * it, the way Hairline's own bench does.
 */
(() => {
  const root = document.documentElement;
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* private mode */ } },
  };

  /* Theme: the system's by default; the button cycles system → light → dark. */
  const THEMES = ["system", "light", "dark"];
  function applyTheme(t) {
    if (t === "system") delete root.dataset.theme; else root.dataset.theme = t;
    store.set("theme", t === "system" ? null : t);
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
      b.dataset.state = t;
      b.setAttribute("aria-label", "Colour theme: " + t);
      b.title = "Theme: " + t;
    });
  }

  /* Figures: the slider's middle value, with no slider on the page. */
  const middle = (range) => range[1];
  function mount(figure) {
    document.querySelectorAll(`[data-figure="${figure.name}"]`).forEach((stage) => {
      HL.inject(document);
      stage.setAttribute("data-hairline", figure.name);
      const svg = HL.mk("svg", { viewBox: "0 0 400 320", "aria-hidden": "true" }, stage);
      // A figure writes a short caption of what is under the pointer; the page does not show it.
      figure.mount({ stage, svg, read: { textContent: "" } }, middle(figure.range));
    });
  }
  window.hairline = (figure) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => mount(figure));
    else mount(figure);
  };

  /* Copy buttons: one line per .line span, so wrapped lines copy as written. */
  function wireCopy(box) {
    const btn = box.querySelector("[data-copy-button]"), src = box.querySelector("code");
    btn.addEventListener("click", async () => {
      const text = [...src.querySelectorAll(".line")].map((l) => l.textContent).join("\n");
      try { await navigator.clipboard.writeText(text); btn.textContent = "Copied"; }
      catch {
        const r = document.createRange(); r.selectNodeContents(src);
        const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
        btn.textContent = "Selected";
      }
      setTimeout(() => { btn.textContent = "Copy"; }, 1600);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(store.get("theme") || "system");
    document.querySelectorAll("[data-theme-toggle]").forEach((b) => b.addEventListener("click", () => {
      applyTheme(THEMES[(THEMES.indexOf(b.dataset.state) + 1) % THEMES.length]);
    }));
    document.querySelectorAll("[data-copy]").forEach(wireCopy);

    /* The narrow-screen menu closes when a link in it is followed, or on Escape. */
    document.querySelectorAll("[data-menu]").forEach((menu) => {
      menu.addEventListener("click", (e) => { if (e.target.closest("a")) menu.open = false; });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.open) { menu.open = false; menu.querySelector("summary").focus(); } });
    });
  });
})();
