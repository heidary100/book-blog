---
title: "Comments Should Describe Things that Aren't Obvious from the Code"
book: aposd
chapter: 13
date: 2026-09-30
summary: "Good comments capture what code cannot express — abstractions, units, invariants, intent — while comments that merely repeat the code add nothing."
tags: [comments, abstractions]
---

> Programming languages can't capture everything that was in the developer's mind: abstractions, units, invariants, constraints, and reasons. Comments exist to record exactly that missing information. The guiding rule is to describe things that aren't obvious from the code, writing at a *different* level of detail than the code — sometimes more precise, sometimes more abstract.

## The big idea

Code is necessarily low-level and detailed, but the important information about a system often lives at other levels. An abstraction is by definition a simplified view that omits details — yet code is so detailed that the abstraction can be nearly invisible in it. Ousterhout's test: a developer should be able to use a module without reading anything except its externally visible declarations plus their comments. That is only possible if comments supply the higher-level view ("after this method is invoked, network traffic will be limited to maxBandwidth bytes per second") that the code cannot show directly.

The converse mistake is just as damaging: comments that repeat the code. If someone who has never seen the code could have written the comment just by looking at the code next to it, the comment has no value. These worthless comments are, according to Ousterhout, the reason many developers believe comments are useless in the first place. The craft is to write comments that add information — lower-level comments add *precision*, higher-level comments add *intuition* — and comments at the same level as the code are almost always redundant.

## Section by section

### 13.1 Pick conventions

Decide up front what you will comment and in what format. If a doc tool exists for your language (Javadoc for Java, Doxygen for C++, godoc for Go), follow its conventions: none is perfect, but tooling benefits outweigh the flaws. With no conventions available, borrow from a similar language or project. Conventions serve two purposes: they make comments consistent and therefore easier to read, and — just as importantly — they ensure you actually write comments, because without a clear plan it's easy to write none at all.

Most comments fall into four categories:

- **Interface**: precedes a class, data structure, function, or method declaration; describes the abstraction, behavior, arguments, return value, side effects, exceptions, and caller requirements.
- **Data structure member**: sits next to a field declaration.
- **Implementation comment**: inside a method body; describes how the code works internally.
- **Cross-module comment**: documents dependencies that cross module boundaries.

Interface and data-structure-member comments matter most: every class, class variable, and method should have one. Only rarely (trivial getters/setters) is there nothing useful to say — comment everything rather than agonize over each case. Implementation comments are often unnecessary; cross-module comments are rare, hard to write, but crucial when needed.

### 13.2 Don't repeat the code

Bad comments overwhelmingly fail in one way: they restate the code. The chapter shows a research-paper sample with one comment per line ("# Get pointer copy", "# return obj") — of the lot only "Locked by current ctx" carries anything non-obvious. Same-word comments are the worst variant: `downCastParameter` documented as "Downcast PARAMETER to TYPE" adds only the word "to". After writing a comment, ask: *could someone who has never seen the code write this comment just by looking at the code next to it?* If yes, delete it.

The fix is to use different, richer words. For `textHorizontalPadding`, instead of "The horizontal padding of each line in the text", write a comment explaining the units (pixels) and that padding applies to both left and right sides of each line — information genuinely absent from the declaration. The original comments were also *missing* important information: what a "normalized resource name" is, what "downcast" means, whether padding is per-side.

> **Red Flag: Comment Repeats Code** — if the comment's information is already obvious from the adjacent code — especially when it just reassembles the words of the entity's name — it isn't helpful.

### 13.3 Lower-level comments add precision

Precision matters most for variable declarations: names and types are imprecise. A declaration comment should nail down the units, whether boundaries are inclusive or exclusive, what null means, who frees a resource, and any invariants ("this list always contains at least one entry"). Yes, a determined reader could deduce these by tracing all usages, but that is slow and error-prone; the comment should make it unnecessary. (Here "the code" means the code *next to the comment* — the declaration — not the whole application.)

The typical failure is vagueness: "// Current offset in resp Buffer" leaves "current" undefined. The improved version specifies it is the position of the first object not yet returned to the client. A `TreeMap` comment is improved by renaming the variable (`numLinesWithLength`), documenting the `<length, count>` mapping with units in characters, and — notably — what the *absence* of an entry means.

When documenting variables, "think nouns, not verbs": describe what the variable *represents*, not how it is manipulated. The `receivedValidHeartbeat` example is rewritten from a blow-by-blow account of which threads toggle it into a statement of its meaning ("True means that a heartbeat has been received since the last time the election timer was reset") — from which the manipulation follows naturally.

### 13.4 Higher-level comments enhance intuition

Higher-level comments omit detail and convey intent, so a reader can understand the overall structure and even judge whether the code is correct. The chapter rewrites a too-detailed comment (which partially duplicated the test `readRpc[i].status == LOADING`) into "Try to append the current key hash onto an existing RPC to the desired server that hasn't been sent yet." With that one sentence, almost every line of the loop becomes explainable — the session test picks the right server, LOADING guards unsafe states, MAX_PKHASHES_PERRPC is a size limit — and a reviewer can now ask whether the code does everything needed.

Writing these is harder because you must think differently: *What is this code trying to do? What is the simplest thing you can say that explains everything? What is the most important thing about this code?* Engineers love details, but great designers can step back and reason in terms of fundamental characteristics — this is exactly the essence of abstraction.

A second example shows a comment doing two jobs: one sentence explains *why* the code runs (some hashes couldn't be looked up — not stored, server crashed, or no space in the response), the other describes abstractly *what* it does (mark unprocessed hashes for reassignment). "How we get here" comments are very useful — e.g., documenting the conditions under which a method is typically invoked.

### 13.5 Interface documentation

Comments are the *only* way to describe abstractions: code is too low-level and inevitably leaks implementation detail. The first step is separating interface comments (what a user needs) from implementation comments (how it works internally). The two had better be *different* — if the interface comment must also describe the implementation, the class or method is shallow. Writing comments thus exposes design quality.

A class interface comment gives the overall abstraction (the `Http` example: what the class does, what each instance represents, and its limits — single-threaded, one request at a time). A method interface comment mixes abstraction and precision:

- One or two sentences on caller-visible behavior.
- Precise documentation of every argument and the return value, including constraints and inter-argument dependencies.
- All side effects — anything affecting future system behavior that isn't part of the result (mutating internal structures later retrievable, writing to the filesystem).
- All exceptions that can emanate from the method.
- Any preconditions (minimize them, but document those that remain — e.g., the list must be sorted before binary search).

The `Buffer::copy` example documents offset/length/dest precisely and specifies exactly what is returned when the range overruns the buffer — defining errors out of existence per Chapter 10 — so a caller never needs the body.

The extended `IndexLookup` example (client-side indexed range queries over a distributed storage system) asks which facts belong in the class comment: message formats (no), the comparison function used for ranges (yes), server-side index data structures (no), concurrent requests (possibly — high-level performance notes can matter), crash handling (no, since recovery is automatic and invisible). The original comment failed by discussing RPC names, private config constants, and trivia like "include IndexLookup.h". The revised comment is shorter: what the class is for, that each instance is one range query, and how `getNext()`/`getKey()`/`getValue()` work together. It deliberately omits per-method detail (that lives in the method comments) and NULL semantics.

> **Red Flag: Implementation Documentation Contaminates Interface** — interface docs describe implementation details a user doesn't need. The first `isReady()` comment buried the useful contract under DCFT internals and a "rule-based approach" paragraph; the rewrite states precisely what "ready" means (the next `getNext()` won't block) and the crucial fact that `isReady()` must eventually run for progress to occur.

### 13.6 Implementation comments: what and why, not how

Most methods need no implementation comments — code plus interface comments suffice. The goal is to help readers know *what* the code is doing, not *how*: once the what is clear, the how usually follows. For longer methods, put a high-level comment before each major block (e.g., "Phase 1: Scan active RPCs to see if any have completed.") so readers can navigate; for nontrivial loops, describe what each iteration does abstractly ("extracts one request … increments the corresponding object … appends a response"), with no mechanics. Simple loops need nothing.

Implementation comments are also the home of *why*: tricky code, and non-obvious bug-fix code, should say why it exists. If a good bug report exists, reference it rather than duplicate it ("Fixes RAM-436…"). For long methods, comment the few important local variables — especially those used over a wide span of code — again describing what they represent, not how they're manipulated.

### 13.7 Cross-module design decisions

Ideally every design decision lives inside one class, but real systems have decisions spanning many (a network protocol binds sender and receiver). These decisions are complex, subtle, and bug-prone, so documenting them is crucial — the challenge is picking a place developers will naturally find.

When an obvious anchor exists, use it. RAMCloud's `Status` enum is the one place anyone must touch to add an error code, so its comment lists all seven other files/updates required (STATUS_MAX_VALUE, message tables, C++ and Java exception classes, enum ordering, and so on), positioned at the end of the list where new values are added.

With no natural anchor (the RAMCloud "zombie server" example: code spread across modules that mutually depend on each other), two flawed options exist — duplicating docs everywhere (hard to keep current) or putting them in one spot nobody knows to look. Ousterhout is experimenting with a central `designNotes` file with labeled sections per topic; code that touches an issue carries a pointer comment (`// See "Zombies" in designNotes.`). One copy, findable — at the cost of living far from the code, so it may drift out of date.

### 13.8 Conclusion

Comments exist so the system's structure and behavior are obvious to readers, letting them find information quickly and modify the system confidently. "Obvious" is judged from the perspective of a first-time reader, not the author: put yourself in the reader's mindset. In review, don't argue when a reviewer says something isn't obvious — if a reader finds it non-obvious, it is; figure out what confused them and clarify it with better comments or better code.

### 13.9 Answers to questions from Section 13.5

Ousterhout resolves the five IndexLookup questions: message formats, server-side index data structures, and crash handling are implementation details to omit (crashes are invisible because recovery is automatic); the comparison function must be documented since users need it; and concurrency deserves at least high-level coverage when it affects performance.

## Red flags to watch for

- **Comment Repeats Code**: the comment's content is deducible from the adjacent code — classic symptom: it just recombines the words of the name it documents. Such comments add nothing and give comments a bad name.
- **Implementation Documentation Contaminates Interface**: interface comments (class or method) explain internals users don't need — RPC names, private config constants, internal algorithms. It also signals a shallow module.

## Key terms

- **Interface comment**: a comment block immediately preceding a module's declaration (class, function, data structure); defines the abstraction a user needs.
- **Data structure member comment**: a comment next to a field declaration (instance or static variable).
- **Implementation comment**: a comment inside a method body describing how it works internally (often unnecessary).
- **Cross-module comment**: a comment documenting design decisions or dependencies that cross module boundaries.
- **Side effect**: any consequence of a method that affects the system's future behavior but is not part of the return value (e.g., mutating retrievable internal state, writing to the filesystem).

## My takeaways

<!-- Fill in as you re-read and apply the chapter. -->
-
