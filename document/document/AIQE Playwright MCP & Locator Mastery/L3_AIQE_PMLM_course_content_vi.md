# [NFP] Playwright MCP & Locator Mastery

- **Mã khóa học:** `L3_AIQE_PMLM`
- **Cấp độ:** Advanced
- **Thời lượng:** 56 giờ (7 unit × 8 giờ)
- **Hình thức:** 30% technical concepts và demo, 60% guided lab/live execution, 10% review, debugging và assessment.
- **Ngôn ngữ automation:** TypeScript với Playwright Test. Các khái niệm có thể áp dụng cho JavaScript; code mẫu ưu tiên TypeScript để giữ type safety.
- **Kết quả trọng tâm:** Học viên xây dựng được locator có semantic contract rõ ràng, script có synchronization ổn định, biết dùng Playwright MCP để tăng tốc discovery/debugging nhưng vẫn review code và xác thực bằng evidence từ test run.
- **Tài liệu bài tập riêng:** `L3_AIQE_PMLM_exercises_vi.md`.

## 1. Đối tượng học viên

- QA Automation Engineer, SDET, full-stack tester và QA lead đang viết hoặc review E2E test trên web.
- Kỹ sư đã từng dùng Selenium/Cypress/Playwright cơ bản nhưng gặp flaky test, locator trùng khớp, timeout hoặc khó tái lập failure.
- Nhóm muốn đưa AI assistant và Model Context Protocol (MCP) vào workflow automation mà vẫn kiểm soát source code, credential, test data và chất lượng test.

## 2. Điều kiện tiên quyết

Học viên cần có khả năng:

- Đọc TypeScript/JavaScript cơ bản: `async/await`, function, object, import/export và error message.
- Hiểu browser, URL, HTTP request/response, DOM và khái niệm UI state ở mức nền tảng.
- Dùng terminal, Git và package manager trong repository đã được cấp quyền.
- Phân biệt test data dùng cho môi trường kiểm thử với dữ liệu thật; không đưa credential, cookie, token hoặc dữ liệu production vào prompt/tool chưa được phê duyệt.

Không yêu cầu học viên đã biết Playwright hay MCP. Người chưa có nền tảng TypeScript cần hoàn thành pre-work 4–6 giờ trước khóa học.

## 3. Kết quả học tập cấp khóa

Khi hoàn thành khóa học, học viên có thể:

1. Giải thích execution model của Playwright Test: test runner, worker, browser process, browser context, page, fixture và test isolation.
2. Thiết lập project, browser runtime, environment variable và command chạy test theo cách tái lập được.
3. Dùng Playwright MCP như một tool bridge có kiểm soát để inspect UI, điều hướng, thu thập browser state và hỗ trợ phân tích; không nhầm lẫn tool output với test evidence.
4. Đọc DOM và accessibility tree để chọn locator theo role, accessible name, label, placeholder, text, test id và semantic relation.
5. Thiết kế locator strategy bền vững, có thứ tự ưu tiên, scope rõ và có guard chống locator trùng khớp.
6. Dùng web-first assertion, auto-wait, explicit state assertion và event-based synchronization để giảm flaky execution.
7. Dùng AI để đề xuất skeleton, locator candidate, refactor hoặc hướng debug; kiểm tra từng giả định bằng DOM, requirement và live run trước khi merge.
8. Debug locator failure bằng trace, screenshot, video, console/network evidence và timeline; viết bug/automation finding có bằng chứng tái lập.

## 4. Nguyên tắc làm việc trong khóa học

### 4.1 Manual observation trước, AI/MCP sau

MCP và AI giúp giảm thời gian discovery, nhưng không thay thế test oracle. Mỗi lần xử lý UI, học viên đi theo chuỗi sau:

1. Xác định user flow, precondition và expected state từ requirement hoặc acceptance criteria.
2. Quan sát UI/DOM/accessibility tree bằng browser hoặc tool được cấp quyền.
3. Chọn locator có semantic contract phản ánh ý nghĩa của element.
4. Viết action và assertion vào source code có review được.
5. Chạy test trong environment xác định, lưu evidence cần thiết.
6. Khi failure xảy ra, phân loại theo application defect, locator drift, synchronization, test data/environment hoặc framework issue trước khi sửa.

AI không thể xác nhận rằng UI thực sự hiển thị một giá trị, selector thật sự unique, hoặc suite thật sự pass nếu không có evidence từ một lượt chạy phù hợp.

### 4.2 Nhãn bằng chứng

Mọi lab report, code review và capstone phải phân biệt các nhãn sau:

| Nhãn | Ý nghĩa | Ví dụ hợp lệ |
|---|---|---|
| `REQ-CONFIRMED` | Điều được requirement/acceptance criteria đã phê duyệt quy định | “User không có quyền Admin không thấy menu Users.” |
| `DOM-OBSERVED` | Điều quan sát trong DOM hoặc accessibility tree tại thời điểm inspect | “Nút có role `button` và accessible name `Save changes`.” |
| `RUN-PASSED` | Kết quả assertion pass trong run đã ghi nhận | “Chromium run `#184` pass với 3 assertion.” |
| `RUN-FAILED` | Kết quả failure có log/trace liên quan | “`toHaveURL` timeout sau 5 s; trace kèm theo.” |
| `HYPOTHESIS` | Giải thích chưa được kiểm chứng | “Overlay có thể đang intercept click.” |
| `UNKNOWN` | Thông tin chưa đủ để kết luận | “Chưa có spec về timeout tối đa của eventual update.” |

Không được đổi `HYPOTHESIS` thành kết luận chỉ vì AI hoặc MCP đề xuất cách giải thích nghe hợp lý.

### 4.3 Contract của một locator tốt

Một locator không chỉ là chuỗi selector. Nó là contract trả lời được bốn câu hỏi:

- Element này đại diện cho user intent nào?
- User/accessibility layer nhận diện nó bằng role và name nào?
- Locator được scope vào vùng UI nào để tránh match nhầm?
- Thay đổi UI nào là expected refactor và thay đổi nào phải làm test fail để cảnh báo regression?

Ví dụ `page.getByRole('button', { name: 'Save changes' })` mô tả intent tốt hơn một CSS chain phụ thuộc layout. Nhưng role/name chỉ là lựa chọn tốt khi accessibility semantics của UI đã được kiểm tra, không phải vì nó luôn đúng trong mọi ứng dụng.

## 5. Case study xuyên suốt: PortalLite Access & Employee Administration

Toàn khóa dùng một application giả lập có dữ liệu synthetic, tên `PortalLite`. Mục tiêu là giữ cùng business context trong khi độ khó locator và synchronization tăng dần.

### 5.1 Bối cảnh sản phẩm

`PortalLite` là admin portal của một công ty SaaS. Người dùng có thể đăng nhập, tìm nhân viên, tạo employee, thay đổi department, phân quyền user và kiểm tra audit entry. Các trang dùng SPA navigation; danh sách có loading skeleton, toast notification, modal confirm và một số thao tác asynchronous.

```text
Sign in
  └─ Dashboard
      ├─ Employees ── Search / Create / Edit / Archive
      ├─ Admin ────── Users / Roles
      └─ Audit ────── Search event by entity ID
```

### 5.2 Acceptance criteria đã xác nhận

| ID | Quy tắc đã xác nhận |
|---|---|
| `AC-AUTH-01` | User hợp lệ đăng nhập thành công và được chuyển đến Dashboard. |
| `AC-AUTH-02` | Sai credential hiển thị error message an toàn; password không xuất hiện trong UI, trace note hoặc report. |
| `AC-EMP-01` | User có role HR Admin có thể tạo employee với employee ID duy nhất. |
| `AC-EMP-02` | Employee vừa tạo xuất hiện trong danh sách tìm kiếm và có department đã chọn. |
| `AC-EMP-03` | Archive yêu cầu confirm; employee đã archive không xuất hiện trong default active search. |
| `AC-RBAC-01` | User không có quyền Admin không thể truy cập Users bằng menu hoặc URL trực tiếp. |
| `AC-AUD-01` | Create và archive employee tạo audit event có entity ID, actor và timestamp. |
| `NFR-A11Y-01` | Interactive controls có accessible role/name phù hợp với user-facing label; icon-only control cần accessible name. |
| `NFR-ASYNC-01` | Sau action thành công, UI chỉ báo complete khi backend state đã được phản ánh; toast một mình không là bằng chứng cuối cùng cho mọi flow. |

### 5.3 Test data và cleanup policy

- Mỗi test tự tạo data có prefix `E2E-PMLM-<run-id>`; không dùng employee của người khác làm fixture mutable.
- Test tạo employee phải cleanup bằng API/DB helper đã được phê duyệt hoặc UI flow archive trong `afterEach`/fixture teardown, kể cả khi assertion giữa chừng fail.
- Credential chỉ đọc từ secret/environment variable. Không hard-code, in ra console hoặc gửi vào prompt AI.
- Khi target là shared demo/staging, giới hạn concurrency theo chính sách environment và không chạy destructive test vào giờ bảo trì/đối soát.

### 5.4 Test architecture được dùng trong lab

Khóa học dùng phân lớp để locator không bị rải trong spec:

```text
tests/
  specs/                 # test case / business scenario
  steps/                 # flow theo ngôn ngữ nghiệp vụ
  pages/                 # UI behavior của từng page/component
  elements/              # locator factory / locator contract
  fixtures/              # auth, data, lifecycle
  support/               # logger, evidence, API cleanup
```

Quy ước: **Elements** chỉ chứa locator; **Pages** thực hiện UI interaction/assertion cục bộ; **Steps** ghép business flow; **Specs** gọi Steps và diễn tả test intent. Framework hiện hữu của tổ chức có thể dùng tên folder khác, nhưng trách nhiệm không được trộn lẫn.

---

# Unit 1 — Playwright concepts, execution model and MCP overview

- **Thời lượng:** 8 giờ
- **Mục tiêu unit:** Dựng mental model đúng về test runner và browser isolation; hiểu MCP là lớp kết nối tool có scope, permission và output cần được review.

## Kết quả học tập

Sau Unit 1, học viên có thể:

1. Vẽ được lifecycle từ command → test discovery → worker → fixture → browser/context/page → assertion → reporter/artifact.
2. Phân biệt browser process, browser context và page; giải thích vì sao context isolation quan trọng hơn việc “mở tab mới”.
3. Giải thích auto-wait của Playwright hỗ trợ điều gì và không tự giải quyết điều gì.
4. Mô tả MCP server, client, tool, tool input/output và permission boundary ở mức thực hành.
5. Phân biệt browser observation qua MCP với source-controlled test execution qua Playwright Test.

## Nội dung và agenda 4 session

### Session 1 (2 giờ) — Test runner và browser isolation

- Playwright Test, test file, `test()`, `expect()`, project, reporter và command selection.
- Worker process, retry, shard và hệ quả với shared data.
- Browser process so với browser context: storage/cookie isolation, local storage, permission và network state.
- Page, frame, popup, dialog và vì sao UI action không nên dựa vào global browser state.
- Fixture lifecycle: `beforeEach`, `afterEach`, worker fixture, test fixture; nguyên tắc teardown ngay cả khi test fail.

**Mini demo:** So sánh hai test cùng dùng một employee fixed với hai test tạo data có run ID riêng. Học viên chỉ ra race condition khi chạy parallel.

### Session 2 (2 giờ) — Execution model và actionability

- Locator là query lazy; locator được resolve khi action/assertion cần element, không phải tại dòng khai báo.
- Actionability checks: visible, stable, receives events, enabled, editable tùy action.
- Navigation, SPA route, hydration, animation, XHR và event loop là các nguồn race phổ biến.
- `test.step()` để thể hiện business flow trong report, không phải để che giấu assertion hoặc gom toàn bộ test vào một step.
- Khi nào dùng fixture, API setup, UI setup và cách giữ test independent.

**Thảo luận:** “Click pass” khác “business operation complete” như thế nào trong `AC-EMP-01`?

### Session 3 (2 giờ) — MCP overview có kiểm soát

- MCP: client kết nối server; server expose tool/resource/prompt theo implementation và policy. Không phải mọi MCP server đều có cùng tool hoặc capability.
- Playwright MCP thường hữu ích cho browser inspection, navigation, snapshot, screenshot và exploratory interaction. Tên tool, tham số, auth mode và browser lifecycle phải xem từ runtime/documentation đang dùng.
- Quy tắc input: không nhập secret vào tool parameter; không copy raw production data; dùng URL và account test được cấp quyền.
- Quy tắc output: snapshot/screenshot phản ánh state tại thời điểm gọi tool; cần ghi environment, URL, timestamp và điều kiện quan sát nếu dùng làm evidence.
- MCP output không thay cho test artifact: test pass/fail phải đến từ command, reporter, trace hoặc CI record của Playwright Test.

**Demo có hướng dẫn:** Dùng MCP/browser inspection để xác nhận login form có `textbox` cho username/password và `button` Sign in; sau đó đối chiếu locator với DOM/accessibility semantics trước khi viết code.

### Session 4 (2 giờ) — Read test như một execution timeline

- Đọc một spec theo thứ tự fixture setup → action → assertion → teardown.
- Lập bảng timeline có timestamp tương đối, expected state, observed state và evidence source.
- Phân tích các failure category: product defect, locator defect, synchronization defect, environment/data defect và test implementation defect.
- Review một AI-generated summary: xác định phần nào là `DOM-OBSERVED`, phần nào là `HYPOTHESIS`.

---

# Unit 2 — Environment setup, browser interaction and first live test

- **Thời lượng:** 8 giờ
- **Mục tiêu unit:** Chuẩn hóa môi trường và chạy được một live test có traceable command, configuration, test data và cleanup.

## Kết quả học tập

Học viên có thể:

1. Khởi tạo hoặc kiểm tra Playwright project mà không phá hỏng convention có sẵn của repository.
2. Cấu hình browser project, base URL, environment variable, timeout, artifact policy và reporter theo mục tiêu test.
3. Viết được flow đăng nhập đầu tiên bằng web-first locator và assertion.
4. Chạy focused test, đọc report và xác định đúng phạm vi evidence của một run.
5. Ghi nhận browser interaction qua MCP để hỗ trợ discovery mà không đưa code chưa review vào suite.

## Nội dung và agenda 4 session

### Session 1 (2 giờ) — Project readiness và config

- Đọc `package.json`, `playwright.config.ts`, script, TypeScript config, `.env.example`, test folder và CI workflow trước khi thay đổi.
- Browser install là dependency của runtime; browser khác package Node và có thể bị policy/sandbox chặn.
- `use.baseURL`, `storageState`, `trace`, `screenshot`, `video`, `actionTimeout`, `navigationTimeout`, `expect.timeout` và test timeout: ý nghĩa, trade-off, giới hạn.
- Dùng environment variable cho URL/credential; validate biến bắt buộc sớm với error message không làm lộ giá trị.
- Không “fix” unstable test bằng tăng global timeout vô hạn.

### Session 2 (2 giờ) — Browser interaction foundation

- `page.goto`, `getByRole`, `fill`, `press`, `click`, `selectOption`, `check`, `uncheck`, `setInputFiles`, `hover` và keyboard flow.
- Thao tác bằng user intent; không dùng `evaluate()` để set value/click nhằm bypass UI behavior trừ khi test chủ đích kiểm tra integration khác.
- Popup, dialog và download: tạo waiter trước trigger action.
- `test.step` và log giàu ngữ cảnh nhưng không log password/token.

### Session 3 (2 giờ) — First live test

Ví dụ spec tối thiểu:

```ts
import { test, expect } from '@playwright/test';

test('PMLM-001: HR Admin signs in and reaches Dashboard', async ({ page }) => {
  await test.step('Open the sign-in page', async () => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  });

  await test.step('Submit valid synthetic credentials', async () => {
    await page.getByLabel('Username').fill(process.env.E2E_USERNAME!);
    await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in' }).click();
  });

  await test.step('Verify authenticated state', async () => {
    await expect(page).toHaveURL(/\/dashboard$/);
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  });
});
```

- Vì sao heading/URL assertion xác nhận authenticated state tốt hơn chỉ `click()`.
- Cách đặt test ID, test title, run command và artifact link để người khác tái lập.
- Headed/headless mode: mục đích debug khác nhau, không dùng visual observation làm kết luận duy nhất.

### Session 4 (2 giờ) — Run triage và cleanup

- Focused run bằng title/tag/file theo script của repository; không invent command nếu project có wrapper riêng.
- Đọc stdout, reporter, trace path và `.last-run` (nếu project tạo file đó).
- Phân biệt discovery/list test với execution thực tế.
- Cleanup strategy cho test tạo data và cách report cleanup failure riêng với assertion failure.

---

# Unit 3 — DOM inspection, accessible roles and locator fundamentals

- **Thời lượng:** 8 giờ
- **Mục tiêu unit:** Đọc UI như một semantic tree, biến quan sát DOM thành locator contract có thể review.

## Kết quả học tập

Học viên có thể:

1. Phân biệt DOM structure, rendered state và accessibility tree.
2. Xác định role, accessible name, label association, state/property và scope của interactive element.
3. Dùng `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, `getByTestId` đúng ngữ cảnh.
4. Phát hiện name collision, hidden duplicate, iframe, shadow DOM hoặc virtualized list làm locator không reliable.
5. Viết locator inventory có evidence và rationale thay vì selector copy-paste.

## Nội dung và agenda 4 session

### Session 1 (2 giờ) — DOM không đồng nghĩa accessibility tree

- Node, attribute, text node, visibility, disabled state, `aria-*`, label association và focus order.
- Role implicit/explicit; native semantic HTML ưu tiên hơn việc thêm ARIA sai.
- Accessible name thường đến từ visible text, `label`, `aria-label`, `aria-labelledby` hoặc rule khác; không đoán bằng class name.
- DevTools, Playwright Inspector và browser/MCP snapshot là ba cách quan sát khác nhau; luôn đối chiếu tại đúng UI state.

### Session 2 (2 giờ) — Locator API foundation

| API | Khi phù hợp | Rủi ro cần kiểm tra |
|---|---|---|
| `getByRole()` | Control/landmark có semantics và accessible name tốt | Name trùng, role bị implement sai, label động |
| `getByLabel()` | Form field có label association | Label visual không liên kết input thật |
| `getByPlaceholder()` | Placeholder là stable contract của product | Placeholder thường thay đổi/có i18n; không thay label |
| `getByText()` | Static copy hoặc cell/text content có ý nghĩa | Text partial, duplicate, hidden template |
| `getByTestId()` | Contract test-specific đã quản trị | ID generic, ID gắn implementation, dùng sai scope |
| CSS/XPath | Không có semantic/test contract khả dụng | Dễ bám layout/DOM depth; cần rationale rõ |

- Locator chaining: scope bằng `getByRole('dialog')`, `getByRole('row')`, `filter({ hasText })`, `filter({ has })`.
- Strictness: locator match nhiều element là signal phải giải quyết contract; `.first()`/`.nth()` không phải shortcut mặc định.

### Session 3 (2 giờ) — Tables, cards, dialog và composite controls

- Tìm một employee row theo cell content rồi action trong chính row.
- Scope modal/dialog trước khi thao tác control có cùng name phía sau overlay.
- Combobox/autocomplete, custom select, date picker: inspect role/state thật sự thay vì giả định mọi dropdown là `<select>`.
- Virtualized list: DOM chỉ render phần visible; scroll/action cần dựa user flow, không “expect count = toàn bộ dataset” nếu UI contract không hứa điều đó.
- Iframe và shadow root: xác định boundary trước, dùng `frameLocator` hoặc supported locator model; không chạy CSS xuyên qua boundary một cách mù quáng.

### Session 4 (2 giờ) — Locator contract review

- Chuyển screenshot/snapshot thành locator inventory.
- Đánh giá locator theo: semantic strength, uniqueness, scope, stability, accessibility alignment và maintenance cost.
- Locator failure là signal UX/accessibility regression khi control mất accessible name; không phải luôn là “test cần sửa”.
- Khi requirement không nói UI label/role là public contract, ghi assumption và trao đổi với product/design.

---

# Unit 4 — Locator strategy: robust selectors and anti-patterns

- **Thời lượng:** 8 giờ
- **Mục tiêu unit:** Thiết kế locator policy có thể áp dụng toàn framework, biết nhận diện anti-pattern trước khi chúng tạo technical debt và flaky suite.

## Kết quả học tập

Học viên có thể:

1. Chọn locator theo thứ tự ưu tiên dựa trên user-facing contract và tình trạng accessibility thực tế.
2. Thiết kế `data-testid`/test hook contract với naming, ownership và versioning phù hợp.
3. Refactor locator brittle thành locator scoped, strict và readable.
4. Chỉ ra anti-pattern trong AI-generated hoặc legacy code bằng evidence DOM/requirement.
5. Quyết định khi nào locator failure cần sửa test, sửa UI semantic hay mở product question.

## Nội dung và agenda 4 session

### Session 1 (2 giờ) — Locator decision framework

**Thứ tự mặc định, không phải luật tuyệt đối:**

1. `getByRole()` với accessible name đã xác nhận.
2. `getByLabel()` cho input có label contract.
3. `getByTestId()` cho element không có user-facing semantic ổn định hoặc state machine phức tạp.
4. `getByText()` với text là business contract và uniqueness đã chứng minh.
5. CSS được giới hạn trong component boundary rõ ràng; XPath chỉ dùng khi không có lựa chọn tốt hơn và phải có rationale.

- Stable identity khác stable rendering. Một class “stable” vài sprint vẫn có thể là internal style hook, không phải contract.
- I18n: không hard-code translated copy nếu test cần chạy nhiều locale; chọn test id hoặc inject locale-specific expected copy có chủ đích.
- Component library: utility class, generated hash, DOM depth và icon SVG path không được xem là test contract.

### Session 2 (2 giờ) — Test ID governance

- Test ID là API giữa product UI và automation, không phải “cứ thêm là xong”.
- Format đề xuất: `<feature>-<element>-<intent>` ví dụ `employee-create-submit`, `employee-row-edit`.
- Không encode mutable value, index layout hoặc implementation detail: `card-3`, `blue-button`, `grid-column-6`.
- Ownership: product frontend owner thay đổi hook phải cập nhật contract/release note; QA owner review impact; test code không tự tạo hidden DOM hook bên ngoài source product policy.
- Không lạm dụng test ID để bỏ qua accessibility defect trên interactive control vốn phải có role/name.

### Session 3 (2 giờ) — Anti-pattern clinic

| Anti-pattern | Vì sao fragile | Cách xử lý |
|---|---|---|
| `.oxd-button` / `.btn-primary` | Style class không mô tả business intent, nhiều match | Role/name hoặc test id scoped |
| `div:nth-child(3) > button` | Coupled với layout/order | Scope theo row/card/dialog và role |
| `page.locator('text=Save').last()` | Che name collision, phụ thuộc render order | Làm locator strict, scope vùng UI |
| `page.getByText('John')` | Có thể match heading, row, hidden content | Role/cell exact + parent scope |
| XPath full DOM path | Mất khi wrapper/component đổi | Semantic locator hoặc component contract |
| `force: true` | Bypass actionability, che overlay/disabled defect | Xác định state khiến action chưa valid |
| Selector sinh bởi AI không inspect | Có thể hallucinate DOM hoặc match sai | Verify bằng DOM, count và live run |

### Session 4 (2 giờ) — Refactor workshop

- Tách locator khỏi business step; tránh `page.locator(...)` nằm trong test ở nhiều nơi.
- Naming: `saveButton`, `employeeRow(employeeId)`, `departmentCombobox`; không `button1`, `element`, `locator2`.
- Viết count guard trong helper khi uniqueness là precondition nghiệp vụ.
- Review diff để đảm bảo refactor không thay đổi assertion intent hoặc test data lifecycle.

---

# Unit 5 — Assertions, waits and synchronization for stable execution

- **Thời lượng:** 8 giờ
- **Mục tiêu unit:** Viết assertion cho observable business state, dùng synchronization đúng signal thay vì thêm sleep hoặc tăng timeout mù quáng.

## Kết quả học tập

Học viên có thể:

1. Phân biệt action completion, UI feedback và business state completion.
2. Chọn web-first assertion phù hợp với URL, visibility, text, attribute, count, value và state.
3. Dùng `expect.poll`, `expect.toPass`, `waitForResponse`, `waitForEvent` hoặc `Promise.all` theo event contract rõ ràng.
4. Debug flaky test bằng timeline và artifact thay vì cố định `waitForTimeout`.
5. Thiết kế retry, timeout và artifact policy không che defect.

## Nội dung và agenda 4 session

### Session 1 (2 giờ) — Assertion như test oracle

- `expect(locator).toBeVisible()`, `toHaveText`, `toContainText`, `toHaveValue`, `toHaveCount`, `toBeEnabled`, `toHaveAttribute`, `toHaveURL`.
- Exact vs partial match: assertion càng rộng càng dễ false positive; assertion quá chi tiết lại dễ coupled với copy/layout không thuộc scope.
- Negative assertion: `not.toBeVisible()` cần đúng target/scope; absence có thể là loading hoặc selector sai.
- UI assertion xác nhận điều user thấy; API/database assertion xác nhận state khác. Chọn evidence layer phù hợp risk.

### Session 2 (2 giờ) — Auto-wait và explicit synchronization

- Locator action và web-first assertion retry cho đến timeout; `await` vẫn phải đúng thứ tự.
- Auto-wait không biết business event nào là “done”, không giải quyết state async không được UI expose, và không sửa locator match sai.
- Wait response/event chỉ khi response/event là contract liên quan. Không wait tất cả network hoặc hard-code endpoint internal không thuộc test scope.
- Tạo listener/waiter trước action trigger để không bỏ lỡ event.

```ts
const createResponse = page.waitForResponse((response) =>
  response.url().includes('/api/employees') && response.request().method() === 'POST'
);

await page.getByRole('button', { name: 'Save employee' }).click();
await expect((await createResponse).status()).toBe(201);
```

Đoạn trên chỉ phù hợp nếu endpoint/status là integration contract được phép assert. Sau đó vẫn cần kiểm tra UI state theo `AC-EMP-02`.

### Session 3 (2 giờ) — Eventual consistency và state machine

- Create employee có thể trả accepted trước khi search index cập nhật. Không dùng sleep 3 giây vì tốc độ backend thay đổi theo environment.
- Dùng status indicator, polling một API read model được phê duyệt hoặc UI retry assertion có timeout được lý giải.
- Idempotent retry trong test không đồng nghĩa retry user action; hiểu side effect trước khi test runner retry.
- Test retry dành cho infra/intermittent failure có known policy; không dùng để “làm dashboard xanh”.

### Session 4 (2 giờ) — Flake triage workshop

- Xây timeline: trigger, request, UI transition, assertion start/end, test artifact.
- Nhóm nguyên nhân: stale UI, animation/overlay, detached element, data collision, rate limit, backend lag, true product defect, test bug.
- Triage trước khi patch: failure reproducibility, browser/project, revision, artifact, network/console signal, independent rerun.
- Thay fixed wait bằng evidence-driven synchronization và thêm assertion có ý nghĩa.

---

# Unit 6 — AI-assisted script generation and mandatory code review

- **Thời lượng:** 8 giờ
- **Mục tiêu unit:** Dùng AI như pair programmer có guardrail, biến output thành change có review được và không cho phép AI-generated code đi thẳng vào suite.

## Kết quả học tập

Học viên có thể:

1. Viết prompt bounded bằng requirement, observed DOM, coding convention và output format cụ thể.
2. Redact secret/PII/internal data trước khi gửi AI; lưu source provenance và reviewer decision.
3. Đánh giá AI output về locator validity, assertion strength, synchronization, isolation, cleanup, type safety và maintainability.
4. Sửa code sau review và chạy evidence-backed validation.
5. Phân biệt AI proposal, code review finding và observed test result.

## Nội dung và agenda 4 session

### Session 1 (2 giờ) — AI task boundary và prompt design

- AI phù hợp để draft test skeleton, tạo edge-case list, diễn giải error log đã redact, đề xuất refactor hoặc tạo review checklist.
- AI không có quyền tự quyết product behavior, không có live browser state nếu bạn không cung cấp verified snapshot, và có thể bịa locator/endpoint/command.
- Prompt tốt gồm: goal, requirement ID, DOM facts, existing folder convention, constraints, expected output, dữ liệu bị cấm và yêu cầu nêu assumption.
- Không gửi secret, session state, raw trace có token/cookie, source proprietary vượt policy hoặc personally identifiable information.

Ví dụ prompt bounded:

```text
Bạn là reviewer Playwright TypeScript. Dựa trên các facts sau và KHÔNG tự tạo DOM mới:
- DOM-OBSERVED: dialog role="dialog", accessible name="Create employee".
- DOM-OBSERVED: Save button role="button", name="Save employee".
- REQ-CONFIRMED: employee ID phải unique và xuất hiện trong active list.
- Convention: locators ở elements, UI actions ở pages, business flow ở steps.

Hãy đề xuất skeleton cho ba layer. Gắn ASSUMPTION cho mọi điều không có trong facts.
Không dùng fixed sleep, force click, nth/first/last hoặc hard-coded credential.
```

### Session 2 (2 giờ) — Mandatory review checklist

Mọi AI-generated change cần ít nhất một reviewer con người sử dụng checklist:

| Hạng mục | Câu hỏi review |
|---|---|
| Requirement | Assertion có truy về `AC-*` hay expected behavior xác nhận không? |
| Locator | Role/name/test id có trong DOM evidence? Có unique và scoped không? |
| Action | Có mô phỏng user interaction thay vì bypass UI không? |
| Synchronization | Có fixed sleep, arbitrary timeout, force action hay event race không? |
| Test data | Data unique? Cleanup có chạy khi failure? Có shared mutable fixture không? |
| Security | Có secret, token, PII, raw request header hoặc log nhạy cảm không? |
| Architecture | Elements/Pages/Steps/Specs có đúng boundary không? |
| Evidence | Có live run, typecheck/discovery, hoặc blocker được phân biệt rõ không? |

- Reviewer không chỉ sửa style: phải reject hallucinated locator, overly broad assertion và invalid business assumption.
- AI output dùng được vẫn phải được human review; code non-AI cũng vẫn cần review bình thường.

### Session 3 (2 giờ) — Review clinic: AI draft có lỗi

Giảng viên cung cấp draft như sau:

```ts
await page.locator('.employee-form button').last().click();
await page.waitForTimeout(3000);
await expect(page.getByText('Success')).toBeVisible();
await page.getByText(employeeId).click({ force: true });
```

Học viên phải chỉ ra tối thiểu:

- `.last()` che duplicate và không scope dialog.
- `waitForTimeout(3000)` không gắn state/event.
- `Success` không chứng minh employee searchable hay department đúng.
- `force: true` che overlay/disabled/actionability issue.
- Không rõ test data/cleanup và không biết `employeeId` xuất hiện ở phần tử nào.

Sau đó rewrite với evidence phù hợp hoặc ghi `UNKNOWN` khi DOM/requirement chưa đủ.

### Session 4 (2 giờ) — Provenance và approval workflow

- Ghi prompt purpose, input classification, AI proposal summary, reviewer, decision, code revision và validation command. Không cần lưu prompt chứa dữ liệu nhạy cảm; lưu sanitized summary khi policy yêu cầu.
- Pull request description phân biệt: “AI đề xuất”, “reviewer đã thay đổi”, “run đã xác nhận”.
- Không auto-merge chỉ vì AI đề xuất patch pass lint/typecheck.
- Dùng AI để generate negative cases nhưng product owner/QA vẫn xác nhận risk và expected outcome trước implementation.

---

# Unit 7 — Debugging locator failures and collecting evidence

- **Thời lượng:** 8 giờ
- **Mục tiêu unit:** Tái lập, phân loại và điều tra failure bằng evidence package để đưa ra fix hoặc escalation có căn cứ.

## Kết quả học tập

Học viên có thể:

1. Đọc Playwright call log và xác định action/assertion, locator và expected state đã fail.
2. Thu thập/đọc trace, screenshot, video, browser console, network signal và source revision trong phạm vi policy.
3. Phân biệt locator drift với UI timing, authentication expiry, test data collision, environment issue và product regression.
4. Dùng MCP/browser inspection sau failure để tạo hypothesis có kiểm soát, không làm thay đổi evidence gốc.
5. Viết evidence-based bug report hoặc automation fix proposal kèm reproduction route.

## Nội dung và agenda 4 session

### Session 1 (2 giờ) — Failure anatomy

- Locator timeout: zero match, many match/strictness, hidden/detached element, wrong frame/page, state chưa render.
- Action timeout: disabled, overlay intercept, animation, viewport/focus, navigation race.
- Assertion timeout: expected state không đến, expected sai, locator sai scope hoặc system async chậm.
- Lỗi browser launch/MCP connection/sandbox không phải assertion failure; tách infrastructure signal khỏi product conclusion.
- Reproduce với command/environment/browser/revision giống nhau trước khi đổi code.

### Session 2 (2 giờ) — Artifact-first debugging

- Trace Viewer timeline: actions, snapshots, console, network, source; trace chỉ hữu ích khi retention policy thu được artifact.
- Screenshot/video hỗ trợ hiểu visual state, nhưng không tự cho biết DOM/semantic hoặc backend state.
- Console/network có thể chứa sensitive data; redact khi đính kèm ticket/training artifact.
- Ghi artifact manifest: path/link, source run, timestamp, hash/reference, access control và redaction status.
- Không overwrite evidence gốc khi rerun exploratory test; tách original failed run và investigation rerun.

### Session 3 (2 giờ) — Evidence-led triage

Flow triage:

```text
Failure report
  ├─ Same command/revision/environment reruns?
  │    └─ no → classify as not yet reproducible; preserve original artifacts
  ├─ Locator resolves zero/multiple/wrong element?
  │    └─ yes → inspect DOM + accessibility state at failure point
  ├─ Expected UI state contradicted by requirement?
  │    └─ yes → product/requirement discussion; do not patch test blindly
  ├─ Eventual state delayed or infrastructure unhealthy?
  │    └─ yes → collect service/environment evidence and ownership
  └─ Test implementation/data isolation issue?
       └─ patch, review, rerun and preserve comparison evidence
```

- MCP use sau failure: mở đúng URL/state hoặc rerun controlled để inspect current UI. Kết quả mới là `DOM-OBSERVED` của investigation rerun, không thay thế DOM state ở original failure trace.
- Correlate: test ID, run ID, browser project, environment alias, revision, generated employee ID, trace and screenshot path.

### Session 4 (2 giờ) — Debugging war room và communication

- Đọc 4 incident pack: duplicate locator, modal overlay, expired auth state, delayed search indexing.
- Timebox investigation; nêu next discriminating check thay vì liệt kê hypothesis dài.
- Bug report tốt: setup, exact command, synthetic data, expected/actual, reproducibility, artifact links, scope/impact và unknowns.
- Automation fix proposal tốt: root cause evidence, minimal patch, risk, tests to rerun, rollback/monitoring plan nếu cần.

# Hướng dẫn cho giảng viên

## Chuẩn bị environment

- Cung cấp repository starter, version Node/package lock đã kiểm tra, browser dependency, environment alias và account synthetic tách theo nhóm.
- Cung cấp route/demo target ổn định hoặc mock server để learner tập trung locator/synchronization thay vì bị block bởi business setup.
- Bật trace `retain-on-failure` hoặc policy tương đương; xác nhận storage location/quyền truy cập trước lab Unit 7.
- Chuẩn bị snapshot/UI states cố ý: duplicate button name, modal overlay, missing accessible name, virtualized grid và delayed update.
- Không cho học viên dùng credential production hoặc test destructive trên môi trường không được phê duyệt.

## Cách facilitation

- Demo một lần “AI/MCP nói có locator” nhưng source test fail do name collision để nhấn mạnh verification boundary.
- Khi học viên hỏi selector nào “best”, yêu cầu họ trả lời intent, scope, DOM evidence và product contract trước khi đánh giá syntax.
- Không reward việc thêm wait/retry nhanh nhất. Reward diagnosis có evidence, minimal fix và decision record rõ.
- Trong review clinic, yêu cầu learner chỉ ra false positive risk trước khi bàn về style.
- Với lỗi môi trường/browser launch, hướng learner phân loại infrastructure blocker và thu evidence; không bắt họ bịa product conclusion.

## Gợi ý pacing

| Unit | Concept/demo | Guided lab | Review/assessment | Output |
|---|---:|---:|---:|---|
| U1 | 3h | 3h | 2h | Execution/MCP map |
| U2 | 2h | 4h | 2h | First live run record |
| U3 | 3h | 3h | 2h | Locator inventory |
| U4 | 2h | 4h | 2h | Locator policy + refactor |
| U5 | 3h | 4h | 1h | Synchronization rationale |
| U6 | 3h | 3h | 2h | AI review package |
| U7 | 2h | 4h | 2h | Incident evidence package + defense |

## Giới hạn cần nói rõ với học viên

- Syntax, tool names, MCP capabilities, browser install procedure và policy có thể khác theo version/repository. Luôn kiểm tra `package.json`, config và documentation/runtime của environment hiện tại trước khi chạy command.
- Một locator pass trong một DOM state không chứng minh nó ổn định ở mọi locale, viewport, permission hoặc data volume.
- Trace/screenshot hỗ trợ điều tra nhưng không thay thế requirement hay business oracle.
- AI/MCP giúp tăng tốc discovery và review; accountability cho code, test evidence và quyết định merge vẫn thuộc về con người.
