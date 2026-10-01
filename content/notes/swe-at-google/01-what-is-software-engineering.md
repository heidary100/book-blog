---
title: "What Is Software Engineering?"
book: swe-at-google
chapter: 1
date: 2026-10-01
summary: "Software engineering is programming integrated over time: time, scale, and high-stakes trade-offs turn code into a problem of sustainability and scaling cost."
tags: [mindset, complexity, design-process]
---

> Programming produces code; software engineering keeps that code valuable for as long as it needs to live. The two differ in dimensionality — time, scale, and the complexity of trade-offs — not in quality or virtue. Google's one-line thesis: "Software engineering is programming integrated over time."

## The big idea

Reasonable answers to "what is the expected life span of your code?" vary by a factor of about 100,000 — from a script run once to Google Search or the Linux kernel, with no predictable endpoint. Short-lived code is "just" programming, the way a cube compressed in one dimension becomes a square. As life spans grow, most dependencies will eventually change, and the project must react. That capability is **sustainability**: for the expected life of the software, you can respond to whatever valuable change comes along — you might choose not to upgrade, but you are not *unable* to.

The second axis is scale: "The multiperson development of multiversion programs" (an early NATO-conference definition). A programming task is individual creation; software engineering is a team effort whose policies must stay efficient as the organization grows. The third is decision-making: engineers weigh trade-offs with high stakes and imperfect metrics, and Google insists those choices be reasoned and explicit — "because I said so" is where bad decisions lurk. Google's practices are a report from one ecosystem (decades-long code, tens of thousands of engineers); most work at smaller scales too, and overheads unique to super-large scale are flagged as warnings.

## Section by section

### 1.1 Time and Change

- Novice code lives hours or days; mobile apps are short-lived and rewritten freely; a serial startup developer can have ten years of experience and never maintained anything past two years. At the other extreme, Google Search, the Linux kernel, and Apache HTTP Server have effectively unbounded life spans — most Google projects assume they live indefinitely. ("Life span" means *maintenance* lifetime, not execution lifetime.)
- Somewhere in between — empirically around 5–10 years — a project must start reacting to changing externalities. The first unplanned upgrade is brutal for three compounding reasons: hidden assumptions have been baked in, the engineers lack experience, and the backlog is several years' worth at once.
- Teams that survive one painful upgrade often vow "never again," choosing between endless rewrites and stagnation. The responsible move is usually to invest in making upgrades cheap — and to distinguish "happens to work" from "is maintainable."

### 1.2 Hyrum's Law

- **"With a sufficient number of users of an API, it does not matter what you promise in the contract: all observable behaviors of your system will be depended on by somebody."**
- It's entropy for maintenance: never eradicated, only understood and mitigated. Given enough time and users, even innocuous changes break something, so a change's value must be weighed against the cost of finding and fixing breakages.
- Clear interface promises buy freedom, but change difficulty tracks how *useful* users find an observable behavior — not what the contract says.

### 1.3 Example: Hash Ordering

- Hash-set iteration order is unspecified, yet over decades three forces converge: hash-flooding attacks reward nondeterministic ordering, efficiency research demands reorderable containers, and per Hyrum's Law programmers will depend on the order anyway.
- The nuanced answer: relying on hash order is fine for short-lived code with a frozen environment, wrong for code whose dependencies might ever change. Indirect dependencies count too — serialize a set into an RPC response and your caller may depend on the order.
- Even randomized ordering has victims: code that uses hash iteration as a random-number generator. Hence the motto: "It's programming if 'clever' is a compliment, but it's software engineering if 'clever' is an accusation." Expected life span decides which style fits.

### 1.4 Why Not Just Aim for "Nothing Changes"?

- Pure C with POSIX-like stability might genuinely avoid refactoring. Most stacks change far more — and security flaws surface everywhere (Heartbleed, Meltdown, Spectre). Being unable to patch because you promised nothing would change is a massive gamble.
- Efficiency drifts with no mistake: the widening CPU-cycle/memory-latency gap makes once-optimal structures (linked lists, binary search trees) pessimal on modern hardware. Backward compatibility keeps old code running, not fast.
- Change isn't inherently good, but the *capability* to change is — and like restoring from tape, it's cheap only with practice. Parallels how complexity compounds incrementally: [/books/aposd/02-the-nature-of-complexity](/books/aposd/02-the-nature-of-complexity).

### 1.5 Scale and Efficiency

- A codebase is sustainable "when you are able to change all of the things that you ought to change, safely, and can do so for the life of your codebase." Expensive changes get deferred; superlinear costs aren't scalable.
- Three finite resources must scale: human time, compute for the development workflow (test clusters), and the codebase/tooling itself (build time, fresh clones, upgrade cost). These degrade slowly — the boiled-frog problem — so only organization-wide awareness keeps them in check.
- Rule: everything the organization does *repeatedly* must scale linearly or better in human effort. An engineer produces roughly constant lines of code per unit time, so a codebase grows linearly with engineer-months — tasks whose cost scales with lines of code are in trouble.

### 1.6 Policies That Don't Scale

- The test: imagine the org 10–100x larger. Does each engineer's workload grow with org or codebase size? Un-automated growth means a scaling problem.
- Deadline deprecation ("delete the old Widget on August 15") pushes migration onto every customer team; as the dependency graph grows, churn dominates. Google's 2012 **Churn Rule** instead requires infrastructure teams to migrate their users themselves or update in place: experts learn the whole problem once and apply it everywhere, whereas every forced user ramps up, solves one case, and throws the knowledge away. Expertise scales.
- Long-lived dev branches scale badly too: each merge forces resync/retest costs on every other branch — fine at 5–10 branches, ruinous beyond.

### 1.7 Policies That Scale Well

- The **Beyoncé Rule** ("if you liked it, you should have put a CI test on it"): if a product breaks after an infrastructure change but CI didn't catch it, it's not the infrastructure change's fault. Bespoke one-off tests don't count — hunting every team's test setup was feasible at 100 engineers, impossible at 10,000.
- Shared forums scale superlatively: knowledge is viral, experts are carriers. One helpful Java expert answering questions gradually produces a hundred engineers writing better Java.

### 1.8 Example: Compiler Upgrade

- The storied 2006 upgrade: five years without updating compilers, several thousand engineers, a mostly volunteer effort full of workarounds. Hyrum's Law dependencies on compiler specifics made it painful, and with no CI or Beyoncé Rule the volunteers risked blame for regressions.
- The uncommon part was the response: automation (one human does more), consolidation/consistency (limited problem scope), and expertise (few humans do more). Code that survives regular upgrades depends on language abstractions, not implementation nuances — and the first upgrade is always the most expensive.
- Five factors now make upgrades cheap: expertise (hundreds done), stability (some languages upgraded weekly), conformity (little un-upgraded code left), familiarity (redundancy gets automated, like SRE's "toil"), and policy (Beyoncé Rule). The counterfactual — a frozen 2006 compiler — would cost ~25% extra compute and leave them exposed to speculative-execution attacks.

### 1.9 Shifting Left

- Finding problems earlier in the workflow (design → implementation → review → testing → commit → canary → production) is cheaper. The term comes from security: a flaw fixed by its author before commit costs far less than one triaged in production.
- Static analysis, code review, and CI all push detection left; no single tool must be perfect because the approach is defense in depth.

### 1.10 Trade-offs and Costs

- Google dislikes "because I said so": every topic has a decider with clear escalation paths, but the goal is consensus, not unanimity — "I don't agree with your metrics, but I see how you got there" is acceptable. Every decision needs a reason.
- "Cost" spans financial, resource (CPU), personnel (engineering effort), transaction (cost to act), opportunity (cost of *not* acting), and societal costs — the last magnified to the detriment of marginalized groups at billions of users.
- Watch biases (status quo, loss aversion). Financial cost is rarely the limiting factor; personnel cost is — a 10–20% swing in engineer focus and engagement easily dominates other savings.

### 1.11 Example: Markers

- Most offices ration whiteboard markers; Google leaves closets unlocked — an explicit trade: obstacle-free brainstorming beats protecting markers that cost under a dollar.
- Apply the same eyes-open weighing from office supplies to global services. "Data-driven" is a simplification — evidence, precedent, and argument count. A decision is legitimate for only two reasons: "we must" (legal/customer requirements) or "it's the best option we can see" (per an appropriate decider) — never "I said so."

### 1.12 Inputs to Decision Making

- Two scenarios: all quantities measurable (CPUs vs RAM vs engineer-weeks), or some subtle and unmeasurable (cost of a bad API, societal impact).
- For the first, publish conversion tables so any engineer can reason — "spend two engineer-weeks to trade five gibibytes of RAM for two thousand CPUs" — including the opportunity cost of that engineer's time.
- For the second, no formula exists: rely on experience, leadership, precedent, and research into quantifying the unquantifiable, treating such decisions with equal or greater care.

### 1.13 Example: Distributed Builds

- Mid-2000s Google built locally on ever-bigger desktops that mostly sat idle; a distributed build system recouped enormous engineer time.
- Unintended consequence: nobody felt build pain anymore, so incentives to keep builds lean vanished and bloated build dependencies ran rampant — the Jevons Paradox (consumption rises as efficiency improves). The fix: new best practices (small, machine-managed dependencies) and funded tooling.

### 1.14 Example: Deciding Between Time and Scale

- Time and scale usually cooperate, but fork-vs-reuse pits them against each other. Forking lets you optimize for your narrow case and control when you react to change; reusing means one security fix covers everyone.
- Guidance: forks are riskier for long-lived projects and especially for interfaces crossing time and project boundaries — data structures, serialization formats, networking protocols. Consistency has great value, but a carefully scoped fork can win.

### 1.15 Revisiting Decisions, Making Mistakes

- Decisions rest on the data available at the time; data, context, and assumptions change, so long-lived organizations must revisit decisions. Deciders need the right to admit mistakes — leaders who do earn more respect, not less.
- Be evidence driven, but unmeasurable things can still matter; exercising that judgment is what leadership is for.

### 1.16 Software Engineering Versus Programming

- No value judgment: a decade-long, hundred-person project isn't inherently worth more than a two-person one-month tool. They are different domains with different constraints and best practices — integration tests and continuous delivery are overkill for a weekend script; SemVer and dependency management don't matter for one-off code.
- Crisply: programming is the immediate production of code; software engineering is the policies, practices, and tools that keep code useful for its whole life span and make team collaboration possible.

### 1.17 Conclusion

- Google doesn't claim its way is the one true way — it's proof by example that a sustainable codebase and culture can be built. The general question the book answers: "how do you maintain your code for as long as it needs to keep working?"

### 1.18 TL;DRs

- Software engineering adds maintenance over the code's life span to programming; life spans vary by 100,000x, so no one set of best practices fits both ends.
- Sustainability is the *capability* to react to change; Hyrum's Law guarantees all observable behavior will be depended on eventually.
- Every repeated task should scale (linear or better) in human effort; watch for boiled-frog inefficiencies; expertise plus economies of scale pays off.
- Decisions need reasons — data, precedent, argument — never "because I said so"; being data driven means revisiting decisions when the data changes.

## Key terms

- **Hyrum's Law**: with a sufficient number of users of an API, all observable behaviors of the system — promised or not — will be depended on by somebody.
- **Sustainability**: for the expected life span of the software, being *capable* of reacting to valuable change in dependencies, technology, or product direction (whether or not you choose to).
- **Shift left**: moving problem detection earlier in the developer workflow, where fixes are cheapest.
- **Beyoncé Rule**: "if you liked it, you should have put a CI test on it" — outages not caught by CI are not the infrastructure change's fault.
- **Churn Rule** (2012): infrastructure teams must migrate their users to new versions themselves, or update in place, rather than pushing migration work onto customers.
- **Technical debt** (chapter's working definition): things that "should" be done but aren't yet — the delta between the code and what you wish it was.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
