/**
 * cardManager.js — Card CRUD operations
 * FlashMind App
 */

import { dbManager } from '../db/database.js';
import { generateId } from '../utils.js';
import { fileManager } from './fileManager.js';

export class CardManager {

    // ─── CREATE ──────────────────────────────────────────────────

    /**
     * Create a new flashcard.
     * @param {{ deckId: string, front: string, back: string, cardType?: string, tags?: string[] }} opts
     */
    createCard({ deckId, front, back, cardType = 'basic', tags = [] }) {
        if (!deckId)       throw new Error('Card phải thuộc một deck');
        if (!front?.trim()) throw new Error('Mặt trước không được để trống');
        if (!back?.trim())  throw new Error('Mặt sau không được để trống');

        const id  = generateId();
        const now = Date.now();

        // Next position
        const posRow = dbManager.queryOne(
            'SELECT MAX(position) as maxPos FROM cards WHERE deck_id=?',
            [deckId]
        );
        const position = (posRow?.maxPos ?? -1) + 1;

        dbManager.transaction(() => {
            // Insert card
            dbManager.run(`
                INSERT INTO cards (id, deck_id, front, back, card_type, tags, position, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [id, deckId, front.trim(), back.trim(), cardType, JSON.stringify(tags), position, now, now]);

            // Initialize SRS data for new card
            dbManager.run(`
                INSERT INTO card_reviews (card_id, easiness, interval, repetitions, due_date, last_review)
                VALUES (?, 2.5, 0, 0, 0, 0)
            `, [id]);
        });

        fileManager.markDirty();
        return this.getCard(id);
    }

    // ─── READ ─────────────────────────────────────────────────────

    /**
     * Get a single card by ID.
     */
    getCard(id) {
        const card = dbManager.queryOne(`
            SELECT c.*, cr.easiness, cr.interval, cr.repetitions, cr.due_date, cr.last_review
            FROM cards c
            LEFT JOIN card_reviews cr ON cr.card_id = c.id
            WHERE c.id = ?
        `, [id]);
        if (card) card.tags = this._parseTags(card.tags);
        return card;
    }

    /**
     * Get all cards in a deck, ordered by position.
     * @param {string} deckId
     * @param {{ search?: string, cardType?: string }} [filters]
     */
    getCardsInDeck(deckId, filters = {}) {
        let sql = `
            SELECT c.*, cr.easiness, cr.interval, cr.repetitions, cr.due_date, cr.last_review
            FROM cards c
            LEFT JOIN card_reviews cr ON cr.card_id = c.id
            WHERE c.deck_id = ?
        `;
        const params = [deckId];

        if (filters.cardType) {
            sql += ' AND c.card_type = ?';
            params.push(filters.cardType);
        }
        if (filters.search) {
            sql += ' AND (c.front LIKE ? OR c.back LIKE ?)';
            const term = `%${filters.search}%`;
            params.push(term, term);
        }

        sql += ' ORDER BY c.position ASC, c.created_at ASC';

        const cards = dbManager.query(sql, params);
        return cards.map(c => ({ ...c, tags: this._parseTags(c.tags) }));
    }

    /**
     * Get cards due for review (repetitions > 0 AND due_date <= now).
     * These are "graduated" cards that need review.
     * @param {string} [deckId]
     * @param {number} [limit=200]
     */
    getDueCards(deckId = null, limit = 200) {
        const now = Date.now();
        let sql = `
            SELECT c.*, cr.easiness, cr.interval, cr.repetitions, cr.due_date, cr.last_review
            FROM cards c
            JOIN card_reviews cr ON cr.card_id = c.id
            WHERE cr.repetitions > 0 AND cr.due_date <= ?
        `;
        const params = [now];

        if (deckId) {
            sql += ' AND c.deck_id = ?';
            params.push(deckId);
        }

        sql += ' ORDER BY cr.due_date ASC LIMIT ?';
        params.push(limit);
        const cards = dbManager.query(sql, params);
        return cards.map(c => ({ ...c, tags: this._parseTags(c.tags) }));
    }

    /**
     * Get brand-new cards (never studied, repetitions = 0).
     * @param {string} [deckId]
     * @param {number} [limit=20]   Max new cards per session (Anki-style daily limit)
     */
    getNewCards(deckId = null, limit = 20) {
        let sql = `
            SELECT c.*, cr.easiness, cr.interval, cr.repetitions, cr.due_date, cr.last_review
            FROM cards c
            JOIN card_reviews cr ON cr.card_id = c.id
            WHERE cr.repetitions = 0
        `;
        const params = [];

        if (deckId) {
            sql += ' AND c.deck_id = ?';
            params.push(deckId);
        }

        sql += ' ORDER BY c.created_at ASC LIMIT ?';
        params.push(limit);
        const cards = dbManager.query(sql, params);
        return cards.map(c => ({ ...c, tags: this._parseTags(c.tags) }));
    }

    /**
     * Build a study queue: due reviews first, then new cards.
     * @param {string} deckId
     * @param {{ dueOnly?: boolean, newLimit?: number }} opts
     */
    buildStudyQueue(deckId, { dueOnly = false, newLimit = 20 } = {}) {
        const due  = this.getDueCards(deckId);
        const newC = dueOnly ? [] : this.getNewCards(deckId, newLimit);
        return [...due, ...newC];
    }

    /**
     * Get cards filtered by mastery level(s).
     * @param {string} deckId
     * @param {{ levels?: string[], limit?: number }} opts
     *   levels: 'new' | 'due' | 'learned'
     */
    getCardsByLevel(deckId, { levels = ['new', 'due', 'learned'], limit = 200 } = {}) {
        const now = Date.now();
        const conditions = [];
        if (levels.includes('new'))     conditions.push('cr.repetitions = 0');
        if (levels.includes('due'))     conditions.push(`(cr.repetitions > 0 AND cr.due_date <= ${now})`);
        if (levels.includes('learned')) conditions.push(`(cr.repetitions > 0 AND cr.due_date > ${now})`);

        if (!conditions.length) return [];

        let sql = `
            SELECT c.*, cr.easiness, cr.interval, cr.repetitions, cr.due_date, cr.last_review
            FROM cards c
            JOIN card_reviews cr ON cr.card_id = c.id
            WHERE c.deck_id = ? AND (${conditions.join(' OR ')})
            ORDER BY c.created_at ASC
            LIMIT ?
        `;
        const cards = dbManager.query(sql, [deckId, limit]);
        return cards.map(c => ({ ...c, tags: this._parseTags(c.tags) }));
    }

    /**
     * Get total due count for status bar.
     * @param {string} [deckId]
     */
    getDueCount(deckId = null) {
        const now = Date.now();
        let sql = `
            SELECT COUNT(*) as cnt FROM card_reviews cr
            JOIN cards c ON c.id = cr.card_id
            WHERE cr.repetitions > 0 AND cr.due_date <= ?
        `;
        const params = [now];
        if (deckId) { sql += ' AND c.deck_id = ?'; params.push(deckId); }
        return dbManager.queryOne(sql, params)?.cnt ?? 0;
    }

    /**
     * Search cards globally.
     * @param {string} query
     */
    searchCards(query) {
        const term = `%${query}%`;
        const cards = dbManager.query(`
            SELECT c.*, d.name as deck_name, d.icon as deck_icon, d.color as deck_color,
                   cr.due_date, cr.repetitions
            FROM cards c
            JOIN decks d ON d.id = c.deck_id
            LEFT JOIN card_reviews cr ON cr.card_id = c.id
            WHERE c.front LIKE ? OR c.back LIKE ? OR c.tags LIKE ?
            ORDER BY c.updated_at DESC
            LIMIT 50
        `, [term, term, term]);
        return cards.map(c => ({ ...c, tags: this._parseTags(c.tags) }));
    }

    // ─── UPDATE ───────────────────────────────────────────────────

    /**
     * Update a card.
     * @param {string} id
     * @param {{ front?: string, back?: string, cardType?: string, tags?: string[] }} updates
     */
    updateCard(id, updates) {
        const current = this.getCard(id);
        if (!current) throw new Error('Không tìm thấy thẻ');

        if (updates.front !== undefined && !updates.front.trim()) {
            throw new Error('Mặt trước không được để trống');
        }
        if (updates.back !== undefined && !updates.back.trim()) {
            throw new Error('Mặt sau không được để trống');
        }

        const now  = Date.now();
        const tags = updates.tags !== undefined
            ? JSON.stringify(updates.tags)
            : current.tags ? JSON.stringify(current.tags) : '[]';

        dbManager.run(`
            UPDATE cards SET
                front      = COALESCE(?, front),
                back       = COALESCE(?, back),
                card_type  = COALESCE(?, card_type),
                tags       = ?,
                updated_at = ?
            WHERE id = ?
        `, [
            updates.front?.trim() ?? null,
            updates.back?.trim()  ?? null,
            updates.cardType      ?? null,
            tags,
            now,
            id,
        ]);

        fileManager.markDirty();
        return this.getCard(id);
    }

    // ─── DELETE ───────────────────────────────────────────────────

    /**
     * Delete a card and its SRS data.
     * @param {string} id
     */
    deleteCard(id) {
        dbManager.transaction(() => {
            dbManager.run('DELETE FROM card_reviews WHERE card_id=?', [id]);
            dbManager.run('DELETE FROM review_history WHERE card_id=?', [id]);
            dbManager.run('DELETE FROM cards WHERE id=?', [id]);
        });
        fileManager.markDirty();
    }

    /**
     * Delete all cards in a deck.
     * @param {string} deckId
     */
    deleteAllInDeck(deckId) {
        const cards = this.getCardsInDeck(deckId);
        dbManager.transaction(() => {
            for (const card of cards) {
                dbManager.run('DELETE FROM card_reviews WHERE card_id=?', [card.id]);
                dbManager.run('DELETE FROM review_history WHERE card_id=?', [card.id]);
            }
            dbManager.run('DELETE FROM cards WHERE deck_id=?', [deckId]);
        });
        fileManager.markDirty();
    }

    /**
     * Reorder cards within a deck.
     * @param {string[]} orderedIds
     */
    reorderCards(orderedIds) {
        dbManager.transaction(() => {
            orderedIds.forEach((id, pos) => {
                dbManager.run('UPDATE cards SET position=? WHERE id=?', [pos, id]);
            });
        });
        fileManager.markDirty();
    }

    // ─── HELPERS ─────────────────────────────────────────────────

    _parseTags(tagsStr) {
        if (!tagsStr) return [];
        if (Array.isArray(tagsStr)) return tagsStr;
        try { return JSON.parse(tagsStr); } catch { return []; }
    }

    parseTags(input) {
        if (!input) return [];
        return input.split(',').map(t => t.trim()).filter(Boolean);
    }

    stringifyTags(tags) {
        return Array.isArray(tags) ? tags.join(', ') : '';
    }

    /**
     * Get SRS status label for a card.
     * @param {{ repetitions: number, due_date: number }} card
     * @returns {'new'|'due'|'learned'|'overdue'}
     */
    getSrsStatus(card) {
        if (!card.repetitions) return 'new';
        const now = Date.now();
        if (card.due_date <= now) {
            return card.due_date < now - 86400000 ? 'overdue' : 'due';
        }
        return 'learned';
    }
}

export const cardManager = new CardManager();
