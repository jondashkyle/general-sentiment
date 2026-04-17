---
title: Browser
contributors: /jon-kyle
categories: /projects
github: 'https://github.com/General-Sentiment/browser'
---
A minimal fully modifiable browser with (basically) no interface. The [source ships with the app](/shape-source). Want to add or change a feature? Go ahead. 

When the app updates, your edits stay put. An LLM merges upstream changes around whatever you've done. This process is inexact by design. Updates ship code alongside a description of the intent. The LLM reads that intent against whatever your copy has become. Two users diverge differently, get the same update, and land in different places. Features drift. Closer to genetic code than software: changes graft like a living thing, and the outcome depends on what was already there.

The browser centers on a simple plugin architecture. Ask an agent to build a bookmarking feature and it gets the same access the core code has. You build on the same surface the browser is built on.

Ships with a [General Fence](/fence), letting you modify the platforms you visit. Hide elements that lead to distraction, or that you don’t wish to see.
