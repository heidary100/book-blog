---
title: "Dependency-Breaking Techniques"
book: legacy-code
chapter: 25
date: 2026-10-04
summary: "A catalog of 24 behavior-preserving refactorings reformulated to be done without tests in place — each with motivation, steps, and sample code — for breaking parameter, constructor, static, global, and procedural dependencies just enough to get classes under test."
tags: [legacy-code, refactoring, seams, testing]
---

> Part III is the book's reference catalog: 24 techniques, one per dependency shape that blocks a test harness. Each is technically a refactoring — it preserves behavior — but unlike ordinary refactorings they are formulated to be performed *without* tests, in the service of putting tests in. Feathers is honest about the trade: follow the steps carefully and mistakes are unlikely, but not impossible; these are riskier than test-supported refactorings, and some will make a good design sense flinch. Work in small steps, apply Chapter 23's discipline (**Preserve Signatures**, **Lean on the Compiler**), and remember the goal — once tests are in place, better design can follow with confidence.

## The big idea

Every entry in the catalog has the same shape: prose naming the dependency situation it attacks, sample code in Java, C++, C, or Ruby, and numbered **Steps** rewritten so they can be executed safely with no test coverage — cut/copy/paste whole signatures rather than retyping them, and let the compiler find what you missed. A few entries are adapted from Fowler's *Refactoring* with different, test-free-safe steps. The organizing question is never "what is the best design?" but "what is the smallest seam I can insert?" Most techniques manufacture an **object seam** (subclass-and-override in one of its many costumes); the procedural fallbacks reach for **link seams**, the preprocessor, or redefinition of text.

Choosing a technique means identifying what kind of dependency is in the way:

- Parameters you can't fake → **Adapt Parameter**, **Primitivize Parameter**
- Object creation in constructors → **Parameterize Constructor**, **Extract and Override Factory Method** (Java/C#), **Extract and Override Getter** or **Supersede Instance Variable** (C++, where constructor virtual calls don't dispatch to overrides)
- Methods you can't run → **Expose Static Method**, **Break Out Method Object**, **Subclass and Override Method**, **Pull Up Feature**, **Push Down Dependency**
- Static methods and globals → **Extract and Override Call**, **Replace Global Reference with Getter**, **Introduce Instance Delegator**, **Introduce Static Setter**, **Encapsulate Global References**
- Need a narrower type → **Extract Interface**, **Extract Implementer**
- Procedural or dynamic languages → **Link Substitution**, **Replace Function with Function Pointer**, **Definition Completion**, **Template Redefinition**, **Text Redefinition**

None of these immediately improves the design; some deliberately leave it worse (public members that were private, setters that shouldn't exist). That is acceptable: they buy testability first, and test-supported refactorings clean up after.

## Section by section

### 25.1 Adapt Parameter

Wrap a hard-to-fake parameter in a new, narrow interface so the method depends on a small abstraction communicating responsibilities rather than a wide API type. Use it when Extract Interface is impossible — the parameter's class is low-level, implementation-specific, or a standard interface you can't modify (the book's example: `HttpServletRequest`, ~23 methods, and you can't extract from an interface you don't own) — or the parameter is simply difficult to fake. Then write a production implementer that delegates to the real API and a fake for tests.

```java
// before: public void populate(HttpServletRequest request)
public void populate(ParameterSource source) {
    String value = source.getParameterForName(pageStateName);
    ...
}
class ServletParameterSource implements ParameterSource { ... } // wraps the request
class FakeParameterSource     implements ParameterSource { ... } // one field, one method
```

This is one of the few techniques that violates **Preserve Signatures** — use extra care. It is risky when the simplified interface diverges too far from the original; bias toward changes you feel confident in, not the best structure. "Safety first." A side benefit: legacy codebases often have no abstraction layers — important code intermingled with API calls — and a narrow parameter interface starts one.

### 25.2 Break Out Method Object

Move a long method into a new class — a **method object** — whose constructor takes the original method's arguments (plus a reference to the original class if the method touches instance state); local variables become instance variables. Use it when the containing class is too hard to instantiate but the method is too large or instance-dependent for Expose Static Method. The new class is easy to instantiate, so tests come easier.

```cpp
class Renderer {
    PointRenderer *pointRenderer;   // was GDIBrush* — Extract Interface cut the tie
    vector<point>& renderingRoots; ColorMatrix& colors; ...
public:
    Renderer(PointRenderer*, vector<point>&, ColorMatrix&, ...);
    void draw();                    // body copied from GDIBrush::draw
};
void GDIBrush::draw(...) { Renderer r(this, renderingRoots, colors, selection); r.draw(); }
```

Mechanics: create the class and constructor preserving signatures, copy the body, Lean on the Compiler — each error reveals a member the method needs, so expose it (getters, public methods) until it compiles — then delegate from the original method and use Extract Interface to break the dependency on the original class. Variations: no instance state → no original reference; data-only → pass a data holder; the shown worst case needs the interface. Yes, private members become public — but that isn't the end state; once under test you can refactor toward delegation (does `PointRenderer` even need to be an interface?).

### 25.3 Definition Completion

C/C++ only: keep the class's declarations in its header, then supply alternate method *definitions* in the test source file — null bodies or sensing bodies — so tests link against them instead of the production definitions. It is the cheapest escape from a class whose dependency situation is otherwise hopeless. The obligations are heavy: the tests need a separate executable (definitions clash at link time), you now maintain two sets of definitions, and debuggers can get confused. Feathers recommends it only for the worst dependency situations, and only to break initial dependencies — bring the class under test quickly so the duplicates can be removed.

### 25.4 Encapsulate Global References

Move globals into a class, keep one global instance of that class, and route every reference through it — then parameterize or getter your way to injectable fakes. Testing code with global dependencies gives you three choices (make them act differently under test, link to different globals, or encapsulate); this is the third, and the only one that improves structure over time.

```cpp
class Frame { public: bool activebuffer[BUFFER_SIZE]; bool suspendedbuffer[BUFFER_SIZE]; };
Frame frameForAGG230;               // global instance of the new class
// comment out the old declarations, then Lean on the Compiler:
// prefix every unresolved reference -> frameForAGG230.activebuffer
```

Heuristics: if several globals are always used or modified near each other, they belong in the same class; name it for the methods that will eventually live on it (rename later); start with data or small methods and move substantial logic only once tests exist. The same move works for free functions (a C API used prolifically): build an interface class with a fake subclass and a production subclass whose methods merely delegate to the global functions — an explicit object seam instead of a link or preprocessing seam.

### 25.5 Expose Static Method

If a method uses no instance data or methods, extract its body into a public static method and test it without instantiating the class. The motivating case: the class is nearly impossible to construct, and the change you need doesn't justify the risk of moving the method to where it belongs (the book's `validate(Packet)` belongs on `Packet`, but move it after tests exist, not before). Preserve Signatures when extracting; derive the new name from a parameter (`validate` accepting a `Packet` → `validatePacket`). If the extracted body touches instance members, consider making them static too. Conceptually, the static area is a staging area for things that don't quite belong to the class — making a method static makes it noticeable until its real home is found. If misuse worries you, restrict visibility (package/protected, namespace in C++) and reach it through a testing subclass.

### 25.6 Extract and Override Call

Extract a single problematic call into a protected method on the current class and override it in a testing subclass — to prevent side effects or to sense the values passed. One of the most frequently used techniques in the book, and ideal against static methods and global variables. If many different calls hit the same global, use Replace Global Reference with Getter instead. With a refactoring tool it is just Extract Method; without one, copy the call's declaration, create a same-signature method, and replace the call with a call to the new method.

### 25.7 Extract and Override Factory Method

Move hard-coded object creation out of a constructor into a protected factory method, then subclass and override it to return fakes under test. Hard-coded initialization in constructors is among the hardest things to work around when getting a class into a harness. Language caveat: it doesn't exist in C++, which will not dispatch a virtual call in a constructor to a derived-class override — there, use Supersede Instance Variable or Extract and Override Getter.

### 25.8 Extract and Override Getter

Replace direct uses of an instance variable with a **lazy getter** — one that creates the object on first call if the reference is still null — then subclass and override the getter to return a fake. This is the C++-safe alternative to Extract and Override Factory Method: nothing virtual is called during construction because creation happens lazily afterward.

```cpp
TransactionManager *WorkflowEngine::getTransactionManager() const {
    if (tm == 0) { tm = new TransactionManager(reader, persister); }
    return tm;
}
class TestWorkflowEngine : public WorkflowEngine {
public:
    TransactionManager *getTransactionManager() { return &transactionManager; }
    FakeTransactionManager transactionManager;
};
```

Discipline: route *all* uses through the getter and null the reference in every constructor, or someone reads the variable before initialization. In non-garbage-collected languages, match the test fake's lifetime to how production deletes the real object. Feathers reaches for Extract and Override Call when one method is problematic, Extract and Override Getter when many problematic methods sit on the same object.

### 25.9 Extract Implementer

When the class's own name is the perfect interface name and you lack rename tooling, invert Extract Interface: copy the class declaration to a new name (Feathers uses a `Production` prefix), strip the original down to pure abstract methods (in C++, add a pure virtual destructor and define it), and make the copy inherit the now-interface. Instantiation sites found by the compiler get switched to the production class.

The real content of this entry is naming. The temptation is an `I` prefix; Feathers refuses unless it is already the convention — a codebase where half the types have `I` and half don't means every type name you type is a coin flip. Naming is design: good names reinforce understanding, poor names make life hellish for the programmers who follow you. Note the scope honestly: replacing one concrete creation with another doesn't improve the overall dependency picture — look at those creation sites for a factory. And when the class sits in an inheritance hierarchy (superclass protected methods, subclasses using its methods), Extract Implementer means interleaving `Production` classes up and down the hierarchy; there, Extract Interface with a fresh name is usually the more direct refactoring.

### 25.10 Extract Interface

Among the safest techniques in any language: create an empty interface, make the class implement it, change the dependency site to the interface type, and add one declaration per method the compiler complains about. Three ways to do it — automated tooling, incrementally by hand, or a copy/paste batch of several declarations at once (less safe, but often the only practical route when builds are very slow).

Don't extract the full public surface — only what the test needs; complete-coverage interfaces can be grown incrementally later, and extracting everything up front does far more work than getting the piece under test requires. The one genuine trap is non-virtual methods: in C++, putting a non-virtual method's signature on an interface makes it virtual, which silently changes dispatch for subclasses that shadow it (Java has no problem — all instance methods are virtual; C# is safe because adding an interface doesn't affect existing non-virtual calls). If the class has subclasses, add a new virtual method with a *new* name that delegates.

### 25.11 Introduce Instance Delegator

Give a static method an instance method that delegates to it, then route callers through an instance you can substitute — an object seam against **static cling**. The classic targets are utility classes, which exist mostly because finding the right abstraction was hard. A class with ten statics and a couple of one-line delegating instance methods looks odd, but it gets the seam in place; over time, as every call goes through the delegators, move the static bodies into the instance methods and delete the statics. The extra step is getting the instance to the call site — Parameterize Method or a similar technique, leaning on the compiler in statically typed languages.

### 25.12 Introduce Static Setter

Add a static setter to a singleton (or global holder) so tests can swap the instance: loosen the constructor from private to protected, subclass with a fake-serving override, and set it. Globals are "spooky action at a distance" — the most apparent hurdle to harnessing parts of a system — and singletons buy uniqueness in production at the price of uniqueness in tests too.

```cpp
void ExternalRouter::setTestingInstance(ExternalRouter *newInstance) {
    delete _instance;
    _instance = newInstance;
}
// tests: subclass ExternalRouter, override getDispatcher() to return a fake, set it
```

A global *factory* variant: make the factory delegate to a settable server object that produces the real instances. Feathers is candid about the cost — these patterns can uglify a system considerably, and the setter mutates state visible to *all* tests, so reset stateful globals in `setUp`/`tearDown` when a wrong-state carryover could mislead. The long-term direction is always the same: shrink global references (pass dependencies to a common superclass, for example) until the singleton can become a normal class.

### 25.13 Link Substitution

Procedural C has no compile-time substitution short of the preprocessor — so substitute at link time: build a replacement library exposing functions with the same signatures and adjust the build so tests link the fakes. For sensing, record calls into a global list and assert on order and content afterward. Best targets are pure data-sink libraries — you call in, rarely care about return values; graphics libraries are the book's example. Also possible in Java by classpath tricks (same class and method names, resolved first). Limits: C++ name mangling makes it impractical for classes; breaking up libraries for the build can be nontrivial; and the seams it yields aren't the kind you'd exploit to vary production behavior.

### 25.14 Parameterize Constructor

Externalize an object created inside a constructor: copy the constructor, add a parameter for the object, assign it, and make the old constructor delegate with the `new` expression — clients never know.

```java
public MailChecker(int checkPeriodSeconds) {
    this(new MailReceiver(), checkPeriodSeconds);   // old signature preserved
}
public MailChecker(MailReceiver receiver, int checkPeriodSeconds) {
    this.receiver = receiver; ...
}
```

Feathers uses this constantly because it is trivial and low-risk. The one downside: the new constructor opens the door to new production dependencies on the parameter's class. In languages with default arguments there is a one-step version (`AssemblyPoint(EquipmentDispatcher *dispatcher = new EquipmentDispatcher)`), but it forces the header to include the created class's header, giving up forward declarations — Feathers rarely uses it for that reason.

### 25.15 Parameterize Method

The same move one level down: a method that creates an object internally gets a copy with a parameter for that object, and the original becomes a forwarding call (`run()` → `run(new TestResult)`). Overloading keeps the original name intact, or name the new method after its parameter type (`runWithTestResult`) when overloading reads confusingly. Shares Parameterize Constructor's downside — the new type surfaces at the interface and clients can grow dependent on it — in which case Extract and Override Factory Method is the alternative.

### 25.16 Primitivize Parameter

When a class is too entangled to instantiate at all — Feathers describes a system whose domain classes transitively depended on nearly everything and were welded to a persistence framework — develop the new feature as a free function over a primitive representation of the data (durations as `unsigned int`s instead of `Event`s), then add a thin method on the class that builds the representation and delegates.

The book itemizes what this costs: it exposes the class's internal representation, pushes implementation into a free function, leaves the representation-builder untested, duplicates data, and prolongs the real work — breaking the domain/infrastructure dependencies that would actually change the situation. Use it only when your back is against the wall *and* you're confident you will bring the class under test later, at which point the free function folds back in as a real method. It is often a predecessor to **Sprout Class**: wrap the free function in a class (`GapFinder`) and you have a new, tested abstraction to build on.

### 25.17 Pull Up Feature

When a cluster of methods you need to test has no direct or indirect relationship to the dependencies blocking instantiation, copy the feature — and everything it uses — up into a new abstract superclass, leave the bad dependencies in the original class, and instantiate a testing subclass of the superclass. It beats applying Expose Static Method or Break Out Method Object repeatedly when the method uses non-static features of the class. Design cost: features spread across two classes whose relationship is weak (here, item updating vs. schedule calculations); the better factoring is delegation to a validator object, but that is a step for when tests exist. The superclass is made abstract deliberately — every concrete class in the codebase should be instantiated somewhere, so un-instantiated concretes don't read as dead code.

### 25.18 Push Down Dependency

The inverse move: make the current class abstract and push the problematic dependencies down into a named production subclass (the name should communicate the environment — `WindowsOffMarketTradeValidator`), then test through a second subclass that nulls the pushed-down methods (`virtual void showMessage() {}`). Use it when bad dependencies are too pervasive for Subclass and Override Method and repeated Extract Interface is too heavy — the book's example is MFC UI calls inside validation logic. Later, with tests in place, pull the logic back up and move toward delegating the UI calls to a class that holds the *only* UI dependencies.

### 25.19 Replace Function with Function Pointer

In C, rename the function (`db_store_production`), declare a function pointer with the original name and signature, and initialize the pointer at startup; tests re-point it at a fake or sensing body.

```c
// db.h
void db_store_production(struct receive_record *record, struct time_stamp t);
void (*db_store)(struct receive_record *record, struct time_stamp t);
// main.c:  db_store = db_store_production;
```

It happens entirely at compile time, so build impact is minimal — unlike Link Substitution, it also gives a seam you can exploit in production (vary the database the code talks to). Teams split on function pointers as horribly unsafe versus useful-with-care; Feathers leans to the latter. His real advice: if you're doing this in C, consider mixed C/C++ compilation and migrate slowly, taking the files you want seams in first.

### 25.20 Replace Global Reference with Getter

For a global or singleton access — and a static call like `Inventory.getInventory()` counts as a global, since the class itself is a global object holding state — add a protected getter that returns it, route every use in the class through the getter, and override it in a testing subclass to return a fake. Prefer it over Extract and Override Call when many calls hit the same global. Subclassing the singleton usually means loosening its constructor from private to protected first.

### 25.21 Subclass and Override Method

The core technique — many others in the catalog are variations on it: make a method overridable (`virtual` in C++, non-final in Java, explicitly overridable in .NET), loosen visibility if the language requires it (protected in Java/C#; C++ permits overriding private methods), and subclass in tests to null out what you don't care about or sense what you do. Production change is minimal — often just private → protected — and production code instantiates the real class while tests instantiate the testing subclass.

Feathers' mental image is the **paper view**: any snippet you could extract to a method is a translucent sheet laid over the code, able to hold different code when testing. But prefer overriding methods that already exist — extracting new ones without tests in place is itself a risk. Pick the smallest set of methods that achieves the separation or sensing you need, and be honest that nulling a method only makes sense if its behavior truly doesn't matter for what you're testing.

### 25.22 Supersede Instance Variable

C++ resolves virtual calls made in constructors to the base-class version — deliberately, since an override could touch derived members not yet initialized — so you cannot factory-method your way out of a constructor that both creates *and uses* a hard-to-fake object. Instead, add a `supersedeXXX` method that destroys the current instance and swaps in the new one; tests call it before exercising the object.

```cpp
void BlendingPen::supersedeParameter(Parameter *newParameter) {
    delete m_param;
    m_param = newParameter;
}
```

This is poor practice in general — setters that let clients radically change an object's behavior mean you need the object's history to understand any call — but when Parameterize Constructor is too awkward because of tangled constructor logic, it is the best choice. The uncommon word "supersede" is deliberate: grep for it to verify nobody uses the setter in production code.

### 25.23 Template Redefinition

In languages with generics plus type aliasing, parameterize the class on the type of the collaborator you need to replace, move method bodies into the header, suffix the name (`...Impl`), and `typedef` the original instantiation back to the original name — so no reference in the codebase changes.

```cpp
template<typename SOCKET> class AsyncReceptionPortImpl { SOCKET m_socket; ... };
typedef AsyncReceptionPortImpl<CSocket> AsyncReceptionPort;  // callers unchanged
// tests: AsyncReceptionPortImpl<FakeSocket> port;
```

The primary disadvantage: implementation moves from `.cpp` files to headers, increasing build dependencies — users recompile whenever the template changes. Feathers biases toward inheritance-based techniques in C++, and would only parameterize a non-template class on a made-up type as a last resort; the natural home is code that is *already* templatized, where you just re-parameterize the collaborator (Extract Interface doesn't fit templates well).

### 25.24 Text Redefinition

Interpreted languages let you redefine methods on the fly: in Ruby, reopen the class at the top of the test file and redefine just the offending method — the interpreter replaces the existing definition — then write tests below.

```ruby
require "Account"
class Account
  def report_deposit(value) end   # replaces the real definition
end
# tests start here
```

The catch: the redefinition persists until the program ends, so a forgotten redefinition from an earlier test file can silently mislead later tests. In C and C++, the same trick is done with the preprocessor — Feathers points at the preprocessing seam discussion in Chapter 4 rather than repeating it here.

## Key terms

- **Dependency-breaking technique**: a behavior-preserving refactoring reformulated to be performed without tests in place, in order to get tests in place. Unlike ordinary refactorings, they target seams and testability rather than design quality — many deliberately leave the design temporarily worse, to be cleaned up with test-supported refactorings afterward.
- **Method object**: a class created by Break Out Method Object that embodies the code of a single method; its constructor captures the method's arguments (and the original object, if needed), and local variables become instance variables.
- **Lazy getter**: a getter that creates the object it returns on first call (`if (thing == null) thing = new Thing();`), decoupling creation from construction and enabling Extract and Override Getter; the same idiom underlies the Singleton pattern.
- **Static cling**: Feathers' term for dependencies on static methods that are difficult to depend on in a test — the reason for Introduce Instance Delegator and the static-setter family.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
