# Danh mục bằng chứng

Danh mục ghi đúng những gì hiện có. Đường dẫn tính từ thư mục gốc project. Bộ test local được chạy lại sau khi mentor sửa hàm tính verdict.

| ID | Loại/phạm vi | Run hoặc phiên bản | Điều có thể kết luận | Nơi kiểm tra | Giới hạn |
|---|---|---|---|---|---|
| E-SRC-01 | SOURCE-CONTRACT | SOURCE-PBAAD-v1 | Có contract để thiết kế hai flow | Hai file course content và exercises do người dùng cung cấp | Contract synthetic; cần trainer xác nhận baseline |
| E-LOCAL-01 | SIMULATED | demo-001/a1; working tree | Có output F01 với assertion trên dữ liệu trong bộ nhớ | submission/runtime-artifacts/simulated-demo-001.json | Chưa có revision bất biến, artifact matching verifier hoặc lab evidence |
| E-TEST-01 | Test local | Working tree; 8/8 test đạt | F01/F02 mẫu, từ chối F99, source cũ, thiếu AC-EMP-02; verdict từ chối assertion rỗng, thiếu hoặc sai kiểu | test/assistant.test.js; chạy lại bằng node --test | Chưa lưu test report riêng. Test assertion false chưa kiểm tra việc phát hiện department sai |
| E-ENV-01 | ENV-BLOCKED | Chưa có lab được cấp | Trong tài liệu cung cấp chưa có app, quyền, helper, fault mode, provider và sharing policy để dùng | ENV-PBAAD-v1 trong handout | Trainer/lab owner cần cấp hoặc xác nhận; không có bằng chứng lỗi kết nối vì chưa kết nối |
| E-REVIEW-01 | AI-PROPOSAL / đọc tĩnh | Working tree tại đợt mentor review | Có finding và kế hoạch sửa bài, chưa phải peer reproduction | docs/mentor-review.md | Học viên cần accept/reject và trainer/peer xác nhận khi cần |

Không dùng output mô phỏng để kết luận PortalLite chạy đúng. Không có bản ghi PortalLite nào được tạo trong phạm vi demo này; pending owned data rỗng chỉ nói về phạm vi đó.

