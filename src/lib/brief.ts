// Reine Funktionen für die persönlichen Briefe (/fuer/[slug]).
//
// Bewusst ohne Astro-Abhängigkeiten, damit sich Anrede, Textwahl und
// Projektauflösung mit vitest prüfen lassen – so wie projects.ts und video.ts.

import type { Brief } from "../data/briefe";
import { BRIEF_TEXTE, MAX_FILME, STANDARD_PROJEKTE } from "../data/brief-texte";

/** "du" oder "sie" – als Schlüssel für die Textfassungen. */
export type Fassung = Brief["anrede"];

const MONATE = [
	"Januar",
	"Februar",
	"März",
	"April",
	"Mai",
	"Juni",
	"Juli",
	"August",
	"September",
	"Oktober",
	"November",
	"Dezember",
];

/**
 * Zeitmarken der Briefabsätze. Bewusst keine gleichmäßigen Abstände: Ein Film
 * hat auch keine Kapitel im Sekundentakt, und die unregelmäßige Folge wirkt
 * wie aus einem echten Schnittprogramm abgelesen.
 */
const TIMECODE_SEKUNDEN = [4, 12, 31, 47, 68, 95, 124, 158, 193, 231];

/** Verlängert die Folge gleichmäßig, falls ein Brief mehr Absätze hat. */
const TIMECODE_SCHRITT = 38;

/** Anrede über dem Brief, inklusive Komma. */
export function anredeZeile(brief: Brief): string {
	if (brief.anrede === "du") return `Hallo ${brief.vorname},`;

	const mitTitel = [brief.titel, brief.nachname].filter(Boolean).join(" ");
	if (brief.geschlecht === "w") return `Liebe Frau ${mitTitel},`;
	if (brief.geschlecht === "m") return `Lieber Herr ${mitTitel},`;
	return `Guten Tag ${brief.vorname} ${brief.nachname},`;
}

/** Titelkarte im Vorspann – kurz gehalten, wie ein Filmtitel. */
export function vorspannTitel(brief: Brief): string {
	if (brief.anrede === "du") return `Für ${brief.vorname}`;
	if (brief.geschlecht === "w") return `Für Frau ${brief.nachname}`;
	if (brief.geschlecht === "m") return `Für Herrn ${brief.nachname}`;
	return `Für ${brief.vorname} ${brief.nachname}`;
}

/** Titel der Link-Vorschau in Mail und WhatsApp. */
export function ogTitel(brief: Brief): string {
	if (brief.anrede === "du") return `Ein paar Filme für ${brief.vorname}`;
	if (brief.geschlecht === "w") return `Ein paar Filme für Sie, Frau ${brief.nachname}`;
	if (brief.geschlecht === "m") return `Ein paar Filme für Sie, Herr ${brief.nachname}`;
	return `Ein paar Filme für Sie, ${brief.vorname} ${brief.nachname}`;
}

/**
 * Alle Absätze des Briefs in Reihenfolge: Einstieg, persönlicher Teil,
 * Überleitung zu den Filmen. Anrede und Schluss stehen getrennt, weil sie
 * gestalterisch anders behandelt werden.
 */
export function briefAbsaetze(brief: Brief): string[] {
	const persoenlich = brief.persoenlicherAbsatz
		? Array.isArray(brief.persoenlicherAbsatz)
			? brief.persoenlicherAbsatz
			: [brief.persoenlicherAbsatz]
		: [];

	return [
		...BRIEF_TEXTE.einstieg[brief.anrede],
		...persoenlich,
		BRIEF_TEXTE.ueberleitung[brief.anrede],
	];
}

/** Sekunden in "00:01:35". Stunden bleiben zweistellig, wie im Schnittprogramm. */
export function formatTimecode(sekunden: number): string {
	const h = Math.floor(sekunden / 3600);
	const m = Math.floor((sekunden % 3600) / 60);
	const s = sekunden % 60;
	return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

/** Zeitmarke für den n-ten Absatz (nullbasiert). */
export function timecode(index: number): string {
	const letzter = TIMECODE_SEKUNDEN[TIMECODE_SEKUNDEN.length - 1];
	const sekunden =
		index < TIMECODE_SEKUNDEN.length
			? TIMECODE_SEKUNDEN[index]
			: letzter + (index - TIMECODE_SEKUNDEN.length + 1) * TIMECODE_SCHRITT;
	return formatTimecode(sekunden);
}

/** "Salzburg, im November 2026" – Ortsangabe wie auf einem Briefkopf. */
export function ortUndDatum(datum: Date): string {
	return `Salzburg, im ${MONATE[datum.getMonth()]} ${datum.getFullYear()}`;
}

/**
 * Löst die Projektauswahl eines Briefs gegen die vorhandenen Projekte auf.
 *
 * Die beiden Fälle werden absichtlich unterschiedlich streng behandelt:
 * Eine ausdrücklich hinterlegte ID ist eine Zusage an eine bestimmte Person –
 * ein Tippfehler soll den Build abbrechen statt still eine Karte zu schlucken.
 * Die Standardauswahl dagegen überdauert das Löschen einzelner Projekte und
 * überspringt deshalb, was es nicht mehr gibt.
 */
export function waehleProjekte<T extends { id: string }>(
	brief: Brief,
	alleProjekte: T[],
): { projekt: T; notiz?: string }[] {
	const finde = (id: string) => alleProjekte.find((p) => p.id === id);

	if (brief.projekte?.length) {
		return brief.projekte.slice(0, MAX_FILME).map((eintrag) => {
			const projekt = finde(eintrag.id);
			if (!projekt) {
				throw new Error(
					`Brief "${brief.slug}": Das Projekt "${eintrag.id}" gibt es nicht. ` +
						`Vorhanden: ${alleProjekte.map((p) => p.id).join(", ")}`,
				);
			}
			return { projekt, notiz: eintrag.notiz };
		});
	}

	const standard = STANDARD_PROJEKTE.map(finde).filter(
		(p): p is T => p !== undefined,
	);
	if (standard.length === 0) {
		throw new Error(
			`Brief "${brief.slug}": Keines der Standardprojekte (${STANDARD_PROJEKTE.join(", ")}) ` +
				"existiert noch. Bitte STANDARD_PROJEKTE in src/data/brief-texte.ts anpassen.",
		);
	}
	return standard.slice(0, MAX_FILME).map((projekt) => ({ projekt }));
}

/** Betreffzeile der Antwortmail, damit Gabriel die Zuordnung sofort sieht. */
export function mailBetreff(brief: Brief): string {
	const name = [brief.vorname, brief.nachname].filter(Boolean).join(" ");
	return `Rückmeldung zum Brief – ${name}`;
}
