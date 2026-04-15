-- Sửa lỗi đăng nhập 500: Unknown column 'membership_plan_id' in 'field list'
-- Model Sequelize `User` có cột membership_plan_id nhưng bảng MySQL cũ chưa có.
--
-- Chạy trong MySQL (Workbench / CLI). Đổi tên database nếu khác `pc10258_food`.
-- Nếu cột đã tồn tại, bỏ qua lệnh ADD COLUMN (hoặc xóa cột trùng trước khi thêm lại).

USE pc10258_food;

-- Bước 1 (bắt buộc): thêm cột
ALTER TABLE users
  ADD COLUMN membership_plan_id INT NULL DEFAULT NULL COMMENT 'Gói membership đang dùng' AFTER membership;

-- Bước 2 (tùy chọn): khóa ngoại — chỉ khi bảng membership_plans đã tồn tại và chưa có constraint trùng tên
-- Nếu báo lỗi duplicate constraint hoặc bảng chưa có, bỏ qua bước này.
-- ALTER TABLE users
--   ADD CONSTRAINT fk_users_membership_plan
--   FOREIGN KEY (membership_plan_id) REFERENCES membership_plans(id) ON DELETE SET NULL;
