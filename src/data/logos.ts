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
];

// Sender-Logos: NDR/Sat.1/RTL/KurierTV-Dateien sind offizielle Logos von
// Wikimedia Commons (gemeinfrei/CC-lizenziert dort hinterlegt), lokal auf
// Graustufen + transparenten Hintergrund gebracht, damit sie sich optisch
// wie die übrigen Marquee-Logos verhalten.
export const senderLogos: LogoEntry[] = [
	{ name: "NDR", src: "/logos/sender/ndr.webp" },
	{ name: "Sat.1", src: "/logos/sender/sat1.webp" },
	{ name: "RTL", src: "/logos/sender/rtl.webp" },
	{ name: "RTS Regionalfernsehen Salzburg", src: "/logos/sender/rts.webp" },
	{ name: "R9", src: "/logos/sender/r9.webp" },
	{ name: "Kurier TV", src: "/logos/sender/kuriertv.webp" },
];
