---
title: "Design It Twice"
book: aposd
chapter: 11
date: 2026-09-30
summary: "Sketch several radically different designs for each major decision before choosing; comparing alternatives is cheap and yields better designs and designers."
tags: [design-process]
---

> Your first idea is unlikely to be your best. For every major design decision, rough out several radically different alternatives and compare their pros and cons — an hour or two for a typical class. The comparison produces better designs, and over time it trains the judgment that makes all future designs better.

## The big idea

Designing software is hard, so the first thought about how to structure a module or system will rarely be the best. The discipline is simple: for each major decision, develop multiple alternatives — sketchy is fine (for an interface, a few of the most important methods suffice) — then list the pros and cons of each. Pick approaches that are *radically different* from each other, because you learn more that way. And even if you are certain only one approach is reasonable, design a second one anyway, no matter how bad you expect it to be: analyzing why it fails is instructive and sharpens the comparison with the others.

The most important criterion for an interface is ease of use for higher-level software, but the comparison should also ask: does one alternative have a simpler interface, a more general-purpose one, or enable a more efficient implementation? The winner may be one of the alternatives — or a new design combining the best features of several.

## Section by section

### The text class example

Designing the class that manages a file's text for a GUI editor, three interface candidates emerge: a **line-oriented** interface (insert, modify, delete whole lines), a **character-oriented** interface (insertions and deletions of single characters), and a **string-oriented** interface operating on arbitrary character ranges that may cross line boundaries. The first two both force extra work on callers: line-oriented makes higher-level software split and join lines for partial-line and multi-line operations like cutting and pasting a selection; character-oriented requires loops for anything touching more than one character, and its performance is likely to be much worse, since each character costs a separate call into the text module.

### Let the weaknesses drive a new design

Sometimes none of the alternatives is attractive — which is itself information. Noticing that both earlier designs force higher-level software to do extra text manipulation is a red flag: if there is going to be a text class, it should handle all text manipulation itself. Since the operations in higher-level software don't correspond to single lines or single characters, the interface must match *them* — and that line of reasoning leads to a range-oriented API that dissolves the problems of both original designs.

### Apply it at every level

Use design-it-twice first to pick a module's interface, then again when designing its implementation: for the text class, candidates include a linked list of lines, fixed-size blocks of characters, or a gap buffer. Note that the goals differ by level — for implementations the most important things are simplicity and performance. The principle scales up too: choosing features for a user interface, or decomposing a system into major modules, also benefits from comparing alternatives.

### The cost is small

For a class-sized module, considering alternatives rarely takes more than an hour or two — trivial against the days or weeks spent implementing it, and the significantly better initial design more than repays the time. Larger modules demand more design exploration, but their implementations also take longer and the payoff of a better design is correspondingly higher.

### Why smart people resist it

Ousterhout observes that really smart people find this principle hardest to embrace. School rewards their first quick idea with a good grade — no second possibility needed — which builds bad work habits that survive until they are promoted into environments with genuinely hard problems. Eventually everyone reaches problems where first ideas are no longer good enough: "no-one is good enough to get it right with their first try." He suspects the subconscious belief is "smart people get it right the first time," so weighing alternatives feels like an admission of not being smart. The truth is the opposite: the problems are really hard — and that's a good thing, since hard problems are more fun than easy ones.

### It compounds into skill

Design-it-twice doesn't just improve the design at hand; it improves the designer. Devising and comparing multiple approaches teaches the factors that make designs better or worse, so over time you can rule out bad designs faster and converge on really great ones.

## Red flags to watch for

- **A class that doesn't do its own job**: when every candidate design forces callers to perform part of the module's core work (higher-level software doing the text manipulation for a text class), the abstraction boundary is wrong — redesign so the module owns its domain.

## Key terms

- **Design it twice**: deliberately developing and comparing multiple (ideally radically different) designs for each major design decision — interface, implementation, feature set, or system decomposition — before committing to one.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
