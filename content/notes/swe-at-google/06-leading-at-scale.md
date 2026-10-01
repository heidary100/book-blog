---
title: "Leading at Scale"
book: swe-at-google
chapter: 6
date: 2026-10-01
summary: "The three Always of leadership: decide and iterate on trade-offs, build a self-driving team that succeeds without you, and protect your scarce time and energy."
tags: [teams]
---

> Scaling from leading a team to leading a team of teams means going broad instead of deep: you lose touch with technical detail and must rely on judgment and on other people. The chapter condenses this into "the three Always of leadership" — Always Be Deciding, Always Be Leaving, Always Be Scaling. The work is frustrating and often demoralizing until you notice you are having more impact than you ever did as an individual contributor.

## The big idea

Leadership at scale is not "being a better engineer over a bigger area." Your hard-won expertise becomes progressively less relevant; what matters is technical intuition and the ability to galvanize engineers toward good directions. You are still a servant leader — just serving a larger group — and the problems become larger and more *ambiguous*: no obvious solution, possibly no clean solution at all, only trade-offs to be explored and rebalanced over time.

The three Always give that job a shape. **Deciding**: ambiguous problems never have a silver bullet, only the best answer *for this month*. **Leaving**: success is an organization that solves the problem class by itself, with you absent — freeing you for the next problem. **Scaling**: success keeps generating more responsibility without more headcount, so the scarcest resource is your own time, attention, and energy, and protecting them is part of the job, not a luxury.

## Section by section

### 6.1 Always Be Deciding

As a leader of leaders, your job shifts from solving specific engineering tasks to high-level strategy — and most of those decisions are about finding the correct set of trade-offs. The chapter's process for ambiguous problems has three steps: identify the blinders, identify the key trade-offs, then decide and iterate.

**The parable of the airplane.** A theatrical sound designer tells of a 6 a.m. flight overfilled with 10,000 gallons of fuel: wait an hour for a fuel truck, or have twenty people get off. An indignant first-class passenger pays $40 each to twenty volunteers to take the earlier 8 o'clock flight — only for the plane's computer to then fail and the flight to be cancelled anyway. It is a story about trade-offs with unforeseeable consequences: sometimes the trade-off you "solve" isn't the one that bites you. Trade-offs apply to human behavior, not just technical systems.

**Identify the blinders.** Groups wrestling with a problem for years stop seeing it critically — they make unexamined assumptions ("this is how we've always done it") and evolve coping mechanisms to justify the status quo. Fresh eyes are a genuine leadership advantage: you can see the blinders and question them.

**Identify the key trade-offs.** Important, ambiguous problems have no answer that works forever in all situations. Your job is to name the trade-offs, explain them to everyone, and help decide how to balance them *now*.

**Decide, then iterate.** Make the best decision for this month, rebalance next month. Frame the process as continuous rebalancing, or teams fall into searching for the perfect solution and analysis paralysis. Lower the stakes explicitly: "We're going to try this decision and see how it goes. Next month, we can undo the change."

**Case study: Web Search latency.** A decade of "quality" improvements to search results — images, video, fact boxes, interactive UI — slowly poisoned the commons: the results page got slower and slower, even as networks got faster, because latency creeps up in 10 ms increments across thousands of changes. The historical blinder was that latency could only be fixed with a periodic "code yellow" (Google's term for an all-hands emergency optimization push), which bought a couple of months before latency crept back. The re-evaluation: "quality" has two costs — user latency and Google's serving capacity — forming a Good/Fast/Cheap triangle ("pick two"). Once latency became a first-class goal, data scientists could quantify exactly how much latency hurt engagement and trade it against quality gains, enabling month-by-month, data-driven rebalancing instead of triennial emergencies.

### 6.2 Always Be Leaving

Bharat Mediratta's paradoxical advice: it is not just your job to solve the ambiguous problem, but to get your organization to solve it *by itself, without you* — leaving "a trail of self-sufficient success" so you can move to the next problem. The antipattern is making yourself a single point of failure (SPOF). Litmus tests: if you the leader disappeared, would the team keep succeeding? Did you check work email on your last week-long vacation? If things fall apart without your attention, you have made yourself an SPOF and need to fix it.

**Your mission: build a "self-driving" team.** A self-sufficient organization needs strong leaders, healthy processes, and a self-perpetuating culture. Three parts:

- **Divide the problem space.** Put teams on subproblems, but keep structure loose enough to adapt when the subproblems shift — a fine line between "too rigid" and "too vague." For Search latency, Google split the work into *symptoms* (optimize the existing codebase for speed) and *causes* (stop engineers from re-adding latency: metrics gaps, analysis tools, developer education) — teams owning *problems*, not specific solutions.
- **Delegate subproblems.** Delegation is hard because it violates every efficiency instinct ("if you want something done right, do it yourself"). Before doing a 20-minute task, ask: *Am I really the only one who can do this?* Unless it is on fire, hand it to someone who will take longer, and coach — failure and retry is how leaders learn. The mirror question: *What can I do that nobody else on my team can do?* Good answers: shield teams from politics, encourage them, build humility/trust/respect, manage up — and above all, see the forest through the trees: define the high-level technical *and* organizational strategy.
- **Adjust and iterate.** Once the machine runs itself, steer with a gentle touch. The chalk-mark parable (a retired Master fixes a machine with one chalk X and bills $1 for the chalk, $9,999 for knowing where to put it) is the model: "95% observation and listening, and 5% making critical adjustments in just the right place." Listen to leaders, skip-reports, and customers (for infrastructure teams, your coworkers). Regressing into micromanagement makes you an SPOF again — "Always Be Leaving" is a call to macromanagement.

**Take care in anchoring a team's identity.** Anchor teams to problems, not solutions. "The team that manages the Git repositories" will defend its solution and resist change, because the solution became its identity; "the team that provides version control" is free to swap solutions as better ones appear. Problems, unlike products, can be evergreen.

### 6.3 Always Be Scaling

Here "scaling" is defensive and personal: your most precious resource is a limited pool of time, attention, and energy, and scaling your responsibilities without protecting your sanity is doomed.

**The cycle of success.** Teams follow a spiral: *Analysis* (find blinders and trade-offs, build consensus) → *Struggle* (herd cats, form and listen to opinions, fake confidence if you must — imagine a real expert is on vacation and you're subbing) → *Traction* (smarter decisions, rising morale, the organization starts driving itself) → *Reward* (a new, equally hard problem lands — without more people). That last step is the **compression stage**: run the original problem with half the people in half the time so half your team can take the new work. Hiring rarely keeps pace; the spiral is, in Larry Page's phrase, "uncomfortably exciting."

**Important versus urgent.** Leadership work becomes reactive — you are "the 'finally' clause in a long list of code blocks," and email/chat/meetings feel like a denial-of-service attack on your attention. Eisenhower's 1954 line applies: "The urgent are not important, and the important are never urgent." Pure reactive mode spends all your time on urgent-but-unimportant work; building the meta-strategy is important and almost never urgent. Techniques: delegate urgent things (good training even if slower), block two-plus hours regularly for important-but-not-urgent work, and adopt a real tracking system (GTD, Bullet Journal, whatever clicks) rather than Post-Its.

**Learn to drop balls.** With too many balls in the air, dropping some is inevitable — so drop them *deliberately* rather than accidentally. Borrowing Marie Kondo's 20/60/20 decluttering insight (the real work is identifying the critical top 20%, then discarding the other 80%): classify incoming demands, work strictly the critical top 20% that only you can do, and give yourself explicit permission to drop the rest. Two things then happen: subleaders notice and pick up the middle 60% themselves, and anything truly critical migrates back up into your top 20% anyway.

**Protecting your energy.** Stamina builds like marathon training, but energy must also be *managed*: take real vacations (a weekend is not one; it takes a week to feel refreshed, and checking email destroys the psychological distancing), make disconnecting trivial (leave the laptop; put work apps in a phone work profile you can disable with one button), take real weekends, ride the brain's 90-minute cycles with short walks, and take a mental health day when a bad mood would otherwise set a terrible tone for everyone around you. Managing energy matters as much as managing time.

### 6.4 Conclusion

Taking on more responsibility is natural and good — but unless you learn to decide quickly, delegate, and manage the load, you will feel overwhelmed. Effective leadership is not perfect decisions, doing everything yourself, or working twice as hard: always be deciding, always be leaving, always be scaling.

### 6.5 TL;DRs

- **Always Be Deciding**: ambiguous problems have no magic answer, only the right trade-offs of the moment — so iterate.
- **Always Be Leaving**: build an organization that solves the class of problem over time without you present.
- **Always Be Scaling**: success generates responsibility; proactively manage the scale-up to protect your time, attention, and energy.

## Key terms

- **Always Be Deciding / Leaving / Scaling**: the chapter's three-part recipe for leadership at scale — iterate on trade-offs, build a self-sufficient organization, and defend your personal capacity.
- **Bus factor**: the number of people that need to be hit by a bus before a project is doomed; the leader-as-SPOF is a bus factor of one.
- **Code yellow**: Google's term for an emergency hackathon — teams suspend all other work and focus 100% on the critical problem until the emergency is declared over.
- **Compression stage**: the step in the cycle of success where a solved problem must be shrunk to half the people and half the time so the organization can absorb a new one.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
