---
title: "How Do I Know That I'm Not Breaking Anything?"
book: legacy-code
chapter: 23
date: 2026-10-04
summary: "When tests are out of reach, editing discipline is the safety net: classify every keystroke as behavior-changing or not, do one thing at a time, preserve signatures so edits become copy-paste-safe, lean on the compiler as a change-detection tool, and pair so a second set of eyes catches what you miss."
tags: [legacy-code, refactoring, craftsmanship, teams]
---

> Code is a strange building material: metal, wood, and plastic fatigue with use, but code never breaks on its own — the only way it gets a fault is for someone to edit it. That makes developers the primary agents introducing faults, and editing is mechanically trivial. When you can't cover a change with tests — especially while breaking dependencies to get tests in place — the safety net is discipline: know what every keystroke does, do one thing at a time, preserve signatures, lean on the compiler, and never operate alone.

## The big idea

The chapter rests on a material-science observation: run a machine made of metal over and over and it eventually breaks; run the same code over and over and it just runs. Short of a stray cosmic ray flipping a bit, the only way software gets a fault is an edit — and editing is so mechanically easy that anyone can open a text editor and spew the most arcane nonsense into it (some poems even compile; see the Obfuscated C code contest). The familiar mystery bug caused by a stray character typed by a passing book cover makes the point: "Code is pretty fragile material."

The burden therefore falls on developers, and the chapter collects ways to reduce risk while editing — some mechanical, some psychological — with special attention to the dependency-breaking refactorings of Chapter 25, which by definition happen before tests exist. There, editing discipline is the safety net.

## Section by section

### 23.1 Hyperaware Editing

Every keystroke you make falls into one of two categories: it either changes the behavior of the software or it doesn't. Typing in a comment doesn't. Typing in a string literal does, most of the time — unless the literal sits in code that is never called, in which case the keystroke that later finishes a method call using that literal is the one that changes behavior. Holding down the spacebar while formatting is refactoring in the micro sense; changing a numeric literal in a used expression is not refactoring at all but a functional change. "This is the meat of programming, knowing exactly what each of our keystrokes does." Not omniscience — just anything that helps you really know how you are affecting the software as you type.

Test-driven development is powerful here: when code is in a harness and tests run in under a second, you can really know the effects of a change. Feathers predicts **edit-triggered testing** — an IDE running a chosen set of tests at every keystroke, the natural successor to per-keystroke syntax checking — as an inevitable closing of the feedback loop. Tests foster **hyperaware editing**, and so does pair programming. It sounds exhausting, but it is a flow state, not a strain: what actually tires you out is getting no feedback — holding all the changed-and-unchanged state in your head, scared of breaking code without knowing it, planning how you'll convince yourself later that you did what you set out to do.

### 23.2 Single-Goal Editing

The superstition being dismantled is the super-smart programmer who keeps an entire system in their head and writes correct code on the fly. People vary in their ability to hold arcane detail, but holding state mentally "doesn't really make us better at decision-making" — judgment is the key programming skill, and acting like the myth gets you into trouble. The myth in action: start a feature, decide to clean something up, start pondering what the code should really look like, hop back to the feature, jump to a method you need to call, start changing it while the original change is pending — while a partner yells "Yeah, yeah, yeah! Fix that and then we'll do this." Pairs like that spend the last three quarters of an episode fixing what they broke in the first quarter, then saunter away feeling like heroes. Fun, sometimes — but is it worth it?

The alternative: you need to change a method, the class is in a test harness, and mid-edit you realize another method will need changing too. Your partner asks "What are you doing?", writes the other method's name on a piece of paper next to the computer, and you go back and finish the edit. Tests pass. Then you look at the other method, write a test, make that change, run the tests, integrate. Across the table, the pair still doing everything at once has been at it for hours and looks exhausted — and history says they'll fail integration and spend a few more hours together. The mantra: "Programming is the art of doing one thing at a time." When pairing, have your partner challenge you with "What are you doing?" — if the answer is more than one thing, pick one. It is simply faster: pick too big a chunk and you end up thrashing, trying things out, rather than working deliberately and really knowing what your code does.

### 23.3 Preserve Signatures

Refactoring is particularly error-prone — misspellings, wrong types, one variable meant where another was typed, and editing at a much larger scale than adding a line: copying code around, making new classes and methods. Tests are the general answer, but many systems require refactoring just to become testable enough to refactor more — the dependency-breaking techniques of Chapter 25 — and those initial refactorings are meant to be done without tests, so they must be particularly conservative. Feathers confesses his own overreach: extracting a method body to make it static (Expose Static Method), he also wrapped the arguments in `OrderBatch` and `CompensationTarget` helper classes — good intentions, foolish mistakes, and with no tests to catch them, errors found far later than they needed to be.

**Preserve Signatures** is the discipline: avoid changing signatures at all, so method declarations can be cut, copied, and pasted whole. The mechanic for extracting a method while keeping the argument list identical:

1. Copy the entire argument list into the paste buffer.
2. Type the new method declaration: `private void processOrders() { }`.
3. Paste the buffer into the declaration.
4. Type the call: `processOrders();`.
5. Paste the buffer into the call.
6. Delete the types, leaving the argument names.

```java
public void process(List orders, int dailyTarget,
                    double interestRate, int compensationPercent) {
    processOrders(orders, dailyTarget, interestRate, compensationPercent);
}

private static void processOrders(List orders, int dailyTarget,
                                  double interestRate, int compensationPercent) {
    ...
}
```

Once these moves become automatic, confidence shifts to the lingering issues that can still cause errors when breaking dependencies — for instance, whether the new method hides a same-signature method in a base class. The technique has a second use: creating a set of instance methods, one per argument, when doing Break Out Method Object.

### 23.4 Lean on the Compiler

A compiler translates source into another form, but in statically typed languages you can do much more: take advantage of type checking and use the compiler to identify the changes you need to make. **Lean on the Compiler** has two steps: alter a declaration to cause compile errors, then navigate to those errors and make changes. The example starts from C++ globals that need to come under test via Encapsulate Global References:

```cpp
class Exchange
{
public:
    double domestic_exchange_rate;
    double foreign_exchange_rate;
};
Exchange exchange;

// was: total = domestic_exchange_rate * instrument_shares;
total = exchange.domestic_exchange_rate * instrument_shares;
```

Compile, then fix every place the compiler can no longer find the bare names. The point is letting the compiler guide you toward the changes — not stopping your own thinking, but letting it do the legwork. Crucially, know what the compiler will find and what it won't, or you get lulled into false confidence. Beyond structural moves like encapsulating globals, the same trick initiates type changes: change a variable's declared type from a class to an interface and let the errors tell you which methods the interface needs. Leaning isn't always practical — with long builds, searching may be cheaper (Chapter 7 covers getting past that) — and done blindly it introduces subtle bugs.

Inheritance is the biggest hole. Comment out a `getX()` method in a Java class, recompile, and get no errors — which does not mean the method is unused: if `getX` is declared as a concrete method in a superclass, the superclass version silently takes over. The same can happen with variables. Know the limits, or the technique causes serious mistakes.

#### 23.4.1 Pair Programming

Pair programming is "a remarkably good way to increase quality and spread knowledge around a team" — if you use XP you probably already do it, and if you don't, try it. Feathers insists on pairing when using the dependency-breaking techniques: it is easy to make a mistake and have no idea you've broken the software, and a second set of eyes helps. "Working in legacy code is surgery, and doctors never operate alone."

## Key terms

- **Hyperaware editing**: knowing, for every keystroke, whether it changes the software's behavior — a flow state fostered by fast tests and by pairing, not a strain.
- **Single-goal editing**: doing exactly one thing per edit run — "Programming is the art of doing one thing at a time" — parking everything else, even on paper, until the current change is finished and tested.
- **Preserve Signatures**: when breaking dependencies without tests, avoid changing signatures at all; copy and paste whole argument lists so parameters cannot be mistyped.
- **Lean on the Compiler**: deliberately altering a declaration to cause compile errors and navigating error to error making changes — type checking used as a change-detection tool, with known limits around inheritance.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
