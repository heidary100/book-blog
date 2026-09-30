---
title: "Before the Project"
book: pragmatic-programmer
chapter: 8
date: 2026-10-01
summary: "Requirements aren't gathered, they're learned: no one knows exactly what they want, so feedback loops, user access, and small steps turn needs into software."
tags: [requirements, design-process]
---

> Requirements rarely exist ready-made; they're buried under assumptions, misconceptions, and politics, or they don't exist yet at all. The programmer's real job is to help people understand what they want, through feedback loops of questions, mockups, and small steps. And "agile" is not a process you can buy — it is how you do things: work out where you are, take the smallest meaningful step, evaluate, and fix what you broke.

## The big idea

The three topics that open and close this chapter share one conviction: certainty before action is a myth. Clients don't know what they want (Tip 75), hard problems aren't as constrained as they look, and no one can hand you "agile" in a box. In all three cases the escape is the same — generate feedback early and act on it. A stated need is an invitation to explore; a puzzle is solved by mapping the real box of constraints; agility is a feedback loop run recursively at every level, from a variable name to a project's direction.

The middle topic adds the human channel: the fastest feedback loop is a person. Sit next to the expert, pair with them, mob with them while you code — documentation is a lossy, lagging substitute for a human being continuously available across the hall.

## Topic by topic

### Topic 45. The Requirements Pit

The word "gathering" implies requirements lie on the ground waiting to be picked up. They don't: they're buried under layers of assumptions, misconceptions, and politics — "often they don't really exist at all" (Tip 75). The golden-age image of analysts extracting complete specifications came from an era when machine time cost more than people's time, so problems small enough to fully understand were the only ones automated. The real world is messy, conflicted, and unknown, so (Tip 76) "programmers help people understand what they want" — probably our most valuable attribute.

- **Programming as therapy.** A statement of need is an invitation to explore, not an absolute. "Shipping should be free on all orders costing $50 or more" immediately raises questions: tax? current shipping charges? paper and ebooks? shipping class? international orders? how often will $50 change? In the book's dialogue, the developer feeds back an exploit — a $25 book plus $30 overnight shipping reaches $55 and ships free — then stops and lets the client decide. Your role: interpret what the client says and return the implications; the resulting solution beats what either side would produce alone.
- **A process, not a phase.** Feedback you can't yet express in words becomes mockups and prototypes — the "is this what you meant?" school. In fact all work is a mockup until the end; hence short iterations ending with client feedback, so wrong turns cost little. (Tip 77)
- **Walk in your client's shoes.** Monitor help-desk phones; work a week in the warehouse. Seeing the real workflow (management's version differs from the floor's) builds understanding and trust. (Tip 78)
- **Requirements vs. policy.** "Only an employee's supervisors and the personnel department may view that employee's records" embeds today's business policy in an absolute statement. Restated as "only *authorized* users may access an employee record," it drives an access-control system whose metadata updates when policy changes. (Tip 79) Implement the general case; policy is metadata — and this naturally yields a well-factored, metadata-driven design.
- **Requirements vs. reality.** Brian Eno's ultimate mixing board could do anything to sound, yet disrupted the creative process: engineers balance intuitively through an ear-to-fingertip loop the keyboard-and-mouse interface ignored. Successful tools adapt to the hands that use them — which is why early prototypes let clients say "yes, it does what I want, but not how I want."
- **Documentation.** The best requirements documentation is working code; written documents are mileposts, not sign-off deliverables. Inch-thick specifications are a castle on quicksand — and the client never reads them anyway (they heft it, skim the Management Summary, stop at diagrams). For planning, use user stories on index cards: short enough to force clarifying questions, movable on a board to show status and priority. Good requirements are abstract: capture the underlying semantic invariants, document current practices as policy — "requirements are not architecture... Requirements are need."
- **Creep and vocabulary.** Scope creep is the boiled frog; iteration feedback lets clients *feel* the cost of "just one more feature" by trading story cards. And maintain a project glossary (Tip 80): when users and developers call the same thing by different names — or worse, different things by the same name — success gets very hard.

### Topic 46. Solving Impossible Puzzles

Alexander didn't untie the Gordian Knot; he reinterpreted the requirements and chopped it. Real-world puzzles are the same: the obvious moves fail, people retry them anyway, and the actual solution lies elsewhere. The secret is to separate real constraints from preconceived ones — honor the absolute ones, however distasteful, and discard the imagined ones.

- **Find the box.** "Thinking outside the box" misleads: the box is the boundary of real constraints, and the trick is to find it — it's usually larger than you think (the three-line nine-dots puzzle works once you question the assumed border). (Tip 81) Enumerate every avenue without dismissing anything, then go down the list and demand proof that each path is truly closed. The Trojan horse got troops through a walled city's "front door."
- **Prioritize constraints.** Woodworkers cut the longest pieces first. Identify the most restrictive constraints and fit the rest inside them.
- **Get out of your own way.** When a problem feels impossibly hard, that feeling is data (Topic 37 again). Walk the dog, sleep on it — "people who were distracted did better on a complex problem-solving task than people who put in conscious effort." Or explain it to someone, rubber-duck style, and let them ask: why are you solving this? What's the benefit? Are the difficulties edge cases you can eliminate? Is there a simpler, related problem?
- **Be prepared.** Pasteur: fortune favors the prepared mind. Eureka moments need raw material — prior experience your nonconscious can combine — so keep an engineering daybook recording what worked and what didn't. And whatever else: DON'T PANIC.

### Topic 47. Working Together

Andy and Dave met on an "impossible" project — an end-of-life system to be rebuilt exactly, moving hundreds of millions of dollars, in months. What made it succeed was not a method: the expert who had managed the old system sat across the hall, "continuously available for questions, clarifications, decisions, and demos." Users are part of your team, and working with them means discussing *while you code* — what we now call pair or mob programming — not interviewing them and taking notes.

- **Conway's Law.** "Organizations which design systems are constrained to produce designs which are copies of the communication structures of these organizations." Teams that don't talk produce stovepipe systems; teams split in two produce client/server splits. The law runs in reverse: structure the team the way you want the code to look — and teams that include users produce software that reflects it.
- **Pair programming.** One typist, both minds on the problem. The typist handles syntax and detail; the partner's full brain is free for higher-level scope — typing eats bandwidth. Gentle peer pressure suppresses lazy shortcuts, raising quality.
- **Mob programming.** The same idea at scale: a dozen diverse people, one typist, swapping every 5–10 minutes — and mobs can include users, sponsors, and testers, not just developers. Their first project was "a small mob of three": one typing, one talking with the business expert. Think of it as "tight collaboration with live coding."
- **How to start.** If solo, try pairing for at least two weeks, a few hours at a time — it feels strange at first. Manage the human side: build the code, not your ego; start small (4–5 people, short sessions); criticize the code, not the person ("let's look at this block," not "you're wrong"); listen — different isn't wrong; hold frequent retrospectives. Read up before diving in, and practice on an exercise before your toughest production code. (Tip 82: don't go into the code alone.)

### Topic 48. The Essence of Agility

Agile is an adjective — "it's how you do something," a style, not a thing you own (Tip 83). Twenty years after the manifesto, the authors see genuine teams living its values, and a counter-industry selling Agile-in-a-Box to companies adding management layers and "someone with a clipboard and a stopwatch." Re-read the values — individuals and interactions over processes and tools; working software over comprehensive documentation; customer collaboration over contract negotiation; responding to change over following a plan. Anyone selling you something that moves weight to the right-hand side doesn't share those values; anyone selling a box hasn't read the opening line about *uncovering* better ways — the manifesto is "suggestions for a generative process," not a static document.

- **There can never be an agile process.** By definition: agility is responding to change and unknowns after you set out. A running gazelle doesn't go in a straight line; a gymnast makes hundreds of corrections a second. No fixed plan survives the context-dependence of real decisions. The values don't tell you what to do — they tell you what to look for when you decide for yourself.
- **The recipe.** 1. Work out where you are. 2. Make the smallest meaningful step toward where you want to be. 3. Evaluate where you end up, and fix anything you broke. Repeat, and apply recursively at every level. Even a variable name: `accountOwner(accountID)` assigned to `user` is useless; `owner` is redundant; asking what the story actually needs yields `emailOfAccountOwner(accountID)` — a low-level feedback loop that reduced coupling in the overall design. At the highest level, a single step sometimes reveals the best solution needs no software at all. Teams should run the loop on their own process too: "a team that doesn't continuously experiment with their process is not an agile team."
- **And this drives design.** Step 3 — fix what you broke — must be painless, or you'll shrug and leave it broken, and entropy wins. So agility *requires* good design, because the measure of good design is how easy the result is to change. Easy to change means you can adjust at every level without hesitation: "That is agility."

## Tips worth remembering

- **Tip 75 — No One Knows Exactly What They Want.** Requirements are discovered, not dictated.
- **Tip 76 — Programmers Help People Understand What They Want.** That's probably your most valuable attribute.
- **Tip 77 — Requirements Are Learned in a Feedback Loop.** Feed back implications; let clients refine their thinking.
- **Tip 78 — Work with a User to Think Like a User.** Sit with them; spend a week doing their job.
- **Tip 79 — Policy Is Metadata.** Implement the general case; policy is data, not code.
- **Tip 80 — Use a Project Glossary.** One shared vocabulary, widely accessible, used by everyone.
- **Tip 81 — Don't Think Outside the Box—Find the Box.** Separate real constraints from preconceptions; degrees of freedom hide in the difference.
- **Tip 82 — Don't Go into the Code Alone.** Pair, mob, and keep users inside the loop while you code.
- **Tip 83 — Agile Is Not a Noun; Agile Is How You Do Things.** There is no agile process to buy — only a feedback loop to run.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
