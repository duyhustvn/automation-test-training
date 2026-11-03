# Hướng Dẫn Automation Test API: Playwright & Playwright BDD

Tài liệu hướng dẫn thực hành và tài liệu mẫu dành cho buổi training Automation Test API cho thành viên **Team Dev & Tester**.

---

## 1. Yêu Cầu Môi Trường (Prerequisites)

- **Go**: >= 1.25 (Để chạy backend API)
- **Node.js**: >= 18.x (Khuyên dùng LTS hoặc mới hơn)
- **MongoDB**: Đang chạy tại `localhost:27017` (Mặc định không cần mật khẩu)
  > *Gợi ý chạy nhanh bằng Docker:*
  > ```bash
  > docker run -d --name mongo-training -p 27017:27017 mongo:7.0
  > ```

---

## 2. Kiến Trúc Dự Án

```text
automation-test-training/
├── src/
│   └── main.go                  # Go Backend API (Register, Login, MongoDB)
├── automation-test/
│   ├── playwright/              # Dự án 1: Playwright Thuần (Code-first)
│   └── playwright-bdd/          # Dự án 2: Playwright BDD (Behavior-Driven)
├── slides/
│   ├── index.html               # Slide trình chiếu tương tác (Reveal.js)
│   └── slides.md                # Slide định dạng Markdown (Marp / PPTX)
├── postman/
│   └── api-training.postman_collection.json # Collection demo Postman
└── README.md
```

> [!NOTE]
> Trong file `playwright.config.js` của cả 2 dự án đã được cấu hình tính năng **`webServer`**. Khi bạn gõ lệnh chạy test, Playwright sẽ **tự động kiểm tra và khởi động Go backend** nếu server chưa chạy! Bạn không bắt buộc phải bật server thủ công.

---

## 📽️ Slide Trình Chiếu Cho Buổi Training

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

## 📮 Postman Collection Demo

Dự án cung cấp sẵn file Postman Collection tại:  
👉 [postman/api-training.postman_collection.json](file:///home/vbox/projects/automation-test-training/postman/api-training.postman_collection.json)

### Cách sử dụng:
1. Mở ứng dụng **Postman** $\rightarrow$ Chọn nút **Import** ở góc trên bên trái.
2. Chọn file `postman/api-training.postman_collection.json`.
3. Collection bao gồm sẵn 9 request (Health Check, Register, Login, Cleanup) đã viết sẵn **Test Scripts** kiểm tra status code và tự động lưu `authToken`.
4. Rất thích hợp để bạn chạy đối chiếu demo giữa **giao diện Postman** vs **Playwright Test Runner**.

---

## 💡 Phân Biệt Giữa Lệnh `npm` và `npx` Trong Testing

Khi làm việc với Playwright, bạn có 2 cách thực thi lệnh:

- **Dùng `npm run <tên_script>` (hoặc `npm test`)**: Chạy các script đã được định nghĩa sẵn trong `package.json`. Phù hợp cho việc chạy chuẩn hóa trong team, setup CI/CD, hoặc người mới không cần nhớ nhiều cú pháp. *(Lưu ý: Nếu muốn truyền thêm cờ qua `npm`, bạn cần dùng cú pháp `npm test -- <cờ>`)*.
- **Dùng `npx <công_cụ> <tham_số>`**: Chạy trực tiếp CLI binary của Playwright (`npx playwright`) hoặc Playwright-BDD (`npx bddgen`) từ `node_modules`. Cực kỳ linh hoạt khi bạn cần tùy biến cờ (flags) như lọc test case, đổi số lượng worker, bật debug mode, v.v.

---

## 3. Hướng Dẫn Chạy: Playwright Thuần (`automation-test/playwright`)

Dành cho các bạn thích viết test script trực tiếp bằng JavaScript/TypeScript (phù hợp với Dev và Automation Engineer).

### Bước 1: Di chuyển vào thư mục và cài đặt thư viện
```bash
cd automation-test/playwright
npm install
```

### Bước 2: Bảng tra cứu lệnh chạy qua `npm` và `npx`

| Nhu cầu kiểm thử | Cách 1: Dùng lệnh `npm` | Cách 2: Dùng lệnh `npx` (Linh hoạt) | Ghi chú & Giải thích |
| :--- | :--- | :--- | :--- |
| **Chạy toàn bộ test** | `npm test` | `npx playwright test` | Chạy 6 test cases song song (parallel) bao gồm kiểm chứng MongoDB |
| **Giao diện trực quan (UI Mode)** | `npm run test:ui` | `npx playwright test --ui` | Mở giao diện trực quan, soi từng request/response, timeline |
| **Chạy chế độ Debug từng bước** | `npm run test:debug` | `npx playwright test --debug` | Bật Playwright Inspector để debug từng dòng lệnh |
| **Xem báo cáo HTML** | `npm run report` | `npx playwright show-report` | Mở HTML report sau khi test hoàn tất |
| **Chạy 1 test case cụ thể (theo tên)** | `npm test -- -g "Đăng ký"` | `npx playwright test -g "Đăng ký"` | Lọc test theo từ khóa trong tiêu đề test case |
| **Chạy 1 file test cụ thể** | `npm test -- tests/auth.spec.js` | `npx playwright test tests/auth.spec.js` | Chỉ định rõ đường dẫn file cần chạy |
| **Chạy đơn luồng (1 worker)** | `npm test -- --workers=1` | `npx playwright test --workers=1` | Hữu ích khi muốn chạy tuần tự để dễ quan sát log |
| **Chạy hiển thị trình duyệt** | `npm test -- --headed` | `npx playwright test --headed` | (Thường dùng cho UI test, API test không cần thiết) |

---

## 4. Hướng Dẫn Chạy: Playwright BDD (`automation-test/playwright-bdd`)

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

## 5. Hướng Dẫn Thêm Kịch Bản Mới Trong Playwright BDD

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
   # Cách qua npm:
   npm test

   # Hoặc cách qua npx:
   npx bddgen && npx playwright test
   ```

---

## 6. So Sánh Nhanh Dành Cho Buổi Thảo Luận Team

| Tiêu chí | Playwright Thuần | Playwright BDD |
| :--- | :--- | :--- |
| **Đối tượng phù hợp** | Dev, Automation Tester | Manual Tester, BA, PO, Dev |
| **Ngôn ngữ viết test** | JavaScript / TypeScript | Gherkin (Ngôn ngữ tự nhiên) + JS |
| **Độ phức tạp code** | Đơn giản, gọi API trực tiếp | Cần thêm tầng ánh xạ Step Definitions |
| **Tốc độ thực thi** | Rất nhanh, ít tầng trừu tượng | Nhanh (vẫn dùng runner Playwright nhưng thêm bước generate) |
| **Khả năng tái sử dụng** | Tái sử dụng qua hàm / helper | Tái sử dụng step bằng ngôn ngữ tự nhiên |
| **Khi nào nên chọn?** | API nội bộ kỹ thuật, team toàn dev | Luồng nghiệp vụ lớn, cần BA/PO duyệt kịch bản kiểm thử |
