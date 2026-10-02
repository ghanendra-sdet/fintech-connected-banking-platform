# Connected Banking — Documentation Map

> If you're approaching this repo the way a curious QA engineer, automation tester, or
> tech-enthusiast would — "what is this, how does it actually work, who's involved, what does it
> depend on, what's the difference between the business flow and the technical flow" — this page
> answers that directly, one question at a time.

| Your Question | Answer Lives In |
|---|---|
| **What is this, in plain terms?** | [`business-overview.md`](./business-overview.md) — the "start here" doc |
| **Who's involved? (Stakeholders)** | [`business-overview.md`](./business-overview.md) — Business, Bank, Merchant Admin, Finance, Treasury, Compliance, and more |
| **What does it depend on?** | [`shared-platform-services.md`](./shared-platform-services.md) (company-wide shared engines) + [`service-architecture.md`](./service-architecture.md) (this product's own ~29 services) |
| **How does it work, technically?** (Tech Flow) | [`architecture-and-flow.md`](./architecture-and-flow.md) — the real, detailed Admin activation flow, merchant Connect Flow, onboarding state machine — plus [`service-architecture.md`](./service-architecture.md) for the microservice-level view |
| **What does the business/merchant actually experience?** (Business Flow + User Flow) | [`business-flow.md`](./business-flow.md) — multi-account linking, transaction/reporting flow, consent management, and how the real load test maps onto these flows |
| **How do I (or a merchant) actually activate this, step by step?** | [`user-guide-activate-connected-banking.md`](./user-guide-activate-connected-banking.md) — the real, non-technical SOP walkthrough |
| **What screens/fields exist?** | [`feature-modules.md`](./feature-modules.md) |
| **Does the UI behave consistently everywhere?** | [`ui-consistency.md`](./ui-consistency.md) — including the Bank Widget vs. Ledger Widget distinction, the single highest UI-confusion risk in this product |
| **What's actually tested?** | [`../regression-checklist.md`](../regression-checklist.md) |
| **What's been automated?** | [`../automation/`](../automation) |
| **What real defects has this surfaced?** | [`../sample-defect-report.md`](../sample-defect-report.md) |
| **How does it perform under load?** | [`../load-testing-report.md`](../load-testing-report.md) — a real load testing executive report |
| **What's the tech stack, and which skill maps to which proof?** | [`tech-and-skills.md`](./tech-and-skills.md) — a skill-oriented index, not a product-flow doc |
| **Does every requirement actually have test coverage?** | [`../sample-rtm.md`](../sample-rtm.md) — including two deliberate coverage gaps |

## Reading Order (Recommended)

```
1. business-overview.md                        ← the "why" — what problem, who's involved
        │
        ▼
2. user-guide-activate-connected-banking.md     ← the real, step-by-step activation SOP
        │
        ▼
3. business-flow.md                             ← the "what happens" — multi-account, transactions, consent
        │
        ▼
4. feature-modules.md                           ← the "where" — concrete screens and fields
        │
        ▼
5. architecture-and-flow.md                     ← the "how" (system-level) — admin + merchant flow, state machines
        │
        ▼
6. service-architecture.md                      ← the "how" (service-level) — microservice decomposition
        │
        ▼
7. shared-platform-services.md                  ← the "what it shares" — company-wide dependencies
        │
        ▼
8. ui-consistency.md                            ← the "does it hold together" — cross-screen UI consistency
        │
        ▼
9. regression-checklist.md, automation/, sample-defect-report.md, load-testing-report.md
   ← the proof — coverage, automation, real findings, real performance numbers
        │
        ▼
10. tech-and-skills.md, sample-rtm.md
   ← the index — skill-to-proof mapping, requirement-to-test traceability (with real gaps)
```

## Business Flow vs. Tech Flow vs. User Flow — What's the Difference Here?

- **Business Flow** ([`business-flow.md`](./business-flow.md)) — the *why* and *what*: a business
  links a bank account, gets whitelisted, transacts, funds get reconciled. Written for anyone
  regardless of technical background.
- **User Flow** — the same ground as Business Flow but from the *actor's* point of view at each
  concrete step — what a merchant actually clicks through during the real Connect Flow. This is
  covered by [`user-guide-activate-connected-banking.md`](./user-guide-activate-connected-banking.md)
  specifically, since this product has an unusually detailed real-world activation SOP worth
  keeping as its own document rather than folding into `business-flow.md`.
- **Tech Flow** ([`architecture-and-flow.md`](./architecture-and-flow.md) +
  [`service-architecture.md`](./service-architecture.md)) — the *how*, internally: the Admin
  Activation Flow, the onboarding state machine, which service owns which responsibility.

If you only read one document to understand this product end-to-end, read
`business-overview.md` first, then `user-guide-activate-connected-banking.md` — the real SOP is
the fastest way to understand what actually happens, since it's grounded in an actual product
walkthrough rather than a reconstructed diagram.
