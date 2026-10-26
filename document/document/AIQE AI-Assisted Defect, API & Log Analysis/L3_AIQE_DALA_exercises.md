# L3_AIQE_DALA — Assessed Exercises

## Unit 1 assessed exercise — Triage-ready duplicate-charge report

**Exercise ID:** `EX-U1-DEFECT`  
**Mode:** Individual draft with peer review  
**Learner timebox:** 150 minutes  
**Assessment value:** 10 course points

### Instructions

1. Review the approved business rules, observation, HTTP evidence, logs, and provider events.
2. Establish the expected behavior using evidence IDs; do not use “common sense” as the only oracle.
3. Create a reproduction flow and identify which preconditions were confirmed, assumed, or not supplied.
4. Write a defect report with title, summary, environment, steps, expected result, actual result, frequency, impact, evidence, and open questions.
5. Propose severity with rationale and list the missing business inputs required to set priority.
6. Ask AI to critique completeness and clarity using only the supplied pack. Review every suggestion and preserve a decision log.
7. Perform a privacy and secret scan before submission.

### Scoring rubric

| Criterion | Points | Full-credit evidence |
|---|---:|---|
| Oracle and factual accuracy | 2.0 | Expected behavior and observed facts cite approved evidence; no invented behavior |
| Reproducibility and environment | 2.0 | Steps, data, build, state, and variability are investigation-ready |
| Expected/actual clarity | 2.0 | The difference and impact are precise and directly comparable |
| Evidence quality and safety | 1.5 | Evidence is indexed, sufficient, readable, and safely redacted |
| Severity and triage usefulness | 1.5 | Impact dimensions are justified and priority inputs remain explicit |
| AI review discipline | 1.0 | Accepted, edited, and rejected suggestions are auditable |

**Critical cap:** Fabricating a reproduction, expected result, log event, or customer impact caps the exercise at 5/10.

---

## Unit 2 assessed exercise — Hypothesis matrix and falsification plan

**Exercise ID:** `EX-U2-RCA`  
**Mode:** Pairs with individual defense  
**Learner timebox:** 180 minutes  
**Assessment value:** 10 course points

### Required hypothesis matrix

| Hypothesis ID | Proposed mechanism | Supporting evidence | Contradicting evidence | Missing evidence | Confidence | Discriminating check | Expected result if true |
|---|---|---|---|---|---|---|---|

### Minimum completion standard

- A UTC-normalized timeline includes both client attempts, gateway responses, payment events, and state changes.
- At least six non-duplicate hypotheses cover three or more system layers.
- Each hypothesis includes a check that could weaken or rule it out.
- At least one plausible hypothesis is downgraded after contradictory evidence.
- The final note separates immediate trigger, possible mechanism, contributing control gap, and confirmed facts.

### Scoring rubric

| Criterion | Points | Full-credit evidence |
|---|---:|---|
| Timeline and evidence classification | 2.0 | Events are normalized, ordered, sourced, and confidence-labeled |
| Hypothesis breadth and quality | 2.0 | Alternatives are causal, distinct, scoped, and testable |
| Contradiction and bias control | 2.0 | Analysis actively searches for disconfirming evidence |
| Discriminating investigation plan | 2.0 | Checks maximize information gain and have predicted outcomes |
| Provisional conclusion | 1.0 | Language stays within evidence boundaries |
| AI provenance and human judgment | 1.0 | AI suggestions and reviewer dispositions are recorded |

**Critical cap:** Reporting an AI-generated hypothesis as a confirmed root cause without validating evidence caps the exercise at 5/10.

---

## Unit 3 assessed exercise — Cross-service transaction reconstruction

**Exercise ID:** `EX-U3-LOGS`  
**Mode:** Individual analysis  
**Learner timebox:** 180 minutes  
**Assessment value:** 10 course points

### Required anomaly table

| Finding ID | Pattern/anomaly | Baseline or invariant | Evidence/query | Scope/count | Interpretation | Confidence | Next check |
|---|---|---|---|---:|---|---|---|

### Minimum completion standard

- Parse at least 95% of valid supplied records and report malformed/rejected lines separately.
- Normalize all parseable timestamps to UTC without losing original values.
- Reconstruct the first and retry paths across gateway, order, payment, and provider evidence.
- Identify at least four meaningful anomalies, including an identifier-propagation issue and a state/timing issue.
- Identify the planted sensitive-value pattern and explain safe handling.
- Verify AI-proposed counts, conversions, and correlations with a deterministic query or script.

### Scoring rubric

| Criterion | Points | Full-credit evidence |
|---|---:|---|
| Parsing and source reliability | 1.5 | Rules, rejected lines, limitations, and source quality are visible |
| Timestamp normalization | 2.0 | Time conversion and intervals are accurate and reproducible |
| Correlation reconstruction | 2.5 | The transaction path crosses all relevant services and retry branches |
| Pattern and anomaly analysis | 2.0 | Findings use explicit baselines and avoid causal overclaiming |
| Privacy and observability gaps | 1.0 | Leakage and missing telemetry are handled safely and usefully |
| AI validation and provenance | 1.0 | AI assistance is reviewed and deterministic checks are attached |

**Critical cap:** Exposing credentials, tokens, real personal data, or payment secrets in the submission or AI prompt results in a critical failure until remediated and investigated.

---

## Unit 4 assessed exercise — Contract-driven order API foundation

**Exercise ID:** `EX-U4-API-FOUNDATION`  
**Mode:** Individual implementation or executable specification  
**Learner timebox:** 210 minutes  
**Assessment value:** 10 course points

### Required assertion matrix

| Test ID | Source IDs | Request condition | Expected status | Header checks | Schema checks | Semantic/side-effect checks | Cleanup |
|---|---|---|---:|---|---|---|---|

### Minimum completion standard

- Cover a successful create and retrieval flow with linked correlation evidence.
- Cover missing/invalid authentication and customer-identity mismatch separately.
- Cover at least four request-validation failures, each isolating one violated constraint.
- Validate response media type, correlation ID, required fields, types, enums, and safe errors.
- Confirm one meaningful side effect and one prohibited side effect.
- Record unspecified expected behavior as a question rather than making the suite pass by assumption.

### Scoring rubric

| Criterion | Points | Full-credit evidence |
|---|---:|---|
| Contract baseline and traceability | 1.5 | Assertions map to approved sources and documentation gaps are explicit |
| Request and header coverage | 1.5 | Method, path, auth, metadata, body, and boundary inputs are purposeful |
| Response and schema validation | 2.0 | Status, headers, structure, types, and error safety are checked |
| Business semantics and side effects | 2.0 | Assertions verify state and integration effects, not only payload shape |
| Isolation, cleanup, and diagnostics | 2.0 | Tests are rerunnable and failures retain safe actionable evidence |
| Responsible AI use | 1.0 | AI suggestions are reviewed against the contract and execution output |

**Critical cap:** A suite that sends real credentials/payment data to an AI service or treats AI-generated responses as executed results receives a critical failure.

---

## Unit 5 assessed exercise — Risk-based negative and resilience portfolio

**Exercise ID:** `EX-U5-API-SCENARIOS`  
**Mode:** Pairs for design, individual defense  
**Learner timebox:** 210 minutes  
**Assessment value:** 10 course points

### Required scenario table

| Scenario ID | Type | Source/risk IDs | Preconditions/state | Input/action | Expected response | Expected side effects | Forbidden side effects | Priority |
|---|---|---|---|---|---|---|---|---|

### Minimum completion standard

- At least 24 purposeful, non-duplicate scenarios.
- Include at least six request-validation cases, four authorization/security cases, four state/idempotency cases, three dependency/resilience cases, and one concurrency case.
- Cover item counts `0`, `1`, `20`, and `21`; quantity `0`, `1`, `10`, and `11`; missing and malformed required fields; wrong media type; and unknown fields.
- Include same-key/same-payload retry and different-key retry after an unknown payment outcome.
- Treat same-key/different-payload behavior as unresolved unless the trainer supplies a contract update.
- Execute or trainer-simulate at least eight highest-priority scenarios and preserve evidence.

### Scoring rubric

| Criterion | Points | Full-credit evidence |
|---|---:|---|
| Systematic coverage model | 2.0 | Techniques and dimensions produce a traceable, balanced portfolio |
| Negative test quality | 2.0 | Inputs isolate violations and oracles include non-effects and safe errors |
| Stateful, retry, and resilience depth | 2.0 | Scenarios cover unknown outcomes, durability, replay, and recovery |
| Authorization and misuse coverage | 1.5 | Actor/object combinations test access and information exposure |
| Risk prioritization and residual risk | 1.5 | Execution order is evidence-based and deferred work is explicit |
| AI critique and provenance | 1.0 | AI adds reviewed value without inventing rules or results |

**Critical cap:** Fabricated execution results or scenarios that use unsafe credentials, real customer data, or uncontrolled production side effects cap the exercise at 5/10.

---

## Unit 6 assessed exercise — Integrated investigation and stakeholder briefing

**Exercise ID:** `EX-U6-INTEGRATED`  
**Mode:** Team investigation with individual defense  
**Learner timebox:** 240 minutes plus 15-minute defense  
**Assessment value:** 10 course points

### Required claim-evidence table

| Claim ID | Claim | Category | Evidence IDs | Confidence | Contradiction/limitation | Owner/next action |
|---|---|---|---|---|---|---|

### Minimum completion standard

- The package includes UI/observation, API, application-log, and provider evidence.
- Every material claim links to evidence and carries a category/confidence label.
- The timeline includes the first request, timeout, late provider capture, user retry, second capture, and final paid state.
- At least one observability defect or evidence gap is reported separately from the customer-facing defect.
- Regression recommendations cover the original flow, unknown-outcome retry, same-key reuse, different-key retry risk, and customer-visible messaging.
- At least one AI suggestion is accepted, one materially edited, and one rejected with rationale.

### Scoring rubric

| Criterion | Points | Full-credit evidence |
|---|---:|---|
| Cross-layer evidence chain | 2.0 | UI, API, logs, provider, and state evidence form a coherent auditable path |
| Contract and log analysis | 2.0 | Protocol, schema, timing, correlation, and anomalies are accurately interpreted |
| Hypothesis discipline | 2.0 | Conclusions and unknowns stay within evidence boundaries |
| Regression and observability guidance | 1.5 | Recommendations target demonstrated mechanisms and residual risk |
| Stakeholder communication | 1.5 | Summaries are concise, audience-appropriate, and equally truthful |
| Responsible AI audit trail | 1.0 | Inputs, outputs, review, redaction, and approvals are recorded |

**Critical cap:** An unsupported root-cause claim, fabricated evidence, or prohibited-data disclosure prevents a passing score until corrected and reviewed.
