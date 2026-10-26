# Nhật ký review

Bản hiện tại được AI hỗ trợ soạn và review theo yêu cầu người dùng. Chưa có bằng chứng về bản manual draft của học viên hay review độc lập từ peer/trainer. Vì vậy, các dòng dưới là đề xuất để học viên đọc, giải thích và quyết định; không ghi accept/reject thay học viên.

Nguồn baseline: SOURCE-PBAAD-v1 và yêu cầu từng unit trong handout. Trạng thái quyết định của học viên cho các mục dưới đây đều là **chờ xác nhận**.

| Unit/mục | Điểm cần xem lại | Đề xuất của mentor AI | Nguồn/bằng chứng | Việc học viên cần quyết định |
|---|---|---|---|---|
| U1-01 | KR-06 muốn dùng production | Loại khỏi baseline; xin lab phù hợp | LAB-PBAAD-01; ENV-PBAAD-v1 | Giải thích vì sao thiếu lab không tạo quyền dùng production |
| U1-02 | KR-07 muốn xóa toàn bộ nhân viên | Chỉ cleanup exact owned record có evidence | LAB-PBAAD-03 | Chọn cách quản lý ownership và người xử lý escalation |
| U2-01 | DS-01 để model trả command | Dùng catalog runner và controller kiểm tra quyền | LAB-PBAAD-01/04 | Bảo vệ lựa chọn, nêu đánh đổi |
| U2-02 | Bảng interface mới là mô tả ngắn | Bổ sung schema, version, deadline và failure meanings | Nhiệm vụ U2; U2_architecture-strategy.md | Chốt contract có thể implement và test |
| U3-01 | Report local chưa có revision/command/evidence matching | Hoàn thiện report contract trước tích hợp lab | LAB-PBAAD-05; src/assistant.js | Chọn cấu trúc report và cách kiểm chứng |
| U3-02 | Cleanup hiện chỉ là nhãn | Giữ trạng thái mô phỏng, bổ sung ledger và helper contract | LAB-PBAAD-03; src/assistant.js | Xác định ownership evidence tối thiểu |
| U4-01 | Test department chỉ truyền passed: false | Đưa dữ liệu department sai qua checker thật | FT-05; test/assistant.test.js | Viết expected assertion trước khi sửa checker |
| U4-02 | Test stale evidence chưa có | Đưa artifact khác run/attempt qua report verifier | FT-06; LAB-PBAAD-05 | Chốt hành vi từ chối và evidence của test |
| U5-01 | verdictFor từng dùng truthiness | Đã sửa chỉ chấp nhận boolean true; thêm case sai kiểu | src/assistant.js; finding M-01 và 8 test đạt | Học viên xác nhận thay đổi và giải thích vì sao chuỗi false nguy hiểm |
| U5-02 | Chưa có peer reproduction | Nhờ người khác chạy theo README ở revision đã chốt | Nhiệm vụ U5 | Ghi người chạy, phiên bản, command và outcome thật |
| U6-01 | Dễ trình bày demo như kết quả lab | Mở đầu bằng mode và giới hạn, dẫn đúng artifact | Nhiệm vụ U6; evidence index | Tập trả lời bằng bằng chứng hiện có |
| U6-02 | Bảng rủi ro chưa phải retrospective | Sau khi chạy, ghi ba sự kiện và ba action có owner/mốc xem lại | Nhiệm vụ U6 | Chọn sự kiện có evidence, không tự điền kết quả |

Có hai đề xuất cho mỗi unit chưa có nghĩa đã đạt yêu cầu review của học phần. Học viên còn cần ghi quyết định thực tế, lý do và thay đổi đã thực hiện.

