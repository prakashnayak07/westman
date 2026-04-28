/* =========================================================
   Westman Printing — Main Script (minimal starter)
   Partial loader, navbar toggle, footer year
   ========================================================= */

(() => {
  /* ---------- Partial loader ----------------------------------------
     <div data-include="src/layouts/Navbar.html"></div>
     Fetches the fragment and replaces the host element with its HTML.
     ------------------------------------------------------------------ */
  async function loadPartials(root) {
    root = root || document;
    const hosts = root.querySelectorAll("[data-include]");
    await Promise.all(
      Array.from(hosts).map(async (host) => {
        const url = host.getAttribute("data-include");
        try {
          const res = await fetch(url, { cache: "no-cache" });
          if (!res.ok) throw new Error(res.statusText);
          const html = await res.text();
          const wrapper = document.createElement("div");
          wrapper.innerHTML = html.trim();
          const frag = document.createDocumentFragment();
          while (wrapper.firstChild) frag.appendChild(wrapper.firstChild);
          host.replaceWith(frag);
        } catch (err) {
          console.warn(`[include] Failed to load ${url}`, err);
          host.remove();
        }
      })
    );
    document.dispatchEvent(new CustomEvent("partials:loaded"));
  }

  /* ---------- Navbar: mobile menu + active link ---------------------- */
  function initNavbar() {
    const root = document.getElementById("westman-navbar");
    if (!root) return;

    const openButton = root.querySelector("[data-menu-open]");
    const closeButton = root.querySelector("[data-menu-close]");
    const mobileMenu = root.querySelector("[data-mobile-menu]");
    if (!openButton || !closeButton || !mobileMenu) return;

    let isMenuOpen = false;
    let closeTransitionHandler = null;
    let closeFallbackTimer = null;

    const openMenu = () => {
      if (isMenuOpen) return;
      isMenuOpen = true;
      if (closeTransitionHandler) {
        mobileMenu.removeEventListener("transitionend", closeTransitionHandler);
        closeTransitionHandler = null;
      }
      if (closeFallbackTimer) {
        window.clearTimeout(closeFallbackTimer);
        closeFallbackTimer = null;
      }
      mobileMenu.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
      openButton.setAttribute("aria-expanded", "true");
      requestAnimationFrame(() => {
        mobileMenu.style.transform = "translateX(0)";
        mobileMenu.style.opacity = "1";
      });
    };

    const closeMenu = () => {
      if (!isMenuOpen) return;
      isMenuOpen = false;
      mobileMenu.style.transform = "translateX(100%)";
      mobileMenu.style.opacity = "0";
      document.body.classList.remove("overflow-hidden");
      openButton.setAttribute("aria-expanded", "false");

      closeTransitionHandler = (event) => {
        if (event.target !== mobileMenu || event.propertyName !== "transform") return;
        mobileMenu.classList.add("hidden");
        mobileMenu.removeEventListener("transitionend", closeTransitionHandler);
        closeTransitionHandler = null;
        if (closeFallbackTimer) {
          window.clearTimeout(closeFallbackTimer);
          closeFallbackTimer = null;
        }
      };
      mobileMenu.addEventListener("transitionend", closeTransitionHandler);
      closeFallbackTimer = window.setTimeout(() => {
        if (!isMenuOpen) mobileMenu.classList.add("hidden");
        if (closeTransitionHandler) {
          mobileMenu.removeEventListener("transitionend", closeTransitionHandler);
          closeTransitionHandler = null;
        }
        closeFallbackTimer = null;
      }, 350);
    };

    openButton.addEventListener("click", openMenu);
    closeButton.addEventListener("click", closeMenu);

    root.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    const normalizePath = (value) => {
      if (!value) return "index";
      const path = decodeURIComponent(value)
        .split("#")[0]
        .split("?")[0]
        .replace(/\\/g, "/")
        .replace(/\/+$/, "");
      const filename = (path.split("/").pop() || "index.html").toLowerCase();
      if (!filename || filename === "index.html") return "index";
      return filename.endsWith(".html") ? filename.slice(0, -".html".length) : filename;
    };

    const getHrefPath = (href) => {
      try {
        return new URL(href, window.location.href).pathname;
      } catch (error) {
        return href;
      }
    };

    const currentPath = normalizePath(window.location.pathname);
    root.querySelectorAll("[data-desktop-link]").forEach((a) => {
      const href = a.getAttribute("href") || "index.html";
      const hrefPath = normalizePath(getHrefPath(href));
      const isActive = hrefPath === currentPath;
      if (isActive) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }

      const line = a.querySelector("[data-active-line]");
      if (line) {
        line.classList.toggle("hidden", !isActive);
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth >= 1024) closeMenu();
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  /* ---------- Footer year ------------------------------------------- */
  function setYear() {
    document.querySelectorAll("[data-year]").forEach((el) => {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------- Blog pagination --------------------------------------- */
  function initBlogPagination() {
    const cards = Array.from(document.querySelectorAll("[data-blog-card]"));
    const prevButton = document.getElementById("blogPrevPage");
    const nextButton = document.getElementById("blogNextPage");
    const pageButtons = Array.from(document.querySelectorAll(".blog-page-btn"));
    const sliderPrev = document.getElementById("blogSliderPrev");
    const sliderNext = document.getElementById("blogSliderNext");
    if (!cards.length || !prevButton || !nextButton || !pageButtons.length) return;

    let currentPage = 1;
    const getPerPage = () => 9;

    const render = () => {
      const perPage = getPerPage();
      const totalPages = Math.max(1, Math.ceil(cards.length / perPage));
      if (currentPage > totalPages) currentPage = totalPages;

      const start = (currentPage - 1) * perPage;
      const end = start + perPage;
      cards.forEach((card, index) => {
        card.classList.toggle("hidden", index < start || index >= end);
      });

      pageButtons.forEach((button, index) => {
        const page = index + 1;
        if (page <= totalPages) {
          button.classList.remove("hidden");
          button.textContent = String(page);
          button.dataset.page = String(page);
          const isActive = page === currentPage;
          button.classList.toggle("bg-[#00669E]", isActive);
          button.classList.toggle("text-white", isActive);
          button.classList.toggle("text-[#111827]", !isActive);
        } else {
          button.classList.add("hidden");
        }
      });

      prevButton.disabled = currentPage === 1;
      nextButton.disabled = currentPage === totalPages;
      prevButton.classList.toggle("opacity-50", prevButton.disabled);
      nextButton.classList.toggle("opacity-50", nextButton.disabled);
      if (sliderPrev && sliderNext) {
        sliderPrev.disabled = prevButton.disabled;
        sliderNext.disabled = nextButton.disabled;
        sliderPrev.classList.toggle("opacity-50", sliderPrev.disabled);
        sliderNext.classList.toggle("opacity-50", sliderNext.disabled);
      }
    };

    prevButton.addEventListener("click", () => {
      currentPage = Math.max(1, currentPage - 1);
      render();
    });
    nextButton.addEventListener("click", () => {
      const maxPage = Math.max(1, Math.ceil(cards.length / getPerPage()));
      currentPage = Math.min(maxPage, currentPage + 1);
      render();
    });
    pageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        currentPage = Number(button.dataset.page || "1");
        render();
      });
    });
    if (sliderPrev && sliderNext) {
      sliderPrev.addEventListener("click", () => prevButton.click());
      sliderNext.addEventListener("click", () => nextButton.click());
    }

    window.addEventListener("resize", render);
    render();
  }

  /* ---------- About services swiper ---------------------------------
     Mirrors the Figma services strip on the About page.
     Mobile/tablet stay swipeable; desktop reveals four cards with a peek
     of the next card, matching the design rhythm more closely.
     ------------------------------------------------------------------ */
  function initAboutServicesSwiper() {
    if (typeof window.Swiper !== "function") return;

    const container = document.querySelector(".about-services-swiper");
    if (!container) return;

    if (container.swiper) {
      container.swiper.destroy(true, true);
    }

    new window.Swiper(container, {
      slidesPerView: 1.08,
      spaceBetween: 20,
      watchOverflow: true,
      observer: true,
      observeParents: true,
      navigation: {
        nextEl: ".about-services-next",
        prevEl: ".about-services-prev",
      },
      breakpoints: {
        640: {
          slidesPerView: 1.45,
          spaceBetween: 24,
        },
        1024: {
          slidesPerView: "auto",
          spaceBetween: 32,
        },
        1280: {
          slidesPerView: "auto",
          spaceBetween: 32,
          slidesPerView: 1.5,
        },
      },
    });
  }

  /* ---------- Home works-slide swiper -------------------------------
     Figma: Westman Printing Working File, node 533:5139.
     A 24px-gap continuous marquee of 620x464 cards showcasing recent
     print work. Auto-scrolls linearly with reduced autoplay speed for a
     gentle reveal; autoplay pauses on hover so users can read each card.
     ------------------------------------------------------------------ */
  function initWorksSlideSwiper() {
    if (typeof window.Swiper !== "function") return;

    const container = document.querySelector(".works-slide-swiper");
    if (!container) return;

    if (container.swiper) {
      container.swiper.destroy(true, true);
    }

    new window.Swiper(container, {
      slidesPerView: "auto",
      spaceBetween: 24,
      allowTouchMove: true,
      grabCursor: true,
    });
  }

  /* ---------- Blog/Insights right-bleed swiper ----------------------
     Used by index.html blog cards and about.html insights cards.
     Each `.blog-swiper` can specify its own nav buttons via
     `data-prev` / `data-next` selectors; defaults to #blogPrev/#blogNext.
     ------------------------------------------------------------------ */
  function initBlogSwipers() {
    if (typeof window.Swiper !== "function") return;
    document.querySelectorAll(".blog-swiper").forEach((container) => {
      if (container.swiper) return;
      const prevSel = container.dataset.prev || "#blogPrev";
      const nextSel = container.dataset.next || "#blogNext";
      const prevEls = Array.from(document.querySelectorAll(prevSel));
      const nextEls = Array.from(document.querySelectorAll(nextSel));
      new window.Swiper(container, {
        slidesPerView: 1.15,
        spaceBetween: 16,
        navigation: prevEls.length && nextEls.length ? { prevEl: prevEls, nextEl: nextEls } : undefined,
        breakpoints: {
          640: { slidesPerView: 2.15, spaceBetween: 20 },
          1024: { slidesPerView: 3.15, spaceBetween: 24 },
          1280: { slidesPerView: 3.3, spaceBetween: 28 },
        },
      });
    });
  }

  /* ---------- Contact forms (visual feedback) -----------------------
     Attaches to any form with `data-contact-form`. On submit, the
     button briefly shows "Sent!" with a checkmark, then resets.
     ------------------------------------------------------------------ */
  function initContactForms() {
    document.querySelectorAll("form[data-contact-form]").forEach((form) => {
      if (form.dataset.contactBound === "true") return;
      form.dataset.contactBound = "true";
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const btn = form.querySelector('[type="submit"]');
        if (!btn) return;
        const original = btn.innerHTML;
        const originalBg = btn.style.background;
        btn.innerHTML =
          'Sent! <span class="grid h-[42px] w-[42px] place-items-center rounded-full bg-white/25"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>';
        btn.style.background = "#10b981";
        setTimeout(() => {
          btn.innerHTML = original;
          btn.style.background = originalBg;
          form.reset();
        }, 2500);
      });
    });
  }

  /* ---------- Boot -------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", async () => {
    await loadPartials();
    initNavbar();
    setYear();
    initBlogPagination();
    initAboutServicesSwiper();
    initWorksSlideSwiper();
    initBlogSwipers();
    initContactForms();
  });
})();
