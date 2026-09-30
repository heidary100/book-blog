---
title: "Pragmatic Projects"
book: pragmatic-programmer
chapter: 9
date: 2026-10-01
summary: "Projects run on small stable teams, methods chosen for results not fashion, three legs — version control, testing, automation — and users you delight."
tags: [teams, automation]
---

> Individual craftsmanship scales to teams: small, stable groups that refuse broken windows, watch for boiling water, schedule their own improvement, and organize around end-to-end delivery. Ignore fashionable process cargo cults; the real goal is delivering when users need it, on the three legs of version control, ruthless testing, and full automation. And the finish line isn't working code — it's delighted users, and work you're proud to sign.

## The big idea

The final chapter zooms out from the individual to the project. Everything earlier in the book — DRY, orthogonality, tracer bullets, automation, broken windows — gets restated as a team practice, because the advantages of a pragmatic individual "are multiplied manyfold" on a pragmatic team. A team here means something specific: under 10–12 people, stable over time, who know, trust, and depend on each other. Fifty people are a horde; constantly reshuffled strangers are "merely sharing a bus stop in the rain."

The other through-line is honesty about goals. It's easy to mistake the artifacts of success — standups, iterations, tooling, process brands — for the magic that produced them. The chapter keeps pulling attention back to the actual targets: working software delivered on demand, users whose problems are solved, and a signature on work you stand behind.

## Topic by topic

### Topic 49. Pragmatic Teams

Programmers are like cats — intelligent, strong-willed, independent — yet pragmatic techniques work better collectively than singly. The base condition (Tip 84): maintain small, stable teams. Then recast the book's principles at team scale:

- **No broken windows.** Quality is a team issue: the most diligent developer on a team that doesn't care will lose the will to fix niggling problems. A designated "quality officer" is "clearly ridiculous" — quality comes only from everyone's contributions; it is built in, not bolted on.
- **Boiled frogs.** Teams boil even more easily than individuals: everyone assumes someone else is watching, or that the leader must have approved the scope change. Actively monitor for anything that wasn't in the original understanding — scope, timescales, features, environments — and keep metrics on new requirements (a burnup chart shows goalposts moving better than a burndown).
- **Schedule the knowledge portfolio.** Improvement "whenever there's a free moment" never happens (Tip 85). Put it on the backlog beside features: old-systems maintenance done for real; process reflection — "too many teams are so busy bailing out water that they don't have time to fix the leak"; deliberate vetting of new tech via prototype tasks; and team-wide learning, from brown-bag lunches to formal training.
- **Communicate team presence.** The worst teams seem sullen — unstructured meetings, inconsistent documents, no shared terminology. Great teams have a distinct personality, crisp consistent documentation, and speak with one voice externally (internally, lively debate is encouraged). A cheap trick that works: brand the project with a zany name and logo — the authors have used killer parrots, gerbils, and mythical cities — so the world has something memorable to associate with your work.
- **Don't repeat yourselves.** DRY applies to people: siloed teams duplicate functionality into maintenance nightmares. The fix is frictionless communication — instant, low-ceremony questions and status (a head over the cube wall, a messaging app). Waiting for a weekly meeting to ask a question is friction; awareness is what keeps a team DRY.
- **Team tracer bullets.** The misconception that requirements, design, frontend, server, and testing can happen separately spawns specialized roles and handoffs — gates, approvals, paperwork: Lean calls it waste, and developers three levels from their users can't make informed decisions. Instead, organize a fully functional team (Tip 86) holding every skill needed to shoot tracer bullets end-to-end — UI/UX, server, DBA, QA — so small features validate both the system and how the team communicates.
- **Automation, then restraint.** Automate everything: formatting, testing, deployment — and make sure the team can build its own tools. Then give individuals room to shine: just enough structure to deliver value, and like the painter in Good-Enough Software, resist adding more paint.

### Topic 50. Coconuts Don't Cut It

After WWII, Melanesian islanders rebuilt airports from vines, coconut shells, and palm fronds, hoping to summon the cargo planes back: they copied the form, not the content. "All too often, we are the islanders." The authors watched teams "doing Scrum" with a weekly standup and four-week iterations that stretched to eight — justified by a popular agile scheduling tool, as if "stand up" and "iteration" were incantations.

- **Context matters.** Ask why you use any method, framework, or technique: is it suited to this job, or imported from the latest internet-fueled success story? Copying Spotify or Netflix ignores that you don't share their market, constraints, expertise, size, or culture — and that their own current processes didn't exist while they were growing. That's the secret of their success: they kept experimenting. (Tip 87: do what works, not what's fashionable.) How do you know what works? Try it — pilot with a small team, keep what pays, discard the rest as overhead.
- **One size fits no one well.** A methodology exists to help people work together; certification programs that teach rule-memorization miss the point — you need to see beyond the rules. Take the best pieces from several methods and adapt: Scrum alone, for instance, gives project management but not technical practices or governance-level guidance.
- **The real goal.** Not "do Scrum" or "do agile," but the ability to deliver working software with new capability *at a moment's notice*. Treat delivery time as the metric and shrink it relentlessly: years → months → weeks → two-week sprint → one → daily → on demand. Delivering on demand doesn't mean shipping every minute — you deliver "when the users need it, when it makes business sense" (Tip 88). Getting there needs rock-solid infrastructure (next topic): trunk-based development, feature switches for selective rollout.
- **Starting points, and a warning.** Beginners can start with Scrum plus XP's technical practices; experienced teams may move to Kanban and Lean. But over-invest in any single methodology and you calcify — it becomes hard to see any other way. "Might as well be using coconuts."

### Topic 51. Pragmatic Starter Kit

A Model-T needed two pages of instructions to start; a modern car needs a button. Software is still at the Model-T stage, but recurring operations — build, release, testing, paperwork — must become "automatic and repeatable on any capable machine," because manual procedures leave consistency to chance. The Pragmatic Starter Kit is the minimal foundation every project needs regardless of methodology or stack: **version control, regression testing, and full automation** — three legs holding up everything else.

- **Drive with version control.** Keep everything needed to build under version control, so build machines become ephemeral cloud instances instead of "one hallowed, creaky machine in the corner" everyone fears. Then let version control drive the pipeline (Tip 89): commits and pushes trigger builds and tests in containers; a tag releases to staging or production. Releases become "a low-ceremony part of everyday life" — true continuous delivery, tied to no one's laptop.
- **Ruthless and continuous testing.** Many developers "test gently, subconsciously knowing where the code will break and avoiding the weak spots." Think fishing nets: fine unit-test nets catch minnows, coarse integration nets catch sharks — and minnows become sharks fast, so test as soon as there's code (Tip 90). A good project may hold more test code than production code, and a passing suite is what "done" means (Tip 91). The build should test for real — environment matching production, since gaps are where bugs breed — and cover unit, integration, validation and verification, and performance: parts must pass alone; subsystems must honor contracts together (integration is otherwise the largest bug source); a bug-free system answering the wrong question is useless; and load must be tested against expected users, connections, and transactions.
- **Test the tests.** After writing a test for a bug, cause the bug deliberately and watch the test complain (Tip 92); a saboteur branch that plants bugs verifies the suite catches them — the same instinct as Netflix's Chaos Monkey killing services to test resilience.
- **Thoroughness is about states, not lines.** Coverage tools give a feel, but expect no 100% and don't trust the metric: a three-line function `int test(int a, int b) { return a / (a + b); }` has a million logical states, exactly one of which fails. States aren't lines of code (Tip 93), and enumerating them fully is effectively unsolvable — which is why property-based testing's generated states (Topic 42) are so useful.
- **Find bugs once.** The single most important testing concept: if a bug slips through, add a test that traps it forever (Tip 94). The first time a human finds a bug should be the last — automated tests check it from then on, "no matter how trivial," because it *will* happen again.
- **Full automation.** Shell scripts with rsync and ssh, or Ansible, Puppet, Chef, Salt — just no manual intervention. Cautionary tale: a client site where every developer installed IDE add-ons from pages of click-here instructions, so every machine differed subtly and bugs appeared on one machine but not others. People aren't repeatable; scripts are, and scripts under version control answer "but it used to work…". One manual step "just for this one part" is a very large broken window (Tip 95). With the three legs in place, you can concentrate on the hard part: delighting users.

### Topic 52. Delight Your Users

The goal is to delight users — "not to mine them for their data, or count their eyeballs or empty their wallets" — and even delivering working software on time doesn't get you there. Users don't care about code; they have a business problem within their objectives and budget, and their expectations aren't in any specification, because no specification is complete until you've iterated through it together.

- **Ask the magic question.** "How will you know that we've all been successful a month (or a year) after this project is done?" The answers surprise: a recommendations project judged on customer retention; a database consolidation judged on data quality or cost savings. These expectations of business value are what count — software is only the means.
- **Aim everything at them.** Make the whole team clear on the expectations; weigh decisions by which path moves closer to them; critically analyze requirements in that light — many stated "requirements" are just "an amateur implementation plan dressed up as a requirements document," so propose changes when they serve the objective; and keep revisiting as domain knowledge grows. Developers who see many parts of an organization can weave them together in ways individual departments can't.
- **Be a problem solver.** Forge a relationship where you actively help solve their problems: whatever your title, your real job description is "Problem Solver" (Tip 96). "We solve problems."

### Topic 53. Pride and Prejudice

Pragmatic Programmers don't shirk responsibility — they take on challenges and stand behind their expertise. If we're responsible for a design or a piece of code, we do a job we can be proud of (Tip 97: sign your work), like the artisans of earlier ages who were proud to sign what they made.

The word of caution is in the title: ownership can curdle into prejudice. Territorial developers, insular fiefdoms, code defended against interlopers — that's not the point. Treat other people's code with respect; the Golden Rule and mutual respect make signing possible. The mirror danger is anonymity: on large projects it breeds "sloppiness, mistakes, sloth, and bad code," and lets you see yourself as a cog producing lame excuses in status reports instead of good code. Code must be owned, but not necessarily by an individual — eXtreme Programming's communal ownership works when paired with practices (like pair programming) that guard against anonymity. The target is pride of ownership: "I wrote this, and I stand behind my work" — your name becomes an indicator of quality: solid, well written, tested, documented. The book closes on the same note turned outward: developers build castles in the air that change the world, and with that extraordinary power comes an extraordinary responsibility.

## Tips worth remembering

- **Tip 84 — Maintain Small, Stable Teams.** Under a dozen people who know, trust, and depend on each other.
- **Tip 85 — Schedule It to Make It Happen.** Maintenance, reflection, experiments, learning — on the backlog, or never.
- **Tip 86 — Organize Fully Functional Teams.** All the skills to deliver end-to-end, so tracer bullets can fly.
- **Tip 87 — Do What Works, Not What's Fashionable.** Pilot, keep what pays, discard the coconut shells.
- **Tip 88 — Deliver When Users Need It.** Shrink the delivery cycle relentlessly: years → months → weeks → days → on demand.
- **Tip 89 — Use Version Control to Drive Builds, Tests, and Releases.** Commits trigger the pipeline; tags release.
- **Tip 90 — Test Early, Test Often, Test Automatically.** Minnows become sharks; catch them small.
- **Tip 91 — Coding Ain't Done 'Til All the Tests Run.** A green suite is the definition of done.
- **Tip 92 — Use Saboteurs to Test Your Testing.** Plant bugs deliberately and make sure the alarms sound.
- **Tip 93 — Test State Coverage, Not Code Coverage.** Lines executed ≠ logical states checked.
- **Tip 94 — Find Bugs Once.** Any human-found bug gets a permanent automated test.
- **Tip 95 — Don't Use Manual Procedures.** People aren't repeatable; scripts are — and they're versioned.
- **Tip 96 — Delight Users, Don't Just Deliver Code.** Find the business expectations and aim at them.
- **Tip 97 — Sign Your Work.** Craftsmanship you're willing to put your name on.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
