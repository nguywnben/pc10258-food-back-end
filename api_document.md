# 📖 Tài liệu API (API Documentation) - PC10258 Food

**Base URL**: `http://localhost:3000/api`

Tài liệu dưới đây liệt kê chi tiết các endpoint API dùng cho Frontend. Các API có đánh dấu 🔒 yêu cầu gửi kèm token ở header:
`Authorization: Bearer <your_jwt_token>`

---

## 1. Authentication & Users (Người dùng)

### Đăng ký tài khoản
- **URL:** `/users/register`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "full_name": "Nguyễn Văn A",
    "email": "khach@example.com",
    "phone": "0901234567",
    "password": "yourpassword"
  }
  ```
- **Response:** `201 Created` (Trả về thông tin user mới)

### Đăng nhập
- **URL:** `/users/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "email": "khach@example.com",
    "password": "yourpassword"
  }
  ```
- **Response:** `200 OK` (Trả về `token` và thông tin user)

### Lấy thông tin cá nhân 🔒
- **URL:** `/users/profile`
- **Method:** `GET`

### Cập nhật thông tin cá nhân 🔒
- **URL:** `/users/profile`
- **Method:** `PUT`
- **Body:** Các trường muốn cập nhật (`full_name`, `email`, `phone`).

### Đổi mật khẩu 🔒
- **URL:** `/users/change-password`
- **Method:** `PUT`
- **Body:**
  ```json
  {
    "current_password": "oldpassword",
    "new_password": "newpassword"
  }
  ```

---

## 2. Categories & Products (Sản phẩm & Danh mục)

### Lấy danh sách danh mục
- **URL:** `/categories`
- **Method:** `GET`

### Lấy danh sách sản phẩm
- **URL:** `/products`
- **Method:** `GET`
- **Query Params (tùy chọn):** 
  - `category_id=1` (Lọc theo mã danh mục)
  - `min_price=50000&max_price=200000` (Lọc theo khoảng giá)
  - `sort=price-asc` hoặc `price-desc` hoặc `new` hoặc `popular` (Sắp xếp)
  - `search=pizza` (Tìm kiếm theo tên)

### Lấy chi tiết sản phẩm
- **URL:** `/products/:id`
- **Method:** `GET`

---

## 3. Giỏ hàng (Cart) 🔒

### Lấy giỏ hàng hiện tại
- **URL:** `/cart`
- **Method:** `GET`
- **Response:** Trả về danh sách `items`, số lượng và `subtotal` (tổng tiền các món).

### Thêm món vào giỏ
- **URL:** `/cart`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "product_id": 1,
    "quantity": 1
  }
  ```

### Cập nhật số lượng món trong giỏ
- **URL:** `/cart/:id`
- **Method:** `PUT`
- **Body:** `{ "quantity": 2 }` (Truyền `<= 0` sẽ tự động xóa).

### Xóa món khỏi giỏ
- **URL:** `/cart/:id`
- **Method:** `DELETE`

---

## 4. Đơn hàng (Orders) 🔒

### Tạo đơn hàng mới từ giỏ hàng
- **URL:** `/orders`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "address_id": 1, 
    "payment_method": "Thanh toán khi nhận",
    "note": "Giao giờ hành chính",
    "promo_code": "COMBO20" 
  }
  ```
- **Lưu ý:** API sẽ tự lấy giỏ hàng hiện tại, tính tổng tiền, tạo đơn và tự động xóa giỏ hàng.

### Lấy danh sách đơn hàng của tôi
- **URL:** `/orders`
- **Method:** `GET`
- **Query Params:** `status=pending` (Tùy chọn: lọc theo trạng thái).

### Chi tiết đơn hàng
- **URL:** `/orders/:id`
- **Method:** `GET`

### Hủy đơn
- **URL:** `/orders/:id/cancel`
- **Method:** `PUT`
- **Lưu ý:** Chỉ hủy được khi đơn đang ở trạng thái `pending`.

---

## 5. Ví điện tử & Thanh toán (Wallet) 🔒

### Xem số dư ví
- **URL:** `/wallet`
- **Method:** `GET`

### Xem lịch sử giao dịch ví
- **URL:** `/wallet/transactions`
- **Method:** `GET`
- **Query Params:** `days=7` (Lấy giao dịch trong X ngày gần nhất).

### Nạp tiền vào ví
- **URL:** `/wallet/deposit`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "amount": 200000,
    "method": "Chuyển khoản ngân hàng"
  }
  ```

---

## 6. Địa chỉ giao hàng (Addresses) 🔒

### Lấy danh sách địa chỉ
- **URL:** `/addresses`
- **Method:** `GET`

### Thêm địa chỉ mới
- **URL:** `/addresses`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "label": "Nhà riêng",
    "full_address": "123 Đường ABC, Quận 1",
    "is_default": true
  }
  ```

---

## 7. Món yêu thích (Favorites) 🔒

### Xem danh sách yêu thích
- **URL:** `/favorites`
- **Method:** `GET`

### Thêm món yêu thích
- **URL:** `/favorites`
- **Method:** `POST`
- **Body:** `{ "product_id": 1 }`

### Bỏ yêu thích
- **URL:** `/favorites/:productId`
- **Method:** `DELETE`

---

## 8. Hội thoại & Tin nhắn (Messages) 🔒

### Lấy danh sách cuộc trò chuyện
- **URL:** `/conversations`
- **Method:** `GET`

### Tạo hội thoại mới (Bắt đầu chat hỗ trợ)
- **URL:** `/conversations`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "title": "Hỗ trợ khách hàng",
    "type": "support" 
  }
  ```

### Xem nhóm tin nhắn trong hội thoại
- **URL:** `/conversations/:conversationId/messages`
- **Method:** `GET`

### Gửi tin nhắn
- **URL:** `/messages`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "conversation_id": 1,
    "content": "Đơn hàng của tôi bao giờ tới?"
  }
  ```

---

## 9. Khuyến mãi & Gói nâng cấp (Promotions & Membership)

### Kiểm tra tính hợp lệ của mã giảm giá 🔒
- **URL:** `/promotions/validate`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "code": "COMBO20",
    "order_total": 450000
  }
  ```

### Xem danh sách gói nâng cấp thành viên (Public)
- **URL:** `/membership-plans`
- **Method:** `GET`

### Yêu cầu mua gói nâng cấp 🔒
- **URL:** `/membership/upgrade`
- **Method:** `POST`
- **Body:** `{ "plan_id": 2 }`

---

> **Dành cho API Admin:**
> - Hiện tại backend có tích hợp các API dành cho role `admin` trên các resource như CRUD Món ăn, Cập nhật trạng thái đơn (với đường dẫn `/api/admin/...`). 
> - Bạn có thể xem trực tiếp chi tiết trong các Controller file tương ứng vì Front-End Client hiện tại không dùng tới.
