// Idempotent migration: thêm cột checkout_url, expires_at vào bảng payments
// và index idx_payments_order_status. Chạy nhiều lần không gây lỗi.
// Usage: node scripts/run_migration_add_payment_checkout_url.js

const sequelize = require('../database');

(async () => {
    try {
        const [rows] = await sequelize.query("SHOW COLUMNS FROM payments");
        const existing = new Set(rows.map(r => r.Field));

        if (!existing.has('checkout_url')) {
            console.log('→ Adding column checkout_url ...');
            await sequelize.query(
                "ALTER TABLE payments ADD COLUMN checkout_url VARCHAR(500) NULL AFTER status"
            );
            console.log('  ✓ checkout_url added');
        } else {
            console.log('• checkout_url already exists, skip');
        }

        if (!existing.has('expires_at')) {
            console.log('→ Adding column expires_at ...');
            await sequelize.query(
                "ALTER TABLE payments ADD COLUMN expires_at DATETIME NULL AFTER checkout_url"
            );
            console.log('  ✓ expires_at added');
        } else {
            console.log('• expires_at already exists, skip');
        }

        const [indexes] = await sequelize.query("SHOW INDEX FROM payments WHERE Key_name = 'idx_payments_order_status'");
        if (indexes.length === 0) {
            console.log('→ Creating index idx_payments_order_status ...');
            await sequelize.query(
                "CREATE INDEX idx_payments_order_status ON payments(order_id, status)"
            );
            console.log('  ✓ index created');
        } else {
            console.log('• index idx_payments_order_status already exists, skip');
        }

        console.log('\n✅ Migration xong. Bạn có thể restart server.');
        await sequelize.close();
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration thất bại:', err.message);
        await sequelize.close().catch(() => {});
        process.exit(1);
    }
})();
