<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

defineProps<{
	links: { href: string; label: string }[];
}>();

const open = ref(false);

// Der Teleport darf erst nach dem Mount im Baum auftauchen. Beim
// serverseitigen Rendern der Insel existiert das Ziel (<body>) aus Sicht der
// Komponente nicht, und der dadurch entstehende Hydrations-Mismatch hat
// reproduzierbar den kompletten <header> aus dem DOM entfernt – samt
// Burger-Button und dem Logo, an dem die Hero-Animation ihr Ziel misst.
const mounted = ref(false);
onMounted(() => {
	mounted.value = true;
});

// Das Overlay wird per <Teleport> an <body> gehängt und NICHT im <header>
// gerendert: der Header trägt über [data-hero-reveal] ein transform, und ein
// transform macht das Element zum Bezugsrahmen für position:fixed. Im Header
// wäre "fixed inset-0" deshalb nur so groß wie die Kopfzeile – das Overlay
// schrumpfte auf einen Streifen, die Menüpunkte liefen darunter ins Bild.

function close() {
	open.value = false;
}

function onKeydown(event: KeyboardEvent) {
	if (event.key === "Escape") close();
}

// Solange das Menü offen ist, darf die Seite dahinter nicht mitscrollen. Die
// Klasse am <body> blendet zusätzlich das Header-Logo aus – es ist weiß und
// würde auf dem hellen Overlay der Imagefilm-/News-Themes untergehen.
watch(open, (isOpen) => {
	document.body.style.overflow = isOpen ? "hidden" : "";
	document.body.classList.toggle("menu-offen", isOpen);
	if (isOpen) document.addEventListener("keydown", onKeydown);
	else document.removeEventListener("keydown", onKeydown);
});

onUnmounted(() => {
	document.body.style.overflow = "";
	document.body.classList.remove("menu-offen");
	document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
	<div class="md:hidden">
		<button
			type="button"
			class="nav-burger relative z-[60] flex h-11 w-11 flex-col items-center justify-center gap-1.5"
			:aria-expanded="open"
			:aria-label="open ? 'Menü schließen' : 'Menü öffnen'"
			@click="open = !open"
		>
			<span
				class="block h-px w-6 bg-current transition-transform duration-300"
				:class="open ? 'translate-y-[3.5px] rotate-45' : ''"
			/>
			<span
				class="block h-px w-6 bg-current transition-opacity duration-300"
				:class="open ? 'opacity-0' : 'opacity-100'"
			/>
			<span
				class="block h-px w-6 bg-current transition-transform duration-300"
				:class="open ? '-translate-y-[3.5px] -rotate-45' : ''"
			/>
		</button>

		<Teleport v-if="mounted" to="body">
			<Transition
				enter-active-class="transition duration-300 ease-out"
				enter-from-class="opacity-0"
				enter-to-class="opacity-100"
				leave-active-class="transition duration-200 ease-in"
				leave-from-class="opacity-100"
				leave-to-class="opacity-0"
			>
				<div
					v-if="open"
					class="fixed inset-0 z-[55] flex flex-col items-center justify-center gap-7 bg-bg text-ink md:hidden"
				>
					<a
						v-for="link in links"
						:key="link.href"
						:href="link.href"
						class="font-display text-3xl uppercase tracking-wide transition-colors hover:text-accent"
						@click="close"
					>
						{{ link.label }}
					</a>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>
