# Mentor guide: dạy project trong 15 phút

## Mục tiêu

Fresher hiểu rằng model chỉ đề xuất kế hoạch. Code xác định quyền, chạy flow đã duyệt và tính verdict từ assertion.

## Kịch bản demo

1. Mở `src/assistant.js`; lần theo `runRequest` → `validatePlan` → `syntheticRunner` → report.
2. Chạy `npm.cmd run demo` trên PowerShell; chỉ vào `mode: SIMULATED` và limitations.
3. Chạy `npm.cmd test`; mở code để giải thích thứ tự validate trước runner. Test F99 xác nhận có lỗi từ chối; chưa có call recorder chứng minh số lần gọi runner.
4. Thay planner trong bài tập để trả `production`; quan sát validation reject.
5. Hỏi học viên: vì sao toast hoặc model viết "passed" không đủ? Đáp án mong đợi: oracle/assertion và matching evidence.

## Ghi nhớ cho fresher

- `AC` là điều kiện cần chứng minh; toast chỉ là tín hiệu phụ.
- Planner đề xuất; controller quyết định quyền và runner.
- Unknown write phải reconcile, không retry mù.
- Cleanup chỉ xóa record có ownership evidence.
- `SIMULATED` không phải runtime pass.

## Giới hạn

Ví dụ được giữ nhỏ để học viên theo được luồng. Employee và department là dữ liệu mẫu; hành vi F02 được mô phỏng bằng logic trong bộ nhớ. Lab adapter, auth, ownership lookup/cleanup và actual model evaluation cần readiness pack của trainer.

Trước khi dùng bài để dạy, đọc `docs/mentor-review.md`. Test assertion false hiện chưa kiểm tra dữ liệu department sai thật; đây là bài tập cần làm tiếp. Lỗi hàm verdict nhận giá trị truthy đã được sửa và có test hồi quy, phù hợp để giải thích vì sao kiểm tra kiểu dữ liệu lại quan trọng.
