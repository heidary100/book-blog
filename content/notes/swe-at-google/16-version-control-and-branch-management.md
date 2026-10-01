---
title: "Version Control and Branch Management"
book: swe-at-google
chapter: 16
date: 2026-10-01
summary: "A VCS maps (filename, time) to contents — the engineer's primary tool for managing code over time. Trunk-based development and the One-Version Rule scale because they remove choice."
tags: [tools, automation]
---

> Version control is the one nearly universal software engineering tool because it is "the engineer's primary tool for managing the interplay between raw source and time": a VCS extends a filesystem's filename→contents mapping to (filename, time, branch)→contents. The chapter argues that trunk-based development (one repository, no long-lived dev branches) plus the "One-Version Rule" — developers must never choose which version of a dependency to use — are the policies that scale, because every point of choice reintroduces merge coordination, diamond dependencies, and lost work.

## The big idea

The chapter's framing device is the programming-vs-engineering distinction from Chapter 1: version control seems alien to a new hire because it solves a problem pure programming never presents — an "undo" not for a file but for an entire project, across months and multiple contributors. It took decades (SCCS in the 1970s, RCS in the 1980s, CVS/Subversion through the 90s, Git/Mercurial in the mid-2000s) for VCS use to become the norm, and even legal and audit practices have since grown to depend on it: a formal record of every change to every line, plus provenance for third-party code.

The core policy argument is about *choice*. Any choice — which branch to commit to, which version of a library to depend on, which fork to use — creates partitioning, merge-strategy meetings, and coordination overhead that grows with team size. Google's answer is radical consistency: a single monorepo (Piper, ~50,000 engineers, 80+ TB, 60–70k commits/day) with trunk-based development, granular OWNERS-file approval, and One Version. The authors are careful to say the *monorepo technology* itself is debatable — like choosing a filesystem format, the content and policy matter more — but the *One-Version principle* is not: "developers must not have a choice when adding a dependency onto some library that is already in use in the organization." DORA's research independently confirms the correlation: trunk-based development is a predictive factor in high-performing organizations. This is a natural extension of the basic-tooling mindset in [The Basic Tools](/books/pragmatic-programmer/03-the-basic-tools), taken to organizational scale.

## Section by section

### 16.1 What Is Version Control?

A VCS tracks revisions of files over time, with metadata; files plus metadata form a repository. Walking up the ladder of hypothetical tool-less collaboration shows why the tool is inevitable: passing files back and forth dies on "which version is newest?" ("Presentation v5 - final - redlines - Josh's version v2"); shared storage dies on overwrite collisions and broken builds; add file locking and you've reinvented RCS; add line-level tracking and you've reinvented version control outright — so use an off-the-shelf tool.

**Why it matters**: VCS makes time explicit. A filesystem maps filename→contents; a VCS maps (filename, time, branch)→contents, with "head/trunk/default" as the ordinary branch. Teams resist it when management conflates programming with engineering — to someone who has never maintained multi-person code, VCS looks like an expensive luxury undo button. Its real value is scaling collaboration: it removes "which is more recent?", automates error-prone sync tracking, and satisfies audit/provenance requirements. Committing is also a ritual worth keeping: a moment of reflection, a checklist, a natural place to run tests and static analysis (Chapter 20).

**Centralized vs. distributed**: functionally all modern VCSs are equivalent — atomic commits to a batch of files; the rest is UI, so choosing one is like choosing a filesystem format. Early centralized systems (RCS) used file locking, which falls apart under contention; CVS added batch operation and multi-checkout; Subversion added true atomic commits and rename tracking. DVCS (Git, Mercurial) answers "where can you commit?" with "everywhere": every clone is a full repository, and centrality is policy, not technology. DVCS shines offline and in open source, but Google's custom centralized Piper exists because transmitting history to 50,000 engineers is almost entirely waste — any developer touches a shrinking fraction of files, and locality is only needed for building (which Chapter 18's distributed build system handles better).

**Source of Truth**: centralized VCSs bake it in (trunk is truth); DVCS must *declare* it. Without one declared branch in one declared repository, you drift back to the "Josh's version v2" world: no scalable (sublinear-effort) way to know a release contains everything, and new hires have no known-good copy to clone. Hierarchy is fine — RedHat, Linus, and Google can each have a different source of truth for kernel patches — so long as no one is uncertain where to push. And note the oft-unspoken truth: version control is half technology, half policy.

**VCS vs. dependency management** (a bridge to Chapter 21): same conceptual territory, but VCS policy governs your own code at fine granularity; dependency management governs other organizations' code, at coarser granularity, without perfect control.

### 16.2 Branch Management

#### Work in Progress Is Akin to a Branch

Uncommitted local changes are conceptually a branch — DVCS makes this explicit with local commits; Perforce makes it explicit by giving every pending change two revision numbers (its implicit branch point and its eventual commit point). This matters for refactoring: "rename Widget" could mean trunk only, all branches, or all branches *plus* every engineer's outstanding change — which is why centralized VCSs track who has a file open for edit. Google considers that last interpretation unscalable, but the ambiguity is real.

#### Dev Branches

Long-lived development branches were a rational response to unstable trunks in the era before consistent unit testing: test on the branch, merge when "done." The problem is legitimate; the solution is not. The same commits merge to trunk eventually, and small merges by the change's author beat big batched merges by whoever gets stuck coordinating: one engineer per merge makes regressions easy to isolate and fix. The failure spiral is familiar — "branch merges are risky" leads to slowing down and coordinating merges rather than fixing trunk stability with tests and CI; branches spawn off branches; a Build Master/Merge Coordinator emerges; "regularly scheduled" merge-strategy meetings appear (informal polling: ~25% of engineers have endured them); losing teams re-sync and retest after each big merge. All pure overhead. The alternative: trunk-based development — heavy testing, CI, keep the build green, disable incomplete features at runtime, one Source of Truth.

#### Release Branches

If release lifetime is longer than a few hours, snapshot the shipped code on a release branch and cherry-pick (minimal, targeted merges) critical fixes. Release branches are benign because their expected end state differs: a dev branch must merge back to trunk; a release branch is eventually abandoned. DORA finds release branches practically nonexistent in the highest-performing (continuous-deployment) organizations — it's easier to fix and redeploy — though shipping tangible goods still justifies knowing exactly what's in the field. "It isn't the technology of branches that is troublesome, it's the usage."

### 16.3 Version Control at Google

Nearly all Google source lives in one Piper monorepo (exceptions: Chromium, Android), run as a distributed microservice on standard Google storage/compute — ~80 TB, 60,000–70,000 commits per work day from humans and semiautomated processes, and cheap at human scale: ~15 seconds to create a client, add a file, and commit. Because Piper is in-house, policy is enforced *by the VCS*: OWNERS files at every directory level name who may approve commits in that subtree — ownership as a text file rather than repository boundaries, so reorgs are trivial. (Migrating to Git has repeatedly failed on sheer scale and Hyrum's Law: scripts assume monotonically increasing revision numbers.)

#### One Version

Extends Single Source of Truth from *where* to *what*: "for every dependency in our repository, there must be only one version of that dependency to choose." One version of each third-party package; no forks of internal packages unless repackaged/renamed so original and fork can coexist safely.

#### The "One-Version" Rule

Why it matters: consider forking Abseil to work around a bug. Now the codebase is partitioned — any target's transitive dependency set must contain exactly one copy, so "adding a new dependency" can require running the *entire* test suite to check partition violations. Java's shading (rewriting internal dependency names) works for functions but not for types: "there is no good (efficient) solution to shading types" — any library exposing vocabulary types breaks. The rule in one line: developers must never have a choice of "what version of this component should I depend upon?" Individually annoying, organizationally critical — consistency creates leverageable choke points.

#### (Nearly) No Long-Lived Branches

Follows from Agile, DORA, and Phoenix Project lessons on reducing work-in-progress — especially given that pending work *is* a branch. Counterexample: the exciting new Widget that new projects may depend on "only from a parallel branch" reintroduces choice; instead, commit it to trunk disabled at runtime, hide it with visibility, or design the two Widgets to coexist in one binary. Across ~1,000 teams, fewer than ~10 have long-lived dev branches, usually for compatibility-over-time requirements: data-at-rest format stability, or old-client/new-server API promises — "dependency across time in any form is far more costly and complicated than code that is time invariant." Google caps version skew with a six-month build horizon: every production job must be rebuilt and redeployed at least every six months.

#### What About Release Branches?

Used by many Google teams with minimal cherry-picks — reasonable for monthly releases or shipped devices. Keep cherry-picks rare, never plan to remerge, and the cost is negligible.

### 16.4 Monorepos

The 2016 "billions of lines in a single repository" paper's chief benefit: adhering to One Version is *trivial* — violating it is harder than doing the right thing. No deciding which versions are official, no discovering which repositories matter, and engineers can see everyone else's code. But is monorepo the One True Way? No — it's a filesystem-format choice: 10 drives as one logical filesystem vs. 10 smaller ones, with the same trade-offs (resilience, size, performance vs. cross-boundary references). What matters is the principle, not the storage layout. Tooling increasingly synthesizes monorepo behavior across fine-grained repos — Git submodules, Bazel external dependencies, CMake subprojects, "virtual monorepo" (VMR) views — which also buy scale (Git struggles past a few million commits and with large binaries), storage savings, and per-repo secrecy/legal isolation. If every project shares the same security and legal requirements, a true monorepo is fine; otherwise, "aim for the functionality of a monorepo" without the uniformity constraint.

### 16.5 Future of Version Control

Microsoft, Facebook, Netflix, and Uber all report monorepo reliance, and the anti-monorepo arguments are weakening: technical limits (slow clones at scale) are being engineered away with shallow clones, sparse checkouts, and optimization — and the VCS is assumed to be networked with cloud storage and builds, so nothing needs transmitting wholesale. The OSS-culture argument mistakes OSS's constraints (freedom, no coordination, no shared compute) for virtues; within an organization you can assume compute, coordination, and authority. The genuinely hard remaining problem: as organizations scale, code stops sharing uniform legal/compliance/privacy requirements — manyrepo's native advantage. The prediction: VCS and package ecosystems converge on VMRs with consistent ordering of commits and dependency graphs; someone (Linux distributors already publish mutually compatible package revisions) catalyzes a de facto standard virtual monorepo; and the industry internalizes that "version numbers are timestamps" — version skew is time complexity, and time is the dimension a monorepo removes.

### 16.6 Conclusion

VCS evolution tracks engineering norms: locking → atomic centralized commits → distributed clones → (next) cloud storage with a recognized central Source of Truth. DVCS decentralization was a sensible response to OSS needs but must be coupled with branch-management policy; offline fidelity costs local data, and branching free-for-alls create unbounded coordination overhead. Keep branch policies simple. And the closing endorsement: few policies beat removing choice — where to commit, which version to depend on — for organizational impact.

### 16.7 TL;DRs

- Use version control for anything beyond a never-updated single-developer toy project.
- Choice of "which version should I depend on?" is an inherent scaling problem.
- One-Version Rules are surprisingly important: removing choice in where to commit and what to depend on massively simplifies collaboration.
- Shading, separate compilation, and linker tricks to dodge multi-version conflicts are lost labor — engineers working around technical debt instead of producing.
- DORA research shows trunk-based development predicts high performance; long-lived dev branches are not a good default.
- Use whatever VCS makes sense, but keep interrepository dependencies unpinned/at-head — the "virtual monorepo" facilities make fine-grained repos and a consistent trunk compatible.

## Key terms

- **VCS**: a system tracking revisions of files over time; conceptually extends a filesystem's filename→contents mapping to (filename, time, branch)→contents.
- **Trunk-based development**: one repository, no dev branches — everyone commits small increments to trunk, keeping it green via tests/CI and disabling incomplete features at runtime.
- **Source of Truth**: the one designated branch in one designated repository where a change is "done"; baked into centralized VCSs, declared by policy in DVCS ones.
- **One-Version Rule**: developers must never have a choice of which version of an existing component to depend upon — one copy, one branch, one repository.
- **Shading**: a Java practice of rewriting a library's internal dependency names so two versions can coexist in one binary; sound for functions, breaks for shared types.
- **Build horizon**: Google's six-month maximum age for any production deployment — a hard cap on version skew between readers and writers.
- **Virtual monorepo (VMR)**: a synthesized monorepo experience stitched across fine-grained repositories (Git submodules, Bazel externals) with a consistent commit order and dependency graph.
- **Piper**: Google's in-house centralized VCS, run as a distributed microservice; ~80 TB of content, tens of thousands of commits per day.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
