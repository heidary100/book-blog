---
title: "Better Together Or Better Apart?"
book: aposd
chapter: 9
date: 2026-09-30
summary: "Bring code together when it is closely related; separate general-purpose from special-purpose code. Judge every split by whether it reduces overall complexity."
tags: [design-process, abstractions]
---

> Given two pieces of functionality, should they live together or apart? Subdivision is never free: every split adds components, interfaces, and physical separation. Decide on complexity grounds — combine what is closely related, separate what is truly independent, and never split code merely because it is long.

## The big idea

The instinct that smaller components are automatically simpler is only half right. Subdividing creates new complexity: more components to keep track of, more interfaces (every interface adds complexity), more management code to juggle the pieces, duplication that may now exist in each fragment, and — most subtly — *separation*. If the pieces are independent, separation is good: you can focus on one at a time. If they have dependencies, it is bad: developers flip back and forth between files, or worse, never notice the dependency and introduce bugs.

So the real question is whether the pieces are related. Four indicators: they **share information** (both depend on a document's syntax); they are **used together** — but only if the relationship is bidirectional (a disk block cache always uses a hash table, but hash tables serve everywhere else too, so those stay separate); they **overlap conceptually** under a simple higher-level category (substring search and case conversion are both string manipulation); or it is **hard to understand one without the other**. The same reasoning applies at every level — functions, methods, classes, services.

## Section by section

### 9.1 Bring together if information is shared

An HTTP server project split request handling into two methods in different classes: one read the raw request from the socket into a string, the other parsed the string. The split leaked HTTP-format knowledge into both: the reader had to do most of the parsing work anyway (parse header lines to find the length header) just to locate the end of the request. Because the information was shared, reading and parsing belonged in one place; combining them made the code shorter and simpler.

### 9.2 Bring together if it will simplify the interface

Merging modules can eliminate pass-through interfaces — in the HTTP example, the handoff of the request string from reader to parser disappeared. Merging can also make functionality automatic: if Java's `FileInputStream` and `BufferedInputStream` were combined with buffering on by default, the vast majority of users would never need to know buffering exists; methods to disable or replace the default buffering could exist, but most users would never learn about them.

### 9.3 Bring together to eliminate duplication

Two tactics for repeated code. First, factor it into a method — most effective when the snippet is long and the replacement method's signature is simple; a one- or two-line snippet, or one entangled with many local variables (forcing a complex signature full of pass-by-reference arguments), is not worth extracting. Second, restructure so the snippet executes in one place: a method that returns errors from several points, each requiring the same cleanup, can move the cleanup to the end and `goto` it. Goto is usually a bad idea, but reasonable for escaping from nested code.

### 9.4 Separate general-purpose and special-purpose code

If a module contains a general-purpose mechanism, it should provide *just* that mechanism — no code specializing it for one use, and no other mechanisms bundled in. Special-purpose code belongs in the module associated with that purpose. The Chapter 6 GUI editor showed this: the text class offers general text operations, while UI-specific operations (like deleting the selection) live in the user interface module — removing the information leakage and extra interfaces of an earlier design.

### 9.5 Example: insertion cursor and selection

The editor's insertion cursor and selection seem related: the cursor always sits at one end of the selection, and both are set by a click-drag and manipulated together during text insertion. One team merged them into a single object holding two positions plus booleans (which end is the cursor, whether a selection exists). It was awkward: higher-level code still treated them as separate entities (delete the selection, then fetch the cursor position), and the implementation was *more* complex — reporting the cursor meant testing a boolean and picking the right end of the selection. After splitting them, both usage and implementation got simpler. No special classes were needed: a general `Position` class (line number, character within line) represented a location; the selection was two `Position`s, the cursor one — and `Position` found other uses in the project. A case study in lower-level, general-purpose interfaces.

### 9.6 Example: separate class for logging

A student project logged errors by calling into a dedicated logger class defined at the bottom of the same file:

```java
try {
    rpcConn = connectionPool.getConnection(dest);
} catch (IOException e) {
    NetworkErrorLogger.logRpcOpenError(req, dest, e);
    return null;
}
```

The separation added complexity with no benefit. The logging methods were shallow — one line of code each but requiring considerable documentation — and each was invoked from exactly one place. Readers flip between call site and method in both directions. Logging inline where the error is detected reads better and eliminates the whole interface.

### 9.7 Splitting and joining methods

Length alone is rarely a good reason to split a method, despite rigid rules like "split any method longer than 20 lines." Developers tend to over-split: every extra method is another interface, and related code gets scattered. A method of five independent 20-line blocks reads fine one block at a time; if the blocks interact complexly, keeping them together matters even more. A method hundreds of lines long is fine if its signature is simple — that is depth. What matters is that each method does one thing completely, has a simple interface, and is deep.

Two legitimate splits exist (Figure 9.3). (b) Extract a subtask into a child method that the parent calls: sensible only if the child is cleanly separable — readers of either method need not understand the other — which usually means the child is fairly general-purpose. If you keep flipping between parent and child, the split was a mistake. (c) Divide the functionality into two methods both visible to callers: sensible only when the original interface bundled unrelated concerns; each new interface must be simpler, and ideally most callers invoke just one of the two. This split rarely makes sense — callers end up passing state between several shallow methods.

Joining methods can also simplify a system: two shallow methods become one deeper one, duplication disappears, dependencies and intermediate data structures vanish, encapsulation improves, and interfaces get simpler.

### 9.8 A different opinion: Clean Code

In *Clean Code*, Robert Martin argues functions should be broken up by length alone — extremely small, "the second rule of functions is that they should be smaller than that", one-line blocks, indent levels of at most one or two. Ousterhout grants that shorter functions are generally easier to understand, but disagrees that size is the right metric: past a few dozen lines, further shrinking has little effect on readability. The real question is whether splitting reduces *overall* complexity: more functions mean more interfaces to document and learn, and functions made too small become conjoined — at which point the larger function is better, because all related code sits in one place. His summary: "Depth is more important than length" — first make functions deep, then short enough to read easily; never sacrifice depth for length.

### 9.9 Conclusion

Base every split-or-join decision on complexity: choose the structure that gives the best information hiding, the fewest dependencies, and the deepest interfaces.

## Red flags to watch for

- **Repetition**: the same (or nearly the same) code appears over and over — a sign you haven't found the right abstractions.
- **Special-General Mixture**: a general-purpose mechanism contains code specialized for one use of it. The mechanism gets more complicated and information leaks between mechanism and use case, so changes to the use case force changes to the mechanism.
- **Conjoined Methods**: you cannot understand one method's implementation without reading another's. Applies beyond methods: any two physically separated pieces of code that can only be understood together.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
