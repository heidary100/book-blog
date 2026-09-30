---
title: "Pragmatic Paranoia"
book: pragmatic-programmer
chapter: 4
date: 2026-10-01
summary: "You can't write perfect software, so be paranoid: design contracts, crash when the impossible happens, assert everything, balance every resource, and never outrun your feedback."
tags: [errors, testing]
---

> Perfect software is impossible, so the pragmatic stance is professional paranoia: make each module's rights and responsibilities explicit, treat any "impossible" error as very bad news, and die cleanly rather than limp on with corrupted state. Pair that with disciplined resource ownership and a strict speed limit — never take a step bigger than your feedback can confirm.

## The big idea

Programs run in a messy world of bad data, bad actors, bad versions, and bad specifications. Assume the opposite of "it will work" and build machinery that surfaces the gap between what the code believes and what is true: contracts state who is responsible for what, crashing early stops the program at the scene of the crime, assertions are a permanent second line of defense, resource balancing guarantees you give back everything you take, and small steps keep action and feedback close together.

The unifying move is responsibility assignment. Contracts shift input correctness to the caller; crash-early puts diagnosis at the failure site; "finish what you start" pins each resource to one owner; "don't outrun your headlights" pins the future to what your feedback loop can actually see.

## Topic by topic

### Topic 23. Design by Contract

Bertrand Meyer's idea (born in Eiffel): a correct program "does no more and no less than it claims to do" — and those claims should be documented *and checked*. A routine's contract has three parts:

- **Preconditions** — what must be true for the routine to be called; the caller's responsibility. The routine should never see a violating state.
- **Postconditions** — what the routine guarantees when it finishes (which implies it finishes — no infinite loops).
- **Class invariants** — conditions always true from the caller's perspective at every routine entry and exit, even if briefly false mid-method.

The deal: *if* the caller meets the preconditions, *then* the routine guarantees postconditions and invariants. Violating it is a bug, not an expected event — so preconditions are the wrong tool for user-input validation. Examples: Clojure's `:pre`/`:post` conditions on `accept-deposit` (amount > 0, account open); Elixir guard clauses, where a non-positive deposit raises `FunctionClauseError` — you simply cannot call the function with out-of-range arguments. Be "lazy" code: strict in what you accept, promise as little as possible.

- **DBC vs TDD:** both pursue correctness, but DBC needs no setup or mocking, covers *all* cases rather than sampled ones, is active from design through maintenance (not just test time), checks internal invariants black-box tests miss, and is DRYer than defensive programming where everyone validates because no one else does. Invariants generalize beyond OO — they're claims about state, whatever holds it.
- **Implementing it:** even without language support, enumerating input domains, boundaries, and promises *before* coding is a huge leap — otherwise you're programming by coincidence. Assertions only partially emulate DBC: they don't propagate down inheritance hierarchies, can be disabled globally, lack "old" values (Eiffel's `old`), and runtime libraries never check contracts — yet most problems appear exactly at the library boundary.
- **Who checks?** With language support, the runtime checks between call and entry; explicitly, it's the caller. Express the domain of `sqrt` in its precondition and the burden of correctness shifts to the caller, where it belongs — and a negative argument then yields `sqrt_arg_must_be_positive` and a stack trace instead of `NaN` that detonates far away.
- **Semantic invariants** are a "philosophical contract" — inviolate laws, not policy. In a debit-card switch, the same transaction must never be applied twice; the one-line law "Err in favor of the consumer" guided error recovery across the whole system.

### Topic 24. Dead Programs Tell No Lies

Errors are information; other code often notices your bug before you do — a nil passed in, a missing key, an unexpected `default` clause (which is why every switch needs a `default`: you want to know when the impossible happened). Reject the "it can't happen" mentality: verify data, production code, and loaded dependency versions are what you think. And read the damn error message.

**Catch and release is for fish.** Wrapping every call in `rescue` → log → bare `raise` buries application code and couples you to the full list of exceptions a method might raise — one new exception and your handler is subtly stale. The pragmatic version is just `add_score_to_board(score);` and let exceptions propagate.

**Crash, don't trash.** Once something impossible has happened, the program is no longer viable — everything it does next is suspect, whether that's corrupting a vital database or commanding the washing machine into its twentieth spin cycle. Erlang/Elixir embrace this ("Defensive programming is a waste of time. Let it crash!" — Joe Armstrong): programs are designed to fail, with *supervisors* in trees handling cleanup and restart. Where immediate exit is inappropriate, clean up first (resources, transactions, logs), but a dead program normally does a lot less damage than a crippled one. APOSD attacks the same problem from the other side — [Define Errors Out of Existence](/books/aposd/10-define-errors-out-of-existence).

### Topic 25. Assertive Programming

Every programmer learns the mantra "This can never happen…" — about internationalization, negative counts, logging failures. Refuse the self-deception: whenever you catch yourself thinking it, add code to check it. Assertions are the cheapest form: `assert(result != null)`, or Java's annotated `assert result != null && result.size() > 0 : "Empty result from XYZ"`. They verify algorithms too: `assert(is_sorted?(books))` after `my_sort`.

- Assertions check for things that should *never* happen — don't use them instead of real error handling (asserting the user typed 'Y' or 'N' is "a very bad idea"). You may trap the exit to free resources, but the dying code must not rely on the information that triggered the failure.
- **Watch for side effects:** `assert(iter.nextElement() != null)` inside a loop consumes half the elements — a Heisenbug, where debugging code changes the system's behavior.
- **Leave assertions on.** The "turn them off in production" argument assumes testing finds all the bugs (you test a minuscule fraction of the permutations) and that production is as tame as the lab (rats gnaw cables, memory runs out, disks fill). Turning them off is "like crossing a high wire without a net because you once made it across in practice." If one hot check truly costs you, make that one optional — keep the rest. A startup Andy knew left assertions live in production, harvested real-world failure data, became remarkably stable — and was acquired for hundreds of millions of dollars.

### Topic 26. How to Balance Resources

Resources — memory, transactions, threads, connections, files, timers — follow an allocate/use/deallocate cycle, yet many developers have no consistent plan. The plan: whoever allocates a resource deallocates it. The cautionary Ruby example: `read_customer` opens a file into a shared instance variable, `write_customer` closes it; when a spec change makes a maintainer skip `write_customer` in some paths, production dies hours later of too many open files. The refactor puts open and close in `update_customer`, passing the file as a parameter; better still, Ruby's block form `File.open(...) do |file| ... end` guarantees the close.

- **Nest allocations:** deallocate in reverse order (don't orphan resources referenced by others) and allocate the same set in the same order everywhere (process A holding r1 while waiting for r2, with B holding r2 while waiting for r1, is deadlock).
- **Objects and exceptions:** wrap resources in classes so scope or destructor handles them — Rust's `accounts` variable closes its file on scope exit; otherwise use `finally`. Beware allocating *inside* the `begin` block: a failed allocation still runs `finally` and deallocates something that never existed. Allocate first, then enter the `try`.
- **When you can't balance** (dynamic data structures), set a *semantic invariant for ownership*: the top structure recursively frees its children, orphans them, or refuses to deallocate while holding substructures. Decide explicitly per structure; in C, write a module per major structure providing standard allocation/deallocation.
- **Check the balance:** trust no one, including yourself — wrap each resource type to track allocations and frees, and assert at stable points (e.g. the top of a server's main loop) that usage hasn't crept up. Balance over time too: logs and debug files need rotation and expiry.

### Topic 27. Don't Outrun Your Headlights

Low-beam headlights illuminate about 160 feet; stopping distance at 70 mph is 464 — driving faster than you can see and steer is how you end up in the valley. In software, your headlights are how far ahead you can see (a few hours or days), and it's darkest off-axis. So always take small, deliberate steps, checking for feedback and adjusting before proceeding — feedback (REPL results, unit tests, user demos: anything that independently confirms or disproves your action) *is* your speed limit.

A task is too big when it requires fortune-telling: estimating completion dates months out, designing for future maintainability or extensibility, guessing users' future needs or future technology. Don't design for an uncertain future — design code to be *replaceable*, which also improves cohesion, coupling, and DRY. Taleb's black swans are why: history turns on rare, high-impact, unpredictable events, and cognitive biases blind you to change creeping in from the edge (the era's great debate — Motif or OpenLook? — was settled by the web). Tomorrow usually looks like today; don't count on it.

## Tips worth remembering

- **Tip 37 — Design with Contracts.** Be strict in what you will accept before you begin, and promise as little as possible in return.
- **Tip 38 — Crash Early.** A dead program normally does a lot less damage than a crippled one.
- **Tip 39 — Use Assertions to Prevent the Impossible.** Whenever you find yourself thinking "but of course that could never happen," add code to check it.
- **Tip 40 — Finish What You Start.** The function or object that allocates a resource should be responsible for deallocating it.
- **Tip 41 — Act Locally.** When in doubt, it always pays to reduce scope.
- **Tip 42 — Take Small Steps—Always.** Always take small, deliberate steps, checking for feedback and adjusting before proceeding; the rate of feedback is your speed limit.
- **Tip 43 — Avoid Fortune-Telling.** Much of the time, tomorrow looks a lot like today. But don't count on it.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
