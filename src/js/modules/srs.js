/**
 * srs.js — SM-2 Spaced Repetition System Algorithm
 * FlashMind App
 *
 * Based on SuperMemo SM-2 algorithm:
 * https://www.supermemo.com/english/ol/sm2.htm
 */

import { dbManager } from '../db/database.js';

// Rating scale:
// 1 = Quên hoàn toàn
// 2 = Khó, nhớ mơ hồ
// 3 = Đúng nhưng tốn công sức
// 4 = Đúng, dễ nhớ
// 5 = Đúng ngay lập tức, rất dễ

export class SRSManager {
    constructor() {
        this.MIN_EASINESS = 1.3;
    }

    /**
     * Convert SRS config (value + unit) to fractional days.
     * @param {{ value: number, unit: string }} config
     * @returns {number}
     */
    _toDays(config) {
        if (!config) return 1;
        const { value, unit } = config;
        if (unit === 'min')  return value / (24 * 60);
        if (unit === 'hour') return value / 24;
        return value; // days
    }

    /**
     * Calculate next review schedule based on SM-2.
     * @param {number} rating - 1 to 5
     * @param {{ easiness: number, interval: number, repetitions: number }} current
     * @returns {{ easiness: number, interval: number, repetitions: number, dueDate: number }}
     */
    calculateNextReview(rating, current) {
        let { easiness = 2.5, interval = 0, repetitions = 0 } = current;
        const settings = dbManager.getSetting('srs_intervals') || {
            again: { value: 10, unit: 'min' },
            hard:  { value: 1,  unit: 'day' },
            good:  { value: 1,  unit: 'day' },
            easy:  { value: 4,  unit: 'day' }
        };

        if (rating >= 3) {
            // Correct response (Good or Easy)
            if (repetitions === 0) {
                interval = (rating === 5) ? this._toDays(settings.easy) : this._toDays(settings.good);
            } else if (repetitions === 1) {
                // For SM-2, the second interval is usually 6 days.
                // If it's a "custom" good/easy, we can scale it or use a default.
                // Let's stick to SM-2 formula but adjust starting points.
                interval = 6;
            } else {
                interval = Math.round(interval * easiness);
            }
            repetitions += 1;
        } else {
            // Incorrect response (Again or Hard in this app's logic for rating < 3)
            repetitions = 0;
            interval = (rating === 1) ? this._toDays(settings.again) : this._toDays(settings.hard);
        }

        // Update E-Factor (difficulty modifier)
        easiness = easiness + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
        easiness = Math.max(this.MIN_EASINESS, easiness);

        const dueDate = Date.now() + interval * 24 * 60 * 60 * 1000;

        return { easiness, interval, repetitions, dueDate };
    }

    /**
     * Record a review for a card and update SRS data.
     * @param {string} cardId
     * @param {string} deckId
     * @param {number} rating - 1 to 5
     * @param {number} [timeSpent] - seconds spent on card
     */
    recordReview(cardId, deckId, rating, timeSpent = 0) {
        // Get current SRS data
        const current = dbManager.queryOne(
            'SELECT * FROM card_reviews WHERE card_id=?',
            [cardId]
        );

        if (!current) {
            throw new Error(`No SRS data found for card ${cardId}`);
        }

        const next = this.calculateNextReview(rating, {
            easiness:    current.easiness,
            interval:    current.interval,
            repetitions: current.repetitions,
        });

        const now = Date.now();

        dbManager.transaction(() => {
            // Update SRS data
            dbManager.run(`
                UPDATE card_reviews SET
                    easiness    = ?,
                    interval    = ?,
                    repetitions = ?,
                    due_date    = ?,
                    last_review = ?
                WHERE card_id = ?
            `, [next.easiness, next.interval, next.repetitions, next.dueDate, now, cardId]);

            // Log to history
            dbManager.run(`
                INSERT INTO review_history (card_id, deck_id, reviewed_at, rating, time_spent)
                VALUES (?, ?, ?, ?, ?)
            `, [cardId, deckId, now, rating, timeSpent]);
        });

        // Update streak
        this._updateStreak();

        return next;
    }

    /**
     * Update the daily study streak.
     */
    _updateStreak() {
        const today = this._todayTimestamp();
        const lastStudy = parseInt(dbManager.getSetting('last_study_date', 0));
        const yesterday = today - 86400000;

        let streak = parseInt(dbManager.getSetting('streak', 0));

        if (lastStudy === today) {
            // Already studied today, no change
            return;
        } else if (lastStudy >= yesterday) {
            // Studied yesterday → increment
            streak += 1;
        } else {
            // Streak broken
            streak = 1;
        }

        dbManager.setSetting('streak', streak);
        dbManager.setSetting('last_study_date', today);
    }

    /**
     * Get today's timestamp (midnight).
     */
    _todayTimestamp() {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }

    /**
     * Get estimated next review date text.
     * @param {number} intervalDays
     * @returns {string}
     */
    getIntervalText(intervalDays) {
        if (!intervalDays) return 'Hôm nay';
        if (intervalDays < 1/1440) return 'Ngay lập tức';
        
        const min = intervalDays * 1440;
        if (min < 60) return `${Math.round(min)} phút`;
        
        const hour = intervalDays * 24;
        if (hour < 24) return `${Math.round(hour)} giờ`;

        const days = Math.round(intervalDays);
        if (days === 1)  return 'Ngày mai';
        if (days < 7)   return `${days} ngày`;
        if (days < 30)  return `${Math.round(days / 7)} tuần`;
        return `${Math.round(days / 30)} tháng`;
    }

    /**
     * Estimate next intervals for each rating (for display in UI).
     * @param {{ easiness: number, interval: number, repetitions: number }} current
     * @returns {{ 1: number, 2: number, 3: number, 4: number }}
     */
    previewIntervals(current) {
        const result = {};
        for (const rating of [1, 2, 3, 4]) {
            const next = this.calculateNextReview(rating, current);
            result[rating] = next.interval;
        }
        return result;
    }

    /**
     * Get review history for a card.
     * @param {string} cardId
     * @param {number} [limit=20]
     */
    getCardHistory(cardId, limit = 20) {
        return dbManager.query(
            'SELECT * FROM review_history WHERE card_id=? ORDER BY reviewed_at DESC LIMIT ?',
            [cardId, limit]
        );
    }

    /**
     * Get study stats for a date range.
     * @param {number} fromDate - Unix timestamp
     * @param {number} toDate   - Unix timestamp
     */
    getStudyStats(fromDate, toDate) {
        return dbManager.query(`
            SELECT
                DATE(reviewed_at / 1000, 'unixepoch') as date,
                COUNT(*) as total,
                SUM(CASE WHEN rating >= 3 THEN 1 ELSE 0 END) as correct,
                AVG(time_spent) as avg_time
            FROM review_history
            WHERE reviewed_at BETWEEN ? AND ?
            GROUP BY DATE(reviewed_at / 1000, 'unixepoch')
            ORDER BY date ASC
        `, [fromDate, toDate]);
    }

    /**
     * Get today's review count.
     */
    getTodayReviewCount() {
        const today = this._todayTimestamp();
        const tomorrow = today + 86400000;
        const row = dbManager.queryOne(
            'SELECT COUNT(*) as cnt FROM review_history WHERE reviewed_at BETWEEN ? AND ?',
            [today, tomorrow]
        );
        return row?.cnt ?? 0;
    }

    /**
     * Get current streak.
     */
    getStreak() {
        return parseInt(dbManager.getSetting('streak', 0));
    }
}

export const srsManager = new SRSManager();
