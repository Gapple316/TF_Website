<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

interface Section {
	id: string;
	label: string;
}

const props = defineProps<{ sections: Section[] }>();

const activeIndex = ref(0);
const fillPercent = ref(0);
const dotPercents = ref<number[]>(props.sections.map(() => 0));
const reducedMotion = ref(false);

let observer: IntersectionObserver | undefined;
let ticking = false;
let scrollableHeight = 1;

// Einmal (und bei Resize/Load) gemessen, NICHT bei jedem Scroll-Event –
// vermeidet teure Layout-Reads im Scroll-Handler.
function measure() {
	scrollableHeight = Math.max(
		document.documentElement.scrollHeight - window.innerHeight,
		1,
	);
	dotPercents.value = props.sections.map((s) => {
		const el = document.getElementById(s.id);
		if (!el) return 0;
		const top = el.getBoundingClientRect().top + window.scrollY;
		return Math.min(100, Math.max(0, (top / scrollableHeight) * 100));
	});
	updateFill();
}

function updateFill() {
	const progress = (window.scrollY / scrollableHeight) * 100;
	fillPercent.value = Math.min(100, Math.max(0, progress));
}

function onScroll() {
	if (ticking) return;
	ticking = true;
	requestAnimationFrame(() => {
		updateFill();
		ticking = false;
	});
}

function scrollTo(id?: string) {
	if (!id) return;
	document
		.getElementById(id)
		?.scrollIntoView({ behavior: reducedMotion.value ? "auto" : "smooth", block: "start" });
}

onMounted(() => {
	reducedMotion.value = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;

	// rAF-Verzögerung: andere Komponenten (z.B. gepinnte Scroll-Sections)
	// können die Dokumenthöhe direkt nach dem Mount noch verändern.
	requestAnimationFrame(measure);
	window.addEventListener("load", measure, { once: true });
	window.addEventListener("scroll", onScroll, { passive: true });
	window.addEventListener("resize", measure);

	observer = new IntersectionObserver(
		(entries) => {
			let bestIndex = -1;
			let bestRatio = 0;
			for (const entry of entries) {
				if (!entry.isIntersecting || entry.intersectionRatio <= bestRatio) {
					continue;
				}
				const idx = props.sections.findIndex(
					(s) => s.id === entry.target.id,
				);
				if (idx !== -1) {
					bestIndex = idx;
					bestRatio = entry.intersectionRatio;
				}
			}
			if (bestIndex !== -1) activeIndex.value = bestIndex;
		},
		{ rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
	);

	for (const s of props.sections) {
		const el = document.getElementById(s.id);
		if (el) observer.observe(el);
	}
});

onUnmounted(() => {
	observer?.disconnect();
	window.removeEventListener("scroll", onScroll);
	window.removeEventListener("resize", measure);
	window.removeEventListener("load", measure);
});
</script>

<template>
	<nav
		aria-label="Seitenfortschritt"
		class="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-6 pb-4 pt-8 backdrop-blur-sm transition-opacity duration-300 md:px-10"
		:class="fillPercent > 97 ? 'pointer-events-none opacity-0' : 'opacity-100'"
	>
		<div class="mx-auto max-w-6xl">
			<!-- Desktop/Tablet: alle Labels nebeneinander -->
			<div class="hidden items-center justify-between md:flex">
				<button
					v-for="(s, i) in sections"
					:key="s.id"
					type="button"
					class="font-mono text-[10px] uppercase tracking-[0.24em] text-white transition-opacity duration-300"
					:class="i === activeIndex ? 'opacity-100' : 'opacity-45'"
					@click="scrollTo(s.id)"
				>
					{{ s.label }}
				</button>
			</div>
			<!-- Mobile: nur das aktive Label, zentriert -->
			<div class="flex justify-center md:hidden">
				<button
					type="button"
					class="font-mono text-[10px] uppercase tracking-[0.24em] text-white"
					@click="scrollTo(sections[activeIndex]?.id)"
				>
					{{ sections[activeIndex]?.label }}
				</button>
			</div>

			<div class="relative mt-3 h-px w-full bg-white/20">
				<div
					class="absolute inset-y-0 left-0 bg-accent transition-[width] duration-150 ease-linear"
					:style="{ width: fillPercent + '%' }"
				/>
				<button
					v-for="(s, i) in sections"
					:key="`${s.id}-dot`"
					type="button"
					:aria-label="`Zu ${s.label} springen`"
					class="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-colors duration-300"
					:class="
						dotPercents[i] <= fillPercent
							? 'border-accent bg-accent'
							: 'border-white/50 bg-transparent'
					"
					:style="{ left: dotPercents[i] + '%' }"
					@click="scrollTo(s.id)"
				/>
			</div>
		</div>
	</nav>
</template>
