# WayToBuy — waytobuy.cz

Web běží na **Vercelu** (repozitář je propojený a doména `waytobuy.cz` je na Vercel
nasměrovaná). Nejde o čistě statický web — kromě HTML/CSS/JS obsahuje i pár
serverless funkcí ve složce `api/`, které web potřebuje pro správné sdílecí náhledy
a sitemapu. **Proto tenhle web nemůže běžet na GitHub Pages** (ten serverless funkce
neumí spustit) — GitHub repozitář slouží jen jako zdroj kódu, ze kterého Vercel
nasazuje.

## Co je uvnitř

- `index.html`, `clanky.html`, `kupony.html`, `clanek-template.html`, `o-nas.html`,
  `kontakt.html`, `zasady.html` — stránky webu
- `assets/css/style.css` — kompletní design (Modern Retro)
- `assets/js/main.js` — veškerá interaktivita: hledání, filtrování, řazení, mobilní
  menu, kopírování kódů kupónů. Data (články, kupóny) se **nenačítají z main.js**,
  ale z JSON souborů — viz níže.
- `data/articles.json`, `data/coupons.json` — reálný obsah webu. Tyhle soubory
  aktualizuje hlavně n8n automatizace (ukládá je přes GitHub API), dají se ale
  upravit i ručně.
- `api/clanek.js` — při otevření `clanek.html?slug=...` doplní do stránky ještě
  před odesláním prohlížeči/robotovi správný titulek, popisek a Open Graph obrázek
  podle konkrétního článku (nutné, aby sdílené odkazy na FB/IG měly správný náhled).
- `api/og.js` — generuje obrázek pro sdílecí náhled, pokud článek/kupón nemá vlastní
  fotku.
- `api/sitemap.js` — generuje `sitemap.xml` za běhu podle aktuálního obsahu
  `data/articles.json`, takže se sama rozšiřuje s každým novým článkem.
- `api/feed-chunk.js` — bezpečný prostředník mezi n8n automatizací a velkými XML
  feedy affiliate obchodů (stahuje jen omezený kus feedu, ať n8n nespadne na
  velikosti souboru).
- `vercel.json` — nastavuje přepis `/clanek.html` → `/api/clanek` a
  `/sitemap.xml` → `/api/sitemap`, takže URL adresy zůstávají hezké
  (`clanek.html?slug=...`), i když je pod kapotou obsluhuje funkce.

## Nasazení

Repozitář i Vercel projekt i doména už máš propojené — nasazení je tedy
automatické: `git push` do hlavní větve → Vercel sám znovu nasadí web během
chvilky. Nic ručně spouštět nemusíš.

Pokud bys někdy zakládala nový Vercel projekt od nuly: import repozitáře z
GitHubu, framework preset nech na "Other" (žádný build krok není potřeba),
`api/` složku Vercel rozpozná automaticky jako serverless funkce. Doménu pak
přidáš v Project → Settings → Domains a u registrátora nastavíš DNS podle
instrukcí, které ti tam Vercel zobrazí.

## Jak doplnit reálný obsah

### Články

Přidej záznam do pole v `data/articles.json`:

```json
{
  "slug": "unikatni-adresa-clanku",
  "title": "Nadpis",
  "category": "Rady a tipy",
  "excerpt": "Krátký popisek do dlaždice a meta description.",
  "date": "2026-08-26",
  "image": "",
  "body": "<p>Odstavec 1</p>\n<h3>Mezititulek</h3>\n<p>Odstavec 2, lze i HTML.</p>"
}
```

### Kupóny

Přidej záznam do `data/coupons.json`:

```json
{
  "id": 1234567890,
  "brand": "Název obchodu",
  "code": "KOD15",
  "discount": "0.15",
  "until": "2026-12-31",
  "url": "https://affiliate-odkaz.cz",
  "image": "",
  "description": "Sleva 15 % na celý sortiment"
}
```

`discount` může být desetinné číslo/text jako `"0.15"` (zobrazí se jako 15 %),
celé číslo 1–100 (taky procenta), nebo částka v Kč — `formatDiscount()` v
`main.js` si s tím poradí automaticky.

### Obrázky u článků

Pokud u článku chybí vlastní `image`, použije se automaticky obrázek
vygenerovaný přes `api/og.js`. Pokud chceš vlastní fotku, ulož ji do
`assets/img/` a do pole `image` u článku vlož cestu k ní.

## Kontaktní formulář

`kontakt.html` používá [Formspree](https://formspree.io) — funguje beze změny,
nic dalšího nastavovat nemusíš.

## Sociální sítě

Ve footeru jsou zatím odkazy jen na **Instagram** (`@_waytobuy_`) a **Facebook**.
Pinterest a Telegram v kódu zatím nejsou — až budou účty/scénáře hotové, přidej
odkazy do stejné sekce footeru (`Sledujte`) ve všech `.html` souborech.

## Co záměrně chybí / co zvážit později

- **Jednotlivé statické stránky pro každý článek** nejsou generované zvlášť —
  všechny běží přes jeden `clanek-template.html`, obsah se dosazuje podle
  `?slug=` v URL (řeší `api/clanek.js`). Pro SEO je to o něco slabší než
  samostatné statické stránky, ale pro start je to nejrychlejší řešení.
- **Sidebar s "posledními články"** z původní Blogger šablony zde není —
  nahradily ho sekce "Nejnovější příspěvky" na hlavní stránce.
- Zvaž přidání structured data (schema.org Article/Offer) pro lepší zobrazení
  ve výsledcích vyhledávání.
