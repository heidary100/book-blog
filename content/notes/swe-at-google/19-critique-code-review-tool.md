---
title: "Critique: Google's Code Review Tool"
book: swe-at-google
chapter: 19
date: 2026-10-01
summary: "A tour of Google's code review tool and the principles behind it: simplicity, trust, generic communication, tight tool integration — plus the LGTM/Approval/unresolved-comments scoring model that gatekeeps the codebase."
tags: [code-review, tools]
---

> Critique, Google's in-house code review tool, succeeds on four principles: simplicity (fast, hotkeyed, opinionated UI), a foundation of trust (review empowers rather than polices), generic communication (tools can't fix human communication problems), and tight workflow integration with code search, editing, testing, and release tools. Its process walks a change through six stages — create, request review, comment, modify, approve, commit — with scoring split into LGTM (a second pair of eyes is mandatory for every change), Approval (gatekeeping by code owners), and unresolved comments, a deliberately gentle phrase that forces all negative feedback to be tied to something specific.

## The big idea

Chapter 9 made the case that code review's main goal is improving readability and maintainability at scale; this chapter covers the tooling half of that story. Critique is beloved not because it is feature-rich but because it is *opinionated*: many tempting features were rejected rather than complicate the model for a small set of users. The team even declined a "Code Central" mega-tool combining editing, reviewing, and searching, keeping code review as the sole focus and linking out to other subsystems instead. Two of the principles pull against each other — simplicity vs. integration — and the resolution is links, not embedding.

The scoring scheme embodies the culture. Early Critique had "Needs More Work" and "LGTM++"; the simplified model made LGTM/Approval always positive and requires every change to get an LGTM regardless of approvals, guaranteeing at least two pairs of eyes. Because a reviewer cannot thumbs-down a change without attaching an unresolved comment, all criticism must be actionable — a subtle piece of culture-shaping-by-UI. And the tool's deepest stance is that trust and communication are core: "A tool can enhance the experience, but can't replace them" — for example, reviewers routinely LGTM with unresolved comments outstanding, trusting authors to address them, which matters enormously across time zones.

## Section by section

### 19.1 Code Review Tooling Principles

A good process needs tooling that supports it; Critique was shaped by Google's review-as-core-workflow culture into four principles:

- **Simplicity**: few unnecessary choices, fast loading, easy hotkey-driven navigation, clear visual markers of review state. The highest-impact principle.
- **Foundation of trust**: review exists to empower, not to slow people down — e.g., no extra review phase to double-check that minor comments were addressed, and changes are openly viewable/reviewable across all of Google.
- **Generic communication**: prioritize plain comments over complicated protocols; suggest edits in comments rather than complicating the data model. Communication can fail with the best tool "because the users are humans."
- **Workflow integration**: one-click navigation to Code Search, the Cider web IDE, and test results for the change under review.

### 19.2 Code Review Flow

Critique supports *precommit* review — before a change can be committed. The canonical flow: (1) author a change in a workspace and upload a snapshot, triggering automatic analyzers (Chapter 20); (2) mail the change to reviewers once the diff and analyzer results look right; (3) reviewers draft comments on the diff — **unresolved** by default (crucial to address), optionally resolved/informational — and *publish* them atomically after reviewing the whole change, providing "a complete thought"; anyone can comment ("drive-by review"); (4) the author modifies, uploads new snapshots, replies, and addresses at least all unresolved comments, with diffs between any snapshot pair available; steps 3–4 repeat; (5) reviewers approve with **LGTM** ("looks good to me"), turning the change visibly green; (6) the author commits, provided presubmit hooks pass. The flow stays flexible: reviewers can un-assign or reassign themselves, authors can postpone, and in emergencies an author can force-commit and be reviewed after the fact.

**Notifications**: Critique emits event notifications so it can remain a focused review tool while others build on it — e.g., a Chrome extension that surfaces "it's your turn" or "presubmit failed" alerts (loved by some, too disruptive for others). Critique also manages change-related email: analyzer findings can go out by email, and email replies are translated back into comments for an email-based workflow. Many users skip email entirely, living in the dashboard.

### 19.3 Stage 1: Create a Change

The tool should never be the bottleneck. Before review, it helps authors polish: whitespace-ignoring and move-highlighting diff knobs; surfaced build, test, and static-analysis results (including style checks); a reviewer's-eye diff view ("wearing a different hat" prevents misunderstanding); lightweight in-tool edits; reviewer suggestions; preliminary comments for open questions; and bug linking via an autocomplete service that prioritizes the author's own assigned bugs.

#### Diffing

The core of review is understanding the change, and bigger changes are harder — so diff quality is a core requirement. On top of an optimized longest-common-subsequence algorithm: syntax highlighting; Kythe-powered cross-references (Chapter 17); character-level intraline diffing respecting word boundaries; configurable whitespace ignorance; and **move detection** marking relocated code as moved rather than deleted-here-added-there. Side-by-side view was deemed essential, which forced radical space economy — no borders or padding, just diff and line numbers, with fonts tuned so Java's 100-character lines fit a 1,440-pixel screen. Custom tools can diff change artifacts (UI screenshots, generated configs). Diffs load fast, images and large changes included, with shortcuts that visit only modified sections; a compact snapshot-chain widget lets you drag-and-drop which versions to compare, auto-collapsing similar snapshots and prefetching everything for instant loading.

#### Analysis Results

Uploading triggers analyzers; results appear as status chips under the change description (red = highlighted finding, yellow = still running, gray = otherwise) with details in an Analysis tab. Findings render inside the diff, styled distinctly from comments, and may carry fix suggestions the author can preview and apply in a click (trailing-whitespace violations: two clicks to see it, one to preview the fix, one to apply). Intentionally binary: "actionability is a binary option," nothing else may highlight findings.

#### Tight Tool Integration

Google's Piper-based tools — **Cider** (cloud IDE), **Code Search**, **Tricorder** (static analysis), **Rapid** (release), **Zapfhahn** (test coverage) — are one click or hover away from a change page: edit in Cider, check mainline state in Code Search, see whether a change made it into a release. Links are favored over embedding to protect the review focus; the exception is coverage, shown as background colors in the diff's line gutter. This tight integration is possible because workspaces live in a cloud-hosted FUSE filesystem — "the Source of Truth is hosted in the cloud and accessible to all of these tools."

### 19.4 Stage 2: Request Review

Authors pick reviewers — or let tooling do it. Teams can offer an email alias consumed by **GwsQ** (named for the Google Web Server team that pioneered it), which assigns a specific member; and at monorepo scale, where the best-qualified reviewer may be outside your project, Critique *proposes sufficient reviewer sets* based on who owns the code, who most recently changed it (familiarity), who is available (not out of office, preferably same time zone), and the GwsQ alias. Assignment triggers the applicable **presubmits** (precommit hooks): auto-adding email lists for awareness, running project test suites, and enforcing invariants on code (style) and change descriptions (release-note generation). Because tests are resource-intensive they run at request-review and commit time, not per snapshot like Tricorder checks. Failed presubmits render like analyzer results but flagged as blocking, plus an email to the author.

### 19.5 Stages 3 and 4: Understanding and Commenting on a Change

#### Commenting

Commenting is the second most common Critique action after viewing, and it is free for all — author, reviewers, or any Googler. Per-file "reviewed" checkboxes track each reviewer's progress and reset on file changes. The "Please fix" button converts an analyzer finding into an unresolved comment; reviewers can also inline-edit the latest file version to attach an applyable suggested fix. "Done" and "Ack" buttons resolve threads with minimal friction. Drafts stay private until published atomically (Figure 19-7).

#### Understanding the State of a Change

**"Whose turn" — the attention set**: each change has an attention set of the people currently blocking it, rendered in bold, updated automatically as comments publish (and manually adjustable). It shines with multiple reviewers — an engineer, a UX person, the on-call SRE — replacing pre-feature "chatting between reviewers and authors to figure out who was dealing with the change." Users "had a difficult time imagining the previous state": review is turn-based, and it is always at least one person's turn.

**Dashboard and search system**: the landing page is a dashboard of customizable sections, each backed by a query to **Changelist Search**, which regex-indexes the latest state of *all* changes (pre- and post-submit) across Google, fast enough for interactive use despite enormous concurrency. Defaults: first section = changes needing your attention; reviewers live in the attention set; authors check what's still awaiting review. Dashboard customization is the one place Critique embraces it — "similar to the way everyone organizes their emails differently" (LSC reviewers especially tune theirs to avoid flooding).

### 19.6 Stage 5: Change Approvals (Scoring a Change)

Three-part scoring: **LGTM** ("I have reviewed this change, believe that it meets our standards, and I think it is okay to commit it after addressing unresolved comments"), **Approval** ("as a gatekeeper, I allow this change to be committed" — owner-style gatekeeping), and the count of **unresolved comments**. Committing needs at least one LGTM plus sufficient approvals plus zero unresolved comments — and the LGTM is required *regardless* of approval status, so every change gets at least two pairs of eyes. A green page header tells the author they're ready; a scoring panel shows who LGTM'd, which approvals remain and why, and open unresolved comments. LGTM/Approval are hard requirements, revocable until commit; unresolved comments are soft — the author may resolve by replying. That asymmetry *is* the trust model: a reviewer can LGTM with unresolved comments and never verify each one, saving days of round-trips across time zones — and exhibiting trust builds it. The simplified scheme also improved culture: negative feedback must anchor to a specific comment, and "unresolved comment" was chosen deliberately to "sound relatively nice." (Historical note: "Needs More Work" and "LGTM++" were dropped.)

### 19.7 Stage 6: Committing a Change

A commit button in the tool avoids context-switching to the CLI; presubmits run once more, and the change lands if nothing blocks.

### 19.8 After Commit: Tracking History

Critique doubles as a change-archaeology tool: from Code Search's file history (Chapter 17) you can jump to any past change and read its comments and evolution — used for auditing, understanding why changes were made or how bugs were introduced, learning how changes were engineered, and producing aggregate training material. Post-commit commenting is supported for later-discovered problems or added context, as are rollbacks and checking whether a change was already rolled back.

### 19.9 Case Study: Gerrit

Critique isn't exportable — it's welded to the monorepo and internal tools — so open source teams (Chrome, Android) and non-monorepo projects use **Gerrit**, a standalone open source review tool integrated with Git: browsing, branch merging, cherry-picks, a fine-grained permission model over repositories and branches. Shared model: each commit is reviewed individually, commits stack for individual review, and a reviewed chain can commit atomically. Gerrit is more configurable and plugin-extensible for wider use cases, including a fancier scoring system (a −2 veto) — the flexibility Critique deliberately traded away.

### 19.10 Conclusion

Review time is time not spent coding, so review-process optimization is directly a productivity gain; having only two people (author and reviewer) agree before commit keeps velocity high, while the educational value of review is real though hard to quantify. The tool's job: flow seamlessly, tell users succinctly what needs their attention, and catch issues with analyzers and CI *before* humans see them, surfacing quick analysis results ahead of slower ones. Scale shows up as performance (Critique is on the critical path; most changes are under 100 lines, but LSCs can touch thousands of files atomically), reviewer-finding across the ownership landscape, and managing activity over a huge codebase. Critique stays opinionated and simple, with sanctioned customization via custom analyzers, presubmits, and team policies (e.g., requiring multiple LGTMs). Final word: trust and communication are core; a tool enhances but cannot replace them.

### 19.11 TL;DRs

- Trust and communication are core to code review; a tool can enhance the experience, but can't replace them.
- Tight integration with other tools is key to a great review experience.
- Small workflow optimizations — like the explicit "attention set" — can increase clarity and reduce friction substantially.

## Key terms

- **Critique**: Google's primary in-house code review tool; precommit, monorepo-bound, not externally available.
- **LGTM ("looks good to me")**: a reviewer's positive review stamp; mandatory for every change regardless of approvals, ensuring two pairs of eyes.
- **Approval**: the gatekeeping stamp granted by code owners allowing a change into the codebase.
- **Unresolved comment**: a comment the author must address before commit — soft requirement, resolvable by the author; the phrase chosen to keep negative feedback gentle and specific.
- **Attention set**: the set of people a change is currently blocked on; rendered in bold; encodes "whose turn" it is to act.
- **Presubmit**: a precommit hook run at review-request and commit time (tests, style invariants, email-list enforcement); failures block the change.
- **GwsQ**: the reviewer-assignment service behind team email aliases, picking a specific member to review.
- **Changelist Search**: the regex query engine indexing the latest state of all changes at Google, powering the dashboard sections.
- **Cider / Rapid / Zapfhahn**: the cloud IDE, release/deploy tool, and test-coverage tool linked from Critique.
- **Drive-by review**: an unsolicited comment from anyone in the company on any change.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
