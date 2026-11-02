// Play-Button über einem Standbild: der Hintergrund ist ein Poster bzw. ein
// stummer Hintergrundclip (kein Autoplay-Risiko, siehe .poster-cover in
// global.css) – der Button lädt bei Klick eine iframe mit Ton/Autoplay und
// schickt SIE in den echten Browser-Fullscreen. Verlässt man den Fullscreen
// wieder, wird die iframe entladen (kein Ton/keine Wiedergabe im Hintergrund).
//
// Knopf und iframe gehören über denselben Wert zusammen:
//   <button data-video-play="zeichen-der-vergangenheit">
//   <iframe  data-video-frame="zeichen-der-vergangenheit">
// Die Projektseiten haben genau ein Paar, die persönlichen Briefe
// (/fuer/[slug]) bis zu vier – deshalb wird über alle Knöpfe gelaufen statt
// nur den ersten zu suchen.
//
// Läuft über astro:page-load statt direkt beim Parsen, weil die Seite View
// Transitions (ClientRouter) nutzt – ein Klick-Handler, der nur beim
// allerersten Laden registriert wird, würde nach einer Client-seitigen
// Navigation auf die neuen (ausgetauschten) Elemente nicht mehr wirken.
let cleanupPrevious: (() => void) | undefined;

interface Paar {
	btn: HTMLButtonElement;
	frame: HTMLIFrameElement;
}

function findePaare(): Paar[] {
	const paare: Paar[] = [];

	for (const btn of document.querySelectorAll<HTMLButtonElement>("[data-video-play]")) {
		const id = btn.dataset.videoPlay ?? "";
		// CSS.escape fehlt in manchen Testumgebungen; die IDs sind
		// Dateinamen-Slugs, deshalb ist der einfache Vergleich hier sicher.
		const frame = [
			...document.querySelectorAll<HTMLIFrameElement>("[data-video-frame]"),
		].find((f) => (f.dataset.videoFrame ?? "") === id);

		if (frame) paare.push({ btn, frame });
	}

	return paare;
}

export function initVideoPlayer(): void {
	cleanupPrevious?.();
	cleanupPrevious = undefined;

	const paare = findePaare();
	if (paare.length === 0) return;

	const abmelden: (() => void)[] = [];

	for (const { btn, frame } of paare) {
		const onClick = () => {
			const src = frame.dataset.src;
			if (src && frame.getAttribute("src") !== src) {
				frame.setAttribute("src", src);
			}
			frame.classList.remove("hidden");
			frame.requestFullscreen?.().catch(() => {});
		};

		btn.addEventListener("click", onClick);
		abmelden.push(() => btn.removeEventListener("click", onClick));
	}

	// Ein Listener für alle: Beim Verlassen des Fullscreens wird jede iframe
	// entladen, die gerade nicht im Fullscreen ist. Für die bereits
	// geschlossenen ist das ein Leerlauf.
	const onFullscreenChange = () => {
		for (const { frame } of paare) {
			if (document.fullscreenElement === frame) continue;
			frame.classList.add("hidden");
			frame.removeAttribute("src");
		}
	};

	document.addEventListener("fullscreenchange", onFullscreenChange);

	cleanupPrevious = () => {
		for (const off of abmelden) off();
		document.removeEventListener("fullscreenchange", onFullscreenChange);
	};
}

document.addEventListener("astro:page-load", initVideoPlayer);
