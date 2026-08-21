// api/clanek.js
// Serveruje detail článku (clanek.html?slug=...) s SPRÁVNÝMI meta tagy
// (title, description, Open Graph, Twitter Card) vygenerovanými podle
// konkrétního článku ještě PŘED tím, než se stránka pošle prohlížeči/robotovi.
//
// Proč to je potřeba: kliento-stranový JS (main.js) sice titulek stránky
// po načtení opraví, ale Facebook/Instagram/Messenger/WhatsApp při sdílení
// odkazu JavaScript nespouští - čtou jen to, co přijde v prvotní HTML odpovědi.
// Bez téhle funkce by tedy každý sdílený článek ukazoval stejný obecný
// náhled "Článek — WayToBuy" místo skutečného titulku a obrázku.
//
// Routing: ve vercel.json je nastaven rewrite z /clanek.html na /api/clanek,
// takže URL v odkazech (clanek.html?slug=...) zůstává beze změny.

export const config = { runtime: 'nodejs' };

function escapeAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Odstraní HTML tagy a zkrátí text na rozumnou délku pro meta description
function toPlainExcerpt(html, maxLen) {
  var text = String(html || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).replace(/\s+\S*$/, '') + '…';
}

export default async function handler(req, res) {
  try {
    var host = req.headers['x-forwarded-host'] || req.headers.host;
    var protocol = (req.headers['x-forwarded-proto'] || 'https');
    var origin = protocol + '://' + host;

    var slug = '';
    try {
      var url = new URL(req.url, origin);
      slug = url.searchParams.get('slug') || '';
    } catch (e) {
      slug = '';
    }

    // Načti šablonu stránky a seznam článků paralelně
    var templateRes, articlesRes;
    try {
      var results = await Promise.all([
        fetch(origin + '/clanek-template.html'),
        fetch(origin + '/data/articles.json')
      ]);
      templateRes = results[0];
      articlesRes = results[1];
    } catch (e) {
      // Pokud selže interní fetch, spadni zpátky na obecnou šablonu bez úprav
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send('<!DOCTYPE html><html><body>Chyba načítání stránky.</body></html>');
      return;
    }

    var html = await templateRes.text();
    var articles = [];
    try {
      articles = await articlesRes.json();
    } catch (e) {
      articles = [];
    }

    var article = null;
    if (slug && Array.isArray(articles)) {
      for (var i = 0; i < articles.length; i++) {
        if (articles[i] && articles[i].slug === slug) { article = articles[i]; break; }
      }
    }

    var siteName = 'WayToBuy';
    var pageUrl = origin + '/clanek.html' + (slug ? '?slug=' + encodeURIComponent(slug) : '');

    var title, description, image;
    if (article) {
      title = article.title + ' — ' + siteName;
      description = toPlainExcerpt(article.excerpt || article.body, 160);
      image = article.image
        ? article.image
        : (origin + '/api/og?title=' + encodeURIComponent(article.title) +
           '&category=' + encodeURIComponent(article.category || ''));
    } else {
      title = 'Článek — ' + siteName;
      description = 'Dárkové tipy, návody a inspirace na chytré nakupování z českých e-shopů.';
      image = origin + '/api/og?title=' + encodeURIComponent('WayToBuy');
    }

    var titleEsc = escapeAttr(title);
    var descEsc = escapeAttr(description);
    var imageEsc = escapeAttr(image);
    var urlEsc = escapeAttr(pageUrl);

    // Nahraď původní <title> a <meta name="description">
    html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + titleEsc + '</title>');
    html = html.replace(
      /<meta name="description" content="[^"]*">/i,
      '<meta name="description" content="' + descEsc + '">'
    );

    // Strukturovaná data (schema.org) pro Google - jen pokud známe konkrétní článek
    var articleSchemaTag = '';
    if (article) {
      var articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: description,
        image: [image],
        datePublished: article.date || undefined,
        dateModified: article.date || undefined,
        author: { '@type': 'Organization', name: siteName },
        publisher: {
          '@type': 'Organization',
          name: siteName,
          logo: { '@type': 'ImageObject', url: origin + '/api/og?title=' + encodeURIComponent(siteName) }
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': pageUrl },
        articleSection: article.category || undefined
      };
      articleSchemaTag = '<script type="application/ld+json">' +
        JSON.stringify(articleSchema).replace(/</g, '\\u003c') +
        '</script>\n';
    }

    // Vlož Open Graph / Twitter Card tagy, canonical odkaz a schema.org před </head>
    var extraTags =
      '<link rel="canonical" href="' + urlEsc + '">\n' +
      '<meta property="og:type" content="article">\n' +
      '<meta property="og:site_name" content="' + siteName + '">\n' +
      '<meta property="og:locale" content="cs_CZ">\n' +
      '<meta property="og:title" content="' + titleEsc + '">\n' +
      '<meta property="og:description" content="' + descEsc + '">\n' +
      '<meta property="og:image" content="' + imageEsc + '">\n' +
      '<meta property="og:url" content="' + urlEsc + '">\n' +
      '<meta name="twitter:card" content="summary_large_image">\n' +
      '<meta name="twitter:title" content="' + titleEsc + '">\n' +
      '<meta name="twitter:description" content="' + descEsc + '">\n' +
      '<meta name="twitter:image" content="' + imageEsc + '">\n' +
      articleSchemaTag +
      '</head>';

    html = html.replace('</head>', extraTags);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    // Krátce cachuj na edge, ale dovol rychlou revalidaci (nové články / opravy)
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400');
    res.status(200).send(html);
  } catch (err) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send('Interní chyba serveru.');
  }
}
