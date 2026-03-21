/**
 * Settings.js — Application Settings Controller
 * FlashMind App
 */

import { dbManager } from '../db/database.js';
import { bus, toast, openModal, closeModal } from '../utils.js';

export class Settings {
    constructor() {
        this._els = {};
    }

    init() {
        this._bindEvents();
    }

    open() {
        this._loadSettings();
        openModal('modal-settings');
    }

    _bindEvents() {
        document.getElementById('btn-save-srs-settings')?.addEventListener('click', () => this._saveSettings());
        
        // Listen for open settings event
        bus.on('settings:open', () => this.open());
    }

    _loadSettings() {
        const intervals = dbManager.getSetting('srs_intervals');
        if (!intervals) return;

        const setVal = (key, data) => {
            const valInput = document.getElementById(`srs-${key}-val`);
            const unitSelect = document.getElementById(`srs-${key}-unit`);
            if (valInput) valInput.value = data.value;
            if (unitSelect) unitSelect.value = data.unit;
        };

        setVal('again', intervals.again);
        setVal('hard',  intervals.hard);
        setVal('good',  intervals.good);
        setVal('easy',  intervals.easy);
    }

    _saveSettings() {
        const getVal = (key) => ({
            value: parseInt(document.getElementById(`srs-${key}-val`).value),
            unit:  document.getElementById(`srs-${key}-unit`).value
        });

        const intervals = {
            again: getVal('again'),
            hard:  getVal('hard'),
            good:  getVal('good'),
            easy:  getVal('easy')
        };

        dbManager.setSetting('srs_intervals', intervals);
        toast('✅ Đã lưu cài đặt SRS', 'success');
        bus.emit('settings:changed');
        closeModal('modal-settings');
    }
}

export const settings = new Settings();
