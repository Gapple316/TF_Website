# Fundament: Design-System, Navigation & Content-Architektur

**Status:** Genehmigt
**Datum:** 2026-07-27
**Teilprojekt 1 von 4** (Fundament → Kontaktseite → Portfolio-Unterseiten → Cinematische Landingpage)

## Kontext

Neuaufbau von true-frame.net (Videojournalist & Filmemacher Gabriel Neumayr) auf Basis von Astro + Vue + Tailwind CSS. Ziel: ein modernes, organisches, cinematisches Portfolio mit einer storytelling-getriebenen Landingpage und klassischen, aber hochwertig gestalteten Portfolio-Unterseiten für drei Content-Kategorien (Imagefilme, Nachrichtenbeiträge, Dokumentationen).

Dieses Dokument deckt nur das **Fundament** ab: Design-Tokens, Content-Datenmodell, Navigationsstruktur und technische Basisentscheidungen, auf denen die drei folgenden Teilprojekte aufbauen.

## Referenz: Bestehende Seite (true-frame.net)

Analyse der Live-Seite ergab:
- Kategorien: News & Magazin (dpa, RTS), Live-Produktion, Corporate/Imagefilme, "ON RECORD" (geplantes YouTube-Format, noch nicht relevant), Schulung/Training
- Vorhandene Projekte: Showreel (youtu.be/FnKY32esFEM), Clear AMine Imagefilm (youtu.be/x8sLqkHDrpo), Die Entscheidung Trailer (youtube.com/watch?v=upDnMP7eHAc), Typisch Salzburg, Die Wegewarter, R9 Instrumentenbau
- Kontaktseite: kein Formular, direkte Kontaktmethoden (Telefon, E-Mail, Adresse), Portraitfoto, Social Links (Instagram, YouTube, LinkedIn)
- 4-Schritte-Arbeitsprozess: Erstgespräch, Interview & Szenen, Schnitt & Text, Feedback & Kommunikation
- Ausrüstung: Sony FX6, Sony ZV-E1, DJI Ronin 2, Sennheiser AVX u.a.

## 1. Design-Tokens

### Farbsystem

Prinzip: **Schwarz/Weiß als Basis, dunkles Rot (Firmenfarbe) als einziger Akzent** über die gesamte Seite hinweg. Keine kategorie-spezifischen Akzentfarben (bewusste Entscheidung gegen ein Rot/Gelb/Grün/Blau-Schema, um die Markenfarbe nicht zu verwässern und einen "kunterbunten" Eindruck zu vermeiden). Differenzierung zwischen Bereichen ausschließlich über **Hell/Dunkel-Kontrast** plus die **Temperatur der Neutraltöne**:

| Bereich | Grundton | Grauton-Temperatur | Charakter |
|---|---|---|---|
| Landingpage | Dunkel (fast Schwarz) | kühl | mysteriös |
| Imagefilme | Hell | kühles Weiß-Grau | clean, professionell, leicht |
| Dokumentationen | Dunkel | warmes/bräunliches Grau | heimelig, urig |
| Nachrichten | Hell | neutrales Grau | sachlich, professionell |

Rot wird konsistent für: CTAs/Buttons, Links, Hover-States, und als Farbe der Sacramento-Script-Akzente verwendet (siehe unten) — auf hellem wie dunklem Grund.

### Typografie

Drei- bis vierstufiges Font-System:
- **Anton** — Headlines, Hero-Titel (bestehende Logo-Schrift, blockig, geradlinig, serifenlos)
- **Inter** — Fließtext, UI-Elemente, Navigation (neutral, sehr gut lesbar)
- **Sacramento** — elegante, fließende Script-Schrift, ausschließlich in Rot, für Akzente, Zitate, kleine Labels/Störer (Kontrastpartner zu Antons Wucht — Vorbild: Referenzbilder mit rotem "Cinematic"-Schriftzug)
- **Bestehender Typewriter-Font des Nutzers** (optional/ergänzend) — für technische Meta-Infos wie Timecodes, Kamera-Specs

Font-Pairing-Prinzip (vom Nutzer bestätigt): Kontrast entsteht durch Größe/Dicke (fett vs. fein) und Serifen vs. serifenlos — nicht durch viele Farben.

**Offen/anpassbar:** Nutzer möchte das finale Zusammenspiel erst visuell sehen und behält sich Anpassungen vor.

## 2. Content-Architektur

Astro Content Collection `projects`, ein Markdown-File pro Projekt mit Frontmatter:

```yaml
title: string
category: "imagefilm" | "news" | "doku"
youtubeId: string
client: string (optional)
year: number (optional)
description: string
tags: string[] (optional)
```

Initiale Einträge (aus bestehender Seite übernommen, Kategorisierung nach bestem Wissen, später vom Nutzer korrigierbar):

| Titel | Kategorie | Quelle |
|---|---|---|
| Showreel | — (Landingpage-Feature, keine Kategorie) | youtu.be/FnKY32esFEM |
| Clear AMine Imagefilm | imagefilm | youtu.be/x8sLqkHDrpo |
| R9 Instrumentenbau | imagefilm | (Link folgt) |
| Die Entscheidung (Trailer) | — (Kurzfilm, vorerst ohne feste Kategorie-Seite) | youtube.com/watch?v=upDnMP7eHAc |
| Typisch Salzburg | doku | (RTS-Plattform-Link) |
| Die Wegewarter | doku | (RTS-Plattform-Link) |

Nachrichten-Kategorie hat aktuell noch keine konkreten einbettbaren Beispiel-Videos identifiziert (dpa/RTS-Beiträge) — wird im Teilprojekt "Portfolio-Unterseiten" nachgeschärft.

## 3. Navigation & Seitenstruktur

Routen: `/` (Landingpage-Story), `/imagefilme`, `/nachrichten`, `/dokumentationen`, `/kontakt`.

Header: fix positioniert, Anton-Logo/Wortmarke links, Nav-Links rechts (Home + 3 Kategorien + Kontakt). Mobil: Hamburger-Menü mit Slide-in-Overlay.

Footer: Kontaktinfos (Telefon, E-Mail, Adresse), Social Links (Instagram, YouTube), Sekundärnavigation, Impressum/Datenschutz-Links.

Sprache: **vollständig Deutsch** (keine gemischt-englischen Slogans wie auf der bisherigen Seite).

## 4. Technische Basis

- **Astro** (Static Output) als Grundgerüst, **Vue** als Insel-Framework nur für interaktive Komponenten (Nav-Menü, spätere Scroll-Animationen) — keine unnötige Hydration.
- **Tailwind CSS v4** für Utility-Styling, Design-Tokens als CSS Custom Properties.
- **Theming:** `data-theme="dark"|"light"` Attribut wird pro Seite zur Build-Zeit gesetzt (fix pro Seite, kein Runtime-Wechsel innerhalb einer Seite — spart Komplexität, reicht für den aktuellen Bedarf). Tailwind-Farbtokens referenzieren CSS-Variablen, die je nach Attribut umschalten.
- **Astro View Transitions API** für weiche Seitenübergänge beim Navigieren zwischen unterschiedlich themed Pages.
- Vorbereitet, aber erst in Folge-Teilprojekten genutzt: **GSAP + ScrollTrigger** (scroll-gesteuerte Animationen), **Lenis** (Smooth Scroll).

## Nicht Teil dieses Dokuments

- Detailliertes Layout/Design der Kontaktseite (Teilprojekt 2)
- Layout der Portfolio-Kategorie-Seiten (Teilprojekt 3)
- Die cinematische Scroll-Story der Landingpage inkl. Video-Scrubbing-Technik (Teilprojekt 4)
