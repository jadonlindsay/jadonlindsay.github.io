import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One gallery or video entry. `section` says where on the page it appears.
const media = z.object({
  src: z.string().optional(),
  alt: z.string().optional(),
  caption: z.string().optional(),
  section: z.string().default('main'),
  placeholder: z.boolean().default(false),
  fit: z.enum(['cover', 'contain']).default('cover'),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string().optional(),
    role: z.string().optional(),
    dates: z.string().optional(),
    tools: z.string().optional(),
    status: z.string().optional(),
    order: z.number().default(99),
    featured: z.boolean().default(false),
    group: z.enum(['work', 'leadership', 'other']).default('work'),
    link: z.string().optional(),
    summary: z.string().optional(),
    keyMetric: z.string().optional(),
    atAGlance: z.string().optional(),
    facts: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
    imageFolder: z.string().optional(),
    cardImage: z.string().optional(),
    cardFit: z.enum(['cover', 'contain']).default('cover'),
    cardAlt: z.string().optional(),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    gallery: z.array(media).default([]),
    videos: z.array(media).default([]),
    model3d: z.string().optional(),
  }),
});

export const collections = { projects };
