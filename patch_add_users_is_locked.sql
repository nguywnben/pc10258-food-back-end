-- Thêm field is_locked vào bảng users
-- Cho phép admin khóa/mở khóa tài khoản user
--
-- Chạy trong MySQL (Workbench / CLI). Đổi tên database nếu khác `pc10258_food`.

USE pc10258_food;

-- Thêm cột is_locked
ALTER TABLE users
  ADD COLUMN is_locked TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Trạng thái khóa (1 = khóa, 0 = mở)' AFTER role;

-- (Tùy chọn) Thêm index để tìm kiếm user khóa nhanh hơn
-- ALTER TABLE users ADD INDEX idx_is_locked (is_locked);
