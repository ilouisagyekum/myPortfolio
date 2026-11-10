(() => {
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector("#site-nav");
  if (button && nav) {
    const close = () => {
      nav.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-label", "Open navigation");
    };
    button.addEventListener("click", () => {
      const open = button.getAttribute("aria-expanded") !== "true";
      nav.classList.toggle("is-open", open);
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute(
        "aria-label",
        open ? "Close navigation" : "Open navigation",
      );
    });
    nav
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", close));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        close();
        button.focus();
      }
    });
    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target) && !button.contains(e.target)) close();
    });
    window.addEventListener("resize", () => {
      if (window.innerWidth > 800) close();
    });
  }
  const typing = document.querySelector("#typing-text");
  if (
    typing &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    const phrases = [
      "IT Support",
      "Problem Solving",
      "Technology & Learning",
      "Building with AI",
    ];
    let index = 0,
      length = phrases[0].length,
      deleting = true;
    const type = () => {
      const phrase = phrases[index];
      if (deleting) {
        length = Math.max(0, length - 1);
        typing.textContent = phrase.slice(0, length);
        if (!length) {
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
    };
    setTimeout(type, 1600);
  }
  const introVideo = document.querySelector(".intro-video");
  if (introVideo) {
    introVideo.controls = false;
    introVideo.muted = true;
    introVideo.play().catch(() => {});
  }
  if (
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    "IntersectionObserver" in window
  ) {
    const targets = document.querySelectorAll(
      "section .row, .entry, .proj, .skills > div, .cards article",
    );
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    targets.forEach((el) => {
      el.classList.add("reveal-ready");
      observer.observe(el);
    });
  }
})();
