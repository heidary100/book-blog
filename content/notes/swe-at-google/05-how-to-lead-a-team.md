---
title: "How to Lead a Team"
book: swe-at-google
chapter: 5
date: 2026-10-01
summary: "Managers lead people, tech leads lead technology; the best leaders serve their teams — humility, respect, and trust instead of traditional management."
tags: [teams]
---

> A team without a leader is a boat without a captain — a floating waiting room. Google splits leadership into managers (who lead people) and tech leads (who lead technology), and its model of good leadership is servant leadership: resist the urge to "manage," and serve the team's technical and social health through humility, respect, and trust.

## The big idea

Software with nobody piloting it drifts; engineers burn time waiting or building what nobody needs. Leadership comes in two shapes with *wildly different* people skills: the engineering manager, accountable for the performance, productivity, and happiness of every person (including the tech lead) while meeting the business's needs; and the tech lead, owning technology decisions, architecture, priorities, and velocity. Small nascent teams combine them in one Tech Lead Manager (TLM); larger teams deliberately pair two specialists, because doing both well leads to burnout.

Leadership is a disease-prone promotion: new managers recreate the bad management they suffered ("manageritis") — micromanaging, ignoring low performers, hiring pushovers. The cure is servant leadership, the butler/majordomo model: remove obstacles, build consensus, buy dinner for the team working late, and manage the *social* health of the team as seriously as the technical. The most quotable rule: "Traditional managers worry about how to get things done, whereas great managers worry about what things get done (and trust their team to figure out how to do it)."

## Section by section

### 5.1 Managers and Tech Leads (and Both)

- Google decided early that engineering managers should have an engineering background — former engineers or trained engineers, not imported generic people managers. The two roles need similar planning skills but different people skills; larger teams fill them with two people working as partners.

### 5.2 The Engineering Manager

- Accountable for performance, productivity, and happiness of *every* team member (including the tech lead) while ensuring the product meets business needs — genuinely hard, because those needs conflict.

### 5.3 The Tech Lead

- Owns technical decisions, architecture, priorities, velocity, and project management (larger teams get program managers); usually reports to the manager and partners on staffing and matching tasks to skills.
- Most TLs are also individual contributors, forcing the recurring choice: do it yourself quickly, or delegate and let it happen more slowly. Delegation is almost always right for growing the team.

### 5.4 The Tech Lead Manager

- The TLM — one person doing people and technology — is the default for small teams, usually a recently promoted IC; Google recommends classes plus a senior mentor.
- Sidebar, *Influencing Without Authority*: getting people outside your org to act. Jeff Dean led a fraction of Google's engineers yet influenced the whole organization through writing and speaking. The Data Liberation Front (under six engineers) got 50+ products into Google Takeout with no executive directive — by tying the effort to the company's mission and making integration easy.

### 5.5 Moving from an Individual Contributor Role to a Leadership Role

- Leadership happens by accident: the impatient person gets sucked into resolving conflicts and coordinating — "manageritis." Even if you swear never to manage, you'll likely lead something; the best leaders serve their teams using humility, respect, and trust.

### 5.6 The Only Thing to Fear Is…Well, Everything

- The biggest fear is writing less code — and management produces no countable artifacts: "I didn't do a damned thing today." The apples-and-bananas analogy: don't count apples when you're growing bananas; enabling a happy, productive team *is* the job (and pays off on a longer timeline).
- The Peter Principle ("every employee tends to rise to his level of incompetence") explains bad managers; Google requires performing at the next level before promoting into it. People who've only known bad managers have no model for good ones.
- Reasons to lead anyway: scaling yourself beyond personal code output, and discovering you're good at giving a team guidance and air cover.

### 5.7 Servant Leadership

- The "management" disease: managers forget the awful things done to them and repeat them. Steve Vinter's advice to a new manager: "Above all, resist the urge to manage."
- The cure: serve the team like a majordomo — remove obstacles the team can't remove, build consensus, get your hands dirty — while managing both technical *and* social health. The social side is equally important and infinitely harder.

### 5.8 The Engineering Manager

- Pre-computing-age "management" and "labor" were adversarial; modern software companies don't work that way — setup for the anachronism critique that follows.

### 5.9 Manager Is a Four-Letter Word

- The pointy-haired manager descends from military hierarchy via the Industrial Revolution: replaceable factory workers needed supervisors with no incentive to treat them well — the carrot-and-stick mule-driver model.
- It survives in creative industries despite evidence it harms creative productivity. Contrast: an assembly-line worker trains in days; a software engineer takes months to ramp onto a codebase and needs nurturing, time, and space.

### 5.10 Today's Engineering Manager

- Managers who act like parents get employees who react like children; show trust and people feel positive pressure to live up to it. The one thing to remember: "Traditional managers worry about how to get things done, whereas great managers worry about what things get done (and trust their team to figure out how to do it)."
- The Jerry story: conditioned to apologize for leaving at 4:45, he's told "as long as you get your job done, I don't care what time you leave." If your reports need babysitting, that's your real problem.
- Sidebar, *Failure Is an Option*: build psychological safety so the team takes bigger risks — attempting the impossible accomplishes more than completing the safe. Failure is fast learning (if not the same failure repeatedly); customer-affecting failures get blameless postmortems. Praise individuals publicly, criticize privately; fail as a team.

### 5.11 Antipatterns

- Observed destructive patterns — seen in bad managers and, the authors admit, in themselves.

### 5.12 Antipattern: Hire Pushovers

- Insecure managers hire people weaker than themselves to protect their authority; the team can't move without a leash or survive a vacation. Instead hire people smarter than you who can replace you: they challenge you, impress you, and free you to lead more.

### 5.13 Antipattern: Ignore Low Performers

- "Sometimes you get to be the tooth fairy, other times you have to be the dentist." One or two low performers can collapse a strong team, and "hope is not a strategy" (the SRE motto): they rarely improve or leave while high performers burn out carrying them, morale leaks, and recruiting suffers.
- Act early, while you can still help them "up or out." Coaching resembles physical therapy: temporary micromanagement plus respect — a fixed window (~two months), small measurable goals, weekly check-ins, explicit milestones. They up their game, leave, or the misfit becomes obvious (often they'd thrive elsewhere).

### 5.14 Antipattern: Ignore Human Issues

- Managers promoted from technical work fixate on the technical half. The Pablo story: Jake works from home after having a baby, fully productive, teammate fine with it — and Pablo says, "Dude, people have kids all the time. You need to go into the office." A little empathy or a negotiated compromise would have preserved his respect.

### 5.15 Antipattern: Be Everyone's Friend

- New leads overwork to preserve friendships; but holding power over someone's career makes gestures of friendship feel artificially reciprocated. You can lead without being a close friend or a hard-ass; lunch with the team keeps connection comfortable. Managing a non-self-managing friend is stressful for everyone — avoid it if you can.

### 5.16 Antipattern: Compromise the Hiring Bar

- "A people hire other A people; B people hire C people" (Steve Jobs). Interviewing 50 and hiring the best 5 regardless of the bar is the fastest way to build a mediocre team: recruiting costs pale next to managing up or out a bad hire. If you don't control hiring, fight for better engineers.

### 5.17 Antipattern: Treat Your Team Like Children

- People act the way you treat them; permanent micromanagement means a hiring failure. Micro-trust scales down to supplies: Google's unlocked cabinets and self-service Tech Stops would be trivially stealable, yet employees are trusted to Do The Right Thing — even if a few cables vanish, that beats a workforce treated like children.

### 5.18 Positive Patterns

- The patterns the authors most respected in the leaders they followed.

### 5.19 Lose the Ego

- Humility isn't being a doormat: keep self-confidence, drop the egomania, cultivate a collective team ego. Trust the people in the trenches to decide the *how*; you drive consensus and direction — which buys them ownership and accountability.
- You won't have all the answers; acting like you do loses respect. Encourage inquiry — criticism from direct reports is precious. And when you make a mistake, apologize sincerely: the team already knows, it's free, and it earns respect.

### 5.20 Be a Zen Master

- Engineer-grade cynicism is a liability in a leader. Picture the org chart as gears: the manager's small turn spins the IC's gear several revolutions, so visible panic (or calm) propagates violently. "The leader is always on stage" — body language spreads infectiously.
- Bill Coughran, VP of engineering, was legendary for calm: chin in hand, asking questions of the panicking engineer until they focused. Second trick: when someone asks for advice, don't leap into solution mode — ask questions that refine the problem until they find the answer themselves (Socratic, rubber-duck-adjacent), which builds ownership.

### 5.21 Be a Catalyst

- Like a chemical catalyst, bring reactants together without being consumed: drive or nudge consensus. Directing by decree works but is less effective than consensus; a team voluntarily conceding direction to a lead to move faster is still consensus. (Don't chase 100% consensus — leaders decide amid uncertainty.)

### 5.22 Remove Roadblocks

- When the team is stuck on something easy for you and impossible for them, jump in: a manager untangled a legal impasse in two hours because he knew the right person; another got server resources the same afternoon; another connected a Java problem to the engineer who knew the answer. Knowing the right person often beats knowing the right answer.

### 5.23 Be a Teacher and a Mentor

- Watching a junior spend three hours on what you'd do in twenty minutes is painful — let them. Teaching scales the team and is how new hires absorb culture and responsibility, not just technology. Mentors need experience, the ability to explain, and the ability to gauge how much help the mentee needs — overexplaining loses them.

### 5.24 Set Clear Goals

- The truck metaphor: each team member holds a rope tied to the front; unclear goals mean everyone pulling a different direction, wasting energy and forcing constant course corrections. Write a concise mission statement, set priorities and trade-off rules, then step back into periodic check-ins and autonomy.

### 5.25 Be Honest

- "I won't lie to you, but I will tell you when I can't tell you something or if I just don't know." Admitting ignorance proves you're human, not weak.
- Skip the compliment sandwich: recipients hear only the compliments (the "wicked cool T-shirt collection"). The Tim story: the previous manager's sandwiching made feedback invisible; a frank, kind, factual conversation about alienating the team fixed things in weeks. Put someone on the defensive and they'll argue instead of change. Ben's "train" metaphor for the combative Dean: a new train comes every fifteen minutes — pick which ones to stop.

### 5.26 Track Happiness

- The best leaders are amateur psychologists: spread grungy thankless tasks evenly (one TLM keeps a spreadsheet), watch hours and deploy comp time and outings before burnout, open one-on-ones with technical unblocking before asking how the work feels.
- The simple closing question for every one-on-one: "What do you need?" Ask it every time and the team eventually arrives with a laundry list.

### 5.27 The Unexpected Question

- Eric Schmidt ended a first meeting with a new Googler by asking, "Is there anything you need?" — disarming someone braced for challenge. Have an answer ready; ask your team the same.
- Mekka opens one-on-ones asking people to rate their happiness 1–10. Unrealistic expectations about hours breed burnout and lost respect; slack for someone having a hard month. Track careers too: most people want promotion, learning, shipping something important, and smart colleagues — make those implicit goals explicit.

### 5.28 Other Tips and Tricks

- **Delegate, but get your hands dirty**: new leads must delegate even when slower; veterans earn a new team's respect by taking the grungy task nobody wants.
- **Seek to replace yourself**: hire people capable of replacing you and give them chances to lead. Never force great engineers into management — you lose a great engineer and gain a subpar manager.
- **Know when to make waves**: low performers, train-jumpers, and coasters don't fix themselves; delay only multiplies damage.
- **Shield your team from chaos**: the organizational insanity was always there; your manager just hid it. Share what's useful, deflect frivolous demands.
- **Tell them when they're doing well**: new leads over-focus on shortcomings; celebrate home runs publicly.
- **It's easy to say "yes" to something easy to undo**: a two-day tool experiment? Sure. A product you'll support for ten years? Think. More things are undoable than you think.

### 5.29 People Are Like Plants

- Raising six kids: equal treatment isn't equal needs — cacti, African violets, and tomatoes want different things. Team members differ likewise, needing different mixes of **motivation and direction**; giving either to someone who doesn't need it just annoys them. Direction is straightforward; motivation is subtler.

### 5.30 Intrinsic Versus Extrinsic Motivation

- Extrinsic motivation (cash) underperforms intrinsic. Dan Pink's *Drive*: increase intrinsic motivation via **autonomy** (own the how — deeper product connection and ownership), **mastery** (skills are a knife that dulls unsharpened, however expensive it was), and **purpose** (connect work to its effect — one manager forwards every customer thank-you email to the team, sparking motivation and product ideas).

### 5.31 Conclusion

- Leading differs from engineering; great engineers don't automatically make great managers, and healthy organizations offer real career paths for both. Engineering experience is invaluable in a manager, but the decisive skills are social: enable the team, keep it focused on proper goals, insulate it from outside problems — on the pillars of humility, trust, and respect.

### 5.32 TL;DRs

- Don't "manage" in the traditional sense; focus on leadership, influence, and serving your team.
- Delegate where possible; don't DIY.
- Pay particular attention to the focus, direction, and velocity of your team.

## Key terms

- **Engineering manager / tech lead / TLM**: leader of people / leader of technology / the combined role common on small teams.
- **Influence without authority**: getting people outside your organization to act by tying work to mission and priorities rather than reporting lines.
- **Manageritis**: the pattern of new managers replicating the bad management done to them.
- **Servant leadership**: leading by serving the team — removing obstacles, building consensus, managing technical and social health — rather than directing.
- **Compliment sandwich**: wrapping criticism in praise; discouraged because recipients hear only the compliments.
- **Autonomy, mastery, purpose**: Dan Pink's three levers of intrinsic motivation.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
