---
title: "Why Write Comments? The Four Excuses"
book: aposd
chapter: 12
date: 2026-09-30
summary: "Comments capture design information code can't express; they complete abstractions, and — written during design — actually improve the system's design."
tags: [comments, mindset]
---

> Comments do more than help people understand code: they are what makes abstraction possible — without them there is nothing to hide complexity behind — and writing them can improve the design itself. The four standard excuses for skipping them all collapse under scrutiny.

## The big idea

In-code documentation plays three roles. It helps developers understand a system and work efficiently; it is essential to *abstraction*, because without comments you cannot hide complexity; and the process of writing comments, done correctly, actually improves a system's design. Conversely, a good design loses much of its value if poorly documented. Yet a significant fraction of production code contains essentially no comments, and even teams that encourage documentation treat it as drudge work, producing mediocre results. Ousterhout's goal for this set of chapters: convince you that good comments make a big difference in software quality, that writing them isn't hard, and — perhaps hardest to believe — that they can be fun.

Developers who skip comments reach for one of four excuses: "Good code is self-documenting," "I don't have time to write comments," "Comments get out of date and become misleading," and "The comments I have seen are all worthless; why bother?" Each gets its own rebuttal below.

## Section by section

### 12.1 Good code is self-documenting

Ousterhout calls this "a delicious myth, like a rumor that ice cream is good for your health" — we'd love to believe it, but it's false. Good variable names reduce the need for comments (Chapter 14), yet a large amount of design information simply cannot be represented in code: only a small part of a class's interface — the method signatures — is formal, while what each method does, what its result means, the rationale for a design decision, and the conditions under which calling a method makes sense are all informal and live only in comments.

The "just read the code" retort fails three ways. Reading an implementation to deduce its abstract behavior is time-consuming and painful. Writing code for readers pushes you to keep every method tiny, fragmenting it into many shallow methods — which doesn't even help, since understanding the top-level method still requires understanding the nested ones. And for large systems, reading code to learn behavior is simply impractical. The deepest argument: an abstraction is a simplified view that omits details; if users must read a method's code to use it, there *is no abstraction* — all its complexity is exposed. A declaration alone can't tell you whether `substring` includes the character at `end`, or what happens when `start > end`. Comments, written in a human language, trade precision for expressive power — enough to complete the simplified view while still hiding the implementation.

### 12.2 I don't have time to write comments

Software projects are *always* under time pressure, so anything that can be de-prioritized below the next feature never gets done: allow documentation to lose priority battles and you end up with none. The counter is the investment mindset (page 15): up-front effort buys long-term efficiency, and good comments pay for themselves quickly in maintainability. The arithmetic also defuses the excuse: time spent typing code (excluding comments) is almost certainly under 10% of development time, so even doubling your typing time to write comments adds at most about 10% to the total. Better yet, the most important comments — the interface documentation for classes and methods — should be written *as part of the design process* (Chapter 15), where writing them acts as a design tool: those comments pay for themselves immediately.

### 12.3 Comments get out of date and become misleading

Comments do go stale, but it need not be a major problem. Large documentation changes are only needed after large code changes — and the code changes cost more than the documentation updates would. Chapter 16's organizing tactics make it easier still: avoid duplicated documentation, and keep each piece of documentation close to the code it describes. Code reviews are a great mechanism for detecting and fixing stale comments.

### 12.4 All the comments I have seen are worthless

Of the four excuses, this one has the most merit: every developer has seen comments that provide no useful information, and most existing documentation is so-so at best. But that is a skill problem, not an argument against comments. Writing solid documentation is not hard once you know how — the following chapters lay out the framework.

### 12.5 Benefits of well-written comments

The purpose of comments is to capture information that was in the designer's mind but couldn't be represented in code — from low-level details like a hardware quirk behind a tricky line up to the rationale for a whole class. With that captured, future maintainers work faster and more accurately; without it, they must rederive or guess at the original knowledge, costing time and risking bugs from misunderstanding. This holds even when the maintainer is the original author: after a few weeks away from code, you have forgotten many of the design details.

Mapped against Chapter 2's three ways complexity manifests, documentation helps with two of them. It reduces **cognitive load** — the needed information is provided, and irrelevant information is easy to skip rather than requiring pages of code-reading. It reduces **unknown unknowns** — clarifying the system's structure makes it clear which code and information matter for a given change. It does not directly address change amplification. It also attacks both root causes of complexity: good documentation clarifies dependencies and fills in the gaps that create obscurity.

### 12.6 A different opinion: comments are failures

In *Clean Code*, Robert Martin argues that comments are "at best, a necessary evil" — compensation for our failure to express ourselves in code — and that "Comments are always failures," not a cause for celebration. Ousterhout agrees that good design reduces the need for comments (particularly inside method bodies) but rejects the framing: the information comments carry is of a different kind than code's, cannot be represented in code today, and even if it could be, it's unclear the result would be an improvement.

Their purposes also differ. Comments exist to make reading the code unnecessary — a short interface comment replaces reading a method's whole body. Martin instead advocates replacing comments *with code*: pull a block into a separate method and let its name serve as the comment. The result is names like `isLeastRelevantMultipleOfNextLargerPrimeFactor` — still cryptic, conveying less than a well-written comment — and, effectively, retyping the documentation at every invocation. Ousterhout also worries the philosophy breeds a bad attitude, where programmers avoid comments to avoid seeming like failures and good designers get criticized: "What's wrong with your code that it requires comments?" Well-written comments are not failures; they increase the value of code and play a fundamental role in defining abstractions and managing complexity.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
