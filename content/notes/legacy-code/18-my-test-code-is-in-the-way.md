---
title: "My Test Code Is in the Way"
book: legacy-code
chapter: 18
date: 2026-10-04
summary: "Test code multiplies until it blurs into production code; naming conventions that line each class up with its test (and group fakes and testing subclasses) plus a deliberate test-location decision keep the navigation tax low and the suite an asset instead of an obstacle."
tags: [testing, naming, legacy-code]
---

> Starting out with unit tests, it is common to feel that the tests are in the way — browsing a project, you can no longer tell test code from production code, and the sheer volume of test code swamps you unless you establish conventions. The chapter sets two: **class naming conventions** that make each class, its test, its fakes, and its testing subclasses line up in an alphabetical listing, and a deliberate choice about **test location**, because every step between a class and its test is a tax on navigation — paid often enough, it stops people from writing tests at all.

## The big idea

The problem is ergonomic, not technical: test code is a growing second codebase that must not raise the cost of touching the first. Feathers judges both levers — naming and location — by one criterion, "ergonomics is important": how easy it is to navigate back and forth between your classes and your tests. The stakes are quiet but absolute in a book about legacy code. When moving between code and tests means walking up and down directory structures, "it is like paying a tax as you work. People will just stop writing tests, and the work will go slower." Conventions that remove friction are what keep the suite alive.

## Section by section

### 18.1 Class Naming Conventions

You will have at least one unit test class for each class you work on, so make the test class name a variation of the class name. The two most common conventions put Test as a prefix (`TestDBEngine`) or a suffix (`DBEngineTest`). It doesn't really matter which; Feathers prefers the suffix, because in an IDE that lists classes alphabetically each class lines up right next to its test class, which makes navigating among them easier.

Two other kinds of classes show up in testing, and each gets its own prefix. Fakes for collaborators of the classes in a package get a Fake prefix (`FakeTransaction`) — grouped together alphabetically but somewhat away from the main classes, which is convenient because fakes are often subclasses of classes in other directories. A **testing subclass** — a class you write just because you want to test a class, but which has some dependencies you want to separate out, the vehicle for Subclass and Override Method (Chapter 25) — gets a Testing prefix (`TestingCheckingAccount`), which groups all testing subclasses together. For a small accounting package, the directory listing reads:

```text
CheckingAccount
CheckingAccountTest
FakeAccountOwner
FakeTransaction
SavingsAccount
SavingsAccountTest
TestingCheckingAccount
TestingSavingsAccount
```

Each production class is next to its test class, the fakes group together, and the testing subclasses group together. None of this is dogma — the arrangement works in many cases, and there are lots of variations and reasons to vary it. The key thing to remember is that ergonomics is important: how easy it will be to navigate back and forth between your classes and your tests.

### 18.2 Test Location

The working assumption so far has been that testing code and production code live in the same directories — generally the easiest way to structure a project. The main consideration in deciding is deployment size. An application on a server you control might not have many constraints: if you can accept roughly twice the deployment space (binaries for production code and its tests), keeping code and tests together and deploying all of the binaries is easy enough. For a commercial product running on someone else's computer, deployment size can be a real problem, which pushes toward keeping testing code separate from production source — but consider whether that affects how you navigate your code.

Sometimes it makes no difference. In Java, a package can span two directories, so production classes under `source` and test classes under `test` are seen as being in the same package:

```text
source/com/orderprocessing/dailyorders/   (production classes)
test/com/orderprocessing/dailyorders/     (test classes — same package)
```

Some IDEs actually show classes from both directories in the same view, so you don't have to care where they are physically located.

In many other languages and environments, location does make a difference, and navigating up and down directory structures to go back and forth between your code and its tests "is like paying a tax as you work. People will just stop writing tests, and the work will go slower." An alternative that avoids the tax: keep production and test code in the same location but use scripts or build settings to remove the test code from the deployment — workable with good naming conventions for your classes. Above all, if you choose to separate test and production code, make sure it is for a good reason: quite often teams separate them for aesthetic reasons — they just can't stand the idea of putting their production code and tests together — and later the navigation in the project is painful. You can get used to having tests right next to your production source; after a period of working that way, it just feels normal.

## Key terms

- **Testing subclass**: a subclass written just because you want to test a class, separating out dependencies you don't want dragged into the harness — the Subclass and Override Method (Chapter 25) vehicle; named with a Testing prefix so testing subclasses group alphabetically.
- **Fake class**: a stand-in for a collaborator, named with a Fake prefix so fakes group together alphabetically, somewhat away from the main classes of the package.
- **Navigation tax**: Feathers' image for the cost of moving between production code and its tests when they live apart — paid on every change, and high enough that people eventually stop writing tests and the work goes slower.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
