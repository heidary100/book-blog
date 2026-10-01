---
title: "Build Systems and Build Philosophy"
book: swe-at-google
chapter: 18
date: 2026-10-01
summary: "Restricting engineer power makes builds faster and correct: artifact-based systems (Blaze/Bazel) treat the build as a pure function from sources to outputs, unlocking parallelism, incremental reuse, and distributed builds."
tags: [build-systems, automation]
---

> All build systems turn source into executables, optimizing two properties: speed (one command, seconds) and correctness (same inputs, same result on any machine). The chapter's central lesson is counterintuitive: task-based systems (Ant, Maven, Gradle) give engineers too much power — arbitrary scripts the system can't understand, parallelize, or cache — while artifact-based systems (Blaze, Bazel, Pants, Buck) declare *what* to build and leave the *how* to the system. That reframing of the build as a mathematical function from sources to binaries is what enables incremental builds, remote caching, and truly distributed builds — and, at the dependency level, strict transitive dependencies, the One-Version Rule, and explicit manual versioning.

## The big idea

Engineers famously *love* Google's build system (83% satisfaction in an internal survey, fourth of 19 tools) — Blaze has been reimplemented by ex-Googlers (Buck, Pants) and was open sourced as Bazel in 2015. The reason is trust: incremental builds just work, and nobody needs `clean`. That trust is bought by *removing* flexibility, the same "limits improve productivity" lesson as One Version and style guides. The chapter traces an evolution: raw compiler invocations fail on multi-language dependency webs; shell scripts fail on staleness, machine differences, and onboarding; task-based buildfiles are principled but fundamentally opaque to the system. Artifact-based buildfiles are a declarative manifest — the build becomes "effectively a mathematical function that takes source files and tools as inputs and produces binaries as outputs" — so the system can safely parallelize, reuse outputs, and distribute work across a datacenter. Google's build runs millions of builds and test cases daily, producing petabytes of output from two billion lines.

The dependency half of the chapter applies the same philosophy to *declaring* the function's inputs: fine-grained modules (the 1:1:1 rule), minimal visibility, strict transitive dependencies, and external dependencies pinned by manually managed versions under source control — because every point of implicitness or choice (transitive pulls, "1.+" version ranges, multiple versions of one library) resurfaces later as diamond dependencies and unreproducible builds.

## Section by section

### 18.1 Purpose of a Build System

Transform source into machine-readable binaries, optimizing **speed** (single command, often seconds) and **correctness** (same inputs → same result for any developer on any machine). Older systems trade one for the other via shortcuts; Bazel's objective is refusing the trade-off. Builds also serve machines: the majority of Google builds are triggered automatically — CI testing on review and pre-merge, low-level library authors testing across millions of tests and binaries, and LSCs touching tens of thousands of files — all workflows that exist only because the build system is reliable and automated.

### 18.2 What Happens Without a Build System?

#### But All I Need Is a Compiler!

`javac *.java` works while everything is in one directory. It breaks the moment code is spread across the filesystem, imported libraries live elsewhere, or multiple languages form a web of dependencies — building becomes a multi-step, order-sensitive process repeated after every dependency change. External dependencies degrade to "download a JAR into a lib folder and forget where it came from."

#### Shell Scripts to the Rescue?

The escalation story: build scripts become as time-consuming as real code and painful to debug; rebuild-everything-every-time is slow, rebuild-detection logic is error-prone; releases need yet another script; a crashed hard drive exposes everything that *wasn't* in version control (downloaded libraries, tool locations, forgotten environment variables); each new hire repeats the bootstrapping and "works on my machine" debugging; a cron-driven nightly build fails constantly on tiny environment mismatches; builds slow until you gaze "mournfully at the idle desktop" of a vacationing coworker. Conclusion: a compiler suffices for one developer and a couple hundred lines for a week; scripts buy a little more; coordinating multiple developers and machines requires a real build system.

### 18.3 Modern Build Systems

General-purpose systems aren't fundamentally different from DIY scripts — same compilers underneath — but they're robust after years of development. The recurring theme in all the failures: managing your own code is easy; **managing dependencies is the hard part** (task dependencies, artifact dependencies, internal, external — "I need that before I can have this").

#### Task-Based Build Systems

The unit of work is the *task*: a script executing arbitrary logic, with tasks declaring task dependencies (Ant, Maven, Gradle, Grunt, Rake). Buildfiles describe the build; the Ant example (`<target name="dist" depends="compile">`, invoking `javac` and `jar`) executes exactly like an equivalent shell script but gains modularity — buildfiles link across directories, tasks compose, and the tool walks the dependency graph. A taste of the XML:

```xml
<target name="compile" depends="init" description="compile the source">
  <javac srcdir="${src}" destdir="${build}"/>
</target>
```

Maven/Gradle added automatic external-dependency management and non-XML syntax, but the model is unchanged: engineers write build scripts "in a principled and modular way."

**The dark side**: task-based systems give *too much power to engineers and not enough to the system*. Since the system can't know what scripts do, it must schedule conservatively and can't verify correctness.

- **Parallelizing**: A depends on B and C — may they run together? Only if they touch disjoint resources, which the system can't know. Risk rare-but-brutal conflicts or run single-threaded; either way, distributing the build is off the table.
- **Incremental builds**: whether a task needs rerunning is undecidable in general (it might download a file or write a timestamp). Systems that let engineers declare rerun conditions hit subtleties like C++ `#include` closure — shortcuts cause stale results, and users habituate to `clean` builds, defeating incrementality. "Figuring out when a task needs to be rerun is a job better handled by machines than humans."
- **Maintenance/debugging**: build scripts are code that receives less scrutiny. Canonical bugs: an owner changes B's output location and breaks dependent A; B drops its dependency on C and breaks A (which used C through B); machine assumptions (tool paths, env vars) break on other machines; nondeterministic tasks (timestamps, downloads) make failures unreproducible; two dependencies writing one file create race conditions. No fix exists *within* the task model — the resolution is reconceiving the system's role "not as running tasks, but as producing artifacts."

#### Artifact-Based Build Systems

Engineers declare *what* to build; the system owns *how*. Blaze/Bazel buildfiles are declarative manifests, not imperative scripts:

```python
java_binary(
    name = "MyBinary",
    srcs = ["MyBinary.java"],
    deps = [":mylib"],
)

java_library(
    name = "mylib",
    srcs = ["MyLibrary.java", "MyHelper.java"],
    visibility = ["//java/com/example/myproduct:__subpackages__"],
    deps = [
        "//java/com/example/common",
        "//java/com/example/myproduct/otherlib",
        "@com_google_common_guava_guava//jar",
    ],
)
```

Targets (binaries, libraries) have `name`, `srcs`, and `deps` — same-package (`:mylib`), cross-package (`//java/...`), or external (`@...//jar`) — rooted in a workspace marked by a `WORKSPACE` file. `bazel build :MyBinary` parses all BUILD files, computes transitive dependencies, builds them bottom-up, then links. The difference from Ant is the guarantees: because every target is known to be produced by a Java compiler (not arbitrary script), steps can run in parallel (an order-of-magnitude win on multicore machines); and a second `bazel build` exits in under a second "up to date," because outputs depend only on declared inputs — change `MyBinary.java` and `mylib` is reused; change a file in `//java/com/example/common` and only that library, `mylib`, and `MyBinary` rebuild.

**A functional perspective**: task-based : imperative :: artifact-based : functional. Like Haskell, the programmer describes the computation and the runtime decides when/how — which buys trivial parallelism and strong correctness guarantees. A build is precisely "transforming one piece of data into another using a series of rules," so functional structure fits naturally.

**Other nifty Bazel tricks**:

- **Tools as dependencies**: every `java_library` implicitly depends on a Java compiler, downloaded to a known location if absent, with any compiler change invalidating dependent artifacts — builds bootstrap on any machine. Platform differences are handled by *toolchains*: targets depend on toolchain types, and the workspace picks the concrete toolchain per host/target platform.
- **Extending the build**: custom *rules* declare required inputs, a fixed set of outputs, and the *actions* that produce them. Actions are the lowest composable unit — they may do anything so long as they touch only declared inputs/outputs, and Bazel schedules and caches them. Abuse is still possible but pushed down to a rare, centralized place (rules live in one spot; most engineers never see them).
- **Isolating the environment**: sandboxing (e.g., LXC on Linux, Docker's technology) gives each action a filesystem view restricted to its declared inputs and outputs; undeclared writes are discarded, network access is blocked — conflicts become impossible rather than unlikely.
- **Making external dependencies deterministic**: remote files change without notice, breaking reproducibility and opening supply-chain attacks. Bazel requires a workspace-wide manifest of cryptographic hashes for every external dependency; a mismatch fails the build until an approved, checked-in manifest update lands — so there's always a record of dependency updates, and old checkouts build with old dependencies. And mirror everything you depend onto servers you control (see also 18.6).

### 18.4 Distributed Builds

With two billion lines and binaries depending on tens of thousands of targets, single machines hit physics; only spreading work across machines scales — "complete any build of any size as quickly as we're willing to pay for."

- **Remote caching**: every build system (workstations and CI) shares a cache service (Redis-like, or cloud storage). Check the cache first; download or build-and-upload. Caching demands *complete reproducibility* — hence artifacts are keyed by target plus a hash of inputs, so concurrent modifications by different engineers coexist. Caveat: it only helps if download beats rebuild — measure network latency and experiment.
- **Remote execution**: a central build master splits requests into actions and schedules them across a scalable worker pool; workers read inputs from and write outputs to the distributed cache, with the master blocking until dependencies finish. This requires *everything* from 18.3: self-describing environments (spin up workers unattended), self-contained build steps, deterministic outputs. On a task-based system, "nigh-impossible."
- **Distributed builds at Google**: since 2008 — **ObjFS** (remote cache: build outputs in Bigtables across the fleet, exposed per-workstation by a FUSE daemon, `objfsd`, that downloads content on demand; twice as fast as local-disk storage) and **Forge** (remote execution: Blaze's Distributor sends actions to a Scheduler that serves cached results or queues them for a pool of Executors writing results back into ObjFS).

### 18.5 Time, Scale, Trade-Offs

The ladder of investment: DIY scripts suit the smallest projects (or languages with built-in builds like Go); task-based systems buy automation and cross-machine reproducibility at the cost of build-file overhead — worth it for most projects; artifact-based systems unlock distributed scale and guaranteed reproducibility at the cost of flexibility — migration from an existing task-based setup is expensive and only worth it once speed or correctness actually hurts. Because build-system changes grow more expensive with project size, Google's advice: start every new project on an artifact-based system (at Google, everything from experiments to Search uses Blaze).

### 18.6 Dealing with Modules and Dependencies

#### Using Fine-Grained Modules and the 1:1:1 Rule

One module for everything → zero BUILD-file maintenance, but no parallelism, caching, or distribution. One module per file → maximal build flexibility, maximal dependency-listing toil. Google lands fine-grained: a typical production binary depends on tens of thousands of targets; for strongly-packaged languages like Java, one directory = one package = one target = one BUILD file (Pants' "1:1:1 rule"). Fine granularity pays off most once testing enters: only the tests that *could* be affected by a change need to run. Automatic BUILD-file tooling mitigates the maintenance downside.

#### Minimizing Module Visibility

Visibility is the inverse of dependency: B must be visible to A for A to depend on B. Options are public, private (same BUILD file), or an explicit allowlist. Minimize it, as in programming languages: public only for widely shared libraries; coordination-required teams whitelist customers; internal targets restricted to owned directories; most BUILD files contain exactly one non-private target.

#### Managing Dependencies

**Internal dependencies** are built from source at the same commit — no version notion. The transitive-dependency question: A depends on B, B on C — may A use C's symbols? The tools allow it; the consequences don't. When B refactors away its dependency on C, A breaks — B's dependencies became an immutable public contract, dependencies accumulated, and builds slowed. Google's fix, **strict transitive dependency mode**, fails any use of an undeclared symbol (offering a shell command to insert the dependency automatically). Rolling it out across millions of targets was a multiyear LSC, worth it: fewer unnecessary dependencies means faster builds, and engineers can *remove* dependencies safely. Cost: more verbose BUILD files, later reduced by auto-adding tooling. The asymmetry is the lesson: explicit declaration is a one-time cost; implicit transitive dependencies cause ongoing problems. Bazel enforces this for Java by default.

**External dependencies** are prebuilt artifacts with versions independent of your source.

- **Automatic vs. manual version management**: ranges like Gradle's "1.+" are convenient but uncontrolled — a remote breaking update (semver claims notwithstanding) breaks your build with no way to detect or roll back; subtle behavioral changes are worse. Manual versions live in source control: discoverable, revertible, and old checkouts rebuild with old dependencies. Bazel requires manual.
- **The One-Version Rule**: multiple versions of one library under different names reintroduce choice, and the diamond dependency kills you — A depends on B and on lib v1; B adds lib v2; A now transitively holds both. Under One Version, any new dependency lands on the same version everyone already has.
- **Transitive external dependencies**: Maven-style recursive download violates One Version by construction (two libraries pulling different versions of the same dep — "there's no telling which one you'll get"), and an update can cause distant, unrelated failures. Bazel refuses: one global file lists every external dependency and the explicit version used repository-wide, with tools to generate the initial file from Maven artifacts.
- **Caching build results using external dependencies**: publishing your own code as prebuilt artifacts to speed builds adds upload/ownership/version-skew overhead and destroys the consistent-source-tree view needed for debugging. Remote caching (18.4) provides the same speed with full consistency.
- **Security and reliability**: third-party artifacts are an availability risk (repository down → builds halt) and a supply-chain risk (compromised server → arbitrary code in your build). Mitigations: mirror everything onto infrastructure you control and block direct repository access; require checked-in hashes so tampering fails the build; or **vendor** dependencies into source control, converting externals to internals — Google checks every third-party library into `third_party/`, viable only because its custom VCS handles a monorepo that size.

### 18.7 Conclusion

The build system is among the most important parts of an engineering organization — developers touch it dozens of times a day and it can be the rate-limiter of productivity. The surprising lesson: *limiting* engineers' power improves their productivity, and they don't resent it — the system mostly works on its own, and "being able to trust the build is powerful." Artifact-based framing scales up to datacenter distribution and scales down: even small projects gain speed and correctness from Bazel. On dependencies: fine-grained modules, the One-Version Rule, and explicit manual versioning avoid diamond dependencies and make a two-billion-line single repository buildable with one system.

### 18.8 TL;DRs

- A fully featured build system is necessary to keep developers productive as an organization scales.
- Power and flexibility come at a cost; restricting the build system appropriately makes life easier for developers.
- Artifact-based systems scale better and are more reliable than task-based ones.
- Prefer fine-grained modules — they exploit parallelism and incremental builds.
- External dependencies should be explicitly versioned under source control; relying on "latest" versions is a recipe for disaster and unreproducible builds.

## Key terms

- **Task-based build system**: a build organized around *tasks* — arbitrary user scripts with declared task dependencies (Ant, Maven, Gradle); opaque to the system, so hard to parallelize, cache, or verify.
- **Artifact-based build system**: a build organized around *artifacts* — declarative manifests of targets, dependencies, and options, with the system owning execution (Blaze, Bazel, Pants, Buck).
- **Target**: the unit of declaration in a BUILD file (`java_library`, `java_binary`, …); produces one artifact, with `name`, `srcs`, and `deps`.
- **Workspace**: a source hierarchy rooted at a `WORKSPACE` file, defining the boundary of a Bazel build and its external dependencies.
- **Toolchain**: the set of tools and settings for building a type of target on a particular platform; targets depend on toolchain *types* for platform independence.
- **Sandboxing**: per-action filesystem isolation (LXC-style) restricting each action to its declared inputs and outputs, making inter-action conflicts impossible.
- **Remote caching / remote execution**: sharing build outputs via a common cache keyed by target+input hash; delegating actual action execution to a scalable worker pool (ObjFS and Forge at Google).
- **Strict transitive dependency mode**: failing the build when a target uses symbols from a library it doesn't directly depend on — making dependencies explicit and safely removable.
- **1:1:1 rule**: one directory = one package = one target = one BUILD file; the fine-grained module default.
- **Diamond dependency**: A → B and A → lib v1, plus B → lib v2, leaving A holding two versions of the same library; the failure mode the One-Version Rule exists to prevent.
- **Vendoring**: checking external dependencies into your own source control, converting external dependencies into internal ones.

## My takeaways
*Fill this in as you re-read and apply the chapter.*
