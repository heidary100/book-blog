---
title: "Glossary"
book: legacy-code
chapter: 91
date: 2026-10-04
summary: "The book's shared vocabulary in one place — seams, sketches, tests, and dependency terms — where each term names both a diagnosis of a change situation and the move that escapes it."
tags: [legacy-code, testing, seams, knowledge-sharing]
---

> A vocabulary is a tool. Each entry here pairs a diagnosis with a move: a change point tells you where the change must land, an interception point where a test can sense, a pinch point where a cluster of behavior narrows enough to test, a seam how to vary behavior without editing in place. Naming your situation precisely is half of finding the safe change.

## The big idea

This is the book's shared vocabulary, and the terms are load-bearing — the chapters use them as compressed technique descriptions ("write a characterization test at the pinch point"). The seam family especially is developed in full in [the seam model note](/books/legacy-code/04-the-seam-model), with each seam's enabling point.

## Glossary

- **change point** — the place in the code where your needed change has to happen.
- **characterization test** — a test that pins down and documents a piece of software's current behavior, holding it fixed while you modify the code underneath.
- **coupling count** — the number of values crossing a method's boundary per call: its parameters, plus one more if it returns something. Worth computing before extracting a small method without tests — the lower the count, the safer the extraction.
- **effect sketch** — a small hand-drawn diagram showing which variables and return values a change can affect; helps you decide where to write tests.
- **fake object** — a stand-in that impersonates one of a class's collaborators during testing.
- **feature sketch** — a small hand-drawn diagram showing how a class's methods use its other methods and instance data; helps you decide how to break up an oversized class.
- **free function** — a function outside any class: just a "function" in C and other procedural languages, a non-member function in C++, nonexistent in Java and C#.
- **interception point** — a place where a test can be written to sense some condition in the software.
- **link seam** — a seam exploited by linking to a different library — swapping production libraries, DLLs, assemblies, or JARs at build or deployment time to shed a dependency or sense a condition in a test.
- **mock object** — a fake object that asserts conditions internally, checking how it was used.
- **object seam** — a seam exploited by replacing one object with another, usually by subclassing production code and overriding methods.
- **pinch point** — a narrowing in an effect sketch where many possible effects funnel through a few places; the ideal spot to test a cluster of features.
- **programming by difference** — adding a feature by inheritance, coding only what differs; often the fastest route for a new feature, whose tests then support refactoring the result into a better shape afterward.
- **seam** — a spot where a system's behavior can be changed without editing the code at that spot; a call to a polymorphic function is one, because subclassing the object's class redirects it. See [the seam model note](/books/legacy-code/04-the-seam-model) for the full family and their enabling points.
- **test-driven development (TDD)** — a process of writing failing test cases and satisfying them one at a time, refactoring as you go to keep the code simple; code built this way has test coverage by default.
- **test harness** — the software that makes unit testing possible — the scaffolding tests run inside.
- **testing subclass** — a subclass created to open a class up for testing.
- **unit test** — a test that runs in under a tenth of a second and is small enough that its failure localizes the problem.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
