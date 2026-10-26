# U6 — Chuẩn bị demo và bàn giao

## Kịch bản trình bày 20 phút

Nhóm mở đầu: “Bản demo hôm nay dùng planner viết sẵn và dữ liệu trong bộ nhớ. Nhóm sẽ minh họa cách kiểm tra plan và tính kết quả từ assertion; phần kết nối PortalLite và model thật đang chờ hoàn thiện.”

| Thời lượng | Nhóm trình bày gì? |
|---|---|
| 2 phút | QA lead cần kiểm tra hai employee flow và cần report có thể kiểm chứng |
| 6 phút | Chạy node src/assistant.js, giải thích F01 và các assertion trong output |
| 4 phút | Mở test F99 để giải thích plan ngoài phạm vi bị từ chối; chạy test nếu cần |
| 4 phút | Mở evidence index, chỉ rõ phần mô phỏng, phần chưa triển khai và trạng thái HOLD |
| 4 phút | Trả lời câu hỏi và ghi lại yêu cầu cần làm tiếp |

Đây là kịch bản dự kiến. Nhóm chưa ghi nhận một buổi rehearsal hoặc demo với khách hàng.

## Trả lời tám câu hỏi trong đề

1. **Điều gì chứng minh đúng nhân viên và department?** Trên lab, cần tìm exact ID và so department với giá trị đã chọn. Demo hiện làm việc đó trên danh sách trong bộ nhớ nên chỉ minh họa cách viết assertion.
2. **Save timeout có tạo lại không?** Thiết kế yêu cầu reconcile trước thao tác ghi tiếp theo. Controller hiện chưa xử lý unknown write; nhóm chưa chứng minh được bằng test.
3. **Trang web yêu cầu bỏ policy thì sao?** Model/page text không được cấp quyền. Nhóm có validator cho một số field; vẫn cần test injection, call recorder và adapter kiểm tra quyền độc lập.
4. **Cleanup chưa rõ thì ai xử lý?** Cần giữ HOLD, ghi exact record còn chờ và chuyển lab owner theo phân công đã xác nhận. Code hiện chưa có ledger/cleanup helper.
5. **Người khác chạy lại được không?** Có hướng dẫn chạy local và bộ test. Chưa có bằng chứng một người khác đã tái hiện từ revision bàn giao.
6. **Demo đang dùng gì?** Scripted planner và runner mô phỏng trong bộ nhớ; chưa kết nối PortalLite hay model thật.
7. **Có thể nói production ready hoặc tiết kiệm chi phí chưa?** Chưa có dữ liệu để kết luận. Nhóm chưa đo token, chi phí hoặc hiệu quả sử dụng thực tế.
8. **Thêm flow mới cần gì?** Cần chốt source/AC, quyền thao tác, runner, oracle, cleanup, test và evidence; review tác động trước khi đưa vào phạm vi.

## Tài liệu bàn giao

README chứa lệnh chạy; evidence index dẫn tới output mô phỏng đã lưu; release manifest giữ HOLD. Demo local không tạo bản ghi PortalLite. Danh sách pending owned data rỗng chỉ áp dụng cho phạm vi đó.

## Nhìn lại công việc

Nhóm chưa có đủ ba sự kiện runtime đã quan sát để hoàn thành retrospective theo đề. Bảng dưới đây là kế hoạch xử lý phần còn thiếu, chưa phải kết quả retrospective.

| Việc cần làm | Người phụ trách dự kiến | Khi xem lại | Dấu hiệu hoàn thành |
|---|---|---|---|
| Bổ sung negative controls và đối chiếu evidence local | Thành viên QA/controller | Trước review sprint 2 | Department sai và evidence run cũ thực sự bị phát hiện |
| Nhận lab và contract seed/lookup/cleanup | Nhóm phối hợp trainer/lab owner | Trước lần chạy lab đầu tiên | Có readiness record và người cấp quyền xác nhận |
| Đánh giá planner thật | Thành viên QA phối hợp trainer | Sau khi có provider/config | Có kết quả từng sample; mẫu thiếu được ghi rõ |

Khi đã chạy, nhóm bổ sung sự kiện cụ thể, evidence, quyết định đã thử và kết quả vào retrospective. Mỗi thành viên cũng cần giải thích một thay đổi code, một quyết định review, một assertion và một failure path.

