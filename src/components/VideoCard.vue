<script setup lang="ts">
import { ref } from "vue";

defineProps<{
	title: string;
	description: string;
	client?: string;
	meta?: string;
	embedUrl?: string;
	thumbnailUrl?: string;
}>();

const loaded = ref(false);
</script>

<template>
	<div class="group relative aspect-video overflow-hidden bg-surface">
		<iframe
			v-if="loaded && embedUrl"
			:src="embedUrl"
			class="absolute inset-0 h-full w-full"
			:title="title"
			allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
			allowfullscreen
		/>
		<button
			v-else-if="embedUrl"
			type="button"
			class="absolute inset-0 h-full w-full"
			:aria-label="`${title} abspielen`"
			@click="loaded = true"
		>
			<img
				v-if="thumbnailUrl"
				:src="thumbnailUrl"
				:alt="title"
				class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
			/>
			<div v-else class="h-full w-full bg-surface" />
			<span
				class="absolute inset-0 flex items-center justify-center bg-black/20 transition group-hover:bg-black/10"
			>
				<span
					class="flex h-16 w-16 items-center justify-center rounded-full bg-accent/90 text-white transition group-hover:bg-accent"
				>
					<svg viewBox="0 0 24 24" class="ml-1 h-6 w-6 fill-current">
						<path d="M8 5v14l11-7z" />
					</svg>
				</span>
			</span>
		</button>
		<div
			v-else
			class="absolute inset-0 flex flex-col items-center justify-center gap-2 border border-dashed border-line px-6 text-center"
		>
			<span class="font-script text-2xl text-accent">Video folgt</span>
		</div>

		<div
			v-if="!loaded"
			class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5"
		>
			<p class="font-display text-lg uppercase tracking-wide text-white">
				{{ title }}
			</p>
			<p v-if="client || meta" class="font-mono text-[10px] tracking-widest text-white/70">
				{{ [client, meta].filter(Boolean).join(" · ") }}
			</p>
		</div>
	</div>
</template>
