---
title: Summary of Design Principles
book: aposd
chapter: 90
date: 2026-09-30
summary: The book's sixteen design principles gathered in one place — the fastest way to revise the whole philosophy.
tags: [complexity, deep-modules, design-process, mindset]
---

> The whole book compressed into sixteen principles. Skim this page when you need a refresher; each line links back to the chapter that develops it.

## The principles

1. **Complexity is incremental — sweat the small stuff.** Complexity accumulates through dozens of small compromises, not one big disaster. ([Ch. 2](/books/aposd/02-the-nature-of-complexity))
2. **Working code isn't enough.** Code that works but has a bad design creates debt you pay every time you touch it. ([Ch. 3](/books/aposd/03-working-code-isnt-enough))
3. **Make continual small investments to improve system design.** The 10–20% strategic mindset: every change leaves the design a little better. ([Ch. 3](/books/aposd/03-working-code-isnt-enough))
4. **Modules should be deep.** The best modules provide a lot of capability behind a small interface. ([Ch. 4](/books/aposd/04-modules-should-be-deep))
5. **Design interfaces to make the most common usage as simple as possible.** Optimize the API for the everyday case; make rare cases possible but unobtrusive. ([Ch. 4](/books/aposd/04-modules-should-be-deep))
6. **A simple interface matters more than a simple implementation.** Complexity borne by a module's implementer is contained; complexity pushed into its users multiplies. ([Chs. 4, 6](/books/aposd/04-modules-should-be-deep))
7. **General-purpose modules are deeper.** A slightly more general API often ends up both simpler for callers and more reusable. ([Ch. 6](/books/aposd/06-general-purpose-modules-are-deeper))
8. **Separate general-purpose and special-purpose code.** Mixing the two bloats interfaces and hides the design's real structure. ([Chs. 6, 9](/books/aposd/06-general-purpose-modules-are-deeper))
9. **Different layers should have different abstractions.** If adjacent layers look alike (pass-throughs, thin wrappers), the decomposition is wrong. ([Ch. 7](/books/aposd/07-different-layer-different-abstraction))
10. **Pull complexity downward.** It's better for a module's implementer to suffer complexity than for all of its users to. ([Ch. 8](/books/aposd/08-pull-complexity-downwards))
11. **Define errors out of existence.** Redesign APIs so the exceptional case has a normal, well-defined behavior instead of throwing. ([Ch. 10](/books/aposd/10-define-errors-out-of-existence))
12. **Design it twice.** Sketch two credible designs for any major piece; comparing them teaches you what really matters. ([Ch. 11](/books/aposd/11-design-it-twice))
13. **Comments should describe things that are not obvious from the code.** Comments capture the why, the constraints, and the mental model the code can't express. ([Ch. 13](/books/aposd/13-comments-describe-what-code-cant))
14. **Software should be designed for ease of reading, not ease of writing.** Code is read far more often than it is written. ([Ch. 18](/books/aposd/18-code-should-be-obvious))
15. **The increments of software development should be abstractions, not features.** Agile works when each increment deepens the design rather than piling features on a shallow base. ([Ch. 19](/books/aposd/19-software-trends))
16. **Separate what matters from what doesn't, and emphasize what matters.** The core of clear design (and clear writing): readers should see the important parts first. ([Ch. 21](/books/aposd/21-decide-what-matters))

## How to use this page

- Before a design review: pick the three principles most relevant to the change.
- When a codebase starts feeling heavy: walk the list and ask which principle you've been violating lately.
- Pair with the [red flags summary](/books/aposd/91-summary-of-red-flags) — principles are the cause, red flags are the symptoms.
