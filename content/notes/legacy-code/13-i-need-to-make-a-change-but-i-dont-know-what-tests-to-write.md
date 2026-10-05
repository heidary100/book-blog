---
title: "I Need to Make a Change, but I Don't Know What Tests to Write"
book: legacy-code
chapter: 13
date: 2026-10-04
summary: "Characterization tests pin down what code actually does — bugs included — so it can be preserved through change: assert something you know is false, let the failure reveal the behavior, fix the expectation, repeat, then target the branches and conversions your change touches."
tags: [characterization-tests, testing, legacy-code]
---

> Tests for legacy code are not bug finders; they are behavior records. A **characterization test** documents what a piece of code actually does right now — no "well, it should do this" — even when that behavior turns out to be a bug. The mechanic is an assertion-error loop: run the code in a test harness, assert something you know is wrong, let the failure tell you the real behavior, change the expectation to match, repeat. Once you understand the area, aim the tests at the specific change you intend to make.

## The big idea

The instinct in legacy code is to test what the system is *supposed* to do — dig up old requirements documents and project memos, and write tests from them. Feathers rejects that: in nearly every legacy system, what the system does is more important than what it is supposed to do, and tests written from assumptions collapse back into bug finding. Bug finding is not the goal anyway. Teams that rely on manual testing fall behind because the effort must be repeated on every change — and it never is. The way to win is to concentrate effort on not putting bugs into code in the first place, with automated tests that *preserve* behavior: "in the natural flow of development, tests that specify become tests that preserve," and the bugs you find show up in later runs, when you change behavior you didn't expect to.

The reframe that makes recording actual behavior acceptable: characterization tests "don't have any moral authority; they just sit there documenting what pieces of the system really do." They are not a gold standard the software must live up to but a mechanism for finding bugs *later* — bugs that show up as differences from the system's current behavior. The documentation they provide is otherwise unobtainable. You can learn what behavior to *add* by talking to people or doing calculations, but short of tests, the only way to know what a system *does* is "playing computer" in your head — reading code and reasoning through values at particular times — which is tedious and wasteful to do over and over.

## Section by section

### 13.1 Characterization Tests

Legacy code has no tests for the area you are changing, so there is no way to verify that you are preserving behavior — the first move is to bolster the area with tests as a safety net. Making "find and fix all the bugs" the goal is a trap: in most legacy code you will never finish. The tests exist to make change deterministic.

The algorithm for writing them:

1. Use a piece of code in a test harness.
2. Write an assertion that you know will fail.
3. Let the failure tell you what the behavior is.
4. Change the test so that it expects the behavior that the code produces.
5. Repeat.

The demonstration: assert that a freshly created `PageGenerator` generates `"fred"` — a guess you are reasonably sure is wrong.

```java
void testGenerator() {
    PageGenerator generator = new PageGenerator();
    assertEquals("fred", generator.generate());
}
```

The harness answers: `expected:<fred> but was:<>`. Changing the expectation to `""` makes the test pass and documents one of the most basic facts about the class: a new `PageGenerator` generates an empty string. The same loop under other inputs — feed it a row mapping and the failure reveals `"<node><carry>1.1 vectrai</carry></node>"`, which becomes the next expected value.

It feels fundamentally weird — if we just put the values the software produces into the tests, are the tests testing anything? What if the software has a bug and we enshrine it? That is where the reframe earns its keep, and there is a practical corollary: when characterization turns up something unexpected, get clarification — it could be a bug. Keep the test in the suite, mark it as suspicious, and find out what the effect of fixing it would be.

The space of possible tests is infinite, so curiosity needs discipline. These are not black-box tests — you are allowed to look at the code, and it can give you ideas about what it does; tests are an ideal way of asking questions about it. Write tests until you are satisfied you understand the behavior; then think about the changes you want to make and whether the tests would sense any problems you could cause; add tests until you feel confidence. If confidence never arrives, it is safer to consider changing the software in a different way — maybe do a piece of what you were considering first.

**The Method Use Rule**: before you use a method in a legacy system, check to see if there are tests for it; if there aren't, write them. Applied consistently, tests become a medium of communication — people can see what to expect from a method — and the act of making a class testable tends to increase code quality.

### 13.2 Characterizing Classes

Start at a high level: write tests for the simplest thing you can imagine the class doing, then let curiosity guide you from there. Four heuristics:

1. Look for tangled pieces of logic; if you don't understand an area of code, introduce a **sensing variable** to characterize it and to make sure particular areas of the code execute.
2. As you discover the responsibilities of a class or method, stop to make a list of the things that can go wrong; formulate tests that trigger them.
3. Examine the inputs you are supplying under test. What happens at extreme values?
4. Write tests for **invariants** — conditions that should be true at all times during the lifetime of the class. You might have to refactor to discover these conditions, and those refactorings often lead to new insight about how the code should be.

Because these tests are the documentation of the system's actual behavior, write them with the reader in mind: order them so a newcomer learns — easy cases showing the main intent of the class first, then cases that highlight its idiosyncrasies. xUnit tests are just methods in a file; the order is yours to shape. In practice the change you set out to make guides your curiosity anyway, and the tests written along the way often turn out to be exactly the ones the work needs.

Bugs surface throughout the process — legacy code has them in direct proportion to how little it is understood. If the system has never been deployed, fix the bug. If it has been deployed, examine the possibility that someone is depending on the behavior you see as a bug, and analyze how to fix it without ripple effects. Feathers' bias is toward fixing bugs as soon as they are found: clearly erroneous behavior should be fixed, and anything merely suspected should be marked as suspicious in the test code and escalated quickly.

### 13.3 Targeted Testing

After writing tests to understand a section of code, check them against the change itself. The example: `FuelShare.addReading` computes the value of fuel in leased tanks, and the change extracts the top-level `if` into a method moved to `ZonedHawthorneLease`. The `gallons < Lease.CORP_MIN` leg will not be modified — a test for it is nice but not strictly necessary. The `else` leg *is* changing (`1.2 * priceForGallons(gallons)` becomes `1.2 * totalPrice` after the move), so a test must execute it:

```java
public void testValueForGallonsMoreThanCorpMin() {
    StandardLease lease = new StandardLease(Lease.MONTHLY);
    FuelShare share = new FuelShare(lease);
    share.addReading(FuelShare.CORP_MIN + 1, new Date());
    assertEquals(12, share.getCost());
}
```

Two verification habits when testing a branch. First, ask whether there is any other way the test could pass, aside from executing that branch — if you are not sure, use a sensing variable or the debugger to find out whether the test is hitting it. Second, watch for inputs with special behavior that could lead a test to succeed when it should fail. The book's trap: money held as `double`, with a test that adds `corpBase` (12.0) to a zero cost. If the extraction changes the accumulator to `long`, the test still passes — the double-to-int conversion happens silently, and 12.0 converts exactly as 12 would. The test verifies the conversion's existence but never exercises its effect.

Generalizing: when we refactor, we check two things — does the behavior exist after the refactoring, and is it connected correctly? Most characterization tests look like "sunny day" tests: no special conditions, just verification that particular behaviors are present, from whose presence you infer that moved or extracted code preserved behavior. Four ways to catch missed conversions: manually calculate the expected values, watching each conversion; step through assignments in a debugger; use sensing variables to verify that a path is covered and its conversions are exercised; or characterize a smaller chunk of code, slicing the method into pieces — available when a refactoring tool extracts methods safely, and tools cannot always be trusted anyway (one extracts `x + y` from a method as `add(y)` rather than `add(x, y)` because `x` is an instance variable).

The compact rule: "The most valuable characterization tests exercise a specific path and exercise each conversion along the path."

### 13.4 A Heuristic for Writing Characterization Tests

1. Write tests for the area where you will make your changes — as many cases as you feel you need to understand the behavior of the code.
2. After doing this, look at the specific things you are going to change, and attempt to write tests for those.
3. If you are extracting or moving functionality, write tests that verify the existence and connection of those behaviors case by case: confirm you are exercising the code you are going to move and that it is connected properly. Exercise conversions.

## Key terms

- **Characterization test**: a test that characterizes the actual current behavior of a piece of code — no judgment about what it should do — so that future differences from that behavior are detected.
- **Sensing variable**: a variable introduced into code you don't understand to verify that a test executes a particular area of it.
- **The Method Use Rule**: before using a method in a legacy system, check for tests; if there aren't any, write them — making tests the medium of communication about what a method does.
- **"Sunny day" test**: a characterization test that verifies particular behaviors are present rather than probing special conditions; presence is the evidence that a refactoring preserved behavior.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
