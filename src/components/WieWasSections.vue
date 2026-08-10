<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// "Wie" und "Was" MÜSSEN als EINE einzige Vue-Island (ein client:load)
// hydratisieren, nicht als zwei getrennte. Grund: zwei unabhängige Islands
// hydratisieren zu unvorhersagbar unterschiedlichen Zeitpunkten – welche
// zuerst ihren GSAP-Pin anlegt, fügt zuerst einen Pin-Spacer ein und
// schiebt die andere Section nach unten. Mit echten Scroll-Tests wieder-
// holt reproduziert: hat die zweite Section ihre eigene Trigger-Position
// schon VORHER (vor dem Einfügen des ersten Spacers) gemessen, überlappt
// ihr Pin-Bereich sichtbar mit dem der ersten Section. Weder ein verzöger-
// ter Refresh (rAF/setTimeout-Kaskaden) noch ein deterministischer
// "warte auf beide"-Zähler haben das zuverlässig behoben, weil zwischen
// den beiden Islands immer eine nicht kontrollierbare asynchrone Lücke
// bleibt. Innerhalb EINER Komponente laufen beide ScrollTrigger.create()-
// Aufrufe dagegen synchron nacheinander im selben Tick – die zweite sieht
// den Pin-Spacer der ersten garantiert, ohne jede Wartezeit.

export interface WieStep {
	number: string;
	tagline: string;
	word: string[];
	headlineFont?: "display" | "doku" | "news";
	text: string;
	image?: string;
	imageAlt?: string;
}

export interface WasStep {
	number: string;
	tagline: string;
	scriptFont?: "script" | "news-script";
	word: string[];
	headlineFont?: "display" | "doku" | "news";
	href: string;
	linkLabel?: string;
	videoSrc?: string;
	focusY?: string;
}

const props = defineProps<{ wieSteps: WieStep[]; wasSteps: WasStep[] }>();

// --- Wie ---
const wieSectionEl = ref<HTMLElement | null>(null);
const wiePinEl = ref<HTMLElement | null>(null);
const wiePanelEls = ref<(HTMLElement | null)[]>([]);
let wieCtx: gsap.Context | undefined;
let wieMobileObserver: IntersectionObserver | undefined;

function setWiePanelRef(el: Element | null, i: number) {
	wiePanelEls.value[i] = el instanceof HTMLElement ? el : null;
}

function updateWiePanels(progress: number) {
	const last = props.wieSteps.length - 1;
	const virtual = progress * last;
	wiePanelEls.value.forEach((el, i) => {
		if (!el) return;
		const opacity = Math.max(0, 1 - Math.abs(virtual - i));
		el.style.opacity = String(opacity);
		el.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
	});
}

function initWieDesktopPin() {
	const section = wieSectionEl.value;
	const pin = wiePinEl.value;
	if (!section || !pin) return;

	const last = props.wieSteps.length - 1;
	updateWiePanels(0);

	wieCtx = gsap.context(() => {
		ScrollTrigger.create({
			trigger: section,
			start: "top top",
			end: () => `+=${last * window.innerHeight * 1.15}`,
			pin,
			scrub: true,
			onUpdate: (self) => updateWiePanels(self.progress),
		});
	}, section);
}

function initWieMobileReveal() {
	wieMobileObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add("step-panel--visible");
				}
			}
		},
		{ rootMargin: "-10% 0px -10% 0px", threshold: 0 },
	);
	for (const el of wiePanelEls.value) {
		if (el) wieMobileObserver.observe(el);
	}
}

// --- Was ---
const wasSectionEl = ref<HTMLElement | null>(null);
const wasPinEl = ref<HTMLElement | null>(null);
const wasPanelEls = ref<(HTMLElement | null)[]>([]);
const wasVideoEls = ref<(HTMLIFrameElement | null)[]>([]);
let wasCtx: gsap.Context | undefined;
let wasMobileObserver: IntersectionObserver | undefined;
let wasLazyObserver: IntersectionObserver | undefined;
let wasSectionNearViewport = false;
let wasLastActiveIndex = -1;

function setWasPanelRef(el: Element | null, i: number) {
	wasPanelEls.value[i] = el instanceof HTMLElement ? el : null;
}

function setWasVideoRef(el: Element | null, i: number) {
	wasVideoEls.value[i] = el instanceof HTMLIFrameElement ? el : null;
}

function setActiveWasVideo(index: number) {
	wasVideoEls.value.forEach((iframe, i) => {
		if (!iframe) return;
		if (i === index) {
			const src = iframe.dataset.src;
			if (src && iframe.getAttribute("src") !== src) {
				iframe.setAttribute("src", src);
			}
		} else if (iframe.getAttribute("src")) {
			iframe.removeAttribute("src");
		}
	});
}

function updateWasPanels(progress: number) {
	const last = props.wasSteps.length - 1;
	const virtual = progress * last;
	wasPanelEls.value.forEach((el, i) => {
		if (!el) return;
		const opacity = Math.max(0, 1 - Math.abs(virtual - i));
		el.style.opacity = String(opacity);
		el.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
	});

	if (!wasSectionNearViewport) return;
	const nearest = Math.round(virtual);
	if (nearest !== wasLastActiveIndex) {
		wasLastActiveIndex = nearest;
		setActiveWasVideo(nearest);
	}
}

function initWasDesktopPin() {
	const section = wasSectionEl.value;
	const pin = wasPinEl.value;
	if (!section || !pin) return;

	updateWasPanels(0);

	wasCtx = gsap.context(() => {
		ScrollTrigger.create({
			trigger: section,
			start: "top top",
			end: () => `+=${(props.wasSteps.length - 1) * window.innerHeight * 1.15}`,
			pin,
			scrub: true,
			onUpdate: (self) => updateWasPanels(self.progress),
		});
	}, section);

	wasLazyObserver = new IntersectionObserver(
		(entries) => {
			if (!wasSectionNearViewport && entries.some((e) => e.isIntersecting)) {
				wasSectionNearViewport = true;
				setActiveWasVideo(wasLastActiveIndex === -1 ? 0 : wasLastActiveIndex);
			}
		},
		{ rootMargin: "200px 0px" },
	);
	wasLazyObserver.observe(section);
}

function initWasMobileReveal() {
	wasMobileObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				const i = wasPanelEls.value.indexOf(entry.target as HTMLElement);
				if (i === -1) continue;
				if (entry.isIntersecting) {
					entry.target.classList.add("step-panel--visible");
					setActiveWasVideo(i);
				}
			}
		},
		{ threshold: 0.5 },
	);
	for (const el of wasPanelEls.value) {
		if (el) wasMobileObserver.observe(el);
	}
}

onMounted(() => {
	const reducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	const isDesktop = window.matchMedia("(min-width: 768px)").matches;

	if (isDesktop && !reducedMotion) {
		// Reihenfolge ist der ganze Punkt: "Wie" zuerst (Pin-Spacer entsteht
		// synchron), "Was" direkt danach im selben Tick – sieht den Spacer
		// garantiert schon.
		initWieDesktopPin();
		initWasDesktopPin();
	} else {
		initWieMobileReveal();
		initWasMobileReveal();
	}
});

onUnmounted(() => {
	wieCtx?.revert();
	wasCtx?.revert();
	wieMobileObserver?.disconnect();
	wasMobileObserver?.disconnect();
	wasLazyObserver?.disconnect();
});
</script>

<template>
	<section id="wie">
		<div class="mx-auto max-w-6xl px-6 pt-24 md:px-10">
			<div class="flex items-baseline gap-4">
				<p class="font-mono text-[10px] tracking-[0.26em] text-ink-muted">WIE ICH ARBEITE</p>
				<div class="h-px flex-1 bg-line"></div>
				<p class="font-script text-2xl text-accent">vier Kapitel</p>
			</div>
		</div>

		<section ref="wieSectionEl" class="relative">
			<div ref="wiePinEl" class="relative flex flex-col justify-center overflow-hidden md:h-screen">
				<div class="mx-auto w-full max-w-6xl px-6 md:px-10">
					<div
						v-for="(step, i) in wieSteps"
						:key="step.number"
						:ref="(el) => setWiePanelRef(el as Element | null, i)"
						class="step-panel md:absolute md:inset-0 md:flex md:items-center md:px-6 md:py-24 lg:px-10"
					>
						<div class="grid items-center gap-8 md:mx-auto md:w-full md:max-w-6xl md:grid-cols-2">
							<div>
								<p class="font-mono text-xs tracking-[0.3em] text-script-accent">
									{{ step.number }}_
								</p>
								<p class="mt-2 font-script text-2xl text-accent md:text-4xl">
									{{ step.tagline }}
								</p>
								<p
									class="leading-[0.86] text-ink"
									:class="[
										step.headlineFont === 'doku'
											? 'font-doku font-black text-5xl md:text-7xl'
											: step.headlineFont === 'news'
												? 'font-news font-extralight tracking-normal text-5xl md:text-7xl'
												: 'font-display text-5xl md:text-7xl',
									]"
								>
									<template v-for="(line, li) in step.word" :key="li">
										<br v-if="li > 0" />{{ line }}
									</template>
								</p>
								<p class="mt-4 max-w-lg font-sans text-sm text-ink-muted md:text-base">
									{{ step.text }}
								</p>
							</div>
							<div class="relative aspect-[16/10] overflow-hidden border border-line bg-surface">
								<img
									v-if="step.image"
									:src="step.image"
									:alt="step.imageAlt ?? step.word.join(' ')"
									class="h-full w-full object-cover"
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	</section>

	<section id="was">
		<div class="mx-auto max-w-6xl px-6 pt-24 pb-8 md:px-10">
			<h2 class="font-display text-3xl uppercase tracking-wide md:text-4xl">
				Drei Arten, Geschichten zu erzählen
			</h2>
		</div>

		<section ref="wasSectionEl" class="relative">
			<div ref="wasPinEl" class="relative overflow-hidden md:h-screen">
				<div
					v-for="(step, i) in wasSteps"
					:key="step.number"
					:ref="(el) => setWasPanelRef(el as Element | null, i)"
					class="step-panel relative h-[100svh] w-full overflow-hidden md:absolute md:inset-0 md:h-full"
				>
					<iframe
						v-if="step.videoSrc"
						:ref="(el) => setWasVideoRef(el as Element | null, i)"
						:data-src="step.videoSrc"
						class="video-cover"
						:style="step.focusY ? { '--video-focus-y': step.focusY } : undefined"
						:title="step.word.join(' ')"
						allow="autoplay; encrypted-media"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/70" />

					<div class="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-6 pb-16 md:px-10 md:pb-20">
						<p class="font-mono text-xs tracking-[0.3em] text-white/50">{{ step.number }}_</p>
						<p
							class="text-script-accent text-3xl md:text-5xl"
							:class="step.scriptFont === 'news-script' ? 'font-doku italic font-black' : 'font-script'"
						>
							{{ step.tagline }}
						</p>
						<h3
							class="uppercase leading-[0.85] tracking-tight text-white"
							:class="[
								step.headlineFont === 'doku' && 'font-doku font-black text-5xl md:text-8xl',
								step.headlineFont === 'news' && 'font-news font-extralight tracking-normal text-5xl md:text-8xl',
								(!step.headlineFont || step.headlineFont === 'display') && 'font-display text-5xl md:text-8xl',
							]"
						>
							<template v-for="(line, li) in step.word" :key="li">
								<br v-if="li > 0" />{{ line }}
							</template>
						</h3>
						<a
							:href="step.href"
							class="mt-2 inline-block w-fit font-mono text-xs uppercase tracking-widest text-white/80 transition hover:text-white"
						>
							[ {{ step.linkLabel ?? "mehr erfahren" }} ]
						</a>
					</div>
				</div>
			</div>
		</section>
	</section>
</template>

<style scoped>
@media (min-width: 768px) {
	.step-panel {
		/* Startwert bis JS den ersten onUpdate-Frame gesetzt hat; danach
		   übernimmt ausschließlich das Inline-Style aus updateWiePanels()/
		   updateWasPanels(). */
		opacity: 0;
	}
}

@media (max-width: 767.98px) {
	.step-panel {
		opacity: 0;
		transform: translateY(24px);
		transition:
			opacity 0.6s ease,
			transform 0.6s ease;
	}

	.step-panel--visible {
		opacity: 1;
		transform: translateY(0);
	}

	#wie .step-panel {
		padding-block: 3rem;
		border-top: 1px solid var(--color-line);
	}
}

@media (prefers-reduced-motion: reduce) {
	.step-panel {
		position: static !important;
		opacity: 1 !important;
		transform: none !important;
		transition: none !important;
		pointer-events: auto !important;
	}
}
</style>
