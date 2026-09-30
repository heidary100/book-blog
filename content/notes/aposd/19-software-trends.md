---
title: "Software Trends"
book: aposd
chapter: 19
date: 2026-09-30
summary: "Evaluates popular trends — OOP, agile, unit tests, TDD, design patterns, getters/setters — through the lens of whether they actually reduce complexity."
tags: [trends, testing, abstractions]
---

> This chapter holds popular development trends up against the book's central question: does this reduce complexity in large systems? The verdicts are mixed — interface inheritance and unit tests provide real leverage, while implementation inheritance, test-driven development, and getter/setter patterns often make things worse. The meta-lesson: challenge every new paradigm from the standpoint of complexity, because many ideas that sound good make complexity worse.

## The big idea

Trends and fashions sweep through software development, and it is easy to adopt them because they are popular rather than because they pay off. Ousterhout's approach here is to use the book's principles — deep modules, information hiding, shallow interfaces, tactical vs. strategic programming — as an evaluation rubric. Applying it yields a consistent pattern: trends are good exactly to the extent that they reduce the information a developer must hold in their head, and harmful when they optimize for something else (speed of shipping, familiarity, or ritual).

The recurring failure mode across several trends is **tactical programming**: focusing on getting features working now rather than investing in clean abstractions. Agile can slide into it, test-driven development is described as embodying it, and design patterns can be forced onto problems they don't fit. The recurring success mode is anything that enables refactoring and information hiding.

## Section by section

### 19.1 Object-oriented programming and inheritance

OOP's mechanisms (classes, inheritance, private methods and variables) can help produce better designs — private members enforce information hiding by making external dependencies impossible — but they guarantee nothing: shallow classes, complex interfaces, or exposed internal state produce high complexity regardless of paradigm.

Inheritance splits into two forms with very different effects:

- **Interface inheritance** — a parent defines method signatures without implementations; subclasses implement them differently (one I/O interface implemented for disk files and for network sockets). This is genuine leverage: knowledge from one problem transfers to another, and the more implementations an interface has, the *deeper* it is — many implementations force the interface to capture only the essentials shared by all of them, which is the heart of abstraction.
- **Implementation inheritance** — the parent also provides default implementations that subclasses inherit or override. It reduces duplication (and thus change amplification, Chapter 2), but creates dependencies between parent and subclasses: instance variables are often shared across the hierarchy, leaking information and making it hard to change one class without studying the others. In the worst case, you need complete knowledge of the whole hierarchy to touch any of it; such hierarchies tend to have high complexity.

Recommendations: prefer composition — small helper classes the original classes build upon rather than inherit from. If implementation inheritance is unavoidable, separate parent-managed state from subclass-managed state (e.g. subclasses touch parent instance variables only read-only or through parent methods), applying information hiding within the hierarchy.

### 19.2 Agile development

Agile (emerging in the late 1990s, formalized in 2001) is mostly about *process* — teams, schedules, testing, customer interaction — not design, but it connects to the book in one big way: incremental, iterative development with design, tests, and customer input in each iteration. This matches Chapter 1's claim that you cannot visualize a complex system well enough upfront; the best designs emerge by adding a few abstractions per increment and refactoring based on experience.

The risk: agile can push developers toward **tactical programming**. It focuses on features rather than abstractions and encourages deferring design to ship working software sooner — e.g. the advice to build a minimal special-purpose mechanism now and generalize it later. That reasoning argues against investment and lets complexity accumulate rapidly. The fix: "the units of development should be abstractions, not features." It's fine to postpone an abstraction until a feature needs it, but once needed, design it cleanly and somewhat generally (Chapter 6) in one go.

### 19.3 Unit tests

Historically developers rarely wrote tests; QA teams did. Agile made developer-written testing mainstream. Two kinds: **unit tests** (small, focused, validating a small piece of a single method, runnable in isolation, often paired with coverage tools, updated by developers with every change) and **system/integration tests** (run the whole application under production-like conditions, usually owned by a separate QA team).

Tests matter for *design* because they enable refactoring. Without a test suite, major structural changes are dangerous — bugs surface after deployment where they are far more expensive to fix — so developers minimize changes per feature, and complexity accumulates while design mistakes never get corrected. With good tests, developers refactor confidently. Unit tests are especially valuable because they cover more code, so they find more bugs.

The book's war story: while rewriting Tcl's interpreter as a byte-code compiler — a change touching nearly every part of the core engine — the existing unit test suite was so effective that only a single bug surfaced after the alpha release.

### 19.4 Test-driven development

TDD inverts the order: write the failing unit tests first, then write just enough code to pass each test in turn. Ousterhout is a strong advocate of unit testing but *not* of TDD: it focuses attention on getting specific features working rather than finding the best design — "tactical programming pure and simple." It is too incremental; at any moment the temptation is to hack in the next feature to make the next test pass, and there is no obvious time to do design.

The alternative consistent with 19.2: develop in units of abstractions, and when an abstraction is needed, design it all at once (at least a reasonably comprehensive core) rather than piecemeal.

One exception earns his endorsement: **write the test first when fixing a bug**. Write a test that fails because of the bug, then fix it. If you fix first, the test you write later may not actually trigger the bug, so it can't prove the fix.

### 19.5 Design patterns

A design pattern is a well-known solution to a recurring problem (iterator, observer), popularized by the "Gang of Four" book. Patterns are mostly good: they exist because they solve common problems cleanly, and if one fits your situation, you are unlikely to beat it with something custom.

The great risk is **over-application**: not every problem fits an existing pattern, and forcing one in when a custom approach would be cleaner adds complexity. Using patterns doesn't automatically improve a system; it helps only when they fit. "Good" does not mean "more is better."

### 19.6 Getters and setters

A Java-community pattern: `getFoo`/`setFoo` pairs for each instance variable. The rationale is future-proofing — you can later add validation, notification, or derived-value updates without changing the interface.

Ousterhout's verdict: if you must expose instance variables, getters and setters make sense, but it's better not to expose them at all. Exposed state means part of the implementation is visible externally, violating information hiding and complicating the interface. Getters and setters are shallow methods (usually one line) — interface clutter without meaningful functionality. This is also a case study of pattern overuse: once a pattern is blessed, developers assume it is good and apply it everywhere, which is exactly what happened in Java.

### 19.7 Conclusion

The general rule to take away: whenever you meet a proposed new development paradigm, challenge it on complexity grounds — "does the proposal really help to minimize complexity in large software systems?" Some fashionable ideas sound good but make complexity worse.

## Key terms

- **Interface inheritance**: a parent class defines method signatures without implementations; subclasses implement the same signatures in different ways. Generally beneficial — it deepens interfaces.
- **Implementation inheritance**: a parent class provides default implementations that subclasses inherit or override. Creates parent–child dependencies and information leakage; use with caution, prefer composition.
- **Unit test**: small, focused test of a small piece of a single method, runnable in isolation; usually written and maintained by developers.
- **System (integration) test**: runs the whole application under production-like conditions to verify parts work together; usually written by a separate QA team.

## My takeaways
<!-- Fill in as you re-read and apply the chapter. -->
-
