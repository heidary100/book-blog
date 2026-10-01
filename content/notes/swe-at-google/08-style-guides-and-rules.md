---
title: "Style Guides and Rules"
book: swe-at-google
chapter: 8
date: 2026-10-01
summary: "Rules are laws, guidance is advice: Google's style guides exist to keep a two-billion-line codebase sustainable — rules must pull their weight, optimize for the reader, and enforce consistency."
tags: [consistency, design-process]
---

> Style guide rules are mandatory laws, and guidance is the "shoulds" — and the goal behind every rule is sustainability of a codebase that 30,000+ engineers change 60,000 times a day and expect to last decades. The chapter derives the principles rules must follow (pull their weight, optimize for the reader, be consistent, avoid error-prone constructs, concede to practicalities), explains what belongs in a style guide and what doesn't, and argues for automated enforcement wherever possible.

## The big idea

The question is never "what rules should we have?" but "what goal are we advancing?" Rules are laws — universally enforceable, disregarded only by arbiter-granted waiver — while guidance is recommendation with room for variance. Since "good" and "bad" code are organizational judgments, rules are the mechanism for encoding what *this* organization values. Done well, rules shape the common vocabulary of coding so engineers do the right thing by default, even subconsciously.

Google's context explains its trade-off: with 30,000+ engineers of wildly varying background, ~60,000 submissions per day to a two-billion-line codebase that must survive for decades, rules deliberately restrict choice. Losing flexibility (and occasionally offending people) is accepted because the gains in consistency and reduced conflict win out.

## Section by section

### 8.1 Why Have Rules?

Rules encourage "good" behavior and discourage "bad" — but good/bad are subjective and organization-specific: small memory footprint, aggressive adoption of new features, or consistency itself can each be the top value. Whatever the values, rules give broad leverage over development patterns, and as an organization grows, its rules become the shared coding vocabulary that frees attention for *what* the code says rather than *how*.

### 8.2 Creating the Rules

Start from the goal: "Why does something go into the style guide?" Google's five guiding principles:

- **Rules must pull their weight.** Every rule costs all engineers learning and adaptation; too many rules hurt memory, onboarding, and rule-set maintenance. Self-evident rules are excluded — the C++ guide has no ban on `goto` because C++ programmers avoid it anyway. And "not outlawed" ≠ legal: the guide isn't a lawyers' document. (Footnote: with tooling, the *remembering* cost vanishes — formatting rules became free once clang-format did them.)
- **Optimize for the reader.** Code is read far more often than written; "simple to read" beats "simple to write." Python conditional expressions are shorter but harder to read, so they're restricted; long descriptive names cost typing but pay readability. Related: require explicit evidence of intended behavior — `override` in Java/C++/JavaScript, and in C++, `std::unique_ptr` plus `std::move` at any ownership-transferring call site, so the reader needs no knowledge of the function's implementation. This is **local reasoning**: understanding what happens at a call site without chasing other code. Comment rules serve the same goal — documentation comments carry design/intent, implementation comments justify non-obvious choices (a direct parallel with [comments describing what code can't](/books/aposd/13-comments-describe-what-code-cant)).
- **Be consistent.** Like Google offices: local personality is fine, but badge readers, WiFi, and conference-room AV work identically everywhere — a visitor Just Works. In code, consistency lets any engineer jump into an unfamiliar project. Three named payoffs: it enables **expert chunking** (experts glance at code and zero in on what matters); it enables scaling *tooling* (auto-fixers for imports/only work if everyone's code follows the same structure — otherwise every team needs a bespoke tool); and it scales *people* (engineer mobility across teams, SREs and "code janitors" dropping into any project) while giving resilience to time as people and ownership shift.
  - *At scale:* the old C++ guide promised to never change rules that would make old code inconsistent — and that promise was deliberately struck. With a codebase this large and old, total consistency is unreachable; Large-Scale Change tooling gets most code updated, and perfect consistency costs more than it's worth.
  - *Setting the standard:* prefer *internal* consistency with a hierarchy — file before team before project before codebase. But weigh external conventions too. "Counting Spaces": Google's Python style mandated two-space indents (to match C++), which aged badly as Python engineers mostly read *Python*; when Starlark got its own guide, four spaces (matching the outside world) was chosen. Time and open source make external consistency win.
- **Avoid error-prone and surprising constructs.** Tricky power features get subtly misused, and future maintainers aren't guaranteed to share the original author's understanding. Example: Python's `hasattr`/`getattr` — accessing attributes via strings (possibly from a constant, an RPC, or a datastore) leaves no evidence for readers or security reviewers, is hard to test, and hides which fields are touched. The codebase must be operable by everyone, not just experts — including SREs debugging outages in languages they don't write fluently.
- **Concede to practicalities.** "A foolish consistency is the hobgoblin of little minds." Performance (`noexcept` is allowed despite the exceptions ban, for its optimization) and interoperability (snake_case for standard-library-mimicking types; multiple inheritance for Windows compatibility; generated code exempt) justify exceptions. Consistency is vital; adaptation is key.

### 8.3 The Style Guide

Rules fall into three categories. **Avoiding danger**: technically-mandated musts and must-nots (static members, lambdas, exceptions, threading, inheritance), especially for hard-to-use features, each entry documenting the pros, cons, and reasoning. **Enforcing best practices**: comments (with required documentation for non-obvious cases like switch fall-through and empty catch blocks), file structure, naming, and formatting — either itemized or deferred to tools (gofmt, dartfmt). It also fences off *new* features: restrict initially, watch waiver requests to learn real usage patterns, then loosen the rule once good practice is extractable. The `std::unique_ptr` case study: banned when C++11 landed because move semantics confused everyone; unbanned years later once the readability win at call sites outweighed the learning cost. **Building in consistency**: rules for the small stuff exist "primarily to make and document a decision" — indentation, import order, naming have no measurable technical winner, so choosing one ends the bikeshedding; the value is that a choice was made, not which one. And much is deliberately *absent*: the guide assumes "don't be clever, don't fork the codebase" — it can't turn a novice into a master.

### 8.4 Changing the Rules

Conditions change, so rules change: new language versions, rules engineers contort around, enforcement tools grown too costly. Because each rule records its reasoning, changed circumstances can be spotted and re-evaluated. The **CamelCase case study**: Google Python mandated CamelCase methods to match C++ (Python was then a scripting layer); as Python became its own thing — Python engineers, third-party libraries leaking in snake_case, open sourcing — the arbiters weighed costs against benefits and permitted snake_case, file-wide, with grandfathering. **The process** is solution-based: proposals must name a *proven* problem (a pattern in real Google code, not a hypothetical), start with community discussion on language mailing lists, and survive community review. **Style arbiters** — small groups of senior language experts — make final calls as trade-off judgments, not preference votes; the four-member C++ arbiter group works fine because decisions are by consensus, not voting. **Exceptions**: waivers exist but aren't granted lightly — macro-prefix waivers for "consistency" are rejected (codebase integrity > project consistency), while genuinely transparent wrapper types get implicit-conversion waivers. **Guidance** is the "shoulds" to the rules' "musts": descriptive language primers, the Tip of the Week series (short, born from real problems, a "canon of the common"), and `<Language>@Google 101` day-long courses bridging "knows the language" to "knows how we use the language."

### 8.5 Applying the Rules

Rules earn their value when enforced — socially (training, readability mentoring through code review) or technically (tooling), with strong preference for the technical. Automation doesn't forget as people join or rules change, applies *one* unchanging interpretation of the rule (removing entry points for human bias), and scales sub-linearly: one expert team writes tools the whole company uses, so doubling headcount doesn't double enforcement cost. Some rules resist automation: judgment calls ("avoid complicated template metaprogramming") and social rules — "keep changes small" has no line-count trigger because a mechanical 500-file rename can be trivial while 20 lines can hide tangles; reviewers, not tools, push back there. **Error checkers** (clang-tidy for C++, Error Prone for Java): a mid-2018 informal survey estimated ~90% of C++ style rules could be automatically verified, and surfacing warnings with suggested fixes in-review made deprecated-API usage "disappear almost overnight" by crashing the cost of compliance. **Code formatters**: presubmit checks reject code the formatter would change; "the robots are better on average than the humans by a significant amount" (matrix layouts aside), and formatting nits vanish from review.

**Case study: gofmt** (Sameer Ajmani). Go shipped with gofmt on day one — a retrofitted format is nearly impossible to impose after open sourcing. Motivations: stop review arguments over formatting, and make machine-edited code indistinguishable from human-edited (gofix's pre-1.0 migrations produced diffs containing only the meaningful API changes). Impact: no configuration knobs, near-universal adoption — all Go code anywhere looks the same, first complained about, later cited as a reason people *like* Go. Retrofit proof: in 2012 one engineer reformatted all 200,000 Google BUILD files with buildifier in six weeks — while a thousand new BUILD files per week were being added — riding Google's large-scale-change infrastructure.

### 8.6 Conclusion

Rules manage complexity and keep a codebase maintainable as the organization grows; a shared rule set is what lets both code and organization stay sustainable at scale.

### 8.7 TL;DRs

- Rules and guidance should support resilience to time and scaling.
- Know the data so rules can be adjusted.
- Not everything should be a rule.
- Consistency is key ([the same leverage Ousterhout describes](/books/aposd/17-consistency)).
- Automate enforcement when possible.

## Key terms

- **Rule vs. guidance**: rules are mandatory, universally enforceable laws; guidance is recommended practice with room for variance — the "musts" vs. the "shoulds."
- **Local reasoning**: understanding what a call site does from the code in front of you, without reading the callee's implementation.
- **Style arbiters**: per-language groups of senior experts who own the style guide and decide changes and waivers by consensus, as trade-off judgments rather than votes.
- **Expert chunking**: experts group familiar code patterns into single mental "chunks," so consistent structure lets them glance at code and spot what matters.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
