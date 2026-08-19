// api/og.js
// Generátor obrázků pro Instagram/Facebook + web - ve stylu webu WayToBuy
// ("Modern Retro": krémové pozadí, barevné karty sage/butter/blue/coral/terracotta,
// písma Fraunces (nadpisy) + DM Sans (popisky), tenký černý rámeček karet).
//
// Podle query parametrů automaticky pozná, jaký typ obrázku má vygenerovat:
//   ?title=...&image=...&category=...            -> obrázek k blogovému článku / karuselu (1080x1080)
//   ?kod=...&sleva=...&obchod=...&image=...       -> slevový kupón (1080x1080)
//   ?text=...&image=...                           -> karuselový snímek (1080x1080), image je volitelný
//
// Princip: fotka produktu (pokud existuje) je vždy jen MENŠÍ orámovaný prvek uvnitř karty,
// nikdy není na celou plochu na pozadí - i nepovedená/nesouvisející fotka tak vypadá
// jako součást designu a text zůstává vždy čitelný.

import { ImageResponse } from '@vercel/og';

export const config = { runtime: 'edge' };

// ---------- Barvy webu (shodné s assets/css/style.css) ----------
const INK = '#1a1a26';
const CREAM = '#faf6ec';
const CARD = '#fbf7ee';
const PALETTE = [
  { bg: '#b8c89a', text: INK, name: 'sage' },       // sage
  { bg: '#f4d56b', text: INK, name: 'butter' },     // butter
  { bg: '#a8c2d1', text: INK, name: 'blue' },       // blue
  { bg: '#f0a89a', text: INK, name: 'coral' },      // coral
  { bg: '#c25a3c', text: CARD, name: 'terracotta' },// terracotta
];

// Deterministický výběr barvy podle textu (stejné téma/obchod = stejná barva napříč běhy)
function pickColor(seed) {
  const str = String(seed || 'x');
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

// ---------- Fonty s podporou české diakritiky ----------
async function loadGoogleFont(family, weight, text) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype)'\)/) ||
                css.match(/src: url\(([^)]+)\)/);
  if (!match) throw new Error(`Nepodařilo se najít font ${family} v Google Fonts CSS.`);
  const fontRes = await fetch(match[1]);
  return await fontRes.arrayBuffer();
}

export default async function handler(req) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title');
    const text = searchParams.get('text');
    const sleva = searchParams.get('sleva');
    const obchod = searchParams.get('obchod');
    const popis = searchParams.get('popis') || '';
    const category = searchParams.get('category') || searchParams.get('kategorie') || '';
    const image = searchParams.get('image') || '';

    let jsx;
    const width = 1080;
    const height = 1080;
    let allText;

    if (obchod || sleva) {
      // Kupón: kód se sem záměrně neposílá (viz couponTemplate) - typ obrázku
      // proto poznáváme podle obchod/sleva, ne podle kódu.
      allText = `${obchod || ''}${sleva || ''}Kód na webu${popis}`;
      jsx = couponTemplate({ obchod, sleva, image, popis });
    } else if (title) {
      allText = `${category}${title}TIP NA DÁREK`;
      jsx = cardTemplate({ heading: title, image, eyebrow: category || 'TIP NA DÁREK', seed: title });
    } else if (text) {
      allText = `${text}`;
      jsx = cardTemplate({ heading: text, image, eyebrow: '', seed: text });
    } else {
      return new Response('Chybí povinné parametry (title / text / obchod+sleva).', { status: 400 });
    }

    const charset = allText + 'ěščřžýáíéůúťďňóĚŠČŘŽÝÁÍÉŮÚŤĎŇÓ0123456789% Kč✦';

    const [frauncesBold, dmSansBold, dmSansMedium] = await Promise.all([
      loadGoogleFont('Fraunces', 700, charset),
      loadGoogleFont('DM+Sans', 700, charset),
      loadGoogleFont('DM+Sans', 500, charset),
    ]);

    return new ImageResponse(jsx, {
      width,
      height,
      fonts: [
        { name: 'Fraunces', data: frauncesBold, weight: 700, style: 'normal' },
        { name: 'DM Sans', data: dmSansBold, weight: 700, style: 'normal' },
        { name: 'DM Sans', data: dmSansMedium, weight: 500, style: 'normal' },
      ],
    });
  } catch (err) {
    return new Response(`Chyba generátoru obrázků: ${err.message}`, { status: 500 });
  }
}

// ==================================================================
// ŠABLONY
// ==================================================================

// ---------- Kupón (1080x1080) ----------
// Barevná karta ve stylu webu, fotka produktu (pokud je) jen jako menší orámovaný
// čtverec vpravo nahoře - nikdy na pozadí přes celou plochu.
function couponTemplate({ obchod, sleva, image, popis }) {
  const color = pickColor(obchod);
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: CREAM,
        fontFamily: 'DM Sans',
        padding: '48px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              background: color.bg,
              color: color.text,
              border: `4px solid ${INK}`,
              borderRadius: '48px',
              padding: '64px',
              position: 'relative',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          fontFamily: 'DM Sans',
                          fontSize: 30,
                          fontWeight: 700,
                          letterSpacing: 4,
                          textTransform: 'uppercase',
                        },
                        children: obchod || 'Slevový kód',
                      },
                    },
                    image && {
                      type: 'img',
                      props: {
                        src: image,
                        style: {
                          width: '190px',
                          height: '190px',
                          objectFit: 'cover',
                          borderRadius: '28px',
                          border: `4px solid ${INK}`,
                        },
                      },
                    },
                  ].filter(Boolean),
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    flex: 1,
                    alignItems: 'center',
                  },
                  children: {
                    type: 'div',
                    props: {
                      style: {
                        fontFamily: 'Fraunces',
                        fontSize: 220,
                        fontWeight: 700,
                        letterSpacing: -6,
                        lineHeight: 1,
                      },
                      children: sleva || '',
                    },
                  },
                },
              },
              popis && {
                // Podmínka/omezení kupónu (např. "Sleva 6 % při nákupu nad 10 000 Kč") -
                // zobrazuje se rovnou na obrázku, aby lidi věděli, co je čeká, ještě
                // než kliknou na web. Kód samotný se ale pořád schválně neukazuje.
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    fontFamily: 'DM Sans',
                    fontSize: 30,
                    fontWeight: 500,
                    lineHeight: 1.35,
                    marginBottom: 28,
                    opacity: 0.85,
                    maxWidth: '92%',
                  },
                  children: popis,
                },
              },
              {
                // Pozn.: kód se na obrázku SCHVÁLNĚ nezobrazuje (i kdyby přišel v query),
                // aby lidi museli kliknout na web, kde si ho zkopírují.
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: INK,
                    color: CARD,
                    borderRadius: '999px',
                    padding: '30px 50px',
                    fontFamily: 'DM Sans',
                    fontSize: 42,
                    fontWeight: 700,
                    letterSpacing: 4,
                    textTransform: 'uppercase',
                    alignSelf: 'flex-start',
                  },
                  children: 'Kód na webu ✦',
                },
              },
            ].filter(Boolean),
          },
        },
      ],
    },
  };
}

// ---------- Článek / karuselový snímek (1080x1080) ----------
// Pokud je fotka: rámovaná fotka nahoře (jako post-thumbnail na webu) + textový blok dole.
// Pokud fotka není (např. úvodní "hook" snímek karuselu): čistá barevná karta s velkým textem.
function cardTemplate({ heading, image, eyebrow, seed }) {
  const color = pickColor(seed);

  const textBlock = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        justifyContent: 'center',
        padding: '56px 64px',
      },
      children: [
        eyebrow && {
          type: 'div',
          props: {
            style: {
              fontFamily: 'DM Sans',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 5,
              textTransform: 'uppercase',
              color: image ? '#c25a3c' : color.text,
              opacity: image ? 1 : 0.75,
              marginBottom: 22,
            },
            children: eyebrow,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontFamily: 'Fraunces',
              fontSize: image ? 58 : 72,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: -1,
              color: image ? INK : color.text,
            },
            children: heading,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              marginTop: 30,
              fontSize: 40,
            },
            children: '✦',
          },
        },
      ].filter(Boolean),
    },
  };

  if (!image) {
    // Čistá barevná karta bez fotky - bezpečná varianta pro obecné/hook snímky.
    return {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          background: CREAM,
          padding: '48px',
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                background: color.bg,
                border: `4px solid ${INK}`,
                borderRadius: '48px',
                justifyContent: 'center',
              },
              children: [textBlock],
            },
          },
        ],
      },
    };
  }

  // S fotkou: fotka orámovaná nahoře (~55 % výšky), textový blok na krémovém pozadí dole.
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: CREAM,
        padding: '48px',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              background: CARD,
              border: `4px solid ${INK}`,
              borderRadius: '48px',
              overflow: 'hidden',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '52%',
                    background: color.bg,
                    borderBottom: `4px solid ${INK}`,
                    overflow: 'hidden',
                  },
                  children: {
                    type: 'img',
                    props: {
                      src: image,
                      style: { width: '82%', height: '82%', objectFit: 'contain' },
                    },
                  },
                },
              },
              textBlock,
            ],
          },
        },
      ],
    },
  };
}
