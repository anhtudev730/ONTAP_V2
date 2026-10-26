# Nhận xét của mentor AI

## Đánh giá chung

Bài đã chọn đúng vấn đề để học: chỉ làm hai flow, dùng controller kiểm tra plan và giữ nhãn mô phỏng rõ ràng. Code ngắn nên fresher có thể lần theo từ request đến report.

Tuy vậy, bài hiện là bản demo nền tảng kèm tài liệu thiết kế, chưa phải project hoàn thành toàn bộ yêu cầu. Một số phần thiếu lab/model thật; nhiều phần khác vẫn làm được ngay trên local. Nên hoàn thiện những phần này trước khi tích hợp để tránh phải vừa sửa controller vừa tìm lỗi môi trường.

Lần review này đọc code, test và tài liệu, sửa một lỗi tính verdict rồi chạy lại bộ test: 8/8 đạt. Chưa có peer reproduction; mentor AI không chấm điểm hay xác nhận gate thay trainer.

## Những điểm cần sửa theo thứ tự ưu tiên

### M-01 — Cao, đã sửa: giá trị sai kiểu từng có thể được tính PASS

Trước khi sửa, verdictFor dùng every(assertion => assertion.passed). JavaScript coi chuỗi "false" là giá trị đúng, nên assertion có passed: "false" vẫn có thể làm verdict PASS. Runner hiện tự tạo boolean, nhưng khi nhận dữ liệu từ adapter, lỗi này có thể tạo kết luận sai.

Đã sửa để chỉ boolean true được tính đạt. Kết quả thiếu, sai kiểu, danh sách rỗng hoặc có phần tử trống đều trả FAIL. Test hồi quy đã kiểm tra các trường hợp này; toàn bộ 8 test local đạt. Kết quả đó chưa chứng minh adapter/lab vì chưa tích hợp các thành phần này.

### M-02 — Cao: chưa có cơ chế xác minh evidence

runRequest tính kết quả từ assertion mà không kiểm tra artifact thuộc đúng run/attempt. Report cũng thiếu revision và command. Bài đã ghi giới hạn này nhưng cần xem đây là việc phải implement theo LAB-PBAAD-05.

Có thể làm trên local bằng kết quả runner mẫu: evidence đúng run được nhận, evidence cũ hoặc thiếu bị từ chối. Sau đó mới nối adapter thật.

### M-03 — Cao: phần xử lý lỗi và thời gian chưa được implement

Code chưa có ledger, reconcile cho unknown write, cleanup outcomes hay deadline/cancellation. Đây là phần quan trọng của U4, không chỉ là mục ghi trong tài liệu.

Trước mắt dùng fake adapter và clock điều khiển trong test để kiểm tra tám FT cases, thứ tự call và việc dừng mutation. Sau đó ghi rõ phần nào đã kiểm chứng ở controller, phần nào còn chờ lab.

### M-04 — Trung bình: tên test đang nói nhiều hơn điều nó chứng minh

Test department hiện chỉ gọi verdictFor với một assertion false có sẵn. Nó chưa đưa record sai department qua checker. Test prose cũng chưa đặt tình huống assertion fail trong khi model yêu cầu báo pass.

Cần thiết kế negative controls theo dữ liệu đầu vào thực sự sai, rồi xác nhận checker phát hiện. Đã sửa mô tả trong U4 và evidence index để không ghi quá phạm vi test hiện tại.

### M-05 — Trung bình: schema và readiness chưa đủ chi tiết

Validator kiểm tra một số field nhưng chưa có kiểm tra toàn bộ kiểu dữ liệu hoặc parse JSON. runId/attemptId chỉ cần là chuỗi không rỗng. Sáu interface trong U2 chưa có schema và deadline riêng.

Nhóm nên chốt schema proposal nội bộ và case sai kiểu trên local. Với ID dùng trên app, danh mục department và helper authorization, cần hỏi trainer thay vì tự biến ví dụ thành quy tắc sản phẩm.

### M-06 — Trung bình: hồ sơ học tập cần quyết định thật của học viên

U1 chưa có người phụ trách cụ thể; U2 chưa đủ chi tiết interface; chưa có manual draft, accept/reject thật, peer reproduction, rehearsal và defense cá nhân. U6 mới có kế hoạch, chưa có retrospective dựa trên ba sự kiện.

AI có thể hỗ trợ soạn nhưng học viên cần tự giải thích lựa chọn, ghi quyết định và cung cấp bằng chứng đã thực hiện. Số dòng trong review log không thay thế bước đó.

## Đợt này đã chỉnh gì?

- Sửa README bị lặp tiêu đề và còn tiếng Nga.
- Viết lại U2–U6, review log và evidence index bằng tiếng Việt dễ đọc; giữ thuật ngữ cần dùng trong lớp.
- Sửa mô tả FT-04 cho khớp hai test đã có; thu hẹp mô tả FT-05 theo đúng điều test chứng minh.
- Phân biệt kiến trúc mục tiêu với code hiện tại, fixture trong đề với finding thực tế.
- Sửa DoD để pending không bị hiểu thành đã hoàn thành; phân biệt source code nhóm đã tạo với lab/starter chưa được cấp.
- Giữ HOLD và không tự xác nhận gate, peer review hay quyết định của học viên.
- Sửa lỗi verdict nhận giá trị truthy, thêm test hồi quy và ghi nhận 8/8 test đạt.

## Lộ trình hoàn thiện phù hợp cho fresher

1. Tự giải thích được F01/F02 và một test fail; xác nhận các quyết định review.
2. Giải thích được bản sửa M-01, bổ sung schema và report verifier; chạy hai negative controls.
3. Làm controller fault tests với fake adapter/clock cho tám FT cases.
4. Nhận readiness pack và chạy F01/F02 cùng fault injection được cấp.
5. Hoàn thành 12 proposal model khi có provider; ghi rõ sample thiếu nếu có.
6. Nhờ peer reproduce, rehearsal, cập nhật manifest và bổ sung retrospective có evidence.

Đừng cố làm mọi phần cùng lúc. Sau mỗi bước, giữ lại một kết quả nhỏ có thể giải thích và chạy lại. Đó là cách dễ dạy lại và cũng dễ bảo vệ bài hơn.

