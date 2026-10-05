---
title: "My Project Is Not Object Oriented. How Do I Make Safe Changes?"
book: legacy-code
chapter: 19
date: 2026-10-04
summary: "Procedural legacy code has fewer seams, but safe change is still possible: link and preprocessing seams to get chunks under test, new behavior as pure test-driven functions split from dependency-binding wrappers, and a mechanical migration to object seams when the language has an OO successor — because a procedural program is already one big object."
tags: [legacy-code, seams, testing, refactoring]
---

> Not object oriented does not mean unsafe to change — it means the toolkit is smaller. Procedural code can be brought under test with **link seams** (a library of fakes substituted at link time) and **preprocessing seams** (`#ifdef`-ing calls out of existence); new behavior can be written as pure, test-driven functions separated from the wrappers that bind dependencies; and when the language has an OO successor, classes can be introduced mechanically to buy **object seams**. The reframe that makes it all click: every procedural program is already object oriented — it just contains only one object.

## The big idea

Procedural languages — C, COBOL, FORTRAN, Pascal, BASIC — are the most widespread in the industry and the most challenging in a legacy environment: they "often just don't have the seams that OO (and many functional) programming languages do," so the moves for introducing unit tests are few, and the default degenerates to "think really hard, patch the system, and hope." Savvy dependency management can hold a C codebase together, but it is easy to end up with a snarl that is hard to change incrementally and verifiably. Hence the standard course of action is coarse-grained: get a large chunk of code under test *before* changing anything, using the Chapter 12 techniques — find a **pinch point**, then use link seams (and preprocessing seams where a macro preprocessor exists) to break just enough dependencies to get into a test harness.

The rest of the chapter works locally instead. Bias toward introducing new functions rather than adding code to old ones — at minimum the new functions can be tested, and the discipline of formulating their tests (**test-driven development** works in procedural code too) pushes design toward pure computation separated from dependency-binding wrappers. And when the language offers a migration path — C compilers that also compile C++, OO extensions to COBOL and Fortran — take it: wrapping declarations in classes and parameterizing constructors is safe, mechanical, and buys object seams, which are "good for far more than getting tests in place." Link and preprocessing seams get code under test; they do little to improve design beyond that.

### 19.1 An Easy Case

Procedural code isn't always a problem. The example is `set_writetime` from the Linux kernel:

```c
void set_writetime(struct buffer_head * buf, int flag)
{
    int newtime;
    if (buffer_dirty(buf)) {
        newtime = jiffies + (flag ? bdf_prm.b_un.age_super :
            bdf_prm.b_un.age_buffer);
        if(!buf->b_flushtime || buf->b_flushtime > newtime)
            buf->b_flushtime = newtime;
    } else {
        buf->b_flushtime = 0;
    }
}
```

Testing it is easy because every dependency is benign: set the value of `jiffies`, create a `buffer_head`, pass it in, and check its fields afterward. Most functions are not so lucky. The pattern that hurts is a function that calls a function that calls something hard to deal with — something doing I/O or coming from a vendor's library. You want to know what the code does, but "it does something cool, but only something outside the program will know about it, not you."

### 19.2 A Hard Case

`scan_packets` calls `ksr_notify`, which writes a notification to a third-party system — fine in production, hostile in a test. Two ways out, both seams. The first is the link seam: build a library of fakes — functions with the same names as the originals but harmless bodies — and link to it under test:

```c
void ksr_notify(int scan_code, struct rnode_packet *packet)
{
}
```

`scan_packets` behaves exactly as before except that it doesn't notify — precisely what you want when pinning down behavior before a change. The judgment call: if the ksr library has many functions and its calls are peripheral to the main logic, a fake library makes sense. If you need to sense *through* those functions or vary their return values, link seams get tedious: substitution happens at link time, so each executable carries exactly one definition per function, and per-test variation means conditionals inside the fake plus setup in the test to force each behavior.

In C there is a second option, the preprocessing seam. Define the call out of existence and embed tests in the same file:

```c
#include "ksrlib.h"
#ifdef TESTING
#define ksr_notify(code,packet)
#endif
int scan_packets(struct rnode_packet *packet, int flag) { ... }
```

Mixing tests and source in one file "isn't really the clearest thing we can do," so the alternative is file inclusion: `#include "scannertestdefs.h"` near the top and `#include "testscanner.tst"` at the bottom, so the production code differs from the original by one line. With `TESTING` defined, the file builds standalone and its `main()` runs the test functions (`test_port_invalid()`, `test_body_not_corrupt()`, ...); registration functions can handle test grouping — see the C unit-testing frameworks at www.xprogramming.com. Macro preprocessors are easily misused, but as long as the rampant macro usage is restricted to code that runs under test, production code is untouched. C is one of the few mainstream languages with a macro preprocessor; in other procedural languages the options reduce to link seams and getting larger areas under test.

### 19.3 Adding New Behavior

In procedural legacy code, it pays to bias toward new functions over additions to old ones. **Test-driven development (TDD)** works procedurally, and the effort to make each piece testable alters the design for the better. The recurring reformulation: separate pure logic from dependencies. `send_command` must format an ID, name, and command string and send it through `mart_key_send` — untestable as designed, because the only observable effect happens at the send. Split it so the formatting lives in a function that just returns the command:

```c
char *command = form_command(1,
                             "Mike Ratledge",
                             "56:78:cusp-:78");
assert(!strcmp("<-rsp-Mike Ratledge><56:78:cusp-:78><-rspr>",
               command));
```

`form_command` holds all the logic and is testable; `send_command` shrinks to a wrapper that calls it, sends, and frees. "We put all of the pure logic into one set of functions so we can keep them free of problematic dependencies... we end up with little wrapper functions..., which bind our logic and our dependencies." Workable whenever the dependencies aren't too pervasive.

The other shape is a function littered with external calls whose sequencing matters — `calculate_loan_interest` interleaving `db_retrieve` and `db_update` with computation. In many procedural languages the honest answer is to skip test-first, write it as well as possible, and test at a higher level. In C there is one more option: function pointers as a seam. Put the database operations in a struct of function pointers and pass the struct to any new function that needs the database:

```c
struct database
{
    void (*retrieve)(struct record_id id);
    void (*update)(struct record_id id, struct record_set *record);
    ...
};
```

Production initializes the pointers to the real database functions; tests point them at fakes. With older compilers the calls need the clunky form `(*db.update)(id, record)`; with modern ones they read naturally: `db.update(id, record)`. The technique isn't C-specific — any language with function pointers supports it.

### 19.4 Taking Advantage of Object Orientation

Object seams have three properties the other seams lack: they are easy to notice in the code, they break code into smaller, more understandable pieces, and they add flexibility — a seam introduced for testing often turns out to be an extension point later. Since most C compilers compile C++, and COBOL and Fortran have OO extensions, the migration to a first object seam is mechanical. Applied to `scan_packets`:

1. Compile under C++ — recompile the whole project or do it piece by piece.
2. Wrap the `ksr_notify` declaration in a class, adding a default implementation that delegates to the global function, with the name and signature unchanged (Preserve Signatures, Chapter 23):

```cpp
class ResultNotifier
{
public:
    virtual void ksr_notify(int scan_result,
                            struct rnode_packet *packet);
};

void ResultNotifier::ksr_notify(int scan_result,
                                struct rnode_packet *packet)
{
    ::ksr_notify(scan_result, packet);
}
```

3. Declare a global `ResultNotifier globalResultNotifier;`, recompile, and let the errors lead to the call sites, which become `globalResultNotifier.ksr_notify(scan_result, current);`.
4. Encapsulate Global References (Chapter 25) again: move `scan_packets` into a `Scanner` class.
5. Parameterize Constructor (Chapter 25) so tests can supply another notifier:

```cpp
class Scanner
{
private:
    ResultNotifier& notifier;
public:
    Scanner();
    Scanner(ResultNotifier& notifier);
    int scan_packets(struct rnode_packet *packet, int flag);
};
```

The default constructor binds `globalResultNotifier`; the parameterized one takes whatever the test provides. "These changes are pretty safe and pretty mechanical. They aren't great examples of object-oriented design, but they are good enough to use as a wedge to break dependencies and allow us to test as we move forward."

### 19.5 It's All Object Oriented

Procedural programmers like to beat up on OO, but "all procedural programs are object oriented; it's just a shame that many contain only one object." The demonstration is pure mechanics: take a program of about 100 functions, put all the declarations in one file surrounded by `class program { ... };`, prefix each definition (`int program::db_find(...)`), and write a new main:

```cpp
int main(int ac, char **av)
{
    program the_program;
    return the_program.main(ac, av);
}
```

Does that change the behavior of the system? Not really — the meaning and behavior are exactly the same, and the old C system turns out to have been one big object all along. Starting to use Encapsulate Global References is what makes *new* objects, subdividing the system in ways that make it easier to work with. Beyond extracting dependencies, an OO-capable language lets you move incrementally toward a better object design: group related functions in classes and extract plenty of methods to break apart tangled responsibilities — which is Chapter 20's problem. The closing guidance: the seams a procedural language presents critically affect how easy the work is, and if your language has an OO successor, move toward it. This isn't deep object orientation — just enough objects to break up the program for testing — but object seams repay the move; link and preprocessing seams don't improve design at all.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
