---
title: "Sensing and Separation"
book: legacy-code
chapter: 3
date: 2026-10-04
summary: "Two reasons to break dependencies when getting tests in place: sensing, to observe values your code computes but you cannot access, and separation, to get the code into a harness at all — with faking collaborators as the dominant sensing technique."
tags: [legacy-code, testing, decoupling]
---

> Ideally you would instantiate any class in a test harness and start asking it questions. In legacy code, dependencies drag most of the system in with it instead. Feathers names the two reasons to break dependencies for tests: **sensing** — the code computes values you cannot observe through any available interface — and **separation** — you cannot get the code running in a harness at all. Separation has a whole catalog of techniques; sensing has one dominant one: put a fake in the collaborator's place and read what your code would have told it.

## The big idea

Two distinct problems hide behind "I can't test this." Sometimes the class runs but is a closed box: its effects land somewhere you cannot observe. Sometimes it will not even run outside the full application. The `NetworkBridge` example suffers both at once — it accepts an array of `EndPoint`s and routes traffic by changing settings on them, and each `EndPoint` opens a socket to a real device. You cannot sense what the bridge does to its endpoints, and you cannot create one without the hardware. You could sniff packets or wire up a hardware cluster, but that is enormous work for logic that usually needs none of it.

Both problems are solved by breaking dependencies, but the two words keep the reasons distinct, because the remedies differ. Separation is a broad problem — an entire catalog of dependency-breaking techniques sits at the back of the book. Sensing is narrow, and it has one dominant technique: faking collaborators.

## Section by section

### 3.1 Faking Collaborators

The dependency problem is rarely just "run this code by itself." The code you had to break away from is often the only place where the effects of your actions are visible. If you can put other code in its place and test through it, you can write your tests. In object orientation, those stand-ins are **fake objects**.

#### 3.1.1 Fake Objects

A fake object impersonates a collaborator of the class under test. The running example is a point-of-sale `Sale` class whose `scan()` must show an item's name and price on a cash register display. With the display calls buried deep in `Sale`, the effect is unobservable. Three design moves fix that: extract all device-specific code into an `ArtR56Display` class, introduce a `Display` interface, and have `Sale` hold whatever `Display` it was given at construction. A `FakeDisplay` then implements the same interface and just records:

```java
public interface Display {
    void showLine(String line);
}

public class FakeDisplay implements Display {
    private String lastLine = "";
    public void showLine(String line) { lastLine = line; }
    public String getLastLine() { return lastLine; }
}
```

The test declares a `FakeDisplay`, hands it to `Sale`, scans, and asks the fake what happened:

```java
public void testDisplayAnItem() {
    FakeDisplay display = new FakeDisplay();
    Sale sale = new Sale(display);
    sale.scan("1");
    assertEquals("Milk $3.99", display.getLastLine());
}
```

Is that "really testing"? It never checks actual pixels on real hardware — but no test could check every display either. When we write tests we divide and conquer: this test tells us how `Sale` objects affect displays, and that is not trivial. A failure here helps localize the bug — the problem may not be in `Sale` at all. Testing individual units leaves small, well-understood pieces that are easier to reason about.

#### 3.1.2 The Two Sides of a Fake Object

Fakes look odd at first because they have two sides. `showLine` exists because `FakeDisplay` implements `Display` — it is the only method `Sale` sees. `getLastLine` exists for the test alone. That is why the test declares the variable as `FakeDisplay`, not `Display`: the class under test must see only the interface, while the test needs the concrete type to call the test-facing side.

#### 3.1.3 Fakes Distilled

The example is minimal, but it is the central idea; implementation varies by language. In OO languages, fakes are usually simple classes like `FakeDisplay`. In non-OO languages, define an alternative function that records values into some global data structure the tests can read (Chapter 19 covers the details).

#### 3.1.4 Mock Objects

If you write many fakes by hand, consider the more advanced form: **mock objects** are fakes that perform assertions internally. Set expectations before use, then verify afterward:

```java
MockDisplay display = new MockDisplay();
display.setExpectation("showLine", "Milk $3.99");
Sale sale = new Sale(display);
sale.scan("1");
display.verify();
```

`verify()` fails the test if the expected calls never arrived. Mock frameworks are a powerful tool, but they are not available in every language — and simple fake objects suffice in most situations.

## Key terms

- **Sensing**: breaking a dependency because you cannot access values your code computes — the effects are invisible through every available interface.
- **Separation**: breaking a dependency because you cannot get a piece of code into a test harness to run at all.
- **Fake object**: an object that impersonates a collaborator of the class under test; it implements the collaborator's interface and records or supplies values the test can inspect.
- **Two sides of a fake**: the production side (the interface methods the class under test calls) and the test side (the accessors the test uses to find out what happened).
- **Mock object**: a fake that performs assertions internally — expectations are set in advance and checked by a `verify()` call that fails the test when they go unmet.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
