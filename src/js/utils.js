/**
 * utils.js — Shared utility helpers
 * FlashMind App
 */

/**
 * Generate a UUID v4-like ID.
 * Uses crypto.randomUUID if available, falls back to manual generation.
 */
export function generateId() {
    if (crypto?.randomUUID) return crypto.randomUUID();
    // Fallback
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}

/**
 * Format a Unix timestamp as a readable date string.
 * @param {number} ts - Unix timestamp (ms)
 * @param {'date'|'datetime'|'relative'} [format='date']
 */
export function formatDate(ts, format = 'date') {
    if (!ts) return '—';
    const d = new Date(ts);

    if (format === 'relative') {
        const diff = Date.now() - ts;
        const mins = Math.floor(diff / 60000);
        if (mins < 1)   return 'Vừa xong';
        if (mins < 60)  return `${mins} phút trước`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} giờ trước`;
        const days = Math.floor(hours / 24);
        if (days < 7)   return `${days} ngày trước`;
        if (days < 30)  return `${Math.floor(days / 7)} tuần trước`;
        return `${Math.floor(days / 30)} tháng trước`;
    }

    if (format === 'datetime') {
        return d.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
    }

    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Debounce a function call.
 * @param {Function} fn
 * @param {number} delay - ms
 */
export function debounce(fn, delay = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), delay);
    };
}

/**
 * Throttle a function call.
 * @param {Function} fn
 * @param {number} limit - ms
 */
export function throttle(fn, limit = 200) {
    let inThrottle = false;
    return (...args) => {
        if (!inThrottle) {
            fn(...args);
            inThrottle = true;
            setTimeout(() => { inThrottle = false; }, limit);
        }
    };
}

/**
 * Sanitize and render Markdown to HTML.
 * Requires marked.js and DOMPurify loaded globally.
 * @param {string} text
 * @returns {string} - Safe HTML string
 */
export function renderMarkdown(text) {
    if (!text) return '';
    if (typeof marked === 'undefined') return escapeHtml(text);
    const raw = marked.parse(text, { breaks: true, gfm: true });
    if (typeof DOMPurify !== 'undefined') {
        return DOMPurify.sanitize(raw);
    }
    return raw;
}

/**
 * Escape HTML special characters.
 * @param {string} str
 */
export function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Strip HTML tags and return plain text.
 * @param {string} html
 */
export function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

/**
 * Truncate text to a given length.
 * @param {string} text
 * @param {number} maxLen
 */
export function truncate(text, maxLen = 80) {
    if (!text) return '';
    const plain = stripHtml(text);
    return plain.length > maxLen ? plain.slice(0, maxLen) + '...' : plain;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} [type='info']
 * @param {number} [duration=3000]
 */
export function toast(message, type = 'info', duration = 3000) {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const container = document.getElementById('toast-container');
    if (!container) return;

    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
        <span class="toast-icon">${icons[type]}</span>
        <span class="toast-msg">${escapeHtml(message)}</span>
    `;
    container.appendChild(el);

    setTimeout(() => {
        el.classList.add('fade-out');
        el.addEventListener('animationend', () => el.remove(), { once: true });
        setTimeout(() => el.remove(), 400);
    }, duration);
}

/**
 * Show/hide element by toggling 'hidden' class.
 * @param {string|HTMLElement} elementOrId
 * @param {boolean} visible
 */
export function setVisible(elementOrId, visible) {
    const el = typeof elementOrId === 'string'
        ? document.getElementById(elementOrId)
        : elementOrId;
    if (!el) return;
    el.classList.toggle('hidden', !visible);
}

/**
 * Open a modal.
 * @param {string} modalId
 */
export function openModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('hidden');
}

/**
 * Close a modal.
 * @param {string} modalId
 */
export function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('hidden');
}

/**
 * EventBus — simple pub/sub for inter-module communication.
 */
class EventBus {
    constructor() { this._listeners = {}; }

    on(event, fn) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(fn);
        return () => this.off(event, fn);
    }

    off(event, fn) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(f => f !== fn);
    }

    emit(event, data) {
        (this._listeners[event] || []).forEach(fn => {
            try { fn(data); } catch (e) { console.error(`EventBus error [${event}]:`, e); }
        });
    }

    once(event, fn) {
        const wrapper = (data) => { fn(data); this.off(event, wrapper); };
        return this.on(event, wrapper);
    }
}

export const bus = new EventBus();
