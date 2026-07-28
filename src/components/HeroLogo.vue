<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO_REVEAL_EVENT } from "../lib/hero-reveal";

gsap.registerPlugin(ScrollTrigger);

const logoEl = ref<HTMLImageElement | null>(null);
const revealed = ref(false);
const reducedMotion = ref(false);
let ctx: gsap.Context | undefined;

function onReveal() {
	revealed.value = true;
}

function refresh() {
	ScrollTrigger.refresh();
}

onMounted(() => {
	reducedMotion.value = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	window.addEventListener(HERO_REVEAL_EVENT, onReveal);

	const el = logoEl.value;
	const header = document.querySelector<HTMLImageElement>(
		'header a[href="/"] img',
	);
	if (!el || !header) return;

	ctx = gsap.context(() => {
		const startRect = el.getBoundingClientRect();

		gsap.set(el, {
			position: "fixed",
			top: startRect.top,
			left: startRect.left,
			width: startRect.width,
			height: startRect.height,
		});

		// Ziel-Werte als Funktionen statt fixer Zahlen: dank
		// invalidateOnRefresh werden sie bei jedem Refresh (Resize, Fonts,
		// Bild-Ladevorgänge) neu ausgewertet, statt die Position/Größe des
		// Header-Logos nur einmal beim Mount einzufrieren.
		gsap.to(el, {
			top: () => header.getBoundingClientRect().top,
			left: () => header.getBoundingClientRect().left,
			width: () => header.getBoundingClientRect().width,
			height: () => header.getBoundingClientRect().height,
			ease: "none",
			scrollTrigger: {
				trigger: "#hero",
				start: "top top",
				end: "bottom top",
				scrub: true,
				invalidateOnRefresh: true,
			},
		});
	});

	// Web-Fonts, Bilder oder das Video können die Layout-Maße nach dem
	// ersten Mount noch verschieben – ein Refresh nach dem vollständigen
	// Laden verhindert, dass das Logo an der falschen Stelle "andockt".
	if (document.readyState === "complete") {
		refresh();
	} else {
		window.addEventListener("load", refresh, { once: true });
	}
});

onUnmounted(() => {
	ctx?.revert();
	window.removeEventListener(HERO_REVEAL_EVENT, onReveal);
	window.removeEventListener("load", refresh);
});
</script>

<template>
	<img
		ref="logoEl"
		src="/images/logos/true-frame-logo.webp"
		alt="TRUE FRAME"
		class="absolute left-1/2 top-[36%] z-40 w-[55vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2"
		:class="[
			revealed ? 'opacity-100' : 'opacity-0',
			reducedMotion ? '' : 'transition-opacity duration-[800ms]',
		]"
	/>
</template>
