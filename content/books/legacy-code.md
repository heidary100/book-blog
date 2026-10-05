---
title: Working Effectively with Legacy Code
author: Michael C. Feathers
year: 2004
cover: /covers/legacy-code.jpg
status: reading
started: 2026-10-04
summary: A field manual for changing code that resists change — find seams, break dependencies, get tests in place, and make edits safely in code nobody dares to touch.
tags: [legacy-code, testing, refactoring]
---

*Working Effectively with Legacy Code* (Prentice Hall, 2004, Robert C. Martin Series) is Michael Feathers' answer to the question every working programmer eventually faces: how do you change code that wasn't designed to be changed? Its most quoted move is redefining the subject itself — **legacy code is not old or badly written code; it is code without tests**. With tests you can change behavior deliberately and verify it; without them, every edit is an act of faith.

The book is organized as a problem-solving manual rather than a narrative. Part I builds the mechanics of change: feedback through tests, **sensing and separation**, the **seam model**, and tools. Part II is an FAQ of problem-titled chapters taken straight from working life — *"I can't get this class into a test harness"*, *"It takes forever to make a change"*, *"I need to change a monster method"*. Part III is a catalog of dependency-breaking techniques: refactorings designed to be done *without* tests, in the service of putting tests in place.

## How these notes work

One note per chapter, section-by-section, ending with an empty **"My takeaways"** section. Two notes work as standalone references: [Chapter 25 — Dependency-Breaking Techniques](/books/legacy-code/25-dependency-breaking-techniques) (the catalog of 24 techniques) and the [Glossary](/books/legacy-code/91-glossary), which collects the book's vocabulary — seams, pinch points, characterization tests, sprouts — in one place.

A natural pairing: [A Philosophy of Software Design](/books/aposd) argues for preventing complexity up front; this book is what to do when prevention has already failed.
