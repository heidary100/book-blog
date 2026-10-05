---
title: "Changing Software"
book: legacy-code
chapter: 1
date: 2026-10-04
summary: "Software changes for one of four reasons — features, bugs, design improvement, or resource optimization — and every kind preserves far more existing behavior than it alters; change feels risky because we rarely know how much behavior is at risk."
tags: [refactoring, software-design, complexity, mindset]
---

> Every change to software is one of four kinds: adding a feature, fixing a bug, improving the design, optimizing resource usage. Three things can change in a system — structure, functionality, and resource usage — and each kind of change holds most of them fixed; even a bug fix alters only a small fraction of existing behavior. The hard part is not making the change but knowing the surrounding behavior survived it, and teams that lack a way to know minimize changes — which makes the code worse and breeds fear.

## The big idea

The industry has barely discussed how ways of changing code differ — the refactoring literature is the closest it has come — so Feathers opens the mechanics of change by classifying changes. Four reasons to change, and a decomposition of what actually changes: structure, functionality, and resource usage. Refactoring holds functionality invariant and changes structure; optimization holds functionality invariant and changes resource usage (usually time or memory); feature addition typically adds functionality without changing existing functionality; bug fixing changes functionality only in small pieces. In all four cases, we want to change some behavior and preserve much more.

The practical asymmetry that drives the rest of the book: the changed part is small and known; the preserved part is huge and of unknown extent. "Preserving existing behavior is one of the largest challenges in software development." The crucial unknown is how much of that behavior is at risk when we make our changes — if we knew, we could concentrate on exactly that and not care about the rest. Understanding is the key thing needed to make changes safely, and everything that follows is about manufacturing that understanding.

## Section by section

### 1.1 Four Reasons to Change Software

For simplicity's sake, four primary reasons: adding a feature, fixing a bug, improving the design, optimizing resource usage. The sub-sections examine each kind and, more importantly, what each one typically holds invariant.

#### 1.1.1 Adding Features and Fixing Bugs

Whether a change is a feature or a bug fix is a point of view. A manager wants the company logo moved from the left side of a page to the right, plus animation for the next release — from her point of view she is fixing a problem; from the developers' point of view it is a completely new feature ("if they just stopped changing their minds, we'd be done by now"). Many organizations track the two separately because of contracts or quality initiatives, but at the technical level it is all just changing code, and the feature/bug vocabulary masks the distinction that actually matters: behavioral change.

Behavior is the most important thing about software: it is what users depend on. They like added behavior (provided it is what they really wanted), but when we change or remove behavior they rely on — introduce bugs — they stop trusting us. Whether behavior changed is decidable even in murky cases: the logo move adds behavior (logo on the right) and removes some (no logo on the left). The programmer's rule of thumb: if you have to modify code — and HTML counts as code — you could be changing behavior; if you are only adding code and calling it, you are often adding behavior.

```java
public class CDPlayer {
    public void addTrackListing(Track track) { ... }

    public void replaceTrackListing(String name, Track track) { ... }
}
```

Adding `replaceTrackListing` changed neither: nothing calls it, so it adds no behavior to the application until it is wired up. The UI button that invokes it adds the specified behavior — and also subtly changes behavior, because the interface renders differently and takes a microsecond longer to display. "It seems nearly impossible to add behavior without changing it to some degree."

#### 1.1.2 Improving Design

Design improvement is a different kind of change: alter the structure to make software more maintainable while keeping its behavior intact. When behavior drops in the process, we call it a bug — and that risk is the main reason many programmers rarely attempt design improvement. The act of improving design without changing behavior is **refactoring**: write tests that pin down existing behavior, then take small steps, verifying all along the way. Refactoring differs from general cleanup — it is neither low-risk reformatting nor invasive, risky rewriting — it is a series of small structural modifications supported by tests. No functional changes are supposed to occur, though structural changes can alter performance, for better or worse.

#### 1.1.3 Optimization

Optimization is like refactoring with a different target. Both say "keep functionality exactly the same and change something else": in refactoring the something else is program structure, to make it easier to maintain; in optimization it is some resource the program uses, usually time or memory.

#### 1.1.4 Putting It All Together

Superficially, refactoring and optimization look like twins, unlike feature and bug work. But adding a feature usually means adding new functionality without changing existing functionality, and bug fixing, scrutinized closely, changes only small amounts of functionality — so all four kinds of change hold existing functionality roughly invariant. Three things can change when we work in a system — structure, functionality, resource usage — and each change kind moves one while preserving the rest.

Practically, this splits attention two ways: get the small number of changed things right, and preserve everything else. Preserving "involves more than just leaving the code alone" — you have to know that the behavior isn't changing, and that is tough. The amount of behavior to preserve is usually very large, but that isn't the big deal; the big deal is that you often don't know how much of it is at risk. If you knew, you could concentrate on that behavior and ignore the rest. Understanding is the key thing that makes changes safe.

### 1.2 Risky Change

To mitigate risk, three questions:

1. What changes do we have to make?
2. How will we know that we've done them correctly?
3. How will we know that we haven't broken anything?

Most teams manage risk in a very conservative way: they minimize the number of changes they make. Sometimes it is explicit policy ("if it's not broke, don't fix it"); often it is unspoken caution — "create another method for that? No, I'll just put the lines of code right here in the method, where I can see them and the rest of the code." It is tempting to think software problems can be minimized by avoiding them, but it always catches up: when you avoid creating new classes and methods, the existing ones grow larger and harder to understand.

Any large system requires time to get familiar with the area you are changing; the difference between good systems and bad ones is what happens after. In good ones you feel pretty calm and confident about the change you are about to make. In poorly structured code, the move from figuring things out to making changes "feels like jumping off a cliff to avoid a tiger" — hesitate and hesitate, then "well, I guess I have to."

Avoidance has two further costs. Skill atrophies: breaking down a big class is involved work unless you do it a couple of times a week, when it becomes routine and you get better at knowing what can break. And fear compounds: many teams live with incredible fear of change that gets worse every day, and often are not aware of how much of it they carry until they learn better techniques and the fear starts to fade.

The alternative to avoidance is to try harder — hire more people, scrutinize everything, make changes the "right" way. But scrutiny answers the first two questions, not the third: after all that analysis, will anyone know they haven't broken anything? That gap is what tests close, and the next chapter begins there.

## Key terms

- **Behavior**: what software does that users depend on; the large invariant that every kind of change must preserve.
- **Refactoring**: improving design without changing behavior, via a series of small structural modifications supported by tests.
- **Optimization**: holding functionality invariant while changing resource usage — usually time or memory.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
