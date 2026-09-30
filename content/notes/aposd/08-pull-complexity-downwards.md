---
title: "Pull Complexity Downwards"
book: aposd
chapter: 8
date: 2026-09-30
summary: "When complexity is unavoidable, absorb it inside the module rather than pushing it to callers: a simple interface matters more than a simple implementation."
tags: [complexity, general-purpose-design]
---

> When a module faces unavoidable complexity related to its functionality, it should handle that complexity internally rather than exposing it to users. Most modules have more users than developers, so it is better for the developers to suffer — an exception thrown or a configuration parameter exported multiplies a problem across every caller and every installation.

## The big idea

Given a new module and a piece of unavoidable complexity, which is better: let users deal with it, or handle it inside the module? If the complexity relates to the module's functionality, the second answer is almost always right. Modules have more users than developers, so "it is better for the developers to suffer than the users." A simple interface is more important than a simple implementation.

The temptation runs the other way, because punting is easy in the short term: unsure how to handle a condition? Throw an exception and let the caller cope. Unsure what policy to implement? Export configuration parameters and let the administrator figure out values. Both moves *amplify* complexity — one person's problem becomes many people's problem. Every caller must handle the exception; every administrator at every installation must learn the parameters.

## Section by section

### 8.1 Example: editor text class

Many students implemented the editor's text class (Chapters 6 and 7) with a line-oriented interface — read, insert, delete whole lines — because it made the implementation simple. But it pushed complexity upward: user-interface operations rarely involve whole lines. Keystrokes insert individual characters mid-line, and copying or deleting the selection can touch parts of several lines, so higher-level code had to split and join lines constantly. A character-oriented interface (Section 6.3) pulls that complexity downward: the UI inserts and deletes arbitrary ranges without ever splitting or merging lines, while the text class — which may internally represent the text as lines — does the splitting and merging itself. The text class's implementation gets harder, but the complexity is encapsulated in one place, and the overall complexity of the system drops.

### 8.2 Example: configuration parameters

Configuration parameters are the canonical example of moving complexity *upwards* instead of down: rather than deciding behavior internally, a class exports knobs (cache size, retry count) and every user must pick values. They are extremely popular — some systems have hundreds.

The honest case for them: users can tune the system to requirements the infrastructure code cannot know. A user might know some requests are time-critical and deserve higher priority; in such cases parameters can improve performance across many domains. But parameters also provide "an easy excuse to avoid dealing with important issues" — and often neither users nor administrators can determine the right values, or the system could compute them automatically with a little extra work. Example: a network protocol resends requests that go unanswered. Exporting the retry interval as a parameter is one way; instead, the protocol could measure the response time of successful requests and use a multiple of that as the retry interval. This pulls complexity downward, and it adapts dynamically when conditions change, whereas a configured value can easily become stale.

So: avoid configuration parameters as much as possible. Before exporting one, ask "will users (or higher-level modules) be able to determine a better value than we can determine here?" When a parameter is genuinely needed, provide a reasonable default so users only supply values in exceptional conditions. Ideally each module solves its problem completely; parameters are an incomplete solution that adds to system complexity.

### 8.3 Taking it too far

Pulling complexity downward is easy to overdo — the absurd limit is collapsing the entire application into a single class. It makes sense only when (a) the complexity pulled down is closely related to the class's existing functionality, (b) pulling it down simplifies other parts of the application, and (c) it simplifies the class's interface. The goal is minimizing *overall* system complexity. The Chapter 6 backspace method shows the failure mode: adding user-interface knowledge to the text class looks like pulling complexity down, but it barely simplifies the higher-level code and the UI knowledge is unrelated to the text class's core — so the only result was information leakage.

### 8.4 Conclusion

When developing a module, look for opportunities to take a little extra suffering upon yourself in order to reduce the suffering of your users.

## My takeaways

<!-- Fill in as you re-read and apply the chapter. -->
-
