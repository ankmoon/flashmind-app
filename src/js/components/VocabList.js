/**
 * VocabList.js — Detailed Vocabulary Table View
 * FlashMind App
 */

import { dbManager }   from '../db/database.js';
import { srsManager }  from '../modules/srs.js';
import { bus, setVisible, renderMarkdown } from '../utils.js';

export class VocabList {
    constructor() {
        this.containerId = 'card-grid'; // Reuse the card grid container or a separate one?
        // Actually, it's better to use a dedicated container if we want to toggle.
        // But the user likes "Premium" UI, so let's make it a clean table.
    }

    init() {
        // No specific init needed yet
    }

    render(deckId) {
        const cards = dbManager.query(`
            SELECT c.*, cr.easiness, cr.interval, cr.repetitions, cr.due_date, cr.last_review
            FROM cards c
            JOIN card_reviews cr ON c.id = cr.card_id
            WHERE c.deck_id = ?
            ORDER BY c.position ASC, c.created_at DESC
        `, [deckId]);

        const container = document.getElementById('card-grid');
        if (!container) return;

        if (cards.length === 0) {
            container.innerHTML = `
                <div class="content-empty-state">
                    <div class="empty-state-icon">🃏</div>
                    <h3>Chưa có thẻ nào</h3>
                    <p>Hãy thêm thẻ mới vào bộ này nhé.</p>
                </div>
            `;
            return;
        }

        let html = `
            <div class="vocab-table-container">
                <table class="deck-progress-table vocab-list-table">
                    <thead>
                        <tr>
                            <th>Từ vựng / Câu hỏi</th>
                            <th>Lần học cuối</th>
                            <th>% Thử lại</th>
                            <th>Lần lặp tới</th>
                            <th>Độ khó</th>
                            <th>Loại</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        cards.forEach(card => {
            const retryPercent = this._calculateRetryPercent(card.id);
            const nextReview = srsManager.getIntervalText((card.due_date - Date.now()) / (24 * 60 * 60 * 1000));
            const difficulty = this._mapEasinessToDifficulty(card.easiness);
            const lastReviewText = card.last_review > 0 ? new Date(card.last_review).toLocaleDateString('vi-VN') : 'Chưa học';
            const typeClass = card.repetitions === 0 ? 'badge-new' : 'badge-due';
            const typeLabel = card.repetitions === 0 ? 'Mới' : 'Ôn lại';

            html += `
                <tr class="vocab-row clickable" data-card-id="${card.id}">
                    <td class="vocab-front">${this._stripMarkdown(card.front)}</td>
                    <td class="stat-cell">${lastReviewText}</td>
                    <td class="stat-cell">${retryPercent}%</td>
                    <td class="stat-cell">${nextReview}</td>
                    <td class="stat-cell">
                        <div class="mini-progress-wrap">
                            <div class="mini-progress-track">
                                <div class="mini-progress-fill" style="width: ${difficulty}%; background: ${this._getDifficultyColor(difficulty)}"></div>
                            </div>
                            <span class="mini-progress-label">${difficulty}%</span>
                        </div>
                    </td>
                    <td class="stat-cell">
                        <span class="vocab-badge ${typeClass}">${typeLabel}</span>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;

        // Bind events
        container.querySelectorAll('.vocab-row').forEach(row => {
            row.addEventListener('click', () => {
                const cardId = row.dataset.cardId;
                bus.emit('card:edit', cardId);
            });
        });
    }

    _calculateRetryPercent(cardId) {
        const history = dbManager.query('SELECT rating FROM review_history WHERE card_id=?', [cardId]);
        if (history.length === 0) return 0;
        const failed = history.filter(h => h.rating < 3).length;
        return Math.round((failed / history.length) * 100);
    }

    _mapEasinessToDifficulty(easiness) {
        // SM-2 Easiness range: 1.3 (hardest) to 2.5+ (easiest)
        // Let's map 1.3 -> 100% difficulty, 2.5 -> 0% difficulty
        // Formula: clamp(100 - (easiness - 1.3) / (2.5 - 1.3) * 100, 0, 100)
        let diff = 100 - ((easiness - 1.3) / 1.2) * 100;
        return Math.max(0, Math.min(100, Math.round(diff)));
    }

    _getDifficultyColor(percent) {
        if (percent < 30) return '#10b981'; // Green (Easy)
        if (percent < 70) return '#f59e0b'; // Orange (Medium)
        return '#ef4444'; // Red (Hard)
    }

    _stripMarkdown(md) {
        // Simple regex to strip markdown for table view
        return md.replace(/[#*`_\[\]()]/g, '').substring(0, 50) + (md.length > 50 ? '...' : '');
    }
}

export const vocabList = new VocabList();
