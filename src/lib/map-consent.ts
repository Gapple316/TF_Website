// Google Maps wird erst auf Klick geladen. Vorher steht an derselben Stelle
// ein Platzhalter – ohne diesen Schritt würde schon der bloße Seitenaufruf die
// IP-Adresse jedes Besuchers an Google übertragen, wofür es eine Einwilligung
// bräuchte. Nach dem Klick bleibt die Darstellung unverändert.

let cleanup: (() => void) | undefined;

export function initMapConsent(): void {
	cleanup?.();
	cleanup = undefined;

	const button = document.querySelector<HTMLButtonElement>("[data-map-load]");
	const frame = document.querySelector<HTMLIFrameElement>("[data-map-frame]");
	if (!button || !frame) return;

	const onClick = () => {
		const src = frame.dataset.src;
		if (src) frame.setAttribute("src", src);
		frame.classList.remove("hidden");
		button.remove();
	};

	button.addEventListener("click", onClick);
	cleanup = () => button.removeEventListener("click", onClick);
}

if (typeof document !== "undefined") {
	document.addEventListener("astro:page-load", initMapConsent);
}
