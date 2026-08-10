// Die Navbar hat keine eigene Hintergrundfläche mehr (Punkt 3, überarbeitet:
// nur noch die einzelnen Menü-Buttons sind Glass-Pills, keine Leiste) –
// hier bleibt nur die Erkennung, ob der Header gerade über dem dunklen
// Hero-Video liegt, damit die Buttons auf hellen Unterseiten nach dem
// Scrollen lesbare, themengerechte statt Weiß-auf-Hell-Farben bekommen.
let previousObserver: IntersectionObserver | undefined;

export function initHeaderContrast(): void {
	previousObserver?.disconnect();
	previousObserver = undefined;

	const header = document.querySelector<HTMLElement>("header");
	if (!header) return;

	const hero = document.querySelector<HTMLElement>("#hero");
	if (!hero) {
		delete header.dataset.overHero;
		return;
	}

	previousObserver = new IntersectionObserver(([entry]) => {
		header.dataset.overHero = entry.isIntersecting ? "true" : "false";
	});
	previousObserver.observe(hero);
}

document.addEventListener("astro:page-load", initHeaderContrast);
