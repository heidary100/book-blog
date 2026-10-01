---
title: "Static Analysis"
book: swe-at-google
chapter: 20
date: 2026-10-01
summary: "Static analysis works when it focuses on developer happiness: show only newly-introduced warnings, target under 10% effective false positives, integrate into code review, and let everyone contribute checks."
tags: [automation, tools]
---

> Static analysis — programs analyzing source without running it — finds bugs early and also codifies best practices, keeps code current with modern APIs, prevents technical debt, and stops backsliding during API migrations. Google's three lessons: focus on developer happiness (measured by the *effective* false-positive rate, what users perceive and act on), integrate analysis into the core workflow (above all code review, via the Tricorder platform), and empower everyone — not just tool experts — to contribute analyzers. The result: Tricorder analyzes 50,000+ changes daily across 30+ languages with an overall effective false-positive rate just below 5%.

## The big idea

Decades of static-analysis research optimized the *techniques*; Google's contribution is the *deployment* problem — making analysis scalable and usable enough that developers actually want it. The key reframe is economic: every warning has a cost-benefit trade-off measured in developer time and code quality. Fixing a warning can even introduce a bug (the classic example: "fixing" a dead-code warning by adding a call to dead code un-leashes untested code into production), so Google focuses on **newly introduced warnings** — issues on changed files or lines — where the developer has the most context and the marginal fix cost is lowest. Pre-existing issues are only worth surfacing when particularly important (security, significant bugs).

The other unifying idea is the feedback loop. Tricorder emerged from several *failed* attempts to integrate analysis into the workflow, and the difference was "relentless focus on having Tricorder deliver only valuable results." Users click "Not useful" on bad results (with a prefilled bug against the analyzer's author); the Tricorder team tracks rates and disables analyzers that don't improve. User trust is treated as the platform's core asset — which is why user-level customization was *removed*: letting individuals suppress warnings hid real bugs and suppressed the feedback that would have fixed them.

## Section by section

### 20.1 Characteristics of Effective Static Analysis

**Scalability**: tools must handle a multibillion-line codebase and be shardable and incremental — analyzing files affected by a pending change rather than whole projects, and typically showing results only for edited files or lines. Scale is also an opportunity (lots of low-hanging bug fruit) and a requirement in a second sense: the *number and variety* of analyses must scale, which Google achieves by soliciting contributions company-wide. The *process* must scale too: results go directly to the relevant engineers, with no human triage bottleneck.

**Usability**: the cost side of the trade-off is developer time (triage, fixing) or code quality (fixes can break things). Time spent is weighed against each analysis's benefit, and cost drops when the author supplies automatic fixes — "anything that can be fixed automatically should be fixed automatically." Workflow integration keeps interaction cost low, and homogenizing everything into one workflow lets a dedicated tools team evolve tools alongside the code.

### 20.2 Key Lessons in Making Static Analysis Work

#### Focus on Developer Happiness

Measure tool performance ("if you don't measure this, you can't fix problems"), deploy only low-false-positive tools, and act on user feedback in real time — a virtuous cycle that builds the user trust on which everything depends. Definitions matter here: a **false negative** is a missed issue; a **false positive** is an incorrect flag. Research traditionally minimized false negatives, but in practice developers abandon tools over false positives — who wants to wade through hundreds of false reports for a few true ones? Crucially, *perception* counts: a technically correct warning that is confusing or unimportant provokes the same reaction as a wrong one. Hence the **effective false positive**: any issue the developer takes no positive action on. If the tool reports a non-bug but the developer happily makes the fix for readability, it's not an effective false positive (e.g., a Java check flags `contains` on a hash table — equivalent to `containsValue` — even when the developer meant it, because `containsValue` is clearer). Conversely, a real bug the developer doesn't understand *is* an effective false positive.

#### Make Static Analysis a Part of the Core Developer Workflow

Integration point of choice: **code review**. Essentially all Google code is reviewed before commit, developers are already in a change mindset, and they context-switch while blocked on reviewers — so even minutes-long analyses have time to run. Reviewers add peer pressure to fix warnings, and analysis saves reviewers time by handling common issues automatically — the tooling helps review *scale*. Code review is "a sweet spot for analysis results."

#### Empower Users to Contribute

Domain expertise is everywhere; analysis is how you apply it at scale. Experts on a configuration-file format write checks for it; developers who just fixed a bug write a check to prevent its return. The strategy is a pluggable *ecosystem* rather than a curated toolset, with simple APIs for non-experts — e.g., **Refaster**, which defines an analyzer by giving pre- and post-transformation code snippets.

### 20.3 Tricorder: Google's Static Analysis Platform

Tricorder is the platform that came out of the earlier failed integration attempts. It hooks into Critique (Chapter 19), rendering warnings as gray comment boxes on the diff. Architecture: microservices — analysis requests with change metadata go to analysis servers, which read source versions through a FUSE filesystem, use cached build inputs/outputs, run each analyzer, and write results to storage for display in Critique; status updates post while analyses run. Scale: 50,000+ changes analyzed per day, often several analyses per second.

**Criteria for a new check** (all four required):

- Be understandable — any engineer can grasp the output.
- Be actionable and easy to fix — with guidance on how.
- Produce **less than 10% effective false positives** — developers should feel it's a real issue at least 90% of the time.
- Have potential for significant impact on code quality — even if only readability.

**Integrated tools**: 100+ analyzers over 30+ languages, most contributed from outside the Tricorder team; seven are plugin systems with hundreds more checks. Overall effective false-positive rate: just below 5%. Examples: **Error Prone** (Java) and **clang-tidy** (C++) extend the compiler to find AST antipatterns — e.g., hashing a `long` field with `result = 31 * result + (int) (f ^ (f >>> 32));`; if `f` is actually an `int`, the shift by 32 is a no-op, `f` XORs with itself, and the hash silently loses its salt — 31 instances were fixed while enabling this as a compiler error. **Deleted Artifact Analyzer** warns when a deleted source file is still referenced from non-code files (checked-in docs). **IfThisThenThat** enforces that parts of two different files change in tandem. Chrome's **Finch** analyzer checks A/B-experiment configs (missing launch approvals, crosstalk with overlapping experiments), making RPCs to other services for context. A binary-size checker warns when changes bloat binaries. Almost all analyzers are intraprocedural; interprocedural analysis is feasible but would need infrastructure (method summaries) Google hasn't invested in.

#### Integrated Feedback Channels

The "Not useful" button files a prefilled bug against the analyzer author; reviewers use "Please fix" to ask authors to address findings. The Tricorder team tracks high "Not useful" rates (relative to "Please fix" rates) and disables unimproved analyzers. Sometimes the fix is just better message text: an Error Prone check on a Guava printf-like function that accepts only `%s` drew weekly complaints of "the specifiers match the arguments" — because users passed other specifiers — until the message was rewritten to say exactly that, and the reports stopped.

#### Suggested Fixes

Where possible, checks attach fixes: applyable directly in Critique or across a whole change via a CLI tool. Style issues in particular should be fixed automatically (formatters) — pointing out formatting is "not a good use of a human reviewer's time." The numbers: reviewers click "Please fix" thousands of times a day, authors apply fixes ~3,000 times a day, "Not useful" clicks run ~250 a day.

#### Per-Project Customization

Once trust was established, projects could opt into additional "optional" analyzers — e.g., **Proto Best Practices**, which flags potentially breaking changes to protocol buffers; only breaking when serialized data is stored (e.g., in server logs), so projects without stored data needn't enable it. Some analyzers start optional, improve on feedback, and **graduate to on-by-default** (the Java readability analyzer users first called noisy, then asked for more of). The key insight: customization is **project-level, never user-level**, so a whole team sees consistent results — no one fixing an issue while a teammate reintroduces it. The cautionary tale: early Critique let users pick lint confidence levels and suppress analyses; Google removed that and got complaints — which, investigated, turned out to be real bugs (the C++ linter incorrectly running on Objective-C files; an HTML linter so noisy and useless it was disabled outright). "User customization resulted in hidden bugs and suppressing feedback."

### 20.4 Presubmits

Because developers *can* ignore review-time warnings, some analyses become **presubmit checks** that block committing: simple built-in checks (commit message must not say "DO NOT SUBMIT"; test files accompany code files), required test suites, zero Tricorder issues in a category, and formatting verification. They run when a change is mailed for review and again at commit (ad hoc in between). Teams layer custom presubmits to enforce stricter standards than company-wide defaults — letting new projects be stricter than legacy-heavy ones — with the escape hatch that "CLEANUP=" in the change description skips them so LSCs aren't blocked.

### 20.5 Compiler Integration

The earliest possible integration point: push analysis into the compiler, where breaking the build is "a warning that is not possible to ignore." Reserved for highly mechanical checks with no effective false positives — Error Prone's ERROR checks, all enabled in Google's Java compiler, so such bugs can never be reintroduced. Compiler checks must be fast and satisfy three criteria: actionable with mechanically applyable fixes; zero effective false positives (never stop a build for correct code); and correctness-only (no style). Enabling a new check requires first cleaning up *every* instance codebase-wide — run the compiler over the whole codebase as a MapReduce, auto-apply the fixes in one large change, commit, then flip the check on; the value must be high enough to justify that cleanup. And a hard policy: **never issue compiler warnings** — developers ignore them. Checks either break the build or don't appear in compiler output; those that can't be errors are suppressed or routed to code review (Tricorder). Both the Java and C++ compilers are configured this way, and Go takes it furthest — unused variables and imports are errors.

### 20.6 Analysis While Editing and Browsing Code

IDE integration needs sub-second (ideally sub-100 ms) analyses and consistency across IDEs — which Google doesn't mandate — and IDEs rise and fall in popularity, so it's messier than the review hook. Review also has inherent advantages: the full change context (some analyses misfire on partial code, like dead-code analysis before callsites exist) and the social forcing function that authors must *convince reviewers* to ignore warnings. But browsing-time analysis has real uses: security teams want holistic views of every instance of a problem, and developers surveying all results plan cleanups.

### 20.7 Conclusion

Static analysis improves the codebase, finds bugs early, and lets the expensive processes — human review, testing — focus on what machines can't verify. Scalability and usability investments made it an effective component of development at Google.

### 20.8 TL;DRs

- **Focus on developer happiness**: build feedback channels between analysis users and writers, and aggressively tune to reduce false positives.
- **Make static analysis part of the core developer workflow**: code review is the main integration point (with fixes and reviewer involvement), supplemented by compiler checks, commit gating, IDEs, and code browsing.
- **Empower users to contribute**: leverage domain experts to scale analysis building; developers continuously add checks that make their lives easier and the codebase better.

## Key terms

- **Static analysis**: programs analyzing source code (not a running program) to find bugs, antipatterns, and other diagnosable issues; "dynamic" analysis is its runtime counterpart.
- **Effective false positive**: an issue report the developer takes no positive action on — whether actually wrong, merely confusing, or technically correct but unimportant; the metric Tricorder is tuned against.
- **Tricorder**: Google's static analysis platform — a microservices system integrated with Critique, analyzing 50,000+ changes/day across 30+ languages with a <5% overall effective false-positive rate.
- **Analyzer / check**: an analyzer is a whole analysis tool plugged into Tricorder; a check is an individual rule contributed to one.
- **Presubmit check**: an analysis that blocks committing a change (run at review-request and commit), for checks too important to leave ignorable.
- **Error Prone / clang-tidy**: compiler-extension analyzers finding AST antipatterns in Java and C++ respectively; ERROR-level checks become build-breaking compiler errors.
- **Refaster**: an API for defining an analyzer by example — pre- and post-transformation code snippets.
- **IfThisThenThat**: an analyzer letting developers declare that parts of two files must change in tandem.
- **Intraprocedural analysis**: analysis limited to code within a single function — the norm at Google, since interprocedural techniques need method-summary infrastructure.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
