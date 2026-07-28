const REVEAL_DELAY_MS = 2000;

export function initHeroReveal(): void {
	const el = document.querySelector<HTMLElement>("[data-hero-reveal]");
	if (!el) return;

	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
		el.classList.add("is-revealed");
		return;
	}

	let revealed = false;
	const reveal = () => {
		if (revealed) return;
		revealed = true;
		el.classList.add("is-revealed");
		window.removeEventListener("scroll", onScroll);
	};

	const timer = window.setTimeout(reveal, REVEAL_DELAY_MS);
	const onScroll = () => {
		window.clearTimeout(timer);
		reveal();
	};

	window.addEventListener("scroll", onScroll, { passive: true });
}

document.addEventListener("astro:page-load", initHeroReveal);
