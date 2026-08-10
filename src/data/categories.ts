// Gemeinsame Textquelle für die drei Portfolio-Kategorien. Wird sowohl von
// den Unterseiten (imagefilme.astro, dokumentationen.astro, nachrichten.astro
// – jeweils für den eigenen Hero) als auch von der Landingpage (WAS-Section)
// verwendet, damit Überschrift/Zierschrift/Subline nur an EINER Stelle
// gepflegt werden müssen.

export interface CategoryContent {
	slug: "imagefilme" | "dokumentationen" | "nachrichten";
	contentCategory: "imagefilm" | "doku" | "news";
	scriptLine: string;
	scriptFont?: "script" | "news-script";
	headline: string[];
	headlineFont?: "display" | "doku" | "news";
	body: string;
}

export const categoryContent: CategoryContent[] = [
	{
		slug: "imagefilme",
		contentCategory: "imagefilm",
		scriptLine: "cinematisch",
		headline: ["IMAGE", "FILME"],
		body: "Für Unternehmen, die zeigen wollen, wer hinter dem Produkt steht.",
	},
	{
		slug: "dokumentationen",
		contentCategory: "doku",
		scriptLine: "geerdet",
		headline: ["DOKUMEN-", "TATIONEN"],
		headlineFont: "doku",
		body: "Über Menschen, Handwerk und Orte, die Zeit brauchen.",
	},
	{
		slug: "nachrichten",
		contentCategory: "news",
		scriptLine: "zuerst vor Ort",
		scriptFont: "news-script",
		headline: ["NACHRICHTEN"],
		headlineFont: "news",
		body: "Beiträge für dpa, APA und Redaktionen. Schnell, verlässlich, sendefertig.",
	},
];
