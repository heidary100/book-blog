---
title: "I Can't Run This Method in a Test Harness"
book: legacy-code
chapter: 10
date: 2026-10-04
summary: "With the class in a harness, the method itself can still refuse to run — hidden private methods, 'helpful' language features like sealed and final, and undetectable side effects — and each case has a named way through that doubles as design feedback."
tags: [legacy-code, testing, seams, refactoring]
---

> Instantiating a class in a test harness is only half the battle; the method you need to change can still refuse to run. Three cases cover most of it: a method that is private or otherwise inaccessible, a "helpful" language feature such as `sealed` or `final` that quietly blocks faking its collaborators, and side effects you cannot observe from where you call. Each fix works by adding a small **seam** — re-expose through a testing subclass, wrap the uncooperative library class, extract method boundaries you can override to sense — and every discomfort the fix exposes is design feedback, because good design is testable.

## The big idea

Chapter 9 got the class into the harness; this chapter gets the method under test. The book opens with the standard obstacles: the method might not be accessible (private, or some other accessibility problem), the parameters might be hard to construct, the method might have bad side effects ("modifying a database, launching a cruise missile, and so on"), or you might need to sense through an object the method uses. Two cheap moves come first, before any case study: if the method barely uses instance data, use **Expose Static Method**; if it is long and gnarly, use **Break Out Method Object** to move the code to a class that instantiates more easily.

The unifying stance is that testability obstacles carry design information. The chapter's blunt principle — "Good design is testable, and design that isn't testable is bad" — licenses violating encapsulation to get tests in place, and Feathers is unapologetic about it (protected plus a subclass is a fair trade). What he refuses to keep around is reflection-based subterfuge against private state, because the pain of working in legacy code is what drives teams to fix it. And the closing rule generalizes past this chapter: extract methods with poor names and poor structure if you must — safety first; clean them up after the tests exist.

## Section by section

### 10.1 The Case of the Hidden Method

The method you need to change is private. The first question is whether you can test through a public method instead — if so, do it. It saves the hunt for access, and it guarantees you are testing the method as it is actually used, which constrains the work: in legacy code, methods of dubious quality lie around everywhere, and "each method has to be just functional enough to support the callers that use it," so testing through the public callers keeps you from refactoring the private method into something more general than anyone needs. If the method should become public someday, its first user outside the class should write the tests that document what it does and how to use it correctly.

When a direct test is genuinely needed, the answer is direct: "If we need to test a private method, we should make it public. If making it public bothers us, in most cases, it means that our class is doing too much." Making it public bothers you for two reasons. One: it is a utility clients shouldn't care about — forgivable, though worth asking whether the method belongs on another class. Two, more serious: outside callers could corrupt results the other methods depend on. The remedy for that one is to move the private methods to a new class — public there, held as an internal instance — which makes them testable and improves the design. That is Chapter 20 work, though, and release-cycle reality may not allow it now.

The worked example is `CCAImage`, a security-camera image class. Its public `snap()` drives a low-level camera API, and a single call can trigger several repeated calls to the private `setSnapRegion`, placing each captured picture on a different part of an image buffer depending on the subject's motion. The camera API changed, so `setSnapRegion` must change — but making it public would let production code outside `snap()` corrupt the camera's tracking system. The compromise: change `private` to `protected`, then subclass to re-expose it:

```cpp
class TestingCCAImage : public CCAImage {
public:
    // delegate explicitly...
    void setSnapRegion(int x, int y, int dx, int dy) {
        CCAImage::setSnapRegion(x, y, dx, dy);
    }
    // ...or, on most modern compilers, re-export with a using declaration:
    // using CCAImage::setSnapRegion;
};
```

Is this just making the method public by another route? Yes, and Feathers owns it: "Frankly, I don't mind doing this. For me, getting the tests in place is a fair trade." The violation is minor — reasoning about the class now has to allow subclasses calling `setSnapRegion` — and that small wart may be exactly the nudge that triggers the full responsibility-splitting refactoring the next time the class is touched.

**Subverting access protection.** Languages newer than C++ offer reflection and special permissions to reach private state at runtime. Handy for breaking dependencies, but "a bit of a cheat" to keep in a project: tests that sneak past access protection prevent a team from noticing how bad the code is getting. The pain is the signal — "the pain that we feel working in a legacy code base can be an incredible impetus to change" — and taking the sneaky way out delays the bill until the cost to fix things is ridiculous.

### 10.2 The Case of the "Helpful" Language Feature

Security-motivated features look like clear wins until you test code that uses them. The example is a C# method `getKSRStreams(HttpFileCollection)` that iterates uploaded files and collects the streams of those ending in `.ksr`, or in `.txt` above a minimum length. The obstacles: `HttpPostedFile` has no public constructor and is `sealed`; `HttpFileCollection` has the same problems. At runtime some framework class creates the instances, but you can neither instantiate nor subclass either one — and since they are library classes you don't control, **Extract Interface** and **Extract Implementer** are off the table. Java's `final` is the parallel mechanism; the security rationale (no malicious subclasses of `String`) is real, but sealed and final are drastic tools that leave you in a bind.

The way through is **Adapt Parameter**. The one thing the code does with the collection is iterate it, and `HttpFileCollection` has an unsealed superclass, `NameObjectCollectionBase` — so subclass that (`OurHttpFileCollection`) and change the method's parameter type, letting the compiler drive. The files are tougher: you cannot create `HttpPostedFile`s, so ask what the code actually needs — just the `FileName` and `ContentLength` properties. **Skin and Wrap the API**: extract an `IHttpPostedFile` interface, then provide a wrapper over the real thing and a fake for tests:

```csharp
public class HttpPostedFileWrapper : IHttpPostedFile {
    public HttpPostedFileWrapper(HttpPostedFile file) { this.file = file; }
    public int ContentLength { get { return file.ContentLength; } }
}
public class FakeHttpPostedFile : IHttpPostedFile {
    public FakeHttpPostedFile(int length, Stream stream, ...) { ... }
    public int ContentLength { get { return length; } }
}
```

The price is that production code must now iterate the original collection, wrap each `HttpPostedFile`, and pass the new collection to `getKSRStreams` — "that's the price of security." The verdict is pointed: it is easy to blame `sealed` and `final` as mistakes, but "the real fault lies with us. When we depend directly on libraries that are out of our control, we are just asking for trouble." Use sealed and final sparingly in your own code, and isolate library classes that use them behind wrappers so you have wiggle room when you change things (Chapters 14 and 15 take this further).

### 10.3 The Case of the Undetectable Side Effect

The last case is methods that return nothing and report nothing: "We call their methods, and they do some work, but we (the calling code) never get to know about it." The example is a Java `AccountDetailFrame` that does everything: creates GUI components, handles `actionPerformed` notifications, builds up detailed text, creates and shows a `DetailFrame`, then — when the window is done — grabs information back out of it directly, processes it, and sets it on one of its own text fields. Running that in a harness is pointless: it would show windows and prompt for input, and there is "no decent place to sense what this code does."

The repair is a series of automated **Extract Method** refactorings that separate GUI-independent work from GUI-dependent work. Extract the whole body into `performCommand(source)` (removing the dependency on `ActionEvent`); make `detailDisplay` an instance variable; then extract the code that touches the other frame into methods named for what they do for this class rather than for the components they manipulate — `setDescription` (creates and shows the `DetailFrame`) and `getAccountSymbol` — and finally `setDisplayText` for the local text field. Naming guidance: name methods from the perspective of what they calculate or accomplish for the class, and let the names hide the display components even when the extracted bodies use them.

**Command/Query Separation.** Along the way, Feathers invokes Bertrand Meyer's principle: a method should be a command (modifies state, returns nothing) or a query (returns a value, modifies nothing), but not both. The primary reason is communication — "If a method is a query, we shouldn't have to look at its body to discover whether we can use it several times in a row without causing some side effect."

With every collaborator touch-point behind a method, **Subclass and Override Method** (the pattern Chapter 25 catalogs as Extract and Override Call) turns the class into a sensing seam. The testing subclass suppresses the side effects and installs sensing variables:

```java
public class TestingAccountDetailFrame extends AccountDetailFrame {
    String displayText = "";
    String accountSymbol = "";
    void setDescription(String description) {}               // no windows in tests
    String getAccountSymbol() { return accountSymbol; }
    void setDisplayText(String text) { displayText = text; } // sensing variable
}
```

and the method under test becomes plainly assertable:

```java
public void testPerformCommand() {
    TestingAccountDetailFrame frame = new TestingAccountDetailFrame();
    frame.accountSymbol = "SYM";
    frame.performCommand("project activity");
    assertEquals("SYM: basic account", frame.displayText);
}
```

Feathers is honest about the cost: coarse, conservative extraction leaves code that makes you flinch — "a setDescription method that creates a frame and shows it is downright nasty. What happens if we call it twice?" — but it is a decent first step, and frame creation can be relocated once tests exist. The extraction pattern also exposes the responsibilities: `getAccountSymbol` and `setDescription` use only `detailDisplay`; `setDisplayText` uses only the local `display` — so the decision to create another frame and pull information from it extracts into a `SymbolSource`, named for what `AccountDetailFrame` needs from it (symbol information "any way it needs to"), a likely candidate to become an interface if that decision ever changes.

The general workflow: with a refactoring tool doing only safe extract-method steps, the editing you do between tool runs is the hazardous part of the work. Accept poor names and poor structure to get tests in place — "Safety first" — and clean the code up afterward.

## Key terms

- **Command/Query Separation**: Meyer's principle that a method should be a command (modifies state, returns nothing) or a query (returns a value, modifies nothing) — never both, so a query's safety for repeated use is evident without reading its body.
- **Sensing variable**: a field on a testing subclass that records what the code under test did (here, `displayText`) so an effect invisible to callers can be asserted; the book formalizes the technique as Introduce Sensing Variable in Chapter 22.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
