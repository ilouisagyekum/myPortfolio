(() => {
  const d = document,
    r = d.documentElement;
  const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (s, p = d) => p.querySelector(s),
    $$ = (s, p = d) => [...p.querySelectorAll(s)];

  // Persisted, accessible theme switch shared by the homepage and services page.
  const themeButton = $(".theme-toggle");
  const updateThemeButton = () => {
    const dark = r.dataset.theme === "dark";
    if (!themeButton) return;
    themeButton.setAttribute("aria-checked", String(dark));
    themeButton.setAttribute(
      "aria-label",
      dark ? "Turn off dark mode" : "Turn on dark mode",
    );
    themeButton.setAttribute(
      "title",
      dark ? "Switch to light mode" : "Switch to dark mode",
    );
  };
  updateThemeButton();
  let themeChanging = false;
  themeButton?.addEventListener("click", async () => {
    if (themeChanging) return;
    const next = r.dataset.theme === "dark" ? "light" : "dark";
    const setTheme = () => {
      r.dataset.theme = next;
      try {
        localStorage.setItem("louis-theme-v2", next);
      } catch (e) {}
      updateThemeButton();
    };

    // Progressive enhancement: the new theme gently expands from the top-right.
    // The browser snapshots both full-page themes, including cards and imagery.
    if (!rm && typeof d.startViewTransition === "function") {
      themeChanging = true;
      r.classList.add("theme-swooping");
      try {
        const transition = d.startViewTransition(setTheme);
        await transition.finished;
      } catch (e) {
        // Theme has already been applied; no extra changes required.
      } finally {
        r.classList.remove("theme-swooping");
        themeChanging = false;
      }
    } else {
      // Older browsers: retain the original smooth color fade.
      if (!rm) r.classList.add("theme-transitioning");
      setTheme();
      window.setTimeout(() => r.classList.remove("theme-transitioning"), 650);
    }
  });

  // Headline: words rise in one by one
  const h = $("[data-split]");
  if (h && !rm) {
    const t = h.textContent.trim();
    h.setAttribute("aria-label", t);
    h.innerHTML = t
      .split(/\s+/)
      .map(
        (w, i) =>
          `<span class="w" aria-hidden="true"><span style="--i:${i}">${w}</span></span>`,
      )
      .join(" ");
  }

  // Mobile menu
  const btn = $(".menu-btn"),
    nav = $("#nav");
  if (btn && nav) {
    $$("a", nav).forEach((a, i) => a.style.setProperty("--n", i));
    const set = (o) => {
      r.classList.toggle("menu-open", o);
      btn.setAttribute("aria-expanded", o);
      btn.setAttribute("aria-label", o ? "Close menu" : "Open menu");
    };
    btn.addEventListener("click", () =>
      set(btn.getAttribute("aria-expanded") !== "true"),
    );
    nav.addEventListener("click", (e) => e.target.closest("a") && set(false));
    addEventListener("keydown", (e) => e.key === "Escape" && set(false));
    matchMedia("(min-width: 801px)").addEventListener(
      "change",
      (e) => e.matches && set(false),
    );
  }

  // Scroll progress, sticky header (hides on scroll down), mobile dock
  const bar = $(".progress"),
    hd = $("header"),
    dock = $(".dock");
  let ly = 0,
    busy = false;
  const onScroll = () => {
    if (busy) return;
    busy = true;
    requestAnimationFrame(() => {
      const y = scrollY,
        max = r.scrollHeight - innerHeight;
      if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
      hd.classList.toggle("stuck", y > 20);
      hd.classList.remove("hide");
      if (dock) dock.classList.toggle("show", y > 520);
      ly = y;
      busy = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Scroll reveals, staggered inside [data-stagger]
  $$("[data-stagger]").forEach((p) =>
    [...p.children].forEach((c, i) => {
      c.classList.add("reveal");
      c.style.setProperty("--i", i);
    }),
  );
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    $$(".reveal").forEach((el) => io.observe(el));

    // Highlight the nav link for the section you're reading
    const links = $$('nav a[href^="#"]');
    const so = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting)
            links.forEach((a) =>
              a.classList.toggle(
                "active",
                a.getAttribute("href") === "#" + e.target.id,
              ),
            );
        }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    $$("main section[id]").forEach((s) => so.observe(s));
  } else $$(".reveal").forEach((el) => el.classList.add("in"));

  // Soft spotlight that follows the pointer on project cards
  $$(".spot").forEach((el) =>
    el.addEventListener("pointermove", (e) => {
      const b = el.getBoundingClientRect();
      el.style.setProperty("--x", e.clientX - b.left + "px");
      el.style.setProperty("--y", e.clientY - b.top + "px");
    }),
  );

  // Intro video: hide the box if the file isn't there, respect reduced motion, always muted
  const v = $(".clip video");
  if (v) {
    const clip = v.closest(".clip");
    $("source", v).addEventListener("error", () => clip.remove());
    if (rm) {
      v.removeAttribute("autoplay");
      v.pause();
      v.controls = true;
    }
    v.muted = true;
  }
})();

// Rotating interest phrases from the original myPortfolio.
(() => {
  const typing = document.getElementById("typing-text");
  if (!typing || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return;
  const phrases = [
    "IT Support",
    "Problem Solving",
    "Technology & Learning",
    "Building with AI",
  ];
  let index = 0,
    length = phrases[0].length,
    deleting = true;
  function type() {
    if (deleting) {
      length = Math.max(0, length - 1);
      typing.textContent = phrases[index].slice(0, length);
      if (length === 0) {
        index = (index + 1) % phrases.length;
        deleting = false;
        setTimeout(type, 350);
        return;
      }
    } else {
      length = Math.min(phrases[index].length, length + 1);
      typing.textContent = phrases[index].slice(0, length);
      if (length === phrases[index].length) {
        deleting = true;
        setTimeout(type, 1700);
        return;
      }
    }
    setTimeout(type, deleting ? 55 : 85);
  }
  setTimeout(type, 1600);
})();
