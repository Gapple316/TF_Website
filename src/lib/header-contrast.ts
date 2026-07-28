export function initHeaderContrast(): void {
	const header = document.querySelector<HTMLElement>("header");
	if (!header) return;

	const hero = document.querySelector<HTMLElement>("#hero");
	if (!hero) {
		delete header.dataset.overHero;
		return;
	}

	const observer = new IntersectionObserver(([entry]) => {
		header.dataset.overHero = entry.isIntersecting ? "true" : "false";
	});
	observer.observe(hero);
}

document.addEventListener("astro:page-load", initHeaderContrast);
