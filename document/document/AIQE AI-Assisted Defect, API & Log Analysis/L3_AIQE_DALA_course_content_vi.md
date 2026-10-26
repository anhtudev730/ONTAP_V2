# [NFP] Phân tích lỗi, API và log có hỗ trợ AI

- **Mã khóa học đề xuất:** `L3_AIQE_DALA`
- **Trình độ:** Nâng cao
- **Thời lượng:** 48 giờ (6 học phần × 8 giờ)
- **Hình thức triển khai:** 30% khái niệm và minh họa, 60% thực hành, 10% ôn tập và đánh giá
- **Kết quả chính:** Học viên có thể dùng AI để cải thiện báo cáo lỗi, phân tích nguyên nhân gốc trong phạm vi bằng chứng, điều tra log và kiểm thử API; đồng thời phân biệt rõ quan sát, giả thuyết và nguyên nhân đã được xác nhận.

## 1. Đối tượng học viên

- Kỹ sư QA cấp cao, Chuyên viên phân tích kiểm thử, Trưởng nhóm kiểm thử, Kỹ sư tự động hóa QA, SDET và kiểm thử viên full-stack.
- Người đã thực hiện kiểm thử chức năng và muốn có quy trình điều tra lặp lại được trên UI, API, dịch vụ và log.
- Các nhóm đang ứng dụng AI tạo sinh trong kiểm thử nhưng yêu cầu bằng chứng có thể kiểm toán, kiểm soát quyền riêng tư và phê duyệt của con người.

## 2. Điều kiện tiên quyết

Học viên cần có khả năng:

- Thực thi kiểm thử chức năng và phân biệt hành vi kỳ vọng với hành vi thực tế.
- Đọc request/response HTTP, payload JSON, mã trạng thái và tài liệu API cơ bản.
- Đọc log ứng dụng có cấu trúc và hiểu timestamp, môi trường, tên dịch vụ.
- Áp dụng các kỹ thuật thiết kế kiểm thử cơ bản như phân lớp tương đương, phân tích giá trị biên và kiểm thử chuyển trạng thái.
- Dùng công cụ gọi API như Postman, Bruno, curl hoặc công cụ tương đương.
- Dùng trợ lý AI tạo sinh và tuân thủ chính sách xử lý dữ liệu được tổ chức phê duyệt.

## 3. Kết quả học tập cấp khóa

Khi hoàn thành khóa học, học viên có thể:

1. Tạo báo cáo lỗi ngắn gọn, tái lập được, giàu bằng chứng, hỗ trợ tốt cho triage và điều tra.
2. Dùng AI để tạo giả thuyết nguyên nhân gốc mà không trình bày giải thích chưa xác thực như sự thật.
3. Chuẩn hóa, lọc và liên kết log giữa các dịch vụ, múi giờ, lần thử lại và thao tác bất đồng bộ.
4. Thiết kế kiểm thử API từ hợp đồng và quy tắc nghiệp vụ đã xác nhận cho request, response, trạng thái, header và schema.
5. Xây dựng có hệ thống các kịch bản API dương tính, âm tính, biên, phân quyền, trạng thái, idempotency và khả năng phục hồi với sự hỗ trợ của AI.
6. Kết hợp quan sát UI, lưu lượng API, log, trace và bằng chứng nghiệp vụ thành một tường trình điều tra có cơ sở.
7. Lưu lại prompt AI, ranh giới nguồn, quyết định review và giới hạn để phân tích vẫn có thể kiểm toán.

## 4. Triết lý học tập

Khóa học tuân theo trình tự do con người dẫn dắt, có AI hỗ trợ:

1. **Quan sát thủ công:** Ghi nhận điều đã xảy ra mà không đoán nguyên nhân.
2. **Thiết lập oracle:** Xác định requirement, contract hoặc quy tắc đã được phê duyệt định nghĩa hành vi kỳ vọng.
3. **Thu thập bằng chứng:** Lưu giữ bằng chứng UI, API, log, trace và môi trường có thể tái lập.
4. **Cấu trúc thủ công:** Lập timeline, xác định khoảng trống và tách sự thật khỏi diễn giải.
5. **Nhờ AI hỗ trợ:** Dùng AI để tóm tắt, nhóm, đối chiếu hoặc đề xuất giả thuyết và kiểm thử có giới hạn.
6. **Thách thức đầu ra:** Loại bỏ sự thật bịa đặt, kiểm tra phép tính và kiểm thử các cách giải thích thay thế.
7. **Trao đổi với nhãn độ tin cậy:** Nêu rõ điều nào đã xác nhận, được hỗ trợ, có thể xảy ra, bị mâu thuẫn hoặc chưa biết.

AI không phải là oracle thực thi. AI không chứng minh được một bài kiểm thử đã pass, một lỗi tồn tại hay một thành phần gây ra sự cố. Các khẳng định đó cần hành vi kỳ vọng đã phê duyệt và bằng chứng có thể quan sát.

## 5. Case study xuyên suốt được đề xuất

Dùng một case study trong cả sáu học phần để mỗi sản phẩm bàn giao trở thành một phần của gói điều tra tích hợp.

**Hệ thống đề xuất:** Một nền tảng đặt hàng và hoàn tiền đa kênh có web/mobile client, API gateway, Order Service, Inventory Service, Payment Adapter, Notification Service, cơ sở dữ liệu quan hệ, nền tảng log tập trung và nhà cung cấp thanh toán/email bên ngoài.

### 5.1 Bối cảnh hệ thống

```text
Web/Mobile Client
       |
       v
   API Gateway
       |
       v
  Order Service -----> Inventory Service
       |
       +-------------> Payment Adapter -----> Payment Provider
       |
       +-------------> Notification Service -> Email Provider
       |
       +-------------> Order Database

All services emit structured logs to the central log platform.
Requests carry a correlation ID across synchronous and asynchronous boundaries.
```

### 5.2 Bằng chứng nghiệp vụ và giao diện đã được phê duyệt

| Mã bằng chứng | Nguồn được phê duyệt |
|---|---|
| `REQ-ORD-01` | Khách hàng đã đăng ký có thể đặt hàng khi các mặt hàng yêu cầu còn sẵn và thanh toán thành công. |
| `BR-IDEM-01` | Thử lại cùng một request đặt hàng với cùng idempotency key và cùng payload không được tạo thêm đơn hàng hoặc khoản thu thanh toán khác. |
| `BR-INV-01` | Hàng tồn được giữ trong 15 phút và phải được trả lại khi thanh toán thất bại hoặc đơn hàng bị hủy trước khi hoàn tất thanh toán. |
| `BR-PAY-01` | Timeout từ nhà cung cấp là kết quả thanh toán chưa xác định cho đến khi đối soát hoàn tất; không được thông báo với client rằng thanh toán chắc chắn đã thất bại. |
| `BR-NOT-01` | Lỗi gửi thông báo không được rollback một đơn hàng đã thanh toán thành công. Các lần thử lại thông báo không được tạo thông điệp trùng lặp mà khách hàng nhìn thấy. |
| `BR-AUTH-01` | Khách hàng chỉ được xem đơn hàng của chính mình. Nhân viên hỗ trợ chỉ được xem đơn hàng trong hàng đợi được phân công. |
| `BR-AUD-01` | Thay đổi trạng thái đơn hàng, thanh toán, tồn kho, hoàn tiền và thông báo phải lưu actor/service, timestamp, correlation ID, trạng thái trước và trạng thái sau. |
| `NFR-OBS-01` | Timestamp ứng dụng dùng UTC ISO 8601 với độ chính xác mili giây. Mọi external request phải trả về hoặc ghi nhận correlation ID. |
| `NFR-SEC-01` | Log không được chứa mật khẩu, access token, số thẻ đầy đủ, CVV hoặc dữ liệu cá nhân không cần thiết. |

### 5.3 Hợp đồng API rút gọn

#### `POST /orders`

Header request bắt buộc:

| Header | Ràng buộc |
|---|---|
| `Authorization` | Bearer token kiểm thử hợp lệ của khách hàng tổng hợp đang hoạt động |
| `Content-Type` | `application/json` |
| `Idempotency-Key` | UUID; chỉ dùng lại theo hợp đồng idempotency |
| `X-Correlation-ID` | UUID; được tạo bởi client hoặc gateway |

Request body:

```json
{
  "customerId": "c8ec6e49-a8c2-4a55-88ce-50127e2f21a1",
  "items": [
    {"sku": "SKU-RED-01", "quantity": 2}
  ],
  "paymentMethod": "CARD"
}
```

Các ràng buộc request đã xác nhận:

- `customerId` là UUID bắt buộc và phải khớp với khách hàng đã xác thực.
- `items` chứa 1–20 SKU không trùng lặp.
- `quantity` là số nguyên từ 1 đến 10, tính cả hai đầu.
- `paymentMethod` là `CARD` hoặc `WALLET`.
- Các trường JSON không xác định bị từ chối.

Response được mô tả:

| Điều kiện | Trạng thái | Bằng chứng response bắt buộc |
|---|---:|---|
| Đơn hàng được chấp nhận và thanh toán hoàn tất | `201` | `orderId`, `status=PAID`, `amount`, `currency`, `correlationId` |
| Request được chấp nhận nhưng kết quả thanh toán chờ đối soát | `202` | `orderId`, `status=PAYMENT_PENDING`, `correlationId`, `statusUrl` |
| Xác thực request thất bại | `400` | `code` ổn định, `message` an toàn, `details` theo trường, `correlationId` |
| Thiếu hoặc không hợp lệ xác thực | `401` | `code` ổn định, `message` an toàn, `correlationId` |
| Khách hàng cố dùng danh tính của khách hàng khác | `403` | `code` ổn định, `message` an toàn, `correlationId` |
| SKU không tồn tại | `404` | `code` ổn định, `message` an toàn, `correlationId` |
| Cùng idempotency key được dùng lại với payload khác | Không quy định | Học viên phải nêu câu hỏi làm rõ; AI không được tự suy diễn trạng thái hoặc hành vi. |
| Lỗi nội bộ không mong đợi | `500` | Thông điệp chung an toàn và `correlationId`; không có stack trace hoặc bí mật |

#### `GET /orders/{orderId}`

- Trả về `200` cùng resource đơn hàng khi người gọi được phân quyền.
- Trả về `404` khi đơn hàng không tồn tại.
- Hành vi liên khách hàng được cố ý không quy định là `403` hay `404`; học viên phải kiểm thử lộ lọt thông tin và nêu câu hỏi về trạng thái kỳ vọng.
- Response gồm `orderId`, `customerId`, `status`, `items`, `paymentStatus`, `createdAt` và `updatedAt`.

### 5.4 Lỗi mồi và gói bằng chứng

Giảng viên cung cấp quan sát này sau một lượt kiểm thử được kiểm soát:

> Trên mobile build `4.8.2-rc3` ở staging, khách hàng gửi một đơn hàng. Ứng dụng hiển thị “Payment failed. Try again.” Khách hàng nhấn Try again một lần. Hai khoản thu thẻ xuất hiện trong provider stub, trong khi Order API hiển thị một đơn hàng đã thanh toán.

Bối cảnh kiểm thử:

| Trường | Giá trị |
|---|---|
| Môi trường | `staging-ap-southeast` |
| Mobile build | `4.8.2-rc3` |
| API build | `order-api 2026.09.08.7` |
| Tài khoản kiểm thử | khách hàng tổng hợp `CUST-SYN-1042` |
| Correlation ID client lần đầu | `corr-7a01` |
| Correlation ID client khi retry | `corr-7a02` |
| Idempotency key dùng ở request đầu | `idem-b91f` |
| Idempotency key dùng ở request retry | `idem-c44a` |
| Múi giờ thiết bị | `Asia/Ho_Chi_Minh` (`UTC+07:00`) |
| Lần gửi đầu trong screen recording | `14:03:18.420 +07:00` |
| Lần retry trong screen recording | `14:03:22.980 +07:00` |

Bằng chứng API được chọn:

```http
POST /orders HTTP/1.1
Idempotency-Key: idem-b91f
X-Correlation-ID: corr-7a01

HTTP/1.1 504 Gateway Timeout
X-Correlation-ID: corr-7a01
Content-Type: application/json

{"code":"GATEWAY_TIMEOUT","message":"Payment service timed out","correlationId":"corr-7a01"}
```

```http
POST /orders HTTP/1.1
Idempotency-Key: idem-c44a
X-Correlation-ID: corr-7a02

HTTP/1.1 201 Created
X-Correlation-ID: corr-7a02
Content-Type: application/json

{"orderId":"ORD-90017","status":"PAID","amount":240000,"currency":"VND","correlationId":"corr-7a02"}
```

Log chuẩn hóa được chọn:

```text
2026-09-09T07:03:18.501Z INFO  gateway      corr=corr-7a01 request=gw-1101 POST /orders start
2026-09-09T07:03:18.540Z INFO  order-svc    corr=corr-7a01 order=ORD-90017 idem=idem-b91f state=PAYMENT_PENDING
2026-09-09T07:03:18.604Z INFO  payment-adpt corr=corr-7a01 payment=PAY-701 provider_request=pr-881 attempt=1 sent
2026-09-09T07:03:21.605Z WARN  payment-adpt corr=corr-7a01 payment=PAY-701 provider_request=pr-881 timeout_ms=3000
2026-09-09T07:03:21.612Z ERROR gateway      corr=corr-7a01 request=gw-1101 status=504 duration_ms=3111
2026-09-09T07:03:22.430Z INFO  payment-adpt corr=corr-7a01 payment=PAY-701 provider_event=pe-551 status=CAPTURED
2026-09-09T07:03:23.020Z INFO  gateway      corr=corr-7a02 request=gw-1102 POST /orders start
2026-09-09T07:03:23.055Z INFO  order-svc    corr=corr-7a02 order=ORD-90017 idem=idem-c44a state=PAYMENT_PENDING
2026-09-09T07:03:23.101Z INFO  payment-adpt corr=corr-7a02 payment=PAY-702 provider_request=pr-882 attempt=1 sent
2026-09-09T07:03:23.480Z INFO  payment-adpt corr=corr-7a02 payment=PAY-702 provider_event=pe-552 status=CAPTURED
2026-09-09T07:03:23.525Z INFO  order-svc    corr=corr-7a02 order=ORD-90017 previous=PAYMENT_PENDING state=PAID
2026-09-09T07:03:23.550Z INFO  gateway      corr=corr-7a02 request=gw-1102 status=201 duration_ms=530
```

Bằng chứng từ provider stub:

| Sự kiện nhà cung cấp | Request nhà cung cấp | Số tiền | Trạng thái | Thời điểm ghi nhận UTC |
|---|---|---:|---|---|
| `pe-551` | `pr-881` | VND 240,000 | `CAPTURED` | `2026-09-09T07:03:22.426Z` |
| `pe-552` | `pr-882` | VND 240,000 | `CAPTURED` | `2026-09-09T07:03:23.476Z` |

Gói này chứng minh đã có hai lần capture và mobile retry đã dùng idempotency key mới. Riêng nó **không** chứng minh thành phần nào sở hữu lỗi, vì sao ứng dụng tạo key mới, hoặc liệu một kiểm soát server-side độc lập thứ hai có cần ngăn lần capture thứ hai hay không. Những điều đó vẫn là giả thuyết cho đến khi được điều tra.

### 5.5 Mở rộng do giảng viên kiểm soát

Chỉ đưa các tập bằng chứng này sau khi học viên hoàn thành trigger hoặc phân tích ban đầu liên quan:

| Phần mở rộng | Trigger | Bằng chứng được công bố |
|---|---|---|
| `EXT-01` | Chỉ tìm theo order ID | Log Payment Adapter thiếu order ID tại sự kiện timeout; cần correlation ID để dựng lại lần thử đầu. |
| `EXT-02` | Chuyển mọi timestamp về UTC | UI, API, provider và log khớp nhau trong sai số đồng hồ dự kiến; khoảng cách bảy giờ biểu kiến là lỗi múi giờ. |
| `EXT-03` | Kiểm thử thanh toán thất bại sau khi đã reserve tồn kho | Tồn kho vẫn được giữ sau 16 phút và không xuất hiện sự kiện release. |
| `EXT-04` | Kiểm thử lỗi notification provider | Đơn hàng vẫn paid, nhưng hai thông điệp đã gửi có cùng business event ID. |
| `EXT-05` | Kiểm thử truy cập đơn hàng liên khách hàng | API trả về tóm tắt đơn hàng của khách hàng khác với `200`; điều hướng UI không để lộ liên kết. |
| `EXT-06` | Kiểm tra xử lý payload không đúng định dạng | API trả về `500` và Java stack trace khi `items` là object thay vì array. |

Không đưa các kết quả chỉ dành cho giảng viên vào tài liệu phát cho học viên trước khi chúng được công bố.

## 6. Mô hình bằng chứng và độ tin cậy

Mọi sản phẩm của khóa học dùng các nhóm sau:

| Nhóm | Ý nghĩa | Phát biểu được phép |
|---|---|---|
| `FACT-SOURCE` | Được nêu trực tiếp trong requirement, rule, contract hoặc runbook đã phê duyệt | “`BR-IDEM-01` yêu cầu…” |
| `FACT-OBSERVED` | Được quan sát trực tiếp trong lượt kiểm thử có kiểm soát hoặc bằng chứng đã thu thập | “Provider stub ghi nhận hai lần capture.” |
| `INFERENCE` | Diễn giải có lập luận, được hỗ trợ bởi một hoặc nhiều sự thật | “Luồng retry có thể bỏ qua việc tái sử dụng key.” |
| `HYPOTHESIS` | Cách giải thích có thể kiểm thử nhưng chưa xác nhận | “Mobile client tạo một key mỗi lần nhấn.” |
| `CONTRADICTED` | Khẳng định không nhất quán với bằng chứng đáng tin cậy hiện có | “Thanh toán đầu tiên thất bại” bị mâu thuẫn bởi `pe-551`. |
| `UNKNOWN` | Thông tin chưa được cung cấp hoặc chưa được quan sát | “Chưa quy định ownership của vòng đời idempotency key.” |

Nhãn độ tin cậy truyền đạt sức mạnh của bằng chứng, không phải mức độ chắc chắn cá nhân:

- **Đã xác nhận:** Được hỗ trợ trực tiếp bởi bằng chứng đáng tin cậy hoặc tái lập có kiểm soát.
- **Được hỗ trợ mạnh:** Nhiều nguồn bằng chứng độc lập đồng thuận, nhưng vẫn thiếu một kiểm tra quyết định.
- **Có thể:** Hợp lý và có thể kiểm thử với bằng chứng hỗ trợ còn hạn chế.
- **Yếu:** Mang tính suy đoán, dựa trên phép tương tự hoặc thiếu bằng chứng phân biệt.
- **Loại trừ đối với lượt chạy này:** Bị mâu thuẫn bởi bằng chứng đã thu thập cho lần xảy ra đang điều tra.

## 7. Thỏa thuận làm việc với AI có trách nhiệm

Các quy tắc sau áp dụng trong mọi học phần:

- Không gửi log production, credential, access token, session cookie, dữ liệu thanh toán, dữ liệu cá nhân hoặc source code độc quyền tới dịch vụ AI chưa được phê duyệt.
- Che giấu hoặc tổng hợp các trường nhạy cảm trước khi dùng AI, chỉ giữ cấu trúc cần cho phân tích.
- Coi đầu ra AI là bản nháp, đề xuất mẫu hoặc giả thuyết — không phải bằng chứng thực thi hay chứng minh nguyên nhân gốc.
- Cung cấp cho AI gói nguồn có giới hạn và yêu cầu evidence ID hoặc trường được cung cấp chính xác cho các khẳng định quan trọng.
- Yêu cầu `Not specified` hoặc `Insufficient evidence` khi nguồn không hỗ trợ câu trả lời.
- Lưu facts, observations, inferences, hypotheses, questions và recommendations ở các trường riêng biệt.
- Khi khả thi, kiểm chứng số lượng, chuyển đổi timestamp, xác thực schema và mối tương quan bằng công cụ xác định.
- Ghi lại tool/model, phiên bản prompt, phiên bản tập nguồn, phương pháp redaction, người review và quyết định xử lý khi đầu ra AI đi vào sản phẩm chính thức.
- Một người cụ thể chịu trách nhiệm gửi defect, xác nhận severity, ưu tiên, nguyên nhân gốc, kết luận kiểm thử và khuyến nghị phát hành.

---

# Học phần 1 — Báo cáo lỗi chất lượng cao với hỗ trợ AI

**Thời lượng:** 8 giờ  
**Mục tiêu học phần:** Chuyển quan sát kiểm thử thô thành báo cáo lỗi ngắn gọn, tái lập được, giàu bằng chứng; dùng AI để nâng cao tính rõ ràng và đầy đủ mà không bịa đặt sự thật.

## Kết quả học tập

Sau học phần này, học viên có thể:

- Phân biệt lỗi đã xác nhận, lỗi nghi ngờ, câu hỏi về requirement, vấn đề môi trường và vấn đề dữ liệu kiểm thử.
- Viết tiêu đề và tóm tắt lỗi nêu rõ hành vi bị ảnh hưởng, điều kiện và tác động.
- Ghi nhận các bước tái lập xác định, kết quả kỳ vọng, kết quả thực tế, tần suất, môi trường và bằng chứng.
- Gán severity theo tác động nghiệp vụ và kỹ thuật, đồng thời tách severity khỏi priority theo lịch triển khai.
- Dùng AI để phản biện và tinh chỉnh báo cáo trong khi vẫn giữ nguyên quan sát ban đầu và mức độ bất định.

## Phân bổ phiên học

### Phiên 1.1 — Điều gì khiến báo cáo lỗi có thể xử lý? (2 giờ)

- Mục đích của báo cáo lỗi: truyền đạt khác biệt có thể kiểm chứng được giữa hành vi kỳ vọng và quan sát.
- Bằng chứng tối thiểu để gọi một việc là lỗi:
  - Oracle đã phê duyệt hoặc hành vi kỳ vọng được trích dẫn rõ ràng.
  - Hành vi quan sát được từ build và môi trường đã xác định.
  - Luồng tái lập hoặc đủ bằng chứng để điều tra một lần xảy ra không tái lập được.
- Phân biệt defect với enhancement, câu hỏi hỗ trợ, bản ghi trùng lặp, vấn đề cấu hình, vấn đề dữ liệu và giới hạn đã biết.
- Cấu tạo của một báo cáo tốt:
  - Tiêu đề ổn định, có thể tìm kiếm.
  - Tóm tắt ngắn theo định hướng tác động.
  - Môi trường, build, vai trò, dữ liệu kiểm thử và điều kiện tiên quyết.
  - Các bước hành động được đánh số, kèm dữ liệu đầu vào.
  - Kết quả kỳ vọng và thực tế ở cùng mức độ chi tiết.
  - Khả năng tái lập, tần suất, phạm vi, trạng thái regression và workaround.
  - Tham chiếu bằng chứng và các bản ghi liên quan.
- Anti-pattern phổ biến: tiêu đề mơ hồ, điều kiện tiên quyết ẩn, ảnh chụp không có ngữ cảnh, kết luận nằm trong actual result và log sao chép có bí mật.

**Thực hành:** Phân loại mười ticket mẫu thành defect có thể xử lý, cần làm rõ, vấn đề môi trường hoặc bằng chứng không đủ.

### Phiên 1.2 — Tái lập, bằng chứng, severity và priority (2 giờ)

- Các chiều tái lập: vai trò người dùng, trạng thái, dữ liệu, kênh, build, cấu hình, locale, mạng, đồng thời và hành vi phụ thuộc.
- Thu thập cách tái lập đáng tin cậy nhỏ nhất mà không xóa bối cảnh liên quan.
- Chọn bằng chứng từ screen recording, request/response, console output, log, trace ID, kiểm tra database và provider stub.
- Các chiều severity: tác động khách hàng, tài chính, tính toàn vẹn dữ liệu, bảo mật/quyền riêng tư, tuân thủ, tính sẵn sàng, khả năng khôi phục và phạm vi ảnh hưởng.
- Priority là quyết định lập lịch nghiệp vụ chịu ảnh hưởng bởi severity, tần suất, mức độ phơi lộ, workaround, thời điểm phát hành và tầm quan trọng chiến lược.
- Tránh độ chính xác giả tạo khi chưa biết tần suất hoặc tập người bị ảnh hưởng.

**Workshop:** Đánh giá quan sát charge trùng và bảo vệ severity bằng bằng chứng đã cho; ghi lại thông tin còn thiếu để xác lập priority.

### Phiên 1.3 — Soạn thảo và review defect có AI hỗ trợ (2 giờ)

- Chuẩn bị input an toàn: redaction, tối giản, gắn nhãn và lập phiên bản cho gói nguồn.
- Tác vụ AI hữu ích:
  - Xác định các trường báo cáo còn thiếu.
  - Viết lại tiêu đề để dễ tìm kiếm.
  - Chuyển ghi chú không cấu trúc thành bản nháp theo template.
  - Phát hiện mâu thuẫn giữa bước thực hiện, expected result và actual result.
  - Đề xuất bằng chứng cần thu thập hoặc biến tái lập cần cô lập.
- Kiểm soát prompt bắt buộc:
  - Chỉ dùng sự thật được cung cấp.
  - Giữ nguyên chính xác mọi định danh.
  - Không khẳng định nguyên nhân gốc.
  - Gắn dữ liệu thiếu là `Not provided`.
  - Giải thích mọi chỉnh sửa quan trọng.
- Con người đối chiếu bằng chứng gốc, bản nháp AI và báo cáo cuối cùng đã phê duyệt.

**Demo:** So sánh prompt chung chung “write a bug” với prompt review bị giới hạn bằng chứng và xác định các chi tiết bị bịa.

### Phiên 1.4 — Trao đổi sẵn sàng cho triage và cổng chất lượng defect (2 giờ)

- Thiết kế tiêu đề cho danh sách hiển thị và tìm kiếm trùng lặp.
- Tách triệu chứng khách hàng nhìn thấy, bằng chứng kỹ thuật và ghi chú điều tra.
- Liên kết incident, test, requirement, build và telemetry liên quan mà không tạo một danh sách link lộn xộn.
- Báo cáo trung thực các defect gián đoạn và không tái lập được.
- Vòng đời defect: draft, review, triage, assign, resolve, retest, reopen, close.
- Cổng chất lượng trước khi gửi và bằng chứng retest sau khi sửa.

**Hoạt động đánh giá:** Tạo và peer-review báo cáo defect hoàn chỉnh cho case charge trùng mồi.

## Sản phẩm bàn giao của học phần

**Gói Bằng chứng Defect đã được AI review**, gồm:

- Báo cáo defect cuối cùng có defect ID ổn định.
- Trích dẫn hành vi kỳ vọng và tham chiếu quan sát.
- Ma trận tái lập thể hiện điều kiện đã xác nhận và chưa kiểm thử.
- Lý do severity và đầu vào priority.
- Chỉ mục bằng chứng có kiểm tra quyền riêng tư/redaction.
- Log review prompt/đầu ra AI liệt kê đề xuất được chấp nhận, chỉnh sửa và từ chối.

## Tiêu chí chất lượng

- Một tester khác có thể tái lập hoặc điều tra lần xảy ra mà không cần giải thích bằng lời.
- Hành vi kỳ vọng và thực tế có thể so sánh trực tiếp và được bằng chứng hỗ trợ.
- Tiêu đề nêu triệu chứng và điều kiện mà không khẳng định nguyên nhân chưa xác nhận.
- Lý do severity phản ánh tác động; tác giả không tự bịa priority.
- Mọi bằng chứng đều truy vết được, vừa đủ và không chứa dữ liệu bị cấm.
- Phần AI bổ sung không được nguồn hỗ trợ đã bị xóa hoặc gắn nhãn là câu hỏi.

## Bài tập đánh giá Học phần 1 — Báo cáo charge trùng sẵn sàng cho triage

**Mã bài tập:** `EX-U1-DEFECT`  
**Hình thức:** Bản nháp cá nhân có peer review  
**Thời gian dành cho học viên:** 150 phút  
**Điểm đánh giá:** 10 điểm khóa học

### Hướng dẫn

1. Review các business rule đã phê duyệt, quan sát, bằng chứng HTTP, log và sự kiện provider.
2. Thiết lập hành vi kỳ vọng bằng evidence ID; không dùng chỉ “lẽ thường” làm oracle.
3. Tạo luồng tái lập và xác định điều kiện tiên quyết nào đã xác nhận, giả định hoặc chưa được cung cấp.
4. Viết báo cáo defect gồm tiêu đề, tóm tắt, môi trường, bước thực hiện, expected result, actual result, tần suất, tác động, bằng chứng và câu hỏi mở.
5. Đề xuất severity có lý do và liệt kê input nghiệp vụ còn thiếu để thiết lập priority.
6. Yêu cầu AI phản biện tính đầy đủ và rõ ràng chỉ với gói đã cung cấp. Review mọi đề xuất và giữ decision log.
7. Thực hiện quét quyền riêng tư và bí mật trước khi nộp.

### Rubric chấm điểm

| Tiêu chí | Điểm | Bằng chứng đạt điểm tối đa |
|---|---:|---|
| Oracle và độ chính xác sự thật | 2.0 | Hành vi kỳ vọng và sự thật quan sát trích dẫn bằng chứng đã phê duyệt; không bịa hành vi |
| Khả năng tái lập và môi trường | 2.0 | Bước, dữ liệu, build, trạng thái và biến thiên sẵn sàng cho điều tra |
| Độ rõ ràng expected/actual | 2.0 | Khác biệt và tác động chính xác, có thể so sánh trực tiếp |
| Chất lượng và an toàn bằng chứng | 1.5 | Bằng chứng được lập chỉ mục, đủ, dễ đọc và redaction an toàn |
| Severity và tính hữu ích cho triage | 1.5 | Các chiều tác động có lý do và đầu vào priority còn tường minh |
| Kỷ luật review AI | 1.0 | Đề xuất được chấp nhận, chỉnh sửa và từ chối có thể kiểm toán |

**Điểm trần nghiêm trọng:** Bịa cách tái lập, expected result, sự kiện log hoặc tác động khách hàng sẽ giới hạn bài tập ở 5/10.

---

# Học phần 2 — Tạo giả thuyết nguyên nhân gốc với ranh giới bằng chứng

**Thời lượng:** 8 giờ  
**Mục tiêu học phần:** Tạo, ưu tiên và kiểm thử các giả thuyết nguyên nhân gốc hợp lý trong khi giữ ranh giới giữa bằng chứng đã quan sát và giải thích chưa được xác thực.

## Kết quả học tập

Sau học phần này, học viên có thể:

- Xây dựng timeline bằng chứng trước khi đề xuất nguyên nhân.
- Phân biệt triệu chứng, điều kiện góp phần, cơ chế, nguyên nhân gốc và hành động khắc phục.
- Tạo các giả thuyết cạnh tranh trên các tầng client, gateway, service, dependency, data, configuration và observability.
- Xếp hạng giả thuyết bằng bằng chứng hỗ trợ, mâu thuẫn và còn thiếu thay vì chỉ dựa vào tính hợp lý.
- Thiết kế các kiểm tra phân biệt có thể củng cố, làm yếu hoặc loại trừ giả thuyết.
- Dùng AI để mở rộng và thách thức giả thuyết mà ngăn chặn việc kể chuyện nhân quả đầy tự tin.

## Phân bổ phiên học

### Phiên 2.1 — Từ triệu chứng đến câu hỏi nhân quả (2 giờ)

- Vì sao “nơi lỗi xuất hiện” không nhất thiết là “nơi defect bắt nguồn”.
- Các lớp nhân quả: trigger, cơ chế, thất bại, khoảng trống phát hiện, khoảng trống containment và tác động.
- Phân tích ưu tiên timeline: chuẩn hóa thời gian, sắp xếp bằng chứng, xác định actor, chuyển trạng thái và khoảng trống.
- Nguyên nhân gốc so với yếu tố góp phần và điểm yếu kiểm soát tiềm ẩn.
- Khung điều tra: Five Whys, fault tree, fishbone, phân tích state machine và phân tích thay đổi.
- Khi không nên phân tích nguyên nhân gốc: bằng chứng không đủ, không tiếp cận được hệ thống hoặc oracle chưa được giải quyết.

**Thực hành:** Chuyển năm phát biểu mang tính đổ lỗi thành câu hỏi nhân quả trung lập.

### Phiên 2.2 — Tạo giả thuyết trong phạm vi bằng chứng (2 giờ)

- Cấu trúc giả thuyết:
  - Cơ chế được đề xuất.
  - Phạm vi và điều kiện tiên quyết.
  - Bằng chứng hỗ trợ.
  - Bằng chứng mâu thuẫn.
  - Quan sát dự kiến nếu đúng.
  - Kiểm tra phân biệt tiếp theo.
- Tạo giả thuyết xuyên các tầng mà không thu hẹp phạm vi quá sớm.
- Bằng chứng âm tính: điều lẽ ra phải hiện diện nhưng không có, và khi nào sự vắng mặt không đáng tin.
- Tương quan so với nhân quả, survivorship bias, confirmation bias và lập luận post hoc.
- Nhãn độ tin cậy và quy tắc cập nhật tường minh.

**Workshop:** Tạo ít nhất sáu giả thuyết cạnh tranh cho case charge trùng và loại bỏ các giả thuyết trùng lặp bị che bởi cách diễn đạt.

### Phiên 2.3 — AI là công cụ tạo giả thuyết và reviewer đối kháng (2 giờ)

- Cung cấp cho AI kiến trúc, timeline, thay đổi đã biết và độ tin cậy của bằng chứng.
- Yêu cầu AI đưa ra lựa chọn thay thế, phản bằng chứng, telemetry còn thiếu và kiểm tra phủ định.
- Ngăn vượt quá phạm vi:
  - Không hỏi “Nguyên nhân gốc là gì?” trước khi có review bằng chứng bị giới hạn.
  - Yêu cầu trích dẫn hoặc evidence ID từ gói đã cung cấp.
  - Cấm bịa code path, cấu hình hạ tầng và incident lịch sử.
  - Yêu cầu ít nhất một cách giải thích thay thế.
- Phát hiện các failure mode của AI: tường thuật tự tin, đổ lỗi thành phần, nhảy cóc nhân quả, bỏ qua mâu thuẫn và thêm best practice chung chung.

**Demo:** Thách thức khẳng định do AI tạo rằng “payment provider đã retry request” bằng provider request ID và các sự kiện đã capture.

### Phiên 2.4 — Lập kế hoạch điều tra và độ tin cậy nhân quả (2 giờ)

- Ưu tiên kiểm tra tiếp theo theo information gain, an toàn, chi phí, khả năng đảo ngược và quyền truy cập.
- Thiết kế thử nghiệm phân biệt thay vì thu thập thêm log không định hướng.
- Cập nhật ma trận giả thuyết khi có bằng chứng mới.
- Tiêu chí xác nhận nguyên nhân:
  - Tái lập trong điều kiện được kiểm soát.
  - Cơ chế thấy được trong code/cấu hình hoặc hành vi xác định.
  - Bản sửa hoặc loại bỏ có kiểm soát triệt tiêu lỗi mà không có bằng chứng mâu thuẫn.
- Viết ghi chú điều tra tạm thời khi chưa thể xác nhận.

**Hoạt động đánh giá:** Tạo ma trận giả thuyết và kế hoạch điều tra, sau đó cập nhật khi giảng viên công bố một phần mở rộng.

## Sản phẩm bàn giao của học phần

**Gói Điều tra Nguyên nhân gốc trong phạm vi Bằng chứng**, gồm:

- Timeline sự kiện đã chuẩn hóa.
- Sổ đăng ký fact, inference, unknown và contradiction.
- Ma trận giả thuyết cạnh tranh.
- Các kiểm tra phân biệt được ưu tiên cùng kết quả dự kiến.
- Độ tin cậy cập nhật sau bằng chứng mới.
- Kết luận tạm thời nêu rõ điều gì đã và chưa được xác nhận.
- Log thử thách AI và review của con người.

## Tiêu chí chất lượng

- Mọi giả thuyết đều kiểm thử được và gắn với bằng chứng.
- Ít nhất một giả thuyết thay thế có ý nghĩa còn tồn tại cho đến khi bị bằng chứng loại trừ.
- Không dùng lại bằng chứng hỗ trợ như chứng minh cho điều nó chỉ gợi ý.
- Kiểm tra tiếp theo phải phân biệt các giả thuyết thay vì chỉ thu thập thêm dữ liệu.
- Kết luận không vượt quá bằng chứng hiện có.
- Không gán ownership thành phần hay hành động khắc phục từ suy đoán.

## Bài tập đánh giá Học phần 2 — Ma trận giả thuyết và kế hoạch phủ định

**Mã bài tập:** `EX-U2-RCA`  
**Hình thức:** Làm theo cặp, bảo vệ cá nhân  
**Thời gian dành cho học viên:** 180 phút  
**Điểm đánh giá:** 10 điểm khóa học

### Ma trận giả thuyết bắt buộc

| Mã giả thuyết | Cơ chế đề xuất | Bằng chứng hỗ trợ | Bằng chứng mâu thuẫn | Bằng chứng còn thiếu | Độ tin cậy | Kiểm tra phân biệt | Kết quả dự kiến nếu đúng |
|---|---|---|---|---|---|---|---|

### Tiêu chuẩn hoàn thành tối thiểu

- Timeline đã chuẩn hóa UTC bao gồm cả hai lần thử của client, response gateway, sự kiện thanh toán và thay đổi trạng thái.
- Ít nhất sáu giả thuyết không trùng lặp bao phủ ba tầng hệ thống trở lên.
- Mỗi giả thuyết gồm một kiểm tra có thể làm yếu hoặc loại trừ nó.
- Ít nhất một giả thuyết hợp lý được hạ mức sau bằng chứng mâu thuẫn.
- Ghi chú cuối tách trigger ngay lập tức, cơ chế có thể, khoảng trống kiểm soát góp phần và fact đã xác nhận.

### Rubric chấm điểm

| Tiêu chí | Điểm | Bằng chứng đạt điểm tối đa |
|---|---:|---|
| Timeline và phân loại bằng chứng | 2.0 | Sự kiện được chuẩn hóa, sắp xếp, nêu nguồn và gắn nhãn độ tin cậy |
| Độ rộng và chất lượng giả thuyết | 2.0 | Các phương án thay thế có tính nhân quả, khác biệt, có phạm vi và kiểm thử được |
| Kiểm soát mâu thuẫn và thiên kiến | 2.0 | Phân tích chủ động tìm bằng chứng phản chứng |
| Kế hoạch điều tra phân biệt | 2.0 | Kiểm tra tối đa information gain và có kết quả dự đoán |
| Kết luận tạm thời | 1.0 | Ngôn ngữ không vượt ranh giới bằng chứng |
| Nguồn gốc AI và phán đoán con người | 1.0 | Đề xuất AI và quyết định của reviewer được ghi lại |

**Điểm trần nghiêm trọng:** Báo cáo giả thuyết do AI tạo như nguyên nhân gốc đã xác nhận mà không có bằng chứng xác thực sẽ giới hạn bài tập ở 5/10.

---

# Học phần 3 — Phân tích log: mẫu, bất thường, timestamp và correlation ID

**Thời lượng:** 8 giờ  
**Mục tiêu học phần:** Chuyển dữ liệu log nhiễu từ nhiều dịch vụ thành timeline sự kiện đáng tin cậy, đồng thời nhận diện mẫu và bất thường mà không mất ngữ cảnh hoặc làm lộ thông tin nhạy cảm.

## Kết quả học tập

Sau học phần này, học viên có thể:

- Đánh giá nguồn log, cấu trúc, độ đầy đủ, thời hạn lưu, đồng hồ và độ tin cậy trước khi phân tích.
- Parse các sự kiện có cấu trúc và bán cấu trúc thành trường dữ liệu nhất quán.
- Chuẩn hóa múi giờ và suy luận về độ lệch đồng hồ, thời lượng và thứ tự sự kiện.
- Lần theo một giao dịch xuyên dịch vụ bằng correlation ID, request ID, order ID, payment ID và business-event ID.
- Nhận diện mẫu, outlier, sự kiện thiếu, vòng lặp retry, bất thường chuyển trạng thái và rò rỉ dữ liệu nhạy cảm.
- Dùng AI để đề xuất cách parse và clustering, trong khi kiểm chứng kết quả một cách xác định.

## Phân bổ phiên học

### Phiên 3.1 — Hiểu biết về log và độ tin cậy của bằng chứng (2 giờ)

- Cấu tạo log: timestamp, severity, service, environment, instance, event name, request ID, correlation ID, entity ID, duration, status và message.
- Log JSON có cấu trúc so với log dạng văn bản tự do.
- Thời điểm sự kiện so với thời điểm ingest và thời điểm xử lý.
- Câu hỏi về độ tin cậy: sampling, truncation, buffering, phân phối bất đồng bộ, retention, redaction và thiếu dịch vụ.
- Ngữ nghĩa severity và vì sao `ERROR` không tự động đồng nghĩa với product defect.
- Thiết lập cửa sổ tìm kiếm và mẫu đối chứng.

**Thực hành:** Đánh giá một tập log hỗn hợp và xác định trường nào có thể, hoặc không thể, tin cậy để sắp xếp hay liên kết.

### Phiên 3.2 — Timestamp, thứ tự và timeline phân tán (2 giờ)

- Chuẩn hóa UTC và offset ISO 8601.
- Mili giây so với giây, định dạng 12 giờ so với 24 giờ và timestamp phụ thuộc locale.
- Clock skew và vì sao timestamp đã sắp xếp có thể không phản ánh thứ tự nhân quả.
- Tính thời lượng và diễn giải percentile.
- Lời gọi đồng bộ, sự kiện bất đồng bộ, queue, callback và eventual consistency.
- Mở rộng cửa sổ thời gian để lấy bằng chứng upstream và downstream.

**Lab:** Chuyển timestamp mobile từ `UTC+07:00` sang UTC, gộp chúng với log hệ thống và sự kiện provider, rồi tính các khoảng thời gian quan trọng.

### Phiên 3.3 — Correlation ID và dựng lại luồng xuyên dịch vụ (2 giờ)

- Correlation ID, trace ID, span ID, request ID, session ID, entity ID, idempotency key và business-event ID.
- Quan hệ một-nhiều và nhiều-một qua retry và luồng bất đồng bộ.
- Truyền correlation qua gateway, service, queue, callback và provider bên ngoài.
- Chiến lược pivot khi thiếu một trường: correlation ID → provider request → payment → order → tham chiếu tổng hợp an toàn cho khách hàng.
- Phát hiện collision, regeneration, reuse và broken propagation.
- Xây dựng đồ thị bằng chứng giao dịch thay vì phụ thuộc vào một từ khóa tìm kiếm.

**Workshop:** Dựng lại cả hai lần thanh toán và chỉ ra vì sao chỉ tìm bằng `ORD-90017` hoặc chỉ bằng `corr-7a02` là chưa đủ.

### Phiên 3.4 — Mẫu, bất thường và review log có AI hỗ trợ (2 giờ)

- Phân tích dựa trên baseline: so sánh lượt lỗi với control thành công và lượt dependency failure đã biết.
- Các mẫu hữu ích:
  - Chữ ký lỗi lặp lại.
  - Đợt retry dồn dập và vi phạm backoff.
  - Dịch chuyển latency và cụm timeout.
  - Thiếu chuyển trạng thái kỳ vọng.
  - Trình tự trạng thái bất khả thi hoặc không hợp lệ.
  - Tăng vọt cardinality và tổ hợp hiếm.
  - Khoảng trống correlation và sự kiện mồ côi.
- Ứng dụng AI: trích xuất trường, nhóm ứng viên, phác thảo timeline, gợi ý query và giải thích bất thường.
- Kiểm chứng xác định: số lượng đầu ra parser, chuyển đổi timestamp, join, filter và kiểm tra schema.
- Review quyền riêng tư log và xác minh redaction.

**Hoạt động đánh giá:** Phân tích một batch hỗn hợp chứa failure, giao dịch control, nhiễu, một dòng lỗi định dạng và một mẫu bí mật tổng hợp cố ý bị lộ.

## Sản phẩm bàn giao của học phần

**Báo cáo Phân tích Log có Tương quan**, gồm:

- Danh mục nguồn và ghi chú độ tin cậy.
- Quy tắc parse/chuẩn hóa và số bản ghi bị từ chối.
- Timeline sự kiện UTC, vẫn giữ timestamp gốc.
- Bản đồ correlation liên kết các định danh kỹ thuật và nghiệp vụ.
- Bảng mẫu/bất thường có so sánh baseline.
- Phát hiện quyền riêng tư/bảo mật.
- Query tiếp theo hoặc khoảng trống instrumentation được khuyến nghị.
- Đề xuất do AI tạo và kết quả kiểm chứng xác định.

## Tiêu chí chất lượng

- Mọi timestamp giữ giá trị gốc và nêu cơ sở chuẩn hóa.
- Correlation dùng nhiều định danh khi cần và ghi lại broken propagation.
- Bất thường là chênh lệch với baseline, invariant hoặc trình tự sự kiện kỳ vọng được nêu rõ.
- Sự kiện thiếu được báo cáo kèm lưu ý về độ đầy đủ nguồn và sampling.
- Số lượng và join có thể tái lập bằng query hoặc script đã lưu.
- Log đưa cho AI không chứa dữ liệu bị cấm.

## Bài tập đánh giá Học phần 3 — Dựng lại giao dịch xuyên dịch vụ

**Mã bài tập:** `EX-U3-LOGS`  
**Hình thức:** Phân tích cá nhân  
**Thời gian dành cho học viên:** 180 phút  
**Điểm đánh giá:** 10 điểm khóa học

### Bảng bất thường bắt buộc

| Mã phát hiện | Mẫu/bất thường | Baseline hoặc invariant | Bằng chứng/query | Phạm vi/số lượng | Diễn giải | Độ tin cậy | Kiểm tra tiếp theo |
|---|---|---|---|---:|---|---|---|

### Tiêu chuẩn hoàn thành tối thiểu

- Parse ít nhất 95% bản ghi hợp lệ được cung cấp và báo cáo riêng các dòng lỗi định dạng/bị từ chối.
- Chuẩn hóa mọi timestamp có thể parse về UTC mà không mất giá trị gốc.
- Dựng lại luồng lần đầu và retry qua bằng chứng gateway, order, payment và provider.
- Xác định ít nhất bốn bất thường có ý nghĩa, gồm vấn đề truyền định danh và vấn đề trạng thái/thời gian.
- Xác định mẫu giá trị nhạy cảm được cài sẵn và giải thích cách xử lý an toàn.
- Xác minh số lượng, chuyển đổi và correlation do AI đề xuất bằng query hoặc script xác định.

### Rubric chấm điểm

| Tiêu chí | Điểm | Bằng chứng đạt điểm tối đa |
|---|---:|---|
| Parse và độ tin cậy nguồn | 1.5 | Quy tắc, dòng bị từ chối, giới hạn và chất lượng nguồn hiển thị rõ |
| Chuẩn hóa timestamp | 2.0 | Chuyển đổi thời gian và các khoảng thời gian chính xác, tái lập được |
| Dựng lại correlation | 2.5 | Đường đi giao dịch qua mọi dịch vụ liên quan và các nhánh retry |
| Phân tích mẫu và bất thường | 2.0 | Phát hiện dùng baseline tường minh và không khẳng định nhân quả quá mức |
| Quyền riêng tư và khoảng trống observability | 1.0 | Rò rỉ và telemetry thiếu được xử lý an toàn, hữu ích |
| Xác thực AI và nguồn gốc | 1.0 | AI hỗ trợ được review và có kiểm tra xác định đính kèm |

**Điểm trần nghiêm trọng:** Để lộ credential, token, dữ liệu cá nhân thật hoặc bí mật thanh toán trong bài nộp hay prompt AI là lỗi nghiêm trọng cho đến khi được khắc phục và điều tra.

---

# Học phần 4 — Nền tảng kiểm thử API: request, response, status, header và schema

**Thời lượng:** 8 giờ  
**Mục tiêu học phần:** Thiết lập nền tảng kiểm thử API theo contract, xác thực transport, protocol, payload, schema, hành vi nghiệp vụ và side effect có thể quan sát.

## Kết quả học tập

Sau học phần này, học viên có thể:

- Đọc một API operation như hợp đồng của method, path, authentication, header, parameter, body và response.
- Xác thực status, header, schema, giá trị, business rule và side effect ở đúng tầng.
- Tách contract check khỏi business-flow check và kiểm tra phi chức năng.
- Xây dựng setup, cô lập dữ liệu, assertion và cleanup đáng tin cậy cho kiểm thử API.
- Nhận diện tài liệu API mơ hồ hoặc mâu thuẫn và nêu câu hỏi thay vì bịa hành vi.

## Phân bổ phiên học

### Phiên 4.1 — Cấu tạo HTTP request và input có thể kiểm soát (2 giờ)

- Base URL, scheme, host, port, path, query, method và versioning.
- Ngữ cảnh authentication và authorization.
- Header: thương lượng nội dung, correlation, idempotency, caching, conditional request và metadata tùy chỉnh.
- Path/query parameter so với request body.
- Kiểu JSON, null, thiếu, rỗng, độ chính xác số, array, encoding và Unicode.
- Tài khoản kiểm thử an toàn, provider test token, cấu hình môi trường và quản lý bí mật.

**Thực hành:** Ghi chú `POST /orders` request và xác định các chiều input có thể kiểm thử cùng giá trị không an toàn.

### Phiên 4.2 — Xác thực response vượt ngoài status code (2 giờ)

- Nhóm status code và ý nghĩa riêng của operation.
- Response header bắt buộc và bị cấm.
- Media type, encoding, truyền correlation, caching, rate limit và security header khi phù hợp.
- Xác thực schema: trường bắt buộc, kiểu, format, enum, thuộc tính bổ sung và cấu trúc có điều kiện.
- Assertion ngữ nghĩa: quan hệ giá trị, authorization, trạng thái, tính toán, thứ tự và timestamp.
- Xác thực side effect: trạng thái database, downstream call, event, reserve inventory, payment, notification và audit record.
- Error contract an toàn, không để lộ stack trace hoặc thông tin nhạy cảm.

**Lab:** Kiểm thử các response shape `201`, `202`, `400`, `401`, `403`, `404` và `500` đã mô tả bằng contract example hoặc stub.

### Phiên 4.3 — Contract, example và xung đột oracle (2 giờ)

- OpenAPI component, schema tái sử dụng, example, parameter, security scheme và response definition.
- Vì sao example không phải schema đầy đủ và schema không diễn đạt mọi business rule.
- Phát hiện mâu thuẫn giữa requirement, OpenAPI, hành vi client, implementation và legacy test.
- Phân loại kết quả: implementation defect, contract defect, requirement gap, test defect hoặc vấn đề môi trường.
- Tương thích consumer/provider và backward compatibility.
- Versioning, deprecation, tolerant reader và unknown field.

**Workshop:** Review hành vi idempotency changed-payload được cố ý không quy định và hành vi `403` so với `404` liên khách hàng; tạo câu hỏi cho stakeholder.

### Phiên 4.4 — Thiết kế và thực thi kiểm thử API có thể bảo trì (2 giờ)

- Arrange–Act–Assert–Cleanup cho kiểm thử API.
- Data builder ổn định, định danh tổng hợp duy nhất, cô lập, teardown và khả năng lặp lại.
- Chiến lược assertion: lỗi phải có bằng chứng request, response và expected-contract hữu ích nhưng đã che bí mật.
- Tách transport client, endpoint action, business workflow và specification.
- Tránh so sánh toàn bộ body dễ vỡ khi chỉ một số field/thứ tự quan trọng.
- Thu correlation ID để điều tra và liên kết kết quả API với log.

**Hoạt động đánh giá:** Cài đặt hoặc mô tả một contract test suite gọn cho `POST /orders` và `GET /orders/{orderId}`.

## Sản phẩm bàn giao của học phần

**Gói Kiểm thử Hợp đồng API**, gồm:

- Danh mục endpoint và baseline contract.
- Ma trận chiều request và header.
- Ma trận assertion response bao phủ status, header, schema, ngữ nghĩa và side effect.
- Kiểm thử dương tính và lỗi đại diện.
- Kế hoạch setup, dữ liệu kiểm thử, cô lập và cleanup an toàn.
- Sổ đăng ký khoảng trống tài liệu.
- Bằng chứng thực thi có thể tái lập với correlation ID.

## Tiêu chí chất lượng

- Mọi assertion quan trọng trong test đều trích contract hoặc rule đã phê duyệt.
- Kiểm tra chỉ status được bổ sung header, schema, ngữ nghĩa và side effect khi liên quan.
- Authentication và authorization không bị coi là một vấn đề giống nhau.
- Test cô lập, lặp lại được và an toàn khi chạy lại.
- Bằng chứng lỗi có thể xử lý nhưng không lộ bí mật hoặc stack trace.
- Hành vi chưa định nghĩa vẫn là câu hỏi làm rõ, không phải expected result do giả định.

## Bài tập đánh giá Học phần 4 — Nền tảng Order API theo contract

**Mã bài tập:** `EX-U4-API-FOUNDATION`  
**Hình thức:** Cài đặt cá nhân hoặc specification có thể thực thi  
**Thời gian dành cho học viên:** 210 phút  
**Điểm đánh giá:** 10 điểm khóa học

### Ma trận assertion bắt buộc

| Mã test | Mã nguồn | Điều kiện request | Status kỳ vọng | Kiểm tra header | Kiểm tra schema | Kiểm tra ngữ nghĩa/side effect | Cleanup |
|---|---|---|---:|---|---|---|---|

### Tiêu chuẩn hoàn thành tối thiểu

- Bao phủ luồng tạo và truy xuất thành công có bằng chứng correlation liên kết.
- Bao phủ riêng authentication thiếu/không hợp lệ và customer-identity mismatch.
- Bao phủ tối thiểu bốn failure xác thực request, mỗi failure cô lập một ràng buộc vi phạm.
- Xác thực response media type, correlation ID, trường bắt buộc, kiểu, enum và lỗi an toàn.
- Xác nhận một side effect có ý nghĩa và một side effect bị cấm.
- Ghi nhận hành vi kỳ vọng chưa quy định thành câu hỏi thay vì làm suite pass bằng giả định.

### Rubric chấm điểm

| Tiêu chí | Điểm | Bằng chứng đạt điểm tối đa |
|---|---:|---|
| Baseline contract và traceability | 1.5 | Assertion ánh xạ tới nguồn đã phê duyệt và khoảng trống tài liệu rõ ràng |
| Bao phủ request và header | 1.5 | Method, path, auth, metadata, body và input biên đều có mục đích |
| Xác thực response và schema | 2.0 | Kiểm tra status, header, cấu trúc, kiểu và an toàn lỗi |
| Ngữ nghĩa nghiệp vụ và side effect | 2.0 | Assertion xác thực trạng thái và hiệu ứng tích hợp, không chỉ shape payload |
| Cô lập, cleanup và chẩn đoán | 2.0 | Test chạy lại được và failure giữ bằng chứng hữu ích, an toàn |
| Dùng AI có trách nhiệm | 1.0 | Đề xuất AI được review theo contract và đầu ra thực thi |

**Điểm trần nghiêm trọng:** Một suite gửi credential/dữ liệu thanh toán thật tới dịch vụ AI hoặc coi response do AI tạo là kết quả đã thực thi sẽ bị đánh giá lỗi nghiêm trọng.

---

# Học phần 5 — Kịch bản kiểm thử API có AI hỗ trợ và kiểm thử âm tính

**Thời lượng:** 8 giờ  
**Mục tiêu học phần:** Dùng thiết kế kiểm thử có hệ thống và khám phá khoảng trống có AI hỗ trợ để xây dựng kịch bản API tập trung vào rủi ro, đặc biệt đi sâu vào hành vi âm tính, có trạng thái, authorization và khả năng phục hồi.

## Kết quả học tập

Sau học phần này, học viên có thể:

- Suy ra các chiều kịch bản từ API contract, business rule, kiến trúc và rủi ro vận hành.
- Áp dụng lớp tương đương, giá trị biên, bảng quyết định, chuyển trạng thái, chọn pairwise và misuse case.
- Thiết kế negative test cô lập một vi phạm có chủ đích và định nghĩa oracle mạnh.
- Kiểm thử idempotency, retry, concurrency, authorization, lỗi dependency và eventual consistency.
- Dùng AI để mở rộng coverage ứng viên và phản biện khoảng trống mà không chấp nhận case không khả thi hoặc bịa đặt.
- Ưu tiên kịch bản theo rủi ro, giá trị thông tin, chi phí và mức độ phơi lộ trên production.

## Phân bổ phiên học

### Phiên 5.1 — Tạo kịch bản có hệ thống từ nguồn bị giới hạn (2 giờ)

- Input kịch bản: operation contract, field constraint, business rule, state model, role, kiến trúc, incident và lịch sử thay đổi.
- Baseline dương tính trước biến thể âm tính.
- Lớp tương đương và biên bền vững cho quy tắc field, collection và liên trường.
- Bảng quyết định cho tổ hợp authentication, identity, stock, payment method và kết quả dependency.
- Chuyển trạng thái cho vòng đời đơn hàng và thanh toán.
- Traceability từ kịch bản tới nguồn và rủi ro.

**Thực hành:** Xây dựng scenario model cho `POST /orders` trước khi yêu cầu AI bổ sung.

### Phiên 5.2 — Kiểm thử âm tính với oracle mạnh (2 giờ)

- Nhóm âm tính:
  - Input thiếu, null, rỗng, sai kiểu, malformed, không hỗ trợ, trùng lặp và quá kích thước.
  - Giá trị ngay dưới và ngay trên biên.
  - Xung đột liên trường và chuyển trạng thái bị cấm.
  - Authentication, authorization, tenant/object ownership và lạm dụng đặc quyền.
  - Chuỗi giống injection, encoding, field không mong đợi và lộ error không an toàn.
- Cô lập vi phạm có chủ đích để failure vẫn chẩn đoán được.
- Các chiều oracle âm tính: status, code, message an toàn, details, correlation ID, không mutation trạng thái, không downstream call, không lộ dữ liệu.
- Tránh tích Descartes đầy đủ nhưng giá trị thấp.

**Lab:** Tạo ma trận âm tính cho items, quantity, customer identity, content type và JSON malformed.

### Phiên 5.3 — Kịch bản có trạng thái, idempotent, đồng thời và khả năng phục hồi (2 giờ)

- Cùng idempotency key/cùng payload so với key khác/cùng business intent.
- Retry có kết quả chưa xác định và đối soát.
- Phân phối trùng, callback trễ, event sai thứ tự và replay.
- Gửi đồng thời và race condition tồn kho.
- Timeout, connection reset, response một phần, lỗi provider và recovery.
- Eventual consistency và polling có giới hạn thay vì fixed sleep.
- Xác định hiệu ứng nào phải xảy ra đúng một lần, ít nhất một lần hoặc không xảy ra.

**Workshop:** Thiết kế test phân biệt việc client dùng sai key, lỗi idempotency server, provider retry và lỗi reconciliation.

### Phiên 5.4 — Mở rộng coverage, phản biện và ưu tiên với AI (2 giờ)

- Prompt AI bằng source ID, taxonomy kịch bản, exclusion, năng lực môi trường và trường đầu ra.
- Yêu cầu từng đề xuất nêu source, risk, precondition, action, oracle, data và feasibility.
- Loại trùng các tương đương về ngữ nghĩa và từ chối kịch bản bất khả thi hoặc ngoài phạm vi.
- Yêu cầu AI tìm case boundary, state, misuse, resilience và observability còn thiếu.
- Ưu tiên dùng impact, likelihood/exposure, detectability, thay đổi gần đây, bằng chứng lịch sử và chi phí thực thi.
- Cân bằng danh mục giữa rủi ro contract, nghiệp vụ, bảo mật, resilience và observability.

**Hoạt động đánh giá:** Tạo danh mục kịch bản API có ưu tiên và thực thi hoặc mô phỏng tập con có giá trị cao nhất.

## Sản phẩm bàn giao của học phần

**Danh mục Kịch bản API và Kiểm thử Âm tính có AI hỗ trợ**, gồm:

- Scenario model thủ công và các chiều coverage.
- Danh sách ứng viên AI cùng quyết định chấp nhận/chỉnh sửa/từ chối.
- Kịch bản dương tính, âm tính, biên, authorization, trạng thái, idempotency, concurrency và resilience có thể truy vết.
- Điểm rủi ro và lý do ưu tiên.
- Định nghĩa oracle mạnh, gồm side effect bị cấm.
- Kết quả thực thi hoặc mô phỏng được gắn nhãn rõ ràng cho tập con đã chọn.
- Sổ đăng ký rủi ro còn lại và kịch bản hoãn lại.

## Tiêu chí chất lượng

- Thiết kế thủ công có hệ thống tồn tại trước khi AI mở rộng khoảng trống.
- Case âm tính cô lập vi phạm có chủ đích khi thực tế cho phép.
- Kịch bản có trạng thái và retry xác thực side effect bền vững, không chỉ response tức thời.
- Case authorization dùng actor và object khác nhau, đồng thời kiểm tra lộ lọt thông tin.
- Đề xuất AI được loại trùng, kiểm tra khả thi và có căn cứ nguồn.
- Ưu tiên thay đổi thứ tự thực thi và làm rõ rủi ro hoãn lại.

## Bài tập đánh giá Học phần 5 — Danh mục âm tính và resilience dựa trên rủi ro

**Mã bài tập:** `EX-U5-API-SCENARIOS`  
**Hình thức:** Làm theo cặp để thiết kế, bảo vệ cá nhân  
**Thời gian dành cho học viên:** 210 phút  
**Điểm đánh giá:** 10 điểm khóa học

### Bảng kịch bản bắt buộc

| Mã kịch bản | Loại | Mã nguồn/rủi ro | Điều kiện tiên quyết/trạng thái | Input/hành động | Response kỳ vọng | Side effect kỳ vọng | Side effect bị cấm | Priority |
|---|---|---|---|---|---|---|---|---|

### Tiêu chuẩn hoàn thành tối thiểu

- Ít nhất 24 kịch bản có mục đích, không trùng lặp.
- Bao gồm tối thiểu sáu case xác thực request, bốn case authorization/bảo mật, bốn case trạng thái/idempotency, ba case dependency/resilience và một case concurrency.
- Bao phủ số lượng item `0`, `1`, `20` và `21`; quantity `0`, `1`, `10` và `11`; field bắt buộc thiếu và malformed; sai media type; và field không xác định.
- Bao gồm retry cùng key/cùng payload và retry khác key sau kết quả thanh toán chưa xác định.
- Coi hành vi cùng key/payload khác là chưa được giải quyết trừ khi giảng viên cung cấp cập nhật contract.
- Thực thi hoặc để giảng viên mô phỏng tối thiểu tám kịch bản priority cao nhất và lưu giữ bằng chứng.

### Rubric chấm điểm

| Tiêu chí | Điểm | Bằng chứng đạt điểm tối đa |
|---|---:|---|
| Mô hình coverage có hệ thống | 2.0 | Kỹ thuật và chiều dữ liệu tạo danh mục cân bằng, có thể truy vết |
| Chất lượng negative test | 2.0 | Input cô lập vi phạm và oracle gồm non-effect cùng error an toàn |
| Độ sâu stateful, retry và resilience | 2.0 | Kịch bản bao phủ kết quả chưa xác định, tính bền vững, replay và recovery |
| Bao phủ authorization và misuse | 1.5 | Tổ hợp actor/object kiểm thử access và lộ lọt thông tin |
| Ưu tiên rủi ro và rủi ro còn lại | 1.5 | Thứ tự thực thi có bằng chứng và công việc hoãn lại rõ ràng |
| Phản biện AI và nguồn gốc | 1.0 | AI tạo giá trị đã review mà không bịa rule hay kết quả |

**Điểm trần nghiêm trọng:** Kết quả thực thi bịa đặt hoặc kịch bản dùng credential không an toàn, dữ liệu khách hàng thật hoặc side effect production không kiểm soát sẽ giới hạn bài tập ở 5/10.

---

# Học phần 6 — Hướng dẫn phân tích tích hợp defect, log và API

**Thời lượng:** 8 giờ  
**Mục tiêu học phần:** Tích hợp bằng chứng defect, hành vi API, log và giả thuyết có giới hạn thành workflow điều tra mạch lạc và gói trao đổi sẵn sàng cho quyết định.

## Kết quả học tập

Sau học phần này, học viên có thể:

- Chọn kênh quan sát tiếp theo theo khoảng trống bằng chứng hiện tại.
- Liên kết triệu chứng UI, HTTP traffic, log, trace, sự kiện provider và kiểm tra trạng thái.
- Xây dựng một timeline end-to-end và đồ thị bằng chứng cho failure phân tán.
- Chuyển phát hiện điều tra thành báo cáo defect cải tiến, regression test có mục tiêu và khuyến nghị observability.
- Trao đổi fact đã xác nhận, giải thích có khả năng, câu hỏi chưa giải quyết và rủi ro còn lại cho đối tượng kỹ thuật và nghiệp vụ.
- Áp dụng AI an toàn xuyên suốt điều tra mà không mất provenance hoặc trách nhiệm của con người.

## Phân bổ phiên học

### Phiên 6.1 — Workflow điều tra end-to-end (2 giờ)

- Điểm vào điều tra: báo cáo người dùng, test thất bại, monitor alert, bất thường API, chữ ký log hoặc sự kiện provider.
- Chọn tầng tiếp theo:
  - UI cho trạng thái người dùng nhìn thấy và chuỗi thao tác.
  - API cho contract, transport, identity và response tức thì.
  - Log/trace cho luồng nội bộ và thời gian.
  - Database/event store cho trạng thái bền vững khi được phân quyền.
  - Provider stub hoặc integration telemetry cho kết quả bên ngoài.
- Thứ tự thu thập bằng chứng giảm thiểu mutation và giữ trạng thái gốc.
- Một chỉ mục bằng chứng và ID ổn định xuyên mọi sản phẩm.
- Điều kiện dừng, trigger escalation và ranh giới truy cập.

**Thực hành:** Với năm incident report chưa hoàn chỉnh, chọn nguồn bằng chứng tiếp theo và giải thích information gain dự kiến.

### Phiên 6.2 — Timeline tích hợp, state model và đồ thị bằng chứng (2 giờ)

- Gộp thao tác người dùng, HTTP request, response, sự kiện nội bộ, callback và thay đổi trạng thái.
- Ánh xạ định danh kỹ thuật và entity nghiệp vụ.
- So sánh chuyển trạng thái thực tế với state model đã phê duyệt.
- Làm nổi bật khoảng trống, mâu thuẫn, nguồn không đáng tin và đường đi thay thế.
- Tách defect chính khỏi observability defect và điểm yếu kiểm soát.
- Xác định tầng regression nhỏ nhất có mục tiêu và coverage xuyên tầng cần thiết.

**Lab:** Xây dựng đồ thị bằng chứng cho case charge trùng và gắn mỗi khẳng định với ít nhất một nguồn.

### Phiên 6.3 — Tổng hợp và trao đổi có AI hỗ trợ (2 giờ)

- Workflow AI an toàn cho tập bằng chứng lớn: tối giản, chia chunk theo nguồn, trích xuất, chuẩn hóa, xác minh, sau đó tổng hợp.
- Ngăn mất provenance trong quá trình tóm tắt.
- Prompt AI tạo bản nháp theo từng đối tượng từ cùng bảng fact đã phê duyệt:
  - Tóm tắt triage cho Product/QA/Engineering.
  - Ghi chú điều tra kỹ thuật.
  - Tóm tắt incident cho cấp điều hành.
  - Khuyến nghị regression và monitoring.
- Phát hiện mức độ chắc chắn không được nguồn hỗ trợ xuất hiện khi tóm tắt.
- Phê duyệt của con người và change log cho tường trình cuối.

**Workshop:** So sánh ghi chú hướng Engineering với tóm tắt hướng Product và xác nhận độ tin cậy không thay đổi theo đối tượng.

### Phiên 6.4 — Phòng ngừa, regression, observability và closure (2 giờ)

- Chuyển bằng chứng nhân quả thành ứng viên hành động khắc phục mà không kê đơn bản sửa chưa xác minh.
- Chiến lược regression xuyên các tầng unit, contract, component, integration, end-to-end và production-safe monitoring.
- Cải thiện observability: tên sự kiện có cấu trúc, correlation bắt buộc, error code ổn định, audit chuyển trạng thái, metric và alert.
- Xác minh bản sửa: tái lập gốc, biến thể có mục tiêu, rủi ro kề cận, idempotency/retry và side effect âm tính.
- Tiêu chí closure và trigger mở lại.
- Retrospective: AI tăng tốc điều gì, bỏ sót điều gì và làm tăng công sức review ở đâu.

**Hoạt động đánh giá:** Hoàn thành điều tra capstone tích hợp và bảo vệ các kết luận.

## Sản phẩm bàn giao của học phần

**Gói Điều tra Tích hợp Defect, API và Log**, gồm:

- Phạm vi điều tra, danh mục nguồn, phiên bản và giới hạn truy cập.
- Báo cáo defect cuối và chỉ mục bằng chứng.
- Timeline xuyên tầng đã chuẩn hóa và bản đồ định danh.
- Phát hiện API contract và bằng chứng thực thi đã chọn.
- Mẫu/bất thường log và query đã lưu.
- Ma trận giả thuyết có cập nhật độ tin cậy.
- Kết luận đã xác nhận, câu hỏi chưa giải quyết và rủi ro còn lại.
- Khuyến nghị regression, observability và monitoring an toàn.
- Hồ sơ provenance AI và phê duyệt của con người.

## Tiêu chí chất lượng

- Một chuỗi bằng chứng kết nối triệu chứng người dùng với quan sát API, service và provider.
- Fact và hypothesis vẫn phân biệt được trong mọi tóm tắt theo đối tượng.
- Bằng chứng mâu thuẫn và thiếu được hiển thị thay vì làm mượt đi.
- Khuyến nghị xử lý các failure mode đã chứng minh và rủi ro còn lại được nêu tên.
- Phạm vi regression dựa trên rủi ro và gồm side effect bền vững.
- Gói có thể review mà không để lộ dữ liệu bị cấm.

## Bài tập đánh giá Học phần 6 — Điều tra tích hợp và briefing cho stakeholder

**Mã bài tập:** `EX-U6-INTEGRATED`  
**Hình thức:** Điều tra theo nhóm có bảo vệ cá nhân  
**Thời gian dành cho học viên:** 240 phút cộng 15 phút bảo vệ  
**Điểm đánh giá:** 10 điểm khóa học

### Bảng claim-evidence bắt buộc

| Mã claim | Khẳng định | Nhóm | Mã bằng chứng | Độ tin cậy | Mâu thuẫn/giới hạn | Owner/hành động tiếp theo |
|---|---|---|---|---|---|---|

### Tiêu chuẩn hoàn thành tối thiểu

- Gói gồm bằng chứng UI/quan sát, API, application log và provider.
- Mọi khẳng định quan trọng liên kết với bằng chứng và mang nhãn nhóm/độ tin cậy.
- Timeline gồm request đầu, timeout, provider capture muộn, user retry, capture thứ hai và trạng thái paid cuối cùng.
- Báo cáo ít nhất một observability defect hoặc khoảng trống bằng chứng tách biệt với defect hướng khách hàng.
- Khuyến nghị regression bao phủ luồng gốc, retry kết quả chưa xác định, dùng lại cùng key, rủi ro retry key khác và thông điệp khách hàng thấy.
- Ít nhất một đề xuất AI được chấp nhận, một đề xuất được chỉnh sửa đáng kể và một đề xuất bị từ chối có lý do.

### Rubric chấm điểm

| Tiêu chí | Điểm | Bằng chứng đạt điểm tối đa |
|---|---:|---|
| Chuỗi bằng chứng xuyên tầng | 2.0 | UI, API, log, provider và trạng thái tạo đường đi mạch lạc, có thể kiểm toán |
| Phân tích contract và log | 2.0 | Protocol, schema, thời gian, correlation và bất thường được diễn giải chính xác |
| Kỷ luật giả thuyết | 2.0 | Kết luận và unknown không vượt ranh giới bằng chứng |
| Hướng dẫn regression và observability | 1.5 | Khuyến nghị nhắm cơ chế đã chứng minh và rủi ro còn lại |
| Trao đổi với stakeholder | 1.5 | Tóm tắt ngắn gọn, phù hợp đối tượng và trung thực như nhau |
| Dấu vết kiểm toán AI có trách nhiệm | 1.0 | Input, output, review, redaction và phê duyệt được ghi lại |

**Điểm trần nghiêm trọng:** Khẳng định nguyên nhân gốc không được hỗ trợ, bịa bằng chứng hoặc tiết lộ dữ liệu bị cấm khiến bài không thể đạt điểm qua cho tới khi sửa và review.

---

# 8. Chiến lược đánh giá

## Đánh giá quá trình

- Các bài kiểm tra ngắn về phân loại bằng chứng ở đầu mỗi học phần.
- So sánh sản phẩm yếu với sản phẩm mạnh.
- Bài tập phản biện prompt và phát hiện hallucination.
- Peer review theo tiêu chí chất lượng của học phần.
- Giảng viên quan sát trong quá trình thực thi API và điều tra log.
- Nhật ký phản tư về các đề xuất AI được chấp nhận, chỉnh sửa và từ chối.

## Đánh giá tổng kết

| Thành phần | Trọng số | Bằng chứng |
|---|---:|---|
| Sáu sản phẩm bàn giao của học phần | 60% | Một sản phẩm được đánh giá cho mỗi học phần, 10% mỗi phần |
| Capstone tích hợp | 30% | Điều tra end-to-end cho một incident có kiểm soát mới |
| Bảo vệ cá nhân và review AI có trách nhiệm | 10% | Giải thích bằng chứng, giả thuyết, xác thực, an toàn và giới hạn |

**Điểm đạt đề xuất:** Tổng 70/100, không còn lỗi nghiêm trọng chưa được giải quyết về tính toàn vẹn sự thật, bảo mật/quyền riêng tư, bịa bằng chứng hoặc trích dẫn nguồn.

## Các nguyên tắc chấm điểm chung

- Chất lượng sản phẩm và tính hữu ích cho quyết định quan trọng hơn độ dài.
- Xác định đúng `Insufficient evidence` hoặc `Not specified` được tính điểm; bịa câu trả lời thì không.
- Một nguyên nhân gốc hợp lý về kỹ thuật không nhận điểm xác nhận nếu thiếu bằng chứng xác thực.
- Kết quả kiểm thử API phải đến từ thực thi thực tế có kiểm soát hoặc được gắn nhãn là mô phỏng.
- Đầu ra AI có thể hỗ trợ phân tích nhưng không thể là nguồn duy nhất cho hành vi kỳ vọng, bằng chứng thực thi hoặc xác nhận nhân quả.
- Nộp lại sau lỗi nghiêm trọng cần remediation, review tác động và ghi chú phòng ngừa ngắn.

# 9. Capstone tích hợp

## Brief capstone

Học viên nhận một incident mới trên cùng nền tảng. Báo cáo ban đầu chưa đầy đủ và bằng chứng được công bố dần. Incident phải gồm:

- Một triệu chứng khách hàng nhìn thấy.
- Một hành vi kỳ vọng mơ hồ hoặc còn thiếu.
- Tối thiểu ba service và một dependency bên ngoài.
- Định dạng timestamp hỗn hợp hoặc một vấn đề clock skew được kiểm soát.
- Một khoảng trống truyền correlation ID.
- Ít nhất một vi phạm API contract hoặc schema.
- Ít nhất một tín hiệu log gây hiểu lầm.
- Nội dung tổng hợp nhạy cảm phải được redaction trước khi dùng AI.
- Nhiều giả thuyết nguyên nhân gốc hợp lý, trong đó chỉ một giả thuyết trở nên được hỗ trợ mạnh hoặc được xác nhận.

## Gói capstone bắt buộc

```text
CAP-AIQE-DALA/
  00-scope-environment-and-source-register
  01-defect-report-and-reproduction
  02-evidence-index-and-redaction-log
  03-api-contract-and-execution-evidence
  04-log-normalization-and-saved-queries
  05-timeline-identifier-map-and-state-model
  06-hypothesis-matrix-and-investigation-plan
  07-conclusions-unknowns-and-residual-risk
  08-regression-observability-and-monitoring
  09-ai-provenance-and-human-review
  10-stakeholder-briefing
```

## Quy tắc thực thi capstone

1. Thiết lập baseline cho gói nguồn, build, môi trường, account và phiên bản tool trước khi phân tích.
2. Không thay đổi hoặc cleanup trạng thái incident cho đến khi lưu giữ đủ bằng chứng cần thiết.
3. Gán evidence ID ổn định và ghi thời điểm thu thập, nguồn, owner và trạng thái redaction.
4. Thiết lập hành vi kỳ vọng trước khi tuyên bố implementation defect.
5. Lập timeline trước khi yêu cầu AI tạo giả thuyết nguyên nhân gốc.
6. Thực thi API test phân biệt trong môi trường phi-production đã phê duyệt.
7. Tách riêng thông tin được mô phỏng, quan sát, suy luận và xác nhận.
8. Xác thực một cách xác định timestamp, số lượng, join và kết luận schema do AI tạo.
9. Có phê duyệt của con người cho defect cuối, trạng thái nguyên nhân gốc, severity và khuyến nghị phát hành.
10. Chỉ giữ bằng chứng an toàn tối thiểu theo chính sách retention của chương trình đào tạo.

## Rubric capstone

| Khía cạnh | Trọng số | Chỉ báo hiệu quả tốt |
|---|---:|---|
| Chất lượng defect và khả năng tái lập | 15% | Báo cáo chính xác, giàu bằng chứng, an toàn và sẵn sàng triage |
| Phân tích và kiểm thử API | 15% | Bao phủ contract, header, schema, ngữ nghĩa, side effect và rủi ro âm tính |
| Phân tích log và timeline | 15% | Nguồn được chuẩn hóa, correlation, tái lập được và nhận thức độ tin cậy |
| Giả thuyết và lập luận nhân quả | 15% | Phương án thay thế, mâu thuẫn, độ tin cậy và kiểm tra phân biệt chặt chẽ |
| Chuỗi bằng chứng tích hợp | 15% | Claim truy vết rõ qua bằng chứng user, API, service, trạng thái và dependency |
| Hướng dẫn regression và observability | 10% | Khuyến nghị dựa trên rủi ro, gắn với khoảng trống đã chứng minh |
| Trao đổi và tính hữu ích cho quyết định | 5% | Tóm tắt kỹ thuật và nghiệp vụ ngắn gọn, chính xác như nhau |
| AI có trách nhiệm và an toàn dữ liệu | 10% | Input an toàn, provenance đầy đủ và review con người có thể chứng minh |

## Câu hỏi bảo vệ cá nhân

Giảng viên chọn tối thiểu bốn câu hỏi từ các mảng khác nhau:

- Chỉ ra một câu trong báo cáo defect cuối thay đổi vì bằng chứng mâu thuẫn với quan sát ban đầu.
- Lần theo một claim từ stakeholder summary trở về bằng chứng thô.
- Giải thích vì sao một hypothesis chỉ ở mức có thể thay vì được hỗ trợ mạnh.
- Minh họa một kiểm tra phân biệt hai hypothesis cạnh tranh.
- Tính lại một chuyển đổi timestamp hoặc duration mà không có AI hỗ trợ.
- Chỉ ra cách một request/response assertion ánh xạ tới API contract hoặc business rule.
- Giải thích một side effect bị cấm trong negative API test.
- Xác định một đề xuất AI đã bị từ chối và bằng chứng hỗ trợ quyết định đó.
- Giải thích cách tối giản và redaction log trước khi dùng AI.
- Bảo vệ một khuyến nghị regression hoặc observability và nêu giới hạn của nó.

# 10. Template tái sử dụng

## 10.1 Template báo cáo defect

```text
Mã defect:
Tiêu đề:
Trạng thái:
Người báo cáo/ngày:

Nguồn/oracle:
- Mã requirement, rule, contract hoặc clarification đã phê duyệt:

Môi trường:
- Build/phiên bản:
- Client/thiết bị/trình duyệt:
- Service/cấu hình:
- Dữ liệu kiểm thử tổng hợp:

Điều kiện tiên quyết:

Các bước tái lập:
1.
2.
3.

Kết quả kỳ vọng:
Kết quả thực tế:
Tần suất và phạm vi:
Tác động nghiệp vụ/kỹ thuật:
Severity và lý do:
Đầu vào/owner priority:
Workaround:

Chỉ mục bằng chứng:
- Ảnh chụp/ghi hình:
- Request/response:
- Mã correlation/trace:
- Bằng chứng log/provider/trạng thái:

Fact đã biết:
Câu hỏi mở:
Giả thuyết (không phải khẳng định nguyên nhân gốc):
Kiểm tra quyền riêng tư/redaction:
Tham chiếu review AI và người phê duyệt:
```

## 10.2 Template ma trận giả thuyết

| Mã giả thuyết | Cơ chế và phạm vi | Bằng chứng hỗ trợ | Bằng chứng mâu thuẫn | Unknown | Độ tin cậy | Kiểm tra phân biệt tiếp theo | Cập nhật/kết quả |
|---|---|---|---|---|---|---|---|

## 10.3 Template chuẩn hóa sự kiện log

| Mã sự kiện | Timestamp gốc | Timestamp UTC | Nguồn/service | Sự kiện | Correlation/trace | Mã request/entity | Trạng thái/status | Ghi chú độ tin cậy | Tham chiếu bằng chứng thô |
|---|---|---|---|---|---|---|---|---|---|

## 10.4 Template kịch bản API

| Mã kịch bản | Nguồn/rủi ro | Điều kiện tiên quyết | Request | Status/header kỳ vọng | Oracle schema/ngữ nghĩa | Side effect kỳ vọng | Side effect bị cấm | Bằng chứng/cleanup |
|---|---|---|---|---|---|---|---|---|

## 10.5 Sổ đăng ký claim-evidence

| Mã claim | Nội dung claim | Fact/inference/hypothesis/unknown | Mã bằng chứng | Độ tin cậy | Quyết định reviewer | Dùng cho đối tượng |
|---|---|---|---|---|---|---|

## 10.6 Nhật ký sử dụng AI

| Mã lượt dùng AI | Tool/model | Phiên bản prompt | Tập nguồn đã phê duyệt | Redaction/tối giản | Tác vụ dự định | Tham chiếu đầu ra | Chấp nhận/chỉnh sửa/từ chối | Reviewer và lý do |
|---|---|---|---|---|---|---|---|---|

# 11. Khung prompt AI chung có giới hạn bằng chứng

```text
Vai trò:
Bạn đang hỗ trợ một QA investigator cấp cao. Bạn không phải là nguồn thực thi,
product owner hoặc cơ quan có thẩm quyền xác nhận nguyên nhân gốc.

Tác vụ:
[Nêu một tác vụ có giới hạn: review bản nháp defect, trích xuất sự kiện, đề xuất
các hypothesis cạnh tranh, phản biện API coverage hoặc xác định bất thường log.]

Nguồn được phê duyệt:
[Liệt kê chính xác evidence ID, phần contract và excerpt đã được làm sạch.]

Quy tắc:
1. Chỉ dùng các nguồn được cung cấp cho product fact và hành vi đã quan sát.
2. Giữ nguyên chính xác định danh, giá trị, timestamp và status code.
3. Tách FACT-SOURCE, FACT-OBSERVED, INFERENCE, HYPOTHESIS, CONTRADICTED
   và UNKNOWN.
4. Trích evidence ID cho mọi claim quan trọng.
5. Nếu bằng chứng thiếu hoặc mâu thuẫn, viết "Insufficient evidence" và nêu
   câu hỏi hoặc kiểm tra chính xác cần thực hiện.
6. Không bịa requirement, log, code path, chi tiết môi trường, kết quả thực thi,
   tần suất, severity, ownership hoặc nguyên nhân gốc.
7. Xác định bằng chứng mâu thuẫn và ít nhất một cách giải thích thay thế.
8. Khuyến nghị xác thực xác định cho phép tính, timestamp, join, schema và số lượng.

Đầu ra bắt buộc:
[Cung cấp schema bảng phù hợp với tác vụ.]

Ghi chú review:
Liệt kê ba claim có khả năng sai hoặc quá tự tin nhất, đồng thời giải thích điều
mà reviewer con người cần xác minh.
```

# 12. Checklist chuẩn bị của giảng viên

- Công bố kết quả học tập, phiên bản gói nguồn, tool AI được phép và quy tắc xử lý dữ liệu.
- Cung cấp account, token, định danh, log và bản ghi provider chỉ dùng dữ liệu tổng hợp.
- Xác nhận mọi endpoint đều phi-production và side effect được kiểm soát.
- Chuẩn bị bằng chứng thành công/control cùng bằng chứng failure.
- Giữ timestamp gốc và cung cấp metadata về múi giờ/đồng hồ.
- Bao gồm đủ định danh cho correlation nhưng cố ý có một khoảng trống observability thực tế.
- Xác định hành vi kỳ vọng nào đã phê duyệt, cố ý mơ hồ hoặc chỉ dành cho giảng viên.
- Chuẩn bị các đợt công bố bằng chứng dần dần và không tiết lộ đáp án quá sớm.
- Đảm bảo hướng dẫn cleanup/reset an toàn và có thể lặp lại.
- Chấm chất lượng bằng chứng và lập luận thay vì mức độ khớp một cách diễn đạt duy nhất.
- Chấp nhận hypothesis và cách ưu tiên thay thế khi có bằng chứng hỗ trợ và nêu giới hạn trung thực.
- Loại bỏ quan sát bịa đặt, xử lý dữ liệu không an toàn và sự chắc chắn nhân quả do AI tạo.

# 13. Định nghĩa hoàn thành khóa học

Học viên hoàn thành khóa học thành công khi có thể độc lập:

- Chuyển một quan sát chưa hoàn hảo thành báo cáo defect sẵn sàng triage, an toàn quyền riêng tư.
- Xây dựng timeline xuyên dịch vụ đáng tin cậy từ bằng chứng API và log.
- Tạo và kiểm thử các hypothesis cạnh tranh mà không vượt quá bằng chứng.
- Thiết kế API test theo contract và rủi ro với oracle dương tính và âm tính mạnh.
- Dùng AI để tăng tốc phân tích có cấu trúc, đồng thời phát hiện hallucination và duy trì provenance.
- Trao đổi fact đã xác nhận, độ tin cậy hiện tại, unknown, kiểm tra tiếp theo và rủi ro còn lại với stakeholder kỹ thuật lẫn nghiệp vụ.
