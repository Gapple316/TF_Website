// Logos für den Marquee-Slider auf der Landingpage ("Kunden" / "Ausgestrahlt
// bei"). Die vorhandenen Einträge sind echte, bereits im Projekt genutzte
// Partner-Logos (siehe auch Footer.astro) – keine Platzhalter.
//
// Ein Logo ergänzen:
// 1. Bilddatei nach public/logos/kunden/ (Auftraggeber) oder
//    public/logos/sender/ (Sender/Plattformen) legen – idealerweise .webp,
//    transparenter Hintergrund, ca. 200px Höhe.
// 2. Hier im passenden Array einen Eintrag ergänzen: { name, src, url? }.
//    "url" ist optional und macht das Logo zu einem externen Link.

export interface LogoEntry {
	name: string;
	src: string;
	url?: string;
}

export const kundenLogos: LogoEntry[] = [
	{ name: "Aqus", src: "/logos/kunden/aqus.webp" },
	{ name: "Explosive Egg", src: "/logos/kunden/explosive-egg.webp" },
	{ name: "Grow & Scale", src: "/logos/kunden/grow-scale.webp" },
	{ name: "Alexander Egger", src: "/logos/kunden/alexander-egger.webp" },
	{ name: "Cettaox", src: "/logos/kunden/cettaox.webp" },
	// RTS und dpa sind beides: Auftraggeber und Sender bzw. Agentur. Die
	// Dateien liegen deshalb nur einmal unter /logos/sender/ und werden hier
	// mitbenutzt, statt sie zu kopieren.
	{ name: "RTS Regionalfernsehen Salzburg", src: "/logos/sender/rts.webp" },
	{ name: "dpa", src: "/logos/sender/dpa.webp" },
	{ name: "APA", src: "/logos/sender/apa.webp" },
];

// Wo die Arbeit landet: die beiden Agenturen, über die das Rohmaterial läuft,
// und die beiden Sender, bei denen ganze Geschichten laufen. NDR, Sat.1, RTL
// und Kurier TV sind bewusst raus, auch wenn Material dort gelaufen ist: Vier
// Logos, hinter denen eine laufende Zusammenarbeit steht, sagen mehr als zehn
// einmalige Übernahmen. Die Dateien bleiben im Ordner liegen.
//
// Alle Dateien sind lokal auf Weiß und transparenten Hintergrund gebracht,
// damit sie sich im Marquee gleich verhalten.
export const senderLogos: LogoEntry[] = [
	{ name: "APA", src: "/logos/sender/apa.webp" },
	{ name: "dpa", src: "/logos/sender/dpa.webp" },
	{ name: "RTS Regionalfernsehen Salzburg", src: "/logos/sender/rts.webp" },
	{ name: "R9", src: "/logos/sender/r9.webp" },
];
