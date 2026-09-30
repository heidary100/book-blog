---
title: "While You Are Coding"
book: pragmatic-programmer
chapter: 7
date: 2026-10-01
summary: "Coding is a feedback loop: listen to unease, program deliberately, estimate algorithm cost, refactor early, let tests shape design, and name things with intent."
tags: [design-process, testing, naming]
---

> While you code, accumulated experience talks to you through feelings — unease, reluctance, a sense that this is too hard. The chapter is about acting on those signals: program deliberately instead of by coincidence, keep algorithmic cost in view, refactor early and often, and treat tests as design feedback rather than bug hunts. Then close the loop with security basics and names that express intent.

## The big idea

Coding is not transcription of a finished design; it is a conversation. Your nonconscious brain has packed away years of patterns and speaks in feelings rather than words — the nagging doubt before a blank page, the muddy uphill slog, the design that "just feels wrong" are all data. The code talks back too: coincidental success hides false assumptions, runtimes explode past small inputs, names drift from meaning. Every topic here is a mechanism for noticing what is being said and responding while the response is cheap.

The discipline running through it all is deliberateness. Fred's code "seems to work" until it doesn't, because he never knew why it worked. Pragmatic programmers replace luck with contracts and tests, ad hoc pokes with regression suites, and vague identifiers with names that document intent. The reward is speed — of algorithms, yes, but above all of change, which is the point of good design.

## Topic by topic

### Topic 37. Listen to Your Lizard Brain

Instincts are patterns packed into the nonconscious brain; they have no words — they make you feel, not think: nervous, queasy, "this is too much work." Gavin de Becker's point in *The Gift of Fear* applies to code: most people ignore these signals and tell themselves they're being silly. Two common signals:

- **Fear of the blank page.** Either your experience is flagging a real doubt (heed it; it will crystallize into something addressable), or plain fear of making a mistake, spiked with imposter syndrome.
- **Fighting yourself.** When coding feels like walking uphill in mud, the code is telling you something: the design is wrong, you're solving the wrong problem, or you're breeding bugs. Don't soldier on.

**How to talk lizard (Tip 61):** stop — walk, have lunch, sleep on it; externalize — doodle, explain to a non-programmer or your rubber duck until the "Oh! Of course!" moment; and if still stuck, prototype. The brain hack: write "I'm prototyping" on a sticky note, remember prototypes are meant to fail and get thrown away, write a one-sentence comment of what you want to learn, and start coding. The nervousness evaporates; then delete the prototype and write the real thing. The same listening applies to other people's code and to designs and requirements that feel wrong — something is lurking in that dark doorway.

### Topic 38. Programming by Coincidence

The war-movie soldier prods the minefield, finds nothing, and marches — the probes were merely lucky. Fred types code until it "seems to work," then can't fix it when it stops, because he never knew why it worked.

- **Accidents of implementation.** Relying on undocumented behavior — code that answers a GUI call sequence like this works only by accident, and the framework author never intended it:

  ```java
  paint();
  invalidate();
  validate();
  revalidate();
  repaint();
  paintImmediately();
  ```

  It may not really work, the boundary may not hold elsewhere, undocumented behavior changes with the next release, and extra calls cost speed and risk bugs. Rely only on documented behavior; if you can't, document the assumption — contracts eliminate misunderstandings.
- **Close enough isn't.** A field data-collection project ran every unit on local time; results were "only off by one," and fixes accreted into a codebase of +1/-1 hacks until none of it was correct and the project was scrapped. (Footnote: UTC is there for a reason.)
- **Phantom patterns.** Humans see patterns everywhere — Russian leaders alternating bald and hairy for 200 years, gamblers' streaks. An intermittent error every 1,000 requests may be a race condition or a fluke: "Don't assume it, prove it."
- **Accidents of context.** Do you really have a GUI, English-speaking users, a writable current directory, accurate server time? Copied-from-the-net answers may be cargo cult code — "finding an answer that happens to fit is not the same as the right answer."

**How to program deliberately:** know what you're doing and be able to explain it to a more junior programmer; don't code in the dark; proceed from a plan; rely only on reliable things; document and *test* your assumptions; prioritize the fundamentals; and don't be a slave to history — existing code doesn't dictate future code. (Tip 62)

### Topic 39. Algorithm Speed

A second kind of everyday estimating: the resources — time, processor, memory — an algorithm uses as input grows. Big-O ("on the order of") bounds how the cost grows, dropping low-order terms and constants: an algorithm 1,000× faster than another looks identical in the notation. A routine taking 1 second for 100 records, run on 1,000: O(1) still 1s; O(log n) about 3s; O(n) 10s; O(n log n) 33s; O(n²) 100s; O(2^n) — enjoy the end of the universe.

Common-sense classes to recognize as you write: simple loop from 1 to n — O(n); nested loops — O(n×m), typically O(n²) for simple sorts; binary chop that halves each pass — O(log n) (binary search, tree traversal); divide and conquer — O(n log n) (quicksort on average); combinatoric — factorial blowups (permutations, traveling salesman, set packing), tamed only by heuristics.

The practical habit (Tip 63): whenever you write a loop containing a loop, ask how large n can get. If the bounds depend on external factors — overnight batch records, names in a list — consider the consequences before shipping. If stuck at O(n²), look for a divide-and-conquer O(n log n). If unsure, run with varying input sizes and plot three or four points; use profilers to count step executions (Tip 64). Mind the practical side too: linear-looking code can thrash on millions of records, a sort tested on random keys may collapse on ordered input — "the only timing that counts is... in the production environment, with real data."

**Best isn't always best.** For small inputs, insertion sort matches quicksort and is faster to write and debug; beware high setup costs and premature optimization — confirm a bottleneck before spending time on it. The same argument Ousterhout makes about designing for performance up front rather than bolt-on tuning: [Designing for Performance](/books/aposd/20-designing-for-performance).

### Topic 40. Refactoring

The construction metaphor (blueprints, contractors, tenants) is wrong for software; gardening is closer — plant, prune, weed, constantly monitor and adjust. Within restructuring, **refactoring** is Fowler's "disciplined technique for restructuring an existing body of code, altering its internal structure without changing its external behavior." Two critical parts: it is disciplined, not a free-for-all, and external behavior must not change — this is not the time to add features. It's weeding and raking: a day-to-day activity of small, low-risk steps backed by automated tests, not an annual replanting.

**When:** whenever you've learned something — duplication (DRY violation), nonorthogonal design, outdated knowledge, changed usage, performance needs, or simply when the tests pass after a small increment (a fine moment to tidy what you just wrote).

**Time pressure** is the standard excuse, and it fails: skip it now and the cost grows with the dependencies. Medical analogy — a growth is cheap to remove while small, dangerous when it spreads. If it truly needs "a week to refactor," that's a rewrite: schedule it and tell the users of the affected code. (Tip 65)

**How:** Fowler's rules — don't refactor and add functionality at the same time; have good tests and run them constantly; take short, deliberate steps (move a field, split a method, rename a variable) and test after each. Modern IDEs automate much of this. If you must change external behavior, deliberately break the build so old clients fail to compile and reveal what needs updating. And don't live with broken windows: fix code when you see it.

### Topic 41. Test to Code

The chapter's boldest claim (Tip 66): testing's major benefits happen when you *think about and write* the tests, not when you run them. Worked example: about to write `return_avid_viewers` for people watching 10+ videos a week? Imagining the test forces two changes before a line of code exists — pass the database in as a parameter instead of using a global (less coupling), and pass the *name* of the qualifying field in, because the requirement's "watched" is ambiguous (opened vs. completed). Tip 67: a test is the first user of your code — hard-to-test code is over-coupled code, and thinking about boundary and error conditions up front reveals the structure the function should have.

- **TDD.** Decide a small piece, write a failing test, run all tests, write the smallest code to pass, refactor; cycles of minutes. Great for beginners, but watch the failure modes: chasing 100% coverage, redundant no-op tests (a failing test that only references the class name), bottom-up designs.
- **Top-down vs. bottom-up.** Neither works — both ignore that "we don't know what we're doing when we start." Build end-to-end instead (Tip 68): small pieces of complete functionality, learning and involving the customer as you go. Cautionary tale: Ron Jeffries TDD'd a Sudoku solver for five posts, polishing the board representation, then abandoned it; Peter Norvig started from how such problems are actually solved (constraint propagation) and solved it. "Unless you have a destination in mind, you can end up going in circles."
- **Testability by design.** Like hardware chips with Built-In Self Test, build testability in from the beginning (Tip 69). A unit test is code exercising a module in a controlled environment, checked against known values or previous runs.
- **Test against contract.** A square root's contract tells you exactly what to test:

  ```text
  pre-conditions:  argument >= 0
  post-conditions: ((result * result) - argument).abs <= epsilon * argument
  ```

  So: reject negatives, accept zero (boundary), check accuracy across the range, assert the exception for -4.0. For composite modules, test subcomponent contracts first, then the module's — if the parts passed and the whole failed, the bug is in the middle. This avoids shipping "time bombs."
- **Practice.** Formalize ad hoc tests from debugging sessions — if it broke once, it will break again. Build a test window for deployed software: parseable logs (not "spew"), magic URLs, feature switches for diagnostics. Dave's confession: after 30 years of testing he stopped for two months and found most of his benefit had migrated into how he *thinks* — but he still writes tests for shared code and external dependencies. Verdict: yes, you should write tests.
- **Culture.** Test First, Test During, or Test Never — "Test Later" is a lie. All tests pass all the time; tolerating always-failing tests starts the entropy spiral. Treat test code as production code, and don't depend on unreliable things (widget positions, exact timestamps, error-message wording) or your tests become fragile. "Testing, design, coding — it's all programming." (Tip 70)

### Topic 42. Property-Based Testing

Unit tests share a weakness: you wrote the code and the tests, so one wrong assumption can live in both. Splitting authorship loses the design feedback. The alternative: let the computer — which shares none of your preconceptions — generate the cases. Define **properties** (contracts plus invariants: a sorted list has the same length; no element exceeds its successor) and let a framework try hundreds of random inputs against them. (Tip 71)

```python
@given(some.lists(some.integers()))
def test_list_size_is_invariant_across_sorting(a_list):
    original_length = len(a_list)
    a_list.sort()
    assert len(a_list) == original_length
```

Strategies compose (`integers(min_value=5, max_value=10).map(lambda x: x * 2)` gives evens 10–20), and Hypothesis runs each test a hundred times with fresh data.

The warehouse example shows why this matters. A `Warehouse` with `in_stock`, `take_from_stock`, and an `order` function passes every handwritten unit test. Then a conservation property — stock taken plus stock remaining equals original stock — fails immediately with `item='hats', quantity=3`: `in_stock` only checked that *some* existed, not *enough* for the order. The unit tests encoded the same wrong assumption as the code; the property test surfaced it. Expect surprises — the bug found is often not the one you were probing — and when a property fails, extract the falsifying parameters into a regular unit test: it focuses debugging *and* becomes a regression test, since random values won't repeat. Thinking in invariants also improves design: it removes edge cases and exposes functions that leave data inconsistent. Property-based and unit testing are complementary.

### Topic 43. Stay Safe Out There

The first edition said developers needn't be "as paranoid as spies or dissidents." Retracted: you do, every day. Most breaches aren't clever attacks — they're careless developers. After your code "works," you're 90% done with the other 90%: bad parameters, unavailable resources — and now deliberately hostile outsiders. An unpatched system on the open net survives minutes; security through obscurity doesn't work. Five principles:

- **Minimize attack surface.** Every way in — code complexity (porous, hard to reason about), input data (never trust; sanitize; Ruby's `$SAFE` tainting catches `test.dat; rm -rf /` fed to `system("wc -c #{name}")`), unauthenticated services (publicly readable cloud data stores), over-privileged accounts (cull stale users and default passwords), output data (don't leak "Password is used by another user"; truncate ID numbers), and debugging info (stack traces on ATMs and kiosks). (Tip 72)
- **Least privilege.** Least permission, shortest time — Unix `login` runs as root only until it authenticates you; prefer fine-grained access over blunt admin/user roles.
- **Secure defaults.** Ship the most secure settings; let individuals opt into convenience.
- **Encrypt sensitive data.** No plaintext PII or credentials — and never check secrets, API keys, or SSH keys into version control. The NIST password sidebar inverts common sense: allow long passwords (256 max recommended), never truncate, allow all printing characters, don't disable paste, no composition rules or forced rotations without cause — artificial constraints *lower* entropy.
- **Maintain updates.** Patch fast (Tip 73); the largest breaches in history came from systems behind on updates.

**Common sense vs. crypto:** never roll your own. A homemade cipher falls to an expert in minutes; even "simple" authentication drags in hashes, salts, and rainbow tables. Use well-vetted, well-maintained libraries — or hand authentication to a provider that does it all day, every day.

### Topic 44. Naming Things

Names reveal intent and belief, so name things for the *role they play* — pause and ask "what is my motivation to create this?" The question routinely exposes design mistakes: if you can't name it, maybe it shouldn't exist. The Stroop effect shows why names matter: the brain reads words faster than almost anything else, giving them priority in comprehension. Upgrading names to intent:

- `user = authenticate(credentials)` → on a jewelry site, `customer` or `buyer` reminds you what this person is doing and why you care.
- `deductPercent(double amount)` → `applyDiscount(Percentage discount)`: the verb states purpose, and a dedicated type kills the eternal "is it 0–100 or 0.0–1.0?" ambiguity.
- `Fib.fib(n)` → `Fib.of(0)`, `Fib.nth(20)`: the module already gives context; don't repeat it.

Counterpoint: single-letter `i`, `j`, `k` are fine *where the language culture expects them* (C loop variables, traceable to FORTRAN's integer range) and jarring where it doesn't — honor local conventions of casing and naming. On a team, consistency beats Emerson: maintain a project glossary, let jargon spread through pairing, and use it as shorthand — that's what a pattern language is. Worst of all are *misleading* names ("the routine called getData really writes data to an archive file"): when a name drifts from meaning, fix it now — you have regression tests (Tip 74). If renaming is hard, you have an ETC violation; fix that first. Ousterhout makes naming a design principle in its own right: [Choosing Names](/books/aposd/14-choosing-names).

## Tips worth remembering

- **Tip 61 — Listen to Your Inner Lizard.** Your instincts encode experience; when something feels wrong, stop and find out why.
- **Tip 62 — Don't Program by Coincidence.** Rely only on deliberate, documented behavior — never on luck and accidental successes.
- **Tip 63 — Estimate the Order of Your Algorithms.** Know the Big-O of what you write, and how large n can get.
- **Tip 64 — Test Your Estimates.** Run with varying input sizes and plot; measure in production conditions with real data.
- **Tip 65 — Refactor Early, Refactor Often.** Small disciplined steps now beat expensive surgery later.
- **Tip 66 — Testing Is Not About Finding Bugs.** The main benefit is the thinking and design feedback while writing tests.
- **Tip 67 — A Test Is the First User of Your Code.** Testability forces decoupling and clarifies the API.
- **Tip 68 — Build End-to-End, Not Top-Down or Bottom Up.** Grow small vertical slices, learning as you go.
- **Tip 69 — Design to Test.** Build testability in from the beginning, like chips with self-test.
- **Tip 70 — Test Your Software, or Your Users Will.** Testing is part of programming, not another department's job.
- **Tip 71 — Use Property-Based Tests to Validate Your Assumptions.** Let the machine generate inputs against contracts and invariants.
- **Tip 72 — Keep It Simple and Minimize Attack Surfaces.** Less code, fewer entry points, fewer holes.
- **Tip 73 — Apply Security Patches Quickly.** Every net-connected device, always; known exploits are the biggest breaches.
- **Tip 74 — Name Well; Rename When Needed.** Names must keep expressing intent as meaning drifts.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
