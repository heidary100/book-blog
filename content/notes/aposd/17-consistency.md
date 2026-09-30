---
title: "Consistency"
book: aposd
chapter: 17
date: 2026-09-30
summary: "Consistency — similar things done similarly, dissimilar things differently — creates cognitive leverage: what you learn once applies everywhere, so work is faster and mistakes rarer."
tags: [consistency]
---

> Consistency is a powerful complexity-reducer: when similar things are done in similar ways (and dissimilar things in different ways), knowledge acquired in one place transfers instantly to every other place that looks the same. It makes developers faster and their assumptions safe, so they make fewer mistakes. It takes work to establish and defend — but the payoff is code whose behavior is obvious.

## The big idea

Consistency creates cognitive leverage. Once you learn how something is done in one part of a system, you can apply that knowledge immediately wherever the same approach appears; without it, every situation must be learned separately, which costs time. The deeper benefit is error reduction: in an inconsistent system, two situations can *look* identical while actually differing, so a developer pattern-matching on a familiar-looking situation draws wrong conclusions. In a consistent system, "assumptions made based on familiar-looking situations will be safe."

The definition has two halves that are easy to forget: similar things done in similar ways, *and* dissimilar things done in different ways. Consistency is not sameness for its own sake — it is a promise to the reader that appearance reliably signals meaning. Like the other techniques in this part of the book, it is an investment: effort spent deciding conventions, building checkers, and mimicking existing patterns is repaid in code that everyone can understand and modify more quickly and accurately.

## Section by section

### 17.1 Examples of consistency

Consistency applies at many levels; the chapter offers five:

- **Names** — Chapter 14's case for using the same name for the same purpose everywhere (e.g., reserving `fileBlock`) is really a consistency argument.
- **Coding style** — organizations adopt style guides that go beyond compiler rules: indentation, curly-brace placement, declaration order, naming, commenting, and bans on dangerous language features. Style guides make code easier to read and prevent some classes of errors.
- **Interfaces** — an interface with multiple implementations is consistency in structural form: having learned one implementation, you already know the features any other implementation must provide.
- **Design patterns** — generally accepted solutions to common problems, such as model-view-controller for UI design. Using an existing pattern speeds up implementation, raises the odds it works, and makes the code more obvious to readers (more in Section 19.5).
- **Invariants** — a property of a variable or structure that is always true, e.g., every line in a text structure ends with a newline character. Invariants shrink the number of special cases code must handle and make behavior easier to reason about.

### 17.2 Ensuring consistency

Consistency is hard to sustain, especially with many people over long projects: groups don't know each other's conventions, and newcomers unknowingly violate existing ones while inventing conflicting new ones. Four practices help:

**Document.** Write the most important overall conventions (e.g., coding style) into a document placed somewhere developers will actually see it — a conspicuous spot on the project Wiki. Ask new joiners to read it and existing members to re-read it occasionally; several organizations have published style guides on the Web, so start from one of those. More localized conventions, like invariants, belong in the code near what they govern. Unwritten conventions are conventionally ignored: "If you don't write the conventions down, it's unlikely that other people will follow them."

**Enforce.** Memory alone can't hold every convention; the best enforcement is an automated checker that blocks commits failing the check. Automated checking suits low-level syntactic conventions especially well. Ousterhout's war story: a project mixed Unix developers (newline line terminators) and Windows developers (carriage-return + newline), so cross-system edits sometimes rewrote *every* line terminator, making diffs look like the whole file changed and hiding the meaningful edits. A "newlines only" convention was documented but chronically violated — every new developer brought a rash of problems. The fix was a short pre-commit script that aborted the commit if any modified file contained carriage returns (and could be run manually to repair damaged files). It instantly eliminated the problem and doubled as new-developer training. Code reviews are the second enforcement channel: the more nit-picky reviewers are about conventions, the faster everyone learns them and the cleaner the code gets.

**When in Rome …** The most important convention of all is the adage itself. In a new file, look around: are public declarations before private ones? Methods alphabetical? Camel case (`firstServerName`) or snake case (`first_server_name`)? Follow anything that might be a convention, and when making a design decision, ask whether a similar decision was made elsewhere in the project — then find the example and mimic it.

**Don't change existing conventions.** Resist the urge to "improve": having a better idea is not a sufficient excuse for inconsistency. Even if your idea really is better, "the value of consistency over inconsistency is almost always greater than the value of one approach over another." Before introducing a change, two questions must both be yes: (1) do you have significant new information that didn't exist when the convention was set? (2) is the new approach so much better that updating *all* old uses is worth the time? Even with organizational buy-in on both, there should be no trace of the old convention afterwards — and you still risk developers reintroducing the old way because they never heard of the change. Overall, re-litigating established conventions is rarely a good use of developer time.

### 17.3 Taking it too far

The two halves of the definition bite here: forcing *dissimilar* things into the same approach is a consistency violation too. Examples: using the same variable name for things that are really different, or jamming a task into an existing design pattern that doesn't fit. Both create complexity and confusion. The engine of consistency's value is developer confidence that "if it looks like an x, it really is an x" — overzealous sameness destroys exactly that confidence.

### 17.4 Conclusion

Consistency is the investment mindset once more. The costs are real: deciding conventions, building automated checkers, hunting for similar situations to mimic in new code, and patiently educating the team in reviews. The return is obviousness — developers understand behavior more quickly and accurately, work faster, and introduce fewer bugs.

## Key terms

- **Consistency**: the property that similar things are done in similar ways and dissimilar things are done in different ways, so knowledge of one situation safely transfers to similar-looking ones.
- **Invariant**: a property of a variable or structure that is always true (e.g., every stored line ends with a newline), reducing special cases and easing reasoning.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
