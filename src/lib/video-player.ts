// Play-Button auf der Projekt-Detailseite: der Hintergrund ist ein
// Standbild (kein Autoplay-Risiko, siehe .poster-cover in global.css) –
// der Button lädt bei Klick eine unsichtbare iframe mit Ton/Autoplay und
// schickt SIE in den echten Browser-Fullscreen.
// Verlässt man den Fullscreen wieder, wird diese iframe entladen (kein
// Ton/keine Wiedergabe mehr im Hintergrund).
//
// Läuft über astro:page-load statt direkt beim Parsen, weil die Seite
// View Transitions (ClientRouter) nutzt – ein Klick-Handler, der nur beim
// allerersten Laden registriert wird, würde nach einer Client-seitigen
// Navigation auf die neuen (ausgetauschten) Elemente nicht mehr wirken.
let cleanupPrevious: (() => void) | undefined;

export function initVideoPlayer(): void {
	cleanupPrevious?.();
	cleanupPrevious = undefined;

	const btn = document.querySelector<HTMLButtonElement>("[data-video-play]");
	const frame = document.querySelector<HTMLIFrameElement>("[data-video-frame]");
	if (!btn || !frame) return;

	const onClick = () => {
		const src = frame.dataset.src;
		if (src && frame.getAttribute("src") !== src) {
			frame.setAttribute("src", src);
		}
		frame.classList.remove("hidden");
		frame.requestFullscreen?.().catch(() => {});
	};

	const onFullscreenChange = () => {
		if (document.fullscreenElement !== frame) {
			frame.classList.add("hidden");
			frame.removeAttribute("src");
		}
	};

	btn.addEventListener("click", onClick);
	document.addEventListener("fullscreenchange", onFullscreenChange);

	cleanupPrevious = () => {
		btn.removeEventListener("click", onClick);
		document.removeEventListener("fullscreenchange", onFullscreenChange);
	};
}

document.addEventListener("astro:page-load", initVideoPlayer);
