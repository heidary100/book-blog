---
title: "Concurrency"
book: pragmatic-programmer
chapter: 6
date: 2026-10-01
summary: "Concurrent code is now required, not exotic: break temporal coupling, never share mutable state, and coordinate work with actors or blackboards instead of locks."
tags: [concurrency, decoupling]
---

> Concurrency is when code acts as if it runs at the same time; parallelism is when it really does. Because the real world is asynchronous, every decent-sized system has concurrent aspects — so break artificial time-based dependencies, treat shared mutable state as incorrect state, and get concurrency without locks by using actors or blackboards.

## The big idea

Two definitions anchor the chapter. **Concurrency** is when the execution of two or more pieces of code *act as if* they run at the same time — you need an environment that can switch execution between parts of your code (fibers, threads, processes). **Parallelism** is when they *do* run at the same time — you need hardware that can do two things at once (multiple cores, CPUs, or machines). Concurrency is a software mechanism; parallelism is a hardware concern.

Why "everything is concurrent": it's almost impossible to write code in a decent-sized system without concurrent aspects, explicit or buried inside a library. The real world is asynchronous — users interacting, data being fetched, external services called, all at once — and forcing it serial leaves your system sluggish and your hardware idle. "Concurrent and parallel code used to be exotic. Now it is required."

The difficulty: language features safe in sequence become liabilities once two things can happen at once — the biggest culprit being *shared state* (any two chunks of code holding references to the same piece of mutable data, not just globals). The chapter's answer is progressive: break needless temporal coupling (Topic 33), stop sharing mutable state (Topic 34), or sidestep sharing entirely with actors (Topic 35) and blackboards (Topic 36).

## Topic by topic

### Topic 33. Breaking Temporal Coupling

Time is an ignored design element, with two aspects: **concurrency** (things happening at the same time) and **ordering** (relative positions in time). We design linearly — do this, then always do that — creating temporal coupling: method A must precede B, only one report runs at a time, the button click waits for the screen redraw, tick before tock. None of that is required by the actual problem.

- **Analyze workflow to find concurrency.** Activity diagrams (actions plus synchronization bars) expose what could run in parallel but isn't. The robotic piña colada maker's twelve "serial" steps collapse: opening the blender, opening the mix, measuring rum, getting glasses and umbrellas all happen up front; adding mix, ice, and rum proceed in parallel; during the one-minute *liquefy* a good bartender serves another customer. It's eye-opening to see where the dependencies really exist.
- **Look for time that isn't in your code.** The book's own build pipeline: each processor step runs concurrently, reading from the previous and writing to the next, because the steps are I/O-bound; the CPU-heavy conversion of mathematical formulas (~500 ms each, all independent) runs in parallel processes — builds are much faster on multicore machines, even flushing out concurrency errors along the way.
- **Opportunities for concurrency** are activities that take time but not time *in our code*: database queries, external service calls, waiting for user input — moments when the program would otherwise do "the CPU equivalent of twiddling one's thumbs." Diagrams show *potential*; design decides what's worth exploiting — the bartender doesn't have five hands.
- **Opportunities for parallelism** come from splitting relatively independent work into chunks, processing each in parallel, and combining results: the Elixir compiler compiles modules in parallel, pausing a module only when it depends on another's unfinished result.

Identifying the opportunities is the easy part — doing it safely is the rest of the chapter.

### Topic 34. Shared State Is Incorrect State

The diner: two waiters each look at the display case, each see one slice of pie, both promise it. Swap the case for a joint bank account and the waiters for point-of-sale devices, and someone is going to be very unhappy. The problem is shared state — each process looked without regard for the other.

- **Nonatomic updates.** In code: `if display_case.pie_count > 0 … take_pie()`. Between checking and acting, the other waiter runs. It's not that two processes write the same memory — it's that neither can guarantee its *view* of that memory is consistent: reading the count copies it into your head, and the world can change before you act. Fetch-then-update isn't atomic.
- **Semaphores / mutual exclusion.** Give the pie case a guardian — the book's plastic Leprechaun: whoever holds it may sell a pie. `case_semaphore.lock()` … `unlock()`. The weakness is sociological: it works only because *everyone* touching the case follows the convention — one developer who forgets puts us back in chaos.
- **Make the resource transactional.** Centralize control: `slice = display_case.get_pie_if_available()`. But a centralized method can still be called from multiple threads, so it *still* needs a semaphore — and the unlock must survive exceptions (an `update_sales_data` raise would otherwise lock the case forever), which is why languages ship `protect`-style helpers.
- **Multiple resource transactions.** Pie à la mode: claim a slice, find the ice cream gone, and now you're holding pie that's unavailable to the purist who wanted it plain. Nested try/rescue give-back code is ugly — business logic buried in housekeeping — and it's unclear which resource should own it. The pragmatic answer: treat "apple pie à la mode" as its *own* resource (or a generic composite menu item), so a request either succeeds or fails as a unit.
- **Beyond shared memory.** Files, databases, and external services all count — wherever two instances of your code can access a resource simultaneously, you have a potential problem. The authors' parallelized build failed in bizarre, random ways because some code temporarily changed the *current directory*, which is shared between threads. Hence: random failures are often concurrency issues.
- **Other exclusive access:** Rust builds ownership into the language (one reference to mutable data at a time); functional immutability helps but must still touch the mutable world eventually. The punchline stands: "Doctor, it hurts when I do this." "Then don't do that" — the next two topics show how.

### Topic 35. Actors and Processes

An **actor** is an independent virtual processor with its own local, private state and a mailbox. When a message arrives and the actor is idle, it wakes, processes the message to completion (one at a time), possibly creating actors, sending messages, and transitioning its own state, then sleeps. The negatives are the point: nothing is in control; the only state lives in messages and private actor state; messages are one-way (want a reply? include your mailbox address — the answer arrives as just another message); nothing is shared. Actors therefore run concurrently and asynchronously whether you have one processor or a thousand — the code doesn't change.

- **The diner as actors.** Three actors — customer, waiter, pie case — rebuilt in JavaScript with the Nact library, each a small object keyed by message types ("hungry for pie" → order to waiter → "get slice" to pie case → "put on table" plus "add to order", or the apology path). The pie case holds its slices in private state and returns the updated state one slice lighter. Run it twice and the interleaving may differ — and it's still correct, because no two actors ever touch shared memory.
- **No explicit concurrency.** No locks, no orchestrating "do this, do that" logic — actors work it out from the messages they receive — and no mention of the underlying architecture: the same components run on one core, many cores, or networked machines.
- **Erlang sets the stage.** Erlang calls actors *processes*: lightweight (millions per machine), isolated, message-passing. The runtime adds a supervision system that restarts failed processes and hot-code loading without stopping the system — infrastructure behind some of the world's most reliable code, often citing nine nines availability. Actor implementations exist for most languages.

### Topic 36. Blackboards

Picture detectives coordinating a murder investigation on one big blackboard: the chief writes "H. Dumpty (Male, Egg): Accident? Murder?", and detectives add facts, witness statements, forensics — and, crucially, *observations about connections* between what's already up there. Key properties: no detective knows any other detective exists; they have different training, expertise, and precincts; they come and go across shifts; anything can be posted. "Laissez-faire concurrency": independent processes cooperating through shared data none of them owns.

- **Lineage.** Blackboard systems started in AI (speech recognition, knowledge-based reasoning). Gelernter's Linda stored typed tuples with pattern-matching queries; JavaSpaces and T Spaces stored *active objects* retrieved by template matching or subtypes — an `Author` template with lastName "Shakespeare" finds the playwright, not Fred the gardener. They never took off, the authors think, because the need for cooperative concurrent processing hadn't yet developed.
- **When to use one.** Mortgage/loan processing: responses arrive in any order, gathering is spread across people, offices, and time zones, some data arrives automatically and asynchronously, some items wait on others (title search needs proof of ownership), and new data can trigger new requirements (a poor credit report adds five more forms). Workflow engines can encode all the combinations but are complex and programmer-intensive, and every regulation change means rewriting hard-wired code. A blackboard plus a rules engine handles it: arrival order is irrelevant — posting a fact triggers the rules that apply, and rule outputs post back, triggering yet more rules.
- **Messaging systems can be blackboards.** Kafka and NATS offer persistence via an event log and retrieval by pattern matching — enough to serve as a blackboard, or as the platform beneath a swarm of actors.
- **But it's not that simple.** Removing a whole class of concurrency problems costs you directness: most of the action is indirect, so keep a central repository of message formats and APIs (ideally one that generates code and docs), and invest in tracing — stamp each business function with a unique trace id and propagate it through every actor, so you can reconstruct what happened from the logs. More moving parts make deployment harder, partly offset by granular updates: you can replace individual actors instead of the whole system.

## Tips worth remembering

- **Tip 56 — Analyze Workflow to Improve Concurrency.** Use activity diagrams to find what could run in parallel but doesn't.
- **Tip 57 — Shared State Is Incorrect State.** No process can trust its view of memory another can change; make access atomic or don't share.
- **Tip 58 — Random Failures Are Often Concurrency Issues.** Bizarre intermittent bugs are usually a race you haven't spotted.
- **Tip 59 — Use Actors For Concurrency Without Shared State.** Independent processors with private state and mailboxes need no locks.
- **Tip 60 — Use Blackboards to Coordinate Workflow.** Let independent contributors post and react to facts, in any order.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
