// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeMediaUrl from './scripts/rehype-media-url.mjs';
import rehypeImageFigure from './scripts/rehype-image-figure.mjs';
import rehypeExternalLinks from './scripts/rehype-external-links.mjs';
import remarkApps from './scripts/remark-apps.mjs';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkApps],
    rehypePlugins: [rehypeImageFigure, rehypeMediaUrl, rehypeExternalLinks],
  },
});