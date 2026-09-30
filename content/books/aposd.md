---
title: A Philosophy of Software Design
author: John K. Ousterhout
year: 2021
cover: /covers/aposd.jpg
status: reading
started: 2026-09-30
summary: Software design is the art of managing complexity — the book argues for deep modules, incremental strategic design, and fighting complexity one piece at a time.
tags: [software-design, architecture, complexity]
---

*A Philosophy of Software Design* (2nd edition, Yaknyam Press) is John Ousterhout's distillation of decades of teaching Stanford's software design course and building systems like Raft, RAMCloud, and Tcl. Its central claim: **complexity is the single greatest difficulty in software development**, and everything in the book flows from a single question — *does this design choice increase or decrease complexity?*

The book pairs every principle with practical *red flags* — smells that signal a violation — which makes it unusually actionable for revision. Two ideas anchor everything:

1. **Deep modules** — small interfaces hiding large implementations.
2. **Strategic programming** — investing a little extra (10–20%) in design on every change, so the system gets better over time instead of accumulating tactical debris.

## How these notes work

Each chapter has its own note, organized section-by-section, ending with an empty **"My takeaways"** section — that part is mine to fill in as I apply the ideas. The two appendices (all design principles and all red flags in one place) are the fastest way to revise the whole book in a few minutes.

Useful companion when revising: [the book's official page](https://web.stanford.edu/~ouster/cgi-bin/aposd.php).
