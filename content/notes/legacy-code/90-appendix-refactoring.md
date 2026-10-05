---
title: "Appendix: Refactoring"
book: legacy-code
chapter: 90
date: 2026-10-04
summary: "Refactoring preserves behavior where feature change does not; Extract Method, the workhorse refactoring, breaks oversized methods into named pieces in small, compiler-checked, test-verified steps."
tags: [refactoring, legacy-code, testing]
---

> Refactoring changes a program's structure without changing what it does; adding a feature or fixing a bug deliberately changes behavior. That distinction is what makes refactoring the safe half of every legacy change, and this appendix distills the practice to its workhorse, **Extract Method**: with tests in place, a large method comes apart in small, verifiable steps. The same moves without tests are a different and riskier activity — which is why the book keeps those in a separate catalog.

## The big idea

The appendix is built on a contrast, not a definition dump. A refactoring is a behavior-preserving structural change: the tests that held before it hold after it, so risk is contained to your own discipline. A feature change is the opposite — its whole purpose is to alter behavior, which is why the book's change algorithm puts characterization tests in place *before* the "make changes and refactor" step. Feathers defers the full catalog to Martin Fowler's *Refactoring* (Addison-Wesley, 1999), which covers "the kind of refactoring you can do when you have tests in place," and presents only Extract Method here — enough to convey what the mechanics feel like.

Without a test safety net, refactoring degenerates into **Edit and Pray**; with one, it becomes **Cover and Modify**. That is why refactoring without tests is a different, riskier craft: every step rests on hyperawareness instead of verification. The book's answer when tests are impossible is [Chapter 25's dependency-breaking techniques](/books/legacy-code/25-dependency-breaking-techniques) — a special catalog of refactoring steps designed to be applied conservatively *without* tests, precisely to make testing possible afterward.

## Section by section

### 90.1 Extract Method

The intent: methods in poorly maintained code bases only grow. People keep adding logic to existing methods until one does two or three distinct things for its callers — in pathological cases, tens or hundreds. Extract Method is the remedy: systematically break a large method into smaller ones, making the code easier to understand and yielding pieces you can reuse instead of duplicating logic elsewhere.

The mechanics, for a method your tests thoroughly exercise:

1. Identify the code to extract, and comment it out.
2. Think of a name for the new method and create it as an empty method.
3. Place a call to the new method in the old one.
4. Copy the extracted code into the new method.
5. **Lean on the Compiler** to find out what parameters you have to pass and what values you have to return.
6. Adjust the method declaration to accommodate the parameters and return value, if any.
7. Run your tests.
8. Delete the commented-out code.

Step 5 is where the variables-to-parameters rule comes from. Copied code almost never compiles in its new home: it uses locals from the old scope. The fix is mechanical — each variable the fragment reads becomes a parameter, and a value the fragment contributes to a caller's local (you are computing only part of `result`) becomes the return value. In the `Reservation` example, the premium-fee branch of `calculateHandlingFee` is needed elsewhere in the system, so it is extracted rather than duplicated:

```java
public int calculateHandlingFee(int amount) {
    int result = 0;
    if (amount < 100) {
        result += getBaseFee(amount);
    } else {
        result += getPremiumFee(amount);
    }
    return result;
}

int getPremiumFee(int amount) {
    return (amount * PREMIUM_RATE_ADJ) + SURCHARGE;
}
```

The small-steps discipline is the point of the odd-looking steps. Commenting out the original (Feathers admits it is not strictly necessary) means a failed test leaves you one edit from green: restore the code, get the test passing, try again — never debug a half-moved method and a leftover copy at the same time. Tests run *before* the commented code is deleted, so the cleanup happens only once behavior is proven preserved. With an automated refactoring tool the whole sequence collapses to a selection and a menu choice, but the tool enforces the same invariant. Extract Method is the core technique for legacy work: use it to extract duplication, separate responsibilities, and break down long methods.

## Key terms

- **Refactoring**: a change to code's structure that preserves its behavior, done in small verified steps so each one can be checked.
- **Extract Method**: the refactoring that turns a fragment of a method into a new named method, passing in what the fragment reads and returning what it computes.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
