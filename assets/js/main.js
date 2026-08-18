/*
-----------------------------------------------
WayToBuy - main.js
Načítá data/articles.json a data/coupons.json
a vykresluje kupóny, články a detail článku
do statického HTML (index, clanky, kupony, clanek).
----------------------------------------------- */

(function () {
  'use strict';

  var DATA_ARTICLES = 'data/articles.json';
  var DATA_COUPONS = 'data/coupons.json';
  var COUPON_COLORS = ['sage', 'butter', 'blue', 'coral', 'terracotta'];

  // ---------- Pomocné funkce ----------

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Sjednotí formát slevy: "0.06" -> "6%", "10" -> "10%", "300Kč" -> "300 Kč", "10%" beze změny.
  function formatDiscount(raw) {
    if (raw === null || raw === undefined || raw === '') return '';
    var str = String(raw).trim();
    if (/%/.test(str)) return str;
    if (/kč/i.test(str)) return str.replace(/\s*kč/i, ' Kč').trim();
    var num = parseFloat(str.replace(',', '.'));
    if (isNaN(num)) return str;
    if (num > 0 && num < 1) return Math.round(num * 100) + '%';
    if (num >= 1 && num <= 100) return Math.round(num) + '%';
    return Math.round(num) + ' Kč';
  }

  function formatDateCz(iso) {
    if (!iso) return '';
    var parts = String(iso).split('-');
    if (parts.length !== 3) return iso;
    var d = parseInt(parts[2], 10), m = parseInt(parts[1], 10), r = parseInt(parts[0], 10);
    if (!d || !m || !r) return iso;
    return d + '. ' + m + '. ' + r;
  }

  function parseDateSafe(iso) {
    var t = Date.parse(iso);
    return isNaN(t) ? 0 : t;
  }

  function fetchJson(url) {
    return fetch(url + '?v=' + Date.now()).then(function (res) {
      if (!res.ok) throw new Error('Nepodařilo se načíst ' + url);
      return res.json();
    });
  }

  function getQueryParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  // ---------- Mobilní menu (hamburger) ----------

  function initMobileNav() {
    var btn = document.getElementById('wtbHamburger');
    var nav = document.getElementById('wtbMobileNav');
    var closeBtn = document.getElementById('wtbMobileClose');
    if (!btn || !nav) return;

    function open() {
      nav.classList.add('open');
      btn.classList.add('open');
    }
    function close() {
      nav.classList.remove('open');
      btn.classList.remove('open');
    }
    btn.addEventListener('click', function () {
      nav.classList.contains('open') ? close() : open();
    });
    if (closeBtn) closeBtn.addEventListener('click', close);
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', close);
    });
  }

  // ---------- Vykreslení kupónu ----------

  function couponCardHtml(coupon, index) {
    var color = coupon.color || COUPON_COLORS[index % COUPON_COLORS.length];
    var brand = escapeHtml(coupon.brand || 'Slevový kód');
    var code = escapeHtml(coupon.code || '');
    var discount = escapeHtml(formatDiscount(coupon.discount));
    var untilHtml = coupon.until
      ? '<span class="wtb-coupon-until">Platí do ' + escapeHtml(formatDateCz(coupon.until)) + '</span>'
      : '<span class="wtb-coupon-until"></span>';
    var link = coupon.url && coupon.url !== '#' ? coupon.url : null;
    var descHtml = coupon.description
      ? '<p class="wtb-coupon-desc">' + escapeHtml(coupon.description) + '</p>'
      : '';

    return (
      '<div class="wtb-coupon wtb-coupon-' + color + '" data-brand="' + brand.toLowerCase() + '" data-code="' + code + '" data-until="' + escapeHtml(coupon.until || '') + '">' +
        '<div class="wtb-coupon-top">' +
          '<span class="wtb-coupon-brand">' + brand + '</span>' +
          '<span class="wtb-coupon-fav">🎁</span>' +
        '</div>' +
        '<div class="wtb-coupon-discount">' + discount + '</div>' +
        descHtml +
        '<div class="wtb-coupon-bottom">' +
          untilHtml +
          '<button type="button" class="wtb-coupon-copy" data-code="' + code + '" data-link="' + escapeHtml(link || '') + '">' +
            (code ? code : 'Zobrazit') +
          '</button>' +
        '</div>' +
      '</div>'
    );
  }

  function wireCouponCopyButtons(container) {
    container.querySelectorAll('.wtb-coupon-copy').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var code = btn.getAttribute('data-code');
        var link = btn.getAttribute('data-link');
        if (code) {
          navigator.clipboard && navigator.clipboard.writeText(code).catch(function () {});
          var original = btn.textContent;
          btn.textContent = 'Zkopírováno!';
          btn.classList.add('copied');
          setTimeout(function () {
            btn.textContent = original;
            btn.classList.remove('copied');
          }, 1600);
        }
        if (link) {
          window.open(link, '_blank', 'noopener');
        }
      });
    });
  }

  function renderCoupons(container, coupons) {
    if (!container) return;
    if (!coupons.length) {
      container.innerHTML = '<p class="wtb-empty-state">Zatím tu nejsou žádné kupóny.</p>';
      return;
    }
    container.innerHTML = coupons.map(couponCardHtml).join('');
    wireCouponCopyButtons(container);
  }

  // ---------- Vykreslení článku (karta) ----------

  function articleCardHtml(article) {
    var title = escapeHtml(article.title || '');
    var excerpt = escapeHtml(article.excerpt || '');
    var category = escapeHtml(article.category || '');
    var date = formatDateCz(article.date);
    var href = 'clanek.html?slug=' + encodeURIComponent(article.slug || '');
    var thumb = article.image
      ? '<a class="wtb-card-thumb" href="' + href + '"><img src="' + escapeHtml(article.image) + '" alt="' + title + '" loading="lazy"></a>'
      : '<a class="wtb-card-thumb" href="' + href + '"><span class="wtb-card-thumb-icon">✦</span></a>';

    return (
      '<div class="post-outer">' +
        '<div class="post">' +
          thumb +
          '<div class="wtb-card-body">' +
            (category ? '<span class="wtb-card-cat">' + category + '</span>' : '') +
            '<h3 class="wtb-card-title"><a href="' + href + '">' + title + '</a></h3>' +
            '<p class="wtb-card-excerpt">' + excerpt + '</p>' +
            '<div class="wtb-card-meta">' +
              '<span class="wtb-card-date">' + date + '</span>' +
              '<a class="wtb-card-link" href="' + href + '">Číst více →</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function renderArticles(container, articles) {
    if (!container) return;
    if (!articles.length) {
      container.innerHTML = '<p class="wtb-empty-state">Zatím tu nejsou žádné články.</p>';
      return;
    }
    container.innerHTML = articles.map(articleCardHtml).join('');
  }

  // ---------- Filtrování / řazení (společné pro clanky.html a kupony.html) ----------

  function initFilterableList(opts) {
    // opts: { items, groupKey, render, container, chipGroup, searchInput, sortSelect, searchKeys, sortOptions }
    var state = { query: '', activeChip: 'Vše', sort: opts.sortOptions[0].value };

    function apply() {
      var filtered = opts.items.filter(function (item) {
        var matchesChip = state.activeChip === 'Vše' || (item[opts.groupKey] || '').toLowerCase() === state.activeChip.toLowerCase();
        var matchesQuery = !state.query || opts.searchKeys.some(function (key) {
          return (item[key] || '').toString().toLowerCase().indexOf(state.query) !== -1;
        });
        return matchesChip && matchesQuery;
      });

      var sorter = opts.sortOptions.find(function (s) { return s.value === state.sort; });
      if (sorter) filtered = filtered.slice().sort(sorter.compare);

      opts.render(filtered);
    }

    if (opts.chipGroup) {
      var groups = ['Vše'];
      opts.items.forEach(function (item) {
        var v = item[opts.groupKey];
        if (v && groups.indexOf(v) === -1) groups.push(v);
      });
      opts.chipGroup.innerHTML = groups.map(function (g) {
        return '<button type="button" class="wtb-chip' + (g === 'Vše' ? ' active' : '') + '" data-chip="' + escapeHtml(g) + '">' + escapeHtml(g) + '</button>';
      }).join('');
      opts.chipGroup.querySelectorAll('.wtb-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          opts.chipGroup.querySelectorAll('.wtb-chip').forEach(function (c) { c.classList.remove('active'); });
          chip.classList.add('active');
          state.activeChip = chip.getAttribute('data-chip');
          apply();
        });
      });
    }

    if (opts.sortSelect) {
      opts.sortSelect.innerHTML = opts.sortOptions.map(function (s) {
        return '<option value="' + s.value + '">' + escapeHtml(s.label) + '</option>';
      }).join('');
      opts.sortSelect.addEventListener('change', function () {
        state.sort = opts.sortSelect.value;
        apply();
      });
    }

    if (opts.searchInput) {
      opts.searchInput.addEventListener('input', function () {
        state.query = opts.searchInput.value.trim().toLowerCase();
        apply();
      });
    }

    apply();
  }

  // ---------- Stránkové inicializace ----------

  function initHomePage() {
    var couponStrip = document.getElementById('coupon-strip');
    var articleGrid = document.getElementById('home-article-grid');
    if (!couponStrip && !articleGrid) return;

    if (couponStrip) {
      fetchJson(DATA_COUPONS).then(function (coupons) {
        var valid = (coupons || []).filter(function (c) { return c && c.brand; });
        renderCoupons(couponStrip, valid.slice(0, 8));
      }).catch(function () {
        couponStrip.innerHTML = '<p class="wtb-empty-state">Kupóny se nepodařilo načíst.</p>';
      });
    }

    if (articleGrid) {
      fetchJson(DATA_ARTICLES).then(function (articles) {
        var sorted = (articles || []).slice().sort(function (a, b) { return parseDateSafe(b.date) - parseDateSafe(a.date); });
        renderArticles(articleGrid, sorted.slice(0, 3));
      }).catch(function () {
        articleGrid.innerHTML = '<p class="wtb-empty-state">Články se nepodařilo načíst.</p>';
      });
    }
  }

  function initCouponsPage() {
    var grid = document.getElementById('coupon-grid');
    if (!grid) return;
    var chipGroup = document.getElementById('chip-group');
    var sortSelect = document.getElementById('sort-select');
    var searchInput = document.getElementById('search-input');

    fetchJson(DATA_COUPONS).then(function (coupons) {
      var valid = (coupons || []).filter(function (c) { return c && c.brand; });
      initFilterableList({
        items: valid,
        groupKey: 'brand',
        searchKeys: ['brand', 'code'],
        chipGroup: chipGroup,
        sortSelect: sortSelect,
        searchInput: searchInput,
        sortOptions: [
          { value: 'newest', label: 'Nejnovější', compare: function (a, b) { return (b.id || 0) - (a.id || 0); } },
          { value: 'ending', label: 'Končí brzy', compare: function (a, b) { return parseDateSafe(a.until) - parseDateSafe(b.until); } },
          { value: 'az', label: 'Abecedně A-Z', compare: function (a, b) { return (a.brand || '').localeCompare(b.brand || '', 'cs'); } },
        ],
        render: function (filtered) { renderCoupons(grid, filtered); },
      });
    }).catch(function () {
      grid.innerHTML = '<p class="wtb-empty-state">Kupóny se nepodařilo načíst.</p>';
    });
  }

  function initArticlesPage() {
    var grid = document.getElementById('article-grid');
    if (!grid) return;
    var chipGroup = document.getElementById('chip-group');
    var sortSelect = document.getElementById('sort-select');
    var searchInput = document.getElementById('search-input');

    fetchJson(DATA_ARTICLES).then(function (articles) {
      initFilterableList({
        items: articles || [],
        groupKey: 'category',
        searchKeys: ['title', 'excerpt', 'category'],
        chipGroup: chipGroup,
        sortSelect: sortSelect,
        searchInput: searchInput,
        sortOptions: [
          { value: 'newest', label: 'Nejnovější', compare: function (a, b) { return parseDateSafe(b.date) - parseDateSafe(a.date); } },
          { value: 'oldest', label: 'Nejstarší', compare: function (a, b) { return parseDateSafe(a.date) - parseDateSafe(b.date); } },
          { value: 'az', label: 'Abecedně A-Z', compare: function (a, b) { return (a.title || '').localeCompare(b.title || '', 'cs'); } },
        ],
        render: function (filtered) { renderArticles(grid, filtered); },
      });
    }).catch(function () {
      grid.innerHTML = '<p class="wtb-empty-state">Články se nepodařilo načíst.</p>';
    });
  }

  function initArticleDetailPage() {
    var container = document.getElementById('post-detail');
    if (!container) return;
    var slug = getQueryParam('slug');

    if (!slug) {
      container.innerHTML = '<p class="wtb-empty-state">Článek nebyl nalezen.</p>';
      return;
    }

    fetchJson(DATA_ARTICLES).then(function (articles) {
      var article = (articles || []).find(function (a) { return a.slug === slug; });
      if (!article) {
        container.innerHTML = '<p class="wtb-empty-state">Tento článek už tu bohužel není.</p>';
        return;
      }
      document.title = article.title + ' — WayToBuy';
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && article.excerpt) metaDesc.setAttribute('content', article.excerpt);

      var thumbHtml = article.image
        ? '<div class="wtb-post-thumb"><img src="' + escapeHtml(article.image) + '" alt="' + escapeHtml(article.title) + '" style="width:100%;height:100%;object-fit:cover"></div>'
        : '';

      container.innerHTML =
        (article.category ? '<span class="wtb-card-cat">' + escapeHtml(article.category) + '</span>' : '') +
        '<h1>' + escapeHtml(article.title) + '</h1>' +
        '<span class="wtb-post-date">' + formatDateCz(article.date) + '</span>' +
        thumbHtml +
        '<div class="wtb-post-body">' + (article.body || '') + '</div>';
    }).catch(function () {
      container.innerHTML = '<p class="wtb-empty-state">Článek se nepodařilo načíst.</p>';
    });
  }

  // ---------- Start ----------

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHomePage();
    initCouponsPage();
    initArticlesPage();
    initArticleDetailPage();
  });
})();
