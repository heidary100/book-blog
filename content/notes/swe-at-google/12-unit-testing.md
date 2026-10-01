---
title: "Unit Testing"
book: swe-at-google
chapter: 12
date: 2026-10-01
summary: "Unit tests dominate at Google (~80% of the mix) because they optimize engineer productivity — the chapter is a manual for test maintainability: unchanging tests, public APIs, state over interactions, behaviors over methods, DAMP over DRY."
tags: [testing]
---

> The unit test's superpower is productivity: small, fast, deterministic tests that run constantly and pinpoint failures. The chapter's core claim is that most test pain comes from *brittleness* and *unclearness*, and both are avoidable by discipline — test through the public API the way users would, assert on state rather than interactions, write one test per behavior with an explicit given/when/then structure, keep tests logic-free, and prefer DAMP (descriptive and meaningful phrases) over DRY when sharing code between tests.

## The big idea

Mary's story opens the chapter: she implements a feature in a couple dozen lines, then spends the rest of the day fixing test failures that reveal no actual bugs — just broken assumptions about internal structure — making hacks that make the tests even harder to understand next time. "Testing had the opposite of its intended effect," draining productivity without improving quality. The problem is structural, not personal: bad tests must be fixed before they're checked in, or they tax every future engineer. Google engineers run thousands of unit tests a day and a single large-scale change can trigger hundreds of thousands, so spurious breakages at even a small percentage waste enormous time.

The fix is organized around two failure modes. **Brittle tests** fail in the face of unrelated, bug-free changes to production code; the antidotes are unchanging tests, testing via public APIs, and testing state rather than interactions. **Unclear tests** make it hard to diagnose why they failed or why they existed; the antidotes are completeness and conciseness, behavior-oriented structure and naming, straight-line test code with no logic, and clear failure messages. A maintainable test is one that "just works": you never think about it until it fails, and the failure indicates a real bug with a clear cause. The unit-test-as-first-client argument parallels the broader design discussion in [Software Trends](/books/aposd/19-software-trends) — tests pressure you toward modular, decoupled design.

## Section by section

### 12.1 The Importance of Maintainability

Unit tests = relatively narrow scope (a class or method); usually small in size but not always. Their productivity advantages: fast and deterministic (immediate feedback), easy to write alongside the code (no system-wide setup), high coverage cheaply (change with confidence), easy failure diagnosis (each test conceptually simple), and documentation/examples of intended use. Hence the ~80/20 rule of thumb toward unit tests, and the focus of the rest of the chapter: maintainability.

### 12.2 Preventing Brittle Tests

A brittle test fails when an unrelated, bug-free change lands (distinct from a *flaky* test, which fails nondeterministically with no code change at all). If tests need manual tweaking for every change, calling the suite "automated" is a stretch.

#### Strive for Unchanging Tests

The ideal test never changes after being written, unless the system's requirements change. Map every production-code change against it:

- **Pure refactorings** — tests shouldn't change; their job is to prove behavior was preserved. A test that breaks during a refactor means either the change wasn't pure or the test was written at the wrong abstraction level. Especially important at Google, where large-scale changes (Chapter 22) automate refactoring across the codebase.
- **New features** — write new tests for new behaviors; existing tests shouldn't change.
- **Bug fixes** — the bug was a missing test case; add it. Existing tests shouldn't change.
- **Behavior changes** — the *only* case where you expect to update existing tests, and deliberately the most expensive: current behavior is what users rely on, so it needs coordination. Changing the test then means breaking an explicit contract; in the other three cases you were breaking an *unintended* contract.

This is what makes scale workable: expansion means writing a few new tests, not touching every test ever written against the system.

#### Test via Public APIs

"By far the most important" practice: invoke the system the way its users would. The book's transaction example contrasts a naive test calling private `isValid` and asserting on the serialized database string (`"me,you,100"`) — which breaks on renaming, extracting helpers, or changing the serialization format, all invisible to real users — with the same coverage through `setAccountBalance` / `processTransaction` / `getAccountBalance`. Public-API tests form *explicit contracts*: if one breaks, a real user breaks too. This is sometimes called the "Use the front door first principle."

What counts as "public" is the API exposed by the *unit* to parties outside the owning team — not necessarily the language's visibility (Java `public` classes within a unit; Python's underscore conventions; Bazel can further restrict). Rules of thumb for finding units:

- A helper class existing only to support one or two other classes isn't its own unit — test it through those classes.
- Anything accessible without consulting owners is a unit; test it as users would.
- An owner-internal but general-purpose "support library" is also a unit and should be tested directly, accepting some coverage redundancy — valuable insurance if one of its users (and tests) is ever removed.

Upfront effort pays for itself many times over in reduced maintenance; it won't eliminate brittleness, but it's the highest-leverage thing you can do.

#### Test State, Not Interactions

Two ways to verify a system: **state testing** observes the system itself after invoking it; **interaction testing** checks the sequence of calls it made on its collaborators. Interaction tests are brittle the same way private-method tests are: they check *how* a result was reached when you usually care only about the result. The book's example — `verify(database).put("foobar")` after `createUser` — fails in both directions: it passes if a bug deletes the record right after writing, and fails if a refactor writes through an equivalent different API. The state version, `assertThat(accounts.getUser("foobar")).isNotNull()`, expresses what's actually cared about. The main source of problematic interaction tests is over-reliance on mocking frameworks; prefer real objects whenever they are fast and deterministic (much more in Chapter 13).

### 12.3 Writing Clear Tests

Failures are good — they're the value delivery mechanism. A failure means either the system has a problem (working as designed) or the test itself is flawed (i.e., it's brittle). A *clear* test makes the purpose for existing and reason for failing immediately obvious. Clarity compounds over time: tests outlive their authors, and unlike unclear production code — whose purpose you can infer from callers — an unclear test reveals nothing when deleted except a subtle coverage hole. Worst case, obscure tests just get deleted, meaning they'd provided zero value for perhaps years.

#### Make Your Tests Complete and Concise

A test is **complete** when its body contains all the information needed to understand how it arrives at its result; **concise** when there's no distracting or irrelevant information. The cluttered version constructs `new Calculator(new RoundingStrategy(), "unused", ENABLE_COSINE_FEATURE, 0.01, calculusEngine, false)` and hides the actual input in a helper — the `isEqualTo(5)` is unexplained. The fixed version: `newCalculator()` hides irrelevant construction, and `newCalculation(2, Operation.PLUS, 3)` makes the input explicit. Sometimes completeness and conciseness pull against each other; the resolution is to surface what matters and hide what doesn't.

#### Test Behaviors, Not Methods

Matching test structure to method structure ("one test per method") degenerates as methods grow. A **behavior** is any guarantee a system makes about how it responds to a series of inputs while in a particular state; behaviors are expressible as given/when/then, and the method-to-behavior mapping is many-to-many. Instead of one `testDisplayTransactionResults` asserting both the purchase message and the low-balance warning (which grew when a second engineer piled on), split into `displayTransactionResults_showsItemName` and `displayTransactionResults_showsLowBalanceWarning`. Behavior-driven tests read like natural language, express cause and effect more clearly, and make it easy to see what's covered — encouraging new streamlined tests instead of accretion.

##### Structure Tests to Emphasize Behaviors

Make the given/when/then structure explicit — via comments or whitespace (Cucumber and Spock bake it in; the comments are also known as arrange/act/assert). This yields three reading levels: the method name for a rough description, the comments for a formal one, the code for the precise expression. The most common violation is interspersing assertions among multiple calls to the system (merging when and then), which obscures the action under test. Alternating when/then blocks are acceptable for validating steps of a multistep process (the connection-pool timeout example: connect two users, verify two connections, advance the clock 20 minutes, verify empty pool and both users disconnected) — but be careful not to test multiple behaviors at once; most tests need exactly one when and one then.

##### Name Tests After the Behavior Being Tested

The name is often the first or only token visible in a failure report — your best chance to communicate the problem. Good names describe the action and the expected outcome (plus relevant state). Jasmine-style nested `describe`/`it` strings, or verbose method names like `multiply_postiveAndNegative_returnsNegative` and `divide_byZero_throwsException` — verbosity that would be excessive in production code is warranted here since humans read these names in reports and nothing calls them. A good fallback: start the name with "should" so class + test reads as a sentence — `BankAccount shouldNotAllowWithdrawalsWhenBalanceIsEmpty`. Reading all the names should survey the system's behaviors; if you need "and" in a name, you're probably testing multiple behaviors.

#### Don't Put Logic in Tests

Clear tests are "trivially correct upon inspection." Test code can afford this because each test handles a particular input set; if you feel you need a test for your test, something has gone wrong. Logic — operators, loops, conditionals — forces mental computation instead of reading. The book's example hides a bug in one string concatenation: `baseUrl + "/albums"` built the expected URL while the actual expectation below had `...google.com//albums` with a double slash; writing the URL out fully makes the bug jump out (and shows why the test as written would pass through a real bug). Stick to straight-line code and tolerate duplication that makes the test more descriptive.

#### Write Clear Failure Messages

Ideally an engineer diagnoses from the failure message alone, without opening the test. A good message states expected outcome, actual outcome, and relevant parameters — "Expected an account in state CLOSED, but got account: <{name: "my-account", state: "OPEN"}>" versus the useless "Test failed: account is closed," which doesn't distinguish expected from actual. Assertion libraries help: JUnit's `assertTrue(colors.contains("orange"))` can only say "expected <true> but was <false>", while Google's Truth yields "<[red, green, blue]> should have contained <orange>" because it receives the assertion's subject. Where no library exists, say the important parts manually — Go convention: `t.Errorf("Add(2, 3) = %v, want %v", result, 5)`.

### 12.4 Tests and Code Sharing: DAMP, Not DRY

DRY (Don't Repeat Yourself) keeps every concept in one place, easing change — at the cost of readers following chains of references. For tests, the calculus flips: tests are meant to be stable (you *want* them to break when the system changes), so consolidation buys less, while complexity costs more (tests have no test suite protecting them). Aim for **DAMP** — "Descriptive And Meaningful Phrases": duplication is fine when it makes tests simpler and clearer. The over-DRY forum example (`createUsers`, `createForumAndRegisterUsers`, `validateForumAndUsers` helpers shared across many tests) hides everything in helpers — including a real bug in the looping validation logic — while the DAMP rewrite states each user, registration, and assertion inline. DAMP complements DRY rather than replacing it: helpers are still good for factoring out irrelevant repetitive details; the goal is descriptiveness, not repetition-reduction for its own sake.

#### Shared Values

Static shared constants (`ACCOUNT_1`, `ACCOUNT_2`, `ITEM`) make tests concise but force scrolling to confirm the values fit the scenario, and their easy reuse invites using a value whose name doesn't quite match what the test needs. Prefer **helper methods that construct data with sensible defaults**, with tests specifying only the values they care about — via named parameters where available, or the Builder pattern in Java (often with AutoValue):

```python
def newContact(firstName="Grace", lastName="Hopper", phoneNumber="555-123-4567"):
    return Contact(firstName, lastName, phoneNumber)
```

Each test then creates exactly what it needs without conflicts with other tests. (Footnote: slightly randomizing unset defaults prevents accidental equality between instances and hard-coded dependence on the defaults.)

#### Shared Setup

`setUp`/`@Before` methods are best for constructing the object under test and its collaborators when most tests don't care about construction arguments, and for stubbing default test-double return values. The risk is tests depending on setup's specific values — the test asserting the name "Donald Knuth" that was wired up hundreds of lines away is incomplete. If a test cares about a value, it should state it, overriding the default (`nameService.set("user1", "Margaret Hamilton")`) — a little more repetition, far more meaningful.

#### Shared Helpers and Validation

Beyond value-construction helpers, the dangerous pattern is a common `validate` method run at the end of every test: it makes tests less behavior-driven, obscures each test's intent, and spreads failures — one bug breaks many tests, hurting localization. The good pattern is a helper asserting **a single conceptual fact**, especially when that fact is conceptually simple but needs loops or conditionals to check, like `assertUserHasAccessToAccount(user, account)`, which scans the account's access list and fails with a descriptive message.

#### Defining Test Infrastructure

Sharing code across suites — test infrastructure — is different in kind: it has many dependents and is hard to change, making it more like production code than test code. It must be treated as its own product, and "test infrastructure must always have its own tests." Most teams should consume third-party infrastructure (JUnit etc.), and standardizing early and universally pays: Google mandated Mockito as the only mocking framework for new Java tests; the edict caused grumbling then, but is now universally seen as having made tests easier to understand and work with.

### 12.5 Conclusion

Unit tests are among the most powerful tools for keeping systems working in the face of unanticipated change — but careless use produces a system that takes more effort to maintain and change without improving confidence. Google's experience: tests following these practices are "orders of magnitude more valuable" than those that don't.

### 12.6 TL;DRs

- Strive for unchanging tests. / Test via public APIs. / Test state, not interactions.
- Make your tests complete and concise. / Test behaviors, not methods. / Structure tests to emphasize behaviors. / Name tests after the behavior being tested.
- Don't put logic in tests. / Write clear failure messages. / Follow DAMP over DRY when sharing code for tests.

## Key terms

- **Brittle test**: fails in response to an unrelated, bug-free production change (unlike a flaky test, which fails nondeterministically with no change at all).
- **Unchanging test**: the ideal — after writing, a test changes only when the system's requirements change; the four change types (refactoring, new feature, bug fix, behavior change) tell you when that should happen.
- **Use the front door first**: test through the public API of the unit (as exposed outside the owning team), so a test failure implies a user would break too.
- **State testing vs. interaction testing**: asserting on the system's state after invoking it, versus verifying the calls it made to collaborators. Prefer state; interactions check *how* the result was reached.
- **Complete and concise**: a test is complete when its body has everything needed to understand the result, concise when nothing distracting is present.
- **Behavior**: any guarantee about how the system responds to a series of inputs in a particular state; unit of test structure, expressed as given/when/then (arrange/act/assert).
- **DAMP vs. DRY**: tests should favor "Descriptive And Meaningful Phrases" — tolerate duplication that clarifies; DRY still applies to shared infrastructure, not within test bodies.
- **Test infrastructure**: code shared across test suites; product-like, needs its own tests, and should be standardized (one mocking framework per language).

## My takeaways
*Fill this in as you re-read and apply the chapter.*
