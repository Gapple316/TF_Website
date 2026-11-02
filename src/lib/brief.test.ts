import { describe, it, expect } from "vitest";
import type { Brief } from "../data/briefe";
import { BRIEF_TEXTE, MAX_FILME, STANDARD_PROJEKTE } from "../data/brief-texte";
import {
	anredeZeile,
	briefAbsaetze,
	formatTimecode,
	mailBetreff,
	ogTitel,
	ortUndDatum,
	timecode,
	vorspannTitel,
	waehleProjekte,
} from "./brief";

const brief = (over: Partial<Brief> = {}): Brief => ({
	slug: "test-ab12",
	anrede: "du",
	geschlecht: "neutral",
	vorname: "Maria",
	nachname: "Huber",
	...over,
});

const projekt = (id: string) => ({ id });

describe("anredeZeile", () => {
	it("duzt mit Vornamen", () => {
		expect(anredeZeile(brief({ anrede: "du" }))).toBe("Hallo Maria,");
	});

	it("siezt Frauen mit Nachnamen", () => {
		expect(anredeZeile(brief({ anrede: "sie", geschlecht: "w" }))).toBe("Liebe Frau Huber,");
	});

	it("siezt Männer mit Nachnamen", () => {
		expect(anredeZeile(brief({ anrede: "sie", geschlecht: "m" }))).toBe("Lieber Herr Huber,");
	});

	it("schiebt den Titel zwischen Anrede und Nachnamen", () => {
		expect(anredeZeile(brief({ anrede: "sie", geschlecht: "w", titel: "Dr." }))).toBe(
			"Liebe Frau Dr. Huber,",
		);
	});

	it("weicht ohne Geschlechtsangabe auf Guten Tag aus", () => {
		expect(anredeZeile(brief({ anrede: "sie", geschlecht: "neutral" }))).toBe(
			"Guten Tag Maria Huber,",
		);
	});
});

describe("vorspannTitel", () => {
	it("nennt beim Du nur den Vornamen", () => {
		expect(vorspannTitel(brief({ anrede: "du" }))).toBe("Für Maria");
	});

	it("nennt beim Sie Anrede und Nachnamen", () => {
		expect(vorspannTitel(brief({ anrede: "sie", geschlecht: "w" }))).toBe("Für Frau Huber");
		// Dativ: "Für Herrn", nicht "Für Herr".
		expect(vorspannTitel(brief({ anrede: "sie", geschlecht: "m" }))).toBe("Für Herrn Huber");
	});

	it("nennt neutral den vollen Namen", () => {
		expect(vorspannTitel(brief({ anrede: "sie", geschlecht: "neutral" }))).toBe(
			"Für Maria Huber",
		);
	});
});

describe("ogTitel", () => {
	it("duzt mit Vornamen", () => {
		expect(ogTitel(brief({ anrede: "du" }))).toBe("Ein paar Filme für Maria");
	});

	it("siezt mit Anrede und Nachnamen", () => {
		expect(ogTitel(brief({ anrede: "sie", geschlecht: "m" }))).toBe(
			"Ein paar Filme für Sie, Herr Huber",
		);
	});
});

describe("briefAbsaetze", () => {
	it("reiht Einstieg, persönlichen Teil und Überleitung aneinander", () => {
		const absaetze = briefAbsaetze(
			brief({ anrede: "du", persoenlicherAbsatz: "Mein persönlicher Satz." }),
		);

		expect(absaetze[0]).toBe(BRIEF_TEXTE.einstieg.du[0]);
		expect(absaetze).toContain("Mein persönlicher Satz.");
		expect(absaetze[absaetze.length - 1]).toBe(BRIEF_TEXTE.ueberleitung.du);
	});

	it("nimmt mehrere persönliche Absätze als eigene Absätze auf", () => {
		const absaetze = briefAbsaetze(brief({ persoenlicherAbsatz: ["Eins.", "Zwei."] }));
		expect(absaetze).toContain("Eins.");
		expect(absaetze).toContain("Zwei.");
	});

	it("kommt ohne persönlichen Absatz aus", () => {
		const ohne = briefAbsaetze(brief());
		const mit = briefAbsaetze(brief({ persoenlicherAbsatz: "Dazu." }));
		expect(ohne.length).toBe(mit.length - 1);
	});

	it("wählt die Sie-Fassung der Überleitung", () => {
		const absaetze = briefAbsaetze(brief({ anrede: "sie" }));
		expect(absaetze[absaetze.length - 1]).toBe(BRIEF_TEXTE.ueberleitung.sie);
	});
});

describe("timecode", () => {
	it("formatiert Sekunden als Stunden:Minuten:Sekunden", () => {
		expect(formatTimecode(4)).toBe("00:00:04");
		expect(formatTimecode(95)).toBe("00:01:35");
		expect(formatTimecode(3661)).toBe("01:01:01");
	});

	it("beginnt bei 00:00:04 und läuft aufwärts", () => {
		expect(timecode(0)).toBe("00:00:04");
		expect(timecode(1)).toBe("00:00:12");
		expect(timecode(2)).toBe("00:00:31");
	});

	it("läuft auch über die hinterlegte Folge hinaus weiter", () => {
		// Keine doppelten oder rückwärts laufenden Marken bei vielen Absätzen.
		const marken = Array.from({ length: 16 }, (_, i) => timecode(i));
		expect(new Set(marken).size).toBe(marken.length);
		expect(marken.every((m) => /^\d{2}:\d{2}:\d{2}$/.test(m))).toBe(true);
	});
});

describe("ortUndDatum", () => {
	it("nennt Monat und Jahr auf Deutsch", () => {
		expect(ortUndDatum(new Date(2026, 10, 2))).toBe("Salzburg, im November 2026");
		expect(ortUndDatum(new Date(2027, 0, 15))).toBe("Salzburg, im Januar 2027");
	});
});

describe("waehleProjekte", () => {
	const alle = [
		projekt("showreel"),
		projekt("wapotec-jubilaeumsfilm"),
		projekt("zeichen-der-vergangenheit"),
		projekt("die-wegewarter"),
		projekt("r9-instrumentenbau"),
	];

	it("nimmt die eigene Auswahl in der angegebenen Reihenfolge", () => {
		const gewaehlt = waehleProjekte(
			brief({ projekte: [{ id: "die-wegewarter" }, { id: "showreel" }] }),
			alle,
		);
		expect(gewaehlt.map((g) => g.projekt.id)).toEqual(["die-wegewarter", "showreel"]);
	});

	it("reicht die Notiz zum Projekt durch", () => {
		const gewaehlt = waehleProjekte(
			brief({ projekte: [{ id: "showreel", notiz: "Guter Einstieg." }] }),
			alle,
		);
		expect(gewaehlt[0].notiz).toBe("Guter Einstieg.");
	});

	it("fällt ohne Auswahl auf die Standardprojekte zurück", () => {
		expect(waehleProjekte(brief(), alle).map((g) => g.projekt.id)).toEqual(STANDARD_PROJEKTE);
		// Leeres Array zählt wie "nicht gesetzt".
		expect(waehleProjekte(brief({ projekte: [] }), alle).map((g) => g.projekt.id)).toEqual(
			STANDARD_PROJEKTE,
		);
	});

	it("bricht bei einer unbekannten ID ab, statt sie still zu schlucken", () => {
		expect(() => waehleProjekte(brief({ projekte: [{ id: "gibts-nicht" }] }), alle)).toThrow(
			/gibts-nicht/,
		);
	});

	it("überspringt gelöschte Projekte in der Standardauswahl", () => {
		const ohneShowreel = alle.filter((p) => p.id !== "showreel");
		const ids = waehleProjekte(brief(), ohneShowreel).map((g) => g.projekt.id);
		expect(ids).not.toContain("showreel");
		expect(ids.length).toBe(STANDARD_PROJEKTE.length - 1);
	});

	it("bricht ab, wenn gar kein Standardprojekt mehr existiert", () => {
		expect(() => waehleProjekte(brief(), [projekt("ganz-anderes")])).toThrow(
			/Standardprojekte/,
		);
	});

	it("zeigt nie mehr Filme als erlaubt", () => {
		const viele = Array.from({ length: 9 }, (_, i) => ({ id: `p${i}` }));
		const gewaehlt = waehleProjekte(
			brief({ projekte: viele.map((p) => ({ id: p.id })) }),
			viele,
		);
		expect(gewaehlt.length).toBe(MAX_FILME);
	});
});

describe("mailBetreff", () => {
	it("nennt den vollen Namen, damit die Zuordnung sofort klar ist", () => {
		expect(mailBetreff(brief())).toBe("Rückmeldung zum Brief – Maria Huber");
	});
});
