---
title: "Code Review"
book: swe-at-google
chapter: 9
date: 2026-10-01
summary: "Every change at Google is reviewed: three approval bits (LGTM, ownership, readability) keep it scalable, and the subtlest benefits — comprehension, culture, knowledge sharing — outweigh bug-finding."
tags: [code-review, teams]
---

> At Google essentially every change is reviewed before commit, through a process tuned to scale: three separately approvable "bits" (peer LGTM, code-owner approval, language readability), one reviewer, small changes, 24-hour feedback. Correctness is the obvious benefit but not the primary one — comprehension, consistency, psychological ownership, and knowledge sharing are what make the mandate worth its velocity cost.

## The big idea

Code review is one of the few blanket mandates at Google, in a culture that otherwise gives engineers wide latitude, precisely because its long-term benefits outweigh the cost of slowing code into production. The framing that makes the whole process click: **code is a liability** — it is maintenance work for someone down the line, like fuel an airplane must carry. Writing code from scratch is so discouraged that "If you're writing it from scratch, you're doing it wrong!" — someone in a codebase this size has probably written your utility already, and duplicated code makes even simple changes harder. So reviews exist not just to catch bugs but to ensure each change is comprehensible, consistent, and worth its weight.

The surprise the chapter leads with: correctness is *not* the primary payoff. Static analysis, automated tests, and tooling increasingly handle defect-finding; what humans uniquely provide in review is judgment about whether code makes sense over time and at scale. (The team-and-craft angle — review as feedback loop and professional respect — parallels [the pragmatic team's practices](/books/pragmatic-programmer/09-pragmatic-projects).)

## Section by section

### 9.1 Code Review Flow

Reviews at Google are precommit. The author uploads a snapshot (patch + description) producing a diff, self-reviews, then mails it to reviewers; reviewers comment on the diff; the author uploads new snapshots and replies, iterating. When satisfied, reviewers approve by marking **LGTM** ("looks good to me") — only one is required by default — which becomes a necessary permission bit for commit, alongside other approvals. The end goal is simple: get another engineer to consent to the change.

### 9.2 Code Is a Liability

Code is a necessary liability: by itself it is just future maintenance. Before writing code, confirm the feature is warranted; duplication is worse than wasted effort, because a change that is easy under one pattern becomes expensive across duplicates — especially in library/utility code, where a Google-sized codebase almost certainly has something similar already. Two corollaries for review: new code shouldn't come out of the blue (design precedes review), and review is *not* the place to rehash settled design decisions — those belong to design docs and API reviews.

### 9.3 How Code Review Works at Google

Three approvals are required, and they're separable "bits":

- **LGTM** — a correctness-and-comprehension check from another engineer (often, not necessarily, a teammate).
- **Code-owner approval** — the directory's owner consents to the change living in their part of the tree (implicit if the author *is* an owner).
- **Language readability approval** — a company-wide pool of engineers certified in that language checks style and best practices (implicit if the author has readability).

This sounds onerous, but one person often holds all three roles, and authors frequently hold the latter two — so an experienced tech lead needs only a peer LGTM, while an intern can commit the same change by gathering the other approvals. The flexibility is the point: most multi-approval reviews run in two steps (peer LGTM first, then owner/readability), letting each role focus on different questions. The owner isn't re-reading every line; they ask "will this be easy to maintain?", "does it add technical debt?", "do we have the expertise to maintain it?" Separating roles, not concentrating them, is what scales.

#### Ownership (Hyrum Wright)

Small teams grant everyone access to everything; that breaks as teams grow. Google's answer is **ownership**: not possession of code but "stewardship to act in the company's best interest with a section of the codebase" — "stewards" would be the better word, they admit. `OWNERS` files name responsible people per directory, resolve hierarchically (a file is owned by the union of all OWNERS files above it), and double as documentation: walk up the tree to find who's responsible, or who can approve a large-scale change. No central authority registers ownership — a new OWNERS file is enough. Teams are encouraged to keep lists small and focused, not to use ownership as an initiation rite, and to have departing members yield ownership promptly.

### 9.4 Code Review Benefits

Six benefits, from obvious to subtle: correctness, comprehension, consistency, psychological/cultural effects, knowledge sharing, and a historical record.

- **Code correctness.** Reviewers check testing, design, efficiency — and an IBM study found defects found earlier cost less to fix, so review pays if (and only if) the process itself stays lightweight. Reviewers defer to authors on approach: no alternatives proposed for personal opinion, only for improved comprehension or functionality — "approve changes that improve the codebase rather than wait for consensus on a more 'perfect' solution." Review is one layer in a shift-left, defense-in-depth strategy, so it doesn't need to be perfect to pay off.
- **Comprehension.** A reviewer does what even the best author cannot: read the code without the author's bias. Code is read far more than written, so review is the first test of comprehensibility. Prefer reviewers who must maintain or use the code. Here the maxim flips from correctness: "the customer is always right" — every question asked now will be asked many-fold later, so treat each as valid (which may mean explaining better, not redesigning).
- **Code consistency.** At scale, your code is maintained by others — and refactored by tools — long after you leave. Consistency and simplicity make code understandable and tool-refactorable (a pattern done one way is a pattern a tool can rewrite), and let engineers review outside their team. Readability approval exists precisely for this: a readability reviewer may prefer a less-complex change that isn't functionally "better."
- **Psychological and cultural benefits.** Review reinforces that code is a collective enterprise, not the author's possession; it forces compromise and mitigates emotionally charged criticism — the process is the "bad cop" (the tool is literally named Critique), so the reviewer can stay "good cop." New joiners are usually intimidated and initially read criticism as performance judgment; nearly all come to expect and value the challenge. Review also provides validation against imposter syndrome, and the act of preparing a change for review forces authors to "get their ducks in a row" — no shipping with the unit tests "to do later."
- **Knowledge sharing.** One of the most underrated benefits. Authors pick knowledgeable reviewers; review imparts domain knowledge, new techniques, and FYI comments; two-way exchanges are common (reviewers can even push suggested edits directly). Engineers answer every review even when they ignore email, and many Googlers "meet" colleagues first through reviews. Each merged review is also a permanent record: Code Search lets anyone dig up the review that introduced a pattern — archeology that informs far more engineers than the original participants.

### 9.5 Code Review Best Practices

Most review friction is implementation failure, not the process itself; these practices keep it nimble:

- **Be polite and professional.** One LGTM suffices, and reviewers commonly approve contingent on comments being addressed — trust, not unanimity. Defer to the author when several approaches are equally valid; ask questions before assuming an approach is wrong; give feedback within 24 working hours, and if you can't review in time, say so rather than go silent; don't dribble out piecemeal unrelated comments. Authors: you are not your code; after commit it isn't yours anyway. Treat every comment as a TODO — address it even if you reject it, debate openly, and offer an alternative with a "PTAL" (please take another look). Owners reviewing outside contributions should stay amenable to genuine improvements.
- **Write small changes.** The single most important practice. Aim for roughly **200 lines**, focused on one issue; reviewers may rightfully reject project-sized changes. Small changes mean fast reviews (~35% of Google's changes touch a single file), less waiting, easier bug localization, and atomic rollbacks. It's a trade-off — big features become hard to see whole, and integration-branch techniques add overhead — so treat smallness as an optimization, not a dogma. Smallness is also what enables the one-reviewer norm; team-wide review of everything could never scale.
- **Write good change descriptions.** The first line is prime real estate (tool summaries, email subjects, history in Code Search); the body should say *what* and *why* — "Bug fix" helps no future archeologist. Enumerate related modifications, update the description if decisions change in review, and comment liberally inside the implementation: "a code review is not just something that you do in the present time; it is something you do to record what you did for posterity."
- **Keep reviewers to a minimum.** Almost all Google reviews have exactly one reviewer. Additional LGTMs have diminishing returns — the first matters most — and the process is built on trusting engineers. Multiple reviewers, when genuinely needed, should each focus on a different aspect.
- **Automate where possible.** Presubmits run static analysis, tests, linters, and formatters *before* a change reaches a reviewer, rejecting fixable problems pre-emptively — sparing authors embarrassing review emails and letting reviewers skip formatting nitpicks entirely. Tooling can even auto-submit simple changes on approval.

### 9.6 Types of Code Reviews

- **Greenfield reviews** (least common): the key moment to judge whether new code stands the test of time. Design should already be settled (a code review is the wrong venue to introduce an API design); the review checks the API matches the agreed design, endpoints are fully unit-tested with tests that fail when assumptions change, an OWNERS file exists, comments/documentation suffice, and CI is set up.
- **Behavioral changes, improvements, optimizations**: the bread and butter. Same questions — necessary? does it improve the codebase? — and note that "some of the best modifications to a codebase are actually deletions," removing dead code. Behavioral changes update tests; optimizations may need benchmarks.
- **Bug fixes and rollbacks**: fix only the bug — no scope creep, or regression testing and rollback get harder — and add the test that would have caught it. Rollbacks (created in seconds by downstream customers) also require review, which is why *every* change should be small and atomic: developers start depending on new code almost immediately, and tangled rollbacks break them.
- **Refactorings and large-scale changes**: machine-generated changes (LSCs) still get review. Low-risk ones go to designated global approvers; risky ones to local engineers in their normal workflow. Reviewers should flag only concerns specific to their code — not the tool or process, which was already vetted (individual teams can't hold vetoes or LSCs couldn't scale; escalate out-of-band instead) — and must not expand scope, since the human running the tool may have hundreds of changes in flight.

### 9.7 Conclusion

Code review is "the glue connecting engineers with one another," the primary developer workflow on which testing, static analysis, and CI all hang. To keep developer satisfaction and velocity while scaling, keep changes small, feedback rapid, and iteration tight.

### 9.8 TL;DRs

- Review ensures correctness, comprehension, and consistency.
- Always check your assumptions through someone else; optimize for the reader.
- Provide the opportunity for critical feedback while remaining professional.
- Code review is important for knowledge sharing throughout an organization.
- Automation is critical for scaling the process.
- The review itself provides a historical record.

## Key terms

- **LGTM** ("looks good to me"): the peer reviewer's consent bit, asserting the code does what it claims and is understandable.
- **Three approval bits**: LGTM (correctness/comprehension), code-owner approval (appropriate for this part of the tree), and language readability approval (conforms to the language's style and best practices) — combinable in one person.
- **OWNERS file**: a per-directory file naming stewards of that code; ownership unions up the tree and doubles as machine-readable documentation.
- **PTAL** ("please take another look"): the author's polite request to re-review after addressing comments or offering an alternative.
- **Presubmit**: automated checks (analysis, tests, formatting) run before a change is even sent to a reviewer.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
