---
title: "Measuring Engineering Productivity"
book: swe-at-google
chapter: 7
date: 2026-10-01
summary: "Google's productivity research team: first triage whether a measurement is actionable, then pick metrics with the GSM framework across the QUANTS trade-off space, then validate."
tags: [teams, metrics]
---

> Measuring the human side of software engineering only pays off when a concrete decision hangs on the result. Google's approach: triage the question (will anyone act on either answer?), derive metrics from goals via the Goals/Signals/Metrics framework, cover all five QUANTS components of productivity so you don't optimize one at another's expense, and use qualitative data to validate the quantitative metrics.

## The big idea

Growing a business requires growing the engineering organization, but as organization size grows linearly, communication costs grow quadratically (Brooks). The escape hatch is making each engineer more productive — but the improvement cycle itself costs engineers, so productivity work must itself be *efficient*: improving productivity by the equivalent of 10 engineers per year isn't worth 50 engineers per year of investigation. Google's answer is a dedicated research team mixing software engineering researchers, generalist engineers, and social scientists (cognitive psychology, behavioral economics), because understanding productivity means understanding people — motivations, incentives, task management — not just artifacts.

The chapter's running example is Google's *readability* process: a long-running, expensive certification (hundreds of engineers doing readability reviews) from the era before autoformatters and submission-blocking linters. Some considered it an archaic hazing ritual; the C++ and Java language teams asked the research team one concrete question: is the time spent on readability worthwhile?

## Section by section

### 7.1 Why Should We Measure Engineering Productivity?

The scaling argument above: headcount brings quadratic communication overhead, so per-engineer productivity is the only way to scale business scope linearly with engineering size. The improvement loop — understand what makes engineers productive, identify inefficiencies, fix them, repeat — needs a specialist team, and the team itself must stay lean relative to the gains it produces.

### 7.2 Triage: Is It Even Worth Measuring?

Measurement is expensive (people to measure, analyze, disseminate), can slow the organization, and tracking itself can change engineer behavior in ways that mask the underlying issue. So before measuring, force the requester to state a concrete question and answer four checks:

- **What result are you expecting, and why?** Nobody is a neutral investigator; stating expectations up front exposes bias and prevents post hoc explanations. The readability team admitted uncertainty — costs once seemed justified, but autoformatters and static analysis changed the calculus.
- **If the data supports your expectation, what action will be taken?** No action, no point measuring. (Maintaining the status quo counts as an action if a change would otherwise happen.) Readability's answer: publish the data on the FAQ to set expectations.
- **If the result is negative, will appropriate action be taken?** This question kills *most* of the research team's projects — decision makers are curious but won't change course. Readability passed: the team committed to killing the process per language if costs outweighed benefits.
- **Who decides, and when?** The requester must be empowered to act, and the data's *form* must persuade them (stories from interviews, survey results, logs, statistics). Readability's deciders wanted self-reported data for happiness/learning but "hard numbers" from logs for velocity and quality — so both were needed. An internal conference gave a soft deadline.

Legitimate reasons to *not* measure: you can't afford the change right now; results will be invalidated soon (an upcoming reorg, technical-debt measurement on a deprecated system); the decider's beliefs can't be moved by evidence of the type you can produce; the result is just a vanity metric for a decision already made (the release-tool team would implement its feature even if the productivity gain proved minor); or the only available metrics are too imprecise and confounded (LOC) — imprecise metrics are uninterpretable because they get explained away either way. Success is not proving a hypothesis; it is giving a stakeholder the data they need to decide. If the stakeholder won't use the data, the project has already failed.

### 7.3 Selecting Meaningful Metrics with Goals and Signals

LOC won't do — Dijkstra's footnote is quoted: lines of code should be booked as "lines spent" on the wrong side of the ledger. Google instead uses the **Goals/Signals/Metrics (GSM)** framework:

- A **goal** is a desired end result, stated without reference to how it will be measured.
- A **signal** is how you would know the goal was achieved — what you *want* to measure, possibly unmeasurable.
- A **metric** is the measurable *proxy* for a signal — not ideal, but close enough.

GSM prevents three failure modes. The **streetlight effect** (measuring what's easy rather than what matters) is avoided by working goals-first. **Metrics creep and bias** are avoided because metrics are agreed in advance as traceable to goals, so stakeholders can't swap in flatter-reading metrics after the fact. And mapping goals → signals → metrics exposes coverage gaps — it's fine that some signals are unmeasurable, but now you know which ones. Traceability is the rule: every metric traces back to a signal and a goal.

**Goals.** Teams habitually forget trade-offs — a team focused on making review velocity fast might forget code quality entirely ("I can make your review velocity very fast: just remove code reviews entirely"). To force completeness, productivity is decomposed into five trade-off components, mnemonic **QUANTS**:

- **Quality of the code** — regression-preventing tests, architecture that mitigates risk.
- **Attention from engineers** — flow states, notification-driven distraction, context switching.
- **Intellectual complexity** — cognitive load, unnecessary complexity in the task.
- **Tempo and velocity** — how fast tasks are done and releases shipped.
- **Satisfaction** — happiness with tools and work, burnout.

For readability this produced goals in quality (better, more consistent code; culture of code health), intellectual complexity (learning the codebase and best practices, mentoring), tempo/velocity (faster task completion), and satisfaction — with *no* attention goal, which is fine.

**Signals.** Every goal needs at least one signal; goals can share signals, and there's no 1:1 mapping. Examples: granted engineers judge their code higher quality; engineers report learning; changes from granted engineers review faster.

**Metrics.** Because metrics are proxies, triangulate: review speed was measured with both surveys and logs — if they disagree, one is wrong and needs investigation; if they agree, confidence rises. Some signals get no metric: code quality has no good proxy (academic proxies fail), so rather than decide on a poor proxy, Google acknowledged it as unmeasurable quantitatively and only asked engineers to self-rate.

### 7.4 Using Data to Validate Metrics

Qualitative data checks whether metrics capture the intended signal. Example: a metric for *median build latency* meant to capture engineers' "typical experience." An experience-sampling study (interrupting engineers in context with a small survey) revealed that some "builds" had been started by automated tools the engineer wasn't blocked on — so the metric was adjusted to exclude them. When quantitative and qualitative metrics disagree, it has routinely turned out the quantitative metric was wrong. Quantitative data buys power and scale across the whole company; only qualitative data provides context and narrative — *why* someone used an antiquated tool or circumvented the standard process — and thus the next improvement steps. (The footnote defends "anecdata": researchers don't decide on anecdotes, but structured interviews explain what raw numbers cannot.)

For readability, three metric sources were combined: a survey right after completing the process (avoids recall bias, introduces recency and sampling bias), a large-scale quarterly survey for longitudinal items, and fine-grained logs metrics from developer tools. Footnote: never use these to evaluate individuals — metrics used for performance reviews get gamed and stop measuring anything; only aggregate effects are measurable.

### 7.5 Taking Action and Tracking Results

Research output is a list of recommendations, ideally "tool driven": don't tell engineers to change process or thinking — change the tools and incentives so the right behavior is built into daily habits; assume engineers will make good trade-offs given proper data and tools. The readability verdict: the process was worthwhile — granted engineers were satisfied, reported learning, and their changes were reviewed and submitted faster even accounting for needing fewer reviewers. Pain points identified by the study fed tooling and transparency improvements.

### 7.6 Conclusion

A centralized team of productivity specialists beats every team charting its own course: broad-based solutions, expert handling of hard-to-measure human factors, and awareness of unintended consequences — provided the team stays data driven and works to eliminate subjective bias.

### 7.7 TL;DRs

- Measure only when a decision — positive *or* negative — will change as a result.
- Use GSM: a good metric is a reasonable proxy for a signal, traceable to the goal.
- Cover all QUANTS components so velocity isn't bought with quality.
- Qualitative metrics are metrics too; when they disagree with quantitative ones, suspect the quantitative metric.
- Build recommendations into developer workflow and incentives — change sticks when it's a daily habit.

## Key terms

- **GSM (Goals/Signals/Metrics)**: framework that derives metrics from goals via signals, keeping every metric traceable to the goal it serves.
- **QUANTS**: Quality, Attention, Intellectual complexity, Tempo and velocity, Satisfaction — the five trade-off components of engineering productivity.
- **Streetlight effect**: using the metrics that are easy to obtain regardless of whether they measure what you need ("looking for your keys under the streetlight").
- **Experience sampling**: study design that interrupts engineers in the middle of a task to collect immediate, in-context self-reports.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
