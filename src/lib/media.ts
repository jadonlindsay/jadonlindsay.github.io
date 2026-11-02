import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/projects/**/*.{jpg,jpeg,png,webp}',
  { eager: true },
);

/** Finds a photo by project folder and file name, with an error that says what's missing. */
export function projectImage(folder: string, file: string): ImageMetadata {
  const found = files[`/src/assets/projects/${folder}/${file}`];
  if (!found) {
    throw new Error(`Photo not found: put "${file}" in src/assets/projects/${folder}/ or fix the name in the content file.`);
  }
  return found.default;
}
