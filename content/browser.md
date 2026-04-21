---
title: Browser
contributors: /jon-kyle
categories: /projects
repository: 'https://github.com/General-Sentiment/browser'
---
A fully modifiable ultralight browser with (basically) no interface. Want to add or change a feature? Go ahead. 

The [source ships with the app](/shape-source) to modify with the assistance of agents.  When the app updates, your edits stay put. Updates ship code alongside a description of the intent.  An agent merges upstream changes around whatever you've done by reading that intent against whatever your copy has become.

This process is inexact by design.

Two users may diverge, get the same update, and land in different places. Features drift. It loosely resembles biologic evolution: changes graft like a living thing, and the outcome depends on what was already there.

Browser is built on a simple plugin architecture. Ask an agent to build a bookmarking feature and it gets the same access the core code has. You build on the same surface the browser is built on.

Ships with a [fence](/fence), letting you modify the platforms you visit. Hide elements that lead to distraction and you’d prefer not to see.
