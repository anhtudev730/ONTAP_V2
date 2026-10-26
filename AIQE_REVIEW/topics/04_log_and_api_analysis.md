# 04 — Log Analysis & API Testing với AI

> Nguồn: `L3_AIQE_DALA` — Học phần 3 (Log), Học phần 4–5 (API Testing)

---

## 1. Kiến thức và keyword cần nắm

### 🔴 Bắt buộc nắm

**Cấu tạo một log entry đầy đủ:**
```
timestamp | severity | service | environment | instance | event_name |
request_id | correlation_id | entity_id | duration | status | message
```

**Correlation ID**: UUID được truyền qua tất cả services trong một request flow. Dùng để nối log từ gateway → order-svc → payment-adpt → notification-svc. Quan trọng: một order có thể có nhiều correlation IDs nếu có retry với key mới.

**Chuẩn hóa timestamp**: Tất cả timestamp phải convert về UTC ISO 8601 với millisecond precision. Ví dụ: `14:03:18.420 +07:00` → `07:03:18.420Z`. Clock skew có thể làm timestamp log "đi ngược" mà không sai.

**Phân tích correlation — chiến lược pivot:**
Khi thiếu một field:
```
correlation_id → provider_request_id → payment_id → order_id → customer_ref (synthetic)
```

**Bất thường trong log cần phát hiện:**
- Retry burst (nhiều lần retry dồn dập)
- Missing state transition (thiếu event kỳ vọng — ví dụ: không có inventory release)
- Invalid state sequence (trình tự không hợp lệ)
- Orphan events (event không nối được với transaction)
- Sensitive data leak (PII, token, card number)

**API Testing — các thành phần kiểm thử:**

| Layer | Kiểm tra gì |
|---|---|
| Transport | Status code, headers, media type, encoding |
| Schema | Trường bắt buộc, kiểu dữ liệu, enum, nullable, unknown fields |
| Semantic | Business rules, authorization, state, calculations, timestamps |
| Side effects | DB state, downstream calls, inventory reserved/released, audit log |
| Security | Auth failure codes, error message safety (no stack trace), correlation ID |

**HTTP status codes quan trọng trong DALA:**
- `201 Created` — resource đã tạo thành công
- `202 Accepted` — request accepted, processing async
- `400 Bad Request` — input validation fail
- `401 Unauthorized` — thiếu hoặc invalid auth
- `403 Forbidden` — có auth nhưng không có quyền
- `404 Not Found` — resource không tồn tại
- `500 Internal Server Error` — lỗi server, message phải chung chung (không có stack trace)
- `504 Gateway Timeout` — timeout upstream

**Idempotency trong API:**
- Cùng idempotency key + cùng payload → không tạo thêm order/charge
- Cùng idempotency key + khác payload → behavior CHƯA QUY ĐỊNH (phải flag là question, không tự bịa)

**Arrange–Act–Assert–Cleanup (AAAC) cho API test:**
```
Arrange: Setup dữ liệu synthetic, tạo request
Act: Gửi request với đúng auth/headers
Assert: Verify status + headers + schema + semantic + side effects
Cleanup: Xóa record đã tạo, reset state
```

### 🟡 Mở rộng

**Nhóm scenario kiểm thử API** (HP5 — AI-Assisted API Scenario):
- Positive: happy path, create/retrieve thành công
- Negative: invalid input, missing auth, forbidden resource
- Boundary: min/max values, empty vs null, encoding edge cases
- Authorization: same user vs cross-user, role-based
- State: invalid state transitions, retry/idempotency
- Fault/Recovery: timeout, provider down, concurrency

**Error contract an toàn:**
```json
{
  "code": "STABLE_CODE",     // ổn định, machine-readable
  "message": "Safe message", // chung chung, không lộ internals
  "correlationId": "uuid"    // để trace
}
// KHÔNG bao gồm: stack trace, SQL error, internal paths, secrets
```

---

## 2. Bản chất, mục đích, khi nào dùng

**Log analysis**: Xây timeline bằng chứng qua multiple services. Không kết luận root cause từ log đơn lẻ — cần correlation với nhiều sources.

**API testing từ contract**: Test phải bắt đầu từ API contract (OpenAPI spec, requirement), không phải guess behavior. Khi contract không quy định behavior → ghi là "question" không phải "expected result".

**Workflow log analysis:**
```
1. Đánh giá nguồn log (sampling? truncation? retention?)
2. Parse fields → normalize timestamp về UTC
3. Dựng correlation map (correlation ID, entity IDs)
4. Xây timeline chronological
5. Phát hiện missing events và anomalies
6. AI hỗ trợ clustering và pattern suggestion
7. Verify bằng deterministic query/script (không chỉ AI output)
8. Kiểm tra PII/secret leakage trước khi share
```

---

## 3. Ví dụ thực tế

**Log analysis — DALA duplicate charge case:**
```
Timeline UTC:
07:03:18.501Z gateway    corr=corr-7a01  POST /orders start
07:03:18.540Z order-svc  corr=corr-7a01  order=ORD-90017 idem=idem-b91f state=PAYMENT_PENDING
07:03:18.604Z payment-adpt corr=corr-7a01 payment=PAY-701 attempt=1 sent
07:03:21.605Z payment-adpt corr=corr-7a01 payment=PAY-701 timeout_ms=3000
07:03:21.612Z gateway    corr=corr-7a01  status=504 duration_ms=3111
07:03:22.430Z payment-adpt corr=corr-7a01 payment=PAY-701 status=CAPTURED  ← ĐÃ CAPTURE TRƯỚC RETRY
07:03:23.020Z gateway    corr=corr-7a02  POST /orders start (RETRY)
...
07:03:23.480Z payment-adpt corr=corr-7a02 payment=PAY-702 status=CAPTURED  ← CAPTURE LẦN 2
```

**Phát hiện**: Retry dùng idempotency key khác (`idem-c44a` vs `idem-b91f`). First payment đã CAPTURED trước khi retry gửi. Vi phạm BR-IDEM-01.

**API test cho idempotency:**
```
Test-IDEM-01: POST /orders với idem-b91f + payload-A → 201, orderId=X
Test-IDEM-02: POST /orders với idem-b91f + payload-A (same) → 201, orderId=X (same, no new charge)
Test-IDEM-03: POST /orders với idem-b91f + payload-B (different) → ??? [QUESTION - not specified]
```

**API test negative — Authorization:**
```
Test-AUTH-01: GET /orders/{orderId-của-khách-khác} với token của customer A → 403 hoặc 404?
[Theo DALA: behavior cố ý không quy định là 403 vs 404 → phải test và ghi question về expected]
```

---

## 4. So sánh khái niệm dễ nhầm và bẫy trắc nghiệm

| Dễ nhầm | Phân biệt |
|---|---|
| Correlation ID vs Request ID | Correlation ID đi xuyên suốt tất cả services cho một business transaction. Request ID là unique cho từng HTTP request riêng. Một transaction có thể có nhiều request IDs nhưng một correlation ID. |
| 401 vs 403 | 401: Chưa xác thực (thiếu/invalid token). 403: Đã xác thực nhưng không có quyền. Không được nhầm hoặc để server return sai (vì ảnh hưởng security). |
| Schema validation vs Semantic validation | Schema: đúng kiểu dữ liệu, trường, format. Semantic: đúng business logic (discount đúng rule, authorization đúng role). Cả hai đều cần test. |
| Side effect vs Response | Response là điều API trả về. Side effect là điều xảy ra trong hệ thống (inventory reserved, audit logged, notification sent). Test API tốt phải check cả hai. |
| Timeout vs Failed | Timeout là kết quả KHÔNG XÁC ĐỊNH. Request có thể đã được xử lý thành công phía server nhưng client chưa nhận response. Không báo "payment failed" khi chỉ có timeout. |

**Bẫy trắc nghiệm:**
- HTTP 200 = test pass → SAI. Cần verify schema, semantic và side effects. App có thể trả 200 với error message trong body.
- Chỉ test status code → đủ API test → SAI. Cần test headers, schema, semantic business rules, side effects.
- Log ERROR = product defect → SAI. ERROR log có thể là expected failure (provider timeout với retry đúng behavior).
- Timestamp log theo thứ tự = thứ tự nhân quả → SAI. Clock skew có thể làm log của service B xuất hiện trước service A dù A gọi B.
- Không tìm thấy event trong log = event không xảy ra → SAI. Log có thể bị truncate, sampling, hoặc service không emit log đó.
