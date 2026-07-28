<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const logoEl = ref<HTMLImageElement | null>(null);
let ctx: gsap.Context | undefined;

onMounted(() => {
	const el = logoEl.value;
	const header = document.querySelector<HTMLImageElement>(
		'header a[href="/"] img',
	);
	if (!el || !header) return;

	ctx = gsap.context(() => {
		const startRect = el.getBoundingClientRect();
		const endRect = header.getBoundingClientRect();

		gsap.set(el, {
			position: "fixed",
			top: startRect.top,
			left: startRect.left,
			width: startRect.width,
			height: startRect.height,
		});

		gsap.to(el, {
			top: endRect.top,
			left: endRect.left,
			width: endRect.width,
			height: endRect.height,
			ease: "none",
			scrollTrigger: {
				trigger: "#hero",
				start: "top top",
				end: "bottom top",
				scrub: true,
			},
		});
	});
});

onUnmounted(() => ctx?.revert());
</script>

<template>
	<img
		ref="logoEl"
		src="/images/logos/true-frame-logo.webp"
		alt="TRUE FRAME"
		class="absolute left-1/2 top-[36%] z-40 w-[55vw] max-w-[420px] -translate-x-1/2 -translate-y-1/2"
	/>
</template>
