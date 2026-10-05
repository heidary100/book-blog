---
title: "It Takes Forever to Make a Change"
book: legacy-code
chapter: 7
date: 2026-10-04
summary: "Changes take forever for two reasons — code that outgrew understanding, and lag time between making a change and getting feedback — and the remedy is breaking dependencies, especially build dependencies, so clusters of classes compile and test in seconds."
tags: [legacy-code, build-systems, decoupling, testing]
---

> Some teams can find out what feature they need, visualize exactly where the change goes, make the edit in five minutes, and still wait hours before the change can be released. Feathers splits the pain into two causes: understanding (code whose ramification-hunting takes longer and longer) and lag time (the dead wait between making a change and getting real feedback — Mars-rover development). The remedy for both is the same act: break dependencies so classes can be instantiated in test harnesses and compiled separately, then use interfaces and packages so that most changes force only a small rebuild.

## The big idea

This is the shortest diagnostic chapter in the book and the hinge that motivates everything after it. A slow change is not a moral failing or an inevitable cost of size; it is the compound effect of dependencies — chiefly the need to compile, link, and rebuild things you don't care about in order to touch something you do. Feathers' target is concrete: in most mainstream languages you can break dependencies so that you recompile and run tests against the code you are working on in under 10 seconds (under 5 if the team is motivated). Every chapter that follows — the test-harness impediments (9-10), effect sketches (11), pinch points (12), and the dependency-breaking catalog (25) — exists to make that possible. It is also quietly a design chapter: the fix for slow builds turns out to be depending on less volatile things, which is just good layering.

## Section by section

### 7.1 Understanding

As a project grows, its code gradually surpasses understanding, and the time needed just to figure out what to change keeps increasing — partly unavoidable, since any unfamiliar context takes a while. The key difference between a well-maintained system and a legacy one is what happens after the figuring-out: in a well-maintained system the change itself is usually easy and you come away more comfortable with the system; in a legacy system the change is difficult too, you learn little beyond the narrow slice you needed, and in the worst cases no amount of study feels sufficient — you "walk blindly into the code and start, hoping" to handle problems as they appear. Systems broken into small, well-named, understandable pieces enable faster work; Chapters 16 and 17 are the pointers if understanding is the bottleneck.

### 7.2 Lag time

**Lag time** is the time between making a change and getting real feedback about it. The metaphor is the Mars rover Spirit: about seven minutes for a signal to reach Mars, so a manually driven rover reports its movement fourteen minutes after you move the controls — "ridiculously inefficient," yet an accurate picture of mainstream development: make changes, start a build, find out what happened later. We even compound it the way a remote driver would: bundling many changes per build to avoid building often, then slowing further when an obstacle (a test failure) appears — except our software has no onboard guidance to navigate around obstacles for us. The waste is unnecessary in most languages: dependencies can be broken so that every class or module compiles separately, in its own test harness, with near-instant feedback.

The psychology matters as much as the mechanics. Given a 5-10 second task on a one-minute step cadence, the mind does the step, plans, and wanders. Compress the cadence to a few seconds and the quality of mental work changes: feedback lets you try approaches quickly, work becomes "more like driving than like waiting at a bus stop," concentration intensifies, and — most important — the time to notice and correct mistakes shrinks dramatically. Some people already work this way: programmers in interpreted languages often get near-instantaneous feedback. For the rest, the main impediment is dependency itself: needing to compile something you don't care about because you want to compile something else.

### 7.3 Breaking Dependencies

In object-oriented code, the first move is to attempt to instantiate the classes you need in a test harness. Nearly every problem you hit on the way is a dependency you should break — the easy cases need only imports, the harder ones the techniques of Chapters 9 and 10. Once a class is in a harness, edit-compile-link-test is usually fast: most methods cost little to execute compared to what they call (databases, hardware, communications), with calculation-intensive methods the exception (Chapter 22). When the classes are too overwhelming individually, cut out a larger chunk and test at its boundary — Chapter 12's **pinch points**, places where test writing is easier. The rest of the chapter addresses the build mechanics of what you've just done.

#### 7.3.1 Build Dependencies

To build a cluster of classes quickly, first find which dependencies get in the way (attempt to use the cluster in a harness — every obstruction is a candidate), then look at everything that depends on the classes you've instantiated: those recompile on every rebuild. The fix is to extract interfaces for cluster classes used from outside the cluster — in many IDEs a menu selection that lists the class's methods, lets you choose the ones for the new interface, and can replace references to the class with references to the interface throughout the code base ("an incredibly useful feature"). In C++, Extract Implementer is a bit easier than Extract Interface because references need no renaming, only instantiation sites. Then restructure physically: move the cluster into a new package or library. The accounting is the chapter's key idea: total cost of a full rebuild grows (more files), but the **average build time** — a make that recompiles only what changed — can drop dramatically.

The worked example (Figures 7.1-7.4): `AddOpportunityFormHandler` depends on concrete `ConsultantSchedulerDB` (which connects to a database) and `AddOpportunityXMLGenerator`, so instantiating it in tests drags in who knows what. Extract Implementer on `ConsultantSchedulerDB` yields an interface plus `ConsultantSchedulerDBImpl`; tests pass a fake object, and as a side effect edits to the impl no longer force `AddOpportunityFormHandler` to recompile:

```text
before:  AddOpportunityFormHandler --> ConsultantSchedulerDB --> database
after:   AddOpportunityFormHandler --> ConsultantSchedulerDB (interface)
                                            |
                          ConsultantSchedulerDBImpl --> database
         (tests instantiate the handler with a fake ConsultantSchedulerDB)
```

Extracting an implementer on `OpportunityItem` the same way builds a **compilation firewall** around the handler: impl classes can change freely without forcing it — or anything that uses it — to recompile. Made explicit, the cluster becomes an `OpportunityProcessing` package with no dependency on the database implementation, whose tests compile quickly and which doesn't recompile when the database implementation changes.

#### The Dependency Inversion Principle

Code depending on an interface carries a minor, unobtrusive dependency: nothing changes unless the interface changes, and interfaces change far less often than the code behind them. So depend on interfaces and abstract classes rather than concrete classes — depending on less volatile things minimizes the chance that a particular change triggers massive recompilation. Shield the other direction too: when `AddOpportunityFormHandler` is the only public production class in its package, Extract Interface on it lets outside packages depend on the interface and be shielded from most changes. The price is real — more interfaces and packages mean conceptual overhead and a slightly longer full rebuild — but it is worth paying: finding things may take a little longer, yet working with them is easier, and the average build time drops dramatically. Best of all, the cost is once per cluster: "afterward, you get to reap the benefits forever."

### 7.4 Summary

These techniques speed up builds for small clusters of classes — but that is only a small portion of what interfaces and packages can do to manage dependencies; Feathers points to Robert C. Martin's *Agile Software Development: Principles, Patterns, and Practices* for the rest. In the book's arc, the chapter reframes the whole dependency-breaking program as a latency problem: getting clusters under test is what buys sub-10-second feedback, and fast feedback is what makes every other technique in the book practical.

## Key terms

- **Lag time**: the elapsed time between making a change and receiving real feedback about it; the enemy of intense, driving-like development.
- **Average build time**: the time of an incremental build that recompiles only what changed — the number dependency-breaking and package restructuring optimize, at the price of a slightly longer full rebuild.
- **Compilation firewall**: an interface placed between a cluster and volatile implementation code, so impl changes stop forcing recompilation of the cluster and its users.
- **Dependency Inversion Principle**: depend on interfaces or abstract classes rather than concrete classes, because they are less volatile — fewer changes ripple, in design or in builds.
- **Pinch point**: a narrowing in the code where tests for many behaviors converge; first mentioned here as the place to test when individual classes are too entangled to tackle (formalized in Chapter 12).

## My takeaways

*Fill this in as you re-read and apply the chapter.*
