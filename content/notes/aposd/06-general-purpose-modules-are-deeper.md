---
title: "General-Purpose Modules are Deeper"
book: aposd
chapter: 6
date: 2026-09-30
summary: "Over-specialization is a leading cause of complexity: build modules whose functionality fits current needs but whose interfaces are general enough for many uses."
tags: [general-purpose-design, deep-modules, information-hiding]
---

> Specialization leads to complexity; generality leads to simplicity. The sweet spot is a "somewhat general-purpose" module: its functionality reflects your current needs, but its interface is general enough to support multiple uses. Even if you never reuse the class, a general-purpose interface is simpler, deeper, and results in less implementation code than a special-purpose one.

## The big idea

Teaching his design course changed Ousterhout's mind on the classic generality-versus-specialization trade-off. Reviewing student projects, he found general-purpose classes almost always beat special-purpose alternatives — and what surprised him was that general-purpose interfaces are not just more reusable, they are *simpler and deeper*, with less code in the implementation. Over-specialization may be "the single greatest cause of complexity in software." The principle operates at many levels: general-purpose APIs yield more information hiding, and in method bodies, eliminating special cases lets the common-case code handle edge conditions too (which can also improve efficiency, Chapter 20).

Specialization cannot be eliminated entirely, so the chapter gives two complementary guidelines: make classes somewhat general-purpose, and cleanly separate whatever special-purpose code remains by pushing it up or down the stack.

## Section by section

### 6.1 Make classes somewhat general-purpose

The standard arguments: general-purpose code is an investment that may find unanticipated future uses (Chapter 3's investment mindset), but the future is hard to predict, so a general-purpose design might build facilities nobody needs and still not solve today's problem well — hence the incremental argument for building exactly what you need now and refactoring later. Ousterhout initially favored the special-purpose view, but student projects converted him: even for special-purpose use, general-purpose construction is less work. The resolution: functionality should reflect current needs, but the *interface* should not be tied to them. "Somewhat" matters — don't over-rotate into a framework so general it is awkward for today's task.

### 6.2 Example: storing text for an editor

Students built a GUI editor (multiple views, multi-level undo/redo) with a class managing the underlying text. Many teams tailored the text API to visible editor features, since they knew it would serve an interactive editor: `void backspace(Cursor cursor)`, `void delete(Cursor cursor)`, `void deleteSelection(Selection selection)` — one method per UI operation. The result: many shallow methods each usable for a single UI operation, many invoked from exactly one place, high cognitive load on both sides, and information leakage — UI abstractions (backspace key, selection) reflected in the text class, so each new UI feature forced a new text-class method, and the two classes could no longer evolve independently.

### 6.3 A more general-purpose API

Define the API purely in terms of basic text, ignoring higher-level operations. Two modification methods suffice:

```java
void insert(Position position, String newText);
void delete(Position start, Position end);
```

Note the generic `Position` type replacing UI-specific `Cursor`, plus helpers like `Position changePosition(Position position, int numChars)` (which crosses line boundaries automatically). Backspace and delete-key become one-liners:

```java
text.delete(text.changePosition(cursor, -1), cursor);   // backspace
text.delete(cursor, text.changePosition(cursor, 1));    // delete
```

The UI code is slightly longer but more obvious: the developer sees exactly which characters are deleted, instead of trusting the text class's documentation. And overall there is less code — many special-purpose methods collapse into a few general-purpose ones. The general text class also transfers to new applications (e.g. search-and-replace over a file), needing only something like `Position findNext(Position start, String string)`.

### 6.4 Generality leads to better information hiding

The general API cleanly separates text from UI: the text class no longer knows how the backspace key behaves, new UI features need no new text methods, and UI developers learn only a few reusable methods. The original `backspace` method was a false abstraction: it pretended to hide which characters get deleted, but UI developers genuinely need to know that, so they read the method's code anyway — hiding the information just created obscurity. A central design skill is "determining who needs to know what, and when": when details are important to the caller, make them explicit and obvious rather than burying them behind an interface.

### 6.5 Questions to ask yourself

Three questions calibrate generality. *What is the simplest interface that covers all my current needs?* Fewer methods with undiminished capability usually means more general methods — the specialized text API needed three delete variants (backspace, delete, deleteSelection); the general API needed one. But only if each method stays simple; piling up extra arguments to shrink the method count is not simplification. *In how many situations will this method be used?* A single-use method like backspace is a smell — try replacing several special-purpose methods with one general method. *Is this API easy to use for my current needs?* This catches over-generality: a text class offering only single-character insert/delete is simple and general but forces callers into loops for range operations and is inefficient for large ones — so range support belongs in the class.

### 6.6 Push specialization upwards (and downwards!)

Specialized code is inevitable, but it should be cleanly separated from general-purpose code — pushed up or down the stack. Upwards: top-level application classes provide specific features and are necessarily specialized, but that specialization need not percolate down; the improved text API pushed all UI specialization up into the interface code. Downwards: device drivers. An OS supports hundreds or thousands of device types, each with its own command set; it defines a general-purpose interface any secondary storage device must implement ("read a block", "write a block"), and each driver implements that interface with its device's special features. The OS core stays ignorant of device specifics, and any device capable of implementing the interface can be added with zero OS changes.

### 6.7 Example: editor undo mechanism

Undo had to cover text, selection, cursor, and view: undoing a delete must restore the text, reselect it, and scroll it into view. Some students embedded the whole mechanism in the text class: it maintained the undo list, recorded entries for non-text changes passed in by the UI, and on undo updated its own internals but *called back* into the UI for selection and cursor entries. The text class thus mixed a general-purpose core (managing a list of executed actions, stepping through them) with special-purpose handlers unrelated to everything else in the class — leakage, extra pass-through methods, and new entity types requiring text-class changes.

The fix extracts the general core into its own class:

```java
public class History {
    public interface Action {
        public void redo();
        public void undo();
    }
    History() {...}
    void addAction(Action action) {...}
    void addFence() {...}
    void undo() {...}
    void redo() {...}
}
```

`History` knows nothing about what the actions contain; each `History.Action` is a special-purpose object implemented outside `History` by the module that understands that action type (`UndoableInsert`/`UndoableDelete` from the text class, `UndoableSelection`/`UndoableCursor` from the UI). Fences are markers separating groups of related actions: each `undo` walks backwards until it hits a fence, so one user request can restore text, reselect it, and reposition the cursor; higher-level UI code sets fence placement. Undo thus splits into three independently understandable categories — the general mechanism (`History`), the specifics of each action (per-action classes), and the grouping policy (high-level UI code). Once the general/special separation was made, "the rest of the design fell out naturally."

The note clarifies scope: separate special-purpose from general-purpose code *within a mechanism*. Special-purpose *undo* code for text belongs in the text class (it is tightly related to text operations), just not mixed with the general undo infrastructure.

### 6.8 Eliminate special cases in code

Specialization also appears inside method bodies as special cases, which litter code with `if` statements that are hard to understand and bug-prone. The remedy is designing the normal case so it handles edge conditions automatically. In the editor, most students gave the selection an explicit "does a selection exist?" state variable, forcing checks everywhere "no selection" might occur. Instead, make the selection always exist: when nothing is selected, use an *empty* selection whose start and end positions are equal. Copying inserts zero bytes with no special check; deleting a same-line selection concatenates the text before and after it — which regenerates the original line when the selection is empty. Chapter 10 applies the same idea to exceptions.

### 6.9 Conclusion

Unnecessary specialization — special-purpose classes and methods, or special cases in code — is a significant complexity contributor. It cannot be eliminated, but good design reduces it drastically and quarantines what remains, yielding deeper classes, better information hiding, and simpler, more obvious code.

## Key terms

- **Somewhat general-purpose**: a module whose functionality reflects current needs but whose interface is general enough to support multiple uses — without being so general that current needs become awkward.
- **False abstraction**: an interface element (like the `backspace` method) that claims to hide information its users actually need, forcing them to read the implementation and creating obscurity.
- **Fence**: a marker in `History`'s action list that groups related actions, so a single undo or redo stops at the next fence.

## My takeaways

<!-- Fill in as you re-read and apply the chapter. -->
-
