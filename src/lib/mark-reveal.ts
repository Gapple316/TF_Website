// Zeichnet die roten Stift-Markierungen (MarkedWord.astro) erst, wenn sie in
// den Viewport scrollen – sonst wären sie beim Hochscrollen längst fertig
// gezeichnet und der Effekt ginge verloren.
//
// Markierungen innerhalb des Hero-Textblocks sind ausgenommen: die hängen am
// Hero-Reveal ([data-hero-reveal].is-revealed in global.css), damit der Strich
// nicht um noch unsichtbaren Text gezogen wird.

let observer: IntersectionObserver | undefined;

export function initMarkReveal(): void {
	observer?.disconnect();
	observer = undefined;

	const marks = [...document.querySelectorAll<HTMLElement>(".marked-word")].filter(
		(el) => !el.closest("[data-hero-reveal]"),
	);
	if (marks.length === 0) return;

	observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (!entry.isIntersecting) continue;
				entry.target.classList.add("is-drawn");
				observer?.unobserve(entry.target);
			}
		},
		{ rootMargin: "0px 0px -15% 0px", threshold: 0 },
	);

	for (const mark of marks) observer.observe(mark);
}

if (typeof document !== "undefined") {
	document.addEventListener("astro:page-load", initMarkReveal);
}
