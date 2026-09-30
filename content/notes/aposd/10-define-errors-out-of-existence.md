---
title: "Define Errors Out Of Existence"
book: aposd
chapter: 10
date: 2026-09-30
summary: "Exceptions are a top source of complexity; the best fix is to redefine semantics so errors can't occur, then mask, aggregate, or crash on what remains."
tags: [errors, design-process]
---

> Exception handling code is harder to write, read, and test than normal-case code — and because it rarely executes, it usually doesn't work when finally needed. The highest-leverage fix is to design APIs so the errors cannot exist at all; for what remains, mask them low, aggregate them high, or just crash.

## The big idea

Here "exception" means any uncommon condition that alters the normal flow of control — thrown exceptions, but also special return values and error codes. Handling code is inherently harder than normal-case code: the programmer must either push forward despite the problem (resend a lost packet, recover from a redundant copy) or abort and report upward, restoring consistency when state may be half-initialized. Both routes spawn *secondary* exceptions — duplicate packets, a copy that is also gone, an abort that must itself be reported. Somewhere, someone must handle an exception without creating a new one.

Language support makes it worse — Java's tweet-reading loop needs five `catch` clauses for two lines of useful code — and handlers are nearly impossible to test, since I/O errors are hard to provoke and rarely occur in running systems: "code that hasn't been executed doesn't work." A study by Ding Yuan et al. (OSDI 2014) found that **more than 90% of catastrophic failures** in distributed data-intensive systems were caused by incorrect error handling. Throwing is easy; handling is hard — so the goal is to reduce the number of places where exceptions must be handled.

## Section by section

### 10.1 Why exceptions add complexity

Exceptions arise from bad caller arguments or configuration, operations that cannot complete (I/O failures, unavailable resources), distributed-system misbehavior (lost or delayed packets, unresponsive servers), and detected bugs or inconsistencies. Large or fault-tolerant systems face many of these, so exception handling can account for a significant fraction of all code. The Java example compresses to:

```java
try { tweets.add((Tweet) objectStream.readObject()); }
catch (FileNotFoundException e)    { ... }
catch (ClassNotFoundException e)   { ... }
catch (EOFException e)             { /* fine: short files allowed */ }
catch (IOException e)              { ... }
catch (ClassCastException e)       { ... }
```

The boilerplate alone outweighs the normal-case code and obscures where each exception originates. One try block per statement would clarify origins but fragment the flow and duplicate handlers.

### 10.2 Too many exceptions

Programmers make it worse by defining unnecessary exceptions. Taught that detecting errors is a virtue, they read it as "the more errors detected, the better" and reject anything remotely suspicious. Ousterhout's own confession: Tcl's `unset` throws if the variable does not exist — he assumed deleting a missing variable must be a bug. But a common use of `unset` is cleaning up temporary state, where you can't predict what was created (an operation may have aborted partway), so the simplest strategy is to delete everything that *might* exist; callers ended up wrapping `unset` in catch-and-ignore blocks. He calls it "one of the biggest mistakes I made in the design of Tcl." Throwing also feels like empowering callers — but if you can't figure out what to do, the caller probably can't either. Exceptions are part of a class's interface: many exceptions mean a shallow class, and they can propagate several stack levels, complicating higher interfaces too.

### 10.3 Define errors out of existence

The best fix is redefining semantics so there is no error to report. `unset` should not be defined as "delete a variable" but as "ensure the variable no longer exists." Under the second definition, removing an absent variable is perfectly natural — the work is already done, so return normally. No error case remains.

### 10.4 Example: file deletion in Windows

Windows refuses to delete a file that a process has open — a continual frustration: users must hunt down the offending process, kill it, or reboot. Unix defines deletion more elegantly: the delete call succeeds immediately and removes the name from its directory, but the file is only marked for deletion; processes that already have it open keep reading and writing normally, and the data is freed when the last handle closes. That defines away two errors at once: delete-while-open no longer fails, and processes using the file never see failures. Despite how strange writing to a doomed file sounds, Ousterhout has never seen it cause significant problems.

### 10.5 Example: Java substring method

`String.substring` throws `IndexOutOfBoundsException` if either index falls outside the string. But a frequent need is to extract the part of a string that *overlaps* a possibly out-of-range range — which forces clamping each index by hand, turning a one-line call into 5–10 lines. A better API: "returns the characters of the string (if any) with index greater than or equal to beginIndex and less than endIndex" — well-defined even for negative indices or `beginIndex > endIndex`, so the exception is defined away and the method gets *deeper*. Python list slices already work this way, returning an empty result for out-of-range slices. To the objection that errors catch bugs: they may catch some, but the clamping code can be buggy or forgotten, breeding others. "Overall, the best way to reduce bugs is to make software simpler."

### 10.6 Mask exceptions

Masking handles an exceptional condition at a low level so higher layers never know. TCP resends dropped packets inside the transport, so clients see no loss. The controversial case is NFS: when a file server stops responding, the client reissues requests until it recovers; the application just hangs, with console messages like "NFS server xyzzy not responding still trying." Users complain, but aborting would be worse: an application that lost its files has nothing useful to do; retrying would hang it anyway and is better done once in the NFS layer than at every file call in every application (a compiler shouldn't worry about this); and aborting would cascade until the user's whole environment collapses. Masking lets applications resume seamlessly and need no server-failure code, making classes deeper — an example of pulling complexity downward.

### 10.7 Exception aggregation

Aggregate many exceptions into one handler. In a web server, each URL service method extracts parameters via `getParameter`, which throws `NoSuchParameter`; students wrote a handler per call, duplicating the same error-response code. Better: let them propagate to the top-level dispatch method, where one handler generates the error response. It generalizes: bad syntax, missing permission — anything producing an error response — flows to the same handler, with the message ("parameter 'quantity' not present in URL") generated at throw time and carried in the exception. Encapsulation is clean: `getParameter` knows how to extract parameters and describe its own failures; the dispatcher knows HTTP error responses but nothing about specific errors; new methods throwing compatible exceptions plug in unchanged. The pattern: an exception that aborts the current request, cleans up, and continues with the next, caught near the top of the request loop — distinct from exceptions fatal to the whole system.

Aggregation works best when an exception propagates several levels up before being caught — the opposite of masking, which handles low (in library methods used everywhere, propagation would multiply handlers). Both position the handler where it catches the most exceptions. RAMCloud shows a second form: it *promotes* small errors into big ones — a corrupted object crashes the whole server — because server-crash recovery had to exist anyway; one mechanism means less code and more exercise, so recovery bugs get found. The cost is pricier recovery, tolerable only because corruption is rare (crashing per lost packet would be absurd). Aggregation replaces several special-purpose mechanisms with one general-purpose one.

### 10.8 Just crash?

Some errors aren't worth handling: difficult or impossible, and infrequent — print diagnostics and abort. C's `malloc` returning `NULL` is the cautionary tale: it assumes every caller checks, and a forgotten check means a null-pointer crash that camouflages the real problem. There is nothing useful to do about exhaustion anyway — if the app had freeable memory it would already have freed it, and running out usually indicates a bug. Better: a wrapper `ckalloc` that calls `malloc`, checks, and aborts with a message. Catching the out-of-memory exception from `new` in C++/Java is equally pointless — the handler will likely need to allocate too. Crashing is also sensible for disk hard errors, failure to open a socket, and internal inconsistencies (probably bugs). It depends on the application: a replicated storage system must *not* abort on I/O errors — recovery is part of the value it provides, worth the complexity.

### 10.9 Taking it too far

Defining errors away or masking them is valid only when the information isn't needed outside the module. A student team's network module caught and discarded *all* network exceptions, so applications could not detect lost messages or a failed peer — making robust applications impossible; the exceptions had to be exposed despite the interface cost. Hide what is unimportant (the more the better); expose what is important (Chapter 21).

### 10.10 Conclusion

Special cases of any form make code harder to understand and buggier; exceptions are the biggest source. Redefine semantics to eliminate error conditions first; then mask at a low level or aggregate into a single generic handler.

## Key terms

- **Exception**: any uncommon condition that alters the normal flow of control — includes special return values, not just thrown exceptions.
- **Exception masking**: handling an exceptional condition at a low level so higher layers are unaware of it (TCP retransmission, NFS request retries).
- **Exception aggregation**: handling many exceptions with a single handler placed to catch them all (top-of-request-loop handler; RAMCloud's error promotion).

## My takeaways

*Fill this in as you re-read and apply the chapter.*
