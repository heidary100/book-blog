---
title: "I Don't Understand the Code Well Enough to Change It"
book: legacy-code
chapter: 16
date: 2026-10-04
summary: "Reading is only the most immediate way to understand code: when browsing turns dizzying, switch to sketching, marking up printed listings, throwaway scratch refactoring, and deleting dead code — low-tech moves that put the coming change on a more solid footing."
tags: [legacy-code, refactoring, complexity]
---

> Stepping into unfamiliar legacy code is scary because you never know whether a change is simple or a weeklong hair-pulling exercise — and the one technique everyone uses, reading code, is also the first to stop helping. Understanding "looks and feels suspiciously like not working," so people assimilate what they can and start coding, hoping for the best. The alternatives are deliberately low-tech: **notes/sketching**, **listing markup**, **Scratch refactoring**, and deleting unused code.

## The big idea

Some people become immune to the fear by confronting and slaying monsters over and over, but everyone meets demons they can't slay, and dwelling on the difficulty before you even look makes it worse. The typical scene: you browse, keep a mental list of things to do, trade one approach off against another — sometimes confidence arrives, sometimes dizziness does, and then you start working on what you know how to do and hope. Feathers' point is that understanding is not something to endure passively; it can be worked at with simple techniques, and the cultural feeling that understanding time is unpaid time is exactly backwards.

The common thread is externalizing and testing understanding instead of accumulating it in your head. Sketches are tools that make conversation go easier and preserve what you're learning — "the precision doesn't have to be on paper," and nobody else needs to decipher them. Marked-up printouts answer specific questions about a method. A scratch refactoring proves you understand the code by moving it. Deleting dead code removes confusion outright. None of these leaves an artifact you must maintain, so each can be used mid-change, informally, with no process buy-in.

## Section by section

### 16.1 Notes/Sketching

When reading gets confusing, start drawing pictures and making notes: write down the name of the last important thing you saw, then the name of the next one, and draw a line between them if you see a relationship. These are not full-blown UML diagrams or call graphs in a special notation — blobs and lines that would be indecipherable to anyone who wasn't there when you drew them are fine, though you can get more formal or neater if things get more confusing. Sketching helps you see the code in a different way, and it maintains your mental state while you work through something particularly complex.

Two properties make the technique worth cultivating. It is informal: the paper is just a tool to make conversation easier and to help you remember the concepts you're discussing, so there is no syntax to learn and nothing to keep current. And it is infectious: sketch while explaining code to a teammate and, if they are really engaged in learning that part of the system too, they will go back and forth on the sketch with you — no push to make it part of the team's process. Local sketches eventually tempt you toward the big picture; Chapter 17 has techniques for that scale.

### 16.2 Listing Markup

Print the code you want to work with, then mark it up — particularly useful with very long methods. Nearly everyone has done this at some point, and Feathers thinks it is underused. How you mark up depends on what you want to understand, and the book runs through four activities:

- **Separating responsibilities (16.2.1)** — use a marker to group things that belong together: a special symbol next to each member of the group, several colors if you can.
- **Understanding method structure (16.2.2)** — line up blocks, because indentation in long methods can make them impossible to read: draw lines from block beginnings to their ends, or comment the ends of blocks with the text of the loop or condition that started them. The easiest way is inside out — in C-family languages, read from the top past each opening brace until you hit the first closing brace, mark it, look back for its matching opener, and keep going:

```c
while (hasMoreOrders()) {
    if (order.isReady()) {
        ...
    }  /* if (order.isReady()) */
}  /* while (hasMoreOrders()) */
```

- **Extract methods (16.2.3)** — circle code you'd like to extract and annotate it with its coupling count (the Chapter 22 machinery for **monster methods**): a paper dry run of the real decomposition.
- **Understanding the effects of a change (16.2.4)** — put a mark next to the lines you are going to change, then next to each variable whose value can change as a result and every method call that could be affected; then mark the variables and methods affected by the things you just marked, repeating as many times as needed to see how effects propagate. It is a paper alternative to the effect sketches of Chapter 11, and when it is done you have a better sense of what you have to test.

### 16.3 Scratch Refactoring

Refactoring is one of the best techniques for learning code — just get in and start moving things around until it is clearer — but without tests that is hazardous: how do you know you aren't breaking anything? **Scratch refactoring** removes the need to care. Check the code out of version control, forget about writing tests, extract methods, move variables, restructure it however you want in order to understand it — and don't check it in. Throw the code away. Feathers' first mention of this to a colleague sounded wasteful, but a half hour of moving things around taught them an incredible amount about the code, and the colleague was sold.

Two risks. First, a gross mistake while refactoring can leave you with a false view of what the system does — anxiety waiting for you when you refactor for real. Second, and related: getting attached to the way the code turns out, so you start thinking about the system in those terms all the time. That is costly because the real refactoring may well come out different — you might see a better structure later, or the code might change and give you different insights — and attachment to the endpoint of the scratch pass makes you miss them.

The payoff is conviction: scratch refactoring is a good way to convince yourself that you understand the most important things about the code, which alone makes the work go easier. Either there isn't something scary behind every corner, or "you'll at least have some notice before you get there."

### 16.4 Delete Unused Code

If the code you are looking at is confusing and you can determine that some of it isn't used, delete it. It isn't doing anything for you except getting in your way. The reluctance — someone spent time writing that code, and maybe it will be useful in the future — is exactly what version control is for: the code is in earlier versions, and you can always look for it if you ever decide you need it.

## Key terms

- **Notes/sketching**: informal sketches made while reading code — the names of important entities connected by lines — used to see things differently, make conversation easier, and preserve mental state; deliberately not UML, and indecipherable to anyone who wasn't there.
- **Listing markup**: marking up a printed listing to answer a specific question — grouping responsibilities with symbols and colors, lining up blocks, circling extraction candidates with their coupling counts, or propagating effect marks from an intended change.
- **Scratch refactoring**: refactoring a throwaway checkout of the code, without tests, purely to learn how it works — with the discipline that it is never checked in.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
