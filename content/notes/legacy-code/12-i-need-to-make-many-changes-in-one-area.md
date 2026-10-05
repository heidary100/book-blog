---
title: "I Need to Make Many Changes in One Area. Do I Have to Break Dependencies for All the Classes Involved?"
book: legacy-code
chapter: 12
date: 2026-10-04
summary: "A closely scattered change doesn't require breaking every dependency individually: test one level back at an interception point, and hunt for pinch points — narrowings in the effect sketch where a couple of tests detect effects across a whole cluster of classes — then use their presence or absence as a design verdict."
tags: [legacy-code, testing, seams, software-design]
---

> A closely scattered change — three or four related classes, each a couple of hours to get under test — is one of the most infuriating things in legacy work, and the answer is that you don't have to break all the dependencies individually. Test **one level back**: find an **interception point**, a place where the effects of several changes can all be detected, and if the design cooperates, a **pinch point** — a narrowing in the effect sketch where tests against a couple of methods cover a whole cluster. Pinch points also grade the design itself: a natural narrowing is a natural encapsulation boundary, and code without any is telling you its responsibilities are misplaced.

## The big idea

Higher-level tests are usually sold as a compromise, but they are a tactic: write tests at a single public method for changes in several private methods, or at one object's interface for a collaboration of the objects it holds. They demand less dependency breaking, and they hold "a bigger chunk in the **software vise**" — the structure below the tests can change radically as long as the tests pin its behavior, which is exactly the cover refactoring needs. Changes are often easier than expected, too, because you can change the tests and then the code, "moving the structure along in small safe increments."

The boundary condition matters as much as the tactic: higher-level tests "shouldn't be a substitute for unit tests. Instead, they should be a first step toward getting unit tests in place." The chapter's machinery — interception points and pinch points, both found with the effect sketches of Chapter 11 — tells you where such covering tests belong and when you've found a genuinely good spot rather than just a workable one.

## Section by section

### 12.1 Interception Points

An **interception point** is "a point in your program where you can detect the effects of a particular change." In an application whose pieces are glued together without natural **seams**, finding a decent one can be a big deal, often requiring effect reasoning and a lot of dependency breaking. The procedure: identify the change points, trace effects outward, and note every place an effect can be detected. Each such place is an interception point, "but it might not be the best interception point. You have to make judgment calls throughout the process."

#### 12.1.1 The Simple Case

`Invoice.getValue()` calculates all the costs; the change (a new New York shipping tax to pass on) extracts the shipping logic into a `ShippingPricer`, and the constructor changes too, since it must create a pricer that knows the invoice dates:

```java
public Money getValue() {
    Money total = itemsSum();
    total.add(shippingPricer.getPrice());
    total.add(getTax());
    return total;
}
```

Tracing effects: no method inside `Invoice` uses `getValue`, but `BillingStatement.makeStatement` does; the new `shippingPricer` affects only `getValue`. Every bubble in that sketch is a candidate interception point, subject to access. The `shippingPricer` variable is private and, worse, narrow — it senses the constructor and the pricer itself, but can't confirm `getValue` hasn't changed badly. `makeStatement` would work, but tests at `getValue` on `Invoice` are better and probably less work; `BillingStatement` can stay untested until it actually needs a change.

Prefer interception points close to the change points, for two reasons. Safety: "every step between a change point and an interception point is like a step in a logical argument" — the more steps, the harder to know the reasoning is right, and the fallback verification (perturb the change point, watch the test fail) is not something you should need all the time. Setup: distant points often require "playing computer" in your mind to convince yourself the test really covers the changed code.

#### 12.1.2 Higher-Level Interception Points

Usually the best interception point is a public method on the class being changed — easy to find and use — but not always. Expand the scenario: `Item` gains a `shippingCarrier` field and `BillingStatement` needs a per-shipper breakdown. Testing each class individually would work, but a higher-level interception point means less dependency breaking and a bigger chunk in the vise: the tests at `BillingStatement` become the invariant under which `Invoice` and `Item` structures may be rearranged. A starter characterization test:

```java
void testSimpleStatement() {
    Invoice invoice = new Invoice();
    invoice.addItem(new Item(0, new Money(10)));
    BillingStatement statement = new BillingStatement();
    statement.addInvoice(invoice);
    assertEquals("", statement.makeStatement());
}
```

Fill in whatever `BillingStatement` actually produces, then add cases across combinations of invoices and items — "especially careful to write cases that exercise areas of the code where we'll be introducing seams." What makes `BillingStatement` ideal is that it is a single point detecting effects from a cluster of classes. That property has a name: a **pinch point** is "a narrowing in an effect sketch, a place where tests against a couple of methods can detect changes in many methods."

Pinch points are determined by change points, not by class structure: `Item` also has `needsReorder`, called by `InventoryControl`, but adding a `shippingCarrier` field doesn't touch that method, so `BillingStatement` remains the pinch point despite `Item` having multiple clients. Change the scenario — supplier getters/setters used by both `InventoryControl` and `BillingStatement` — and no single interception point remains; but `run` and `makeStatement` together form the pinch point, two methods standing in for the eight methods and variables the changes must touch.

When no pinch point exists, two moves: revisit the change points — maybe too much is being attempted at once, so hunt pinch points for one or two changes at a time and, failing that, test each change as close as possible — or look for common usage across the sketch. A method with three users may not be used in three distinct ways; the test is "If I break this method, will I be able to sense it in this place?" If it is used the same way on objects with comparable values, testing one place can suffice. Work through the analysis with a coworker.

### 12.2 Judging Design with Pinch Points

A pinch point, really, is "a natural encapsulation boundary": a narrow funnel for all the effects of a large piece of code. If `makeStatement` is the pinch point for a cluster of invoices and items, then a wrong statement means the problem is in `BillingStatement`, the invoices, or the items — and conversely, `makeStatement` can be called without knowing anything about invoices and items. That bidirectional ignorance is "pretty much the definition of encapsulation." Hunting pinch points routinely reveals how responsibilities could be reallocated across classes for better encapsulation.

#### Using Effect Sketches to Find Hidden Classes

Effect sketches can expose how to split a large class. `Parser` holds `root`, `currentPosition`, and `stringToParse`, with `parseExpression` as the public method:

```java
public class Parser {
    private Node root;
    private int currentPosition;
    private String stringToParse;
    public void parseExpression(String expression) { .. }
    private Token getToken() { .. }
    private boolean hasMoreTokens() { .. }
}
```

The sketch shows `parseExpression` depends on `getToken` and `hasMoreTokens` but not directly on `currentPosition` or `stringToParse` — a natural encapsulation boundary (if not a narrow one: two methods hiding two fields). Extract both methods and their fields into a `Tokenizer` and `Parser` gets simpler. Names often hint at the same split — here, two methods with "Token" in them. The general exercise: sketch a large class, forget the bubble names, and look at grouping; name each cluster inside a boundary — that name is a candidate class name — and consider renames that would sharpen it. Do this with teammates: naming discussions build "a common view of what the system is and what it can become."

The payoff loop: carving out a set of classes so they can be instantiated together in a harness, then writing **characterization tests**, is an investment that makes changes possible "with impunity" — "you've made a little oasis in your application where the work has just gotten easier. But be careful — it could be a trap."

### 12.3 Pinch Point Traps

The first trap is too much verification in one place: unit tests that slowly grow into mini-integration tests. Needing to test a class, you instantiate several collaborators, pass them in, check some values, and feel confident about the whole cluster — do that habitually and you accumulate "big, bulky unit tests that take forever to run." For new code, test classes as independently as possible; when tests get too large, break down the class under test into smaller, independently testable pieces, and fake out collaborators where needed — "the job of a unit test isn't to see how a cluster of objects behaves together, but rather how a single object behaves."

For legacy code the tables turn: carving off a piece of the application and building it up with pinch point tests is the right first move, after which narrower unit tests get written for each class touched along the way. Pinch point tests are scaffolding, not a monument — "eventually, the tests at the pinch point can go away." Feathers' image: walking several steps into a forest and drawing a line, saying "I own all of this area" — then developing it by refactoring and adding tests until per-class tests support the work and the line can be erased.

The remaining trap is the blind spot: detectable-at-the-pinch-point does not mean easily detected there — effects "might not be easy to detect through makeStatement" even when the narrowing makes them detectable in principle. Pinch point tests are a first step toward unit tests, never a permanent substitute for them, which is why the cases written there should concentrate on the areas where seams will be introduced, and why the end state is always finer-grained tests closer to the code.

## Key terms

- **Interception point**: any point in a program where the effects of a particular change can be detected; the candidate locations for covering tests, chosen by judgment calls.
- **Pinch point**: a narrowing in an effect sketch — a place where tests against a couple of methods detect changes in many; the best interception points, and always relative to specific change points.
- **Natural encapsulation boundary**: what a pinch point really is — a narrow funnel for the effects of a large piece of code, where internals can be ignored until needed and internals can be understood without the externals.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
