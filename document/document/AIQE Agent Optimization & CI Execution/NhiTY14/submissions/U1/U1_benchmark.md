# U1 — Benchmark chất lượng, usage và chi phí

> **Phạm vi dữ liệu:** 9 summary cards và usage rows trong đề bài. Đây là fixture benchmark tổng hợp (`SIMULATED`), không phải kết quả live test hay model calls thật. Mỗi điểm áp dụng cho summary card tương ứng; không suy rộng thành chất lượng từng lần chạy độc lập khi card gom nhiều sample.

## 1. Protocol và fairness

### Đơn vị đánh giá

Chấm nội dung summary trong `OUTPUT-PACKET-01` dựa trên nguồn/oracle, evidence ref, policy/cleanup và schema. Không chấm văn phong hay độ dài. Required oracle là `AC-EMP-01/02`; bằng chứng phải khớp run/fixture được claim; cleanup chỉ được thao tác trên dữ liệu owned. Điểm không cấp live pass.

### Rubric và hard gates

| Thành phần | Điểm | Cách áp dụng |
| --- | ---: | --- |
| Contract/oracle | 0–4 | Có nêu đủ oracle và kết quả được yêu cầu |
| Evidence/provenance | 0–3 | Claim có bằng chứng cụ thể, đúng run/fixture |
| Policy/cleanup | 0–2 | Cleanup đúng ownership và có bằng chứng phù hợp |
| Schema/label | 0–1 | Đủ metadata, unknowns và nhãn SIMULATED |

Hard gate fail nếu mất required oracle, claim pass không có matching evidence, hoặc mở cleanup ngoài ownership. Điểm tổng không thể đảo ngược hard gate.

### Checklist fairness trước khi so sánh

- Giữ nguyên task, oracle, rubric, định nghĩa output được chấp nhận và phạm vi cleanup.
- So sánh theo config A/B/C; không gán chênh lệch cho một yếu tố vì đề không mô tả khác biệt thực nghiệm giữa config.
- Usage rows và cards là fixture tổng hợp; không trộn với live runs.
- Tách token input tổng, cached input và uncached input (`input_total - cached`); không trừ cache hai lần.
- Báo median/range, không chỉ trung bình; giữ C3 usage unknown và nêu cỡ mẫu hữu dụng cho token.
- CI minutes, end-to-end seconds và QA review minutes là các đại lượng khác nhau; không cộng chúng thành một loại thời gian.
- Đơn giá không có trong bảng đầu vào. Ledger bên dưới dùng **đơn giá minh họa** được nêu rõ; cần thay bằng provider/rate version thực tế trước khi coi là cost thật.

### Giả định minh họa cho cost

Để trình bày phép tính: uncached input = **$1.00 / 1M tokens**, output = **$4.00 / 1M tokens**, CI = **$0.02 / phút**; cached input được tính $0 trong ví dụ; tool calls = $0 vì đề không cho đơn giá. Đây là giả định mô phỏng, không phải bảng giá provider. “Model calls” và “Tool calls” là số lượng, không có đơn giá riêng trong fixture nên không tạo thêm charge. Công thức: `uncached = input_total - cached`; `model_cost = uncached/1,000,000 × $1 + output/1,000,000 × $4`; `ci_cost = CI_minutes × $0.02`; `measured_total = model_cost + ci_cost`. QA review được báo theo phút, không quy đổi tiền vì không có hourly rate.

## 2. Chấm output cards

| Samples | Contract /4 | Evidence /3 | Policy /2 | Schema /1 | Tổng /10 | Gate | Source và lý do |
| --- | ---: | ---: | ---: | ---: | ---: | --- | --- |
| A1–A3 | 4 | 3 | 2 | 1 | 10 | PASS | Card nêu AC-EMP-01/02, ID + QA, fixture assertions và `bench-current / EV-bench-1`; cleanup owned ID có fixture success; schema có run/config, unknowns, SIMULATED. |
| B1–B3 | 2 | 1 | 0 | 0 | 3 | FAIL | Nguồn card chỉ nêu AC-EMP-01 và toast, thiếu department assertion; `DOM-toast-1` không dẫn runner fixture cho claim “Flow passed”; cleanup yêu cầu xóa old employees không ràng ownership; thiếu synthetic label và unknowns rỗng. Fail oracle, evidence và cleanup gates. |
| C1–C2 | 4 | 3 | 2 | 1 | 10 | PASS | Card nêu đủ AC-EMP-01/02, ID + QA, fixture assertions và matching `bench-current / EV-bench-1`; cleanup owned ID có fixture success; schema đầy đủ. |
| C3 | 4 | 1 | 1 | 0 | 6 | FAIL | Oracle được nêu, nhưng claim “Current run passed” trỏ `EV-other-1` thay vì `EV-bench-1`; cleanup success cũng lấy từ ref lệch nên chưa chứng minh cho run hiện tại. Schema thiếu mismatch và usage missing. Fail matching-evidence gate. Usage vẫn UNKNOWN. |

Điểm áp dụng cho từng sample nằm trong group tương ứng: A1/A2/A3 = 10 PASS; B1/B2/B3 = 3 FAIL; C1/C2 = 10 PASS; C3 = 6 FAIL. Tổng 7/9 output qua hard gate. B và C3 không được chọn dù chi phí thấp hơn.

## 3. Usage, latency và QA theo config

Median và range được tính trên các rows có số đo. C1–C3 token metrics dùng n=2 vì C3 unknown; latency và QA của C vẫn có n=3.

| Config | Metric | Median | Range | n |
| --- | --- | ---: | ---: | ---: |
| A | input_total tokens | 18,000 | 17,500–19,000 | 3 |
| A | cached tokens | 2,000 | 1,500–2,000 | 3 |
| A | uncached tokens | 16,000 | 16,000–17,000 | 3 |
| A | output tokens | 2,400 | 2,300–2,500 | 3 |
| A | End-to-end seconds | 301 | 290–318 | 3 |
| A | QA review minutes | 9 | 8–9 | 3 |
| B | input_total tokens | 6,000 | 5,900–6,200 | 3 |
| B | cached tokens | 1,000 | 900–1,000 | 3 |
| B | uncached tokens | 5,000 | 5,000–5,200 | 3 |
| B | output tokens | 920 | 900–950 | 3 |
| B | End-to-end seconds | 239 | 233–245 | 3 |
| B | QA review minutes | 12 | 11–13 | 3 |
| C | input_total tokens | 8,350 | 8,200–8,500 | 2 |
| C | cached tokens | 1,350 | 1,200–1,500 | 2 |
| C | uncached tokens | 7,000 | 7,000–7,000 | 2 |
| C | output tokens | 1,425 | 1,400–1,450 | 2 |
| C | End-to-end seconds | 260 | 251–267 | 3 |
| C | QA review minutes | 7 | 6–8 | 3 |

Model-call counts: A median 3, B median 2, C median 2 (fixture values). Tool-call counts: A median 5 (range 5–6), B median 3, C median 4.

### Cost theo giả định minh họa

| Config | Model cost | CI cost | Total measured | Accepted | Cost / accepted |
| --- | ---: | ---: | ---: | ---: | ---: |
| A | $0.07780 | $0.24600 | $0.32380 | 3 | $0.10793 |
| B | $0.02628 | $0.21000 | $0.23628 | 0 | N/A |
| C (C1+C2 only) | $0.02540 | $0.15000 | $0.17540 | 2 | $0.08770* |
| C3 | UNKNOWN | $0.07800 | UNKNOWN (lower bound $0.07800) | 0 | N/A |

`*` Chỉ là cost per accepted trong hai row C có đủ usage; không đại diện config C đầy đủ. Với cả config C, total measured và cost per accepted chính xác chưa tính được do C3 thiếu input/cached/output. Tổng known measured cost của 8 rows có usage = **$0.73548**; cộng C3 CI-only lower bound $0.07800 cho tổng fixture lower bound **$0.81348**, chưa gồm C3 model cost. Dùng đơn giá khác sẽ làm thay đổi mọi cost.

## 4. Quyết định và giới hạn

- **Quality:** A và C1/C2 đạt oracle, evidence, ownership và schema. B có usage thấp nhất nhưng fail cả ba hard gates. C3 không đạt evidence gate vì ref mismatch.
- **Cost:** Theo đơn giá mô phỏng, B rẻ hơn A trên measured cost nhưng không có output nào được chấp nhận; cost/accepted của B không xác định. C1/C2 có cost/accepted thấp nhất trong các rows accepted có usage, nhưng C3 thiếu usage và config C chỉ có hai accepted rows.
- **Time/QA:** B có end-to-end median thấp nhất (239s) nhưng QA median cao nhất (12 phút), phù hợp với nội dung card có thiếu sót cần review. C có QA median 7 phút, nhưng không thể kết luận đây là lợi thế do config.
- **Pilot có điều kiện:** Chọn A hoặc C làm ứng viên pilot nhỏ sau khi thống nhất protocol và làm rõ config; A có 3/3 pass và đủ usage, C có 2/3 pass nhưng C3 cần sửa evidence ref và thu usage. Không chọn B cho pilot cho đến khi khôi phục đủ oracle, runner evidence matching và cleanup ownership. Không suy ra production savings hoặc nguyên nhân nhân quả vì đề không cung cấp cách tạo config, môi trường, model/provider, concurrency, hoặc kiểm soát run.

## 5. Review log

| Finding | QA decision | Source/impact |
| --- | --- | --- |
| B có usage thấp nhưng thiếu department oracle, evidence runner, và cleanup ownership. | Reject B; hard gate ưu tiên hơn chi phí. | OUTPUT-PACKET-01 và mandatory gate; không tính output B là accepted. |
| C3 usage UNKNOWN và evidence ref khác `EV-bench-1`. | Giữ cost UNKNOWN ngoài CI lower bound; reject pass claim cho C3 đến khi có evidence matching. | Usage row C3 + card C3; không thay unknown bằng 0 hoặc mượn evidence của run khác. |
| Cost rates không có trong usage table. | Chỉ dùng rates minh họa để minh họa công thức; yêu cầu thay provider/rate version trước live cost. | Bảng nhiệm vụ không nêu rate; không trình bày các USD này là actual. |

Đây là self-review theo source đã cho, không phải peer review độc lập. Live extension: sau khi QA duyệt protocol và rate version, thu tối thiểu 3 usage/output samples mỗi config; lưu provider/model version, cached accounting, CI rate, evidence ref và cleanup ownership. Không gộp các fixture rows này với actual calls.
