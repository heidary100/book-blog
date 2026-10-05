---
title: "I'm Changing the Same Code All Over the Place"
book: legacy-code
chapter: 21
date: 2026-10-04
summary: "Zealous, test-backed duplication removal in small chunks is design work: pulling up duplication until near-identical classes become thin shells over a small base yields tiny single-purpose methods — one knob per behavior — and the design that emerges falls in line with the Open/Closed Principle."
tags: [legacy-code, refactoring, abstractions, general-purpose-design]
---

> The same edit needed in a dozen scattered places: the classic legacy sore point, and reengineering is never affordable. Refactoring makes duplication removal a small-chunk activity instead of a grand project — remove a bit, run the tests, repeat — and the results are surprising. Working two near-identical command classes down to thin shells over a small base class, the design that emerges is **orthogonal** (one knob per behavior), new commands become trivial subclasses, and the code lands naturally on the Open/Closed Principle. "It didn't feel like we were designing. It was more like we were noticing what was there and moving the code closer to its essence."

## The big idea

The chapter answers a straight question: is zealous duplication removal actually worth it? The vehicle is a small Java networking system with two command classes, `AddEmployeeCmd` and `LoginCommand`, that serialize to a binary protocol — the same `0xdead` header and `0xbeef` footer, a different command char, the same field-plus-null-terminator write pattern, and the same bookkeeping inside `getSize()`. Plenty of duplication, "but so what?" The code is small; would removing duplication actually make life easier? Hard to tell by looking — so write a set of tests to run after each refactoring, then remove the duplication piece by piece and see where you end up.

What falls out is the argument. The end state has all functionality in one `Command` base class and two subclasses that are little more than constructors plus a command char. The payoffs: **orthogonality** — small focused methods, each doing something no other method does, so every behavior has exactly one knob; emergent design — the concepts of a *field* and a *command body* were in the code all along, and duplication removal merely noticed them, the only creative act being naming; and a natural alignment with the **Open/Closed Principle** — open for extension, closed to modification. "Duplication removal is a powerful way of distilling a design."

### 21.1 First Steps

First reaction when confronted by duplication: step back and get a sense of the full scope, imagining the classes you'll end up with — and then notice you're over-thinking it. "Removing small pieces of duplication helps, and it makes it easier to see larger areas of duplication later." In `LoginCommand.write`, every field is written as a string followed by a null terminator, so extract a `writeField`:

```java
void writeField(OutputStream outputStream, String field) {
    outputStream.write(field.getBytes());
    outputStream.write(0x00);
}
```

Choosing a grouping when several are possible doesn't deserve agonizing. Feathers' toy: `void c() { a(); a(); b(); a(); b(); b(); }` can become `aa(); b(); a(); bb();` or `a(); ab(); ab(); b();` — structurally it makes little difference, both beat the original, and either can be refactored into the other. "These aren't final decisions. I decide by paying attention to the names that I would use." His other heuristic: start small — tiny removals first, because they make the big picture clearer.

With `writeField` in place in `LoginCommand`, the same treatment is needed in `AddEmployeeCmd` — so introduce a `Command` superclass and pull `writeField` up into it. Next, the two `write` methods have the same form: header, size, command char, fields, footer. Extract the difference into a `writeBody` method in each subclass: "When two methods look roughly the same, extract the differences to other methods. When you do that, you can often make them exactly the same and get rid of one."

```java
public void write(OutputStream outputStream) throws Exception {
    outputStream.write(header);
    outputStream.write(getSize());
    outputStream.write(commandChar);
    writeBody(outputStream);
    outputStream.write(footer);
}
```

Now the identical `write` methods can move up — but only after the data they use does. `header`, `footer`, `SIZE_LENGTH`, and `CMD_BYTE_LENGTH` have the same values in both classes, so they pull up as `protected` (temporarily, to recompile and test). `commandChar` differs per subclass, so it becomes an abstract `getCommandChar()` on the base with a one-line override in each; `writeBody` becomes abstract too, and `write` moves up. `getSize` is next: same bookkeeping, different field sizes, so extract the difference as `getBodySize()` and pull `getSize` up — then be zealous about the "rather blatant" duplication left inside the body sizes with a `getFieldSize(String)` helper. Finally, generalize: a `fields` list in the base class, populated in each subclass constructor, lets `getBodySize` and `writeBody` iterate it — pull them up and re-privatize everything no longer accessed in subclasses:

```java
public abstract class Command {
    private static final byte[] header = {(byte)0xde, (byte)0xad};
    private static final byte[] footer = {(byte)0xbe, (byte)0xef};
    protected List fields = new ArrayList();
    protected abstract char [] getCommandChar();
    ...
    public void write(OutputStream outputStream) throws Exception {
        outputStream.write(header);
        outputStream.write(getSize());
        outputStream.write(commandChar);
        writeBody(outputStream);
        outputStream.write(footer);
    }
}
```

The subclasses are now "incredibly thin":

```java
public class LoginCommand extends Command {
    public LoginCommand(String userName, String passwd) {
        fields.add(userName);
        fields.add(passwd);
    }
    protected char [] getCommandChar() {
        return new char [] { 0x01};
    }
}
```

Do the two classes even need to exist? A static `Command.send(stream, 0x01, arguments)` would push command chars onto clients; a static method per command (`Command.SendLogin(...)`) would force changes at every construction site. The tiny subclasses don't hurt anything — leave them. One last touch, admitted to be overdue: rename `AddEmployeeCmd` to `AddEmployeeCommand` so the subclass names are consistent — "we're less likely to be wrong when we use names consistently." The abbreviations sidebar explains the stakes: a team that put *manager/management* in nearly every class name but abbreviated it inconsistently (`Mgr`, `Mngr`) left Feathers guessing wrong more than half the time; abbreviations are tolerable only when used consistently, and best avoided.

Was it worth it? Play out the change scenarios. Adding a new command: subclass `Command`, versus cut/copy-paste-and-edit in the original design — slower and error-prone, and it introduces more duplication. Non-string data: convert in the constructor (`AddEmployeeCommand` already converts an `int` salary). A different format — say a command that nests other commands: subclass and override `writeBody` with an `AggregateCommand` that writes its inner commands' sizes and delegates to each; "everything else just works."

This is where the payoff gets named. "When you remove duplication across classes, you end up with very small focused methods. Each of them does something that no other method does, and that gives us an incredible advantage: orthogonality" — independence; exactly one place to go for each behavior change, "as if your application is a big box with knobs surrounding the outside." Rampant duplication is multiple knobs for one behavior: switching the field terminator from `0x00` to `0x01`, or doubling it, would mean edits everywhere in the original and one edit (or one override) of `writeField` in the refactored code; special formats override `writeBody`. And the process felt mechanical — "the only creative thing that we've really done is come up with names for the new methods" — yet the original code didn't have the concept of a field or a command body; in a way it was there all along, in how the variables were treated. One of the startling discoveries of zealous duplication removal is that "designs emerge. You don't have to plan most of the knobs in your application; they just happen." It isn't perfect — `write` would read better as `writeHeader`/`writeBody`/`writeFooter`, one more knob — but knobs can be added as needed, and it's nicest when they happen naturally.

#### Open/Closed Principle

Bertrand Meyer's principle: code should be "open for extension but closed to modification" — in good design, adding features rarely means changing existing code. The `Command` hierarchy exhibits it: across the change scenarios, very few methods had to change, and some features required only a subclass. The bridge to Chapter 8: add features by subclassing (**Programming by Difference**) and then remove the duplication to integrate the difference into the hierarchy.

## Key terms

- **Orthogonality**: independence — if exactly one place in the code must change to alter a behavior, the design is orthogonal; duplication is multiple knobs for one behavior. A byproduct of removing duplication across classes.
- **Open/Closed Principle (OCP)**: Bertrand Meyer — code open for extension, closed to modification; duplication removal tends to move designs naturally in line with it.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
