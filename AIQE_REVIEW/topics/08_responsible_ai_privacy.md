# 08 — Responsible AI & Privacy trong QE

> Nguồn: Tổng hợp từ tất cả modules (ARTD §5, DALA §7, PMLM §4.2, AAALE §2, AOCE §context)

---

## 1. Kiến thức và keyword cần nắm

### 🔴 Bắt buộc nắm

**Responsible AI Working Agreement (áp dụng trong mọi module):**
1. Không gửi production data, credentials, secrets, personal data, hoặc proprietary source material tới AI service chưa được phê duyệt.
2. Treat AI output là draft/hypothesis, KHÔNG phải evidence rằng requirement đúng hoặc test đã pass.
3. Yêu cầu AI cite requirement IDs hoặc source excerpts cho mọi recommendation.
4. Tách facts, assumptions, questions, và suggestions trong generated output.
5. Ghi lại: model/tool, prompt version, source set, reviewer và review result khi output trở thành artifact chính thức.
6. Deterministic rules/checks để validate calculations, constraints, và generated datasets.
7. Một người cụ thể chịu trách nhiệm approve, prioritize và release decisions.

**AI output không phải:**
- Bằng chứng rằng requirement đúng
- Bằng chứng rằng test đã pass
- Proof của root cause
- Business rule đã xác nhận
- Locator đã verify

**Sensitive data classification cho test data:**

| Loại | Ví dụ | Cách xử lý |
|---|---|---|
| Direct identifier | Tên, email, phone, card number | Synthetic only; dùng reserved domains (example.com) |
| Quasi-identifier | Postal code, birth month | Minimize; assess linkage risk |
| Credential/Payment secret | Card PAN, CVV, access token | KHÔNG bao giờ include; dùng provider test token |
| Business identifier | Order ID, customer ID | Synthetic UUID; giữ referential integrity |

**Masking approaches:**
- **Substitution**: thay bằng value cùng format (name → fake name)
- **Shuffling**: hoán vị giá trị trong cột
- **Redaction**: xóa/che giá trị
- **Tokenization**: thay bằng token (có thể reverse nếu cần)
- **Full synthetic**: tạo mới hoàn toàn (không reversible) — dùng khi không chấp nhận linkage risk

**Nguồn gốc và truy vết (Provenance):**
```
Khi AI output trở thành artifact: ghi lại
  - Tool/model sử dụng
  - Prompt version và date
  - Source set đã dùng
  - Reviewer và decision
  - Sanitized summary nếu không lưu raw prompt
```

**Exploratory testing — Không làm gì:**
- Không biến observation chưa xác nhận thành confirmed defect
- Charter khác script test case: charter cho phép adaptation, không là scripted steps
- Checklist không phải completeness guarantee

**Test data operations (ARTD Unit 6):**
- Mỗi record phải có test purpose rõ
- Expected-valid rows satisfy ALL known constraints
- Expected-invalid rows vi phạm ONLY intended rule
- Referential integrity và state consistency phải preserved
- Generation phải reproducible (documented seed, generator version, reference clock)

### 🟡 Mở rộng

**Re-identification risks trong test data:**
- **Linkage attack**: kết hợp quasi-identifiers để identify individual (postal code + birth month + gender)
- **Memorization**: AI model có thể "nhớ" training data và lặp lại trong output
- **Small population risk**: dataset nhỏ làm individual dễ identify

**Privacy validation checklist:**
- Scan for known PII patterns (email format, phone format, card number)
- Check for exact-match leakage (production values appearing in synthetic data)
- Verify rare combinations không identify individual
- Confirm no retained secrets (tokens, passwords)

---

## 2. Bản chất, mục đích, khi nào dùng

**Mục đích của Responsible AI practices:**
- Ngăn AI fabricate business rules làm test artifacts bị sai
- Bảo vệ privacy khi làm việc với data trong CI/testing
- Đảm bảo human accountability (không để AI tự approve, tự release)
- Tạo audit trail có thể kiểm chứng

**Khi nào cần human approval (không để AI tự quyết):**
- Approve/prioritize/release decisions
- Confirm root cause từ hypothesis
- Sign-off bug severity và priority
- Merge AI-generated test code
- Publish test results/CI status
- Xử lý sensitive data

**Exploratory charter structure:**
```
Explore [target area]
With [resources, heuristics, or approach]
To discover [risk, question, or information goal]
Timebox: [duration]
Scope/Out of scope: [boundaries]
Stop when: [stopping condition]
```

---

## 3. Ví dụ thực tế

**Redaction trước khi gửi AI:**
```
TRƯỚC (có PII):
"Customer John Doe (john.doe@example.com) charged VND 240,000"

SAU (redacted):
"Customer [SYNTHETIC-ID] charged VND 240,000"
```

**Prompt có provenance:**
```text
[PROMPT-ID: req-review-2026-10-26-v1]
[Model: Approved enterprise AI]
[Source set: REQ-ORD-01, BR-INV-01, BR-DIS-01]
[Redaction: customer emails replaced with SYNTHETIC-ID]
Task: Review requirements for testability gaps.
Constraint: Ghi "Not specified" khi thiếu source...
```

**Test data với privacy controls:**
```csv
customer_id,email,vip,active
c8ec6e49-a8c2-...,test-user-001@example.com,true,true  ← OK: example.com reserved domain
```
```csv
# KHÔNG được:
customer_id,email
real-uuid,real.user@gmail.com  ← PII, routable address
```

**Charter mẫu (ARTD Unit 5):**
```
Explore: Payment timeout and duplicate prevention flow
With: Idempotency key heuristic, BR-IDEM-01, BR-PAY-01, payment provider stub
To discover: Conditions where duplicate charge could occur despite retry protection
Timebox: 45 minutes
Scope: Only staging environment with synthetic accounts
Out of scope: Real payment accounts, production environment
Stop when: Found 3 distinct scenarios or time expires
```

---

## 4. So sánh khái niệm dễ nhầm và bẫy trắc nghiệm

| Dễ nhầm | Phân biệt |
|---|---|
| AI suggestion vs Confirmed fact | AI suggestion = needs human review. Confirmed fact = trích từ approved source. Không thể dùng AI output làm oracle mà không verify. |
| Masking vs Anonymization | Masking = biến đổi data (có thể reversible). Anonymization = không thể reverse về original. Trong test: cần full synthetic hoặc anonymized data khi risk cao. |
| Exploratory charter vs Test script | Charter: target + approach + risk/learning goal. Script: numbered steps với expected results. Charter cho phép tester adapt; script yêu cầu follow exactly. |
| Privacy scan vs Data classification | Classification: phân loại sensitivity TRƯỚC khi generate. Privacy scan: kiểm tra SAU khi generate xem có PII/secret leak không. Cả hai đều cần. |
| Human accountability vs AI assistance | AI assists (draft, suggest, review). Human remains accountable (approve, decide, sign-off). Không thể delegate accountability cho AI. |

**Bẫy trắc nghiệm:**
- AI review tìm không có issue = data safe → SAI. AI có thể không detect một số PII patterns. Cần deterministic scan.
- "Dùng data production nhưng redact tên" = safe for AI → SAI. Quasi-identifiers (postal + birth month + gender) vẫn có thể re-identify. Dùng full synthetic.
- Checklist 50 items đảm bảo coverage đầy đủ → SAI. Checklist dài tạo noise và false confidence. Cần tailored, concise, actionable.
- AI generate locator → đã test = evidence đủ → SAI. AI không có live browser state; locator cần verify bằng DOM observation và live run.
- Lưu raw trace có credentials vào AI prompt → thông tin đã redact → SAI. Không gửi raw trace có session token/cookie/auth header. Phải pre-process.
