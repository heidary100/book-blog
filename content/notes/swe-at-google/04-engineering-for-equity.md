---
title: "Engineering for Equity"
book: swe-at-google
chapter: 4
date: 2026-10-01
summary: "Bias is the default: without diverse teams and deliberate design for the most vulnerable users, even talented engineers ship products that harm."
tags: [mindset, accessibility]
---

> When engineers don't focus on users unlike themselves — different races, genders, abilities, socioeconomic statuses — even the most talented teams inadvertently fail those users. Unconscious bias is the default state, and Google's own public failures (Google Photos classifying Black friends as "gorillas") show the cost. The way forward: representative teams, multicultural capacity, and designing with — not merely for — the most vulnerable users.

## The big idea

Software engineering, the chapter argues, carries a unique responsibility: engineers who serve billions hold the power to change society, yet most lack the perspective of underrepresented groups. All people carry **unconscious bias** — insidious precisely because we can't see it — and organizations inherit it in their workforce, product development, and user outreach. Google's engineering population is mostly male, mostly White or Asian, not representative of its users; the lack of representation means the company often lacks the diversity needed to understand how products affect vulnerable users. Google wrote this chapter candidly as a company still learning: it has had public failures protecting its most vulnerable users, and there is a growing power imbalance between those who make development decisions and the marginalized communities who must live with them.

The constructive turn of the chapter is that equity is an engineering discipline, not a values poster. It demands understanding your user demographics, building multicultural capacity, rejecting single-fix narratives, challenging established processes that produce invalid results, and measuring equity instead of assuming it. Speed is a real trade-off: "It's better to slow down than to release a product that might cause harm."

## Section by section

### 4.1 Bias Is the Default

- Failures are usually unintentional: nobody sets out to discriminate, but products that never considered underrepresented groups harm them anyway. Bias lives in data, design decisions, and target-market choices alike.
- Case study, *Google Misses the Mark on Racial Inclusion*: in 2015, Jacky Alciné flagged that Google Photos' image recognition classified his Black friends as "gorillas." Google's response was slow and incomplete (still inadequate as late as 2018). Three root causes: the training data didn't represent the population; Google and the tech industry broadly lack Black representation, shaping subjective design and dataset decisions; and the target market and tests didn't include these groups — so users found the failure, not Google.
- The pattern repeats elsewhere: autocomplete returning racist suggestions, ads manipulated into offensive ones, hate speech surviving on YouTube. The technology itself isn't to blame — it simply wasn't resilient enough to exclude discriminatory output, and the cost is user trust (including among the very applicants Google wants to hire). Fix one lever: make the engineering organization look like the populations it builds for.

### 4.2 Understanding the Need for Diversity

- Disrupt the notion that a CS degree plus experience makes you a complete engineer — the degree is a foundation, not the skill set, and inclusive engineering demands more. It's equally wrong to think only CS graduates can build products.
- Engineers must frame work within the complete ecosystem they influence: know the demographics of your users, focus on people unlike yourself, and especially on those who might use the product to cause harm. The hardest users to consider are the disenfranchised. Teams should be representative of existing and future users; where they aren't, individual engineers must learn to build for everyone.

### 4.3 Building Multicultural Capacity

- An exceptional engineer knows when *not* to build something: discernment means identifying and rejecting features that drive adverse outcomes — hard in a culture that rewards individualism and speed. Companies historically choose market dominance and shareholder value over slowing momentum, and they value individual excellence without enforcing accountability for product equity.
- AI raises the stakes: facial-recognition software keeps disadvantaging people of color because research and training data don't span skin tones. A 2016 study found over 117 million American adults in law-enforcement face-recognition databases — with racially skewed policing baked into their error rates. If inputs are biased, outputs can't be valid; sometimes the right engineering decision is to delay development until data is more complete. Google now provides statistical training for AI to catch intrinsically biased datasets.
- Multicultural education (race and gender studies, social context) is a responsibility of both the engineer and the employer — continuous, multidisciplinary professional development, not a one-person side project.

### 4.4 Making Diversity Actionable

- Everyone is accountable for the systemic discrimination the tech sector produces; deferring to "how do we fix hundreds of years of historical discrimination?" is a detour into philosophy that avoids focused action. Being part of the system means it's your problem to fix.
- Concretely: a hiring manager is accountable for balanced candidate slates, and — after hiring — for an equitable distribution of growth opportunities. Every lead has the means to augment equity on their team.

### 4.5 Reject Singular Approaches

- Equity problems are complex and multifactorial; reject any single-philosophy fix, even from people you admire. The industry's favorite singular narrative — fix the hiring pipeline — misses that progression and retention are systemically inequitable too: attrition among Black+ Google employees outpaces every other group.
- If you want more women on your team, don't just build a pipeline: check whether recruiters actually identify strong women candidates, whether the ecosystem supports retention and progression, and whether your team has the psychological safety and multicultural capacity to welcome them.

### 4.6 Challenge Established Processes

- A recurring product methodology — build for the majority use case first, treat everyone else as edge cases — is itself flawed: it gives already-advantaged users a head start and increases inequity. Inclusive design from the start makes products better for *all* users; designing for the user least like you is a best practice, backed by multilingual, multicultural UX research spanning countries, classes, abilities, and ages — focusing on the least represented use case first.
- Case in point: Google's global hiring requisition system. Recruiters asked for internal candidates' low performance ratings to be surfaced automatically for efficiency. One engineer's equity questions — are developmental assessments predictive of performance? free of individual bias? standardized across organizations? — triggered a real review. Finding: employees with a poor rating were just as likely to earn satisfactory or exemplary ratings after changing teams as people who never had one. Ratings measure the present, not the future, so surfacing them would have driven inequitable and invalid results. The analysis cost significant project time; the payoff was a fairer internal-mobility process.

### 4.7 Values Versus Outcomes

- Google's values (respect, commitment to diversity) are real and heavily funded — yet year after year it misses representative hiring. The failure point is not values or investment but *application at the implementation level*.
- Examples everywhere: wearables that don't work for women's bodies, video conferencing that fails on darker skin tones. Old habits persist because the users you get feedback from aren't representative of all the users you need.
- The mirror moment: "Build For Everyone" is a brand slogan, but you can't build for everyone without a representative workforce and community feedback at the center. Hence the chapter's pivotal reframe: **"Don't build for everyone. Build with everyone."** Put the most vulnerable communities at the center of design, not in the afterthought pile. Design for the user who will have the most difficulty using your product; don't trade equity for short-term velocity; and don't assume equity — measure it, partnering with diversity, equity, and inclusion experts where you lack expertise.

### 4.8 Stay Curious, Push Forward

- The path is long: move from merely building tools to understanding how products impact humanity — through education, influencing teams and managers, and comprehensive user research. Change is uncomfortable but achievable through collaboration and creativity.
- Focus first on users most impacted by bias and discrimination; practice continuous improvement and own your failures. The goal: push humanity forward without further disenfranchising the disadvantaged.

### 4.9 Conclusion

- Software and software organizations are team efforts, and a scaling organization's user base is everyone, worldwide. An engineering organization that wants to scale cannot ignore underrepresented groups — engineers from those groups both augment the organization and supply unique, necessary perspectives for software genuinely useful to the world.

### 4.10 TL;DRs

- Bias is the default.
- Diversity is necessary to design properly for a comprehensive user base.
- Inclusivity is critical not just to the hiring pipeline but to a genuinely supportive work environment.
- Product velocity must be weighed against real harm to some users — slowing down is the right call when a launch could hurt people.

## Key terms

- **Unconscious bias**: bias everyone carries that enforces existing stereotypes without awareness; harder to mitigate than intentional exclusion because you can't see it.
- **Multicultural capacity**: an engineer's (and organization's) ability to understand how products advantage or disadvantage different groups — built through continuous multidisciplinary education, not assumed.
- **"Build with everyone"**: the corrective to "build for everyone" — engage users across the spectrum of humanity and put the most vulnerable communities at the center of design.

## My takeaways

*Fill this in as you re-read and apply the chapter.*
