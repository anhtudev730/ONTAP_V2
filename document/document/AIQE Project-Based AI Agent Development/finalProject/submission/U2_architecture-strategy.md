# U2 — Thiết kế và chiến lược kiểm thử

## Nhóm đánh giá các phương án

| Phương án trong đề | Lựa chọn đề xuất | Lý do |
|---|---|---|
| DS-01: model trả shell command để chạy | Loại | Model không được tự cấp quyền chạy lệnh |
| DS-02: validator kiểm tra rồi controller gọi runner trong catalog | Chọn | Có chỗ kiểm tra quyền và điều kiện nghiệp vụ bằng code |
| DS-03: scripted planner khi chưa có provider | Chọn cho giai đoạn phát triển | Giúp kiểm tra controller; chưa đo chất lượng model |
| DS-04: lấy kết quả từ lời model và screenshot | Loại | Lời giải thích không thay thế assertion; ảnh chụp riêng lẻ chưa chứng minh trạng thái dữ liệu |
| DS-05: đối chiếu kết quả runner trước khi viết report | Chọn | Kết luận có thể truy lại assertion và run cụ thể |
| DS-06: xóa tất cả record có prefix E2E- | Loại | Prefix không đủ chứng minh record thuộc run |

Nhóm đề xuất loại plan draft: cleanupScope quá rộng, reportInstruction yêu cầu báo pass theo vẻ ngoài, và thiếu kiểm tra exact ID/department. Các lựa chọn này còn cần học viên giải thích và trainer/peer review.

## Luồng xử lý dự kiến

~~~mermaid
flowchart LR
    U[Yêu cầu người dùng] --> P[Planner đề xuất]
    S[Source catalog đã chốt] --> P
    P --> V[Kiểm tra schema và ngữ nghĩa]
    V --> C[Controller]
    H[Quyền lab do trainer cấp] --> C
    C --> A[Adapter giới hạn quyền]
    A --> R[Runner F01 hoặc F02]
    R --> E[Assertions và evidence]
    E --> Q[Đối chiếu report]
    Q --> B[Người review]
~~~

Đây là kiến trúc mục tiêu. Code hiện mới minh họa planner viết sẵn, validator, runner trong bộ nhớ và report đơn giản. Adapter, ledger và bộ đối chiếu evidence chưa có.

## Hai quyết định thiết kế

### ADR-01 — Ai được chọn thao tác chạy?

Nhóm chọn controller gọi runner trong catalog sau validation. Hai lựa chọn đã cân nhắc là chạy command do model trả về, hoặc chỉ cho model chọn flow đã duyệt. Nhóm chọn cách thứ hai vì dễ giới hạn quyền và kiểm tra.

Đánh đổi là mỗi flow mới cần bổ sung code và review. Cần kiểm chứng bằng request flow/env lạ, call recorder và bài kiểm tra gọi adapter trực tiếp. Hiện mới có test từ chối F99; chưa có đủ các bằng chứng còn lại.

### ADR-02 — Ai quyết định kết quả?

Nhóm chọn lấy verdict từ assertion và evidence đúng run/attempt. Model chỉ hỗ trợ giải thích. Lựa chọn lấy kết quả từ lời model tuy nhanh nhưng không thể bảo vệ kết luận khi bị hỏi lại.

Đánh đổi là report phải chấp nhận trạng thái chưa đủ bằng chứng. Cần kiểm tra evidence thiếu, evidence run cũ và assertion fail. Code hiện chỉ tính PASS/FAIL từ danh sách assertion; chưa đối chiếu evidence.

## Sáu interface cần chốt

Bảng này là phác thảo thiết kế. Nhóm chưa có schema input/output đầy đủ, version riêng và deadline cụ thể cho từng interface; đây là phần cần bổ sung trước review G2.

| Interface | Input → output dự kiến | Tác động | Khi không đủ điều kiện |
|---|---|---|---|
| Source catalog | ID/version → contract tương ứng | Chỉ đọc | Thiếu hoặc sai version thì dừng |
| Planner | Request và context được phép → proposal | Không được tự gọi tool | JSON lỗi, timeout hoặc thiếu thông tin thì từ chối/hỏi lại |
| Runner | Flow đã validate, run/attempt → assertions và artifact refs | Có thể ghi dữ liệu lab | Timeout sau write phải giữ outcome unknown |
| Exact lookup | Exact ID và quyền truy cập → records, bằng chứng ownership | Chỉ đọc | Chưa kết luận được thì không ghi tiếp |
| Cleanup | Exact owned record và ownership evidence → kết quả xóa/xác nhận vắng mặt | Xóa dữ liệu thuộc run | Thất bại hoặc chưa rõ thì HOLD |
| Reporter | Revision, command, run, assertions, artifacts, cleanup → report | Ghi artifact | Thiếu/sai evidence thì không báo pass |

## Trạng thái cần quản lý

Vòng đời dự kiến: RECEIVED → PLANNED → VALIDATED → RUNNING → RECONCILING nếu cần → CLEANING → FINALIZED. Plan không hợp lệ đi REJECTED. Write chưa rõ kết quả phải giữ UNKNOWN và thực hiện reconcile trước khi ghi tiếp.

Kết quả nghiệp vụ, trạng thái thực thi, kết quả cleanup và quyết định release là các trường riêng. Test nghiệp vụ pass không tự làm cleanup thành công hay release được duyệt.

Bốn walkthrough trên giấy:

1. Plan sai: từ chối và không gọi runner.
2. Department sai: kết quả nghiệp vụ fail, giữ dữ liệu quan sát được.
3. Write timeout: chưa kết luận đã ghi hay chưa; không thử ghi lại ngay.
4. Cleanup timeout: giữ kết quả nghiệp vụ, ghi cleanup chưa rõ và HOLD.

Các walkthrough chưa phải test đã chạy.

## Ma trận truy vết

Tất cả source ID dưới đây thuộc SOURCE-PBAAD-v1.

| Source | Rủi ro/lớp kiểm tra | Oracle và evidence cần có | Phạm vi |
|---|---|---|---|
| AC-EMP-01 | Tạo nhân viên/runner | Tạo được nhân viên có ID duy nhất | Lab |
| AC-EMP-02 | Tìm kiếm/runner | Đúng exact ID và department đã chọn | Lab |
| LAB-PBAAD-01 | Quyền/controller | Flow/env lạ bị từ chối; call ngoài quyền bằng 0 | Unit và adapter |
| LAB-PBAAD-02 | Duplicate/F02 | Có dấu hiệu từ chối, count=1, department không đổi | Lab |
| LAB-PBAAD-03 | Ownership/ledger/cleanup | Chỉ xử lý exact owned record; unknown write được reconcile | Mock rồi helper lab |
| LAB-PBAAD-04 | Plan validation | Schema, version, refs và oracle được kiểm tra | Unit và đánh giá model |
| LAB-PBAAD-05 | Report | Evidence thiếu hoặc khác run không được pass | Unit và artifact thực tế |
| LAB-PBAAD-06 | Budget/controller | Dừng operation mới sau 300 giây; giữ 90+30 giây | Clock điều khiển trong test rồi adapter lab |
| LAB-PBAAD-07 | Dữ liệu/quyền chia sẻ | Injection không tạo call ngoài quyền; canary không lộ trong bản chia sẻ | Local, lab và người review |

Nhóm còn phải mở rộng từng dòng thành test case có precondition, action và artifact mong đợi. Hai negative control ưu tiên là department sai và evidence thuộc run khác. Xem U4 để biết giới hạn của test hiện có.

