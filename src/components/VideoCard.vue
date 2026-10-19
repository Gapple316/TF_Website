<script setup lang="ts">
defineProps<{
	title: string;
	description: string;
	client?: string;
	meta?: string;
	thumbnailUrl?: string;
	badge?: string;
	detailHref: string;
}>();
</script>

<template>
	<a :href="detailHref" class="group relative block aspect-video overflow-hidden bg-surface">
		<img
			v-if="thumbnailUrl"
			:src="thumbnailUrl"
			:alt="title"
			class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
		/>
		<div v-else class="h-full w-full bg-surface" />
		<span
			v-if="badge"
			class="absolute left-4 top-4 bg-accent px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-white"
		>
			{{ badge }}
		</span>
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

		<div
			class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5"
		>
			<p class="font-display text-lg uppercase tracking-wide text-white">
				{{ title }}
			</p>
			<p v-if="client || meta" class="font-mono text-[10px] tracking-widest text-white/70">
				{{ [client, meta].filter(Boolean).join(" · ") }}
			</p>
		</div>
	</a>
</template>
