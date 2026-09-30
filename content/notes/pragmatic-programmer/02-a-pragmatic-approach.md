---
title: "A Pragmatic Approach"
book: pragmatic-programmer
chapter: 2
date: 2026-10-01
summary: "Good design is easier to change. DRY, orthogonality, reversibility, tracer bullets, prototypes, domain languages, and estimating all serve that single goal."
tags: [design-process, complexity, abstractions]
---

> Good design is, in the end, design that is easier to change — the ETC principle. Chapter 2 turns that value into techniques: single authoritative representations (DRY), independent components (orthogonality), decisions kept reversible, feedback bought early with tracer bullets and cheap prototypes, code written in the domain's language, and schedules re-estimated alongside the code.

## The big idea

The load-bearing claim comes first (Topic 8): every design principle — decoupling, single responsibility, good naming, cohesion — is a special case of one question: did that make the system easier to change? Easier to Change (ETC) is a value, not a rule: a heuristic trained by deliberately asking at every save whether what you just did helped or hurt.

The remaining topics are mechanisms for keeping change cheap: duplication and interdependency make edits expensive, irreversible decisions let the ground shift underneath, while tracer bullets, prototypes, domain languages, and honest estimating replace speculation with feedback.

## Topic by topic

### Topic 8. The Essence of Good Design

**Tip 14: Good Design Is Easier to Change Than Bad Design.** A thing is well designed if it adapts to the people who use it, and code adapts by changing. Run the reductions: decoupling is good because isolated concerns are each easier to change; single responsibility because one requirements change touches one module; naming because you must read code to change it. When you can't tell which path future change favors: make what you write *replaceable* (decoupled and cohesive — the ultimate easy-to-change), and record your guess in the engineering daybook so later change lets you grade your own instincts.

### Topic 9. DRY—The Evils of Duplication

Maintenance isn't a phase that starts at release — programmers constantly re-express knowledge as understanding changes and requirements evolve. The danger is duplicated knowledge, and the fix is **Tip 15: DRY—Don't Repeat Yourself**: "every piece of knowledge must have a single, unambiguous, authoritative representation within a system." DRY is about knowledge and intent, not copy-pasted lines. Acid test: when one facet changes, do you edit it in multiple places, in multiple formats?

- **Code.** `print_balance` starts with negative-number formatting written twice, a repeated field width, repeated label handling; each refactor extracts one concern (`format_amount`, `report_line`) into one place. But identical code with different knowledge is not a violation: age and quantity validators that happen to match are coincidence, not duplication.
- **Documentation.** A comment restating the fee rules the code implements *will* drift apart from it; better naming (`calculate_account_fees`) removes the need for the comment.
- **Data.** A `Line` class storing `start`, `end`, and `length` duplicates what the points determine; make length a calculated method. If performance later forces caching, localize the violation behind accessors — Meyer's Uniform Access principle: callers can't tell storage from computation.
- **Representations.** Your code and any external API or data source share knowledge of the interface: mitigate with neutral API spec tools, OpenAPI, schema introspection — or a plain map plus table-driven validation.
- **Between developers.** A Y2K audit found over 10,000 programs, each with its own Social Security validation. Communicate (standups, chat with history), appoint a project librarian, keep shared utilities in one place, read each other's code. **Tip 16: Make It Easy to Reuse** — or people will duplicate.

The deeper kinship is with [information hiding](/books/aposd/05-information-hiding-and-leakage): a design decision should live in exactly one place.

### Topic 10. Orthogonality

From geometry: orthogonal things are independent — changes in one don't affect the others. The non-orthogonal nightmare is the helicopter: cyclic, collective, throttle, and tail pedals all interact, so "there is no such thing as a local fix." **Tip 17: Eliminate Effects Between Unrelated Things** — self-contained components with a single, well-defined purpose (cohesion). *Productivity:* changes and tests stay local, components get reused, and orthogonal systems combine with M×N leverage. *Risk:* diseased code is quarantined, the system less fragile, testing easier, vendors isolated. Design litmus test: dramatically change the requirements behind a function — how many modules are affected? The answer should be one. Don't build on identifiers you don't control — phone numbers, postal codes. Reject toolkits that force special ways to create or access objects; EJB's declarative transactions are the positive example. While coding: shy code (Law of Demeter), no global data (singletons included), distrust clusters of similar functions. A unit test that drags in half the system means poor decoupling, as do non-local bug fixes; even documentation has orthogonal axes — content and presentation. DRY minimizes duplication *within* components; orthogonality minimizes dependency *between* them — the instinct behind [deep modules](/books/aposd/04-modules-should-be-deep).

### Topic 11. Reversibility

Nothing is forever: the database you standardized on gets swapped by company edict at 85% done, and every critical decision narrows the target until "a butterfly in Tokyo" makes you miss. The failure isn't deciding — it's deciding *irreversibly*. DRY, decoupling, and external configuration shrink the set of decisions that must stick: abstract the database behind a persistence-as-a-service boundary and you can change horses in midstream; keep rendering off the server and a browser app becomes a mobile app without trauma. **Tip 18: There Are No Final Decisions** — write decisions in sand, not stone. The list of server-side "best practices" since 2000 (big iron → clusters → cloud VMs → containers → serverless → back to big iron) shows how fast the ground moves; hide third-party APIs behind your own abstractions and keep code in components. **Tip 19: Forgo Following Fads.** Closing image: Schrödinger's cat — how many possible futures can your code support?

### Topic 12. Tracer Bullets

Tracer rounds glow in flight, so gunners correct their aim in real conditions. Tracer bullet development is the analog for novel projects — vague requirements, unfamiliar tools, a changing environment — where the classic alternative (specify everything up front, fire once by dead reckoning, hope) fails worst. **Tip 20: Use Tracer Bullets to Find the Target:** code the important requirements and the biggest risks first. The first tracer is nearly trivial: hello-world that compiles and runs; then a thin slice through every architectural layer at once (the diagonal through the five-layer diagram). War story: a client-server project whose first end-to-end build could only list every row of a table — but it proved UI, query libraries, serialization, and SQL generation all talked, and functionality grew in parallel for months. Tracer code is *not disposable*: full error checking, structure, and documentation; it becomes the skeleton of the final system, just not fully functional yet. Payoffs: users see working software early and buy in; developers inherit a structure; integration is continuous; there's always something to demo; progress is measured in finished use cases, not a "95% complete" monolith. Missing the target is expected — small code has low inertia. Versus prototyping: prototypes explore specific aspects and are thrown away; tracer code is lean but complete and stays — prototyping is the reconnaissance before the first bullet.

### Topic 13. Prototypes and Post-it Notes

Like car makers' clay models, software prototypes analyze and expose risk at greatly reduced cost — and needn't be code: Post-it notes for workflow, whiteboard sketches for UIs. A prototype answers a few questions, so it may ignore **correctness** (dummy data), **completeness** (one menu item), **robustness** (crash and burn gloriously — that's okay), and **style**. If you can't give up those details, you're not really prototyping — you want a tracer bullet. Prototype anything risky, unproven, or critical: architecture, new functionality, external data structure, third-party tools, performance, UI design. **Tip 21: Prototype to Learn** — the value is the lessons, not the code. Architecture prototypes probe responsibilities, collaborations, coupling, duplication, interfaces, and data access — the last the biggest surprise generator. The warning: make the disposable status unmistakable, or sponsors will deploy it — you can build a car from balsa wood and duct tape, but you wouldn't drive it in rush-hour traffic. If your culture would misread it, choose tracer bullets.

### Topic 14. Domain Languages

Wittgenstein: the limits of language are the limits of one's world. Languages shape solutions, and the *domain's* language can suggest the program: write code in the domain's vocabulary, and when possible **program close to the problem domain (Tip 22)**. Examples: RSpec (behavioral tests in Ruby), Cucumber (plain-language features), Phoenix routes, Ansible's YAML specs. RSpec and Phoenix are *internal* languages — host code that reads like the domain; Cucumber and Ansible are *external*, read and converted. Internal DSLs inherit the host's power for free (a loop generates a hundred tests) but are bound by its syntax; external ones can be anything you can parse (borrowing YAML inherits its compromises) at the cost of a parser. The economics rule: don't spend more effort than you save. Prefer off-the-shelf formats (YAML, JSON, CSV); otherwise internal; external only when users write the language themselves. Sidebar: business users rarely review Cucumber features because requirements aren't truly known up front — sign-off is "checking the spelling in an essay written in Sumerian"; running code is where real needs surface. Cheap internal DSL trick: no metaprogramming — `describe`, `it`, and `expect` are just Ruby methods.

```ruby
describe BowlingScore do
  it "totals 12 if you score 3 four times" do
    score = BowlingScore.new
    4.times { score.add_pins(3) }
    expect(score.total).to eq(12)
  end
end
```

### Topic 15. Estimating

**Tip 23: Estimate to Avoid Surprises.** Estimation builds an intuitive feel for magnitudes — whether "send the backup to S3 over the network" is feasible, which subsystems need optimizing. Match units to intended accuracy: "about six months" promises less precision than the identical "130 working days." Scale: 1–15 days in days, 3–6 weeks in weeks, 8–20 weeks in months; beyond that, think hard. Best trick: ask someone who's already done it. Then: understand what's asked (state the scope — "no traffic, gas in the car: 20 minutes"); build a rough model (it reveals patterns, sometimes a cheaper variant of the question); break it into components; value the parameters — multiplicative ones dominate (doubling line speed doubles throughput; a fixed 5ms delay vanishes); calculate with varied inputs, couching answers in the driving parameters ("roughly three quarters of a second" vs 750ms). A strange answer means your model is wrong. Record estimates; when one misses, find out why. For schedules: people really estimate in ranges (painting the house: 10 hours if all goes well, 18 realistically, 30 if weather turns) — formalized in PERT's optimistic/most-likely/pessimistic triads, which also beat the padding reflex; the authors stay lukewarm on wall-sized charts built on false confidence. What works: incremental development — check requirements, analyze risk (riskiest first), design/implement/integrate, validate with users — re-estimating after each thin slice. **Tip 24: Iterate the Schedule with the Code.** Management wants one hard number up front; help them see the team and its environment determine the schedule. And the single correct answer when asked for an estimate: "I'll get back to you" — coffee-machine estimates come back to haunt you.

## Tips worth remembering

- **Tip 14 — Good Design Is Easier to Change Than Bad Design**
- **Tip 15 — DRY—Don't Repeat Yourself**
- **Tip 16 — Make It Easy to Reuse**
- **Tip 17 — Eliminate Effects Between Unrelated Things**
- **Tip 18 — There Are No Final Decisions**
- **Tip 19 — Forgo Following Fads**
- **Tip 20 — Use Tracer Bullets to Find the Target**
- **Tip 21 — Prototype to Learn**
- **Tip 22 — Program Close to the Problem Domain**
- **Tip 23 — Estimate to Avoid Surprises**
- **Tip 24 — Iterate the Schedule with the Code**

## My takeaways
*Fill this in as you re-read and apply the chapter.*
