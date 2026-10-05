---
title: "Working with Feedback"
book: legacy-code
chapter: 2
date: 2026-10-04
summary: "Replace Edit and Pray with Cover and Modify: fast unit tests act as a software vise that holds behavior fixed while you change one thing at a time, dependencies are broken conservatively to get tests in place, and the Legacy Code Change Algorithm organizes the work."
tags: [testing, legacy-code, refactoring]
---

> Software changes in two primary ways: **Edit and Pray** — plan carefully, understand the code, make the change, then poke around hoping you didn't break anything — and **Cover and Modify**, where the code under change is cloaked in tests that detect change. Tests used this way act as a **software vise**, holding behavior fixed so you change exactly one piece at a time. When dependencies make tests impossible to write, you break them conservatively first and follow the Legacy Code Change Algorithm: identify change points, find test points, break dependencies, write tests, make changes and refactor.

## The big idea

Edit and Pray is the industry standard, and it looks like professionalism — the care is right at the forefront, and invasive changes get extra care because more can go wrong. But safety is not solely a function of care: "I don't think any of us would choose a surgeon who operated with a butter knife just because he worked with care." Effective software change, like effective surgery, involves deeper skills, tools, and techniques. Cover and Modify uses a different kind of safety net — not under the table but a cloak over the code, so bad changes don't leak out and infect the rest of the software. The reframe of testing that makes it work: traditional testing happens after development, by a separate group checking against a specification ("testing to attempt to show correctness"), with a feedback loop of weeks or months. Tests can instead be used for "testing to detect change" — traditionally called regression testing: periodically run tests that check for known good behavior to find out whether the software still works the way it did in the past.

The granularity of that feedback decides everything. Regression testing done at the application interface produces next-morning ambiguity — a QA group schedules an overnight run, two tests fail, and you get to debug whether it was your change or someone else's — which is why it is so rarely practiced despite being a great idea. A set of 20 unit tests around the long function you are about to change gives feedback in seconds: a mistaken logic inversion is caught and recovered in about a minute. Do you want your feedback in a minute or overnight? When tests detect change around the area you are modifying, they act as a vise: behavior is clamped in place, you know you are changing one piece of behavior at a time, and you are in control of your work.

## Section by section

### 2.1 What Is Unit Testing?

Unit tests test individual components in isolation, and the components are the most atomic behavioral units of a system: functions in procedural code, classes in object-oriented code. Perfect isolation is an ideal — top-level functions call other functions all the way down to the machine level, and classes almost always use other classes — but it is the defining property. In this book, **test harness** is the generic term for the testing code written to exercise a piece of software plus the code needed to run it (Chapter 5 covers xUnit and FIT).

Isolation matters because larger tests have three structural problems:

- **Error localization** — the further a test is from what it tests, the harder it is to determine what a failure means; with unit tests the pinpointing is usually trivial.
- **Execution time** — larger tests take longer, and tests that take too long to run end up not being run.
- **Coverage** — it is hard to see the connection between a piece of code and the values that exercise it, and new code may take considerable work to reach with high-level tests.

Large tests could deliver error localization if they were run after every small change, but their execution time makes that impractical — so they never deliver it. Unit tests fill the gaps: pieces tested independently, grouped so subsets run under different conditions, and a quick targeted test when you suspect an error in a particular piece of code.

Good unit tests have two qualities: they run fast, and they help us localize problems. That is the operational answer to the perennial "is it still a unit test if it uses another production class?" — there is a continuum, but tests that exercise a class along with its collaborators tend to grow, and if you haven't made a class separately instantiable in a harness, it never gets easier. Hence the deliberate provocation: "A unit test that takes 1/10th of a second to run is a slow unit test." The arithmetic: 3,000 classes with 10 tests apiece is 30,000 tests; at a tenth of a second apiece that is close to an hour of feedback latency — at a hundredth, five to ten minutes. "Unit tests run fast. If they don't run fast, they aren't unit tests." A test is not a unit test if it talks to a database, communicates across a network, touches the file system, or requires environment changes to run. Such tests are often worth writing (usually in unit test harnesses), but keeping them separate preserves a fast set you can run whenever you make changes.

### 2.2 Higher-Level Testing

Unit tests are not the whole toolkit: there is a place for tests that cover scenarios and interactions across an application. Higher-level tests pin down behavior for a set of classes at a time, and once that behavior is pinned, writing tests for the individual classes is often easier.

### 2.3 Test Coverings

Given a choice, it is always safer to have tests around the changes we make — we are all human, and covering code with tests before changing it makes mistakes more likely to be caught. The chapter's example picks two change points — `getResponseText` on `InvoiceUpdateResponder` and `getValue` on `Invoice` — and covers them by writing tests for the classes they reside in. Instantiating those classes in a harness exposes the obstacles: `InvoiceUpdateResponder` takes a `DBConnection` (a real connection to a live database) and an `InvoiceUpdateServlet`. Setting up a database is slow work irrelevant to the change at hand; constructing the servlet and getting it into the right state may be impossible — and in a GUI desktop application there may be no programmatic interface at all.

These are **dependency problems**: when classes depend directly on things that are hard to use in a test, they are hard to modify and hard to work with. Dependency is one of the most critical problems in software development, and much legacy code work consists of breaking dependencies so that change can be easier.

This is **The Legacy Code Dilemma**: when we change code, we should have tests in place; to put tests in place, we often have to change code. The way out is conservative refactoring done without tests: pass the invoice-ID collection the responder actually needs instead of the whole servlet (Primitivize Parameter, p. 385), and introduce an `IDBConnection` interface (Extract Interface, p. 362). Once dependencies are broken, tests can be written that make more invasive changes safer. Sometimes the results are not pretty — parameters that production code doesn't strictly need, classes broken in odd ways. Suspend the aesthetic judgment: dependency-breaking points are like incision points in surgery — "there might be a scar left in your code after your work, but everything beneath it can get better," and if you later cover the code around the point where you broke the dependencies, you can heal that scar too.

### 2.4 The Legacy Code Change Algorithm

The algorithm — the spine the rest of the book hangs from:

1. Identify change points.
2. Find test points.
3. Break dependencies.
4. Write tests.
5. Make changes and refactor.

The day-to-day goal is not just to make changes but to make functional changes that deliver value while bringing more of the system under test: at the end of each programming episode you should be able to point both to code that provides some new feature and to its tests. Tested areas surface like islands rising out of the ocean; work in them is much easier, the islands become large landmasses, and eventually you work in continents of test-covered code.

#### 2.4.1 Identify Change Points

Where changes belong depends sensitively on your architecture. If you don't know the design well enough to feel that you are making changes in the right place, Chapter 16 (I Don't Understand the Code Well Enough to Change It) and Chapter 17 (My Application Has No Structure) provide the techniques.

#### 2.4.2 Find Test Points

Finding places to write tests is easy in some code and often hard in legacy code. Chapter 11 (I Need to Make a Change. What Methods Should I Test?) and Chapter 12 (I Need to Make Many Changes in One Area) offer techniques for determining where tests should go for a particular change.

#### 2.4.3 Break Dependencies

Dependencies are usually the most obvious impediment to testing, and they manifest two ways: difficulty instantiating classes in test harnesses and difficulty running methods in them. Ideally, tests would tell us whether the dependency breaking itself caused problems, but often we don't have them yet — Chapter 23 (How Do I Know That I'm Not Breaking Anything?) covers practices that make these first incisions safer. Chapters 9 and 10 walk through the common instantiation and invocation scenarios, and they do not cover the whole Part III catalog, so browse the catalog for more ideas. Dependencies also block test ideas before they start: large methods you can't write tests for (Chapter 22) and builds that take too long (Chapter 7) get their own treatments.

#### 2.4.4 Write Tests

The tests written in legacy code are somewhat different from the tests written for new code — Chapter 13 (I Need to Make a Change, but I Don't Know What Tests to Write) covers their role.

#### 2.4.5 Make Changes and Refactor

Feathers advocates test-driven development for adding features in legacy code (Chapter 8). After a change you are better versed in the code's problems, and the tests written to add the feature give you cover to refactor (Chapters 20, 21, 22). These techniques are "baby steps" — they don't show how to make design ideal, clean, or pattern-enriched; they make it better, where better is context dependent and often simply a few steps more maintainable than before. Don't discount the mechanical work: breaking down a large class just to make it easier to work with can make a significant difference.

#### 2.4.6 The Rest of This Book

The next two chapters provide background material on three critical concepts in legacy work: sensing, separation, and **seams**.

## Key terms

- **Edit and Pray**: making careful, well-understood changes and then taking extra time to poke around hoping nothing broke; the industry standard, but care alone doesn't make change safe.
- **Cover and Modify**: changing code under a cloak of tests that detect change, so bad changes don't leak out and infect the rest of the software.
- **Software vise**: the clamping effect of tests around the area being changed — most behavior is held fixed, so you know you are changing only one piece of behavior at a time.
- **Testing to detect change (regression testing)**: periodically running tests that check known good behavior to find out whether the software still works the way it did in the past — as opposed to testing to attempt to show correctness.
- **Unit test**: a test of an individual component in isolation; operationally, it runs fast and helps localize problems — and talks to no database, network, or file system. A tenth of a second is slow.
- **Test harness**: the testing code written to exercise a piece of software, plus the code needed to run it.
- **The Legacy Code Dilemma**: when we change code we should have tests in place, and to put tests in place we often have to change code.
- **Legacy Code Change Algorithm**: identify change points, find test points, break dependencies, write tests, make changes and refactor — the process the rest of the book elaborates.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
