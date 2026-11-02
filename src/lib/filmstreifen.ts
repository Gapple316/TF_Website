// Der Filmstreifen mit den vier Zeichentrickszenen.
//
// Am Rechner wird der Abschnitt festgehalten und die Bahn waagrecht
// durchgeschoben – dasselbe Muster wie die WIE-Sektion der Startseite
// (WieWasSections.vue), damit sich die Bewegung vertraut anfühlt und GSAP
// nicht zweimal unterschiedlich eingesetzt wird.
//
// Am Handy passiert nichts davon: Dort stehen die Szenen untereinander.
// Waagrechtes Scrollen auf einem Telefon ist eine Zumutung, und ein
// festgehaltener Abschnitt nimmt dort den halben Bildschirm.

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let trigger: ScrollTrigger | undefined;

export function initFilmstreifen(): void {
	trigger?.kill();
	trigger = undefined;

	const streifen = document.querySelector<HTMLElement>("[data-filmstreifen]");
	const bahn = document.querySelector<HTMLElement>("[data-filmstreifen-bahn]");
	if (!streifen || !bahn) return;

	const grossGenug = window.matchMedia("(min-width: 768px)").matches;
	const wenigerBewegung = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	if (!grossGenug || wenigerBewegung) return;

	const weg = () => Math.max(0, bahn.scrollWidth - window.innerWidth + 64);

	trigger = ScrollTrigger.create({
		trigger: streifen,
		start: "top top",
		end: () => `+=${weg() + window.innerHeight * 0.6}`,
		pin: true,
		scrub: true,
		invalidateOnRefresh: true,
		onUpdate: (selbst) => {
			gsap.set(bahn, { x: -weg() * selbst.progress });
		},
	});
}

if (typeof document !== "undefined") {
	document.addEventListener("astro:page-load", initFilmstreifen);
}
