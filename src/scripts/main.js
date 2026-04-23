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

  /* ---------- Navbar: toggle + active link --------------------------- */
  function initNavbar() {
    const toggle = document.querySelector("[data-nav-toggle]");
    const menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) return;

    const closeMenu = () => {
      menu.classList.add("hidden");
      toggle.setAttribute("aria-expanded", "false");
    };

    const openMenu = () => {
      menu.classList.remove("hidden");
      toggle.setAttribute("aria-expanded", "true");
    };

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      if (open) closeMenu();
      else openMenu();
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    menu.querySelectorAll("a[href]").forEach((a) => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === path || (path === "" && href === "index.html")) {
        a.setAttribute("aria-current", "page");
      }
    });

    const mq = window.matchMedia("(min-width: 768px)");
    const syncMenuByViewport = () => {
      if (mq.matches) {
        menu.classList.remove("hidden");
        toggle.setAttribute("aria-expanded", "false");
      } else {
        menu.classList.add("hidden");
      }
    };

    syncMenuByViewport();
    mq.addEventListener("change", syncMenuByViewport);
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
