/**
 * deckManager.js — Deck CRUD operations
 * FlashMind App
 */

import { dbManager } from '../db/database.js';
import { generateId } from '../utils.js';
import { fileManager } from './fileManager.js';

export class DeckManager {

    // ─── CREATE ──────────────────────────────────────────────────

    /**
     * Create a new deck.
     * @param {{ name: string, parentId?: string, color?: string, icon?: string }} opts
     * @returns {{ id: string, name: string, ... }}
     */
    createDeck({ name, parentId = null, color = '#7c5cfc', icon = '📚' }) {
        if (!name?.trim()) throw new Error('Tên deck không được để trống');

        const id  = generateId();
        const now = Date.now();

        // Get next position in parent
        const posRow = dbManager.queryOne(
            'SELECT MAX(position) as maxPos FROM decks WHERE parent_id IS ?',
            [parentId]
        );
        const position = (posRow?.maxPos ?? -1) + 1;

        dbManager.run(`
            INSERT INTO decks (id, name, parent_id, color, icon, position, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, name.trim(), parentId, color, icon, position, now, now]);

        fileManager.markDirty();

        return this.getDeck(id);
    }

    // ─── READ ─────────────────────────────────────────────────────

    /**
     * Get a single deck by ID.
     */
    getDeck(id) {
        return dbManager.queryOne('SELECT * FROM decks WHERE id=?', [id]);
    }

    /**
     * Get all root decks (no parent), ordered by position.
     */
    getRootDecks() {
        return dbManager.query(
            'SELECT * FROM decks WHERE parent_id IS NULL ORDER BY position ASC, name ASC'
        );
    }

    /**
     * Get children of a deck.
     * @param {string} parentId
     */
    getChildDecks(parentId) {
        return dbManager.query(
            'SELECT * FROM decks WHERE parent_id=? ORDER BY position ASC, name ASC',
            [parentId]
        );
    }

    /**
     * Get all decks as a flat list.
     */
    getAllDecks() {
        return dbManager.query('SELECT * FROM decks ORDER BY name ASC');
    }

    /**
     * Build a full deck tree (recursive).
     * @returns {Array} - Nested deck objects with `children` array
     */
    getDeckTree() {
        const all = dbManager.query('SELECT * FROM decks ORDER BY position ASC, name ASC');
        const byId   = {};
        const roots  = [];

        for (const deck of all) {
            deck.children = [];
            deck.cardCount = dbManager.getDeckCardCount(deck.id);
            deck.dueCount  = dbManager.getDeckDueCount(deck.id);
            byId[deck.id]  = deck;
        }

        for (const deck of all) {
            if (deck.parent_id && byId[deck.parent_id]) {
                byId[deck.parent_id].children.push(deck);
            } else {
                roots.push(deck);
            }
        }

        return roots;
    }

    /**
     * Count total cards in deck (including sub-decks if recursive).
     * @param {string} deckId
     * @param {boolean} [recursive=false]
     */
    getCardCount(deckId, recursive = false) {
        if (!recursive) return dbManager.getDeckCardCount(deckId);

        const ids = this._getAllDescendantIds(deckId);
        ids.push(deckId);
        const placeholders = ids.map(() => '?').join(',');
        const row = dbManager.queryOne(
            `SELECT COUNT(*) as cnt FROM cards WHERE deck_id IN (${placeholders})`,
            ids
        );
        return row?.cnt ?? 0;
    }

    /**
     * Get all descendant deck IDs (for recursive operations).
     * @param {string} deckId
     * @returns {string[]}
     */
    _getAllDescendantIds(deckId) {
        const children = this.getChildDecks(deckId);
        const ids = children.map(d => d.id);
        for (const child of children) {
            ids.push(...this._getAllDescendantIds(child.id));
        }
        return ids;
    }

    // ─── UPDATE ───────────────────────────────────────────────────

    /**
     * Update deck properties.
     * @param {string} id
     * @param {{ name?: string, color?: string, icon?: string, parentId?: string }} updates
     */
    updateDeck(id, updates) {
        const current = this.getDeck(id);
        if (!current) throw new Error('Không tìm thấy deck');

        if (updates.name !== undefined && !updates.name.trim()) {
            throw new Error('Tên deck không được để trống');
        }

        // Prevent circular references
        if (updates.parentId !== undefined && updates.parentId === id) {
            throw new Error('Deck không thể là cha của chính nó');
        }

        const now = Date.now();
        dbManager.run(`
            UPDATE decks SET
                name      = COALESCE(?, name),
                color     = COALESCE(?, color),
                icon      = COALESCE(?, icon),
                parent_id = ?,
                updated_at = ?
            WHERE id = ?
        `, [
            updates.name?.trim() ?? null,
            updates.color ?? null,
            updates.icon  ?? null,
            updates.parentId !== undefined ? updates.parentId : current.parent_id,
            now,
            id,
        ]);

        fileManager.markDirty();
        return this.getDeck(id);
    }

    // ─── DELETE ───────────────────────────────────────────────────

    /**
     * Delete a deck and all its cards (cascades via FK).
     * @param {string} id
     */
    deleteDeck(id) {
        // Recursively delete sub-decks first
        const children = this.getChildDecks(id);
        for (const child of children) {
            this.deleteDeck(child.id);
        }

        // Delete cards in this deck (reviews/history cascade via FK)
        dbManager.run('DELETE FROM cards WHERE deck_id=?', [id]);
        dbManager.run('DELETE FROM decks WHERE id=?', [id]);

        fileManager.markDirty();
    }

    /**
     * Reorder decks within the same parent.
     * @param {string[]} orderedIds
     */
    reorderDecks(orderedIds) {
        dbManager.transaction(() => {
            orderedIds.forEach((id, pos) => {
                dbManager.run('UPDATE decks SET position=? WHERE id=?', [pos, id]);
            });
        });
        fileManager.markDirty();
    }
}

export const deckManager = new DeckManager();
