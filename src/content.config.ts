import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
	schema: z.object({
		title: z.string(),
		category: z.enum(["imagefilm", "news", "doku"]).optional(),
		videoUrl: z.string().url().optional(),
		startSeconds: z.number().optional(),
		client: z.string().optional(),
		// year = Produktionsjahr (steht in der Meta-Zeile), date =
		// Veröffentlichungsdatum. Die beiden können auseinanderfallen (ein 2023
		// gedrehter Film kann 2025 online gehen), deshalb zwei Felder: sortiert
		// wird nach date (neueste zuerst, siehe lib/projects.ts), angezeigt
		// weiterhin das Jahr.
		year: z.number().optional(),
		date: z.coerce.date().optional(),
		// Vorschaubild für Beiträge, die nicht auf YouTube/Vimeo liegen (dort
		// wird das Thumbnail automatisch geholt) – z.B. Beiträge in der
		// RTS-Mediathek.
		thumbnail: z.string().optional(),
		duration: z.string().optional(),
		description: z.string(),
		tags: z.array(z.string()).optional(),
		featured: z.boolean().optional(),
		embeddable: z.boolean().optional(),
		// Nur für die Kategorie "Magazin & News" relevant: trennt selbst
		// produzierte Geschichten (Recherche, Kamera, Schnitt aus einer Hand)
		// von Agenturarbeit, bei der nur Rohmaterial geliefert wurde. Steuert
		// sowohl die Gruppierung in zwei Blöcke auf der Übersichtsseite
		// (magazin-und-news.astro) als auch das Badge auf Karte und
		// Detailseite (ProjectDetail.astro).
		newsType: z.enum(["eigene-story", "presseagentur"]).optional(),
		// Lokaler, selbst gehosteter Kurzclip (z.B. /videos/clear-amine.mp4) für
		// echtes autoplayendes Ambient-Hintergrundvideo ohne Iframe-Risiko (siehe
		// .poster-cover in global.css für die Iframe-Problematik). Optional: ohne
		// bgClip fällt jede Stelle automatisch auf das Standbild zurück.
		bgClip: z.string().optional(),
		// Zwei getrennte optionale Zusatzinhalte für die Projekt-Detailseite:
		// – "Behind the Scenes" ist der Markdown-Body der jeweiligen Datei
		//   (per render(entry) auf der Detailseite gerendert), kein eigenes
		//   Feld hier, sondern das normale CMS-Rich-Text-Feld.
		// – "stills" ist eine separate Bildergalerie mit Video-Standbildern,
		//   unabhängig vom Behind-the-Scenes-Text befüllbar.
		stills: z.array(z.string()).optional(),
	}),
});

export const collections = { projects };
