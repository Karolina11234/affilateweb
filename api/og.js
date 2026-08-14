// api/og.js
// Generátor obrázků pro Instagram/Facebook + web, ve stylu Rosteme og.mjs.
// Běží jako Vercel Edge Function - žádný Next.js potřeba, jen /api soubor + vercel.json.
//
// Podle query parametrů automaticky pozná, jaký typ obrázku má vygenerovat:
//   ?title=...&image=...                        -> obrázek k blogovému článku (1200x630)
//   ?kod=...&sleva=...&obchod=...&image=...      -> slevový kupón (1080x1080)
//   ?text=...&image=...                          -> karuselový snímek (1080x1080)
//
// Vyzkoušej v prohlížeči např.:
//   /api/og?title=5%20tip%C5%AF%20na%20d%C3%A1rek&image=https://picsum.photos/800

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// ---------- Barvy / styl (uprav podle vizuální identity svého webu) ----------
const COLORS = {
  gradientFrom: '#eef2ff',
  gradientTo: '#f5f3ff',
  accent: '#4f46e5',
  accentDark: '#3730a3',
  text: '#1e1b4b',
  textSoft: '#374151',
  white: '#ffffff',
};

// ---------- Font s podporou české diakritiky ----------
async function loadGoogleFont(text) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/) ||
                css.match(/src: url\(([^)]+)\)/);
  if (!match) throw new Error('Nepodařilo se najít font v Google Fonts CSS.');
  const fontUrl = match[1];
  const fontRes = await fetch(fontUrl);
  return await fontRes.arrayBuffer();
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title');
    const text = searchParams.get('text');
    const kod = searchParams.get('kod');
    const sleva = searchParams.get('sleva');
    const obchod = searchParams.get('obchod');
    const image = searchParams.get('image') || '';

    let jsx, width, height, fontText;

    if (kod) {
      // ---------- KUPÓN ----------
      width = 1080; height = 1080;
      fontText = `${obchod || ''}${sleva || ''}${kod || ''}Slevový kódPlatí do vyprodání zásob`;
      jsx = couponTemplate({ obchod, sleva, kod, image });
    } else if (title) {
      // ---------- ČLÁNEK / WEB ----------
      width = 1200; height = 630;
      fontText = title;
      jsx = articleTemplate({ title, image });
    } else if (text) {
      // ---------- KARUSELOVÝ SNÍMEK ----------
      width = 1080; height = 1080;
      fontText = text;
      jsx = slideTemplate({ text, image });
    } else {
      return new Response('Chybí povinné parametry (title / text / kod).', { status: 400 });
    }

    const fontData = await loadGoogleFont(fontText + 'ěščřžýáíéůúťďňĚŠČŘŽÝÁÍÉŮÚŤĎŇ0123456789% Kč');

    return new ImageResponse(jsx, {
      width,
      height,
      fonts: [{ name: 'Inter', data: fontData, weight: 700, style: 'normal' }],
    });
  } catch (err) {
    return new Response(`Chyba generátoru obrázků: ${err.message}`, { status: 500 });
  }
}

// ==================================================================
// ŠABLONY
// ==================================================================

function articleTemplate({ title, image }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        width: '100%',
        height: '100%',
        background: `linear-gradient(135deg, ${COLORS.gradientFrom}, ${COLORS.gradientTo})`,
        fontFamily: 'Inter',
      },
      children: [
        image && {
          type: 'img',
          props: {
            src: image,
            style: { width: '480px', height: '630px', objectFit: 'cover' },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              padding: '60px',
              flex: 1,
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { fontSize: 22, fontWeight: 700, color: COLORS.accent, marginBottom: 20, letterSpacing: 2 },
                  children: 'TIP NA DÁREK',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 52,
                    fontWeight: 900,
                    color: COLORS.text,
                    lineHeight: 1.15,
                  },
                  children: title,
                },
              },
            ],
          },
        },
      ].filter(Boolean),
    },
  };
}

function couponTemplate({ obchod, sleva, kod, image }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: `linear-gradient(160deg, ${COLORS.accent}, ${COLORS.accentDark})`,
        fontFamily: 'Inter',
        padding: '70px',
        color: COLORS.white,
      },
      children: [
        {
          type: 'div',
          props: {
            style: { fontSize: 30, fontWeight: 700, opacity: 0.85, marginBottom: 10 },
            children: obchod || 'Slevový kód',
          },
        },
        {
          type: 'div',
          props: {
            style: { fontSize: 160, fontWeight: 900, lineHeight: 1, marginBottom: 30 },
            children: sleva || '',
          },
        },
        image && {
          type: 'img',
          props: {
            src: image,
            style: {
              width: '260px', height: '260px', objectFit: 'cover',
              borderRadius: '24px', position: 'absolute', right: 60, top: 60,
              border: `6px solid ${COLORS.white}`,
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: COLORS.white,
              color: COLORS.accentDark,
              borderRadius: '20px',
              padding: '28px 40px',
              fontSize: 54,
              fontWeight: 900,
              letterSpacing: 4,
              marginTop: 'auto',
              alignSelf: 'flex-start',
            },
            children: kod || '',
          },
        },
      ].filter(Boolean),
    },
  };
}

function slideTemplate({ text, image }) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        position: 'relative',
        width: '100%',
        height: '100%',
        fontFamily: 'Inter',
      },
      children: [
        image && {
          type: 'img',
          props: {
            src: image,
            style: { position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' },
          },
        },
        {
          // ztmavený přechod pro čitelnost textu
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(0deg, rgba(30,27,75,0.92) 0%, rgba(30,27,75,0.15) 55%, rgba(30,27,75,0.15) 100%)',
            },
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '70px',
              color: COLORS.white,
              fontSize: 56,
              fontWeight: 900,
              lineHeight: 1.25,
            },
            children: text,
          },
        },
      ].filter(Boolean),
    },
  };
}
