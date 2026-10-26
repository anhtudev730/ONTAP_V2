# 03 — Báo cáo Defect & Phân tích Nguyên nhân với AI

> Nguồn: `L3_AIQE_DALA` — AI-Assisted Defect, API & Log Analysis, Học phần 1–2

---

## 1. Kiến thức và keyword cần nắm

### 🔴 Bắt buộc nắm

**Điều kiện tối thiểu để gọi là defect:**
1. Oracle đã phê duyệt hoặc hành vi kỳ vọng được trích dẫn rõ ràng (requirement/business rule ID).
2. Hành vi quan sát được từ build và môi trường đã xác định.
3. Luồng tái lập HOẶC đủ bằng chứng để điều tra.

**Phân loại kết quả kiểm thử:**
- **Confirmed defect**: có oracle xác nhận, hành vi quan sát rõ, tái lập được
- **Suspected defect**: có dấu hiệu nhưng thiếu oracle hoặc chưa tái lập
- **Requirement question**: chưa có behavior được định nghĩa → hỏi stakeholder
- **Environment issue**: infra/config gây ra, không phải product defect
- **Test data issue**: dữ liệu sai, không phải app sai

**Anatomy của defect report chất lượng:**

| Field | Yêu cầu |
|---|---|
| Title | Ổn định, searchable; nêu symptom + điều kiện, không kết luận root cause |
| Summary | Ngắn, impact-oriented |
| Environment | Build, environment, role, data, preconditions |
| Steps | Numbered actions với data đầu vào cụ thể |
| Expected result | Trích oracle (BR-ID, REQ-ID) — đo được |
| Actual result | Quan sát thực tế — cùng level chi tiết với expected |
| Frequency | Tần suất xảy ra, điều kiện tái lập |
| Evidence | Screen recording, request/response, log, trace ID, correlation ID |
| Severity | Tác động nghiệp vụ có lý do |
| Priority | Input cho business decision (chưa phải bạn tự quyết) |

**Severity dimensions (các chiều đánh giá severity):**
- Customer impact (khách hàng bị ảnh hưởng thế nào)
- Financial impact (thiệt hại tài chính)
- Data integrity (tính toàn vẹn dữ liệu)
- Security/Privacy (rủi ro bảo mật/privacy)
- Compliance (vi phạm quy định)
- Availability (khả năng sẵn sàng của service)
- Recovery (khả năng phục hồi)
- Scope (phạm vi người bị ảnh hưởng)

**Nhóm bằng chứng (Evidence Confidence model):**

| Nhóm | Ý nghĩa |
|---|---|
| FACT-SOURCE | Nêu trực tiếp trong requirement/rule/contract đã phê duyệt |
| FACT-OBSERVED | Quan sát trực tiếp trong lượt kiểm thử có kiểm soát |
| INFERENCE | Diễn giải có lập luận, được hỗ trợ bởi facts |
| HYPOTHESIS | Cách giải thích có thể kiểm thử nhưng chưa xác nhận |
| CONTRADICTED | Không nhất quán với bằng chứng đáng tin cậy |
| UNKNOWN | Chưa được cung cấp hoặc quan sát |

**Confidence labels:**
- Đã xác nhận / Được hỗ trợ mạnh / Có thể / Yếu / Loại trừ đối với lần xảy ra này

**Root Cause Analysis (RCA) — Phân tích nguyên nhân gốc:**
- Phân biệt: trigger (điều kích hoạt) → cơ chế (mechanism) → nguyên nhân gốc → khoảng trống phát hiện (detection gap)
- Frameworks: Five Whys, Fault Tree Analysis, Fishbone, State Machine Analysis
- **Hypothesis matrix**: mỗi hypothesis cần: cơ chế đề xuất + bằng chứng hỗ trợ + bằng chứng mâu thuẫn + bằng chứng còn thiếu + kiểm tra phân biệt tiếp theo

### 🟡 Mở rộng

**Defect lifecycle**: Draft → Review → Triage → Assign → Resolve → Retest → Close (hoặc Reopen)

**Anti-patterns trong defect report:**
- Title mơ hồ: "Login không hoạt động"
- Điều kiện tiên quyết ẩn: không ghi role, data, environment
- Ảnh chụp không có context
- Kết luận root cause trong actual result: "Bug trong payment module"
- Copy log có secret/PII vào report

---

## 2. Bản chất, mục đích, khi nào dùng

**Mục đích của defect report tốt**: Truyền đạt sự khác biệt có thể kiểm chứng giữa expected và observed; giúp dev tái lập và fix, giúp QA verify fix, giúp team track risk.

**Khi dùng AI để review defect:**
- Chỉ sau khi đã viết draft thủ công
- Cung cấp context đã redact (không có PII, credential, production data)
- AI có thể: tìm field thiếu, rewrite title, phát hiện mâu thuẫn trong steps vs actual

**Workflow RCA có AI:**
```
1. Build evidence timeline (chronological, normalized timezone)
2. Phân loại bằng chứng: FACT vs INFERENCE vs HYPOTHESIS
3. Tự tạo ≥ 6 competing hypotheses qua các layers khác nhau
4. AI mở rộng và challenge hypotheses (tìm contradictions, missing evidence)
5. Tạo discriminating tests (test phân biệt, không phải thu thập thêm log chung)
6. Update confidence levels khi có thêm evidence
7. Kết luận TẠM THỜI với giới hạn rõ ràng
```

---

## 3. Ví dụ thực tế

**Case: Duplicate charge (từ DALA case study)**

Quan sát: Customer nhấn "Try again" 1 lần → xuất hiện 2 khoản charge trong provider stub.

**Evidence phân tích:**
```
FACT-OBSERVED: 
- Request 1: POST /orders, Idempotency-Key: idem-b91f → 504 Gateway Timeout
- Request 2: POST /orders, Idempotency-Key: idem-c44a → 201 Created
- Provider stub: 2 CAPTURED events (pe-551 và pe-552)

FACT-SOURCE:
- BR-IDEM-01: Cùng idempotency key + payload không được tạo thêm order/charge

INFERENCE:
- Mobile client tạo key mới cho mỗi lần nhấn "Try again" (chưa xác nhận)

HYPOTHESIS:
- H1: Mobile tạo idempotency key mới mỗi tap → bypass server-side dedup
- H2: Gateway timeout không bao gồm idempotency check
- H3: Server không check duplicate ở layer khác (ngoài idempotency key)

CONTRADICTED:
- "Payment đầu tiên thất bại" → bị bác bởi pe-551 (CAPTURED tại 07:03:22)
```

**Defect title tốt:**
> `[DALA-001] Mobile build 4.8.2-rc3: Hai khoản charge xuất hiện khi retry với idempotency key mới sau gateway timeout (vi phạm BR-IDEM-01)`

---

## 4. So sánh khái niệm dễ nhầm và bẫy trắc nghiệm

| Dễ nhầm | Phân biệt |
|---|---|
| Severity vs Priority | Severity = mức độ nghiêm trọng của impact (technical/business). Priority = thứ tự sửa (business scheduling decision). Không phải người QA quyết định priority mà là product owner. |
| Root cause vs Symptom | Symptom = điều bạn nhìn thấy (2 charges). Root cause = tại sao (mobile tạo idempotency key mới). Không gọi là root cause khi chưa có discriminating test. |
| Hypothesis vs Confirmed cause | Hypothesis = cần kiểm tra thêm. Confirmed = đã tái lập trong điều kiện kiểm soát HOẶC thấy trong code/config. AI thường trả về hypothesis, không phải confirmed cause. |
| Defect vs Enhancement | Defect = hành vi sai so với confirmed requirement. Enhancement = yêu cầu thêm tính năng chưa có. Ranh giới: cần có oracle source. |

**Bẫy trắc nghiệm:**
- Error log xuất hiện = product defect → SAI. Có thể là environment issue hoặc test data issue. Phân loại trước kết luận.
- AI nói "nguyên nhân là X" → ghi vào report ngay → SAI. AI output là HYPOTHESIS, không phải confirmed cause.
- Defect không tái lập được = không cần report → SAI. Vẫn report với "intermittent" và bằng chứng đủ để điều tra.
- "Payment failed" vì UI hiển thị "Payment failed" → SAI. UI có thể hiển thị sai (như case duplicate charge: UI báo failed nhưng thực ra provider đã capture).
