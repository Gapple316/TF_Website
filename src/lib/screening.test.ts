import { describe, it, expect } from "vitest";
import type { Screening } from "../data/screenings";
import {
	MAX_FILME,
	PROGRAMM,
	STANDARD_PROJEKTE,
	VORSPANN,
	ZIELGRUPPEN_ABSATZ,
} from "../data/screening-texte";
import {
	anredeZeile,
	genreStempel,
	kurzeAnrede,
	mailBetreff,
	ogTitel,
	programmText,
	ticketNummer,
	vollerName,
	vorspannAbsaetze,
	vorstellungsDatum,
	waehleProjekte,
	willkommenZurueck,
} from "./screening";

const s = (over: Partial<Screening> = {}): Screening => ({
	slug: "test-ab12",
	zielgruppe: "werbekunde",
	anrede: "du",
	geschlecht: "neutral",
	vorname: "Maria",
	nachname: "Huber",
	...over,
});

const projekt = (id: string) => ({ id });

describe("anredeZeile", () => {
	it("duzt mit Vornamen", () => {
		expect(anredeZeile(s({ anrede: "du" }))).toBe("Hallo Maria,");
	});

	it("siezt Frauen und Männer mit Nachnamen", () => {
		expect(anredeZeile(s({ anrede: "sie", geschlecht: "w" }))).toBe("Liebe Frau Huber,");
		expect(anredeZeile(s({ anrede: "sie", geschlecht: "m" }))).toBe("Lieber Herr Huber,");
	});

	it("schiebt den Titel zwischen Anrede und Nachnamen", () => {
		expect(anredeZeile(s({ anrede: "sie", geschlecht: "w", titel: "Dr." }))).toBe(
			"Liebe Frau Dr. Huber,",
		);
	});

	it("weicht ohne Geschlechtsangabe auf Guten Tag aus", () => {
		expect(anredeZeile(s({ anrede: "sie", geschlecht: "neutral" }))).toBe(
			"Guten Tag Maria Huber,",
		);
	});
});

describe("kurzeAnrede und willkommenZurueck", () => {
	it("nennt beim Du den Vornamen", () => {
		expect(kurzeAnrede(s({ anrede: "du" }))).toBe("Maria");
		expect(willkommenZurueck(s({ anrede: "du" }))).toBe("Willkommen zurück, Maria");
	});

	it("nennt beim Sie Anrede und Nachnamen", () => {
		expect(kurzeAnrede(s({ anrede: "sie", geschlecht: "m" }))).toBe("Herr Huber");
		expect(willkommenZurueck(s({ anrede: "sie", geschlecht: "w" }))).toBe(
			"Willkommen zurück, Frau Huber",
		);
	});
});

describe("ogTitel", () => {
	it("duzt mit Vornamen", () => {
		expect(ogTitel(s({ anrede: "du" }))).toBe("Ein Ticket für Maria");
	});

	it("siezt mit Anrede und Nachnamen", () => {
		expect(ogTitel(s({ anrede: "sie", geschlecht: "m" }))).toBe("Ihr Ticket, Herr Huber");
		expect(ogTitel(s({ anrede: "sie", geschlecht: "w" }))).toBe("Ihr Ticket, Frau Huber");
	});
});

describe("ticketNummer", () => {
	it("ist immer sechsstellig", () => {
		for (const slug of ["a", "maria-huber-x7k2", "vorlage", "x".repeat(80)]) {
			expect(ticketNummer(slug)).toMatch(/^\d{6}$/);
		}
	});

	it("liefert fuer denselben Slug immer dieselbe Nummer", () => {
		// Entscheidend: Ein bereits verschickter Link muss nach jedem Build
		// dieselbe Nummer auf Ticket und Kontrollabschnitt zeigen.
		expect(ticketNummer("maria-huber-x7k2")).toBe(ticketNummer("maria-huber-x7k2"));
	});

	it("unterscheidet verschiedene Slugs", () => {
		const nummern = ["maria-huber-x7k2", "dr-thomas-berger-m4q8", "lena-brandstaetter-q9f3", "vorlage"]
			.map(ticketNummer);
		expect(new Set(nummern).size).toBe(nummern.length);
	});
});

describe("vorstellungsDatum", () => {
	it("schreibt Wochentag, Tag, Monat und Jahr auf Deutsch", () => {
		// 2. November 2026 ist ein Montag.
		expect(vorstellungsDatum(new Date(2026, 10, 2))).toBe("Mo, 2. November 2026");
		expect(vorstellungsDatum(new Date(2027, 0, 1))).toBe("Fr, 1. Januar 2027");
	});
});

describe("programmText", () => {
	it("schreibt die Anzahl als Wort", () => {
		expect(programmText(1)).toBe("Ein Film");
		expect(programmText(2)).toBe("Zwei Filme");
		expect(programmText(3)).toBe("Drei Filme");
		expect(programmText(4)).toBe("Vier Filme");
	});

	it("nennt keine Minuten", () => {
		// Die gepflegten Laufzeiten stimmten nicht durchgehend – deshalb
		// steht auf dem Ticket bewusst eine Anzahl statt einer Dauer.
		expect(programmText(3)).not.toMatch(/min|:/i);
	});
});

describe("genreStempel", () => {
	it("uebersetzt die Kategorien", () => {
		expect(genreStempel("imagefilm")).toBe("IMAGEFILM");
		expect(genreStempel("doku")).toBe("DOKU");
		expect(genreStempel("news")).toBe("NEWS");
	});

	it("faellt ohne Kategorie auf SHOWREEL zurueck", () => {
		// Der Showreel-Eintrag hat keine Kategorie.
		expect(genreStempel(undefined)).toBe(PROGRAMM.stempelFallback);
		expect(genreStempel("gibts-nicht")).toBe(PROGRAMM.stempelFallback);
	});
});

describe("vorspannAbsaetze", () => {
	it("reiht Platzansage, Zielgruppe, persoenlichen Teil, Programm und Popcorn", () => {
		const a = vorspannAbsaetze(
			s({ anrede: "du", zielgruppe: "sender", persoenlicherAbsatz: "Mein Satz." }),
		);
		expect(a[0]).toBe(VORSPANN.platzGenommen.du);
		expect(a[1]).toBe(ZIELGRUPPEN_ABSATZ.sender.du);
		expect(a).toContain("Mein Satz.");
		expect(a[a.length - 1]).toBe(VORSPANN.popcorn.du);
	});

	it("waehlt den Zielgruppen-Absatz passend aus", () => {
		for (const zg of ["werbekunde", "produktion", "sender"] as const) {
			expect(vorspannAbsaetze(s({ zielgruppe: zg }))[1]).toBe(ZIELGRUPPEN_ABSATZ[zg].du);
		}
	});

	it("nimmt die Sie-Fassung, wenn gesiezt wird", () => {
		const a = vorspannAbsaetze(s({ anrede: "sie" }));
		expect(a[0]).toBe(VORSPANN.platzGenommen.sie);
		expect(a[0]).toContain("Sie Platz genommen haben");
	});

	it("kommt ohne persoenlichen Absatz aus", () => {
		const ohne = vorspannAbsaetze(s());
		const mit = vorspannAbsaetze(s({ persoenlicherAbsatz: "Dazu." }));
		expect(ohne.length).toBe(mit.length - 1);
	});

	it("nimmt mehrere persoenliche Absaetze als eigene Absaetze auf", () => {
		const a = vorspannAbsaetze(s({ persoenlicherAbsatz: ["Eins.", "Zwei."] }));
		expect(a).toContain("Eins.");
		expect(a).toContain("Zwei.");
	});
});

describe("Sie-Fassung ist neu formuliert, nicht nur ersetzt", () => {
	it("schreibt im Sie aus, wo das Du verkuerzt", () => {
		expect(VORSPANN.platzGenommen.du).toContain("hab ich");
		expect(VORSPANN.platzGenommen.sie).toContain("habe ich");
		expect(ZIELGRUPPEN_ABSATZ.produktion.du).toContain("gibt's");
		expect(ZIELGRUPPEN_ABSATZ.produktion.sie).toContain("gibt es");
	});

	it("enthaelt in der Sie-Fassung keine Du-Anreden", () => {
		const sieTexte = [
			VORSPANN.platzGenommen.sie,
			VORSPANN.programmAnkuendigung.sie,
			VORSPANN.popcorn.sie,
			PROGRAMM.ueberleitung.sie,
			PROGRAMM.notizLabel.sie,
			...Object.values(ZIELGRUPPEN_ABSATZ).map((z) => z.sie),
		];
		for (const t of sieTexte) {
			expect(t).not.toMatch(/\b(du|dich|dir|dein|deine)\b/i);
		}
	});
});

describe("waehleProjekte", () => {
	const alle = [
		projekt("wapotec-jubilaeumsfilm"),
		projekt("clear-amine"),
		projekt("showreel"),
		projekt("zeichen-der-vergangenheit"),
		projekt("die-wegewarter"),
		projekt("illegale-e-scooter"),
		projekt("borkenkaefer-salzburg"),
		projekt("r9-instrumentenbau"),
	];

	it("nimmt die eigene Auswahl in der angegebenen Reihenfolge", () => {
		const g = waehleProjekte(
			s({ projekte: [{ id: "die-wegewarter" }, { id: "showreel" }] }),
			alle,
		);
		expect(g.map((x) => x.projekt.id)).toEqual(["die-wegewarter", "showreel"]);
	});

	it("reicht die Notiz durch", () => {
		const g = waehleProjekte(s({ projekte: [{ id: "showreel", notiz: "Guter Einstieg." }] }), alle);
		expect(g[0].notiz).toBe("Guter Einstieg.");
	});

	it("waehlt ohne Auswahl nach Zielgruppe", () => {
		for (const zg of ["werbekunde", "produktion", "sender"] as const) {
			expect(waehleProjekte(s({ zielgruppe: zg }), alle).map((x) => x.projekt.id)).toEqual(
				STANDARD_PROJEKTE[zg],
			);
		}
	});

	it("behandelt ein leeres Array wie nicht gesetzt", () => {
		expect(waehleProjekte(s({ projekte: [] }), alle).map((x) => x.projekt.id)).toEqual(
			STANDARD_PROJEKTE.werbekunde,
		);
	});

	it("bricht bei einer unbekannten ID ab, statt sie still zu schlucken", () => {
		expect(() => waehleProjekte(s({ projekte: [{ id: "gibts-nicht" }] }), alle)).toThrow(
			/gibts-nicht/,
		);
	});

	it("ueberspringt geloeschte Projekte in der Standardauswahl", () => {
		const ohneShowreel = alle.filter((p) => p.id !== "showreel");
		const ids = waehleProjekte(s({ zielgruppe: "werbekunde" }), ohneShowreel).map(
			(x) => x.projekt.id,
		);
		expect(ids).not.toContain("showreel");
		expect(ids.length).toBe(STANDARD_PROJEKTE.werbekunde.length - 1);
	});

	it("bricht ab, wenn gar kein Standardprojekt mehr existiert", () => {
		expect(() => waehleProjekte(s(), [projekt("ganz-anderes")])).toThrow(/Standardprojekte/);
	});

	it("zeigt nie mehr Filme als erlaubt", () => {
		const viele = Array.from({ length: 9 }, (_, i) => ({ id: `p${i}` }));
		expect(waehleProjekte(s({ projekte: viele }), viele).length).toBe(MAX_FILME);
	});
});

describe("Hilfsangaben", () => {
	it("setzt den vollen Namen zusammen", () => {
		expect(vollerName(s())).toBe("Maria Huber");
	});

	it("nennt im Mailbetreff den vollen Namen", () => {
		expect(mailBetreff(s())).toBe("Nächste Vorstellung – Maria Huber");
	});
});
