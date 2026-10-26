# 05 — Playwright, MCP & Locator Mastery

> Nguồn: `L3_AIQE_PMLM` — Playwright MCP & Locator Mastery, Unit 1–7

---

## 1. Kiến thức và keyword cần nắm

### 🔴 Bắt buộc nắm

**Playwright execution model:**
```
Command (npx playwright test)
   → Test runner: discover, plan workers
      → Worker process: fixture setup
         → Browser process (isolated)
            → Browser context (isolated storage, cookies, permissions)
               → Page
                  → Fixtures: beforeEach, test, afterEach
                     → Action/Assertion
                        → Reporter + Artifacts
```

**Browser context isolation**: mỗi test nên có context riêng. Context isolation tách biệt cookies, localStorage, permissions và network state. Không phải mỗi tab mới là context mới — phải dùng `browser.newContext()`.

**Locator là lazy query** — không resolve khi khai báo mà resolve khi action/assertion cần element. Điều này có nghĩa locator cũ vẫn có thể stale khi DOM thay đổi.

**Actionability checks** — trước khi thực hiện action, Playwright kiểm tra:
- `visible` — element hiển thị
- `stable` — không đang animate
- `receives events` — không bị overlay che
- `enabled` — không disabled
- `editable` — input có thể nhập

**Web-first assertions** tự retry cho đến timeout:
```typescript
await expect(locator).toBeVisible();           // chờ visible
await expect(locator).toHaveText('text');      // chờ text match
await expect(locator).toHaveCount(1);          // chờ đúng số lượng
await expect(page).toHaveURL(/\/dashboard$/);  // chờ URL match
```

**Locator API và khi dùng:**

| API | Khi phù hợp | Rủi ro |
|---|---|---|
| `getByRole()` | Control có accessible role và name | Name trùng, role implement sai |
| `getByLabel()` | Form field có label association | Label visual không liên kết input thật |
| `getByPlaceholder()` | Placeholder là stable product contract | Dễ thay đổi, có i18n |
| `getByText()` | Static copy có ý nghĩa | Partial match, duplicate, hidden element |
| `getByTestId()` | Contract test-specific có governance | ID generic hoặc gắn implementation |
| CSS/XPath | Không có semantic contract khả dụng | Bám layout/DOM depth; cần rationale |

**Thứ tự ưu tiên locator (không phải luật tuyệt đối):**
1. `getByRole()` với accessible name đã xác nhận
2. `getByLabel()` cho input có label contract
3. `getByTestId()` cho element không có user-facing semantic ổn định
4. `getByText()` với text là business contract và uniqueness đã chứng minh
5. CSS trong component boundary rõ; XPath chỉ khi không có lựa chọn tốt hơn

**MCP (Model Context Protocol)** — giao thức kết nối AI model với tools. Playwright MCP cho phép AI inspect UI, navigate, screenshot. Quan trọng:
- MCP output = `DOM-OBSERVED` (observation tại thời điểm gọi tool)
- MCP output ≠ test execution evidence
- Test pass/fail phải đến từ reporter của Playwright Test, không từ MCP snapshot

**Nhãn bằng chứng trong PMLM:**

| Nhãn | Ý nghĩa |
|---|---|
| REQ-CONFIRMED | Requirement/AC đã phê duyệt |
| DOM-OBSERVED | Quan sát trong DOM/accessibility tree tại thời điểm inspect |
| RUN-PASSED | Assertion pass trong run đã ghi nhận |
| RUN-FAILED | Failure có log/trace liên quan |
| HYPOTHESIS | Giải thích chưa kiểm chứng |
| UNKNOWN | Chưa đủ thông tin |

**Anti-patterns trong locator:**

| Anti-pattern | Vì sao sai | Cách xử lý |
|---|---|---|
| `.oxd-button` / `.btn-primary` | Style class, không mô tả intent, nhiều match | Role/name hoặc test id scoped |
| `div:nth-child(3) > button` | Coupled với layout | Scope theo row/card/dialog và role |
| `.last()` | Che name collision | Làm locator strict, scope vùng UI |
| `force: true` | Bypass actionability, che overlay issue | Xác định state khiến action chưa valid |
| `waitForTimeout(3000)` | Không gắn với state/event | Dùng web-first assertion với timeout hợp lý |
| AI-generated selector không inspect | Có thể hallucinate DOM | Verify bằng DOM, count và live run |

### 🟡 Mở rộng

**Flaky test taxonomy:**
- Stale UI / Animation overlay
- Detached element (DOM changed after locator resolved)
- Data collision (shared mutable data giữa tests)
- Backend lag (eventual consistency)
- Locator drift (UI changed, locator still matching wrong element)
- True product defect (nên báo, không nên fix bằng wait)

**Test architecture PMLM:**
```
tests/
  specs/         ← test case / business scenario
  steps/         ← flow theo ngôn ngữ nghiệp vụ
  pages/         ← UI behavior của từng page/component
  elements/      ← locator factory / locator contract
  fixtures/      ← auth, data, lifecycle
  support/       ← logger, evidence, API cleanup
```

**Test ID governance:** Format đề xuất: `<feature>-<element>-<intent>`. Ví dụ: `employee-create-submit`, `employee-row-edit`. Không encode mutable value hoặc index layout.

---

## 2. Bản chất, mục đích, khi nào dùng

**Locator là contract** — không chỉ là selector string. Contract phải trả lời:
1. Element này đại diện cho user intent nào?
2. User/accessibility layer nhận diện bằng role và name nào?
3. Locator được scope vào vùng UI nào?
4. Thay đổi UI nào là expected refactor vs phải làm test fail?

**AI trong test generation** — AI phù hợp để:
- Draft test skeleton, edge-case list
- Đề xuất refactor, review checklist
- Diễn giải error log đã redact

AI không có: live browser state, verified DOM, khả năng confirm selector unique. Mọi AI-generated code phải qua human review trước merge.

**Review checklist bắt buộc cho AI-generated code:**

| Hạng mục | Câu hỏi |
|---|---|
| Requirement | Assertion truy về AC-* hay expected behavior đã xác nhận? |
| Locator | Role/name/test id có trong DOM evidence? Unique và scoped? |
| Action | Mô phỏng user interaction, không bypass UI? |
| Synchronization | Có fixed sleep, arbitrary timeout, force action không? |
| Test data | Unique? Cleanup khi failure? Shared mutable fixture không? |
| Security | Có secret, token, PII không? |
| Architecture | Elements/Pages/Steps/Specs đúng boundary? |

---

## 3. Ví dụ thực tế

**First live test — PMLM-001 (Login):**
```typescript
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

**Wait response đúng cách (chỉ khi endpoint là contract):**
```typescript
const createResponse = page.waitForResponse((response) =>
  response.url().includes('/api/employees') && response.request().method() === 'POST'
);
await page.getByRole('button', { name: 'Save employee' }).click();
await expect((await createResponse).status()).toBe(201);
// Sau đó vẫn cần assert UI state theo AC-EMP-02
```

**AI-generated code có lỗi (phải reject):**
```typescript
// ❌ SAI — nhiều vấn đề:
await page.locator('.employee-form button').last().click(); // last() che name collision
await page.waitForTimeout(3000);                             // fixed sleep
await expect(page.getByText('Success')).toBeVisible();       // toast ≠ employee searchable
await page.getByText(employeeId).click({ force: true });     // force bypass actionability
```

---

## 4. So sánh khái niệm dễ nhầm và bẫy trắc nghiệm

| Dễ nhầm | Phân biệt |
|---|---|
| Auto-wait vs Business completion | Auto-wait đảm bảo actionability (element sẵn sàng). Business completion (employee đã lưu vào DB, search index update) cần assertion riêng. |
| Browser context vs Page | Context = isolated session (cookies, storage). Page = một tab trong context. Context isolation quan trọng hơn "mở tab mới". |
| MCP output vs Test evidence | MCP observation = DOM-OBSERVED. Test pass/fail phải từ Playwright reporter. Không dùng MCP screenshot làm test pass evidence. |
| Locator failure vs Product bug | Locator fail vì CSS class đổi = automation issue. Locator fail vì accessible name mất = có thể là accessibility regression trong product. Phân loại trước khi fix. |
| test.step() vs assertion | test.step() thể hiện flow trong report nhưng không tự tạo assertion. Vẫn cần expect() trong step. |

**Bẫy trắc nghiệm:**
- Click thành công = business operation complete → SAI. Click chỉ là action. Business operation cần oracle assertion (search result, API response, audit log).
- Toast "Success" = employee đã lưu → SAI. Toast là UI feedback, không đủ làm oracle cho AC-EMP-02 (employee phải xuất hiện trong search với department đúng).
- Tăng timeout để fix flaky test = good practice → SAI. Cần triage nguyên nhân trước. Timeout cao che defect, tăng cost.
- `first()` / `nth()` giải quyết multiple match → SAI. Multiple match = locator contract không strict, cần scope hoặc thêm unique identifier.
- AI propose locator → dùng ngay → SAI. Phải verify bằng DOM observation, count và live run trước merge.
