# PortalLite QA Run Assistant

Đây là bài thực hành của nhóm trong học phần L4_AIQE_PBAAD. Nhóm xây dựng công cụ hỗ trợ QA kiểm tra hai tình huống: tạo rồi tìm nhân viên (F01), và tạo nhân viên trùng ID (F02).

Luồng xử lý gồm: planner đề xuất kế hoạch → controller kiểm tra → runner thực hiện flow được duyệt → chương trình tổng hợp kết quả từ assertion.

## Bài hiện làm được gì?

Nhóm đã có demo JavaScript chạy trên máy local. Planner trả kế hoạch viết sẵn; runner thao tác trên danh sách nhân viên trong bộ nhớ. Chương trình kiểm tra flow, môi trường, source version và requirementRefs trước khi gọi runner.

Kết quả demo mang nhãn SIMULATED. Nhóm chưa kết nối PortalLite hay model thật. Tài liệu U1–U6 là bản bài làm đang hoàn thiện; chưa đủ bằng chứng để xác nhận hoàn thành các gate của học phần.

## Cách chạy

Cần Node.js 18 trở lên. Không cần cài thêm thư viện.

~~~powershell
node src/assistant.js
node --test
~~~

Trên PowerShell cũng có thể dùng npm.cmd run demo và npm.cmd test. package.json khai báo "type": "module" để file .js dùng được import và export.

## Đọc bài theo thứ tự nào?

1. submission/U1_charter-backlog.md: nhóm chọn làm gì và vì sao.
2. submission/U2_architecture-strategy.md: thiết kế và cách kiểm tra kết quả.
3. src/assistant.js và test/assistant.test.js: code cùng test local.
4. submission/U3_sprint1.md đến U6_demo-retro.md: tiến độ, phần còn thiếu và kịch bản demo.
5. docs/mentor-review.md: nhận xét của mentor AI và thứ tự cần bổ sung.

## Kết quả và giới hạn

Sau đợt mentor review, 8/8 test local đã đạt. Đã sửa lỗi tính PASS từ giá trị sai kiểu như chuỗi "false". Phạm vi kiểm tra nằm trong submission/evidence-index.md. Output demo đã lưu ở submission/runtime-artifacts/simulated-demo-001.json.

Các test chưa chứng minh hành vi UI, quyền HR Admin hay cleanup trên PortalLite. QA và HR trong code chỉ là dữ liệu mẫu, chưa phải danh mục department do trainer xác nhận.

Nhóm vẫn có thể làm tiếp trên local: kiểm tra đầu vào, đối chiếu evidence, xử lý lỗi và deadline. Khi có lab, nhóm bổ sung adapter và bằng chứng chạy thực tế. Đánh giá model thật, peer review và chính sách chia sẻ artifact còn chờ xác nhận.

