// Die Figur, die neben dem Besucher sitzt und gelegentlich etwas sagt.
//
// Der Grat ist schmal: Ein Freund im Kino, der ab und zu etwas murmelt, ist
// nett – einer, der dauernd redet, ist eine Zumutung. Deshalb stehen die
// Grenzen hier hart im Code und nicht in der Gestaltung:
//
//   * höchstens eine Blase gleichzeitig
//   * nach fünf Sekunden verschwindet sie von selbst, mit × sofort
//   * nie, solange eine Vorführung läuft
//   * höchstens sechs Kommentare pro Besuch
//   * ein Klick auf die Figur schickt sie dauerhaft ins Ruhe-Eck
//
// Was gesagt wird, steht nicht hier, sondern als data-figur-sagt im Markup –
// so bleiben alle Texte in screening-texte.ts.

const STUMM_SCHLUESSEL = "tf-screening-figur-stumm";

export interface FigurOptionen {
	maxKommentare: number;
	dauerMs: number;
	wenigerBewegung: boolean;
}

export interface FigurSteuerung {
	sage: (text: string) => void;
	aufraeumen: () => void;
}

function istStumm(): boolean {
	try {
		return localStorage.getItem(STUMM_SCHLUESSEL) === "ja";
	} catch {
		return false;
	}
}

function merkeStumm(stumm: boolean): void {
	try {
		if (stumm) localStorage.setItem(STUMM_SCHLUESSEL, "ja");
		else localStorage.removeItem(STUMM_SCHLUESSEL);
	} catch {
		/* Kein Speicher – dann gilt es eben nur für diesen Besuch. */
	}
}

export function initFigur(
	wurzel: HTMLElement,
	optionen: FigurOptionen,
): FigurSteuerung | undefined {
	const figur = wurzel.querySelector<HTMLElement>("[data-figur]");
	const blase = wurzel.querySelector<HTMLElement>("[data-figur-blase]");
	const textFeld = wurzel.querySelector<HTMLElement>("[data-figur-text]");
	const knopf = wurzel.querySelector<HTMLButtonElement>("[data-figur-knopf]");
	const zuKnopf = wurzel.querySelector<HTMLButtonElement>("[data-figur-zu]");
	if (!figur || !blase || !textFeld || !knopf) return undefined;

	let gesagt = 0;
	let versteckTimer = 0;
	let stumm = istStumm();
	figur.dataset.stumm = stumm ? "true" : "false";

	const verstecke = () => {
		window.clearTimeout(versteckTimer);
		blase.dataset.offen = "false";
		blase.setAttribute("aria-hidden", "true");
	};

	const sage = (text: string) => {
		if (stumm || !text) return;
		if (gesagt >= optionen.maxKommentare) return;
		// Nie über einer laufenden Vorführung.
		if (wurzel.querySelector('[data-vorfuehrung][data-offen="true"]')) return;

		gesagt += 1;
		textFeld.textContent = text;
		blase.dataset.offen = "true";
		blase.setAttribute("aria-hidden", "false");

		window.clearTimeout(versteckTimer);
		versteckTimer = window.setTimeout(verstecke, optionen.dauerMs);
	};

	const umschalten = () => {
		stumm = !stumm;
		merkeStumm(stumm);
		figur.dataset.stumm = stumm ? "true" : "false";
		knopf.setAttribute("aria-pressed", stumm ? "true" : "false");
		if (stumm) verstecke();
	};

	knopf.addEventListener("click", umschalten);
	zuKnopf?.addEventListener("click", verstecke);

	// Alles mit data-figur-sagt meldet sich, sobald es ins Bild scrollt.
	const beobachter = new IntersectionObserver(
		(eintraege) => {
			for (const e of eintraege) {
				if (!e.isIntersecting) continue;
				const el = e.target as HTMLElement;
				beobachter.unobserve(el);
				sage(el.dataset.figurSagt ?? "");
			}
		},
		{ rootMargin: "0px 0px -25% 0px", threshold: 0 },
	);

	for (const el of wurzel.querySelectorAll<HTMLElement>("[data-figur-sagt]")) {
		beobachter.observe(el);
	}

	return {
		sage,
		aufraeumen: () => {
			window.clearTimeout(versteckTimer);
			beobachter.disconnect();
			knopf.removeEventListener("click", umschalten);
			zuKnopf?.removeEventListener("click", verstecke);
		},
	};
}
