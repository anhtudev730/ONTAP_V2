# 09 — Project-Based AI Agent Development

> Nguồn: `L4_AIQE_PBAAD` — Project-Based AI Agent Development, Unit 1–6

---

## 1. Kiến thức và keyword cần nắm

### 🔴 Bắt buộc nắm

**Project scope tối thiểu cho một AI QA agent:**
- Plan review (planner output được kiểm tra schema và semantic)
- Controller (validate plan, environment, budget)
- Hai approved tests (isolated, với oracle)
- Data isolation và cleanup
- Report (chỉ kết luận từ evidence của đúng run)

**Phân biệt ba lớp backlog:**
- **User story**: nhu cầu của người dùng ("Là QA lead, tôi muốn...")
- **Task**: công việc kỹ thuật cụ thể ("Implement report module")
- **Acceptance Criteria (AC)**: điều kiện quan sát được để chấp nhận ("Report chứa assertion ID/department, cleanup có outcome riêng, thiếu evidence không được report pass")

**Definition of Ready (DoR):** Source/oracle đủ, dependencies biết, environment/tool quyền đã chốt, estimate vừa timebox, reviewer có tên.

**Definition of Done (DoD):** Patch reviewed, required checks chạy, claim trỏ evidence, data/secret đã xử lý, limitations và handoff cập nhật. **DoD không đảm bảo feature failed đã đạt functional AC** — vẫn phải ghi feature failed và xử lý finding.

**Project evidence labels (PBAAD-specific):**

| Nhãn | Ý nghĩa |
|---|---|
| SOURCE-CONTRACT | Requirement/policy có ID và version đã chốt |
| OBSERVED | DOM/tool response tại thời điểm cụ thể, có run/env |
| AI-PROPOSAL | Plan/patch/review cần QA kiểm tra |
| SIMULATED | Packet synthetic, không tính là actual model evaluation |
| EXECUTED-SIMULATOR | Code chạy trên simulator, có report; chưa chứng minh live app |
| RUN-PASSED/FAILED | Assertion của test/attempt cụ thể, có runtime evidence |
| ENV-BLOCKED | Môi trường chưa cho phép kiểm chứng; kèm owner, evidence, next action |
| UNKNOWN | Thiếu contract/evidence |

**Assessment trạng thái:**
- `design/analysis achieved` — đã thiết kế, chưa chạy
- `execution pending` — chưa có môi trường/runtime
- `execution verified` — đã chạy và có evidence

**Budget constraints (LAB-PBAAD-06):**
- Operational window tối đa 300 giây
- Reserve reconcile/cleanup 90 giây
- Reserve finalize evidence 30 giây
- Không retry write mù

**Planner evaluation:** Model/page/tool text không cấp thêm quyền, không thay oracle, không quyết định pass. Output phải qua controller validation.

**Sprint workflow (2 sprints):**
- Sprint 1 (U3): Core flows, first vertical slice với evidence
- Sprint 2 (U4): Exception paths, fault tests, recovery, robustness

### 🟡 Mở rộng

**Architecture Decision Record (ADR):** Ghi lại các quyết định thiết kế quan trọng, lý do và tradeoffs. Cần có:
- Context (vấn đề cần giải quyết)
- Decision (quyết định đã chọn)
- Consequences (hệ quả, bao gồm trade-offs)

**Project charter elements:**
- Ai cần kết quả → họ quyết định gì từ kết quả
- Flow nào trong scope / nào ngoài scope
- Môi trường nào được phép
- Khi nào phải dừng
- Ai chịu trách nhiệm

**F02 — Duplicate ID scenario (LAB-PBAAD-02):**
```
Setup: Tạo employee với ID-X (seed thuộc run)
Action: Tạo lại employee với cùng ID-X
Expected: UI hiển thị "duplicate" notification; API từ chối
Oracle: Exact-ID lookup vẫn có đúng 1 record; department ban đầu không đổi
Không đủ: Chỉ dùng toast "duplicate" làm oracle (không chứng minh không có record mới)
```

---

## 2. Bản chất, mục đích, khi nào dùng

**Giá trị của agent trong project QA:**
- Chuyển yêu cầu thành plan có thể review
- Hỗ trợ giải thích evidence
- Assertions, tool permissions và status cuối vẫn kiểm tra bằng code

**Tại sao cần vertical slice sớm (Sprint 1):**
- Không báo "90% xong" khi chưa có một slice chạy được
- Vertical slice: từ UI → business logic → database → report — hoàn chỉnh cho một flow nhỏ
- Phát hiện sớm architectural assumptions sai

**Fault analysis (Sprint 2) — cần test:**
- Timeout và recovery (không retry write mù)
- Unknown write outcome → freeze mutating calls → read/reconcile
- Planner evaluation với adversarial inputs (injection, ambiguous flow)
- Negative controls (test phải phát hiện được regression)

**Demo → Release checklist:**
- Test diff, runner report, manifest, owned-data ledger
- Đã thực hiện privacy/security scan
- Limitations và handoff đã cập nhật
- Không publish nếu chưa có evidence đủ

---

## 3. Ví dụ thực tế

**User story có AC tốt (PB-03 mẫu):**
```
PB-03: Là QA lead, tôi muốn chạy F01 trong isolated-lab,
để biết employee vừa tạo có đúng ID và department trong search result.
Sources: AC-EMP-01, AC-EMP-02, LAB-PBAAD-01/03/05.
Preconditions: authorized HR Admin; owned namespace; readiness passed.
AC:
  - đúng ID + department trong search result
  - report trỏ assertion của cùng run/attempt
  - cleanup có outcome riêng
  - thiếu evidence KHÔNG được report pass
Evidence cần nộp: test diff, runner report, manifest, owned-data ledger.
```

**PR description template phân biệt sources:**
```
Problem/trigger: Context v1 mất department oracle khi summary dài.
Resulting behavior: v2 giữ AC-EMP-02 và dừng khi source bị cắt.
Changes: prompt/context selector + synthetic regression fixtures.
Evidence:
  - revision/config: [hash]
  - commands: [exact commands]
  - actual results: [link to report]
  - artifact refs: [trace, screenshot]
  - missing checks: [E2E live integration chưa chạy - ENV-BLOCKED]
Risks: retrieval freshness / quality-cost tradeoff chưa đo trên live app.
Rollback: revert change commit; giữ run evidence.
```

---

## 4. So sánh khái niệm dễ nhầm và bẫy trắc nghiệm

| Dễ nhầm | Phân biệt |
|---|---|
| User story vs Task vs AC | Story = nhu cầu. Task = kỹ thuật. AC = điều kiện nghiệm thu observable. "Implement report" là task. AC của report phải nói report chứa gì, khi thiếu evidence kết luận thế nào. |
| Design achieved vs Execution verified | Design = trên giấy. Execution = đã chạy với evidence. Không được report "execution verified" khi chỉ có design hay simulation. |
| F01 success → F02 dependency | F01 và F02 phải độc lập nếu muốn isolated rerun. F02 seed riêng, không lấy từ output F01. |
| Sprint completed vs Gate passed | Sprint hoàn thành khi deliverable + evidence. Gate passed khi QA review xong. "Sprint done" không = feature ready to demo nếu còn ENV-BLOCKED. |

**Bẫy trắc nghiệm:**
- "Agent đề xuất feature scope" → nhóm implement luôn → SAI. Mọi scope change cần PO/trainer approval; đánh giá ảnh hưởng permission, data ownership, effort.
- DoD đạt = feature functional AC pass → SAI. DoD là checklist process. Feature failed vẫn có thể DoD nếu finding được ghi lại đúng.
- Simulation pass = production ready → SAI. Simulation = EXECUTED-SIMULATOR. Cần ghi phần live integration còn pending.
- Không có model thật → skip planner evaluation → SAI. Dùng scripted planner để develop controller; ghi rõ planner evaluation còn pending.
- Rollback code = undo tất cả side effects → SAI. Rollback code chỉ revert file. Record đã tạo trong DB cần reconcile/cleanup riêng theo ownership.
