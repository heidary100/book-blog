---
title: "The Seam Model"
book: legacy-code
chapter: 4
date: 2026-10-04
summary: "Think of code not as a sheet of text but as a set of seams — places where behavior can change without editing that place, each activated by an enabling point — and note that object seams, whose enabling points live in the language itself, are the best seams in OO code."
tags: [seams, legacy-code, decoupling, testing]
---

> Existing code is poorly suited to testing — not particular programs, programming languages in general. Part of the problem is how we see code: as one huge sheet of text, where the only way to change behavior at a spot is to edit that spot, which makes test behavior inseparable from production behavior. The **seam** view replaces it: a program is a set of places where behavior can vary without editing in that place, each seam activated by an **enabling point** elsewhere. The preprocessor, the linker, and virtual dispatch each expose different seams — and in OO languages object seams win because the enabling points are built into the language.

## The big idea

The usual routes to testable code are writing tests as you develop or "designing for testability," and the field offers little evidence the second works. Feathers' escape is not another technique but a change of perception. Once you start pulling classes out for unit testing — which forces breaking many dependencies, whatever the nominal quality of the design — you stop seeing a program as a listing and start seeing where its behavior can be varied. Because this view abstracts away from any one language's features, it transfers when you work in unfamiliar languages.

The practical payoff is about dependencies. In lucky code bases they are small and localized; in pathological ones they are numerous and spread everywhere. The seam view reveals opportunities already present in the code: replace behavior at seams and you can selectively exclude dependencies in tests, or run sensing code where those dependencies were. Often that is enough to get just enough tests in place to support more aggressive work.

## Section by section

### 4.1 A Huge Sheet of Text

Feathers' school programming was terminals, pay-per-compile on a DEC VAX, and printouts scrutinized every couple of hours; a program was a listing — a long set of functions to understand one by one. Modularity was academic: he was never going to swap one class for another mid-assignment. The listing view seems accurate even watching professionals — a room of programmers looks like scholars inspecting and editing large important documents, changing a little text carefully because it can change the meaning of the whole. But the view has a hole where modularity should be. Small pieces are rarely reused independently; even pieces that look independent depend on each other in subtle ways. Reuse is tough.

### 4.2 Seams

The example that breaks the sheet-of-text view: `CAsyncSslRec::Init()` in C++, where one call — `PostReceiveError(SOCKETCALLBACK, SSL_FAILURE)` — talks to another subsystem that is a pain under test. The goal: run everything else in the method without that call, while keeping it in production. Deleting the line is editing in that place; the real question is how to vary the behavior there without editing there.

> A seam is a place where you can alter behavior in your program without editing in that place.

There is a seam at that call. One way to exploit it: give `CAsyncSslRec` a virtual `PostReceiveError` method that delegates to the global function (behavior preserved), then subclass and override it with an empty body, and instantiate the subclass in tests:

```cpp
class CAsyncSslRec {
    ...
    virtual void PostReceiveError(UINT type, UINT errorcode);
};

void CAsyncSslRec::PostReceiveError(UINT type, UINT errorcode) {
    ::PostReceiveError(type, errorcode);
}

class TestingAsyncSslRec : public CAsyncSslRec {
    virtual void PostReceiveError(UINT type, UINT errorcode) { }
};
```

The calling method was never edited, yet behavior at that call changed. This is an **object seam** — one of many kinds, and the types available depend on the language.

### 4.3 Seam Types

The way to survey seam types is to walk the steps that turn program text into running code on a machine; each identifiable step exposes different kinds of seams.

#### 4.3.1 Preprocessing Seams

C and C++ are the most common languages with a build stage before compilation: the macro preprocessor. It has been cursed incessantly — it does plain text replacement, so innocuous `TEST(getBalance, Account)` expands into a page of test-class scaffolding, and conditional compilation ("aarrrgh!") makes you maintain several different programs in the same source. Excessive preprocessing hurts production clarity, and `#define` macros can hide terribly obscure bugs. But the preprocessor hands you seams. If `account_update` calls a library routine `db_update` that talks directly to a database, add one include and redefine the call under test:

```c
#include "localdefs.h"

#ifdef TESTING
struct DFHLItem *last_item = NULL;
int last_account_no = -1;
#define db_update(account_no, item) \
    { last_item = (item); last_account_no = (account_no); }
#endif
```

Tests can now verify that `db_update` was called with the right parameters, because the `#include` directive is a seam that replaces text before it is compiled. Feathers would not want a preprocessor for Java, but it is welcome compensation for C and C++'s other testing obstacles.

Mid-section, the second definition lands, generalizing from this example:

> Every seam has an enabling point, a place where you can make the decision to use one behavior or another.

The source code must be the same in production and test, so exploiting a seam always means changing something somewhere else. Here the enabling point is the `TESTING` preprocessor define; for the object seam of 4.2 it was the choice of which object to create.

#### 4.3.2 Link Seams

Compilation is often not the last build step: linkers combine compiled representations and resolve the calls between files. (Java hides this inside the compiler — imports are checked and compiled as needed — but the resolution mechanism is still exploitable.) In Java, the classpath is a link seam you can work from the outside: `FitFilter` imports `fit.Parse` and `fit.Fixture`, so you can build same-named classes in another directory and point the classpath at them. The seam is the `new Parse` call in `process()`; the enabling point is the classpath. Confusing in production, handy under test.

With statically linked C and C++, the easiest form is a separate library for whatever you want to replace, with build scripts choosing the stub library when testing. The CAD example: `rerender()` makes direct calls into a graphics library, and the only "verification" is watching the screen — error-prone and tedious. Stub the drawing functions instead:

```cpp
void drawText(int x, int y, char *text, int textLength) { }
void drawLine(int firstX, int firstY, int secondX, int secondY) { }
```

Functions with return values must return something — a success code or the type's default usually works. A graphics library is a good candidate because it is almost a pure "tell" interface; asking for information back is harder, since defaults rarely make good answers. Sensing through a link seam takes more work — record calls into a data structure and assert on them:

```cpp
std::queue<GraphicsAction> actions;

void drawLine(int firstX, int firstY, int secondX, int secondY) {
    actions.push_back(GraphicsAction(LINE_DRAW, firstX, firstY, secondX, secondY));
}
```

The book's `simpleRender` test pops recorded actions and checks the label is drawn first, at the right coordinates. Start with the simplest sensing scheme and let it grow only as complicated as the current need. Two cautions close the section: a link seam's enabling point is always outside the program text (a build or deployment script), which makes link seams easy to miss — so make the difference between test and production environments obvious.

#### 4.3.3 Object Seams

The most useful seams in OO languages rest on one fact: a call site does not define which method actually executes. In `cell.Recalculate();`, the method could belong to `ValueCell`, `FormulaCell`, or anything else — it depends on what `cell` points to. If you can change which `Recalculate` runs without editing that line, the call is a seam.

Not every call qualifies. Construct and use an object in the same method (`Cell cell = new FormulaCell(...); ... cell.Recalculate();`) and there is no seam: the class is fixed at construction, and there is no enabling point. Pass the cell in as a parameter, though, and the call becomes a seam whose enabling point is the argument list — the test decides what kind of `Cell` to pass. A trickier case: a call to a `private static` helper is still a seam, because you can edit the callee rather than the caller — drop `static`, widen `private` to `protected`, and subclass-and-override in test:

```java
public class CustomSpreadsheet extends Spreadsheet {
    ...
    protected void Recalculate(Cell cell) { ... }
}

public class TestingCustomSpreadsheet extends CustomSpreadsheet {
    protected void Recalculate(Cell cell) { ... }
}
```

Isn't this all rather indirect? Why not just edit the dependency out? In nasty legacy code, the safest approach while getting tests in place is to modify the code as little as possible — knowing your language's seams lets you test more safely than editing would.

The chapter closes by inventorying every seam available at the single `PostReceiveError` call: a link seam (stub library; enabling point in the makefile or IDE settings), a preprocessing seam (a macro named `PostReceiveError` under a define), and the object seam (enabling point at object creation). It is remarkable how many ways exist to replace behavior at one call without editing the method. Choosing well matters: object seams are the best choice in OO languages; preprocessing and link seams are less explicit and their tests are harder to maintain, so reserve them for pervasive dependencies with no better alternative. Once you see code in terms of seams, it gets easier both to test what exists and to structure new code for testing.

## Key terms

- **Seam**: a place where you can alter behavior in your program without editing in that place.
- **Enabling point**: the place where you decide which behavior a seam uses — a preprocessor define, a classpath, a build script, an argument list, an object's creation site.
- **Preprocessing seam**: a seam in the text-substitution stage before compilation (`#include`/`#define`); enabled by a preprocessor symbol such as `TESTING`.
- **Link seam**: a seam at the resolution of calls between compiled pieces, via classpath or library substitution; its enabling point is always outside the program text.
- **Object seam**: a seam at a polymorphic call site; enabled by choosing which object to create or pass in — the dominant seam in OO languages.
- **Seam view**: seeing a program as a set of places where behavior can vary, rather than as one huge sheet of text.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
