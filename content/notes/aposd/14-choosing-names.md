---
title: "Choosing Names"
book: aposd
chapter: 14
date: 2026-09-30
summary: "Names are a form of documentation and abstraction: choose precise, consistent names that create an image in the reader's mind, and never settle for 'reasonably close'."
tags: [naming, code-obviousness]
---

> Good names are documentation: they make code easier to understand, reduce the need for other comments, and help expose bugs. Because complexity is incremental, one mediocre name barely matters — but thousands of them add up, so take extra time to pick names that are precise, unambiguous, and intuitive. Naming is also a design diagnostic: if you can't find a clean name, the underlying thing may be badly designed.

## The big idea

The goal of a name is to "create an image in the mind of the reader about the nature of the thing being named" — conveying both what the entity is and what it is not. The litmus test: if someone sees the name in isolation, with no declaration, docs, or usage in view, how close will their guess be? Since a name gets unwieldy beyond two or three words, the challenge is compressing the most important aspects of the entity into a few words. Names are thus a form of abstraction: they highlight what matters and omit what doesn't.

Ousterhout grounds this in war stories rather than platitudes. The worst bug of his career — six months of debugging a Sprite file system that sporadically zeroed out a data block — came from one variable named `block` meaning both a *physical* disk block number and a *logical* file block number. Several people read the faulty code without spotting it, because the name reflexively suggested the wrong meaning. Distinct names like `fileBlock` and `diskBlock` would likely have prevented it; distinct *types* would have made the error impossible. The lesson: don't settle for names that are "reasonably close". The extra seconds spent choosing a great name pay for themselves quickly, and with practice good names become nearly free — an instance of the investment mindset.

## Section by section

### 14.1 Example: bad names cause bugs

The Sprite story in full: in the late 1980s/early 1990s Ousterhout's team noticed files occasionally losing data — a block turning to all zeroes with no user modification. Because it was rare, several graduate students failed to track it down and gave up; it took Ousterhout six months. The cause was the dual-use `block` variable: code holding a logical block number accidentally ran where a physical block number was required, so an unrelated disk block got zeroed. Everyone who reviewed the code was blinded by the name — they assumed a `block` used as a physical number really held one; only heavy instrumentation revealed which statement was corrupting data, letting him get "past the mental block created by the name". The fix was trivial, as most bugs are once found. Most developers don't think hard about names and grab the first plausible candidate; this chapter argues that habit is a false economy.

### 14.2 Create an image

A good name carries a lot of information about the underlying entity — and just as importantly about what it is *not*. When evaluating a candidate, ask: "If someone sees this name in isolation, without seeing its declaration, its documentation, or any code that uses the name, how closely will they be able to guess what the name refers to? Is there some other name that will paint a clearer picture?" Names longer than two or three words become unwieldy, so the craft is selecting the few words that capture the entity's most important aspects — abstraction in miniature.

### 14.3 Names should be precise

Good names have two properties: precision and consistency. Precision's main enemy is vagueness — a name broad enough to cover many things tells the reader little and invites misuse. Examples from student projects:

- `IndexletManager::getCount()` — count of what? `numActiveIndexlets` lets callers guess the behavior without reading docs.
- A GUI editor used `x` and `y` for a character's position in a file; they could equally mean screen pixel coordinates. `charIndex` and `lineIndex` reflect the actual abstractions.
- `blinkStatus` (boolean) — "status" says nothing about what true/false mean and "blink" doesn't say what blinks. `cursorVisible` wins: boolean names should be predicates. The dropped "blink" rationale belongs in the doc, where it's less critical.
- `VOTED_FOR_SENTINEL_VALUE` says "special" but not *what the special meaning is*; `NOT_YET_VOTED` is better.
- A variable named `result` in a method with no return value both misleads (implying it becomes the return value) and informs nothing; name it for its content (`mergedLine`, `totalChars`). In methods that *do* return, `result` is acceptable — generic, but the docs clarify, and knowing it's destined to be returned is useful.
- The Linux kernel's `struct socket` vs `struct sock` are nearly indistinguishable (the latter embeds the former); names like `sock_base` and `inet_sock` would clarify the relationship.

Precision can also overshoot: `delete(Range selection)` implies UI-selected text, but the method deletes any range — a more generic argument name like `range` is correct. And there are sanctioned exceptions to precision: short loops may legitimately use `i` and `j`, since the whole range of usage is visible and meaning is obvious; reach for descriptive names only when the loop is long or the variable's role unclear.

> **Red Flag: Vague Name** — if a name is broad enough to refer to many different things, it conveys little information and the entity is more likely to be misused.

A deeper signal: if it's hard to find a name that is precise, intuitive, *and* short, the variable may lack a clear definition or purpose. Consider re-factoring — perhaps one variable is secretly representing several things, and splitting it yields simpler definitions for each. Naming doubles as a design-improvement tool.

> **Red Flag: Hard to Pick Name** — struggling to find a simple name that creates a clear image hints the underlying object has no clean design.

### 14.4 Use names consistently

The second property is consistency, and it works like reusing a common class: knowledge transfers instantly across contexts. For each recurring usage pattern (e.g., block numbers in a file system), reserve one name (`fileBlock`) and apply it everywhere. Three requirements: (1) always use the common name for that purpose; (2) never use it for anything else; (3) keep the purpose narrow enough that every variable with that name behaves the same way — the requirement the Sprite bug violated. When you need several of the same kind of thing (source and destination blocks in a copy), keep the base name and add distinguishing prefixes: `srcFileBlock`, `dstFileBlock`. Loop variables obey the same rule: `i` in outermost loops, `j` for nested, so readers make safe instant assumptions.

### 14.5 Avoid extra words

Every word in a name must earn its place; filler words just clutter and wrap lines. Don't append generic nouns like `Object` (`fileObject` — are there files that aren't objects?). Ousterhout explicitly retracts type-in-name styles like Hungarian Notation (`arru8NumberList` = array of unsigned 8-bit integers): with modern IDEs you can click through to the declaration or see the type rendered, so encoding types in names is no longer worth it. And an instance variable shouldn't repeat its class name — a `fileBlock` field inside class `File` should just be `block` (unless the class genuinely holds multiple kinds of blocks).

### 14.6 A different opinion: Go style guide

Fairness matters here: Go's developers advocate very short names. Andrew Gerrand's position is that "long names obscure what the code does", and he shows a `RuneCount` function with single-letter names (`b`, `i`, `n`) as *more* readable than the same code with `buffer`, `index`, `count`. Ousterhout disagrees about that specific example — he found himself reverse-engineering what `n` meant, while `count` needed no such effort — but concedes the point conditionally: if `n` is used consistently system-wide to mean counts and nothing else, it's probably fine. His real objection is Go culture's deliberate reuse of one short name for many meanings (`ch` for character *or* channel; `d` for data, difference, or distance), which recreates exactly the ambiguity that caused the `block` bug. His resolution is reader-centric: "readability must be determined by readers, not writers" — if readers complain the code is cryptic, use longer names; if readers complain long names hurt, shorten. One Gerrand rule he fully endorses: the greater the distance between a name's declaration and its uses, the longer the name should be (which is precisely why `i`/`j` are fine in short loops).

### 14.7 Conclusion

Well-chosen names make code obvious: a first-time reader's unreflective guess about a variable's behavior will be correct. Naming is the investment mindset in miniature — a little time up front saves future work and prevents bugs. The skill itself is also an investment: choosing great names feels slow at first, but with practice it takes almost no extra time, after which the benefits are essentially free.

## Red flags to watch for

- **Vague Name**: the name is broad enough to plausibly refer to many different things (`count`, `status`, `x`, `result` outside return-value context), so it conveys little and invites misuse.
- **Hard to Pick Name**: no simple name creates a clear image of the entity — a hint the entity itself lacks a clean design; try re-factoring (e.g., split a variable that represents several things).

## My takeaways

<!-- Fill in as you re-read and apply the chapter. -->
-
