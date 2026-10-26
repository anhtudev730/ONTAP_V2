# U1 — Charter và backlog

## Charter do nhóm xây dựng

**Người dùng:** QA lead giả lập. **Quyết định:** có thể tin assertion của hai employee flow trong isolated lab hay cần điều tra thêm. **MVP:** request → plan đề xuất → validate → chạy F01/F02 đã duyệt → report assertions/evidence/cleanup. **Ngoài scope:** production, bulk delete, dashboard, scheduled CI, flow khác.

**Ràng buộc:** SOURCE-PBAAD-v1; synthetic data; 300 giây operations, giữ 90 giây reconcile/cleanup và 30 giây finalize; secrets ngoài prompt/report. Chỉ trainer cấp readiness và quyền.

**Thành công:** plan sai bị chặn trước runner; F01/F02 độc lập; report không pass khi assertion/evidence thiếu; owned data được reconcile/cleanup chính xác. **Unknowns:** app/runtime, exact lookup/cleanup helper, department catalog, ID constraints, artifact policy, provider/model. Owner hiện là trainer/lab owner; execution gate pending.

## Triage yêu cầu

| Request | Quyết định | Lý do/source |
|---|---|---|
| KR-01 | Baseline | Report có ích cho QA review, LAB-PBAAD-05 |
| KR-02 | Baseline có điều kiện | F01/F02, 48 giờ; LAB-PBAAD-01/02 |
| KR-03 | Baseline | Ownership/cleanup, LAB-PBAAD-03 |
| KR-04 | Baseline | Validator/controller, LAB-PBAAD-04 |
| KR-05 | Defer | Stretch sau MVP và gate; không thay assertion |
| KR-06 | Reject | Production không được cấp quyền; ENV-PBAAD-v1 |
| KR-07 | Reject | Bulk deletion trái ownership policy, LAB-PBAAD-03 |
| KR-08 | Baseline | Assertion/evidence trong report, LAB-PBAAD-05 |

## Backlog tối thiểu

| ID | AC: precondition → action → oracle | Source/version | Dependency và evidence cần có | Owner / estimate |
|---|---|---|---|---|
| PB-01 | Trước run, xác nhận revision/runtime/role/env; thiếu mục nào thì đánh blocker và chưa chạy | ENV-PBAAD-v1 | Trainer cấp readiness; readiness record | Trainer / 2h |
| PB-02 | Với request flow/env bất kỳ, controller chỉ chuyển F01/F02 + isolated-lab; input khác phải bị reject và không gọi runner | LAB-PBAAD-01/04 / SOURCE-PBAAD-v1 | PB-01; rejection test + call recorder | Controller / 3h |
| PB-03 | Với proposal, validator yêu cầu schema, source version và oracle đúng flow; thiếu/sai thì reject | LAB-PBAAD-04 / SOURCE-PBAAD-v1 | PB-02; validator test cases | Controller / 3h |
| PB-04 | Với HR Admin được cấp và ID riêng, chạy F01 create rồi exact-ID search; ID và department phải khớp | AC-EMP-01/02 / SOURCE-PBAAD-v1 | Lab + runner được duyệt; matching runtime report | QA / 5h |
| PB-05 | Với seed độc lập của F02, thử duplicate create; phải bị từ chối, exact-ID count=1 và department giữ nguyên | LAB-PBAAD-02 / SOURCE-PBAAD-v1 | Seed/lookup helper; runtime assertions | QA / 5h |
| PB-06 | Mỗi run/attempt ghi ledger; khi write outcome unknown phải reconcile trước mutating call tiếp theo | LAB-PBAAD-03/06 / SOURCE-PBAAD-v1 | Exact lookup helper; fault test + call log | Controller / 5h |
| PB-07 | Cleanup nhận exact record kèm ownership evidence; chỉ record đó được xử lý và outcome phải ghi rõ | LAB-PBAAD-03 / SOURCE-PBAAD-v1 | Cleanup helper; ledger trước/sau | QA / 4h |
| PB-08 | Report gắn revision/source/run/attempt, command, assertions, artifact matching, cleanup và limits; evidence thiếu/sai thì không pass | LAB-PBAAD-05 / SOURCE-PBAAD-v1 | PB-04/05; report/provenance tests | Reporter / 4h |
| PB-09 | Với fault/negative controls, wrong department và stale evidence phải bị phát hiện; hết budget không nhận operation mới | LAB-PBAAD-05/06 / SOURCE-PBAAD-v1 | PB-02–08; executable fault ledger | QA / 5h |
| PB-10 | Trước handoff, review untrusted input/secret/artifact, peer reproduce và gán gate; finding blocking thì HOLD | LAB-PBAAD-07 / SOURCE-PBAAD-v1 | Các item trước; canary, reproduction và retest record | Reviewer / 4h |

Estimate tổng 40 giờ nhóm-work (không nhân theo số thành viên); 8 giờ còn lại dành kickoff, review, fix và demo. Ước lượng cần cập nhật sau readiness.

**DoR — Khi nào bắt đầu một item?** Có source và oracle đủ rõ, biết dependency, quyền/môi trường được xác nhận, có người thực hiện và người review, estimate vừa timebox.

**DoD — Khi nào được ghi hoàn thành?** Patch đã được review; các kiểm tra bắt buộc đã chạy và đạt điều kiện nghiệm thu; evidence khớp revision/run; cleanup, dữ liệu nhạy cảm và hướng dẫn bàn giao đã được xử lý. Nếu còn kiểm tra bắt buộc pending, item vẫn chưa hoàn thành. Nhóm ghi rõ kết quả phần đã làm để giữ tiến độ minh bạch.

**Ưu tiên đề xuất:** PB-01 đến PB-08 là P0 vì tạo luồng tối thiểu an toàn. PB-09 và PB-10 là P0 trước khi bàn giao có xác nhận execution. Dashboard, CI định kỳ và flow mới để sau các gate; không thay thế việc còn thiếu bằng những tính năng này.

**Phân công dự kiến:**

| Quyết định/công việc | Người thực hiện | Người chốt |
|---|---|---|
| Scope/backlog | Cả nhóm đề xuất | Trainer/PO |
| Plan/controller | Thành viên phụ trách controller | Reviewer khác tác giả; trainer chốt quyền |
| Oracle/assertion/evidence | Thành viên QA/evidence | QA owner + peer reviewer |
| Cleanup/escalation | Thành viên QA theo helper được cấp | Lab owner/trainer |
| Chia sẻ demo/artifact | Thành viên demo chuẩn bị bản sanitized | Trainer/lab owner |

Với nhóm 3 người, một người có thể kiêm demo; sprint 2 nhóm xoay vai. Thành viên không tự duyệt thay trainer các quyền lab hoặc chia sẻ artifact.

## Readiness/blockers

Nhóm đã tự tạo source code và test local trong project này. Handout chưa cấp starter được trainer xác nhận, app/simulator, lab account, seed/lookup/cleanup helper, fault injection, model/provider hoặc artifact policy.

Các phần tích hợp được ghi ENV-BLOCKED với người cần phối hợp là trainer/lab owner. Đây là ghi nhận tài nguyên chưa được cấp, chưa phải kết quả kiểm tra kết nối thất bại. Các công việc controller/report/test làm được trên local vẫn tiếp tục. G1 còn chờ trainer chốt baseline, vai trò cụ thể và readiness register chi tiết.
