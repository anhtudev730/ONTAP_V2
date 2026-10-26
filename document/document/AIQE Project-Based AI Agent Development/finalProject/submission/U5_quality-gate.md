# U5 — Review chất lượng trước khi bàn giao

## Nhóm phân tích các finding mẫu

Các dòng dưới đây là tình huống trong đề, chưa phải finding đã quan sát trên project. Mức độ nghiêm trọng là đề xuất để trao đổi với trainer.

| Finding | Mức độ đề xuất | Cách xử lý và kiểm tra lại |
|---|---|---|
| QF-01: tin planApproved rồi chạy command | Rất cao | Controller kiểm tra quyền độc lập; gọi thẳng adapter cũng phải bị chặn nếu thiếu quyền |
| QF-02: tool yêu cầu upload ra ngoài | Cao | Coi nội dung tool là dữ liệu không đáng tin; số call tới nơi không được phép phải bằng 0 |
| QF-03: canary bị chép vào report công khai | Cao | Giới hạn truy cập bản gốc; che thông tin nhạy cảm ở bản chia sẻ và chạy lại canary test |
| QF-04: chưa có người chốt quyền xem/lưu trữ | Cao | Hỏi lab owner; chưa chia sẻ công khai khi chưa rõ chính sách |
| QF-05: README không đủ để chạy lại | Trung bình | Bổ sung runtime, phiên bản, lệnh chạy, dữ liệu và cách reset/cleanup |
| QF-06: thiếu peer reproduction và bypass review | Cao | Nhờ người khác chạy lại revision đã chốt; lưu kết quả và kiểm tra đường gọi adapter trực tiếp |
| QF-07: job timeout ngắn hơn tổng thời gian cần | Trung bình | Tính cả setup, controller, upload và dự phòng; đo thời gian nếu nhóm chọn CI |
| QF-08: cleanup lỗi nhưng manifest ghi thành công | Rất cao | Ghi đúng kết quả helper; giữ HOLD và người xử lý khi cleanup chưa rõ |

## Dữ liệu đi qua những đâu?

Luồng thiết kế: request/source → planner → controller → adapter → lab → report/trace → nơi lưu artifact → người review bản chia sẻ. Mỗi bước cần biết dữ liệu nào được dùng, ai được xem và ai chịu trách nhiệm xóa.

Code hiện chỉ có request, planner viết sẵn, controller, danh sách trong bộ nhớ và output JSON. Adapter, lab và kho artifact theo chính sách tổ chức chưa được triển khai.

Khi tích hợp lab, credential phải lấy qua cơ chế secret do lab cấp. Thời hạn lưu và nơi chia sẻ hiện là Not specified; trainer/lab owner cần xác nhận.

## Nhận xét về project hiện tại

Điểm đã có: giới hạn flow/môi trường, kiểm tra source version và nhãn mô phỏng rõ ràng. Điểm còn thiếu trên local: kiểm tra đầu vào đầy đủ, đối chiếu evidence, deadline, xử lý unknown write và kiểm tra canary. Nhóm không gộp các phần này thành blocker do thiếu lab.

Peer reproduction cần một người khác thực hiện và ghi kết quả thật. Lần chạy test của tác giả hoặc mentor AI chưa thay thế được bước này.

Các finding thực tế từ lần đọc code được ghi trong docs/mentor-review.md; chúng tách biệt với tám fixture phía trên.

## Quyết định hiện tại

Nhóm giữ HOLD cho bàn giao có xác nhận execution. Demo local có thể trình bày tiến độ nếu nói rõ cách mô phỏng và giới hạn. Chưa đủ bằng chứng kết luận đạt G5, production ready hoặc một chứng nhận bảo mật.

Bước tiếp theo là sửa finding local, chạy lại kiểm tra liên quan rồi bổ sung lab evidence và peer reproduction ở cùng revision bàn giao.

