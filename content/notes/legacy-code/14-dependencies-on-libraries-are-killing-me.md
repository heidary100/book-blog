---
title: "Dependencies on Libraries Are Killing Me"
book: legacy-code
chapter: 14
date: 2026-10-04
summary: "Every hard-coded use of a library class is a place where you could have had a seam; wrap the library classes you need behind thin interfaces of your own, and prefer coding conventions over language-enforced design constraints that make faking impossible in tests."
tags: [legacy-code, seams, decoupling]
---

> Libraries buy time through reuse, and promiscuous use of them quietly takes it back: call a library directly everywhere in your code and you are stuck with it — one team watched a vendor's royalty hike turn their dependency into a problem they could only fix by rewriting the application. The remedy is to stop littering direct calls to library classes and wrap the ones you need behind thin interfaces of your own, because every hard-coded use is a place where you could have had a **seam**. Library language features that enforce design constraints — final and sealed classes, non-virtual methods, singletons — predictably collide with testing, and two of those collisions get names: the **once dilemma** and the **restricted override dilemma**.

## The big idea

Libraries are one of the best deals in development: buy a library that solves a problem, figure out how to use it, and cut substantial time off a project. The failure mode is over-reliance. "Avoid littering direct calls to library classes in your code. You might think that you'll never change them, but that can become a self-fulfilling prophecy." Feathers' example is a team severely burned: the vendor raised royalties so high that the application couldn't make money in the marketplace, and moving to another vendor's library would have meant separating out every call to the original vendor's code — in effect, a rewrite.

The platform era sharpens the risk rather than removing it. Java and .NET compete partly on the breadth of their bundled libraries, which is a win for many projects — but you can still over-rely on any particular one of them. The lens for the whole chapter: every hard-coded use of a library class is a place where you could have had a seam, and the chapter is about what to do when the library's own design decisions have taken that choice away from you.

## Section by section

Reuse is genuinely valuable, and that is what makes the trap easy to fall into. Some teams have been severely burned by over-reliance on libraries: in one case a vendor raised royalties so high that the application couldn't make money in the marketplace, and separating out the calls to the original vendor's code would have amounted to a rewrite. Hence the rule: avoid littering direct calls to library classes — never changing them can become a self-fulfilling prophecy.

The polarization of the development world around Java and .NET makes this worse in a subtle way. Both vendors make their platforms as broad as possible, creating many libraries so that people keep using their products. That is a win for many projects, but it does not remove the risk of over-relying on one particular library.

The seam accounting comes next: every hard-coded use of a library class is a place where you could have had a seam. Some libraries are very good about defining interfaces for all of their concrete classes, and where they are, faking collaborators under test is straightforward.

In other cases classes are concrete and declared `final` or `sealed`, or they have key functions that are non-virtual — leaving no way to fake them out under test. When that is the library you are stuck with, sometimes the best thing you can do is **wrap**: write a thin wrapper over just the classes you need to separate out, and route your code through it. The wrapper is your seam — the same move as Chapter 6's wrap class, applied at the boundary between your code and someone else's.

Structural fixes have a social complement: write your vendor and give them grief about making your development work difficult.

The root problem is a tension library designers keep creating: "library designers who use language features to enforce design constraints are often making a mistake. They forget that good code runs in production and test environments. Constraints for the former can make working in the latter nearly impossible." Two instances get names.

**The once dilemma.** If a library assumes there is going to be only one instance of a class in the system, fake objects become difficult to use. There may be no way to apply Introduce Static Setter or many of the other dependency-breaking techniques for dealing with singletons — sometimes wrapping the singleton is the only choice available.

**The restricted override dilemma.** In some OO languages all methods are virtual; in others they are virtual by default but can be made non-virtual; in others you have to explicitly make them virtual. From a design perspective there is some value in non-virtual methods, and people in the industry have at times recommended making as many methods non-virtual as possible. Whatever the reasons, the practice makes it hard to introduce sensing and separation in a code base.

The counter-evidence is hard to deny: people write very good code in Smalltalk, where the practice is impossible; in Java, where it is generally not done; and even in C++, where plenty of code has been written without it.

The chapter's answer is a coding convention instead of a language feature: "you can do very well just pretending that a public method is non-virtual in production code. If you do that, you can override it selectively in test and get the best of both worlds" — the design discipline in production, the seam in tests. Sometimes using a coding convention is just as good as using a restrictive language feature; think about what your tests need.

## Key terms

- **Thin wrapper**: a minimal class of your own that stands between your code and a library class you cannot fake, creating a seam where the library offered none.
- **Once dilemma**: a library design that assumes a single instance of a class exists, blocking fake objects and most singleton dependency-breaking techniques; wrapping the singleton is sometimes the only remedy.
- **Restricted override dilemma**: `final`/`sealed`/non-virtual methods cannot be overridden, making sensing and separation hard; prefer the convention — treat public methods as non-virtual in production and override them selectively in tests.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
