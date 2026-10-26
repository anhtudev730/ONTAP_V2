# 01 — Phân tích Requirement với AI

> Nguồn: `L3_AIQE_ARTD` — AI-Assisted Requirement & Test Design, Unit 1–2

---

## 1. Kiến thức và keyword cần nắm

### 🔴 Bắt buộc nắm

**Testability** (khả năng kiểm thử được) là tiêu chí đánh giá chất lượng requirement. Một requirement testable phải thỏa mãn:
- **Specificity** — cụ thể, không mơ hồ (không dùng "fast", "easy", "secure" mà không có ngưỡng đo).
- **Observability** — kết quả có thể quan sát được qua UI/API/database/log.
- **Controllability** — tester có thể kiểm soát điều kiện đầu vào.
- **Measurability** — có ngưỡng cụ thể (ms, %, số lần...).
- **Consistency** — không mâu thuẫn với các requirement khác.
- **Traceability** — có ID ổn định, truy vết được.

**Anatomy của một requirement testable** (cấu tạo 8 thành phần):

| Thành phần | Ý nghĩa | Ví dụ |
|---|---|---|
| Actor | Ai thực hiện | Customer đã đăng nhập |
| Trigger | Điều kiện kích hoạt | Khi click Submit |
| Precondition | Trạng thái phải có trước | Item còn hàng |
| Action | Hành động cụ thể | Đặt hàng |
| Rule | Quy tắc áp dụng | BR-DIS-01: áp dụng giảm giá cao nhất |
| Expected outcome | Kết quả quan sát được | Đơn hàng tạo với status PAID |
| Exception | Ngoại lệ/trường hợp lỗi | Nếu hết hàng → trả lỗi |
| Threshold | Ngưỡng đo được | Trong 3 giây |

**Loại vấn đề thường gặp trong requirement:**
- **Lexical ambiguity**: từ có nhiều nghĩa ("eligible", "valid")
- **Vague qualifiers**: "nhanh", "dễ", "bảo mật", "phù hợp"
- **Missing scope**: ai là actor, phạm vi nào
- **Combined requirements**: một câu mô tả nhiều requirement khác nhau
- **Unspecified error handling**: không nói xảy ra gì khi thất bại
- **Missing measurable threshold**: không có con số cụ thể

**Traceability** (truy vết): liên kết từ requirement → risk → scenario → test case → execution evidence. Phải có ID ổn định. Chiều truy vết gồm: forward (req → test), backward (test → req), bidirectional, vertical (qua các tầng artifact).

**Coverage status** cho từng link:
- **Full**: tất cả điều kiện được verify trực tiếp
- **Partial**: chỉ một phần behavior được verify
- **Indirect**: evidence đến từ test khác
- **None**: không có verification
- **Blocked/Not testable**: cần làm rõ hoặc thiếu capability

### 🟡 Mở rộng

**Loại requirement:** business need, user story, acceptance criterion, business rule, interface contract, constraint, quality attribute.

**Definition of Ready (DoR)** — bộ tiêu chí để một requirement được coi là sẵn sàng viết test: source/oracle đủ, dependencies biết, environment đã chốt, estimate vừa timebox, reviewer có tên.

---

## 2. Bản chất, mục đích, khi nào dùng

**Mục đích của requirement analysis với AI:**
Phát hiện ambiguity (mơ hồ), inconsistency (mâu thuẫn), incompleteness (thiếu) và weak testability (khó kiểm thử) trước khi viết test, tránh xây test trên nền không vững.

**Khi nào dùng AI để review requirement:**
- Khi nhận được requirement pack mới, trước khi thiết kế test case
- Khi có change request, để phân tích impact

**Workflow chuẩn (Human-led, AI-assisted):**
```
1. Tự phân tích requirement → đánh dấu điều thiếu/mơ hồ
2. Cung cấp context có giới hạn cho AI (requirement IDs, rules)
3. AI đề xuất issues (phân loại: evidence-backed / inferred risk / question)
4. Human review từng đề xuất: Accept / Edit / Reject / Escalate
5. Rewrite acceptance criteria thành dạng testable
6. Ghi lại provenance: prompt, model, reviewer, date
```

**Input → Xử lý → Output:**
- Input: requirement pack (user stories, business rules, API contracts, NFRs)
- Xử lý: phân tách thành actor/trigger/rule/oracle/exception; so sánh chéo
- Output: Requirement Quality Report (ambiguity register, testable rewrites, assumption log)

---

## 3. Ví dụ thực tế cho fresher AI QE

**Requirement gốc (yếu):**
> REQ-PAY-01: Hệ thống xử lý thanh toán card và wallet nhanh chóng và bảo mật, không tạo charge trùng.

**Vấn đề phát hiện:**
- "nhanh chóng" — thiếu threshold (bao nhiêu giây?)
- "bảo mật" — chưa định nghĩa tiêu chuẩn nào
- "không tạo charge trùng" — thiếu điều kiện kích hoạt (idempotency key?)

**Rewrite testable:**
> REQ-PAY-01 (revised): Khi customer gửi POST /orders với cùng idempotency key và cùng payload hai lần, hệ thống chỉ tạo một đơn hàng và một khoản charge. Checkout phải hoàn thành trong 3 giây ở P95 trong peak traffic.

**Prompt AI mẫu (bounded):**
```
Role: Test design assistant.
Task: Review requirement REQ-PAY-01 và BR-IDEM-01.
Approved sources: [dán excerpt đã xác nhận].
Constraints:
- Chỉ dùng sources đã cung cấp.
- Ghi "Not specified" khi thiếu thông tin.
- Phân tách: fact / assumption / question / suggestion.
Output: issue | source excerpt | impact | clarification question | stakeholder
```

---

## 4. So sánh khái niệm dễ nhầm và bẫy trắc nghiệm

| Dễ nhầm | Phân biệt |
|---|---|
| Full coverage vs Partial coverage | Full = tất cả điều kiện stated được verify. Partial = chỉ một phần. Sai lầm phổ biến: link TC → REQ chỉ vì cùng keyword → thực ra là partial hoặc false. |
| Inference vs Fact | Fact = trích dẫn trực tiếp từ source. Inference = suy luận có logic nhưng chưa được stakeholder xác nhận. AI output thường là inference, không phải fact. |
| Defect vs Question | Defect = hành vi quan sát khác expected đã xác nhận. Question = chưa có source để xác định expected. Không được kết luận defect khi chưa có oracle. |
| Testability vs Observability | Testability là tổng hợp nhiều tiêu chí. Observability chỉ là một trong đó. |

**Bẫy trắc nghiệm:**
- 100% requirements linked = adequate testing → SAI. Link nhiều không bằng evidence behavior.
- Để AI tự rewrite requirement rồi dùng luôn → SAI. Mọi AI suggestion phải qua human review.
- "Fast" không cần clarify nếu tester hiểu → SAI. "Fast" không measurable = không testable.
- Conflict giữa API spec và process note → tự chọn một → SAI. Phải flag và escalate cho stakeholder.
