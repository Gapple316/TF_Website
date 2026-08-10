import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
	loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
	schema: z.object({
		title: z.string(),
		category: z.enum(["imagefilm", "news", "doku"]).optional(),
		videoUrl: z.string().url().optional(),
		startSeconds: z.number().optional(),
		client: z.string().optional(),
		year: z.number().optional(),
		duration: z.string().optional(),
		description: z.string(),
		tags: z.array(z.string()).optional(),
		featured: z.boolean().optional(),
		embeddable: z.boolean().optional(),
	}),
});

export const collections = { projects };
