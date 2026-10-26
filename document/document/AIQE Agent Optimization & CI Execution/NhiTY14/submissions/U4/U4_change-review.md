# U4_change-review — Inventory, Staging, Branch Plan & Conflict Resolution

```
Mode: DRY-RUN
Source IDs + versions:
  GIT-PACKET-04 (inventory, candidate change, conflict, validation cards VC-41→VC-44)
  REQ-PACKET-AOCE v1 (AC-EMP-01/02, LAB-AOCE-03/04/05)
  Prompt v3 (QA-revised, từ U2)
  POLICY-PACKET-AOCE v1
Assumptions / Not specified:
  - Không có live repo; tất cả SHA, branch ref và diff là SIMULATED.
  - Revision lab-a1 là revision hiện tại của các tracked files.
  - Candidate change summary chưa được chấp thuận; người học phải review phạm vi.
  - Không có live environment; validation plan là design, không claim live pass.
Manual analysis (trước AI): xem Phần 1 – Inventory Classification bên dưới.
```

---

## Phần 1 — Inventory Classification

### Bảng phân loại

| File | Track Status | Phân loại | Action | Rủi ro / Lý do |
|---|---|---|---|---|
| `prompts/employee-report.md` | Tracked | **Stage/Source** | `git add prompts/employee-report.md` (sau review và conflict resolve) | Thay đổi compact context — cần review contract trước khi stage |
| `context/select-context.ts` | Tracked | **Stage/Source — PARTIAL REJECT** | Chỉ stage phần không bỏ department assertion; bỏ toàn bộ file nếu candidate change vi phạm oracle | Candidate change "bỏ department khỏi selected source fields" vi phạm AC-EMP-02; phải reject phần này |
| `tests/context-regression.spec.ts` | Tracked | **Stage/Source — NEEDS UPDATE** | Stage sau khi thêm RG-04 test case | Hiện chưa có RG-04; thiếu regression coverage cho department mismatch |
| `.env` | Untracked | **IGNORE — credential risk** | Thêm vào `.gitignore` (nếu chưa có); không stage, không commit, không đưa vào AI prompt | Chứa synthetic credential placeholder; nếu vô tình `git add .` sẽ expose credentials vào history |
| `playwright/.auth/admin.json` | Untracked | **IGNORE — auth state** | Thêm vào `.gitignore`; không stage, không đưa vào source hoặc AI | Auth state file; commit vào repo là security risk nghiêm trọng |
| `test-results/trace.zip` | Untracked | **Artifact store** | Lưu vào artifact store riêng (CI artifact, không phải git); không commit | Raw artifact; không phải source; bloat repository nếu commit |
| `docs/validation-summary.md` | Untracked | **Needs sanitization** | Review và sanitize (đảm bảo run refs đủ revision) trước khi quyết định stage/commit | Bản đã sanitize nhưng run refs chưa đủ revision → chưa đủ để commit như evidence |

### Rủi ro `git add .`

`git add .` sẽ stage **mọi untracked file** chưa có trong `.gitignore`, gồm:
- `.env` → credentials vào git history (không thể xóa sạch sau khi push)
- `playwright/.auth/admin.json` → auth token/cookie vào history
- `test-results/trace.zip` → bloat repo; trace có thể chứa PII/session data

**Giới hạn `.gitignore` với file đã track:**
- `.gitignore` chỉ có tác dụng với file **chưa được track**. Nếu file đã từng `git add` và commit thì `.gitignore` không tự xóa nó khỏi tracking.
- Cần dùng `git rm --cached <file>` để untrack file đã có trong history, sau đó thêm vào `.gitignore`.
- Đây là lý do `playwright/.auth/admin.json` phải được check ngay khi setup — không chờ đến khi đã commit.

---

## Phần 2 — PR Scope Selection từ Candidate Change

### Candidate Change Summary

> "Reduce context size; replace ID+department search assertion with Success toast; enable three retries; remove ownership check from cleanup."

### Review từng clause

| Clause | Đánh giá | Decision | Lý do / Source |
|---|---|---|---|
| "Reduce context size" | Có thể chấp nhận **với điều kiện** | **ACCEPT — conditional** | Được phép nếu compact context vẫn giữ oracle (AC-EMP-01/02), policy (LAB-AOCE-05), actor, run state. Xem conflict resolve ở Phần 3. |
| "Replace ID+department search assertion with Success toast" | Vi phạm hard gate | **REJECT** | Oracle AC-EMP-02 yêu cầu search row có exact ID + department. Toast không phải runner assertion. Hard gate: không dùng toast thay oracle. Source: AC-EMP-02, OUTPUT-PACKET-01. |
| "Enable three retries" | Vi phạm budget policy | **REJECT** | Policy max 1 runner retry (POLICY-PACKET-AOCE). 3 retries không được cấp. Blind retry khi unknown write outcome vi phạm LAB-AOCE-05. |
| "Remove ownership check from cleanup" | Vi phạm cleanup policy | **REJECT** | LAB-AOCE-05: cleanup chỉ owned records. Bỏ ownership check mở scope vô hạn — critical violation. |

### PR Scope được chấp nhận

**Chỉ include:**
1. `prompts/employee-report.md` — compact context sau conflict resolve (giữ oracle/policy; có thể giảm từ nếu không mất oracle)
2. `tests/context-regression.spec.ts` — thêm test case RG-04 (department mismatch regression)

**Không include:**
- Thay đổi assertion từ ID/department sang toast
- Retry config tăng lên 3
- Bỏ ownership check trong cleanup
- `context/select-context.ts` nếu diff bỏ department field

---

## Phần 3 — Branch / Commit Plan

### Branch Strategy (Simulated — không SHA thật)

```
main
 └── feature/compact-context-and-rg04
       ├── commit 1: "test: add RG-04 department-mismatch regression case"
       └── commit 2: "prompt: resolve compact-context conflict, retain oracle and policy"
```

**Rationale tách commit:**
- Commit 1 (test) có thể review và verify độc lập trước khi merge
- Commit 2 (prompt) là thay đổi content nhạy cảm; muốn isolate để rollback nếu cần

### Files per commit

| Commit | Files | Nội dung |
|---|---|---|
| `commit 1` | `tests/context-regression.spec.ts` | Thêm test case RG-04: assert controller FAIL khi department mismatch; không thay đổi oracle |
| `commit 2` | `prompts/employee-report.md` | Conflict resolved; compact context giữ oracle, policy; giảm từ không cần thiết |

**Files KHÔNG commit:**
- `.env`, `playwright/.auth/admin.json`, `test-results/trace.zip`, `docs/validation-summary.md` (chưa đủ revision evidence)

---

## Phần 4 — Conflict Resolution

### Conflict gốc

```
<<<<<<< compact-context-branch
Verify success after Save. Report briefly. Context word budget 250.
=======
Verify search row has the exact employee ID and selected department.
Report matching runner evidence and UNKNOWN fields. Context word budget 400.
>>>>>>> oracle-evidence-branch
```

### Phân tích từng bên

| Branch | Claim | Đánh giá |
|---|---|---|
| `compact-context-branch` | "Verify success after Save" + budget 250 | **Drift**: "success after Save" không xác định oracle; có thể map vào toast. Budget 250 có thể chấp nhận nếu oracle được giữ. |
| `oracle-evidence-branch` | "Verify search row exact ID + department" + report UNKNOWN + budget 400 | **Đúng về oracle**: giữ AC-EMP-02 assertion; budget 400 rộng hơn nhưng không phải lý do reject |

### Resolution (contract-aware merge)

**Rationale:**
- Giữ assertion của `oracle-evidence-branch` (AC-EMP-02 compliant)
- Áp dụng budget của `compact-context-branch` (250 từ) vì đây là design parameter đã thống nhất ở U2
- Tổng hợp "Report UNKNOWN fields" từ oracle-branch (cần thiết cho missing data policy)

### Merged prompt (đoạn resolved)

```text
Verify search row has the exact employee ID and selected department.
Report matching runner evidence for the current run; include UNKNOWN fields.
Context word budget 250.
```

**Semantic diff sau merge:**

| Clause | compact-context-branch | oracle-evidence-branch | Merged result | Rationale |
|---|---|---|---|---|
| Assertion | "Verify success after Save" | "Verify search row exact ID + department" | Giữ oracle-evidence version | AC-EMP-02 compliant; compact-context dùng toast proxy |
| Report evidence | "Report briefly" | "Report matching runner evidence and UNKNOWN fields" | Giữ oracle-evidence version | Cần runner evidence và UNKNOWN disclosure; "briefly" không đủ |
| Budget | "250" | "400" | **250** | U2 đã establish 250 là synthetic budget; 400 không có rationale mới |

**Không chỉ xóa markers, không chỉ chọn một bên** — merged result kết hợp oracle constraint từ oracle-branch và budget từ compact-context-branch với rationale rõ.

---

## Phần 5 — Manual Findings (Trước AI Review)

| # | Finding | Location | Contract/Impact | Severity |
|---|---|---|---|---|
| F-01 | Candidate clause "replace assertion with toast" vi phạm AC-EMP-02 | `context/select-context.ts` (candidate diff) | AC-EMP-02 mất; search row department không được verify; hard gate violation | **CRITICAL — REJECT** |
| F-02 | `compact-context-branch` conflict side dùng "Verify success after Save" — không có oracle reference | `prompts/employee-report.md`, line conflict | Không trace được AC-EMP-01/02; controller có thể dùng toast làm pass proof | **HIGH — REJECT compact side assertion** |
| F-03 | `tests/context-regression.spec.ts` chưa có RG-04 — department mismatch không được regression-tested | `tests/context-regression.spec.ts` | Nếu candidate bỏ department assertion đi qua test suite, không có test nào catch được | **HIGH — ADD RG-04** |
| F-04 | "Enable three retries" vượt quá budget policy max 1 retry | candidate change config | Có thể mask intermittent failures; tăng cost; vi phạm POLICY-PACKET-AOCE | **HIGH — REJECT** |
| F-05 | "Remove ownership check from cleanup" — mở cleanup scope vô hạn | candidate change cleanup config | Vi phạm LAB-AOCE-05; có thể xóa record của run khác | **CRITICAL — REJECT** |
| F-06 | `docs/validation-summary.md` chưa đủ run revision refs — không nên commit như evidence | `docs/validation-summary.md` | Evidence không traceable; có thể mislead về revision đã validate | **MEDIUM — needs sanitization** |

---

## Phần 6 — Review Log

| Proposal | Source | Accept/Reject | QA Rationale |
|---|---|---|---|
| Merge "Verify success after Save" từ compact-context-branch | compact-context-branch conflict | **REJECT** | Toast-based assertion; vi phạm AC-EMP-02. Không có runner assertion reference. |
| Budget 400 từ oracle-evidence-branch | oracle-evidence-branch conflict | **REJECT (budget phần)** | Budget 250 đã được xác lập tại U2 với rationale; 400 không có justification mới. Giữ 250. |
| Include `context/select-context.ts` với bỏ department field | candidate diff | **REJECT** | Bỏ department vi phạm AC-EMP-02. Source field bắt buộc cho oracle. |
| Include retry config tăng lên 3 | candidate change | **REJECT** | Vượt budget policy. Source: POLICY-PACKET-AOCE max 1 retry. |
| Thêm RG-04 vào `tests/context-regression.spec.ts` | QA (self) | **ACCEPT** | Cần thiết để catch department mismatch regression. Source: REG-PACKET-02 RG-04. |
| Giữ budget 250 và "Report UNKNOWN fields" trong merged prompt | QA (self) | **ACCEPT** | 250 có rationale từ U2; UNKNOWN fields cần thiết cho evidence completeness. |

**Unresolved risks / next evidence / owner:**
- VC-41/VC-42: evidence chỉ cho revision lab-a1. Sau khi merge conflict → tạo revision mới → cần VC-41/VC-42 re-run trên revision mới. Owner: trainee sau merge.
- VC-43: infrastructure exception trước assertion — không phải app failure; cần environment fix trước re-run. Owner: trainer.
- `docs/validation-summary.md`: cần bổ sung run refs đủ revision trước khi stage. Owner: trainee.
