// api/sitemap.js
// Generuje sitemap.xml za běhu podle aktuálního obsahu data/articles.json,
// takže se sitemapa automaticky rozšiřuje s každým novým článkem, který
// přidá denní automatizace - nemusíš ji ručně udržovat.
//
// Routing: vercel.json přesměrovává /sitemap.xml -> /api/sitemap.

export const config = { runtime: 'nodejs' };

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export default async function handler(req, res) {
  try {
    var host = req.headers['x-forwarded-host'] || req.headers.host;
    var protocol = (req.headers['x-forwarded-proto'] || 'https');
    var origin = protocol + '://' + host;

    var articles = [];
    try {
      var r = await fetch(origin + '/data/articles.json');
      articles = await r.json();
      if (!Array.isArray(articles)) articles = [];
    } catch (e) {
      articles = [];
    }

    var staticUrls = [
      { loc: '/index.html', priority: '1.0' },
      { loc: '/clanky.html', priority: '0.8' },
      { loc: '/kupony.html', priority: '0.8' },
      { loc: '/o-nas.html', priority: '0.4' },
      { loc: '/kontakt.html', priority: '0.3' }
    ];

    var urlEntries = staticUrls.map(function (u) {
      return '  <url>\n    <loc>' + origin + u.loc + '</loc>\n    <priority>' + u.priority + '</priority>\n  </url>';
    });

    articles.forEach(function (a) {
      if (!a || !a.slug) return;
      var loc = origin + '/clanek.html?slug=' + encodeURIComponent(a.slug);
      var lastmod = a.date ? escapeXml(a.date) : '';
      urlEntries.push(
        '  <url>\n' +
        '    <loc>' + escapeXml(loc) + '</loc>\n' +
        (lastmod ? '    <lastmod>' + lastmod + '</lastmod>\n' : '') +
        '    <priority>0.6</priority>\n' +
        '  </url>'
      );
    });

    var xml =
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
      urlEntries.join('\n') + '\n' +
      '</urlset>';

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(xml);
  } catch (err) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(500).send('Interní chyba serveru.');
  }
}
