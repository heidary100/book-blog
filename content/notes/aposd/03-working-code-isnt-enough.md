---
title: "Working Code Isn't Enough"
book: aposd
chapter: 3
date: 2026-09-30
summary: "Working code isn't enough: adopt a strategic mindset and invest 10–20% of development time in design, which pays for itself within months."
tags: [strategic-vs-tactical, mindset]
---

> Good design depends less on any single technique than on the mindset you bring to each programming task. Tactical programming — get it working as fast as possible — adds a little complexity to every change until the code base is a mess. Strategic programming invests 10–20% of development time in design improvements: it costs a little now and pays for itself within months.

## The big idea

The most important element of good software design is the mindset you adopt toward each task. Most organizations encourage a tactical mindset focused on getting features working as quickly as possible; it sounds unimpeachable — what could matter more than working code? — yet tactical programming is short-sighted and makes a good system design nearly impossible. The strategic alternative rests on one realization: working code isn't enough. Most code in any system is written by extending the existing code base, so a developer's most important job is to facilitate those future extensions: "Your primary goal must be to produce a great design, which also happens to work."

That requires an investment mindset — accept being a bit slower today to be much faster later. Figure 3.1 sketches the trade: the tactical approach starts ahead and then decays as accumulated complexity bites; the strategic approach starts 10–20% behind and crosses over within months, after which investments are effectively free. (The curves are explicitly qualitative; Ousterhout offers no empirical measurements.)

## Section by section

### 3.1 Tactical programming

The tactical programmer's main focus is getting something working — a new feature or a bug fix — as fast as possible. Under deadline pressure you don't look for the best design, and a bit of added complexity or a small kludge or two seems a fair price for finishing today. Because complexity is incremental (Chapter 2), this is how systems rot: every task contributes a few small complexities, each seemingly a reasonable compromise, and they accumulate rapidly — faster still if everyone programs tactically. When the early shortcuts start causing problems, refactoring would help in the long run but slows the current task, so you patch — creating more complexity that needs more patches. Soon the code is a mess that would take months to clean up, the schedule can't tolerate that, and fixing one or two problems seems pointless, so the tactical loop continues. Once you start down this path, it is difficult to change.

Almost every organization has at least one developer who takes this to the extreme: a **tactical tornado**, a prolific programmer who pumps out features far faster than others, in a totally tactical fashion. Some managements treat them as heroes; the engineers who must work with their wake of destruction do not. Others must clean up the messes — which makes those engineers (the real heroes) look like they are making slower progress.

### 3.2 Strategic programming

The first step toward becoming a good designer is realizing that working code isn't enough, and that introducing unnecessary complexity to finish the current task faster is not acceptable; the most important thing is the long-term structure of the system. Investments come in two flavors. *Proactive*: take a little extra time to find a simple design for each new class — try a couple of alternative designs rather than the first idea; imagine a few ways the system might need to change in the future and make sure that would be easy; write good documentation. *Reactive*: design mistakes will surface no matter how much you invest up front; when you discover one, don't ignore it or patch around it — take a little extra time to fix it. Strategic programmers continually make small improvements to the design; tactical programmers continually add small bits of complexity.

### 3.3 How much to invest?

Not a huge up-front investment — designing the entire system in advance is the waterfall method, and the ideal design emerges in bits and pieces with experience. The right shape is lots of small continual investments: about **10–20% of total development time** — small enough not to impact schedules significantly, large enough to produce significant benefits. Initial projects take 10–20% longer than a purely tactical effort; benefits appear within a few months; and soon you are developing at least 10–20% faster than you would have tactically, at which point past investments pay for future ones and the investment becomes free. The mirror image: tactically you finish your first projects 10–20% faster, then spend the rest of the system's life at least 10–20% slower — anyone who has worked in a badly degraded code base will tell you poor quality slows development by at least 20%.

This is **technical debt**: borrowing time from the future, repaying more than you borrowed — and unlike financial debt, most technical debt is never fully repaid; you keep paying forever. Where is the crossover between the curves? No data exists (a convincing controlled experiment would be very difficult), but Ousterhout's opinion is a payback in **6–18 months**, largely because within a few months developers have forgotten most of the context they had when they wrote the code, so complex code taxes them quickly.

### 3.4 Startups and investment

Early-stage startups feel tremendous pressure to ship, and many go tactical — little effort on design, less on cleanup — rationalizing that success will fund engineers to clean things up later. Two counters: once a code base turns to spaghetti it is nearly impossible to fix, so you pay high development costs for the life of the product; and the payoff for good design comes quickly, so the tactical approach may not even speed up the first release. There is also a hiring argument: a company's success depends heavily on engineer quality; the best engineers care deeply about good design; a wrecked code base gets a reputation, makes recruiting harder, and leaves you with mediocre engineers — degrading the system further.

**Facebook** is the visible example. For years its motto was "Move fast and break things," and new graduates pushed commits to production in their first week — great for a reputation of empowering engineers with few rules — but the code base became unstable, hard to understand, with few comments or tests; the motto eventually became "Move fast with solid infrastructure." In fairness, Facebook isn't much worse than the startup average; tactical programming is commonplace there, just particularly visible. **Google and VMware** grew up in the same era with strategic cultures, heavy emphasis on high-quality code and good design, and sophisticated reliable products; their strong technical reputations let them out-recruit nearly everyone. Either approach can succeed as a business — but it is a lot more fun to work in a company that cares about design.

### 3.5 Conclusion

Good design doesn't come for free: it must be invested in continually, so small problems don't accumulate into big ones — and it eventually pays for itself, sooner than you might think. Consistency is crucial, and investment must be treated as something to do today, not tomorrow: after the current crunch there will almost certainly be another, and another; postponed cleanups become permanent and the culture slips tactical. The longer design problems wait, the bigger and more intimidating they become. The most effective approach is one where every engineer makes continuous small investments in good design.

## Key terms

- **Tactical programming**: mindset whose main focus is getting something working as quickly as possible; short-sighted, and the engine of incremental complexity.
- **Strategic programming**: mindset whose primary goal is a great design that also happens to work; working code alone is not enough.
- **Investment mindset**: continually spending about 10–20% of development time on proactive and reactive design improvements.
- **Tactical tornado**: a prolific programmer who produces features extremely fast in a totally tactical fashion, leaving a wake of complexity others must clean up.
- **Technical debt**: the time borrowed from the future by tactical programming; repaid with interest, and mostly never fully repaid.

## My takeaways

<!-- Fill in as you re-read and apply the chapter. -->
-
