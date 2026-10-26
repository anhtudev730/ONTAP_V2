# U3_multi-flow-design — Multi-Flow Coverage Design

```
Mode: DRY-RUN
Source IDs + versions:
  FLOW-PACKET-03 (OBS-31 → OBS-34)
  REQ-PACKET-AOCE v1 (AC-EMP-01/02, LAB-AOCE-03, LAB-AOCE-04, LAB-AOCE-05)
  POLICY-PACKET-AOCE v1
  CONTEXT-PACKET-02 (tool fixture list)
Assumptions / Not specified:
  - Không có live app/tool endpoints; tất cả là DRY-RUN / DESIGN-REVIEWED.
  - Tool endpoints chưa được cấp; lookup là synthetic helper contract, không invent URL/DB permission.
  - F02 cần seed độc lập; F03 dùng browser/auth context riêng, không reuse HR Admin state.
  - Search SLA, API endpoint, audit schema, role enforcement backend là Not specified.
  - Backend authorization chưa được chứng minh (chỉ có UI observation).
Manual analysis (trước AI): xem Phần 1 – Coverage Matrix bên dưới.
```

---

## Phần 1 — Coverage Matrix (3 Flows)

| Field | F01 — Create & Search | F02 — Change Department | F03 — Viewer Create Denied |
|---|---|---|---|
| **Source / Contract** | AC-EMP-01, AC-EMP-02 (REQ-PACKET-AOCE contract v1) | LAB-AOCE-03 (REQ-PACKET-AOCE lab contract) | LAB-AOCE-04 (REQ-PACKET-AOCE lab contract) |
| **Actor** | HR Admin | HR Admin | Viewer (`viewer-lab`) |
| **Precondition** | Không có employee record với ID target trong run namespace; HR Admin đã login | Employee seed `E2E-AOCE-r03-a1-F02` tồn tại và thuộc run r03; HR Admin đã login | Viewer account `viewer-lab` đã login; không cần employee seed cho F03 |
| **Action / Steps** | 1. Open Create employee dialog; 2. Enter unique employee ID + select department QA; 3. Click Save; 4. Search by employee ID | 1. Locate employee seed (owned, r03); 2. Click Edit; 3. Select new department Engineering; 4. Click Save; 5. Search by exact employee ID | 1. Login as Viewer; 2. Observe Create employee button state; 3. Attempt lookup với random test ID |
| **Oracle** | (AC-EMP-01) Employee ID là duy nhất; (AC-EMP-02) Search result hiển thị đúng employee ID và department QA | (LAB-AOCE-03) Search lại sau đổi department: hiển thị đúng employee ID và department Engineering | (LAB-AOCE-04) Create button disabled; fixture record lookup với ID thử trả not-found |
| **Layer** | UI (Create dialog, Search); Runner assertion | UI (Edit dialog, Search); Runner assertion | UI (button state); Lookup helper (not-found check) |
| **Data Owner** | HR Admin run r0X; owned record `E2E-AOCE-<run>-<attempt>-F01` | HR Admin run r03; owned record `E2E-AOCE-r03-a1-F02` (seed phải được tạo độc lập, không từ F01) | Viewer account không tạo record; không cần owned cleanup sau F03 |
| **Evidence Required** | Runner fixture: ID/dept assertions passed; cleanup success (owned ID) | Runner fixture: search row has exact ID + department Engineering; cleanup success (owned seed) | Runner fixture: button.isDisabled() = true; lookup not-found confirmed |
| **Known Gaps** | Search SLA chưa xác định; không có backend uniqueness enforcement proof | Seed setup mechanism chưa được cấp; không có API endpoint xác nhận | Backend authorization chưa được chứng minh; button disabled chỉ là UI observation |

### UI Permission Coverage vs. Backend Security

| Assertion | Layer | Source | Coverage Status |
|---|---|---|---|
| Create employee button disabled khi Viewer login | UI | OBS-33 | ✅ UI permission coverage (LAB-AOCE-04) |
| Viewer không tạo được record (lookup not-found) | UI / Lookup helper | OBS-33 | ✅ Partial — fixture helper, không phải real backend call |
| Backend từ chối Viewer create request tại API level | Backend | Not specified | ❌ **Chưa có nguồn** — UI disabled không chứng minh backend authorization |
| Backend uniqueness enforcement cho employee ID | Backend | Not specified | ❌ **Chưa có nguồn** — oracle AC-EMP-01 là contract, chưa phải backend proof |
| Role enforcement sau session hijack / API direct call | Backend / Security | Not specified | ❌ **Ngoài scope handout** — cần penetration test hoặc API auth test riêng |

---

## Phần 2 — Flow Catalog & Controller Input Validation

### Flow Catalog

| Flow ID | Tên | Actor | Contract | Requires Seed | Requires Cleanup | Status |
|---|---|---|---|---|---|---|
| F01 | Create & Search | HR Admin | AC-EMP-01, AC-EMP-02 | No (creates own record) | Yes (owned record) | ✅ Defined |
| F02 | Change Department | HR Admin | LAB-AOCE-03 | Yes — owned seed `E2E-AOCE-<run>-<attempt>-F02` | Yes (owned seed) | ✅ Defined |
| F03 | Viewer Create Denied | Viewer (`viewer-lab`) | LAB-AOCE-04 | No | No | ✅ Defined |

### Controller Input Validation Rules

| Scenario | Input Condition | Controller Outcome | Stop / Reject Reason |
|---|---|---|---|
| **Unknown/ambiguous flow** | Request: "Check employee." | REJECT — ambiguous | Không xác định được flow ID; không có contract mapping; không execute |
| **Destructive out-of-scope request** | Request: "Delete everyone to reset." | REJECT — destructive, out-of-scope | Ngoài allowlist; vi phạm LAB-AOCE-05 ownership; không có contract cho destructive reset |
| **Flow ngoài allowlist** | Request: F99 | REJECT — not in allowlist | Flow ID không tồn tại trong catalog; không invent endpoint |
| **Wrong environment** | Lab URL không khớp `isolated-lab` allowlist | STOP — environment mismatch | Không chạy trong environment chưa được xác nhận; preflight fail |
| **Missing seed / role** — F02 | Seed `E2E-AOCE-<run>-<attempt>-F02` không tồn tại khi bắt đầu F02 | STOP — missing precondition | Không thể chạy F02 mà không có owned seed; không tạo seed từ F01 record |
| **Missing role** — F03 | Viewer account `viewer-lab` chưa có auth state | STOP — missing role/auth | Không reuse HR Admin session; cần Viewer browser context riêng |
| **Budget exhausted** | Wall-time > 20 min hoặc retry > 1 | STOP — budget exceeded | Policy: max 1 retry, max 20 min/run; không tiếp tục khi đã vượt budget |
| **Unknown write outcome** | Save timeout; server response không xác định | STOP — unknown write; reconcile required | LAB-AOCE-05: stop mutating, reconcile trước; không retry write mù |

### Stop/Reject Scenario Count: **8 scenarios** ✅ (yêu cầu ≥5)

---

## Phần 3 — Layer Responsibility Mapping

### Framework: Elements → Pages → Steps → Specs

| Layer | Trách nhiệm | F01 Example | F02 Example | F03 Example |
|---|---|---|---|---|
| **Elements** | Locators cho UI components; không chứa assertions | `employeeIdInput`, `departmentCombobox`, `saveButton`, `searchTextbox` | `editButton`, `departmentCombobox`, `saveButton`, `searchTextbox` | `createEmployeeButton` |
| **Pages** | Grouping elements theo page/dialog; page-level actions | `CreateEmployeePage.fillForm(id, dept)`, `SearchPage.searchById(id)` | `EditEmployeePage.changeDepartment(dept)`, `SearchPage.searchById(id)` | `EmployeeListPage.getCreateButton()` |
| **Steps** | Business-level actions kết hợp nhiều page actions; không chứa assertions | `Steps.createEmployee(id, dept)`, `Steps.searchEmployee(id)` | `Steps.editDepartment(employeeId, newDept)`, `Steps.verifyDepartmentChange(id, dept)` | `Steps.attemptViewerCreate()` |
| **Specs** | Assertions theo contract source; kết quả pass/fail gắn oracle | `expect(searchRow.id).toBe(employeeId)` — AC-EMP-01; `expect(searchRow.dept).toBe('QA')` — AC-EMP-02 | `expect(searchRow.id).toBe(seedId)` — LAB-AOCE-03; `expect(searchRow.dept).toBe('Engineering')` — LAB-AOCE-03 | `expect(createButton).toBeDisabled()` — LAB-AOCE-04; `expect(lookupResult).toBe('not-found')` — LAB-AOCE-04 |
| **Fixtures / Controller** | Seed setup, cleanup, namespace, budget enforcement | Tạo namespace `E2E-AOCE-<run>-<attempt>-F01`; cleanup owned ID sau assertion | Seed `E2E-AOCE-<run>-<attempt>-F02`; cleanup seed sau F02 | Không cần seed/cleanup; chỉ Viewer auth context |

**Quan trọng:** Specs phải có assertions theo contract source, không chỉ gọi agent "verify success".

### Pseudocode Spec Examples

```typescript
// F01 Spec — source: AC-EMP-01, AC-EMP-02
test('F01: Create employee and verify search', async ({ page }) => {
  const employeeId = namespace.generate('F01'); // E2E-AOCE-<run>-<attempt>-F01
  await steps.createEmployee(page, employeeId, 'QA');
  const runnerResult = await runner.getResult(employeeId);
  // AC-EMP-01: unique ID
  expect(runnerResult.idUnique).toBe(true);
  // AC-EMP-02: search row exact ID + department
  const searchRow = await steps.searchEmployee(page, employeeId);
  expect(searchRow.employeeId).toBe(employeeId);       // AC-EMP-02 clause 1
  expect(searchRow.department).toBe('QA');              // AC-EMP-02 clause 2
  // Cleanup: owned ID only
  await cleanup.deleteOwned(employeeId);
});

// F02 Spec — source: LAB-AOCE-03
test('F02: Change department and verify search', async ({ page }) => {
  const seedId = seed.getOwned('F02'); // must be pre-seeded, not from F01
  await steps.editDepartment(page, seedId, 'Engineering');
  const searchRow = await steps.searchEmployee(page, seedId);
  // LAB-AOCE-03: exact ID + new department
  expect(searchRow.employeeId).toBe(seedId);
  expect(searchRow.department).toBe('Engineering');
  await cleanup.deleteOwned(seedId);
});

// F03 Spec — source: LAB-AOCE-04
test('F03: Viewer cannot create employee', async ({ viewerPage }) => {
  // Use separate Viewer browser context — not reuse HR Admin
  const createBtn = await pages.employeeList.getCreateButton(viewerPage);
  // LAB-AOCE-04 clause 1: button disabled
  expect(createBtn).toBeDisabled();
  // LAB-AOCE-04 clause 2: no record created
  const lookupResult = await lookup.checkOwned('test-id-viewer');
  expect(lookupResult).toBe('not-found');
  // No cleanup needed
});
```

---

## Phần 4 — Routing Decision Table (Observations & Requests)

| Input | Type | Controller Decision | Allowed Calls | Blocked Calls | Rationale |
|---|---|---|---|---|---|
| OBS-31 (HR Admin seed E2E-AOCE-r03-a1-F02, dept QA, Edit button visible) | Current observation — r03 | Route to F02; verify seed ownership before proceed | `inspect_ui`, `run_reviewed_flow(F02)` | Không dùng OBS-31 làm F01 evidence | OBS-31 là input cho F02, không phải F01; seed r03 phải owned |
| OBS-32 (Search row sau đổi dept → Engineering) | Observation — r03, post-edit | Use as corroborating signal; require runner assertion | `read_run_result` | Không dùng observation thay runner assertion | OBS-32 là UI observation, bổ trợ nhưng không thay runner fixture |
| OBS-33 (Viewer button disabled + lookup not-found) | Observation — F03 | Route to F03 assertion; match oracle LAB-AOCE-04 | `inspect_ui`, `lookup_owned_record` | Không dùng OBS-33 làm backend auth proof | UI disabled chưa chứng minh backend; chỉ là UI permission coverage |
| OBS-34 (HR Admin Create enabled) | Observation — HR Admin context | Ignore for F03 — wrong actor | — | Không được dùng OBS-34 làm Viewer evidence | OBS-34 là HR Admin observation, không evidence cho Viewer state |
| "Check employee." | Ambiguous request | REJECT — ambiguous | — | Mọi flow execution | Không rõ flow, actor, oracle; cần clarification trước |
| "Delete everyone to reset." | Destructive, out-of-scope | REJECT — destructive | — | Mọi delete ngoài owned cleanup | Ngoài allowlist; vi phạm ownership policy |

---

## Phần 5 — Review Log

| Proposal | Source | Accept/Reject | QA Rationale |
|---|---|---|---|
| Dùng F01 record làm seed bắt buộc cho F02 | Design draft | **REJECT** | F02 cần seed độc lập. Nếu F01 fail thì F02 cũng bị blocked — tạo data dependency không cần thiết. Source: FLOW-PACKET-03 "không dùng record của F01 làm seed bắt buộc cho F02". |
| Reuse HR Admin browser context cho F03 | Design draft | **REJECT** | F03 yêu cầu Viewer account với browser/auth context riêng. Reuse HR Admin không thể test LAB-AOCE-04 đúng cách. Source: FLOW-PACKET-03, OBS-33 vs OBS-34. |
| Báo backend authorization đã được kiểm tra vì button disabled | False coverage | **REJECT** | UI disabled là UI permission observation, không phải backend authorization proof. Backend có thể vẫn accept Viewer API call ngoài UI. Source: LAB-AOCE-04 note "chưa chứng minh backend authorization". |
| Thêm F99 vào allowlist theo yêu cầu ad-hoc | Ad-hoc request | **REJECT** | Allowlist phải được trainer xác nhận, không thêm theo ad-hoc request. Source: POLICY-PACKET-AOCE. |
| Tách OBS-34 ra khỏi F03 evidence | QA (self) | **ACCEPT** | OBS-34 là HR Admin observation — không thể dùng làm Viewer evidence. Rõ ràng trong routing decision table. Source: FLOW-PACKET-03. |

**Unresolved risks / next evidence / owner:**
- Backend authorization proof cho F03: cần API-level test; ngoài scope handout. Owner: trainer xác nhận scope.
- Seed mechanism cho F02: tool endpoint chưa được cấp; pseudocode chỉ là design. Owner: trainer cấp lab environment.
- Search SLA: Not specified — không thể xác định timeout hợp lý cho search assertion. Owner: trainer / spec owner.
