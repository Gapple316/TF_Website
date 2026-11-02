// Empfänger:innen der Private Screenings unter /screening/[slug].
//
// NEUES SCREENING: Eintrag kopieren, Slug mit Zufallssuffix vergeben, Felder
// ausfüllen, fertig. Die Seite entsteht beim nächsten Build von selbst.
//
// Das Zufallssuffix (die vier Zeichen hinten) ist der einzige Schutz davor,
// dass jemand fremde Screenings durch Raten findet – also bitte nicht
// weglassen und nicht durchnummerieren. Am einfachsten im Terminal:
//
//   node -e "console.log(Math.random().toString(36).slice(2,6))"
//
// Alle Texte stehen in screening-texte.ts, nicht hier.

import type { Zielgruppe } from "./screening-texte";

export interface ScreeningProjekt {
	/** Dateiname unter src/content/projects ohne .md, z.B. "die-wegewarter". */
	id: string;
	/** Ein persönlicher Satz, warum gerade dieser Film gezeigt wird. */
	notiz?: string;
}

export interface Screening {
	slug: string;
	/** Steuert Zielgruppen-Absatz im Vorspann, Standardauswahl und Szene 5. */
	zielgruppe: Zielgruppe;
	anrede: "du" | "sie";
	/** Steuert "Liebe Frau" / "Lieber Herr" / "Guten Tag". */
	geschlecht: "w" | "m" | "neutral";
	vorname: string;
	nachname: string;
	titel?: string;
	firma?: string;
	/** Wird im Vorspann nach dem Zielgruppen-Absatz eingefügt. */
	persoenlicherAbsatz?: string | string[];
	/** Leer oder weggelassen → Standardauswahl der Zielgruppe. */
	projekte?: ScreeningProjekt[];
	/** Ersetzt das Standard-P.S. in der Post-Credits-Szene vollständig. */
	ps?: string;
}

export const screenings: Screening[] = [
	// Vorschauseite: alle Felder befüllt, damit sich jede Gestaltungs-
	// entscheidung an einem Beispiel prüfen lässt.
	{
		slug: "vorlage",
		zielgruppe: "werbekunde",
		anrede: "du",
		geschlecht: "neutral",
		vorname: "Vorname",
		nachname: "Nachname",
		firma: "Beispiel GmbH",
		persoenlicherAbsatz: [
			"Hier steht der persönliche Absatz, der Teil, der diese Vorstellung von jeder anderen unterscheidet. Zwei, drei Sätze darüber, woher man sich kennt, was das Unternehmen gerade beschäftigt oder warum ich glaube, dass wir zusammenpassen.",
			"Ein zweiter Absatz ist möglich, wenn es mehr zu sagen gibt.",
		],
		projekte: [
			{ id: "wapotec-jubilaeumsfilm", notiz: "Hier steht eine Notiz: warum genau dieser Film zu dieser Person passt." },
			{ id: "showreel", notiz: "Der schnellste Überblick, eineinhalb Minuten quer durch alles." },
			{ id: "zeichen-der-vergangenheit" },
		],
	},

	// Werbekunde, Du-Form, eigene Auswahl mit Notizen.
	{
		slug: "maria-huber-x7k2",
		zielgruppe: "werbekunde",
		anrede: "du",
		geschlecht: "w",
		vorname: "Maria",
		nachname: "Huber",
		firma: "Huber Bau GmbH",
		persoenlicherAbsatz:
			"Nach unserem Gespräch auf der Baustelle in Mattsee ist mir der Satz hängengeblieben, dass euch niemand glaubt, wie viel Handarbeit in einem Rohbau steckt. Genau solche Sachen lassen sich filmisch zeigen. Man muss nur lange genug danebenstehen, bis die Leute die Kamera vergessen.",
		projekte: [
			{
				id: "wapotec-jubilaeumsfilm",
				notiz: "Auch ein Familienbetrieb, auch ein Jubiläum, und niemand musste einen Text aufsagen.",
			},
			{
				id: "r9-instrumentenbau",
				notiz: "Das hier kommt eurem Thema am nächsten: Handwerk, Werkstatt, Hände.",
			},
			{
				id: "die-wegewarter",
				notiz: "Für den Fall, dass ihr irgendwann etwas Längeres wollt.",
			},
		],
	},

	// Produktionsfirma, Sie-Form, ohne eigene Auswahl.
	{
		slug: "dr-thomas-berger-m4q8",
		zielgruppe: "produktion",
		anrede: "sie",
		geschlecht: "m",
		titel: "Dr.",
		vorname: "Thomas",
		nachname: "Berger",
		firma: "Berger Film",
		persoenlicherAbsatz:
			"Sie haben erwähnt, dass Sie für die nächste Doku-Reihe jemanden suchen, der auch allein losziehen kann. Genau so habe ich die letzten Jahre gearbeitet, mit dem Vorteil, dass am Schnittplatz niemand erst erklären muss, warum eine Einstellung fehlt.",
	},

	// Peter Wildling – echtes Screening, vier eigene Filme mit Notizen.
	{
		slug: "peter-wildling-yfo2",
		zielgruppe: "produktion",
		anrede: "du",
		geschlecht: "m",
		vorname: "Peter",
		nachname: "Wildling",
		persoenlicherAbsatz: [
			"Vor unserem ersten Telefonat lag in der Redaktionssitzung beim RTS der SN-Artikel über euer neues Doku-Projekt auf dem Tisch. Da musste ich die Gelegenheit einfach nutzen.",
			"Unser Nachrichtenbeitrag hat sich aufs Frühjahr verschoben, darauf freue ich mich trotzdem. Bis dahin vier Produktionen, die ich für euch ausgesucht habe.",
		],
		projekte: [
			{
				id: "r9-instrumentenbau",
				notiz: "Zwei Drehtage, allein unterwegs, und eine meiner liebsten Geschichten.",
			},
			{
				id: "zeichen-der-vergangenheit",
				notiz: "Hier bin ich zum ersten Mal kreativer mit dem Ton umgegangen. Ein Drehtag, wieder allein.",
			},
			{
				id: "die-wegewarter",
				notiz: "Noch bei RTS entstanden, mit altem Equipment. Die Geschichte mag ich trotzdem, wegen der alten Typen.",
			},
			{
				id: "wapotec-jubilaeumsfilm",
				notiz: "Qualitativ das Beste, was ich bisher rausgeholt habe. Wir waren zu dritt am Set, und das hat mir die Augen geöffnet: Größere Produktionen machen mir Spaß.",
			},
		],
		ps: "Du bist bis zum Schluss geblieben. Das machen nur echte Filmleute.\nP.S. Den Kaffee im Frühjahr zahle ich.",
	},

	// Sender, Du-Form, ohne eigene Auswahl.
	{
		slug: "lena-brandstaetter-q9f3",
		zielgruppe: "sender",
		anrede: "du",
		geschlecht: "w",
		vorname: "Lena",
		nachname: "Brandstätter",
		firma: "Redaktion Aktuell",
		persoenlicherAbsatz:
			"Du hast gesagt, ihr braucht jemanden im Flachgau, der auch kurzfristig rausfahren kann. Ich wohne in Mattsee, zehn Minuten von der Autobahn, zwanzig von der Stadt.",
	},
];
