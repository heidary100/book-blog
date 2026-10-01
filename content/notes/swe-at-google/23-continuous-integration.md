---
title: "Continuous Integration"
book: swe-at-google
chapter: 23
date: 2026-10-01
summary: "CI decides what tests to run when: fast, reliable ones on presubmit; larger, less deterministic ones post-submit; hermetic suites and actionable feedback throughout."
tags: [testing, automation]
---

> Redefine CI as "the continuous assembling and testing of our entire complex and rapidly evolving ecosystem" — dependencies today include upstream microservices, data, models, and runtimes, not just code. The core discipline is deciding *what to test when*: fast, reliable tests on presubmit; larger, less deterministic tests post-submit; the same suites again on release candidates and production ("defense in depth"). Google's TAP proves the model at scale — 50,000+ changes and 4 billion test cases a day, an 11-minute average submit wait, and flaky-test and failure-management machinery to keep it all trustworthy.

## The big idea

CI's fundamental goal is to "automatically catch problematic changes as early as possible." The classic definition (integrating work frequently, verified by automated builds) needs updating for modern distributed systems: with microservices, the change that breaks your application increasingly lives *outside* your codebase, behind an HTTP call — and an application also depends on ingested data, ML models, operating systems, runtimes, cloud services, and devices. Hence the chapter's better definition: "the continuous assembling and testing of our entire complex and rapidly evolving ecosystem."

From a testing perspective, CI answers two questions: which tests to run *when* in the development/release workflow, and how to compose the system under test (SUT) at each point, balancing fidelity and setup cost. A presubmit SUT (code still pending review) has very different requirements than a staging SUT — e.g., it's dangerous for unreviewed code to talk to real production backends. The payoff for getting this balance right is a guarantee: "verifiable — and timely — proof that the application is good to progress to the next stage," rather than hoping every contributor is careful.

## Section by section

### 23.1 CI Concepts

#### Fast Feedback Loops

The cost of a bug grows almost exponentially the later it is caught, because issues found "to the right" must be triaged by engineers unfamiliar with the change, force the author to recollect context, and damage other engineers or end users. CI minimizes cost by maximizing the number and speed of feedback loops, from fastest to slowest: the local edit-compile-debug loop; presubmit test results; post-submit integration errors between two projects; QA catching an incompatibility with an upstream microservice in staging; internal dogfooder reports; and finally external user or press reports. Canarying adds a subset-of-production loop before all-of-production but introduces **version skew** (multiple incompatible versions of code, data, or config deployed at once). Experiments and feature flags are powerful feedback loops too — the workhorse of Continuous Delivery (Chapter 24).

*Accessible and actionable feedback*: test reporting should be as open as code. Google's unified reporting system exposes any build or test run with logs (minus PII), the history of when a target began failing, and audits of what was cut where by whom; a statistical flake-classification system tells you Google-wide whether a failing test is flaky (so you know your change probably didn't break another project). Feedback must also be *actionable* — "by improving test output readability, you automate the understanding of feedback."

#### Automation

Automated processes are code, so peer review reduces their error rate; they still have bugs but remain faster and more reliable than manual work. Two pillars:

- **Continuous Build (CB)**: integrates the latest changes at head and builds *and* tests, so "breaking the build" includes breaking tests. This creates two heads: *true head* (latest commit) and *green head* (latest CB-verified commit). Engineers code against green head and sync to true head before submission.
- **Continuous Delivery (CD)**: release automation continuously assembles release candidates — "a cohesive, deployable unit created by an automated process, assembled of code, configuration, and other dependencies that have passed the continuous build." Static configuration ships *with* the RC and is tested alongside the code that uses it (a large percentage of production bugs are "silly" configuration problems; static config lives in version control and goes through code review). CD is the promotion of RCs through a series of environments, sometimes reaching production. RC artifacts should never be recompiled between environments — Docker and Kubernetes/Borg enforce consistency, buying higher-fidelity earlier testing and fewer production surprises.

#### Continuous Testing

Apply CB and CD across the life of a change, with progressively larger-scoped tests as it moves right.

- **Why presubmit isn't enough**: running everything on presubmit is too expensive (waits of hours), and there are efficiency gains when tests pass far more often than they fail. Flaky presubmit tests block many engineers over failures unrelated to their change. And there's a race: while your presubmit runs, the repository can change — a **mid-air collision** is two changes touching completely different files that still fail a test together. Rare in principle, but "it happens most days at our scale"; smaller projects can serialize submits instead.
- **Presubmit vs. post-submit**: the rule of thumb is "only fast, reliable ones" on presubmit (typically small/unit tests, project-scoped, run concurrently). Accept some coverage loss and catch what slips through post-submit, accepting some rollbacks there. Larger-scoped tests on presubmit require hermetic testing — or tolerating unreliability with aggressive disabling.
- **RC testing**: even the same suite CB just ran is rerun on the RC, for four reasons: a sanity check (nothing odd happened when the code was cut and recompiled), auditability (results attached to the RC), cherry picks (your source now diverges from the CB-tested cut), and emergency pushes (cut from true head, run the minimal set, skip the full CB).
- **Production testing**: the same suite runs against production ("probers"), verifying both the working state of production *and* the continued relevance of the tests. It's defense in depth — no single technology or policy carries quality.

*Sidebar — "CI Is Alerting" (Titus Winters)*: CI is the "left shift" of alerting. Both exist to identify problems automatically; CI catches them early via test failures, alerting catches them late via metrics. The best practices transfer: fidelity and actionability matter most — "if it isn't actionable, it shouldn't be alerting. If it isn't actually violating the invariants of the SUT, it shouldn't be a test failure." Brittle cause-based alerts (arbitrary thresholds) and brittle tests (arbitrary invariants) are the same failure mode, useful for debugging but rough proxies for health. So a 100% green rate, like 100% uptime, is "awfully expensive"; not every failure deserves equal alarm; and "nobody can commit unless green" is misguided when the root cause is understood not to affect production. SRE long ago accepted error budgets; CI policy should catch up.

#### CI Challenges

Presubmit optimization (which tests, how to run them); culprit finding and failure isolation — e.g., staging your stable servers with an upstream service's new servers to isolate a problem ("integrating upstream microservices"), complicated by version skew and false positives; resource constraints (large tests are expensive). Failure management is its own discipline: with big end-to-end tests in the mix, a consistently green suite is extremely difficult, so tests need a mechanism for temporary disablement — Google teams use bug "hotlists" curated by an on-call or release engineer, auto-filed for larger products like Google Web Server and Google Assistant; "often, the problems caught by end-to-end test failures are actually with tests rather than code." Flaky tests erode confidence and hide the culprit; tools can remove them from presubmit temporarily. Instability can also be amortized with multiple test attempts and retries.

### 23.2 Hermetic Testing

Hermetic tests run "against a test environment that is entirely self-contained (i.e., no external dependencies like production backends)" — Chapter 11's concept, made central here because talking to a live backend is unreliable. Two properties matter:

- **Determinism**: outside dependencies can't change what goes into the test, so the same application and test code yields the same result — reruns hours or days later are meaningful signals, which is exactly what CI needs. (System time, RNG, and race conditions remain sources of nondeterminism.)
- **Isolation**: production problems don't affect the tests, and vice versa; tests typically run on one machine with no network dependency. Test success must not depend on who runs it, so CI results are reproducible by anyone.

A *fake* backend (Chapter 13) is one option — cheaper than real, but maintenance-heavy and lower fidelity. The cleanest presubmit-worthy integration test is a fully sandboxed stack; Google ships out-of-the-box sandbox configs for popular components like databases. Extreme case: DisplayAds starts about four hundred servers from scratch on every presubmit and continuously on post-submit. For larger systems, **record/replay** (record live backend responses, cache, replay hermetically) has become more popular and cheaper — but it's brittle in both directions: false positives when the cache masks real problems, false negatives when stale caches force long, submit-blocking updates. The ideal — cache-miss only when a request changes meaningfully — is very hard to define in a large, ever-changing system.

*The Hermetic Google Assistant*: the team made its end-to-end suite fully hermetic on presubmit after nonhermetic tests routinely failed (on bad days, 50+ changes bypassed the results). Result: runtime cut by a factor of 14 with virtually no flakiness, and remaining failures easy to find and roll back. Nonhermetic tests moved to post-submit, where failures now accumulate — debugging end-to-end failures is still hard, and some teams just disable them, which "can result in production failures." Open challenges include caching that catches more presubmit issues without brittleness, and testing the decentralized Assistant. Their clever post-submit failure-isolation trick: for each of N microservices, run that service at head against production versions of the other N−1 — normally O(N²), reduced to O(N) via *hotswapping*, where a request tells a server to swap in the address of a different backend, letting all N environments share one set of prod backends.

### 23.3 CI at Google

**TAP (Test Automation Platform)** is Google's global continuous build — the gateway for almost all changes, handling more than 50,000 unique changes and running more than four billion test cases every day. Conceptually simple: when an engineer tries to submit, TAP runs the associated tests and allows the change in on green.

- **Presubmit optimization**: without a CB, testing is left to engineer discretion and a few motivated people. TAP instead lets potentially breaking changes land (they're immediately visible company-wide) while each team maintains a fast subset — usually unit tests — for presubmit. Empirically, a change that passes presubmit has a 95%+ likelihood of passing everything else, so it's optimistically integrated, and TAP asynchronously runs all potentially affected tests afterward. Average submit wait: about 11 minutes, usually in the background. The cultural norm: never build new work on top of known-failing tests. Each team has a **Build Cop** who keeps *all* tests in the project passing regardless of who broke them — dropping everything, identifying the offending change, and preferring rollback over the riskier fix-forward.
- **Culprit finding**: TAP evaluates more than one change per second, so it can't run every test on every change; it batches related changes, which obscures who broke what. TAP auto-splits failing batches and reruns changes in isolation, and developers have tools to binary-search a batch for the culprit.
- **Failure management**: the Build Cop's most effective tool is the rollback — the fastest, safest route back to a known good state (any Google change can be rolled back "with two clicks"), and TAP now auto-rolls back changes when it has high confidence they're the culprit. The maxim: "tests give us confidence to change, rollbacks give us confidence to undo."
- **Resource constraints**: most tests run in Forge, a distributed build-and-test system in the datacenters; even so, TAP is resource constrained. Its primary saving grace is the near-real-time global dependency graph maintained by Forge and Blaze, letting TAP run only the tests downstream of a change. TAP's scheduling also biases toward small changes: a change triggering 100 tests can finish tens of minutes before one triggering 1,000 — so engineers write smaller, more focused changes, "a win for everyone."

### 23.4 CI Case Study: Google Takeout

Takeout launched in 2011 as a "data liberation" backup/download product, then grew into the backend for 10+ Google products (Drive folder downloads, Gmail ZIP previews) and a platform integrating 90+ product plug-ins. Its CI evolution is a checklist of the chapter's ideas:

- **Scenario 1 — continuously broken dev deploys.** Each product API ran as a customized instance of the same binaries; flags, security, and ACL configuration for one instance broke others, causing nightly failures discovered only at next-day deploy. The team built temporary sandboxed mini-environments per instance that ran on presubmit and verified every server started healthy — preventing 95% of broken servers from bad configuration and cutting nightly deployment failures by 50%. End-to-end tests (using test accounts subject to security safeguards) couldn't move to presubmit, so they were run in a post-submit environment every two hours, cut from green head as an RC — cutting the "culprit set" 12x.
- **Scenario 2 — indecipherable test logs.** With 90+ plug-ins, end-to-end failures piled up in logs and "the tests were almost always failing." The suite was refactored into a dynamic, configuration-based suite with a parameterized test runner and a green/red UI, and failure messages now embed auto-constructed debugging links (e.g., a log search for the exact file ID that failed to fetch). The Takeout team's involvement in debugging client plug-in failures dropped 35%.
- **Scenario 3 — debugging "all of Google."** Because Takeout verifies the output of 90+ end-user products, its CI catches problems that belong to other services. Cheap fix: run the exact same suite continuously against production as against the post-submit build — same live backends, new binaries — which cleanly separates "broke in my build" from "broke somewhere else in Google." Future improvement: hermetic record/replay to stop upstream noise entirely.
- **Scenario 4 — keeping it green.** With suites nearly always broken (mostly by plug-in binaries Takeout didn't control), commenting out tests was too easy to forget. Instead: failing tests are tagged with a tracking bug assigned to the responsible team, and the framework suppresses that failure — the suite stays green with confidence that everything *besides known issues* passes. For rollout skew (a YouTube feature enabled in dev months before prod), tests declare the feature flag or change ID plus the expected output with and without it, then query the environment to know which to check. Tag cleanup is automated via the bug tracker's API — a test passing longer than a configured limit prompts tag removal (flaky-tagged tests excepted) — making the suite mostly self-maintaining; the authors dub the metric MTTCU, mean time to clean up.
- **Remaining challenge**: upstream compatibility — e.g., a security update in the streaming infrastructure behind Drive downloads broke archive decryption in production, invisible to Takeout's CI. An "upstream staging" environment (production Takeout binaries against staged upstreams) proved hard to maintain.

### 23.5 But I Can't Afford CI

Even Google's fastest-growing products often lacked adequate CI while growing. The reframe: CI isn't a new cost but "a cost shifted left to an earlier — and more preferable — stage," reducing the incidence of expensive production fire-fighting, which is stressful and demoralizing. A working CI culture also builds confidence that "the system" will catch problems, freeing engineers to focus on features instead of fixing. Building CI need not start from scratch — the release-automation half of this chapter pairs naturally with the [pragmatic starter kit](/books/pragmatic-programmer/03-the-basic-tools) of getting builds and releases automated early.

### 23.6 Conclusion

None of this is perfect: a CI system is itself software, never complete, and must be adjusted to the evolving demands of the application and engineers it serves — Takeout's continuing evolution illustrates exactly that.

### 23.7 TL;DRs

- A CI system decides what tests to use, and when.
- CI systems become progressively more necessary as your codebase ages and grows in scale.
- CI should optimize quicker, more reliable tests on presubmit and slower, less deterministic tests on post-submit.
- Accessible, actionable feedback allows a CI system to become more efficient.

## Key terms

- **Continuous Integration (CI)**: originally "integrate frequently, verify by automated build"; reframed here as the continuous assembling and testing of the entire evolving ecosystem (including upstream services, data, and configuration).
- **System under test (SUT)**: the composed environment — code, config, backends — a test runs against; composed differently for presubmit, staging, and production.
- **Version skew**: a distributed system state containing multiple incompatible versions of code, data, and/or configuration; a hazard of canarying and staged rollouts.
- **Mid-air collision**: a test failure caused by two changes that touch completely different files but incompatibly interact because the repository changed during presubmit testing.
- **True head / green head**: the latest commit versus the latest commit the continuous build has verified; engineers sync to green head while coding, true head before submitting.
- **Release candidate (RC)**: a cohesive, deployable unit assembled automatically from code, configuration, and dependencies that passed the continuous build; promoted (never rebuilt) through environments.
- **Probers**: the same test suite run continuously against production to verify production's health and the tests' relevance.
- **Hermetic test**: a test run against a fully self-contained environment with no external dependencies; buys determinism and isolation.
- **Record/replay**: caching live backend responses and replaying them hermetically; cheaper than a full sandbox but prone to cache-driven false positives and false negatives.
- **Build Cop**: the engineer on a team responsible for keeping all project tests passing regardless of who broke them; rollback is the primary weapon.
- **Flake classification**: statistical, Google-wide labeling of failures as flaky so engineers can tell real breakage from noise.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
