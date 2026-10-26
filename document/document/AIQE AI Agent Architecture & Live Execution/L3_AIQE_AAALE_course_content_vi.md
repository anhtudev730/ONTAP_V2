# [NFP] AI Agent Architecture & Live Execution

- **Mã module:** `L3_AIQE_AAALE`
- **Mức trong curriculum:** Advance (theo đầu vào người dùng)
- **Thời lượng:** 32 giờ, gồm 4 unit × 8 giờ; mỗi unit có 4 phiên × 2 giờ.
- **Ngôn ngữ:** Tiếng Việt, giữ thuật ngữ QA/automation và agent quen dùng.
- **Trọng tâm:** Thiết kế một agent có phạm vi hẹp để chuẩn bị, chạy và báo cáo **một** E2E test case; con người giữ quyền xác nhận oracle, phạm vi tool và các bước có side effect.
- **Tài liệu bài tập đi kèm:** [L3_AIQE_AAALE_exercises_vi.md](L3_AIQE_AAALE_exercises_vi.md).
- **Phạm vi artifact:** File này chứa nội dung học để mentor. Hoạt động trong phiên là gợi ý giảng dạy; bài tập chấm điểm và rubric nằm trong handout riêng. Answer key, slide và code project chưa được tạo.

## 1. Bối cảnh và giả định dạy học

Module tiếp nối kiến thức requirement/test case, Playwright Test, locator và evidence trong các tài liệu `L3_AIQE_ARTD`, `L3_AIQE_DALA`, `L3_AIQE_PMLM` của repo. Đây là **giả định về nền tảng học viên**, chưa phải thông tin người dùng xác nhận cho lớp cụ thể. Trainer cần kiểm tra trước buổi đầu: học viên có đọc được TypeScript `async/await`, biết chạy một Playwright test đơn lẻ, hiểu UI assertion, timeout và cleanup hay chưa.

Case study dùng `PortalLite`, application giả lập với dữ liệu synthetic đã mô tả trong `L3_AIQE_PMLM_course_content_vi.md`. Chưa có application live hoặc agent runtime đi kèm yêu cầu này. Vì thế mọi sơ đồ, state, report và code dưới đây là **mẫu thiết kế**, không phải kết quả đã chạy. Tool AI, browser bridge, agent SDK và policy triển khai cụ thể do trainer xác nhận trước khi mở lab; core design không phụ thuộc một nhà cung cấp AI.

### Vấn đề testing xuyên suốt

QA cần kiểm tra một HR Admin tạo employee có ID duy nhất, sau đó tìm thấy employee trong danh sách tìm kiếm với department đã chọn. Nguồn nghiệp vụ của course trước: `AC-EMP-01` và `AC-EMP-02` trong `L3_AIQE_PMLM_course_content_vi.md`. Một agent có thể hỗ trợ đọc case, kiểm tra readiness, gọi đúng test được phép, thu report và gợi ý triage. Agent **không được tự biến** toast, DOM snapshot hoặc câu trả lời của model thành kết luận test pass.

| Thành phần của case | Điều đã có nguồn | Điều cần kiểm tra trong môi trường lab |
| --- | --- | --- |
| Precondition | Actor có role HR Admin; employee ID phải unique (`AC-EMP-01`). | Account synthetic có đúng role, environment alias, data namespace và cleanup helper được cấp quyền. |
| Action | Tạo employee với ID và department đã chọn. | Locator, field label, button name, flow cụ thể từ UI/DOM hiện tại. |
| Oracle | Employee xuất hiện trong danh sách tìm kiếm với department đã chọn (`AC-EMP-02`). | Search/index latency, UI state, có cần API read model phụ trợ hay không. |
| Cleanup | Course trước yêu cầu data riêng và cleanup kể cả khi test fail. | Phương thức cleanup được phê duyệt và định danh đúng record do run tạo. |

Trainer bắt đầu bằng yêu cầu học viên tự viết precondition, action, oracle và unknowns từ bảng trên. Sau đó mới cho AI đề xuất workflow và yêu cầu học viên đối chiếu từng đề xuất với `AC-*`, DOM observation hoặc run evidence.

## 2. Kết quả học tập cấp module

Kết thúc 32 giờ, học viên có thể:

1. Vẽ được boundary giữa goal, agent planner, tool adapter, state store, guardrails, deterministic run controller và Playwright Test runner.
2. Chuyển một E2E test case thành workflow có precondition, tool contract, state transition, oracle, cleanup và stop condition rõ ràng.
3. Thiết kế xử lý timeout, retry và termination theo loại lỗi và side effect, không dùng retry để che regression.
4. Phân biệt requirement, observation, inference, hypothesis, AI proposal và test result; chỉ công bố pass/fail khi có evidence từ run tương ứng.
5. Tạo execution report có run ID, revision, command, environment alias, kết quả assertion, artifact, cleanup outcome, unknowns và human decision.
6. Chỉ ra các approval gate cần thiết trước data write, rerun có side effect, sửa code, truy cập dữ liệu nhạy cảm hoặc publish kết quả.

### Quy tắc claim và evidence

| Nhãn | Dùng cho | Không được suy diễn thành |
| --- | --- | --- |
| `REQ-CONFIRMED` | Quy tắc có source ID được trainer cung cấp. | Trạng thái app đang chạy. |
| `DOM-OBSERVED` | UI/DOM/accessibility state ở thời điểm inspect. | Kết quả assertion của test run. |
| `AI-PROPOSAL` | Kế hoạch, locator candidate, diagnosis do model đề xuất. | Contract nghiệp vụ hoặc fix đã xác nhận. |
| `RUN-PASSED` / `RUN-FAILED` | Reporter/trace của một attempt cụ thể với assertion tương ứng. | Kết quả của attempt khác hoặc môi trường khác. |
| `HYPOTHESIS` | Giải thích có thể kiểm chứng về failure. | Root cause đã chứng minh. |
| `UNKNOWN` | Thiếu nguồn hoặc evidence. | Quyền tự bổ sung business rule. |

Nếu requirement không quy định hành vi, ghi `Not specified`; nếu run thiếu artifact hoặc assertion không đủ, ghi `Insufficient evidence`. Quy tắc này cũng áp dụng cho summary do agent viết.

## Unit 1 — Agent architecture: goals, tools, state, guardrails and run controller (8 giờ)

**Mục tiêu:** Học viên giải thích được vì sao agent cần boundary kỹ thuật và quyền hạn cụ thể trước khi có quyền gọi browser, runner hoặc data tool.

### Kết quả unit

- Tách `goal` (mục tiêu test) khỏi `tool` (khả năng thực hiện), `state` (điều đã biết) và `policy` (điều được phép).
- Thiết kế contract đầu vào/đầu ra cho từng tool và đường đi của evidence.
- Mô tả run controller như code quyết định trạng thái hợp lệ; model chỉ đề xuất bước kế tiếp trong phạm vi đó.
- Nhận diện prompt injection từ webpage/tool output và excessive agency từ tool có quyền quá rộng.

### Phiên 1.1 — Vấn đề QA và anatomy của một agent (2 giờ)

1. Từ `AC-EMP-01/02`, học viên tự đánh dấu điều có nguồn và điều chưa biết. Ví dụ “sau khi click Save, toast hiện ra” là UI observation nếu đã inspect; “employee đã lưu” cần oracle khác.
2. Trainer đưa ra định nghĩa làm việc: agent nhận goal, giữ state, chọn tool trong policy, đọc kết quả và lặp đến stop condition. Một script cố định cũng có controller, nhưng agent có thêm bước diễn giải/đề xuất dựa trên context; diễn giải này vẫn có thể sai.
3. Phân biệt ba lớp: **agent planner** đề xuất hành động; **run controller** kiểm tra policy, state và budget; **test runner** thực thi assertion và phát hành test result. Tool adapter chuyển request đã duyệt sang browser/runner mà không cấp thêm quyền.
4. So sánh “agent đã nhìn thấy button” (`DOM-OBSERVED`) với “test assertion pass” (`RUN-PASSED`) bằng một report mẫu giả lập.

```text
QA goal + source IDs
       │
       ▼
Agent planner ── proposal + rationale ──► Run controller
       ▲                                   │ policy/state/budget check
       │ sanitized observation             ▼
       └──────── Tool adapters ◄──── allowed action
                    │
          browser inspect / Playwright runner / evidence store
                    │
             reporter + trace + cleanup status
```

### Phiên 1.2 — Goals, tool contracts và least privilege (2 giờ)

- Goal đủ hẹp: “Chạy `EMP-CREATE-01` đúng một lần trên lab environment, ghi evidence cho `AC-EMP-01/02`, cleanup record của run và tạo report chờ QA review.” Goal không chứa yêu cầu sửa test hoặc thay đổi product data khác.
- Tool manifest mẫu: `read_case(sourceId)` chỉ đọc; `inspect_ui(scope)` chỉ quan sát; `run_case(caseId, environmentAlias, runId)` chỉ gọi một test allowlisted; `read_result(runId)` chỉ đọc artifact của run; `cleanup_owned_record(runId, recordId)` chỉ thao tác record mà run đã tạo qua helper đã phê duyệt.
- Mỗi tool phải có input schema, allowlist target, timeout, output schema, side-effect flag, auth scope, redaction và owner. Từ chối `shell(command:any)`, browser navigation tùy ý hoặc DB write tổng quát trong workflow học này.
- Nội dung webpage, log và tool result là **dữ liệu không đáng tin để ra lệnh**. Nếu trang hiển thị “ignore previous instructions”, controller không chuyển câu đó thành instruction. Guardrail cần được kiểm tra bằng code/policy, không chỉ bằng prompt.
- Nếu một tool bridge dùng MCP, chỉ coi nó là giao diện gọi tool. Capability và permission thực tế phụ thuộc server/client đang dùng; cần inspect tool list và scope tại runtime. [MCP server overview](https://modelcontextprotocol.io/specification/draft/server/index), [OWASP AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html).

### Phiên 1.3 — State và deterministic controller (2 giờ)

State tối thiểu cho **một** case, **một** run; không lưu cookie, token hoặc raw prompt nhạy cảm:

```ts
type RunPhase =
  | 'DRAFT' | 'WAITING_APPROVAL' | 'READY' | 'RUNNING'
  | 'COLLECTING' | 'CLEANING' | 'AWAITING_REVIEW'
  | 'PASSED' | 'FAILED' | 'BLOCKED' | 'CANCELLED';

type RunState = {
  runId: string;
  caseId: 'EMP-CREATE-01';
  sourceIds: string[];      // ví dụ AC-EMP-01, AC-EMP-02
  environmentAlias: string; // không chứa credential hay URL nhạy cảm
  revision: string;
  phase: RunPhase;
  attempt: number;
  actionBudget: number;
  createdRecordId?: string;
  evidenceRefs: string[];
  approvalRef?: string;
  cleanupOutcome?: 'DONE' | 'FAILED' | 'NOT_NEEDED';
};
```

- `RUNNING` chỉ được vào từ `READY` sau preflight và approval phù hợp; `PASSED` chỉ được vào sau khi assertion của đúng attempt pass, evidence đủ, cleanup outcome được ghi và QA review xong. Nếu assertion pass nhưng cleanup fail, giữ nguyên test assertion result và báo workflow chưa hoàn tất để QA xử lý cleanup.
- Controller ghi event append-only hoặc log tương đương: timestamp, previous phase, next phase, actor, tool, decision, reason, correlation ID. Có thể checkpoint state để phục hồi sau crash; không giả định model memory là nguồn trạng thái đáng tin.
- Duplicate command cùng `runId` cần bị từ chối hoặc trả về status của run đang có. Đây là lựa chọn thiết kế để tránh double create; nó không đảm bảo business API idempotent.

### Phiên 1.4 — Guardrail review và đường dừng (2 giờ)

- Guardrail theo lớp: input validation, allowlisted case/environment, least-privilege identity, tool permissions, operation budget, data classification, evidence redaction và approval gate cho write action. OWASP mô tả excessive agency gắn với chức năng, quyền và mức tự chủ vượt nhu cầu. [OWASP LLM06: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/).
- Terminal states: `PASSED`, `FAILED`, `BLOCKED`, `CANCELLED`. Không có transition tự động từ terminal state về `RUNNING`; run mới cần ID mới và reason rõ.
- Cho học viên review một sơ đồ cố ý sai: model được gọi `run_case` vô hạn, tự sửa assertion khi fail và tự publish “PASS”. Họ phải chỉ ra policy check nào chặn từng lỗi.
- Kết phiên: học viên giải thích bằng lời vì sao prompt “hãy cẩn thận” không thay thế allowlist và permission thực thi.

## Unit 2 — Designing an agent workflow for one E2E test case (8 giờ)

**Mục tiêu:** Chuyển `EMP-CREATE-01` từ case nghiệp vụ thành một execution plan có thể review, trong đó AI hỗ trợ phát hiện gap sau khi QA tự thiết kế bước đầu.

### Kết quả unit

- Viết được run contract gồm precondition, approved action, oracle, evidence, cleanup và unknowns.
- Vẽ được state transition cho một case với checkpoint trước/sau side effect.
- Chọn đúng nơi dùng UI assertion, API read hoặc runner report theo câu hỏi QA cần trả lời.
- Viết prompt bounded để AI review workflow và kiểm tra đề xuất của AI bằng source ID.

### Phiên 2.1 — Manual case decomposition (2 giờ)

QA tự phân rã case trước khi hỏi AI:

| Bước | Câu hỏi QA | Nguồn/evidence cần có | Stop nếu |
| --- | --- | --- | --- |
| Intake | Case có oracle được xác nhận chưa? | `AC-EMP-01/02`, test ID, code revision | Thiếu expected behavior quan trọng. |
| Preflight | Có thể chạy an toàn không? | environment alias, role, allowlist, data prefix, cleanup path | Không xác thực được scope/quyền. |
| Setup | Data có unique và thuộc run không? | generated ID + namespace, fixture record | Trùng ID hoặc dùng shared mutable data. |
| Action | Test đã đi qua UI flow mong muốn? | test steps, trace/call log | Locator/actionability fail. |
| Oracle | Employee đúng ID và department có trong kết quả tìm kiếm? | web-first assertion của test attempt; API read chỉ khi contract cho phép | Assertion fail hoặc thiếu oracle. |
| Teardown | Record đã được cleanup? | cleanup result gắn run ID | Cleanup fail: báo riêng, không xóa dấu vết failure. |
| Review | Kết luận có khớp evidence? | reporter, trace, revision, approval decision | Artifact thiếu hoặc không cùng attempt. |

`AC-EMP-01/02` chỉ cho biết behavior cần kiểm tra; không quy định chính xác field label, endpoint hay độ trễ search. Khi các điểm đó chưa có observation/contract, agent ghi `UNKNOWN` và xin QA/trainer cung cấp nguồn. Không tự sinh locator rồi coi là DOM fact.

### Phiên 2.2 — Workflow, state transition và gate (2 giờ)

```text
DRAFT → WAITING_APPROVAL → READY → RUNNING → COLLECTING → CLEANING
                                                    │            │
                              failure evidence ────┘            ▼
                                             AWAITING_REVIEW
                                             ├─ PASSED
                                             ├─ FAILED
                                             ├─ BLOCKED
                                             └─ CANCELLED
```

- `DRAFT`: QA xác nhận goal/case/oracle. `WAITING_APPROVAL`: reviewer xem target, data write, cleanup, tool permissions và budget. `READY`: preflight pass trong scope đã duyệt.
- `RUNNING`: chỉ tool `run_case` được phép thực thi test allowlisted. `COLLECTING`: lưu reporter, attempt index, screenshot/trace theo policy; failure cũng phải đi qua bước này. `CLEANING`: cleanup chỉ record do run tạo, kể cả assertion fail, nếu helper và quyền còn hợp lệ.
- `AWAITING_REVIEW`: agent tóm tắt evidence và unknowns; QA quyết định final status. `BLOCKED` là thiếu điều kiện chạy, cleanup chưa giải quyết hoặc thiếu evidence để kết luận workflow; `FAILED` là assertion của case đã chạy và fail. Report vẫn giữ riêng test result nếu workflow `BLOCKED`. Infrastructure failure được ghi loại riêng, không gọi là product defect chỉ từ exit code.
- Gate trước write có thể được thiết kế thành approval cho từng run trên lab shared; nếu trainer cấu hình environment cô lập và policy cho phép auto-run, vẫn cần ghi rõ ai đã cấp quyền, giới hạn nào và cách hủy. Chưa có policy cụ thể trong yêu cầu này, nên ví dụ chọn gate theo từng run.

### Phiên 2.3 — Runner contract và example workflow (2 giờ)

- Runner nhận `caseId`, `environmentAlias`, `runId`, `revision` đã validate; không nhận natural-language command để tự suy diễn shell command.
- Runner trả `attemptId`, `exitCode`, per-test status, assertion error, start/end time, artifact refs và cleanup result. Controller phải đối chiếu `runId`/`attemptId` trước khi gắn `RUN-PASSED`.
- Trong test Playwright, dùng locator action và web-first assertion cho UI state. Playwright tự kiểm tra actionability cho nhiều action và auto-retry các web assertion tới timeout; điều đó không tự xác nhận business oracle hoặc sửa selector sai. [Playwright auto-waiting](https://playwright.dev/docs/actionability), [Playwright assertions](https://playwright.dev/docs/test-assertions).
- Ví dụ flow ở mức contract: `open Employees → Create → fill unique ID + department → Save → search ID → assert row ID + department → cleanup`. Tên field/button phải được xác nhận trên lab UI trước khi thành code. `test.step()` có thể làm timeline dễ đọc; không thay thế assertion.
- AI chỉ review “có bỏ sót precondition, false positive risk, cleanup hoặc state transition nào không?”. Input prompt phải có `AC-*`, tool manifest, state policy, dữ liệu đã redact và output yêu cầu gắn `SOURCE`, `ASSUMPTION` hoặc `UNKNOWN` cho mỗi đề xuất.

```text
Hãy review workflow EMP-CREATE-01. Chỉ dùng AC-EMP-01/02 và tool manifest đính kèm.
Không tự tạo locator, endpoint hoặc business rule. Với mỗi gap, ghi:
step, risk, evidence hiện có, điều cần xác minh và đề xuất sửa.
Không đề xuất rerun, data write hay thay assertion nếu chưa qua approval gate.
```

### Phiên 2.4 — Walkthrough có kiểm soát (2 giờ)

- Trainer đưa một dry-run artifact giả lập: `Save` tạo toast nhưng kết quả tìm kiếm chưa có ID. Học viên xác định oracle chưa đạt; agent phải giữ `UNKNOWN` hoặc báo assertion fail theo test run, không ghi pass từ toast.
- Học viên so workflow manual với AI proposal và chỉ giữ đề xuất có nguồn hoặc kiểm tra tiếp được. QA ghi decision log ngắn: accept/reject/defer và lý do.
- Chốt scope: đúng một case, một environment alias, một data namespace và một owner review. Thêm case khác là yêu cầu mới, không phải “bước tiếp theo” agent tự làm.

## Unit 3 — Error handling, retries, resilient waits and safe termination (8 giờ)

**Mục tiêu:** Học viên chọn phản ứng theo loại lỗi và side effect, giữ được evidence gốc khi lỗi xảy ra.

### Kết quả unit

- Phân biệt transient tool failure, infrastructure blocker, locator/synchronization issue, assertion failure và policy violation.
- Chọn wait gắn với observable signal thay cho fixed sleep.
- Thiết kế retry budget và idempotency guard cho từng lớp, đặc biệt với create action.
- Định nghĩa termination khi timeout, approval bị từ chối, budget hết, cleanup fail hoặc evidence không đủ.

### Phiên 3.1 — Error taxonomy và phản ứng đầu tiên (2 giờ)

| Sự kiện | Phân loại sơ bộ | Controller làm gì | Không làm gì |
| --- | --- | --- | --- |
| Tool inspect không kết nối | Tool/infrastructure | Lưu lỗi, thử lại trong budget nếu read-only và policy cho phép. | Báo product defect. |
| Locator match 0 hoặc nhiều phần tử | Test implementation/DOM drift | Dừng action, lưu trace, so với DOM của attempt. | Dùng `.first()` hoặc `force` để ép chạy. |
| UI state đến muộn | Có thể là synchronization hoặc product delay | So signal với contract và timeout đã định; lưu timeline. | Thêm sleep tùy ý. |
| Assertion ID/department fail | Test failure có oracle | Lưu failed attempt; QA triage. | Tự sửa oracle hoặc báo pass từ retry. |
| Create request timeout sau khi gửi | Outcome không rõ, có thể đã tạo | Dừng write; tra cứu record theo ID qua read path được phép. | Gửi lại create mù quáng. |
| Tool ngoài allowlist/approval denied | Policy | Dừng và báo `BLOCKED`/`CANCELLED` theo lý do. | Đi đường tool khác để né gate. |

Failure classification ban đầu là hypothesis. Muốn nói root cause phải có bằng chứng phân biệt, chẳng hạn trace cho locator, response đã gắn correlation ID hoặc backend evidence được phép đọc.

### Phiên 3.2 — Wait theo signal và timeout budget (2 giờ)

- Tách actionability wait của Playwright khỏi business completion. Click thành công chỉ có nghĩa action đã thực hiện theo Playwright; app có thể còn xử lý asynchronous.
- Chọn signal gần oracle nhất: row có employee ID/department trong kết quả tìm kiếm, trạng thái loading kết thúc, hoặc read model API nếu là contract được duyệt. Toast chỉ là feedback, không đủ cho `AC-EMP-02`.
- Giới hạn timeout theo SLA/contract được trainer cung cấp; nếu không có, ghi là **lab policy** chứ không tuyên bố requirement sản phẩm. Agent phải dừng khi hết budget và báo quan sát cuối cùng.
- Playwright web-first assertion tự retry trong khoảng timeout; `expect.poll` hoặc waiter theo response chỉ dùng khi cần đọc một state khác và đã biết event contract. Không đợi network idle một cách chung chung; không dùng `waitForTimeout` để che nguyên nhân. [Playwright assertions](https://playwright.dev/docs/test-assertions), [Playwright auto-waiting](https://playwright.dev/docs/actionability).

### Phiên 3.3 — Retry ở ba lớp và side effect (2 giờ)

| Lớp retry | Có thể áp dụng khi | Guard bắt buộc | Báo cáo |
| --- | --- | --- | --- |
| Read-only tool call | Transport timeout có thể phục hồi. | Số lần, delay, tổng thời gian; cùng scope/read target. | Mỗi attempt và lỗi được giữ. |
| Assertion polling | State dự kiến sẽ đạt trong timeout có căn cứ. | Oracle không đổi, target không đổi. | Thời điểm đạt hoặc timeout. |
| Whole test retry | QA/trainer cho phép điều tra flake sau khi đã giữ first-failure evidence. | Data mới/cleanup độc lập, run attempt mới, không dùng pass của retry để xóa fail trước. | `passed`, `flaky` hoặc `failed` đúng semantics runner. |

Không tự retry create action khi response không rõ đã commit chưa. Trước mọi write retry, controller phải query trạng thái qua đường read được phê duyệt, xác định record ownership, rồi yêu cầu human decision nếu vẫn ambiguous. Playwright Test có hỗ trợ retry test và phân loại failed-then-passed là `flaky`; mặc định retry không bật, và retry chạy trong worker mới. [Playwright retries](https://playwright.dev/docs/test-retries).

### Phiên 3.4 — Safe termination và failure timeline (2 giờ)

- Stop conditions: vượt max steps/time/tool calls; mất approval; scope thay đổi; `runId` trùng; assertion fail; write outcome ambiguous; cleanup không thành công; user hủy.
- Khi stop: ngừng side effect mới, giữ evidence gốc, cố gắng cleanup **chỉ nếu** cleanup vẫn được phép và xác định được record ownership; nếu không, báo cleanup pending kèm owner để xử lý thủ công.
- Học viên diễn giải một timeline giả lập: `T0 preflight → T1 approved → T2 create submitted → T3 timeout → T4 read finds record → T5 no second create → T6 cleanup → T7 review`. Điểm cần chứng minh là “không biết response” khác “chắc chắn chưa tạo”.
- Trainer hỏi: “Nếu retry pass, báo cáo kết quả đầu tiên thế nào?” Câu trả lời phải giữ cả failed attempt và passed retry, không xóa dấu vết flake.

## Unit 4 — Evidence capture, execution reporting and human approval gates (8 giờ)

**Mục tiêu:** Tạo report đủ để QA khác tái dựng một run, hiểu giới hạn kết luận và quyết định có cho agent tiếp tục hay không.

### Kết quả unit

- Lập evidence manifest gắn từng artifact với `runId`, `attemptId`, revision và assertion.
- Viết report phân biệt factual result, hypothesis, cleanup status và QA decision.
- Đặt approval gate trước action có side effect, retry, code change và publish.
- Rà dữ liệu nhạy cảm trong trace, screenshot, logs và prompt trước khi chia sẻ.

### Phiên 4.1 — Evidence capture theo lifecycle (2 giờ)

| Giai đoạn | Evidence tối thiểu | Giới hạn kết luận |
| --- | --- | --- |
| Before run | Source IDs, test ID, revision, environment alias, config, approval ref. | Chỉ chứng minh kế hoạch/run context. |
| During run | Start/end, attempt index, step timeline, locator/assertion errors, synthetic record ID. | Tool success không tự là business success. |
| After run | Reporter status, assertion details, trace/screenshot theo policy, cleanup status. | Chỉ đúng attempt/environment/revision đó. |
| Review | QA decision, owner, unknowns và next action đã duyệt. | Không biến hypothesis thành root cause. |

- Trace Viewer cho phép xem timeline, DOM snapshot, console và network của recorded run; screenshot là visual state, không chứng minh backend commit. Cấu hình trace quyết định attempt nào được giữ. Ví dụ `retain-on-failure` giữ failed attempt, còn `on-first-retry` không lưu first failure. Chọn mode theo mục tiêu điều tra và retention policy. [Playwright trace options](https://playwright.dev/docs/test-use-options), [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer-intro).
- `testInfo.attach()` cho phép gắn artifact vào test result. Chỉ attach dữ liệu đã được phép chia sẻ; reporter/trace có thể chứa header, URL, form input hoặc PII. [Playwright TestInfo](https://playwright.dev/docs/api/class-testinfo).
- Evidence manifest mẫu chỉ lưu reference/metadata: `{runId, attemptId, artifactType, pathOrUri, collectedAt, redactionStatus, accessScope}`. Không in secret hoặc raw token vào manifest.

### Phiên 4.2 — Execution report có thể kiểm chứng (2 giờ)

Mẫu dưới đây là **dữ liệu giả lập minh họa format**, không phải một lab đã chạy:

```text
Case: EMP-CREATE-01             Source: AC-EMP-01, AC-EMP-02
Run: demo-run-001               Attempt: 1
Revision: example-commit        Environment: isolated-lab
Approved by: trainer-demo       Tool scope: run_case(EMP-CREATE-01)
Data: E2E-AAALE-demo-run-001    Command: [runner allowlist entry for this case]
Reporter: RUN-FAILED            Oracle: department assertion timed out
Observed: employee ID row appeared; department value did not match expected
Artifacts: trace ref A1; reporter ref R1 (synthetic placeholders)
Cleanup: DONE                  Review: pending QA
Hypothesis: UI may show stale department; needs discriminating check
Unknown: backend state at assertion time
```

- Report cần ghi **command thực tế** và result thực tế khi lab được chạy; placeholder không được dùng như bằng chứng. Không viết “agent tested successfully” nếu chỉ có tool invocation log hoặc MCP snapshot.
- Nếu runner không khởi động được, status là `BLOCKED` với launch error và environment details; không gọi là `RUN-FAILED` của product assertion.
- Nếu first attempt fail rồi retry pass, hiển thị cả hai attempt và final classification `flaky` theo runner; QA vẫn quyết định có triage defect hay automation issue.

### Phiên 4.3 — Human approval gates (2 giờ)

| Gate | Trước hành động | Reviewer cần thấy | Sau quyết định |
| --- | --- | --- | --- |
| G1: authorize run | Tạo employee trong lab/shared staging. | Case, environment, data ID prefix, tool scope, action budget, cleanup plan. | Approval ref + hạn/scope, hoặc stop. |
| G2: ambiguous write/retry | Gửi lại create hoặc whole test sau failure. | Original evidence, current record lookup, side-effect risk, retry reason. | New attempt/run ID; giữ original report. |
| G3: code/oracle change | Sửa locator, wait, assertion hoặc test data policy. | Requirement/DOM evidence, diff, reviewer, planned validation. | Review source code và chạy lại riêng. |
| G4: external report/share | Publish bug, CI status hoặc gửi artifact cho người khác. | Claim-evidence mapping, redaction, access scope, unknowns. | Human sign-off và provenance. |

- Approval cần là checkpoint cụ thể, gắn hành động và phạm vi. Một câu “agent được phép làm mọi thứ để test pass” không đủ làm grant.
- Agent có thể chuẩn bị bản tóm tắt cho reviewer, nhưng controller phải kiểm tra approval ref và scope trước khi gọi tool. Nếu reviewer từ chối, ghi `CANCELLED`/`BLOCKED` với lý do, không tự tìm đường vòng.
- Least privilege và human approval cho high-impact action là các biện pháp được OWASP khuyến nghị; bảng gate trên là **thiết kế cho module**, không phải tính năng mặc định của mọi agent framework. [OWASP LLM06](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/).

### Phiên 4.4 — Review cuối module và handoff (2 giờ)

- Học viên nhận một run packet giả lập gồm source IDs, state log, reporter, trace manifest và AI summary. Trước tiên họ tự lập timeline và kết luận, sau đó dùng AI để tìm claim không có evidence.
- Trainer yêu cầu giải thích miệng: tool nào đã gọi; bước nào có side effect; oracle nào đã/không đạt; vì sao report status hợp lệ; cleanup xử lý ra sao; gate tiếp theo thuộc ai.
- Handoff tối thiểu: workflow map, tool manifest, state transition table, retry/termination policy và execution report mẫu. Đây là checkpoint học tập trong giờ, không phải yêu cầu nộp bài chấm điểm trong file này.

## 3. Hướng dẫn trainer và giới hạn triển khai

- Chuẩn bị PortalLite lab hoặc simulator có thể reset, test `EMP-CREATE-01` đã được QA review, synthetic account/data, allowlisted runner, trace/report storage và cleanup helper. Nếu thiếu live app, dùng dry-run packet; đánh dấu rõ đó là mô phỏng, không báo `RUN-PASSED`.
- Đầu mỗi unit cho học viên tự đọc source và quyết định QA trước khi dùng AI. Trainer hỏi “evidence nào làm bạn đổi kết luận?” thay vì chỉ hỏi “agent đề xuất gì?”.
- Xác nhận version Playwright, agent SDK/MCP server và tool capabilities trên môi trường lab. Không suy từ tài liệu về việc tool hiện tại có quyền nào. Config và retry policy phải được đọc từ project thực tế.
- Dùng dữ liệu synthetic. Không đưa credential, token, cookie, PII, production log hoặc raw trace nhạy cảm vào prompt công khai. Giới hạn quyền truy cập artifact và retention theo policy lớp/tổ chức.
- Rà coverage cuối khóa theo sáu kết quả học tập: yêu cầu học viên giải thích architecture, workflow, retry, termination, evidence report và approval bằng cùng case. Nếu chỉ có thiết kế trên giấy, ghi “đã review design”; nếu có live run, nêu command/reporter/artifact của run đó.
- Dùng bốn bài trong `L3_AIQE_AAALE_exercises_vi.md` theo thứ tự unit. Gói input synthetic của handout đủ cho dry-run; khi chuyển sang live lab, thay observation/attempt placeholder bằng evidence hiện tại và giữ nguyên ranh giới nguồn–kết quả.
- Phát handout cùng file content; bốn bài thực hành nằm trong 32 giờ của module. Nếu thay synthetic packet, giữ source ID, provenance, attempt ID và trạng thái approval. Live lab cần repository starter, environment alias, account synthetic, allowlisted command, tool permission, cleanup helper và artifact retention policy. Đánh giá reasoning và claim–evidence mapping trước AI output; đáp án/finding mẫu cho trainer không nằm trong handout.

## 4. Nguồn tham chiếu và provenance

- **Nguồn case study trong repo:** `L3_AIQE_PMLM_course_content_vi.md`, mục 5.2–5.4 (`AC-EMP-01/02`, data/cleanup policy) và Unit 5–7 (synchronization, AI review, evidence). Đây là source curriculum giả lập, không phải bằng chứng app đã được chạy.
- **Playwright:** [Auto-waiting](https://playwright.dev/docs/actionability), [Assertions](https://playwright.dev/docs/test-assertions), [Retries](https://playwright.dev/docs/test-retries), [Trace options](https://playwright.dev/docs/test-use-options), [Trace Viewer](https://playwright.dev/docs/trace-viewer-intro), [TestInfo attachments](https://playwright.dev/docs/api/class-testinfo). Kiểm tra ngày 2026-09-27; version project lab có thể khác.
- **Tool/agent security:** [MCP server overview](https://modelcontextprotocol.io/specification/draft/server/index), [OWASP AI Agent Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html), [OWASP LLM06: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/). Các guardrail và gate trong module là mẫu thiết kế QA cần hiện thực theo policy local.
