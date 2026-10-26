# 02 — Thiết kế Scenario & Test Case với AI

> Nguồn: `L3_AIQE_ARTD` — Unit 3 (Scenario Generation), Unit 4 (Test Case Refinement)

---

## 1. Kiến thức và keyword cần nắm

### 🔴 Bắt buộc nắm

**Phân biệt các cấp độ artifact kiểm thử:**

| Artifact | Định nghĩa | Ví dụ |
|---|---|---|
| Test condition | Điều cần kiểm tra rút ra từ requirement | "Giảm giá khi customer là VIP và có campaign code" |
| Scenario | Tình huống cụ thể, có đủ context | "VIP customer dùng campaign code hợp lệ → nhận 15% off" |
| Test case | Bộ bước chi tiết có thể chạy được | Precondition + Steps + Expected + Cleanup |
| Checklist item | Câu hỏi nhắc nhở cho exploratory | "Có tính discount trước thuế không?" |

**Các kỹ thuật test design bắt buộc biết:**

- **Equivalence Partitioning (EP)**: chia input thành các nhóm mà đại diện mỗi nhóm cho kết quả tương đương. Ví dụ: quantity từ 1–10 là valid class, quantity < 1 hoặc > 10 là invalid class.
- **Boundary Value Analysis (BVA)**: test tại biên của partition. Quantity 0 (below), 1 (at), 10 (at), 11 (above). Nếu robust BVA: thêm -1 dưới min và +1 trên max.
- **Decision Table**: matrix các tổ hợp input điều kiện → action/output. Dùng khi có nhiều business rule phối hợp (ví dụ: VIP × campaign code → discount).
- **State Transition Testing**: test hành vi theo trạng thái. Ví dụ: Order status PENDING → PAID → REFUNDED; kiểm tra cả invalid transitions.
- **Pairwise/Combinatorial**: giảm số case bằng cách đảm bảo mỗi cặp giá trị xuất hiện ít nhất một lần.

**Anatomy của một test case chất lượng:**

| Field | Yêu cầu |
|---|---|
| ID/Objective | Unique ID và một mục đích testable duy nhất |
| References | Requirement ID, Risk ID, Scenario ID |
| Priority | Có bằng chứng (không chỉ "High" vì cảm giác) |
| Preconditions | Trạng thái, role, services, data cần có trước |
| Test data | Synthetic values, dataset ID, expected validity |
| Steps + Expected | Numbered action + observable result tại mỗi checkpoint |
| Cleanup | Reset state, cleanup record, rerun behavior |
| Automation readiness | Now / Later / Not recommended + rationale |

**Risk-based prioritization — Priority score:**
```
Priority score = Likelihood × Impact × Exposure
```
Thêm hệ số: change complexity, detectability. Quan trọng: **score là để ưu tiên thảo luận**, không phải xác suất chính xác. Cần ghi evidence sau mỗi score.

**Scenario diversity model — các loại cần bao phủ:**
- Happy path (critical business flow)
- Validation / Negative input
- Alternate / Exception flow
- State, sequence, timing, concurrency, recovery
- Role, permission, locale, device, environment
- Security misuse, privacy, accessibility, operational failure

### 🟡 Mở rộng

**Metamorphic relations**: khi expected output khó xác định, test bằng cách so sánh relationship giữa kết quả hai input liên quan. Ví dụ: tăng quantity → tổng tăng.

**Portfolio optimization**: Chọn smoke/regression/exploratory/deferred subsets theo fixed budget. Mọi scenario deferred phải có residual risk statement rõ ràng.

---

## 2. Bản chất, mục đích, khi nào dùng

**AI trong scenario generation**: AI giúp mở rộng coverage candidates từ nhiều nguồn khác nhau (requirement, risk, incident history), nhưng **không thay thế kỹ thuật test design**. AI có thể bỏ sót case không hợp lý, bịa business rule, hoặc tạo duplicate scenario.

**Workflow chuẩn:**
```
Input: Approved requirements + Business rules + Risk register + Incidents
   ↓
Bước 1: Tự generate từ requirement-only
Bước 2: Generate từ requirement + business rules  
Bước 3: Generate từ requirement + risks/incidents
   ↓ So sánh 3 nguồn: ai thêm gì / bỏ gì / trùng gì
Bước 4: Áp dụng kỹ thuật (decision table, state model, BVA)
Bước 5: Score priority (có evidence)
Bước 6: Consolidate duplicates → scenario families
Bước 7: Chọn subset theo budget, document residual risk
```

**Test case quality review** (AI làm critic, human adjudicate):
Review theo các chiều: requirement alignment, correctness, setup/oracle/cleanup completeness, independence, data feasibility, security/privacy, maintainability.

---

## 3. Ví dụ thực tế

**Decision Table — Discount eligibility (BR-DIS-01):**
```
VIP | Campaign Code Valid | Applied Discount | Ghi chú
Yes | Yes                | 15%              | Lấy discount cao nhất
Yes | No                 | 10%              | Chỉ VIP
No  | Yes                | 15%              | Chỉ campaign
No  | No                 | 0%               | Không giảm
Yes | Expired Code       | 10%              | Code không hợp lệ, dùng VIP
```

**State model — Order lifecycle:**
```
PENDING_PAYMENT → PAID → REFUNDED
                ↓           ↓
              FAILED      PARTIALLY_REFUNDED
```
Kiểm tra: PAID → PENDING_PAYMENT (invalid transition), FAILED → REFUNDED (không hợp lệ).

**Cách đặt priority score có evidence:**
```
Duplicate charge scenario:
- Likelihood: 3 (đã xảy ra — RISK-02: 14 customers bị charge twice)
- Impact: 3 (tài chính, compliance)  
- Exposure: 3 (checkout là primary revenue path — RISK-01)
- Score: 27 → ưu tiên 1
```

---

## 4. So sánh khái niệm dễ nhầm và bẫy trắc nghiệm

| Dễ nhầm | Phân biệt |
|---|---|
| Scenario vs Test Case | Scenario: tình huống, đủ context. Test Case: chi tiết executable từng bước. Nhiều test case có thể derive từ một scenario. |
| EP vs BVA | EP: chia class. BVA: test tại biên của class. BVA là specialization của EP, không phải alternative. |
| Priority vs Severity | Severity = mức độ nghiêm trọng của lỗi (impact). Priority = khi nào fix (business decision). Lỗi severity thấp có thể priority cao vì ảnh hưởng UX. |
| Smoke vs Regression | Smoke: kiểm tra nhanh critical flow. Regression: kiểm tra impact sau change. Smoke subset của regression thường. |

**Bẫy trắc nghiệm:**
- Decision table chỉ cần test happy path → SAI. Cần test combinations, bao gồm "impossible" combinations.
- Consolidating duplicate scenarios = có thể bỏ variation → SAI. Consolidate thành family nhưng giữ important data/role/state variations.
- Priority score cao nhất luôn được chọn vào smoke → SAI. Budget có giới hạn; deferred case phải có residual risk statement.
- AI generate 20 scenarios → chọn 20 → SAI. Phải deduplicate, validate technique, review từng case.
