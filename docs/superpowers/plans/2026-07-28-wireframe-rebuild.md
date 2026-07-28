# Wireframe Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring the existing Astro/Vue TRUE FRAME site in line with the user's Claude-made wireframe: per-page color/font identity, a video-first hero (video/photo shows first, headline+text reveal after 2s or on first scroll), real YouTube/Vimeo project videos (incl. Vimeo support), and real behind-the-scenes photography worked into the Home and Kontakt pages.

**Architecture:** Astro static site, Vue islands only for interactive bits (`client:visible`/`client:load`). A single shared `Hero.astro` component drives the four category-page heroes (video or photo background, optional caption, reveal-wrapped headline block); Home keeps its existing bespoke hero (pinned logo) and just gains the reveal behavior. A provider-agnostic `src/lib/video.ts` replaces `src/lib/youtube.ts` and is unit-tested with Vitest. The reveal timing itself is a tiny vanilla-JS module (`src/lib/hero-reveal.ts`, also Vitest-tested via jsdom) wired once into `BaseLayout.astro`, reinitialized on Astro's `astro:page-load` event so it survives client-side view-transition navigation.

**Tech Stack:** Astro 7, Vue 3 (`@astrojs/vue`), Tailwind CSS v4 (`@tailwindcss/vite`, CSS-variable theming via `@theme` + `[data-theme]`), `@fontsource/*` self-hosted fonts, `astro:content` collections (glob loader), `astro:assets` `<Image>` for photo optimization, Vitest + jsdom for unit tests, GSAP (untouched, only used by the existing `HeroLogo.vue`).

## Global Constraints

- German language only, no English copy (existing site rule).
- Node >=22.12.0, package manager npm (repo has `package-lock.json`).
- Never fabricate content: where no real video/photo/link exists, render a clearly-labeled placeholder — never an invented title, made-up statistic, or guessed URL (this is why Nachrichten gets explicitly marked placeholder cards, and why no LinkedIn link is added anywhere — no real LinkedIn URL exists yet).
- One consistent site-wide accent red (`--color-accent` in `global.css`) for every CTA/button/link/hover, on every page regardless of that page's own theme accent color.
- Respect `prefers-reduced-motion`: reveal/parallax/transition effects must degrade to an instant, static state.
- Follow the already-approved, already-implemented patterns: Tailwind v4 `@theme` + per-`[data-theme]` CSS variable overrides for theming (`docs/superpowers/specs/2026-07-27-fundament-design.md`), and leave the existing whiteboard-pan page-transition (`global.css` `::view-transition-*` rules) and `HeroLogo.vue` scroll-pin mechanic untouched — neither was part of this request.
- Source of truth for content/design decisions: `docs/superpowers/specs/2026-07-28-wireframe-rebuild-design.md`.

---

### Task 1: Housekeeping — ignore the raw photo dump, copy the 5 chosen source photos into `src/assets`

The `Bilder/` folder (188 raw JPGs, 8–25MB each) sits at the project root and is currently untracked but NOT gitignored — committing it whole would bloat the repo. Astro's `astro:assets` pipeline needs the handful of photos we're actually using inside `src/` (conventionally `src/assets/`) so it can resize/optimize them at build time; everything else in `Bilder/` stays out of the repo.

**Files:**
- Modify: `.gitignore`
- Create: `src/assets/photos/home-kapitel-denken.jpg`
- Create: `src/assets/photos/home-kapitel-hoeren.jpg`
- Create: `src/assets/photos/home-kapitel-sehen.jpg`
- Create: `src/assets/photos/home-kapitel-erzaehlen.jpg`
- Create: `src/assets/photos/kontakt-hero.jpg`

**Interfaces:**
- Produces: 5 real, on-disk JPGs at the paths above, importable by later tasks as `import x from "../assets/photos/<name>.jpg"` (Astro's `astro:assets` treats any imported image under `src/` as `ImageMetadata`).

- [ ] **Step 1: Add `Bilder/` to `.gitignore`**

Append to `.gitignore`:

```
# raw source photography (originals live outside the repo; selected shots are copied into src/assets/photos)
Bilder/
```

- [ ] **Step 2: Copy the 5 selected source photos with clear, purpose-based filenames**

```bash
mkdir -p src/assets/photos
cp "Bilder/_YNO0142-1.jpg" src/assets/photos/home-kapitel-denken.jpg
cp "Bilder/_YNO0872-147.jpg" src/assets/photos/home-kapitel-hoeren.jpg
cp "Bilder/_YNO0942-161.jpg" src/assets/photos/home-kapitel-sehen.jpg
cp "Bilder/_YNO0271-29.jpg" src/assets/photos/home-kapitel-erzaehlen.jpg
cp "Bilder/_YNO0195-10.jpg" src/assets/photos/kontakt-hero.jpg
```

- [ ] **Step 3: Verify the files exist and are real images**

```bash
ls -la src/assets/photos/
file src/assets/photos/*.jpg
```

Expected: 5 files listed, each `file` line reporting `JPEG image data`.

- [ ] **Step 4: Commit**

```bash
git add .gitignore src/assets/photos/
git commit -m "Add source photos for hero/kapitel sections, ignore raw photo dump"
```

---

### Task 2: Design tokens — swap in the wireframe's fonts and per-page color accents

Replaces the placeholder font choices (`Sacramento`, `Imperial Script`, `Asset`, `Michroma`) with the fonts actually used in the approved wireframe (`Pinyon Script`, `Bodoni Moda` 900, `Archivo` 200, `Courier Prime`), and updates the per-theme CSS variables in `global.css` to match the approved spec (Imagefilme → warm cream/gold, Dokumentationen → green accent, Nachrichten → navy-blue accent), plus adds the new `--color-script-accent` token every later task's markup will read.

**Files:**
- Modify: `package.json`
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: Tailwind utility classes `font-script` (Pinyon Script), `font-doku` (Bodoni Moda), `font-news` (Archivo), `font-mono` (Courier Prime), `text-script-accent` / `bg-script-accent` (resolves per `data-theme`).
- Consumes: nothing (no dependency on earlier tasks).

- [ ] **Step 1: Swap the `@fontsource` packages**

```bash
npm uninstall @fontsource/asset @fontsource/imperial-script @fontsource/michroma @fontsource/sacramento
npm install @fontsource/pinyon-script @fontsource/bodoni-moda @fontsource/archivo @fontsource/courier-prime
```

- [ ] **Step 2: Confirm the exact weight/style file names shipped by each package**

```bash
ls node_modules/@fontsource/bodoni-moda | grep -E "^900"
ls node_modules/@fontsource/archivo | grep -E "^200"
```

Expected: `900.css` and `900-italic.css` listed for Bodoni Moda; `200.css` listed for Archivo. If the exact filenames differ, use the ones actually listed in the next step's imports.

- [ ] **Step 3: Update the font imports in `global.css`**

Replace lines 1–10 of `src/styles/global.css`:

```css
@import "tailwindcss";
@import "@fontsource/anton";
@import "@fontsource/inter/400.css";
@import "@fontsource/inter/500.css";
@import "@fontsource/inter/600.css";
@import "@fontsource/inter/700.css";
@import "@fontsource/pinyon-script";
@import "@fontsource/bodoni-moda/900.css";
@import "@fontsource/bodoni-moda/900-italic.css";
@import "@fontsource/archivo/200.css";
@import "@fontsource/courier-prime";
```

- [ ] **Step 4: Update the `@theme` block and per-theme variables**

Replace the `@theme { ... }` block through the end of the `[data-theme="news"]` block in `src/styles/global.css` (currently lines 12–69) with:

```css
@theme {
	--font-display: "Anton", sans-serif;
	--font-sans: "Inter", sans-serif;
	--font-script: "Pinyon Script", cursive;
	--font-mono: "Courier Prime", monospace;

	/* Zierschriften je Kategorie-Identität */
	--font-doku: "Bodoni Moda", serif;
	--font-news: "Archivo", sans-serif;

	--color-accent: #a3282f;
	--color-accent-hover: #c9333c;

	--color-bg: #08090a;
	--color-surface: #131417;
	--color-ink: #f4f4f2;
	--color-ink-muted: #9a9a9d;
	--color-line: #23242a;
	--color-script-accent: #a3282f;
}

/*
  Fünf Theme-Varianten je Bereich (data-theme auf <html>):
  landing/kontakt = dunkel/kühl, doku = dunkel/warm/grün,
  imagefilm = hell/warm/gold, news = hell/kühl/navy-blau.
  Rot (--color-accent) bleibt in jeder Variante die CTA-/Link-Farbe;
  --color-script-accent ist die Farbe der jeweiligen Zierschrift/aktiven Nav.
*/
:root,
[data-theme="landing"] {
	--color-bg: #08090a;
	--color-surface: #131417;
	--color-ink: #f4f4f2;
	--color-ink-muted: #9a9a9d;
	--color-line: #23242a;
	--color-script-accent: var(--color-accent);
}

[data-theme="doku"] {
	--color-bg: #14120f;
	--color-surface: #1d1611;
	--color-ink: #ece5d8;
	--color-ink-muted: #b0a292;
	--color-line: #2c2119;
	--color-script-accent: #9db27a;
}

[data-theme="imagefilm"] {
	--color-bg: #fdf8ec;
	--color-surface: #ffffff;
	--color-ink: #1c1a15;
	--color-ink-muted: #7a7367;
	--color-line: #e8ddc2;
	--color-script-accent: #f2c14b;
}

[data-theme="news"] {
	--color-bg: #f4f5f8;
	--color-surface: #ffffff;
	--color-ink: #14203a;
	--color-ink-muted: #5c6577;
	--color-line: #dde1e8;
	--color-script-accent: #3f6fbd;
}
```

- [ ] **Step 5: Verify Tailwind picks up the new tokens**

```bash
astro dev --background
sleep 3
astro dev logs
```

Expected: no build errors in the logs (font-import 404s or CSS parse errors would show here). Run `astro dev stop` afterwards.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/styles/global.css
git commit -m "Swap placeholder fonts for wireframe fonts, add script-accent token"
```

---

### Task 3: Provider-agnostic video helper (`src/lib/video.ts`), test-first

Replaces `src/lib/youtube.ts` (YouTube-only) with a module that also understands Vimeo links (needed for "Die Wegewarter" and "Typisch Salzburg"), and that produces three different embed flavors: a muted/autoplay/loop **background** embed (for heroes), a click-to-play **card** embed (for grid `VideoCard`s), and an async **thumbnail** lookup (YouTube has a predictable thumbnail URL; Vimeo requires an oEmbed API call).

**Files:**
- Create: `src/lib/video.ts`
- Create: `src/lib/video.test.ts`
- Delete: `src/lib/youtube.ts`

**Interfaces:**
- Produces:
  - `parseVideoUrl(url?: string): { provider: "youtube" | "vimeo"; id: string } | undefined`
  - `getBackgroundEmbedUrl(url?: string): string | undefined`
  - `getCardEmbedUrl(url?: string): string | undefined`
  - `getThumbnailUrl(url?: string): Promise<string | undefined>`
- Consumes: global `fetch` (available in Astro's Node build environment).

- [ ] **Step 1: Add Vitest + jsdom**

```bash
npm install -D vitest jsdom
```

Add to `package.json` `scripts`:

```json
"test": "vitest run"
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
	},
});
```

- [ ] **Step 3: Write the failing test file `src/lib/video.test.ts`**

```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import {
	parseVideoUrl,
	getBackgroundEmbedUrl,
	getCardEmbedUrl,
	getThumbnailUrl,
} from "./video";

describe("parseVideoUrl", () => {
	it("parses a youtu.be short link", () => {
		expect(parseVideoUrl("https://youtu.be/w0_fK4r7Yrs")).toEqual({
			provider: "youtube",
			id: "w0_fK4r7Yrs",
		});
	});

	it("parses a youtube.com watch link", () => {
		expect(
			parseVideoUrl("https://www.youtube.com/watch?v=upDnMP7eHAc"),
		).toEqual({ provider: "youtube", id: "upDnMP7eHAc" });
	});

	it("parses a vimeo link", () => {
		expect(parseVideoUrl("https://vimeo.com/1152950764")).toEqual({
			provider: "vimeo",
			id: "1152950764",
		});
	});

	it("returns undefined for an unrecognized or missing url", () => {
		expect(parseVideoUrl("https://example.com/video")).toBeUndefined();
		expect(parseVideoUrl(undefined)).toBeUndefined();
	});
});

describe("getBackgroundEmbedUrl", () => {
	it("builds a muted autoplay loop embed for youtube", () => {
		expect(getBackgroundEmbedUrl("https://youtu.be/w0_fK4r7Yrs")).toBe(
			"https://www.youtube-nocookie.com/embed/w0_fK4r7Yrs?autoplay=1&mute=1&loop=1&playlist=w0_fK4r7Yrs&controls=0&modestbranding=1&rel=0&showinfo=0",
		);
	});

	it("builds a background embed for vimeo", () => {
		expect(getBackgroundEmbedUrl("https://vimeo.com/1152950764")).toBe(
			"https://player.vimeo.com/video/1152950764?background=1&autoplay=1&loop=1&muted=1",
		);
	});

	it("returns undefined without a url", () => {
		expect(getBackgroundEmbedUrl(undefined)).toBeUndefined();
	});
});

describe("getCardEmbedUrl", () => {
	it("builds a click-to-play embed for youtube", () => {
		expect(getCardEmbedUrl("https://youtu.be/w0_fK4r7Yrs")).toBe(
			"https://www.youtube-nocookie.com/embed/w0_fK4r7Yrs?autoplay=1",
		);
	});

	it("builds a click-to-play embed for vimeo", () => {
		expect(getCardEmbedUrl("https://vimeo.com/1152950764")).toBe(
			"https://player.vimeo.com/video/1152950764?autoplay=1",
		);
	});
});

describe("getThumbnailUrl", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("builds a predictable thumbnail url for youtube without any network call", async () => {
		const fetchSpy = vi.fn();
		vi.stubGlobal("fetch", fetchSpy);
		const url = await getThumbnailUrl("https://youtu.be/w0_fK4r7Yrs");
		expect(url).toBe("https://i.ytimg.com/vi/w0_fK4r7Yrs/hqdefault.jpg");
		expect(fetchSpy).not.toHaveBeenCalled();
	});

	it("fetches the vimeo oEmbed thumbnail", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({
					thumbnail_url: "https://i.vimeocdn.com/thumb.jpg",
				}),
			}),
		);
		const url = await getThumbnailUrl("https://vimeo.com/1152950764");
		expect(url).toBe("https://i.vimeocdn.com/thumb.jpg");
	});

	it("returns undefined when the vimeo oEmbed request fails", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
		const url = await getThumbnailUrl("https://vimeo.com/1152950764");
		expect(url).toBeUndefined();
	});
});
```

- [ ] **Step 4: Run the tests to verify they fail**

```bash
npx vitest run src/lib/video.test.ts
```

Expected: FAIL — `Cannot find module './video'` (file doesn't exist yet).

- [ ] **Step 5: Implement `src/lib/video.ts`**

```ts
export type VideoProvider = "youtube" | "vimeo";

export interface VideoInfo {
	provider: VideoProvider;
	id: string;
}

export function parseVideoUrl(url?: string): VideoInfo | undefined {
	if (!url) return undefined;

	const youtube = url.match(
		/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{6,})/,
	);
	if (youtube) return { provider: "youtube", id: youtube[1] };

	const vimeo = url.match(/vimeo\.com\/(\d+)/);
	if (vimeo) return { provider: "vimeo", id: vimeo[1] };

	return undefined;
}

export function getBackgroundEmbedUrl(url?: string): string | undefined {
	const info = parseVideoUrl(url);
	if (!info) return undefined;

	if (info.provider === "youtube") {
		return `https://www.youtube-nocookie.com/embed/${info.id}?autoplay=1&mute=1&loop=1&playlist=${info.id}&controls=0&modestbranding=1&rel=0&showinfo=0`;
	}
	return `https://player.vimeo.com/video/${info.id}?background=1&autoplay=1&loop=1&muted=1`;
}

export function getCardEmbedUrl(url?: string): string | undefined {
	const info = parseVideoUrl(url);
	if (!info) return undefined;

	if (info.provider === "youtube") {
		return `https://www.youtube-nocookie.com/embed/${info.id}?autoplay=1`;
	}
	return `https://player.vimeo.com/video/${info.id}?autoplay=1`;
}

export async function getThumbnailUrl(url?: string): Promise<string | undefined> {
	const info = parseVideoUrl(url);
	if (!info) return undefined;

	if (info.provider === "youtube") {
		return `https://i.ytimg.com/vi/${info.id}/hqdefault.jpg`;
	}

	try {
		const res = await fetch(
			`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(`https://vimeo.com/${info.id}`)}`,
		);
		if (!res.ok) return undefined;
		const data = (await res.json()) as { thumbnail_url?: unknown };
		return typeof data.thumbnail_url === "string" ? data.thumbnail_url : undefined;
	} catch {
		return undefined;
	}
}
```

- [ ] **Step 6: Run the tests to verify they pass**

```bash
npx vitest run src/lib/video.test.ts
```

Expected: PASS — all 11 tests green.

- [ ] **Step 7: Delete the now-unused `src/lib/youtube.ts`**

```bash
rm src/lib/youtube.ts
```

(`src/pages/index.astro`, `imagefilme.astro`, `dokumentationen.astro` still import `getYoutubeId` from `../lib/youtube` until Tasks 9, 10, and 12 rewire them to `../lib/video` — the build will fail in between. That's expected; if you're executing tasks strictly in order this is fixed within a few tasks. If you need a working build at every single commit, delay this Step 7 deletion until Task 12 is done.)

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts src/lib/video.ts src/lib/video.test.ts src/lib/youtube.ts
git commit -m "Add provider-agnostic video helper (YouTube + Vimeo) with tests"
```

---

### Task 4: Video-first hero reveal script, test-first

The core interaction the user asked for: on every hero, the headline/text block is hidden until 2 seconds pass or the user scrolls, whichever comes first.

**Files:**
- Create: `src/lib/hero-reveal.ts`
- Create: `src/lib/hero-reveal.test.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: `initHeroReveal(): void` — queries the first `[data-hero-reveal]` element in `document` and wires up the timer/scroll logic. Also self-registers on `astro:page-load`.
- Consumes: a `[data-hero-reveal]` element must exist in the page (added to `Hero.astro` in Task 7, and directly to `index.astro`'s hero in Task 9).

- [ ] **Step 1: Write the failing test file `src/lib/hero-reveal.test.ts`**

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { initHeroReveal } from "./hero-reveal";

function setupDom() {
	document.body.innerHTML = `<div data-hero-reveal></div>`;
}

describe("initHeroReveal", () => {
	beforeEach(() => {
		setupDom();
		vi.useFakeTimers();
		window.matchMedia = vi
			.fn()
			.mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("does not reveal immediately", () => {
		initHeroReveal();
		const el = document.querySelector("[data-hero-reveal]")!;
		expect(el.classList.contains("is-revealed")).toBe(false);
	});

	it("reveals automatically after 2000ms", () => {
		initHeroReveal();
		const el = document.querySelector("[data-hero-reveal]")!;
		vi.advanceTimersByTime(2000);
		expect(el.classList.contains("is-revealed")).toBe(true);
	});

	it("reveals immediately on scroll before the delay elapses", () => {
		initHeroReveal();
		const el = document.querySelector("[data-hero-reveal]")!;
		vi.advanceTimersByTime(500);
		window.dispatchEvent(new Event("scroll"));
		expect(el.classList.contains("is-revealed")).toBe(true);
	});

	it("reveals immediately when reduced motion is preferred", () => {
		window.matchMedia = vi
			.fn()
			.mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
		initHeroReveal();
		const el = document.querySelector("[data-hero-reveal]")!;
		expect(el.classList.contains("is-revealed")).toBe(true);
	});

	it("does nothing when no hero-reveal element is present", () => {
		document.body.innerHTML = "";
		expect(() => initHeroReveal()).not.toThrow();
	});
});
```

- [ ] **Step 2: Run the tests to verify they fail**

```bash
npx vitest run src/lib/hero-reveal.test.ts
```

Expected: FAIL — `Cannot find module './hero-reveal'`.

- [ ] **Step 3: Implement `src/lib/hero-reveal.ts`**

```ts
const REVEAL_DELAY_MS = 2000;

export function initHeroReveal(): void {
	const el = document.querySelector<HTMLElement>("[data-hero-reveal]");
	if (!el) return;

	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		el.classList.add("is-revealed");
		return;
	}

	let revealed = false;
	const reveal = () => {
		if (revealed) return;
		revealed = true;
		el.classList.add("is-revealed");
		window.removeEventListener("scroll", onScroll);
	};

	const timer = window.setTimeout(reveal, REVEAL_DELAY_MS);
	const onScroll = () => {
		window.clearTimeout(timer);
		reveal();
	};

	window.addEventListener("scroll", onScroll, { passive: true });
}

document.addEventListener("astro:page-load", initHeroReveal);
```

- [ ] **Step 4: Run the tests to verify they pass**

```bash
npx vitest run src/lib/hero-reveal.test.ts
```

Expected: PASS — all 5 tests green.

- [ ] **Step 5: Add the reveal CSS to `src/styles/global.css`**

Append at the end of the file:

```css
/*
  Video-zuerst-Hero: der Text-Block ist unsichtbar bis initHeroReveal()
  die Klasse is-revealed setzt (nach 2s oder beim ersten Scroll).
*/
[data-hero-reveal] {
	opacity: 0;
	transform: translateY(16px);
	transition:
		opacity 0.8s ease,
		transform 0.8s ease;
}

[data-hero-reveal].is-revealed {
	opacity: 1;
	transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
	[data-hero-reveal] {
		transition: none;
	}
}
```

- [ ] **Step 6: Wire the script into `BaseLayout.astro`**

In `src/layouts/BaseLayout.astro`, add right after the existing `<Footer />` line, before `</body>`:

```astro
		<Footer />
		<script>
			import "../lib/hero-reveal";
		</script>
	</body>
```

(`Footer` doesn't take a `variant` prop yet — that's added in Task 8. For this step, only add the `<script>` block below the existing, unchanged `<Footer />` call.)

- [ ] **Step 7: Verify no console errors on a page that has no `[data-hero-reveal]` yet**

```bash
astro dev --background
sleep 3
astro dev logs
astro dev stop
```

Expected: no errors (the script is a no-op until Task 7/9 add `[data-hero-reveal]` elements).

- [ ] **Step 8: Commit**

```bash
git add src/lib/hero-reveal.ts src/lib/hero-reveal.test.ts src/layouts/BaseLayout.astro src/styles/global.css
git commit -m "Add video-first hero reveal script (2s delay or first scroll)"
```

---

### Task 5: Content schema + real project data

Adds the `duration` field the wireframe's card meta lines need, re-links every project to the real video the user supplied, and re-categorizes R9 Instrumentenbau from `imagefilm` to `doku` per the user's decision.

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/content/projects/clear-amine.md`
- Create: `src/content/projects/clear-amine-fr.md`
- Modify: `src/content/projects/r9-instrumentenbau.md`
- Modify: `src/content/projects/die-wegewarter.md`
- Modify: `src/content/projects/typisch-salzburg.md`
- Modify: `src/content/projects/die-entscheidung.md`

**Interfaces:**
- Produces: exactly one `featured: true` entry per category (`imagefilm` → Clear AMine DE, `doku` → Die Wegewarter) — later tasks (7, 11, 12) rely on `projects.find(p => p.data.featured)` to pick each category page's hero.

- [ ] **Step 1: Add the `duration` field to the schema**

In `src/content.config.ts`, add one line to the `z.object({...})`:

```ts
		duration: z.string().optional(),
```

(placed after `year: z.number().optional(),`)

- [ ] **Step 2: Update `src/content/projects/clear-amine.md`**

```markdown
---
title: "Clear AMine – Imagefilm"
category: "imagefilm"
client: "Aqus GmbH"
videoUrl: "https://youtu.be/w0_fK4r7Yrs"
year: 2025
duration: "02:40"
description: "Imagefilm für Clear AMine, ausgezeichnet mit dem Constantinus Award – hochwertige Bildsprache statt inhaltsarmer Werbebotschaft."
tags: ["Corporate", "Award"]
featured: true
---
```

- [ ] **Step 3: Create `src/content/projects/clear-amine-fr.md`**

```markdown
---
title: "Clear AMine – Imagefilm (FR)"
category: "imagefilm"
client: "Aqus GmbH"
videoUrl: "https://youtu.be/u_PBIHWY2PI"
year: 2025
duration: "02:40"
description: "Französische Sprachfassung des Clear AMine Imagefilms."
tags: ["Corporate", "Award"]
featured: false
---
```

- [ ] **Step 4: Update `src/content/projects/r9-instrumentenbau.md`** (recategorized to `doku`)

```markdown
---
title: "R9 Instrumentenbau"
category: "doku"
client: "R9"
videoUrl: "https://youtu.be/DUHSiziuzF0"
description: "Dokumentarische Begleitung der Instrumentenbauer von R9 bei ihrer Arbeit."
tags: ["Dokumentation"]
featured: false
---
```

- [ ] **Step 5: Update `src/content/projects/die-wegewarter.md`**

```markdown
---
title: "Die Wegewarter"
category: "doku"
client: "RTS Regional Fernsehen Salzburg"
videoUrl: "https://vimeo.com/1152950764"
year: 2024
duration: "28:00"
description: "Porträt über die ehrenamtlichen Wegewarter der Alpen – ruhige, beobachtende Erzählweise mit großem Set- und Landschaftsanteil."
tags: ["Dokumentation"]
featured: true
---
```

- [ ] **Step 6: Update `src/content/projects/typisch-salzburg.md`**

```markdown
---
title: "Typisch Salzburg – Stadtberge"
category: "doku"
client: "RTS Regional Fernsehen Salzburg"
videoUrl: "https://vimeo.com/1090919125"
description: "Dokumentarische Kurzserie über Salzburger Eigenheiten – Folge „Stadtberge“."
tags: ["Dokumentation"]
featured: false
---
```

- [ ] **Step 7: Update `src/content/projects/die-entscheidung.md`**

```markdown
---
title: "Die Entscheidung"
category: "doku"
videoUrl: "https://www.youtube.com/watch?v=upDnMP7eHAc"
year: 2023
description: "Trailer zum Kurzfilm „Die Entscheidung“."
tags: ["Kurzfilm", "Trailer"]
featured: false
---
```

- [ ] **Step 8: Verify the collection parses without schema errors**

```bash
astro check
```

Expected: no errors referencing `content.config.ts` or any file under `src/content/projects/`.

- [ ] **Step 9: Commit**

```bash
git add src/content.config.ts src/content/projects/
git commit -m "Re-link real project videos, add duration field, move R9 to Dokumentationen"
```

---

### Task 6: `VideoCard.vue` — provider-agnostic props

The card currently hardcodes YouTube (`youtubeId` prop, `i.ytimg.com` thumbnail). It's changed to accept a precomputed `embedUrl`/`thumbnailUrl` pair (built by the page using `src/lib/video.ts`), so the card itself never needs to know about providers. Also adds an optional `meta` line (e.g. "RTS · 28:00") used by the Dokumentationen grid.

**Files:**
- Modify: `src/components/VideoCard.vue`

**Interfaces:**
- Produces: `VideoCard` props `{ title: string; description: string; client?: string; meta?: string; embedUrl?: string; thumbnailUrl?: string }`.
- Consumes: `getCardEmbedUrl`/`getThumbnailUrl` from `src/lib/video.ts` (called by the parent page, not by this component).

- [ ] **Step 1: Rewrite `src/components/VideoCard.vue`**

```vue
<script setup lang="ts">
import { ref } from "vue";

defineProps<{
	title: string;
	description: string;
	client?: string;
	meta?: string;
	embedUrl?: string;
	thumbnailUrl?: string;
}>();

const loaded = ref(false);
</script>

<template>
	<div class="group relative aspect-video overflow-hidden bg-surface">
		<iframe
			v-if="loaded && embedUrl"
			:src="embedUrl"
			class="absolute inset-0 h-full w-full"
			:title="title"
			allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
		/>
		<button
			v-else-if="embedUrl"
			type="button"
			class="absolute inset-0 h-full w-full"
			:aria-label="`${title} abspielen`"
			@click="loaded = true"
		>
			<img
				v-if="thumbnailUrl"
				:src="thumbnailUrl"
				:alt="title"
				class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
			/>
			<div v-else class="h-full w-full bg-surface" />
			<span
				class="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/10"
			>
				<span
					class="flex h-16 w-16 items-center justify-center rounded-full bg-accent/90 text-white transition group-hover:bg-accent"
				>
					<svg viewBox="0 0 24 24" class="ml-1 h-6 w-6 fill-current">
						<path d="M8 5v14l11-7z" />
					</svg>
				</span>
			</span>
		</button>
		<div
			v-else
			class="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-dashed border-line px-6 text-center"
		>
			<span class="font-script text-2xl text-accent">Video folgt</span>
		</div>

		<div
			v-if="!loaded"
			class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5"
		>
			<p class="font-display text-lg uppercase tracking-wide text-white">
				{{ title }}
			</p>
			<p v-if="client || meta" class="font-mono text-[10px] tracking-widest text-white/70">
				{{ [client, meta].filter(Boolean).join(" · ") }}
			</p>
		</div>
	</div>
</template>
```

- [ ] **Step 2: Verify the type check passes**

```bash
astro check
```

Expected: no type errors from `VideoCard.vue` (pages that still pass the old `youtubeId` prop will show errors here — that's expected until Tasks 10–12 update them).

- [ ] **Step 3: Commit**

```bash
git add src/components/VideoCard.vue
git commit -m "Make VideoCard provider-agnostic (embedUrl/thumbnailUrl props)"
```

---

### Task 7: Shared `Hero.astro` component

The four category-page heroes (Imagefilme, Nachrichten, Dokumentationen, Kontakt) share an identical structure: full-bleed video-or-photo background with a gradient scrim, an optional small monospace caption, and a bottom-anchored, reveal-wrapped text block (script accent line, big headline, optional meta line, optional body copy). Home keeps its own bespoke hero (Task 9) because of the unique pinned-logo mechanic.

**Files:**
- Create: `src/components/Hero.astro`

**Interfaces:**
- Consumes: `getBackgroundEmbedUrl` from `src/lib/video.ts` (Task 3); `astro:assets` `Image`.
- Produces: `Hero` component with props:
  ```ts
  interface Props {
    videoUrl?: string;
    image?: ImageMetadata;
    imageAlt?: string;
    caption?: string;
    scriptLine: string;
    scriptFont?: "script" | "news-script";
    headline: string[];
    headlineFont?: "display" | "doku" | "news";
    metaLine?: string;
    body?: string;
  }
  ```
  Consumed by Tasks 10, 11, 12, 13.

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
---
import { Image } from "astro:assets";
import type { ImageMetadata } from "astro";
import { getBackgroundEmbedUrl } from "../lib/video";

interface Props {
	videoUrl?: string;
	image?: ImageMetadata;
	imageAlt?: string;
	caption?: string;
	scriptLine: string;
	scriptFont?: "script" | "news-script";
	headline: string[];
	headlineFont?: "display" | "doku" | "news";
	metaLine?: string;
	body?: string;
}

const {
	videoUrl,
	image,
	imageAlt,
	caption,
	scriptLine,
	scriptFont = "script",
	headline,
	headlineFont = "display",
	metaLine,
	body,
} = Astro.props;

const embedUrl = getBackgroundEmbedUrl(videoUrl);
---

<section class="relative flex min-h-screen flex-col overflow-hidden">
	<div class="absolute inset-0 -z-10 bg-bg">
		{
			embedUrl ? (
				<iframe
					class="pointer-events-none absolute left-1/2 top-1/2 h-[100vh] w-[177.78vh] min-h-[56.25vw] min-w-full -translate-x-1/2 -translate-y-1/2"
					src={embedUrl}
					title={caption ?? scriptLine}
					allow="autoplay"
				/>
			) : image ? (
				<Image
					src={image}
					alt={imageAlt ?? ""}
					class="h-full w-full object-cover"
					widths={[640, 1024, 1600, 2400]}
					sizes="100vw"
				/>
			) : null
		}
		<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/70" />
	</div>

	{
		caption && (
			<p class="absolute left-1/2 top-[26%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] tracking-[0.3em] text-white/40">
				{caption}
			</p>
		)
	}

	<div data-hero-reveal class="mt-auto flex flex-col gap-3 px-6 pb-16 pt-32 md:px-10 md:pb-20">
		<p
			class="text-script-accent text-3xl md:text-5xl"
			class:list={[scriptFont === "news-script" ? "font-doku italic font-black" : "font-script"]}
		>
			{scriptLine}
		</p>
		<h1
			class="uppercase leading-[0.85] tracking-tight text-white"
			class:list={[
				headlineFont === "doku" && "font-doku font-black text-5xl md:text-8xl",
				headlineFont === "news" && "font-news font-extralight tracking-normal text-5xl md:text-8xl",
				headlineFont === "display" && "font-display text-5xl md:text-8xl",
			]}
		>
			{headline.map((line, i) => (
				<>
					{i > 0 && <br />}
					{line}
				</>
			))}
		</h1>
		{metaLine && <p class="font-mono text-xs tracking-widest text-white/70">{metaLine}</p>}
		{body && <p class="max-w-xl font-sans text-white/70 md:text-lg">{body}</p>}
	</div>
</section>
```

- [ ] **Step 2: Verify the type check passes**

```bash
astro check
```

Expected: no errors from `Hero.astro` itself (it isn't used by any page yet, so this only checks the file in isolation).

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.astro
git commit -m "Add shared Hero component (video/photo background + reveal-wrapped headline)"
```

---

### Task 8: Header active-nav color + Footer variants

Makes the active nav item render in the current page's `--color-script-accent` (red/gold/blue/green) instead of plain ink, and gives `Footer.astro` three variants (`full` for Home, `category` for the three portfolio pages, `minimal` for Kontakt) so the partner-logo row and repeated contact block only show where the wireframe actually shows them.

**Files:**
- Modify: `src/components/Header.astro`
- Modify: `src/components/Footer.astro`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: `Footer` prop `variant?: "full" | "category" | "minimal"` (default `"full"`); `BaseLayout` prop `footerVariant?: "full" | "category" | "minimal"` (default `"full"`), passed through to `<Footer variant={footerVariant} />`.

- [ ] **Step 1: Update the active-link color in `src/components/Header.astro`**

Change:

```astro
						class:list={[active ? "text-ink" : "text-ink-muted hover:text-ink"]}
```

to:

```astro
						class:list={[active ? "text-script-accent" : "text-ink-muted hover:text-ink"]}
```

- [ ] **Step 2: Rewrite `src/components/Footer.astro`**

```astro
---
interface Props {
	variant?: "full" | "category" | "minimal";
}

const { variant = "full" } = Astro.props;

const partners = [
	{ src: "/images/logos/rts.webp", alt: "RTS Regionalfernsehen" },
	{ src: "/images/logos/dpa.webp", alt: "Deutsche Presse-Agentur" },
	{ src: "/images/logos/explosive-egg.webp", alt: "Explosive Egg" },
	{ src: "/images/logos/aqus.webp", alt: "Aqus" },
	{ src: "/images/logos/grow-scale.webp", alt: "Grow & Scale" },
	{ src: "/images/logos/r9.webp", alt: "R9" },
];
---

<footer class="border-t border-line px-6 py-16 md:px-10">
	{
		variant === "minimal" ? (
			<div class="mx-auto flex max-w-6xl flex-col items-center gap-4 text-center">
				<img
					src="/images/logos/true-frame-logo.webp"
					alt="TRUE FRAME"
					class="h-7 w-auto opacity-90"
				/>
				<p class="font-sans text-sm text-ink-muted">TRUE FRAME · GABRIEL NEUMAYR</p>
			</div>
		) : (
			<div
				class="mx-auto grid max-w-6xl gap-12"
				class:list={[variant === "full" ? "md:grid-cols-3" : "md:grid-cols-2"]}
			>
				<div>
					<img
						src="/images/logos/true-frame-logo.webp"
						alt="TRUE FRAME"
						class="mb-4 h-7 w-auto opacity-90"
					/>
					<p class="max-w-xs font-sans text-sm text-ink-muted">
						Produktionsfirma für Imagefilme, Nachrichtenbeiträge und
						Dokumentationen.
					</p>
				</div>

				<div class="font-sans text-sm text-ink-muted">
					<p class="mb-2 font-medium text-ink">Kontakt</p>
					<p><a href="tel:+436605777367" class="hover:text-accent">+43 660 577 73 67</a></p>
					<p><a href="mailto:mail@true-frame.net" class="hover:text-accent">mail@true-frame.net</a></p>
					<p>Hofgartenweg 5, 5163 Mattsee</p>
					<div class="mt-4 flex gap-4">
						<a href="https://www.instagram.com/gabriel_neumayr" class="hover:text-accent">Instagram</a>
						<a href="https://www.youtube.com/@True_Frame_net" class="hover:text-accent">YouTube</a>
					</div>
				</div>

				{
					variant === "full" && (
						<div class="flex flex-wrap items-center gap-6 md:justify-end">
							{partners.map((p) => (
								<img
									src={p.src}
									alt={p.alt}
									class="h-6 w-auto opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0"
								/>
							))}
						</div>
					)
				}
			</div>
		)
	}

	<div class="mx-auto mt-12 flex max-w-6xl flex-col gap-2 text-xs text-ink-muted md:flex-row md:justify-between">
		<p>© {new Date().getFullYear()} TRUE FRAME</p>
		<div class="flex gap-4">
			<a href="/impressum" class="hover:text-accent">Impressum</a>
			<a href="/datenschutz" class="hover:text-accent">Datenschutz</a>
		</div>
	</div>
</footer>
```

- [ ] **Step 3: Wire `footerVariant` through `BaseLayout.astro`**

Update the `Props` interface:

```ts
interface Props {
	title: string;
	description: string;
	theme: "landing" | "doku" | "imagefilm" | "news";
	showHeaderLogo?: boolean;
	footerVariant?: "full" | "category" | "minimal";
}

const { title, description, theme, showHeaderLogo = true, footerVariant = "full" } = Astro.props;
```

Update the `<Footer />` usage:

```astro
		<Footer variant={footerVariant} />
```

- [ ] **Step 4: Verify the type check passes**

```bash
astro check
```

Expected: no errors from `Header.astro`, `Footer.astro`, or `BaseLayout.astro`.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/layouts/BaseLayout.astro
git commit -m "Add theme-aware active nav color and Footer variants"
```

---

### Task 9: Home page — hero copy, reveal wiring, new "Vier Kapitel" section

Home's hero keeps its existing pinned-logo mechanic untouched, but gains the real wireframe copy (currently just "true frames." + a short paragraph) and the reveal wrapper. The "Vier Kapitel" process section (Denken/Hören/Sehen/Erzählen) doesn't exist in the current build at all — it's new, using the 4 photos copied in Task 1.

**Files:**
- Modify: `src/pages/index.astro`

**Interfaces:**
- Consumes: `home-kapitel-*.jpg` from `src/assets/photos/` (Task 1); `[data-hero-reveal]` CSS/JS from Task 4.

- [ ] **Step 1: Add the photo imports and swap the video helper import at the top of `src/pages/index.astro`**

Replace:

```astro
import { getYoutubeId } from "../lib/youtube";
```

with:

```astro
import { getBackgroundEmbedUrl, getThumbnailUrl } from "../lib/video";
import { Image } from "astro:assets";
import kapitelDenken from "../assets/photos/home-kapitel-denken.jpg";
import kapitelHoeren from "../assets/photos/home-kapitel-hoeren.jpg";
import kapitelSehen from "../assets/photos/home-kapitel-sehen.jpg";
import kapitelErzaehlen from "../assets/photos/home-kapitel-erzaehlen.jpg";
```

Replace:

```astro
const showreelId = getYoutubeId(showreel?.data.videoUrl);
```

with:

```astro
const showreelEmbedUrl = getBackgroundEmbedUrl(showreel?.data.videoUrl);
```

And later, replace:

```astro
					{
						showreelId && (
							<iframe
								class="pointer-events-none absolute left-1/2 top-1/2 h-[100vh] w-[177.78vh] min-h-[56.25vw] min-w-full -translate-x-1/2 -translate-y-1/2"
								src={`https://www.youtube-nocookie.com/embed/${showreelId}?autoplay=1&mute=1&loop=1&playlist=${showreelId}&controls=0&modestbranding=1&rel=0&showinfo=0`}
								title="Showreel Hintergrund"
								allow="autoplay"
							/>
						)
					}
```

with:

```astro
					{
						showreelEmbedUrl && (
							<iframe
								class="pointer-events-none absolute left-1/2 top-1/2 h-[100vh] w-[177.78vh] min-h-[56.25vw] min-w-full -translate-x-1/2 -translate-y-1/2"
								src={showreelEmbedUrl}
								title="Showreel Hintergrund"
								allow="autoplay"
							/>
						)
					}
```

- [ ] **Step 2: Add the kapitel data array**

After the `categories` array definition, add:

```ts
const kapitel = [
	{
		tagline: "Recherche",
		word: "DENKEN",
		text: "Bevor die Kamera läuft, steht die Idee. Ich recherchiere, lese, telefoniere — und baue daraus ein Konzept, das trägt.",
		image: kapitelDenken,
		align: "left" as const,
	},
	{
		tagline: "Zuhören",
		word: "HÖREN",
		text: "Was der Kunde sagt — und was er eigentlich meint. Das Gespräch entscheidet, welcher Film am Ende entsteht.",
		image: kapitelHoeren,
		align: "right" as const,
	},
	{
		tagline: "Momente",
		word: "SEHEN",
		text: "Drehen heißt warten können. Ich fange die Momente ein, die sich nicht wiederholen lassen — Licht, Blick, Handgriff.",
		image: kapitelSehen,
		align: "left" as const,
	},
	{
		tagline: "Schnitt",
		word: "ERZÄHLEN",
		text: "Aus Material wird ein Film: Struktur, Text, Ton, Rhythmus. Dann Feedback — und der letzte Schnitt.",
		image: kapitelErzaehlen,
		align: "right" as const,
	},
];
```

- [ ] **Step 3: Update the featured-teaser embed/thumbnail computation**

Replace:

```ts
const featuredByCategory = Object.fromEntries(
	categories.map((c) => {
		const inCategory = projects.filter(
			(p: CollectionEntry<"projects">) => p.data.category === c.category,
		);
		const featured =
			inCategory.find((p: CollectionEntry<"projects">) => p.data.featured) ??
			inCategory[0];
		return [c.slug, featured];
	}),
);
```

with:

```ts
const featuredByCategory = Object.fromEntries(
	categories.map((c) => {
		const inCategory = projects.filter(
			(p: CollectionEntry<"projects">) => p.data.category === c.category,
		);
		const featured =
			inCategory.find((p: CollectionEntry<"projects">) => p.data.featured) ??
			inCategory[0];
		return [c.slug, featured];
	}),
);

const teaserThumbnails = Object.fromEntries(
	await Promise.all(
		Object.entries(featuredByCategory).map(async ([slug, project]) => [
			slug,
			await getThumbnailUrl(project?.data.videoUrl),
		]),
	),
);
```

Then in the template, replace:

```astro
					{
						categories.map((cat) => {
							const featured = featuredByCategory[cat.slug];
							const youtubeId = getYoutubeId(featured?.data.videoUrl);
							return (
								<a href={`/${cat.slug}`} class="group block">
									<div class="aspect-[4/5] overflow-hidden bg-surface">
										{youtubeId ? (
											<img
												src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
												alt={featured?.data.title}
												class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
											/>
										) : (
```

with:

```astro
					{
						categories.map((cat) => {
							const featured = featuredByCategory[cat.slug];
							const thumbnailUrl = teaserThumbnails[cat.slug];
							return (
								<a href={`/${cat.slug}`} class="group block">
									<div class="aspect-[4/5] overflow-hidden bg-surface">
										{thumbnailUrl ? (
											<img
												src={thumbnailUrl}
												alt={featured?.data.title}
												class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
											/>
										) : (
```

- [ ] **Step 4: Replace the hero copy block with the reveal-wrapped version**

Replace:

```astro
		<HeroLogo client:load />

		<div class="mt-auto mb-24 flex flex-col items-center gap-4">
			<p class="font-script text-2xl text-accent md:text-3xl">
				true frames.
			</p>
			<p class="max-w-xl font-sans text-white/70 md:text-lg">
				Produktionsfirma für Imagefilme, Nachrichtenbeiträge und
				Dokumentationen – ehrliche Geschichten, cinematisch erzählt.
			</p>
			<div class="mt-8 animate-bounce text-white/50">↓ scroll</div>
		</div>
```

with:

```astro
		<HeroLogo client:load />

		<div data-hero-reveal class="mt-auto mb-24 flex flex-col items-center gap-6 text-center">
			<p class="font-script text-2xl text-accent md:text-3xl">
				Filme, die bleiben
			</p>
			<h1 class="font-display text-5xl uppercase leading-[0.85] tracking-tight text-white md:text-8xl">
				Ich erzähle<br />deine<br />Geschichte
			</h1>
			<p class="max-w-xl font-sans text-white/70 md:text-lg">
				Produktionsfirma für Imagefilme, Nachrichtenbeiträge und
				Dokumentationen – ehrliche Geschichten, cinematisch erzählt.
			</p>
			<p class="mt-4 font-mono text-[10px] tracking-[0.24em] text-white/50">SCROLLEN</p>
		</div>
```

- [ ] **Step 5: Insert the "Vier Kapitel" section between the hero and the "Drei Arten" section**

Immediately after the closing `</section>` of the hero (`id="hero"`) and before `<section class="mx-auto max-w-6xl px-6 py-24 md:px-10">` (the "Drei Arten, Geschichten zu erzählen" section), insert:

```astro
	<section class="mx-auto max-w-6xl px-6 py-24 md:px-10">
		<div class="flex items-baseline gap-4">
			<p class="font-mono text-[10px] tracking-[0.26em] text-ink-muted">WIE ICH ARBEITE</p>
			<div class="h-px flex-1 bg-line"></div>
			<p class="font-script text-2xl text-accent">vier Kapitel</p>
		</div>

		<div class="mt-12 flex flex-col">
			{
				kapitel.map((k) => (
					<div
						class="grid items-center gap-8 border-t border-line py-10 md:grid-cols-2"
						class:list={[k.align === "right" && "md:[&>*:first-child]:order-2"]}
					>
						<div class:list={[k.align === "right" && "text-right"]}>
							<p class="font-script text-2xl text-accent md:text-4xl">{k.tagline}</p>
							<p class="font-display text-5xl leading-[0.86] text-ink md:text-7xl">{k.word}</p>
							<p
								class="mt-4 max-w-lg font-sans text-sm text-ink-muted md:text-base"
								class:list={[k.align === "right" && "ml-auto"]}
							>
								{k.text}
							</p>
						</div>
						<div class="aspect-[16/10] overflow-hidden border border-line">
							<Image
								src={k.image}
								alt={`${k.tagline} – ${k.word}`}
								class="h-full w-full object-cover transition duration-700 hover:scale-105"
								widths={[400, 800, 1200]}
								sizes="(min-width: 768px) 50vw, 100vw"
							/>
						</div>
					</div>
				))
			}
		</div>
	</section>
```

- [ ] **Step 6: Start the dev server and visually verify Home**

```bash
astro dev --background
sleep 3
astro dev logs
```

Then open `http://localhost:4321/` in a browser and confirm:
- The showreel video plays full-bleed immediately; "Filme, die bleiben" / "ICH ERZÄHLE DEINE GESCHICHTE" / description are invisible for ~2 seconds, then fade in.
- Scrolling before 2 seconds reveals the text immediately.
- Below the hero, "WIE ICH ARBEITE · vier Kapitel" shows 4 alternating rows with the 4 real photos, each zooming slightly on hover.
- The "Drei Arten, Geschichten zu erzählen" section still renders 3 category tiles with real thumbnails.

Run `astro dev stop` when done.

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro
git commit -m "Rebuild Home hero copy + add Vier-Kapitel section with real photos"
```

---

### Task 10: Imagefilme page

**Files:**
- Modify: `src/pages/imagefilme.astro`

**Interfaces:**
- Consumes: `Hero` (Task 7), `getCardEmbedUrl`/`getThumbnailUrl` (Task 3), `VideoCard` (Task 6).

- [ ] **Step 1: Rewrite `src/pages/imagefilme.astro`**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Hero from "../components/Hero.astro";
import VideoCard from "../components/VideoCard.vue";
import { getCollection, type CollectionEntry } from "astro:content";
import { getCardEmbedUrl, getThumbnailUrl } from "../lib/video";

const all = await getCollection("projects");
const projects = all.filter(
	(p: CollectionEntry<"projects">) => p.data.category === "imagefilm",
);

const hero = projects.find((p) => p.data.featured) ?? projects[0];
const grid = projects.filter((p) => p.id !== hero?.id);

const gridCards = await Promise.all(
	grid.map(async (p) => ({
		project: p,
		embedUrl: getCardEmbedUrl(p.data.videoUrl),
		thumbnailUrl: await getThumbnailUrl(p.data.videoUrl),
	})),
);
---

<BaseLayout
	title="Imagefilme"
	description="Premiumproduktionen: Imagefilme von TRUE FRAME."
	theme="imagefilm"
	footerVariant="category"
>
	<Hero
		videoUrl={hero?.data.videoUrl}
		caption="TOP-PROJEKT · VOLLFLÄCHIGES VIDEO"
		scriptLine="cinematisch"
		headline={["IMAGE", "FILME"]}
		metaLine={
			hero
				? `IMAGEFILM · ${hero.data.year ?? ""} · ${hero.data.duration ?? ""}`
				: undefined
		}
		body="Für Unternehmen, die zeigen wollen, wer hinter dem Produkt steht."
	/>

	<section class="mx-auto max-w-6xl px-6 py-16 md:px-10">
		<p class="font-mono text-xs tracking-widest text-ink-muted">
			{grid.length === 1 ? "WEITERES PROJEKT" : `${grid.length} WEITERE PROJEKTE`}
		</p>
		<div class="mt-8 grid gap-8 md:grid-cols-2">
			{
				gridCards.map(({ project, embedUrl, thumbnailUrl }) => (
					<VideoCard
						client:visible
						title={project.data.title}
						description={project.data.description}
						client={project.data.client}
						meta={project.data.duration}
						embedUrl={embedUrl}
						thumbnailUrl={thumbnailUrl}
					/>
				))
			}
		</div>
	</section>

	<section class="bg-script-accent px-6 py-20 text-center md:px-10">
		<p class="font-script text-3xl text-ink md:text-4xl">Erzählen wir</p>
		<p class="font-display text-4xl uppercase tracking-tight text-ink md:text-6xl">
			und deine Marke?
		</p>
		<a
			href="/kontakt"
			class="mt-8 inline-block bg-accent px-8 py-4 font-sans text-sm uppercase tracking-widest text-white transition hover:bg-accent-hover"
		>
			Projekt anfragen
		</a>
	</section>
</BaseLayout>
```

- [ ] **Step 2: Start the dev server and visually verify**

```bash
astro dev --background
sleep 3
astro dev logs
```

Open `http://localhost:4321/imagefilme` and confirm: Clear AMine (DE) plays as the full-bleed hero video, reveal timing works, the grid below shows exactly one card (Clear AMine FR) with a real Vimeo-free YouTube thumbnail, and the gold CTA band links to `/kontakt`. Run `astro dev stop` when done.

- [ ] **Step 3: Commit**

```bash
git add src/pages/imagefilme.astro
git commit -m "Rebuild Imagefilme page with shared Hero and real project data"
```

---

### Task 11: Nachrichten page

No real news videos exist yet, so the hero has no video/image (falls back to the themed background) and the archive grid shows 4 explicitly-labeled placeholder cards, per the user's decision.

**Files:**
- Modify: `src/pages/nachrichten.astro`

**Interfaces:**
- Consumes: `Hero` (Task 7).

- [ ] **Step 1: Rewrite `src/pages/nachrichten.astro`**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Hero from "../components/Hero.astro";
---

<BaseLayout
	title="Nachrichten"
	description="Nachrichtenbeiträge von TRUE FRAME für dpa und RTS."
	theme="news"
	footerVariant="category"
>
	<Hero
		scriptLine="zuerst vor Ort"
		scriptFont="news-script"
		headline={["NACHRICHTEN"]}
		headlineFont="news"
		body="Beiträge für dpa, RTS und Redaktionen. Schnell, verlässlich, sendefertig."
	/>

	<section class="bg-[#1b2c4b] px-6 py-16 md:px-10">
		<div class="mx-auto grid max-w-5xl gap-10 text-center md:grid-cols-3">
			<div>
				<p class="font-display text-4xl text-white">120+</p>
				<p class="mt-2 font-mono text-xs tracking-widest text-white/60">BEITRÄGE / JAHR</p>
			</div>
			<div>
				<p class="font-display text-4xl text-white">24 H</p>
				<p class="mt-2 font-mono text-xs tracking-widest text-white/60">LIEFERZEIT</p>
			</div>
			<div>
				<p class="font-doku italic font-black text-4xl text-[#8ab0e8]">live</p>
				<p class="mt-2 font-mono text-xs tracking-widest text-white/60">SCHALTUNGEN</p>
			</div>
		</div>
	</section>

	<section class="mx-auto max-w-6xl px-6 py-16 md:px-10">
		<p class="font-mono text-xs tracking-widest text-ink-muted">ARCHIV</p>
		<div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
			{
				Array.from({ length: 4 }).map((_, i) => (
					<div class="relative aspect-video overflow-hidden border border-dashed border-line bg-surface">
						<div class="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
							<span class="font-script text-xl text-script-accent">Beispiel folgt</span>
							<span class="font-mono text-[10px] tracking-widest text-ink-muted">
								PLATZHALTER {i + 1}/4
							</span>
						</div>
					</div>
				))
			}
		</div>
	</section>

	<section class="bg-[#1b2c4b] px-6 py-20 text-center md:px-10">
		<p class="font-news font-extralight uppercase tracking-[0.2em] text-3xl text-white md:text-5xl">
			Kurzfristig vor Ort?
		</p>
		<a
			href="tel:+436605777367"
			class="mt-8 inline-block bg-accent px-8 py-4 font-sans text-sm uppercase tracking-widest text-white transition hover:bg-accent-hover"
		>
			Jetzt anrufen
		</a>
	</section>
</BaseLayout>
```

- [ ] **Step 2: Start the dev server and visually verify**

```bash
astro dev --background
sleep 3
astro dev logs
```

Open `http://localhost:4321/nachrichten` and confirm: hero shows the themed navy/gray background (no broken video), "zuerst vor Ort" appears in blue italic Bodoni after the reveal delay, the stats band and 4 clearly-labeled "Beispiel folgt" placeholder cards render, and the CTA calls the real phone number. Run `astro dev stop` when done.

- [ ] **Step 3: Commit**

```bash
git add src/pages/nachrichten.astro
git commit -m "Rebuild Nachrichten page with shared Hero, stats band, and labeled placeholders"
```

---

### Task 12: Dokumentationen page

**Files:**
- Modify: `src/pages/dokumentationen.astro`

**Interfaces:**
- Consumes: `Hero` (Task 7), `getCardEmbedUrl`/`getThumbnailUrl` (Task 3), `VideoCard` (Task 6).

- [ ] **Step 1: Rewrite `src/pages/dokumentationen.astro`**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Hero from "../components/Hero.astro";
import VideoCard from "../components/VideoCard.vue";
import { getCollection, type CollectionEntry } from "astro:content";
import { getCardEmbedUrl, getThumbnailUrl } from "../lib/video";

const all = await getCollection("projects");
const projects = all.filter(
	(p: CollectionEntry<"projects">) => p.data.category === "doku",
);

const hero = projects.find((p) => p.data.featured) ?? projects[0];
const grid = projects.filter((p) => p.id !== hero?.id);

const gridCards = await Promise.all(
	grid.map(async (p) => ({
		project: p,
		embedUrl: getCardEmbedUrl(p.data.videoUrl),
		thumbnailUrl: await getThumbnailUrl(p.data.videoUrl),
		meta: [p.data.client, p.data.duration ?? p.data.tags?.[0]]
			.filter(Boolean)
			.join(" · "),
	})),
);
---

<BaseLayout
	title="Dokumentationen"
	description="Dokumentationen von TRUE FRAME – beobachtend und hochwertig erzählt."
	theme="doku"
	footerVariant="category"
>
	<Hero
		videoUrl={hero?.data.videoUrl}
		caption="AKTUELLER FILM · VOLLFLÄCHIGES VIDEO"
		scriptLine="geerdet"
		headline={["DOKUMEN-", "TATIONEN"]}
		headlineFont="doku"
		metaLine={
			hero
				? `${hero.data.client ?? "RTS"} · ${hero.data.year ?? ""} · ${hero.data.duration ?? ""}`
				: undefined
		}
		body="Über Menschen, Handwerk und Orte, die Zeit brauchen."
	/>

	<section class="mx-auto max-w-6xl px-6 py-16 md:px-10">
		<p class="font-mono text-xs tracking-widest text-ink-muted">
			{grid.length} WEITERE FILME
		</p>
		<div class="mt-8 grid gap-8 md:grid-cols-2">
			{
				gridCards.map(({ project, embedUrl, thumbnailUrl, meta }) => (
					<VideoCard
						client:visible
						title={project.data.title}
						description={project.data.description}
						client={project.data.client}
						meta={meta}
						embedUrl={embedUrl}
						thumbnailUrl={thumbnailUrl}
					/>
				))
			}
		</div>
	</section>

	<section class="border-t border-line px-6 py-20 text-center md:px-10">
		<p class="font-script text-3xl text-script-accent md:text-4xl">Erzähl mir</p>
		<p class="font-doku text-4xl font-black uppercase tracking-tight text-ink md:text-6xl">
			eine Geschichte?
		</p>
		<a
			href="/kontakt"
			class="mt-8 inline-block border border-accent px-8 py-4 font-sans text-sm uppercase tracking-widest text-accent transition hover:bg-accent hover:text-white"
		>
			Schreiben
		</a>
	</section>
</BaseLayout>
```

- [ ] **Step 2: Start the dev server and visually verify**

```bash
astro dev --background
sleep 3
astro dev logs
```

Open `http://localhost:4321/dokumentationen` and confirm: Die Wegewarter plays as the full-bleed Vimeo hero video, reveal timing works, the grid shows exactly 3 cards (Typisch Salzburg – Stadtberge, R9 Instrumentenbau, Die Entscheidung) each with a real thumbnail, and the outlined CTA button links to `/kontakt`. Run `astro dev stop` when done.

- [ ] **Step 3: Commit**

```bash
git add src/pages/dokumentationen.astro
git commit -m "Rebuild Dokumentationen page with shared Hero and 4-film grid"
```

---

### Task 13: Kontakt page

Replaces the existing 2-column box layout with the same full-bleed Hero pattern as the other pages (photo instead of video), keeping the real contact details below and adding the wireframe's second-column CTA copy.

**Files:**
- Modify: `src/pages/kontakt.astro`

**Interfaces:**
- Consumes: `Hero` (Task 7), `kontakt-hero.jpg` (Task 1).

- [ ] **Step 1: Rewrite `src/pages/kontakt.astro`**

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Hero from "../components/Hero.astro";
import kontaktHero from "../assets/photos/kontakt-hero.jpg";
---

<BaseLayout
	title="Kontakt"
	description="Kontakt zu TRUE FRAME – Projektanfragen für Imagefilme, Nachrichten und Dokumentationen."
	theme="landing"
	footerVariant="minimal"
>
	<Hero
		image={kontaktHero}
		imageAlt="Gabriel Neumayr bei der Arbeit für TRUE FRAME"
		caption="PORTRAIT / BEHIND THE SCENES · VOLLFLÄCHIG"
		scriptLine="reden wir"
		headline={["GABRIEL", "NEUMAYR"]}
		metaLine="VIDEOJOURNALIST & FILMEMACHER · SALZBURG · ÖSTERREICH"
	/>

	<section class="mx-auto grid max-w-6xl gap-16 px-6 py-24 md:grid-cols-2 md:px-10">
		<div class="space-y-6 font-sans">
			<a href="tel:+436605777367" class="block border-t border-line pt-6">
				<p class="text-xs uppercase tracking-widest text-ink-muted">Telefon</p>
				<p class="font-display text-2xl transition-colors hover:text-accent">
					+43 660 577 73 67
				</p>
			</a>
			<a href="mailto:mail@true-frame.net" class="block border-t border-line pt-6">
				<p class="text-xs uppercase tracking-widest text-ink-muted">E-Mail</p>
				<p class="font-display text-xl transition-colors hover:text-accent">
					mail@true-frame.net
				</p>
			</a>
			<div class="border-t border-line pt-6">
				<p class="text-xs uppercase tracking-widest text-ink-muted">Adresse</p>
				<p class="text-lg">Hofgartenweg 5, 5163 Mattsee</p>
			</div>

			<div class="flex gap-4 pt-4">
				<a
					href="https://www.instagram.com/gabriel_neumayr"
					class="border border-line px-5 py-2 text-xs uppercase tracking-widest transition hover:border-accent hover:text-accent"
				>
					Instagram
				</a>
				<a
					href="https://www.youtube.com/@True_Frame_net"
					class="border border-line px-5 py-2 text-xs uppercase tracking-widest transition hover:border-accent hover:text-accent"
				>
					YouTube
				</a>
			</div>
		</div>

		<div>
			<p class="font-script text-2xl text-accent">einfach anrufen</p>
			<h2 class="font-display text-4xl uppercase tracking-tight text-ink md:text-5xl">
				Erstgespräch, unverbindlich
			</h2>
			<p class="mt-6 max-w-md font-sans text-ink-muted md:text-lg">
				Kein Formular. Ruf an oder schreib mir — meist antworte ich am selben
				Tag. Erzähl mir, was du vorhast, den Rest klären wir im Gespräch.
			</p>
			<a
				href="tel:+436605777367"
				class="mt-8 inline-block bg-accent px-8 py-4 font-sans text-sm uppercase tracking-widest text-white transition hover:bg-accent-hover"
			>
				Jetzt anrufen
			</a>
		</div>
	</section>
</BaseLayout>
```

- [ ] **Step 2: Start the dev server and visually verify**

```bash
astro dev --background
sleep 3
astro dev logs
```

Open `http://localhost:4321/kontakt` and confirm: the portrait photo fills the hero, "reden wir" / "GABRIEL NEUMAYR" reveal after 2s or on scroll, the left column shows the real phone/email/address/social links, and the right column shows the "Erstgespräch, unverbindlich" copy with a working `tel:` CTA. Run `astro dev stop` when done.

- [ ] **Step 3: Commit**

```bash
git add src/pages/kontakt.astro
git commit -m "Rebuild Kontakt page with full-bleed photo Hero and CTA column"
```

---

### Task 14: Full-site verification

**Files:** none (verification only).

- [ ] **Step 1: Run the full unit test suite**

```bash
npx vitest run
```

Expected: PASS — all tests in `src/lib/video.test.ts` and `src/lib/hero-reveal.test.ts` green.

- [ ] **Step 2: Run the Astro type checker**

```bash
astro check
```

Expected: 0 errors.

- [ ] **Step 3: Run a production build**

```bash
astro build
```

Expected: build succeeds, no missing-import or missing-asset errors (this is also where any incorrect `src/assets/photos/*.jpg` import path or a broken `@fontsource` import path would surface).

- [ ] **Step 4: Manual cross-page check in the browser**

```bash
astro dev --background
sleep 3
astro dev logs
```

Visit `/`, `/imagefilme`, `/nachrichten`, `/dokumentationen`, `/kontakt` in a browser and confirm for each:
- Video/photo hero visible immediately; headline+text hidden, then reveal after 2s (or immediately on scroll before that).
- Nav active-item color matches the page's accent (red / gold / blue / green).
- Whiteboard-pan page transition between pages still works (unchanged from before this plan).
- With OS-level "reduce motion" enabled, hero text appears instantly with no transition.

Then stop the preview server:

```bash
astro dev stop
```

- [ ] **Step 5: Final commit (if any fixes were needed during verification)**

```bash
git add -A
git commit -m "Fix issues found during full-site verification"
```

(Skip this step if no fixes were necessary.)
