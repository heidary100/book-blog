---
title: "How Do I Add a Feature?"
book: legacy-code
chapter: 8
date: 2026-10-04
summary: "Two ways to add features to code you can get under test: test-driven development — failing test, compile, pass, remove duplication — and programming by difference, subclassing to introduce a change without touching tested code, then using the tests to refactor toward a better structure."
tags: [legacy-code, testing, abstractions, design-process]
---

> Once code is under test, adding features stops being an act of nerve. Test-driven development drives each increment in with a failing test — write a failing test case, get it to compile, make it pass, remove duplication, repeat — so you design each method from the outside in and never mix writing code with refactoring. Object orientation offers a second path: programming by difference, subclassing to add behavior without touching the tested class, then using the pinned-down tests to move the design somewhere better. In greenfield work both are ordinary practice; in legacy work they are the payoff for all the dependency-breaking effort — and the reason to confront the code rather than keep sprouting around it.

## The big idea

Chapter 6 was about adding to code without tests; this chapter is about adding to code with them, and why that is worth the detour. Sprouting and wrapping have hazards beyond the obvious: the untested code doesn't get better; new code can silently duplicate untested code and the duplication festers; and fear plus resignation accumulate — fear that a piece of code can't be made easier to work with, resignation because whole areas never improve. "In general, it's better to confront the beast than hide from it." Once tests are in place, two techniques carry the day. TDD is, in Feathers' words, "the most powerful feature-addition technique I know of," and its design value is built into the first step: you imagine a method that would help solve the problem, then write a test for it before it exists — solidifying your understanding of what the code should do before you write it. Programming by difference is the inheritance-based shortcut for when even a TDD step feels slow — with the caveat that its 1990s fall from favor was earned, and tests are what let you back out of it.

## Section by section

### 8.1 Test-Driven Development (TDD)

The algorithm: 1. write a failing test case; 2. get it to compile; 3. make it pass; 4. remove duplication; 5. repeat. The example works on `InstrumentCalculator`, a financial class needing statistical moments about a point. First cycle — the happy path. The failing test is written against a method that does not exist yet:

```java
public void testFirstMoment() {
    InstrumentCalculator calculator = new InstrumentCalculator();
    calculator.addElement(1.0);
    calculator.addElement(2.0);
    assertEquals(-0.5, calculator.firstMomentAbout(2.0), TOLERANCE);
}
```

To compile, `firstMomentAbout` is added as an empty method returning `Double.NaN` — definitely not -0.5, so the test fails for the right reason. To pass, the straightforward loop over `elements`. (An abnormally large step for TDD, Feathers notes — fine when you are certain of the algorithm.) No duplication, so on to the next case.

Second cycle — the error case. Dividing by an empty list should throw `InvalidBasisException`, and the test is inverted: it fails if that exception isn't thrown and passes if no exception or any other is thrown.

```java
public void testFirstMoment() {
    try {
        new InstrumentCalculator().firstMomentAbout(0.0);
        fail("expected InvalidBasisException");
    }
    catch (InvalidBasisException e) {
    }
}
```

Declaring `throws InvalidBasisException` doesn't compile until the method actually throws it — the compiler pushes the guard `if (elements.size() == 0)` into place. Third cycle — `secondMomentAbout`, a variation of the first where the one line that changes is the numerator:

```java
numerator += element - point;                  // first moment
numerator += Math.pow(element - point, 2.0);   // second moment
numerator += Math.pow(element - point, N);     // the general Nth-moment pattern
```

The first version works because `element - point` equals `Math.pow(element - point, 1.0)`. There is a general method waiting here, but generalizing immediately would burden callers with an `N` argument they shouldn't choose; the discipline is to finish what you started and generalize later. To compile, copy `firstMomentAbout` wholesale and rename it; to pass, change the one line. The copy-paste shock is deliberate: in legacy code, putting new code side by side with old is a comprehension tool — you can fold it in nicely later, or throw it away and try again, "knowing that we still have the old code to look at and learn from."

Then remove duplication: extract the body into a private `nthMomentAbout(point, n)` and leave the two public methods as one-line delegations:

```java
public double firstMomentAbout(double point) throws InvalidBasisException {
    return nthMomentAbout(point, 1.0);
}

public double secondMomentAbout(double point) throws InvalidBasisException {
    return nthMomentAbout(point, 2.0);
}
```

This final step is what makes the brutality safe. Copy-whole-blocks adding is easy; without the deduplication pass it is just a maintenance burden. With tests in place you have a free hand to write whatever code the feature needs, because you know you can fold it into the rest of the code without making things worse.

#### TDD and Legacy Code

TDD's deepest value is concentration: "we are either writing code or refactoring; we are never doing both at once." That separation is especially valuable in legacy work, where it lets new code be written independently of old code, with duplication between them removed only afterward. The legacy variant of the algorithm adds a step zero and a constraint: 0. get the class you want to change under test; 3'. make it pass — *try not to change existing code as you do this*; then remove duplication folds the new into the old.

### 8.2 Programming by Difference

TDD isn't tied to object orientation — the `InstrumentCalculator` example is procedural code wrapped in a class. In OO there is another option: use inheritance to introduce features without modifying a class directly, then decide how the feature really ought to be integrated. Programming by difference is an old technique, widely used in the 1980s, out of favor by the 1990s once overused inheritance showed its costs — but using inheritance *initially* doesn't mean keeping it: with tests pinning the new behavior, moving to other structures is cheap.

The example: a tested `MessageForwarder` for mailing lists, with a private `getFromAddress(Message)` used by `forwardMessage`. New requirement — anonymous lists, where posts go out from `anon-members@<domain>`. A failing test drives the change, and the quickest passing move is a subclass rather than a modification: make `getFromAddress` protected in `MessageForwarder`, then override:

```java
public class AnonymousMessageForwarder extends MessageForwarder {
    protected InternetAddress getFromAddress(Message message)
            throws MessagingException {
        return new InternetAddress("anon-" + listAddress);
    }
}
```

Does it make sense to subclass an entire forwarding class to change one address? Not in the long term — but it passes the test fast, and the test then guarantees the behavior is preserved through whatever redesign follows. The catch arrives with the second difference: forwarding to off-list (bcc) recipients is easy as *another* subclass — until you need a forwarder that is both anonymous and off-list. With features in distinct subclasses, "we can only have one of those features at a time."

The way out is to stop before adding the second feature and refactor where the first one lives, using the test to verify behavior. Make anonymous forwarding a configuration option — a `Properties` collection accepted by the constructor:

```java
Properties configuration = new Properties();
configuration.setProperty("anonymous", "true");
MessageForwarder forwarder = new MessageForwarder(configuration);
```

Fold the anonymous case into `getFromAddress` itself, verify by commenting out the subclass's override and rerunning the tests, then delete `AnonymousMessageForwarder` and fix up its construction sites. The method is now messy, but tests make an extract-method cleanup trivial. Is folding both features into `MessageForwarder` a Single Responsibility Principle violation? Depends on how large and tangled the responsibility's code gets; a couple of properties is fine. When properties litter the class with conditionals, promote them to a `MailingConfiguration` object, then move behavior into it: `getFromAddress` moves across (the class stops being passive property storage and offers higher-level functionality), `buildRecipientList` follows, and the name no longer fits — a class that actively builds and modifies data for forwarders is a `MailingList`. Feathers' aside is worth keeping: "Rename Class is the most powerful [refactoring]. It changes the way people see code and lets them notice possibilities that they might not have considered before."

#### The Liskov Substitution Principle

The gotchas. The classic: `Square extends Rectangle`, and then

```java
Rectangle r = new Square();
r.setWidth(3);
r.setHeight(4);   // expecting area 12, getting 16
```

A **Liskov Substitution Principle (LSP)** violation: objects of subclasses must be substitutable for objects of their superclasses throughout the code — clients should be able to use subclass objects without knowing they are subclass objects. There is no mechanical check; conformance depends on what clients expect. Two rules of thumb help: avoid overriding concrete methods, and if you must, call the overridden method from the override. The `MessageForwarder` example did the opposite — `AnonymousMessageForwarder` overrode a concrete method, so anyone holding a `MessageForwarder` reference may reasonably assume the base behavior and be wrong. If the inheritance were worth keeping, the fix is to make `MessageForwarder` abstract with an abstract `getFromAddress` — a **normalized hierarchy**, where no class has more than one implementation of a method, and "how does this class do X?" is answered by looking in exactly one place. A few concrete overrides are harmless when no LSP violation results, but it pays to notice how far a hierarchy is from normalized form and to move toward it when preparing to separate responsibilities. The closing loop: programming by difference introduces variation quickly; tests pin the behavior down and make the move to more appropriate structures rapid.

### 8.3 Summary

These techniques work on any code you can get under test — which is the argument for the dependency-breaking work of the surrounding chapters. For TDD proper, Feathers recommends Kent Beck's *Test-Driven Development: By Example* and Dave Astels' *Test-Driven Development: A Practical Guide*.

## Key terms

- **Test-driven development (TDD)**: adding features by writing a failing test for a method that doesn't exist yet, making it compile, making it pass, then removing duplication — design done from the outside in, one concern at a time.
- **Programming by difference**: introducing a feature by subclassing rather than modifying tested code, then using the tests to refactor the inheritance away or into better form.
- **Liskov Substitution Principle (LSP)**: subclass objects must be usable anywhere their superclass objects are expected, without clients knowing or caring — violations produce silent errors.
- **Normalized hierarchy**: an inheritance hierarchy in which no class overrides a concrete method it inherits — each behavior has exactly one implementation, so reading the class answers "how does it do X?"

## My takeaways

*Fill this in as you re-read and apply the chapter.*
