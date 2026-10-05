---
title: "Tools"
book: legacy-code
chapter: 5
date: 2026-10-04
summary: "The legacy-code toolkit is small — a testing framework and ideally verified behavior-preserving refactoring tools — covering the mock object libraries, the xUnit harness family (JUnit, CppUnitLite, NUnit), and FIT/FitNesse for table-driven tests that specifiers can read."
tags: [tools, testing, automation, legacy-code]
---

> Editor, build system, testing framework — and refactoring tools where your language has them. That is the whole toolkit for legacy work, and the most effective pieces are free. Two cautions run through the chapter: a change is only a refactoring if behavior is preserved, and not every tool verifies that, so test your tools before trusting them; and expensive license-per-seat, UI-driven test tools usually disappoint, while the small free xUnit harnesses quietly became the standard.

## The big idea

What do you need to work with legacy code? Less than vendors suggest. The chapter is a 2004 snapshot — specific tool names, specific web sites — but its judgments age well because they are criteria rather than brand loyalty: a refactoring tool is only safe if it verifies behavior preservation; a unit-testing harness should let you write tests in your own language, run them in isolation, and group them into suites; a general harness is worth having when it narrows the gap between the people who specify software and the people who write it.

## Section by section

### 5.1 Automated Refactoring Tools

The lineage: Bill Opdyke's thesis work produced a C++ refactoring tool in the 1990s (never commercially available, but widely influential), and the Smalltalk refactoring browser by John Brant and Don Roberts supported a very large number of refactorings and stood as the state of the art for years. By 2004 many Java tools existed (mostly IDE-integrated), plus some for Delphi, newer C++ ones, and C# tools under development.

Quoting Fowler's definition: "A change made to the internal structure of software to make it easier to understand and cheaper to modify without changing its existing behavior." A change is a refactoring only if it doesn't change behavior — so tools should verify that, and many early ones treated it as a cardinal rule. At the fringes, some tools don't check, and unchecked refactoring can introduce subtle bugs. Choose with care: ask what the developers guarantee, and run your own sanity checks — does extract-method flag a name that already exists in the class? One in a base class? An undetected base-class collision means you can accidentally override a method and break code. The book assumes tool refactorings preserve behavior; if yours don't, don't use automated refactorings — the manual advice is safer.

#### Tests and Automated Refactoring

A tool that refactors safely tempts you to skip tests, and chaining one verified refactoring to another really is behavior-preserving. The counterexample: at least two Java tools would happily remove the `v` variable here —

```java
private int getValue() {
    alpha++;
    return 12;
}

public void doSomething() {
    int v = getValue();   // called once
    int total = 0;
    for (int n = 0; n < 10; n++) {
        total += v;
    }
}
// after the refactoring:
for (int n = 0; n < 10; n++) {
    total += getValue();  // called ten times: alpha now +10
}
```

The variable was removed; the side effect was multiplied. The rule: have tests around code before automated refactoring, and know what the tool checks and what it doesn't. When adopting a new tool, put its extract-method support through its paces first — if you can trust it, you can get code into a much more testable state without pre-existing tests. (What still holds: modern IDE refactorings are semantics-aware and this exact side-effect class is guarded, but trust is still earned per tool, and tests remain the backstop.)

### 5.2 Mock Objects

The dependency problem from Chapter 3 reappears at tool level: to execute code in isolation you break dependencies, but something must stand in the dependency's place and supply the right values so the code can be exercised thoroughly. In OO code those stand-ins are **mock objects**, and by 2004 several mock object libraries were freely available, with www.mockobjects.com as the reference hub. What they buy is exactly the sensing-and-separation payoff of Chapter 3 — isolation plus internal expectation checking. (What still holds: the practice is now universal and every mainstream language has mature mock libraries; the specific 2004 hub and libraries are historical.)

### 5.3 Unit-Testing Harnesses

A recurring pattern: teams buy expensive license-per-seat testing tools that never live up to the price, seduced by the promise of testing through the GUI or web interface without touching the application. It can be done, but it is more work than anyone admits — and UIs are volatile, too far from the functionality being tested, and produce failures that are hard to diagnose. The most effective testing tools are free.

The archetype is xUnit, originally Smalltalk (Kent Beck), ported to Java by Beck and Erich Gamma. Its key features:

- Programmers write tests in the language they are developing in.
- All tests run in isolation.
- Tests group into suites that run and rerun on demand.

The revolutionary thing is its simplicity and focus — and although designed for unit testing, xUnit doesn't care how large a test is.

#### 5.3.1 JUnit

Subclass `TestCase`; every `void testXXX()` method is a test. The runner loads the class, uses reflection to find the test methods, and — the sneaky part — creates a completely separate object for each one, so tests cannot affect each other. Fixtures come from `setUp`, run on each test object before its test method, with `tearDown` afterward:

```java
public class EmployeeTest extends TestCase {
    private Employee employee;

    protected void setUp() {
        employee = new Employee("Fred", 0, 10);
        employee.addTimeCard(new TimeCard(new TDate(10, 10, 2000), 40));
    }

    public void testNormalPay() {
        assertEquals(400, employee.getPay());
    }
}
```

Why not just construct in the constructor? Because the runner creates one object per test method — a large set of objects — and deferring allocation to `setUp` saves resources and lets setup failures be detected and reported. (What still holds: fresh fixture per test and lifecycle hooks survive intact in modern JUnit — annotations like `@BeforeEach` replaced reflection-by-naming.)

#### 5.3.2 CppUnitLite

Feathers wrote the original CppUnit port and kept it close to JUnit — then hit C++'s lack of reflection: tests had to be declared in a header, defined in a source file, and registered in a handwritten `suite()` function, which kills momentum. He started over with a `TEST` macro:

```cpp
TEST(testNormalPay, Employee)
{
    auto_ptr<Employee> employee(new Employee("Fred", 0, 10));
    LONGS_EQUAL(400, employee->getPay());
}
```

Behind the scenes the macro creates a subclass of a testing class named by pasting the two arguments, instantiates a static instance that registers itself on a static list at program load, and a runner later runs each test. He initially withheld the framework because the macro code wasn't clear; Mike Hill's independent TestKit (same registration scheme) emboldened him, and he stripped out late C++ features — daily emails arrived from people whose compilers lacked templates, the standard library, or exceptions — then released it. Both CppUnit and CppUnitLite are adequate; CppUnitLite tests are briefer, so the book uses it. (What still holds: this auto-registration pattern is exactly how GoogleTest, Catch2, and doctest work today.)

#### 5.3.3 NUnit

The .NET harness, close to JUnit in operation but marking test classes and methods with attributes (`<TestFixture()>`, `<Test()>` in VB.NET) instead of naming conventions. The book's VB.NET example is also a mock objects cameo — `MockDisplay` and `MockATMReader` standing in for hardware:

```vb
<TestFixture()> Public Class LogOnTest
    <Test()> Public Sub TestRunValid()
        Dim display As New MockDisplay()
        Dim reader As New MockATMReader()
        Dim logon As New LogOn(display, reader)
        logon.Run()
        AssertEquals("Please Enter Card", display.LastDisplayedText)
    End Sub
End Class
```

(What still holds: NUnit thrives, and attribute-marked tests became the convention across .NET and beyond.)

#### 5.3.4 Other xUnit Frameworks

Ports exist for most major languages and quite a few small, quirky ones, all supporting specification, grouping, and running of unit tests. In 2004 the de facto repository was the Downloads section of www.xprogramming.com, run by Ron Jeffries. (What still holds: the xUnit design persists everywhere; the port listing has long since moved into each language's own ecosystem.)

### 5.4 General Test Harnesses

xUnit frameworks were designed for unit testing; testing several classes at a time is the territory of FIT and Fitnesse.

#### 5.4.1 Framework for Integrated Tests (FIT)

Ward Cunningham's framework, concise and elegant. Write documents about your system with embedded tables of inputs and outputs, save them as HTML, and FIT runs the tables as tests: the output document looks the same, with cells colored green (passed) or red (failed), plus optional summaries. The work you supply is customizing table-handling code so tables can run chunks of your system and retrieve results — usually easy, since the framework supports several table types. The powerful part is communication: specifiers write documents embedding real tests, which run and fail; developers implement until they pass; both sides keep a common, up-to-date view of the system's capabilities. (What still holds: FIT itself is retired, but the idea — examples as executable specification with green/red documents — is standard in acceptance-test tooling.)

#### 5.4.2 Fitnesse

Essentially FIT hosted in a wiki, developed mostly by Robert Martin and Micah Martin. Hierarchical pages define FIT tests; pages run individually or in suites, with options that make team collaboration easy. Like everything else in the chapter, it is free and community-supported. (What still holds: FitNesse is still maintained and in use — the rare 2004 tool that survived.)

## Key terms

- **xUnit**: the minimal unit-testing framework design from Smalltalk/Java — tests in the development language, isolated execution, suite grouping; ported to nearly every language.
- **setUp / tearDown**: xUnit fixture lifecycle methods run before and after each test; combined with one-object-per-test, they give every test a fresh fixture.
- **TEST macro (auto-registration)**: CppUnitLite's substitute for reflection — a macro that defines a test class, instantiates a static instance, and self-registers it for the runner.
- **FIT (Framework for Integrated Tests)**: Cunningham's framework that executes HTML tables of inputs and outputs embedded in specification documents and colors the results green or red.
- **FitNesse**: a wiki front end for FIT — hierarchical test pages, runnable alone or in suites.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
