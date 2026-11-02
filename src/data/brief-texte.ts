// Alle Standardtexte der persönlichen Briefe (/fuer/[slug]) an EINER Stelle,
// damit sie sich ändern lassen, ohne Komponenten anzufassen.
//
// Jeder Text liegt in zwei Fassungen vor – "du" und "sie". Das gilt auch dort,
// wo beide Fassungen heute wortgleich sind (Einstieg): Die Struktur bleibt so
// vorhersehbar, und eine der beiden Fassungen lässt sich später ändern, ohne
// die andere mitzuziehen. Wortgleiche Texte stehen trotzdem nur einmal als
// Konstante und werden referenziert, damit sie nicht auseinanderlaufen.

export interface AnredeFassung {
	du: string;
	sie: string;
}

/** Kontaktwege. Stimmen mit der Kontaktseite überein. */
export const KONTAKT = {
	email: "mail@true-frame.net",
	telefon: "+43 660 577 73 67",
	/** Für href="tel:" – ohne Leerzeichen. */
	telefonRoh: "+436605777367",
} as const;

/**
 * Welche Projekte ein Brief zeigt, wenn keine eigene Auswahl hinterlegt ist.
 * IDs sind die Dateinamen unter src/content/projects ohne .md.
 *
 * Bewusst Showreel als Einstieg, danach je ein Imagefilm und eine Doku. Der
 * vierte als "featured" markierte Beitrag (illegale-e-scooter) fehlt hier
 * absichtlich: tagesaktuelle Nachrichten sind für eine Erstansprache weniger
 * aussagekräftig als Image und Doku.
 */
export const STANDARD_PROJEKTE = [
	"showreel",
	"wapotec-jubilaeumsfilm",
	"zeichen-der-vergangenheit",
];

/** Mehr als vier Filme wird zur Mappe – genau das soll der Brief nicht sein. */
export const MAX_FILME = 4;

// Einstieg ist in beiden Fassungen wortgleich, deshalb nur einmal hier.
const EINSTIEG = [
	"manche Dinge erzählt man besser nicht mit einer Mappe, sondern mit einem Brief. Also hier ist meiner.",
	"Ich habe mein Handwerk beim Regionalfernsehen gelernt – dort, wo eine Geschichte in neunzig Sekunden sitzen muss und es keinen zweiten Take gibt. Was ich von dort mitgenommen habe: Die besten Bilder entstehen selten nach Plan. Sie entstehen, wenn man genau hinschaut und zuhört. Und meistens dann, wenn die Kamera eigentlich schon aus sein sollte.",
];

export const BRIEF_TEXTE = {
	/** Absätze zwischen Anrede und persönlichem Absatz. */
	einstieg: {
		du: EINSTIEG,
		sie: EINSTIEG,
	},

	/** Letzter Absatz vor den Filmen. */
	ueberleitung: {
		du: "Unten findest du ein paar Filme, die ich für dich zusammengestellt habe. Nicht alles, was ich gemacht habe – nur das, was für dich spannend sein könnte.",
		sie: "Unten finden Sie ein paar Filme, die ich für Sie zusammengestellt habe. Nicht alles, was ich gemacht habe – nur das, was für Sie spannend sein könnte.",
	} satisfies AnredeFassung,

	filmeUeberschrift: {
		du: "Ein paar Filme, die ich für dich ausgesucht habe",
		sie: "Ein paar Filme, die ich für Sie ausgesucht habe",
	} satisfies AnredeFassung,

	schluss: {
		du: "Wenn dich beim Anschauen etwas angesprochen hat, lass uns reden – auf einen Kaffee in Salzburg oder kurz am Telefon. Ich freu mich drauf.",
		sie: "Wenn Sie beim Anschauen etwas angesprochen hat, lassen Sie uns reden – auf einen Kaffee in Salzburg oder kurz am Telefon. Ich freue mich darauf.",
	} satisfies AnredeFassung,

	/** Grußformel über der Unterschrift. */
	gruss: "Herzliche Grüße aus Salzburg",

	/**
	 * Standard-P.S. Das Kürzel "P.S." steht bewusst im Text: Ein eigenes ps
	 * im Brief-Eintrag ersetzt diesen Text vollständig und wird genau so
	 * ausgegeben, wie er dort steht.
	 */
	ps: {
		du: "P.S. Diese Seite gibt's nur für dich. Sie steht in keinem Menü – quasi ein Brief, nur mit Link statt Kuvert.",
		sie: "P.S. Diese Seite gibt es nur für Sie. Sie steht in keinem Menü – quasi ein Brief, nur mit Link statt Kuvert.",
	} satisfies AnredeFassung,

	ctaLabel: {
		du: "Lass uns reden",
		sie: "Lassen Sie uns reden",
	} satisfies AnredeFassung,

	/** Kurze Beschreibung für die Link-Vorschau in Mail und WhatsApp. */
	ogBeschreibung: {
		du: "Ein persönlicher Brief von Gabriel Neumayr – mit ein paar Filmen, die zu dir passen könnten.",
		sie: "Ein persönlicher Brief von Gabriel Neumayr – mit ein paar Filmen, die zu Ihnen passen könnten.",
	} satisfies AnredeFassung,

	/** Zeile ganz unten, im Stil eines Filmabspanns. */
	abspann: "Ein Brief von Gabriel Neumayr · True Frame · Salzburg",
} as const;
