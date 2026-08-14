/* ============================================
   WayToBuy — main.js
   Ukázková data + veškerá interaktivita webu.
   Až budeš mít reálný obsah, nahraď pole ARTICLES a COUPONS níže.
============================================ */

/* ---------- UKÁZKOVÁ DATA: ČLÁNKY ---------- */
/* slug = unikátní identifikátor v URL (clanek.html?slug=...)
   body = pole odstavců (HTML dovoleno), zobrazí se na detailu článku */
const ARTICLES = [
  {
    slug: "10-darku-do-1000-kc",
    title: "10 dárků do 1000 Kč, které potěší každého",
    category: "Dárkové tipy",
    excerpt: "Sestavili jsme přehled dárků, které nezruinují peněženku, ale přesto vypadají jako promyšlená volba.",
    date: "12. srpna 2026",
    body: [
      "Vybrat dárek, který nepůsobí jako narychlo koupená povinnost, ale zároveň nezatíží rozpočet, není snadné. Proto jsme sestavili seznam deseti tipů do 1000 Kč, které fungují snad na každého.",
      "Tohle je ukázkový text článku — až budeš mít hotový reálný obsah, jednoduše nahradíš pole <code>body</code> u příslušného článku v souboru <code>assets/js/main.js</code>.",
      "Mezi doporučeními najdeš věci pro milovníky kávy, útulné doplňky do bytu i drobnosti, které potěší na cestách."
    ]
  },
  {
    slug: "jak-usetrit-na-online-nakupech",
    title: "Jak ušetřit na online nákupech: 7 chytrých triků",
    category: "Návody",
    excerpt: "Slevové kódy nejsou jediný způsob, jak platit méně. Ukážeme ti pár triků, které možná ještě neznáš.",
    date: "8. srpna 2026",
    body: [
      "Slevový kód je jen začátek. Pokud chceš nakupovat opravdu chytře, existuje pár dalších triků — od načasování nákupu až po sledování historie cen.",
      "Toto je ukázkový obsah. Nahraď ho vlastním textem v poli <code>body</code>."
    ]
  },
  {
    slug: "nejlepsi-cesky-eshopy-2026",
    title: "Nejlepší české e-shopy pro rok 2026",
    category: "Inspirace",
    excerpt: "Prošli jsme desítky obchodů a vybrali ty, které nabízí nejlepší poměr kvality, ceny a zákaznické podpory.",
    date: "2. srpna 2026",
    body: [
      "Český e-commerce trh se za poslední roky výrazně proměnil. Přinášíme přehled obchodů, které stojí za pozornost.",
      "Ukázkový text — doplň vlastní obsah."
    ]
  },
  {
    slug: "darky-pro-nej-ktery-uz-vse-ma",
    title: "Dárek pro toho, kdo už má úplně všechno",
    category: "Dárkové tipy",
    excerpt: "Tipy na originální dárky pro lidi, které je těžké čímkoliv překvapit.",
    date: "27. července 2026",
    body: [
      "Někdy je nejtěžší najít dárek právě pro člověka, který si sám koupí, co potřebuje. Tady je pár nápadů, které fungují.",
      "Ukázkový text — doplň vlastní obsah."
    ]
  },
  {
    slug: "kdy-nakupovat-nejvyhodneji",
    title: "Kdy nakupovat nejvýhodněji? Kalendář slevových sezón",
    category: "Návody",
    excerpt: "Black Friday zdaleka není jediný termín, kdy se vyplatí sledovat ceny. Přehled celého roku.",
    date: "19. července 2026",
    body: [
      "Slevové sezóny se dají naplánovat dopředu. Ukážeme ti, kdy má smysl čekat a kdy naopak neváhat.",
      "Ukázkový text — doplň vlastní obsah."
    ]
  },
  {
    slug: "udrzitelne-znacky-ktere-milujeme",
    title: "Udržitelné značky, které milujeme",
    category: "Inspirace",
    excerpt: "Výběr českých i zahraničních značek, které si dávají záležet na kvalitě i dopadu na planetu.",
    date: "11. července 2026",
    body: [
      "Udržitelnost dnes neznamená kompromis v designu ani kvalitě. Tyto značky to dokazují.",
      "Ukázkový text — doplň vlastní obsah."
    ]
  }
];

/* ---------- UKÁZKOVÁ DATA: KUPÓNY ---------- */
/* color: sage | butter | blue | coral | terracotta (cyklí se automaticky, pokud nevyplníš) */
const COUPONS = [
  { id: 1, brand: "Notino", discount: "20 %", code: "WAYTOBUY20", until: "31. 8. 2026", color: "sage", url: "#" },
  { id: 2, brand: "Alza",   discount: "500 Kč", code: "ALZA500", until: "25. 8. 2026", color: "butter", url: "#" },
  { id: 3, brand: "Zoot",   discount: "15 %", code: "ZOOT15", until: "20. 8. 2026", color: "blue", url: "#" },
  { id: 4, brand: "Mall.cz", discount: "10 %", code: "MALL10", until: "1. 9. 2026", color: "coral", url: "#" },
  { id: 5, brand: "Dr. Max", discount: "25 %", code: "DRMAX25", until: "18. 8. 2026", color: "terracotta", url: "#" },
  { id: 6, brand: "Bushman", discount: "30 %", code: "BUSHMAN30", until: "5. 9. 2026", color: "sage", url: "#" },
  { id: 7, brand: "Datart",  discount: "1000 Kč", code: "DATART1000", until: "28. 8. 2026", color: "butter", url: "#" },
  { id: 8, brand: "Sephora", discount: "20 %", code: "SEPHORA20", until: "22. 8. 2026", color: "blue", url: "#" }
];

/* ========== POMOCNÉ FUNKCE ========== */

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function parseCzDate(str) {
  // "12. srpna 2026" -> Date
  const months = { "ledna":0,"února":1,"března":2,"dubna":3,"května":4,"června":5,"července":6,"srpna":7,"září":8,"října":9,"listopadu":10,"prosince":11 };
  const m = str.match(/(\d+)\.\s*([a-zá-ž]+)\s*(\d{4})/i);
  if (!m) return new Date(0);
  const day = parseInt(m[1], 10);
  const month = months[m[2].toLowerCase()] ?? 0;
  const year = parseInt(m[3], 10);
  return new Date(year, month, day);
}

function parseCzUntil(str) {
  // "31. 8. 2026" -> Date
  const m = str.match(/(\d+)\.\s*(\d+)\.\s*(\d{4})/);
  if (!m) return new Date(0);
  return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
}

/* ========== RENDER: ČLÁNKY ========== */

function articleCardHtml(a, index) {
  return `
    <article class="post-outer-container">
      <div class="post-outer">
        <div class="post">
          <a class="wtb-card-thumb" href="clanek.html?slug=${encodeURIComponent(a.slug)}">
            <span class="wtb-card-thumb-icon">✦</span>
          </a>
          <div class="wtb-card-body">
            <span class="wtb-card-cat">${escapeHtml(a.category)}</span>
            <h3 class="wtb-card-title"><a href="clanek.html?slug=${encodeURIComponent(a.slug)}">${escapeHtml(a.title)}</a></h3>
            <p class="wtb-card-excerpt">${escapeHtml(a.excerpt)}</p>
            <div class="wtb-card-meta">
              <span class="wtb-card-date">${escapeHtml(a.date)}</span>
              <a class="wtb-card-link" href="clanek.html?slug=${encodeURIComponent(a.slug)}">Číst článek →</a>
            </div>
          </div>
        </div>
      </div>
    </article>`;
}

function renderArticleGrid(containerId, articles) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!articles.length) {
    el.innerHTML = `<p class="wtb-empty-state">Žádné články neodpovídají hledání ✦</p>`;
    return;
  }
  el.className = el.className ? el.className + " blog-posts" : "blog-posts";
  el.innerHTML = articles.map(articleCardHtml).join("");
}

function initArticlesPage() {
  const grid = document.getElementById("article-grid");
  if (!grid) return;

  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");
  const chipGroup = document.getElementById("chip-group");

  const categories = ["Vše", ...new Set(ARTICLES.map(a => a.category))];
  if (chipGroup) {
    chipGroup.innerHTML = categories.map((c, i) =>
      `<button class="wtb-chip${i === 0 ? " active" : ""}" data-cat="${escapeHtml(c)}">${escapeHtml(c)}</button>`
    ).join("");
  }

  if (sortSelect) {
    sortSelect.innerHTML = `
      <option value="newest">Nejnovější</option>
      <option value="oldest">Nejstarší</option>
      <option value="az">A–Z</option>
    `;
  }

  let activeCat = "Vše";

  function apply() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const sort = sortSelect?.value || "newest";

    let list = ARTICLES.filter(a => {
      const matchesCat = activeCat === "Vše" || a.category === activeCat;
      const matchesQ = !q || a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });

    list.sort((a, b) => {
      if (sort === "az") return a.title.localeCompare(b.title, "cs");
      const da = parseCzDate(a.date), db = parseCzDate(b.date);
      return sort === "oldest" ? da - db : db - da;
    });

    renderArticleGrid("article-grid", list);
  }

  searchInput?.addEventListener("input", apply);
  sortSelect?.addEventListener("change", apply);
  chipGroup?.addEventListener("click", (e) => {
    const btn = e.target.closest(".wtb-chip");
    if (!btn) return;
    chipGroup.querySelectorAll(".wtb-chip").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    activeCat = btn.dataset.cat;
    apply();
  });

  apply();
}

function initHomeArticles() {
  const el = document.getElementById("home-article-grid");
  if (!el) return;
  const latest = [...ARTICLES].sort((a, b) => parseCzDate(b.date) - parseCzDate(a.date)).slice(0, 3);
  renderArticleGrid("home-article-grid", latest);
}

/* ========== RENDER: DETAIL ČLÁNKU ========== */

function initArticleDetail() {
  const el = document.getElementById("post-detail");
  if (!el) return;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const article = ARTICLES.find(a => a.slug === slug) || ARTICLES[0];

  if (!article) {
    el.innerHTML = `<p class="wtb-empty-state">Článek nebyl nalezen ✦</p>`;
    return;
  }

  document.title = article.title + " — WayToBuy";
  el.innerHTML = `
    <span class="wtb-card-cat">${escapeHtml(article.category)}</span>
    <h1>${escapeHtml(article.title)}</h1>
    <span class="wtb-post-date">${escapeHtml(article.date)}</span>
    <div class="wtb-post-thumb"><span class="wtb-card-thumb-icon">✦</span></div>
    <div class="wtb-post-body">
      ${article.body.map(p => `<p>${p}</p>`).join("")}
    </div>
  `;
}

/* ========== RENDER: KUPÓNY ========== */

const COUPON_COLORS = ["sage", "butter", "blue", "coral", "terracotta"];

function couponCardHtml(c, index) {
  const color = c.color || COUPON_COLORS[index % COUPON_COLORS.length];
  return `
    <div class="wtb-coupon wtb-coupon-${color}" data-code="${escapeHtml(c.code)}">
      <div class="wtb-coupon-top">
        <span class="wtb-coupon-brand">${escapeHtml(c.brand)}</span>
        <a class="wtb-coupon-fav" href="${escapeHtml(c.url)}" title="Přejít do obchodu" target="_blank" rel="noopener nofollow sponsored">↗</a>
      </div>
      <div class="wtb-coupon-discount"><span class="minus">−</span>${escapeHtml(c.discount)}</div>
      <div class="wtb-coupon-bottom">
        <span class="wtb-coupon-until">Do ${escapeHtml(c.until)}</span>
        <button class="wtb-coupon-copy" type="button">${escapeHtml(c.code)}</button>
      </div>
    </div>`;
}

function bindCouponCopy(container) {
  container.querySelectorAll(".wtb-coupon-copy").forEach(btn => {
    btn.addEventListener("click", () => {
      const code = btn.closest(".wtb-coupon").dataset.code;
      navigator.clipboard?.writeText(code).catch(() => {});
      const original = btn.textContent;
      btn.textContent = "Zkopírováno ✓";
      btn.classList.add("copied");
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1800);
    });
  });
}

function renderCouponGrid(containerId, coupons) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!coupons.length) {
    el.innerHTML = `<p class="wtb-empty-state">Žádné kupóny neodpovídají hledání ✦</p>`;
    return;
  }
  el.innerHTML = coupons.map(couponCardHtml).join("");
  bindCouponCopy(el);
}

function initCouponsPage() {
  const grid = document.getElementById("coupon-grid");
  if (!grid) return;

  const searchInput = document.getElementById("search-input");
  const sortSelect = document.getElementById("sort-select");
  const chipGroup = document.getElementById("chip-group");

  const brands = ["Vše", ...new Set(COUPONS.map(c => c.brand))];
  if (chipGroup) {
    chipGroup.innerHTML = brands.map((b, i) =>
      `<button class="wtb-chip${i === 0 ? " active" : ""}" data-brand="${escapeHtml(b)}">${escapeHtml(b)}</button>`
    ).join("");
  }

  if (sortSelect) {
    sortSelect.innerHTML = `
      <option value="ending">Brzy končí</option>
      <option value="newest">Nejnovější</option>
      <option value="az">Obchod A–Z</option>
    `;
  }

  let activeBrand = "Vše";

  function apply() {
    const q = (searchInput?.value || "").trim().toLowerCase();
    const sort = sortSelect?.value || "ending";

    let list = COUPONS.filter(c => {
      const matchesBrand = activeBrand === "Vše" || c.brand === activeBrand;
      const matchesQ = !q || c.brand.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
      return matchesBrand && matchesQ;
    });

    list.sort((a, b) => {
      if (sort === "az") return a.brand.localeCompare(b.brand, "cs");
      if (sort === "newest") return b.id - a.id;
      return parseCzUntil(a.until) - parseCzUntil(b.until);
    });

    renderCouponGrid("coupon-grid", list);
  }

  searchInput?.addEventListener("input", apply);
  sortSelect?.addEventListener("change", apply);
  chipGroup?.addEventListener("click", (e) => {
    const btn = e.target.closest(".wtb-chip");
    if (!btn) return;
    chipGroup.querySelectorAll(".wtb-chip").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    activeBrand = btn.dataset.brand;
    apply();
  });

  apply();
}

function initHomeCoupons() {
  const el = document.getElementById("coupon-strip");
  if (!el) return;
  const list = [...COUPONS].sort((a, b) => parseCzUntil(a.until) - parseCzUntil(b.until)).slice(0, 5);
  renderCouponGrid("coupon-strip", list);
}

/* ========== MOBILNÍ MENU ========== */

function initMobileNav() {
  const btn = document.getElementById("wtbHamburger");
  const nav = document.getElementById("wtbMobileNav");
  const closeBtn = document.getElementById("wtbMobileClose");
  if (!btn || !nav) return;
  const links = nav.querySelectorAll("a");
  function closeMenu() {
    btn.classList.remove("open");
    nav.classList.remove("open");
  }
  btn.addEventListener("click", () => {
    btn.classList.toggle("open");
    nav.classList.toggle("open");
  });
  closeBtn?.addEventListener("click", closeMenu);
  links.forEach(l => l.addEventListener("click", closeMenu));
}

/* ========== INIT ========== */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNav();
  initHomeArticles();
  initHomeCoupons();
  initArticlesPage();
  initCouponsPage();
  initArticleDetail();
});
