# Obsidian Sync

Syncs markdown content from an Obsidian vault into a project's `content/` directory.

## How it works

1. Uses `grep` to efficiently pre-filter vault files for `public: true` and a matching project name (`General Sentiment`)
2. Parses frontmatter with `gray-matter` on matched files only
3. Slugifies the output filename using the `slug` frontmatter field, falling back to the `title` field, falling back to the original filename
4. Strips internal fields (`public`, `project`, `slug`) from the output frontmatter
5. Normalizes `[[wiki-links]]` to standard markdown links
6. Writes to `content/` — only adds or updates, never deletes

## Configuration

Set the vault path in `.env.local` at the project root:

```
OBSIDIAN_VAULT=/path/to/your/vault
```

Or pass it as a CLI argument.

## Usage

Add to `package.json`:

```json
{
  "scripts": {
    "sync": "node scripts/obsidian-sync/index.mjs"
  }
}
```

Then run:

```sh
npm run sync
```
