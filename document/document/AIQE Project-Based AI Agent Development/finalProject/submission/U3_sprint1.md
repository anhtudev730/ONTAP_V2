# U3 — Sprint 1: xây dựng luồng demo đầu tiên

## Nhóm đã làm gì?

Nhóm triển khai luồng chạy trong src/assistant.js: nhận request, gọi planner viết sẵn, kiểm tra plan, chạy logic mô phỏng và trả report. Test nằm trong test/assistant.test.js.

Với F01, runner tạo nhân viên trong danh sách ở bộ nhớ rồi tìm theo đúng ID. Các assertion kiểm tra tạo thành công, tìm đúng ID và department đúng giá trị mẫu.

Với F02, runner tạo seed riêng, thử thêm nhân viên cùng ID rồi kiểm tra thao tác bị từ chối, số bản ghi vẫn bằng một và department ban đầu không đổi. Mỗi lần gọi runner có danh sách riêng nên F02 không phụ thuộc F01.

Đây là cách nhóm học viết oracle. Những thao tác này chưa đi qua UI hay API của PortalLite.

## Điều kiện cần chứng minh trên lab

| Flow | Điều kiện trước khi chạy | Kết quả cần kiểm tra |
|---|---|---|
| F01 | Có quyền HR Admin, ID riêng và department hợp lệ | Tạo được nhân viên; exact-ID search trả đúng nhân viên và department đã chọn |
| F02 | Có seed riêng thuộc run và biết department ban đầu | Có dấu hiệu từ chối duplicate; exact-ID count bằng 1; department không đổi |

Nguồn: AC-EMP-01, AC-EMP-02 và LAB-PBAAD-02 trong SOURCE-PBAAD-v1. Thông báo thành công trên UI chỉ là tín hiệu; nhóm vẫn phải kiểm tra dữ liệu sau thao tác.

## Report và evidence

Report local có mode, run ID, attempt ID, source version, flow, assertion, cleanup và giới hạn. Output F01 được lưu tại submission/runtime-artifacts/simulated-demo-001.json với nhãn SIMULATED.

Report còn thiếu revision cụ thể, lệnh chạy trong report, liên kết evidence cho từng assertion và bước xác minh evidence thuộc đúng run. Nhóm có thể bổ sung những phần này ngay trên local.

Cleanup hiện chỉ là nhãn mô phỏng. Code chưa có ledger ghi nhận quyền sở hữu bản ghi, exact lookup helper hay cleanup helper. Nhóm chưa được ghi nhận cleanup thành công trên lab.

## Kết luận sprint

Nhóm đã có demo để giải thích luồng điều khiển. G3 chưa đủ điều kiện xác nhận. Bước tiếp theo là hoàn thiện report và kiểm tra local, đồng thời xin trainer cấp lab, quyền HR Admin và contract cho seed/lookup/cleanup.

