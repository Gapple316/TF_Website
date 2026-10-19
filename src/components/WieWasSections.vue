<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
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
	/** Wortgruppe aus `text`, die rot unterstrichen wird (wie auf der Kontaktseite). */
	markWord?: string;
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
	posterUrl?: string;
	bgClipUrl?: string;
	focusY?: string;
	/** Akzentfarbe der Kategorie (gelb/grün/blau) – auf der Startseite gilt das
	 *  Landing-Theme, deshalb kommt die Farbe als Wert statt per CSS-Variable. */
	accent?: string;
}

const props = defineProps<{ wieSteps: WieStep[]; wasSteps: WasStep[] }>();

// Text einmalig um das hervorzuhebende Stichwort herum zerlegen, damit die
// Markierung im Template ohne Funktionsaufrufe pro Render auskommt.
const wieTexte = computed(() =>
	props.wieSteps.map((step) => {
		const start = step.markWord ? step.text.indexOf(step.markWord) : -1;
		if (start === -1 || !step.markWord) {
			return { vor: step.text, wort: "", nach: "" };
		}
		return {
			vor: step.text.slice(0, start),
			wort: step.markWord,
			nach: step.text.slice(start + step.markWord.length),
		};
	}),
);

// Anteil der Scroll-Strecke pro Schritt, in dem ein Panel unverändert mit
// voller Deckkraft "steht", bevor der Crossfade zum nächsten Panel beginnt
// (die übrigen 1 - DWELL_FRACTION sind die komplette Übergangszone zwischen
// zwei benachbarten Panels, während der beide gleichzeitig ein- bzw.
// ausblenden). Ersetzt die vorherige reine Dreiecksfunktion, bei der jedes
// Panel ständig in Bewegung war und nie "ankam".
const DWELL_FRACTION = 0.6;

function stepOpacity(virtual: number, i: number): number {
	const halfDwell = DWELL_FRACTION / 2;
	const distance = Math.abs(virtual - i);
	if (distance <= halfDwell) return 1;
	const fadeWidth = 1 - DWELL_FRACTION;
	return Math.max(0, 1 - (distance - halfDwell) / fadeWidth);
}

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
		const opacity = stepOpacity(virtual, i);
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
			end: () => `+=${last * window.innerHeight * 2.6}`,
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
// Kein Video-Iframe (fremde Origin, siehe .poster-cover in global.css für
// die Begründung): bei vorhandenem bgClipUrl ein selbst gehostetes,
// stummes <video>, sonst ein Standbild. Beide sind normale same-origin
// Elemente, daher keine "nur aktives Video lädt"-Logik nötig.
const wasSectionEl = ref<HTMLElement | null>(null);
const wasPinEl = ref<HTMLElement | null>(null);
const wasPanelEls = ref<(HTMLElement | null)[]>([]);
let wasCtx: gsap.Context | undefined;
let wasMobileObserver: IntersectionObserver | undefined;

function setWasPanelRef(el: Element | null, i: number) {
	wasPanelEls.value[i] = el instanceof HTMLElement ? el : null;
}

function updateWasPanels(progress: number) {
	const last = props.wasSteps.length - 1;
	const virtual = progress * last;
	wasPanelEls.value.forEach((el, i) => {
		if (!el) return;
		const opacity = stepOpacity(virtual, i);
		el.style.opacity = String(opacity);
		el.style.pointerEvents = opacity > 0.5 ? "auto" : "none";
	});
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
			end: () => `+=${(props.wasSteps.length - 1) * window.innerHeight * 2.6}`,
			pin,
			scrub: true,
			onUpdate: (self) => updateWasPanels(self.progress),
		});
	}, section);
}

function initWasMobileReveal() {
	wasMobileObserver = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					entry.target.classList.add("step-panel--visible");
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
									<template v-if="wieTexte[i].wort">
										{{ wieTexte[i].vor
										}}<span class="marked-word" data-mark="underline"
											>{{ wieTexte[i].wort
											}}<svg
												class="marked-word__mark"
												viewBox="0 0 320 40"
												preserveAspectRatio="none"
												aria-hidden="true"
											>
												<path
													class="mark-main"
													d="M6,25 C40,15 78,9 124,8 C170,7 226,13 278,22 C292,24 303,27 314,31"
												/>
												<path class="mark-echo" d="M30,33 C78,25 140,22 196,25" />
											</svg></span
										>{{ wieTexte[i].nach }}
									</template>
									<template v-else>{{ step.text }}</template>
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
			<!-- Gleicher Aufbau wie "Wie ich arbeite", "Vertrauen" und "Wer":
			     Mono-Label, Haarlinie, Zierschrift-Phrase. -->
			<div class="flex flex-wrap items-baseline gap-x-4 gap-y-1">
				<p class="font-mono text-[10px] tracking-[0.26em] text-ink-muted">WAS</p>
				<div class="h-px min-w-6 flex-1 bg-line"></div>
				<h2 class="font-script text-2xl text-accent">
					drei Arten, Geschichten zu erzählen
				</h2>
			</div>
		</div>

		<section ref="wasSectionEl" class="relative">
			<div ref="wasPinEl" class="relative overflow-hidden md:h-screen">
				<div
					v-for="(step, i) in wasSteps"
					:key="step.number"
					:ref="(el) => setWasPanelRef(el as Element | null, i)"
					class="step-panel relative h-[100svh] w-full overflow-hidden md:absolute md:inset-0 md:h-full"
				>
					<video
						v-if="step.bgClipUrl"
						:src="step.bgClipUrl"
						:poster="step.posterUrl"
						class="poster-cover"
						:style="step.focusY ? { '--video-focus-y': step.focusY } : undefined"
						autoplay
						muted
						loop
						playsinline
					/>
					<img
						v-else-if="step.posterUrl"
						:src="step.posterUrl"
						alt=""
						class="poster-cover"
						:style="step.focusY ? { '--video-focus-y': step.focusY } : undefined"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/70" />

					<div class="absolute inset-x-0 bottom-0 flex flex-col gap-3 px-6 pb-16 md:px-10 md:pb-20">
						<p class="font-mono text-xs tracking-[0.3em] text-white/50">{{ step.number }}_</p>
						<p
							class="text-script-accent text-3xl md:text-5xl"
							:class="step.scriptFont === 'news-script' ? 'font-doku italic font-black' : 'font-script'"
							:style="step.accent ? { color: step.accent } : undefined"
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
