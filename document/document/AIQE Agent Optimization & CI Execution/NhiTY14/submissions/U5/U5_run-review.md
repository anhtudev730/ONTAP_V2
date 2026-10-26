# U5_run-review — CI Run Packet Reviews & Evidence Analysis

```
Mode: DRY-RUN
Source IDs + versions:
  CI-PACKET-05 (CI-RUN-A, CI-RUN-B, CI-RUN-C; schedule slots SL-01 → SL-04)
  REQ-PACKET-AOCE v1; POLICY-PACKET-AOCE v1
Assumptions / Not specified:
  - Packets CI-RUN-A/B/C là synthetic / SIMULATED — không phải CI đã chạy thật.
  - Kết luận chỉ từ packet data; không có live run URL, actual trace, hay actual reporter.
  - Gọi packets là "packet giả lập" trong toàn bộ review, không gọi là "CI đã chạy".
```

---

## Phần 1 — Run Packet Reviews

### CI-RUN-A

**Packet data:**
```
revision: lab-a5
tests selected=3, executed=3, first-pass=2, fail=1
cleanup unresolved=1
artifacts linked=3
```

| Claim | Source trong packet | Supported / Unsupported / Unknown | Phân tích |
|---|---|---|---|
| 3 tests were selected and executed | `selected=3, executed=3` | ✅ **Supported** (packet claim) | Consistent; không có gap giữa selected và executed |
| 2 tests passed first-pass | `first-pass=2` | ✅ **Supported** (packet claim) | 2 of 3 passed without retry |
| 1 test failed | `fail=1` | ✅ **Supported** (packet claim) | 1 failure; root cause unknown from packet |
| Cleanup unresolved for 1 record | `cleanup unresolved=1` | ✅ **Supported — but action required** | Record owned chưa được cleanup; cần `lab:reconcile` output và owner notification |
| 3 artifacts linked | `artifacts linked=3` | ✅ **Supported** (packet claim) | Artifacts present; content/completeness not verified from packet |

**Verdict:** FAIL / INCOMPLETE — packet reports one failed test and one unresolved cleanup.
Two first-pass results do not make the overall run pass; artifact content and per-flow
identity also remain unverified.

**Missing checks / next action:**
- Unresolved cleanup: xác định owned record ID; chạy `lab:reconcile`; escalate nếu không cleanup được. Owner: run maintainer.
- Fail root cause: cần trace artifact từ failing test; không thể conclude từ packet summary.
- Fail flow identity: packet không chỉ rõ F01/F02/F03 nào fail — cần per-flow report.

---

### CI-RUN-B

**Packet data:**
```
revision: lab-a5
selected=0, executed=0, wrapper exit=0
artifact contains only install log
summary says "100% passed"
```

| Claim | Source trong packet | Supported / Unsupported / Unknown | Phân tích |
|---|---|---|---|
| "100% passed" | Wrapper summary | ❌ **UNSUPPORTED — false green** | 0 tests executed, nên không có assertion evidence. Packet không xác định chính xác wrapper mechanism; `--pass-with-no-tests` là một khả năng cần kiểm tra, không phải fact của run này. |
| selected=0 | Packet | ✅ Fact | 0 tests matched filter — likely `--grep '@smoke'` matched nothing |
| executed=0 | Packet | ✅ Fact | No tests ran; no assertions; no write evidence |
| exit=0 | Wrapper exit code | ✅ Fact; ❌ behavior defect | Wrapper trả success dù không có test execution; nguyên nhân cụ thể chưa rõ. Sửa wrapper để empty selection luôn non-zero. |
| Artifact: only install log | Packet | ✅ Fact — insufficient | Không có test report, trace, hay assertion artifact |

**Verdict:** ❌ FALSE GREEN — không có evidence. "100% passed" không supported.

**Missing checks / next action:**
- Fix wrapper: không dùng `--pass-with-no-tests` hoặc cơ chế tương đương; fail khi 0 tests selected.
- Investigate vì sao `@smoke` match 0 tests trên revision lab-a5. Kiểm tra tag/config/revision; không kết luận nguyên nhân từ packet.
- Re-run sau khi fix wrapper; không dùng CI-RUN-B làm evidence.
- Owner: CI config maintainer.

---

### CI-RUN-C

**Packet data:**
```
revision: lab-a5
dispatched: manual
browser startup failure (infrastructure exception)
selected=3, executed=0
no assertion report, no write evidence
```

| Claim | Source trong packet | Supported / Unsupported / Unknown | Phân tích |
|---|---|---|---|
| 3 tests selected | `selected=3` | ✅ Fact | Discovery worked; filter correct |
| 0 tests executed | `executed=0` | ✅ Fact — infrastructure failure | Browser không start trước assertion |
| No assertion report | Packet | ✅ Fact | Không có assertion evidence |
| No write evidence | Packet | ✅ Fact | Không có write → không cần cleanup |
| Classification as "application flaky" | Wrapper proposal | ❌ **UNSUPPORTED** | Exception xảy ra trước test body; không phải app assertion failure. Đây là environment/infrastructure issue. |

**Verdict:** ❌ BLOCKED — không có assertion evidence. Đây là infrastructure exception, không phải app failure.

**Missing checks / next action:**
- Không classify là app flaky; không retry 10 lần.
- Investigate environment: check browser install, Playwright version, runner permissions, OS compatibility.
- Cần environment fix từ trainer trước khi re-run.
- Sau fix: kiểm tra riêng browser binary/runner permissions; sau đó chạy `lab:preflight` để verify app, account và lab readiness.
- Owner: trainer (environment); trainee (re-run sau fix).

---

## Phần 2 — Schedule Monitoring Review

### Schedule Slots

| Slot | Expected (VN) | Dispatch | Start | Delay | Status |
|---|---|---|---|---|---|
| SL-01 | 2026-10-01 01:17 | 01:20 (+3 min) | 01:22 (+5 min) | Dispatch delay: 3 min; Queue delay: 2 min | Observed; acceptability threshold not specified |
| SL-02 | 2026-10-02 01:17 | 01:17 (on time) | 01:25 (+8 min) | Queue delay: 8 min | Observed; queue threshold not specified |
| SL-03 | 2026-10-03 01:17 | 01:19 (+2 min) | 01:20 (+3 min) | Dispatch delay: 2 min; Queue delay: 1 min | Observed; acceptability threshold not specified |
| SL-04 | 2026-10-04 01:17 | No dispatch observed | No start | Unknown — cause not determined | ❌ MISSING — needs investigation |

**Dispatch delay stats (SL-01 to SL-03):**
- Delays: 3 min, 0 min, 2 min → Range: 0–3 min; Median: 2 min (n=3; too small for reliability inference)

**Queue delay stats (SL-01 to SL-03):**
- Delays: 2 min, 8 min, 1 min → Range: 1–8 min; Median: 2 min (n=3; max observed 8 min, not classified as an outlier without a defined rule)

> **Note:** n=3 slots là quá nhỏ để suy luận về reliability hay percentile. Chỉ report individual values, median và range. Packet không cung cấp SLO/threshold, nên không kết luận delay nào là acceptable hay abnormal.

**SL-04 Missing Dispatch — Investigation Checklist:**
- [ ] Verify default branch thật và workflow file có ở branch đó vào ngày 2026-10-04 (packet chỉ giả định tên `main`)
- [ ] Check GitHub Actions cron tab có nhận schedule event không
- [ ] Check runner availability / runner quota
- [ ] Check if any workflow was disabled manually
- [ ] Check workflow validation errors on the default branch at that date
- [ ] Cause unknown — không tự điền "missing" vào execution ledger như executed case

---

## Phần 3 — Completion Checklist

- [x] **3 packet reviews**: CI-RUN-A, CI-RUN-B, CI-RUN-C — với claim audit rõ supported/unsupported
- [x] **8 scenario outcomes**: CI-51 → CI-58 trong `U5_ci-design.md`
- [x] **Không gọi packets là CI đã chạy**: tất cả ghi rõ "packet giả lập" / SIMULATED
- [x] **Missing checks và next action**: mỗi packet có next action và owner
- [x] **SL-04 missing giữ nguyên**: không tự thêm vào execution ledger; nguyên nhân ghi unknown
- [x] **Owner/cleanup plan không thiếu**: unresolved cleanup (CI-RUN-A), false green fix (CI-RUN-B), environment fix (CI-RUN-C)

**Unresolved risks / next evidence / owner:**
- CI-RUN-A fail: cần per-flow breakdown và trace artifact. Owner: run maintainer.
- CI-RUN-B `@smoke` matched 0 tests: cần investigate tag/config trên revision lab-a5. Owner: CI config maintainer.
- CI-RUN-C browser startup: cần environment fix từ trainer. Owner: trainer.
- SL-04 missing: cần investigation theo checklist trên. Owner: workflow maintainer.
- Runtime objectives (live smoke, scheduled execution): ghi **PENDING** — chưa có live environment.
