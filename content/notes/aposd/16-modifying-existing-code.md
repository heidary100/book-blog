---
title: "Modifying Existing Code"
book: aposd
chapter: 16
date: 2026-09-30
summary: "A system's mature design comes from its changes, not its initial conception: stay strategic when modifying code, and keep comments accurate with placement, no duplication, and diff checks."
tags: [strategic-vs-tactical, comments]
---

> Systems evolve through endless modification, so a mature design is shaped more by its changes than by any original plan. The chapter's first commandment: stay strategic when touching existing code — after each change the system should look as if it had been designed with that change in mind from the start. The rest is comment hygiene: keep comments near the code, never in the commit log alone, avoid duplication, and check diffs before committing.

## The big idea

Chapter 1 argued development is iterative and incremental; the corollary is that you can't conceive the right design up front — it emerges from evolutionary stages of added capabilities and modified modules. Chapters up to now covered squeezing complexity out of initial design; this chapter is about preventing complexity from creeping in during evolution. The threat is the default mindset of the maintainer: "what is the smallest possible change I can make that does what I need?" Each minimal change sneaks in special cases, dependencies, and small distortions, and because complexity is incremental the damage accumulates silently with every step.

The strategic alternative treats every modification as a design opportunity. Ideally, after your change the system has the structure it would have had if designed from scratch with that feature in mind; if the current design is no longer the best one given the change, refactor. Even when a change needs no refactoring, look for small design imperfections to fix while you're in the neighborhood: "If you're not making the design better, you are probably making it worse." This is the investment mindset again — and the chapter is honest about its limits.

## Section by section

### 16.1 Stay strategic

Reprising Chapter 3's tactical/strategic distinction: tactical programming gets something working quickly at the cost of complexity; strategic programming prioritizes great design. When entering existing code for bug fixes or features, developers default to tactical — often justifying minimal diffs by unfamiliarity with the code and fear of introducing bugs. But those minimal changes each add special cases and dependencies, so the design degrades bit by bit. The strategic stance asks instead: is the current design still the best one in light of this change? If not, refactor — with the ideal endpoint that the system looks designed-for-this-change from day one, so the design *improves* with every modification. This is the investment mindset: a little refactoring time now recoups itself in faster future development.

The chapter also restates the commercial-reality caveat from Chapter 3: if the "right way" takes three months and a quick-and-dirty fix takes two hours against a hard deadline, you may have to take the shortcut — likewise if refactoring would break compatibility for many teams. But resist as much as possible. Ask "Is this the best I can possibly do to create a clean system design, given my current constraints?" — maybe a nearly-as-clean alternative exists that takes days rather than months, or you can get your boss to schedule the big refactor after the deadline. Every development organization should budget a small fraction of total effort for cleanup and refactoring; it pays for itself long term.

### 16.2 Maintaining comments: keep the comments near the code

Changes frequently invalidate existing comments, and stale comments are worse than no comments in one respect: enough of them and readers stop trusting *all* comments. The antidote is placement. Put each comment close to the code it describes so that anyone changing the code sees it. The best home for a method's interface comment is the code file, right next to the method body — any change to the method passes by it.

In C/C++, the alternative of putting interface comments in the `.h` file loses on this criterion: headers are far from the bodies, so modifiers won't see (and won't bother opening) them. The objection "but users read headers" doesn't hold: users should get their documentation from tools — Doxygen/Javadoc output, or IDEs that show a method's docs on hover or autocomplete. Given such tools, place documentation where it's most convenient for the people *modifying* the code.

For implementation comments, don't pile everything at the top of the method; push each comment down to the narrowest scope containing all the code it refers to — a separate comment just above each phase rather than one mega-comment describing three phases. A brief overall strategy comment at the top is still good (`// We proceed in three phases: Phase 1: Find feasible candidates; Phase 2: Assign each candidate a score; Phase 3: Choose the best, and remove it`), with details placed at each phase. General rule: the farther a comment sits from its code, the more abstract it should be — abstraction is what makes it robust to code churn.

### 16.3 Comments belong in the code, not the commit log

A common mistake: recording the reasoning behind a change in the commit message only. Nobody needing that information later thinks to scan the repository log, and finding the right message there is tedious anyway. When writing a commit message, ask whether developers will need this information in the future; if so, it belongs in the code. The canonical example is the subtle problem that motivated a change: if it lives only in the log, a later developer may undo the change and innocently re-create the bug. Duplicating it into the commit message too is fine — the code copy is the essential one. This is the placement principle again: documentation goes where developers are most likely to see it, and the commit log is almost never that place.

### 16.4 Maintaining comments: avoid duplication

The second technique: document each design decision exactly once. Duplicated documentation is hard to keep in sync, and unsynced copies mislead silently. If a tricky variable behavior affects many usage sites, document it once at the variable's declaration — the natural place a confused reader checks. If there is no obvious single home, either use a `designNotes` file (Section 13.7) or pick the best available spot, then leave short pointer comments elsewhere ("See the comment in xyz…"). Pointer references fail loudly: if the master comment moves or disappears, readers find nothing where the pointer claims it is and can dig through revision history to fix the reference — whereas stale duplicates give no such signal.

Two further corollaries. Don't redocument one module's decisions inside another: no comments before a method call explaining what the called method does — readers should consult its interface comments, which good IDEs surface automatically; make documentation easy to find, but not by repeating it. And don't duplicate documentation that already exists outside the program: an HTTP implementation need not explain HTTP (link a URL instead), and command methods whose behavior is described in a user manual can simply say "// Implements the Foo command; see the user manual for details." Readers must be able to find all needed documentation — that doesn't mean you must write all of it.

### 16.5 Maintaining comments: check the diffs

A cheap habit that keeps documentation honest: before each commit, spend a few minutes scanning the full diff and confirm every change is reflected in the documentation. The same pre-commit scan catches adjacent sins — leftover debugging code and unfixed TODO items.

### 16.6 Higher-level comments are easier to maintain

Closing observation: higher-level, more abstract comments are the easiest to maintain, because they don't mirror code details — minor code changes don't touch them; only shifts in overall behavior do. Chapter 13 already noted some comments must be detailed and precise, but conveniently, the comments that are most *useful* (those that don't merely repeat the code) are also the most durable.

## My takeaways

<!-- Fill in as you re-read and apply the chapter. -->
-
