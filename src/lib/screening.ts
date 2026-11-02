// Reine Funktionen für die Private Screenings (/screening/[slug]).
//
// Bewusst ohne Astro-Abhängigkeiten, damit sich Anrede, Textwahl,
// Projektauswahl und Ticketnummer mit vitest prüfen lassen – so wie
// projects.ts und video.ts.

import type { Screening } from "../data/screenings";
import {
	MAX_FILME,
	PROGRAMM,
	STANDARD_PROJEKTE,
	VORSPANN,
	ZIELGRUPPEN_ABSATZ,
} from "../data/screening-texte";

const MONATE = [
	"Januar", "Februar", "März", "April", "Mai", "Juni",
	"Juli", "August", "September", "Oktober", "November", "Dezember",
];

const WOCHENTAGE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const ZAHLWOERTER = ["null", "Ein", "Zwei", "Drei", "Vier", "Fünf", "Sechs"];

/** Anrede über dem Vorspanntext, inklusive Komma. */
export function anredeZeile(s: Screening): string {
	if (s.anrede === "du") return `Hallo ${s.vorname},`;

	const mitTitel = [s.titel, s.nachname].filter(Boolean).join(" ");
	if (s.geschlecht === "w") return `Liebe Frau ${mitTitel},`;
	if (s.geschlecht === "m") return `Lieber Herr ${mitTitel},`;
	return `Guten Tag ${s.vorname} ${s.nachname},`;
}

/** Voller Name, wie er auf dem Ticket und im Vorspann steht. */
export function vollerName(s: Screening): string {
	return [s.vorname, s.nachname].filter(Boolean).join(" ");
}

/** Kurze Anrede ohne "Hallo"/"Liebe" – für "Willkommen zurück, …". */
export function kurzeAnrede(s: Screening): string {
	if (s.anrede === "du") return s.vorname;
	if (s.geschlecht === "w") return `Frau ${s.nachname}`;
	if (s.geschlecht === "m") return `Herr ${s.nachname}`;
	return vollerName(s);
}

/** "Willkommen zurück, Maria" bzw. "…, Frau Huber". */
/** Titel der Link-Vorschau in Mail und WhatsApp. */
export function ogTitel(s: Screening): string {
	if (s.anrede === "du") return `Ein Ticket für ${s.vorname}`;
	return `Ihr Ticket, ${kurzeAnrede(s)}`;
}

/**
 * Sechsstellige Ticketnummer, fest aus dem Slug abgeleitet.
 *
 * Muss deterministisch sein: Dieselbe Person bekommt bei jedem Build dieselbe
 * Nummer, sonst stimmt der Kontrollabschnitt auf einem bereits verschickten
 * Link nicht mehr mit dem Ticket überein. Deshalb kein Zufall, sondern ein
 * einfacher Hash über die Zeichen des Slugs.
 */
export function ticketNummer(slug: string): string {
	let h = 2166136261;
	for (let i = 0; i < slug.length; i++) {
		h ^= slug.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	// Auf 100000..999999 bringen, damit es immer sechsstellig ist.
	return String(100000 + (Math.abs(h) % 900000));
}

/**
 * Zufallsgenerator mit festem Startwert. Gleicher Startwert, gleiche Folge –
 * gebraucht für die Risskante, damit ein Ticket bei jedem Build identisch
 * reißt und die beiden Hälften zusammenpassen.
 */
function wuerfelAus(startwert: number): () => number {
	let z = startwert >>> 0;
	return () => {
		// xorshift32: kurz, schnell, für Gestaltungszwecke völlig ausreichend.
		z ^= z << 13;
		z ^= z >>> 17;
		z ^= z << 5;
		z >>>= 0;
		return z / 4294967296;
	};
}

function hashe(text: string): number {
	let h = 2166136261;
	for (let i = 0; i < text.length; i++) {
		h ^= text.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}

/** Breite der Risszone in Pixeln – so weit franst das Papier aus. */
export const RISS_ZONE = 9;

/** Anzahl der Zacken über die Ticket-Höhe. */
const RISS_ZACKEN = 26;

/**
 * Zwei zueinander passende clip-path-Angaben für den Riss.
 *
 * Der Riss verläuft entlang der Perforation. Für jede Zacke i wird ein
 * Versatz a(i) zwischen 0 und RISS_ZONE gewürfelt:
 *
 *   Hauptteil  endet rechts bei  100% - a(i)
 *   Abriss     beginnt links bei RISS_ZONE - a(i)
 *
 * Weil der Abrissstreifen um RISS_ZONE nach links verbreitert ist, ergeben
 * beide Kanten zusammen genau die Papierbreite – die Zacken greifen also
 * ineinander statt sich zu überlappen oder eine Lücke zu lassen.
 */
export function risskante(slug: string): { haupt: string; abriss: string } {
	const wuerfel = wuerfelAus(hashe(slug) || 1);

	const versatz = Array.from({ length: RISS_ZACKEN + 1 }, (_, i) => {
		// Oben und unten sauber abschließen, sonst steht eine Ecke über.
		if (i === 0 || i === RISS_ZACKEN) return RISS_ZONE / 2;
		return Math.round(wuerfel() * RISS_ZONE * 10) / 10;
	});

	const y = (i: number) => `${Math.round((i / RISS_ZACKEN) * 1000) / 10}%`;

	const hauptKante = versatz.map((a, i) => `calc(100% - ${a}px) ${y(i)}`);
	const abrissKante = versatz.map((a, i) => `${Math.round((RISS_ZONE - a) * 10) / 10}px ${y(i)}`);

	return {
		haupt: `polygon(0% 0%, ${hauptKante.join(", ")}, 0% 100%)`,
		// Von unten nach oben, damit der Umriss im Uhrzeigersinn geschlossen bleibt.
		abriss: `polygon(100% 0%, 100% 100%, ${[...abrissKante].reverse().join(", ")})`,
	};
}

/** "Mo, 2. November 2026" – Datum der Vorstellung auf dem Ticket. */
export function vorstellungsDatum(d: Date): string {
	return `${WOCHENTAGE[d.getDay()]}, ${d.getDate()}. ${MONATE[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * "Drei Filme" – steht auf dem Ticket an der Stelle, an der sonst die
 * Spieldauer stünde. Bewusst ohne Minutenangabe: Die gepflegten Laufzeiten
 * stimmten nicht durchgehend, und eine falsche Zahl ist schlechter als keine.
 */
export function programmText(anzahl: number): string {
	const wort = ZAHLWOERTER[anzahl] ?? String(anzahl);
	return anzahl === 1 ? `${wort} Film` : `${wort} Filme`;
}

/** Genre-Stempel auf dem Programmzettel. */
export function genreStempel(category?: string): string {
	return (category && PROGRAMM.stempel[category]) || PROGRAMM.stempelFallback;
}

/**
 * Die Absätze, die über die Leinwand rollen – ohne Kopfzeilen und ohne
 * Anrede, die stehen gestalterisch getrennt davor.
 */
export function vorspannAbsaetze(s: Screening): string[] {
	const persoenlich = s.persoenlicherAbsatz
		? Array.isArray(s.persoenlicherAbsatz)
			? s.persoenlicherAbsatz
			: [s.persoenlicherAbsatz]
		: [];

	return [
		VORSPANN.platzGenommen[s.anrede],
		ZIELGRUPPEN_ABSATZ[s.zielgruppe][s.anrede],
		...persoenlich,
		VORSPANN.programmAnkuendigung[s.anrede],
		VORSPANN.popcorn[s.anrede],
	];
}

/**
 * Löst die Projektauswahl gegen die vorhandenen Projekte auf.
 *
 * Eine ausdrücklich hinterlegte ID ist eine Zusage an eine bestimmte Person –
 * ein Tippfehler soll den Build abbrechen statt still eine Karte zu schlucken.
 * Die Standardauswahl dagegen überdauert das Löschen einzelner Projekte und
 * überspringt deshalb, was es nicht mehr gibt.
 */
export function waehleProjekte<T extends { id: string }>(
	s: Screening,
	alleProjekte: T[],
): { projekt: T; notiz?: string }[] {
	const finde = (id: string) => alleProjekte.find((p) => p.id === id);

	if (s.projekte?.length) {
		return s.projekte.slice(0, MAX_FILME).map((eintrag) => {
			const projekt = finde(eintrag.id);
			if (!projekt) {
				throw new Error(
					`Screening "${s.slug}": Das Projekt "${eintrag.id}" gibt es nicht. ` +
						`Vorhanden: ${alleProjekte.map((p) => p.id).join(", ")}`,
				);
			}
			return { projekt, notiz: eintrag.notiz };
		});
	}

	const standard = STANDARD_PROJEKTE[s.zielgruppe]
		.map(finde)
		.filter((p): p is T => p !== undefined);

	if (standard.length === 0) {
		throw new Error(
			`Screening "${s.slug}": Keines der Standardprojekte für "${s.zielgruppe}" ` +
				`(${STANDARD_PROJEKTE[s.zielgruppe].join(", ")}) existiert noch. ` +
				"Bitte STANDARD_PROJEKTE in src/data/screening-texte.ts anpassen.",
		);
	}
	return standard.slice(0, MAX_FILME).map((projekt) => ({ projekt }));
}

/** Betreffzeile der Antwortmail, damit die Zuordnung sofort klar ist. */
export function mailBetreff(s: Screening): string {
	return `Nächste Vorstellung – ${vollerName(s)}`;
}
