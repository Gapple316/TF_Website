<script setup lang="ts">
import { ref } from "vue";

defineProps<{
	links: { href: string; label: string }[];
}>();

const open = ref(false);
</script>

<template>
	<div class="md:hidden">
		<button
			type="button"
			class="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5"
			:aria-expanded="open"
			aria-label="Menü öffnen"
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
				class="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-bg text-ink"
			>
				<a
					v-for="link in links"
					:key="link.href"
					:href="link.href"
					class="font-display text-3xl uppercase tracking-wide"
					@click="open = false"
				>
					{{ link.label }}
				</a>
			</div>
		</Transition>
	</div>
</template>
