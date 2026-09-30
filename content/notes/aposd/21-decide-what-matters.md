---
title: "Decide What Matters"
book: aposd
chapter: 21
date: 2026-09-30
summary: "Good design separates what matters from what doesn't: structure systems around the essential, minimize and hide the rest — this is the common core of every technique in the book."
tags: [mindset, complexity]
---

> The unifying skill behind good software design is deciding what matters and what doesn't. Structure the system around the things that matter — making them prominent, repeated, and central — and minimize or hide everything else. Nearly every earlier chapter is an instance of this: interfaces surface what matters, names compress what matters into a few words, performance design bends structure around the critical path.

## The big idea

A design is good when the important things are impossible to miss and the unimportant things are invisible. Ousterhout presents this as the shared heart of the whole book. An abstraction's interface *is* the set of things that matter to its users, with everything else hidden in the implementation. A good variable name is a judgment about which few words convey the most information about that variable. When performance matters, the module should be structured around the performance-critical path — the Buffer redesign of Section 20.4 minimized method calls and special-case checks on the common case.

This makes design a decision problem, not a checklist: at every step the designer is ranking aspects of the system by importance and then allocating visibility and structure accordingly.

## Section by section

### 21.1 How to decide what matters?

Sometimes importance is imposed externally — a latency goal, a compatibility constraint. But even then the designer must figure out what matters *most* in achieving that constraint. When nothing is imposed, the guide is **leverage**: prefer the thing whose solution or knowledge also solves or explains many other things. Examples:

- The general-purpose insert/delete-ranges interface for a text class (Section 6.2) solves many problems, while specialized methods like backspace solve only one — and at the interface level, *why* text is being deleted doesn't matter; only that deletion is needed.
- An **invariant** is a leverage point: once you know an invariant of a variable or structure, you can predict its behavior in many different situations.

It is easier to judge importance when you have options to compare — generating a mental list of candidate words before naming a variable is "design it twice" applied to names.

When it is genuinely unclear what matters most (common for less experienced developers), make a hypothesis: "I think this is what matters most." Commit to it, build under that assumption, and observe the outcome. If you were right, extract the clues that predicted it; if wrong, extract the clues you missed. Either way you learn, and your choices improve over time.

### 21.2 Minimize what matters

Push in two directions to keep systems simple:

- **Make as little matter as possible.** Fewer parameters to construct an object; defaults that reflect common usage so callers need not specify anything.
- **Minimize the number of places where the important things matter.** Information hidden inside a module doesn't matter to outside code. An exception handled entirely at a low level never matters to the rest of the system. A configuration parameter computed automatically from system behavior stops mattering to administrators.

### 21.3 How to emphasize things that matter

Once identified, important things should be emphasized in three ways:

- **Prominence**: put them where they are likely to be seen — interface documentation, names, parameters of heavily used methods.
- **Repetition**: key ideas appear over and over again.
- **Centrality**: the most important ideas sit at the heart of the system and determine the structure around them — the device-driver interface in an OS is central because hundreds or thousands of drivers depend on it.

The converse is a useful diagnostic: if an idea shows up prominently, repeatedly, or shapes the system's structure, then it matters. And things that don't matter should be de-emphasized in exactly those three dimensions — hidden, rarely encountered, structurally inert.

### 21.4 Mistakes

Two ways to get this wrong:

- **Treating too many things as important.** Unimportant concerns clutter the design and raise cognitive load. Examples: methods with arguments irrelevant to most callers; the Java I/O interfaces that force every developer to think about buffered vs. unbuffered I/O even though almost everyone always wants buffering. Shallow classes are typically the symptom of this mistake.
- **Failing to recognize something important.** Then vital information ends up hidden or vital functionality is missing, so developers keep recreating it by hand. This crushes productivity and produces unknown unknowns.

The two mistakes are symmetric and both show up as complexity — one as noise, the other as absence.

### 21.5 Thinking more broadly

The idea transfers beyond software. In technical writing, identify a few key concepts up front and structure everything else around them, tying details back to those concepts. And it is a workable life philosophy: identify the few things that matter most to you and spend your energy there instead of frittering time away on the rest.

The chapter closes by naming the skill itself: **"good taste"** is the ability to distinguish what is important from what isn't — and having it is a large part of being a good software designer.

## Key terms

- **Leverage**: a solution or piece of knowledge that solves or illuminates many other problems; the primary signal for what matters.
- **Good taste**: the ability to distinguish what is important from what isn't.

## My takeaways
<!-- Fill in as you re-read and apply the chapter. -->
-
