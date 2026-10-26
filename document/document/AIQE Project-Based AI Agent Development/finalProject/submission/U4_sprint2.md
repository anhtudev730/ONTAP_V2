# U4 — Sprint 2: xử lý tình huống lỗi

## Nhóm đối chiếu tám tình huống trong đề

| Tình huống | Chương trình cần làm gì? | Bài hiện có gì? |
|---|---|---|
| FT-01: create timeout, lookup chưa kết luận được | Giữ trạng thái chưa rõ; dừng ghi dữ liệu; reconcile hoặc chuyển người phụ trách | Mới có thiết kế, chưa có controller xử lý tình huống này |
| FT-02: flow lạ hoặc production | Từ chối trước khi gọi runner/adapter | Có test F99; chưa có test riêng cho production và chưa có call recorder |
| FT-03: JSON lỗi hoặc field sai kiểu | Từ chối proposal và ghi lý do | Planner hiện trả object; chưa có bước parse JSON và bộ test sai kiểu đầy đủ |
| FT-04: source cũ hoặc thiếu oracle | Từ chối plan sai contract | Có test source version cũ và thiếu AC-EMP-02; cần kiểm tra thêm các trường hợp khác |
| FT-05: đúng ID nhưng sai department | Assertion dữ liệu phải fail | Test chỉ kiểm tra verdictFor nhận assertion false thì trả FAIL; chưa kiểm tra việc phát hiện department sai |
| FT-06: evidence thuộc run cũ | Không dùng evidence đó để kết luận pass | Chưa có bước đối chiếu run/attempt của evidence |
| FT-07: cleanup timeout | Ghi cleanup chưa rõ, giữ thông tin bản ghi và HOLD | Chưa có test lỗi cleanup |
| FT-08: hết thời gian nhưng còn call đang chạy | Không nhận operation mới; ghi rõ call đang chạy và kết quả chưa rõ | Chưa có clock, cancellation hay watchdog |

## Hai negative control cần bổ sung

Nhóm cần đưa một bản ghi có department sai qua đúng hàm kiểm tra dữ liệu và xác nhận assertion fail. Tiếp theo, đưa evidence của run khác vào report verifier và xác nhận bị từ chối. Cả hai kiểm tra đều làm được bằng dữ liệu local.

Một test chỉ truyền sẵn passed: false chưa đủ chứng minh chương trình tự phát hiện sai department.

## Giới hạn thời gian

Thiết kế dùng tối đa 300 giây cho operations, dành 90 giây cho reconcile/cleanup và 30 giây để hoàn tất evidence. Watchdog 480 giây là đề xuất trong handout. Code hiện chưa thực thi các mốc này.

Nhóm dự kiến dùng clock có thể điều khiển trong test để kiểm tra việc dừng operation mới mà không phải đợi nhiều phút. Khi có lab, cần thêm một lần kiểm tra deadline/cancellation thực tế trên adapter. Không cam kết cleanup hoàn tất nếu process bị dừng cưỡng bức.

## Kế hoạch đánh giá planner

Nhóm cần viết expected invariant cho EV-01 đến EV-06 trước khi sửa prompt. Khi có provider, cố định model/config/source và chạy 2 proposal mỗi case, tổng cộng 12 sample. Mỗi sample phải có output đã loại thông tin nhạy cảm, kết quả schema/semantic validation, số call ngoài quyền và giới hạn còn lại.

Hiện số actual model sample là 0/12. Scripted planner phục vụ phát triển controller và được ghi riêng. G4 còn chờ cả phần kiểm tra local lẫn tích hợp lab/model.

