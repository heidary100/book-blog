---
title: Summary of Red Flags
book: aposd
chapter: 91
date: 2026-09-30
summary: Fourteen design smells from the book in one checklist — if you spot one of these, the design around it needs another look.
tags: [complexity, design-process, code-review]
---

> Red flags are the *symptoms* of complexity — you can disagree about a design, but a red flag in the code is a concrete signal worth stopping for. Each entry links to the chapter that explains it.

## The flags

- **Shallow module** — the interface isn't much simpler than the implementation; using it buys you nothing. ([Ch. 4](/books/aposd/04-modules-should-be-deep))
- **Information leakage** — the same design decision is baked into multiple modules; change one, change them all. ([Ch. 5](/books/aposd/05-information-hiding-and-leakage))
- **Temporal decomposition** — code is split by execution order ("step 1, step 2") instead of by what knowledge it hides. ([Ch. 5](/books/aposd/05-information-hiding-and-leakage))
- **Overexposure** — an API forces callers to learn about rarely used features just to use the common ones. ([Ch. 6](/books/aposd/06-general-purpose-modules-are-deeper))
- **Pass-through method** — a method that mostly forwards its arguments to another method with a similar signature. ([Ch. 7](/books/aposd/07-different-layer-different-abstraction))
- **Repetition** — a nontrivial piece of code appears over and over; each copy is one more thing to update. ([Ch. 9](/books/aposd/09-better-together-or-better-apart))
- **Special/general mixture** — special-purpose logic tangled into general-purpose code instead of being cleanly separated. ([Ch. 9](/books/aposd/09-better-together-or-better-apart))
- **Conjoined methods** — two methods so interdependent you can't understand one without reading the other's implementation. ([Ch. 9](/books/aposd/09-better-together-or-better-apart))
- **Comment repeats code** — the comment restates what the next line obviously does; it adds noise, not insight. ([Ch. 13](/books/aposd/13-comments-describe-what-code-cant))
- **Implementation documentation contaminates the interface** — interface comments leak implementation details users shouldn't need. ([Ch. 13](/books/aposd/13-comments-describe-what-code-cant))
- **Vague name** — the name is so imprecise (or over-loaded) it carries almost no information. ([Ch. 14](/books/aposd/14-choosing-names))
- **Hard to pick name** — struggling to name an entity precisely is itself a signal the entity's purpose is muddled. ([Ch. 14](/books/aposd/14-choosing-names))
- **Hard to describe** — the documentation for a variable or method must be long to be complete; a deep abstraction describes itself briefly. ([Ch. 15](/books/aposd/15-write-the-comments-first))
- **Nonobvious code** — the behavior or meaning of code isn't apparent on first reading. ([Ch. 18](/books/aposd/18-code-should-be-obvious))

## How to use this page

- During code review: you don't need to argue taste — pointing at a red flag is enough to justify a second look.
- During refactoring: pick the flag that hurts most and fix the design around it, rather than doing wholesale rewrites.
- Pair with the [design principles summary](/books/aposd/90-summary-of-design-principles) — each flag traces back to a violated principle.
