# Wireframe-Rebuild: Cinematischer Hero, Seiten-Content & Bild-Integration

**Status:** Genehmigt
**Datum:** 2026-07-28
**Deckt ab:** Teilprojekte 2–4 des ursprünglichen Fahrplans (Kontaktseite, Portfolio-Unterseiten, cinematische Landingpage) – in einem Zug, weil die Basis dafür ein einziges, in sich geschlossenes Claude-Mockup ist (`Filmemacher Website Wireframe/True Frame Website (interaktiv, standalone).html`).

## Kontext

Der Nutzer hat mit Claude ein vollständiges Mockup aller 5 Seiten gebaut (Home, Imagefilme, Nachrichten, Dokumentationen, Kontakt) inkl. Farbwelten, Zierschriften, Layout und Copy-Text pro Seite. Dieses Dokument bringt den bestehenden, bereits teilweise implementierten Astro-Code (Teilprojekt 1 "Fundament", genehmigt am 2026-07-27) auf den Stand dieses Mockups und ergänzt zwei Dinge, die im Mockup nicht enthalten waren: eine Video-zuerst-Hero-Interaktion und die Einbindung echter Fotos/Videos des Nutzers.

Das Mockup wurde per Agent-Analyse vollständig ausgewertet (Struktur, Farben, Fonts, Copy-Text, Animations-Logik). Wo der bestehende Code vom Mockup abweicht, wurden die Abweichungen dem Nutzer vorgelegt; seine Entscheidungen sind unten eingearbeitet.

## 1. Design-Tokens – Updates gegenüber Teilprojekt 1

### Zierschriften (Update – ersetzt die bisherige Wahl)

Die bestehende Codebase nutzte Sacramento/Imperial Script/Asset/Michroma als Platzhalter-Zierschriften. Das Mockup legt sich auf konkrete, unterschiedliche Schriften pro Bereich fest – diese werden 1:1 übernommen:

| Rolle | Schrift | Einsatz |
|---|---|---|
| Haupt-Zierschrift (rot) | **Pinyon Script** | Home, Kontakt – z. B. "Filme, die bleiben", "reden wir" |
| Dokumentationen-Identität | **Bodoni Moda, weight 900** | Das Wort "DOKUMENTATIONEN" überall wo es auftaucht; als *italic* zusätzlich auf Nachrichten als Zierschrift-Ersatz (z. B. "zuerst vor Ort", "live") |
| Nachrichten-Identität | **Archivo, weight 200 (ExtraLight)**, weit gesperrt | Das Wort "NACHRICHTEN" überall wo es auftaucht |
| Fließtext/UI | **Inter** (300 Body, 400/600 Nav/Buttons) | unverändert |
| Meta/Eyebrow-Labels | **Courier Prime**, monospace | neu – für alle kleinen Caption-Texte ("SCROLLEN", Timecodes, Footer-Kontaktzeile) |

`--font-imagefilm`, `--font-doku`, `--font-news` in `global.css` werden entsprechend umgemappt (Imagefilm nutzt weiterhin Pinyon Script als Akzent, nicht als eigenständige "Identitätsschrift" – im Mockup hat Imagefilme keine dritte Sonderschrift, nur Pinyon Script + Anton).

**Nicht geändert:** Anton (Headlines), die bereits gebaute Whiteboard-Pan-Seitenübergangsanimation (`view-transition` in `global.css`) bleibt unangetastet – sie ist bereits fertig und war nicht Gegenstand dieser Anfrage.

### Farbwelten (Update)

| Bereich | Hintergrund | Text | Akzent | Änderung ggü. Teilprojekt 1 |
|---|---|---|---|---|
| Landingpage | `#0e0e10` | `#f4f2ee` | Rot `#c8383f` / `#e0464e` | unverändert |
| Imagefilme | `#fdf8ec` (warmes Creme) | `#1c1a15` | **Gold `#f2c14b`** | **geändert** – war kühl-grau; Nutzer hat sich explizit für die warme Mockup-Richtung entschieden |
| Dokumentationen | `#14120f` | `#ece5d8` | Grün `#9db27a` | Grünton aus Mockup übernommen (vorher nur "warmes Grau" ohne definierten Akzent) |
| Nachrichten | `#f4f5f8` | `#14203a` | Navy/Blau `#3f6fbd`, dunkle Panels `#1b2c4b` | leicht angepasst von "neutrales Grau" zu "kühles Blaugrau" (Mockup-Vorgabe) |
| Kontakt | identisch zur Landingpage | — | — | unverändert (bewusste Entscheidung: "die Reise schließt sich dort, wo sie begann") |

Rot (`--color-accent`) bleibt zusätzlich auf jeder Seite die CTA-/Link-/Button-Farbe, unabhängig vom Seiten-Akzent.

## 2. Video-zuerst-Hero (neue Interaktion, nicht im Mockup enthalten)

Gilt einheitlich auf **allen 5 Seiten** (Home, Imagefilme, Nachrichten, Dokumentationen, Kontakt):

1. Beim Laden der Seite ist nur das Hero-Video (bzw. bei Kontakt: Foto) sichtbar, vollflächig, stumm, in Schleife. Überschrift, Zierschrift-Zeile und Beschreibungstext sind unsichtbar (`opacity:0`, leichter `translateY`-Versatz).
2. Nach **2000ms** blendet der Textblock sanft ein (`opacity`/`transform`-Transition, ca. 0.8s).
3. Scrollt der Nutzer **vor** Ablauf der 2 Sekunden, wird der Timer abgebrochen und der Textblock blendet **sofort** ein.
4. Umsetzung als kleines, ungehydriertes Inline-Script (kein Vue-Island nötig) – läuft identisch auf jeder Seite über ein `data-hero-reveal`-Attribut am Textblock. Respektiert `prefers-reduced-motion` (dann sofort sichtbar, keine Transition).

## 3. Content-Architektur – Video-Zuordnung (echte Links)

Kategorisierung gemäß Nutzer-Entscheidung in diesem Gespräch:

| Projekt | Kategorie | Quelle | Rolle |
|---|---|---|---|
| Showreel 2025 | – | `youtu.be/FnKY32esFEM` | Home-Hero |
| Clear AMine (DE) | imagefilm | `youtu.be/w0_fK4r7Yrs` | Imagefilme-Hero ("Aktuellstes Projekt") |
| Clear AMine (FR) | imagefilm | `youtu.be/u_PBIHWY2PI` | Imagefilme-Grid, eigene Karte |
| Die Wegewarter | doku | `vimeo.com/1152950764` | Dokumentationen-Hero ("Aktueller Film") |
| Typisch Salzburg – Stadtberge | doku | `vimeo.com/1090919125` | Dokumentationen-Grid |
| R9 Instrumentenbau | **doku** (umkategorisiert, war imagefilm) | `youtu.be/DUHSiziuzF0` | Dokumentationen-Grid |
| Die Entscheidung (Trailer) | doku | bestehender YouTube-Link | Dokumentationen-Grid |

Ergebnis: Dokumentationen hat exakt 4 Filme (Hero + 3 Grid) – deckt sich zufällig exakt mit der Mockup-Copy "04 FILME". Imagefilme hat 2 echte Projekte (Hero + 1 Grid-Karte); es werden **keine** erfundenen Platzhalter-Projekte ergänzt, da echter Content existiert. Nachrichten hat weiterhin keine echten Videos – dort werden 4 Grid-Karten **klar sichtbar als Platzhalter** markiert (Nutzer-Entscheidung), Hero/Stats-Band/CTA werden trotzdem vollständig gebaut.

### Technische Ergänzung: Multi-Provider-Video

`src/lib/youtube.ts` wird zu `src/lib/video.ts` erweitert:
- `getVideoEmbed(url)` erkennt YouTube vs. Vimeo und liefert je nach Kontext die passende Embed-URL:
  - Hintergrund/Hero (autoplay, stumm, loop, ohne Bedienelemente): YouTube via `youtube-nocookie.com/embed/...&autoplay=1&mute=1&loop=1&controls=0`, Vimeo via `player.vimeo.com/video/{id}?background=1&autoplay=1&loop=1&muted=1`
  - Grid-Karte (Klick-zum-Abspielen wie bisher in `VideoCard.vue`): YouTube-Thumbnail via `i.ytimg.com`, Vimeo-Thumbnail per oEmbed-API-Abruf zur Build-Zeit (`vimeo.com/api/oembed.json?url=...`)
- Content-Schema (`content.config.ts`) bekommt ein neues optionales Feld `duration: z.string().optional()` für die Meta-Zeile ("IMAGEFILM · 2025 · 02:40"), passend zur Mockup-Darstellung.

## 4. Bild-Integration

Die 188 Fotos in `Bilder/` zeigen den Nutzer im Studio/Schnittraum bei der Arbeit (keine echten Kunden-/Dokumentarmotive). Sie werden gezielt als Prozess-/Making-of-Bildmaterial eingesetzt, nicht als vorgetäuschter Projekt-Content:

- **Home, Sektion "Vier Kapitel"** (Denken/Hören/Sehen/Erzählen): ersetzt die abstrakten Streifen-Platzhalter des Mockups durch 4 echte Fotos:
  - Denken → `_YNO0142-1.jpg` (Notizbuch/Kaffee/Kamera am Studio-Tisch)
  - Hören → `_YNO0872-147.jpg` (Präsentationsraum, Gespräch am großen Screen)
  - Sehen → `_YNO0942-161.jpg` (dynamische Pose mit großem Objektiv)
  - Erzählen → `_YNO0271-29.jpg` (Schnittplatz, Color-Grading, Doppelmonitor)
- **Kontakt-Hero**: wird – abweichend von der bisherigen 2-Spalten-Box – auf das vollflächige Hero-Layout der anderen Seiten umgestellt (Foto statt Video, gleicher Reveal-Mechanismus), mit `_YNO0195-10.jpg` (direkter Blick, Kamera erhoben, viel Freiraum für Textüberlagerung). Der bestehende Kontakt-Infoblock darunter (Telefon/E-Mail/Standort/Social-Links) bleibt inhaltlich erhalten, rutscht als eigene Sektion unter den neuen Hero.
- Die 6 freigestellten Cutout-PNGs (z. B. `_YNO0703-112.png`) werden **nicht** verwendet, da sie für den geforderten vollflächigen "Video-Look" der Heroes nicht passen (transparent statt bildfüllend) – sie bleiben als mögliches Material für spätere Einzelanwendungen (z. B. Über-mich-Bereich) in Reserve.
- Dunkle Textur-Nutzung auf Dokumentationen (z. B. sepiafarbene `_bw`-Varianten als dekorative Sektionstrenner) und ein Detail-Foto-Streifen auf Imagefilme sind **nicht Teil dieses Scopes** (kein Mockup-Vorbild, kein expliziter Wunsch) – bei Bedarf später ergänzbar.

## 5. Navigation & Footer (Detailanpassungen aus dem Mockup)

- Aktive Nav-Farbe je Seite: Home/Kontakt Rot, Imagefilme Gold, Nachrichten Blau, Dokumentationen Grün. Hover ist auf jeder Seite immer Rot, unabhängig vom Seiten-Akzent.
- Footer-Links variieren pro Seite (aus Mockup übernommen): Home zeigt Instagram/YouTube/LinkedIn/Impressum/Datenschutz; Imagefilme/Nachrichten/Dokumentationen zeigen Instagram/YouTube/Impressum/Datenschutz (kein LinkedIn); Kontakt zeigt nur Impressum/Datenschutz.

## Nicht Teil dieses Dokuments

- Exakte Tailwind-Klassenschreibweise/Komponentenaufbau – das ist Aufgabe des Implementierungsplans.
- Bildbearbeitung/-optimierung (Zuschnitt, WebP-Export, Astro `<Image>`-Pipeline-Konfiguration) – technische Umsetzungsdetails für den Plan.
- Dokumentationen-Texturen und Imagefilme-Detailstreifen (siehe Abschnitt 4 – bewusst ausgeklammert).
- Echte dpa/RTS-Videolinks für Nachrichten (folgen später vom Nutzer).
