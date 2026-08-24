// api/feed-chunk.js
//
// Bezpečný "prostředník" mezi n8n a XML feedy affiliate obchodů.
//
// PROBLÉM, který řeší: některé feedy jsou stovky MB až GB velké. n8n si je
// dřív stahovalo celé do paměti a spadlo na tom. Zkoušeli jsme to řešit
// pomocí HTTP "Range" hlavičky (= "pošli mi jen kousek souboru"), ale ne
// všechny servery tohle respektují - některé na Range hlavičku odpoví
// klidně celým souborem, jako by o ni nikdo nepožádal.
//
// ŘEŠENÍ: tahle funkce běží jako Vercel Edge Function (má vlastní streamovací
// čtení dat po kouscích) a AŤ SE ZDROJOVÝ SERVER CHOVÁ JAKKOLI, jakmile
// nasbírá dohodnutý limit bajtů (výchozí 8 MB, tvrdý strop 20 MB), spojení
// SAMA přeruší (reader.cancel + AbortController). Feed tedy nikdy neprojde
// do n8n celý - je to "kontrola velikosti balíčku přímo na dopravní pásce",
// ne spoléhání na to, co si o sobě řekne odesílatel.
//
// Použití (z n8n):
//   GET https://waytobuy.cz/api/feed-chunk?url=<ENCODED_FEED_URL>&max=8000000&range=bytes%3D1000000-9000000
//
// Parametry:
//   url    - povinný, plná URL feedu
//   max    - volitelný, kolik bajtů max. stáhnout (default 8 000 000 = ~8 MB, strop 20 MB)
//   range  - volitelný, HTTP Range hlavička poslaná na zdrojový server (best-effort;
//            když ji server ignoruje, funkce to nevadí - stejně stáhne max. `max` bajtů)

export const config = { runtime: 'edge' };

const DEFAULT_MAX = 8_000_000; // ~8 MB
const HARD_CAP = 20_000_000; // nikdy nestáhnout víc, ať už kdokoli pošle jakékoli 'max'
const UPSTREAM_TIMEOUT_MS = 25_000;

export default async function handler(request) {
  const { searchParams } = new URL(request.url);
  const feedUrl = searchParams.get('url');
  const rangeParam = searchParams.get('range');
  let maxBytes = parseInt(searchParams.get('max') || '', 10);
  if (!Number.isFinite(maxBytes) || maxBytes <= 0) maxBytes = DEFAULT_MAX;
  maxBytes = Math.min(maxBytes, HARD_CAP);

  if (!feedUrl) {
    return new Response(JSON.stringify({ error: 'Chybí parametr url' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort('timeout'), UPSTREAM_TIMEOUT_MS);

  try {
    const upstreamHeaders = {};
    if (rangeParam) upstreamHeaders['Range'] = rangeParam;

    const upstream = await fetch(feedUrl, {
      signal: controller.signal,
      headers: upstreamHeaders,
    });

    if (!upstream.ok && upstream.status !== 206) {
      clearTimeout(timeoutId);
      return new Response(
        JSON.stringify({ error: `Zdrojový server vrátil status ${upstream.status}` }),
        { status: 502, headers: { 'content-type': 'application/json' } }
      );
    }

    if (!upstream.body) {
      clearTimeout(timeoutId);
      return new Response(JSON.stringify({ error: 'Zdrojový server nevrátil žádná data' }), {
        status: 502,
        headers: { 'content-type': 'application/json' },
      });
    }

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let received = 0;
    let text = '';
    let truncated = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      text += decoder.decode(value, { stream: true });
      if (received >= maxBytes) {
        truncated = true;
        // Utneme spojení - dál už zdrojová data vůbec nečteme, ať je feed
        // jakkoli obrovský.
        try {
          await reader.cancel('dosažen limit bajtů');
        } catch (_) {
          /* ignore */
        }
        break;
      }
    }

    clearTimeout(timeoutId);

    return new Response(text, {
      status: 200,
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'x-chunk-bytes': String(received),
        'x-chunk-truncated': String(truncated),
        'x-upstream-status': String(upstream.status),
      },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const message = err && err.message ? err.message : String(err);
    return new Response(JSON.stringify({ error: `Chyba při stahování feedu: ${message}` }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
}
