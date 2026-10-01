---
title: "Deprecation"
book: swe-at-google
chapter: 15
date: 2026-10-01
summary: "Code is a liability, not an asset — functionality is the asset. Deprecation (advisory vs. compulsory) is the discipline of removing obsolete systems, and it must be planned at design time, staffed explicitly, and enforced with tooling."
tags: [deprecation, design-process]
---

> "Code is a liability, not an asset" — the functionality it provides is the asset, so the goal is maximizing functionality per unit of code, and the cheapest way to improve that metric is deleting code that no longer earns its keep. Deprecation — orderly migration away from and removal of obsolete systems — is hard because removal is "the ultimate change": Hyrum's Law guarantees unexpected dependents, and the politics of funding removal while new-feature work looms are brutal. Advisory deprecations ("hope is not a strategy") rarely finish; compulsory ones need deadlines, a staffed expert team, and the power to break noncompliant users.

## The big idea

Deprecation belongs to software *engineering* rather than programming because it's about managing a system over time — and unlike most topics in this book, Google admits it is still learning how to do this well. The economics: obsolete systems cost ongoing maintenance, esoteric expertise, and growing divergence from the surrounding ecosystem; two systems doing the same job must interoperate, accrete mutual dependencies, and — worst of all — force the new system to keep maintaining compatibility with the old, impeding its evolution. But age alone doesn't justify removal (LaTeX has been refined for decades), and poorly executed deprecation can cost more than leaving the system alone. Deprecation fits when a system is *demonstrably obsolete* and a comparable replacement exists.

The chapter's most counterintuitive claims: removal work must be staffed as a first-class project (delegated to users, it becomes advisory and never finishes; leaving it unowned means maintaining everything forever), and design determines degradability — like nuclear plants that budget for decommissioning from day one, systems should be built to be eventually removed. Even the emotional dimension is addressed: engineers resist tearing down what they built ("I like this code!"), which Google softens by making the history of deleted code permanently searchable. There's also a planning lesson: in-place, incremental evolution is usually cheaper than wholesale replacement, whose costs are "frequently underestimated." The tension of honestly pricing deprecation — diffuse ecosystem costs of parallel systems versus diffuse removal costs — has direct echoes in how breaking interfaces and change costs are treated in [Pragmatic Projects](/books/pragmatic-programmer/09-pragmatic-projects).

## Section by section

### 15.1 Why Deprecate?

The premise: code carries creation costs but also lifetime costs — operational resources, ecosystem updates — so keeping vs. turning down an aging system is a trade-off to evaluate. Age is not obsolescence; the target is systems that are demonstrably obsolete *and* have a comparable replacement (more efficient, more secure, more sustainable, or just bug-fixed). Two parallel systems seem tolerable but metastasize: transformation code between them, mutual dependencies that make either removal harder, and a compatibility drag on the new system's evolution. The reframing: code itself delivers no value — functionality does — so "we should instead focus on how much functionality it can deliver per unit of code and try to maximize that metric," and removing excess code is the easiest lever. One organizational caveat, via the paving-roads metaphor: there's a limit to how much simultaneous deprecation an organization (and its customers) can absorb — close every road for repaving at once and nobody goes anywhere. Choose deprecation projects carefully and commit to finishing them.

### 15.2 Why Is Deprecation So Hard?

Four compounding difficulties:

- **Hyrum's Law**: more users means more unexpected usage "that just happens to work"; removal is the ultimate change — not modifying behavior but eliminating it — and shakes loose surprising dependents.
- **The replacement is different**: a new system identical to the old would benefit nobody, so a one-to-one migration match is rare and every use of the old system must be evaluated in the new one's context.
- **Emotional attachment**: engineers resist demolishing what they spent years building. Google's countermeasure is psychological rather than technical: the repository is searchable historically, not just at trunk — removed code can always be found again. And the standing joke: "there are two ways of doing things: the one that's deprecated, and the one that's not-yet-ready," which good documentation, signposts, and migration experts help users navigate.
- **Politics and funding**: staffing removal costs visible money; letting a system "lumber along unattended" has costs that are not readily observable. Stakeholders resist anything that dents feature development. Productivity research (Chapter 7) can supply concrete evidence for a deprecation's worth.

Given all this, evolving a system in place is usually easier than replacing it: incrementalism doesn't avoid deprecation but breaks it into manageable chunks with incremental benefits.

### 15.3 Deprecation During Design

Deprecation can be planned at build time — language choice, architecture, team composition, and culture all affect eventual removability. The model is the nuclear power plant, whose *design* must account for decommissioning, down to allocated funds (per IAEA guidance). Software rarely gets this treatment: engineers prefer building to maintaining, ship-fast cultures disincentivize degradability, and it's psychologically hard to plan the demise of what you're building. Two design-time questions for teams: *How easy will it be for consumers to migrate to a potential replacement?* and *How can parts of the system be replaced incrementally?* Both mostly concern how the system provides and consumes dependencies. And the commitment point is the project's birth: once built, the options are support it, carefully deprecate it, or let it break on some external event — each valid, each organization-specific (a startup kills its one product by dying; a large company weighs portfolio and reputation). The summary rule: "don't start projects that your organization isn't committed to support for the expected lifespan of the organization."

### 15.4 Types of Deprecation

A continuum from "we'll turn this off someday, we hope" to "this is going away tomorrow," split into two modes.

#### Advisory Deprecation

No deadline, no dedicated resources — "aspirational" deprecation. Useful for advertising a new system and encouraging early adopters, with two conditions: the new system must be production-ready (not beta — once the old one is deprecated, the new one is critical infrastructure and must support new users indefinitely), and its benefits must be *transformative*, not incremental — users won't self-migrate for marginal gains. The trap: a deprecation warning plus walking away produces only slightly fewer new uses of the old system, never active migration, because existing uses exert "a sort of conceptual (or technical) pull" — new uses concentrate on the familiar system regardless of the "please use the new system" notices. As SRE says: "Hope is not a strategy."

#### Compulsory Deprecation

A deadline past which dependents break. Counterintuitively, it scales by *localizing* migration expertise in one expert team — usually the one removing the system — which has the incentives and accumulates tools reusable across the organization (much of it the LSC machinery of Chapter 22). Two necessities:

- **Enforcement**: the schedule may flex, but the deprecating team must be empowered to break noncompliant users after sufficient warning — otherwise customer teams rationally defer deprecation in favor of features.
- **Staffing**: an unfunded compulsory deprecation reads as mean-spirited — customers experience it as "running to stay in place" and friction follows. Compulsory deprecations should be actively staffed by a specialized team through completion.

Even policy-backed compulsory deprecation faces political limits: if the last user is critical infrastructure, breaking it (and transitively everyone downstream) for an arbitrary deadline is unthinkable — and a team that can veto makes the "compulsory" dubious. Since unknown dependencies exist even in a monorepo, Google discovers them dynamically: **planned outages of increasing duration** before turndown (DiRT-style — see what breaks, alert the affected teams, possibly adjust the timeline) and occasionally **renaming implementation-only symbols** to expose users depending on them unaware. Static dependencies, by contrast, are usually fully discoverable via static analysis.

### 15.5 Deprecation Warnings

Warnings are the programmatic marker for both modes, but left alone they accumulate — especially transitively (A depends on B depends on C; C's warning surfaces in A's build) — until users ignore them entirely, the healthcare phenomenon of **alert fatigue**. A useful warning needs two properties:

- **Actionable**: the average engineer can actually perform the indicated action — replace the call with its updated counterpart, follow the outlined data-migration steps — not just in theory.
- **Relevant**: it surfaces when the user can act — warn about a deprecated function *while the engineer is writing the call*, not weeks after check-in; send migration emails months before removal, not the weekend before.

Resist warning on everything: Google is liberal *marking* old functions `@deprecated` but uses tooling (ErrorProne, clang-tidy) to surface warnings in targeted ways — limited to newly changed lines to catch new uses, with more intrusive warnings (e.g., on deprecated targets in the dependency graph) reserved for compulsory deprecations with a team actively migrating users. Tooling matching message, audience, and moment is what allows many warnings without fatigue.

### 15.6 Managing the Deprecation Process

Deprecation is managed like any engineering project — with a few inversions.

#### Process Owners

Without explicit owners, no amount of warnings makes meaningful progress. The alternatives to staffing owners are both worse: never deprecate anything (maintain every old system ad infinitum) or delegate migration to users (which is just advisory deprecation, which never organically finishes). Abandoned projects are the classic ownership problem — "the original owners have moved on to a successor project, leaving the obsolete one chugging along in the basement, still a dependency of a critical project" — and such projects do not fade away on their own; they need deprecation experts with removal as their *primary* goal, because side-project cleanup always loses to urgent work. Important-but-not-urgent removal tasks are a great fit for 20% time.

#### Milestones

Building a system yields incremental wins users celebrate; deprecation can feel like it has one milestone — turning out the lights — and the team feels no progress until then. Worse, if done well, final removal "is often the least noticed by anyone external to the team, because by that point, the obsolete system no longer has any users." Managers should define measurable incremental milestones that deliver value — deleting a key subcomponent, e.g. — and celebrate them like launch achievements; removal itself might not even happen in every deprecation project.

### 15.7 Deprecation Tooling

Three categories (the tools themselves live in Chapters 17, 19, 22, 23).

#### Discovery

Know how and by whom the system is used — early and continuously, since unanticipated uses may even force revisiting the deprecation decision. Statically: Code Search and Kythe identify customers of a library and sample usage to find unexpected behaviors; since runtime dependencies usually require a static library or thin client anyway, static analysis yields most of the picture, with production logging and runtime sampling covering dynamic dependencies. And the **global test suite is treated as an oracle**: when all references to an old symbol are truly gone, tests prove it — which makes customers responsible for having sufficient testing that removal won't harm them.

#### Migration

The bulk of actual migration uses the standard code generation and review tooling — especially the large-scale change (LSC) process for sweeping the codebase onto new libraries or runtime services.

#### Preventing Backsliding

The overlooked piece: stopping *new* uses of the thing being removed, without which deprecation becomes demoralizing whack-a-mole — users keep copying familiar patterns (or finding examples in the codebase), the team keeps migrating them. Micro level: owners annotate deprecated symbols (`@deprecated`), and the Tricorder static-analysis framework surfaces new uses at code-review time with owner-controlled messaging and, in limited cases, push-button migration fixes. Macro level: build-system **visibility whitelists** gate which dependencies may still reference the deprecated system, and automated tooling periodically prunes the whitelist as dependents migrate away.

### 15.8 Conclusion

Deprecation can feel like "cleaning up the street after the circus parade has just passed through town," yet it reduces maintenance overhead and cognitive burden — the ecosystem improves. Scalable long-lived software means being able to *remove* systems, not just build and run them; a complete deprecation process manages social and technical challenges through both policy and tooling.

### 15.9 TL;DRs

- Software systems have continuing maintenance costs that should be weighed against the costs of removing them.
- Removing things is often more difficult than building them, because existing users are often using the system beyond its original design.
- Evolving a system in place is usually cheaper than replacing it, when turndown costs are included.
- Honest cost evaluation is hard: the ecosystem costs of multiple similar systems (interoperation burden, drag on the new system's development) are diffuse and hard to measure — and so are deprecation and removal costs.

## Key terms

- **Deprecation**: the process of orderly migration away from, and eventual removal of, an obsolete system.
- **"Code is a liability, not an asset"**: code costs money to keep; the *functionality* it delivers is the asset — so maximize functionality per unit of code, partly by deleting dead code.
- **Advisory (aspirational) deprecation**: no deadline, no resources, no enforcement — effective only for advertising transformative replacements; "hope is not a strategy."
- **Compulsory deprecation**: deadline-based removal backed by an enforcement mechanism and a staffed expert team empowered to break noncompliant users after sufficient warning.
- **Actionable and relevant warnings**: a warning must state next steps an average engineer can perform, and surface at the moment the action is possible (at write time, not weeks later).
- **Alert fatigue**: the numbing that happens when accumulated (especially transitive) deprecation warnings train users to ignore them.
- **Backsliding prevention**: tooling that blocks or flags *new* uses of a deprecated system — Tricorder review-time warnings on changed lines, `@deprecated` annotations, build-system visibility whitelists.
- **Planned-outage probing**: staged outages of increasing duration before turndown (DiRT-style) to surface unknown runtime dependencies by seeing what breaks.
- **LSC (large-scale change)**: the tooling/process for sweeping the codebase onto replacements — the migration workhorse.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
