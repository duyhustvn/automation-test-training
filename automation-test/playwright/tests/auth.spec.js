import { test, expect } from '../fixtures/test.js';

test.describe('API Authentication Testing (Playwright Pure)', () => {
    // Hàm sinh thông tin test user duy nhất cho mỗi test để chạy song song (Parallel execution) an toàn
    const generateUser = () => ({
        username: `autouser_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        password: 'password123',
    });

    test('1. Đăng ký tài khoản mới thành công & kiểm chứng trong MongoDB (201 Created)', async ({ request, db }) => {
        const user = generateUser();

        // Bước 1: Gửi request đăng ký qua API
        const response = await request.post('/api/register', {
            data: user,
        });

        expect(response.status()).toBe(201);
        const body = await response.json();
        expect(body.message).toBe('Đăng ký thành công');

        // Bước 2: Kiểm chứng dữ liệu thực tế đã lưu vào MongoDB qua Custom Fixture { db }
        const userInDb = await db.collection('users').findOne({ username: user.username });

        // Assert 1: Bản ghi bắt buộc phải tồn tại trong database
        expect(userInDb).not.toBeNull();
        expect(userInDb.username).toBe(user.username);

        // Assert 2 (Bảo mật): Mật khẩu trong DB KHÔNG ĐƯỢC là plain-text
        expect(userInDb.password).not.toBe(user.password);

        // Assert 3 (Mã hóa): Mật khẩu phải đúng định dạng hash bcrypt ($2a$, $2b$, ...)
        expect(userInDb.password).toMatch(/^\$2[aby]\$/);

        // Dọn dẹp sau test
        await request.delete(`/api/users?username=${user.username}`);
    });

    test('2. Đăng ký thất bại khi tài khoản đã tồn tại (409 Conflict)', async ({ request }) => {
        const user = generateUser();

        // Bước 1: Đăng ký lần đầu
        await request.post('/api/register', { data: user });

        // Bước 2: Thử đăng ký lại với cùng username
        const response = await request.post('/api/register', { data: user });

        expect(response.status()).toBe(409);
        const body = await response.json();
        expect(body.error).toBe('Tài khoản đã tồn tại');

        // Dọn dẹp sau test
        await request.delete(`/api/users?username=${user.username}`);
    });

    test('3. Đăng ký thất bại khi thiếu thông tin (400 Bad Request)', async ({ request }) => {
        const response = await request.post('/api/register', {
            data: { username: '', password: '' },
        });

        expect(response.status()).toBe(400);
        const body = await response.json();
        expect(body.error).toBe('Username và password không được để trống');
    });

    test('4. Đăng nhập thành công với thông tin chính xác (200 OK + Token)', async ({ request }) => {
        const user = generateUser();

        // Đăng ký trước
        await request.post('/api/register', { data: user });

        // Thực hiện đăng nhập
        const response = await request.post('/api/login', {
            data: user,
        });

        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.message).toBe('Đăng nhập thành công');
        expect(body.token).toBeDefined();
        expect(body.token).toContain(user.username);

        // Dọn dẹp sau test
        await request.delete(`/api/users?username=${user.username}`);
    });

    test('5. Đăng nhập thất bại khi sai mật khẩu (401 Unauthorized)', async ({ request }) => {
        const user = generateUser();

        // Đăng ký trước
        await request.post('/api/register', { data: user });

        // Đăng nhập với mật khẩu sai
        const response = await request.post('/api/login', {
            data: {
                username: user.username,
                password: 'wrongpassword',
            },
        });

        expect(response.status()).toBe(401);
        const body = await response.json();
        expect(body.error).toBe('Tài khoản hoặc mật khẩu không chính xác');

        // Dọn dẹp sau test
        await request.delete(`/api/users?username=${user.username}`);
    });
});
