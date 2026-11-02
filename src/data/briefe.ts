// Empfänger:innen der persönlichen Portfolio-Briefe unter /fuer/[slug].
//
// NEUEN BRIEF ANLEGEN: Eintrag kopieren, Slug mit Zufallssuffix vergeben,
// Felder ausfüllen, fertig. Die Seite entsteht beim nächsten Build von selbst.
//
// Das Zufallssuffix (die vier Zeichen hinten) ist der einzige Schutz davor,
// dass jemand fremde Briefe durch Raten findet – also bitte nicht weglassen
// und nicht durchnummerieren. Vier zufällige Kleinbuchstaben und Ziffern
// reichen; am einfachsten im Terminal:
//
//   node -e "console.log(Math.random().toString(36).slice(2,6))"
//
// Die Standardtexte stehen in brief-texte.ts, nicht hier.

export interface BriefProjekt {
	/** Dateiname unter src/content/projects ohne .md, z.B. "die-wegewarter". */
	id: string;
	/** Ein persönlicher Satz, warum gerade dieser Film interessant sein könnte. */
	notiz?: string;
}

export interface Brief {
	slug: string;
	anrede: "du" | "sie";
	/** Steuert "Liebe Frau" / "Lieber Herr" / "Guten Tag". */
	geschlecht: "w" | "m" | "neutral";
	vorname: string;
	nachname: string;
	titel?: string;
	firma?: string;
	/** Wird nach dem Einstieg eingefügt. Mehrere Absätze als mehrere Einträge. */
	persoenlicherAbsatz?: string | string[];
	/** Leer oder weggelassen → die Standardauswahl aus brief-texte.ts. */
	projekte?: BriefProjekt[];
	/** Ersetzt das Standard-P.S. vollständig, inklusive des Kürzels "P.S.". */
	ps?: string;
	/** Ersetzt den Standard-Knopf (E-Mail an Gabriel). */
	cta?: { label: string; href: string };
}

export const briefe: Brief[] = [
	// Vorschauseite für Gabriel: alle Felder befüllt, damit sich jede
	// Gestaltungsentscheidung an einem Beispiel prüfen lässt.
	{
		slug: "vorlage",
		anrede: "du",
		geschlecht: "neutral",
		vorname: "Vorname",
		nachname: "Nachname",
		firma: "Beispiel GmbH",
		persoenlicherAbsatz: [
			"Hier steht der persönliche Absatz – der Teil, der diesen Brief von jedem anderen unterscheidet. Zwei, drei Sätze darüber, woher man sich kennt, was das Unternehmen gerade beschäftigt oder warum ich glaube, dass wir zusammenpassen.",
			"Ein zweiter Absatz ist möglich, wenn es mehr zu sagen gibt.",
		],
		projekte: [
			{ id: "showreel", notiz: "Der schnellste Überblick – eineinhalb Minuten quer durch alles." },
			{ id: "wapotec-jubilaeumsfilm", notiz: "Hier steht eine Randnotiz: warum genau dieser Film zu dieser Person passt." },
			{ id: "zeichen-der-vergangenheit" },
		],
	},

	// Beispiel 1: Du-Form, eigene Projektauswahl mit Notizen.
	{
		slug: "maria-huber-x7k2",
		anrede: "du",
		geschlecht: "w",
		vorname: "Maria",
		nachname: "Huber",
		firma: "Huber Bau GmbH",
		persoenlicherAbsatz:
			"Nach unserem Gespräch auf der Baustelle in Mattsee ist mir der Satz hängengeblieben, dass euch niemand glaubt, wie viel Handarbeit in einem Rohbau steckt. Genau solche Sachen lassen sich filmisch zeigen – man muss nur lange genug danebenstehen, bis die Leute die Kamera vergessen.",
		projekte: [
			{
				id: "wapotec-jubilaeumsfilm",
				notiz: "Auch ein Familienbetrieb, auch ein Jubiläum – und niemand musste einen Text aufsagen.",
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

	// Beispiel 2: Sie-Form, ohne eigene Auswahl – zeigt die Standardprojekte.
	{
		slug: "dr-thomas-berger-m4q8",
		anrede: "sie",
		geschlecht: "m",
		titel: "Dr.",
		vorname: "Thomas",
		nachname: "Berger",
		firma: "Berger Medizintechnik",
		persoenlicherAbsatz:
			"Sie haben erwähnt, dass Ihre bisherigen Produktvideos zwar erklären, aber niemanden berühren. Das ist ein Satz, den ich oft höre – und meistens liegt es nicht an der Technik, sondern daran, dass niemand vorkommt, der mit dem Produkt arbeitet.",
	},
];
