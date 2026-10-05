---
title: "I Need to Change a Monster Method and I Can't Write Tests for It"
book: legacy-code
chapter: 22
date: 2026-10-04
summary: "Monster methods can be taken apart even without tests: with a refactoring tool, use it exclusively so every edit is known-safe; without one, introduce sensing variables, extract what you know at a low coupling count, glean dependencies, and skeletonize in small, redoable extractions."
tags: [legacy-code, refactoring, complexity]
---

> Long methods are quagmires in a code base: every change forces a fresh pass of understanding before you can touch anything. A **monster method** is the degenerate case — hundreds or thousands of lines, enough scattered indentation to make navigation nearly impossible, too scary to modify at all. The chapter's dividing line is tooling. With automated extract-method support you don't need tests to verify extractions, so use the tool exclusively and let the extractions introduce **seams**. Without it, correctness is something you maintain by hand: sense into the method with temporary flags, extract only what you know, and exploit the fact that not all behavior is equally critical.

## The big idea

Feathers opens with a friend's method that ran past a thousand lines and the question it provoked: "How in the world would you refactor this?" Testing is key, but where do you even begin with something that size? The answer organizes the whole chapter around one fact: nearly every refactoring tool supports extract method because that is where the leverage is — and if a tool can extract methods safely, you don't need tests to verify your extractions. The tool does the analysis; what is left is learning to use extractions to put the method into decent shape for further work. Extraction serves two goals: separate logic from awkward dependencies, and introduce seams that make it easier to get tests in place for more refactoring.

Without tool support the problem inverts: correctness is something you have to work to maintain, and tests are the strongest tool around. The manual techniques all serve the business of manufacturing just enough coverage to make each extraction checkable — sensing variables that get deleted afterward, tiny low-coupling extractions, tests aimed only at the behavior that must not break — and everything is conservative by design: small pieces, undoable moves, and a willingness to redo extractions once insight arrives.

## Section by section

### 22.1 Varieties of Monsters

Monster methods come in a couple of varieties, and they aren't distinct types — methods in the field are like platypuses, mixtures of several kinds. Naming the variety matters because it changes the attack.

#### 22.1.1 Bulleted Methods

A **bulleted method** has nearly no indentation: a sequence of code chunks that reads like a bulleted list (Figure 22.1). Some chunks may be indented internally, but the method is not dominated by indentation. If you are lucky, blank lines or comments mark sections as doing somewhat distinct things, and in an ideal world you would extract a method per section — but the spacing is a little deceptive: temporary variables declared in one section are used in the next, so breaking the method down is rarely as easy as copying and pasting code out. Despite that, bulleted methods are the less intimidating variety, mainly because the lack of wild indentation lets you keep your bearings.

#### 22.1.2 Snarled Methods

A **snarled method** is dominated by a single large, indented section. The simplest case — one large conditional — nearly has the qualities of a bulleted method. The snarls that demand your full appreciation nest deeply (Figure 22.3). The diagnostic: try to line up the blocks in the long method. "If you start to feel vertigo, you've run into a snarled method." Most real methods sit in between, and many snarls hide long bulleted sections deep in their nesting — where it is hard to write tests that pin down behavior precisely because everything is buried. Snarls present unique challenges, and the tooling question decides what you can do about them.

### 22.2 Tackling Monsters with Automated Refactoring Support

First be clear about what a tool can and can't do. Most tools handle simple extract method and a variety of other refactorings, but not the auxiliary work people actually want when breaking up large methods. The tempting case is reordering statements to group them for extraction — no current tool does the analysis needed to see whether reordering is safe, which is a shame, because it is a source of bugs.

So the discipline is: make a series of changes solely with the tool and avoid all other edits to the source. It feels like "refactoring with one hand behind your back," but it gives a clean separation between changes that are known to be safe and changes that aren't. Avoid even simple things — no reordering statements, no breaking apart expressions; variable renaming only if the tool supports it. After a series of automated refactorings you can often get tests in place and use them to verify the manual edits that follow.

The example: `CommoditySelectionPanel.update()` does commodity filtering — work that belongs nowhere near a class that should ideally just be responsible for display. Writing tests against the list box state wouldn't move the design forward. With refactoring support you can name high-level pieces of the method and break dependencies at the same time:

```java
public void update() {
    if (commoditiesAreReadyForUpdate()) {
        clearDisplay();
        updateCommodities();
    }
    ...
}

private void updateCommodities() {
    for (Iterator it = commodities.iterator(); it.hasNext(); ) {
        Commodity current = (Commodity)it.next();
        if (singleBrokerCommodity(current)) {
            displayCommodity(current.getView());
        }
    }
}
```

Structurally `update` doesn't look that different — still an if-statement with work inside — but the work is delegated now: the method is a skeleton of the code it came from. The names seem a little hokey, but they are a good starting point: the code communicates at a higher level, and the seams allow Subclass and Override Method to sense through `displayCommodity` and `clearDisplay`. From there the filtering logic can move off the panel — in this case moving `update` and `updateCommodities` to another class while leaving the display methods here, taking advantage of the fact that this class is a panel. Rename as methods settle into place. And don't worry about extracted methods that don't seem to fit the class — they often point toward a new class to extract later (Chapter 20).

### 22.3 The Manual Refactoring Challenge

Good tools check each refactoring and disallow the ones they can't perform safely. Without a tool, correctness is something you have to work to maintain, and tests are the strongest tool around. If you can create instances of the class in a test harness, devise test cases that give you confidence as you break the method down — though with particularly complex logic that can be a nightmare, which is what the following techniques are for. First know the failure modes. The most common extraction errors:

1. Forgetting to pass a variable into the extracted method. The compiler usually catches it — unless the name matches an instance variable, or you assume the variable was meant to be local and declare it in the new method.
2. Naming the extracted method so that it hides or overrides a method with the same name in a base class.
3. Making a mistake passing parameters or assigning return values — the silly version (returning the wrong value) and the subtle version (accepting or returning the wrong types).

#### 22.3.1 Introduce Sensing Variable

Refactoring production code doesn't mean adding nothing: you can temporarily add a variable to a class and use it to sense conditions in the method, then remove it when the refactoring is done and the code is back in a clean state. The example is a `DOMBuilder` whose `processNode` does most of its visible work on the `XDOMNSnippet` passed in — testable by passing different arguments — but also does tangential work sensible only indirectly, such as adding nodes to a local `paraList` by node type. Introduce a public flag and set it inside the condition:

```java
public boolean nodeAdded = false;   // sensing variable; removed after refactoring

void processNode(XDOMNSnippet root, List childNodes) {
    ...
    for (Iterator it = childNodes.iterator(); it.hasNext(); ) {
        XDOMNNode node = (XDOMNNode)it.next();
        if (isBasicChild(node)) {
            paraList.add(node);
            nodeAdded = true;
        }
        ...
    }
    ...
}

private boolean isBasicChild(XDOMNNode node) {
    return node.type() == TF_G || node.type() == TF_H
        || (node.type() == TF_GLOT && node.isChild());
}
```

With the flag in place, engineer the input to cover the condition: `testAddNodeOnBasicChild` builds a `TF_G` child and asserts `builder.nodeAdded` is true; `testNoAddNodeOnNonBasicChild` feeds a `TF_A` child and asserts it stays false. Now the condition can be extracted (as `isBasicChild` above) and the tests should still pass. Note what they verify: that the condition is still part of the code path after extraction — not every corner of its logic. Feathers felt confident extracting the condition's body unseen; Chapter 13's Targeted Testing covers how much testing extraction actually needs.

Keep sensing variables in the class over a series of refactorings and delete them only after the refactoring session — that way all the extraction tests stay visible and are easy to undo if you decide to extract differently. When done, delete them or refactor them so they test the extracted methods rather than the original. Sensing variables are the key tool for teasing apart monsters: they support refactoring deep inside snarled methods, and progressive de-snarling — extract a conditional or its body into a method, then use sensing variables to work on that method too, until the code is untangled.

#### 22.3.2 Extract What You Know

Start small: find little pieces you can extract confidently without tests, then add tests to cover them. "Little" is defined precisely — two or three lines, five at most, a chunk you can easily name. The number to watch is the **coupling count**: the number of values passing into and out of the extracted method. Extracting `max` from a method leaves two variables in and one out — a count of 3. Favor small counts because there is less room to make a mistake; the key danger in extraction is a type conversion error, and low counts minimize exposure. For each variable passed in, look back at where it is declared to get the new signature right.

Count-0 extractions are the safest of all, and you can make a lot of headway with them: a method that accepts nothing and returns nothing is a command — you tell the object to do something to its state (or, more sleazily, to some global state). Naming such a chunk often yields insight into what it is about and how it is supposed to affect the object, and that insight cascades into more. Progress is hard to see while whittling, but it sneaks up: every extraction clarifies the method a little, and over time you get a better sense of its scope and the directions to take it. Without a tool, extracting 0-count methods is a good prelude to testing and further work. And don't trust the chunk structure of a bulleted method to give you clean extractions — chunks usually consume temporaries declared before them, so look for low-count methods inside and across chunks.

#### 22.3.3 Gleaning Dependencies

Some code in a monster method is secondary to its main purpose: necessary, not terribly complex, and if you accidentally break it the breakage will be obvious. But the main logic cannot be risked. **Gleaning dependencies** is the answer: write tests for the logic you need to preserve, then extract things the tests do not cover. In `addEntry`, the display code fails fast and visibly; a mistake in the entry-add logic might take quite a while to find — so write tests verifying that entries are added under the right conditions, and once that behavior is covered, extract the display code knowing entry addition is unaffected.

It feels like a cop-out — one set of behaviors preserved, another edited unprotected — but not all behaviors are equal in an application, and the technique is at its most powerful when critical behavior is tangled with other behavior: solid tests on the critical part license a lot of editing that is technically not test-covered.

#### 22.3.4 Break Out a Method Object

Sometimes the ideal sensing variables already exist — as locals of the method. Promoting locals to instance variables works but is confusing: the state matters only to the monster method and the methods extracted from it, gets reinitialized on every call, and becomes hard to interpret if you want to call the extracted methods independently. The alternative is Break Out Method Object — first described by Ward Cunningham, and an epitome of the invented abstraction: create a class whose only responsibility is the monster method's work; the method's parameters become constructor arguments; the body goes into a method named `run` or `execute`. Once the code lives on the new class, its temporary variables can become instance variables — senseable through tests as you break the method down, and legitimately part of production. It is a drastic move, but unlike a sensing variable these variables are needed for production, so the tests you build on them can be kept. The detailed example lives in the Chapter 25 catalog.

### 22.4 Strategy

The techniques break monsters up for refactoring or feature addition. What follows is guidance about the structural tradeoffs made along the way.

#### 22.4.1 Skeletonize Methods

Given a conditional statement, you can extract the condition and the body together or separately. Skeletonizing extracts them separately, leaving the original method as pure control structure plus delegations:

```java
if (orderNeedsRecalculation(order)) {
    recalculateOrder(order, rateCalculator);
}
```

This puts you in a better position to reorganize the logic of the method later. Skeletonize when you feel the control structure will need refactoring after it is clarified.

#### 22.4.2 Find Sequences

The same conditional, extracted together: pull the condition and body whole into `recalculateOrder`, and you are better positioned to notice that the rest of the method is just a sequence of operations happening one after another — clearer once the sequence is visible. Yes, this is completely conflicting advice, and Feathers owns it: he goes back and forth between the two. Skeletonize when the control structure will need refactoring once clarified; find sequences when identifying an overarching sequence would make the code clearer. Bulleted methods lean toward finding sequences and snarled methods toward skeletonizing, but the real decider is which design insights show up as you extract.

#### 22.4.3 Extract to the Current Class First

The name you are tempted to give an extraction tells you where the code belongs: reach for `recalculateOrder` — a method name containing the word `order` — and the chunk probably belongs on the `Order` class, as `recalculate` (or under a name that says what makes this recalculation different, or after renaming the existing `recalculate`). Tempting as it is to extract directly to the other class, don't: use the awkward name first. `recalculateOrder` on the current class is an easily undoable extraction that lets you explore whether you got the right chunk of code; move the method to its real home later, when the best direction presents itself. Extracting to the current class moves you forward and is less error-prone.

#### 22.4.4 Extract Small Pieces

Underscored from the manual section: extract small pieces first. Each individual piece looks like it will make no difference at all — until, a few extractions in, the original method looks different: a sequence that was obscured appears, or a better organization suggests itself, and you can move toward it. Trying to break a method into large chunks from the beginning is neither as easy nor as safe as it looks: it is easier to miss the details, and the details are what make the code work.

#### 22.4.5 Be Prepared to Redo Extractions

"There are many ways to slice a pie and many ways to break down a monster method." After some extractions you usually find better ways to accommodate new features, and sometimes the best way forward is to undo an extraction or two and re-extract. That doesn't make the first extractions wasted effort: they bought something essential — insight into the old design and into a better way of moving forward.

## Key terms

- **Monster method**: a method so long and complex you don't feel comfortable touching it — hundreds or thousands of lines with enough scattered indentation to make navigation nearly impossible.
- **Bulleted method**: a monster with almost no indentation — a sequence of chunks like a bulleted list; the gaps between chunks are deceptive because they share temporary variables.
- **Snarled method**: a monster dominated by a large, deeply indented section; the diagnostic is trying to line up the blocks and feeling vertigo.
- **Coupling count**: the number of values passing into and out of an extracted method; low counts are safer, and 0-count extractions are safest of all.
- **Introduce Sensing Variable**: temporarily adding a variable (often a public flag) so tests can observe conditions inside a method; deleted once the refactoring session ends.
- **Gleaning dependencies**: writing tests for the critical behavior, then extracting uncovered, less-critical code with confidence that the tested behavior is preserved.
- **Skeletonizing**: extracting conditions and bodies separately so the original method reduces to control structure plus delegations.
- **Break Out Method Object**: moving a method's body into a new class — parameters become constructor arguments, the body becomes `run`/`execute` — so its locals become senseable instance variables.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
