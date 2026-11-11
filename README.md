# Hướng Dẫn Automation Test API: Playwright & Playwright BDD

Tài liệu hướng dẫn thực hành và tài liệu mẫu chuẩn mực dành cho buổi training Automation Test API cho thành viên **Team Dev & Tester**.

---

## ⚡ 1. Khởi Động Nhanh (Quick Start với Docker)

Chỉ cần cài sẵn **Docker** & **Docker Compose**, bất kỳ ai clone repo về cũng có thể chạy ngay toàn bộ môi trường Backend + Database mà không cần cài đặt Go hay MongoDB trên máy cá nhân:

### Bước 1: Khởi động hệ thống (Backend API & MongoDB)
```bash
docker compose up -d
```
> [!TIP]
> Lệnh trên sẽ tự động:
> 1. Kéo image và khởi chạy **MongoDB 7.0** với Healthcheck.
> 2. Build multi-stage image siêu nhẹ (~10MB) cho **Go Backend** qua `Dockerfile`.
> 3. Chờ MongoDB khỏe mạnh (`healthy`) rồi mới bật Backend tại cổng `3000`.

### Bước 2: Kiểm tra tình trạng Server
```bash
curl http://localhost:3000/health
# Kết quả phản hồi: {"message":"OK"}
```

### Bước 3: Chạy Kiểm Thử Tự Động (Chọn 1 trong 2 cách)

#### Cách A: Chạy Test trực tiếp bằng Docker (Không cần cài Node.js trên máy)
Dự án đã định nghĩa sẵn các service test runner trong `docker-compose.yml`:
```bash
# 1. Chạy bộ kiểm thử Playwright Thuần (Code-first)
docker compose --profile test run --rm test-playwright

# 2. Chạy bộ kiểm thử Playwright BDD (Behavior-Driven)
docker compose --profile test run --rm test-playwright-bdd
```

#### Cách B: Chạy Test trên máy Host (Dành cho việc viết code thực hành & mở giao diện UI/Debug)
Yêu cầu máy bạn đã cài **Node.js >= 18.x**:
```bash
# 1. Với Playwright Thuần:
cd automation-test/playwright
npm install
npm test            # hoặc npm run test:ui để mở UI Mode

# 2. Với Playwright BDD:
cd automation-test/playwright-bdd
npm install
npm test            # hoặc npm run test:ui để mở UI Mode
```

### Bước 4: Dừng môi trường khi hoàn thành
```bash
docker compose down
```
*(Nếu muốn xóa cả volume dữ liệu MongoDB: `docker compose down -v`)*

---

## 🛠️ 2. Yêu Cầu Môi Trường (Prerequisites)

| Thành phần | Khi dùng Docker (Khuyên dùng) | Khi chạy trực tiếp trên Host (Standalone) |
| :--- | :--- | :--- |
| **Docker & Docker Compose** | Docker v20+ & Compose v2+ *(Bắt buộc)* | Không bắt buộc |
| **Go** | Không cần (chạy trong container) | Go >= 1.25 *(Để biên dịch Backend)* |
| **Node.js** | Không cần (có thể chạy qua Docker runner) | Node.js >= 18.x *(Dành cho dev test, UI mode)* |
| **MongoDB** | Tự động chạy qua Docker Compose | Cần MongoDB lắng nghe tại `localhost:27017` |

---

## 📁 3. Kiến Trúc Dự Án

```text
automation-test-training/
├── Dockerfile                   # Multi-stage Dockerfile cho Go Backend API (~10MB)
├── docker-compose.yml           # Khởi chạy MongoDB, Backend API và Docker Test Runners
├── .dockerignore                # Tối ưu hóa dung lượng build context Docker
├── .env.example                 # Biến môi trường mẫu (PORT, MONGO_PORT)
├── src/
│   └── main.go                  # Go Backend API (Register, Login, MongoDB)
├── automation-test/
│   ├── playwright/              # Dự án 1: Playwright Thuần (Code-first)
│   │   ├── fixtures/            # Custom fixture kết nối trực tiếp MongoDB
│   │   ├── tests/               # Test suites (auth.spec.js)
│   │   └── playwright.config.js # Cấu hình Playwright & auto webServer
│   └── playwright-bdd/          # Dự án 2: Playwright BDD (Behavior-Driven)
│       ├── features/            # Kịch bản kiểm thử Gherkin (.feature)
│       ├── steps/               # Ánh xạ Given/When/Then & MongoDB assertions
│       └── playwright.config.js # Cấu hình BDD generation & test runner
├── slides/
│   ├── index.html               # Slide trình chiếu tương tác (Reveal.js)
│   └── slides.md                # Slide định dạng Markdown (Marp / PPTX)
├── postman/
│   └── api-training.postman_collection.json # Collection demo đối chiếu Postman
└── README.md
```

> [!NOTE]
> Trong file `playwright.config.js` của cả 2 dự án đã được cấu hình tính năng thông minh:
> - Nếu Backend đang chạy sẵn (qua Docker Compose), Playwright sẽ tự động kết nối và **tái sử dụng server**.
> - Nếu bạn chạy test trực tiếp trên máy Host mà quên bật server, tính năng **`webServer`** sẽ tự động biên dịch và khởi chạy Go backend thay bạn!

---

## ⚙️ 4. Tùy Biến Cổng (Khi Bị Trùng Cổng Trên Máy)

Nếu máy tính cá nhân của bạn đã có một phiên bản MongoDB đang dùng cổng `27017` hoặc cổng `3000` đang bị ứng dụng khác chiếm dụng:

1. Sao chép file cấu hình môi trường:
   ```bash
   cp .env.example .env
   ```
2. Mở file `.env` và đổi cổng theo ý muốn:
   ```env
   PORT=3000
   MONGO_PORT=27018
   ```
3. Chạy `docker compose up -d`, Docker Compose sẽ tự động áp dụng cấu hình cổng mới!

---

## 📽️ 5. Slide Trình Chiếu Cho Buổi Training

Dự án đã chuẩn bị sẵn bộ Slide hoàn chỉnh tại thư mục `slides/`:

1. **Slide HTML Tương Tác ([slides/index.html](file:///home/vbox/projects/automation-test-training/slides/index.html))**:
   - Sử dụng thư viện **Reveal.js** giao diện Dracula hiện đại, hỗ trợ highlight code, hiển thị số slide, timeline.
   - **Cách mở:** Mở trực tiếp file `slides/index.html` bằng trình duyệt web bất kỳ (Chrome, Edge, Firefox).
   - **Phím tắt khi trình chiếu:**
     - `Phím mũi tên / Space`: Chuyển slide tiếp theo.
     - `Phím F`: Chế độ toàn màn hình (Fullscreen).
     - `Phím O` hoặc `ESC`: Xem tổng quan tất cả các slide (Overview mode).
     - `Phím S`: Mở cửa sổ ghi chú cho diễn giả (Speaker Notes).
2. **Slide Markdown ([slides/slides.md](file:///home/vbox/projects/automation-test-training/slides/slides.md))**:
   - Tương thích với chuẩn **Marp** (Marp for VS Code).
   - Dễ dàng xuất ra file **PDF** hoặc **PowerPoint (.pptx)** nếu cần gửi cho team.

---

## 📮 6. Postman Collection Demo

Dự án cung cấp sẵn file Postman Collection tại:  
👉 [postman/api-training.postman_collection.json](file:///home/vbox/projects/automation-test-training/postman/api-training.postman_collection.json)

### Cách sử dụng:
1. Mở ứng dụng **Postman** $\rightarrow$ Chọn nút **Import** ở góc trên bên trái.
2. Chọn file `postman/api-training.postman_collection.json`.
3. Collection bao gồm sẵn 9 request (Health Check, Register, Login, Cleanup) đã viết sẵn **Test Scripts** kiểm tra status code và tự động lưu `authToken`.
4. Rất thích hợp để bạn chạy đối chiếu demo giữa **giao diện Postman** vs **Playwright Test Runner**.

---

## 💡 7. Phân Biệt Giữa Lệnh `npm` và `npx` Trong Testing

Khi làm việc với Playwright, bạn có 2 cách thực thi lệnh:

- **Dùng `npm run <tên_script>` (hoặc `npm test`)**: Chạy các script đã được định nghĩa sẵn trong `package.json`. Phù hợp cho việc chạy chuẩn hóa trong team, setup CI/CD, hoặc người mới không cần nhớ nhiều cú pháp. *(Lưu ý: Nếu muốn truyền thêm cờ qua `npm`, bạn cần dùng cú pháp `npm test -- <cờ>`)*.
- **Dùng `npx <công_cụ> <tham_số>`**: Chạy trực tiếp CLI binary của Playwright (`npx playwright`) hoặc Playwright-BDD (`npx bddgen`) từ `node_modules`. Cực kỳ linh hoạt khi bạn cần tùy biến cờ (flags) như lọc test case, đổi số lượng worker, bật debug mode, v.v.

---

## 🚀 8. Hướng Dẫn Chạy: Playwright Thuần (`automation-test/playwright`)

Dành cho các bạn thích viết test script trực tiếp bằng JavaScript/TypeScript (phù hợp với Dev và Automation QA).

### Bước 1: Di chuyển vào thư mục và cài đặt thư viện
```bash
cd automation-test/playwright
npm install
```

### Bước 2: Bảng tra cứu lệnh chạy qua `npm` và `npx`

| Nhu cầu kiểm thử | Cách 1: Dùng lệnh `npm` | Cách 2: Dùng lệnh `npx` (Linh hoạt) | Ghi chú & Giải thích |
| :--- | :--- | :--- | :--- |
| **Chạy toàn bộ test** | `npm test` | `npx playwright test` | Chạy 5 test cases song song (parallel) bao gồm kiểm chứng MongoDB |
| **Giao diện trực quan (UI Mode)** | `npm run test:ui` | `npx playwright test --ui` | Mở giao diện trực quan, soi từng request/response, timeline |
| **Chạy chế độ Debug từng bước** | `npm run test:debug` | `npx playwright test --debug` | Bật Playwright Inspector để debug từng dòng lệnh |
| **Xem báo cáo HTML** | `npm run report` | `npx playwright show-report` | Mở HTML report sau khi test hoàn tất |
| **Chạy 1 test case cụ thể (theo tên)** | `npm test -- -g "Đăng ký"` | `npx playwright test -g "Đăng ký"` | Lọc test theo từ khóa trong tiêu đề test case |
| **Chạy 1 file test cụ thể** | `npm test -- tests/auth.spec.js` | `npx playwright test tests/auth.spec.js` | Chỉ định rõ đường dẫn file cần chạy |
| **Chạy đơn luồng (1 worker)** | `npm test -- --workers=1` | `npx playwright test --workers=1` | Hữu ích khi muốn chạy tuần tự để dễ quan sát log |
| **Chạy hiển thị trình duyệt** | `npm test -- --headed` | `npx playwright test --headed` | (Thường dùng cho UI test, API test không cần thiết) |

---

## 🥒 9. Hướng Dẫn Chạy: Playwright BDD (`automation-test/playwright-bdd`)

Dành cho mô hình cộng tác giữa **Product Owner / Business Analyst / Tester / Dev**, sử dụng kịch bản Gherkin (`Given - When - Then`).

### Cơ chế hoạt động của Playwright BDD:
```text
[File .feature (Gherkin)] + [File .steps.js]
               ↓ (chạy bddgen)
    Thư mục .features-gen/ (sinh ra file test Playwright)
               ↓ (chạy playwright test)
         Kết quả kiểm thử & Báo cáo HTML
```

### Bước 1: Di chuyển vào thư mục và cài đặt thư viện
```bash
cd automation-test/playwright-bdd
npm install
```

### Bước 2: Bảng tra cứu lệnh chạy qua `npm` và `npx`

| Nhu cầu kiểm thử | Cách 1: Dùng lệnh `npm` | Cách 2: Dùng lệnh `npx` (Chi tiết từng bước) | Ghi chú & Giải thích |
| :--- | :--- | :--- | :--- |
| **Biên dịch và chạy toàn bộ test** | `npm test` | `npx bddgen && npx playwright test` | Bước 1: bddgen sinh code $\rightarrow$ Bước 2: Playwright chạy test |
| **Giao diện trực quan (UI Mode)** | `npm run test:ui` | `npx bddgen && npx playwright test --ui` | Mở giao diện UI Mode xem kịch bản BDD trực quan |
| **Chỉ biên dịch Gherkin ra test spec** | `npm run bddgen` | `npx bddgen` | Kiểm tra cú pháp `.feature` và mapping step mà chưa chạy test |
| **Chế độ Debug từng bước** | `npm run test:debug` | `npx bddgen && npx playwright test --debug` | Debug từng bước Given/When/Then |
| **Xem báo cáo HTML** | `npm run report` | `npx playwright show-report` | Mở báo cáo HTML có gắn thẻ Feature/Scenario |
| **Chạy 1 Scenario cụ thể** | `npm test -- -g "Đăng nhập"` | `npx bddgen && npx playwright test -g "Đăng nhập"` | Lọc kịch bản theo tên kịch bản BDD |
| **Chạy 1 file feature cụ thể** | — | `npx bddgen && npx playwright test .features-gen/features/auth.feature.spec.js` | Chỉ định file spec đã được sinh ra |

---

## ✍️ 10. Hướng Dẫn Thêm Kịch Bản Mới Trong Playwright BDD

Khi cần bổ sung thêm kịch bản nghiệp vụ mới:

1. **Mở file [features/auth.feature](file:///home/vbox/projects/automation-test-training/automation-test/playwright-bdd/features/auth.feature)** và thêm kịch bản mới:
   ```gherkin
   Scenario: Kiểm tra đăng nhập với tài khoản chưa từng đăng ký
     When người dùng gửi yêu cầu đăng nhập với tài khoản "non_exist_user" và mật khẩu "123456"
     Then mã phản hồi HTTP phải là 401
     And thông báo lỗi phải là "Tài khoản hoặc mật khẩu không chính xác"
   ```
2. **Kiểm tra file [steps/auth.steps.js](file:///home/vbox/projects/automation-test-training/automation-test/playwright-bdd/steps/auth.steps.js)**:
   - Các step trên đã có định nghĩa sẵn $\rightarrow$ Bạn không cần phải viết thêm một dòng code nào!
   - Nếu kịch bản có step hoàn toàn mới, khi chạy `npx bddgen`, công cụ sẽ in sẵn code mẫu (snippets) để bạn sao chép vào `auth.steps.js`.
3. **Chạy kiểm thử:**
   ```bash
   npm test
   ```

---

## ⚖️ 11. So Sánh Nhanh Dành Cho Buổi Thảo Luận Team

| Tiêu chí | Playwright Thuần | Playwright BDD |
| :--- | :--- | :--- |
| **Đối tượng phù hợp** | Dev, Automation Tester | Manual Tester, BA, PO, Dev |
| **Ngôn ngữ viết test** | JavaScript / TypeScript | Gherkin (Ngôn ngữ tự nhiên) + JS |
| **Độ phức tạp code** | Đơn giản, gọi API trực tiếp | Cần thêm tầng ánh xạ Step Definitions |
| **Tốc độ thực thi** | Rất nhanh, ít tầng trừu tượng | Nhanh (vẫn dùng runner Playwright nhưng thêm bước generate) |
| **Khả năng tái sử dụng** | Tái sử dụng qua hàm / helper | Tái sử dụng step bằng ngôn ngữ tự nhiên |
| **Khi nào nên chọn?** | API nội bộ kỹ thuật, team toàn dev | Luồng nghiệp vụ lớn, cần BA/PO duyệt kịch bản kiểm thử |
