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

    const openMenu = () => {
      mobileMenu.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
      openButton.setAttribute("aria-expanded", "true");
    };

    const closeMenu = () => {
      mobileMenu.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
      openButton.setAttribute("aria-expanded", "false");
    };

    openButton.addEventListener("click", openMenu);
    closeButton.addEventListener("click", closeMenu);

    root.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    const normalizePath = (value) => {
      if (!value) return "/";
      let cleaned = value.toLowerCase().replace(/\/+$/, "");
      if (cleaned.endsWith("/index.html")) cleaned = cleaned.slice(0, -"/index.html".length) || "/";
      if (cleaned.endsWith(".html") && !cleaned.includes("/")) cleaned = "/";
      return cleaned === "" ? "/" : cleaned;
    };

    const currentPath = normalizePath(window.location.pathname);
    root.querySelectorAll("[data-desktop-link]").forEach((a) => {
      const href = a.getAttribute("href") || "/";
      const hrefPath = normalizePath(new URL(href, window.location.origin).pathname);
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

    const prevEl = document.querySelector(".about-services-prev");
    const nextEl = document.querySelector(".about-services-next");

    if (container.swiper) {
      container.swiper.destroy(true, true);
    }

    new window.Swiper(container, {
      slidesPerView: 1.08,
      spaceBetween: 20,
      watchOverflow: true,
      observer: true,
      observeParents: true,
      navigation: prevEl && nextEl ? { nextEl, prevEl } : undefined,
      breakpoints: {
        640: {
          slidesPerView: 1.45,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: "auto",
          spaceBetween: 24,
        },
        1280: {
          slidesPerView: "auto",
          spaceBetween: 24,
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
      loop: true,
      speed: 4000,
      allowTouchMove: true,
      grabCursor: true,
      autoplay: {
        delay: 0,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
    });

    // Keep the marquee timing linear so cards slide at a constant pace.
    const wrapper = container.querySelector(".swiper-wrapper");
    if (wrapper) wrapper.style.transitionTimingFunction = "linear";
  }

  /* ---------- Boot -------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", async () => {
    await loadPartials();
    initNavbar();
    setYear();
    initBlogPagination();
    initAboutServicesSwiper();
    initWorksSlideSwiper();
  });
})();
