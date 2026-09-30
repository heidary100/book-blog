---
title: "Write The Comments First"
book: aposd
chapter: 15
date: 2026-09-30
summary: "Write interface comments at the very start of coding so documentation becomes part of the design process — it yields better comments, better designs, and more fun."
tags: [comments, design-process]
---

> Delaying comments until "the code stabilizes" virtually guarantees they are never written, or written badly as a rushed afterthought. Instead, write comments first — class interface comment, then method signatures and interface comments, then key variables — so comments act as the design process itself. This produces better documentation and better abstractions, and it is more enjoyable.

## The big idea

The universal excuse for postponing documentation — "the code is still changing, so the comments would have to be rewritten" — is technically plausible but, Ousterhout suspects, mostly a rationalization for avoiding drudgery. The proposed inversion treats comments not as a record of a finished design but as the medium in which the design is first expressed. Because comments are the only way to fully capture abstractions, describing a class's interface in prose *before* implementing it forces you to identify the essence of each abstraction while it's cheap to change. If you skip this step, you are "just hacking code".

The approach also converts comment quality into an early design signal: a method that can't be described completely in a short, simple comment has a complex interface; an interface comment that must narrate the implementation reveals a shallow method. In this way the comments function as a "canary in the coal mine of complexity", surfacing design problems before code exists to entrench them.

## Section by section

### 15.1 Delayed comments are bad comments

Nearly every developer postpones comments; the stated reason is churn, the hidden one is that documentation feels like drudge work. Delaying has compounding costs. First, the comments usually never get written: each week's delay makes the code "even more stable" and the backlog bigger, there is never a convenient few-day gap to fill it in, and shipping features or fixing bugs always wins — creating yet more undocumented code. Second, even with heroic self-discipline (which Ousterhout doubts most people have), retrofitted comments are bad: by then you have mentally checked out, you want to get through it quickly, your memory of the design has gone fuzzy, and — since you look at the code while writing — the comments end up merely repeating the code. The design ideas not visible in the code are exactly the ones you can no longer reconstruct, so the most important information is precisely what's missing.

### 15.2 Write the comments first

Ousterhout's own workflow for a new class:

1. Start with the class interface comment.
2. Write interface comments and signatures for the most important public methods, leaving bodies empty.
3. Iterate over these comments until the basic structure feels right.
4. Write declarations and comments for the most important instance variables.
5. Finally fill in method bodies, adding implementation comments as needed.

New methods and variables discovered during coding get their comments first too — an interface comment before each new body, a comment alongside each new declaration. The result: "When the code is done, the comments are also done. There is never a backlog of unwritten comments." The first benefit is better comments: design issues are fresh, writing the interface comment before the body keeps attention on the abstraction rather than the implementation, and problems found during coding and testing get folded back into the comments, so they improve continuously.

### 15.3 Comments are a design tool

The most important benefit is improved design. Comments are the only way to fully capture abstractions, and good abstractions are the foundation of good design; writing them first lets you review and tune the abstractions before any implementation exists. To write a good comment you must identify what is most important about a variable or method — doing that early is design, deferring it is hacking.

Comments measure interface complexity. Chapter 4 says classes should be deep: simple interfaces, powerful functionality. The best way to judge an interface's complexity is its documentation: a comment that is complete (everything a caller needs) yet short and simple indicates a simple interface; if no complete description can be short, the interface is complex. Comparing a method's interface comment with its implementation reveals depth — if the comment must describe all the major features of the implementation, the method is shallow. Variables follow the same rule: a long comment to fully describe a variable suggests the wrong variable decomposition.

> **Red Flag: Hard to Describe** — a describing comment should be simple *and* complete; difficulty writing it indicates a design problem in the thing being described.

One caveat: this only works with complete, clear comments. An interface comment that omits what callers need, or is too cryptic to understand, is not a valid measure of anything.

### 15.4 Early comments are fun comments

The third benefit is enjoyment. Ousterhout's favorite part of programming is the early design phase of a new class — fleshing out abstractions and structure — and that is where most of his comments get written: comments are how he records and stress-tests design decisions. He optimizes for "the design that can be expressed completely and clearly in the fewest words"; simpler comments are a source of pride, a direct quality readout. If you program strategically — aiming for a great design, not merely working code (Chapter 3) — comment writing *should* be fun, because that's how you find the best designs.

### 15.5 Are early comments expensive?

Back to the churn objection: doesn't writing comments first waste effort when abstractions evolve? A back-of-the-envelope estimate deflates it. Typing code and comments — including revisions — is unlikely to exceed ~10% of total development time; even with half your lines being comments, that puts comment writing at no more than ~5% of total time. Delaying saves only a fraction of that fraction. Meanwhile, comments-first stabilizes abstractions earlier, which likely *saves* coding time, whereas code-first lets abstractions drift during implementation and forces more rework. Weighing everything, comments-first may actually be faster overall.

### 15.6 Conclusion

A simple challenge: if you've never written comments first, try it, stick with it long enough to get used to it, and then compare against your own experience — the quality of your comments, the quality of your design, and your enjoyment of development. Ousterhout invites readers to report whether their experience matches his.

## Red flags to watch for

- **Hard to Describe**: you can't write a comment for a method or variable that is both simple and complete — evidence the design of that thing is flawed; treat the comment as an early design test.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
