---
title: "Different Layer, Different Abstraction"
book: aposd
chapter: 7
date: 2026-09-30
summary: "Adjacent layers should offer different abstractions; pass-through methods, decorators, and pass-through variables signal duplicated abstractions that add complexity for nothing."
tags: [layering, abstractions]
---

> Software is layered, and each layer should provide a *different* abstraction from the layers above and below it — following a call up and down the stack, the abstraction should change with every method call. When adjacent layers share an abstraction, the result is pass-through methods, shallow decorators, and pass-through variables: infrastructure that every developer must learn but that adds no functionality.

## The big idea

Well-designed systems change abstraction as you descend: a file system goes from "variable-length array of bytes" at the top, to an in-memory cache of fixed-size disk blocks, to device drivers moving blocks between storage and memory. TCP goes from a reliable byte stream on top to best-effort delivery of bounded-size packets (some lost or reordered) underneath. Adjacent layers with *similar* abstractions are a red flag for the class decomposition — the layer boundary exists, with all its learning cost, but the layers do not add distinct value. The chapter catalogues the three common shapes this duplication takes and how to refactor each away.

## Section by section

### 7.1 Pass-through methods

A pass-through method does little except invoke another method with a similar or identical signature. In one student GUI editor, a `TextDocument` class wrapped a `TextArea`, and 13 of its 15 public methods were pass-throughs, e.g.:

```java
public void insertString(String textToInsert, int offset) {
    textArea.insertString(textToInsert, offset);
}
```

Of the four extracted methods shown, only `willInsertString` did anything — a trivial null check on the listener. Pass-through methods are harmful twice over: they make the class shallower (interface complexity grows without any new functionality), and they create dependencies (a signature change in `TextArea` forces matching changes in `TextDocument`). They indicate confusion over the division of responsibility — the interface to a piece of functionality should live in the class that implements it. Ask of the two classes: "Exactly which features and abstractions is each of these classes responsible for?" — you will usually find overlap. Refactor so each class has a distinct, coherent set of responsibilities (Figure 7.1): expose the lower-level class directly to callers, redistributing responsibility away from the higher level; redistribute functionality between the classes; or, if they cannot be disentangled, merge them. The student moved methods between classes and collapsed three intertwined classes (`TextDocument`, `TextArea`, `TextDocumentListener`) into two with clearly differentiated responsibilities.

### 7.2 When is interface duplication OK?

Identical signatures are fine when each method contributes significant new functionality; pass-throughs are bad precisely because they contribute none. Two legitimate cases. A **dispatcher** selects among several methods using its arguments, then passes most or all of them through — a Web server examines an incoming request's URL and routes it to a file-serving handler or a PHP/JavaScript procedure, per a set of matching rules; the choice *is* the functionality. And **multiple implementations of one interface** — OS disk drivers all share an interface but implement different hardware — which reduces cognitive load: learn one, and the others feel familiar. These methods are usually in the same layer and do not invoke each other.

### 7.3 Decorators

The decorator pattern (a "wrapper") takes an existing object, mimics its API, and extends its behavior: Java's `BufferedInputStream` wraps an `InputStream` with buffering (a single-character `read` is served from a much larger underlying block), and a `ScrollableWindow` adds scrollbars to a plain `Window`. Decorators aim to separate special-purpose extensions from a generic core, but decorator classes tend to be shallow — lots of boilerplate and pass-through methods for a small amount of new functionality — and it is easy to overuse them, creating a class per feature and an explosion of shallow classes (the Java I/O design, per Chapter 4). Before writing a decorator, consider: add the functionality to the underlying class if it is fairly general-purpose, logically related, or wanted by most users (almost everyone who creates an `InputStream` wants buffering — the classes should have been combined); merge it into the specific use case it serves, if it is use-case-specific; merge it into an existing decorator to get one deeper decorator instead of two shallow ones; or implement it as a stand-alone class that doesn't wrap anything (scrollbars probably don't need to wrap the window's entire API). Wrappers do make sense occasionally — translating between an unmodifiable external class's interface and the one the application needs — but such situations are rare.

### 7.4 Interface versus implementation

The same rule applies *within* a class: the interface should normally present a different abstraction from the internal representation — if they are similar, the class is probably shallow. In the Chapter 6 editor, most teams stored text as separate lines; some also exposed a line-oriented API (`getLine`, `putLine`). That made the class shallow and awkward: UI code constantly inserts mid-line (typing) or deletes across lines, so callers had to split and join lines themselves — nontrivial code duplicated all over the user interface. A character-oriented interface (`insert` an arbitrary string, possibly with newlines, at an arbitrary position; `delete` between two positions) hides all line splitting and joining inside the text class while the internal representation stays line-based. The gap between the character-oriented API and the line-oriented storage *is* the valuable functionality the class provides.

### 7.5 Pass-through variables

A pass-through variable is one threaded down a long chain of methods that don't use it: in Figure 7.2, a certificates argument for secure communication is needed only by low-level `m3` (which opens a socket via a library call), yet appears in the signatures of every method between `main` and `m3`. Every intermediate method must be aware of it, and adding a new such variable later (say, certificates were an afterthought) forces edits across many interfaces.

Options for eliminating them: (b) find an object already shared between top and bottom and stash the value there — but that shared object may itself be a pass-through variable; (c) a global variable — avoids the threading but blocks creating two independent instances of the system in one process, which is useful in testing even if not in production; (d) the approach Ousterhout uses most, a **context object**: one per system instance, storing all the global state that would otherwise be passed through or made global — configuration options, shared subsystems, performance counters. To keep the context from becoming a pass-through variable itself, references are saved as instance variables in the system's major objects at construction time, so the context appears as an explicit argument only in constructors. Benefits: adding a global variable touches only the context's constructor and destructor; global state is identified and managed in one place; and tests can reconfigure the application by editing context fields. But contexts are "far from an ideal solution": the variables carry most disadvantages of globals (unclear why a variable exists or where it is used), a context can degenerate into an undisciplined grab-bag creating nonobvious dependencies, and thread safety is a concern (best mitigated by keeping context variables immutable). He hasn't found anything better.

### 7.6 Conclusion

Every piece of design infrastructure — interface, argument, function, class, definition — adds complexity because developers must learn it, so each element must eliminate more complexity than it adds to be worth having. The "different layer, different abstraction" rule is this cost-benefit test applied to layers: duplicated abstractions (pass-through methods, decorators) and pass-through arguments impose learning and coupling without contributing functionality, so the design is better off without them.

## Red flags to watch for

- **Pass-Through Method**: a method that does nothing but forward its arguments to another method with the same API. It signals unclear division of responsibility between classes, adds interface complexity with no functionality, and couples the classes' signatures.
- **Pass-Through Variables**: a variable (like `cert`) passed down through a long chain of methods that never use it, forcing every intermediate method to know about it and making new variables expensive to introduce.

## Key terms

- **Pass-through method**: a method that mainly invokes another method with a similar or identical signature, contributing no new functionality.
- **Dispatcher**: a method that uses its arguments to choose among several other methods and forwards to the chosen one — legitimate despite signature duplication, because the selection is real functionality.
- **Decorator (wrapper)**: a class that wraps an existing object with a similar API to extend its behavior; tends to produce shallow classes and boilerplate.
- **Pass-through variable**: a variable threaded through many intermediate methods that have no use for it.
- **Context object**: a per-instance object holding all of an application's global state, referenced via instance variables so it appears as an argument only in constructors.

## My takeaways

<!-- Fill in as you re-read and apply the chapter. -->
-
