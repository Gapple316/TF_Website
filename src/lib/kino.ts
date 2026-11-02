// Steuerung des Private Screenings: Ticket abreißen, Saal betreten,
// Countdown, Vorspann, Marquee, Staub, Vorführung.
//
// Leitsatz aus der Vorgabe: Das Kino ist die Verpackung, nicht das Hindernis.
// Deshalb wird die Seite an keiner Stelle scroll-gesperrt, jede Animation ist
// überspringbar, und bei prefers-reduced-motion läuft gar nichts von selbst.
//
// Läuft über astro:page-load, weil die Seite View Transitions nutzt.

import { initTicketRiss } from "./ticket-riss";
import { initFigur, type FigurSteuerung } from "./figur";

/** Von initKino gesetzt, damit die Szenen der Figur etwas sagen lassen können. */
let figur: FigurSteuerung | undefined;

const SPEICHER_SCHLUESSEL = "tf-screening-gesehen";

let aufraeumen: (() => void)[] = [];

/** Meldet dem Inline-Skript im Seitenkopf, dass dieses Modul geladen ist. */
if (typeof document !== "undefined") {
	document.documentElement.dataset.kinoModul = "aktiv";
}

const wenigerBewegung = () =>
	typeof window !== "undefined" &&
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** localStorage kann in privaten Fenstern werfen – deshalb immer gekapselt. */
function schonGesehen(slug: string): boolean {
	try {
		return localStorage.getItem(SPEICHER_SCHLUESSEL) === slug;
	} catch {
		return false;
	}
}

function merkeGesehen(slug: string): void {
	try {
		localStorage.setItem(SPEICHER_SCHLUESSEL, slug);
	} catch {
		/* Kein Speicher verfügbar – dann startet die Seite eben immer im Foyer. */
	}
}

// ---------------------------------------------------------------------------
// Szenenwechsel
// ---------------------------------------------------------------------------

/**
 * Der Ablauf im Saal. Jede Phase schaltet nur ein Attribut weiter, die
 * Bewegung selbst steckt in screening.css.
 *
 *   dunkel → spot (0,5s) → fahrt (1,5s) → vorhang (1s) → countdown (1,5s) → text
 *
 * Macht 4,5 Sekunden vom Abreißen bis zur ersten Textzeile – das Zeitbudget
 * aus der Vorgabe.
 */
const PHASEN: [string, number][] = [
	["spot", 450],
	["fahrt", 1300],
	["vorhang", 900],
	["countdown", 1200],
	["text", 0],
];

function betreteSaal(wurzel: HTMLElement, sofort: boolean): void {
	wurzel.dataset.kinoSzene = "saal";

	if (sofort || wenigerBewegung()) {
		// Kein Vorlauf: Vorhang offen, Licht an, Text steht.
		wurzel.dataset.kinoPhase = "text";
		return;
	}

	let verzoegerung = 0;
	for (const [phase, dauer] of PHASEN) {
		const t = window.setTimeout(() => {
			wurzel.dataset.kinoPhase = phase;
			// Sobald der Spot auf dem reservierten Platz liegt, meldet sich
			// die Figur vom Nachbarplatz.
			if (phase === "spot") figur?.sage(wurzel.dataset.figurSpot ?? "");
		}, verzoegerung);
		aufraeumen.push(() => window.clearTimeout(t));
		verzoegerung += dauer;
	}
}

function initTicket(wurzel: HTMLElement, slug: string): void {
	const ab = initTicketRiss(wurzel, {
		wenigerBewegung: wenigerBewegung(),
		beiRiss: () => {
			merkeGesehen(slug);

			if (wenigerBewegung()) {
				betreteSaal(wurzel, true);
				return;
			}

			// Erst fliegt der Streifen und das Ticket wackelt nach, dann
			// dimmt das Licht, dann übernimmt der Saal. In dieser Reihenfolge,
			// sonst verdeckt das Schwarz genau den Moment, auf den es ankommt.
			// 700 ms reichen, um den Streifen fliegen und das Ticket nachwackeln
			// zu sehen. Zusammen mit den Saalphasen bleibt der Weg bis zur
			// ersten Textzeile bei rund 4,5 Sekunden – das Budget der Vorgabe.
			const abblende = window.setTimeout(() => {
				wurzel.dataset.kinoAbblende = "true";
			}, 420);
			const uebernahme = window.setTimeout(() => {
				wurzel.dataset.kinoRiss = "fertig";
				delete wurzel.dataset.kinoAbblende;
				betreteSaal(wurzel, false);
			}, 700);
			aufraeumen.push(() => {
				window.clearTimeout(abblende);
				window.clearTimeout(uebernahme);
			});
		},
	});
	aufraeumen.push(ab);
}

// ---------------------------------------------------------------------------
// Vorspann auf der Leinwand
// ---------------------------------------------------------------------------

function initVorspann(wurzel: HTMLElement): void {
	const rolle = wurzel.querySelector<HTMLElement>("[data-vorspann-rolle]");
	const leinwand = wurzel.querySelector<HTMLElement>("[data-leinwand]");
	const skip = wurzel.querySelector<HTMLButtonElement>("[data-vorspann-skip]");
	if (!rolle) return;

	const beenden = () => {
		wurzel.dataset.kinoVorspann = "fertig";
	};

	if (skip) {
		skip.addEventListener("click", beenden);
		aufraeumen.push(() => skip.removeEventListener("click", beenden));
	}

	if (wenigerBewegung()) {
		// Kein Autoscroll: Der Text steht still auf der Leinwand und ist
		// ganz normal lesbar.
		wurzel.dataset.kinoVorspann = "statisch";
		return;
	}

	// Anhalten und Weiterlaufen per Klick bzw. Tippen – auf allen Geräten
	// gleich. Kein Hover mehr: Am Handy gibt es keinen, und am Rechner hielt
	// der Text schon an, wenn man die Maus nur abgelegt hatte.
	const ziel = leinwand ?? rolle;
	const umschalten = () => {
		if (wurzel.dataset.kinoVorspann === "fertig") return;
		wurzel.dataset.kinoVorspann =
			wurzel.dataset.kinoVorspann === "pausiert" ? "laeuft" : "pausiert";
	};

	ziel.addEventListener("click", umschalten);
	aufraeumen.push(() => ziel.removeEventListener("click", umschalten));

	const fertig = () => beenden();
	rolle.addEventListener("animationend", fertig);
	aufraeumen.push(() => rolle.removeEventListener("animationend", fertig));
}

// ---------------------------------------------------------------------------
// Staub im Lichtkegel
// ---------------------------------------------------------------------------

function initStaub(wurzel: HTMLElement): void {
	const leinwand = wurzel.querySelector<HTMLCanvasElement>("[data-staub]");
	if (!leinwand || wenigerBewegung()) return;

	const ctx = leinwand.getContext("2d");
	if (!ctx) return;

	// Bewusst wenige Partikel: Der Effekt soll zu sehen, nicht zu spüren sein.
	const ANZAHL = 38;
	let breite = 0;
	let hoehe = 0;
	let laeuft = true;
	let frame = 0;

	const teilchen = Array.from({ length: ANZAHL }, () => ({
		x: Math.random(),
		y: Math.random(),
		r: 0.6 + Math.random() * 1.6,
		vx: (Math.random() - 0.5) * 0.00018,
		vy: -(0.00004 + Math.random() * 0.00012),
		a: 0.12 + Math.random() * 0.3,
	}));

	const messen = () => {
		const r = leinwand.getBoundingClientRect();
		breite = Math.max(1, Math.round(r.width));
		hoehe = Math.max(1, Math.round(r.height));
		leinwand.width = breite;
		leinwand.height = hoehe;
	};

	const zeichnen = () => {
		if (!laeuft) return;
		ctx.clearRect(0, 0, breite, hoehe);
		for (const t of teilchen) {
			t.x += t.vx;
			t.y += t.vy;
			if (t.y < -0.05) {
				t.y = 1.05;
				t.x = Math.random();
			}
			if (t.x < -0.05) t.x = 1.05;
			if (t.x > 1.05) t.x = -0.05;
			ctx.beginPath();
			ctx.arc(t.x * breite, t.y * hoehe, t.r, 0, Math.PI * 2);
			ctx.fillStyle = `rgba(255, 238, 205, ${t.a})`;
			ctx.fill();
		}
		frame = requestAnimationFrame(zeichnen);
	};

	messen();
	frame = requestAnimationFrame(zeichnen);

	const beiGroesse = () => messen();
	window.addEventListener("resize", beiGroesse, { passive: true });

	// Außerhalb des Bildes nicht rechnen.
	const beobachter = new IntersectionObserver(([eintrag]) => {
		const sichtbar = eintrag.isIntersecting;
		if (sichtbar && !laeuft) {
			laeuft = true;
			frame = requestAnimationFrame(zeichnen);
		} else if (!sichtbar && laeuft) {
			laeuft = false;
			cancelAnimationFrame(frame);
		}
	});
	beobachter.observe(leinwand);

	aufraeumen.push(() => {
		laeuft = false;
		cancelAnimationFrame(frame);
		window.removeEventListener("resize", beiGroesse);
		beobachter.disconnect();
	});
}

// ---------------------------------------------------------------------------
// Einblenden beim Scrollen (Marquee, Programmzettel, Abspann)
// ---------------------------------------------------------------------------

function initEinblenden(wurzel: HTMLElement): void {
	const elemente = [...wurzel.querySelectorAll<HTMLElement>("[data-kino-reveal]")];
	if (elemente.length === 0) return;

	if (wenigerBewegung()) {
		for (const el of elemente) el.classList.add("is-sichtbar");
		return;
	}

	const beobachter = new IntersectionObserver(
		(eintraege) => {
			for (const e of eintraege) {
				if (!e.isIntersecting) continue;
				e.target.classList.add("is-sichtbar");
				beobachter.unobserve(e.target);
			}
		},
		{ rootMargin: "0px 0px -12% 0px", threshold: 0 },
	);
	for (const el of elemente) beobachter.observe(el);
	aufraeumen.push(() => beobachter.disconnect());
}

// ---------------------------------------------------------------------------
// Vorführung: Vollbild-Overlay mit Vorhängen
// ---------------------------------------------------------------------------

function initVorfuehrung(wurzel: HTMLElement): void {
	const overlay = wurzel.querySelector<HTMLElement>("[data-vorfuehrung]");
	const rahmen = overlay?.querySelector<HTMLIFrameElement>("[data-vorfuehrung-frame]");
	const titelEl = overlay?.querySelector<HTMLElement>("[data-vorfuehrung-titel]");
	const schliessen = overlay?.querySelector<HTMLButtonElement>("[data-vorfuehrung-zu]");
	if (!overlay || !rahmen || !schliessen) return;

	let zuletztFokussiert: HTMLElement | null = null;
	let schonGespielt = false;

	const zu = () => {
		overlay.dataset.offen = "false";
		overlay.setAttribute("aria-hidden", "true");
		rahmen.removeAttribute("src");
		zuletztFokussiert?.focus();

		// Nach dem ersten Film einmal nachfragen – danach nicht mehr.
		if (!schonGespielt) {
			schonGespielt = true;
			window.setTimeout(() => figur?.sage(overlay.dataset.figurNachFilm ?? ""), 600);
		}
	};

	const beiTaste = (e: KeyboardEvent) => {
		if (e.key === "Escape" && overlay.dataset.offen === "true") zu();
	};

	const starter = [...wurzel.querySelectorAll<HTMLButtonElement>("[data-film-start]")];
	for (const knopf of starter) {
		const auf = () => {
			const embed = knopf.dataset.embed;
			if (!embed) return;
			zuletztFokussiert = knopf;
			if (titelEl) titelEl.textContent = knopf.dataset.titel ?? "";
			rahmen.setAttribute("src", embed);
			overlay.dataset.offen = "true";
			overlay.setAttribute("aria-hidden", "false");
			schliessen.focus();
		};
		knopf.addEventListener("click", auf);
		aufraeumen.push(() => knopf.removeEventListener("click", auf));
	}

	schliessen.addEventListener("click", zu);
	document.addEventListener("keydown", beiTaste);
	aufraeumen.push(() => {
		schliessen.removeEventListener("click", zu);
		document.removeEventListener("keydown", beiTaste);
	});
}

// ---------------------------------------------------------------------------

export function initKino(): void {
	for (const f of aufraeumen) f();
	aufraeumen = [];

	const wurzel = document.querySelector<HTMLElement>("[data-kino-wurzel]");
	if (!wurzel) return;

	const slug = wurzel.dataset.slug ?? "";

	figur = initFigur(wurzel, {
		maxKommentare: Number(wurzel.dataset.figurMax ?? 6),
		dauerMs: Number(wurzel.dataset.figurDauer ?? 5000),
		wenigerBewegung: wenigerBewegung(),
	});
	if (figur) aufraeumen.push(figur.aufraeumen);

	initTicket(wurzel, slug);
	initVorspann(wurzel);
	initStaub(wurzel);
	initEinblenden(wurzel);
	initVorfuehrung(wurzel);

	// Wiederkehr: direkt in den Saal, Begrüßung einblenden, Vorspann sofort
	// überspringbar. Das Ticket bleibt im Markup, wird aber übersprungen.
	if (slug && schonGesehen(slug)) {
		wurzel.dataset.kinoWiederkehr = "true";
		wurzel.dataset.kinoRiss = "fertig";
		betreteSaal(wurzel, true);
	}
}

if (typeof document !== "undefined") {
	document.addEventListener("astro:page-load", initKino);
}
