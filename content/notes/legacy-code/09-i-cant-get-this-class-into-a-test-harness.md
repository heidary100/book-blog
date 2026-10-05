---
title: "I Can't Get This Class into a Test Harness"
book: legacy-code
chapter: 9
date: 2026-10-04
summary: "Instantiating a legacy class in a test harness is the gate to every other technique, and each classic construction obstacle — irritating parameter, hidden dependency, construction blob, singleton globals, C++ include tangles, onion parameter, aliased parameter — is a dependency problem with a named remedy."
tags: [legacy-code, refactoring, testing]
---

> The hard prerequisite for everything else in this book is creating an object of the class under test inside a test harness, and that is where legacy code fights back. Feathers walks through seven "cases" of construction trouble — irritating parameter, hidden dependency, construction blob, irritating global dependency, horrible include dependencies, onion parameter, aliased parameter — and shows that every one of them is a dependency problem with a matching dependency-breaking technique. Two habits carry through all of them: write a construction test and let the compiler teach you the dependencies, and accept that test code legitimately plays by different rules than production code.

## The big idea

"This is the hard one" — if instantiating a class in a harness were always easy, the book would be a lot shorter. The four most common problems: objects of the class can't be created easily; the test harness won't easily build with the class in it; the constructor we need to use has bad side effects; or significant work happens in the constructor and we need to sense it. The unifying diagnosis: a constructor problem is a dependency problem. The constructor reaches outside the object — opening connections, loading files, allocating services, consulting singletons — and a test can't afford that work. The chapter teaches through case studies in Java, C++, and C#, because reading worked examples is how you become fluent in the arsenal of dependency-breaking techniques and learn to trade them off for particular situations.

The tactical opening move is to stop analyzing and just try. Write a **construction test**: a test case with no assertions whose only job is `new CreditValidator(...)`. The compiler errors enumerate exactly what you need. Construction tests look weird, and once construction finally succeeds they are usually deleted or renamed to test something substantial. From then on, remember the boundary: test code doesn't have to live up to production standards — public fields, empty method bodies, and nulls are all fine — but it must be clean: duplicated setup lines get extracted into `setUp()` like anywhere else.

## Section by section

### 9.1 The Case of the Irritating Parameter

`CreditValidator(RGHConnection, CreditMaster, String validatorID)` needs a new method, `getValidationPercent` (the percentage of successful `validateCustomer` calls over the validator's life), and a test harness. The construction test forces the issue: start with no arguments and the compiler complains there is no default constructor; hunting through the code, the only constructors available are `RGHConnection(int port, String name, String passwd)` and `CreditMaster(String filename, boolean isLocal)`. Then ask not just "can I write the test?" but "can I live with it?" — constructing an `RGHConnection` opens a connection to a server, which takes a long time and the server isn't always up, while `CreditMaster` loads a small read-only file quickly. An **irritating parameter** is a constructor parameter whose construction you can't afford in a test, even when the class itself is fine. The remedy here is **Extract Interface** on `RGHConnection`, then a fake that implements the interface.

The fake, `FakeConnection`, implements `IRGHConnection`:

```java
public class FakeConnection implements IRGHConnection {
    public RFDIReport report;
    public void connect() {}
    public void disconnect() {}
    public RFDIReport RFDIReportFor(int id) { return report; }
    public ACTIOReport ACTIOReportFor(int customerID) { return null; }
}
```

Empty bodies, a public mutable field, returning null — it "violates all the rules," but the rules are different for classes that exist only to make testing possible; `FakeConnection` never runs in the full application. Tests set `connection.report` and exercise `validateCustomer` against whatever the fake hands back. What test code does owe you is cleanliness: when `testNoSuccess` and `testAllPassed100Percent` duplicate their first three lines, those lines move to `setUp()`.

A cheaper alternative appears when the new method turns out not to use `CreditMaster` at all — why construct it? **Pass Null**: construct the object with nulls and let the code under test reveal the truth. If the test touches the parameter, the runtime throws, the harness catches it, and the test fails, telling you the parameter is used; construct a real object only when behavior actually needs one. Feathers often starts with `new CreditValidator(null, null, "a")` and fills in parameters as needed. Your reaction to that line diagnoses your system: if passing null feels normal, you probably have null checks and conditionals all over the code base. This is safe in Java and C# — any language that throws on null use — but dangerous in C and C++ unless the runtime reliably detects null dereferences; otherwise tests are silently and hopelessly wrong, corrupting memory as they run.

The mirror-image rule for production code: don't pass null there; prefer the **Null Object Pattern**, an object whose operations do nothing (a `NullEmployee` that, told to `pay()`, does nothing), so clients skip explicit error checking. Its limit: null objects fit only when the client doesn't need to know whether the operation happened — a loop counting paid employees breaks the moment a null employee is counted.

One more escape hatch: **Subclass and Override Method**. If the offending work isn't hard-coded into the parameter's constructor — say `RGHConnection`'s constructor calls its own `connect()` — a testing subclass can override `connect()` to do nothing. The caution: be sure you aren't overriding away the very behavior you want to test.

### 9.2 The Case of the Hidden Dependency

A C++ `mailing_list_dispatcher` takes no constructor arguments at all — and that's the trap. The constructor allocates `mail_service` with `new` in the initializer list (poor style), connects, registers the dispatcher with the service using the magic number `12` as a client type, and sets bounce/repeat parameters. You can create the object in a test, but it's useless: you'd have to link the mail libraries, configure a mail system to handle registrations, and every `send_message` would send real mail. A **hidden dependency** is a resource the constructor creates or reaches itself, invisible in the signature.

The remedy is **Parameterize Constructor**: externalize the dependency by creating it outside the class and passing it in. Feathers likes this technique as often as he can use it, and notes people rarely think of it because they assume every client must change to pass the new parameter — which isn't true. Extract the constructor body into an `initialize()` method (safe to attempt without tests because you **Preserve Signatures** while doing it), then keep two constructors:

```cpp
mailing_list_dispatcher::mailing_list_dispatcher(mail_service *service)
: status(MAIL_OKAY) { /* connect, register, set params ... */ }

mailing_list_dispatcher::mailing_list_dispatcher()
{
    initialize(new mail_service);  // original signature preserved for clients
}
```

That "might not seem like much of an improvement, but it does give us incredible leverage": **Extract Interface** on `mail_service` yields one implementer that really sends mail and another that senses what the class does to it under test. In C# and Java the whole refactoring is easier still, because constructors can call each other: `public MailingListDispatcher() : this(new MailService()) {}`. The caveat on applicability: Parameterize Constructor is easy precisely when the created object has no construction dependencies of its own. When it does, other techniques take over — **Extract and Override Getter**, **Extract and Override Factory Method**, **Supersede Instance Variable**.

That "might not seem like much of an improvement, but it does give us incredible leverage": **Extract Interface** on `mail_service` gives one implementer that really sends mail and another that senses what the class does to it under test. In C# and Java the whole refactoring is easier still, because constructors can call each other: `public MailingListDispatcher() : this(new MailService()) {}`. The caveat on applicability: Parameterize Constructor is easy precisely when the created object has no construction dependencies of its own. When it does, other techniques take over — **Extract and Override Getter**, **Extract and Override Factory Method**, **Supersede Instance Variable**.

### 9.3 The Case of the Construction Blob

A **construction blob** is a constructor that creates a few objects and then uses them to create others — parameterizing it would mean a huge parameter list, and moving all the creation code outside the class isn't very safe without tests and burdens clients:

```cpp
WatercolorPane::WatercolorPane(Form *border, WashBrush *brush, Pattern *backdrop)
{
    anteriorPanel = new Panel(border);
    anteriorPanel->setBorderColor(brush->getForeColor());
    backgroundPanel = new Panel(border, backdrop);
    cursor = new FocusWidget(brush, backgroundPanel);  // buried; no way to sense through it
}
void WatercolorPane::supersedeCursor(FocusWidget *newCursor)  // Supersede Instance Variable
{
    delete cursor;
    cursor = newCursor;
}
```

To sense through `cursor`, the first instinct — **Extract and Override Factory Method** on the constructor's creation code — works in Java and C# (given a refactoring tool that safely extracts methods) but not in C++: virtual calls made in constructors don't resolve to overrides defined in derived classes, and it's a bad idea generally, since an overridden function often assumes it can use base-class variables that stay uninitialized until the base constructor finishes.

The C++-compatible option is **Supersede Instance Variable**: a setter that swaps in another instance after construction. In C++ you must `delete` the old object, which means understanding its destructor — does it destroy anything that was passed into the constructor? Get that wrong and you've introduced subtle bugs. In Java the setter is a one-line field assignment (the garbage collector handles the old object), but superseding methods must never be used in production: if the superseded objects manage resources, you can cause serious resource problems. With the setter in place, **Extract Interface** or **Extract Implementer** on `FocusWidget` yields a `TestingFocusWidget` that is far easier to build than the real thing — construct the pane, call `supersedeCursor(widget)`, and assert against the fake (the book's `renderBorder` test checks the component count through it). Feathers dislikes Supersede Instance Variable — the potential for resource-management problems is too great — and uses it mainly in C++, precisely where the factory-method route is unavailable.

### 9.4 The Case of the Irritating Global Dependency

The framing: old-style reuse means finding classes you want, adding them to a project, and just using them — and you're kidding yourself about that kind of reuse if you can't pull a random class out of an application and compile it independently in a test harness without a lot of work. Most of what the industry calls reusable components doesn't qualify: frameworks "are things that use our code" — they manage the application lifecycle while we fill in the holes (ASP.NET, Struts, even xUnit calling our test classes). The hardest dependency for this is global usage. A `Facility` constructor calls `PermitRepository.getInstance().findAssociatedPermit(notice)` — a **Singleton**, which in Java is one of the mechanisms people use to make global variables — and this isn't isolated: ten other classes repeat the same line in constructors, regular methods, and static methods.

Globals hurt through **opacity**: reading `example.deposit(1)`, you can enumerate everything it can affect — nothing is passed in that can change, an int comes back — whereas with globals you can't tell from a use site whether a class reads or modifies state declared somewhere else entirely. In testing this means discovering which globals a class touches and setting them up with the right state before each test, over and over. Singletons are especially hard to fake because faking is exactly what the pattern forbids — but each test should be a mini-application, totally isolated from the others, so the singleton property has to be relaxed.

The primary technique is **Introduce Static Setter**: add a static `setTestingInstance(newInstance)` to the singleton, then build and install a repository in `setUp()`. A variant is a `resetForTesting()` method that nulls the instance — call it in `setUp()` and `tearDown()` so every test gets a fresh singleton. That variant works when the singleton's public methods let you set up all the state you need; when they don't, or the singleton touches external resources, use the static setter plus a **Subclass and Override Method** fake: a `TestingPermitRepository` that keeps permits in a `HashMap`, adds an `addAssociatedPermit` helper, and overrides `findAssociatedPermit` to skip the database.

Whether to relax the singleton property is a real design conflict, and it helps to ask why one instance was enforced in the first place:

- We're modeling the real world, and there's only one of these things (a circuit board, the one collection of permits).
- Two instances would be a serious problem (two control-rod controllers operating the same rods unknowingly).
- Two instances would consume too many resources (disk, memory, licenses).

Often the actual reason people create singletons is that they wanted a global and passing the variable around felt too painful — and then there's no reason to keep the property at all: make the constructor protected, package-scoped, or public, with a team rule or a build-time/runtime check (alarm if `setTestingInstance` is called outside tests) as the guardrail. It wasn't even possible to enforce singleton-ness in many pre-OO languages, and people built safe systems anyway — "in the end, it comes down to responsible design and coding." A protected constructor plus the testing subclass preserves part of the singleton property: outsiders still can't create bare `PermitRepository` instances, only subclasses. The heavier fallback is **Extract Interface** on the singleton (`IPermitRepository` carrying the public non-static methods), changing the instance field, `getInstance`, and all references — which you can **Lean on the Compiler** to drive — or **Extract Implementer** if no refactoring tool is available.

Be honest about what this buys: Introduce Static Setter gets tests in place despite extensive global dependencies; it doesn't remove them. Removing them means **Parameterize Method** (downside: many extra methods that distract readers) or **Parameterize Constructor** (downside: an extra field per object, threaded through constructors, with the creator needing access to the instance too — a memory impact at scale that usually signals other design problems). The worst case — hundreds of classes each needing database access — invites the first question: why? If the system does anything besides access the database, it can be factored so responsibilities separate: some classes store and retrieve data, others calculate on data supplied through their constructors, and dependencies localize. The exercise worth doing: pick a global in a large application and search for its uses. Variables that are globally accessible are rarely globally used; if one truly is used everywhere, the code has no layering (see chapters 15 and 17).

### 9.5 The Case of the Horrible Include Dependencies

C++'s C legacy strikes here. Java and C# import compiled metadata; C++ textually includes declarations, and the compiler re-parses them and rebuilds its internal representation on every encounter. The include mechanism is prone to abuse — a file includes a file that includes a file — so on unattended projects small files end up transitively including tens of thousands of lines; builds crawl and no single file explains why. Feathers is careful to note this isn't C++-bashing: the language was an utterly pragmatic answer to its era, but its defaults aren't ideal for maintenance and teams have to go beyond them to keep a system nimble.

The example is `Scheduler`, a 200-plus-method class with severe tangled dependencies on `Meeting`s, `MailDaemon`s, `Event`s, and `SchedulerDisplay`s. Practical hygiene for getting it into a harness: create the test file (`SchedulerTests`) in the same directory as the class — with the preprocessor, dodging projects that don't include files via consistent paths is worth it — and add needed includes one at a time rather than copying the whole `#include` list from the source file. Copying everything until the build errors stop feels easiest, but a long transitive chain can force you to include far more than you need, depending on things that are very hard to work with in a harness.

When a dependency is unworkable — `SchedulerDisplay` is accessed right in `Scheduler`'s constructor — supply an alternative definition in the test file: an empty `SchedulerDisplay::displayEntry(...)` body, so the test build links against the stub instead of the real code. Because a program can contain only one definition of each method, this forces a separate test program; the fakes get collected into a shared `Fakes.h` include for reuse across a set of test files. This is the technique the Chapter 25 catalog formalizes as **Link Substitution**.

The downsides are real: a separate program to build, no language-level dependency breaking (the production code doesn't get cleaner as you break the dependencies), and duplicate definitions kept alive for as long as the tests exist. Feathers reserves it for huge classes with severe dependency problems — where the separate test program can act as a testing point for a long refactoring campaign, fading away over time as classes are extracted and tested individually.

### 9.6 The Case of the Onion Parameter

The **onion parameter**: objects inside of objects — creating objects to create objects to create a parameter for the constructor of the class you actually want to test. `SchedulingTaskPane` needs a `SchedulingTask`; `SchedulingTask`'s single constructor needs a `Scheduler` and a `MeetingResolver`; and those may need more still. The one consolation: there has to be at least one class that doesn't require another object as an argument — otherwise the system could never have compiled.

The way through is to take a close look at what the test really needs from each parameter. Nothing? **Pass Null**. Just some rudimentary behavior? **Extract Interface** or **Extract Implementer** on the most immediate dependency — here, `SchedulingTask` itself — and fake it; a fake `SchedulingTask` makes `SchedulingTaskPane` buildable. Java absorbs even the inheritance wrinkle: the interface extracted from `SchedulingTask` can include the public methods it inherits from `SerialTask`. C++ has no separate interface construct, so you hand-roll one: a pure-virtual `ISchedulingTask`, with `SchedulingTask` inheriting both `SerialTask` and the interface. Ported naively, `SchedulingTask` would turn abstract from the inherited pure virtual, so it overrides `run()` to delegate to `SerialTask::run()` — easy enough to add. The general lesson: in any language where interfaces or interface-acting classes can be created, they can be used systematically to break dependencies.

### 9.7 The Case of the Aliased Parameter

An **aliased parameter** enters under one type but is used as another. `IndustrialFacility` takes an `OriginationPermit` yet assigns it (or a repository-found associated permit) to a `Permit` field — and consults the `PermitRepository` singleton again, handled as in 9.4. The natural move, **Extract Interface** on `OriginationPermit`, is useless here: the fake would have to be assignable to a `Permit` field, and in Java interfaces can't inherit from classes. Interfaces all the way down (`IPermit` everywhere) works but is "a ridiculous amount of work," and a near one-to-one class-to-interface ratio clutters the design — acceptable when your back is against the wall, but worth exploring alternatives first.

The alternative starts by asking why the dependency is bad: creation is painful, the parameter has bad side effects (`OriginationPermit.validate()` silently opens a database, queries it, and sets its validation flag), or its code just takes too long. **Extract Interface** answers all of these by brutally severing the connection to the whole class; if only pieces of the class are problems, sever only those with **Subclass and Override Method**: a `FakeOriginationPermit` exposing state-setting helpers (`becomeValid()`), with `validate()` overridden per test.

That includes test-local classes defined on the fly inside test methods, like `AlwaysValidPermit` overriding `validate()` to call `becomeValid()` before the assertion on `facility.hasPermits()`. Defining classes inside methods is not a habit for production code, but it is very convenient for making special cases in tests. If the offending code is intermingled with logic the test needs, extract methods first — the monster-method techniques of Chapter 22 apply.

## Key terms

- **Construction test**: a test with no assertions whose only job is to create the object; the compiler errors enumerate the dependencies. Usually renamed or deleted once construction succeeds.
- **Irritating parameter**: a constructor parameter whose construction you can't afford in a test (server connection, file load) even though the class itself is fine.
- **Pass Null**: pass null for hard-to-construct parameters; if the code uses the value, the thrown exception fails the test and exposes the dependency. Reliable only where the runtime detects null use (Java, C#) — not C/C++.
- **Null Object Pattern**: a real object whose operations do nothing, shielding clients from null checks; only appropriate when clients don't need to know whether the operation happened.
- **Hidden dependency**: a resource the constructor creates or reaches on its own (a `new` in the initializer list), invisible from the signature.
- **Parameterize Constructor**: externalize a constructor-created dependency by passing it in, keeping the old signature via an extracted `initialize()` method or constructor chaining.
- **Construction blob**: a constructor that builds objects used to build other objects, burying collaborators where no test can sense or replace them.
- **Supersede Instance Variable**: a setter that swaps an instance variable after construction; hazardous in C++ (delete/destructor semantics) and never for production use.
- **Introduce Static Setter**: a static setter that replaces a singleton's held instance for tests, deliberately relaxing the singleton property.
- **Singleton**: a class enforced to have exactly one instance, via a private constructor and a static `getInstance` — in Java, one of the mechanisms for making global variables, and hard to fake by design.
- **Link Substitution** (the Chapter 25 catalog's name for the 9.5 technique): supplying alternative definitions bound at link time in a separate test build, for dependencies that can't be broken at the language level.
- **Onion parameter**: a constructor parameter requiring objects that require objects; peel it by faking the most immediate dependency.
- **Aliased parameter**: a parameter that enters as one type but is held or used as another (its base class), defeating interface extraction on the parameter's own type.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
