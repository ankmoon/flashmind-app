/**
 * schema.js — SQLite Database Schema & Migrations
 * FlashMind App
 */

export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
-- App metadata
CREATE TABLE IF NOT EXISTS app_meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Deck hierarchy (supports nested decks)
CREATE TABLE IF NOT EXISTS decks (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    parent_id  TEXT DEFAULT NULL,
    color      TEXT DEFAULT '#7c5cfc',
    icon       TEXT DEFAULT '📚',
    position   INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (parent_id) REFERENCES decks(id) ON DELETE CASCADE
);

-- Flashcards
CREATE TABLE IF NOT EXISTS cards (
    id         TEXT PRIMARY KEY,
    deck_id    TEXT NOT NULL,
    front      TEXT NOT NULL,
    back       TEXT NOT NULL,
    card_type  TEXT DEFAULT 'basic',
    tags       TEXT DEFAULT '[]',
    position   INTEGER DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
);

-- SRS data (SM-2)
CREATE TABLE IF NOT EXISTS card_reviews (
    card_id     TEXT PRIMARY KEY,
    easiness    REAL    DEFAULT 2.5,
    interval    INTEGER DEFAULT 0,
    repetitions INTEGER DEFAULT 0,
    due_date    INTEGER DEFAULT 0,
    last_review INTEGER DEFAULT 0,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Review history
CREATE TABLE IF NOT EXISTS review_history (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    card_id     TEXT NOT NULL,
    deck_id     TEXT NOT NULL,
    reviewed_at INTEGER NOT NULL,
    rating      INTEGER NOT NULL,
    time_spent  INTEGER DEFAULT 0,
    FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- Key-value settings store
CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cards_deck    ON cards(deck_id);
CREATE INDEX IF NOT EXISTS idx_cards_type    ON cards(card_type);
CREATE INDEX IF NOT EXISTS idx_reviews_due   ON card_reviews(due_date);
CREATE INDEX IF NOT EXISTS idx_history_card  ON review_history(card_id);
CREATE INDEX IF NOT EXISTS idx_history_date  ON review_history(reviewed_at);
CREATE INDEX IF NOT EXISTS idx_decks_parent  ON decks(parent_id);
`;

export const DEFAULT_SETTINGS = {
    theme: 'dark',
    daily_new_cards: 20,
    daily_review_limit: 100,
    study_order: 'due',         // 'due' | 'random' | 'position'
    auto_save: true,
    show_answer_time: true,
    whop_key: '',
    license_validated_at: 0,
    streak: 0,
    last_study_date: 0,
    srs_intervals: {
        again: { value: 10, unit: 'min' },
        hard:  { value: 1,  unit: 'day' },
        good:  { value: 1,  unit: 'day' },
        easy:  { value: 4,  unit: 'day' }
    }
};

export function getSchemaVersion(db) {
    try {
        const result = db.exec("SELECT value FROM app_meta WHERE key='schema_version'");
        if (result.length && result[0].values.length) {
            return parseInt(result[0].values[0][0], 10);
        }
    } catch (_) { /* table may not exist yet */ }
    return 0;
}

export function setSchemaVersion(db, version) {
    db.run(`
        INSERT OR REPLACE INTO app_meta (key, value)
        VALUES ('schema_version', ?)
    `, [String(version)]);
}

export function initDefaultSettings(db) {
    for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
        db.run(`
            INSERT OR IGNORE INTO settings (key, value)
            VALUES (?, ?)
        `, [key, JSON.stringify(value)]);
    }
}
