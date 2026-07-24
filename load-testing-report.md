# Load Testing Executive Report — Connected Banking

| Field | Value |
|---|---|
| **System** | Payments / IMPS Transaction Processing |
| **Test Type** | Load & Stability Testing |
| **Tooling** | Apache JMeter, Grafana |
| **Environment** | Non-Production (Pre-Production / UAT Equivalent) |
| **Prepared By** | QA — Ghanendra Yadav |
| **Approved By** | Project Manager, *[Your Company Name]* |

> This report has been adapted for portfolio purposes. All company names, personal names of
> colleagues, and internal identifiers have been removed or replaced with generic role titles.
> Performance figures reflect the actual test execution and are retained as they demonstrate
> testing methodology and analysis quality, not confidential business data.
>
> See [`docs/business-flow.md`](./docs/business-flow.md) section 6 for how these results map
> (and don't map) onto the product's other flows, and
> [`docs/service-architecture.md`](./docs/service-architecture.md) for which services sit on
> this load path. See [`docs/README.md`](./docs/README.md) for the full documentation map.

---

## 1. Executive Summary

A comprehensive load and stability test was executed to validate the payment system's ability
to handle **sustained concurrent transaction load** under **constrained infrastructure
conditions**.

At the start of the test execution, the system successfully peaked at approximately **100 TPS**,
after which it stabilized at **~80.2 TPS** and maintained this throughput consistently for most
of the test duration. During this steady-state phase, the system processed transactions reliably
without observable performance degradation.

Overall, the system successfully processed **405,067 transactions** over an extended execution
window, demonstrating excellent response-time characteristics, a negligible error rate, and
stable CPU and memory utilization, as validated through Grafana monitoring.

No application-level bottlenecks were observed during sustained load. Performance remained
within acceptable limits throughout the steady-state period, and degradation was observed only
after the Redis queue reached its memory capacity — indicating an **infrastructure constraint**
rather than an application performance issue.

**Overall Assessment:**
- ✅ Performance Stable
- ⚠️ Infrastructure Capacity (Redis) Requires Optimization

---

## 2. Test Objectives

- Validate transaction throughput and latency under sustained load
- Measure response-time distribution using percentile analysis
- Observe infrastructure behaviour (CPU & Memory) under load
- Identify capacity thresholds and failure characteristics
- Provide a management-level readiness assessment

---

## 3. Test Scope

**In-Scope**
- Connected Banking transaction processing flow
- End-to-end API execution, including:
  - Transaction initiation
  - Validation
  - Ledger posting
  - Bank adapter invocation
  - Status polling
  - Final response handling

**Out-of-Scope**
- Downstream bank settlement processing
- Manual operational interventions
- UI dashboards

---

## 4. Test Data Volume

| Metric | Value |
|---|---|
| Total Test Duration | 1 hour 26 minutes |
| Total Transactions Executed | 4,05,067 (4.05 Lakh) |
| Average Throughput Achieved | 80.2 TPS |
| Peak Throughput | 80 TPS sustained (100 TPS at peak) |
| Error Rate | 0.001% |
| Successful Transactions | ≈ 4,05,063 |
| Failed Transactions | ≈ 4 |
| Success Rate | 99.99% |

---

## 5. System & Infrastructure Configuration

| Component | Configuration |
|---|---|
| Application Node | 1 Core (No Auto-Scaling) |
| Async Workers | 3 (Distributed system configuration) |
| Database | Managed relational DB — mid-tier instance class |
| Processing Model | 1 Central + 3 Shards |
| Load Tool | Apache JMeter |
| Monitoring | Grafana |

This configuration represents a **constrained but realistic baseline**, suitable for identifying
true capacity limits rather than masking them with over-provisioned infrastructure.

---

## 6. Test Execution Summary

- **Total Test Duration:** ~1 hour 26 minutes
- **Total Transactions Processed:** 405,067
- **Load Pattern:** Continuous sustained load
- **Concurrency:** 25 threads
- **Test Termination Reason:** Redis queue memory saturation

---

## 7. Transaction Performance Results (Steady-State)

### Response Time Percentiles

| Metric | Observed Value | Interpretation |
|---|---|---|
| P90 | 82 ms | 90% of transactions completed extremely fast |
| P95 | 319 ms | Strong performance consistency under load |
| P99 | 1,500 ms | Edge-case latency within acceptable bounds |
| Maximum (Pre-Crash) | ~1,900 ms | No abnormal spikes before degradation |
| Average | ~319 ms | Stable mean latency |
| Standard Deviation | ~1,029 ms | Expected variability under load |

### Error Rate

- **Error Rate:** 0.001%
- **Approximate Failed Transactions:** ~4 out of 405,067

### Interpretation (Management View)

- Over 99.999% of transactions succeeded
- Latency remained well within acceptable SLA ranges
- No systemic performance degradation observed during steady state

---

## 8. Infrastructure Utilization

**CPU Utilization**
- Average: ~43.6%
- Peak: ~75.9%
- Observation: CPU remained well below saturation, indicating no CPU bottleneck

**Memory Utilization**
- Average: ~25.3%
- Peak: ~33.5%
- Observation: Application memory usage was stable and controlled; no memory leak patterns
  observed at the application layer

> *Grafana CPU/memory utilization dashboards and JMeter summary report screenshots were
> captured as test evidence during execution. Omitted here as they contain internal
> infrastructure identifiers.*

---

## 9. Stability & Reliability Assessment

- Sustained processing of 4+ lakh transactions
- Stable CPU and memory utilization throughout the test
- No JVM crashes, thread starvation, or application hangs
- Performance degradation occurred only after Redis queue memory exhaustion

**Conclusion:** The application layer is stable, performant, and production-ready at the tested
load.

---

## 10. Failure Event Analysis (Redis Queue Memory)

**What Happened**
- Redis queue reached memory limits
- The queue backlog increased
- A small number of transactions experienced latency spikes
- The test was stopped to prevent cascading failures

**Key Insight:** This is a **capacity planning issue, not a software defect**.
- ❌ Not caused by application logic
- ❌ Not caused by database limitations
- ❌ Not caused by CPU or memory saturation at the app layer

---

## 11. Risk & Impact Assessment

| Area | Risk Level | Notes |
|---|---|---|
| Application Performance | Low | Excellent latency & success rate |
| System Stability | Low | Redis memory limit reached |
| Infrastructure Capacity | Medium | Redis memory limit reached |
| Scalability | Medium | Requires Redis tuning/scaling |

---

## 12. Recommendations

**Immediate (High Priority)**
- Increase Redis memory allocation
- Review Redis eviction policy and queue size limits
- Add Redis memory and queue depth alerts

**Short-Term**
- Re-run the load test after Redis tuning
- Validate a higher TPS ceiling
- Capture extended percentile metrics post-fix

**Long-Term**
- Enable horizontal scaling where applicable
- Define official capacity thresholds
- Include Redis capacity validation in the release readiness checklist

---

## 13. Conclusion & Sign-Off Recommendation

**Final Verdict:** ✅ PASS (with Infrastructure Recommendation)

- The system demonstrates excellent performance characteristics
- Latency percentiles meet expectations
- The error rate is negligible
- The identified issue is infrastructure-related and remediable

With Redis capacity optimization, the system is expected to handle higher transaction volumes
reliably.

---

## 14. Evidence & References

- JMeter Summary Report
- Percentile metrics (P90 / P95 / P99)
- Grafana CPU & Memory utilization dashboards
- Transaction count and error-rate validation

---

## 15. Cross-Functional Collaboration

This load testing execution was made possible through coordinated effort across multiple teams:

- **Backend Engineering** — supported performance optimizations, backend readiness, monitoring,
  and service configuration verification during test execution
- **DevOps** — managed deployment and monitoring setup, ensuring stable infrastructure
  availability throughout the test
- **Frontend Engineering** — supported UI-independent validation flows and test data preparation
- **QA (Ghanendra Yadav)** — executed the complete load and stress testing cycle, prepared test
  plans, analyzed results, and compiled the final performance report
- **Product Management** — provided sponsorship, prioritization, and time allocation to complete
  the testing cycle

**Executive Note (One-Line Summary):**
> "The payment system processed over 4 lakh transactions with sub-second latency for 95% of
> requests and an error rate of just 0.001%; performance is strong, and the only identified risk
> is Redis capacity, which is addressable."

---

## 16. Ledger & Balance Calculation Validation

As part of the load testing and stability validation exercise, a detailed verification of
**ledger balances and calculation accuracy** was performed in collaboration with the backend
engineering team.

### Validation Scope

- Merchant-level balance and available-balance consistency
- Verification across multiple merchant records
- Confirmation of no rounding or cent-level discrepancies
- Cross-check between database values and backend calculation logic

### Methodology

Multiple merchant ledger records were queried directly at the database level and compared
against `availableBalance` vs. `balance` for exact equality, with no partial, truncated, or
mismatched values expected even under high transaction volume.

**Illustrative example (dummy data, not actual production values):**

| Merchant ID | Available Balance | Balance | Match |
|---|---|---|---|
| `DEMO-MERCHANT-001` | 123456789.00 | 123456789.00 | ✅ |
| `DEMO-MERCHANT-002` | 98765432.00 | 98765432.00 | ✅ |
| `DEMO-MERCHANT-003` | 0.00 | 0.00 | ✅ |
| `DEMO-MERCHANT-004` | 55500000.00 | 55500000.00 | ✅ |

### Backend Team Confirmation

The backend engineering team independently validated the calculation logic and confirmed that
all calculations matched exactly, with **no cent-level mismatch** observed.

This provides secondary validation of:
- Ledger calculation correctness
- Precision handling (no cent-level loss or rounding issues)
- Alignment between backend logic and persisted database values

### Conclusion (Management View)

- Ledger and balance calculations are 100% accurate
- No cent-level mismatch observed across tested merchants
- No impact from sustained load on calculation correctness
- Backend and database validations are fully aligned

**Assessment:** ✅ PASS — Financial calculations are correct and production-safe
