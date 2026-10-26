# AIQE Review — Ôn thi Fresher AI Quality Engineer

Thư mục này được tổng hợp từ tài liệu khóa học trong `d:\ONTAP_V2\document\document\`.
Đọc file gốc để tra cứu chi tiết; không sửa tài liệu nguồn.

---

## Thứ tự ôn đề xuất

Học theo thứ tự sau để xây nền trước mở rộng:

```
Tuần 1 — Nền tảng QE với AI
  1. 01_requirement_analysis.md       ← Bắt đầu ở đây
  2. 02_test_scenario_design.md
  3. 08_responsible_ai_privacy.md     ← Đọc sớm, áp dụng xuyên suốt

Tuần 2 — Phân tích & API
  4. 03_defect_reporting.md
  5. 04_log_and_api_analysis.md

Tuần 3 — Playwright & Agent
  6. 05_playwright_locator_mcp.md
  7. 06_ai_agent_architecture.md
  8. 07_agent_optimization_ci.md

Tuần 4 — Tổng hợp project
  9. 09_project_agent_development.md
```

---

## Mục lục chi tiết

| # | File | Module nguồn | Nội dung chính |
|---|---|---|---|
| 1 | [01_requirement_analysis.md](topics/01_requirement_analysis.md) | ARTD U1–2 | Testability, anatomy requirement, traceability, coverage status |
| 2 | [02_test_scenario_design.md](topics/02_test_scenario_design.md) | ARTD U3–4 | EP/BVA/Decision Table/State, test case anatomy, priority scoring |
| 3 | [03_defect_reporting.md](topics/03_defect_reporting.md) | DALA U1–2 | Defect anatomy, severity, evidence labels, RCA hypothesis matrix |
| 4 | [04_log_and_api_analysis.md](topics/04_log_and_api_analysis.md) | DALA U3–5 | Log correlation, timestamp, API AAAC, status codes, idempotency |
| 5 | [05_playwright_locator_mcp.md](topics/05_playwright_locator_mcp.md) | PMLM U1–7 | Locator API, actionability, web-first assertions, MCP, anti-patterns |
| 6 | [06_ai_agent_architecture.md](topics/06_ai_agent_architecture.md) | AAALE U1–4 | Planner/Controller/Runner, run state machine, tool manifest, guardrails |
| 7 | [07_agent_optimization_ci.md](topics/07_agent_optimization_ci.md) | AOCE U1–7 | Cost model, context optimization, CI lanes, metrics, flaky recovery |
| 8 | [08_responsible_ai_privacy.md](topics/08_responsible_ai_privacy.md) | Tất cả modules | Working agreement, data classification, masking, provenance, charters |
| 9 | [09_project_agent_development.md](topics/09_project_agent_development.md) | PBAAD U1–6 | Backlog, DoR/DoD, evidence labels, sprint workflow, demo checklist |

---

## Tra cứu nhanh khái niệm cốt lõi

| Khái niệm | File ôn |
|---|---|
| Testability, ambiguity | 01 |
| EP, BVA, Decision Table | 02 |
| Defect vs Question vs Enhancement | 03 |
| Severity vs Priority | 03 |
| Correlation ID, timestamp UTC | 04 |
| 401 vs 403, side effects | 04 |
| getByRole, getByLabel, test ID | 05 |
| Auto-wait vs Business completion | 05 |
| Planner vs Controller vs Runner | 06 |
| DOM-OBSERVED vs RUN-PASSED | 06 |
| CI lanes, flaky taxonomy | 07 |
| First-pass vs Eventual pass rate | 07 |
| AI output = draft, not fact | 08 |
| Charter vs Test script | 08 |
| DoR/DoD, vertical slice | 09 |
| Evidence labels (SOURCE-CONTRACT ...) | 09 |

---

## File nguồn gốc đã đọc

| Module | File chính | Trạng thái |
|---|---|---|
| AIQE AI-Assisted Requirement & Test Design | L3_AIQE_ARTD_course_content.md | Đọc đủ |
| AIQE AI Agent Architecture & Live Execution | L3_AIQE_AAALE_course_content_vi.md | Đọc đủ |
| AIQE AI-Assisted Defect, API & Log Analysis | L3_AIQE_DALA_course_content_vi.md | Đọc đủ |
| AIQE Playwright MCP & Locator Mastery | L3_AIQE_PMLM_course_content_vi.md | Đọc đủ |
| AIQE Agent Optimization & CI Execution | L3_AIQE_AOCE_course_content_vi.md | Đọc đủ |
| AIQE Project-Based AI Agent Development | L4_AIQE_PBAAD_course_content_vi.md | Đọc đủ |
| TrainingCalendar | QN26_FR_AUT_01_TrainingCalendar_final_version_1.1.xlsx | Tham chiếu thứ tự |

---

## Lưu ý khi dùng để ôn thi

1. Mỗi file có phần **"Bẫy trắc nghiệm"** — đọc kỹ phần này.
2. Câu hỏi phỏng vấn thường hỏi **khi nào KHÔNG** làm gì (anti-patterns).
3. Bốn keyword bắt gặp ở mọi module: **oracle**, **evidence**, **human review**, **provenance**.
4. Ranh giới giữa AI assist và human accountability là trọng tâm phỏng vấn fresher.
