Feature: Xác thực người dùng (Authentication API)

  Scenario: 1. Đăng ký tài khoản mới thành công
    When người dùng gửi yêu cầu đăng ký với tài khoản "bdd_user_1" và mật khẩu "pass123"
    Then mã phản hồi HTTP phải là 201
    And thông báo trả về phải là "Đăng ký thành công"
    And tài khoản "bdd_user_1" phải được lưu trong cơ sở dữ liệu với mật khẩu đã mã hóa

  Scenario: 2. Đăng ký thất bại khi tài khoản đã tồn tại
    Given có một tài khoản "bdd_user_2" với mật khẩu "pass123" đã tồn tại
    When người dùng gửi yêu cầu đăng ký với tài khoản "bdd_user_2" và mật khẩu "pass123"
    Then mã phản hồi HTTP phải là 409
    And thông báo lỗi phải là "Tài khoản đã tồn tại"

  Scenario: 3. Đăng ký thất bại khi thiếu thông tin
    When người dùng gửi yêu cầu đăng ký với tài khoản "" và mật khẩu ""
    Then mã phản hồi HTTP phải là 400
    And thông báo lỗi phải là "Username và password không được để trống"

  Scenario Outline: 4. Đăng nhập hệ thống (Data-Driven Testing)
    Given có một tài khoản "bdd_user_login" với mật khẩu "correct_password" đã tồn tại
    When người dùng gửi yêu cầu đăng nhập với tài khoản "bdd_user_login" và mật khẩu "<password>"
    Then mã phản hồi HTTP phải là <status_code>
    And kết quả phải chứa token "<has_token>"

    Examples:
      | password         | status_code | has_token |
      | correct_password | 200         | true      |
      | wrong_password   | 401         | false     |
      |                  | 400         | false     |
