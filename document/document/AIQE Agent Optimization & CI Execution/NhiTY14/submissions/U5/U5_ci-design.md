# U5_ci-design — CI Lane Design, Scenario Analysis & Evidence Checklist

```
Mode: DRY-RUN
Source IDs + versions:
  CI-PACKET-05 (CI-51 → CI-58; CI-RUN-A/B/C)
  REQ-PACKET-AOCE v1 (AC-EMP-01/02, LAB-AOCE-03/04/05)
  POLICY-PACKET-AOCE v1
  FLOW-PACKET-03 (F01/F02/F03, tags @smoke)
Assumptions / Not specified:
  - Không có live repo/app/accounts; toàn bộ là DRY-RUN / DESIGN-REVIEWED.
  - Default branch tên `main` là giả định của packet — cần verify live repo.
  - Actual base URL / accounts / secrets chưa được cấp.
  - `lab:preflight` và `lab:reconcile` scripts là prerequisite; chưa tồn tại trong workspace.
  - Workspace hiện tại mới có starter login test; chưa có F01/F02/F03, tag @smoke,
    tag @regression hoặc các scripts lab. Workflow/config dưới đây là design draft,
    không chạy được trên workspace này cho đến khi các prerequisites được triển khai.
  - Không có evidence về live CI; mọi đánh giá bên dưới giới hạn ở packet.
  - Không deploy workflow vào repo tài liệu; draft nằm ở thư mục submissions/U5.
Manual analysis (trước AI): xem các phần bên dưới.
```

---

## Phần 1 — Lane Design

### PR Lane (checks chạy khi mở/update PR)

| Check | Trigger | Purpose | Failure Behavior |
|---|---|---|---|
| TypeScript typecheck (`npx tsc --noEmit`) | PR open/update | Static type validation | Fail job; block merge |
| Test discovery (`playwright test --list`) | PR open/update | Xác nhận Playwright tìm thấy tests; discovery không phải execution | Fail job nếu runner báo không có tests |
| Smoke discovery (`--list --grep "@smoke"`) | PR open/update | Xác nhận flow smoke được chọn trước khi có live run | Fail job nếu không có smoke test; không dùng `--pass-with-no-tests` |
| **Không chạy:** `lab:preflight` live check hoặc test có write/cleanup | PR | Fork PR không có secrets; PR không được ghi vào isolated-lab | — |

**Rationale:** PR lane không dùng credential và không truy cập lab. Packet không định nghĩa `@regression` suite; không khai báo suite này như thể đã tồn tại. Khi có suite non-live riêng, có thể thêm sau khi xác định test command và evidence. Discovery chỉ chứng minh test được tìm thấy, không phải test đã chạy.

### Manual / Scheduled Live Lane

| Check | Trigger | Purpose | Failure Behavior |
|---|---|---|---|
| `lab:preflight` | Pre-run (required) | Kiểm tra credential presence (không in giá trị), URL allowlist, app/role readiness, namespace và trạng thái ledger | Abort nếu fail; không skip; chưa chạy test thì chưa có write |
| `@smoke` tests (F01, F02, F03) | Manual dispatch / Schedule | Validate 3 flows trên isolated-lab | Report per-flow; không suppress failure |
| `lab:reconcile` | Sau preflight thành công, post-run (`always()`) | Check owned ledger; report unresolved cleanup kể cả test fail/cancel | Log unresolved và exit non-zero; không dùng `|| true` |
| Artifact upload (traces, reporter) | Post-run (`always()`) | Preserve evidence bất kể pass/fail | Dùng `if: always()` để không mất artifact khi fail |

Concurrency được serialize theo **environment dùng chung** (`isolated-lab`), không theo branch hay run ID. Namespace vẫn phải unique cho từng dispatch; lock không thay thế ownership check. GitHub concurrency giữ tối đa một pending run/group; dispatch pending có thể bị thay thế, nên monitor và không claim mọi manual dispatch chắc chắn sẽ chạy. Nếu phải bảo toàn mọi request, cần queue/lock do lab cấp.

### Prerequisite Checklist (trước mỗi live run)

- [ ] `LAB_URL` trong secret store, khớp allowlist `isolated-lab`
- [ ] `LAB_USERNAME` / `LAB_PASSWORD` trong secret store (không literal trong YAML)
- [ ] `LAB_NAMESPACE_PREFIX` xác nhận format `E2E-AOCE`
- [ ] Viewer credential/account sẵn sàng qua secret store và được xác thực riêng; không commit/reuse HR Admin auth state
- [ ] `lab:preflight` exit 0 trước khi chạy tests
- [ ] Ledger của run được khởi tạo sau preflight; unresolved record của run trước đã được reconcile hoặc được owner xử lý
- [ ] Có durable ownership ledger/server-side lookup do trainer cấp; local artifact không đủ để khôi phục sau force-cancel
- [ ] Xác nhận tên default branch thật trên live repo (packet giả định `main`)
- [ ] Workflow file đã có trên default branch thật; feature branch riêng không chứng minh schedule đã active
- [ ] Smoke tests và scripts được triển khai; runner discovery xác nhận đúng flows trước live execution

---

## Phần 2 — Timezone / Cron Conversion

### Expected schedule: 01:17 VN (UTC+7) hàng ngày

| Timezone | Time | Cron field |
|---|---|---|
| Vietnam (UTC+7) | 01:17 | Target |
| **UTC** | **18:17 ngày hôm trước** | `17 18 * * *` |

**Diễn giải:**
- Cron GitHub Actions dùng UTC. `17 18 * * *` = 18:17 UTC = 01:17 ngày hôm sau giờ Việt Nam.
- Lưu ý DST: Việt Nam không đổi giờ mùa hè, UTC+7 cố định. Cron UTC ổn định.
- **Cần verify:** report dispatch/queue delay theo từng slot. Packet không đưa SLO/threshold nên không gán nhãn delay là bình thường hay bất thường; investigate slot không có dispatch (như SL-04).

---

## Phần 3 — Scenario Analysis (8 Scenarios)

| ID | Tình huống | Preflight Outcome | Failure Behavior | Cleanup / Artifact | Concurrency / Note | Verdict |
|---|---|---|---|---|---|---|
| **CI-51** | PR từ fork; live secrets không được cấp | Không chạy live preflight trong PR lane | Chỉ static checks/discovery; không chạy flow cần credential | Không có write → không cần cleanup | Fork PR không được cấp live secrets | ✅ EXPECTED — PR lane không phụ thuộc secrets |
| **CI-52** | Manual run thiếu `LAB_PASSWORD`; wrapper hiện tại skip login rồi in "all passed" | Preflight FAIL nếu preflight check var | Wrapper cần phải fail (exit non-zero) khi thiếu credential; không skip login | Không có assertion → không có write evidence | Wrapper dùng `|| true` hoặc skip là **BUG** — phải fix | ❌ BUG — wrapper không được báo pass khi thiếu credential |
| **CI-53** | `--grep '@smoke'` chọn 0 tests; wrapper có `--pass-with-no-tests` | Preflight có thể pass | `--pass-with-no-tests` làm exit 0 khi 0 tests chạy — **false green** | Không có execution → không có assertion | Cần bỏ `--pass-with-no-tests`; fail khi 0 tests selected | ❌ BUG — 0 tests executed không được báo pass |
| **CI-54** | F01 assertion fail; artifact step chỉ chạy khi job success | Tests fail | Artifact không được upload → mất trace evidence | Dùng `trace: 'retain-on-failure'` và upload step `if: always()` | Upload luôn không tạo trace nếu Playwright không capture trace | ❌ BUG — cần cả trace policy và artifact upload-on-failure |
| **CI-55** | Job force cancel sau write; record owned vẫn tồn tại | N/A — job bị cancel | Record unresolved; `always()` reconcile là best-effort, không bảo đảm chạy xong khi job bị force-cancel | Preflight sau chỉ được chặn/reconcile nếu lab cung cấp durable ownership ledger hoặc server-side lookup; nếu chưa có, stop và yêu cầu trainer đối soát | Không dựa vào file artifact local làm nguồn bền vững; không rerun write | ⚠️ RISK — cần reconciliation ngoài run và owner notification |
| **CI-56** | Hai branch dispatch cùng environment; concurrency group chỉ theo branch | Cả hai có thể start cùng lúc | Có thể đụng shared lab/data dù branch khác nhau | Dùng một concurrency group theo environment dùng chung; `cancel-in-progress: false`; namespace unique vẫn bắt buộc | Run cùng lab phải serialize; không dùng run ID để tách lock | ❌ DESIGN GAP — concurrency group phải khóa theo environment |
| **CI-57** | Schedule slot dự kiến chưa thấy run; workflow file chỉ ở feature branch | Workflow không được trigger | Schedule chỉ active khi workflow file trên **default branch** (`main`) | Không có run → không có evidence | Đây là lý do cần verify default branch và merge workflow trước khi rely on schedule | ❌ DESIGN GAP — workflow phải trên `main` để schedule fire |
| **CI-58** | Tests pass; cleanup helper trả unresolved record; wrapper dùng `|| true` | Preflight pass | Job báo success mặc dù cleanup unresolved | Record owned vẫn tồn tại — data leak | `lab:reconcile` phải exit non-zero; không được suppress lỗi | ❌ BUG — `|| true` không được dùng cho cleanup/reconcile |

### Summary: 4 bugs, 2 design gaps, 1 risk, 1 expected behavior

---

## Phần 4 — Script Contracts

### `lab:preflight`

```
Purpose   : Xác nhận môi trường trước khi chạy bất kỳ test nào.
Inputs    : Environment variables: LAB_URL, LAB_USERNAME, LAB_PASSWORD,
            LAB_NAMESPACE_PREFIX, LAB_VIEWER_USERNAME, LAB_VIEWER_PASSWORD,
            LAB_RUN_ID, LAB_LEDGER_PATH
Validations:
  1. LAB_URL present AND matches isolated-lab allowlist
  2. LAB_USERNAME / LAB_PASSWORD present (không in ra value)
  3. LAB_NAMESPACE_PREFIX matches format E2E-AOCE-*
  4. Lab app reachable (HTTP health check; không auth)
  5. HR Admin role reachable (login check; không in credential)
  6. Viewer account reachable
  7. Xác nhận qua durable ledger/server-side lookup rằng unresolved record trước run
     đã được owner reconcile;
     nếu unresolved thì fail, không chỉ warning.
  8. Nếu không có durable ledger/lookup đã được trainer cấp thì fail closed.
  9. Chỉ sau các checks thành công, tạo run entry cho namespace hiện tại trong
     durable ledger và local artifact LAB_LEDGER_PATH; không ghi đè run khác.
Outputs   : Exit 0 if all checks pass; exit 1 with itemized failure list
Behavior  : Không in credential; chỉ print PASS/FAIL per check; validate run ID.
            Local ledger là artifact mirror; durable ledger mới là nguồn ownership.
Unknown   : Durable ledger/lookup interface, retention; thứ tự check, timeout và
            retry behavior khi app slow start — trainer phải cấp trước live run.
```

### `lab:reconcile`

```
Purpose   : Đọc owned ledger; report và fail nếu có unresolved cleanup.
Inputs    : Durable owned-record ledger/lookup do trainer cấp; local ledger file
            (artifact mirror); current run ID / namespace
Outputs   : Exit 0 nếu tất cả owned records đã cleanup
            Exit 1 + list unresolved records nếu có hoặc ledger không hợp lệ
            Không tự-cleanup (chỉ report)
Behavior  : Không xóa records; chỉ đọc ledger và report.
            Ghi unresolved records vào CI log và artifact. `if: always()` là
            best-effort cho test failure; force-cancel vẫn cần owner reconcile
            từ ledger/persistent evidence trước lần chạy tiếp theo.
            Durable run entry và local artifact phải được tạo bởi preflight trước khi test bắt đầu. Nếu preflight
            chưa thành công thì step reconcile không chạy; nếu preflight thành công
            nhưng không truy cập được durable ledger hoặc local artifact không hợp lệ
            thì báo UNKNOWN/fail và owner xử lý, không mặc định clean.
Unknown   : Interface/schema/retention của durable ledger và cơ chế reconcile sau
            force-cancel chưa được packet cung cấp; trainer phải chốt trước live run.
```

---

## Phần 5 — Evidence Completeness Checklist (Per Run)

| Item | Required | Source |
|---|---|---|
| Run ID / Revision | ✅ | Workflow env |
| `lab:preflight` exit code + output | ✅ | Job log |
| Tests selected count (from `--list` or reporter) | ✅ | Reporter |
| Tests executed count | ✅ | Reporter |
| Per-flow assertion result (pass/fail/blocked/skipped) | ✅ | Reporter per flow |
| Trace artifact (upload `if: always()`) | ✅ | CI artifact |
| `lab:reconcile` exit code + output | ✅ | Job log |
| Cleanup status per owned record | ✅ | Reconcile output |
| Schedule dispatch time vs. expected time | ✅ (scheduled lane) | Workflow run metadata |
| Secret store confirmation (not values) | ✅ | Preflight output |

### Missing Schedule / Artifact / Cleanup Ownership

| Gap | Owner | Action |
|---|---|---|
| Missing schedule dispatch (như SL-04) | Workflow maintainer | Verify workflow file trên default branch, cron expression, workflow enabled và runner/event evidence; cause vẫn unknown cho đến khi có log |
| Missing artifact after failure | CI config owner | Fix: `if: always()` on artifact upload step |
| Unresolved cleanup (như CI-55, CI-58) | Run owner + trainer | Chặn run tiếp theo; dùng durable ledger/server-side lookup để reconcile theo owned ID; lưu closure evidence rồi mark resolved. Nếu chưa có interface bền vững, không chạy live write flows. `always()` không được xem là bảo đảm sau force-cancel. |

---

## Phần 6 — Review Log

| Proposal | Source | Accept/Reject | QA Rationale |
|---|---|---|---|
| Dùng `--pass-with-no-tests` để tránh fail khi tag không match | CI-53 wrapper | **REJECT** | 0 tests executed không thể báo pass. Cần fail khi 0 tests selected. Source: CI-53 analysis. |
| Dùng `|| true` sau `lab:reconcile` để tránh job fail | CI-58 wrapper | **REJECT** | Cleanup failure phải fail job; suppressing là data integrity risk. Source: LAB-AOCE-05. |
| Artifact upload chỉ khi job success | CI-54 artifact config | **REJECT** | Mất trace khi test fail là audit gap. Phải `if: always()`. Source: CI-54 analysis. |
| Concurrency group theo branch/run ID | CI-56 config | **REJECT** | Mọi writer vào một lab dùng chung phải serialize theo environment; per-run namespace vẫn phải unique. Source: CI-56 và U3 collision scenario. |
| Bật schedule trước khi merge workflow vào `main` | Feature branch workflow | **REJECT** | Schedule chỉ fire khi workflow trên default branch. Source: CI-57 analysis, GitHub Actions docs. |
| `if: always()` trên artifact upload step | QA (self) | **ACCEPT** | Cần thiết để preserve evidence bất kể test outcome. Source: CI-54 finding. |

**Unresolved risks / next evidence / owner:**
- Default branch name verification: trainer xác nhận trên live repo.
- `lab:preflight` / `lab:reconcile` và durable ownership ledger/lookup: chưa tồn tại/được xác định trong workspace; trainer phải cấp trước live lab.
- SL-04 missing dispatch: nguyên nhân chưa biết; cần kiểm tra workflow file, runner quota, cron expression.
- Secrets provisioning: trainer cấp trước live run; không được hardcode trong YAML.
