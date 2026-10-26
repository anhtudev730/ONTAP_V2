# 06 — AI Agent Architecture & Live Execution

> Nguồn: `L3_AIQE_AAALE` — AI Agent Architecture & Live Execution, Unit 1–4

---

## 1. Kiến thức và keyword cần nắm

### 🔴 Bắt buộc nắm

**Ba lớp của agent system:**

```
Agent Planner   → đề xuất hành động (AI component)
Run Controller  → kiểm tra policy/state/budget; quyết định có cho phép không
Tool Adapters   → thực thi action đã được duyệt (browser, runner, evidence store)
```

**Agent KHÔNG tự quyết định pass/fail**. Test oracle phải do con người định nghĩa từ requirement. Agent chỉ đề xuất, controller kiểm tra, reporter ghi kết quả.

**Kiến trúc flow:**
```
QA goal + source IDs
       │
       ▼
Agent planner ── proposal + rationale ──► Run controller
       ▲                                  │ policy/state/budget check
       │ sanitized observation            ▼
       └──────── Tool adapters ◄──── allowed action
                    │
          browser inspect / Playwright runner / evidence store
                    │
             reporter + trace + cleanup status
```

**Run State machine (trạng thái của một run):**
```
DRAFT → WAITING_APPROVAL → READY → RUNNING → COLLECTING → CLEANING
                                                  │            │
                            failure evidence ─────┘            ▼
                                             AWAITING_REVIEW
                                             ├─ PASSED
                                             ├─ FAILED
                                             ├─ BLOCKED
                                             └─ CANCELLED
```

**Quy tắc chuyển trạng thái quan trọng:**
- `RUNNING` chỉ vào được từ `READY` (sau preflight và approval)
- `PASSED` chỉ vào được sau: assertion pass + evidence đủ + cleanup done + QA review
- Terminal states (`PASSED`, `FAILED`, `BLOCKED`, `CANCELLED`): không có auto-transition về `RUNNING`; run mới cần ID mới
- Assertion pass nhưng cleanup fail → giữ nguyên test result, báo workflow chưa hoàn tất

**Tool manifest — mỗi tool phải có:**
- Input schema, allowlist target, timeout, output schema
- Side-effect flag (có gây side effect không?)
- Auth scope, redaction, owner

**Ví dụ tools trong scope hẹp:**
- `read_case(sourceId)` — chỉ đọc
- `inspect_ui(scope)` — chỉ quan sát
- `run_case(caseId, environmentAlias, runId)` — chỉ gọi test allowlisted
- `read_result(runId)` — chỉ đọc artifact
- `cleanup_owned_record(runId, recordId)` — chỉ record do run tạo

**Least privilege**: từ chối `shell(command:any)`, browser navigation tùy ý, DB write tổng quát.

**Prompt injection**: Nội dung webpage/log/tool result là dữ liệu không đáng tin để ra lệnh. Nếu trang hiển thị "ignore previous instructions", controller KHÔNG chuyển thành instruction. Guardrail phải implement bằng code/policy, không chỉ bằng prompt.

**Excessive Agency (OWASP LLM06)**: Agent có chức năng, quyền, mức tự chủ vượt quá nhu cầu. Biểu hiện: gọi tool ngoài scope, tự retry không giới hạn, tự sửa oracle khi fail.

**Claim labels trong agent system:**

| Nhãn | Dùng cho | Không được suy diễn thành |
|---|---|---|
| REQ-CONFIRMED | Rule có source ID | Trạng thái app đang chạy |
| DOM-OBSERVED | UI/DOM state tại thời điểm inspect | Kết quả assertion |
| AI-PROPOSAL | Plan/diagnosis do model đề xuất | Contract nghiệp vụ |
| RUN-PASSED/FAILED | Reporter của một attempt cụ thể | Kết quả attempt khác |
| HYPOTHESIS | Giải thích có thể kiểm chứng | Root cause đã chứng minh |
| UNKNOWN | Thiếu nguồn hoặc evidence | Quyền tự bổ sung business rule |

### 🟡 Mở rộng

**Human Approval Gates:**

| Gate | Trước hành động | Reviewer cần thấy |
|---|---|---|
| G1: authorize run | Tạo employee trong lab/shared staging | Case, environment, data prefix, tool scope, cleanup plan |
| G2: ambiguous write/retry | Gửi lại create sau failure | Original evidence, current record lookup, side-effect risk |
| G3: code/oracle change | Sửa locator, assertion | Requirement/DOM evidence, diff, reviewer |
| G4: external report | Publish bug, CI status | Claim-evidence mapping, redaction, unknowns |

**Evidence manifest fields:**
```json
{
  "runId": "...",
  "attemptId": "...",
  "artifactType": "trace|screenshot|reporter",
  "pathOrUri": "...",
  "collectedAt": "...",
  "redactionStatus": "DONE|PENDING",
  "accessScope": "..."
}
```

---

## 2. Bản chất, mục đích, khi nào dùng

**Vì sao cần boundary giữa planner/controller/runner:**
- Planner (AI) có thể sai, hallucinate, hoặc bị inject
- Controller (code/policy) đảm bảo chỉ action hợp lệ mới được thực thi
- Runner thực thi deterministic, reporter ghi kết quả

**Khi nào dùng agent (vs script thuần túy):**
- Khi cần AI đề xuất plan, triage failure, hoặc generate context-aware report
- Khi workflow phức tạp, nhiều điều kiện, cần adaption theo environment
- Nhưng: oracle, assertion, approval vẫn do human kiểm soát

**Retry policy theo loại lỗi:**

| Lớp retry | Có thể áp dụng khi | Guard bắt buộc |
|---|---|---|
| Read-only tool call | Transport timeout có thể phục hồi | Số lần, delay, total time |
| Assertion polling | State dự kiến sẽ đạt trong timeout | Oracle không đổi, target không đổi |
| Whole test retry | QA cho phép sau khi giữ first-failure evidence | Data mới, cleanup độc lập, run attempt mới |

**KHÔNG retry create action khi chưa biết outcome**. Trước write retry: query state → xác định ownership → human decision nếu ambiguous.

---

## 3. Ví dụ thực tế

**Execution report mẫu (AAALE):**
```
Case: EMP-CREATE-01         Source: AC-EMP-01, AC-EMP-02
Run: demo-run-001           Attempt: 1
Revision: example-commit    Environment: isolated-lab
Approved by: trainer-demo   Tool scope: run_case(EMP-CREATE-01)
Data: E2E-AAALE-demo-run-001
Reporter: RUN-FAILED        Oracle: department assertion timed out
Observed: employee ID row appeared; department value did not match
Artifacts: trace ref A1; reporter ref R1
Cleanup: DONE              Review: pending QA
Hypothesis: UI may show stale department; needs discriminating check
Unknown: backend state at assertion time
```

**Stop conditions của agent:**
- Vượt max steps/time/tool calls
- Mất approval
- Scope thay đổi
- runId trùng
- Assertion fail (giữ nguyên, không tự retry)
- Write outcome ambiguous
- Cleanup không thành công
- User hủy

---

## 4. So sánh khái niệm dễ nhầm và bẫy trắc nghiệm

| Dễ nhầm | Phân biệt |
|---|---|
| Agent planner vs Run controller | Planner = AI đề xuất. Controller = code kiểm tra policy/budget. Controller mới có quyền quyết định có thực thi không. Không để planner tự gọi tool trực tiếp. |
| BLOCKED vs FAILED | BLOCKED = thiếu điều kiện chạy, cleanup chưa giải quyết, thiếu evidence. FAILED = assertion của case đã chạy và fail. Report giữ riêng test result khi workflow BLOCKED. |
| DOM-OBSERVED vs RUN-PASSED | DOM-OBSERVED = AI/inspector nhìn thấy element. RUN-PASSED = assertion pass từ Playwright runner với attempt cụ thể. Không thay thế nhau. |
| Toast Success vs Business oracle | Toast = UI feedback. Business oracle = search result, API response, audit log. Toast không đủ để kết luận AC-EMP-02 đạt. |
| Flaky (passed after retry) vs Clean pass | Flaky: failed attempt 1, passed attempt 2. Clean: passed attempt 1. Playwright phân loại riêng. Report phải giữ cả hai attempts. |

**Bẫy trắc nghiệm:**
- Agent "đã nhìn thấy button" = test đã pass → SAI. DOM-OBSERVED ≠ RUN-PASSED. Pass cần assertion từ runner.
- Prompt "hãy cẩn thận" đủ để prevent excessive agency → SAI. Cần implement allowlist và permission bằng code.
- Retry pass lần 2 → báo cáo pass và bỏ failed attempt 1 → SAI. Giữ cả hai attempts; phân loại là "flaky".
- "Agent tested successfully" khi chỉ có tool invocation log → SAI. Cần reporter với assertion evidence.
- Cleanup fail → vẫn mark workflow PASSED → SAI. Cleanup fail phải báo riêng, không merge vào test status.
