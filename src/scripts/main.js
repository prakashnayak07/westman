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

  /* ---------- Boot -------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", async () => {
    await loadPartials();
    initNavbar();
    setYear();
  });
})();
