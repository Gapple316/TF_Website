const REVEAL_DELAY_MS = 5000;
export const HERO_REVEAL_EVENT = "hero-reveal";

export function initHeroReveal(): void {
	const els = document.querySelectorAll<HTMLElement>("[data-hero-reveal]");
	if (els.length === 0) return;

	const revealAll = () => {
		els.forEach((el) => el.classList.add("is-revealed"));
		window.dispatchEvent(new CustomEvent(HERO_REVEAL_EVENT));
	};

	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		revealAll();
		return;
	}

	let revealed = false;
	const reveal = () => {
		if (revealed) return;
		revealed = true;
		revealAll();
		window.removeEventListener("scroll", onScroll);
	};

	const timer = window.setTimeout(reveal, REVEAL_DELAY_MS);
	const onScroll = () => {
		window.clearTimeout(timer);
		reveal();
	};

	window.addEventListener("scroll", onScroll, { passive: true });
}

if (typeof document !== "undefined") {
	document.addEventListener("astro:page-load", initHeroReveal);
}
