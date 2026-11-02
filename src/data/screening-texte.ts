// Alle Texte des Private Screenings (/screening/[slug]) an EINER Stelle.
//
// Jeder Text liegt als Du- und Sie-Fassung vor. Die Sie-Fassung ist neu
// formuliert, nicht nur im Pronomen getauscht: Wo die Du-Fassung verkürzt
// spricht ("hab ich", "gibt's"), schreibt die Sie-Fassung aus – das ist der
// Unterschied zwischen vertraut und höflich, und genau daran merkt man, ob
// jemand nur suchen und ersetzen gedrückt hat.
//
// Wortgleiche Texte stehen trotzdem nur einmal als Konstante und werden in
// beiden Fassungen referenziert, damit sie nicht auseinanderlaufen.

export interface AnredeFassung {
	du: string;
	sie: string;
}

export type Zielgruppe = "werbekunde" | "produktion" | "sender";

/** Kontaktwege. Stimmen mit der Kontaktseite überein. */
export const KONTAKT = {
	email: "mail@true-frame.net",
	telefon: "+43 660 577 73 67",
	telefonRoh: "+436605777367",
} as const;

/** Mehr als vier Filme wird ein Programmheft – das soll es nicht sein. */
export const MAX_FILME = 4;

/**
 * Standardauswahl je Zielgruppe, wenn im Screening keine eigene hinterlegt
 * ist. IDs sind die Dateinamen unter src/content/projects ohne .md.
 */
export const STANDARD_PROJEKTE: Record<Zielgruppe, string[]> = {
	// Was ein Unternehmen sehen will: zwei fertige Imagefilme, dann der Querschnitt.
	werbekunde: ["wapotec-jubilaeumsfilm", "clear-amine", "showreel"],
	// Produktionsfirmen interessiert die lange Form zuerst.
	produktion: ["zeichen-der-vergangenheit", "die-wegewarter", "showreel"],
	// Sender wollen sehen, dass tagesaktuell und dokumentarisch beides sitzt.
	sender: ["illegale-e-scooter", "borkenkaefer-salzburg", "zeichen-der-vergangenheit"],
};

// ---------------------------------------------------------------------------
// Ticket
// ---------------------------------------------------------------------------

export const TICKET = {
	haus: "TRUE FRAME LICHTSPIELE · SALZBURG",
	titel: "PRIVATE SCREENING",
	platz: "Saal 1 · Reihe 1 · Platz 1",
	reserviert: "Reserviert für",
	vorstellung: "Vorstellung",
	programm: "Programm",
	nummer: "Nr.",
	abschnitt: "KONTROLLABSCHNITT",
	/** Steht handschriftlich am Pfeil zum Abrissstreifen. */
	abreissen: "Abreißen & los geht's!",
	/** Ankerlink unter dem Ticket, für alle die das Kino überspringen wollen. */
	direktZuFilmen: "Direkt zu den Filmen ↓",
} as const;

// ---------------------------------------------------------------------------
// Vorspann auf der Leinwand
// ---------------------------------------------------------------------------

export const VORSPANN_KOPF = {
	haus: "TRUE FRAME LICHTSPIELE",
	praesentiert: "präsentiert",
	eineVorstellungFuer: "eine Vorstellung für",
	nachWahrerGeschichte: "– nach einer wahren Geschichte –",
} as const;

// Vor dem Zielgruppen-Absatz.
const PLATZ_GENOMMEN: AnredeFassung = {
	du: "schön, dass du Platz genommen hast. Reihe 1, Platz 1, der beste im Haus. Den hab ich für dich reserviert.",
	sie: "schön, dass Sie Platz genommen haben. Reihe 1, Platz 1, der beste im Haus. Den habe ich für Sie reserviert.",
};

// Nach dem persönlichen Absatz.
const PROGRAMM_ANKUENDIGUNG: AnredeFassung = {
	du: "Ich hab dir ein kleines Programm zusammengestellt. Kein Dreistunden-Epos, versprochen. Eher ein Kurzfilmabend. Lehn dich zurück.",
	sie: "Ich habe Ihnen ein kleines Programm zusammengestellt. Kein Dreistunden-Epos, versprochen. Eher ein Kurzfilmabend. Lehnen Sie sich zurück.",
};

const POPCORN: AnredeFassung = {
	du: "Popcorn musst du dir leider selbst holen.",
	sie: "Popcorn müssen Sie sich leider selbst holen.",
};

/** Schlusszeile des Vorspanns, danach der Scroll-Hinweis. */
export const LICHT_AUS = "Licht aus. Film ab.";

// Zielgruppen-Absätze. Zwei davon sprechen den Leser gar nicht direkt an und
// sind deshalb in beiden Fassungen gleich; nur "produktion" verkürzt im Du.
const ZG_WERBEKUNDE =
	"Ich mache Filme für Unternehmen, die mehr zu erzählen haben als ihr Prospekt. Keine Werbung, deren Namen man schon beim Rausgehen vergessen hat, sondern Geschichten, über die man im Foyer noch redet.";

const ZG_SENDER =
	"Ich liefere Beiträge für RTS und R9 und Material für APA und dpa. Recherche, Dreh und Schnitt aus einer Hand. Kino ist schön, aber ich weiß auch, wie sich Sendeschluss anfühlt. Und dass eine gute Geschichte trotzdem keine Abkürzung nimmt.";

export const ZIELGRUPPEN_ABSATZ: Record<Zielgruppe, AnredeFassung> = {
	werbekunde: { du: ZG_WERBEKUNDE, sie: ZG_WERBEKUNDE },
	produktion: {
		du: "Gelernt hab ich mein Handwerk beim Regionalfernsehen, vom Lehrling bis zum Videojournalisten. Dort muss eine Geschichte in neunzig Sekunden sitzen, einen zweiten Take gibt's nicht. Heute drehe ich Dokus und Commercials und bin gern dort, wo größere Geschichten erzählt werden, hinter der Kamera und am Schnittplatz.",
		sie: "Gelernt habe ich mein Handwerk beim Regionalfernsehen, vom Lehrling bis zum Videojournalisten. Dort muss eine Geschichte in neunzig Sekunden sitzen, einen zweiten Take gibt es nicht. Heute drehe ich Dokus und Commercials und bin gern dort, wo größere Geschichten erzählt werden, hinter der Kamera und am Schnittplatz.",
	},
	sender: { du: ZG_SENDER, sie: ZG_SENDER },
};

export const VORSPANN = {
	platzGenommen: PLATZ_GENOMMEN,
	programmAnkuendigung: PROGRAMM_ANKUENDIGUNG,
	popcorn: POPCORN,
	ueberspringen: "Vorspann überspringen ⏭",
	/** Erscheint auf der Leinwand, solange der Text angehalten ist. */
	pausiert: "‖ angehalten, klicken zum Weiterlaufen",
	scrollHinweis: "Weiter zum Programm ↓",
} as const;

// ---------------------------------------------------------------------------
// Programm
// ---------------------------------------------------------------------------

export const PROGRAMM = {
	marquee: "HEUTE IM PROGRAMM",
	ueberleitung: {
		du: "Handverlesen für dich. Nicht alles, was ich gedreht habe. Nur das, was du sehen solltest.",
		sie: "Handverlesen für Sie. Nicht alles, was ich gedreht habe. Nur das, was Sie sehen sollten.",
	} satisfies AnredeFassung,
	/* Das frühere Label "Warum ich dir den zeigen will" entfällt: Die Notiz
	   zu einem Film ist jetzt ein Kommentar der Figur und erscheint als
	   Sprechblase, sobald der Film ins Bild scrollt. */
	/** Schließen-Knopf der Vorführung. */
	lichtAn: "Licht an",
	/** Genre-Stempel, wenn das Projekt keiner Kategorie zugeordnet ist. */
	stempelFallback: "SHOWREEL",
	stempel: {
		imagefilm: "IMAGEFILM",
		doku: "DOKU",
		news: "NEWS",
	} as Record<string, string>,
} as const;

// ---------------------------------------------------------------------------
// Zielgruppenblock
// ---------------------------------------------------------------------------

export const ZIELGRUPPEN_BLOCK = {
	// Für "produktion" steht hier nichts: Der frühere Technik-Kasten zählte
	// genau das auf, was weiter unten in der Ausrüstungsliste steht.
	sender: {
		titel: "Ausgestrahlt bei",
		absatz:
			"Recherche, Dreh und Schnitt aus einer Hand, vom ersten Anruf bis zur fertigen Sendefassung.",
	},
	werbekunde: {
		titel: "Gemeinsam entstanden",
	},
} as const;

// ---------------------------------------------------------------------------
// Die Figur, die danebensitzt
// ---------------------------------------------------------------------------

/** Mehr Sprechblasen wären Belästigung statt Begleitung. */
export const MAX_KOMMENTARE = 6;

/**
 * Begrüßung direkt nach dem Abreißen: Gabriel steht groß im Bild und erklärt
 * in zwei Sätzen, was gleich passiert. Ohne das war unklar, warum da jemand
 * im Saal sitzt und später in der Ecke auftaucht.
 */
export const BEGRUESSUNG = {
	hallo: {
		du: "Schön, dass du da bist.",
		sie: "Schön, dass Sie da sind.",
	} satisfies AnredeFassung,
	einladung: {
		du: "Setz dich doch neben mich in die erste Reihe. Ich bleib die ganze Vorstellung dabei und sag ab und zu was dazu.",
		sie: "Nehmen Sie doch neben mir in der ersten Reihe Platz. Ich bleibe die ganze Vorstellung über dabei und sage ab und zu etwas dazu.",
	} satisfies AnredeFassung,
	knopf: {
		du: "Platz nehmen",
		sie: "Platz nehmen",
	} satisfies AnredeFassung,
} as const;

export const FIGUR = {
	/** Klick auf die Figur schickt sie ins Ruhe-Eck. */
	ruheEck: "Ins Ruhe-Eck schicken",
	zurueckholen: "Gabriel zurückholen",
	blaseSchliessen: "Schließen",

	kommentare: {
		/* Im Saal, sobald das Licht ausgeht. Dass wir nebeneinander sitzen,
		   ist bei der Begrüßung schon gesagt – hier braucht es das nicht mehr. */
		saalstart: {
			du: "Licht aus. Jetzt gilt's.",
			sie: "Licht aus. Jetzt gilt es.",
		},
		programmstart: {
			du: "So. Jetzt wird's spannend.",
			sie: "So. Jetzt wird es spannend.",
		},
		nachErstemFilm: {
			du: "Und? Ehrlich sein.",
			sie: "Und? Ganz ehrlich jetzt.",
		},
		popcorn: {
			du: "Popcorn? … Ah. Hab ich vergessen.",
			sie: "Popcorn? … Ah. Habe ich vergessen.",
		},
		vorVorstellung: {
			du: "Jetzt kommt der Teil, wo ich mich vorstell. Kurz, versprochen.",
			sie: "Jetzt kommt der Teil, wo ich mich vorstelle. Kurz, versprochen.",
		},
	} satisfies Record<string, AnredeFassung>,
} as const;

// ---------------------------------------------------------------------------
// Was ich kann
// ---------------------------------------------------------------------------

/**
 * Die vier Stationen im Filmstreifen. Inhalt und Reihenfolge folgen dem "Wie"
 * der Startseite (src/pages/index.astro), die Bildunterschriften sind daraus
 * auf je einen Satz verdichtet.
 *
 * Es sind dieselben Fotos wie auf der Startseite, keine Zeichnungen: Die
 * gezeichneten Szenen wirkten neben dem echten Material billig, und die Fotos
 * zeigen ohnehin genau diese vier Schritte.
 *
 * schlagworte sind die Marken und Stichworte, die einen Kader sofort einordnen
 * (Sender, Agenturen). Sie stehen nur dort, wo sie etwas erklären, was der
 * Satz darunter nicht schon sagt – deshalb sind sie nicht bei jedem Kader.
 */
export const SZENEN = [
	{
		schluessel: "denken",
		titel: "Konzept & Drehbuch",
		unterschrift: "Ein guter Film braucht viel Planung.",
		schlagworte: [],
		alt: "Gabriel am Schreibtisch über einem Laptop, Stift in der Hand",
	},
	{
		schluessel: "hoeren",
		titel: "Nachrichten",
		unterschrift: "Was jemand sagt, und was er eigentlich meint.",
		schlagworte: ["Tagesaktuell", "RTS", "DPA", "APA"],
		alt: "Gabriel von hinten, ein Reportermikrofon in der Hand",
	},
	{
		schluessel: "sehen",
		titel: "Werbung",
		unterschrift: "Filme, die man sich ansehen will.",
		schlagworte: [],
		alt: "Gabriel hinter der Kamera, das rote Aufnahmelicht leuchtet",
	},
	{
		schluessel: "erzaehlen",
		titel: "Schnitt",
		unterschrift: "Ob Nachrichten-MAZ unter Zeitdruck oder S-Log-Grading, alles dabei.",
		schlagworte: [],
		alt: "Gabriel am Schnittplatz, auf dem Laptop läuft die Timeline",
	},
] as const;

export const VORSTELLUNG = {
	// "Vorstellung" steht schon im Ticket, im Vorspann und im Schluss. Der
	// Abschnitt heißt deshalb nach dem, was er zeigt.
	titelkarte: "Und jetzt: was ich kann.",

	// Steht handschriftlich über dem Foto. Früher hieß es hier "Und in echt
	// schau ich so aus" – als Gegenstück zur Zeichnung. Die gibt es nicht
	// mehr, also braucht die Zeile einen eigenen Grund: Sie sagt, wer den
	// ganzen Abend über neben einem gesessen ist.
	echtIch: {
		du: "Der neben dir gesessen ist.",
		sie: "Der neben Ihnen gesessen ist.",
	} satisfies AnredeFassung,

	bildunterschrift: "GABRIEL NEUMAYR · TRUE FRAME · SALZBURG",

	statement: {
		du: "Ich glaub nicht an Filme, die man vergisst, bevor das Licht angeht.",
		sie: "Ich glaube nicht an Filme, die man vergisst, bevor das Licht angeht.",
	} satisfies AnredeFassung,

	werIchBin: {
		du: "Ich bin Gabriel, Videojournalist und Filmemacher aus Salzburg. Gelernt hab ich beim Regionalfernsehen, vom Lehrling bis zum Videojournalisten. Heute arbeite ich als True Frame: für Sender und Nachrichtenagenturen, für Unternehmen mit einer Geschichte und an Dokumentationen. Von der ersten Idee bis zum fertigen Schnitt, meistens alles aus einer Hand.",
		sie: "Ich bin Gabriel, Videojournalist und Filmemacher aus Salzburg. Gelernt habe ich beim Regionalfernsehen, vom Lehrling bis zum Videojournalisten. Heute arbeite ich als True Frame: für Sender und Nachrichtenagenturen, für Unternehmen mit einer Geschichte und an Dokumentationen. Von der ersten Idee bis zum fertigen Schnitt, meistens alles aus einer Hand.",
	} satisfies AnredeFassung,

	// Nicht noch einmal "Was ich kann": Das steht jetzt über dem Abschnitt.
	koennenTitel: "Im Überblick",

	schluss: {
		du: "Ich hoffe, du hast jetzt ein Bild davon, wie ich arbeite.",
		sie: "Ich hoffe, Sie haben jetzt ein Bild davon, wie ich arbeite.",
	} satisfies AnredeFassung,
} as const;

/** Die Punkte selbst, unabhängig von der Reihenfolge. */
export const KOENNEN = {
	konzept: "Konzept & Drehbuch",
	dreh: "Dreh: Interviews, Reportage, Doku, Commercial",
	schnitt: "Schnitt & Color Grading",
	image: "Imagefilme & Werbung",
	doku: "Dokumentationen",
	tv: "TV-Beiträge & Agenturmaterial",
} as const;

/** Was zuerst steht, richtet sich danach, wer zusieht. */
export const KOENNEN_REIHENFOLGE: Record<Zielgruppe, (keyof typeof KOENNEN)[]> = {
	werbekunde: ["image", "konzept", "dreh", "schnitt", "doku", "tv"],
	produktion: ["dreh", "schnitt", "konzept", "doku", "image", "tv"],
	sender: ["tv", "dreh", "schnitt", "konzept", "doku", "image"],
};

/**
 * Die Ausrüstung, für alle, die danach fragen. Seit der Technik-Kasten oben
 * weg ist, steht sie nur noch hier.
 *
 * Der handschriftliche Satz ist bewusst eine Relativierung: Die Liste soll
 * zeigen, dass das Werkzeug da ist, und nicht, dass es den Film macht.
 */
export const AUSRUESTUNG = {
	handschrift: "Eine gute Kamera macht keinen guten Film, aber …",
	titel: "Ausrüstung",
	liste: [
		"Sony FX6",
		"Sony ZV-E1",
		"Prime Lenses",
		"TV-Zoom 28–135",
		"DJI Ronin",
		"Slider",
		"Licht",
		"Tonangel mit Recorder",
	],
	nachsatz: "Und alles, was dazugehört.",
} as const;

// ---------------------------------------------------------------------------
// Schluss
// ---------------------------------------------------------------------------

export const SCHLUSS = {
	cta: "Nächste Vorstellung: Wir zwei. Ein Kaffee. Salzburg.",
	// Bleibt im Bild des Abends: Man sichert sich ein Ticket, man bucht keinen
	// Termin. Du und Sie gleich – kürzer geht es in beiden Fassungen nicht.
	ctaLabel: {
		du: "Ticket sichern",
		sie: "Ticket sichern",
	} satisfies AnredeFassung,
	postCredits: "– Post-Credits-Szene –",
	ps: {
		du: "Du bist bis zum Schluss geblieben. Das machen nur echte Filmleute.\nP.S. Diese Vorstellung läuft nur für dich, sie steht in keinem Programmheft.",
		sie: "Sie sind bis zum Schluss geblieben. Das machen nur echte Filmleute.\nP.S. Diese Vorstellung läuft nur für Sie, sie steht in keinem Programmheft.",
	} satisfies AnredeFassung,
} as const;

// ---------------------------------------------------------------------------
// Link-Vorschau
// ---------------------------------------------------------------------------

export const OG_BESCHREIBUNG = {
	du: "Reihe 1, Platz 1, reserviert für dich. Eine private Vorstellung von Gabriel Neumayr, True Frame.",
	sie: "Reihe 1, Platz 1, für Sie reserviert. Eine private Vorstellung von Gabriel Neumayr, True Frame.",
} satisfies AnredeFassung;
