---
title: "Bend or Break"
book: pragmatic-programmer
chapter: 5
date: 2026-10-01
summary: "Decoupling is what makes code easy to change: kill train wrecks, globals, and inheritance; coordinate through events; think in data transformations; push what varies into configuration."
tags: [decoupling, abstractions]
---

> Software that can't bend will break: coupling links things that must change in parallel, so good design keeps components ignorant of each other. This chapter catalogs the big coupling sources — chained method calls, global data, subclassing — and the alternatives that bend: events, transformation pipelines, interfaces/delegation/mixins, and external configuration.

## The big idea

Good design is design that makes code *easy to change*, and coupling is the enemy: it links things that must change in parallel, so you either hunt down every affected part or discover why changing "just one thing" broke others. Bridges are deliberately rigid — links hold the shape; software should be the opposite, each component coupled to as few others as possible. And coupling is *transitive*: if A couples to B and C, and B to M and N, and C to X and Y, then A really couples to all six. Symptoms: wacky dependencies between unrelated modules, "simple" changes that break things elsewhere, developers afraid to touch code, and meetings everyone must attend.

The chapter's arc: spot coupling (train wrecks, globals, inheritance), respond to a world that keeps happening (FSMs, observers, pub/sub, reactive streams), adopt a different mental model (programs as transformations of data, not objects chatting with each other), and externalize what will change anyway (configuration). The through-line is [information hiding](/books/aposd/05-information-hiding-and-leakage): keep implementation knowledge in one place so change stays local.

## Topic by topic

### Topic 28. Decoupling

**Train wrecks** — chains of method calls. `customer.orders.find(order_id).getTotals()` walks five levels of abstraction: the top-level code secretly knows customers expose orders, orders have a `find`, orders hold a separate totals object — all of it must freeze for the code to keep working. Ask where the rule "no discount over 40%" would live: with raw fields anyone can set, *any* code anywhere could violate it.

- **Tell, don't ask.** Don't decide based on an object's internal state and then update it — that destroys encapsulation and spreads implementation knowledge everywhere. Delegate: `totals.applyDiscount(discount)`, then `customer.findOrder(order_id).applyDiscount(discount)`. But TDA is a pattern, not a law of nature: customers *having* orders is a universal domain concept, so exposing `findOrder` is deliberate.
- **The Law of Demeter** — call only your own methods, your parameters, objects you create, and globals — is "more like the Jolly Good Idea of Demeter." The simpler rule: no more than one "." per access, intermediate variables included. Exception: chains over things *very unlikely to change* — language libraries are stable; application code and volatile third-party libraries are not. (Pipelines, Topic 30, couple too — output must fit the next input — but far less than train wrecks, which rely on hidden implementation details.)

**Globalization.** Every piece of global data acts as an extra hidden parameter on every method: changing it potentially touches everything, you can never be sure you found every place, it blocks extraction and reuse, and it shows up as elaborate setup rituals in unit tests. A singleton with exported instance variables "is still just global data. It just has a longer name"; hiding it behind `Config.getLogLevel()` methods still leaves only one set. Any *mutable external resource* — database, filesystem, service API — is global data too; wrap it behind code you control. **Inheritance** adds coupling — enough to get its own topic (Topic 31).

### Topic 29. Juggling the Real World

Computers must integrate into our messy world, not the reverse, and events are the unit of that mess: "an event represents the availability of information" — a button click or stock quote from outside, a finished calculation or search from inside. Event-driven applications are more interactive and use resources better. Four strategies:

- **Finite State Machines.** Just a specification of how to handle events: states, and per state, which events cause which transitions. A multipart websocket protocol (header → data messages → trailer; anything else an error) fits in a table: `state = TRANSITIONS[state][msg.msg_type] || :error`. Transitions can carry *actions* — the string-extraction FSM pairs each transition with an action to handle escaped quotes. FSMs are expressible purely as data, take a couple of lines, and are drastically underused (Dave writes one almost weekly); with state in external storage they even model multi-session workflows.
- **Observer pattern.** An *observable* keeps a list of callbacks registered by *observers* and calls each when the event fires — the `Terminator` shutdown-notification module is ~10 lines, "a good example of when not to use a library." Problem: registration couples observers to the observable, and synchronous inline callbacks can bottleneck.
- **Publish/Subscribe.** Generalizes observer: publishers and subscribers connect through named *channels* implemented by separate infrastructure, so communication happens outside your code and can be asynchronous. It decouples beautifully and lets code be swapped while the app runs — but it's hard to see what's going on, since a publisher doesn't reveal its subscribers.
- **Reactive programming and streams.** Spreadsheets made reactivity mainstream: change a cell, dependents react. *Streams* treat events as a collection — filter, combine, zip them like lists. RxJS: zipping an animal list with a 500 ms interval emits one value per tick; `mergeMap` over three AJAX fetches runs them in parallel, results landing out of order. The payoff: "event streams unify synchronous and asynchronous processing behind a common, convenient API."

### Topic 30. Transforming Programming

All programs transform data — input to output — yet we design around classes, modules, and frameworks instead of transformations. The 1970s Unix answer to "five longest files by line count" is a pipeline: `find . -type f | xargs wc -l | sort -n | tail -5` — directory name → file list → counts → sorted → last five. "Almost like an industrial assembly line."

- **Finding transformations:** start from the requirement's inputs and outputs, then decompose. The anagram finder ("lvyin" → words grouped by length) splits into four steps — combinations of ≥3 letters, signatures (sorted letters), dictionary lookups by signature, group by length — and each step decomposes again until every piece is trivially writable in Elixir with `|>`.
- The pipe operator isn't just syntactic sugar; it's "a revolutionary opportunity to think differently" — every `|>` is data flowing between transformations. Without one, the same philosophy works as a series of assignments, each holding one transformation's result.
- **Why it's great:** the main function reads as a literate chain of exactly the transformations the requirement describes, and it upends the OO reflex of hiding data in objects that "chatter back and forth, changing each other's state." Instead of hoarded state, data is "a mighty river, a flow": a function is reusable anywhere its parameters match another's output.
- **Error handling:** never pass raw values between transformations — wrap them in a structure that also says whether the value is valid (Haskell `Maybe`, F#/Scala `Option`, Elixir's `{:ok, value}` / `{:error, reason}`). Handle it *inside* each transformation with pattern matching (an error clause just forwards the error downstream), or *outside* with a bind-style `and_then` that only calls the next function on success. Either way, an error anywhere in the pipeline immediately becomes the pipeline's value.

### Topic 31. Inheritance Tax

Joe Armstrong: "You wanted a banana but what you got was a gorilla holding the banana and the entire jungle." Inheritance began with two intents — Simula 67's *prefix classes* combined types, Smalltalk's "differential programming" shared behavior — and today it's used because developers don't like typing (share code: `User < ActiveRecord::Base`) or because they like types (`Car is-a Vehicle`). Both have problems:

- **Inheritance is coupling.** The child couples to the parent *and its ancestors*, and so does every user of the child. When `Vehicle` renames `move_at` to `set_velocity` and `@speed` to `@velocity`, top-level code holding a `Car` breaks — though Vehicle internals are none of its business — and `Car` breaks *silently* from a private instance-variable rename.
- **Type hierarchies sprawl.** Victorian-scientist class diagrams grow into wall-covering monstrosities where changes ripple across layers. Reality needs multiple inheritance anyway (a Car is also an Asset, InsuredItem, LoanCollateral), which C++ discredited and most languages dropped.

Three replacements:

- **Interfaces and protocols** — `Drivable`, `Locatable` — create no code, just obligations; any class implementing them fits the type, so `Car` and `Phone` can share a `List<Locatable>`. Polymorphism without inheritance.
- **Delegation** — instead of `Account < PersistenceBaseClass` (which drags the framework's whole API into your interface, uncontrollable and bypassable), `Account` holds a `Persister` and exposes only `save`. Take it further: `Account` knows only business rules; a separate `AccountRecord` wraps persistence. "Has-a trumps is-a" — at the cost of boilerplate, which mixins remove.
- **Mixins and traits** — named bundles of functionality merged into classes without inheritance: a `CommonFinders` mixin added to `AccountRecord` and `OrderRecord`; or `AccountForCustomer` / `AccountForAdmin` variants composing different validation mixins, so the *type itself* guarantees the right validations apply instead of flag-riddled god objects deciding which fire when.

Pick whichever best expresses your intent — and try not to drag the whole jungle along for the ride.

### Topic 32. Configuration

Anything that may change after go-live, or varies by environment or customer, belongs outside the code: credentials, logging levels and destinations, ports/IPs/machine and cluster names, environment-specific validation parameters, tax rates, site-specific formatting, license keys. "Look for anything that you know will have to change… and slap it into some configuration bucket."

- **Static configuration** (YAML/JSON files or database tables, read at startup) is common — but don't make the loaded structure global; wrap it behind a thin API so code doesn't couple to the representation (Topic 28 applied to config).
- **Configuration-as-a-service** is what the authors currently favor: config behind a service API, shareable across applications with authentication and access control, changeable globally, maintainable via a specialized UI — and, critically, *dynamic*: components register for updates and receive new values when parameters change. Restarting an app to change one parameter is "hopelessly out of touch with modern realities."
- **Don't write dodo-code:** species that don't adapt die — the dodo became the first documented man-made extinction. Don't let your project (or career) follow.
- **Don't overdo it.** One client made *every* field configurable: 40,000 variables and weeks to make the smallest change, since each needed admin CRUD code too. And don't push decisions into configuration out of laziness — when a debate is genuinely open, try one way and gather feedback instead of deferring it to a config flag forever.

## Tips worth remembering

- **Tip 44 — Decoupled Code Is Easier to Change.** Coupling is transitive; keep each component coupled to as few others as possible.
- **Tip 45 — Tell, Don't Ask.** Tell the object to do the work; don't decide from its internals and then mutate it.
- **Tip 46 — Don't Chain Method Calls.** Try not to have more than one "." when you access something; exception: stable, unlikely-to-change APIs.
- **Tip 47 — Avoid Global Data.** Every global is a hidden parameter of every method — singletons included.
- **Tip 48 — If It's Important Enough to Be Global, Wrap It in an API.** External resources too: databases, filesystems, service APIs.
- **Tip 49 — Programming Is About Code, But Programs Are About Data.** Think of programs as transformations from inputs to outputs.
- **Tip 50 — Don't Hoard State; Pass It Around.** Data is a flow through your code, not little pools hidden in objects.
- **Tip 51 — Don't Pay Inheritance Tax.** Subclassing couples child, ancestors, and clients; avoid it.
- **Tip 52 — Prefer Interfaces to Express Polymorphism.** Protocols give you types without the coupling of implementation inheritance.
- **Tip 53 — Delegate to Services: Has-A Trumps Is-A.** Compose behavior by holding a service behind your own narrow API.
- **Tip 54 — Use Mixins to Share Functionality.** Extend classes with named bundles of behavior instead of inheritance.
- **Tip 55 — Parameterize Your App Using External Configuration.** Keep values that may change after go-live, or per environment, outside the code.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
