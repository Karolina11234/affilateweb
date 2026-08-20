# Co jsem upravila (srpen 2026)

## 1. Opravené sdílecí náhledy článků (nejdůležitější změna)
- `clanek.html` byl přejmenován na `clanek-template.html` (zůstává jako šablona vzhledu).
- Nová funkce `api/clanek.js` teď stránku `/clanek.html?slug=...` sestavuje za běhu
  a doplní do ní **správný titulek, popisek a Open Graph/Twitter obrázek podle
  konkrétního článku** – ještě předtím, než se pošle prohlížeči nebo robotovi
  Facebooku/Instagramu. Díky tomu bude mít každý sdílený odkaz svůj vlastní,
  lákavý náhled místo obecného "Článek — WayToBuy".
- Pokud u článku chybí vlastní `image`, použije se automaticky obrázek
  vygenerovaný přes `api/og.js` (stejný styl, jaký web už používal).
- V `vercel.json` je nastavený rewrite, takže URL adresy odkazů (`clanek.html?slug=...`)
  se nikde nemění – funguje to automaticky.

## 2. robots.txt + sitemap.xml
- `robots.txt` povoluje indexaci a odkazuje na sitemapu.
- `api/sitemap.js` generuje `sitemap.xml` za běhu podle aktuálního obsahu
  `data/articles.json` – takže se sama rozšiřuje s každým novým článkem,
  který přidá tvoje n8n automatizace. Nemusíš ji ručně udržovat.
- Po nasazení doporučuju přidat web (a přesně tuhle sitemapu) do
  **Google Search Console** a **Bing Webmaster Tools** (obojí zdarma).

## 3. Vyčištěná data v coupons.json
Odstranila jsem:
- jeden úplně prázdný testovací záznam,
- sedm ukázkových/placeholder kupónů (Notino, Alza, Zoot, Mall.cz, Bushman,
  Datart, Sephora), které měly odkaz `#` – ten nikam nevede, takže kdyby se
  zobrazily naživo, uživatel by klikl na mrtvý odkaz. Pokud chceš tyhle
  obchody na webu mít, bude potřeba je nahradit reálnými affiliate odkazy.

Opravila jsem:
- u jednoho kupónu (Fajnspánek.cz) byla v URL omylem vložená mezera/nový
  řádek, což mohlo prokliku škodit — teď je odkaz čistý.

Zůstaly 2 reálné kupóny s platnými eHub odkazy (Fajnspánek.cz).

## Co dál (doporučení, neřešeno v tomto balíčku)
- Zkontroluj pár posledních AI-generovaných článků, jestli nezní obecně/roboticky.
- Zvaž přidání structured data (schema.org Article/Offer) — menší, ale užitečné
  vylepšení pro zobrazení ve výsledcích vyhledávání.
- Reálný růst návštěvnosti čekej primárně z Instagramu/FB a případně
  tematických FB skupin — SEO/Google má u nového webu zpoždění v řádu měsíců.

## Jak nahrát změny
Stejně jako v původním README — nahraď obsah repozitáře tímto balíčkem
(všechny soubory včetně nové složky/souborů `api/clanek.js`, `api/sitemap.js`,
`robots.txt`, přejmenovaného `clanek-template.html` a upraveného `vercel.json`,
`data/coupons.json`) a nasaď přes Vercel (git push, pokud máš repo napojené
na Vercel, nasadí se automaticky).
