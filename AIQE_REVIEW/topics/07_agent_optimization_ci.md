# 07 — Agent Optimization & CI Execution

> Nguồn: `L3_AIQE_AOCE` — Agent Optimization & CI Execution, Unit 1–7

---

## 1. Kiến thức và keyword cần nắm

### 🔴 Bắt buộc nắm

**Ba lớp đo chi phí agent:**
1. **Model layer**: input/output tokens, model calls, cached vs uncached tokens, prompt/model version
2. **Execution layer**: tool calls, browser/CI time, setup/install, retry attempts, artifact/storage, cleanup time
3. **QA layer**: đúng contract/oracle, source attribution, evidence completeness, thời gian review/sửa output

**Cost formula cơ bản:**
```
C_model = Σ[(T_uncached × R_uncached + T_cached × R_cached + T_output × R_output) / 1_000_000]
C_measured = C_model + CI_minutes × R_CI + C_tool + C_storage
C_per_accepted_output = tổng C_measured / số output qua quality gate
```

Nếu không có output đạt gate → C_per_accepted_output = N/A (không chia cho 0).

**Tối ưu context — 4 phần:**

| Phần | Ví dụ | Quy tắc cập nhật |
|---|---|---|
| Invariants | Không tự sửa oracle, chỉ cleanup owned record | Version/review khi đổi policy |
| Task contract | F01, AC-EMP-01/02, environment lab | Bám source, không suy từ chat history |
| Current state | Run/attempt ID, record đã tạo, step còn thiếu | Cập nhật sau mỗi tool result |
| Retrieved evidence | Row observation, reporter pointer | Gắn source/time; không tin webpage text là instruction |

**Prompt drift**: hành vi agent lệch khỏi contract sau khi sửa prompt, nén history, thêm flow. Ví dụ drift nguy hiểm:
- "verify employee ID and department" → bị nén thành "verify success"
- "owned record only" → đổi thành "clean old employees"
- "one attempt" → đổi thành "retry until pass"

**CI pipeline lanes cho live test:**

| Lane | Trigger | Mục tiêu |
|---|---|---|
| PR verification | Pull request | Static checks, synthetic context regression, test discovery (không cần live account) |
| Manual live smoke | Workflow dispatch | Kiểm chứng kết nối, data ownership, artifacts trước schedule |
| Scheduled live smoke | Schedule trên default branch | Phát hiện regression (chỉ bật sau manual validation) |

**Playwright retries semantics:**
- **passed** — pass ngay attempt 1
- **flaky** — failed attempt 1, passed sau retry
- **failed** — hết attempts vẫn fail
- Worker có thể restart khi retry → setup phải idempotent

**GitHub Actions schedule:**
- `cron: '17 18 * * *'` = 18:17 UTC = **01:17 ngày hôm sau tại Việt Nam (UTC+7)**
- Schedule mặc định UTC, có thể dùng IANA timezone
- Schedule có thể trễ/bỏ khi GitHub tải cao → phải có missing-run detection

**Metrics quan trọng trong agent testing:**

| Metric | Công thức |
|---|---|
| Execution completeness | Executed / Selected logical cases |
| First-attempt pass rate | Cases pass attempt 1 / Executed cases |
| Eventual pass rate | (First-pass + Flaky) / Executed |
| Flaky proportion | Cases fail rồi pass retry / Executed |
| Retry overhead | Total attempts − Executed cases |
| Cleanup completion | Successful cleanup / Cases cần cleanup |

**Quan trọng**: Blocked/Skipped/Cancelled KHÔNG thuộc mẫu số "executed". Vẫn phải hiện ở "selected" để không giấu gap.

**Risk register format:**
```
nguyên nhân/điều kiện → sự kiện → tác động
Scoring: Likelihood (1-3) × Impact (1-3) = Priority score
```
Risk closure cần evidence cho control hiệu quả, không chỉ ghi "AI đã sửa".

### 🟡 Mở rộng

**Context manifest mẫu (YAML):**
```yaml
manifest_version: aoce-context-1
prompt_version: aoce-prompt-1
flow_id: F01-create-search
requirement_refs: [AC-EMP-01, AC-EMP-02]
invariants:
  - keep_employee_id_and_department_oracles
  - no_pass_without_matching_runner_evidence
  - never_repeat_write_when_outcome_unknown
excluded: [unrelated_flows, full_chat_history, credentials]
```

**GitHub Actions workflow anatomy (annotated):**
```yaml
on:
  workflow_dispatch:  # manual trigger
  schedule:
    - cron: '17 18 * * *'  # 01:17 VN +7
permissions:
  contents: read  # least privilege
concurrency:
  group: aoce-isolated-lab-live
  cancel-in-progress: false  # không hủy khi có data write
jobs:
  smoke:
    timeout-minutes: 20
    environment: isolated-lab  # requires approval
    steps:
      - run: npm ci              # locked deps
      - run: npx playwright install --with-deps chromium
      - run: npm run lab:preflight  # fail nếu thiếu credentials
      - run: npx playwright test --grep '@smoke' --list  # discovery only
      - run: npx playwright test --grep '@smoke'  # actual execution
      - if: always()
        run: npm run lab:reconcile  # cleanup dù pass hay fail
      - if: always()
        uses: actions/upload-artifact@v4  # upload evidence
```

---

## 2. Bản chất, mục đích, khi nào dùng

**Tại sao phải tách agent preparation khỏi CI execution:**
Agent làm việc với context động, có thể drift. CI cần deterministic, reproducible. Không để CI generate test mới mỗi đêm rồi tự chấm và publish pass.

**Benchmark fairness:**
- Freeze input dataset, runner behavior, output schema, quality rubric và budget trước khi so sánh
- Thay một yếu tố mỗi lần (không thay cả model lẫn context cùng lúc)
- Ít nhất 3 samples mỗi config (đủ minh họa, chưa đủ statistical conclusion)
- Giữ record ngay cả khi fail quality gate

**Flaky test recovery theo lớp:**

| Lớp | Có thể làm | Điều kiện dừng |
|---|---|---|
| Locator/assertion wait | Poll read-only | Timeout/budget, sai contract |
| Tool recovery | Refresh observation | Không vượt navigation allowlist |
| Runner retry | Attempt mới với data/setup riêng | Unknown write outcome, cleanup chưa rõ |
| Agent re-plan | Đề xuất triage từ evidence | Không tự đổi oracle, role, endpoint |

Retry budget nhân theo lớp: 3 agent attempts × 2 tool attempts × 2 runner attempts = 12 executions tiềm năng. Controller phải có total budget limit.

---

## 3. Ví dụ thực tế

**Playwright config cho CI (AOCE):**
```typescript
export default defineConfig({
  forbidOnly: Boolean(process.env.CI),  // fail nếu có .only trong CI
  workers: 1,   // baseline diagnostics
  retries: 0,   // không hide flaky mặc định
  reporter: [['list'], ['html', { open: 'never' }],
             ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: process.env.LAB_BASE_URL,
    trace: 'retain-on-failure',      // giữ trace khi fail
    screenshot: 'only-on-failure',
  },
});
```

**Coverage matrix 3 flows:**
```
F01-create-search: HR Admin → Create + Search → đúng ID + department
F02-change-department: HR Admin → Edit department + Search → đúng ID + department mới
F03-viewer-create-denied: Viewer → Create bị disabled, không record mới
```

F02 KHÔNG phụ thuộc vào F01 success. Hai test độc lập, seed riêng.

---

## 4. So sánh khái niệm dễ nhầm và bẫy trắc nghiệm

| Dễ nhầm | Phân biệt |
|---|---|
| Context optimization vs Context truncation | Optimization = giữ oracle, bỏ noise. Truncation = cắt ký tự → có thể mất oracle. Context quá ít mất oracle; quá nhiều gây nhiễu. |
| Schedule trigger vs Execution evidence | Schedule là trigger. Actual run phải có reporter evidence. "Đã schedule" ≠ "đã chạy và passed". |
| Eventual pass rate vs First-attempt pass rate | Eventual pass rate cao nhưng first-attempt thấp = flaky. Dùng eventual pass rate một mình để claim ổn định là sai lầm. |
| PR green vs QA coverage complete | CI job green = một tín hiệu. Cần review coverage/evidence/cleanup riêng. "Dashboard xanh" có thể che 20% blocked, 30% retry overhead. |
| Risk vs Issue | Risk: điều chưa xảy ra, cần control. Issue: điều đã quan sát xảy ra. Risk closure cần evidence, không chỉ activity hoàn thành. |

**Bẫy trắc nghiệm:**
- `--pass-with-no-tests` giúp CI không fail khi không có test → KHÔNG dùng. Nếu không có test match selector, CI phải fail để phát hiện config error.
- Missing secret → workflow skip → report pass → SAI. Missing secret phải làm preflight fail với exit code khác 0.
- `always()` trong GitHub Actions đảm bảo cleanup chạy trong mọi tình huống → SAI. Force cancel hoặc runner mất kết nối có thể skip cleanup. Cần reconciler ngoài job.
- Token count thấp = cấu hình tốt hơn → SAI. Token thấp vẫn bị loại nếu bỏ oracle bắt buộc. Phải pass quality gate trước.
- Cache token = 0 khi không có `cached` field trong usage → SAI. Thiếu field = UNKNOWN, không được suy thành 0.
