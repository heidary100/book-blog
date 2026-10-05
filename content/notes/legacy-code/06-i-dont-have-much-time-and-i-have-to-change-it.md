---
title: "I Don't Have Much Time and I Have to Change It"
book: legacy-code
chapter: 6
date: 2026-10-04
summary: "When there is no time to get tests in first, four guerrilla tactics — sprout method, sprout class, wrap method, wrap class — add fresh, test-driven code to an untested class at a single attachment point; stepping stones toward tests, not a way of life."
tags: [legacy-code, refactoring, testing, design-process]
---

> The chapter answers the oldest objection to the legacy-code discipline: "I don't have time." The honest arithmetic says you usually do — changes cluster, and tests repay themselves in debugging and comprehension — but when you genuinely cannot get a class under test now, you can still add functionality as fresh, test-driven code attached to the untested code at a single point. Sprout a method or a class, wrap a method or a class: each tactic buys immediate safety at some design cost, and all of them are stepping stones toward tests, not a way of life.

## The big idea

The dilemma is real: pay now (break dependencies, write tests) or pay more later (live with code that keeps getting tougher). Feathers' answer to the accounting objection — "I spent two hours testing a fifteen-minute change" — is that the counterfactual is invisible: you don't know how long the untested change would have taken to debug, and changes cluster in systems, so code you are touching today is code you will revisit soon. The team experiment makes the value visceral: for one iteration, no change goes in without a covering test, and anyone who believes a test is impossible must call a quick group meeting to find out. The early days feel terrible; then changes get easier and people know in their gut that "we aren't going back to that again." And the boss scenario — feature needed by 5:00, ten inline edits, "we're going to fix this tomorrow, aren't we?" — ends with the book's line: "Remember, code is your house, and you have to live in it."

When getting the class into a test harness is genuinely unaffordable (try Chapters 9 and 10 first), scrutinize the change itself: can it be written as fresh code? The four tactics that follow share one property, the source of both their power and their danger: they add tested code into the system without testing the code that calls it. Use them with caution — and note the quiet design story: several of them put distance between new and old responsibilities, which is movement toward better design even while the old class stays untouched.

## Section by section

### 6.1 Sprout Method

When a change can be formulated completely as new code, write it in a new method and call it from the places where the functionality is needed. The example: `TransactionGate.postEntries` must skip entries already in `transactionBundle`. The inline fix mingles date posting with duplicate detection, muddies the method, and introduces a temporary variable that tends to attract more code — the next change touching nonduplicated entries has exactly one place to land. The sprouted alternative treats duplicate removal as a separate operation, developed with TDD:

```java
List uniqueEntries(List entries) {
    List result = new ArrayList();
    for (Iterator it = entries.iterator(); it.hasNext(); ) {
        Entry entry = (Entry)it.next();
        if (!transactionBundle.getListManager().hasEntry(entry)) {
            result.add(entry);
        }
    }
    return result;
}
```

`postEntries` then opens with `List entriesToAdd = uniqueEntries(entries);` and the rest is untouched. The steps:

1. Identify where you need to make the change.
2. If it can be a single sequence of statements in one place, write the call to a new method and comment it out — Feathers does this first, to see the call in context before writing the method.
3. Determine what local variables the sprout needs; make them arguments.
4. Determine whether it must return values; if so, assign the call's result.
5. Develop the sprout method using test-driven development.
6. Remove the comment to enable the call.

If the class's dependencies are so bad you cannot instantiate it even for a sprout, try **Pass Null**, or make the sprout a public static method, passing instance data as arguments. Statics on a class are a staging area: once several statics share variables, a new class is waiting to be noticed, and methods that really belong on the original class can move back when it is finally under test.

#### 6.1.1 Advantages and Disadvantages

The disadvantage is a small surrender: using Sprout Method says you are giving up on the source method and its class for the moment — no tests, no improvement, just new functionality off to the side. The source method is left in limbo: complicated code with one odd sprout, and it isn't clear why only that work happens elsewhere (though that oddness points at work to do once the class is under test). The advantages: clear separation of new code from old with a clean interface between them, and full visibility of the variables affected, which makes it easier to judge whether the code is right in context. It is far preferable to adding code inline.

### 6.2 Sprout Class

When the source class cannot be instantiated in a harness in a reasonable amount of time — a large set of creational dependencies, or hidden dependencies that would take invasive refactoring to untangle — create another class to hold the change and call it from the source. The example is a C++ `QuarterlyReportGenerator::generate()` that builds an HTML report string; adding a table header row would take about a day of dependency breaking to test, so the change becomes a tiny class developed test-first:

```cpp
class QuarterlyReportTableHeaderProducer {
public:
    string makeHeader();
};

// in QuarterlyReportGenerator::generate():
QuarterlyReportTableHeaderProducer producer;
pageText += producer.makeHeader();
```

Feathers anticipates the reaction — "It's ridiculous to create a class for this change!" — and then reframes it: rename the class `QuarterlyReportTableHeaderGenerator`, give it a `generate()` method, and extract an `HTMLGenerator` interface that both it and `QuarterlyReportGenerator` implement. Now the sprout folds into a concept the application already has, and later the generator itself may be reworked to use generator classes throughout. Some sprouted classes never fold back into existing concepts — they become new ones; you notice the similarity only when you sprout again, and the decision often looks better in retrospect. Two cases lead here: the change adds an entirely new responsibility to an existing class (a season-of-year check bolted onto `TaxCalculator`), or the class cannot even compile into a harness for a sprout method — and there is no hard line between them, since "is this a real new responsibility?" is a judgment call. The steps parallel Sprout Method, with needed locals passed to the sprout class's constructor and return values supplied by a method on it.

#### 6.2.1 Advantages and Disadvantages

The key advantage: you move forward with more confidence than invasive changes to untested code allow. In C++ there is a bonus — no existing header files have to be modified (include the new header from the source's implementation file), and over time the new header absorbs declarations that would otherwise have landed in the source class's header, decreasing its compilation load. At minimum you know you are not making a bad situation worse. The key disadvantage is conceptual complexity: as programmers learn a code base they build a sense of how the key classes work together, and sprouting starts to gut the abstractions by moving the bulk of the work into other classes. Sometimes that is entirely right; sometimes it happens only because your back is against the wall.

### 6.3 Wrap Method

Adding behavior to an existing method is easy but often wrong. When you first create a method it does one thing for a client; later additions are suspicious — code grouped only because it has to execute at the same time, which the early days of programming named **temporal coupling**. The relationship between such code is weak, and later, when one of the behaviors must happen without the other, separating them without a seam is hard work. The example: `Employee.pay()` sums timecards and dispatches payment; a new requirement says every payment must be logged for reporting. Instead of editing `pay()`, rename it `dispatchPayment()` (private) and create a new `pay()` with the old name and signature:

```java
public void pay() {
    logPayment();
    dispatchPayment();
}
```

Clients who called `pay()` never know or care — everything works as before, with logging added. A second form applies when you just want a new method nobody calls yet: `makeLoggedPayment()` calls `logPayment()` and then `pay()`, leaving callers free to pay either way (described by Kent Beck in *Smalltalk Patterns: Best Practices*). Steps for the first form: identify the method; if the change is a single sequence of statements in one place, rename the method and create a new one with the old name and signature (Preserve Signatures); place a call to the old method in the new one; develop the new feature test-first and call it from the new method. Second form: develop the new method test-first, then create another method that calls the new method and the old.

#### 6.3.1 Advantages and Disadvantages

Wrap Method is a great way to introduce **seams** while adding new features, and unlike sprouting it does not make any existing method longer by even one line. It also makes the new functionality explicitly independent of the old — you are not intertwining code for one purpose with code for another. Downsides: the new behavior cannot be intertwined with the old (it runs entirely before or after — which is really a virtue; do it when you can), and naming. Renaming `pay()` to `dispatchPayment()` is a stretch — that method calculates pay too. If the code isn't too brittle for a refactoring tool, further extraction leads somewhere better:

```java
public void pay() {
    logPayment();
    Money amount = calculatePay();
    dispatchPayment(amount);
}
```

That reads as a new, higher-level algorithm rather than a tangle — often the real payoff of choosing wrap over sprout.

### 6.4 Wrap Class

The class-level companion: add behavior in another class that uses the method you need to change. Two shapes. The decorator-ish shape: `LoggingEmployee` holds an `Employee` (use Extract Implementer or Extract Interface on `Employee` if you cannot instantiate it in a harness) and logs inside its own `pay()` before delegating:

```java
class LoggingEmployee extends Employee {
    public LoggingEmployee(Employee e) { employee = e; }
    public void pay() {
        logPayment();
        employee.pay();
    }
}
```

The wrapper has the same interface as the wrapped class, so clients don't know they are working with a wrapper.

#### The Decorator Pattern

The **decorator pattern** composes behavior at runtime instead of enumerating subclasses. The book's example is a `ToolController` with `raise()`, `lower()`, `step()`, `on()`, and `off()`, facing an endless stream of "also do X" requirements — alarms on movement, turn counts, neighbor notifications — where a subclass per combination is hopeless. An abstract `ToolControllerDecorator` holds a wrapped controller and delegates every operation; subclasses override only the operations they augment, and decorators nest:

```java
ToolController controller = new StepNotifyingController(
    new AlarmingController(new ACMEController()), notifyees);
```

A `step()` call notifies the notifyees, sounds the alarm, and finally performs the step in `ACMEController` — you always need at least one "basic" concrete class that actually does the work rather than passing the buck. Use decorators sparingly: navigating code where decorators decorate other decorators is "a lot like peeling away the layers of an onion. It is necessary work, but it does make your eyes water."

The non-decorator shape is for new behavior needed in only one or two places: a plain wrapper class such as `LoggingPayDispatcher`, which accepts an employee, pays, and logs, instantiated just where it is needed. Rule of thumb: many existing callers favor decorator-style wrapping, which transparently adds behavior to all of them at once; a couple of call sites favor a plain wrapper. Two cases tip Feathers toward Wrap Class at all: the new behavior is completely independent and shouldn't pollute the existing class with low-level or unrelated work, or the class has grown so large he can't stand to make it worse — wrapping "to put a stake in the ground and provide a roadmap for later changes." Wrapping a 15-responsibility class to add a trivial feature looks silly at first, and Feathers makes the morale case directly: the biggest obstacle to improvement in large code bases is not the difficulty of the code but what it leads you to believe — that it will always be ugly and no small improvement is worth it. Consistent small improvements compound: a couple of months in, you arrive expecting slime and find that the code looks pretty good, "like someone was in here refactoring recently" — and once you feel the difference between good and bad code in your gut, you are a changed person.

### 6.5 Summary

The techniques let you make changes without getting existing classes under test, and the design verdict is honestly mixed: sometimes they put distance between distinct new responsibilities and old ones — movement toward better design; sometimes classes and methods exist only because writing tested new code was cheaper than getting the old class under test. The key claim: "you start to see new classes and methods sprouting around the carcasses of the old big classes. But then an interesting thing happens" — people get tired of side-stepping the carcasses and start to get them under test, pushed by familiarity (sprouting from the same big class repeatedly forces you to read it; it gets less scary) and by sheer tiredness of looking at the trash in your living room. Chapters 9 and 20 are where that work starts.

## Key terms

- **Sprout Method**: adding a feature as a new method developed test-first, called from the one place in an existing untested method that needs it.
- **Sprout Class**: adding a feature as a new class developed test-first when the source class cannot be instantiated in a test harness; the source calls it at a single point.
- **Wrap Method**: renaming an existing method and replacing it with a same-signature method that does the new work and calls the old — or adding a new method that composes old and new behavior.
- **Wrap Class**: adding behavior in a wrapper class that holds the original object; decorator-style when many existing callers must see the new behavior, plain wrapper otherwise.
- **Temporal coupling**: code grouped into one method only because it must execute at the same time; weakly related behaviors that become painful to separate without a seam.
- **Decorator pattern**: composing behavior at runtime by nesting wrappers sharing the wrapped object's interface; at least one concrete "basic" class does the real work.
- **Pass Null**: passing `null` for a hard-to-construct constructor argument so an object can be created in a test harness.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
