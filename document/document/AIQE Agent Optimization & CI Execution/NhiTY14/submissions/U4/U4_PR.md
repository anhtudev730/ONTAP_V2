# U4_PR — Pull Request Description, Review & Rollback Plan

```
Mode: DRY-RUN
Source IDs + versions:
  GIT-PACKET-04 (inventory, candidate change, conflict, VC-41→VC-44)
  REQ-PACKET-AOCE v1 (AC-EMP-01/02, LAB-AOCE-03/04/05)
  POLICY-PACKET-AOCE v1
  U4_change-review.md findings F-01→F-06
Assumptions / Not specified:
  - Không có live repo; branch refs và SHAs là SIMULATED.
  - Revision sau merge conflict sẽ khác lab-a1 — VC-41/VC-42/VC-43 chỉ evidence cho lab-a1, không cho revision mới.
  - Không claim live passed; validation plan là design.
```

---

## PR Description

### Title

```
fix: retain AC-EMP-02 oracle in compact context; add RG-04 regression test
```

### Problem / Motivation

Candidate change `compact-context-branch` đề xuất:
1. Thay assertion "exact employee ID + department" bằng "Success toast" — vi phạm oracle **AC-EMP-02** (search row phải có exact ID + department).
2. Tăng retry lên 3 — vượt budget policy (max 1 retry, POLICY-PACKET-AOCE).
3. Bỏ ownership check trong cleanup — vi phạm **LAB-AOCE-05** (cleanup chỉ owned records).
4. Merge conflict trong `prompts/employee-report.md` giữa hai branches chưa được resolve theo contract.

Ngoài ra, `tests/context-regression.spec.ts` chưa có test case cho **RG-04** (department mismatch), tức là nếu department assertion bị bỏ, không có regression test nào phát hiện được.

### Resulting Behavior (nếu không sửa)

- Controller có thể báo PASS khi department sai (dùng toast/visual thay oracle) → **false positive**.
- Cleanup có thể xóa records của run khác → **data corruption**.
- Up to 3 blind retries khi unknown write → **duplicate write risk**.
- Department mismatch (RG-04) không bị catch bởi test suite.

### Final Scope của PR này

| Include | Exclude |
|---|---|
| `prompts/employee-report.md` — merged prompt giữ oracle AC-EMP-02 + budget 250 | Toast assertion thay ID/dept oracle |
| `tests/context-regression.spec.ts` — thêm RG-04 test case | Retry config tăng lên 3 |
| | Bỏ ownership check trong cleanup |
| | `context/select-context.ts` với bỏ department field |

---

## Validation Plan (Matched to Final Scope)

### Matrix

| Check | Type | Revision | Expected Result | Actual / Missing | Artifact Ref |
|---|---|---|---|---|---|
| **VC-41**: `typecheck` | Type discovery | lab-a1 (pre-merge) | exit 0 | **exit 0** — passed (packet evidence) | VC-41 |
| **VC-42**: `playwright test --list` | Test discovery | lab-a1 (pre-merge) | 3 tests listed | **3 listed** — no execution (packet evidence) | VC-42 |
| **VC-43**: Live runner | Runtime | lab-a1 (pre-merge) | Browser startup + assertion | **Infrastructure exception before assertion** — not an app failure; no assertion evidence | VC-43 |
| **VC-44**: Candidate diff + conflict resolve → new revision | All checks on new revision | **Not lab-a1** (post-merge) | typecheck + list + runtime on new revision | **MISSING** — no evidence for post-merge revision | VC-44 |
| **RG-04 regression**: department mismatch test | Runtime assertion | Post-merge revision | Test FAILS when department ≠ expected | **MISSING** — test not yet run; RG-04 added in this PR | N/A |
| **Context regression suite** | Runtime | Post-merge revision | All existing regression tests pass | **MISSING** — needs run on post-merge revision | N/A |

### Phân biệt loại check

| Loại | Mô tả | Evidence hiện có |
|---|---|---|
| **Typecheck** (VC-41) | Static analysis; không chạy browser | ✅ Pass — lab-a1 |
| **Test discovery** (VC-42) | `--list` chỉ enumerate tests, không execute | ✅ 3 listed — lab-a1; không phải execution evidence |
| **Runtime** (VC-43) | Browser startup + assertion execution | ❌ Infrastructure exception — không có assertion evidence |
| **Post-merge runtime** (VC-44) | Cần chạy lại sau resolve conflict | ❌ Không có evidence cho revision sau merge |

> [!IMPORTANT]
> VC-41 (typecheck) và VC-42 (discovery) chỉ là pre-execution checks. Không được dùng chúng để claim "live passed". VC-43 là infrastructure failure, không phải app assertion. VC-44 cần checks mới trên revision sau merge — chưa có evidence.

---

## Review Comments (Location / Contract / Impact)

### Comment 1 — `prompts/employee-report.md` (conflict resolution)

**Location:** `prompts/employee-report.md`, merged conflict section  
**Contract:** AC-EMP-02 — search row phải có exact employee ID và selected department  
**Issue:** `compact-context-branch` side dùng "Verify success after Save" không có oracle reference. Nếu merge theo compact-context-branch, controller sẽ không biết phải check department.  
**Impact:** False positive khi department sai nhưng Save thành công (toast).  
**Resolution:** Giữ assertion "search row exact ID + department" từ `oracle-evidence-branch`; giữ budget 250 từ compact-context-branch.

### Comment 2 — `context/select-context.ts` (excluded from PR)

**Location:** `context/select-context.ts` — candidate diff  
**Contract:** AC-EMP-02 — department là required oracle field  
**Issue:** Candidate bỏ `department` khỏi `selected source fields`. Nếu department không được select, context sẽ không có department cho assertion.  
**Impact:** AC-EMP-02 department clause sẽ luôn thiếu data → assertion không thể pass với đúng reason.  
**Resolution:** **EXCLUDE** file này khỏi PR. Mở issue riêng để thảo luận nếu có rationale hợp lệ.

### Comment 3 — `tests/context-regression.spec.ts` (RG-04 missing)

**Location:** `tests/context-regression.spec.ts`, cuối file  
**Contract:** REG-PACKET-02 RG-04 — department mismatch phải được detect  
**Issue:** Không có test case cho department mismatch. Nếu candidate change bỏ department assertion, test suite sẽ không catch.  
**Impact:** Regression không được phát hiện tự động.  
**Resolution:** **ADD** RG-04 test case trong PR này.

### Comment 4 — Candidate retry config (excluded from PR)

**Location:** Retry configuration (không xác định file cụ thể trong packet)  
**Contract:** POLICY-PACKET-AOCE — max 1 runner retry  
**Issue:** Candidate "enable three retries" vượt policy. 3 retries có thể mask intermittent failure và tăng chi phí.  
**Impact:** Flaky tests có thể tự "fix" sau 3 retries mà không có root cause analysis; cost tăng.  
**Resolution:** **REJECT**. Giữ max 1 retry theo policy.

### Comment 5 — Cleanup ownership check (excluded from PR)

**Location:** Cleanup config (không xác định file cụ thể trong packet)  
**Contract:** LAB-AOCE-05 — cleanup chỉ owned records  
**Issue:** Candidate "remove ownership check" mở scope cleanup vô hạn.  
**Impact:** Có thể xóa records của run khác → data corruption; mất traceability.  
**Resolution:** **REJECT**. Ownership check là mandatory. Không được bỏ.

---

## Rollback Plan

### Code Side

| Bước | Action | Command (simulated) | Note |
|---|---|---|---|
| 1 | Identify last known-good revision | `git log --oneline main` | Tìm commit trước khi merge PR này |
| 2 | Revert PR merge commit | `git revert <merge-commit-sha>` | Tạo revert commit; không force-push lên shared branch |
| 3 | Verify revert | `git diff main HEAD` | Confirm `prompts/employee-report.md` về lại trạng thái trước |
| 4 | Re-run typecheck + discovery | `npx tsc --noEmit` và `npx playwright test --list` | Confirm không có regression từ revert |

**Simulated — không có SHA thật; dry-run commands chỉ minh họa ý định.**

### Prompt Side

| Bước | Action |
|---|---|
| 1 | `prompts/employee-report.md` về lại version trước conflict resolve (compact context không có merged assertion) |
| 2 | Nếu dùng prompt v3 từ U2 làm baseline: restore từ U2 source manifest |
| 3 | Verify compact context vẫn có oracle (AC-EMP-01/02) và policy (LAB-AOCE-05) sau restore |

### Data Side Effects

| Scenario | Risk | Mitigation |
|---|---|---|
| Context thay đổi giữa runs | Controller có thể dùng context khác version → kết quả inconsistent | Gắn prompt version vào run manifest; dùng version tag (xem U2 Prompt v3) |
| RG-04 test case thêm vào rồi revert | Regression gap quay lại | Nếu revert PR, phải mở ticket để re-add RG-04 trong PR tiếp theo |
| Cleanup scope sau rollback | Rollback không ảnh hưởng records đã cleanup (không thể un-delete) | Ghi cleanup evidence trước khi merge; nếu revert, owned records từ runs trước rollback cần reconcile |

---

## Completion Checklist

- [x] **Inventory đủ**: 7 files phân loại (stage/ignore/artifact/needs-sanitize) — Phần 1 `U4_change-review.md`
- [x] **Conflict resolution**: merged prompt giữ oracle AC-EMP-02; budget 250; rationale rõ; không chỉ delete markers
- [x] **≥3 review findings**: F-01 (toast assertion), F-02 (compact conflict), F-03 (RG-04 missing), F-04 (retry), F-05 (cleanup), F-06 (validation summary) — 6 findings
- [x] **Validation matrix phân biệt typecheck/discovery/runtime**: VC-41 vs VC-42 vs VC-43 vs VC-44
- [x] **Rollback plan**: code side + prompt side + data side effects
- [x] **Không đưa auth state/credential vào commit/prompt**: `.env` và `playwright/.auth/admin.json` phân loại IGNORE
- [x] **Không dùng VC-41/VC-42 (discovery/typecheck) để claim live pass**
- [x] **VC-44 acknowledged**: checks mới cần thiết trên post-merge revision; chưa có evidence

**Unresolved risks / next evidence / owner:**
- VC-44: cần typecheck + `--list` + runtime trên revision sau conflict resolve. Owner: trainee.
- VC-43 infrastructure exception: cần environment fix từ trainer trước khi live runner có thể chạy.
- `context/select-context.ts`: nếu department bỏ khỏi selected fields là intentional, cần spec mới kèm rationale và contract update. Owner: trainer / spec owner.
- Revision tracking: mỗi commit phải có revision label rõ (lab-a1, lab-a2...) để evidence không bị orphan.
