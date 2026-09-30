---
title: "Code Should Be Obvious"
book: aposd
chapter: 18
date: 2026-09-30
summary: "Obscurity is a root cause of complexity; write code whose meaning is clear on a quick read using good names, consistency, whitespace, and comments that fill the gaps."
tags: [code-obviousness, complexity]
---

> Obscurity is one of the two main causes of complexity (Section 2.3), so the fix is to write code that is *obvious*: a reader can skim it and their first guesses about its behavior will be right. Obviousness is judged by the reader, not the writer — which is why code reviews are the best way to detect it. This chapter catalogues what makes code more or less obvious.

## The big idea

Code is obvious if someone can read it quickly, without much thought, and get the right idea about what it does. The test is not "can this code be understood eventually?" but "does the reader need to stop, dig, and reconstruct missing information?" Every moment a reader spends reverse-engineering meaning is wasted effort and a fresh opportunity for misunderstanding and bugs. Obvious code also needs fewer comments, because the code itself carries the information.

The catch is that "obvious" lives in the mind of the reader. It is much easier to spot obscurity in someone else's code than in your own, because you already know what your code means. Ousterhout's practical conclusion: rely on code reviews. If a reader says your code is not obvious, it is not obvious, no matter how clear it looks to you — and figuring out *why* it confused them is how you learn to write better code.

Two techniques from earlier chapters do most of the heavy lifting and frame the rest: **good names** (Chapter 14) and **consistency** (Chapter 17). Precise names mean readers don't have to read the body to guess what an entity does; consistency lets readers recognize a familiar pattern and draw safe conclusions without re-analyzing it.

## Section by section

### 18.1 Things that make code more obvious

Beyond names and consistency, the chapter gives general-purpose techniques:

- **Judicious use of white space.** Formatting shapes comprehension. In a Javadoc comment where parameter docs are squeezed together, it is hard to see where one parameter's documentation ends and the next begins — you can't even count the parameters at a glance. Indenting each parameter's description under its name makes the structure scannable.
- Blank lines separate major blocks within a method. The book's `Buffer::allocAux` example shows a method divided into three independent strategies (reuse aligned memory from the top, reuse leftover space at the end of the last chunk, or create a new allocation), each introduced by a comment. Blank lines make the block structure visible, and they work especially well when the first line after each blank line is a comment describing the next block.
- White space *within* a statement clarifies its structure too: `for(int pass=1;pass>=0&&!empty;pass--)` versus `for (int pass = 1; pass >= 0 && !empty; pass--)` — the second lets the eye parse the conditions.
- **Comments as compensation.** Sometimes nonobvious code is unavoidable. Then use comments to supply the missing information. To do this well, put yourself in the reader's position: predict what will confuse them and what information clears up that confusion.

### 18.2 Things that make code less obvious

Several recurring sources of obscurity — some are genuinely useful, in which case extra documentation is the price of using them:

- **Event-driven programming.** Handlers are never invoked directly; they are invoked indirectly by an event module through function pointers or interfaces. Even finding the invocation point doesn't tell you which function runs, because that depends on which handlers were registered at runtime. This makes control flow hard to follow and hard to reason about. Compensation: in each handler's interface comment, state *when* it is invoked (e.g. "invoked in the dispatch thread by a transport if a transport-level error prevents an RPC from completing").
- **Generic containers** (`Pair` in Java, `std::pair` in C++). Returning `new Pair<Integer, Boolean>(currentTerm, false)` forces every caller to use `result.getKey()` and `result.getValue()`, names that carry no meaning — the reader can't tell that `getKey()` is the current term. Better: define a small class specialized for the use, with meaningful field names and room for documentation in the declaration. This is an instance of a general rule: "software should be designed for ease of reading, not ease of writing." The writer spends a few extra minutes so that every future reader is spared confusion.
- **Different types for declaration and allocation.** Declaring `private List<Message> incomingMessageList;` but allocating `new ArrayList<Message>()` is legal, but a reader who sees only the declaration is misled: the concrete type affects performance and thread-safety, which may matter for how the variable is used. Match the declared type to the allocated type.
- **Code that violates reader expectations.** In a `main` that ends with `new RaftClient(myAddress, serverAddresses);`, readers assume the application exits when `main` returns — but the constructor spawns threads that keep running. Code is most obvious when it conforms to the conventions readers expect; when it can't, document the surprise, both in the constructor's interface comment and with a short comment at the end of `main` saying the application continues in other threads.

### 18.3 Conclusion

Reframe obviousness in terms of *information*: nonobvious code means the reader is missing important information (that `RaftClient`'s constructor spawns threads; that `getKey()` holds the current term). To make code obvious, guarantee that readers have what they need, in one of three ways, roughly in order of preference:

1. **Reduce the information needed** — abstraction and eliminating special cases mean less that a reader must know.
2. **Reuse information readers already have** — follow conventions and conform to expectations so nothing new must be learned.
3. **Present the information in the code** — good names and strategically placed comments.

## Red flags to watch for

- **Nonobvious code**: if the meaning or behavior of code cannot be understood with a quick reading, important information is missing from where the reader will look. Treat it as a defect even if the code is correct.

## Key terms

- **Obvious (code)**: code that a reader can understand quickly, without much thought, where their first guesses about behavior and meaning are correct.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
