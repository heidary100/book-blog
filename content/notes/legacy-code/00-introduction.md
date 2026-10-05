---
title: "Introduction"
book: legacy-code
chapter: 0
date: 2026-10-04
summary: "Feathers states the book's working definition up front — legacy code is code without tests — and organizes the book as an FAQ about changing code, bookended by the mechanics of change and a catalog of test-free dependency-breaking refactorings."
tags: [legacy-code, testing, mindset]
---

> The Preface fixes the book's stance: legacy code, in Feathers' working definition, is code without tests — not because untested code is ugly, but because without tests you cannot change behavior quickly and verifiably, or even know whether the code is getting better or worse. The book is not about testing or pretty code; it is about confident change in any code base. The Introduction explains the format: an FAQ of problem-named chapters (Part II, Changing Software), preceded by the mechanics of change (Part I) and followed by a catalog of dependency-breaking techniques (Part III).

## The big idea

Strictly defined, legacy code is code you got from someone else — a company acquired it, or the original team moved on. But the industry usage (tangled, unintelligible structure, code you have to change but don't understand, demoralized teams) has nothing to do with who wrote it, so Feathers proposes a sharper working definition: "legacy code is simply code without tests." The observation behind the book is a gut-punch he quotes from a friend: "They're writing legacy code, man" — many teams are trying very hard, and still, because of schedule pressure, the weight of history, or a lack of better code to compare against, they are writing legacy code. He takes grief for the definition and answers it directly: clean code is loved but not enough. Large changes without tests are aerial gymnastics without a net, demanding incredible skill and a perfect model of what happens at every step — and teams rare enough to have that clarity still change more slowly than teams with tests. The definition earns its keep because it points at a solution: get code under test and it stops being legacy.

The book is therefore not about testing, and not about pretty code or pretty design. It is about being able to confidently make changes in any code base — understand the code, get it under test, refactor, add features. Design in legacy code arrives in discrete steps, like surgery: incisions, moving through the guts, suspending some aesthetic judgment, never letting "best" be the enemy of "better." Some steps make code temporarily uglier; the goal is a team that expects ease of change and actively works to sustain it, from which genuinely better design grows. The techniques come from years of consulting — Feathers kept doing the same dependency-breaking work with team after team, most memorably a financial-industry group whose only tests were slow, rarely-run scenario tests making multiple trips to a database — and the book exists so teams can skip that déjà vu.

## Section by section

### How to Use This Book

The techniques useful in legacy code work are hard to explain in isolation — the simplest changes go easier if you can find **seams**, make fake objects, and apply a couple of dependency-breaking techniques — so the bulk of the book (Part II, Changing Software) is organized as an FAQ. Each chapter is named after a specific problem ("How Do I Add a Feature?", "I Can't Get This Class into a Test Harness"), which makes the titles long but lets you jump straight to the section matching the problem you actually have.

Because techniques lean on other techniques, the FAQ chapters are heavily interlinked, with references and page numbers throughout. Feathers apologizes for the flipping this causes, on the bet that you would rather flip wildly through the book than read it cover to cover trying to understand how all the techniques operate.

The implied reading path follows from that: this is a handbook, not a narrative. Read the introductory chapters once for context and nomenclature, come to the Part II chapters as the problems arise, and browse Part III plus the Glossary as reference material when a term or technique is unfamiliar.

Part I, The Mechanics of Change (Chapters 1-4), should be read first — particularly Chapter 4, The Seam Model — because it provides the context and nomenclature all the later techniques rely on. When a term is not described in context, the Glossary is the fallback.

Part III, Dependency-Breaking Techniques, is a catalog of refactorings that are special in one respect: they are meant to be done without tests, in the service of putting tests in place. That inversion is the book's signature move — these are the refactorings you use to build the net that refactoring normally assumes — and Feathers encourages reading each of them to see more possibilities as you start to tame your code.

From the Preface, two practicalities about the examples. They use Java, C++, and C — chosen to cover object-oriented, legacy object-oriented, and procedural concerns, with most techniques transferable to languages like Delphi, Visual Basic, COBOL, and FORTRAN. And they are deliberately brief: fabricated under nondisclosure agreements and compressed to keep the points visible, so treat ellipses in a code fragment as "insert 500 lines of ugly code here" and apply the advice at face value even when your code is far worse.

## Key terms

- **Legacy code**: code without tests. A statement about changeability, not authorship or cleanliness: with tests, behavior changes are quick and verifiable; without them, you cannot know whether the code is getting better or worse.
- **Dependency-breaking techniques**: the Part III catalog of refactorings meant to be done without tests, in the service of putting tests in place.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
