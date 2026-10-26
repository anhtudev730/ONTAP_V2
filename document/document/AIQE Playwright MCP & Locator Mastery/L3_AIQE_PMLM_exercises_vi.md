# [NFP] Playwright MCP & Locator Mastery — Bài tập, assessment và capstone

- **Mã khóa học:** `L3_AIQE_PMLM`
- **Tài liệu đi kèm:** `L3_AIQE_PMLM_course_content_vi.md`
- **Phạm vi:** Toàn bộ guided lab, assessed exercise, capstone, rubric, deliverable template và trainer-only setup cho khóa 56 giờ.
- **Nguyên tắc nộp bài:** Mỗi artifact phải phân biệt `REQ-CONFIRMED`, `DOM-OBSERVED`, `RUN-PASSED`, `RUN-FAILED`, `HYPOTHESIS` và `UNKNOWN`. Không được ghi nhận test pass nếu chỉ có typecheck, test discovery, screenshot hoặc MCP snapshot.

## 1. Quy tắc thực hành chung

### 1.1 Test data và environment safety

- Chỉ chạy trên environment, account và repository được giảng viên/tổ chức cấp quyền.
- Mỗi data record learner tạo phải có prefix `E2E-PMLM-<run-id>` và cleanup trong teardown đã được review.
- Không hard-code, in console, commit, chụp ảnh hoặc gửi vào AI/MCP: password, API key, cookie, bearer token, raw production log, PII hoặc payment data.
- Khi browser/runtime bị policy hoặc sandbox chặn, ghi `ENV-BLOCKED` kèm command, error đã sanitize, browser/project và thời điểm; không kết luận application defect.

### 1.2 Cấu trúc source bắt buộc

```text
tests/
  specs/                 # Test intent và assertion cấp scenario
  steps/                 # Business flow
  pages/                 # UI behavior
  elements/              # Locator contract
  fixtures/              # Auth, data lifecycle, teardown
  support/               # Evidence/API cleanup/logger
```

Nếu repository có convention khác, learner phải nêu mapping tương đương trong README. Không đặt locator rải rác trong spec khi framework đã có layer Elements/Pages/Steps.

### 1.3 Evidence record tối thiểu

Với mọi live execution, lưu record sau (không ghi giá trị secret):

```md
- Test ID: `<ID>`
- Command: `<exact sanitized command>`
- Target: `<environment alias>`
- Browser/project: `<value>`
- Source revision: `<commit or local revision reference>`
- Test data ID: `<synthetic ID>`
- Result: `RUN-PASSED` | `RUN-FAILED` | `ENV-BLOCKED`
- Assertions observed: `<list>`
- Artifacts: `<trace/report/screenshot path, or unavailable reason>`
- Cleanup: `<result>`
- Notes: `<scope, limitation or next check>`
```

---

# Unit 1 — Bài tập execution model và MCP boundary

- **Timebox:** 3 giờ guided lab + 1 giờ review/assessment.

## EX-U1-EXEC-MCP: Map lifecycle của flow Sign in

### Input

- `AC-AUTH-01` của case study `PortalLite`.
- Một starter spec và sample test result do giảng viên cung cấp.
- Quyền browser/MCP (nếu environment cung cấp) để inspect trang sign-in bằng account synthetic.

### Nhiệm vụ

1. Vẽ sequence từ command chạy test đến test discovery, worker, fixture setup, browser/context/page, action/assertion, reporter và teardown.
2. Gắn ownership cho browser process, browser context, page và fixture. Chỉ ra một risk nếu hai worker cùng dùng mutable employee data.
3. Inspect sign-in page qua browser, Playwright Inspector hoặc MCP được cấp quyền. Ghi ít nhất ba facts `DOM-OBSERVED` về username, password và submit control.
4. Liệt kê tối thiểu ba điều snapshot/screenshot/tool output không chứng minh được về live test execution.
5. Viết năm quy tắc nhóm dùng MCP an toàn: scope, permission, secret, evidence và review.

### Deliverable

`U1_execution-model-and-mcp.md` chứa:

- Sequence diagram hoặc execution timeline.
- Bảng ownership và isolation risk.
- Bảng evidence có nhãn.
- MCP usage rules.

### Definition of done

- Không xuất hiện credential/token trong artifact.
- Phân biệt đúng browser context với page.
- Không ghi `RUN-PASSED` khi evidence chỉ là browser/MCP observation.

### Rubric (10 điểm)

| Tiêu chí | Điểm |
|---|---:|
| Lifecycle và isolation đúng kỹ thuật | 4 |
| Giới hạn MCP/evidence được nêu chính xác | 3 |
| Timeline liên kết expected state và observed state | 2 |
| Data/secret handling an toàn | 1 |

---

# Unit 2 — Bài tập environment setup và first live test

- **Timebox:** 4 giờ guided lab + 1 giờ review/assessment.

## EX-U2-FIRST-LIVE: Build và chạy `PMLM-001`

### Input

- Project starter hoặc repository automation được cấp quyền.
- Environment variable names và synthetic HR Admin account.
- `AC-AUTH-01`, convention source tree, script runner của repository.

### Nhiệm vụ

1. Inventory `package.json`, Playwright config, TypeScript config, scripts, `.env.example`, test folder và CI convention trước khi thay đổi.
2. Xác nhận browser project/base URL/artifact policy/secret loading đang được config như thế nào. Ghi assumption nếu config không rõ.
3. Viết flow `PMLM-001`: mở login page, điền valid synthetic credential, submit và assert URL/heading của Dashboard.
4. Tách locator/action/flow/spec theo source architecture của project.
5. Chạy focused live test theo script có sẵn. Lưu evidence record; nếu fail/block, triage trung thực thay vì thêm global timeout.

### Reference code boundary

Đây là **shape** của test, không phải locator đã xác nhận cho mọi target:

```ts
await page.goto('/login');
await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
await page.getByLabel('Username').fill(process.env.E2E_USERNAME!);
await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);
await page.getByRole('button', { name: 'Sign in' }).click();
await expect(page).toHaveURL(/\/dashboard$/);
await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
```

Learner phải verify role/name bằng DOM/accessibility evidence trước khi dùng code này.

### Deliverable

- Patch/source code theo framework boundary.
- `U2_first-live-run.md` dùng evidence record chung.
- Nếu applicable: sanitized trace/report reference và cleanup record.

### Definition of done

- Secret chỉ được đọc từ approved environment mechanism.
- Assertion xác nhận authenticated state, không chỉ click success.
- Có live result hoặc `ENV-BLOCKED` record có thể tái lập.

### Rubric (10 điểm)

| Tiêu chí | Điểm |
|---|---:|
| Config và secret handling đúng | 2 |
| User-intent interaction, không bypass UI | 2 |
| Assertion xác nhận post-sign-in state | 2 |
| Live-run record tái lập được | 3 |
| Failure/cleanup triage trung thực | 1 |

---

# Unit 3 — Bài tập DOM, accessibility và locator inventory

- **Timebox:** 3 giờ guided lab + 1 giờ review/assessment.

## EX-U3-LOCATOR-INVENTORY: Employee search và create modal

### Input

- Hai UI state: Employees list và Create employee dialog.
- Employee ID synthetic: `E2E-PMLM-LOC-01`.
- `AC-EMP-01`, `AC-EMP-02`, `NFR-A11Y-01`.

### Nhiệm vụ

1. Inspect search input, Add employee button, result row, department cell, Edit action, create dialog, Save và Cancel.
2. Với mỗi element, ghi role, accessible name, label/test id (nếu có), scope, source evidence và fallback decision.
3. Viết ít nhất sáu locator factory ở layer Elements.
4. Với employee row, bảo đảm query theo employee ID không match nhầm row/cell khác; thêm strictness guard khi uniqueness là precondition.
5. Ghi hai accessibility finding hoặc `UNKNOWN` nếu UI evidence không đủ.

### Required inventory format

| Feature | User intent | Locator proposal | Scope | Evidence | Uniqueness guard | Fallback/decision |
|---|---|---|---|---|---|---|
| Employee create | Submit valid form | `<verified locator>` | `<dialog/component>` | `DOM-OBSERVED:<ref>` | `<count/semantic basis>` | `<decision>` |

### Reference implementation pattern

```ts
const employeeRow = page
  .getByRole('row')
  .filter({ has: page.getByRole('cell', { name: employeeId, exact: true }) });

await expect(employeeRow).toHaveCount(1);
await employeeRow.getByRole('button', { name: 'Edit employee' }).click();
```

Chỉ sử dụng pattern khi table thực sự expose `row`/`cell` role và action name đã được inspect.

### Deliverable và definition of done

- `U3_locator-inventory.md`.
- Source Elements patch.
- Rationale nêu rõ vì sao locator unique, stable và scoped; selector string đơn lẻ không đạt.

### Rubric (10 điểm)

| Tiêu chí | Điểm |
|---|---:|
| Role/name/label được quan sát, không tự suy đoán | 3 |
| Scope/strictness giải quyết duplicate đúng | 3 |
| Locator factory đúng architecture boundary | 2 |
| Accessibility finding/unknown có evidence | 2 |

---

# Unit 4 — Bài tập locator hardening và policy

- **Timebox:** 4 giờ guided lab + 1 giờ review/assessment.

## EX-U4-HARDEN: Locator hardening sprint

### Input

Một legacy spec có 12 selector brittle, kèm DOM/accessibility snapshot của list, sidebar, modal và toast. Một số selector có chủ ý không stable:

```ts
page.locator('.oxd-button')
page.locator('div:nth-child(3) > button')
page.locator('text=Save').last()
page.getByText('John')
page.getByRole('button').nth(1)
```

### Nhiệm vụ

1. Phân loại từng selector: P0 (có thể match sai/false positive), P1 (flake risk cao), P2 (maintenance cost), P3 (readability/style). Ghi DOM/business rationale.
2. Refactor tối thiểu tám selector thành locator semantic, scoped và strict. Không dùng `.first()`, `.last()`, `.nth()`, full XPath, generated class hoặc `force: true` trừ exception đã giải thích.
3. Tạo `LOCATOR_POLICY.md` một trang gồm priority order, test ID convention, exception workflow, ownership và PR checklist.
4. Chạy targeted test(s) hoặc ghi environment blocker. Typecheck/discovery không đủ để chứng minh refactor valid.

### Deliverable

- Source patch.
- `U4_locator-risk-register.md`.
- `LOCATOR_POLICY.md`.
- Evidence record cho targeted run/blocker.

### Definition of done

Mỗi locator mới phải có semantic/DOM basis. Không “fix” strictness bằng chọn position render order.

### Rubric (10 điểm)

| Tiêu chí | Điểm |
|---|---:|
| Phân loại rủi ro có lý do kỹ thuật | 2 |
| Refactor giữ semantic/business scope | 3 |
| Test ID policy usable, có ownership | 2 |
| Anti-pattern review chính xác | 2 |
| Run evidence/blocker record trung thực | 1 |

---

# Unit 5 — Bài tập assertions và synchronization

- **Timebox:** 4 giờ guided lab + 1 giờ review/assessment.

## EX-U5-SYNC: Create employee và archive flow không dùng hard wait

### Input

- `AC-EMP-01` đến `AC-EMP-03`; optional `AC-AUD-01` nếu environment expose audit contract.
- Một test có `waitForTimeout(2000)` ở ba vị trí và occasional failure sau Save.
- Synthetic employee naming convention và approved cleanup mechanism.

### Nhiệm vụ

1. Vẽ state model: empty form → validating → submitting → created/indexed → archived.
2. Thay từng fixed wait bằng actionability, web-first assertion, response/event waiter hoặc controlled polling có rationale.
3. Assert employee tạo ra xuất hiện chính xác một row và department đúng.
4. Archive qua confirm flow; assert employee không còn trong active search. Nếu audit contract có sẵn, xác nhận audit event theo scope đã duyệt.
5. Chạy test nhiều lần theo timebox của lớp. Báo cáo distribution pass/fail, command và artifacts; không gọi test “stable” chỉ dựa một run.

### Synchronization decision record

| Trigger action | Expected state | Signal selected | Why this signal | Rejected option | Evidence after run |
|---|---|---|---|---|---|
| Save employee | Employee searchable in active list | `<assertion/poll/event>` | `<AC/evidence>` | `fixed sleep` | `<RUN label>` |

### Guardrails

- `waitForTimeout()` bị cấm trong business flow, ngoại trừ test cố tình kiểm tra time-based behavior và có comment/rationale reviewer-approved.
- Không dùng retry/global timeout để che product regression hoặc selector wrong.
- Nếu wait response, tạo waiter trước trigger action và chứng minh endpoint/status là contract được phép assert.

### Deliverable

- Source patch.
- `U5_synchronization-rationale.md`.
- Run matrix và triage note (nếu có failure).
- Cleanup result.

### Rubric (10 điểm)

| Tiêu chí | Điểm |
|---|---:|
| Assertion kiểm tra business/UI state hữu ích | 3 |
| Synchronization gắn event/state hợp lý | 3 |
| Không che defect bằng sleep/retry/timeout | 2 |
| Run matrix và triage evidence rõ | 2 |

---

# Unit 6 — Bài tập AI-assisted generation và mandatory review

- **Timebox:** 3 giờ guided lab + 1 giờ review/assessment.

## EX-U6-AI-REVIEW: AI draft → review → validated patch

### Input

- `AC-EMP-01/02`, DOM evidence đã sanitize, coding convention.
- AI-generated draft có 8–12 issue cố ý.
- Review checklist của khóa học.

### Nhiệm vụ

1. Viết một prompt bounded: nêu goal, requirement ID, verified DOM facts, architecture, output format, prohibited data và yêu cầu đánh dấu assumption.
2. Đánh dấu từng line AI draft: `ACCEPT`, `CHANGE`, `REJECT` hoặc `NEEDS-EVIDENCE`.
3. Tìm tối thiểu năm substantive findings về locator, assertion, synchronization, isolation, cleanup, type safety hoặc security. Không tính formatting thuần túy.
4. Tạo patch qua Elements → Pages → Steps → Spec.
5. Hoàn thành AI usage log, human review checklist và validation record.

### AI draft để review

```ts
await page.locator('.employee-form button').last().click();
await page.waitForTimeout(3000);
await expect(page.getByText('Success')).toBeVisible();
await page.getByText(employeeId).click({ force: true });
```

### Review checklist bắt buộc

| Hạng mục | Câu hỏi review |
|---|---|
| Requirement | Assertion có truy về `AC-*`/expected behavior đã xác nhận không? |
| Locator | Role/name/test id có trong DOM evidence? Có unique/scoped không? |
| Action | Có mô phỏng user interaction thay vì bypass UI không? |
| Synchronization | Có fixed sleep, arbitrary timeout, force action hoặc event race không? |
| Test data | Data unique? Cleanup có chạy khi failure? Có shared mutable fixture không? |
| Security | Có secret, token, PII, raw header/log nhạy cảm không? |
| Architecture | Elements/Pages/Steps/Specs có đúng boundary không? |
| Evidence | Live run, discovery/typecheck và blocker có được phân biệt không? |

### Deliverable

- `U6_ai-review-package.md`.
- Sanitized prompt/provenance record.
- Annotated review checklist và patch.
- Validation record.

### Definition of done

Không có line AI-generated được accept mà thiếu requirement/DOM/evidence basis. AI proposal không được ghi là run result.

### Rubric (10 điểm)

| Tiêu chí | Điểm |
|---|---:|
| Prompt bounded, data handling an toàn | 2 |
| Finding technical chính xác, có evidence | 3 |
| Patch đúng framework boundary | 2 |
| Provenance/reviewer decision đầy đủ | 1 |
| Validation không overclaim | 2 |

---

# Unit 7 — Bài tập debugging và evidence collection

- **Timebox:** 4 giờ guided incident lab + 1 giờ review/assessment.

## EX-U7-INCIDENT: Employee archive locator failure

### Incident pack

`PMLM-ARCHIVE-01` intermittently fails tại “Confirm archive”. Call log ghi locator `getByRole('button', { name: 'Confirm' })` match hai button. Screenshot cho thấy một confirmation dialog và một background bulk-action toolbar. Một exploratory snapshot sau rerun chỉ cho thấy dialog có accessible name `Archive employee`.

### Nhiệm vụ

1. Gắn nhãn facts từ call log, screenshot và exploratory snapshot. Tách original failed run với investigation rerun.
2. Lập reproduction matrix tối thiểu ba run với result thật; nếu không chạy được, ghi blocker theo format chung.
3. Đề xuất locator scope cho dialog và post-archive assertion theo `AC-EMP-03`.
4. Quyết định test defect, product accessibility finding, environment/data issue hay `UNKNOWN`. Có thể ghi nhiều classification nếu evidence hỗ trợ.
5. Viết sanitized evidence package và bug report hoặc automation fix proposal.

### Locator candidate cần xác thực

```ts
const archiveDialog = page.getByRole('dialog', { name: 'Archive employee' });
await expect(archiveDialog).toBeVisible();
await archiveDialog.getByRole('button', { name: 'Confirm archive' }).click();
```

Candidate này chưa được accept nếu `Confirm archive` không có trong DOM evidence. Learner phải inspect lại, hoặc giữ `NEEDS-EVIDENCE` và đề xuất bước kiểm tra phân biệt.

### Evidence package structure

```text
U7_incident-evidence-package/
  triage.md
  reproduction-matrix.md
  artifact-manifest.md
  sanitized-failure-evidence/
  patch-or-escalation.md
```

### Artifact manifest format

| Artifact | Source run | Timestamp | Reference/path | Redaction status | What it supports | What it does not prove |
|---|---|---|---|---|---|---|
| Call log | `<run>` | `<time>` | `<path>` | `<status>` | `<fact>` | `<boundary>` |

### Rubric (10 điểm)

| Tiêu chí | Điểm |
|---|---:|
| Phân loại failure dựa trên call log/artifact | 3 |
| Original evidence tách với investigation rerun | 2 |
| Locator fix/escalation có requirement/DOM basis | 2 |
| Evidence package an toàn, tái lập được | 2 |
| Conclusion có unknown/confidence đúng | 1 |

---

# Capstone — Stable employee lifecycle suite

- **Thời lượng:** Tích lũy trong Unit 5–7; demo và defense cuối Unit 7.
- **Mục tiêu:** Triển khai một E2E suite nhỏ nhưng production-minded cho employee lifecycle trong `PortalLite` hoặc application được giảng viên phê duyệt.

## Scope bắt buộc

1. Sign in bằng secret/environment handling an toàn.
2. Tạo employee có generated unique ID và department được chọn.
3. Tìm employee, xác nhận business fields và đi tới employee detail/edit khi flow yêu cầu.
4. Archive có confirmation; xác nhận active search sau archive.
5. Xác nhận audit event nếu environment thực sự expose `AC-AUD-01`; nếu không, ghi `UNKNOWN`/limitation, không fabricate assertion.
6. Thực hiện cleanup-safe teardown cho mọi data tạo trong suite.

## Artifact bắt buộc

```text
capstone/
  README.md                     # Scope, prerequisites, sanitized command
  locator-inventory.md          # Evidence + rationale + exceptions
  synchronization-rationale.md  # State/event model, no-sleep decisions
  ai-usage-log.md               # Sanitized provenance + human review
  review-checklist.md
  evidence/
    run-record.md
    artifact-manifest.md
    triage-note.md              # Chỉ khi có observed failure
```

Source code dùng Elements → Pages → Steps → Specs hoặc equivalent đã giải thích. Có ít nhất ba `test.step()` thể hiện business flow quan trọng, không phải technical micro-step.

## Rubric capstone (100 điểm)

| Hạng mục | Điểm | Tiêu chuẩn |
|---|---:|---|
| Test design và business coverage | 20 | Trace tới AC, happy path/risk chính có assertion phù hợp. |
| Locator engineering | 20 | Semantic/scoped/strict, inventory và test hook rationale rõ. |
| Synchronization/stability | 20 | Không hard sleep/force bypass; state/event assertion có lý do. |
| Isolation, data và cleanup | 15 | Data unique, teardown an toàn, không lộ secret. |
| AI/MCP governance | 10 | Proposal khác evidence; mandatory human review/provenance đầy đủ. |
| Evidence và debugging readiness | 10 | Live result/boundary rõ, manifest và triage khi có failure. |
| Defense | 5 | Giải thích choice, trade-off và unknown. |

**Điều kiện đạt:** ít nhất 70/100 và không có critical fail: fabricated evidence, secret leak, product conclusion chỉ dựa hypothesis, hoặc merge code AI-generated không review.

## Câu hỏi defense

1. Locator này dùng `getByRole` thay vì test id/CSS vì sao? Evidence nào xác nhận accessible name và uniqueness?
2. Assertion nào xác nhận business state sau Save? Vì sao toast một mình không đủ?
3. Test chỉ fail trên CI: cần evidence nào trước khi tăng timeout hoặc thêm retry?
4. AI đề xuất `.last()` và `waitForTimeout(2000)`: review/reject thế nào?
5. MCP snapshot hỗ trợ điều tra gì, và không chứng minh gì về original failed run?

---

# Hướng dẫn cho giảng viên

## Chuẩn bị trước lớp

- Cung cấp repository starter, Node/package lock/browsers đã kiểm tra, environment alias và synthetic account tách theo nhóm.
- Chuẩn bị target/mock server đủ ổn định để learner tập trung locator/synchronization.
- Bật trace retention tương đương `retain-on-failure`; xác nhận location/access trước Unit 7.
- Chuẩn bị UI state cố ý: duplicate button name, modal overlay, missing accessible name, virtualized grid và delayed update.
- Không cấp production credential hoặc quyền destructive ngoài policy.

## Facilitation notes

- Demo một AI/MCP locator proposal fail do name collision để củng cố verification boundary.
- Hỏi learner về intent, scope, DOM evidence và product contract trước khi đánh giá syntax locator.
- Chấm diagnosis có evidence và minimal fix cao hơn việc tăng timeout/retry nhanh nhất.
- Với browser launch/MCP/sandbox failure, yêu cầu learner phân loại infrastructure blocker thay vì suy diễn product defect.

## Pacing gợi ý

| Unit | Guided lab | Review/assessment | Artifact |
|---|---:|---:|---|
| U1 | 3h | 1h | Execution/MCP map |
| U2 | 4h | 1h | First live run record |
| U3 | 3h | 1h | Locator inventory |
| U4 | 4h | 1h | Locator policy + refactor |
| U5 | 4h | 1h | Synchronization rationale |
| U6 | 3h | 1h | AI review package |
| U7 | 4h | 1h | Incident evidence package + defense |
