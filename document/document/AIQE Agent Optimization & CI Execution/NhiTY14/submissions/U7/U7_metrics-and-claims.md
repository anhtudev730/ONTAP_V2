# U7_metrics-and-claims — Execution Metrics, Schedule Review & AI Claim Audit

```
Mode: DRY-RUN
Source IDs + versions:
  METRIC-PACKET-07 (E01–E10; SL-01–SL-04; AI draft)
  REQ-PACKET-AOCE v1 (AC-EMP-01/02, LAB-AOCE-03/04/05)
  FLOW-PACKET-03 (F01/F02/F03)
  POLICY-PACKET-AOCE v1
Assumptions / Not specified:
  - Cohort: 10 selected logical case executions; code lab-a7; prompt/context v3;
    app build ui-12; environment isolated-lab.
  - "Đơn vị tiền giả lập" — không phải USD hay giá provider thực tế.
  - Budget cohort 1,20 đơn vị là policy synthetic.
  - Model/provider price thực tế: Not specified.
  - Test duration không gồm queue/install/cleanup; không gọi là end-to-end latency.
  - E08 measured subtotal 0,08 phản ánh model+CI đã đo được; model usage MISSING
    nên measured subtotal 0,08 là lower bound, không phải total thực.
  - Không tự bịa inputs còn thiếu (E07 forecast inputs, E08 model usage).
Manual analysis (trước AI): xem các phần bên dưới.
```

---

## Phần 1 — Metric Dictionary

> **Cohort scope:** E01–E10, code `lab-a7`, prompt `v3`, build `ui-12`, environment `isolated-lab`.
> Runs: D71={E01–E03}, D72={E04–E06}, D73={E07–E10}.

### 1.1 Selected / Executed

| Metric | Value | Numerator | Denominator | Included EIDs | Unknowns | Interpretation |
|---|---|---|---|---|---|---|
| **Selected** | 10 | 10 | 10 logical case executions | E01–E10 | — | Toàn bộ cohort là selected theo packet |
| **Executed** (attempts > 0) | 8 | 8 | 10 selected | E01, E02, E03, E04, E05, E08, E09, E10 | — | E06 (blocked trước execution), E07 (skipped trước execution) không được tính |
| **Not-executed** | 2 | 2 | 10 selected | E06, E07 | — | E06: Viewer account chưa ready; E07: budget guard kích hoạt |

> **Mandatory gate:** E06 (blocked) và E07 (skipped) KHÔNG được gộp vào pass. Chúng xảy ra trước assertion.

---

### 1.2 First-pass / Eventual-pass / Flaky

| Metric | Value | Numerator | Denominator | Included EIDs | Unknowns | Interpretation |
|---|---|---|---|---|---|---|
| **First-pass** | 4 | 4 | 8 executed | E01 (F01), E03 (F03), E08 (F02), E10 (F01) | — | Passed với đúng 1 attempt |
| **Flaky-pass** | 2 | 2 | 8 executed | E02 (F02), E05 (F02) | — | Passed nhưng cần 2 attempts; pass-after-retry ≠ root cause fixed |
| **Eventual-pass** (first + flaky) | 6 | 6 | 8 executed | E01, E02, E03, E05, E08, E10 | — | Tất cả EID có outcome pass (bất kể số attempts) |
| **Failed** | 2 | 2 | 8 executed | E04 (F01), E09 (F03) | — | Failed sau tất cả attempts |
| **Blocked** | 1 | 1 | 10 selected | E06 | — | Không được tính vào executed hoặc pass |
| **Skipped** | 1 | 1 | 10 selected | E07 | — | Budget guard; không được tính vào executed hoặc pass |

> **Lưu ý:** "All completed tests passed eventually" cần exclude E04 (failed) và E09 (failed). Eventual-pass rate = 6/8 executed = **75%**, không phải 100%.

---

### 1.3 Retry Overhead

| EID | Attempts | Retries | Notes |
|---|---|---|---|
| E01 | 1 | 0 | — |
| E02 | 2 | 1 | Flaky-pass |
| E03 | 1 | 0 | — |
| E04 | 2 | 1 | Failed after retry |
| E05 | 2 | 1 | Flaky-pass |
| E06 | 0 | 0 | Not executed |
| E07 | 0 | 0 | Not executed |
| E08 | 1 | 0 | — |
| E09 | 1 | 0 | — |
| E10 | 1 | 0 | — |
| **Total** | **11** | **3** | |

| Metric | Value | Numerator | Denominator | Unknowns | Interpretation |
|---|---|---|---|---|---|
| **Total retries** | 3 | 3 | 8 executed cases | — | E02, E04, E05 dùng 1 retry mỗi case |
| **Retry rate** | 3/8 = 37,5% | 3 | 8 executed | — | Tỷ lệ executed cases có ít nhất 1 retry |
| **Total attempts** | 11 | 11 | — | — | 8 first attempts + 3 retries |
| **Retry-pass ratio** | 2/3 = 67% | 2 flaky-pass | 3 retried | Root cause unknown | 2 retried cases passed (E02, E05); 1 failed (E04). Pass-after-retry ≠ fix |

---

### 1.4 Evidence Completeness

| EID | Evidence | Notes |
|---|---|---|
| E01 | full | — |
| E02 | full | — |
| E03 | full | — |
| E04 | full | — |
| E05 | partial | Thiếu assertion artifact |
| E06 | none | Not executed |
| E07 | none | Not executed |
| E08 | full | — |
| E09 | full | — |
| E10 | full | — |

| Metric | Value | Numerator | Denominator | Included EIDs | Unknowns |
|---|---|---|---|---|---|
| **Evidence-full** | 7 | 7 | 10 | E01–E04, E08–E10 | — |
| **Evidence-partial** | 1 | 1 | 10 | E05 | Thiếu assertion artifact |
| **Evidence-none** | 2 | 2 | 10 | E06, E07 | — |
| **Evidence-complete rate** (full / executed) | 6/8 = 75% | 6 | 8 executed | — | E05 partial, E06/E07 not-executed |

> **Evidence-complete pass:** Pass AND full evidence = E01, E02, E03, E08, E10 = **5 EIDs**.
> (E04 full nhưng failed; E05 partial dù flaky-pass → không đủ evidence-complete)

---

### 1.5 Cleanup Completion

| EID | Needs Cleanup | Cleanup Status |
|---|---|---|
| E01 | yes | success |
| E02 | yes | success |
| E03 | no | not-applicable |
| E04 | yes | **failed** — owned record unresolved |
| E05 | yes | success |
| E06 | no | not-applicable |
| E07 | no | not-applicable |
| E08 | yes | **unknown** |
| E09 | no | not-applicable |
| E10 | yes | success |

| Metric | Value | Numerator | Denominator | Included EIDs | Unknowns |
|---|---|---|---|---|---|
| **Cases needing cleanup** | 6 | 6 | 10 | E01, E02, E04, E05, E08, E10 | — |
| **Cleanup success** | 4 | 4 | 6 needing cleanup | E01, E02, E05, E10 | — |
| **Cleanup failed** | 1 | 1 | 6 | E04 | Owned record unresolved — cần reconcile |
| **Cleanup unknown** | 1 | 1 | 6 | E08 | Unknown outcome + missing model usage |
| **Cleanup completion rate** | 4/6 = 67% | 4 | 6 | — | Không thể claim "cleanup is complete" |

---

### 1.6 Requirement Mapping (Design Coverage)

> Mapping chưa chứng minh negative-case coverage hay backend security.
> LAB-AOCE-05 là cross-flow policy — đánh giá riêng, không gộp vào denominator.

| Requirement | Mapped Flow | Executed EIDs | First-pass EIDs | Failed EIDs | Blocked/Skipped |
|---|---|---|---|---|---|
| AC-EMP-01 | F01 | E01, E04, E10 | E01, E10 | E04 | E07 (skipped) |
| AC-EMP-02 | F01 | E01, E04, E10 | E01, E10 | E04 | E07 (skipped) |
| LAB-AOCE-03 | F02 | E02, E05, E08 | E08 | — | — |
| LAB-AOCE-04 | F03 | E03, E09 | E03 | E09 | E06 (blocked) |
| LAB-AOCE-05 | cross-flow | — | — | — | Không gộp vào denominator |

| Metric | Value | Denominator | Unknowns |
|---|---|---|---|
| **Requirements với ≥1 executed case** | 4/4 = 100% | 4 business requirements | Chưa có negative-case coverage |
| **Requirements với ít nhất 1 first-pass** | 4/4 = 100% | 4 | Backend security chưa được chứng minh |
| **Backend security coverage** | 0% | N/A | LAB-AOCE-04 chỉ là UI observation; backend chưa có nguồn |

> **Không nhầm mapping coverage với runtime proof:** E07 skipped → AC-EMP-01/02 chưa được executed đầy đủ.

---

### 1.7 Measured Cost

| EID | Flow | Outcome | Measured Subtotal | Usage Status | Notes |
|---|---|---|---|---|---|
| E01 | F01 | first-pass | 0,10 | complete (no model calls) | — |
| E02 | F02 | flaky-pass | 0,16 | complete | — |
| E03 | F03 | first-pass | 0,04 | complete (no model calls) | — |
| E04 | F01 | failed | 0,18 | complete | — |
| E05 | F02 | flaky-pass | 0,17 | complete | — |
| E06 | F03 | blocked | 0,02 | complete (no model calls) | — |
| E07 | F01 | skipped | 0,00 | complete (no execution) | — |
| E08 | F02 | first-pass | 0,08 | **MISSING model usage** | Chỉ là lower bound; actual total UNKNOWN |
| E09 | F03 | failed | 0,05 | complete (no model calls) | — |
| E10 | F01 | first-pass | 0,09 | complete (no model calls) | — |

| Metric | Value | Included EIDs | Unknowns |
|---|---|---|---|
| **Total measured (lower bound)** | 0,89 | E01–E10 (E08 là lower bound) | E08 model usage missing → actual total > 0,89 |
| **Total known complete** | 0,81 | E01–E07, E09, E10 | Loại E08 ra |
| **Budget (cohort)** | 1,20 | — | Policy synthetic |
| **Budget remaining (lower bound)** | 1,20 − 0,89 = 0,31 | — | Actual remaining có thể thấp hơn do E08 |
| **E08 total** | UNKNOWN | E08 | Missing model usage → không thể tính chính xác |

> **Mandatory gate:** E08 missing usage ≠ zero. Ghi UNKNOWN, không điền 0.

### Evidence-complete-pass cost

| EIDs (evidence-complete pass) | Measured Subtotal |
|---|---|
| E01 | 0,10 |
| E02 | 0,16 |
| E03 | 0,04 |
| E08 | 0,08 (lower bound, model usage missing) |
| E10 | 0,09 |
| **Total** | **0,47 (lower bound; E08 actual unknown)** |

Cost per evidence-complete pass = 0,47 / 5 = **0,094 lower bound** (actual higher due to E08).

---

## Phần 2 — Schedule Review

### 2.1 Slot Data

| Slot | Expected (VN) | Dispatch | Start | Dispatch Delay | Queue Delay | Status |
|---|---|---|---|---|---|---|
| SL-01 | 2026-10-01 01:17 | 01:20 | 01:22 | +3 min | +2 min | Observed |
| SL-02 | 2026-10-02 01:17 | 01:17 | 01:25 | 0 min | +8 min | Observed |
| SL-03 | 2026-10-03 01:17 | 01:19 | 01:20 | +2 min | +1 min | Observed |
| SL-04 | 2026-10-04 01:17 | No dispatch | No start | — | — | ❌ MISSING — cause unknown |

> SL-04 không có actual executed cases → không được thêm vào execution ledger.

### 2.2 Delay Stats (SL-01 → SL-03 only; n=3)

| Metric | Values | Median | Range | Note |
|---|---|---|---|---|
| **Dispatch delay (min)** | 3, 0, 2 | 2 min | 0–3 min | n=3; quá nhỏ để suy pattern tin cậy |
| **Queue delay (min)** | 2, 8, 1 | 2 min | 1–8 min | n=3; SL-02 queue 8 min là max observed nhưng không phán đoán là "outlier" thiếu SLO |

**Schedule completeness:** 3/4 slots có dispatch = **75%**; SL-04 = MISSING (cause unknown).

> Không tự suy percentile hay production reliability từ n=3.

### 2.3 Test Duration (Executed cases only; n=8)

| EID | Test Seconds |
|---|---|
| E01 | 80 |
| E02 | 150 |
| E03 | 40 |
| E04 | 170 |
| E05 | 145 |
| E08 | 85 |
| E09 | 55 |
| E10 | 75 |

Sorted: 40, 55, 75, 80, 85, 145, 150, 170

| Metric | Value | Notes |
|---|---|---|
| **Median** | (80+85)/2 = 82,5 s | n=8; median giữa vị trí 4 và 5 |
| **Range** | 40–170 s | — |
| **Individual values** | Đã liệt kê | — |
| **E06, E07** | not-executed | Không được tính vào duration metric |

> "Test duration" ≠ end-to-end latency (không gồm queue/install/cleanup).

---

## Phần 3 — AI Draft Claim Audit

> **AI draft:**
> *"The agent is production-ready: all completed tests passed eventually. Retries resolved the flaky root cause. CI ran every night on time. Cost is below budget; missing usage is zero. Cleanup is complete. All security coverage is done because Viewer cannot click Create."*

### Claim Audit Table

| # | Claim | Source Refs | Verdict | Corrected Wording |
|---|---|---|---|---|
| **C1** | "The agent is production-ready: all completed tests passed eventually." | E04 (failed, 2 attempts), E09 (failed, 1 attempt); METRIC-PACKET-07 | ❌ **UNSUPPORTED** | Observed: 6/8 executed cases passed eventually; E04 (F01) và E09 (F03) failed. Blocked/skipped chưa được executed. "Production-ready" không thể kết luận từ 10 synthetic cases. |
| **C2** | "Retries resolved the flaky root cause." | E02 (flaky-pass), E05 (flaky-pass), E04 (fail after retry); RET-PACKET-06 (U6) | ❌ **UNSUPPORTED** | Pass-after-retry ≠ root cause identified or fixed. Không có root cause evidence cho E02/E05. E04 failed even after retry. |
| **C3** | "CI ran every night on time." | SL-01 (dispatch +3 min), SL-02 (on time), SL-03 (dispatch +2 min), SL-04 (no dispatch); METRIC-PACKET-07 | ❌ **UNSUPPORTED** | Observed: 3/4 scheduled slots có dispatch. SL-04 (2026-10-04) không có dispatch — nguyên nhân unknown. Dispatch delays lên đến 3 min trên 3 slots đo được. |
| **C4** | "Cost is below budget; missing usage is zero." | E08 (measured 0,08 / usage missing); budget 1,20; total measured lower bound 0,89; METRIC-PACKET-07 | ❌ **PARTIALLY UNSUPPORTED** | Measured lower bound 0,89 < 1,20 budget — phần "below budget" có thể đúng nhưng chưa xác nhận vì E08 usage MISSING. "Missing usage is zero" là **sai** — E08 explicitly ghi "missing"; không được thay bằng zero. |
| **C5** | "Cleanup is complete." | E04 (cleanup: failed — owned record unresolved); E08 (cleanup: unknown); METRIC-PACKET-07 | ❌ **UNSUPPORTED** | E04 cleanup failed; E08 cleanup unknown. Cleanup completion rate = 4/6 = 67%. Không thể claim complete khi có unresolved owned record (E04). |
| **C6** | "All security coverage is done because Viewer cannot click Create." | OBS-33 (FLOW-PACKET-03); LAB-AOCE-04; U3 review log | ❌ **UNSUPPORTED** | Button disabled là UI-layer observation only. Backend authorization chưa được chứng minh — API-level test chưa được thực hiện. Đây là same gap được xác định tại U3. |

---

## Phần 4 — Review Log

| Proposal | Source | Accept/Reject | QA Rationale |
|---|---|---|---|
| AI draft: "all completed tests passed eventually" bỏ qua E04/E09 | METRIC-PACKET-07 | **REJECT** | E04 (F01) failed 2 attempts; E09 (F03) failed. Không thể claim "all passed". Source: packet rows E04, E09. |
| AI draft: "missing usage is zero" | METRIC-PACKET-07 E08 | **REJECT** | E08 explicitly "missing". Zero sẽ undercount cost và làm budget tracking sai. Mandatory gate: missing ≠ zero. |
| Gộp E06 (blocked) và E07 (skipped) vào eventual-pass | (counter-proposal từ review) | **REJECT** | Blocked/skipped xảy ra trước assertion — không phải pass. Mandatory gate. Source: packet definition. |
| Tính cost per evidence-complete pass chỉ dùng 4 EIDs (loại E08) | (review option) | **REJECT — giữ E08 với chú thích lower bound** | E08 là evidence-complete pass (full evidence), dù model usage missing. Loại hẳn là undercount. Giữ E08 với nhãn "lower bound". Source: rubric "xử lý missing usage". |
| Báo "CI ran every night on time" vì 3/4 slots OK | AI draft | **REJECT** | 3/4 không phải "every night". SL-04 missing là gap thực sự cần điều tra. Source: METRIC-PACKET-07 SL-04. |

**Unresolved risks / next evidence / owner:**
- E08 model usage: cần actual model call log để complete cost. Owner: trainer/CI config maintainer.
- E04 owned record unresolved: cần `lab:reconcile` output và owner xử lý trước run tiếp theo.
- E08 cleanup unknown: cần server-side lookup để xác định trạng thái record.
- SL-04 missing: cần investigation theo checklist U5 (workflow file, runner quota, cron event).
- E07 budget guard rationale: forecast inputs chưa được xác nhận — không tự điền cost cho E07.
