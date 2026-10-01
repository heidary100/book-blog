---
title: "Knowledge Sharing"
book: swe-at-google
chapter: 3
date: 2026-10-01
summary: "Psychological safety plus mechanisms — mentors, communities, docs, canonical sources, readability — let an organization answer its own questions."
tags: [teams, knowledge-sharing]
---

> An organization that can't share knowledge stays dependent on a few overloaded experts. The foundation is psychological safety — people must be able to admit what they don't know — built up through simple habits (ask questions, write things down), community channels, documentation, canonical sources, and formalized mentorship like Google's readability process.

## The big idea

Your organization understands your problem domain better than a random person on the internet, so it should answer most of its own questions. That takes experts and mechanisms to distribute their knowledge — from "ask questions; write down what you know" up through structured classes. Both must be grown: code doesn't emerge from nothing, and neither does expertise; every expert was once a novice.

The economics trade scalability against personalization. One-to-one expert advice is the highest-value but least scalable form; documented knowledge scales organization-wide but is generic and needs upkeep to stay current. Between individual heads and documents sits **tribal knowledge** — unwritten expert know-how. The two complement each other: a human expert can synthesize, judge what applies to your case, know where the docs are (or who knows), and even perfectly documented teams still coordinate and adapt. No single mechanism fits all learning; the mix changes as the organization grows.

## Section by section

### 3.1 Challenges to Learning

- **Lack of psychological safety**: fear of risk or mistakes in front of others; shows up as cultures of fear and avoidance of transparency.
- **Information islands**: non-communicating groups each develop their own way — local maxima instead of a global one — producing *information fragmentation* (incomplete pictures), *information duplication* (reinvented solutions; DRY violated at org scale, cf. [/books/pragmatic-programmer/02-a-pragmatic-approach](/books/pragmatic-programmer/02-a-pragmatic-approach)), and *information skew* (drifting, conflicting ways).
- **SPOF (single point of failure)**: critical knowledge held by one person — the bus factor again — often created by kindness ("let me take care of that for you"), trading long-term learning for short-term speed.
- **All-or-nothing expertise**: a group split between know-everythings and novices; self-reinforces when experts don't mentor or document.
- **Parroting**: copying patterns without understanding. **Haunted graveyards**: code avoided out of fear and superstition.

### 3.2 Philosophy

- One-to-one expert help is invaluable but doesn't scale and dies when the expert goes on vacation; documentation scales but is generalized and needs maintenance.
- Tribal knowledge fills the gap between heads and documents; documenting it makes it available to anyone — yet even perfect docs don't replace humans who assess relevance and know where (or who) to ask. "There is no such thing as too much engineering expertise."

### 3.3 Setting the Stage: Psychological Safety

- Learning starts with admitting you don't understand — honesty about ignorance should be welcomed, not punished. Google's research found psychological safety is the most important trait of effective teams.

### 3.4 Mentorship

- Every "Noogler" gets a mentor deliberately *outside* their team — not their manager or tech lead: a volunteer with 1+ years at Google whose explicit duty includes answering questions; a safety net that's easier to approach about tricky situations. On healthy teams, learning continues bidirectionally — teammates answer *and* ask.

### 3.5 Psychological Safety in Large Groups

- One-to-one doesn't scale, but groups are scarier: novices compose questions that may be archived for years, and new experts risk having answers attacked. The rule: interactions must be cooperative, not adversarial — guide basic mistakes rather than chastise; explain to help, not to show off; shared problem-solving, not arguments with winners.
- The Recurse Center's social rules help: no feigned surprise ("What?! You don't know what the stack is?"), no "well-actuallys", no back-seat driving, no subtle "-isms".

### 3.6 Growing Your Knowledge

- Knowledge sharing starts with the self: you always have something to learn; if your environment offers nothing to learn, you stagnate and should find a new one.

### 3.7 Ask Questions

- The single takeaway: always be learning; always be asking questions. Ramping up at Google takes ~six months — learning is iterative, and there's no magical day when you know everything.
- The biggest beginner mistake is not asking: struggling alone or fearing the question is "too simple". Embrace not-knowing as opportunity; senior leaders should model it ("the more you know, the more you know you don't know"). On the answering side, patience and kindness lower the barrier for everyone.

### 3.8 Understand Context

- Learning includes understanding *why* existing things are the way they are. Inheriting a gnarly codebase tempts a rewrite; instead apply **Chesterson's fence**: "If you don't see the use of it, I certainly won't let you clear it away. Go away and think."
- Engineers reach for "this is bad!" too fast with unfamiliar code. Understand context first, then change if still warranted — and document your reasoning. Google's style guides explain rationales so readers know when a rule applies and when it needs updating.

### 3.9 Scaling Your Questions: Ask the Community

- One-to-one help is high-bandwidth but unscalable and forgettable. Write down what you learn and share it; community channels complement one another and leave answers available to future members.

### 3.10 Group Chats

- Ask many at once, get quick back-and-forth with whoever's available; bystanders learn too. Topic-driven chats are open, expert-rich, fast; team chats are smaller and safer but reach less. Weak on structure — once information must outlive the group, promote it to a document or list.

### 3.11 Mailing Lists

- Most topics have a topic-users@ or topic-discuss@ list; threads are structured, searchable, indexed by Moma (intranet search). Best practice: post your solution back.
- Trade-offs: great for complicated context-heavy questions; clumsy for quick exchanges; immutable archives go stale; signal-to-noise can be low. Sidebar, *Email at Google*: the culture is infamously email-heavy — hundreds of emails a day, Nooglers spending days on filters. Email wins by habit, not merit.

### 3.12 YAQS: Question-and-Answer Platform

- Google's internal Stack Overflow: easy linking to code (including work-in-progress), safe for confidential details. Helpful answers are promoted; Q&A is editable so it stays accurate as code changes. YAQS has superseded many mailing lists.

### 3.13 Scaling Your Knowledge: You Always Have Something to Teach

- Expertise is a multidimensional vector, not a binary — everyone knows more than someone about something (one reason diversity matters). Teach via office hours, tech talks, classes, docs, code review.

### 3.14 Office Hours

- Scheduled expert-availability sessions. Almost never the first choice — slow for urgent questions, costly to host — but good when the problem is too ambiguous to formulate (early service design) or too obscure to have documentation.

### 3.15 Tech Talks and Classes

- engEDU does CS education at scale; the grassroots g2g (Googler2Googler) program has thousands teaching from "Understanding Vectorization in Modern CPUs" to beginner swing dance.
- Classes cost more than talks but scale across instructors; they work best when the topic is a frequent source of misunderstanding, relatively stable, benefits from a teacher, and has enough demand for regular offerings (hard in small remote offices).

### 3.16 Documentation

- Documentation is written knowledge whose *primary goal* is helping readers learn — a mailing-list thread may be a paper trail but wasn't written for that.
- *Updating*: your first days with a system are the best time to spot doc gaps; fix typos and omissions yourself, even for docs owned by others ("leave the campground cleaner"). g3doc — docs stored next to source in the monorepo — made this normal and auditable like code.
- *Creating*: document flows you set up; undiscoverable docs might as well not exist; provide feedback mechanisms (file-a-bug buttons, auto-bugging comments).
- *Promoting*: writing docs is asymmetrical — costly for the author, broadly beneficial — so incentives matter; but authors benefit directly too (a documented debugging procedure ends repeated interruptions).

### 3.17 Code

- Code is knowledge: writing it is knowledge transcription, and clarity is a sharing mechanism. Comments transmit knowledge across time (including to Future You), with docs' same staleness risk. Code review teaches both directions — authors learn patterns, reviewers discover libraries.

### 3.18 Scaling Your Organization's Knowledge

- As the organization grows, team-level mechanisms stop sufficing: culture matters at every stage; canonical sources pay off mainly in mature organizations.

### 3.19 Cultivating a Knowledge-Sharing Culture

- A few people's bad behavior can make a whole community unwelcoming — novices take questions elsewhere, would-be experts stop growing, and in the worst case the group reduces to its most toxic members. Tolerance or reverence of the "brilliant jerk" is pervasive and harmful; Google's job ladder is explicit: "Jerks are not good leaders" (see the "No Jerks" document from Urs Hölzle and Ben Treynor Sloss).
- People react to incentives over platitudes. The SWE ladder explicitly expects seniors to grow future leaders and sustain the community; bottom-up recognition comes via *peer bonuses* (any Googler awards any other — cash plus permanent record, e.g., for prolific mailing-list answering) and *kudos* (smaller public acknowledgement). "It's not the bonus that matters: it's the peer acknowledgement."

### 3.20 Establishing Canonical Sources of Information

- Centralized, company-wide corpuses standardize knowledge relevant to *all* engineers (a developer-workflow guide, not a local Frobber guide); they counter islands but need higher investment, active maintenance, and explicit SME owners — the more complex the topic, the more critical the owner.
- *Developer guides*: style guides, best-practice and testing guides, Tips of the Week — too big to read whole, so experts send links, teaching that a canonical source exists.
- *go/ links*: the internal shortener (go/spanner, go/python) is short enough for conversation, a permalink even when content moves, and so ingrained that people guess links first and fix wrong targets themselves.
- *Codelabs*: guided hands-on tutorials — halfway between docs and classes; engaging and on-demand, but expensive to maintain and not tailored.
- *Static analysis*: programmatically checkable best practices. Upfront cost, then it scales perfectly: every tool user learns the practice, freeing humans to teach what can't be automated.

### 3.21 Staying in the Loop

- Match formality to importance: docs must stay current; newsletters need less upkeep. Newsletters (EngNews, Ownd, Google's Greatest Hits — the quarter's most interesting outages) get better engagement when less frequent and more interesting, or they read as spam.
- *Testing on the Toilet* / *Learning on the Loo*: one-page tips posted in bathroom stalls — a channel that stands out; all archived.
- *Communities*: thousands of Google Groups (troubleshooting; discussion like Code Health) and internal social posts counter islands and duplication.

### 3.22 Readability: Standardized Mentorship Through Code Review

- "Readability" is Google-wide mentorship for language best practices — idioms, structure, API design, library use, documentation, test coverage. Origin: Craig Silverstein (employee #3) personally line-by-line reviewed every new hire's first major commit; volunteers scaled it, and today ~20% of Google engineers are in the process at any time.

### 3.23 What Is the Readability Process?

- Every changelist (CL) needs *readability approval* — from a certified author for their own CL, else from certified reviewers. Certification: submit CLs to a centralized volunteer reviewer group who coach until comments taper off; then you self-approve and review others. ~1–2% of engineers are reviewers, held to teaching standards: mentoring, never gatekeeping, citing guideline rationales (Chesterson's fence again).
- Readability deliberately blends written knowledge (citable guidelines — the C++ style guide alone is 40 pages) with tribal knowledge (reviewers who know which guidelines matter).

### 3.24 Why Have This Process?

- Code is read far more than written — magnified in the giant monorepo where anyone can learn from other teams' code (Kythe aids cross-referencing). Readability enforces and propagates codebase-wide consistency: similar-looking code across tens of thousands of engineers and decades, easier large-scale changes across thousands of teams, fewer surprises when changing teams.
- Costs: friction for teams without certified members, extra review rounds, and only linear scaling (human reviewers). A deliberate trade of short-term review latency for long-term quality, consistency, and expertise; short-lived code (experimental/, Area 120) is exempt. Static analysis keeps absorbing automatable comments, freeing reviewers for higher-order concerns like outside-reader comprehensibility.
- Is it worth it? The Engineering Productivity Research team's studies: yes — CLs by certified authors are reviewed and submitted significantly faster (controlling for tenure and extra review rounds), certified engineers report higher code-quality satisfaction, and most graduates found the process worthwhile and behavior-changing.

### 3.25 Conclusion

- Knowledge is arguably the most important — if intangible — capital of a software engineering organization; sharing it makes the organization resilient and redundant in the face of change, and investments in sharing reap manyfold dividends.

### 3.26 TL;DRs

- Psychological safety is the foundation of a knowledge-sharing environment.
- Start small: ask questions, write things down.
- Make it easy to get help from both human experts and documented references.
- Systematically reward those who teach and broaden expertise; there is no silver bullet — combine strategies and expect the mix to change.

## Key terms

- **Psychological safety**: an environment where people can admit ignorance, ask questions, be wrong, and fail without punishment; per Google's research, the most important trait of effective teams.
- **Information islands**: knowledge fragmentation across non-communicating groups, yielding fragmentation, duplication, and skew.
- **All-or-nothing expertise**: a group split between know-everythings and novices, with no middle ground.
- **Parroting**: mimicry without understanding. **Haunted graveyard**: code avoided out of fear and superstition.
- **Tribal knowledge**: unwritten know-how living between what experts know and what is documented.
- **Chesterson's fence**: don't remove or change something until you understand why it's there.
- **Readability**: Google's certification-and-mentorship process teaching language best practices through code review.
- **go/ link**: internal URL shortener providing short, memorable, stable links to internal resources.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
