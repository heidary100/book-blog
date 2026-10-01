---
title: "How to Work Well on Teams"
book: swe-at-google
chapter: 2
date: 2026-10-01
summary: "Hiding work is born of the Genius Myth and is harmful; healthy collaboration is rebuilt around three pillars — humility, respect, and trust."
tags: [teams]
---

> Software development is a team endeavor, but insecurity pushes engineers to hide work-in-progress behind the fantasy of the lone genius. Hiding is risky: you miss early feedback, shrink your project's bus factor, and slow down. The fix is cultural — reorganize your behavior around humility, respect, and trust.

## The big idea

Humans are "mostly a collection of intermittent bugs," and the only variable you fully control is yourself — so the chapter starts there. Around 2008, the maintainers of Google Code noticed a pattern in feature requests: hide these branches, let projects start secret, wipe history. The common theme is insecurity — fear of being judged for unfinished work — and insecurity is a symptom of a larger cultural problem: the **Genius Myth**, our instinct to credit a team's achievement to one hero. Linus wrote the tip of an iceberg; thousands built Linux, and his real achievement was coordinating them. The same holds for Guido van Rossum and Python, Bill Gates, even Michael Jordan, whose true genius was the way he played with his dream team.

The counter-thesis is blunt: "software engineering is a team endeavor." Almost no widely used software was written by one person, and the vast majority of engineering work doesn't require genius-level intellect — but 100% of it requires a minimal level of social skill. What makes or breaks your career is how well you collaborate, and collaboration stands on three pillars: humility (you are not the center of the universe, nor is your code), respect (you genuinely care about coworkers and their abilities), and trust (you believe others are competent and let them drive). Root-cause almost any social conflict and you'll find one of the three missing.

## Section by section

### 2.1 Help Me Hide My Code

- Requests to the Google Code Project Hosting team circa 2008 — hide branches, launch in secret, erase history — all trace to insecurity about others seeing and judging work in progress. Nobody likes criticism, least of all for unfinished things; but hiding is the real problem, not the cure.

### 2.2 The Genius Myth

- The Genius Myth is the tendency to ascribe a team's success to a single person or leader. Linus Torvalds shipped a proof-of-concept kernel to an email list; Linux is hundreds of times bigger and was built by thousands. Unix itself was a group effort at Bell Labs.
- The fantasy: get struck by an idea, vanish into a cave, unleash a perfect implementation, be hailed a genius. Reality check: actual geniuses are rare, still make mistakes, and being brilliant is no excuse for being a jerk — poor social skills make a poor teammate.
- The Myth is insecurity dressed as ambition: sharing early risks revealing that you are not a genius. A second motive for hiding is fear that someone will steal and run with your idea.

### 2.3 Hiding Considered Harmful

- Working alone increases the risk of unnecessary failure and cheats your growth. The bicycle-gear-shifter parable: you spend months secretly prototyping in your garage; your neighbor builds something similar with friends from the bike shop, ships first, and then points out simple flaws in your design that a week of feedback would have caught.

### 2.4 Early Detection

- Hiding an idea until polished is a huge gamble: fundamental design mistakes happen early, you reinvent wheels, and you forfeit collaboration. Early and frequent feedback lowers the risk of working on the wrong thing, doing it wrong, or duplicating existing work. Mantra: "Fail early, fail fast, fail often." (Caveat from a footnote: too much early feedback can be dangerous if you're still unsure of your direction.)

### 2.5 The Bus Factor

- **Bus factor**: "the number of people that need to get hit by a bus before your project is completely doomed." If only you understand the code, you have job security and the project has none.
- Life events — marriage, relocation, departure, caretaking — do what buses do. Documentation plus a primary and secondary owner for each area future-proofs the project. Better to be one part of a successful project than the critical part of a failed one.

### 2.6 Pace of Progress

- You would never write 10,000 lines before compiling once; programmers thrive in tight feedback loops (write, compile, test, compile). The same loop is needed at project level: requirements morph, design obstacles and political hazards appear, and a team is the feedback mechanism. "Many eyes make all bugs shallow" — better: many eyes make sure your project stays relevant. Cave-dwellers surface to find the world moved on.
- Sidebar, *Engineers and Offices*: private offices are unnecessary and "downright dangerous" for most engineers, but hundred-person open floor plans are just as bad — people stop talking to avoid annoying dozens of neighbors. The sweet spot is rooms of four to eight, plus explicit interruption protocols: "Breakpoint Mary," tokens on monitors, headphones as a don't-disturb signal. High-bandwidth, low-friction team connection matters as much as uninterrupted time.

### 2.7 In Short, Don't Hide

- Working alone is inherently riskier than working with others. Worry less about idea theft or looking stupid; worry more about toiling alone on the wrong thing.

### 2.8 It's All About the Team

- Lone craftspeople are vanishingly rare, and even their world-changing output is a spark of inspiration followed by heroic team effort. A great team makes brilliant use of superstars, but the whole exceeds the sum of its parts — and superstar teams are fiendishly difficult to build.
- Share the vision, divide the labor, learn from others. High-functioning teams are the true key to success; aim for that experience.

### 2.9 The Three Pillars of Social Interaction

- **Humility**: you are not the center of the universe (nor is your code); you are neither omniscient nor infallible; you are open to self-improvement.
- **Respect**: you genuinely care about the people you work with and appreciate their abilities and accomplishments.
- **Trust**: you believe others are competent and will do the right thing, and you're OK letting them drive.
- Every nasty social situation can ultimately be traced to a deficit of one of the three.

### 2.10 Why Do These Pillars Matter?

- Social problems are messy, and it's tempting to write off the effort and hang out with a predictable compiler. Richard Hamming's lecture supplies the counterargument: by telling jokes to the secretaries he got superb secretarial help — reproducing services tied up at Murray Hill meant his secretary got documents run to Holmdel and back. Learn to work the system; relationships always outlast projects, and people with richer relationships go the extra mile when you need them.

### 2.11 Humility, Respect, and Trust in Practice

- The pillars sound like a sermon until you operationalize them as behaviors. The next several sections are concrete practices — most sound obvious, yet most of us (the authors included) routinely fail at them.

### 2.12 Lose the ego

- Don't need the first or last word on everything; don't comment on every detail. Humility isn't being a doormat — self-confidence is fine — but aim for a *collective* ego: the Apache Software Foundation's strong community identity rejects self-promoters.
- Hamming again, on John Tukey: fighting the system over appearances is "a small, undeclared war" that costs you across a whole career. "The appearance of conforming gets you a long way."

### 2.13 Learn to give and take criticism

- The Joe story: new hire emails polite code-review questions, gets hauled into the director's office — he should have read the team's insecurity and introduced review culture gently, not by surprise.
- Criticism in a professional setting is almost never personal; it's part of making the project better. Distinguish constructive criticism (helpful, guiding, respectful) from character assault (useless, unactionable). Taking it means trusting that the reviewer wants you and the project to succeed. Skill to internalize: "you are not your code."
- Rewriting feedback with humility: not "you totally got the control flow wrong, use the xyzzy pattern like everyone else" but "I'm confused by the control flow here — I wonder if the xyzzy pattern might make this clearer?" Make it about you, offer rather than demand, leave the person free to decline.

### 2.14 Fail fast and iterate

- The $10-million-loss legend: the CEO refuses to fire the executive — "I just spent $10 million training you!" Firing wouldn't undo the loss, only compound it.
- Google's motto: "Failure is an option." If you never fail you aren't taking enough risks; Google X (self-driving cars, balloon internet) deliberately rewards people for debunking ideas fast, and only a concept that survives whiteboard attack proceeds to prototype.

### 2.15 Blameless Post-Mortem Culture

- Document failures with root-cause analysis and a postmortem — never a list of apologies, excuses, or finger-pointing. It must say what was learned and what will change, then the team must follow through.
- A good postmortem contains: brief summary; timeline from discovery through resolution; primary cause; impact and damage assessment; immediate fix action items with owners; prevention action items; lessons learned. "Don't erase your tracks — light them up like a runway" for those who follow.

### 2.16 Learn patience

- Pair-programming war story: a bottom-up debugger paired with a top-down friend on CVS-to-Subversion bugs produced epic conflict; trust and patience let them improvise — identify the bug together, split and attack from both directions, reconvene. Adapting working styles saved the project and the friendship.

### 2.17 Be open to influence

- Paradoxes: the more open you are to influence, the more influence you have; the more vulnerable you appear, the stronger you are. The stubborn colleague gets "routed around" like an obstacle.
- It's OK to change your mind — engineering is trade-offs, and you can't be right always without perfect knowledge. Listen before planting a stake, though; constant flip-flopping reads as wishy-washy. Admitting "I don't know" signals humility, accountability, and trust, and raises your status over time. Politicians never admit error, which is why nobody believes them; teammates are collaborators, not competitors.

### 2.18 Being Googley

- "Googley" started as an undefined shorthand for "don't be evil / do the right thing," then crept into hiring and performance reviews — and became a vector for unconscious bias: if it means something different to everyone, it drifts toward "is just like me." Wanting to have a beer with someone is not a performance signal.
- The fix was an explicit rubric — **Googleyness**: thrives in ambiguity; values feedback; challenges status quo; puts the user first; cares about the team; does the right thing. With behaviors defined, the term itself is being retired: be specific about expectations.

### 2.19 Conclusion

- The foundation of almost any software endeavor is a well-functioning team with a healthy culture rooted in humility, trust, and respect — oriented around the team, not the individual. Creative work requires risk and occasional failure, and only a healthy team makes failure acceptable.

### 2.20 TL;DRs

- Know the trade-offs of working in isolation, and how much time you and your team spend communicating and in interpersonal conflict.
- A small investment in understanding your own and others' personalities and working styles pays off in productivity.

## Key terms

- **Genius Myth**: the human tendency to ascribe a team's success to a single person or leader.
- **Bus factor**: the number of people who need to be hit by a bus before a project is doomed; dispersed knowledge raises it.
- **Humility, Respect, Trust (HRT)**: the three pillars of social interaction on which all healthy collaboration rests.
- **Blameless post-mortem**: a documented root-cause analysis of a failure focused on lessons and action items, not blame.
- **Googley / Googleyness**: originally undefined cultural shorthand; later an explicit rubric (thrives in ambiguity, values feedback, challenges status quo, puts the user first, cares about the team, does the right thing).

## My takeaways

*Fill this in as you re-read and apply the chapter.*
