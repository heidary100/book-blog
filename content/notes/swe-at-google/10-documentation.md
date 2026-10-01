---
title: "Documentation"
book: swe-at-google
chapter: 10
date: 2026-10-01
summary: "Documentation — including code comments — is where engineering was before testing took hold: treat it like code (owners, review, source control, bugs), write for your audience, one purpose per document."
tags: [documentation, comments]
---

> Engineers write most documentation themselves, and the fix for bad docs is not better writers but better integration: treat documentation like code — owned, reviewed, versioned, bug-tracked — and bolt it into the existing developer workflow. Documentation's benefits are all downstream, which is why it's neglected; but a document is written once and read thousands of times, so its cost amortizes like a test suite's.

## The big idea

Late-2010s engineering documentation is where software testing was in the late 1980s: everyone agrees it matters, no organization treats it as critical. Google's most successful interventions came from treating documentation *as code* — the wiki era (ownerless, duplicated, 90% of documents untouched) produced the company's number one developer complaint, while moving docs into source control with owners, reviews, and bug tracking dramatically improved quality against initial pushback.

The benefits are real but delayed: unlike testing, documentation rarely pays the author immediately. Still, it formulates APIs ("if you can't explain it and can't define it, you probably haven't designed it well enough"), cuts repeat questions (the biggest long-term win — explain something twice, document it), and above all serves the reader: "optimize for the reader" applies to comments and docs as much as code. The craft itself is not foreign to engineering — a document is just another tool in the toolbox, written in a different language, with syntax, style rules, and consistency goals. This chapter's comment philosophy dovetails with [comments describing what code cannot](/books/aposd/13-comments-describe-what-code-cant).

## Section by section

### 10.1 What Qualifies as Documentation?

Everything supplemental an engineer writes: standalone documents *and* code comments — at Google, most documentation an engineer writes is comments.

### 10.2 Why Is Documentation Needed?

Comprehensible APIs reduce mistakes; stated design goals focus teams; documented processes and onboarding scale. But the benefits are downstream, and the obstacles are cultural: engineers see writing as a separate skill (it isn't), doubt their ability (you don't need "a robust command of English" — you need the audience's perspective), lack tooling integration, and treat docs as an extra burden rather than a maintenance aid. Writer benefits: API design feedback, a historical record for your own two-years-later self, a professionalism signal (well-documented and well-designed are highly correlated), and fewer repeated questions. The reader gets the lion's share.

### 10.3 Documentation Is Like Code

Documents should follow the code's disciplines: internal policies, source control, clear ownership, review of changes (changing alongside the code they document), bug tracking, periodic evaluation, and eventually measurement of accuracy/freshness (tools haven't caught up). Conflicting documents should be consolidated into a **canonical** source; easy `go/` links and placing docs next to code in the repo both promote canonicity.

**Case study: The Google Wiki.** GooWiki scaled badly: no owners meant obsolescence, no intake process meant duplicates (7–10 different documents on setting up Borg, "only a few of which seemed to be maintained"), a flat namespace bred no hierarchy, and — fatally — the people who could fix documents were not the people who used them. Quality sank until documentation was the top developer complaint (when GooWiki was deprecated, ~90% of its documents had no views or updates in months). Moving important docs under source control with owners, canonical locations, and bug-driven fixes fixed it — over the objection that review would raise the bar and kill the "bastion of freedom of information." It didn't: docs got better. Markdown lowered the editing barrier, and g3doc put documents beside source code so code and docs could change in the same CL. The key was leveraging existing workflows, not inventing new ones.

### 10.4 Know Your Audience

The canonical mistake: writing only for yourself. Identify the primary audience before writing and write to it — a design doc persuades decision makers, a tutorial hand-holds the utterly unfamiliar, a reference serves both novices and experts. You don't need to be a great writer: "if you can read, you can write," and your audience is just you-minus-the-domain-knowledge. Perfection is not the bar; a stake in the ground can be improved.

#### Types of Audiences

Audiences differ by experience level, domain knowledge, and purpose (quick-task end users vs. maintainers of the guts). For mixed audiences, keep documents **short**: write the long version, then edit — Pascal's "If I had more time, I would have written you a shorter letter." Two useful distinctions:

- **Seekers** (know what they want, checking if this fits) need *consistency* — uniform comment formats they can scan quickly.
- **Stumblers** (vague idea of what they need) need *clarity* — overviews at the top, and honesty about fit, e.g. "TL;DR: if you are not interested in C++ compilers at Google, you can stop reading now."

Also separate **customer** docs from **provider** docs: implementation details and design reasoning belong in design docs or hidden implementation comments, not in a published API reference.

### 10.5 Documentation Types

A document should have a singular purpose — like an API, do one thing well. The early-Google monolithic team wiki page (concept + reference + dozens of links, scrolling for screens) fails both purposes and length. Main types: reference, design docs, tutorials, conceptual docs, landing pages.

- **Reference documentation** (the daily bread, mostly code comments). Split by audience: **API comments** (no implementation details, no assumption of familiarity) vs. **implementation comments** (more domain knowledge assumed, but be methodical — people leave). Reference docs should be *single-sourced* from code where possible; Google documents C++ APIs in header files and skips separate generated docs because Code Search surfaces the definition itself.
  - **File comments**: outline contents, use cases, intended audience; an API that can't be described in a paragraph or two is probably not well designed.
  - **Class comments**: "nouned" — what the object contains, allows, and is for.
  - **Function comments**: begin with an active verb ("Merges...", "Deletes...") so a seeker can scan the header by verbs. Google avoids "Returns:/Throws:" boilerplate: one prose sentence covers postconditions, parameters, returns, and exceptions naturally, because they aren't independent.
- **Design docs**: usually required before major work; templates force consideration of security, privacy, storage, i18n, reviewed by domain experts — a form of code review before code. A good one covers goals, implementation strategy, and key decisions *with their trade-offs*; once approved it is both historical record and a launch-time yardstick of whether the goals still hold.
- **Tutorials**: the "Hello World" document, best written by whoever most recently joined (and best bug-hunted by them too). Write everything down assuming no setup, permissions, or domain knowledge; state prerequisites up front; number only *user* actions — the bad-tutorial example mixes server-side effects ("foobar will bootstrap a database") into user steps, while the improved version pairs every step with a user command, shown in monospace.
- **Conceptual documentation**: overviews that impart understanding; "if comments are the unit tests of documentation, conceptual documents are the integration tests." They may legitimately duplicate reference info and sacrifice completeness (even edge-case accuracy) for clarity — leave the exhaustive cases to the reference. Hardest to write, therefore most neglected; often no canonical home exists in code, so they live as separate documents (e.g., Abseil's StrFormat concepts doc).
- **Landing pages**: pure traffic cops. Link out; don't hold content; don't serve both "API user's entry point" and "team home page" — split them, because what the team needs and what customers need differ.

### 10.6 Documentation Reviews

To test whether documentation works, have someone else read it. Three review types: **technical** (accuracy, by a subject-matter expert, often part of the code review), **audience** (clarity, by someone unfamiliar with the domain), **writing** (consistency, by a technical writer or volunteer). Any one reviewer beats none, and workflow-integrated docs get continuous audience review via filed bugs anyway.

**Case study: The Developer Guide Library.** The C++ style guide stayed healthy where the wiki rotted because it had owners (style arbiters) and was canonical. g3doc directories give per-API docs de facto ownership; but cross-API sets (a "C++ Developer Guide" has no natural directory) got their own source-controlled depot organized by topic, curated by technical writers. Once canonical (cemented by `go/` links like go/cpp), competing documents were voluntarily merged in and deprecated, and engineers began filing bugs and sending CLs because they knew someone was maintaining it — authority and quality compound.

### 10.7 Documentation Philosophy

(Optional treatise on technical writing, flagged as such.)

- **WHO, WHAT, WHEN, WHERE, WHY.** Engineers jump straight to HOW (how does this work?), but the other five frame the document: call out the audience ("this document is for new engineers on the Secret Wizard project"), state the purpose (and move anything off-purpose elsewhere), note dates, keep docs in version control (Google Docs are for discussion until they become records — then move them), and summarize the WHY up front, checking against it afterwards.
- **The beginning, middle, and end.** Nearly every document has more than one thing to say; sections give readers a roadmap (even a Tip of the Week does problem → solution → takeaway). Embrace useful redundancy: introduce the key point early, then argue it in detail.
- **The parameters of good documentation**: completeness, accuracy, clarity — you rarely get all three. Completeness erodes clarity (document every case and you get a mess); clarity can cost strict accuracy. The resolution is the *job*: a good document is one doing its intended job, so decide the focus per type — concepts clarify and skim, references are complete, landing pages organize. And don't put design decisions in API docs; separate interface from implementation in prose as in code.
- **Deprecating documents.** Old documents mislead like old code. Remove or mark obsolete, pointing to the replacement; even an unowned "This no longer works!" note beats authoritative-looking rot. Google attaches **freshness dates** (`freshness: { owner, reviewed }` metadata) that email owners when a doc hasn't been reviewed in, say, three months — a low-cost freshness loop whose updates even require code review, and whose "Last reviewed by..." byline measurably increased adoption.

### 10.8 When Do You Need Technical Writers?

The old assumption — important projects get a writer, freeing engineers to move faster — was backwards. Teams write their *own* documentation fine (immediate feedback loop, shared assumptions); they need help writing for *other* audiences. Staffing writers per-team created a perverse incentive (become important, stop writing docs) and doesn't scale. Writers are a limited resource best spent on documents crossing API boundaries, where their outsider role is critical: "to challenge the assumptions your team makes about the utility of your project."

### 10.9 Conclusion

Documentation at Google improved but is still not a first-class citizen: tests are atomic, prescribed, and automated; documents are subjective, hard to automate, and judged by readers asynchronously. The change required is acceptance that engineers are both the problem and the solution — for code expected to live more than a few months, documenting it helps others and helps you maintain it.

### 10.10 TL;DRs

- Documentation is hugely important over time and scale.
- Documentation changes should leverage the existing developer workflow.
- Keep documents focused on one purpose.
- Write for your audience, not yourself.

## Key terms

- **Documentation as code**: ownership, source control, review, bug tracking, and periodic freshness checks applied to documents so they change alongside the code they describe.
- **Canonical documentation**: the single designated primary source for a topic, which competing documents get merged into and superseded by.
- **Seekers and stumblers**: seekers know what they want and need consistent, scannable formats; stumblers don't and need clear overviews and "you can stop reading now" signposts.
- **Freshness date**: metadata recording owner and last-reviewed date, with automated reminders, keeping documents from silently rotting.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
