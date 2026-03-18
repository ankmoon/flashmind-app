/**
 * Statistics.js — Statistics Dashboard Component
 * FlashMind App — Phase 2
 *
 * Renders:
 *   - Summary stat cards (total, due, mastered, streak)
 *   - 7-day bar chart (Chart.js)
 *   - Correct/Incorrect doughnut chart
 *   - 30-day activity heatmap (CSS grid)
 *   - Deck progress table
 */

import { dbManager }  from '../db/database.js';
import { srsManager } from '../modules/srs.js';
import { cardManager } from '../modules/cardManager.js';
import { deckManager } from '../modules/deckManager.js';

export class Statistics {
    constructor() {
        this._charts = {};   // Chart.js instances keyed by canvas id
        this._rendered = false;
    }

    /**
     * Render / refresh the statistics view.
     */
    async render() {
        this._updateSummaryCards();
        this._renderBarChart();
        this._renderDoughnutChart();
        this._renderHeatmap();
        this._renderDeckTable();
        this._rendered = true;
    }

    // ─── SUMMARY CARDS ───────────────────────────────────────────

    _updateSummaryCards() {
        const now = Date.now();

        // Total cards
        const totalRow = dbManager.queryOne('SELECT COUNT(*) as cnt FROM cards');
        this._setText('stat-total-cards', totalRow?.cnt ?? 0);

        // Due today
        const dueRow = dbManager.queryOne(
            'SELECT COUNT(*) as cnt FROM card_reviews WHERE repetitions > 0 AND due_date <= ?', [now]
        );
        this._setText('stat-due-today', dueRow?.cnt ?? 0);

        // Mastered (interval >= 21 days = "learned")
        const masteredRow = dbManager.queryOne(
            'SELECT COUNT(*) as cnt FROM card_reviews WHERE interval >= 21'
        );
        this._setText('stat-mastered', masteredRow?.cnt ?? 0);

        // Streak
        const streak = srsManager.getStreak();
        this._setText('stat-streak', streak);

        // Also update "Biểu đồ chi tiết" placeholder to be hidden
        const placeholder = document.querySelector('.chart-placeholder');
        if (placeholder) placeholder.style.display = 'none';
    }

    // ─── 7-DAY BAR CHART ─────────────────────────────────────────

    _renderBarChart() {
        const canvas = this._getCanvas('chart-weekly');
        if (!canvas || !window.Chart) return;

        // Build last 7 days data
        const days  = [];
        const data  = [];
        const correct = [];
        const now   = Date.now();

        for (let i = 6; i >= 0; i--) {
            const dayStart = now - i * 86400000;
            const dayEnd   = dayStart + 86400000;
            const date     = new Date(dayStart);
            days.push(date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric' }));

            const row = dbManager.queryOne(
                'SELECT COUNT(*) as total, SUM(CASE WHEN rating >= 3 THEN 1 ELSE 0 END) as ok FROM review_history WHERE reviewed_at BETWEEN ? AND ?',
                [dayStart, dayEnd]
            );
            data.push(row?.total ?? 0);
            correct.push(row?.ok ?? 0);
        }

        if (this._charts['chart-weekly']) {
            this._charts['chart-weekly'].destroy();
        }

        this._charts['chart-weekly'] = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: days,
                datasets: [
                    {
                        label: 'Đúng',
                        data: correct,
                        backgroundColor: 'rgba(16,185,129,0.8)',
                        borderRadius: 6,
                        borderSkipped: false,
                    },
                    {
                        label: 'Sai',
                        data: data.map((t, i) => t - correct[i]),
                        backgroundColor: 'rgba(239,68,68,0.6)',
                        borderRadius: 6,
                        borderSkipped: false,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } },
                    tooltip: { mode: 'index', intersect: false },
                },
                scales: {
                    x: {
                        stacked: true,
                        ticks: { color: '#64748b' },
                        grid:  { color: 'rgba(255,255,255,0.05)' },
                    },
                    y: {
                        stacked: true,
                        ticks: { color: '#64748b', stepSize: 1 },
                        grid:  { color: 'rgba(255,255,255,0.05)' },
                        beginAtZero: true,
                    },
                },
            },
        });
    }

    // ─── DOUGHNUT CHART ──────────────────────────────────────────

    _renderDoughnutChart() {
        const canvas = this._getCanvas('chart-accuracy');
        if (!canvas || !window.Chart) return;

        const weekAgo = Date.now() - 7 * 86400000;
        const row = dbManager.queryOne(
            `SELECT
                SUM(CASE WHEN rating >= 3 THEN 1 ELSE 0 END) as correct,
                SUM(CASE WHEN rating < 3  THEN 1 ELSE 0 END) as wrong
             FROM review_history WHERE reviewed_at >= ?`,
            [weekAgo]
        );
        const correct = row?.correct ?? 0;
        const wrong   = row?.wrong   ?? 0;

        if (this._charts['chart-accuracy']) {
            this._charts['chart-accuracy'].destroy();
        }

        this._charts['chart-accuracy'] = new Chart(canvas, {
            type: 'doughnut',
            data: {
                labels: ['Đúng', 'Sai'],
                datasets: [{
                    data: [correct || 0, wrong || 0],
                    backgroundColor: ['rgba(16,185,129,0.85)', 'rgba(239,68,68,0.75)'],
                    borderColor: ['#10b981', '#ef4444'],
                    borderWidth: 2,
                    hoverOffset: 8,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { color: '#94a3b8', padding: 16, font: { family: 'Inter' } },
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => ` ${ctx.label}: ${ctx.raw} thẻ`,
                        },
                    },
                },
            },
            plugins: [{
                id: 'centerText',
                afterDraw(chart) {
                    const total = correct + wrong;
                    if (!total) return;
                    const pct  = Math.round((correct / total) * 100);
                    const { ctx, chartArea: { left, top, right, bottom } } = chart;
                    const cx = (left + right) / 2;
                    const cy = (top + bottom) / 2;
                    ctx.save();
                    ctx.font = 'bold 24px Inter, sans-serif';
                    ctx.fillStyle = '#f1f5f9';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`${pct}%`, cx, cy - 8);
                    ctx.font = '12px Inter, sans-serif';
                    ctx.fillStyle = '#64748b';
                    ctx.fillText('chính xác', cx, cy + 14);
                    ctx.restore();
                },
            }],
        });
    }

    // ─── 30-DAY HEATMAP ──────────────────────────────────────────

    _renderHeatmap() {
        const container = document.getElementById('heatmap-grid');
        if (!container) return;

        container.innerHTML = '';
        const now = Date.now();

        for (let i = 29; i >= 0; i--) {
            const dayStart = this._dayStart(now - i * 86400000);
            const dayEnd   = dayStart + 86400000;
            const row      = dbManager.queryOne(
                'SELECT COUNT(*) as cnt FROM review_history WHERE reviewed_at BETWEEN ? AND ?',
                [dayStart, dayEnd]
            );
            const count = row?.cnt ?? 0;
            const level = count === 0 ? 0 : count <= 5 ? 1 : count <= 15 ? 2 : count <= 30 ? 3 : 4;

            const date  = new Date(dayStart);
            const label = date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });

            const cell = document.createElement('div');
            cell.className = `heatmap-cell level-${level}`;
            cell.title     = `${label}: ${count} thẻ`;
            container.appendChild(cell);
        }
    }

    // ─── DECK PROGRESS TABLE ─────────────────────────────────────

    _renderDeckTable() {
        const tbody = document.getElementById('deck-progress-body');
        if (!tbody) return;

        const decks = deckManager.getAllDecks();
        tbody.innerHTML = '';

        if (!decks.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-subtle)">Chưa có deck nào</td></tr>';
            return;
        }

        const now = Date.now();

        for (const deck of decks) {
            const totalRow = dbManager.queryOne('SELECT COUNT(*) as cnt FROM cards WHERE deck_id=?', [deck.id]);
            const dueRow   = dbManager.queryOne(
                'SELECT COUNT(*) as cnt FROM card_reviews cr JOIN cards c ON c.id=cr.card_id WHERE c.deck_id=? AND cr.repetitions > 0 AND cr.due_date<=?',
                [deck.id, now]
            );
            const newRow   = dbManager.queryOne(
                'SELECT COUNT(*) as cnt FROM card_reviews cr JOIN cards c ON c.id=cr.card_id WHERE c.deck_id=? AND cr.repetitions=0',
                [deck.id]
            );
            const masteredRow = dbManager.queryOne(
                'SELECT COUNT(*) as cnt FROM card_reviews cr JOIN cards c ON c.id=cr.card_id WHERE c.deck_id=? AND cr.interval>=21',
                [deck.id]
            );

            const total    = totalRow?.cnt ?? 0;
            const due      = dueRow?.cnt   ?? 0;
            const newCount = newRow?.cnt   ?? 0;
            const mastered = masteredRow?.cnt ?? 0;
            const pct      = total ? Math.round((mastered / total) * 100) : 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <span style="margin-right:6px">${deck.icon || '📚'}</span>
                    <span style="color:${deck.color}">${deck.name}</span>
                </td>
                <td class="stat-cell">${total}</td>
                <td class="stat-cell" style="color:var(--danger)">${due}</td>
                <td class="stat-cell" style="color:var(--text-muted)">${newCount}</td>
                <td class="stat-cell">
                    <div class="mini-progress-wrap">
                        <div class="mini-progress-track">
                            <div class="mini-progress-fill" style="width:${pct}%;background:${deck.color}"></div>
                        </div>
                        <span class="mini-progress-label">${pct}%</span>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        }
    }

    // ─── HELPERS ─────────────────────────────────────────────────

    _getCanvas(id) {
        const canvas = document.getElementById(id);
        if (!canvas) console.warn(`[Statistics] Canvas #${id} not found`);
        return canvas;
    }

    _setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    _dayStart(ts) {
        const d = new Date(ts);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }
}

export const statistics = new Statistics();
