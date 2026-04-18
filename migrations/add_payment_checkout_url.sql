-- Thêm cột checkout_url và expires_at để có thể resume PayOS payment
-- khi user đóng tab mà chưa huỷ.
ALTER TABLE payments
    ADD COLUMN checkout_url VARCHAR(500) NULL COMMENT 'PayOS checkout URL để có thể resume thanh toán' AFTER status,
    ADD COLUMN expires_at DATETIME NULL COMMENT 'Thời điểm PayOS link hết hạn' AFTER checkout_url;

CREATE INDEX idx_payments_order_status ON payments(order_id, status);
