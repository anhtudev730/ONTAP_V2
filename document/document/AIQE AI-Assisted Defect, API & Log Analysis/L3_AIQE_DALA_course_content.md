# [NFP] AI-Assisted Defect, API & Log Analysis

- **Proposed course code:** `L3_AIQE_DALA`
- **Level:** Advanced
- **Duration:** 48 hours (6 units × 8 hours)
- **Delivery format:** 30% concept and demonstration, 60% hands-on practice, 10% review and assessment
- **Primary outcome:** Learners can use AI to improve defect reporting, evidence-bounded root-cause analysis, log investigation, and API testing while keeping observations, hypotheses, and confirmed causes clearly separated.

## 1. Target audience

- Senior QA Engineers, Test Analysts, Test Leads, QA Automation Engineers, SDETs, and full-stack testers.
- Practitioners who already perform functional testing and want a repeatable investigation workflow across UI, API, services, and logs.
- Teams adopting generative AI for testing but requiring auditable evidence, privacy controls, and human approval.

## 2. Prerequisites

Learners should be able to:

- Execute functional tests and distinguish expected from actual behavior.
- Read HTTP requests and responses, JSON payloads, status codes, and basic API documentation.
- Read structured application logs and understand timestamps, environments, and service names.
- Apply basic test design techniques such as equivalence partitioning, boundary value analysis, and state-transition testing.
- Use an API client such as Postman, Bruno, curl, or an equivalent tool.
- Use a generative AI assistant and follow the organization's approved data-handling policy.

## 3. Course-level learning outcomes

By the end of the course, learners will be able to:

1. Produce concise, reproducible, evidence-rich defect reports that support triage and investigation.
2. Use AI to generate root-cause hypotheses without presenting unverified explanations as facts.
3. Normalize, filter, and correlate logs across services, time zones, retries, and asynchronous operations.
4. Design API tests from contracts and confirmed business rules across request, response, status, headers, and schema.
5. Build systematic positive, negative, boundary, authorization, state, idempotency, and resilience API scenarios with AI assistance.
6. Combine UI observations, API traffic, logs, traces, and business evidence into one defensible investigation narrative.
7. Record AI prompts, source boundaries, review decisions, and limitations so analysis remains auditable.

## 4. Learning philosophy

The course follows a human-led, AI-assisted sequence:

1. **Observe manually:** Capture what happened without guessing why.
2. **Establish the oracle:** Identify the approved requirement, contract, or rule that defines expected behavior.
3. **Collect evidence:** Preserve reproducible UI, API, log, trace, and environment evidence.
4. **Structure manually:** Build a timeline, identify gaps, and separate facts from interpretations.
5. **Ask AI for assistance:** Use AI to summarize, cluster, compare, or propose bounded hypotheses and tests.
6. **Challenge the output:** Reject invented facts, verify calculations, and test alternative explanations.
7. **Communicate with confidence labels:** State what is confirmed, supported, possible, contradicted, or unknown.

AI is not an execution oracle. It does not prove that a test passed, a defect exists, or a component caused an incident. Those claims require approved expected behavior and observable evidence.

## 5. Suggested running case study

Use one case study throughout all six units so that each deliverable becomes part of an integrated investigation package.

**Recommended system:** An omnichannel order and refund platform with web/mobile clients, an API gateway, Order Service, Inventory Service, Payment Adapter, Notification Service, relational storage, centralized logging, and external payment and email providers.

### 5.1 System context

```text
Web/Mobile Client
       |
       v
   API Gateway
       |
       v
  Order Service -----> Inventory Service
       |
       +-------------> Payment Adapter -----> Payment Provider
       |
       +-------------> Notification Service -> Email Provider
       |
       +-------------> Order Database

All services emit structured logs to the central log platform.
Requests carry a correlation ID across synchronous and asynchronous boundaries.
```

### 5.2 Approved business and interface evidence

| Evidence ID | Approved source |
|---|---|
| `REQ-ORD-01` | A registered customer can place an order when requested items are available and payment succeeds. |
| `BR-IDEM-01` | Retrying the same order request with the same idempotency key and same payload must not create another order or payment charge. |
| `BR-INV-01` | Inventory is reserved for 15 minutes and must be released when payment fails or the order is cancelled before payment completion. |
| `BR-PAY-01` | A provider timeout is an unknown payment outcome until reconciliation completes; the client must not be told that payment definitely failed. |
| `BR-NOT-01` | Notification failure must not roll back a successfully paid order. Notification retries must not create duplicate customer-visible messages. |
| `BR-AUTH-01` | Customers may view only their own orders. Support agents may view orders in their assigned queue. |
| `BR-AUD-01` | Order, payment, inventory, refund, and notification state changes record actor/service, timestamp, correlation ID, previous state, and new state. |
| `NFR-OBS-01` | Application timestamps use UTC ISO 8601 with millisecond precision. Every external request returns or records a correlation ID. |
| `NFR-SEC-01` | Logs must not contain passwords, access tokens, full card numbers, CVV values, or unnecessary personal data. |

### 5.3 Simplified API contract

#### `POST /orders`

Required request headers:

| Header | Constraint |
|---|---|
| `Authorization` | Valid test bearer token for an active synthetic customer |
| `Content-Type` | `application/json` |
| `Idempotency-Key` | UUID; reused only according to the idempotency contract |
| `X-Correlation-ID` | UUID; generated by the client or gateway |

Request body:

```json
{
  "customerId": "c8ec6e49-a8c2-4a55-88ce-50127e2f21a1",
  "items": [
    {"sku": "SKU-RED-01", "quantity": 2}
  ],
  "paymentMethod": "CARD"
}
```

Confirmed request constraints:

- `customerId` is a required UUID and must match the authenticated customer.
- `items` contains 1–20 distinct SKUs.
- `quantity` is an integer from 1 through 10 inclusive.
- `paymentMethod` is `CARD` or `WALLET`.
- Unknown JSON fields are rejected.

Documented responses:

| Condition | Status | Required response evidence |
|---|---:|---|
| Order accepted and payment completed | `201` | `orderId`, `status=PAID`, `amount`, `currency`, `correlationId` |
| Request accepted but payment outcome awaits reconciliation | `202` | `orderId`, `status=PAYMENT_PENDING`, `correlationId`, `statusUrl` |
| Request validation failed | `400` | stable error `code`, safe `message`, field-level `details`, `correlationId` |
| Authentication missing or invalid | `401` | stable error `code`, safe `message`, `correlationId` |
| Customer attempts another customer's identity | `403` | stable error `code`, safe `message`, `correlationId` |
| SKU does not exist | `404` | stable error `code`, safe `message`, `correlationId` |
| Same idempotency key is reused with a different payload | Not specified | Learners must raise a clarification; AI must not invent the status or behavior. |
| Unexpected internal failure | `500` | generic safe message and `correlationId`; no stack trace or secret |

#### `GET /orders/{orderId}`

- Returns `200` with the order resource when the caller is authorized.
- Returns `404` when the order does not exist.
- Cross-customer behavior is intentionally not specified as `403` or `404`; learners must test information exposure and raise the expected-status question.
- The response includes `orderId`, `customerId`, `status`, `items`, `paymentStatus`, `createdAt`, and `updatedAt`.

### 5.4 Seed defect and evidence pack

The trainer supplies this observation after a controlled test run:

> On mobile build `4.8.2-rc3` in staging, the customer submits one order. The app displays “Payment failed. Try again.” The customer taps Try again once. Two card charges appear in the provider stub, while the Order API displays one paid order.

Test context:

| Field | Value |
|---|---|
| Environment | `staging-ap-southeast` |
| Mobile build | `4.8.2-rc3` |
| API build | `order-api 2026.09.08.7` |
| Test account | synthetic customer `CUST-SYN-1042` |
| First client correlation ID | `corr-7a01` |
| Retry client correlation ID | `corr-7a02` |
| Idempotency key used by first request | `idem-b91f` |
| Idempotency key used by retry | `idem-c44a` |
| Device time zone | `Asia/Ho_Chi_Minh` (`UTC+07:00`) |
| First submit shown in screen recording | `14:03:18.420 +07:00` |
| Retry shown in screen recording | `14:03:22.980 +07:00` |

Selected API evidence:

```http
POST /orders HTTP/1.1
Idempotency-Key: idem-b91f
X-Correlation-ID: corr-7a01

HTTP/1.1 504 Gateway Timeout
X-Correlation-ID: corr-7a01
Content-Type: application/json

{"code":"GATEWAY_TIMEOUT","message":"Payment service timed out","correlationId":"corr-7a01"}
```

```http
POST /orders HTTP/1.1
Idempotency-Key: idem-c44a
X-Correlation-ID: corr-7a02

HTTP/1.1 201 Created
X-Correlation-ID: corr-7a02
Content-Type: application/json

{"orderId":"ORD-90017","status":"PAID","amount":240000,"currency":"VND","correlationId":"corr-7a02"}
```

Selected normalized logs:

```text
2026-09-09T07:03:18.501Z INFO  gateway      corr=corr-7a01 request=gw-1101 POST /orders start
2026-09-09T07:03:18.540Z INFO  order-svc    corr=corr-7a01 order=ORD-90017 idem=idem-b91f state=PAYMENT_PENDING
2026-09-09T07:03:18.604Z INFO  payment-adpt corr=corr-7a01 payment=PAY-701 provider_request=pr-881 attempt=1 sent
2026-09-09T07:03:21.605Z WARN  payment-adpt corr=corr-7a01 payment=PAY-701 provider_request=pr-881 timeout_ms=3000
2026-09-09T07:03:21.612Z ERROR gateway      corr=corr-7a01 request=gw-1101 status=504 duration_ms=3111
2026-09-09T07:03:22.430Z INFO  payment-adpt corr=corr-7a01 payment=PAY-701 provider_event=pe-551 status=CAPTURED
2026-09-09T07:03:23.020Z INFO  gateway      corr=corr-7a02 request=gw-1102 POST /orders start
2026-09-09T07:03:23.055Z INFO  order-svc    corr=corr-7a02 order=ORD-90017 idem=idem-c44a state=PAYMENT_PENDING
2026-09-09T07:03:23.101Z INFO  payment-adpt corr=corr-7a02 payment=PAY-702 provider_request=pr-882 attempt=1 sent
2026-09-09T07:03:23.480Z INFO  payment-adpt corr=corr-7a02 payment=PAY-702 provider_event=pe-552 status=CAPTURED
2026-09-09T07:03:23.525Z INFO  order-svc    corr=corr-7a02 order=ORD-90017 previous=PAYMENT_PENDING state=PAID
2026-09-09T07:03:23.550Z INFO  gateway      corr=corr-7a02 request=gw-1102 status=201 duration_ms=530
```

Provider stub evidence:

| Provider event | Provider request | Amount | Status | Recorded at UTC |
|---|---|---:|---|---|
| `pe-551` | `pr-881` | VND 240,000 | `CAPTURED` | `2026-09-09T07:03:22.426Z` |
| `pe-552` | `pr-882` | VND 240,000 | `CAPTURED` | `2026-09-09T07:03:23.476Z` |

The pack proves two captures occurred and that the mobile retry used a new idempotency key. It does **not** by itself prove which component owns the defect, why the app generated a new key, or whether a second independent server-side control should have prevented the second capture. Those remain hypotheses until investigated.

### 5.5 Trainer-controlled extensions

Introduce these evidence sets only after learners complete the relevant trigger or initial analysis:

| Extension | Trigger | Evidence revealed |
|---|---|---|
| `EXT-01` | Search by order ID only | Payment Adapter logs are missing the order ID on the timeout event; correlation ID is required to reconstruct the first attempt. |
| `EXT-02` | Convert all timestamps to UTC | The UI, API, provider, and logs align within expected clock tolerance; the apparent seven-hour gap was a time-zone error. |
| `EXT-03` | Test failed payment after inventory reservation | Inventory remains reserved after 16 minutes and no release event appears. |
| `EXT-04` | Test notification-provider failure | Order remains paid, but two delivered messages share the same business event ID. |
| `EXT-05` | Test cross-customer order access | API returns another customer's order summary with `200`; UI navigation does not expose the link. |
| `EXT-06` | Inspect malformed payload handling | API returns `500` and a Java stack trace when `items` is an object instead of an array. |

Trainer-only outcomes must be excluded from learner handouts until released.

## 6. Evidence and confidence model

Every course artifact uses the following categories:

| Category | Meaning | Permitted statement |
|---|---|---|
| `FACT-SOURCE` | Directly stated in an approved requirement, rule, contract, or runbook | “`BR-IDEM-01` requires…” |
| `FACT-OBSERVED` | Directly observed in the controlled test or captured evidence | “The provider stub recorded two captures.” |
| `INFERENCE` | A reasoned interpretation supported by one or more facts | “The retry path may bypass key reuse.” |
| `HYPOTHESIS` | A testable possible explanation that is not yet confirmed | “The mobile client generates a key per tap.” |
| `CONTRADICTED` | A claim inconsistent with available reliable evidence | “The first payment failed” is contradicted by `pe-551`. |
| `UNKNOWN` | Information not supplied or not yet observed | “Ownership of idempotency-key lifetime is not specified.” |

Confidence labels communicate evidence strength, not personal certainty:

- **Confirmed:** Directly supported by reliable evidence or a controlled reproduction.
- **Strongly supported:** Multiple independent evidence sources agree, but a decisive check is still missing.
- **Possible:** Plausible and testable with limited supporting evidence.
- **Weak:** Speculative, based on analogy, or lacking discriminating evidence.
- **Ruled out for this run:** Contradicted by the captured evidence for the investigated occurrence.

## 7. Responsible AI working agreement

The following rules apply in every unit:

- Do not send production logs, credentials, access tokens, session cookies, payment data, personal data, or proprietary source code to an unapproved AI service.
- Redact or synthesize sensitive fields before AI use while preserving only the structure required for analysis.
- Treat AI output as a draft, pattern suggestion, or hypothesis—not as execution evidence or root-cause proof.
- Give AI a bounded source pack and require evidence IDs or exact supplied fields for material claims.
- Require `Not specified` or `Insufficient evidence` when the source does not support an answer.
- Keep facts, observations, inferences, hypotheses, questions, and recommendations in separate fields.
- Verify counts, timestamp conversions, schema validation, and correlations with deterministic tools where practical.
- Record tool/model, prompt version, source-set version, redaction method, reviewer, and disposition when AI output enters a formal artifact.
- A named human owns defect submission, severity, prioritization, root-cause confirmation, test conclusions, and release recommendations.

---

# Unit 1 — High-quality defect reporting with AI support

**Duration:** 8 hours  
**Unit goal:** Convert raw test observations into concise, reproducible, evidence-rich defect reports, using AI to improve clarity and completeness without fabricating facts.

## Learning outcomes

After this unit, learners can:

- Distinguish a confirmed defect, suspected defect, requirement question, environment issue, and test-data issue.
- Write a defect title and summary that identify the affected behavior, condition, and impact.
- Document deterministic reproduction steps, expected results, actual results, frequency, environment, and evidence.
- Assign severity using business and technical impact while keeping severity separate from scheduling priority.
- Use AI to critique and refine a report while preserving original observations and uncertainty.

## Session breakdown

### Session 1.1 — What makes a defect report actionable? (2 hours)

- Purpose of a defect report: communicate a falsifiable difference between expected and observed behavior.
- Minimum evidence for calling something a defect:
  - Approved oracle or clearly cited expected behavior.
  - Observed behavior from an identified build and environment.
  - Reproduction path or enough evidence to investigate a non-reproducible occurrence.
- Defect versus enhancement, support question, duplicate, configuration issue, data issue, and known limitation.
- Anatomy of a strong report:
  - Stable, searchable title.
  - Short impact-oriented summary.
  - Environment, build, role, test data, and preconditions.
  - Numbered action steps with inputs.
  - Expected and actual results at the same level of detail.
  - Reproducibility, frequency, scope, regression status, and workaround.
  - Evidence references and related records.
- Common anti-patterns: vague title, hidden preconditions, screenshots without context, conclusions in the actual result, and copied logs containing secrets.

**Practice:** Classify ten sample tickets as actionable defect, clarification needed, environment issue, or insufficient evidence.

### Session 1.2 — Reproduction, evidence, severity, and priority (2 hours)

- Reproduction dimensions: user role, state, data, channel, build, configuration, locale, network, concurrency, and dependency behavior.
- Capturing the smallest reliable reproduction without deleting relevant context.
- Evidence selection across screen recording, request/response, console output, logs, trace IDs, database checks, and provider stubs.
- Severity dimensions: customer impact, financial impact, data integrity, security/privacy, compliance, availability, recoverability, and blast radius.
- Priority as a business scheduling decision influenced by severity, frequency, exposure, workaround, release timing, and strategic importance.
- Avoiding false precision when frequency or affected population is unknown.

**Workshop:** Assess the duplicate-charge observation and defend severity using supplied evidence; record missing inputs for priority.

### Session 1.3 — AI-assisted defect drafting and review (2 hours)

- Safe input preparation: redact, minimize, label, and version the source pack.
- Useful AI tasks:
  - Identify missing report fields.
  - Rewrite a title for searchability.
  - Convert unstructured notes into a draft template.
  - Detect contradictions between steps, expected result, and actual result.
  - Suggest evidence to collect or reproduction variables to isolate.
- Required prompt controls:
  - Use supplied facts only.
  - Preserve all identifiers exactly.
  - Do not claim a root cause.
  - Mark missing data as `Not provided`.
  - Explain every material edit.
- Human comparison of original evidence, AI draft, and final approved report.

**Demo:** Compare a generic “write a bug” prompt with an evidence-bounded review prompt and identify fabricated details.

### Session 1.4 — Triage-ready communication and defect quality gate (2 hours)

- Designing titles for list views and duplicate searches.
- Separating customer-visible symptom, technical evidence, and investigation note.
- Linking related incidents, tests, requirements, builds, and telemetry without creating a link dump.
- Reporting intermittent and non-reproducible defects honestly.
- Defect lifecycle: draft, review, triage, assign, resolve, retest, reopen, close.
- Quality gate before submission and retest evidence after a fix.

**Assessment activity:** Produce and peer-review a complete defect report for the seed duplicate-charge case.

## Unit deliverable

**AI-reviewed Defect Evidence Pack**, containing:

- Final defect report with stable defect ID.
- Expected-behavior citations and observation references.
- Reproduction matrix showing confirmed and untested conditions.
- Severity rationale and priority inputs.
- Evidence index with privacy/redaction check.
- AI prompt/output review log listing accepted, edited, and rejected suggestions.

## Quality criteria

- Another tester can reproduce or investigate the occurrence without oral clarification.
- Expected and actual behavior are directly comparable and evidence-backed.
- Title states symptom and condition without asserting an unconfirmed cause.
- Severity rationale reflects impact; priority is not invented by the author.
- All evidence is traceable, minimally sufficient, and free of prohibited data.
- AI additions that are not supported by the source have been removed or labeled as questions.

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

# Unit 2 — Root-cause hypothesis generation with evidence boundaries

**Duration:** 8 hours  
**Unit goal:** Generate, prioritize, and test plausible root-cause hypotheses while preserving the boundary between observed evidence and unverified explanation.

## Learning outcomes

After this unit, learners can:

- Build an evidence timeline before proposing causes.
- Distinguish symptom, contributing condition, mechanism, root cause, and corrective action.
- Generate competing hypotheses across client, gateway, service, dependency, data, configuration, and observability layers.
- Rank hypotheses using supporting, contradicting, and missing evidence rather than plausibility alone.
- Design discriminating checks that can strengthen, weaken, or rule out hypotheses.
- Use AI for breadth and challenge while preventing confident causal storytelling.

## Session breakdown

### Session 2.1 — From symptom to causal question (2 hours)

- Why “where the error appeared” is not necessarily “where the defect originated.”
- Causal layers: trigger, mechanism, failure, detection gap, containment gap, and impact.
- Timeline-first analysis: normalize time, sort evidence, identify actors, state transitions, and gaps.
- Root cause versus contributing factors and latent control weakness.
- Investigation frames: Five Whys, fault tree, fishbone, state-machine analysis, and change analysis.
- When not to perform root-cause analysis: insufficient evidence, inaccessible systems, or unresolved oracle.

**Practice:** Convert five blame-oriented statements into neutral causal questions.

### Session 2.2 — Evidence-bounded hypothesis generation (2 hours)

- Hypothesis structure:
  - Proposed mechanism.
  - Scope and preconditions.
  - Evidence that supports it.
  - Evidence that contradicts it.
  - Expected observations if true.
  - A discriminating next check.
- Creating hypotheses across layers without prematurely narrowing scope.
- Negative evidence: what should be present but is absent, and when absence is not reliable.
- Correlation versus causation, survivorship bias, confirmation bias, and post hoc reasoning.
- Confidence labels and explicit update rules.

**Workshop:** Produce at least six competing hypotheses for the duplicate-charge case and remove duplicates disguised by wording.

### Session 2.3 — AI as hypothesis generator and adversarial reviewer (2 hours)

- Supplying architecture, timeline, known changes, and evidence reliability to AI.
- Asking AI for alternatives, counter-evidence, missing telemetry, and falsification checks.
- Preventing overreach:
  - Do not ask “What is the root cause?” before a bounded evidence review.
  - Require quotations or evidence IDs from the supplied pack.
  - Ban invented code paths, infrastructure settings, and historical incidents.
  - Require at least one alternative explanation.
- Detecting AI failure modes: confident narrative, component blame, causal leap, ignored contradiction, and generic best-practice padding.

**Demo:** Challenge an AI-generated claim that “the payment provider retried the request” using provider request IDs and captured events.

### Session 2.4 — Investigation planning and causal confidence (2 hours)

- Prioritizing next checks by information gain, safety, cost, reversibility, and access.
- Designing discriminating experiments rather than collecting more undirected logs.
- Updating the hypothesis matrix when new evidence arrives.
- Criteria for confirming a cause:
  - Reproduction under controlled conditions.
  - Mechanism visible in code/configuration or deterministic behavior.
  - Fix or controlled removal eliminates the failure without conflicting evidence.
- Writing a provisional investigation note when confirmation is not yet possible.

**Assessment activity:** Create a hypothesis matrix and investigation plan, then update it after a trainer releases one extension.

## Unit deliverable

**Evidence-bounded Root-cause Investigation Pack**, containing:

- Normalized event timeline.
- Fact, inference, unknown, and contradiction register.
- Competing hypothesis matrix.
- Prioritized discriminating checks with expected outcomes.
- Updated confidence after new evidence.
- Provisional conclusion that clearly states what is and is not confirmed.
- AI challenge and human-review log.

## Quality criteria

- Every hypothesis is testable and tied to evidence.
- At least one meaningful alternative hypothesis remains until evidence rules it out.
- Supporting evidence is not reused as proof of the claim it merely suggested.
- Next checks distinguish between hypotheses instead of only gathering more data.
- The conclusion does not exceed the available evidence.
- Component ownership and corrective action are not assigned from speculation.

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

# Unit 3 — Log analysis: patterns, anomalies, timestamps and correlation IDs

**Duration:** 8 hours  
**Unit goal:** Transform noisy, multi-service log data into a reliable event timeline and identify patterns and anomalies without losing context or exposing sensitive information.

## Learning outcomes

After this unit, learners can:

- Assess log source, structure, completeness, retention, clock, and reliability before analysis.
- Parse structured and semi-structured events into consistent fields.
- Normalize time zones and reason about clock skew, duration, and event ordering.
- Trace one transaction across services using correlation, request, order, payment, and business-event IDs.
- Identify patterns, outliers, missing events, retry loops, state-transition anomalies, and sensitive-data leakage.
- Use AI to propose parsing and clustering approaches while validating results deterministically.

## Session breakdown

### Session 3.1 — Log literacy and evidence reliability (2 hours)

- Log anatomy: timestamp, severity, service, environment, instance, event name, request ID, correlation ID, entity ID, duration, status, and message.
- Structured JSON logs versus free-text logs.
- Event time versus ingestion time and processing time.
- Reliability questions: sampling, truncation, buffering, asynchronous delivery, retention, redaction, and missing services.
- Severity semantics and why `ERROR` does not automatically equal a product defect.
- Establishing a search window and control sample.

**Practice:** Evaluate a mixed log set and identify fields that can and cannot be trusted for ordering or correlation.

### Session 3.2 — Timestamps, ordering, and distributed timelines (2 hours)

- UTC normalization and ISO 8601 offsets.
- Milliseconds versus seconds, 12-hour versus 24-hour formats, and locale-dependent timestamps.
- Clock skew and why sorted timestamps may not equal causal order.
- Duration calculation and percentile interpretation.
- Synchronous calls, asynchronous events, queues, callbacks, and eventual consistency.
- Time-window expansion for upstream and downstream evidence.

**Lab:** Convert the mobile timestamps from `UTC+07:00` to UTC, merge them with system logs and provider events, and calculate important intervals.

### Session 3.3 — Correlation IDs and cross-service reconstruction (2 hours)

- Correlation ID, trace ID, span ID, request ID, session ID, entity ID, idempotency key, and business-event ID.
- One-to-many and many-to-one relationships across retries and asynchronous flows.
- Correlation propagation through gateways, services, queues, callbacks, and external providers.
- Pivot strategy when a field is missing: correlation ID → provider request → payment → order → customer-safe synthetic reference.
- Detecting collisions, regeneration, reuse, and broken propagation.
- Building a transaction evidence graph rather than relying on one search term.

**Workshop:** Reconstruct both payment attempts and show why searching only by `ORD-90017` or only by `corr-7a02` is incomplete.

### Session 3.4 — Pattern, anomaly, and AI-assisted log review (2 hours)

- Baseline-driven analysis: compare failing run with successful control and known dependency-failure run.
- Useful patterns:
  - Repeated error signatures.
  - Retry bursts and backoff violations.
  - Latency shift and timeout clustering.
  - Missing expected transitions.
  - Impossible or illegal state order.
  - Cardinality spikes and rare combinations.
  - Correlation gaps and orphan events.
- AI uses: field extraction, candidate grouping, timeline drafting, query suggestions, and anomaly explanation.
- Deterministic validation: parser output counts, timestamp conversion, joins, filters, and schema checks.
- Log privacy review and redaction verification.

**Assessment activity:** Analyze a mixed batch containing the failure, control transactions, noise, one malformed line, and one deliberately leaked synthetic secret pattern.

## Unit deliverable

**Correlated Log Analysis Report**, containing:

- Source inventory and reliability notes.
- Parsing/normalization rules and rejected-record count.
- UTC event timeline with original timestamps retained.
- Correlation map linking technical and business identifiers.
- Pattern/anomaly table with baseline comparison.
- Privacy/security findings.
- Recommended next queries or instrumentation gaps.
- AI-generated suggestions and deterministic validation results.

## Quality criteria

- All timestamps preserve the original value and show the normalized basis.
- Correlation uses multiple identifiers where necessary and documents broken propagation.
- Anomalies are deviations from an explicit baseline, invariant, or expected event sequence.
- Missing events are reported with caveats about source completeness and sampling.
- Counts and joins can be reproduced with saved queries or scripts.
- Logs supplied to AI contain no prohibited data.

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

# Unit 4 — API testing foundation: request, response, status, headers and schema

**Duration:** 8 hours  
**Unit goal:** Establish a contract-driven API testing foundation that validates transport, protocol, payload, schema, business behavior, and observable side effects.

## Learning outcomes

After this unit, learners can:

- Read an API operation as a contract of method, path, authentication, headers, parameters, body, and responses.
- Validate status, headers, schema, values, business rules, and side effects at the appropriate layer.
- Separate contract checks from business-flow checks and non-functional checks.
- Build reliable API test setup, data isolation, assertions, and cleanup.
- Recognize ambiguous or contradictory API documentation and raise questions rather than inventing behavior.

## Session breakdown

### Session 4.1 — HTTP request anatomy and controllable inputs (2 hours)

- Base URL, scheme, host, port, path, query, method, and versioning.
- Authentication and authorization context.
- Headers: content negotiation, correlation, idempotency, caching, conditional requests, and custom metadata.
- Path/query parameters versus request body.
- JSON types, null, missing, empty, number precision, arrays, encoding, and Unicode.
- Safe test accounts, provider test tokens, environment configuration, and secret management.

**Practice:** Annotate the `POST /orders` request and identify testable input dimensions and unsafe values.

### Session 4.2 — Response validation beyond the status code (2 hours)

- Status code class and operation-specific meaning.
- Required and forbidden response headers.
- Media type, encoding, correlation propagation, caching, rate-limit, and security headers where applicable.
- Schema validation: required fields, types, formats, enums, additional properties, and conditional structures.
- Semantic assertions: value relationships, authorization, state, calculations, ordering, and timestamps.
- Side-effect validation: database state, downstream call, event, inventory reservation, payment, notification, and audit record.
- Safe error contracts that avoid stack traces and sensitive information.

**Lab:** Test documented `201`, `202`, `400`, `401`, `403`, `404`, and `500` response shapes using contract examples or stubs.

### Session 4.3 — Contract, examples, and oracle conflicts (2 hours)

- OpenAPI components, reusable schemas, examples, parameters, security schemes, and response definitions.
- Why examples are not full schemas and why schemas do not express every business rule.
- Detecting contradictions among requirements, OpenAPI, client behavior, implementation, and legacy tests.
- Classifying the result: implementation defect, contract defect, requirement gap, test defect, or environment issue.
- Consumer/provider compatibility and backward compatibility.
- Versioning, deprecation, tolerant readers, and unknown fields.

**Workshop:** Review the intentionally unspecified changed-payload idempotency behavior and cross-customer `403` versus `404` behavior; produce stakeholder questions.

### Session 4.4 — Maintainable API test design and execution (2 hours)

- Arrange–Act–Assert–Cleanup for API tests.
- Stable data builders, unique synthetic identifiers, isolation, teardown, and repeatability.
- Assertion strategy: fail with actionable request, response, and expected-contract evidence while redacting secrets.
- Separating transport clients, endpoint actions, business workflows, and specifications.
- Avoiding brittle full-body equality when only selected fields/order matter.
- Capturing correlation IDs for investigation and linking API results to logs.

**Assessment activity:** Implement or document a compact contract test suite for `POST /orders` and `GET /orders/{orderId}`.

## Unit deliverable

**API Contract Test Pack**, containing:

- Endpoint inventory and contract baseline.
- Request dimension and header matrix.
- Response assertion matrix covering status, headers, schema, semantics, and side effects.
- Positive and representative error tests.
- Safe setup, test data, isolation, and cleanup plan.
- Documentation-gap register.
- Reproducible execution evidence with correlation IDs.

## Quality criteria

- Tests cite a contract or approved rule for every material assertion.
- Status-only checks are supplemented by headers, schema, semantics, and side effects where relevant.
- Authentication and authorization are not treated as the same concern.
- Tests are isolated, repeatable, and safe to rerun.
- Error evidence is actionable but does not expose secrets or stack traces.
- Undefined behavior remains a clarification, not an assumed expected result.

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

# Unit 5 — AI-assisted API test scenarios and negative testing

**Duration:** 8 hours  
**Unit goal:** Use systematic test design and AI-assisted gap discovery to build risk-focused API scenarios, with particular depth in negative, stateful, authorization, and resilience behavior.

## Learning outcomes

After this unit, learners can:

- Derive scenario dimensions from API contracts, business rules, architecture, and operational risks.
- Apply equivalence classes, boundary values, decision tables, state transitions, pairwise selection, and misuse cases.
- Design negative tests that isolate one intended violation and define strong oracles.
- Test idempotency, retry, concurrency, authorization, dependency failure, and eventual consistency.
- Use AI to expand candidate coverage and critique gaps without accepting infeasible or invented cases.
- Prioritize scenarios by risk, information value, cost, and production exposure.

## Session breakdown

### Session 5.1 — Systematic scenario generation from bounded sources (2 hours)

- Scenario inputs: operation contract, field constraints, business rules, state model, roles, architecture, incidents, and change history.
- Positive baseline before negative variation.
- Equivalence classes and robust boundaries for field, collection, and cross-field rules.
- Decision tables for combinations of authentication, identity, stock, payment method, and dependency outcome.
- State transitions for order and payment lifecycles.
- Traceability from scenario to source and risk.

**Practice:** Build a scenario model for `POST /orders` before asking AI for additions.

### Session 5.2 — Negative testing with strong oracles (2 hours)

- Negative categories:
  - Missing, null, empty, wrong type, malformed, unsupported, duplicate, and oversized inputs.
  - Just-below and just-above boundaries.
  - Cross-field conflicts and forbidden state transitions.
  - Authentication, authorization, tenant/object ownership, and privilege misuse.
  - Injection-like strings, encoding, unexpected fields, and unsafe error disclosure.
- Isolating the intended violation so failures remain diagnosable.
- Negative oracle dimensions: status, code, safe message, details, correlation ID, no state mutation, no downstream call, no leaked data.
- Avoiding exhaustive but low-value Cartesian products.

**Lab:** Create a negative matrix for items, quantity, customer identity, content type, and malformed JSON.

### Session 5.3 — Stateful, idempotent, concurrent, and resilience scenarios (2 hours)

- Same idempotency key/same payload versus different keys/same business intent.
- Unknown-outcome retry and reconciliation.
- Duplicate delivery, delayed callback, out-of-order event, and replay.
- Concurrent submits and inventory races.
- Timeouts, connection resets, partial responses, provider failures, and recovery.
- Eventual consistency and bounded polling rather than fixed sleeps.
- Determining which effects must occur once, at least once, or not at all.

**Workshop:** Design tests that distinguish client key misuse, server idempotency failure, provider retry, and reconciliation failure.

### Session 5.4 — AI coverage expansion, critique, and prioritization (2 hours)

- Prompting AI with source IDs, scenario taxonomy, exclusions, environment capability, and output fields.
- Requiring each proposal to state source, risk, precondition, action, oracle, data, and feasibility.
- Deduplicating semantic equivalents and rejecting impossible or out-of-scope scenarios.
- Asking AI to find missing boundary, state, misuse, resilience, and observability cases.
- Prioritization using impact, likelihood/exposure, detectability, recent change, historical evidence, and execution cost.
- Portfolio balance across contract, business, security, resilience, and observability risks.

**Assessment activity:** Produce a prioritized API scenario portfolio and execute or simulate the highest-value subset.

## Unit deliverable

**AI-assisted API Scenario and Negative Test Portfolio**, containing:

- Manual scenario model and coverage dimensions.
- AI candidate list with accept/edit/reject decisions.
- Traceable positive, negative, boundary, authorization, state, idempotency, concurrency, and resilience scenarios.
- Risk score and prioritization rationale.
- Strong oracle definitions, including prohibited side effects.
- Execution results or clearly labeled simulations for the selected subset.
- Residual-risk and deferred-scenario register.

## Quality criteria

- Systematic manual design exists before AI gap expansion.
- Negative cases isolate the intended violation where practical.
- Stateful and retry scenarios verify durable side effects, not only immediate responses.
- Authorization cases use distinct actors and objects and check information leakage.
- AI proposals are deduplicated, feasibility-checked, and source-grounded.
- Prioritization changes execution order and makes deferred risk visible.

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

# Unit 6 — Integrated defect, log and API analysis guidance

**Duration:** 8 hours  
**Unit goal:** Integrate defect evidence, API behavior, logs, and bounded hypotheses into a coherent investigation workflow and decision-ready communication package.

## Learning outcomes

After this unit, learners can:

- Select the next observation channel based on the current evidence gap.
- Correlate UI symptoms, HTTP traffic, logs, traces, provider events, and state checks.
- Build one end-to-end timeline and evidence graph for a distributed failure.
- Convert investigation findings into improved defect reports, targeted regression tests, and observability recommendations.
- Communicate confirmed facts, likely explanations, unresolved questions, and residual risk to technical and business audiences.
- Apply AI safely throughout the investigation without losing provenance or human accountability.

## Session breakdown

### Session 6.1 — End-to-end investigation workflow (2 hours)

- Investigation entry points: user report, failed test, monitor alert, API anomaly, log signature, or provider event.
- Choosing the next layer:
  - UI for user-visible state and action sequence.
  - API for contract, transport, identity, and immediate response.
  - Logs/traces for internal flow and timing.
  - Database/event store for durable state when authorized.
  - Provider stub or integration telemetry for external outcome.
- Evidence acquisition order that minimizes mutation and preserves original state.
- One evidence index and stable IDs across all artifacts.
- Stop conditions, escalation triggers, and access boundaries.

**Practice:** Given five incomplete incident reports, choose the next evidence source and explain its expected information gain.

### Session 6.2 — Integrated timeline, state model, and evidence graph (2 hours)

- Merging user actions, HTTP requests, responses, internal events, callbacks, and state changes.
- Mapping technical identifiers and business entities.
- Comparing actual state transitions with the approved state model.
- Highlighting gaps, contradictions, unreliable sources, and alternate paths.
- Separating the primary defect from observability defects and control weaknesses.
- Identifying the smallest targeted regression layer and the necessary cross-layer coverage.

**Lab:** Build an evidence graph for the duplicate-charge case and attach each claim to at least one source.

### Session 6.3 — AI-assisted synthesis and communication (2 hours)

- Safe AI workflow for large evidence sets: minimize, chunk by source, extract, normalize, verify, then synthesize.
- Preventing loss of provenance during summarization.
- Prompting AI to produce audience-specific drafts from the same approved fact table:
  - Triage summary for Product/QA/Engineering.
  - Technical investigation note.
  - Executive incident summary.
  - Regression and monitoring recommendation.
- Detecting unsupported certainty introduced during summarization.
- Human approval and change log for the final narrative.

**Workshop:** Compare an engineering-facing note with a product-facing summary and confirm that confidence does not change with audience.

### Session 6.4 — Prevention, regression, observability, and closure (2 hours)

- Translating causal evidence into corrective-action candidates without prescribing an unverified fix.
- Regression strategy across unit, contract, component, integration, end-to-end, and production-safe monitoring layers.
- Observability improvements: structured event names, mandatory correlation, stable error codes, state-transition audit, metrics, and alerts.
- Fix verification: original reproduction, targeted variants, adjacent risks, idempotency/retry, and negative side effects.
- Closure criteria and reopening triggers.
- Retrospective: what AI accelerated, what it missed, and where it increased review effort.

**Assessment activity:** Complete the integrated capstone investigation and defend the conclusions.

## Unit deliverable

**Integrated Defect, API, and Log Investigation Package**, containing:

- Investigation scope, source inventory, versions, and access limitations.
- Final defect report and evidence index.
- Normalized cross-layer timeline and identifier map.
- API contract findings and selected execution evidence.
- Log patterns/anomalies and saved queries.
- Hypothesis matrix with confidence updates.
- Confirmed conclusions, unresolved questions, and residual risks.
- Regression, observability, and safe monitoring recommendations.
- AI provenance and human-approval record.

## Quality criteria

- One evidence chain connects the user symptom to API, service, and provider observations.
- Facts and hypotheses remain distinguishable in every audience-specific summary.
- Contradictory and missing evidence is visible rather than smoothed over.
- Recommendations address demonstrated failure modes and named residual risks.
- Regression scope is risk-based and includes durable side effects.
- The package can be reviewed without exposing prohibited data.

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

---

# 8. Assessment strategy

## Formative assessment

- Short evidence-classification checks at the start of each unit.
- Weak-versus-strong artifact comparisons.
- Prompt critique and hallucination-detection exercises.
- Peer review using unit quality criteria.
- Trainer observation during API execution and log investigation.
- Reflection log of accepted, edited, and rejected AI suggestions.

## Summative assessment

| Component | Weight | Evidence |
|---|---:|---|
| Six unit deliverables | 60% | One assessed artifact per unit, 10% each |
| Integrated capstone | 30% | End-to-end investigation of a new controlled incident |
| Individual defense and responsible-AI review | 10% | Explanation of evidence, hypotheses, validation, safety, and limitations |

**Recommended pass mark:** 70/100 overall, with no unresolved critical failure in factual integrity, security/privacy, evidence fabrication, or source attribution.

## Common scoring principles

- Artifact quality and decision usefulness matter more than length.
- Correctly identifying `Insufficient evidence` or `Not specified` earns credit; inventing an answer does not.
- A technically plausible root cause receives no confirmation credit without validating evidence.
- An API test result must come from real controlled execution or be labeled as a simulation.
- AI output can support analysis but cannot serve as the only source for expected behavior, execution evidence, or causal confirmation.
- Resubmission after a critical failure requires remediation, impact review, and a short prevention note.

# 9. Integrated capstone

## Capstone brief

Learners receive a new incident in the same platform. The initial report is incomplete, and evidence is released progressively. The incident must include:

- One customer-visible symptom.
- One ambiguous or missing expected behavior.
- At least three services and one external dependency.
- Mixed timestamp formats or a controlled clock-skew concern.
- A correlation-ID propagation gap.
- At least one API contract or schema violation.
- At least one misleading log signal.
- Sensitive synthetic content that must be redacted before AI use.
- Multiple plausible root-cause hypotheses, only one of which becomes strongly supported or confirmed.

## Required capstone package

```text
CAP-AIQE-DALA/
  00-scope-environment-and-source-register
  01-defect-report-and-reproduction
  02-evidence-index-and-redaction-log
  03-api-contract-and-execution-evidence
  04-log-normalization-and-saved-queries
  05-timeline-identifier-map-and-state-model
  06-hypothesis-matrix-and-investigation-plan
  07-conclusions-unknowns-and-residual-risk
  08-regression-observability-and-monitoring
  09-ai-provenance-and-human-review
  10-stakeholder-briefing
```

## Capstone execution rules

1. Baseline the source pack, build, environment, accounts, and tool versions before analysis.
2. Do not change or clean up incident state until required evidence is preserved.
3. Assign stable evidence IDs and record collection time, source, owner, and redaction status.
4. Establish expected behavior before declaring an implementation defect.
5. Build the timeline before requesting root-cause hypotheses from AI.
6. Execute discriminating API tests in an approved non-production environment.
7. Keep simulated, observed, inferred, and confirmed information separate.
8. Validate AI-produced timestamps, counts, joins, and schema conclusions deterministically.
9. Obtain human approval for the final defect, root-cause status, severity, and release recommendation.
10. Retain only the minimum safe evidence according to the training retention policy.

## Capstone rubric

| Dimension | Weight | Strong performance indicators |
|---|---:|---|
| Defect quality and reproducibility | 15% | Report is precise, evidence-rich, safe, and triage-ready |
| API analysis and testing | 15% | Contract, headers, schema, semantics, side effects, and negative risks are covered |
| Log and timeline analysis | 15% | Sources are normalized, correlated, reproducible, and reliability-aware |
| Hypothesis and causal reasoning | 15% | Alternatives, contradictions, confidence, and discriminating checks are rigorous |
| Integrated evidence chain | 15% | Claims trace cleanly across user, API, service, state, and dependency evidence |
| Regression and observability guidance | 10% | Recommendations are risk-based and tied to demonstrated gaps |
| Communication and decision usefulness | 5% | Technical and business summaries are concise and equally accurate |
| Responsible AI and data safety | 10% | Inputs are safe, provenance is complete, and human review is demonstrable |

## Individual defense questions

The trainer selects at least four questions from different areas:

- Show one sentence in the final defect report that changed because evidence contradicted the initial observation.
- Trace one claim from the stakeholder summary back to its raw evidence.
- Explain why one hypothesis is only possible rather than strongly supported.
- Demonstrate a check that distinguishes two competing hypotheses.
- Recalculate one timestamp conversion or duration without AI assistance.
- Show how a request/response assertion maps to the API contract or business rule.
- Explain one forbidden side effect in a negative API test.
- Identify one AI suggestion you rejected and the evidence supporting that decision.
- Explain how logs were minimized and redacted before AI use.
- Defend one regression or observability recommendation and state its limitation.

# 10. Reusable templates

## 10.1 Defect report template

```text
Defect ID:
Title:
Status:
Reporter/date:

Source/oracle:
- Requirement, rule, contract, or approved clarification IDs:

Environment:
- Build/version:
- Client/device/browser:
- Services/configuration:
- Synthetic test data:

Preconditions:

Steps to reproduce:
1.
2.
3.

Expected result:
Actual result:
Frequency and scope:
Business/technical impact:
Severity and rationale:
Priority inputs/owner:
Workaround:

Evidence index:
- Screenshot/recording:
- Request/response:
- Correlation/trace IDs:
- Logs/provider/state evidence:

Known facts:
Open questions:
Hypotheses (not root-cause claims):
Privacy/redaction check:
AI review reference and human approver:
```

## 10.2 Hypothesis matrix template

| Hypothesis ID | Mechanism and scope | Supporting evidence | Contradicting evidence | Unknowns | Confidence | Next discriminating check | Update/result |
|---|---|---|---|---|---|---|---|

## 10.3 Log event normalization template

| Event ID | Original timestamp | UTC timestamp | Source/service | Event | Correlation/trace | Request/entity IDs | State/status | Reliability note | Raw evidence ref |
|---|---|---|---|---|---|---|---|---|---|

## 10.4 API scenario template

| Scenario ID | Source/risk | Preconditions | Request | Expected status/headers | Schema/semantic oracle | Expected side effects | Forbidden side effects | Evidence/cleanup |
|---|---|---|---|---|---|---|---|---|

## 10.5 Claim-evidence register

| Claim ID | Claim text | Fact/inference/hypothesis/unknown | Evidence IDs | Confidence | Reviewer decision | Audience use |
|---|---|---|---|---|---|---|

## 10.6 AI usage log

| AI use ID | Tool/model | Prompt version | Approved source set | Redaction/minimization | Intended task | Output reference | Accepted/edited/rejected | Reviewer and reason |
|---|---|---|---|---|---|---|---|---|

# 11. Generic evidence-bounded AI prompt frame

```text
Role:
You are assisting a senior QA investigator. You are not the execution source,
the product owner, or the authority that confirms root cause.

Task:
[State one bounded task: review a defect draft, extract events, propose competing
hypotheses, critique API coverage, or identify log anomalies.]

Approved sources:
[List exact evidence IDs, contract sections, and sanitized excerpts.]

Rules:
1. Use only the supplied sources for product facts and observed behavior.
2. Preserve identifiers, values, timestamps, and status codes exactly.
3. Separate FACT-SOURCE, FACT-OBSERVED, INFERENCE, HYPOTHESIS, CONTRADICTED,
   and UNKNOWN.
4. Cite evidence IDs for every material claim.
5. If evidence is absent or conflicting, write "Insufficient evidence" and state
   the precise question or check required.
6. Do not invent requirements, logs, code paths, environment details, execution
   results, frequency, severity, ownership, or root cause.
7. Identify contradictory evidence and at least one alternative explanation.
8. Recommend deterministic validation for calculations, timestamps, joins,
   schemas, and counts.

Required output:
[Provide a table schema appropriate to the task.]

Review note:
List the three claims most likely to be wrong or overconfident and explain what a
human reviewer should verify.
```

# 12. Trainer preparation checklist

- Publish learning outcomes, source-pack version, allowed AI tools, and data-handling rules.
- Provide synthetic-only accounts, tokens, identifiers, logs, and provider records.
- Confirm that all endpoints are non-production and that side effects are controlled.
- Prepare success/control evidence as well as failure evidence.
- Retain original timestamps and supply time-zone/clock metadata.
- Include enough identifiers for correlation but deliberately include one realistic observability gap.
- Define which expected behaviors are approved, intentionally ambiguous, or trainer-only.
- Prepare progressive evidence releases and do not reveal the answer key early.
- Ensure cleanup/reset instructions are safe and repeatable.
- Grade evidence quality and reasoning rather than agreement with one exact wording.
- Accept alternate hypotheses and prioritization when they are evidence-backed and honestly bounded.
- Reject fabricated observations, unsafe data handling, and AI-generated causal certainty.

# 13. Course completion definition

A learner completes the course successfully when they can independently:

- Turn an imperfect observation into a triage-ready, privacy-safe defect report.
- Build a reliable cross-service timeline from API and log evidence.
- Generate and test competing hypotheses without exceeding the evidence.
- Design contract-driven and risk-based API tests with strong positive and negative oracles.
- Use AI to accelerate structured analysis while detecting hallucination and preserving provenance.
- Communicate confirmed facts, current confidence, unknowns, next checks, and residual risk to both technical and business stakeholders.

