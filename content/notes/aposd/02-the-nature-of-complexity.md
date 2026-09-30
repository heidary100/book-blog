---
title: "The Nature of Complexity"
book: aposd
chapter: 2
date: 2026-09-30
summary: "Complexity is anything that makes a system hard to understand and modify; it stems from dependencies and obscurity and accumulates in small increments."
tags: [complexity]
---

> Complexity is anything about a system's structure that makes it hard to understand and modify. It shows up as change amplification, cognitive load, and unknown unknowns, and it is caused by exactly two things: dependencies and obscurity. Because it accumulates in tiny increments, the only workable defense is zero tolerance.

## The big idea

You cannot fight an enemy you cannot see, and recognizing complexity is a crucial design skill: it is easier to tell whether a design is simple than to create a simple design. Once you can recognize that a system is too complicated, you can use that judgment to steer your designs toward simplicity — trying a different approach whenever a design looks complicated, and noticing over time which techniques correlate with simpler results.

The chapter lays out the skeleton every later chapter builds on: complexity manifests itself in three ways (change amplification, cognitive load, unknown unknowns), is caused by two things (dependencies and obscurity), and accumulates in small increments.

## Section by section

### 2.1 Complexity defined

The definition is deliberately practical: "Complexity is anything related to the structure of a software system that makes it hard to understand and modify the system." Its familiar forms: code whose workings you can't understand, a small improvement that takes enormous effort, no clear idea which parts must change, fixing one bug and introducing another. A cost/benefit reading works too: complex systems make small improvements expensive; simple systems make large improvements cheap.

Three refinements. First, complexity is what a developer experiences at a particular point in time for a particular goal — not overall size or sophistication: a large, feature-rich system that is easy to work on is not complex by this definition (though most in fact are), while a small, unsophisticated system can be quite complex. Second, complexity is weighted by contact frequency: overall complexity C is determined by each part's complexity cp weighted by the fraction of time developers spend working on that part tp (C = Σ cp·tp). A few complicated parts that almost never need touching contribute little, so "Isolating complexity in a place where it will never be seen is almost as good as eliminating the complexity entirely." Third, complexity is more apparent to readers than writers: if others find your code complex, it is — probe them for why. Your job is to create code that others can work with easily, not just you.

### 2.2 Symptoms of complexity

- **Change amplification**: a seemingly simple change requires modifications in many places. In early web sites every page hardcoded its banner background color (Figure 2.1a), so a restyle meant hand-editing every page — nearly impossible at thousands of pages; specifying the color once in a central place (2.1b) makes it a single modification. A goal of good design is to reduce the amount of code affected by each design decision.
- **Cognitive load**: how much a developer needs to know to complete a task; higher load means more learning time and more bugs from missed essentials. Example: a C function that allocates memory and expects the caller to free it — a leak if forgotten; restructuring so the allocating module also frees removes the burden. Sources include APIs with many methods, global variables, inconsistencies, and dependencies between modules. Lines of code is a bad proxy for simplicity: some frameworks need only a few lines, but figuring out which lines is extremely difficult — sometimes an approach requiring *more* code is simpler because it lowers cognitive load.
- **Unknown unknowns**: it is not obvious which code must be modified or what you need to know. Figure 2.1(c): some pages display an emphasis color — a darker shade of the banner background — hardcoded per page; changing the central bannerBg variable silently leaves the emphasis colors stale, and even a developer who knows the trap may have to search every page. Worst of the three: with amplification you at least know what to change, and with high load you at least know what to read, but an unknown unknown means there is something you need to know with no way to find out that it exists — the only certain cure would be reading every line of the system (impossible at scale), and even that can miss an undocumented design decision. The antidote is an **obvious** system: one where a quick guess about a change is likely to be correct (Chapter 18).

### 2.3 Causes of complexity

A **dependency** exists when a piece of code cannot be understood and modified in isolation — other code must be considered and/or modified when it changes. Examples: pages that must share a background color; the sender and receiver of a network protocol; a method's signature versus all its callers. Dependencies are fundamental and even intentional — every new class creates dependencies around its API — so the goal is to reduce their number and make those that remain simple and obvious. The revamped web site does exactly that: it replaces page-to-page dependencies with a dependency on a central bannerBg value that is obvious, searchable, and compiler-checked when renamed. A nonobvious dependency became a simpler, more obvious one.

**Obscurity** is important information that is not obvious: a name like `time` that says almost nothing, missing units that force you to scan usages, a message table that must gain an entry for each new error status but whose existence is invisible from the status declaration, one name used for two purposes. Obscurity often rides on dependencies (you don't realize one exists) and is often blamed on inadequate documentation (Chapter 13), but it is fundamentally a design issue: a clean, obvious design needs less documentation, and needing extensive documentation is itself a red flag. The mapping: dependencies lead to change amplification and cognitive load; obscurity creates unknown unknowns and also contributes to cognitive load.

### 2.4 Complexity is incremental

Complexity is not one catastrophic error; it is the accumulation of hundreds or thousands of small dependencies and obscurities, no single one of which noticeably affects maintainability. That is what makes it hard to control: it is easy to convince yourself that the little complexity your current change adds is no big deal — but if every developer reasons that way on every change, complexity builds rapidly. Once accumulated it is hard to remove, because fixing one dependency or obscurity makes no visible difference. The only way to slow the growth is a "zero tolerance" philosophy (Chapter 3).

### 2.5 Conclusion

Dependencies and obscurities accumulate into the three symptoms; as complexity rises, each new feature demands more modifications, more information-gathering, and sometimes information that cannot be found at all. Bottom line: complexity makes it difficult and risky to modify an existing code base.

## Red flags to watch for

- **Extensive documentation required**: if using part of the system safely demands a lot of documentation, the design itself is probably at fault; the best fix is simplifying the design, not writing more words.

## Key terms

- **Complexity**: anything related to the structure of a software system that makes it hard to understand and modify the system.
- **Change amplification**: a seemingly simple change requires code modifications in many different places.
- **Cognitive load**: how much a developer needs to know in order to complete a task.
- **Unknown unknowns**: it is not obvious which code must be modified or what information is required; the worst manifestation of complexity.
- **Obvious (system)**: the opposite of high cognitive load and unknown unknowns — a quick guess about a change is likely to be correct.
- **Dependency**: exists when a piece of code cannot be understood and modified in isolation.
- **Obscurity**: important information is not obvious — generic names, missing units, hidden constraints, inconsistency.

## My takeaways

<!-- Fill in as you re-read and apply the chapter. -->
-
