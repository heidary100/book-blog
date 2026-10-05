---
title: "I Need to Make a Change. What Methods Should I Test?"
book: legacy-code
chapter: 11
date: 2026-10-04
summary: "Finding test points in legacy code is impact analysis: trace a change's chain of effects forward from the change points to the few places where every effect can be detected, using effect sketches — then let what the sketches reveal feed back into the design."
tags: [legacy-code, testing, complexity, design-process]
---

> Every functional change sets off a chain of effects, from the line you edit back to some system boundary — and most of the code stays untouched because it doesn't call the changed code directly or indirectly. Where should **characterization tests** go? Wherever the effects can be detected. **Effect sketches** turn the questioning habit — "what could this change affect?" — into a compact diagram: a bubble per changeable variable, a bubble per method whose return value can change, arrows from causes to effects. Reading the sketches back pays twice: once to pick test points, and again as design feedback, because nearly anything that simplifies a sketch makes the code more understandable and maintainable.

## The big idea

Programmers reason about effects constantly — it is "just part of being a programmer" — but nobody talks about how, and the skill silently collapses in front of tangled legacy code that exceeds what the mind can trace. The bind is sharp: you know the code should be refactored, but without tests, how do you know you are refactoring correctly? Feathers' answer is to make the implicit reasoning explicit. Reasoning about effects "is nothing new; people have been doing it since the dawn of the computer age" — the contribution here is doing it deliberately, with sketches, to find the best places to write tests before changing anything.

Two directions of reasoning exist, and legacy work demands the one people practice less. Debugging reasons *backward*: from an unexpected result, back to its source. Legacy change reasons *forward*: "If we make a particular change, how could it possibly affect the rest of the results of the program?" Get a handle on forward reasoning and you have "the beginnings of a technique for finding good places to write tests" — and in particularly tangled code, it is one of the only skills you can depend on while getting tests in place.

## Section by section

### 11.1 Reasoning About Effects

For every functional change there is some associated chain of effects. The running fragment: change `3` to `4` in `SCALE_FACTOR` and `getBalancePoint()` returns something different; methods that call it may return something different, "and so on, all the way back to some system boundary." Crucially, many parts of the code will *not* behave differently — they don't call `getBalancePoint()` directly or indirectly. The skill is drawing that line precisely. (Sidebar: Feathers wishes for an IDE that lists everything impacted by changing a selection; since none exists, we reason manually — learnable, but hard to know when you've gotten it right.)

The exercise: a `CppClass` from a C++-manipulating Java application — domain knowledge is irrelevant to effect reasoning. List everything that can change after a `CppClass` object is created that would affect any method's results. The answer has exactly two entries: someone can add elements to the `declarations` list after passing it to the constructor (the list is held by reference, so external changes alter `getInterface`, `getDeclaration`, and `getDeclarationCount`), and someone can alter or replace an object held in that list. `getName()` is immune: Java `String`s are immutable, so after construction it always returns the same value.

The record of this reasoning is an **effect sketch**: "a separate bubble for each variable that can be affected and each method whose return value can change," with an arrow from each changeable thing to everything whose runtime value can change because of it:

```text
declarations --------------------> getDeclarationCount()
   |----------------------------> getDeclaration(int)
   |----------------------------> getInterface(...)
(Declaration objects in the list) --> (the same three methods)
```

Widen the picture: `CppClass` objects are created only in `ClassReader`, and its `declarations` list is populated in exactly one place, `matchVirtualDeclaration` (called from `matchBody` during `parse()`), before the `CppClass` is constructed. The `Token` objects and `Declaration` objects held in the list never change state after creation. Conclusion: once a `CppClass` exists, its list and contents won't change. That knowledge pays two ways — if `CppClass` ever returns unexpected values, only a couple of creation sites need checking — and suggests making the references `final` so the immutability becomes compiler-enforced.

### 11.2 Reasoning Forward

Characterization testing inverts the deduction: instead of asking what affects a point, take a set of objects and figure out what changes downstream if they stop working. The example is `InMemoryDirectory`, an in-memory file system with `addElement`, `generateIndex`, `getElementCount`, and `getElement`. One quirk: calling `generateIndex` twice "gums things up" — you get two index elements, the second listing the first. The application uses it in a constrained way (create, fill, index once, pass around), but the needed change allows adding elements at any time, with index creation and maintenance as a side effect of `addElement`.

The change points are `generateIndex` (functionality removed) and `addElement` (functionality added). Sketch effects from each: `generateIndex` creates an element and adds it to the collection, so it affects `elements`; `elements` is read by `getElementCount` and `getElement`. `addElement` also touches `elements`, but nothing counts there — `addElement` behaves identically no matter what is done to the collection, so no user of it can be impacted. The full sketch:

```text
generateIndex() ---> elements ---> getElementCount()
addElement()    ---> elements ---> getElement(String) ---> getText()
```

The only ways users can sense effects are `getElementCount` and `getElement` — tests at those two methods can cover all the effects of the change (plus `getText` on an element returned by `getElement`, to see the index text). Two completeness checks before declaring victory: superclasses and subclasses can be hidden clients of instance data (here the fields are private, so no); and the `Element` class the directory uses needs its own bubble — it turns out to be trivially simple, with effects fully sensed through `getElement`. The example is deliberately small but "very representative": find where change can be detected first, then pick among the detection points when writing tests.

### 11.3 Effect Propagation

Some propagation is loud; return values are usually noticed first, since they flow straight to callers. The quiet channels matter more in legacy code. An object passed as a parameter can have its state modified, and the change reflects back into the application — Java and C# pass object handles by value, so any method can mutate what it receives (C++ `const` on parameters is the firewall there). The sneakiest channel is static or global data: one added line in `Element.addText` —

```java
public void addText(String newText) {
    text += newText;
    View.getCurrentDisplay().addText(newText);
}
```

— and nothing in `Element`'s method signatures hints that elements affect views. "Information hiding is great, unless it is information that we need to know." Effects propagate in three basic ways:

1. Return values that are used by a caller.
2. Modification of objects passed as parameters that are used later.
3. Modification of static or global data that is used later.

(Aspect-oriented languages add a fourth: aspects that alter behavior elsewhere in the system.) The working heuristic, from a method that will change: check its return value's callers; check values it modifies and, transitively, the methods that use them; check superclasses and subclasses for hidden users of that state; check parameters and what their methods return; and look for global or static data modified anywhere in the identified set.

### 11.4 Tools for Effect Reasoning

The most important tool is knowledge of the programming language. Every language has little "firewalls" — rules that prevent effect propagation — and knowing them tells you where to stop looking. Changing `Coordinate`'s representation from two doubles to a vector is contained if the fields are `private`: clients are affected only through `distance`, regardless of subclassing. Make the fields package-scoped and the analysis explodes: any client in the package might read or write `x` and `y` directly, and subclasses can use the instance variables too, so both must be examined (or make the fields private and let the compiler prove nobody does).

The subtleties bite hardest in C++. `double getRho() const;` declares a method that can't modify the object's instance variables — unless the superclass declares them `mutable`, which permits modification inside `const` methods:

```cpp
class Coordinate {
protected:
    mutable double first, second;
};
```

"Taking const to mean const in C++ without really checking can be dangerous" — and the same holds for any language construct that can be circumvented. When reasoning about code you don't know well, look for effects regardless of how odd they might be. Know your language.

### 11.5 Learning from Effect Analysis

Analyze effects whenever you get the chance. As a code base becomes familiar, you stop checking certain things — and that feeling is the discovery of "basic goodness": the best code has few "gotchas," implicit "rules" (stated or not) that spare you paranoia while tracing effects. The way to find them is to imagine a pathway you've never seen in the code base and say, "But, no, that would be stupid." A code base full of such rules is far easier to work in; a bad one has rules nobody knows, or rules "littered with exceptions." The rules are usually contextual, not grand style pronouncements — "the `declarations` list handed to `CppClass` won't change" is exactly such a rule, and stating it makes all downstream reasoning cheaper.

The general principle: programming gets easier as effects in a program are narrowed, because there is less to know to understand a piece of code. The extreme is functional programming in languages like Scheme and Haskell; regardless of language, restricting effects in OO code makes testing dramatically easier, and there are no hurdles to doing it.

### 11.6 Simplifying Effect Sketches

The `CppClass` sketch has a fan-out: `declarations` and the objects inside it affect three methods, and the best characterization point is `getInterface`, which exercises `declarations` most thoroughly — some things are sensible there that aren't easily sensed through `getDeclaration` or `getDeclarationCount`. But `getDeclaration` and `getDeclarationCount` would go uncovered. Now a one-line design change: have `getInterface` call `getDeclaration` internally instead of reaching into the list itself —

```java
for (int n = 0; n < indices.length; n++) {
    Declaration virtualFunction = getDeclaration(indices[n]);
    result += "\t" + virtualFunction.asAbstract() + "\n";
}
```

— and the sketch shrinks: testing `getInterface` now exercises `getDeclaration` automatically. "When we remove tiny pieces of duplication, we often end up getting effect sketches with a smaller set of endpoints. This often translates into easier testing decisions." Effect sketches are retrospective too — a tool for writing better code going forward, not just for rescuing old code.

#### Effects and Encapsulation

Many dependency-breaking techniques break encapsulation, and that is fine — because the *reason* encapsulation matters is more important than encapsulation itself: it helps us reason about code. Well-encapsulated code has fewer paths to follow while being understood; each dependency broken for testability (say, adding a constructor parameter via **Parameterize Constructor**) adds one more path. Breaking encapsulation can still net out positive if it buys good explanatory tests, because tests then let you reason about behavior directly and answer new questions with new tests. "Encapsulation isn't an end in itself; it is a tool for understanding." When encapsulation and test coverage genuinely conflict, "I bias toward test coverage. Often it can help me get more encapsulation later."

## Key terms

- **Effect sketch**: a diagram with a bubble for each variable that can be affected and each method whose return value can change, arrows drawn from causes to everything they can change at runtime; the unit of record for effect reasoning.
- **Reasoning forward**: tracing from points of change outward — "how could this change possibly affect the rest of the program?" — as opposed to debugging's backward reasoning from a result to its source.
- **Effect propagation**: the three channels by which a change becomes visible elsewhere — used return values, modification of passed-in objects used later, and modification of static or global data used later.
- **Firewall**: a language rule that prevents effect propagation (private fields, immutability, `const` parameters), marking a point where effect tracing can stop.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
