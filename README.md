# General Sentiment

Client for [generalsentiment.co](https://generalsentiment.co). Built with Astro.

## Setup

```sh
npm install
cp .env.local.example .env.local
```

Set `OBSIDIAN_VAULT` in `.env.local` to the path of your Obsidian vault.

## Content

Content is authored in Obsidian and synced into the `content/` directory. A markdown file is synced when its frontmatter includes:

- `public: true`
- `project: "[[General Sentiment]]"`

The sync script copies matching files, slugifies the filename (using a `slug` frontmatter field if present, otherwise the `title`), strips internal fields, and normalizes `[[wiki-links]]` to standard markdown links.

```sh
npm run sync
```

## Commands

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm install`     | Install dependencies                        |
| `npm run dev`     | Start local dev server at `localhost:4321`   |
| `npm run build`   | Build production site to `./dist/`           |
| `npm run preview` | Preview build locally                       |
| `npm run sync`    | Sync content from Obsidian vault            |
