---
title: "This Class Is Too Big and I Don't Want It to Get Any Bigger"
book: legacy-code
chapter: 20
date: 2026-10-04
summary: "Big classes accrete one tweak at a time, costing clarity, parallel work, and testability; the remedy is the Single Responsibility Principle applied incrementally — seven heuristics for seeing the responsibilities already present in the code, then extracting classes as needed rather than in a binge."
tags: [legacy-code, refactoring, software-design, complexity]
---

> Big classes aren't designed; they accrete — one little tweak at a time, each justified by the data conveniently already on the class. The costs are confusion (50-60 methods, unknowable variable effects), scheduling (20 responsibilities means countless reasons to change, and concurrent programmers thrashing), and testing (too much encapsulation hides too much, and what hides rots). The remedy is the **Single Responsibility Principle**, but the hard part is seeing the responsibilities that are already there — seven heuristics help — and then extracting incrementally: implementation first, as needed, holding the ideal design loosely.

## The big idea

Feathers opens with a team whose architecture looked fine on paper and in UML — but in the code, each of their classes "could really be broken out into about 10," and doing so would get them past their most pressing problems. Three costs of big classes. **Confusion**: with 50-60 methods it is hard to know what to change and whether the change affects anything else, and classes with many instance variables make the effect of changing a variable nearly unknowable. **Task scheduling**: a class with 20 responsibilities has an incredible number of reasons to change, and several programmers needing to touch it in the same iteration thrash each other. **Testing pain**: classes too big hide too much; encapsulation that hides everything gives no way to sense the effects of change, so people fall back on **Edit and Pray** — "either changes take far too long or the bug count increases. You have to pay for the lack of clarity somehow."

The stopgaps come first: when you must change a big class, **Sprout Class** and **Sprout Method** (Chapter 6) keep it from getting worse, and sprouted method names are hints about how the class could eventually split. The key remedy is refactoring into sets of smaller classes — and the real problem is "figuring out what the smaller classes should look like." The **Single Responsibility Principle (SRP)** — "Every class should have a single responsibility: It should have a single purpose in the system, and there should be only one reason to change it" — is the guide, with one clarification: a responsibility is the *main purpose*, not one method. The `RuleParser` example, a class evaluating rule expressions in some obscure language, turns out to have four responsibilities: parsing, expression evaluation, term tokenization, and variable management. A from-scratch design separating all four might even be overkill — interpreters often evaluate as they parse, and a `SymbolTable` that only maps names to integers barely beats a hash table — and in any case it is "a castle in the sky": the real-world move is to identify the responsibilities and then incrementally move toward more focused ones.

### 20.1 Seeing Responsibilities

The RuleParser breakdown was done by rote: list the methods, ask "Why is this method here?" and "What is it doing for the class?", and group the ones with a similar reason for being there — **method grouping**. Learning to see responsibilities is a key design skill, and legacy code is arguably better practice ground than new features: the affected code and its context are real and right in front of you. The crucial stance: "we are not inventing responsibilities; we're just discovering what is there." Seven heuristics.

#### Heuristic #1: Group Methods

Write down all the methods with their access types and find ones that seem to go together. You do not have to categorize everything into new classes — identifying one or two responsibilities sitting a bit off to the side of the main one gives the code a direction; wait until you have to modify one of those methods, then decide whether to extract. Also a team exercise: poster boards of method names for the major classes, marked up over time, with the whole team hashing out which groupings are better.

#### Heuristic #2: Look at Hidden Methods

Many private or protected methods often mean "there is another class in the class dying to get out." The perpetual "how do I test private methods?" question dissolves: "if you have the urge to test a private method, the method shouldn't be private" — and if making it public bothers you, that is because it belongs to a separate responsibility. `RuleParser` has two public methods (`evaluate`, `addVariable`) and everything else private; making `nextTerm` and `hasMoreTerms` public on `RuleParser` would seem odd, but public on a `TermTokenizer` class is perfectly fine — and `RuleParser` is no less encapsulated, since it uses them privately.

#### Heuristic #3: Look for Decisions That Can Change

Method names don't tell the whole story: an `updateScreen()` might generate text, format it, and send it to several GUI objects — many levels of abstraction in one method. So extract methods before settling on classes to extract, hunting for decisions already made in the code: calls to a particular API, assumptions about a particular database. Extract methods named after the intent — "a method named after the information you are getting" — and two things happen: grouping gets easier, and you may find you have completely encapsulated some resource behind a set of methods, so extracting the class breaks dependencies on low-level details.

#### Heuristic #4: Look for Internal Relationships

Look for "lumping": instance variables used by some methods and not others (`variables` next to `addVariable` is an obvious start). The systematic tool is the **feature sketch**: a circle for each instance variable and each method, with lines from every method to the variables and methods it uses (constructors usually skipped). Feature sketches look like effect sketches (Chapter 11) with the arrows reversed — feature sketches point at what a method uses and map a class's internal structure; effect sketches point at what a change impacts and support reasoning forward. Both are disposable: ten minutes with a partner, then thrown away.

The `Reservation` example: the sketch clusters `duration`, `dailyRate`, `date`, and `customer` around `extend`, `extendForWeek`, and `getPrincipalFee`, with `fees`, `addFee`, `getAdditionalFees`, and `getTotalFee` in the other cluster — the only connection between clusters is `getTotalFee`'s call to `getPrincipalFee`, a **pinch point**. Two extraction directions: extract the reservation-fee cluster (hard to name — "Reservation" is taken), or flip it and extract a `FeeCalculator`, passing the principal fee in:

```java
public int getTotalFee() {
    int baseFee = getPrincipalFee();
    return calculator.getTotalFee(baseFee);
}
```

Moving `getPrincipalFee` itself would align names better, but it depends on several `Reservation` variables, so it stays. The larger lesson: feature sketches show dependency structure as well as responsibilities, "and that can often be just as important as responsibility when we are deciding what to extract." Circling groups of features turns the lines you cross into a new class's interface; forcing yourself to name each circle is design exploration and naming practice in one.

#### Heuristic #5: Look for the Primary Responsibility

Describe the class's responsibility in a single sentence, adding clauses as you think of what clients need — "The class does this, and this, and this, and that." If one thing dominates, that is the key responsibility and the rest should be factored out. SRP can be violated at two levels. At the interface level, a class (like `ScheduledJob`) presents an interface that looks like three or four classes. At the implementation level, the question is whether the class really does all that work or just delegates — and "the SRP violation that we care most about is... at the implementation level." A delegating class is a **facade**, a front end for little classes, and easier to manage. Fixing the interface level is harder: find groupings of methods that particular sets of clients use and give each grouping an interface — the **Interface Segregation Principle (ISP)** — so each client sees the big class through a narrow interface, information is hidden, and clients no longer have to recompile whenever the big class does. Then the delegation can flip: instead of `ScheduledJob` delegating to a `JobController`, a `JobController` wraps `ScheduledJob`, and clients that only run jobs hold controllers. "This sort of refactoring is nearly always tougher than it sounds" — the original class often has to expose more of itself, and client changes need tests — but it whittles the big interface down: `ScheduledJob` no longer carries the methods that live on `JobController`.

#### Heuristic #6: When All Else Fails, Do Some Scratch Refactoring

**Scratch refactoring** (Chapter 16) when nothing else works — remembering that it is an artificial exercise: what you see while scratching "are not necessarily the things you'll end up with when you refactor."

#### Heuristic #7: Focus on the Current Work

It is easy to be overwhelmed by the number of responsibilities you can identify in a class. The change you are making right now is telling you one particular way the software can change — and if you are providing a different way of doing anything, you have likely identified a responsibility to extract and allow substitution for.

### 20.2 Other Techniques

The heuristics are tricks. The way to really get better at identifying responsibilities is to read more: books about design patterns, and — more important — other people's code. Browse open-source projects and pay attention to how classes are named and how class names correspond to method names. Over time, hidden responsibilities start to be visible in unfamiliar code on sight.

### 20.3 Moving Forward

Once responsibilities are identified, two issues remain: strategy and tactics.

#### 20.3.1 Strategy

Should you take a week and whack every big class into little bits? A refactoring binge is risky: "in nearly every case that I've seen, when teams go on a large refactoring binge, system stability breaks down for a little while," even with care and tests. Fine early in a release cycle if the risk is accepted — just don't let the resulting bugs dissuade you from other refactoring. The best approach: identify the responsibilities, make sure everyone on the team understands them, and break the class down on an as-needed basis — the risk gets spread out and other work still gets done.

#### 20.3.2 Tactics

In most legacy systems the realistic first goal is SRP at the implementation level: extract classes from the big one and delegate. Interface-level SRP requires client changes and client tests; implementation-level SRP makes that easier later. The techniques depend on how easily you can get tests around the affected methods — start by listing the instance variables and methods that would move, which tells you which tests to write. For breaking a `TermTokenizer` out of `RuleParser`, that list is the `current` string, `currentPosition`, `hasMoreTerms`, and `nextTerm`; the last two are private, so either make them public (they are moving anyway) or instantiate `RuleParser`, feed it strings to evaluate, and get coverage of them that way. If the class cannot be instantiated, see Chapters 9 and 10; if tests are in place, use Fowler's Extract Class refactoring.

Without tests (and without a refactoring tool), a conservative seven-step procedure still works:

1. Identify the responsibility to separate into another class.
2. Move the instance variables that must go into a separate part of the class declaration, away from the others.
3. Extract the bodies of whole methods into new methods named after the originals with a unique common prefix — `MOVING` — preserving signatures, parked next to the variables.
4. Extract the parts of methods that should move, with the same prefix.
5. Text-search the class and all of its subclasses for uses of the variables to move. Deliberately do *not* lean on the compiler (Chapter 23) here: shadowing means a derived class can redeclare a variable with the same name, and commenting out a shadowed declaration just makes the shadowed one visible — the compiler will not find all the uses.
6. Move the variables and methods into the new class, instantiate it in the old one, and lean on the compiler to find call sites that must go through the instance.
7. Remove the `MOVING` prefix, leaning on the compiler to navigate.

The prefix dance exists because the subtlest extraction bugs are inheritance bugs. Move a method that overrides another and "all bets are off" — callers of the method on the original class now reach a same-named method from the base class; move a variable that hides a superclass variable and the hidden one becomes visible. Extracting bodies under fresh prefixed names instead of moving originals sidesteps both traps; the variables still need the manual search — "be very careful, and do it with a partner."

### 20.4 After Extract Class

Extracting classes is a good first step, and the biggest danger afterward is getting overambitious. Whatever ideal structure a scratch refactoring revealed, "the structure you have in your application works. It supports the functionality; it just might not be tuned toward moving forward." Sometimes the best move is to formulate a view of how the large class will look after refactoring and then *forget about it* — you did it to discover what is possible. To actually move forward, stay sensitive to what is there and move it "not necessarily toward the ideal design, but at least in a better direction."

## Key terms

- **Single Responsibility Principle (SRP)**: every class has a single purpose in the system and only one reason to change; it can be violated at the interface level (a sprawling interface) or the implementation level (really doing it all), and the implementation level is the one that matters most.
- **Interface Segregation Principle (ISP)**: give each grouping of clients an interface covering the methods it uses, so clients see the big class through a narrow interface — hiding information, reducing recompilation coupling, and enabling the big interface to be whittled down.
- **Method grouping**: listing a class's methods and grouping those with a similar reason to be there; the first heuristic for seeing responsibilities.
- **Feature sketch**: a disposable diagram of a class's internals — circles for methods and variables, lines for uses — that exposes clustering and pinch points; an effect sketch with the arrows reversed.
- **Facade**: a class that looks big at the interface level but merely delegates to smaller classes; an implementation-level improvement even while the interface-level SRP violation remains.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
