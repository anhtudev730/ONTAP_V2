# [NFP] AI-Assisted Requirement & Test Design

- **Course code:** `L3_AIQE_ARTD`
- **Level:** Advanced
- **Duration:** 48 hours (6 units × 8 hours)
- **Delivery format:** 30% concept and demonstration, 60% hands-on practice, 10% review and assessment
- **Primary outcome:** Learners can use AI as a review and design assistant to improve requirements, test coverage, test scenarios, detailed test cases, exploratory testing assets, and privacy-safe test data while retaining human accountability.

## 1. Target audience

- Senior QA Engineers, Test Analysts, Test Leads, Business Analysts, Product Owners, and QA Automation Engineers.
- Practitioners who already understand software development and testing fundamentals and want to apply generative AI in a controlled, repeatable workflow.

## 2. Prerequisites

Learners should be able to:

- Read user stories, acceptance criteria, business rules, API contracts, and basic non-functional requirements.
- Apply core test design techniques such as equivalence partitioning, boundary value analysis, decision tables, and state-transition testing.
- Distinguish functional, integration, usability, security, performance, and reliability risks.
- Use a generative AI assistant and understand basic prompt structure.
- Handle test artifacts in a test management tool, spreadsheet, or Markdown repository.

## 3. Course-level learning outcomes

By the end of the course, learners will be able to:

1. Diagnose ambiguity, inconsistency, incompleteness, and weak testability in requirements with AI assistance.
2. Build and maintain evidence-based requirement-to-test traceability and identify meaningful coverage gaps.
3. Generate diverse test scenarios and prioritize them using explicit product and quality risks.
4. Refine AI-generated test cases into precise, executable, maintainable, and reviewable assets.
5. Create exploratory testing charters and context-specific checklists without turning exploration into scripted testing.
6. Generate representative boundary datasets and synthetic data while protecting personal and confidential information.
7. Validate AI outputs, document assumptions, and prevent fabricated requirements or false coverage claims.

## 4. Suggested running case study

Use one case study throughout all six units so that every deliverable contributes to a final test design package.

**Recommended system:** An omnichannel order and refund platform with web/mobile clients, payment integration, inventory reservation, discount rules, role-based access, notifications, audit logs, and privacy constraints.

The trainer prepares a compact product pack containing:

- Product overview and system context diagram.
- 8–12 user stories with deliberately incomplete acceptance criteria.
- Business rules and a decision table for payment/refund eligibility.
- OpenAPI excerpt or sample request/response payloads.
- Non-functional requirements for performance, security, reliability, accessibility, and data retention.
- Change request introduced during Unit 2 for impact-analysis practice.
- Small test dataset containing synthetic records and intentionally unsafe data examples.

### Minimum exercise source pack

The following compact pack makes the exercises in this document runnable without requiring the trainer to invent a second case study. A trainer may replace it with an equivalent approved product pack, but must preserve stable source IDs, deliberate gaps, cross-layer evidence, and synthetic-only data. All content explicitly marked trainer-only—including simulation outcomes and `Trainer answer indicators`—must be removed from learner handouts.

#### System context

The platform has web and mobile clients, an Order API, Payment Adapter, Inventory Service, Notification Service, and relational order database. Customers place orders and request refunds; support agents review refund requests; managers approve high-value refunds. External payment and notification providers may be slow or unavailable. All records below are fictional training data.

#### Requirement excerpts supplied to learners

| ID | Source excerpt |
|---|---|
| `REQ-ORD-01` | A registered customer can place an order when the requested items are available. |
| `REQ-INV-01` | Inventory is reserved immediately during checkout and released when payment is unsuccessful. |
| `REQ-PAY-01` | The platform processes card and wallet payments quickly and securely and must not create duplicate charges. |
| `REQ-DIS-01` | Eligible customers receive the best available discount at checkout. |
| `REQ-REF-01` | A support agent can refund an eligible order with manager approval when required. |
| `REQ-NOT-01` | The customer receives confirmation after the order is completed, and the system keeps retrying if the notification provider is unavailable. |
| `NFR-PERF-01` | Checkout must remain fast during peak traffic. |
| `NFR-ACC-01` | Web and mobile checkout must be accessible to all users. |
| `NFR-RET-01` | Transaction and customer data is retained only as long as needed. |

#### Confirmed business rules

| ID | Approved rule |
|---|---|
| `BR-INV-01` | A line is available only when sellable stock is greater than or equal to the requested quantity. A successful reservation lasts 15 minutes unless converted to a paid order. |
| `BR-DIS-01` | VIP customers receive 10% off; a valid campaign code gives 15% off. Discounts cannot be combined, so the highest valid single discount is applied. Currency amounts are rounded half-up to the smallest currency unit. |
| `BR-REF-01` | A paid order is refundable for 30 calendar days. Refunds above VND 2,000,000 require manager approval and are returned to the original payment method. |
| `BR-AUTH-01` | Customers may access only their own orders. Agents may access orders in their assigned queue. Managers may approve but may not approve their own initiated refund request. |
| `BR-NOT-01` | Order confirmation uses email, with a maximum of three delivery attempts at 1, 5, and 15 minutes after the first failure. A retry must not create a duplicate business notification. |
| `BR-AUD-01` | Payment, inventory, discount, refund, approval, and notification state changes must record actor, timestamp, correlation ID, previous state, and new state. |

#### Interface and data constraints

The simplified `POST /orders` request contains `customerId`, `email`, `items[]`, optional `discountCode`, `paymentMethod`, and `idempotencyKey`. Each item contains `sku` and `quantity`.

| Field or behavior | Approved constraint |
|---|---|
| `customerId` | Required UUID; must reference an active synthetic customer |
| `email` | Required, maximum 254 characters; training values must use reserved domains such as `example.com` and must not route to a real person |
| `items` | 1–20 distinct SKUs per order |
| `quantity` | Integer from 1 through 10 inclusive |
| `paymentMethod` | `CARD` or `WALLET` |
| `idempotencyKey` | Required UUID; the same key and payload must not create another charge or order |
| `orderTotal` | VND 1,000 through VND 50,000,000 inclusive after discount |
| `refundReason` | Required for refunds; 10–500 Unicode characters |
| API response | The API reference shows `201 CREATED` with status `PENDING_PAYMENT`; an older process note says an order record exists only after successful payment. Learners must flag and resolve this conflict rather than choose silently. |

#### Legacy test inventory for Units 2–4

| ID | Existing test summary |
|---|---|
| `TC-LEG-01` | Place one in-stock item through web checkout with a valid card. |
| `TC-LEG-02` | Display an error when the card provider declines payment. |
| `TC-LEG-03` | Apply a campaign discount to a VIP customer on mobile; expected discount is “correct.” |
| `TC-LEG-04` | Agent refunds an order. |
| `TC-LEG-05` | Send confirmation email after checkout. |
| `TC-LEG-06` | Accept item quantity 10. |
| `TC-LEG-07` | Customer opens an order details page. |
| `TC-LEG-08` | Complete checkout with cash on delivery. |

Detailed flawed cases used in Unit 4:

| Test ID | Preconditions | Steps | Expected result | Cleanup |
|---|---|---|---|---|
| `TC-LEG-02` | A customer and an in-stock item exist. | Open checkout, enter a card that will be declined, and submit. | A correct error appears and the order is not completed. | None stated |
| `TC-LEG-03` | A VIP customer has a valid campaign code. | On mobile, add an item, apply the campaign code, and pay. | The correct discount is shown. | Delete the order |
| `TC-LEG-04` | An agent and a paid order exist. | Open the order, select refund, enter a reason, and confirm. | The refund succeeds when approval is required. | None stated |

#### Minimal relational schema for Unit 6

| Table | Required fields |
|---|---|
| `customers` | `customer_id`, `name`, `email`, optional `phone`, `vip`, `active`, optional `postal_code`, optional `birth_month` |
| `orders` | `order_id`, `customer_id`, `idempotency_key`, `channel`, `status`, `subtotal`, `discount_amount`, `order_total`, `created_at` |
| `order_items` | `order_id`, `sku`, `quantity`, `unit_price` |
| `payments` | `payment_id`, `order_id`, `method`, `status`, `provider_test_token`, `amount`, `created_at` |
| `refunds` | `refund_id`, `order_id`, optional `sku`, optional `quantity`, `amount`, `reason`, `requested_by`, optional `approved_by`, `status`, `created_at` |

Primary and foreign keys follow the `_id` relationships shown above. Learners must derive remaining constraints from approved sources and record unresolved status vocabulary or partial-refund structure as questions rather than silently completing the schema.

#### Risk and operational evidence

| ID | Evidence supplied to learners |
|---|---|
| `RISK-01` | Checkout is the primary revenue path; 65% of completed orders originate on mobile. |
| `RISK-02` | A previous provider-timeout incident created duplicate card charges for 14 customers. |
| `RISK-03` | A reservation-release defect caused sellable stock to remain unavailable for several hours. |
| `RISK-04` | Refund authorization and audit evidence are compliance controls and require independent approval testing. |
| `RISK-05` | Notification delivery is operationally useful but must not block an otherwise successful paid order. |
| `RISK-06` | Test environments previously contained copied customer email addresses and phone numbers. |

#### Change request released during Unit 2

`CR-01`: “Support agents must be able to refund individual order lines and quantities rather than only the complete order. Existing refund approval, payment, notification, and audit behavior should continue to apply.” The change request intentionally omits cumulative approval handling, repeated partial refunds, discount allocation, shipping allocation, rounding, final order status, and concurrent refund behavior. These omissions are findings to raise, not rules for learners or AI to invent.

#### Data inventory for Unit 6

| Field | Classification | Training constraint |
|---|---|---|
| Customer name | Direct identifier | Generate synthetic values only |
| Email and phone | Direct identifier/contact channel | Use reserved/non-routable values only |
| Customer ID | Pseudonymous identifier | Synthetic UUID; preserve references across tables |
| Postal code and birth month | Quasi-identifiers | Minimize and assess linkage risk |
| Card PAN, CVV, access token | Credential/payment secret | Never include; use provider-issued test tokens |
| Order, item, payment, and refund IDs | Business identifiers | Synthetic values with referential integrity |
| Amount, status, timestamps | Transaction data | Preserve business rules and state order; use synthetic values |

#### Tabletop simulation cards for Unit 5 — trainer only

If no executable environment is available, the trainer reveals one card only after the learner performs the trigger. Learners receive the system context and available observation channels, but not the outcome column in advance.

| Card | Trigger | Outcome revealed by trainer |
|---|---|---|
| `SIM-01` | Payment request times out and the learner retries with the same idempotency key and payload. | One order and one charge exist; the second response returns the original order reference. |
| `SIM-02` | Payment fails after inventory reservation. | UI shows failure; inventory remains reserved after 16 minutes; the audit record lacks the release transition. |
| `SIM-03` | Notification provider is unavailable after a paid order. | Order remains paid; attempts occur at 1 and 5 minutes; two customer-visible messages share the same business event ID. |
| `SIM-04` | Agent requests two partial refunds whose cumulative value exceeds VND 2,000,000. | The second refund completes without manager approval; product behavior is observable but conflicts with an unresolved `CR-01` decision. |
| `SIM-05` | Customer changes the URL from their order ID to another synthetic customer's order ID. | API returns another customer's order summary while the UI hides payment details. |
| `SIM-06` | Mobile checkout loses connectivity immediately after payment submission. | Reopening the app shows `PENDING_PAYMENT`; the provider stub shows a successful charge and no automatic status reconciliation within the session. |

#### Trainer-controlled answer policy

- Do not distribute a single “perfect” AI prompt or one canonical test suite before submission.
- Maintain an answer key of evidence-backed issues and acceptable alternatives, not exact wording.
- Accept different prioritization when the learner states assumptions and uses supplied evidence consistently.
- Reject invented product rules even when the proposed behavior seems reasonable.
- Replace any accidental real personal data or active contact details before distributing the pack.

## 5. Responsible AI working agreement

The following rules apply in every unit:

- Do not send production data, credentials, secrets, personal data, or proprietary source material to an unapproved AI service.
- Treat AI output as a draft or hypothesis, not as evidence that a requirement is correct or a test has passed.
- Require the AI to cite requirement IDs or supplied source excerpts for every recommendation.
- Separate facts, assumptions, questions, and suggestions in generated output.
- Record the model/tool, prompt version, source set, reviewer, and review result when the output becomes a formal test artifact.
- Use deterministic rules or executable checks to validate calculations, constraints, and generated datasets where possible.
- A named human remains accountable for approval, prioritization, and release decisions.

---

# Unit 1 — AI-assisted requirement analysis: testability and ambiguity detection

**Duration:** 8 hours  
**Unit goal:** Convert unclear requirement material into a structured, reviewable, and testable requirement baseline without inventing product behavior.

## Learning outcomes

After this unit, learners can:

- Assess functional and non-functional requirements using explicit quality criteria.
- Detect ambiguous terms, missing conditions, conflicts, hidden assumptions, unverifiable outcomes, and missing failure behavior.
- Use AI to decompose requirements into actors, triggers, preconditions, rules, inputs, outputs, exceptions, and observable results.
- Rewrite acceptance criteria in a testable form while preserving business intent.
- Classify AI findings as evidence-backed issue, inferred risk, clarification question, or optional improvement.

## Session breakdown

### Session 1.1 — What makes a requirement testable? (2 hours)

- Requirement types: business need, user story, acceptance criterion, business rule, interface contract, constraint, and quality attribute.
- Testability criteria: specificity, observability, controllability, measurability, consistency, feasibility, and traceability.
- Anatomy of a testable requirement: actor, trigger, precondition, action, rule, expected outcome, exception, and measurable threshold.
- Common quality problems:
  - Vague qualifiers: “fast,” “easy,” “secure,” “normally,” “as appropriate.”
  - Missing units, thresholds, sources of truth, time windows, and tolerance.
  - Unclear pronouns, scope, actors, ownership, and sequence.
  - Combined requirements and conflicting business rules.
  - Unspecified error handling, recovery behavior, and edge conditions.
- Differences between functional testability and non-functional measurability.

**Practice:** Individually annotate five weak requirements and identify which parts cannot be objectively verified.

### Session 1.2 — Structured requirement review with AI (2 hours)

- Supplying bounded context: glossary, requirement IDs, product rules, system boundaries, and out-of-scope behavior.
- Prompt pattern: role + source + review criteria + constraints + output schema + uncertainty rules.
- Asking AI to extract rather than immediately rewrite.
- Useful output fields:
  - Requirement ID and source excerpt.
  - Detected issue and issue category.
  - Why the issue affects testing or delivery.
  - Clarification question and likely stakeholder.
  - Suggested rewrite clearly marked as a proposal.
  - Confidence and evidence reference.
- Preventing hallucination through “source-only” analysis and explicit `Not specified` values.

**Demo:** Analyze the same user story with a weak prompt and a controlled prompt; compare unsupported assumptions and review effort.

### Session 1.3 — Ambiguity, contradiction, and missing-rule detection (2 hours)

- Lexical, syntactic, semantic, referential, temporal, and scope ambiguity.
- Cross-requirement contradiction analysis.
- Detecting missing alternate flows, permission rules, validation rules, state changes, and data lifecycle expectations.
- Turning unclear quality attributes into measurable questions using examples such as latency percentile, concurrency, recovery time, accessibility standard, and retention period.
- Human validation workflow: accept, reject, edit, defer, and escalate.

**Workshop:** Teams review a requirement pack and create an ambiguity/clarification register. Each finding must point to source evidence.

### Session 1.4 — Testable rewrite and quality gate (2 hours)

- Rewriting acceptance criteria in Given/When/Then or rule/example form.
- Preserving business intent and avoiding premature UI or implementation detail.
- Separating one requirement into independently verifiable statements.
- Creating a Definition of Ready quality gate for testability.
- Peer-review calibration: compare findings, remove duplicates, and challenge AI overreach.

**Assessment activity:** Refine two functional requirements and one non-functional requirement; explain every material change.

## Unit deliverable

**Requirement Quality Report**, containing:

- Structured decomposition of selected requirements.
- Ambiguity and issue register with severity and evidence.
- Stakeholder clarification questions.
- Proposed testable acceptance criteria.
- Assumption log and rejected AI suggestions.
- Requirement testability score before and after refinement.

## Quality criteria

- Every finding is linked to a source requirement or explicitly labeled as an inference.
- Proposed wording is measurable and does not silently add scope.
- Functional and non-functional risks are both considered.
- Important contradictions and missing exception paths are surfaced.
- Final decisions are human-reviewed and auditable.

## Unit 1 assessed exercise — Requirement quality investigation

**Exercise ID:** `EX-U1-RQA`  
**Mode:** Individual analysis followed by pair calibration  
**Learner timebox:** 180 minutes plus 20 minutes of peer review  
**Assessment value:** 10 course points

### Inputs

- Requirement excerpts, confirmed business rules, interface constraints, and system context from the minimum exercise source pack.
- The responsible AI working agreement and generic prompt frame in this document.
- A blank copy of the submission tables below.

### Instructions

1. Select at least six requirement excerpts, including two functional requirements and two non-functional requirements.
2. Before using AI, decompose each selected requirement into actor, trigger, precondition, action, rule, data, result, exception, and observable evidence. Record `Not specified` rather than completing gaps from experience.
3. Manually identify ambiguity, missing information, contradiction, testability issue, and product/quality risk. Each finding must contain a source excerpt, impact, priority, and a question addressed to an appropriate stakeholder.
4. Run one bounded AI review using only the approved source pack. Require source IDs, explicit assumptions, confidence, and `Not specified` for missing facts.
5. Compare the manual and AI findings. Mark every AI item `Accept`, `Edit`, `Reject`, or `Escalate`, and explain at least three decisions, including at least one rejection or substantial edit.
6. Propose testable wording for two functional requirements and one non-functional requirement. Where a stakeholder decision is missing, write a clarification placeholder instead of inventing a value.
7. Create a five-to-eight-item Definition of Ready checklist and rescore the three rewritten requirements using the unit quality criteria.

### Required submission

1. `requirement-decomposition` table:

   | Requirement ID | Actor/role | Trigger/precondition | Rule/data | Result/oracle | Exception | Missing information |
   |---|---|---|---|---|---|---|

2. `clarification-register` table:

   | Finding ID | Requirement/source excerpt | Issue type | Test/delivery impact | Clarification question | Stakeholder | Priority | Evidence or inference |
   |---|---|---|---|---|---|---|---|

3. `ai-review-log` table:

   | AI item ID | Source IDs used | AI suggestion | Confidence | Human disposition | Reason | Final action |
   |---|---|---|---|---|---|---|

4. Before/after wording for two functional and one non-functional requirement.
5. Definition of Ready checklist and before/after testability scores.
6. The prompt used, AI tool/model if policy permits recording it, prompt date/version, and reviewer name.

### Minimum completion standard

- At least 10 non-duplicate findings across at least four issue types.
- At least eight actionable stakeholder questions, with priority and impact.
- The API/process-note conflict is either identified or explicitly recorded as outside the learner's selected scope.
- No proposed threshold, state, security control, or workflow is presented as approved without source evidence.

### Scoring rubric

| Criterion | Points | Full-credit evidence |
|---|---:|---|
| Manual decomposition and issue discovery | 2.0 | Important actors, rules, data, outcomes, exceptions, and cross-layer gaps are visible |
| Evidence and issue classification | 2.0 | Findings cite exact sources and separate facts, inferences, risks, and questions |
| Clarification quality and prioritization | 1.5 | Questions are answerable, stakeholder-directed, and tied to concrete impact |
| Testable rewrites and quality gate | 2.0 | Wording is measurable, source-faithful, and avoids premature implementation detail |
| AI critique and human decisions | 1.5 | Accepted, edited, and rejected output is justified; hallucinations are caught |
| Traceability, format, and responsible AI | 1.0 | IDs, prompt provenance, assumptions, and review ownership are auditable |

**Critical cap:** A submission that silently treats invented product behavior as approved fact, or sends prohibited data to an unapproved AI service, cannot receive more than 5/10 for this exercise.

### Trainer answer indicators

Strong submissions usually challenge words such as “immediately,” “quickly,” “securely,” “best,” “eligible,” “when required,” “completed,” “fast,” “accessible,” and “as long as needed.” They also identify missing recovery and observability behavior and the conflict between `PENDING_PAYMENT` creation and the older process note. These are indicators, not a fixed answer list; score other evidence-backed findings on their merit.

---

# Unit 2 — Coverage-gap analysis and requirement-to-test traceability with AI

**Duration:** 8 hours  
**Unit goal:** Build defensible traceability and use AI to identify missing, weak, duplicated, or obsolete coverage.

## Learning outcomes

After this unit, learners can:

- Define traceability between requirements, risks, scenarios, detailed tests, datasets, and execution evidence.
- Use AI to propose links while distinguishing exact, partial, indirect, and unsupported coverage.
- Detect gaps across business rules, quality attributes, interfaces, roles, states, data conditions, and negative behavior.
- Analyze requirement changes and identify impacted test assets.
- Measure coverage without relying on misleading test-case counts.

## Session breakdown

### Session 2.1 — Traceability model and evidence (2 hours)

- Why traceability matters: scope control, review, change impact, audit, and release confidence.
- Artifact hierarchy: objective → requirement → risk → condition/scenario → test case/charter → data → execution evidence → defect.
- Stable identifiers and versioning conventions.
- Forward, backward, bidirectional, and vertical traceability.
- Coverage status definitions:
  - **Full:** all stated conditions are directly verified.
  - **Partial:** only part of the behavior or quality threshold is verified.
  - **Indirect:** evidence comes from another test or lower-level check.
  - **None:** no valid linked verification.
  - **Blocked/Not testable:** requirement requires clarification or unavailable capability.

**Practice:** Link a small set of requirements and existing tests manually before using AI.

### Session 2.2 — AI-assisted traceability mapping (2 hours)

- Normalizing requirement and test-case language before semantic matching.
- AI-assisted candidate-link generation using IDs, business concepts, rules, and expected outcomes.
- Requiring a rationale and evidence for each proposed link.
- Handling many-to-many relationships and shared setup.
- Thresholds and review queues: auto-suggest, human confirm, never auto-approve critical links.
- Detecting false traceability caused by keyword overlap.

**Lab:** Produce a draft requirement traceability matrix from a requirement pack and a legacy test suite, then validate each AI-proposed link.

### Session 2.3 — Multidimensional coverage-gap analysis (2 hours)

- Requirement coverage versus risk coverage and behavioral coverage.
- Coverage dimensions:
  - Personas, roles, permissions, and channels.
  - Positive, negative, alternate, recovery, and abuse paths.
  - Input classes and boundary values.
  - Business-rule combinations and state transitions.
  - Integrations, failures, retry behavior, idempotency, and timeouts.
  - Performance, security, accessibility, compatibility, reliability, and privacy.
- Identifying duplicates, contradictions, obsolete tests, and tests with no requirement or risk rationale.
- Why `100% requirements linked` does not mean adequate testing.

**Workshop:** Generate a coverage heatmap and select the five most consequential gaps.

### Session 2.4 — Change-impact analysis and traceability governance (2 hours)

- Diffing requirement versions and classifying semantic changes.
- Finding directly and indirectly impacted assets.
- Identifying new tests, tests to update, regression candidates, and obsolete tests.
- Traceability quality checks in review or CI workflows.
- Ownership, update frequency, approval, and audit trail.

**Assessment activity:** Process a change request and produce a reviewed impact report with confidence levels.

## Unit deliverable

**AI-assisted Traceability and Coverage Pack**, containing:

- Traceability model and ID convention.
- Reviewed requirement-to-test matrix.
- Coverage status and rationale for each link.
- Coverage-gap heatmap grouped by risk and quality dimension.
- Duplicate/orphan/obsolete asset list.
- Change-impact report for the supplied change request.

## Quality criteria

- Links are supported by behavior-level evidence, not keyword similarity alone.
- Partial coverage is not mislabeled as full coverage.
- Critical and high-risk requirements have explicit test evidence or a documented action.
- Non-functional, interface, negative, and recovery coverage is visible.
- Traceability can be updated when either a requirement or a test changes.

## Unit 2 assessed exercise — Defensible traceability and change impact

**Exercise ID:** `EX-U2-TRACE`  
**Mode:** Pairs, with an individual validation note  
**Learner timebox:** 190 minutes plus 20 minutes of review  
**Assessment value:** 10 course points

### Inputs

- The approved Unit 1 requirement baseline, or the original source pack with unresolved items marked `Blocked/Not testable`.
- `TC-LEG-01` through `TC-LEG-08`, `RISK-01` through `RISK-06`, and `CR-01`.
- The coverage-status definitions from Session 2.1.

### Instructions

1. Define stable ID and version conventions for requirements, risks, scenarios/tests, data, change requests, and review evidence.
2. Manually map at least three requirements to the legacy tests. Use behavior and observable outcomes, not shared keywords.
3. Ask AI for candidate links for the remaining scope. Require a source-based rationale and confidence for every candidate; do not allow automatic approval.
4. Validate each proposed link as `Full`, `Partial`, `Indirect`, `None`, or `Blocked/Not testable`. Record the human reviewer and rejection reason for false links.
5. Build a coverage heatmap across requirement/risk and at least five dimensions: positive, negative, role/authorization, state/recovery, interface/integration, and one non-functional dimension.
6. Identify duplicates, orphans, obsolete tests, and the five most consequential gaps. Propose an action, owner, and priority for each selected gap.
7. Release `CR-01`. Produce a change-impact report covering direct and indirect requirements, tests, data, roles, interfaces, audit/notification behavior, and regression scope. Missing business decisions must become clarification questions.
8. Each learner writes a short individual note explaining one AI link they rejected or downgraded and the evidence used.

### Required submission

1. Traceability model and ID/version convention.
2. Reviewed matrix:

   | Link ID | Requirement/risk ID | Test ID | Coverage status | Behavior-level evidence | Gap/limitation | AI confidence | Human decision/reviewer |
   |---|---|---|---|---|---|---|---|

3. Coverage heatmap:

   | Requirement/risk | Positive | Negative | Authorization | State/recovery | Integration | Quality attribute | Priority action |
   |---|---|---|---|---|---|---|---|

4. Duplicate/orphan/obsolete register and prioritized top-five gaps.
5. `CR-01` impact report:

   | Impact ID | Changed source | Impacted asset/layer | Direct or indirect | Required action | Confidence | Open question | Owner |
   |---|---|---|---|---|---|---|---|

6. AI prompt/output review log and each learner's individual validation note.

### Minimum completion standard

- All nine requirement excerpts and all eight legacy tests appear in the inventory, even when out of selected execution scope.
- Every claimed `Full` link shows all relevant stated conditions and an observable oracle.
- `TC-LEG-07` is not accepted as authorization coverage merely because it mentions order access.
- `TC-LEG-08` is classified as obsolete or supported by new evidence supplied by the trainer.
- `CR-01` analysis includes at least eight impacted assets or layers and five unanswered product questions.

### Scoring rubric

| Criterion | Points | Full-credit evidence |
|---|---:|---|
| Traceability model and controlled IDs | 1.0 | Artifact relationships and version/update rules are usable |
| Link validation and evidence | 2.5 | Statuses are behavior-based; partial and false links are correctly handled |
| Coverage-gap analysis | 2.0 | Multiple dimensions reveal meaningful missing, duplicate, orphan, and obsolete coverage |
| Change-impact analysis | 2.0 | Direct/indirect impacts span UI, API, data, integration, security, audit, and operations as relevant |
| AI validation and individual reasoning | 1.5 | Human review catches weak semantic matches and explains decisions |
| Clarity, ownership, and auditability | 1.0 | Actions, priorities, confidence, questions, and owners are explicit |

**Critical cap:** Unsupported links that materially hide missing payment, refund authorization, or privacy coverage cap this exercise at 5/10.

### Trainer answer indicators

Expected seeded findings include partial coverage in `TC-LEG-01` through `TC-LEG-06`, false authorization confidence in `TC-LEG-07`, and obsolete scope in `TC-LEG-08`. `CR-01` should affect refund rules, authorization, cumulative calculations, order/refund state, payment calls, discount allocation, data, audit, notifications, detailed tests, and regression selection. Learners may identify additional justified impacts.

---

# Unit 3 — AI-assisted scenario generation and risk-based prioritization

**Duration:** 8 hours  
**Unit goal:** Generate a diverse but controlled scenario portfolio and prioritize it according to explicit business and quality risks.

## Learning outcomes

After this unit, learners can:

- Generate scenarios from requirements, risks, models, domain rules, and historical evidence.
- Apply established test-design techniques instead of accepting generic AI brainstorming.
- Identify scenario blind spots and reduce redundant scenario sets.
- Score scenarios using transparent likelihood, impact, detectability, exposure, and change factors.
- Build a balanced smoke, critical-path, regression, and deep-testing portfolio.

## Session breakdown

### Session 3.1 — Scenario sources and generation strategy (2 hours)

- Difference between a test condition, scenario, case, checklist item, and exploratory idea.
- Scenario sources: acceptance criteria, business rules, architecture, interfaces, risk register, defect history, analytics, production incidents, and user journeys.
- Scenario diversity model:
  - Happy path and critical business flow.
  - Validation and negative input.
  - Alternate and exception flow.
  - State, sequence, timing, concurrency, and recovery.
  - Role, permission, tenant, locale, device, and environment.
  - Security misuse, privacy, accessibility, and operational failure.
- Constraining AI by scope, source, abstraction level, and maximum output size.

**Practice:** Generate scenarios from one requirement using three different source combinations and compare quality.

### Session 3.2 — AI plus systematic test-design techniques (2 hours)

- Equivalence partitioning and boundary value analysis.
- Decision-table generation and validation for business-rule combinations.
- State-transition and event-sequence scenarios.
- Pairwise/combinatorial ideas for configuration coverage.
- Use-case, user-journey, error-guessing, and fault-injection scenarios.
- Metamorphic relations and invariant-based scenarios where exact expected outputs are difficult.
- Checking whether AI-generated scenarios actually conform to the selected technique.

**Lab:** Create and verify a decision table and state model, then derive scenarios from both.

### Session 3.3 — Risk identification and prioritization (2 hours)

- Product risk versus project risk.
- Risk dimensions: probability, customer/business impact, safety/security/privacy impact, change complexity, usage frequency, detectability, recoverability, and historical defect density.
- Sample scoring model: `Priority score = likelihood × impact × exposure`, modified by change and detectability factors.
- Calibrating ordinal scores and avoiding false mathematical precision.
- Using AI to summarize evidence, challenge missing risks, and explain ranking—not to make final release decisions.
- Mapping priorities to test depth, execution frequency, and automation candidates.

**Workshop:** Teams score a common scenario set, reconcile disagreements, and record the evidence behind final priorities.

### Session 3.4 — Portfolio optimization and review (2 hours)

- Deduplicating semantically overlapping scenarios.
- Identifying scenario families and reusable variations.
- Balancing breadth, depth, time, environment cost, and data cost.
- Selecting smoke, critical path, targeted regression, full regression, and exploratory candidates.
- Sensitivity analysis: how the plan changes when impact, deadline, or platform scope changes.

**Assessment activity:** Create a prioritized test scenario portfolio for a release with a fixed execution budget.

## Unit deliverable

**Risk-based Scenario Portfolio**, containing:

- Scenario catalog grouped by feature, quality dimension, and scenario type.
- Source requirement/risk references.
- Applied test-design technique for each scenario family.
- Risk scores, assumptions, rationale, and owner.
- Selected smoke/regression/exploratory subsets.
- Deferred scenarios and documented residual risk.

## Quality criteria

- Scenario generation is systematic and covers more than happy paths.
- Priorities are evidence-based, explainable, and reproducible by another reviewer.
- Critical business, security, privacy, and recovery risks are not hidden by average scores.
- Duplicate scenarios are consolidated without losing important variations.
- Deferred coverage has an explicit residual-risk statement.

## Unit 3 assessed exercise — Risk-based scenario portfolio

**Exercise ID:** `EX-U3-SCENARIO`  
**Mode:** Team design with individual risk defense  
**Learner timebox:** 200 minutes plus a 10-minute defense per team  
**Assessment value:** 10 course points

### Inputs

- Approved requirements, traceability gaps, and `CR-01` questions from Units 1–2.
- Confirmed business rules, interface constraints, and `RISK-01` through `RISK-06`.
- Fixed release budget: at most 12 executable scenarios or 180 minutes of estimated execution time, whichever is reached first.

### Instructions

1. Select one checkout/payment requirement and generate three small candidate sets: requirement-only, requirement-plus-business-rules, and requirement-plus-risks/incidents. Compare what each source combination adds, misses, duplicates, or invents.
2. Create and validate a decision table for discount eligibility and precedence. Include VIP state, campaign-code validity, expected applied discount, and an impossible/irrelevant combination policy.
3. Create a state model for order/payment/inventory behavior, including at least pending, paid, failed/timed-out, reservation expiry/release, retry/idempotency, and invalid transitions. Clearly label any state not approved by a source as a question.
4. Derive scenarios using at least three techniques, including a decision table or state transition and one boundary, sequence/concurrency, fault-injection, or authorization technique.
5. Score each scenario from 1–5 for likelihood, impact, and exposure. Calculate `base score = likelihood × impact × exposure`; record evidence and use an explicit tie-break rule. AI may challenge scores but may not make the final ranking.
6. Consolidate semantic duplicates into scenario families without removing important data, role, platform, or state variations.
7. Select smoke, targeted regression, exploratory, and deferred subsets within the fixed budget. For every deferred high-risk scenario, document residual risk and a follow-up trigger.
8. Defend one inclusion and one deferral that changed after human review of AI output.

### Required submission

1. Three-source generation comparison and AI review log.
2. Reviewed discount decision table and order/payment/inventory state model.
3. Scenario catalog:

   | Scenario ID | Objective | Source/risk IDs | Technique | Variation/type | Expected oracle | L | I | E | Score | AI proposal | Human decision |
   |---|---|---|---|---|---|---:|---:|---:|---:|---|---|

4. Portfolio decision table:

   | Scenario/family | Subset | Estimated minutes | Selection rationale | Dependency/data | Residual risk if deferred | Follow-up trigger |
   |---|---|---:|---|---|---|---|

5. Budget calculation, duplicate-consolidation log, assumptions, and individual/team defense notes.

### Minimum completion standard

- At least 20 reviewed candidate scenarios before consolidation and at least 12 distinct scenario families afterward.
- Positive, negative, boundary, authorization, timeout/retry, idempotency, state/recovery, mobile, and audit/observability perspectives are considered.
- Every priority score has evidence; arithmetic alone is not treated as evidence.
- Selected work stays within both budget limits, and all deferred critical/high risks have residual-risk statements.

### Scoring rubric

| Criterion | Points | Full-credit evidence |
|---|---:|---|
| Source-diverse scenario generation | 1.5 | Candidate sets reveal the effect of requirements, rules, and risk evidence |
| Correct test-design techniques | 2.0 | Decision/state/boundary or other techniques are valid and scenarios follow them |
| Breadth and oracle quality | 1.5 | Important functional, quality, role, state, recovery, and platform risks are testable |
| Risk scoring and evidence | 2.0 | Scores are calibrated, reproducible, and tied to supplied facts |
| Budgeted portfolio and residual risk | 2.0 | Selection is feasible, balanced, and transparent about deferred exposure |
| AI critique, traceability, and defense | 1.0 | Human decisions, source IDs, assumptions, and changed choices are auditable |

**Critical cap:** A portfolio that omits duplicate-charge/idempotency or refund-authorization risk without an explicit, defensible residual-risk decision cannot receive more than 5/10.

### Trainer answer indicators

Strong portfolios usually rank duplicate-charge prevention, payment timeout/retry, reservation release, refund authorization/audit, and mobile critical flow highly because of `RISK-01` through `RISK-04`. Notification failure should generally not block a paid order because of `RISK-05`. Exact ordering may differ when evidence and budget tradeoffs are coherent.

---

# Unit 4 — AI-assisted detailed test cases: refinement and quality review

**Duration:** 8 hours  
**Unit goal:** Turn selected scenarios into high-quality test cases and use AI as a critic, refactoring assistant, and consistency checker.

## Learning outcomes

After this unit, learners can:

- Generate detailed test-case drafts from approved requirements and scenarios.
- Define precise preconditions, data, actions, checkpoints, and expected results.
- Detect weak or fabricated test oracles and unobservable expectations.
- Review test cases for correctness, clarity, independence, maintainability, coverage, and automation readiness.
- Refactor duplicated or brittle tests while preserving traceability.

## Session breakdown

### Session 4.1 — Anatomy of an executable test case (2 hours)

- Required fields: ID, objective, scope, priority, references, preconditions, test data, steps, expected results, cleanup, and environment constraints.
- Business intent versus interaction detail.
- One observable action and checkpoint per step where practical.
- Expected result as a test oracle: exact, measurable, source-backed, and visible through UI/API/database/logs as appropriate.
- Positive, negative, alternate, and recovery test structure.
- Separating shared setup from the behavior under test.

**Practice:** Repair incomplete test cases containing vague actions and non-verifiable expected results.

### Session 4.2 — Controlled test-case drafting with AI (2 hours)

- Providing only approved requirements, scenarios, business rules, and templates.
- Generating one reviewed case before generating a family of cases.
- Requesting `Not specified` instead of fabricated data or outcomes.
- Parameterization versus unnecessary case duplication.
- Including cleanup and rollback requirements.
- Generating manual cases without embedding fragile selectors or implementation assumptions.

**Lab:** Generate detailed cases for a high-priority scenario family and conduct source-by-source validation.

### Session 4.3 — AI-assisted quality review and defect detection (2 hours)

- Review dimensions:
  - Requirement alignment and traceability.
  - Technical and business correctness.
  - Completeness of setup, action, oracle, and cleanup.
  - Clarity and reproducibility.
  - Independence and order sensitivity.
  - Data and environment feasibility.
  - Maintainability and duplication.
  - Security/privacy of examples and logs.
- Detecting impossible state, missing prerequisite, weak assertion, contradictory expected result, hidden dependency, and unapproved assumption.
- Pair review: AI critique followed by human adjudication.

**Workshop:** Review a deliberately flawed test suite and classify findings by severity and confidence.

### Session 4.4 — Refactoring and automation readiness (2 hours)

- Converting repeated steps into reusable setup, action, and verification concepts without hiding business meaning.
- Distinguishing test-case quality from automation implementation detail.
- Automation-candidate criteria: value, repeatability, stability, oracle availability, execution cost, and maintenance cost.
- Designing cases for diagnostic failure output.
- Versioning, review gates, and change-impact feedback to traceability.

**Assessment activity:** Submit a refined test-case set plus an AI review log showing accepted and rejected recommendations.

## Unit deliverable

**Reviewed Detailed Test Suite**, containing:

- Detailed test cases for selected high-risk scenarios.
- Requirement, risk, and scenario references.
- Explicit test data and cleanup rules.
- Review findings with severity and disposition.
- Automation-candidate recommendation and rationale.
- Change log between AI draft and approved version.

## Quality criteria

- Each test case is executable by another qualified tester without hidden knowledge.
- Expected results are objective, observable, and supported by a source.
- Cases do not rely on accidental order or uncontrolled shared data.
- Test data, environment, and cleanup are feasible.
- AI suggestions and human decisions are distinguishable in the audit trail.

## Unit 4 assessed exercise — Reviewed executable test suite

**Exercise ID:** `EX-U4-CASES`  
**Mode:** Individual drafting with pair review  
**Learner timebox:** 210 minutes plus 25 minutes of pair review  
**Assessment value:** 10 course points

### Inputs

- The approved high-priority scenario portfolio from Unit 3.
- Requirement/business-rule IDs, interface constraints, `TC-LEG-01` through `TC-LEG-07`, and available synthetic data.
- Required test-case fields from Session 4.1.

### Instructions

1. Diagnose and repair `TC-LEG-02`, `TC-LEG-03`, and `TC-LEG-04`. List each vague action, missing precondition, weak oracle, hidden dependency, cleanup issue, and unsupported assumption before rewriting.
2. Select a high-priority scenario family and ask AI to draft one case using only approved sources. Review it source by source before requesting related cases.
3. Produce at least six executable cases covering a successful flow, validation/boundary, authorization, provider timeout or retry, state/recovery, and audit/observability concern. One case may cover multiple types when this does not obscure the objective.
4. Each step must have an observable checkpoint where relevant. Identify the observation layer as UI, API, database, integration stub, log/metric, or audit record.
5. Use explicit synthetic test data or reusable dataset IDs. Specify isolation, reset, cleanup, and safe rerun behavior; do not depend on test execution order.
6. Run an AI-assisted quality review against the unit criteria. Adjudicate every material suggestion and record accepted, edited, rejected, or escalated status.
7. Classify each case's automation readiness as `Now`, `Later`, or `Not recommended`, with value, repeatability, stability, oracle availability, setup cost, and maintenance rationale.

### Required submission

1. Flaw diagnosis and repaired versions for the three assigned legacy tests.
2. At least six detailed cases using this minimum structure:

   | Field | Required content |
   |---|---|
   | ID/title/objective | Unique ID and one testable purpose |
   | References | Requirement, rule, risk, and scenario IDs |
   | Priority/scope | Evidence-based priority and included/excluded behavior |
   | Preconditions/environment | Required state, roles, services, clocks, and stubs |
   | Test data | Synthetic values or dataset IDs and intended validity |
   | Steps/expected results | Numbered action and objective observable result for each checkpoint |
   | Cleanup | State reset, reservation/payment/refund cleanup, and rerun behavior |
   | Automation readiness | `Now`, `Later`, or `Not recommended` with rationale |

3. Review register:

   | Finding ID | Test case/step | Quality issue | Severity | Source evidence | AI or human | Disposition | Change made |
   |---|---|---|---|---|---|---|---|

4. AI prompt/provenance log and change log from first draft to approved suite.

### Minimum completion standard

- At least six approved cases, all executable by a peer without undocumented product knowledge.
- Every expected result is measurable or directly observable and cites an approved source when it asserts business behavior.
- At least two cases verify more than the UI by using API, database, audit, integration-stub, or log evidence.
- Payment/refund cases define safe provider stubs or test tokens and prevent real financial or contact activity.
- Cleanup and idempotent rerun behavior are explicit for every state-changing case.

### Scoring rubric

| Criterion | Points | Full-credit evidence |
|---|---:|---|
| Diagnosis and repair of flawed cases | 1.5 | Seeded and consequential defects are explained before correction |
| Source alignment and traceability | 1.5 | Every case and oracle maps to approved requirement/rule/risk evidence |
| Executability and oracle strength | 2.5 | Preconditions, steps, data, outcomes, and observation layers are precise |
| Independence, data, and cleanup | 1.5 | Cases are isolated, safely repeatable, and operationally feasible |
| Review quality and AI adjudication | 1.5 | Findings have severity, evidence, disposition, and visible changes |
| Maintainability and automation readiness | 1.5 | Reuse avoids hidden behavior and recommendations reflect realistic cost/value |

**Critical cap:** Cases that could contact real users, charge a real payment method, expose secrets, or pass using an unverifiable expected result cannot receive more than 5/10 until corrected.

### Trainer answer indicators

The repaired legacy cases should expose reservation release/audit evidence for a declined payment, calculate the discount from `BR-DIS-01` rather than expect “correct,” and cover refund age, value, approval separation, authorization, and original payment method. Accept different case decomposition when traceability and observability remain clear.

---

# Unit 5 — AI-assisted exploratory charters and checklist generation

**Duration:** 8 hours  
**Unit goal:** Use AI to accelerate preparation for exploratory testing while preserving tester agency, learning, and adaptation.

## Learning outcomes

After this unit, learners can:

- Create focused exploratory charters from product risks, changes, personas, architecture, and incident history.
- Apply exploratory heuristics and tours to diversify investigation.
- Generate concise, context-specific checklists for repeatable quality concerns.
- Run, document, and debrief a timeboxed exploratory session.
- Distinguish a charter from a scripted test case and a checklist from a completeness guarantee.

## Session breakdown

### Session 5.1 — Exploratory testing foundations (2 hours)

- Simultaneous learning, test design, and execution.
- Scripted, ad hoc, and structured exploratory testing.
- Charter anatomy using `Explore [target] with [resources] to discover [risk/information]`.
- Scope, mission, timebox, data, environment, oracles, constraints, and stopping conditions.
- Session-Based Test Management: charter, session notes, bugs, issues, setup, test data, and coverage observations.

**Practice:** Convert three broad statements such as “test checkout” into focused, risk-oriented charters.

### Session 5.2 — AI-assisted charter generation (2 hours)

- Context sources: feature changes, risk register, personas, integrations, architecture, usage analytics, defect clusters, and operational incidents.
- Generating charter options at different depths rather than a long generic list.
- Heuristics and tours:
  - CRUD, boundaries, consistency, interruption, concurrency, and recovery.
  - User journey, novice/expert, accessibility, and locale tours.
  - Interface, dependency, observability, and failure-injection tours.
  - Security misuse, privacy, and authorization exploration.
- Selecting and editing charters based on session value and available time.

**Lab:** Generate a charter portfolio, then remove vague, overlapping, and low-value charters.

### Session 5.3 — Checklist generation and adaptation (2 hours)

- When to use a checklist: recurring review, release readiness, platform consistency, and high-frequency risk reminders.
- Checklist qualities: concise, actionable, observable, non-duplicative, and context-specific.
- Functional and cross-functional checklist categories: validation, permissions, error handling, compatibility, accessibility, security, privacy, performance, resilience, analytics, and recovery.
- Using prior defects and incidents without leaking confidential data.
- Avoiding universal “mega-checklists” that create noise and false confidence.

**Workshop:** Create a feature-specific checklist and a reusable quality checklist; explain which items should not be reused blindly.

### Session 5.4 — Session execution, note analysis, and debrief (2 hours)

- Lightweight notation for actions, observations, questions, bugs, risks, and next ideas.
- Capturing enough evidence to reproduce important findings.
- Using AI after the session to cluster notes, summarize coverage, suggest follow-up charters, and draft issue statements.
- Preventing AI from converting unverified observations into confirmed defects.
- Debrief questions: what was tested, what was learned, what remains uncertain, and what should happen next?

**Assessment activity:** Run a 45–60 minute exploratory session and deliver a concise debrief with evidence.

## Unit deliverable

**Exploratory Testing Pack**, containing:

- Prioritized charter portfolio linked to risks.
- One context-specific checklist and one reusable checklist.
- Session notes with time allocation and coverage observations.
- Defects, questions, and follow-up ideas clearly separated.
- Session debrief and next-charter recommendations.

## Quality criteria

- Each charter has a clear target, purpose, and risk or learning objective.
- Charters allow adaptation and are not disguised step-by-step scripts.
- Checklists are short enough to use and tailored to the product context.
- Findings retain evidence and uncertainty status.
- Debrief identifies remaining unknowns rather than claiming unmeasured completeness.

## Unit 5 assessed exercise — Exploratory mission and debrief

**Exercise ID:** `EX-U5-EXPLORE`  
**Mode:** Pairs for preparation, individual or paired execution  
**Learner timebox:** 90 minutes preparation, 45–60 minutes execution, 45 minutes debrief  
**Assessment value:** 10 course points

### Inputs and environment

- `CR-01`, the risk evidence, traceability gaps, and high-priority scenarios from prior units.
- A trainer-provided safe test environment with synthetic accounts and payment/notification stubs. If no executable environment exists, use a trainer-led tabletop simulation with response cards; label all observations as simulated.
- Known environment limitations, build/version, available logs, and reset instructions.

### Instructions

1. Rewrite these broad missions into focused charters: “test checkout,” “test refunds,” and “check mobile quality.” Each charter must name a target, resources or heuristics, a risk/learning objective, timebox, scope boundary, and useful evidence.
2. Ask AI for candidate charters using only the approved change, risks, architecture, and previous gaps. Remove vague, overlapping, low-value, unsafe, or infeasible proposals and explain at least three decisions.
3. Produce a prioritized portfolio of at least six charters across critical journey, authorization/misuse, state/recovery, integration failure, mobile/accessibility, and data/privacy perspectives.
4. Create one feature-specific checklist of 10–15 items and one reusable quality checklist of 8–12 items. Tag each reusable item with the contexts where it applies and where it may create noise.
5. Select one charter and run a 45–60 minute session. Capture timestamped actions, observations, questions, bugs, risks, blockers, evidence references, and next ideas. Adapt the charter when useful and record why.
6. After the session, AI may cluster or summarize notes, but the learner must verify the summary. Do not allow uncertain observations to become confirmed defects.
7. Deliver a debrief explaining coverage, important evidence, defects versus questions, remaining unknowns, and recommended next charter.

### Required submission

1. Charter portfolio:

   | Charter ID | Explore target | With resources/heuristics | To discover risk/information | Timebox | Scope/out of scope | Data/environment | Priority/source IDs |
   |---|---|---|---|---:|---|---|---|

2. Feature-specific and reusable checklists, including applicability notes.
3. Session log:

   | Time | Type (`TEST/OBS/QUESTION/BUG/RISK/BLOCKER/NEXT`) | Action or observation | Evidence | Confidence | Follow-up |
   |---|---|---|---|---|---|

4. Defect/question register with reproduction evidence and uncertainty kept separate.
5. One-page debrief, AI prompt/review log, and recommendation for the next session.

### Minimum completion standard

- At least six non-duplicate charters; every charter has a clear mission and a source-backed risk or learning goal.
- Both checklists meet the requested size ranges and are usable during testing rather than being generic topic lists.
- The executed session lasts 45–60 minutes unless a blocking condition is documented.
- At least one session pivot or explicit decision to stay on mission is justified using evidence.
- Notes distinguish observed behavior, suspected defect, unanswered question, and confirmed defect.

### Scoring rubric

| Criterion | Points | Full-credit evidence |
|---|---:|---|
| Charter focus, diversity, and prioritization | 2.0 | Missions are actionable, risk-linked, feasible, and non-duplicative |
| Checklist quality and contextual reuse | 1.5 | Items are concise, observable, tailored, and bounded by applicability |
| Session execution and adaptation | 2.0 | Time is purposeful; pivots and stopping choices follow emerging evidence |
| Notes and reproducible evidence | 2.0 | Important observations can be investigated without inflating certainty |
| Debrief and next action | 1.5 | Coverage, findings, unknowns, and next charter are decision-useful |
| AI critique and responsible handling | 1.0 | AI output is reviewed; no prohibited data or false defect claims appear |

**Critical cap:** Fabricating execution evidence, reporting a simulated observation as real, or exposing prohibited data caps the exercise at 5/10.

### Trainer answer indicators

Useful charter themes include payment timeout and duplicate prevention, reservation release after failure, partial-refund authorization and cumulative value, mobile interruption/recovery, notification-provider failure without order rollback, accessibility of error recovery, and privacy exposure in logs/test data. The exploratory path should remain adaptable rather than reproducing Unit 4 test scripts.

---

# Unit 6 — AI-assisted test data generation, masking and boundary datasets

**Duration:** 8 hours  
**Unit goal:** Design realistic, reproducible, constraint-valid, and privacy-safe test data using AI-supported generation and validation.

## Learning outcomes

After this unit, learners can:

- Translate test conditions into explicit data requirements and dataset schemas.
- Generate synthetic records that respect type, range, format, uniqueness, relationship, and business constraints.
- Build equivalence, boundary, invalid, temporal, stateful, and combinatorial datasets.
- Choose appropriate masking, pseudonymization, tokenization, or synthetic-data strategies.
- Validate dataset quality, privacy risk, representativeness, reproducibility, and cleanup.

## Session breakdown

### Session 6.1 — Test data strategy and data requirements (2 hours)

- Test data categories: baseline, positive, negative, boundary, state-based, role-based, temporal, volume, security, privacy, and recovery.
- Data sources: hand-crafted, generated, production-like synthetic, masked copy, service virtualization, and seeded fixtures.
- Schema and constraint inventory:
  - Data types, formats, ranges, precision, and nullability.
  - Uniqueness, keys, references, cardinality, and ordering.
  - Cross-field rules and business invariants.
  - Lifecycle state, timestamps, locale, and time zone.
- Mapping scenario IDs to reusable dataset IDs.

**Practice:** Derive a data-requirement specification from a prioritized scenario set.

### Session 6.2 — Boundary and combinatorial dataset generation (2 hours)

- Equivalence classes and robust boundary sets: just below, at, and just above limits.
- Empty, null, missing, malformed, duplicate, maximum length, precision, encoding, and special-character values.
- Date/time boundaries: leap year, daylight-saving transition where relevant, month/year end, expiry, ordering, and clock skew.
- Stateful datasets and valid transition sequences.
- Pairwise/combinatorial datasets for multiple dimensions.
- Asking AI to output the reason and expected validity of every row.

**Lab:** Generate boundary and negative datasets, then verify them with schema and business-rule checks.

### Session 6.3 — Privacy-safe masking and synthetic data (2 hours)

- Sensitive-data classification: direct identifier, quasi-identifier, confidential business data, credential, and regulated data.
- Masking approaches and tradeoffs:
  - Substitution, shuffling, redaction, perturbation, hashing, tokenization, encryption, and format-preserving transformation.
  - Fully synthetic data when reversibility or linkage risk is unacceptable.
- Referential integrity and deterministic transformation across related tables.
- Re-identification, linkage, memorization, and small-population risks.
- Data minimization, access control, retention, environment separation, and audit.
- Why AI should not receive raw production records merely to “make them safe.”

**Workshop:** Select a protection method for each field in a sample data inventory and explain residual risk.

### Session 6.4 — Dataset validation, reproducibility, and operations (2 hours)

- Automated validation: schema, types, constraints, distribution, uniqueness, referential integrity, invariants, and expected invalidity.
- Data quality versus realism: avoid reproducing harmful bias or assuming production frequency equals required test coverage.
- Privacy validation: scan for known patterns, exact-match leakage, rare combinations, and retained secrets.
- Reproducibility through generators, seeds, versions, and provenance.
- Dataset setup, isolation, reset, teardown, and expiry.
- Reviewing AI-generated values for culturally inappropriate, unsafe, or operationally active contact details.

**Assessment activity:** Produce a versioned dataset package and validation report for selected functional and non-functional scenarios.

## Unit deliverable

**Privacy-safe Test Data Package**, containing:

- Data-requirement specification linked to scenarios.
- Schema, constraints, and data dictionary.
- Baseline, boundary, invalid, stateful, and selected combinatorial datasets.
- Masking/synthetic-data decision table and residual-risk notes.
- Validation results, generator seed/version, setup, and cleanup instructions.
- Evidence that generated contact information and identifiers cannot affect real users or systems.

## Quality criteria

- Every record has a test purpose or representative-data rationale.
- Expected-valid rows satisfy all known constraints; expected-invalid rows violate only the intended rule where practical.
- Referential integrity and state consistency are preserved.
- No real secrets or unnecessary personal data are present.
- Generation is reproducible and cleanup is explicit.

## Unit 6 assessed exercise — Reproducible privacy-safe dataset

**Exercise ID:** `EX-U6-DATA`  
**Mode:** Individual implementation with peer privacy review  
**Learner timebox:** 210 minutes plus 20 minutes of peer review  
**Assessment value:** 10 course points

### Inputs

- Approved scenarios from Units 3–5, interface/data constraints, and the Unit 6 data inventory.
- Synthetic schema tables for `customers`, `orders`, `order_items`, `payments`, and `refunds`; learners may express them as CSV, JSON, SQL fixtures, or an equivalent approved format.
- Trainer-approved validation tools. Raw production records are not an input.

### Instructions

1. Select at least eight scenarios, including valid, invalid, boundary, stateful, authorization, and privacy-relevant scenarios. Derive a data requirement for each and map scenario IDs to dataset IDs.
2. Define a data dictionary with type, format, nullability, range, uniqueness, reference, cross-field rule, lifecycle state, sensitivity, and expected-validity fields.
3. Build equivalence and robust boundary sets for `items` count, `quantity`, `orderTotal`, `email` length/format, and `refundReason`. Include just-below, at, and just-above values where representable.
4. Create at least 24 purposeful records across the related tables. Include baseline, invalid, state-transition, provider-timeout/idempotency, refund, and selected pairwise/combinatorial rows. An invalid row should violate only its intended rule where practical.
5. Produce a field-level protection decision table. Use synthetic data for direct identifiers, exclude secrets/PAN/CVV, preserve referential integrity, and explain residual linkage risk for quasi-identifiers.
6. Use AI only to propose data or review gaps. Validate output with deterministic schema/business-rule checks; do not treat plausible-looking AI output as proof.
7. Make generation reproducible using a documented seed, generator/prompt version, fixed reference clock and time zone, and stable dataset version.
8. Define setup, isolation, reset, teardown, expiry, and contact-safety checks. Run validation and attach both passing results and intentionally expected failures.

### Required submission

1. Scenario-to-data specification:

   | Dataset ID | Scenario IDs | Purpose | Expected valid? | Required state | Boundary/class | Expected rule or oracle |
   |---|---|---|---|---|---|---|

2. Schema/data dictionary:

   | Table.field | Type/format | Required/range | Unique/reference | Cross-field/state rule | Sensitivity | Protection |
   |---|---|---|---|---|---|---|

3. Versioned dataset files or tables with at least 24 purposeful records.
4. Masking/synthetic decision table:

   | Field/class | Risk | Chosen method | Referential requirement | Validation | Residual risk | Retention/access rule |
   |---|---|---|---|---|---|---|

5. Validation report:

   | Check ID | Dataset/record | Rule | Expected | Actual | Pass/fail | Evidence/fix |
   |---|---|---|---|---|---|---|

6. Seed/version/reference clock, generator or prompt provenance, setup/reset/cleanup instructions, and AI review log.

### Minimum completion standard

- At least eight linked scenarios and 24 purposeful related records, not filler rows.
- Boundary evidence includes `quantity` 0, 1, 10, and 11; item counts 0, 1, 20, and 21; and just-below/at/just-above order-total limits.
- Duplicate idempotency keys cover same-key/same-payload and same-key/different-payload behavior, with the latter recorded as a clarification if no rule defines it.
- No PAN, CVV, credential, secret, real customer record, or routable personal contact information is present.
- Automated or deterministic checks verify schema, intended validity, uniqueness, references, state order, and contact safety.

### Scoring rubric

| Criterion | Points | Full-credit evidence |
|---|---:|---|
| Scenario-linked data requirements | 1.5 | Each dataset exists for a clear test purpose and expected result |
| Boundary, negative, and combinatorial design | 2.0 | Values systematically cover classes and isolate intended invalidity |
| Schema, rules, state, and referential integrity | 2.0 | Related records are internally consistent and lifecycle-valid |
| Privacy and contact safety | 2.0 | Methods fit field risk; secrets are excluded and linkage risk is considered |
| Deterministic validation and reproducibility | 1.5 | Checks, seed, version, clock, and expected failures can be rerun |
| Operations and AI audit trail | 1.0 | Setup, reset, expiry, cleanup, provenance, and review decisions are complete |

**Critical cap:** Any real secret, payment credential, unnecessary personal data, or potentially active customer contact value results in a critical failure for this exercise until removed and investigated.

### Trainer answer indicators

Expected boundaries follow the supplied constraints, but learners should not invent the behavior for same idempotency key with a changed payload. Strong submissions preserve customer/order/item/payment/refund references, model legal and illegal state sequences, use reserved contact domains, and show that intentionally invalid rows fail only the targeted validation where practical.

---

# 6. Assessment strategy

## Exercise administration

- The six assessed unit exercises are developed during their respective units and are the six unit deliverables worth 60% in total. Each exercise is scored out of 10 and contributes 10 course points without further conversion.
- The trainer publishes the source-pack version, build/environment version, allowed tools, collaboration mode, submission location, and deadline before work starts.
- Unless an exercise explicitly allows team work, analysis and final decisions must be the learner's own. Team submissions must identify each learner's contribution and retain the required individual note or defense.
- A submission may use Markdown, spreadsheet, test-management export, JSON, or another approved format when every required field, ID, link, and audit record remains reviewable.
- Learners must preserve AI prompts and material outputs when policy permits. If the organization prohibits storing raw output, record a redacted prompt summary, output hash/reference, model/tool, date, reviewer, and disposition.
- Clarification gaps do not reduce a score when correctly detected and handled as `Not specified`, `Blocked/Not testable`, or a stakeholder question. Inventing an answer to hide a gap does.
- Trainers apply the published rubric rather than counting artifact volume. Concise evidence-backed work may score higher than a long generic AI-generated submission.
- Resubmission after a critical cap requires removal of unsafe material, an impact check, and a short root-cause/prevention note; simply deleting the row is insufficient.

## Common evidence rules

A claim is considered evidence-backed when it points to an approved requirement, rule, interface contract, risk/incident record, observed test result, or trainer-approved clarification. AI output, common industry practice, and learner experience may suggest a question or risk but are not product facts. Every assessed artifact must keep these categories distinguishable:

| Category | Meaning | Permitted use |
|---|---|---|
| Fact | Directly supported by an approved source or observation | May define expected behavior and coverage |
| Inference/risk | Reasonable concern derived from evidence | May drive investigation or priority; cannot silently become a rule |
| Assumption | Temporary condition adopted to continue work | Must be explicit, owned, and validated before release use |
| Question | Missing decision or conflicting evidence | Sent to a named role and tracked to resolution |
| Suggestion | Optional proposed wording/design/test improvement | Requires human review and source alignment |

## Formative assessment

- Short knowledge checks at the start or end of each unit.
- Prompt and output critique exercises.
- Peer review using the unit quality criteria.
- Trainer observation during hands-on labs.
- Reflection log: accepted, revised, and rejected AI recommendations.

## Summative assessment

| Component | Weight | Evidence |
|---|---:|---|
| Six unit deliverables | 60% | 10% per unit |
| Integrated capstone | 30% | End-to-end AI-assisted requirement and test design pack |
| Individual defense and responsible-AI review | 10% | Explanation of decisions, validation, limitations, and data handling |

**Recommended pass mark:** 70/100 overall, with no critical failure in requirement correctness, traceability integrity, privacy, security, or source attribution.

## Capstone brief

Learners receive a new or extended feature and must produce a coherent package that includes:

1. Requirement quality and ambiguity analysis.
2. Clarification log and testable acceptance criteria.
3. Requirement–risk–scenario–test traceability.
4. Coverage-gap analysis and risk-based scenario priorities.
5. Detailed test cases for the highest-priority scenarios.
6. Exploratory charters and a focused checklist.
7. Boundary and privacy-safe test data with validation evidence.
8. AI usage log showing prompts, assumptions, verification, accepted suggestions, and rejected suggestions.

### Capstone execution rules

**Capstone ID:** `CAP-AIQE-ARTD`  
**Mode:** Individual, or team artifact with individual defense when approved by the trainer  
**Recommended effort:** Built incrementally from the six unit exercises, followed by 4–6 hours of integration and review  
**Assessment value:** 30 course points, plus 10 course points for the individual defense and responsible-AI review

1. The trainer supplies a source-pack extension containing at least one new requirement, one changed business rule or interface, one operational risk, and one deliberate ambiguity. The extension must not disclose the answer key.
2. Learners baseline the new source version and perform change/impact analysis before reusing unit artifacts. Copying prior work without checking the change earns no integration credit.
3. The package must maintain an unbroken chain from source requirement and risk through scenario, detailed case or charter, dataset, expected evidence, and open gap/residual risk.
4. Learners select depth according to risk rather than expanding every artifact equally. Deferred work must show rationale, owner, trigger, and residual risk.
5. At least one AI recommendation must be accepted, one materially edited, and one rejected with evidence. If the AI produces no rejectable material, the learner documents a challenge prompt and explains why its result was still acceptable.
6. Deterministic validation must be used for calculations, decision tables, data constraints, or traceability integrity where practical.
7. Before submission, run a privacy/security scan and confirm that all accounts, contacts, identifiers, tokens, and payment values are synthetic or approved test values.

### Capstone submission structure

```text
CAP-AIQE-ARTD/
  00-readme-and-scope
  01-source-baseline-and-change-log
  02-requirement-quality-and-clarifications
  03-traceability-coverage-and-impact
  04-scenario-risk-portfolio
  05-detailed-test-suite
  06-exploratory-pack
  07-test-data-and-validation
  08-ai-provenance-and-human-review
  09-residual-risk-and-recommendation
```

Each section may be a file, worksheet, test-management view, or stable link. `00-readme-and-scope` must identify the learner/team, source versions, environment/build, approved AI/tooling, known limitations, and navigation to every artifact.

### Individual defense

The trainer conducts a 15–20-minute defense and selects at least four questions from different areas:

- Show one requirement issue the AI missed and one AI suggestion you rejected.
- Trace one critical risk from source through scenario, case/charter, data, and evidence.
- Explain why one link is partial rather than full coverage.
- Recalculate or defend one priority and describe what would change it.
- Demonstrate how a selected expected result is observable across UI, API, data, integration, or logs.
- Explain one deferred risk and the trigger for revisiting it.
- Reproduce a dataset and show one expected-valid and one expected-invalid validation result.
- Explain how personal data, secrets, active contacts, and unsafe AI inputs were prevented.

The defense score belongs to the individual even when a shared artifact is allowed. A learner who cannot explain material decisions in their attributed work cannot receive full defense credit.

## Capstone rubric

| Dimension | Weight | Strong performance indicators |
|---|---:|---|
| Requirement analysis | 15% | Finds consequential ambiguity and proposes source-faithful, measurable refinements |
| Traceability and coverage | 15% | Links are evidence-backed; partial and missing coverage are visible |
| Scenario design | 15% | Uses systematic techniques and covers meaningful positive, negative, state, and quality risks |
| Risk prioritization | 10% | Scoring is transparent, calibrated, and tied to execution decisions |
| Detailed test-case quality | 15% | Cases are clear, executable, maintainable, and have strong oracles |
| Exploratory assets | 10% | Charters are focused and adaptive; checklists are concise and contextual |
| Test data and privacy | 15% | Data is constraint-valid, boundary-aware, reproducible, and privacy-safe |
| Responsible AI practice | 5% | Sources, assumptions, validation, limitations, and human approvals are auditable |

### Capstone scoring and critical failures

- Score each rubric dimension against the integrated package, not merely the existence of a unit artifact. Convert the weighted rubric directly to 30 points.
- The separate 10-point defense assesses decision ownership, ability to trace evidence, validation reasoning, limitations, and responsible-AI handling.
- Critical failures include fabricated source behavior presented as fact, materially false traceability, unsafe or real personal/secret/payment data, fabricated test evidence, or inability to distinguish AI output from approved product evidence.
- A critical failure must be remediated before the learner can pass the course, even if the arithmetic total is at least 70.
- Minor formatting errors do not constitute critical failure when the artifact remains understandable and auditable.

# 7. Recommended reusable AI workflow

Use this loop across all six units:

1. **Scope:** Define the task, product boundary, target artifact, and exclusions.
2. **Ground:** Supply approved source material, IDs, glossary, rules, and template.
3. **Generate:** Request a small, structured draft with rationale and evidence fields.
4. **Challenge:** Ask for contradictions, missing perspectives, assumptions, and confidence.
5. **Verify:** Compare output to sources and validate rules, calculations, and data using non-AI checks where possible.
6. **Decide:** A human accepts, edits, rejects, or escalates each material recommendation.
7. **Trace:** Record provenance, version, reviewer, and links to downstream artifacts.
8. **Improve:** Update the prompt, source pack, rubric, or workflow based on observed failure patterns.

## Generic prompt frame

```text
Role:
Act as a test design assistant. Do not make product or release decisions.

Task:
[Describe one bounded analysis or generation task.]

Approved sources:
[Provide requirement IDs, exact excerpts, rules, glossary, and relevant risks.]

Review/design criteria:
[List the techniques or quality rubric to apply.]

Constraints:
- Use only the supplied sources for product facts.
- Do not invent missing behavior, values, thresholds, or dependencies.
- Write "Not specified" when evidence is missing.
- Separate facts, assumptions, questions, and suggestions.
- Cite the supporting requirement/rule ID for each item.

Output:
[Define a table or JSON schema with ID, evidence, rationale, confidence, and review status.]
```

# 8. Suggested tooling

The course is tool-agnostic. Depending on organizational policy, learners may use:

- An approved enterprise generative AI assistant.
- Requirement and test management tools.
- Markdown, spreadsheet, or ALM-based traceability matrices.
- JSON Schema/OpenAPI validators and lightweight scripts for data validation.
- Pairwise or model-based test design tools.
- A source repository for versioning prompts, datasets, test assets, and review evidence.

Tool proficiency is not the assessment target. The assessment focuses on source fidelity, test-design quality, risk reasoning, validation, privacy, and accountable human review.
