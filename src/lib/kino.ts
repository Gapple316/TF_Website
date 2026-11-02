// Steuerung des Private Screenings: Ticket abreißen, Saal betreten,
// Countdown, Vorspann, Marquee, Staub, Vorführung.
//
// Leitsatz aus der Vorgabe: Das Kino ist die Verpackung, nicht das Hindernis.
// Deshalb wird die Seite an keiner Stelle scroll-gesperrt, jede Animation ist
// überspringbar, und bei prefers-reduced-motion läuft gar nichts von selbst.
//
// Läuft über astro:page-load, weil die Seite View Transitions nutzt.

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

function betreteSaal(wurzel: HTMLElement, sofort: boolean): void {
	wurzel.dataset.kinoSzene = "saal";
	if (sofort || wenigerBewegung()) {
		wurzel.dataset.kinoCountdown = "fertig";
		return;
	}

	// Countdown läuft rein über CSS; hier wird nur der Zustand umgeschaltet.
	wurzel.dataset.kinoCountdown = "laeuft";
	const t = window.setTimeout(() => {
		wurzel.dataset.kinoCountdown = "fertig";
	}, 2000);
	aufraeumen.push(() => window.clearTimeout(t));
}

function initTicket(wurzel: HTMLElement, slug: string): void {
	const knopf = wurzel.querySelector<HTMLButtonElement>("[data-ticket-knopf]");
	if (!knopf) return;

	const abreissen = () => {
		if (wurzel.dataset.kinoSzene === "saal") return;
		merkeGesehen(slug);

		if (wenigerBewegung()) {
			wurzel.dataset.kinoRiss = "fertig";
			betreteSaal(wurzel, true);
			return;
		}

		wurzel.dataset.kinoRiss = "laeuft";
		// 1,6 s: Streifen reißt und fällt, Rest zoomt weg, Bild wird schwarz.
		const t = window.setTimeout(() => {
			wurzel.dataset.kinoRiss = "fertig";
			betreteSaal(wurzel, false);
		}, 1600);
		aufraeumen.push(() => window.clearTimeout(t));
	};

	knopf.addEventListener("click", abreissen);
	aufraeumen.push(() => knopf.removeEventListener("click", abreissen));
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
		// Kein Autoscroll: Der Brief steht still auf der Leinwand und ist
		// ganz normal lesbar.
		wurzel.dataset.kinoVorspann = "statisch";
		return;
	}

	// Pausieren, solange der Zeiger über der Leinwand liegt bzw. getippt wird.
	const ziel = leinwand ?? rolle;
	const an = () => rolle.style.setProperty("animation-play-state", "paused");
	const aus = () => rolle.style.setProperty("animation-play-state", "running");
	const umschalten = () => {
		const pausiert = rolle.style.animationPlayState === "paused";
		rolle.style.setProperty("animation-play-state", pausiert ? "running" : "paused");
	};

	ziel.addEventListener("mouseenter", an);
	ziel.addEventListener("mouseleave", aus);
	ziel.addEventListener("click", umschalten);
	aufraeumen.push(() => {
		ziel.removeEventListener("mouseenter", an);
		ziel.removeEventListener("mouseleave", aus);
		ziel.removeEventListener("click", umschalten);
	});

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

	const zu = () => {
		overlay.dataset.offen = "false";
		overlay.setAttribute("aria-hidden", "true");
		rahmen.removeAttribute("src");
		zuletztFokussiert?.focus();
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
