# U6_incident-triage — Incident Timeline, Fact/Hypothesis & Runner Outcome Review

```
Mode: DRY-RUN
Source IDs + versions:
  INCIDENT-PACKET-06 (INC-61 → INC-64)
  RET-PACKET-06 (retry summary)
  REQ-PACKET-AOCE v1 (AC-EMP-01/02, LAB-AOCE-03/04/05)
  FLOW-PACKET-03 (F01, F02)
Assumptions / Not specified:
  - Tất cả timelines và DOM cards là synthetic/simulated; không có live trace.
  - Search SLA: Not specified.
  - Index lag SLA: Not specified.
  - Không gán nhãn "flaky" hoặc "root cause" nếu chưa đủ chứng cứ.
Manual analysis (trước AI): xem các phần bên dưới.
```

---

## INC-61 — Strict-Mode Violation (Modal/Overlay, F01)

### Timeline Facts

| Time | Event | Type | Notes |
|---|---|---|---|
| t+0ms | Create employee dialog mở; page có 2 buttons tên "Save" | **Fact** (DOM observation) | 2 Save buttons đồng thời trong DOM |
| t+100ms | `page.getByRole('button', {name:'Save'})` match=2 | **Fact** (runner log) | Locator không đủ scope để phân biệt 2 nút |
| t+150ms | Runner báo strict-mode violation; chưa click; chưa write | **Fact** (runner log) | Playwright strict mode: reject khi locator match >1 element |

### DOM Card Evidence

- Dialog name "Create employee" có **đúng 1** Save button bên trong.
- Overlay visible **0–900ms** (có một Save button thứ 2 nằm ngoài dialog, trong overlay).

### Evidence Gaps

- Không biết overlay là gì (confirmation dialog? loading overlay?).
- Không biết overlay Save button có disabled hay không.
- Không biết overlay tồn tại bao lâu sau t+100ms.

### Hypotheses (chưa xác nhận)

| Hypothesis | Discriminating Check |
|---|---|
| H1: Overlay chứa Save button thứ 2; locator cần scope vào dialog | Kiểm tra locator `page.getByRole('dialog', {name:'Create employee'}).getByRole('button', {name:'Save'})` — nếu unique thì H1 đúng |
| H2: Overlay disappear sau 900ms; test chạy trong window 0–900ms | Thêm `waitForSelector` overlay gone trước khi click; xem match count giảm về 1 |
| H3: Race condition giữa dialog render và overlay dismiss | Chụp DOM snapshot tại t+100ms và t+200ms để so sánh |

### Layer

- **UI / Locator layer** — không phải app logic failure; locator không đủ scope.
- Không có write nên không có data risk.

### AI Candidate Analysis

| Candidate fix | Đánh giá |
|---|---|
| Append `.first()` | **Sai** — `.first()` chọn nút đầu tiên không theo ngữ nghĩa; có thể click overlay Save thay vì dialog Save → false positive hoặc wrong action |
| `force:true` | **Sai** — bypass visibility/enabled checks; nếu overlay Save bị hidden/disabled thì force click là wrong element |
| Wait 5 seconds | **Sai hướng** — hardcoded sleep không phải wait condition; không đảm bảo overlay đã dismiss; brittle |

**Tất cả 3 candidate fix đều có thể tạo false positive hoặc click sai element.**

---

## INC-62 — Unknown Write Outcome (F01)

### Timeline Facts

| Time | Event | Type | Notes |
|---|---|---|---|
| t+0ms | Save click dispatch request | **Fact** | Click đã xảy ra |
| t+1500ms | Client response timeout; runner step failed | **Fact** (runner log) | Client không nhận response; step marked fail |
| t+1800ms | Server ledger ghi created owned ID `record-ref-62` | **Fact** (synthetic server ledger) | Server đã tạo record dù client timeout |
| t+2100ms | Search UI chưa có row; index lag (SLA unknown) | **Fact** + **Gap** | Record có thể tồn tại nhưng chưa index |
| t+2400ms | Planner đề xuất click Save lại cùng ID | **Proposed action — NOT executed** | Đây chỉ là proposal; chưa được thực hiện |
| t+2600ms | `lookup_owned_record` trả về `record-ref-62`, dept QA | **Fact** (lookup result) | Record đã tồn tại sau lookup |

**State tại t+2600ms:**
- Record `record-ref-62` (owned, dept QA) đã tồn tại theo server ledger và lookup.
- Runner assertion: chưa có.
- Search row: chưa xuất hiện (index lag).
- Cleanup: chưa bắt đầu.

### Evidence Gaps

- Runner assertion result: chưa có.
- Search row availability: index lag SLA unknown.
- Không biết liệu duplicate create có xảy ra nếu click Save lần nữa với cùng ID.

### Hypotheses

| Hypothesis | Discriminating Check |
|---|---|
| H1: Write success (server created), client chỉ bị timeout | `lookup_owned_record` trả `record-ref-62` → **đã xác nhận** tại t+2600ms |
| H2: Search row chưa có do index lag | Chờ index (nếu SLA đã biết) rồi search lại; nếu xuất hiện → lag |
| H3: Retry click Save có thể tạo duplicate record | Không retry; lookup đã confirm record tồn tại → retry là risk |

### AI Candidate Analysis

- Planner đề xuất "click Save lại cùng ID" tại t+2400ms.
- **Sai** — tại t+2600ms lookup đã confirm record tồn tại. Retry write khi record đã có → **duplicate write risk**.
- Phải stop-and-reconcile theo LAB-AOCE-05; không retry theo timeout đơn lẻ.

### Layer

- **Write / State recovery layer** — không phải UI locator issue.
- Write outcome known sau t+2600ms (lookup success); nhưng search/runner assertion vẫn pending.

---

## INC-63 — Virtualized Row in iframe (F02)

### Timeline Facts

| Time | Event | Type | Notes |
|---|---|---|---|
| — | Main page locator không thấy row | **Fact** (runner log) | Locator scope sai: trong main page, không trong iframe |
| — | DOM card: iframe title "Employee directory"; renders only 20 visible rows | **Fact** (DOM card) | Virtualized list; chỉ render rows visible trong viewport |
| — | Target owned record có trong synthetic lookup | **Fact** (lookup result) | Record tồn tại trong data store |
| — | Search textbox nằm trong iframe | **Fact** (DOM card) | Phải frame vào iframe trước khi interact |
| — | Không có observation rằng target row đã render sau search | **Gap** | Chưa verify search action đã được thực hiện trong iframe |

### Evidence Gaps

- Chưa biết search trong iframe đã được thực hiện chưa.
- Chưa biết sau khi search, target row có render (scroll vào viewport) không.
- Record exists trong lookup ≠ row visible trong virtualized list.

### Hypotheses

| Hypothesis | Discriminating Check |
|---|---|
| H1: Locator scope sai (main page thay vì iframe) | Dùng `page.frameLocator('[title="Employee directory"]')` để scope vào iframe |
| H2: Virtualized list không render row vì chưa search | Verify search textbox trong iframe được filled với exact employee ID trước lookup |
| H3: Search đúng nhưng row cần scroll vào viewport | Sau search, scroll hoặc đợi row visible trước assertion |

### AI Candidate Analysis

- "Ignore missing row; API says record exists so F02 passed."
- **Sai** — Oracle LAB-AOCE-03 yêu cầu **search row visible với exact ID + department Engineering**. Record existence trong API/lookup không phải UI assertion.
- Bỏ qua missing row = bỏ oracle = **hard gate violation**. False positive.

### Layer

- **UI / iframe / virtualization layer** — locator không đủ scope; không phải data issue.
- Frame + search + scroll là actions, không tự là assertions.

---

## INC-64 — Runner Environment Exception (CI)

### Timeline Facts

| Time | Event | Type | Notes |
|---|---|---|---|
| — | CI browser startup permission exception | **Fact** (CI log) | Exception xảy ra trước test body |
| — | No click, no assertion, no write evidence | **Fact** | Không có bất kỳ test action nào |
| — | Reporter process incomplete | **Fact** | Không có full runner output |
| — | Wrapper đề xuất classify as "application flaky" và retry 10 lần | **Proposed action** | Chưa được thực hiện |

### Evidence Gaps

- Nguyên nhân browser startup permission exception: unknown.
- Không có assertion → không thể nói về app behavior.
- Không có write → không có cleanup concern.

### Hypotheses

| Hypothesis | Discriminating Check |
|---|---|
| H1: Runner thiếu quyền launch browser (sandboxing) | Check CI runner config: `--no-sandbox` flag, user permissions, OS security policy |
| H2: Playwright browser binary chưa được install trên runner | Check `playwright install` step có chạy không và exit code |
| H3: OS/container không hỗ trợ chromium trên runner | Thử runner khác; kiểm tra runner OS version vs. chromium requirements |

### AI Candidate Analysis

- "Classify as application flaky and retry 10 times."
- **Sai** — exception xảy ra **trước test body**, không phải trong test. Không có app interaction. Đây là **environment/infrastructure failure**, không phải app flakiness.
- Retry 10 lần: (1) vượt budget policy (max 1 retry); (2) nếu environment issue thì retry không fix được; (3) có thể tạo write nếu một attempt nào đó thành công browser start rồi fail sau — uncontrolled.
- **Phải báo environment issue; không retry. Cần environment fix trước.**

### Layer

- **Infrastructure / Environment layer** — ngoài app và locator.
- Không được báo "application assertion failure" hay "flaky test".

---

## Phần 5 — RET-PACKET-06 Review (Retry Outcomes)

| Packet | Outcome | Facts | Interpretation | Sai lầm nếu kết luận |
|---|---|---|---|---|
| Run X | Fail attempt 1, Pass attempt 2 | Observed outcomes only | Pass-after-retry ≠ fixed. Không có evidence root cause hay fix. | Không được gọi là "resolved" hay "flaky fixed" |
| Run Y | Fail attempt 1, Fail attempt 2 | Consistent failure | Consistent failure → hướng đến systematic issue, nhưng chưa đủ để conclude | Không được nói "app broken" mà không có root cause |
| Run Z | Pass attempt 1 | Clean pass | No retry needed | Không được dùng Run Z để dismiss Run Y failures |

**Không ghép kết quả các runs để gọi current run pass.**
**Pass-after-retry ≠ root cause fixed; chỉ là retry succeeded.**
**n=3 runs quá nhỏ để suy reliability hay pattern đáng tin cậy.**

---

## Phần 6 — Review Log (Manual Triage)

| Observation | Finding | Source | Decision |
|---|---|---|---|
| AI candidate INC-61: `.first()` + `force:true` + wait 5s | Tất cả 3 có thể tạo false positive hoặc click sai element | INC-61 DOM card | **REJECT all 3** — dùng scoped locator thay |
| AI candidate INC-62: click Save lại sau timeout | Duplicate write risk; lookup đã confirm record tồn tại | INC-62 t+2600ms lookup | **REJECT** — stop và reconcile; không retry |
| AI candidate INC-63: ignore missing row vì API confirms | Bỏ UI oracle LAB-AOCE-03; false positive | LAB-AOCE-03 contract | **REJECT** — phải verify row trong iframe |
| AI candidate INC-64: classify app flaky, retry 10x | Exception trước test body; không phải app failure; retry 10x vượt policy | INC-64 timeline, POLICY-PACKET-AOCE | **REJECT** — environment fix required |
| RET-PACKET-06: Run X pass-after-retry = fixed | Không có root cause evidence | RET-PACKET-06 note | **REJECT interpretation** — ghi "pass-after-retry" only |

**Unresolved risks / next evidence / owner:**
- INC-61: cần DOM snapshot với overlay để verify H1/H2. Owner: trainee.
- INC-62: cần runner assertion và search result sau index lag clears. Owner: runner/trainer.
- INC-63: cần verify iframe search action đã executed và row rendered. Owner: trainee.
- INC-64: cần environment investigation. Owner: trainer (runner config).
