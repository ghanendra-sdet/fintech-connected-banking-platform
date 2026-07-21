# Fintech Connected Banking Platform

## Project Overview
This repository showcases QA/SDET work on a sample **Digital Banking Platform** application. It is a portfolio project built with dummy/sample data only — no real client names, production data, or confidential information are included.

## My Role
QA Engineer / SDET — responsible for test planning, manual and automated test coverage, API testing, defect tracking, and test reporting for this project.

## Tech Stack & Tools Used
Selenium, Java, TestNG, Postman, JMeter, Git, JIRA

## Types of Testing Performed
- Functional Testing
- API Testing
- Regression Testing
- Smoke & Sanity Testing
- End-to-End (E2E) Automation
- Cross-Browser Testing
- Performance & Load Testing

## Key Achievements
- Designed and executed test cases covering core user flows
- Built automated regression suite reducing manual testing effort
- Logged and tracked defects through full bug lifecycle
- Produced test summary reports for each release cycle
- Executed a full-scale performance & load testing cycle validating sustained throughput of
  **~80.2 TPS** across **405,000+ transactions**, with a **0.001% error rate** — see
  [Performance & Load Testing](#-performance--load-testing) below

## 📈 Performance & Load Testing

A comprehensive load and stability test was executed against the Connected Banking transaction
processing flow to validate sustained concurrent throughput under a constrained, realistic
infrastructure baseline.

**Highlights:**

| Metric | Result |
|---|---|
| Total Transactions Processed | 405,067 |
| Test Duration | ~1 hr 26 min |
| Peak Throughput | ~100 TPS |
| Stable Throughput | ~80.2 TPS |
| Error Rate | 0.001% (≈4 failed transactions) |
| Success Rate | 99.99% |
| P90 / P95 / P99 Latency | 82 ms / 319 ms / 1,500 ms |

**Verdict:** ✅ Pass — application layer performant and production-ready, with one
infrastructure-level recommendation (Redis queue memory sizing).

Full report, methodology, infrastructure configuration, and ledger/balance calculation
validation available in [`test-reports/load-testing-report.md`](./test-reports/load-testing-report.md).

## Screenshots & Reports
Sample screenshots and test execution reports are available under [`test-reports/`](./test-reports) and [`bug-reports/`](./bug-reports).
