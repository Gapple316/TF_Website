// Ambient-Hintergrundvideos (Hero, Projekt-Banner, Was-Panels) überleben eine
// client-seitige Navigation (Astro View Transitions) nicht von selbst: beim
// DOM-Swap behält das <video>-Element seinen alten Medienzustand, die neue
// src wird aber nie geladen. Messbar reproduziert nach Klick auf einen
// Navigationslink: readyState 0, MediaError 4 (SRC_NOT_SUPPORTED), paused –
// sichtbar bleibt dann nur das Poster-Standbild statt des laufenden Videos.
// Deshalb nach jedem Seitenwechsel die betroffenen Videos neu laden und
// starten. Bei hartem Seitenaufruf laufen sie ohnehin schon, dort ist das
// hier ein No-Op (kein load(), damit kein sichtbarer Sprung entsteht).

export function initBackgroundVideos(): void {
	const videos = document.querySelectorAll<HTMLVideoElement>("video[autoplay]");

	videos.forEach((video) => {
		// Ohne muted verweigern Browser das Abspielen ohne Nutzerinteraktion.
		video.muted = true;

		if (video.error || video.readyState === 0) video.load();
		if (video.paused) void video.play().catch(() => {});
	});
}

if (typeof document !== "undefined") {
	document.addEventListener("astro:page-load", initBackgroundVideos);
}
