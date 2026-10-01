---
title: "Larger Testing"
book: swe-at-google
chapter: 14
date: 2026-10-01
summary: "Large tests exist for fidelity — covering exactly what unit tests can't (unfaithful doubles, configuration, load, unanticipated behavior) — built from SUT + data + actions + verification, and needing ownership, strategy, and deliberate de-flaking."
tags: [testing]
---

> Larger tests exist primarily for **fidelity**: faithfulness to how the system actually behaves in production. Unit tests fail to mitigate five risk categories — unfaithful doubles, configuration, load, unanticipated behaviors (Hyrum's Law), and emergent effects — so large tests fill those gaps at the cost of being slow, nonhermetic, and flaky. The craft is composing a system under test, seeded data, actions, and verification; keeping the SUT as small as fidelity allows; and giving every large test an owner, because "without clear ownership, a test rots."

## The big idea

The chapter reframes why we leave the unit-test sandbox. A unit test is like "a problem in theoretical physics: ensconced in a vacuum" — its speed and reliability come precisely from eliminating real dependencies, networks, and data, but that vacuum hides whole defect categories. Configuration changes are Google's *number one* cause of major outages (including a global 2013 outage from an untested network configuration push); no unit test catches a bad startup config. And low-fidelity doubles compound: if each of N doubled services is only (1−ε) faithful, the chance of a bug when the system is assembled is exponential in N — two 10%-accurate doubles alone mean a 99% chance of a bug.The response is a portfolio, not a monolith. A large test composes four parts — the **system under test (SUT)**, **data**, **actions**, and **verification** — and different compositions yield the catalog: functional, A/B diff, probers, chaos engineering, each mitigating specific risks. The strategic layer matters as much as the tests: a *test plan* names the risk vectors and which tests mitigate them, and every test needs a documented owner. A/B diff testing is the workhorse — "a cheap but automatable way to detect unanticipated side effects for any launched system" — and has run at Google since 2001.

## Section by section

### 14.1 What Are Larger Tests?

Anything not bound by small-test constraints: they may be **slow** (15-minute/1-hour defaults; some run for days), **nonhermetic** (sharing resources with other tests and traffic), and **nondeterministic** (nonhermetic tests are almost impossible to make deterministic). Why bother? Unit tests give confidence about functions and modules; large tests give confidence the *overall system* works — including across upgrades (a new Maps API version is invisible to unit tests) — and automated tests scale where manual checking doesn't.

#### Fidelity

How reflectively a test matches real behavior of the SUT. Environmentally there's a spectrum from unit test (test + small code portion bundled, very unlike production) to production itself — highest fidelity, highest cost and risk. Content fidelity matters too: handcrafted data looks unrealistic and "tends to conform to the biases of the author"; production-copied data is more faithful, but generating realistic traffic *before* launch is hard — especially in AI, where seed data carries intrinsic bias. The uncovered scenarios are the **fidelity gap**.

#### Common Gaps in Unit Tests

Where unit tests can't mitigate risk:

- **Unfaithful doubles**: mocks encode the test author's belief about a peer's behavior — but the contract between units is behavioral, and a mistaken engineer invalidates it. Mocks also go stale silently: if the mock isn't visible to the real implementation's owner, changes produce no signal. (Owner-maintained fakes, per Chapter 13, mostly solve this.)
- **Configuration issues**: binaries depend on deployment configs, starter scripts, and config stores — written in config languages, rolled out faster than binaries, harder to test: hence the top outage cause. Keeping configuration in version control makes changes identifiable as bug sources rather than "random external flakiness."
- **Issues that arise under load**: performance/load/stress behavior needs thousands or millions of QPS; unit tests can't model it.
- **Unanticipated behaviors, inputs, and side effects**: unit tests are bounded by their author's imagination, but user-found bugs are mostly unanticipated. Hyrum's Law: the effective user contract covers *all visible behaviors*, not the stated one.
- **Emergent behaviors and the "vacuum effect"**: behavior changes outside a unit test's scope go undetected, and eliminating real-world chaos hides emergent defects.

#### Why Not Have Larger Tests?

Developer-friendly tests are reliable, fast, and scalable — larger tests often violate all three: more infrastructure means more flakiness, setup and execution are slow, and they scale poorly (resource-heavy and prone to colliding with one another). Two structural challenges: **ownership** (a large test spans units and thus owners — who maintains it, who diagnoses failures?) and **standardization** (unit-test infra is uniform; large tests are products of each system's architecture — Ads' A/B diff testing is nothing like Search's or Drive's). Non-standard tests get skipped during large-scale changes, force unifying incompatible infrastructures for cross-team tests, and can't be taught to new hires — perpetuating the situation.

#### Larger Tests at Google

Large tests predate the unit-test era: AdWords' end-to-end scenario test (2001), Search's indexing "regression test" (2002), AdSense's variant, manual QA for the search frontend, Gmail's scripted "local demo" environment. The unit-vs-other split came when TAP replaced C/J Build: TAP only accepted hermetic, single-change, time-bounded tests — which unit tests are and large tests mostly aren't — so large tests kept needing separate infrastructure (C/J Build lingered for years just to run them).

#### Larger Tests and Time

Appropriate test types change with expected lifespan: minutes-long scripts get manual testing against a local "production"; unit tests make sense from hours upward; larger tests add value for longer-lived software, but test *maintainability* becomes the main concern. This dynamic also explains the **ice cream cone** antipattern: a prototype is tested by running it, features accrete, it gets shared — "we have inadvertently created 'legacy code' within days," and if it's hard to unit test, only end-to-end tests can be written. The fix: move to the test pyramid within the first few days — build unit tests, then add automated integration tests and retire manual E2E.

#### Larger Tests at Google Scale

Model the system as a graph of N nodes: each added node multiplies the distinct execution paths, so end-to-end scenario coverage grows combinatorially and "does not scale." Yet large tests become *more* valuable at scale because of the fidelity math above — hence strategies that work at scale while keeping fidelity reasonably high.

#### Tip: "The Smallest Possible Test"

Even for integration tests, smaller is better — a handful of large tests beats one enormous one. Since test scope is coupled to SUT scope, shrink the SUT. One pattern for user journeys spanning many systems: **chaining** — not execution order, but multiple pairwise integration tests where each test's output is persisted and becomes the next test's input.

### 14.2 Structure of a Large Test

Most large tests follow a four-phase workflow: obtain a SUT, seed necessary test data, perform actions, verify behaviors.

#### The System Under Test

The SUT's scope drives the test's scope. Judge each SUT form on two factors in direct conflict: **hermeticity** (isolation from other users and interactions — the guard against concurrency and infrastructure flakiness) and **fidelity** (resemblance to production binaries, configurations, infrastructure, topology).

- **Single-process SUT**: everything, test included, in one binary — can be a "small" test; least faithful to production topology.
- **Single-machine SUT**: production binaries plus test binary on one machine ("medium" tests), ideally launched with production configurations.
- **Multimachine SUT**: like a cloud deployment — high fidelity, "large" size, exposed to network and machine flakiness.
- **Shared environments (staging and production)**: cheapest (they exist) but conflict-prone, gated on code being pushed, and production risks end-user impact.
- **Hybrids**: run what you're testing, share the backends — at Google's scale, running copies of every interconnected service is impossible.

**Why hermetic SUTs win**: production tests can only run *after* code reaches production (too late to block the release), and shared staging either gates testing on release promotion or degenerates into reservation scheduling that doesn't scale. Cloud-isolated, machine-hermetic SUTs avoid both.

**Case study: Webdriver Torso.** To verify YouTube video rendering in production, Google auto-generated test videos on a public channel — which Wired publicized and the internet turned into a mystery before Google came clean (with a Rickroll). Lesson: assume end users will discover any test data you put in production.

**Reducing the SUT at problem boundaries.** Two boundaries are especially painful. UI↔backend: UI tests are brittle (look-and-feel churn that doesn't affect behavior) and asynchronous; instead split at the UI/API boundary and drive end-to-end tests through the public API — true for browser, CLI, desktop, or mobile. Third-party dependencies: no shared test environment, possible per-call costs — never let automated tests hit a real third-party API; that seam is where to split. Then shrink concretely: swap databases for in-memory ones, drop servers outside the scope you care about, aim to fit the SUT on the machines that already do builds and unit tests.

**Record/replay proxies.** Rather than hand-building server doubles whose fidelity is unguaranteed, Google records traffic to real services during a continuously-run post-submit "Record Mode" test, then replays it in "Replay Mode" during development and presubmit. Nondeterminism means recorded responses are matched by request matchers — similar to stubs/mocks, but grounded in captured behavior. When client behavior changes enough that requests no longer match, the engineer re-records, so Record mode must be easy, fast, and stable. (Outside Google the analogous idea is consumer-driven contract testing — Pact, Spring Cloud Contracts — which Google skips due to protocol buffers.)

#### Test Data

Two kinds: **seeded data** (preinitialized SUT state) and **test traffic** (what the test sends while running). Seeding is orders of magnitude more complex than unit-test setup: **domain data** (binaries may fail startup without prepopulated config tables), **realistic baselines** (a social-network test needs a plausible social graph — enough users, profiles, and interconnections), and **seeding APIs** (writing directly to the datastore can bypass the triggers and checks the real binaries perform). Generation: handcrafted (fine, but a lot of work across services), copied from production (faithful — e.g., starting from the real map of Earth), and **sampled**, with "smart sampling" copying the minimum data needed for maximum coverage.

#### Verification

Three ways: **manual** (scripted regression plans or exploratory paths — but manual regression doesn't scale sublinearly), **assertions** (explicit checks like `assertThat(response.Contains("Colossal Cave"))`), and **A/B comparison (differential)** — two SUT copies, same data, diffed outputs, with a human reconciling differences because intent isn't explicitly encoded.

### 14.3 Types of Larger Tests

Each composition of SUT, data, and verification mitigates different risks at different cost. A test plan should outline which types are needed and in what proportion — at Google, outlining test strategy is a core skill of the dedicated **Test Engineer** role.

- **Functional testing of one or more interacting binaries** (single-machine hermetic or cloud-isolated; handcrafted data; assertions): unit tests can't test a system with true fidelity because they package code differently than production; multi-binary tests bring up the relevant services and interact through a published API — the microservices workhorse.
- **Browser and device testing**: functional testing specialized to web/mobile UIs; for end users the public API *is* the application, so frontend third-party tests add a coverage layer.
- **Performance, load, and stress testing** (cloud-isolated; handcrafted or production-multiplexed data; metric diffs): load handling is a "highly emergent" property, so the SUT must look like production; topology noise is real — baseline on a fast machine and candidate on a slow one *looks* like a regression — so run both versions on the same machine, or calibrate with multiple runs minus peaks and valleys.
- **Deployment configuration testing** (hermetic SUT; no data; assert-it-doesn't-crash): a smoke test that the binary actually launches with its real configuration files.
- **Exploratory testing** (production/staging; production data; manual): trained testers probe new user scenarios for unexpected behavior and security holes — "a bit like a manual 'fuzz testing' version of functional integration testing." Doesn't scale sublinearly; found bugs must become automated tests. The **bug bash** institutionalizes it: a scheduled session where engineers, PMs, and managers hammer the product against published focus areas.
- **A/B diff (regression) testing** (two cloud-isolated environments; production-multiplexed or sampled data; A/B diff): send traffic to a public API and compare old vs. new binaries, a third binary driving and comparing. Variants: **A-A** (system against itself — surfaces nondeterminism and noise), **A-B-C** (last production, baseline, pending change — immediate plus accumulated impact). Limits: diffs need human judgment, noise must be remediated, corner-case traffic is hard to curate, and two SUTs can double setup complexity.
- **User acceptance testing (UAT)** (hermetic or cloud-isolated; handcrafted data; assertions): unit tests written by the developer verify "working as implemented," not "working as intended"; UATs exercise user journeys through public APIs, often as runnable specifications (Cucumber, RSpec). Google does little of this — its products' intended behavior is defined by engineers fluent in the coding languages already.
- **Probers and canary analysis** (production; production data; assertions and metric diffs): probers are read-only functional assertions against live production — a search returns results, without checking *which* — production smoke tests with early detection. Canary analysis runs probers and compares health metrics on the upgraded subset during staged rollouts. Limits: anything caught is already affecting users, and a prober that writes can corrupt production state or fail nondeterministically.
- **Disaster recovery and chaos engineering** (production; fault injection; manual verification and metric diffs): Google's annual **DiRT** war game injects planetary-scale faults — datacenter fires, malicious attacks, once a simulated earthquake isolating Mountain View HQ (exposing technical gaps *and* the difficulty of running a company when decision-makers were unreachable — and DDoS-ing the cafes as everyone gave up on work). **Chaos engineering** (popularized by Netflix) is continuous background fault injection — Google runs thousands of chaos tests weekly via home-grown Catzilla. Appropriate only where the system's fault tolerance and the test's own risk are affordable.
- **User evaluation** (production; production data; manual and metric diffs): production-based alternatives to UAT — **dogfooding** (limited rollouts to staff), **experimentation** (blind experiment vs. control groups on aggregate metrics; the canonical story is the AdWords background-shading experiment that measurably lifted ad clicks), and **rater evaluation** (humans judge which output is better; critical for nondeterministic ML systems where there's no correct answer, only better or worse).

### 14.4 Large Tests and the Developer Workflow

Large tests that don't fit TAP (nonhermetic, flaky, resource-hungry) get a **separate post-submit continuous build**, and running them presubmit is encouraged so feedback reaches the author. A/B diffs needing human blessing are wired into code review — approve the diffs before approving the change; one such test auto-files release-blocking bugs for unresolved diffs. Tests too painful for presubmit run post-submit and at release time, accepting that a bad change lands and must be found and rolled back — an explicit trade-off among developer pain, change latency, and continuous-build reliability.

#### Authoring Large Tests

The enabler is clear libraries, documentation, and examples. Unit tests are easy because language support is native; Google reuses its assertion libraries for integration tests and has built libraries for SUT interaction, A/B diffs, data seeding, and workflow orchestration. Costs differ by composition — A/B diffs are popular partly because verification is cheap to maintain; production SUTs cost less than hermetic ones — but judge holistically: if manually reconciling diffs outweighs the savings, the design is ineffective.

#### Running Large Tests

Presubmit infrastructure exposes a common API over both TAP and non-TAP tests, and code review shows both result sets; still, many bespoke tests need their own run documentation — a real frustration for newcomers.##### Speeding Up Tests

"Engineers don't wait for slow tests." Best fix: reduce scope or split a test in two to run in parallel. Beyond that: avoid time-based sleeps; react like real users — poll for state transitions at microsecond frequency with a timeout, implement an event handler, or subscribe to a notification system. Note the spiral: sleep-laden tests all start failing when the test fleet is overloaded, requiring reruns that add load. Also lower internal system timeouts/delays (make production's hardcoded sleeps tunable when the SUT is colocated), and optimize build time by using prebuilt peer binaries at known-good versions — which mirrors production, where services release at different versions.

##### Driving Out Flakiness

Treat elimination as a high priority — flakiness can make a large test unusable. Start by shrinking scope (hermetic single-machine SUTs dodge multiuser, network, and deployment flakiness). Event-driven tests help here too, but note the trade-off: *reducing* internal timeouts speeds tests but invites flakiness — pick a tolerable user-facing timeout that also handles test nondeterminism. The subtle trap: production handles internal failures gracefully (Google doesn't return a 500 when an ad can't be served in time — it just serves no ad), which looks like broken code to a test runner when it's a flaky timeout. Make the failure mode obvious and the internal timeouts tunable.

##### Making Tests Understandable

A failing large test must (1) clearly identify the failure — "Assertion failed" plus a stack trace is the worst case; a good message anticipates the runner's unfamiliarity ("expected 10 search results but got 1") and explains what a perf/diff test measures; (2) minimize root-cause effort — stack traces span process boundaries, so emit traces across the call chain (Google's **Dapper** correlates an RPC chain by request ID) or automate culprit-narrowing; (3) provide support and contact information for the owners.

#### Owning Large Tests

Documented owners are mandatory; without them, contributions stall, failures take longer to resolve, "and the test rots." Integration tests of a project's components → owned by the project lead. Feature-focused tests spanning services → owned by a "feature owner" — an end-to-end engineer, a PM, or a test engineer owning the business scenario — who must be empowered and *incentivized* to keep the test healthy. Automation uses structured owner metadata: `OWNERS` files for standalone test artifacts, per-test-method annotations when one test class serves multiple feature owners.

### 14.5 Conclusion

A comprehensive suite needs larger tests — for fidelity and for the risk categories unit tests can't cover. Because they're complex and slow, they must be owned, maintained, run when it matters (pre-deployment), and kept as small as fidelity allows. Most projects need an explicit test strategy naming system risks and the larger tests that mitigate them.

### 14.6 TL;DRs

- Larger tests cover things unit tests cannot.
- Large tests are composed of a System Under Test, Data, Action, and Verification.
- A good design includes a test strategy that identifies risks and larger tests that mitigate them.
- Extra effort must be made with larger tests to keep them from creating friction in the developer workflow.

## Key terms

- **Fidelity**: how faithfully a test reflects real behavior of the SUT — in environment (unit → single machine → distributed → production) and in data content.
- **Hermeticity vs. fidelity**: the two axes for judging an SUT — isolation from other users/traffic versus resemblance to production; usually in direct conflict.
- **SUT (system under test)**: the concrete deployment the test acts on — single-process, single-machine, multimachine, shared staging/production, or hybrid.
- **Seeded data vs. test traffic**: preinitialized SUT state versus the inputs the test sends while running.
- **A/B diff (differential) testing**: identical traffic to old and new binaries, outputs diffed; variants A-A (noise detection) and A-B-C (accumulated impact). Google's most common large test.
- **Record/replay**: generating a small test from a large one — capture real service traffic in Record Mode (post-submit), replay it in Replay Mode (presubmit/dev) with request matchers.
- **Prober / canary analysis**: read-only functional assertions against live production, plus metric comparison of a staged canary rollout against baseline.
- **DiRT / chaos engineering**: scheduled planetary-scale disaster drills versus continuous background fault injection (Netflix-inspired; Google's Catzilla).
- **Dogfooding / experimentation / rater evaluation**: production-based user evaluation via staff rollouts, blind experiment-vs-control metrics, and human comparative judgment.
- **Bug bash**: a scheduled all-hands exploratory testing session with published focus areas.
- **Dapper**: Google's framework correlating all requests in an RPC chain by a single request ID, making large-test failures triageable.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
