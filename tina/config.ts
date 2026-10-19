import { defineConfig } from "tinacms";

// Erste, bewusst einfache CMS-Anbindung: Tina bearbeitet exakt dieselben
// Markdown-Dateien unter src/content/projects, die Astro über
// content.config.ts ohnehin schon per Content Collection liest – Astro
// bekommt von Tina selbst nichts mit, es committet nur in dieselben Dateien.
// Später ausbaubar auf Tinas eigenen Daten-Layer (Live-Preview beim
// Editieren), falls das gewünscht ist – dafür bräuchte es einen generierten
// Client statt Astros getCollection().
//
// Lokal läuft das komplett ohne TinaCloud-Account (clientId/token leer =
// lokaler Dateisystem-Modus). Für produktives Editieren (z.B. nach dem
// Deploy) braucht es später einen TinaCloud-Account, der clientId/token
// liefert – aktuell bewusst noch nicht eingerichtet.
export default defineConfig({
	branch: process.env.TINA_BRANCH || process.env.HEAD || "main",
	clientId: process.env.TINA_CLIENT_ID || "",
	token: process.env.TINA_TOKEN || "",

	build: {
		outputFolder: "admin",
		publicFolder: "public",
	},
	media: {
		tina: {
			mediaRoot: "uploads",
			publicFolder: "public",
		},
	},

	schema: {
		collections: [
			{
				name: "project",
				label: "Projekte / Videos",
				path: "src/content/projects",
				format: "md",
				fields: [
					{
						type: "string",
						name: "title",
						label: "Titel",
						isTitle: true,
						required: true,
					},
					{
						type: "string",
						name: "category",
						label: "Kategorie",
						options: [
							{ value: "imagefilm", label: "Imagefilm" },
							{ value: "doku", label: "Dokumentation" },
							{ value: "news", label: "Magazin & News" },
						],
					},
					{
						type: "string",
						name: "videoUrl",
						label: "Video-URL (YouTube oder Vimeo)",
					},
					{
						type: "number",
						name: "startSeconds",
						label: "Start-Zeitpunkt (Sekunden, optional)",
					},
					{ type: "string", name: "client", label: "Kunde" },
					{ type: "number", name: "year", label: "Produktionsjahr (Anzeige)" },
					{
						type: "datetime",
						name: "date",
						label: "Veröffentlicht am (bestimmt die Reihenfolge – neueste oben)",
					},
					{
						type: "image",
						name: "thumbnail",
						label: "Vorschaubild (nur nötig, wenn das Video nicht auf YouTube/Vimeo liegt)",
					},
					{ type: "string", name: "duration", label: "Dauer (z.B. 02:40)" },
					{
						type: "string",
						name: "description",
						label: "Kurzbeschreibung",
						ui: { component: "textarea" },
						required: true,
					},
					{
						type: "string",
						name: "tags",
						label: "Tags",
						list: true,
					},
					{
						type: "boolean",
						name: "featured",
						label: "Top-Video (ersetzt das aktuelle Hero-Video der Kategorie)",
					},
					{
						type: "boolean",
						name: "embeddable",
						label: "Einbettbar (aus, wenn YouTube-Embed vom Rechteinhaber gesperrt ist)",
					},
					{
						type: "string",
						name: "newsType",
						label: "Art (nur Kategorie Magazin & News)",
						options: [
							{
								value: "eigene-story",
								label: "Eigene Story (Recherche, Kamera, Schnitt)",
							},
							{
								value: "presseagentur",
								label: "Presseagentur (nur Rohmaterial)",
							},
						],
					},
					{
						type: "string",
						name: "bgClip",
						label: "Hintergrund-Videoclip (lokaler Pfad, z.B. /videos/clear-amine.mp4)",
					},
					{
						type: "rich-text",
						name: "body",
						label: "Behind the Scenes / Zusatzinfo",
						isBody: true,
					},
					{
						type: "image",
						name: "stills",
						label: "Stills aus dem Video",
						list: true,
					},
				],
			},
		],
	},
});
