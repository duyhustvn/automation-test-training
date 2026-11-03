import { createBdd } from 'playwright-bdd';
import { test } from './fixtures.js';
import { expect } from '@playwright/test';

const { Given, When, Then, After } = createBdd(test);

// Hook dọn dẹp sau mỗi Scenario để không để lại rác dữ liệu trong MongoDB
After(async ({ request, apiContext }) => {
  if (apiContext?.username) {
    await request.delete(`/api/users?username=${apiContext.username}`);
  }
});

// 1. Chuẩn bị tài khoản đã có sẵn
Given('có một tài khoản {string} với mật khẩu {string} đã tồn tại', async ({ request, apiContext }, username, password) => {
  apiContext.username = username;
  // Dọn dẹp trước nếu còn sót lại từ lần chạy trước
  await request.delete(`/api/users?username=${username}`);
  // Đăng ký tạo sẵn
  const res = await request.post('/api/register', {
    data: { username, password },
  });
  expect(res.status()).toBe(201);
});

// 2. Hành động gửi yêu cầu đăng ký
When('người dùng gửi yêu cầu đăng ký với tài khoản {string} và mật khẩu {string}', async ({ request, apiContext }, username, password) => {
  if (username) {
    apiContext.username = username;
  }
  apiContext.response = await request.post('/api/register', {
    data: { username, password },
  });
  apiContext.responseBody = await apiContext.response.json();
});

// 3. Hành động gửi yêu cầu đăng nhập
When('người dùng gửi yêu cầu đăng nhập với tài khoản {string} và mật khẩu {string}', async ({ request, apiContext }, username, password) => {
  apiContext.username = username;
  apiContext.response = await request.post('/api/login', {
    data: { username, password },
  });
  apiContext.responseBody = await apiContext.response.json();
});

// 4. Kiểm tra mã phản hồi HTTP
Then('mã phản hồi HTTP phải là {int}', async ({ apiContext }, expectedStatus) => {
  expect(apiContext.response.status()).toBe(expectedStatus);
});

// 5. Kiểm tra thông báo thành công
Then('thông báo trả về phải là {string}', async ({ apiContext }, expectedMessage) => {
  expect(apiContext.responseBody.message).toBe(expectedMessage);
});

// 6. Kiểm tra thông báo lỗi
Then('thông báo lỗi phải là {string}', async ({ apiContext }, expectedError) => {
  expect(apiContext.responseBody.error).toBe(expectedError);
});

// 7. Kiểm tra kết quả trả về có Token hay không
Then('kết quả phải chứa token {string}', async ({ apiContext }, hasToken) => {
  if (hasToken === 'true') {
    expect(apiContext.responseBody.token).toBeDefined();
    expect(apiContext.responseBody.token).toContain(apiContext.username);
  } else {
    expect(apiContext.responseBody.token).toBeUndefined();
  }
});

// 8. Kiểm tra dữ liệu thực tế trong MongoDB (Database Assertion)
Then('tài khoản {string} phải được lưu trong cơ sở dữ liệu với mật khẩu đã mã hóa', async ({ db }, username) => {
  const userInDb = await db.collection('users').findOne({ username });
  expect(userInDb).not.toBeNull();
  expect(userInDb.username).toBe(username);
  expect(userInDb.password).toMatch(/^\$2[aby]\$/);
});
