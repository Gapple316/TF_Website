<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO_REVEAL_EVENT } from "../lib/hero-reveal";

gsap.registerPlugin(ScrollTrigger);

// FLIP-Logo-Animation, verbindliche Endfassung:
//
// Phase 1 (Reveal): reines Opacity-Fade, exakt zeitgleich mit der Headline
//   (selbes Event, selbe Dauer). Kein Zoom, keine Rotation.
// Phase 2 (Scroll durch den Hero): ausschließlich transform (translate +
//   EIN uniformer scale-Wert, aus Start-/Ziel-Rect berechnet). Niemals
//   width/height/top/left animieren – das verzerrt.
// Phase 3 (Hero verlassen): ScrollTrigger wird gekillt, alle von GSAP
//   gesetzten Inline-Styles entfernt, .is-docked (reines CSS) übernimmt
//   die Endposition dauerhaft. Ab hier hat Scrollen keinerlei Einfluss
//   mehr – einzig ein Reload/Neuaufruf setzt zurück (neuer Mount).
//
// Wichtig: der Hero ist NICHT gepinnt, scrollt also ganz normal weg. Die
// Logo-Box ist deshalb ab dem Mount "position: fixed" (statt normaler
// Flow-Position) – sonst würde sie sich durch das native Scrollen UND
// durch den GSAP-Transform gleichzeitig bewegen (zwei überlagerte
// Bewegungen, die sich nicht zu einer sauberen Bahn in die Ecke addieren).
// Ein unsichtbarer Spacer in derselben Größe hält die Lücke im
// Flex-Layout offen, solange die Logo-Box nicht gedockt ist.

const spacerEl = ref<HTMLDivElement | null>(null);
const wrapperEl = ref<HTMLDivElement | null>(null);
const logoEl = ref<HTMLImageElement | null>(null);
const revealed = ref(false);
const docked = ref(false);
const fixedBase = ref<{ top: number; left: number; width: number; height: number } | null>(null);

let scrollTrigger: ScrollTrigger | undefined;
let resizeRaf = 0;

function onReveal() {
	revealed.value = true;
}

function finalizeDock() {
	if (docked.value) return;
	docked.value = true;

	scrollTrigger?.kill();
	scrollTrigger = undefined;

	const el = logoEl.value;
	if (el) {
		// Alle von GSAP gesetzten Inline-Styles (transform, will-change)
		// entfernen – die Endposition kommt ab jetzt ausschließlich aus
		// der .is-docked-Klasse in global.css.
		gsap.set(el, { clearProps: "transform,willChange" });
	}
}

function measureFixedBase() {
	const spacer = spacerEl.value;
	if (!spacer) return;
	const rect = spacer.getBoundingClientRect();
	fixedBase.value = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
}

function setupScrollFlip() {
	scrollTrigger?.kill();
	scrollTrigger = undefined;

	const wrapper = wrapperEl.value;
	const el = logoEl.value;
	const hero = document.getElementById("hero");
	const header = document.querySelector<HTMLImageElement>(
		'header a[href="/"] img',
	);
	if (!wrapper || !el || !hero || !header) {
		finalizeDock();
		return;
	}

	const startRect = wrapper.getBoundingClientRect();
	const endRect = header.getBoundingClientRect();

	// Ein einziger, uniformer Scale-Faktor (Breite und Höhe verhalten
	// sich bei gleichem Seitenverhältnis identisch – hier der Fall, da
	// beide Rects exakt dasselbe Bild im selben Seitenverhältnis zeigen).
	const scale = endRect.width / startRect.width;
	const deltaX =
		endRect.left + endRect.width / 2 - (startRect.left + startRect.width / 2);
	const deltaY =
		endRect.top + endRect.height / 2 - (startRect.top + startRect.height / 2);

	gsap.set(el, { willChange: "transform" });

	scrollTrigger = ScrollTrigger.create({
		trigger: hero,
		start: "top top",
		end: "bottom top",
		scrub: true,
		onUpdate: (self) => {
			gsap.set(el, {
				x: deltaX * self.progress,
				y: deltaY * self.progress,
				scale: 1 + (scale - 1) * self.progress,
			});
		},
		onLeave: finalizeDock,
	});
}

function onResize() {
	if (docked.value) return;
	if (resizeRaf) cancelAnimationFrame(resizeRaf);
	resizeRaf = requestAnimationFrame(() => {
		measureFixedBase();
		// Rects (Start UND Ziel) haben sich durch die Größenänderung
		// verschoben – FLIP-Deltas müssen neu berechnet werden, sonst
		// zielt die Bewegung an der Header-Ecke vorbei.
		requestAnimationFrame(setupScrollFlip);
	});
}

onMounted(() => {
	const reducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	if (reducedMotion) {
		revealed.value = true;
		finalizeDock();
		return;
	}

	measureFixedBase();
	window.addEventListener(HERO_REVEAL_EVENT, onReveal);
	window.addEventListener("resize", onResize);
	// FLIP-Rects werden beim Mount gemessen (nicht erst beim Reveal) –
	// die Bewegung selbst ist an echten Scroll gekoppelt, nicht an einen
	// Timer, und muss ab dem allerersten Scroll-Pixel korrekt reagieren.
	requestAnimationFrame(setupScrollFlip);
});

onUnmounted(() => {
	window.removeEventListener(HERO_REVEAL_EVENT, onReveal);
	window.removeEventListener("resize", onResize);
	if (resizeRaf) cancelAnimationFrame(resizeRaf);
	scrollTrigger?.kill();
});
</script>

<template>
	<div
		v-if="!docked"
		ref="spacerEl"
		class="shrink-0 aspect-[1024/410] w-[clamp(9rem,55vw,26.25rem)] invisible"
		aria-hidden="true"
	/>
	<div
		ref="wrapperEl"
		class="shrink-0"
		:class="docked ? 'is-docked' : 'logo-fixed aspect-[1024/410]'"
		:style="!docked && fixedBase ? {
			top: fixedBase.top + 'px',
			left: fixedBase.left + 'px',
			width: fixedBase.width + 'px',
			height: fixedBase.height + 'px',
		} : undefined"
	>
		<img
			ref="logoEl"
			src="/images/logos/true-frame-logo.webp"
			alt="TRUE FRAME — by Gabriel Neumayr"
			class="h-full w-full object-contain transition-opacity duration-[800ms] ease"
			:class="revealed ? 'opacity-100' : 'opacity-0'"
		/>
	</div>
</template>
