---
title: "Test Doubles"
book: swe-at-google
chapter: 13
date: 2026-10-01
summary: "Prefer real implementations, then fakes owned by the API team; stubbing and interaction testing are easy, brittle drugs — Google learned this the hard way and its pendulum swung away from mocking frameworks."
tags: [testing]
---

> A test double stands in for a real implementation the way a stunt double stands in for an actor. Google's hard-won ranking: use the real implementation when it's fast, deterministic, and simply constructed; otherwise a *fake* maintained by the API's owners; stubbing and interaction testing (the things mocking frameworks make trivially easy) are last resorts that leak implementation details into tests. The chapter is a confession: years of easy mockist tests produced suites that "required constant effort to maintain while rarely finding bugs."

## The big idea

Test doubles exist because production code rarely fits inside small tests — it talks across processes and machines — and doubles are lighter than reality, enabling fast, non-flaky suites. But they introduce three trade-offs: **testability** (the codebase must be designed with seams so doubles can be swapped in — retrofitting is a major commitment), **applicability** (improper use yields brittle, complex tests, magnified at scale; often real implementations are simply better), and **fidelity** (how closely the double resembles the real thing — a double that ignores data and always returns empty results tests nothing, yet perfect fidelity is usually infeasible and must be supplemented by larger-scope tests).

Google's historical arc is the chapter's argument. When mocking frameworks arrived, they "seemed like a hammer fit for every nail" — focused tests without worrying about constructing dependencies. Only after years and countless tests did the bill arrive: constant maintenance, rare bug-finding. The pendulum swung toward realism. This maps onto the classical-vs-mockist debate: Google practices **classical testing** (prefer real implementations) because mockist style "is difficult to scale" — it demands strict design discipline that an organization of tens of thousands of engineers won't sustain. The chapter's stance is the exact complement of Chapter 12's "test state, not interactions."

## Section by section

### 13.1 The Impact of Test Doubles on Software Development

Testability: code must allow swapping real implementations for doubles (a database caller must accept a non-database); designing this in early is cheap, retrofitting is a major refactoring commitment. Applicability: proper use boosts velocity, improper use makes tests brittle and ineffective — and the damage compounds across a large codebase. Fidelity: doubles that diverge from real behavior produce tests that pass while the production path is broken; unit tests using doubles generally need larger-scope tests exercising the real implementation as backup.

### 13.2 Test Doubles at Google

The mocking-framework story: initially effortless focused tests; years later, the cost — brittle, perpetually maintained, rarely bug-finding tests. Practices in this chapter are now generally agreed upon, but application still varies widely team to team, due to inconsistent knowledge, codebase inertia, and short-term convenience.

### 13.3 Basic Concepts

#### An Example Test Double

An e-commerce `PaymentProcessor` calls a `CreditCardService` — infeasible to use for real in tests ("imagine all the transaction fees from running the test!"). A trivial double implements the interface and always returns `true` from `chargeCreditCard`. Even that lets you test the expired-card path, which doesn't depend on the service's behavior at all: `makePayment(EXPIRED_CARD, AMOUNT)` returns false.

#### Seams

A **seam** is a way to make code testable by allowing different dependencies in tests than in production. The canonical technique is **dependency injection**: the class receives its dependencies rather than instantiating them — the constructor takes a `CreditCardService`, production passes the real one, the test passes the double. Automated DI frameworks (Guice and Dagger at Google) remove the constructor boilerplate. In dynamically typed languages (Python, JavaScript) you can monkey-patch functions at runtime, so DI matters less — you use the real implementation and override only the unsuitable methods. Writing testable code is an upfront investment, most critical early in a codebase's life.

#### Mocking Frameworks

A mocking framework is a library that creates doubles inline in the test — a **mock** is a double whose behavior is specified inline — avoiding a new class per double. The Mockito example: `@Mock CreditCardService` plus `when(mockCreditCardService.chargeCreditCard(any(), any())).thenReturn(false)`. Google's standards: Mockito for Java, googlemock (Googletest) for C++, unittest.mock for Python. Significant caveat repeated throughout: overuse makes codebases harder to maintain.

### 13.4 Techniques for Using Test Doubles

Three primary techniques:

- **Faking**: a lightweight *implementation* of an API that behaves like the real thing but isn't production-grade (in-memory database). Often ideal — but fakes must exist, and writing one is hard because it must track the real implementation's behavior now *and in the future*.
- **Stubbing**: hardcoding return values for a function that otherwise has no behavior — `when(mockAuthorizationService.lookupUser(USER_ID)).thenReturn(null)`. Quick and simple, with real limitations (Section 13.7).
- **Interaction testing**: validating *how* a function was called without calling its implementation — `verify(mockAuthorizationService).lookupUser(USER_ID)`. Useful in specific cases but brittle when overused. Note: this technique is what many people mean by "mocking," which is why the chapter avoids the word.

### 13.5 Real Implementations

First choice always: the real dependency, the same code production uses — higher fidelity, and "a good test should be independent of implementation," expressed in terms of the API rather than the code's structure. Arbitrary doubles isolate the system under test to whatever implementation the author happened to put in that one class.

#### Prefer Realism Over Isolation

Real dependencies execute the code your code will meet in production; too many doubles means an engineer needs integration tests or manual verification for the confidence unit tests should provide — extra tasks that slow development or get skipped, letting bugs through. When a bug in a real implementation fails your test, that's the system working: your code won't work in production either. Cascading failures from a shared real dependency are annoying but traceable with good CI.

#### Case Study: @DoNotMock

The ErrorProne `@DoNotMock` annotation lets API owners declare "this type should not be mocked because better alternatives exist" — typically for value objects simple enough to use as-is, and APIs with well-engineered fakes. The owner's motivation: every stub or verify duplicates behavior the API already provides. When the owner wants to change the API, they may find it mocked "thousands or even tens of thousands of times" — with doubles almost certainly violating the API contract somewhere (returning null from a method that can never return null). With real implementations or fakes, the owner could change the implementation without first fixing thousands of flawed tests.

#### How to Decide When to Use a Real Implementation

Use the real thing if it's fast, deterministic, and has simple dependencies — always true for value objects (money, dates, addresses, collections). Otherwise weigh:

- **Execution time**: no absolute threshold — 1ms per test is fine; 1s depends on whether engineers feel the drag and how many tests use it (fine for five tests, not 500). For borderline cases, use the real implementation until it's actually too slow, then switch. Parallelization trades CPU money for developer time; real dependencies also raise build times, which scalable build systems like Bazel mitigate by caching.
- **Determinism**: a deterministic test always passes or always fails for a given system version. Flakiness destroys trust (Chapter 11). Real implementations are more complex and hence more nondeterministic — multithreaded ones fail depending on thread ordering. Non-hermetic dependencies on external services fail when the server is overloaded or its page changes; if a double isn't feasible, use a hermetic instance whose lifecycle the test controls. System-clock dependence is a classic: replace with a double that hardcodes a time.
- **Dependency construction**: real implementations need their whole dependency tree — the nightmare `new Foo(new A(new B(new C()), new D()), new E(), ..., new Z())` versus Mockito's one-line `@Mock Foo mockFoo`. But the ideal isn't the mock: it's reusing production construction code — a factory method or automated DI — kept flexible enough to accept doubles.

### 13.6 Faking

If a real implementation won't work, a fake is usually best, because the system under test "shouldn't even be able to tell whether it is interacting with a real implementation or a fake." The example is a `FakeFileSystem` implementing the same `FileSystem` interface as production — files in a HashMap, and crucially throwing the same `FileNotFoundException` the real implementation throws.

#### Why Are Fakes Important?

One good fake "has the power to radically improve the testing experience of an API"; many fakes across an organization multiply velocity. Where fakes are rare, engineers suffer slow, flaky tests with real implementations or drift into stubbing and interaction testing with their unclear, brittle results.

#### When Should Fakes Be Written?

Fakes require domain experience and ongoing maintenance — every behavioral change to the real implementation must be mirrored — so the **team owning the real implementation should write and maintain the fake**. The trade-off: a handful of users may not justify it; hundreds make it an obvious win. Create fakes only at the *root* of what's infeasible in tests — a fake for the database API, not one per class that calls it. When a fake would need duplicating across client-library languages, run a single fake service process and point clients at it — heavier (cross-process) but reasonable if tests stay fast.

#### The Fidelity of Fakes

The central concept. A fake must primarily maintain fidelity to the **API contracts** of the real implementation: for any input, the same output and same state changes — if `database.save(itemId)` errors on a duplicate ID, the fake must too. The framing: "the fake must have perfect fidelity to the real implementation, but only from the perspective of the test." A fake hashing API needn't produce the real algorithm's exact values if tests only care that hashes are unique per input. Latency and resource consumption are usually legitimately divergent — but if you're explicitly testing those, a fake is the wrong tool. For unimplemented rare edge cases, **fail fast**: raise an error if an unsupported path executes, rather than silently misbehaving.

#### Fakes Should Be Tested

Without tests, a fake's behavior diverges as the real implementation evolves. The best technique: **contract tests** — a test suite against the API's public interface run against both real implementation and fake. The slow real-implementation runs fall only on the fake's owners.

#### What to Do If a Fake Is Not Available

Ask the API owners first (they may not know the concept or its value to users). Otherwise, wrap your API usage in one class and fake that class — simpler because you use only an API subset. Some Google teams have contributed their fakes back to API owners. Last resorts: live with real-implementation trade-offs, or other double techniques with their trade-offs. Think of a fake as an *optimization*: if the speedup doesn't outweigh building and maintaining it, stick with the real implementation.

### 13.7 Stubbing

Stubbing hardcodes behavior — `when(mockCreditCardServer.getTransactions()).thenReturn(TRANSACTION_1, TRANSACTION_2, TRANSACTION_3)` — and is so easy it gets overused.

#### The Dangers of Overusing Stubbing

- **Tests become unclear**: the extra stubbing code detracts from intent; a key warning sign is "mentally stepping through the system under test in order to understand why certain functions in the test are stubbed."
- **Tests become brittle**: stubbing leaks implementation details into the test; ideally a test changes only when user-facing behavior changes.
- **Tests become less effective**: `when(stubCalculator.add(1, 2)).thenReturn(3)` duplicates the real `add()` contract with no way to guarantee correctness — no fidelity. And stubs store no state: after `database.save(item)` on a real implementation or fake you can `database.get(item.id())`; with a stub you cannot.

The full-blown example: a payment test with five `when(...)` lines mirroring internal call sequences, ending in `verify(mockCreditCardServer).pay(...)` because "there is no way to tell if the pay() method actually carried out the transaction." The rewrite needs no setup — the credit card server "knows how to behave" — and asserts on state: `getMostRecentCharge(creditCard) == 500`. In practice that means a fake credit card server, or a hermetic real one at some speed cost.

#### When Is Stubbing Appropriate?

Not as a catch-all replacement, but to put the system under test into a state — returning a specific value or simulating an error a real implementation or fake can't easily trigger. Each stubbed function should have a direct relationship with the test's assertions; a test needing many stubs signals overuse or a system that should be refactored. Even when appropriate, reals and fakes are still preferred.

### 13.8 Interaction Testing

#### Prefer State Testing Over Interaction Testing

The sorting example makes the point brutally: the state test asserts `sortNumbers([3,1,2]) == [1,2,3]` regardless of which algorithm runs; the interaction test can only `verify(mockQuicksort).sort(...)` — it can never establish that the numbers actually sorted, merely that the system *tried*. Interaction testing embeds an assumption ("if `database.save(item)` is called, the item will be saved") that state testing actually validates. It also leaks implementation details, producing what Googlers jokingly call **change-detector tests** — they fail on any production change even when behavior is unchanged. Google's verdict: emphasizing state testing "is more scalable."

#### When Is Interaction Testing Appropriate?

- When state testing is impossible (real implementation too slow, no fake exists) — a fallback giving basic confidence.
- When the *number or order* of calls is itself the behavior — e.g. a caching feature should hit the database at most once: `verify(databaseReader, atMostOnce()).selectRecords()`.

Interaction testing can't replace state testing; if a unit test must use it, supplement with larger-scope tests that exercise the real dependency (next chapter).

#### Best Practices for Interaction Testing

- **Only for state-changing functions.** State-changing functions have side effects (`sendEmail()`, `saveRecord()`, `logAccess()`); non-state-changing ones just return information (`getUser()`, `findResults()`, `readFile()`). Verifying the latter is redundant — the system under test will use the return value in work you can assert on — and brittle. The example: verifying `addPermission(...)` is fine; also verifying the already-stubbed `getPermission(...)` is noise.
- **Avoid overspecification.** Verify the minimum needed for the behavior being tested: `verify(userPrompter).setText(eq("Fake User"), any(), any())` rather than pinning all three arguments plus an incidental `setIcon(IMAGE_SUNSHINE)` — split incidental behaviors into their own tests using `any()` for irrelevant arguments.

### 13.9 Conclusion

Test doubles are crucial to velocity — comprehensive testing, fast tests — yet misusing them drains productivity through unclear, brittle, ineffective tests. There's often no exact answer; trade-offs must be judged per case. And since doubles never exercise the real dependencies, maximum confidence eventually requires larger-scope testing — the next chapter.

### 13.10 TL;DRs

- A real implementation should be preferred over a test double.
- A fake is often the ideal solution if a real implementation can't be used in a test.
- Overuse of stubbing leads to tests that are unclear and brittle.
- Interaction testing should be avoided when possible: it leads to brittle tests because it exposes implementation details of the system under test.

## Key terms

- **Test double**: any object or function standing in for a real implementation in a test (the stunt-double analogy); "mocking" is avoided as an umbrella term because it also names a specific technique.
- **Seam**: a design provision (typically dependency injection) that lets tests substitute different dependencies than production uses.
- **Mock**: a test double whose behavior is specified inline in the test, usually via a mocking framework (Mockito, googlemock, unittest.mock).
- **Fake**: a lightweight but *real* implementation of an API — like an in-memory database — unsuitable for production but behaviorally faithful; ideally written and maintained by the API's owning team.
- **Stubbing**: hardcoding a function's return values inline in a test; useful for putting the system into a state, dangerous as a general dependency replacement.
- **Interaction testing**: verifying how a function was called (count, order, arguments) without executing it; fallback only, and only for state-changing functions.
- **Fidelity**: how closely a double's behavior matches the real implementation's; fakes need "perfect fidelity from the perspective of the test" — i.e., to the API contract.
- **Contract test**: a test suite against an API's public interface, run against both the real implementation and its fake to keep them in sync.
- **Classical vs. mockist testing**: preferring real implementations vs. preferring mocks; Google is firmly classical because mockist style doesn't scale organizationally.
- **@DoNotMock**: ErrorProne annotation by which API owners ban mocking of a type and point to real implementations or fakes.
- **Change-detector test**: a test that overuses interaction testing and fails on any production change, even behavior-preserving ones.
- **Hermetic instance**: a real server whose lifecycle is fully controlled by the test — an alternative when no fake exists.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
