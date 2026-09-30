---
title: "Designing for Performance"
book: aposd
chapter: 20
date: 2026-09-30
summary: "Simplicity and speed are compatible: know which operations are expensive, measure before optimizing, and redesign slow code around its critical path."
tags: [performance, design-process]
---

> The chapter answers how to build fast systems without sacrificing clean design, and its answer is still simplicity: simple code is usually faster because it does no extraneous work. The method is threefold — know which operations are fundamentally expensive, measure before and after any optimization, and when a rewrite is needed, design around the critical path. The RAMCloud Buffer rewrite doubled speed while shrinking the code 20%, proving the two goals compatible.

## The big idea

Programmers often assume a trade-off: performance requires micro-optimization and clever hacks, which add complexity. Ousterhout argues the opposite. Complexity makes code slow — special cases, redundant work, and shallow layers all add instructions to common operations — while clean design "defines away" work. Deep classes get more done per call; fewer special cases mean fewer condition checks. If you design for simplicity, the system will usually be fast enough that you rarely need to think about performance at all.

When optimization is genuinely required, simplicity is still the tool: find the few critical paths that dominate performance and make them as simple as possible. The chapter's example, the RAMCloud `Buffer` class, achieved a 2x speedup with 20% less code — the optimized version was *cleaner*, not messier.

## Section by section

### 20.1 How to think about performance

How much should performance concern you during normal development? Both extremes fail:

- **Optimize everything**: slows development, creates unnecessary complexity, and many "optimizations" don't help anyway.
- **Ignore performance entirely**: inefficiencies accumulate everywhere — "death by a thousand cuts" — and the system can end up 5–10x slower than necessary. There is no single fix to apply later, so recovery is hard.

The middle path: use basic performance knowledge to pick design alternatives that are "naturally efficient" *and* clean. The key is knowing which operations are fundamentally expensive. The book's cost catalog (roughly, as of its writing):

- **Network round-trip**: 10–50 µs within a datacenter — tens of thousands of instruction times; wide-area round-trips 10–100 ms.
- **Secondary storage I/O**: disk 5–10 ms (millions of instruction times); flash 10–100 µs; emerging nonvolatile memory as fast as ~1 µs — still ~2000 instruction times.
- **Dynamic memory allocation** (`malloc`/`new`): significant overhead from allocation, freeing, and garbage collection.
- **Cache misses**: a DRAM fetch into on-chip cache costs a few hundred instruction times; in many programs, cache misses determine overall performance as much as computation does.

The best way to calibrate this intuition is **micro-benchmarks**. RAMCloud built a small framework in a few days; afterwards new benchmarks take 5–10 minutes each, and the team accumulated dozens, used both to understand third-party libraries and to measure their own new classes.

With that intuition, choose cheap alternatives when they're equally simple: a hash table can be 5–10x faster than an ordered map, so use the map only when you need ordering. An array of structures should store the structures inline rather than holding pointers that each require a separate allocation. When an efficiency gain *does* require complexity: small complexity hidden inside the implementation may be worth it (but remember complexity is incremental); large implementation complexity or complicated interfaces mean start simple and optimize later — unless you have clear evidence performance matters there. RAMCloud bypassed the kernel to talk directly to the NIC for exactly this reason: prior measurements showed kernel networking could not meet their latency goal, and getting this one big thing right made everything else easier.

Finally, simpler code tends to run faster anyway: no special cases means no checks for them, and deep classes avoid the overhead of extra layer crossings.

### 20.2 Measure before (and after) modifying

If the system is still too slow, don't rush to tweak based on intuition — programmers' intuitions about performance are unreliable, even for experienced developers. Intuition-driven tuning wastes time on non-problems and adds complexity.

Measure first, for two purposes:

1. **Locate the real hotspots.** Top-level measurements only say *that* the system is slow, not *why*. Measure deeper to find the small number of specific places where lots of time is spent and where you have improvement ideas.
2. **Establish a baseline.** Re-measure after each change to confirm it actually helped. If a change didn't make a measurable difference, back it out — unless it made the system simpler. "There's no point in retaining complexity unless it provides a significant speedup."

### 20.3 Design around the critical path

Prefer **fundamental fixes**: a cache, a different algorithm (balanced tree vs. list), RAMCloud's kernel bypass. Fundamental fixes can be implemented with the ordinary design techniques of the book. Only when none exists should you redesign for speed — a last resort — and that is where the **critical path** comes in.

The exercise: ask what is the *smallest* amount of code that must execute in the common case, ignoring the existing structure entirely. Ignore special cases; imagine all critical-path code in a single method; keep only the data the critical path needs and assume whatever data structure is most convenient (even combining variables). Call this imagined code "the ideal." It may clash with the existing class structure and be impractical, but it is a target — the simplest and fastest the code could ever be. Then design a new structure that comes as close to the ideal as possible while staying clean: you may add a little code (e.g. one call into a general-purpose hash table class) for good abstractions. In Ousterhout's experience, a clean design close to the ideal almost always exists.

The crucial move is **removing special cases from the critical path**. Slow code usually handles many situations, and each special case adds conditionals or method calls to the common path. Aim for a single `if` at the start that detects all special cases in one test; if it fails, branch off the critical path where special-case code can be structured for simplicity rather than speed.

### 20.4 An example: RAMCloud Buffers

`Buffer` manages variable-length byte arrays (RPC request/response messages) while minimizing copying and allocation. It looks like a linear array of bytes but stores data in discontiguous **chunks**: *external* chunks reference caller-owned storage (used for large data to avoid copies), while *internal* chunks live in the Buffer's own storage (convenient for small chunks where copying is negligible). Each Buffer starts with a small built-in allocation. This class is itself a fundamental fix — e.g. an RPC response with a short header plus a large object becomes two chunks (internal header, external reference to the object), avoiding any copy of the object.

Buffers are used constantly — at least four per RPC — so when they showed up as a system-wide cost, the team optimized the most common operation: allocating a small amount of internal space (e.g. message headers).

The original critical path (`Buffer::alloc` → `Buffer::allocateAppend` → `Buffer::Allocation::allocateAppend`) had two problems:

- **Six distinct conditions checked**, some repeatedly: does the Buffer have allocations; does the allocation have room (checked twice — once inside, once by the caller testing the return value); it allocated new space without considering the last chunk, then checked whether the new space happened to be adjacent so it could merge.
- **Too many shallow layers**: three methods with essentially identical signatures and the same abstraction — one is nearly a pass-through. Extra layers mean extra calls and an extra special case where a caller must check a callee's result. Bad for performance *and* bad design (the pass-through red flag from Chapter 7).

The redesign centered the class on its critical paths (including, besides allocation, retrieving the total byte count). The new critical path is a single method with a **single test** ruling out all special cases: a new instance variable `availableAppendBytes` tracks unused space after the last chunk, and it is zero for *three* different special cases at once (no space, last chunk not internal, or no chunks at all). One test, then straight-line code — the least possible code for the common case. One considered trade-off: `totalLength` could have been recomputed from the chunks on demand, but that would be expensive for large Buffers and total length is itself a common operation, so they kept a small per-allocation overhead to make length immediately available.

Results: appending a 1-byte string internally dropped from **8.8 ns to 4.75 ns** (~2x); construct + append + destroy dropped from **24 ns to 12 ns**; and the class shrank from **1886 to 1476 lines (20% smaller)** while becoming easier to read.

### 20.5 Conclusion

Clean design and high performance are compatible. The Buffer rewrite gained 2x while simplifying the design and cutting 20% of the code. Complicated code is slow because it does extraneous or redundant work; write clean, simple code and the system will usually be fast enough that performance never comes up. In the few cases where it does, apply simplicity again: find the most important critical paths and make them as simple as possible.

## Red flags to watch for

- **Pass-through methods on the critical path**: multiple layers with identical signatures and the same abstraction (e.g. `Buffer::alloc` → `Buffer::allocateAppend` → `Allocation::allocateAppend`) add call overhead, force callers to check callees' results, and signal a design problem as much as a performance one.

## Key terms

- **Micro-benchmark**: a small program measuring the cost of a single operation in isolation; the recommended way to learn what is expensive.
- **Critical path**: the minimum amount of code that must execute in the most common case of an operation; performance redesigns should be centered on it.
- **The ideal**: the imagined minimal implementation of the critical path, ignoring existing structure — the simplest and fastest the code could ever be, used as a redesign target.
- **Fundamental fix**: a design-level change that eliminates the cost outright (a cache, a better algorithm, kernel bypass) as opposed to tuning existing code.

## My takeaways
<!-- Fill in as you re-read and apply the chapter. -->
-
