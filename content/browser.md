---
title: Browser
contributors: /jon-kyle
categories: /projects
github: 'https://github.com/General-Sentiment/browser'
---
A minimal fully modifiable browser with (basically) no interface. Built on the principles of [Shape Source](/shape-source). The source ships with the app. No build step, no bundler, no transpiler. The code you see is the code that runs.

When the app updates, your edits stay put. An LLM merges upstream changes around whatever you've done. The codebase evolves like a living thing. Upstream improvements graft onto your local mutations. The result is software that is partly what shipped and partly what you made it into.

This process is inexact by design. Updates ship code alongside a description of the intent. The LLM reads that intent against whatever your copy has become. Two users diverge differently, get the same update, and land in different places. Features drift. Behavior shifts. Closer to genetic code than software: changes graft onto a living organism, and the outcome depends on what was already there. Every copy becomes its own lineage.

The browser centers on a simple plugin architecture. There is no privileged internal API. Settings, history, window state, site rules, UI manifest, update flow all run on the same primitives. Ask an agent to build a bookmarking feature and it gets the same access the core code has. You build on the same surface the browser is built on.

Ships with a [General Fence](/fence).

### How updates merge

The app keeps a manifest of SHA-256 hashes at `~/.general-browser/ui-manifest.json`. At each launch it re-hashes the bundled files and compares them. Files get tagged added, modified, or deleted. It also checks whether your copy diverged, so conflicts are marked.  

Clicking **Open** on the banner writes `UPDATE.md` (human) and `pending-update.yml` (machine), then reveals the directory. Run `/update-ui` in an agent. Files you didn't touch get overwritten from the bundle. Files you did touch are where the LLM earns its keep. It reads both versions, understands the intent, and merges. Your edits win. If both sides changed the same region, your version stays and a comment notes what upstream intended.

Click **Mark as Resolved** to re-baseline the manifest. The cycle resets for the next update.

  

This process is inexact by design. Updates ship code alongside a description of the intent. The LLM reads that intent against whatever your copy has become. Two users diverge differently, get the same update, and land in different places. Features drift. Behavior shifts. Closer to genetic code than software: changes graft onto a living organism, and the outcome depends on what was already there. Every copy becomes its own lineage.
