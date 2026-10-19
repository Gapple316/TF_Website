// Gemeinsame Textquelle für die drei Portfolio-Kategorien. Wird sowohl von
// den Unterseiten (imagefilme.astro, dokumentationen.astro, magazin-und-news.astro
// – jeweils für den eigenen Hero) als auch von der Landingpage (WAS-Section)
// verwendet, damit Überschrift/Zierschrift/Subline nur an EINER Stelle
// gepflegt werden müssen.

export interface CategoryContent {
	slug: "imagefilme" | "dokumentationen" | "magazin-und-news";
	contentCategory: "imagefilm" | "doku" | "news";
	scriptLine: string;
	scriptFont?: "script" | "news-script";
	headline: string[];
	headlineFont?: "display" | "doku" | "news";
	body: string;
	/**
	 * Akzentfarbe der Kategorie – identisch mit --color-script-accent des
	 * jeweiligen Themes in global.css. Hier zusätzlich als Wert hinterlegt,
	 * weil die Startseite alle drei Kategorien gleichzeitig zeigt und dort das
	 * Landing-Theme gilt; die CSS-Variable wäre also für alle drei dieselbe.
	 */
	accent: string;
}

export const categoryContent: CategoryContent[] = [
	{
		slug: "imagefilme",
		contentCategory: "imagefilm",
		scriptLine: "cinematisch",
		headline: ["IMAGE", "FILME"],
		body: "Für Unternehmen, die zeigen wollen, wer hinter dem Produkt steht.",
		accent: "#f2c14b",
	},
	{
		slug: "dokumentationen",
		contentCategory: "doku",
		scriptLine: "geerdet",
		headline: ["DOKUMEN-", "TATIONEN"],
		headlineFont: "doku",
		body: "Über Menschen, Handwerk und Orte, die Zeit brauchen.",
		accent: "#9db27a",
	},
	{
		slug: "magazin-und-news",
		contentCategory: "news",
		scriptLine: "zuerst vor Ort",
		scriptFont: "news-script",
		headline: ["MAGAZIN", "& NEWS"],
		headlineFont: "news",
		body: "Ganze Beiträge produziere ich für RTS. Rohmaterial liefere ich an dpa und APA.",
		accent: "#3f6fbd",
	},
];
