-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Máy chủ: localhost
-- Thời gian đã tạo: Th4 19, 2026 lúc 02:19 PM
-- Phiên bản máy phục vụ: 8.0.44
-- Phiên bản PHP: 8.2.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `pc10258_food`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `addresses`
--

CREATE TABLE `addresses` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `label` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Nhà riêng' COMMENT 'Tên nhãn: Nhà riêng, Công ty…',
  `full_address` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Địa chỉ đầy đủ',
  `is_default` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = địa chỉ mặc định',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `addresses`
--

INSERT INTO `addresses` (`id`, `user_id`, `label`, `full_address`, `is_default`, `created_at`, `updated_at`) VALUES
(1, 1, 'Nhà riêng', '123 Đường ABC, P.1, Q.1, TP.HCM', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(2, 1, 'Công ty', 'Tòa nhà XYZ, Quận 3, TP.HCM', 0, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(3, 2, 'Nhà riêng', '456 Đường DEF, P.2, Q.5, TP.HCM', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(4, 4, 'Nhà riêng', 'sưadawdwad', 0, '2026-04-15 05:26:05', '2026-04-18 05:23:28'),
(5, 4, 'Nhà riêng', 'wadad aadawdawd', 1, '2026-04-15 11:32:44', '2026-04-18 05:23:28');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1' COMMENT 'Số lượng',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `cart_items`
--

INSERT INTO `cart_items` (`id`, `user_id`, `product_id`, `quantity`, `created_at`, `updated_at`) VALUES
(2, 1, 3, 2, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(3, 1, 2, 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(4, 1, 4, 2, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(5, 1, 7, 3, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(6, 1, 14, 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(17, 4, 3, 2, '2026-04-18 12:47:23', '2026-04-18 12:47:33'),
(18, 4, 2, 1, '2026-04-18 12:48:16', '2026-04-18 13:05:44'),
(19, 4, 4, 1, '2026-04-18 12:48:40', '2026-04-18 13:05:46');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `categories`
--

CREATE TABLE `categories` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên danh mục',
  `icon` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Emoji icon',
  `sort_order` int NOT NULL DEFAULT '0' COMMENT 'Thứ tự hiển thị',
  `status` int NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `categories`
--

INSERT INTO `categories` (`id`, `name`, `icon`, `sort_order`, `status`, `created_at`) VALUES
(1, 'Pizza', '🍕', 1, 0, '2026-04-09 19:31:48'),
(2, 'Bánh rán', '🍩', 2, 0, '2026-04-09 19:31:48'),
(3, 'Burger', '🍔', 3, 1, '2026-04-09 19:31:48'),
(4, 'Mexico', '🌮', 4, 1, '2026-04-09 19:31:48'),
(5, 'Món Á', '🍜', 5, 1, '2026-04-09 19:31:48'),
(6, 'Kem', '🍦', 6, 1, '2026-04-09 19:31:48');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `conversations`
--

CREATE TABLE `conversations` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tiêu đề hội thoại',
  `type` enum('support','shipper','promotion') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'support' COMMENT 'Loại hội thoại',
  `avatar_text` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Text hiển thị avatar (VD: CS)',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `conversations`
--

INSERT INTO `conversations` (`id`, `user_id`, `title`, `type`, `avatar_text`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'Hỗ trợ PC10258', 'support', 'CS', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(2, 1, 'Shipper Minh', 'shipper', NULL, 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(3, 1, 'Khuyến mãi', 'promotion', NULL, 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(4, 5, 'Hỗ trợ PC10258', 'support', 'CS', 1, '2026-04-19 13:03:24', '2026-04-19 14:18:20');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `favorites`
--

CREATE TABLE `favorites` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `product_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `favorites`
--

INSERT INTO `favorites` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(2, 1, 2, '2026-04-09 19:31:48'),
(3, 1, 4, '2026-04-09 19:31:48'),
(4, 1, 14, '2026-04-09 19:31:48'),
(6, 1, 7, '2026-04-09 19:31:48'),
(22, 5, 2, '2026-04-19 13:21:21');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `membership_plans`
--

CREATE TABLE `membership_plans` (
  `id` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên gói',
  `price` int NOT NULL COMMENT 'Giá / tháng (VNĐ)',
  `features` json DEFAULT NULL COMMENT 'Danh sách quyền lợi',
  `is_popular` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1 = gói phổ biến',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `membership_plans`
--

INSERT INTO `membership_plans` (`id`, `name`, `price`, `features`, `is_popular`, `created_at`) VALUES
(1, 'Miễn phí', 0, '\"Giao hàng theo thời gian dự kiến, Xem danh mục và đặt món, Không có mã gidwdảm thêm\"', 0, '2026-04-09 19:31:48'),
(2, 'Thành viên Cần Thơ', 2000, '\"Tặng mã giảm giá khi nâng cấp, Ưu tiên một số ưu đãi khu vực, Xem nhanh các món gợi ý\"', 1, '2026-04-09 19:31:48'),
(3, 'VIP', 99000, '[\"Miễn phí giao hàng mọi đơn\", \"Giảm 10% toàn menu\", \"Hỗ trợ ưu tiên 24/7\"]', 0, '2026-04-09 19:31:48');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `messages`
--

CREATE TABLE `messages` (
  `id` int NOT NULL,
  `conversation_id` int NOT NULL,
  `sender_id` int DEFAULT NULL COMMENT 'NULL = hệ thống / bot',
  `sender_type` enum('user','agent','system') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Nội dung tin nhắn',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `messages`
--

INSERT INTO `messages` (`id`, `conversation_id`, `sender_id`, `sender_type`, `content`, `created_at`) VALUES
(1, 1, NULL, 'agent', 'Xin chào anh/chị! Đơn #PC-5821 của mình đang được bếp chuẩn bị ạ.', '2026-03-16 10:20:00'),
(2, 1, 1, 'user', 'Cho em hỏi giao khoảng mấy giờ ạ?', '2026-03-16 10:22:00'),
(3, 1, NULL, 'agent', 'Dự kiến shipper lấy món lúc 11:20, tới tay mình khoảng 11:45–12:00 hôm nay ạ. Cảm ơn mình đã đợi!', '2026-03-16 10:23:00'),
(4, 4, NULL, 'agent', 'Chào mừng bạn đến với kênh hỗ trợ! Chúng tôi có thể giúp gì cho bạn?', '2026-04-19 13:03:24'),
(5, 4, 5, 'user', 'adw', '2026-04-19 13:03:28'),
(6, 4, 5, 'user', 'dwdw', '2026-04-19 13:03:33'),
(7, 4, 5, 'user', 'ss', '2026-04-19 13:19:56'),
(8, 4, 5, 'user', 'awdawd', '2026-04-19 14:18:17'),
(9, 4, 5, 'user', 'add', '2026-04-19 14:18:19'),
(10, 4, 5, 'user', 'ada', '2026-04-19 14:18:20');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `orders`
--

CREATE TABLE `orders` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `order_code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã đơn hàng (VD: PC-5821)',
  `status` enum('pending','preparing','delivering','delivered','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái đơn',
  `payment_method` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Phương thức thanh toán',
  `subtotal` int NOT NULL DEFAULT '0' COMMENT 'Tạm tính (VNĐ)',
  `discount` int NOT NULL DEFAULT '0' COMMENT 'Giảm giá (VNĐ)',
  `delivery_fee` int NOT NULL DEFAULT '0' COMMENT 'Phí giao hàng (VNĐ)',
  `total` int NOT NULL DEFAULT '0' COMMENT 'Tổng thanh toán (VNĐ)',
  `address_id` int DEFAULT NULL COMMENT 'Địa chỉ giao hàng',
  `note` text COLLATE utf8mb4_unicode_ci COMMENT 'Ghi chú đơn hàng',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `order_code`, `status`, `payment_method`, `subtotal`, `discount`, `delivery_fee`, `total`, `address_id`, `note`, `created_at`, `updated_at`) VALUES
(1, 1, 'PC-5821', 'cancelled', 'Thanh toán khi nhận', 323000, 0, 0, 323000, 1, 'đưa', '2026-03-16 10:15:00', '2026-04-14 20:47:02'),
(2, 2, 'PC-5790', 'delivering', 'Ví PC10258', 95000, 0, 0, 95000, 2, NULL, '2026-03-14 19:42:00', '2026-04-15 11:36:34'),
(3, 4, 'PC-5601', 'delivered', 'Thanh toán khi nhận', 420000, 0, 15000, 435000, 1, NULL, '2026-03-10 12:08:00', '2026-04-15 18:32:02'),
(4, 4, 'PC-0004', 'cancelled', 'Thanh toán trực tuyến', 545000, 0, 0, 545000, 4, NULL, '2026-04-18 05:22:58', '2026-04-18 05:50:39'),
(5, 4, 'PC-0005', 'cancelled', 'Thanh toán trực tuyến', 155000, 0, 0, 155000, 5, NULL, '2026-04-18 05:47:15', '2026-04-18 05:50:51'),
(6, 4, 'PC-0006', 'cancelled', 'Thanh toán trực tuyến', 3000, 0, 15000, 18000, 5, NULL, '2026-04-18 05:52:17', '2026-04-18 12:13:21'),
(7, 4, 'PC-0007', 'cancelled', 'Thanh toán trực tuyến', 3000, 0, 15000, 18000, 5, NULL, '2026-04-18 06:06:18', '2026-04-18 12:13:17'),
(8, 4, 'PC-0008', 'cancelled', 'Thanh toán trực tuyến', 3000, 0, 15000, 18000, 5, NULL, '2026-04-18 06:10:46', '2026-04-18 12:13:26'),
(9, 4, 'PC-0009', 'cancelled', 'Thanh toán trực tuyến', 3000, 0, 15000, 18000, 5, NULL, '2026-04-18 06:22:20', '2026-04-18 12:13:24'),
(10, 5, 'PC-0010', 'cancelled', 'Thanh toán trực tuyến', 2325000, 0, 0, 2325000, NULL, NULL, '2026-04-18 13:11:32', '2026-04-18 13:26:11'),
(11, 5, 'PC-0011', 'cancelled', 'Thanh toán trực tuyến', 165000, 0, 0, 165000, NULL, NULL, '2026-04-18 13:26:29', '2026-04-18 13:26:48'),
(12, 5, 'PC-0012', 'cancelled', 'Thanh toán trực tuyến', 35000, 0, 15000, 50000, NULL, NULL, '2026-04-18 13:26:55', '2026-04-19 13:25:34'),
(13, 5, 'PC-0013', 'cancelled', 'Thanh toán trực tuyến', 3000, 0, 15000, 18000, NULL, NULL, '2026-04-19 13:29:42', '2026-04-19 13:46:08'),
(14, 5, 'PC-0014', 'cancelled', 'Thanh toán trực tuyến', 3000, 0, 15000, 18000, NULL, NULL, '2026-04-19 13:46:14', '2026-04-19 13:46:36'),
(15, 5, 'PC-0015', 'cancelled', 'Thanh toán trực tuyến', 3000, 0, 0, 3000, NULL, NULL, '2026-04-19 13:46:41', '2026-04-19 13:46:57');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `order_items`
--

CREATE TABLE `order_items` (
  `id` int NOT NULL,
  `order_id` int NOT NULL,
  `product_id` int DEFAULT NULL,
  `product_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên món (snapshot tại thời điểm đặt)',
  `quantity` int NOT NULL DEFAULT '1',
  `unit_price` int NOT NULL COMMENT 'Đơn giá tại thời điểm đặt (VNĐ)',
  `subtotal` int NOT NULL COMMENT 'Thành tiền = quantity × unit_price'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `subtotal`) VALUES
(1, 1, NULL, 'Pizza Neapolitan', 1, 145000, 145000),
(2, 1, 4, 'Burger bò phô mai', 2, 89000, 178000),
(3, 2, 14, 'Kem vani', 2, 25000, 50000),
(4, 2, 7, 'Bánh rán vòng', 3, 15000, 45000),
(5, 3, NULL, 'Combo pizza gia đình', 1, 420000, 420000),
(6, 4, 3, 'Pizza Sicilian', 1, 155000, 155000),
(7, 4, 4, 'Burger bò phô mai', 2, 89000, 178000),
(8, 4, 6, 'Burger đôi', 1, 129000, 129000),
(9, 4, 10, 'Taco thịt bò', 1, 55000, 55000),
(10, 4, 15, 'Kem socola', 1, 28000, 28000),
(11, 5, 3, 'Pizza Sicilian', 1, 155000, 155000),
(12, 6, 4, 'Burger bò phô mai', 1, 3000, 3000),
(13, 7, 4, 'Burger bò phô mai', 1, 3000, 3000),
(14, 8, 4, 'Burger bò phô mai', 1, 3000, 3000),
(15, 9, 4, 'Burger bò phô mai', 1, 3000, 3000),
(16, 10, 3, 'Pizza Sicilian', 15, 155000, 2325000),
(17, 11, 2, 'Pizza California', 1, 165000, 165000),
(18, 12, 7, 'Bánh rán vòng', 1, 35000, 35000),
(19, 13, 4, 'Burger bò phô mai', 1, 3000, 3000),
(20, 14, 4, 'Burger bò phô mai', 1, 3000, 3000),
(21, 15, 4, 'Burger bò phô mai', 1, 3000, 3000);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payments`
--

CREATE TABLE `payments` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `reference_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã giao dịch (VD: PC-PAY-10258)',
  `type` enum('deposit','order','upgrade') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Loại: nạp tiền / thanh toán đơn / nâng cấp',
  `method` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Phương thức: bank, ewallet, cod',
  `amount` int NOT NULL COMMENT 'Số tiền (VNĐ)',
  `status` enum('pending','completed','failed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `checkout_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `order_id` int DEFAULT NULL COMMENT 'Liên kết đơn hàng (nếu type = order)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payments`
--

INSERT INTO `payments` (`id`, `user_id`, `reference_code`, `type`, `method`, `amount`, `status`, `checkout_url`, `expires_at`, `order_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'PC-PAY-10258', 'deposit', 'Chuyển khoản ngân hàng', 100000, 'completed', NULL, NULL, NULL, '2026-03-16 10:15:00', '2026-04-09 19:31:49'),
(2, 1, 'PC-PAY-10259', 'order', 'Ví PC10258', 95000, 'completed', NULL, NULL, 2, '2026-03-14 19:42:00', '2026-04-09 19:31:49'),
(3, 1, 'PC-PAY-10260', 'order', 'Thanh toán khi nhận', 435000, 'completed', NULL, NULL, 3, '2026-03-10 12:08:00', '2026-04-09 19:31:49'),
(6, 4, 'PC-PAY-202604151776232360', 'deposit', 'PayOS', 2000, 'completed', NULL, NULL, NULL, '2026-04-15 05:52:40', '2026-04-15 05:53:13'),
(7, 4, 'PC-PAY-202604151776252781', 'deposit', 'PayOS', 2000, 'completed', NULL, NULL, NULL, '2026-04-15 11:33:01', '2026-04-15 11:33:56'),
(8, 4, 'PC-WAL-202604151776253383', 'upgrade', 'Wallet', 2000, 'completed', NULL, NULL, NULL, '2026-04-15 11:43:03', '2026-04-15 11:43:03'),
(9, 4, 'PC-PAY-202604181776492091', 'deposit', 'PayOS', 18000, 'pending', NULL, NULL, NULL, '2026-04-18 06:01:31', '2026-04-18 06:01:31'),
(10, 4, 'PC-PAY-202604181776492598', 'deposit', 'PayOS', 50000, 'pending', NULL, NULL, NULL, '2026-04-18 06:09:58', '2026-04-18 06:09:58'),
(11, 4, 'PC-PAY-202604181776492649', 'order', 'PayOS', 18000, 'pending', NULL, NULL, 8, '2026-04-18 06:10:49', '2026-04-18 06:10:49'),
(12, 4, 'PC-PAY-202604181776492933', 'deposit', 'PayOS', 50000, 'pending', NULL, NULL, NULL, '2026-04-18 06:15:33', '2026-04-18 06:15:33'),
(13, 4, 'PC-PAY-202604181776493169', 'deposit', 'PayOS', 50000, 'pending', NULL, NULL, NULL, '2026-04-18 06:19:29', '2026-04-18 06:19:29'),
(14, 4, 'PC-PAY-202604181776493311', 'deposit', 'PayOS', 11111, 'pending', NULL, NULL, NULL, '2026-04-18 06:21:51', '2026-04-18 06:21:51'),
(15, 4, 'PC-PAY-202604181776493344', 'order', 'PayOS', 18000, 'pending', NULL, NULL, 9, '2026-04-18 06:22:24', '2026-04-18 06:22:24'),
(16, 4, 'PC-PAY-202604181776493668', 'order', 'PayOS', 18000, 'pending', NULL, NULL, 9, '2026-04-18 06:27:48', '2026-04-18 06:27:48'),
(17, 4, 'PC-PAY-202604181776493757', 'order', 'PayOS', 18000, 'failed', NULL, NULL, 9, '2026-04-18 06:29:17', '2026-04-18 06:29:21'),
(18, 4, 'PC-PAY-202604181776493953', 'deposit', 'PayOS', 50000, 'pending', NULL, NULL, NULL, '2026-04-18 06:32:33', '2026-04-18 06:32:33'),
(19, 4, 'PC-PAY-202604181776493964', 'order', 'PayOS', 18000, 'failed', NULL, NULL, 9, '2026-04-18 06:32:44', '2026-04-18 06:32:48'),
(20, 4, 'PC-PAY-202604181776493983', 'deposit', 'PayOS', 50000, 'pending', NULL, NULL, NULL, '2026-04-18 06:33:03', '2026-04-18 06:33:03'),
(21, 5, 'PC-PAY-202604181776517963', 'order', 'PayOS', 2325000, 'failed', NULL, NULL, 10, '2026-04-18 13:12:43', '2026-04-18 13:12:48'),
(22, 5, 'PC-PAY-202604181776517979', 'order', 'PayOS', 2325000, 'failed', NULL, NULL, 10, '2026-04-18 13:12:59', '2026-04-18 13:13:03'),
(25, 5, 'PC-PAY-202604181776518766', 'order', 'PayOS', 2325000, 'cancelled', 'https://pay.payos.vn/web/211c2419fb0b4ebe81ad3b34e6218b34', '2026-04-18 14:26:06', 10, '2026-04-18 13:26:06', '2026-04-18 13:26:11'),
(26, 5, 'PC-PAY-202604181776518792', 'order', 'PayOS', 165000, 'cancelled', 'https://pay.payos.vn/web/07683f2f8de7459eb518a10627454913', '2026-04-18 14:26:32', 11, '2026-04-18 13:26:32', '2026-04-18 13:26:48'),
(27, 5, 'PC-PAY-202604191776606405', 'order', 'PayOS', 3000, 'cancelled', 'https://pay.payos.vn/web/d1c1a92a9f7843358637d2e1e3d10588', '2026-04-19 14:46:45', 15, '2026-04-19 13:46:45', '2026-04-19 13:46:57'),
(28, 5, 'PC-PAY-202604191776607617', 'deposit', 'PayOS', 2000, 'pending', 'https://pay.payos.vn/web/fd1a7af591e449838b40e41416ec3383', '2026-04-19 15:06:57', NULL, '2026-04-19 14:06:57', '2026-04-19 14:06:59'),
(29, 5, 'PC-PAY-202604191776607826', 'deposit', 'PayOS', 50000, 'pending', 'https://pay.payos.vn/web/10f7705edc2c4aaba221b614e808ed60', '2026-04-19 15:10:27', NULL, '2026-04-19 14:10:26', '2026-04-19 14:10:28'),
(30, 5, 'PC-PAY-202604191776607841', 'deposit', 'PayOS', 200000, 'pending', 'https://pay.payos.vn/web/5fc1aa7d316245549285c041bf1ffbcf', '2026-04-19 15:10:41', NULL, '2026-04-19 14:10:41', '2026-04-19 14:10:41'),
(31, 5, 'PC-PAY-202604191776608147', 'deposit', 'PayOS', 50000, 'pending', 'https://pay.payos.vn/web/f69e77d8dfbe49f488148829d09e6ceb', '2026-04-19 15:15:47', NULL, '2026-04-19 14:15:47', '2026-04-19 14:15:48'),
(32, 5, 'PC-PAY-202604191776608211', 'deposit', 'PayOS', 50000, 'pending', 'https://pay.payos.vn/web/5d6a77f3bb264fc28b5ee92530e89ba1', '2026-04-19 15:16:51', NULL, '2026-04-19 14:16:51', '2026-04-19 14:16:51');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `products`
--

CREATE TABLE `products` (
  `id` int NOT NULL,
  `category_id` int NOT NULL,
  `name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Tên món',
  `description` text COLLATE utf8mb4_unicode_ci COMMENT 'Mô tả ngắn',
  `price` int NOT NULL COMMENT 'Giá bán (VNĐ)',
  `image_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Đường dẫn ảnh',
  `rating` decimal(2,1) NOT NULL DEFAULT '0.0' COMMENT 'Điểm đánh giá trung bình',
  `review_count` int NOT NULL DEFAULT '0' COMMENT 'Số lượt đánh giá',
  `delivery_info` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT 'Giao miễn phí' COMMENT 'Thông tin giao hàng',
  `delivery_time` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT '10–15 phút' COMMENT 'Thời gian giao dự kiến',
  `is_available` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1 = đang bán',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `products`
--

INSERT INTO `products` (`id`, `category_id`, `name`, `description`, `price`, `image_url`, `rating`, `review_count`, `delivery_info`, `delivery_time`, `is_available`, `created_at`, `updated_at`) VALUES
(2, 1, 'Pizza California', 'Kiểu California, nhiều rau tươi và phô mai.', 165000, 'assets/images/california.png', 4.8, 20, 'Giao miễn phí', '10–15 phút', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(3, 1, 'Pizza Sicilian', 'Đế dày Sicilian, sốt đậm đà, phô mai kéo sợi.', 155000, 'assets/images/sicilian.png', 4.2, 22, 'Giao miễn phí', '10–15 phút', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(4, 3, 'Burger bò phô mai', 'Burger bò Úc, phô mai tan chảy, ăn kèm rau.', 3000, 'assets/images/burger_bo_pho_mai.png', 4.6, 30, 'Giao miễn phí', '15–20 phút', 1, '2026-04-09 19:31:48', '2026-04-18 12:51:53'),
(5, 3, 'Burger gà giòn', 'Gà giòn, sốt đặc biệt, ăn kèm khoai tây.', 75000, 'assets/images/burger_ga_gion.png', 4.4, 18, 'Giao miễn phí', '12–18 phút', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(6, 3, 'Burger đôi', 'Hai nhân bò nướng, phô mai kép, no bụng.', 129000, 'assets/images/burger_doi.png', 4.7, 24, 'Giao miễn phí', '15–20 phút', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(7, 2, 'Bánh rán vòng', 'Bánh rán vòng giòn rụm, rắc đường.', 35000, 'assets/images/banh_ran_vong.png', 4.5, 20, 'Giao miễn phí', '10–15 phút', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(8, 2, 'Donut socola', 'Donut phủ socola đắng, béo ngậy.', 42000, 'assets/images/donut_socola.png', 4.8, 28, 'Giao miễn phí', '10–15 phút', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(9, 2, 'Bánh rán nhân kem', 'Bánh rán nhân kem lạnh, ngọt mát.', 38000, 'assets/images/banh_ran_nhan_kem.png', 4.6, 15, 'Giao miễn phí', '10–15 phút', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(10, 4, 'Taco thịt bò', 'Bánh taco thịt bò Mexico, rau tươi.', 55000, 'assets/images/taco_thit_bo.png', 4.7, 22, 'Giao miễn phí', '12–18 phút', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(11, 4, 'Burrito gà', 'Cuộn bột mì, nhân gà, đậu, cơm.', 65000, 'assets/images/burrito_ga.png', 4.5, 19, 'Giao miễn phí', '15–20 phút', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(12, 5, 'Phở bò', 'Nước dùng bò hầm, bánh phở tươi, rau thơm.', 55000, 'assets/images/pho_bo.png', 4.9, 45, 'Giao miễn phí', '15–20 phút', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(13, 5, 'Bún bò Huế', 'Bún bò cay đậm đà kiểu Huế.', 50000, 'assets/images/bun_bo_hue.png', 4.7, 32, 'Giao miễn phí', '12–18 phút', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(14, 6, 'Kem vani', 'Kem vani truyền thống, mát lạnh.', 25000, 'assets/images/kem_vani.png', 4.8, 26, 'Giao miễn phí', '10–15 phút', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48'),
(15, 6, 'Kem socola', 'Kem socola đậm đà, béo ngậy.', 28000, 'assets/images/kem_socola.png', 4.6, 21, 'Giao miễn phí', '10–15 phút', 1, '2026-04-09 19:31:48', '2026-04-09 19:31:48');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotions`
--

CREATE TABLE `promotions` (
  `id` int NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mã giảm giá',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mô tả',
  `discount_type` enum('fixed','percent') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Loại giảm: cố định / phần trăm',
  `discount_value` int NOT NULL COMMENT 'Giá trị giảm (VNĐ hoặc %)',
  `min_order` int NOT NULL DEFAULT '0' COMMENT 'Đơn tối thiểu để áp dụng',
  `max_uses` int DEFAULT NULL COMMENT 'Chỉ dùng x lần (NULL = không giới hạn)',
  `used_count` int NOT NULL DEFAULT '0',
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `promotions`
--

INSERT INTO `promotions` (`id`, `code`, `description`, `discount_type`, `discount_value`, `min_order`, `max_uses`, `used_count`, `start_date`, `end_date`, `created_at`) VALUES
(1, 'CANTHO-10258', 'Mã tặng khi nâng cấp thành viên Cần Thơ', 'fixed', 45000, 100000, 1, 0, '2026-03-01 00:00:00', '2026-12-31 23:59:59', '2026-04-09 19:31:48'),
(2, 'COMBO20', 'Giảm 20% khi đặt combo gia đình', 'percent', 20, 1000, NULL, 0, '2026-03-01 00:00:00', '2026-04-30 23:59:59', '2026-04-09 19:31:48'),
(3, 'WEEKEND15', 'Combo cuối tuần giảm thêm 15% cho đơn từ 250k', 'percent', 15, 250000, NULL, 0, '2026-03-01 00:00:00', '2026-06-30 23:59:59', '2026-04-09 19:31:48');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `full_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Họ và tên',
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Email đăng nhập',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Số điện thoại',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mật khẩu đã hash',
  `avatar_url` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'URL ảnh đại diện',
  `role` enum('client','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'client' COMMENT 'Vai trò',
  `membership` enum('free','premium') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'free' COMMENT 'Gói thành viên',
  `membership_plan_id` int DEFAULT NULL COMMENT 'Gói membership đang dùng',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `full_name`, `email`, `phone`, `password`, `avatar_url`, `role`, `membership`, `membership_plan_id`, `created_at`, `updated_at`) VALUES
(1, 'Nguyễn Văn A', 'khach@example.com', '0901234567', '$2b$10$abcdefghijklmnopqrstuv', 'assets/images/user_avatar.png', 'client', 'free', NULL, '2026-04-09 19:31:47', '2026-04-09 19:31:47'),
(2, 'Trần Thị B', 'tranthib@example.com', '0912345678', '$2b$10$abcdefghijklmnopqrstuv', NULL, 'client', 'premium', NULL, '2026-04-09 19:31:47', '2026-04-09 19:31:47'),
(3, 'Admin PC10258', 'admin@pc10258food.vn', '1900001234', '$2b$10$abcdefghijklmnopqrstuv', NULL, 'admin', 'free', NULL, '2026-04-09 19:31:47', '2026-04-09 19:31:47'),
(4, 'Nguyễn Văn Tests', 'test@example.com', '0988777666', '$2b$10$PiDvBdt5ETO3UBrsR9Eh0.D6BkSJUO8dct/aFiSPNg1eKCkYvIwm6', NULL, 'admin', 'premium', 2, '2026-04-09 13:12:18', '2026-04-15 11:43:03'),
(5, 'NGUYEN CONG BEN', 'nben940665@gmail.com', '222222222', '$2b$10$AFc2BZ2k3LNUXSixCC1omee2SNZwdEz35svy4jls0ChUYLcYqugzu', NULL, 'admin', 'free', 1, '2026-04-14 04:17:08', '2026-04-19 20:49:19');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wallets`
--

CREATE TABLE `wallets` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `balance` int NOT NULL DEFAULT '0' COMMENT 'Số dư hiện tại (VNĐ)',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `wallets`
--

INSERT INTO `wallets` (`id`, `user_id`, `balance`, `updated_at`) VALUES
(1, 1, 520000, '2026-04-09 19:31:48'),
(2, 2, 1200000, '2026-04-09 19:31:48'),
(3, 3, 0, '2026-04-09 19:31:48'),
(4, 4, 2000, '2026-04-15 11:43:03'),
(5, 5, 0, '2026-04-14 04:17:08');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `wallet_transactions`
--

CREATE TABLE `wallet_transactions` (
  `id` int NOT NULL,
  `wallet_id` int NOT NULL,
  `type` enum('deposit','payment','refund') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Loại giao dịch',
  `amount` int NOT NULL COMMENT 'Số tiền (dương = cộng, âm = trừ)',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Mô tả giao dịch',
  `reference_code` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Mã tham chiếu (VD: mã đơn hàng)',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `wallet_transactions`
--

INSERT INTO `wallet_transactions` (`id`, `wallet_id`, `type`, `amount`, `description`, `reference_code`, `created_at`) VALUES
(1, 1, 'deposit', 200000, 'Nạp tiền', NULL, '2026-03-16 10:15:00'),
(2, 1, 'payment', -178000, 'Thanh toán đơn #PC-5821', 'PC-5821', '2026-03-14 19:42:00'),
(3, 1, 'refund', 30000, 'Hoàn mã giảm giá', NULL, '2026-03-12 09:05:00'),
(4, 4, 'deposit', 2000, 'Nạp tiền', 'PC-PAY-202604151776232360', '2026-04-15 05:53:14'),
(5, 4, 'deposit', 2000, 'Nạp tiền', 'PC-PAY-202604151776252781', '2026-04-15 11:33:56'),
(6, 4, 'payment', 2000, 'Nâng cấp Membership - Thành viên Cần Thơ (2.000 VNĐ/tháng)', 'PC-WAL-202604151776253383', '2026-04-15 11:43:03');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_addresses_user` (`user_id`);

--
-- Chỉ mục cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_cart_user_product` (`user_id`,`product_id`),
  ADD KEY `fk_cart_product` (`product_id`),
  ADD KEY `idx_cart_user` (`user_id`);

--
-- Chỉ mục cho bảng `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_conv_user` (`user_id`);

--
-- Chỉ mục cho bảng `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_product` (`user_id`,`product_id`),
  ADD KEY `fk_favorites_product` (`product_id`),
  ADD KEY `idx_favorites_user` (`user_id`);

--
-- Chỉ mục cho bảng `membership_plans`
--
ALTER TABLE `membership_plans`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_msg_sender` (`sender_id`),
  ADD KEY `idx_messages_conv` (`conversation_id`,`created_at`);

--
-- Chỉ mục cho bảng `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_code` (`order_code`),
  ADD KEY `fk_orders_address` (`address_id`),
  ADD KEY `idx_orders_user_status` (`user_id`,`status`),
  ADD KEY `idx_orders_created` (`created_at` DESC);

--
-- Chỉ mục cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_oi_order` (`order_id`),
  ADD KEY `fk_oi_product` (`product_id`);

--
-- Chỉ mục cho bảng `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reference_code` (`reference_code`),
  ADD KEY `fk_payments_user` (`user_id`),
  ADD KEY `idx_payments_order_status` (`order_id`,`status`);

--
-- Chỉ mục cho bảng `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_products_category` (`category_id`),
  ADD KEY `idx_products_price` (`price`);

--
-- Chỉ mục cho bảng `promotions`
--
ALTER TABLE `promotions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Chỉ mục cho bảng `wallets`
--
ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_wt_wallet_created` (`wallet_id`,`created_at` DESC);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `addresses`
--
ALTER TABLE `addresses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT cho bảng `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT cho bảng `membership_plans`
--
ALTER TABLE `membership_plans`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT cho bảng `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT cho bảng `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT cho bảng `products`
--
ALTER TABLE `products`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT cho bảng `promotions`
--
ALTER TABLE `promotions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `wallets`
--
ALTER TABLE `wallets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `fk_addresses_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `conversations`
--
ALTER TABLE `conversations`
  ADD CONSTRAINT `fk_conv_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `fk_favorites_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_favorites_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `fk_msg_conv` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_address` FOREIGN KEY (`address_id`) REFERENCES `addresses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_oi_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_oi_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Ràng buộc cho bảng `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payments_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payments_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT;

--
-- Ràng buộc cho bảng `wallets`
--
ALTER TABLE `wallets`
  ADD CONSTRAINT `fk_wallets_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ràng buộc cho bảng `wallet_transactions`
--
ALTER TABLE `wallet_transactions`
  ADD CONSTRAINT `fk_wt_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallets` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
