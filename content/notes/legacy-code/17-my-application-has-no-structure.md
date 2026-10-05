---
title: "My Application Has No Structure"
book: legacy-code
chapter: 17
date: 2026-10-04
summary: "Sprawling systems lose their shared big picture, and it can only be rebuilt in the team's collective head: tell the story of the system until its simplifications hurt, run Naked CRC sessions where blank cards become instances in motion, and scrutinize design conversations for concepts the code doesn't have."
tags: [legacy-code, architecture, teams, design-process]
---

> Long-lived applications sprawl under schedule pressure until nobody really understands the complete structure, and new features get routed through the "hack points" people know best. Awareness of architecture decays — and an architect alone cannot supply it, because "architecture is too important to be left exclusively to a few people." The chapter's three practices — **telling the story of the system**, **Naked CRC**, and **conversation scrutiny** — keep architectural thinking alive across the whole team, and with it the architecture itself.

## The big idea

An architect role can help, but with one strong caveat: the architect has to be out in the team, working with the members day to day, or the code diverges from the big picture — either someone does something inappropriate in the code, or the big picture itself needs to change and nobody notices. The worst situations Feathers encountered had an architect whose view of the system was completely different from the programmers', usually because other responsibilities kept the architect out of the code or out of communication, and the divergence broke communication across the organization. Hence the brutal truth: everyone who touches the code should know the architecture and have a stake in it. A team of twenty with three people who know the architecture in detail means either those three do all the steering or the other seventeen make mistakes caused by unfamiliarity with the big picture.

What gets in the way of architectural awareness?

- The system can be so complex that it takes a long time to get the big picture.
- The system can be so complex that there is no big picture.
- The team can be so reactive — dealing with emergency after emergency — that it loses sight of the big picture.

The three techniques in this chapter are practices to run often, not artifacts to produce. Practiced on a team, they keep architectural concerns alive — "perhaps the most important thing you can do to preserve architecture," because it is hard to pay attention to something you don't think about often. When everyone works off the same set of ideas, "the overall system intelligence of the team is amplified." (For a catalog of related techniques, Feathers points to *Object-Oriented Reengineering Patterns* by Demeyer, Ducasse, and Nierstrasz.)

## Section by section

### 17.1 Telling the Story of the System

The technique needs at least two people. One asks, "What is the architecture of the system?" The other explains it using only a few concepts — as few as two or three — in a few sentences, pretending the listener knows nothing about the system, then picks the next most important things to say until just about everything important about the core design has been articulated.

Done honestly, this produces an odd feeling: to convey the architecture that briefly you have to simplify, and the simplification feels like lying. Say "the gateway gets rule sets from the active database" and part of you screams that it also gets them from the current working set. But the simpler story describes an easier-to-understand architecture — and it immediately poses a design question: why does the gateway get rule sets from more than one place; wouldn't it be simpler if it were unified? Pragmatic considerations often keep things from getting simple, but articulating the simple view separates what would be ideal from what is mere expediency, and it forces you to think about what is most important in the system.

The story then earns its keep twice over. As a roadmap, it is a way of getting your bearings when you hunt for the right places to add features — and it makes the system a lot less scary. As a design arbiter, it discriminates between candidate changes: some changes fall more in line with the story, making the briefer story "feel like less of a lie," so when you must choose between two ways of doing something, the story points at the one that leads to the easier-to-understand system. Tell it often on your team, tell it in different ways, and trade off whether one concept is more important than another.

The book's worked session walks through JUnit. The first telling:

> JUnit has two primary classes, `Test` and `TestResult`. Users create tests and run them, passing along a `TestResult`; when a test fails it tells the `TestResult` about it, and people ask the `TestResult` for the failures that have occurred.

Then the simplifications — each a fact the brief story papered over:

1. Calling `Test` and `TestResult` "primary" is a judgment: their interaction is the core interaction of the system, and others might have a different, equally valid view.
2. Users don't create test objects; reflection builds them from test case classes.
3. `Test` isn't a class but an interface, implemented by `TestCase`, which users subclass.
4. People generally don't ask `TestResult`s for failures — `TestResult`s register listeners, which are notified whenever a `TestResult` receives information from a test.
5. Tests report more than failures: the number of tests run and the number of errors (errors are problems not explicitly checked for; failures are failed checks).

The simplifications themselves carry design insight: simpler xUnit frameworks make `Test` a class and drop `TestCase` entirely, or merge errors and failures so that they are reported the same way. Ripping away detail to tell the story is really abstracting — forcing yourself to communicate a very simple view of a system can surface new abstractions. And a system more complicated than its simplest story is not thereby bad: systems get more complicated as they grow, and "the story gives us guidance."

The guidance is concrete when a feature arrives — a report of tests that run no assertions. Option A: add a `buildUsageReport` method to `TestCase`, running each method and building a report of the ones that never call an assert. That works, but it gives `TestCase` a completely different responsibility that the story never mentions — a bolder lie. Option B: have `TestResult` get a count of the number of assertions run whenever a test runs, and register a report-building class with `TestResult` as a listener; the story generalizes so that tests pass information about the test run to the `TestResult`:

> JUnit has two primary classes, `Test` and `TestResult`. Users create tests and run them, passing them a `TestResult`; when a test runs, it passes information about the test run to the `TestResult`, and people ask the `TestResult` for information about all of the test runs.

That is still a small lie, but it is already glossing over the runs and errors that tests send to test results, and the story remains "substantially true" — whereas option A's omission is total. Feathers prefers B: the change falls more in line with the architecture of the system.

### 17.2 Naked CRC

The history: in the 1980s Ward Cunningham and Kent Beck were trying to help people start to think about design in terms of objects, and Ward — then working with Hypercard — hit the insight of using real index cards to represent classes, making them tangible and easy to discuss. CRC stands for Class, Responsibility, and Collaborations: each card carries a class name, its responsibilities, and a list of its collaborators; a responsibility that doesn't belong on a particular card is crossed out and written on another, or spawns a new card altogether. CRC was popular for a while, then the industry pushed toward diagrams — nearly everyone teaching OO had a notation, the multiyear consolidation effort produced UML, and people mistook the notation for a method: draw plenty of diagrams, then write code. UML is a good notation for documenting systems, but it is not the only way of working with the ideas used to build them.

**Naked CRC** is "just like CRC, except that you don't write on the cards" — a name from some testing friends of Feathers, and a technique he learned from Ron Jeffries at a conference. The person describing the system lays blank index cards on a table one by one, moving them, pointing at them, doing whatever else is needed to convey the typical objects in the system and how they interact. The book's example is a real-time voting system: a client session card with two connection cards laid on it; a server session card on the right, also with two connections; server sessions registering with a vote manager card laid above them; a vote moving from a client connection to a server session, which acknowledges and records the vote with the vote manager; then the vote manager telling each server session to tell its client session what the new vote count is. The prose can't quite carry it — the technique lives in motion and position, which make involved scenarios easier to grasp and, for some reason, make designs more memorable.

Two guidelines govern the whole practice:

1. Cards represent instances, not classes.
2. Overlap cards to show a collection of them.

The cards themselves don't matter — anything handy is fine; what matters is making pieces of a system into tangible things.

### 17.3 Conversation Scrutiny

Legacy code suppresses abstraction-building: facing four or five classes of about a thousand lines each, you are trying to figure out what has to change, not thinking about adding new classes — and the distraction hides ideas sitting in your own vocabulary. Feathers' example: a team making a large, deadlock-prone chunk of code executable from several threads. They devised a lock-ordering policy and had started writing the count-tracking arrays inline when he interrupted: "Wait, we're talking about a locking policy, right?" — make it a `LockingPolicy` class, maintaining the counts there, with method names that really describe what they are trying to do, clearer than code that bumps counts in an array. The team wasn't inexperienced; there is just "something mesmerizing about large chunks of procedural code: They seem to beg for more."

The discipline: listen to conversations about your design, and ask whether the concepts you use in conversation are the same as the concepts in the code. Not all of them will be — software has to satisfy stronger constraints than just being easy to talk about — but if there isn't a strong overlap between conversation and code, it is important to ask why. The answer is usually a mixture of two things: the code hasn't been allowed to adapt to the team's understanding, or the team needs to understand it differently. When people talk about design, they are trying to make other people understand them; put some of that understanding in the code.

The chapter closes by dissolving its own premise: these are techniques for uncovering and communicating the architecture of large existing systems, but they are also perfectly good ways of working out the design of new systems — design is design, regardless of when it happens in the development cycle. The worst mistake a team can make is to feel that design is over at some point in development while changes continue: new code will appear in poor places, and classes will bloat because no one feels comfortable introducing new abstractions. "There is no surer way to make a legacy system worse."

## Key terms

- **Telling the story of the system**: explaining a system's architecture in as few concepts as possible, accepting the "lies" of simplification; the story is a shared roadmap, and a change that keeps the story substantially true is a change that falls in line with the architecture.
- **Naked CRC**: CRC without written cards — blank index cards laid out, moved, pointed at, and overlapped to represent instances and their interactions; cards are instances, not classes, and overlap shows a collection.
- **Conversation scrutiny**: comparing the concepts people naturally use to describe the design against the concepts in the code, and closing the gap by putting the conversation's understanding into the code.
- **Hack point**: the area of the system people know best and therefore keep adding features to, however poor a home it is for them.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
