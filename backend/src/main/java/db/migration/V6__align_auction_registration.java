package db.migration;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;

import java.sql.Connection;
import java.sql.SQLException;

public class V6__align_auction_registration extends BaseJavaMigration {
    @Override
    public void migrate(final Context context) throws Exception {
        final Connection db = context.getConnection();
        execute(db, "CREATE TABLE IF NOT EXISTS categories (category_id BIGINT PRIMARY KEY AUTO_INCREMENT, category_name VARCHAR(30) NOT NULL UNIQUE)");
        execute(db, "CREATE TABLE IF NOT EXISTS auctions (auction_id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, category_id BIGINT NOT NULL, item_name VARCHAR(100) NOT NULL, item_image VARCHAR(500), description TEXT, start_price BIGINT NOT NULL DEFAULT 1000, current_price BIGINT NOT NULL, bid_count BIGINT NOT NULL DEFAULT 0, start_at DATETIME NOT NULL, end_at DATETIME NOT NULL, status VARCHAR(20) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME, is_deleted BOOLEAN NOT NULL DEFAULT FALSE, deleted_at DATETIME)");
        execute(db, "CREATE TABLE IF NOT EXISTS bids (bid_id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, auction_id BIGINT NOT NULL, bid_price BIGINT NOT NULL, bid_at DATETIME NOT NULL)");
        execute(db, "CREATE TABLE IF NOT EXISTS auction_candidates (candidate_id BIGINT PRIMARY KEY AUTO_INCREMENT, bid_id BIGINT NOT NULL, user_id BIGINT NOT NULL, auction_id BIGINT NOT NULL, candidate_rank BIGINT NOT NULL, bid_price BIGINT NOT NULL, status VARCHAR(20) NOT NULL, offered_at DATETIME, deadline_at DATETIME, processed_at DATETIME)");
        rename(db, "auctions", "title", "item_name");
        rename(db, "auctions", "image", "item_image");
        rename(db, "categories", "name", "category_name");
        rename(db, "users", "image", "user_image");
        // V1이 만든 CHECK 제약이 point_balance 열을 쓰고 있어서, 열 이름을 바꾸기 전에 지우고 새 이름으로 다시 만들어요.
        final boolean renamePoint = column(db, "users", "point_balance") && !column(db, "users", "point");
        if (renamePoint && checkExists(db, "users", "ck_users_point_balance")) {
            execute(db, "ALTER TABLE users DROP CHECK ck_users_point_balance");
        }
        rename(db, "users", "point_balance", "point");
        if (column(db, "users", "point") && !checkExists(db, "users", "ck_users_point_balance")) {
            execute(db, "ALTER TABLE users ADD CONSTRAINT ck_users_point_balance CHECK (point >= 0)");
        }
        add(db, "users", "name", "VARCHAR(50) NULL");
        execute(db, "UPDATE users SET name = LEFT(nickname, 50) WHERE name IS NULL");
        execute(db, "ALTER TABLE users MODIFY name VARCHAR(50) NOT NULL, MODIFY email VARCHAR(254) NOT NULL, MODIFY user_image VARCHAR(500) NULL");
        add(db, "users", "role", "VARCHAR(20) NOT NULL DEFAULT 'USER'");
        add(db, "users", "points_checked_at", "DATETIME NULL");
        add(db, "auctions", "bid_count", "BIGINT NOT NULL DEFAULT 0");
        execute(db, "UPDATE auctions a SET bid_count = (SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.auction_id)");
        execute(db, "UPDATE auctions SET current_price = start_price WHERE current_price IS NULL");
        execute(db, "ALTER TABLE auctions MODIFY start_price BIGINT NOT NULL DEFAULT 1000, MODIFY current_price BIGINT NOT NULL");
        if (!column(db, "auction_candidates", "auction_id")) {
            try (final var statement = db.createStatement(); final var rows = statement.executeQuery("SELECT COUNT(*) FROM auction_candidates")) {
                rows.next();
                if (rows.getLong(1) != 0) {
                    throw new SQLException("Existing auction candidates require explicit auction/rank backfill before migration");
                }
            }
        }
        add(db, "auction_candidates", "auction_id", "BIGINT NOT NULL");
        add(db, "auction_candidates", "candidate_rank", "BIGINT NOT NULL");
        add(db, "auction_candidates", "bid_price", "BIGINT NOT NULL");
        primary(db, "auctions", "auction_id");
        int foreignKeyChecks;
        try (final var statement = db.createStatement(); final var rows = statement.executeQuery("SELECT @@SESSION.foreign_key_checks")) {
            rows.next();
            foreignKeyChecks = rows.getInt(1);
        }
        execute(db, "SET SESSION foreign_key_checks = 0");
        try {
            for (final String table : new String[]{"users", "categories", "auctions", "bids", "auction_candidates", "donations", "donation_targets", "point_histories"}) {
                final String id = switch (table) {
                    case "users" -> "user_id";
                    case "categories" -> "category_id";
                    case "auctions" -> "auction_id";
                    case "bids" -> "bid_id";
                    case "auction_candidates" -> "candidate_id";
                    case "donations" -> "donation_id";
                    case "donation_targets" -> "target_id";
                    default -> "point_id";
                };
                try (final var rows = db.getMetaData().getColumns(db.getCatalog(), null, table, id)) {
                    if (rows.next() && "YES".equals(rows.getString("IS_AUTOINCREMENT"))) continue;
                }
                execute(db, "ALTER TABLE " + table + " MODIFY " + id + " BIGINT NOT NULL AUTO_INCREMENT");
            }
        } finally {
            execute(db, "SET SESSION foreign_key_checks = " + foreignKeyChecks);
        }
        unique(db, "auction_candidates", "uk_auction_candidate_user", "auction_id, user_id");
        unique(db, "auction_candidates", "uk_auction_candidate_bid", "bid_id");
        unique(db, "auction_candidates", "uk_auction_candidate_rank", "auction_id, candidate_rank");
        execute(db, "INSERT INTO categories (category_name) SELECT '기타' WHERE NOT EXISTS (SELECT 1 FROM categories WHERE category_name = '기타')");
    }

    private boolean column(final Connection db, final String table, final String name) throws SQLException {
        try (final var rows = db.getMetaData().getColumns(db.getCatalog(), null, table, name)) {
            return rows.next();
        }
    }

    private boolean checkExists(final Connection db, final String table, final String name) throws SQLException {
        try (final var statement = db.prepareStatement("SELECT COUNT(*) FROM information_schema.table_constraints WHERE constraint_schema = DATABASE() AND table_name = ? AND constraint_name = ? AND constraint_type = 'CHECK'")) {
            statement.setString(1, table);
            statement.setString(2, name);
            try (final var rows = statement.executeQuery()) {
                rows.next();
                return rows.getInt(1) > 0;
            }
        }
    }

    private void rename(final Connection db, final String table, final String before, final String after) throws SQLException {
        if (column(db, table, before) && !column(db, table, after)) {
            execute(db, "ALTER TABLE " + table + " RENAME COLUMN " + before + " TO " + after);
        } else if (column(db, table, before) && column(db, table, after)) {
            throw new SQLException("Both legacy and ERD columns exist: " + table + "." + before + "/" + after);
        }
    }

    private void add(final Connection db, final String table, final String name, final String definition) throws SQLException {
        if (!column(db, table, name)) {
            execute(db, "ALTER TABLE " + table + " ADD COLUMN " + name + " " + definition);
        }
    }

    private void primary(final Connection db, final String table, final String id) throws SQLException {
        try (final var rows = db.getMetaData().getPrimaryKeys(db.getCatalog(), null, table)) {
            if (rows.next()) return;
        }
        execute(db, "ALTER TABLE " + table + " ADD PRIMARY KEY (" + id + ")");
    }

    private void unique(final Connection db, final String table, final String name, final String columns) throws SQLException {
        try (final var rows = db.getMetaData().getIndexInfo(db.getCatalog(), null, table, true, false)) {
            while (rows.next()) {
                if (name.equals(rows.getString("INDEX_NAME"))) return;
            }
        }
        execute(db, "ALTER TABLE " + table + " ADD CONSTRAINT " + name + " UNIQUE (" + columns + ")");
    }

    private void execute(final Connection db, final String sql) throws SQLException {
        try (final var statement = db.createStatement()) {
            statement.execute(sql);
        }
    }
}
