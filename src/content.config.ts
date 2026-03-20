import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const content = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './content' }),
	schema: z.object({
		title: z.string(),
		updated: z.string().optional(),
	}),
});

export const collections = { content };
