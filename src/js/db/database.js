/**
 * database.js — SQLite Database Manager (sql.js wrapper)
 * FlashMind App
 */

import {
    CREATE_TABLES_SQL,
    SCHEMA_VERSION,
    getSchemaVersion,
    setSchemaVersion,
    initDefaultSettings,
} from './schema.js';

export class DatabaseManager {
    constructor() {
        /** @type {import('sql.js').Database|null} */
        this.db = null;
        this._SQL = null;
    }

    /**
     * Initialize sql.js WASM engine (must call once before anything else).
     * The global `initSqlJs` is loaded via CDN in index.html.
     */
    async initEngine() {
        if (this._SQL) return;
        this._SQL = await window.initSqlJs({
            locateFile: file =>
                `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/${file}`,
        });
    }

    /**
     * Create a fresh in-memory database with schema applied.
     */
    async createNew() {
        await this.initEngine();
        this.db = new this._SQL.Database();
        this._applySchema();
        return this;
    }

    /**
     * Load a database from raw bytes (Uint8Array from .flashcard ZIP).
     * @param {Uint8Array} bytes
     */
    async loadFromBytes(bytes) {
        await this.initEngine();
        this.db = new this._SQL.Database(bytes);
        this._applySchema(); // run migrations if needed
        return this;
    }

    /**
     * Export current DB as Uint8Array (for saving to .flashcard ZIP).
     * @returns {Uint8Array}
     */
    exportBytes() {
        if (!this.db) throw new Error('Database not initialized');
        return this.db.export();
    }

    /**
     * Apply schema migrations.
     */
    _applySchema() {
        const currentVersion = getSchemaVersion(this.db);
        if (currentVersion < SCHEMA_VERSION) {
            this.db.exec(CREATE_TABLES_SQL);
            initDefaultSettings(this.db);
            setSchemaVersion(this.db, SCHEMA_VERSION);
        }
    }

    // ─── QUERY HELPERS ───────────────────────────────────────────

    /**
     * Execute a SELECT query and return array of row objects.
     * @param {string} sql
     * @param {any[]} [params]
     * @returns {Object[]}
     */
    query(sql, params = []) {
        if (!this.db) throw new Error('Database not initialized');
        const result = this.db.exec(sql, params);
        if (!result.length) return [];
        const { columns, values } = result[0];
        return values.map(row =>
            Object.fromEntries(columns.map((col, i) => [col, row[i]]))
        );
    }

    /**
     * Execute a single SELECT and return first row or null.
     * @param {string} sql
     * @param {any[]} [params]
     * @returns {Object|null}
     */
    queryOne(sql, params = []) {
        const rows = this.query(sql, params);
        return rows.length ? rows[0] : null;
    }

    /**
     * Execute INSERT/UPDATE/DELETE.
     * @param {string} sql
     * @param {any[]} [params]
     */
    run(sql, params = []) {
        if (!this.db) throw new Error('Database not initialized');
        this.db.run(sql, params);
    }

    /**
     * Execute multiple statements (no params).
     * @param {string} sql
     */
    exec(sql) {
        if (!this.db) throw new Error('Database not initialized');
        this.db.exec(sql);
    }

    /**
     * Begin a transaction, run fn, commit or rollback on error.
     * @param {Function} fn
     */
    transaction(fn) {
        this.run('BEGIN');
        try {
            fn();
            this.run('COMMIT');
        } catch (e) {
            this.run('ROLLBACK');
            throw e;
        }
    }

    // ─── SETTINGS ────────────────────────────────────────────────

    getSetting(key, defaultValue = null) {
        const row = this.queryOne('SELECT value FROM settings WHERE key=?', [key]);
        if (!row) return defaultValue;
        try { return JSON.parse(row.value); } catch { return row.value; }
    }

    setSetting(key, value) {
        this.run(
            'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
            [key, JSON.stringify(value)]
        );
    }

    getAllSettings() {
        const rows = this.query('SELECT key, value FROM settings');
        return Object.fromEntries(
            rows.map(r => {
                try { return [r.key, JSON.parse(r.value)]; }
                catch { return [r.key, r.value]; }
            })
        );
    }

    // ─── STATS HELPERS ───────────────────────────────────────────

    getTotalCards() {
        const row = this.queryOne('SELECT COUNT(*) as cnt FROM cards');
        return row ? row.cnt : 0;
    }

    getDueCount() {
        const now = Date.now();
        const row = this.queryOne(
            'SELECT COUNT(*) as cnt FROM card_reviews WHERE due_date <= ? AND due_date > 0',
            [now]
        );
        return row ? row.cnt : 0;
    }

    getMasteredCount() {
        const row = this.queryOne(
            'SELECT COUNT(*) as cnt FROM card_reviews WHERE interval >= 21 AND repetitions >= 3'
        );
        return row ? row.cnt : 0;
    }

    getDeckCardCount(deckId) {
        const row = this.queryOne(
            'SELECT COUNT(*) as cnt FROM cards WHERE deck_id=?',
            [deckId]
        );
        return row ? row.cnt : 0;
    }

    getDeckDueCount(deckId) {
        const now = Date.now();
        const row = this.queryOne(`
            SELECT COUNT(*) as cnt FROM card_reviews cr
            JOIN cards c ON c.id = cr.card_id
            WHERE c.deck_id = ? AND cr.due_date <= ? AND cr.due_date > 0
        `, [deckId, now]);
        return row ? row.cnt : 0;
    }

    close() {
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    }
}

// Singleton instance
export const dbManager = new DatabaseManager();
