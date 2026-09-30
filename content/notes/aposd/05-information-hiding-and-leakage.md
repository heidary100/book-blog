---
title: "Information Hiding (and Leakage)"
book: aposd
chapter: 5
date: 2026-09-30
summary: "Each module should encapsulate design decisions invisible to its interface; when the same knowledge leaks into multiple modules, change becomes expensive."
tags: [information-hiding, deep-modules]
---

> Information hiding is the single most important technique for creating deep modules: each module should encapsulate a few design decisions that are invisible in its interface. Its opposite, information leakage — the same knowledge appearing in multiple modules — is one of the most important red flags in software design, because every piece of leaked knowledge creates a dependency that turns one change into many.

## The big idea

David Parnas's classic insight (1972) is that a module should own knowledge. The hidden information is usually the details of some mechanism — how to store data in a B-tree, how to map logical file blocks to disk blocks, how to implement TCP, how to schedule threads on multiple cores, how to parse JSON. It spans data structures and algorithms, low-level details like page size, and even high-level assumptions like "most files are small." The knowledge lives in the implementation, not the interface.

Hiding reduces complexity two ways. First, the interface shows a simpler, more abstract view, cutting cognitive load: a B-tree user never thinks about node fanout or balancing. Second, it makes the system easier to evolve: if nothing outside the module depends on the hidden knowledge, changes to it affect only that one module — a new TCP congestion-control scheme touches only the protocol implementation, not the higher-level code using it. When designing a module, ask what information *can* be hidden; more hidden information means a simpler interface, hence a deeper module.

## Section by section

### 5.1 Information hiding

Each module should encapsulate a few pieces of knowledge representing design decisions, embedded in the implementation but absent from the interface. Two caveats sharpen the definition. `private` declarations are not information hiding by themselves: if getter and setter methods expose the nature and usage of private variables, those variables are effectively public. And hiding need not be total to be useful — "partial information hiding" counts: if a feature needed only by a few users is accessed through separate methods, invisible in the common use cases, it creates far fewer dependencies than information visible to everyone.

### 5.2 Information leakage

Leakage is the opposite of hiding: a design decision reflected in multiple modules, creating a dependency so that any change to that decision requires changing all of them. Anything in an interface is by definition leaked — so simpler interfaces correlate with better hiding. But the nastier case is back-door leakage, where knowledge never appears in any interface: two classes that both understand a file format (one reads it, one writes it) are coupled even though neither exposes the format. Back-door leakage is more pernicious because it isn't obvious.

Ousterhout urges developing high sensitivity to leakage. When you find it, ask "How can I reorganize these classes so that this particular piece of knowledge only affects a single class?" Options: merge the affected classes if they are small and tightly tied to the knowledge, or extract the knowledge into a new class — the latter only works if you can find a simple interface that abstracts the details; otherwise you have merely traded back-door leakage for interface leakage.

### 5.3 Temporal decomposition

The most common cause of leakage is a design style Ousterhout names temporal decomposition: structuring a system to mirror the order in which operations happen at runtime. His example is an app that reads a file, modifies it, and writes it out, decomposed into reader, modifier, and writer classes — both reader and writer then know the file format. The fix is one class owning the read/write mechanism, used in both phases. The trap is easy to fall into because execution order is on your mind while coding. But most design decisions manifest at several different times over the application's life, so temporal decomposition almost always leaks. Order does matter and will be reflected somewhere in the code — just not in the module structure, unless that structure is consistent with information hiding. Design around the *knowledge* each task needs, not when the tasks occur.

### 5.4 Example: HTTP server

The chapter shifts to a running example: students implementing classes so Web servers can receive HTTP requests and send responses. HTTP specifies the textual format of requests and responses sent over a TCP socket. A POST request (Figure 5.1) has an initial line (request type, a URL like `/comments/create` with parameters such as `photo_id=246`, protocol version), a collection of headers terminated by a blank line (e.g. `Content-Length`), and an optional body carrying more parameters (`comment`, `priority`).

### 5.5 Example: too many classes

The most common student mistake: many shallow classes that leaked information among themselves. One team split request handling into a class that read the request off the network into a string and another that parsed the string — temporal decomposition again. But a request can't be read without parsing: `Content-Length` determines the body's length, so headers must be parsed to know where the request ends. Both classes therefore understood most of the request structure, parsing code was duplicated, and callers had to invoke two methods in two classes, in order. Merging them isolates all format knowledge in one class and halves the interface. General theme: information hiding often improves when a class gets *slightly larger* — to gather all code for one capability in one place, and to raise the interface level (one method for a whole computation instead of three step-methods). Chapter 9 covers when smaller classes do make sense.

### 5.6 Example: HTTP parameter handling

Server code needs parameter values (`photo_id`, `comment`, `priority`), which may appear in the initial line or the body, URL-encoded (`+` for space, `%21` for `!`). Students did two things well: they merged parameters from both locations (callers don't care where a parameter lives) and decoded URL encoding inside the parser, so `comment` comes back as "What a cute baby!", not "What+a+cute+baby%21". Both choices simplified the API. But most projects then blew it with a too-shallow accessor:

```java
public Map<String, String> getParams() {
    return this.params;
}
```

Returning the internal `Map` exposes the internal representation (any change to it ripples to all callers), makes callers do two lookups, and silently obliges them not to mutate the returned map. Better:

```java
public String getParameter(String name) { ... }
public int getIntParameter(String name) { ... }
```

These hide the representation and, in `getIntParameter`'s case, also absorb the string-to-integer conversion mechanism (with `getDoubleParameter` and friends as needed; all throw if the parameter is missing or unconvertible).

### 5.7 Example: defaults in HTTP responses

For responses, the common mistake was inadequate defaults. One team made callers specify the HTTP protocol version explicitly — yet the response version must match the request's version, and the request is already passed when sending the response, so the library can supply it. The caller is unlikely to know the right value, and specifying it wrongly leaks knowledge between library and caller. The `Date` header deserves an automatic default too. Defaults embody "design the interface to make the common case as simple as possible" and are partial information hiding: in the normal case the caller never knows the defaulted item exists; an override method exists for the rare exception. Classes should "do the right thing" unasked — Java's file I/O classes are the negative example, forcing everyone to opt into buffering that essentially everyone wants. "The best features are the ones you get without even knowing they exist."

### 5.8 Information hiding within a class

Hiding applies inside classes too. Design private methods so each encapsulates some information or capability, hidden from the rest of the class; and minimize the number of places each instance variable is used. Some variables genuinely need wide access, but shrinking the footprint of the others eliminates intra-class dependencies and reduces complexity.

### 5.9 Taking it too far

Hide nothing that is genuinely needed outside the module. If a module's performance depends on configuration parameters that different users must set differently, those parameters belong in the interface. The real goal is to *minimize* the information needed outside a module — self-tuning beats exposed configuration — but you must honestly recognize which information callers truly need and expose that.

### 5.10 Conclusion

Information hiding and deep modules are two views of the same property: a module that hides a lot has more functionality behind a smaller interface, hence depth; a module that hides little is shallow, whether because it does little or because its interface is complex. When decomposing, ignore runtime order (that path leads to temporal decomposition and leakage) and instead organize modules around the distinct pieces of knowledge the application needs.

## Red flags to watch for

- **Information Leakage**: the same knowledge appears in multiple places — two classes that both understand a file format. It can hide behind interfaces (back-door leakage) and turns any change to that knowledge into a multi-module change.
- **Temporal Decomposition**: execution order is mirrored in the code structure, so knowledge used at different times gets encoded in multiple places. Structure modules around knowledge, not chronology.
- **Overexposure**: a commonly used API forces users to learn about rarely used features (e.g. specifying a protocol version or asking for buffering), inflating cognitive load for everyone.

## Key terms

- **Information hiding**: designing each module to encapsulate a few design decisions that are embedded in the implementation but do not appear in the interface (after Parnas, 1972).
- **Information leakage**: a design decision reflected in multiple modules, creating dependencies between them; includes back-door leakage not visible in any interface.
- **Temporal decomposition**: a design style where system structure corresponds to the time order of operations, a frequent cause of information leakage.
- **Partial information hiding**: knowledge mostly hidden — used by few callers through separate methods — which still reduces dependencies compared with fully exposed information.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
