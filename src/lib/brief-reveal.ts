// Blendet Elemente der persönlichen Briefe ein, sobald sie in den sichtbaren
// Bereich scrollen – Briefabsätze, Filme, Unterschrift.
//
// Gleiches Muster wie mark-reveal.ts: ein IntersectionObserver, der eine
// Klasse setzt und das Element danach wieder loslässt. Die Bewegung selbst
// steckt in global.css ([data-brief-reveal]), inklusive der Abschaltung bei
// prefers-reduced-motion.
//
// Elemente im Vorspann sind ausgenommen: die gehören zur Balken-Animation
// und sind beim Laden ohnehin sichtbar.

let observer: IntersectionObserver | undefined;

/**
 * Meldet dem Inline-Skript im Seitenkopf (BriefLayout.astro), dass dieses
 * Modul geladen ist. Bleibt die Meldung aus, hebt das Inline-Skript die
 * unsichtbare Vorbereitung der Absätze wieder auf – sonst stünde bei einem
 * Ladefehler ein leerer Brief auf dem Schirm.
 *
 * Steht bewusst auf oberster Ebene und nicht in initBriefReveal(): Es zählt,
 * dass das Modul da ist, nicht ob astro:page-load schon gefeuert hat.
 */
if (typeof document !== "undefined") {
	document.documentElement.dataset.briefModul = "aktiv";
}

export function initBriefReveal(): void {
	observer?.disconnect();
	observer = undefined;

	const elemente = [
		...document.querySelectorAll<HTMLElement>("[data-brief-reveal]"),
	].filter((el) => !el.closest("[data-brief-vorspann]"));

	if (elemente.length === 0) return;

	// Ohne Bewegungswunsch alles sofort zeigen, statt am Observer zu hängen.
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		for (const el of elemente) el.classList.add("is-sichtbar");
		return;
	}

	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add("is-sichtbar");
				observer?.unobserve(entry.target);
			}
		},
		// Erst auslösen, wenn das Element ein Stück weit im Bild ist – sonst
		// ist die Einblendung vorbei, bevor man hinsieht.
		{ rootMargin: "0px 0px -12% 0px", threshold: 0 },
	);

	for (const el of elemente) observer.observe(el);
}

if (typeof document !== "undefined") {
	document.addEventListener("astro:page-load", initBriefReveal);
}
