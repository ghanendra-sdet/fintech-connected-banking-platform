# Sample Requirement Traceability Matrix — Connected Banking

> Worked example using dummy data. An RTM is referenced throughout this portfolio as a core QA
> artifact — this is what that artifact actually looks like, not just a claim that it exists.
> See [`docs/README.md`](./docs/README.md) for the full documentation map.

## What an RTM Is Actually For

A regression checklist (see [`regression-checklist.md`](./regression-checklist.md)) answers
"what do we test." An RTM answers a different, equally important question: **"does every
business requirement have test coverage, and is that coverage actually sufficient?"** The two
documents look similar but serve different purposes — a checklist is organized by test area; an
RTM is organized by *requirement*, which is what makes it the tool that actually catches a
requirement with **no** test coverage at all, not just a weakly-tested one.

## The Matrix

| Req ID | Requirement (from a sample sprint story) | Linked Test Case(s) | Automation Status | Coverage Status |
|---|---|---|---|---|
| REQ-1001 | A transaction attempted while an account is `WHITELIST_PENDING` is blocked, at the API layer, not only the UI | TC-008 | Manual | ⚠️ Partial — TC-008 doesn't specify whether the attempt goes through the UI or calls the transaction API directly; this is the exact ambiguity `BUG-CB-2031` fell into |
| REQ-1002 | The commercial slab fee applied is correct at both sides of every slab boundary | TC-019–021 | Manual | ✅ Covered — this is the exact requirement `BUG-CB-2058` violated |
| REQ-1003 | Mini Statement totals match the full Transactions view exactly, for the same date range | TC-028 | Manual | ✅ Covered — this is the exact requirement `BUG-CB-2073` violated |
| REQ-1004 | Consent revocation denies access immediately, with no cache-expiry or scheduled-sync delay | TC-033 | Manual | ⚠️ Partial — see below; the test doesn't define or measure the actual revocation-propagation latency |
| REQ-1005 | A Pending wallet recharge is visually and textually distinct from a Failed one | TC-050, TC-060 | Manual | ✅ Covered — this is the exact requirement `BUG-CB-2104` violated |
| REQ-1006 | Every mandatory field in the Admin activation SOP (Create Bank Rule, Add Commercial Rule) is explicitly negative-tested | TC-037–040 | Manual | ✅ Covered |
| REQ-1007 | Consent-revocation propagation latency holds (or doesn't get worse) under concurrent write load | — | — | ❌ **Gap — `load-testing-report.md` section 3 explicitly scopes consent management OUT of the real executed load test; see below** |

## What the Gaps Actually Caught

This is the part a checklist alone wouldn't surface, because a checklist only tells you about the
tests that already exist:

- **REQ-1004** looks "Covered" at first glance — `TC-033`'s expected result already states the
  correct requirement in plain language ("not after a cache expiry or next scheduled sync"). But
  the test case as written never defines *how long* "immediately" actually is, or specifies
  polling across a suspected staleness window rather than checking once. `BUG-CB-2089`'s real
  window was approximately 90 seconds — a test that checks access once, a couple of seconds after
  revocation, could pass today and still miss a regression that reintroduces a shorter-but-still-
  nonzero window (say, 10 seconds) later, because nothing in the test specifies the actual bound
  being verified. Raised as a new story (illustrative ID `CB-3301`): rewrite `TC-033` to poll at
  defined intervals (e.g., immediately, +10s, +30s, +60s, +90s, +120s) and assert zero access at
  every single point, not just "immediately."
- **REQ-1007** is a gap this RTM caught by reading [`load-testing-report.md`](./load-testing-report.md)'s
  own stated **Test Scope** section literally: consent management is explicitly listed as
  out-of-scope for the real executed load test. That's a reasonable scoping decision for *that*
  specific test's objectives — but it means the one place this repo has genuine, real evidence of
  behavior under sustained concurrent load says nothing about whether `BUG-CB-2089`'s cache-
  refresh-cycle mechanism gets *worse* under write pressure (a background refresh job falling
  further behind as overall system load increases is a very plausible way a 90-second window
  could become a 5-minute one). This is exactly the kind of gap that's invisible until you
  deliberately cross-reference what a real report says it covers against what a defect report
  says actually broke.

**The general pattern:** an RTM's value isn't the rows that say "Covered" — those just confirm
existing test design. Its value is specifically the rows that say "Gap" or "Partial," because
those are the requirements a test-case-first workflow (write tests, forget to check them against
the original requirement list, or against what a *different* real report explicitly didn't
cover) would never have surfaced on its own.
