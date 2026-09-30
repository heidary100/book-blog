---
title: "The Basic Tools"
book: pragmatic-programmer
chapter: 3
date: 2026-10-01
summary: "The pragmatic toolbelt: plain text, a fluent shell and editor, version control on everything, calm debugging, text-manipulation languages, and a paper daybook."
tags: [automation, tools]
---

> A programmer's base material is knowledge, and the pragmatic workbench keeps it in plain text: a command shell, a fluent editor, and version control on everything. Debugging is framed as calm, systematic problem solving, and text-manipulation languages plus an old-fashioned paper engineering daybook complete the kit.

## The big idea

Chapter 3 is the craftsman's tool survey, unified by one material decision: keep knowledge in plain text. Self-describing text outlives the applications that wrote it and can be manipulated by virtually every tool ever built — editors, shells, diff, grep, version control. Everything else is either a way to work that material (shell, editor, text-manipulation languages) or to keep it recoverable (version control, a debugging discipline, a paper daybook). The recurring theme: mastery as investment, shrinking the distance between thinking and doing.

## Topic by topic

### Topic 16. The Power of Plain Text

Plain text is printable characters that convey information — from a shopping list to the source of this book. The dividing line is *human understandable* versus merely human readable: `Field19=467abe` is text but meaningless, and binary formats are worse — the context needed to interpret them lives outside the data, so without the original application it may as well be encrypted. **Tip 25: Keep Knowledge in Plain Text.** Benefits: *insurance against obsolescence* — self-describing data outlives its applications and is parseable with partial knowledge (the legacy file yields Social Security numbers under `<FIELD10>` tags; `<SOCIAL-SECURITY-NO>` would have made it a no-brainer); *leverage* — every tool operates on text; the Unix philosophy of small, sharp tools runs on line-oriented plain-text files, so `grep -r backup /etc` finds the forgotten config, and version control, diff, and checksums all apply; *easier testing* — synthetic data and parseable regression output. Structure is fine: HTML, JSON, YAML, and the net's core protocols are all plain text — the lowest common denominator for heterogeneous systems.

### Topic 17. Shell Games

The command shell is the programmer's workbench: invoke your whole tool repertoire, combine tools with pipes in ways their developers never dreamt of, launch applications, search files, filter output, script macro commands. GUIs are fine for what they were designed for, but WYSIWYG's flip side is WYSIAYG — "what you see is all you get": try wiring a code preprocessor into an IDE whose designer provided no hooks and you're stuck. **Tip 26: Use the Power of Command Shells.** The classic example collects unique Java imports:

```bash
grep '^import ' *.java |
  sed -e 's/.*import *//' -e 's/;.*$//' |
  sort -u > list
```

Then customize the habitat: a prompt showing directory, version-control status, and time; aliases that encode habits (`apt-up` chaining update and upgrade; `rm` mapped to `rm -iv` after one accidental deletion too many); context-aware completion. You'll spend much of your life in the shell — be like a hermit crab and make it your own home.

### Topic 18. Power Editing

Text is the raw material of programming, so the editor should be an extension of your hand. The first edition said use one editor for everything; this edition softens to: any number of editors, but work toward **fluency in each (Tip 27: Achieve Editor Fluency)**. The arithmetic is real — 4% more efficient editing over 20 hours a week recovers an extra week a year — but the deeper gain is that mechanics drop below conscious thought and thoughts flow, like a driver who no longer thinks about the clutch. Fluency means, all without a mouse: move and select by character, word, line, paragraph, and syntactic unit; reindent after changes; comment/uncomment blocks with one command; undo/redo; split and navigate panels; go to a line number; sort lines; string and regex search with repeat; multiple cursors; display compilation errors; run the project's tests. Method: notice every repetitive act ("there must be a better way"), find the command, then use it deliberately many times a day for a week until it lands in muscle memory. Grow the editor with extensions and its extension language, and publish what you build. Challenges: turn off autorepeat; spend a week editing keyboard-only.

### Topic 19. Version Control

A VCS is a giant undo key — a project-wide time machine reaching back past last week's compile. But undo is the least of it: it answers who changed this line and what differs from last week; identifies releases you can regenerate forever; archives centrally; and manages concurrent edits and merging. Two non-negotiables: shared directories are not version control (lost changes, broken builds, fist fights in the car park), and keeping a repository on a cloud drive is worse — simultaneous changes can corrupt its state beyond repair. **Tip 28: Always Use Version Control** — on everything: documentation, phone lists, memos, makefiles, build scripts, throwaway prototypes, one-week solo projects, even the text of the book. Branches isolate islands of development and anchor team workflows — about which the authors are non-dogmatic: most advice is just "this is what worked for me," so adopt, review, adjust. The thought experiment: tea spilled on the laptop — but because dotfiles, editor config, the Homebrew list, Ansible scripts, and projects all lived in version control, the machine was restored by the end of the afternoon. Hosted centrally (third-party hosting suits most teams), the repository becomes the project hub: access control, CLI access for automation, automated builds and tests, pull requests, issue tracking tied to commits, wikis — up to push-to-branch build/test/deploy pipelines, which sound scary only until you remember you can always roll back.

### Topic 20. Debugging

From Grace Hopper's moth taped into a logbook to a closing checklist, the message is that debugging is just problem solving — attack it as a puzzle, not an insult. **Fix the problem, not the blame (Tip 29)**: whose bug it is doesn't matter; it's your problem. Mindset first: **Don't Panic (Tip 30)** — switch off ego defenses and deadline pressure, and if your reaction is "that's impossible," you are plainly wrong: it happened. Beware myopia: the fault is often several steps removed from the symptom, so chase root causes, not appearances. Start from clean data: build with warnings maxed (don't hunt by hand what the compiler will flag). Get accurate observations — the graphics-app story: the programmer tested brush strokes lower-left to upper-right, the tester painted the other direction, and the app exploded; interview the reporter, test boundaries and realistic usage systematically. Then **Failing Test Before Fixing Code (Tip 31)**: reproduce the bug with a single command, not a 15-step ritual — and write the failing test, since isolating it often informs the fix. And **Read the Damn Error Message (Tip 32)** before tabbing to the code.

Strategies: confirm the bad value in a debugger and walk the call stack, with pen-and-paper notes of dead ends; *binary chop* everything — a 64-frame stacktrace resolves in six chops, a crashing dataset halves to a minimal failing set, regressions are bisected across releases (VCS tools automate this); *tracing* for anything time-sensitive — concurrent, real-time, event-based systems — in consistent, parseable log formats (the unbalanced open/close leak falls out of a log scan); *rubber ducking* — explaining step by step forces assumptions into words, and a duck or potted plant will do; *process of elimination* — assume your code, not the OS or library: the senior engineer certain `select` was broken spent weeks on workarounds and minutes on the docs (**Tip 33: "select" Isn't Broken**). Hoof prints: think horses, not zebras. If you "changed only one thing," that thing is the suspect — including upgrades outside your control that silently break workarounds. Surprise is proportional to trust: a surprising failure means an assumption is wrong — **Don't Assume It—Prove It (Tip 34)**, in this context, with this data, at these boundaries. Afterward: why didn't the tests catch it, where else does this bug lurk, why did the fix take so long, and who else shares the wrong assumption?

### Topic 21. Text Manipulation

Text-manipulation languages are the router of the toolbox: noisy, brute force, able to ruin the workpiece — and, in practiced hands, surprisingly subtle. Shell plus awk and sed, or Python and Ruby, are *enabling technologies*: utilities and prototypes cost five to ten times less, and that ratio is what makes experimentation affordable — 30 minutes for a crazy idea instead of five hours (Kernighan and Pike's five-language comparison: 17 lines of Perl against 150 of C). **Tip 35: Learn a Text Manipulation Language.** The authors' book build is the showcase: Ruby scripts extract tested code into the manuscript (DRY — examples can't drift from their programs), update the website's table of contents, convert LaTeX math, generate the index from markup in the source. Plain text (Topic 16) makes it all possible.

### Topic 22. Engineering Daybooks

The chapter ends with the lowest-tech tool: a paper notebook, pen down the spine, in the tradition of the hardware engineers Dave worked alongside. Record what you did and learned, sketches, meter readings, variable values while debugging, reminders, wild ideas, doodles. Three benefits: it is more reliable than memory (the power-supply company's name is one page-flip away); it is a parking lot for ideas not relevant to the current task, so you stay focused without losing the thought; and writing is itself a rubber duck — mid-note the brain switches gears and the mistake announces itself. When a book fills up, date the spine and shelve it. The prescription: use paper, not a file or a wiki, because "there's something special about the act of writing compared to typing" — and give it a month before judging.

## Tips worth remembering

- **Tip 25 — Keep Knowledge in Plain Text**
- **Tip 26 — Use the Power of Command Shells**
- **Tip 27 — Achieve Editor Fluency**
- **Tip 28 — Always Use Version Control**
- **Tip 29 — Fix the Problem, Not the Blame**
- **Tip 30 — Don't Panic**
- **Tip 31 — Failing Test Before Fixing Code**
- **Tip 32 — Read the Damn Error Message**
- **Tip 33 — "select" Isn't Broken**
- **Tip 34 — Don't Assume It—Prove It**
- **Tip 35 — Learn a Text Manipulation Language**

## My takeaways
*Fill this in as you re-read and apply the chapter.*
