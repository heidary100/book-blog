---
title: "Modules Should Be Deep"
book: aposd
chapter: 4
date: 2026-09-30
summary: "Design modules to be deep: powerful functionality behind a simple interface. The interface is the cost a module imposes; minimize it."
tags: [deep-modules, abstractions, complexity]
---

> Modular design lets developers face a small fraction of a system's complexity at any given time. Every module splits into an interface (what users must know) and an implementation (how it works). The best modules are deep — lots of functionality hidden behind a simple interface — while shallow modules add interfaces without hiding anything.

## The big idea

Modular design decomposes a system into relatively independent modules — classes, subsystems, or services — so developers only need to face a small fraction of the overall complexity at a time. Every module has two parts: the **interface**, everything a developer in another module must know to use it (what it does, not how), and the **implementation**, the code that carries out the interface's promises. The best modules have interfaces much simpler than their implementations: a simple interface minimizes the complexity imposed on the rest of the system, and any modification that doesn't change the interface affects no other module.

The cost/benefit framing: a module's benefit is its functionality; its cost (in system complexity) is its interface. "Interfaces are good, but more, or larger, interfaces are not necessarily better!" Depth — powerful functionality behind a small interface — is the standard against which everything else in the chapter is judged.

## Section by section

### 4.1 Modular design

In an ideal world each module would be completely independent and the complexity of the system would be the complexity of its worst module. That ideal is unachievable: modules must call each other, so they must know something about each other. Method arguments create dependencies (change the signature, change every invocation), and dependencies can be subtle — a method may not work correctly unless some other method is invoked first. The goal of modular design is to minimize dependencies between modules. A balanced-tree module shows what good hiding looks like: sophisticated rebalancing code inside, a simple insert/remove/fetch interface outside — callers provide only a key and value. "Module" is defined broadly: any unit of code with an interface and an implementation — classes, methods, functions in non-OO languages, subsystems (kernel calls), services (HTTP requests).

### 4.2 What's in an interface?

Interfaces contain two kinds of information. **Formal** elements are specified in code and checkable by the language: a method's signature (parameter names and types, return type, thrown exceptions); for a class, the signatures of its public methods plus public variables. **Informal** elements cannot be enforced: high-level behavior (this function deletes the file named by the argument), usage constraints (one method must be called before another), and generally anything a developer must know to use the module. Informal aspects live only in comments, with no guarantee of completeness or accuracy (a footnote: formal specification languages exist, but English descriptions are likely more intuitive). For most interfaces the informal aspects are larger and more complex than the formal ones. A clearly specified interface states exactly what users need to know, eliminating the "unknown unknowns" problem of Section 2.2.

### 4.3 Abstractions

An abstraction is a simplified view of an entity that omits unimportant details; a module's interface is its abstraction. The word "unimportant" carries all the weight: the more unimportant details omitted the better — but a detail can only be omitted if it truly is unimportant. Abstractions fail two ways: including details that aren't important (needless cognitive load), or omitting details that are (obscurity — a **false abstraction** that looks simple but isn't). The file system does both sides: block-allocation details are properly hidden, but flushing rules are not — databases must know exactly when data is written through to storage so it survives crashes, so those rules must be visible in the interface. Abstractions manage complexity everywhere: a microwave's few buttons over its complex electronics; driving a car without understanding anti-lock brakes or battery management. The design key: minimize the amount of information that is important.

### 4.4 Deep modules

Picture each module as a rectangle (Figure 4.1): area proportional to functionality, top edge representing the interface — deep means large area, short edge. Depth is cost versus benefit: benefit is functionality, cost is interface. The canonical deep interface is Unix file I/O — five basic system calls:

```c
int open(const char* path, int flags, mode_t permissions);
ssize_t read(int fd, void* buffer, size_t count);
ssize_t write(int fd, const void* buffer, size_t count);
off_t lseek(int fd, off_t offset, int referencePosition);
int close(int fd);
```

`open` takes a hierarchical path like `/a/b/c` and returns a file descriptor; `read`/`write` move data between application buffers and the file; sequential access is the default, with `lseek` for random access. Behind those five calls sit hundreds of thousands of lines handling disk representation for efficient access, directories and path-name resolution, permission enforcement, division of work between interrupt handlers and background code, scheduling of concurrent accesses, caching of recently used data, and unifying different storage devices such as disks and flash drives — all invisible to callers. Implementations have evolved radically over the years; the five calls have not changed. A second deep module is a garbage collector (Go, Java): no interface at all — adding one actually *shrinks* the system's overall interface by eliminating the freeing API, while hiding substantial complexity.

### 4.5 Shallow modules

A shallow module's interface is relatively complex compared to the functionality it provides. A linked-list class is the mild case: manipulating a list takes only a few lines, so the abstraction hides little — sometimes unavoidable and still useful, but little leverage against complexity. The extreme case, from a design-class project:

```java
private void addNullValueForAttribute(String attribute) {
    data.put(attribute, null);
}
```

From a complexity standpoint this makes things worse: no abstraction (all functionality is visible through the interface — callers must know it stores into `data`), proper documentation would be longer than the code, and invoking it takes more keystrokes than manipulating the variable directly. It adds an interface developers must learn and provides no compensating benefit.

### 4.6 Classitis

The conventional wisdom is that classes should be small, not deep: break up larger classes, and split any method longer than N lines (N as low as 10). The extreme is **classitis**, from the mistaken view that "classes are good, so more classes are better" — minimize functionality per class and add more classes for more functionality. The result is classes that are individually simple but numerous, each with its own interface; the interfaces accumulate into tremendous complexity at the system level, plus the verbosity of all the boilerplate. The right metric is not size but the ratio of functionality to interface.

### 4.7 Examples: Java and Unix I/O

Java's class library is the most visible case of classitis — a cultural habit, not a language requirement. For many years, opening a file and reading serialized objects took three objects:

```java
FileInputStream fileStream = new FileInputStream(fileName);
BufferedInputStream bufferedStream = new BufferedInputStream(fileStream);
ObjectInputStream objectStream = new ObjectInputStream(bufferedStream);
```

`fileStream` and `bufferedStream` are never used once the file is open. Worse, buffering must be requested explicitly — forget it and I/O is silently slow. The library-designer defense (not everyone wants buffering; choice is good) misses the principle: interfaces should make the common case as simple as possible. Almost everyone wants buffering, so it should be the default, with a cleanly separated opt-out (a different constructor, or a method most developers never learn about). Unix got this right: sequential access is the default; `lseek` exists for the rare random-access case without burdening anyone else. Generalizing: if an interface has many features but most developers need to be aware of only a few, its effective complexity is just the complexity of the commonly used features.

### 4.8 Conclusion

Separating interface from implementation hides implementation complexity; users need only understand the abstraction. The most important issue in designing modules is to make them deep — simple interfaces for the common use cases with significant functionality behind them — maximizing the amount of complexity concealed.

## Red flags to watch for

- **Shallow module**: the interface is complicated relative to the functionality it provides; the benefit of not having to learn the internals is negated by the cost of learning and using the interface. Small modules tend to be shallow.

## Key terms

- **Interface**: everything a developer in another module must know to use the module — what it does, not how; formal (signature, language-checked) plus informal (behavior, constraints, comments only).
- **Implementation**: the code that carries out the promises made by the interface.
- **Abstraction**: a simplified view of an entity that omits unimportant details.
- **False abstraction**: one that omits details that are actually important; appears simple but isn't, creating obscurity.
- **Deep module**: a lot of functionality hidden behind a simple interface; the best kind of module.
- **Shallow module**: an interface complicated relative to its functionality; hides little.
- **Classitis**: the "more classes are better" syndrome — minimizing functionality per class, multiplying interfaces and boilerplate.

## My takeaways

<!-- Fill in as you re-read and apply the chapter. -->
-
