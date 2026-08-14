# WayToBuy — statický web pro GitHub Pages

## Co je uvnitř
- `index.html`, `clanky.html`, `kupony.html`, `clanek.html`, `o-nas.html`, `kontakt.html`, `zasady.html`
- `assets/css/style.css` — kompletní design vytažený z tvé Blogger šablony (Modern Retro)
- `assets/js/main.js` — vzorová data (články + kupóny) a veškerá interaktivita: hledání, filtrování, řazení, mobilní menu, kopírování kódů

Web **neběží na Blogger CMS** — je to čistě statický web. Obsah článků a kupónů se drží
v poli `ARTICLES` a `COUPONS` na začátku `assets/js/main.js`. Nový obsah = úprava těchto polí.

## Jak nahrát na GitHub Pages (repozitář už máš)

1. Zkopíruj/nahraj obsah tohoto balíčku (všechny soubory a složku `assets/`) do **kořene** svého repozitáře
   — buď přes web rozhraní GitHubu (Add file → Upload files), nebo z terminálu:

   ```bash
   cd cesta/k/tvemu-repozitari
   # zkopíruj sem obsah balíčku, pak:
   git add .
   git commit -m "Statický web WayToBuy"
   git push
   ```

2. Na GitHubu jdi do repozitáře → **Settings → Pages**.
3. V sekci "Build and deployment" vyber **Deploy from a branch**, branch `main` (nebo `master`), složku `/ (root)`.
4. Ulož. Za pár desítek sekund web poběží na `https://tvuj-github-nick.github.io/nazev-repozitare/`.

Pokud chceš vlastní doménu (waytobuy.cz), přidej v Settings → Pages do pole **Custom domain**
svou doménu a u registrátora nastav DNS (CNAME na `tvuj-nick.github.io`, případně A záznamy
podle [návodu GitHubu](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)).

## Jak doplnit reálný obsah

### Články
V `assets/js/main.js` uprav pole `ARTICLES`. Každý článek má:
```js
{
  slug: "unikatni-adresa-clanku",   // použije se v URL clanek.html?slug=...
  title: "Nadpis",
  category: "Kategorie",
  excerpt: "Krátký popisek do dlaždice",
  date: "12. srpna 2026",
  body: ["Odstavec 1", "Odstavec 2 <b>lze i HTML</b>"]
}
```

### Kupóny
V poli `COUPONS`:
```js
{ id: 9, brand: "Název obchodu", discount: "15 %", code: "KOD15", until: "31. 12. 2026", color: "sage", url: "https://affiliate-odkaz.cz" }
```
`color` může být: `sage`, `butter`, `blue`, `coral`, `terracotta` (nebo vynech a barvy se budou střídat samy).

### Obrázky u článků
Aktuálně se místo fotky zobrazuje ✦ ikona (placeholder). Pokud chceš u článku obrázek,
přidej vlastnost `image: "assets/img/nazev.jpg"` do objektu článku a uprav v `main.js`
funkce `articleCardHtml` / `initArticleDetail`, aby místo ikony vykreslily `<img>`.
Obrázky si ulož do nové složky `assets/img/`.

## Kontaktní formulář
Kontaktní formulář na `kontakt.html` používá [Formspree](https://formspree.io) (stejný
formulář, jaký jsi měl(a) na Bloggeru) — funguje beze změny i staticky, nic dalšího
nastavovat nemusíš.

## Co záměrně chybí / co zvážit později
- **Jednotlivé stránky pro každý článek** nejsou generované zvlášť — všechny běží přes
  jeden `clanek.html` a obsah se dosazuje podle `?slug=` v URL. Pro SEO je to slabší
  než samostatné statické stránky, ale pro start je to nejrychlejší řešení. Pokud
  budeš chtít později "pravé" statické stránky (lepší SEO, sdílení na sociální sítě
  s náhledem), dej vědět — dá se to vygenerovat automaticky.
- **Sidebar s "posledními články"** z Blogger šablony (dynamicky tažený přes Blogger feed)
  zde není — nahradily ho sekce "Nejnovější příspěvky" na hlavní stránce.
- Ikony sociálních sítí ve footeru vedou na tvůj Instagram a Facebook; Telegram a Pinterest
  odkaz zatím vede na `#` — doplň si vlastní.
