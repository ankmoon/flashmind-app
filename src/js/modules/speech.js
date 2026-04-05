/**
 * speech.js — Native Text-to-Speech Service
 * Using Web Speech API (window.speechSynthesis)
 */

class SpeechService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.voices = [];
        this._initVoices();
    }

    /**
     * Initialize available voices. 
     * Note: getVoices() is async and can be empty on first call in some browsers.
     */
    _initVoices() {
        const loadVoices = () => {
            this.voices = this.synth.getVoices();
        };

        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = loadVoices;
        }
        loadVoices();
    }

    /**
     * Map common language names or tags to BCP 47 codes.
     * @param {string|string[]} langOrTags 
     * @returns {string} - BCP 47 language code
     */
    _getLangCode(langOrTags) {
        if (!langOrTags) return 'en-US';

        const tags = Array.isArray(langOrTags) ? langOrTags : [langOrTags];
        const normalized = tags.map(t => t.toLowerCase().trim());

        // Language Mapping table
        const mapping = {
            'zh-cn': ['chinese', 'hán ngữ', 'trung', 'zh', 'cn', 'zh-cn', 'hsk'],
            'ja-jp': ['japanese', 'nhật ngữ', 'nhật', 'ja', 'jp', 'ja-jp', 'jlpt'],
            'ko-kr': ['korean', 'hàn ngữ', 'hàn', 'ko', 'kr', 'ko-kr', 'topik'],
            'en-us': ['english', 'tiếng anh', 'anh', 'en', 'us', 'en-us', 'oxford'],
            'vi-vn': ['vietnamese', 'tiếng việt', 'việt', 'vi', 'vn', 'vi-vn']
        };

        for (const [code, keywords] of Object.entries(mapping)) {
            if (normalized.some(tag => keywords.includes(tag))) {
                return code;
            }
        }

        // Return first element if it looks like a lang code, else default
        if (typeof langOrTags === 'string' && langOrTags.includes('-')) return langOrTags;
        return 'en-US';
    }

    /**
     * Select the best voice for a given language code.
     * @param {string} langCode 
     */
    _getVoice(langCode) {
        if (this.voices.length === 0) this.voices = this.synth.getVoices();

        // 1. Exact match (lang and region)
        let voice = this.voices.find(v => v.lang.toLowerCase() === langCode.toLowerCase());
        
        // 2. Language match (e.g., 'en-GB' for 'en-US')
        if (!voice) {
            const prefix = langCode.split('-')[0].toLowerCase();
            voice = this.voices.find(v => v.lang.toLowerCase().startsWith(prefix));
        }

        return voice || null;
    }

    /**
     * Speak text.
     * @param {string} text 
     * @param {string|string[]} langOrTags 
     * @param {object} options - volume, rate, pitch
     */
    speak(text, langOrTags = 'en-US', options = {}) {
        if (!text || !this.synth) return;

        // Cancel previous speech
        this.synth.cancel();

        const langCode = this._getLangCode(langOrTags);
        const utterance = new SpeechSynthesisUtterance(text);
        
        const voice = this._getVoice(langCode);
        if (voice) {
            utterance.voice = voice;
            utterance.lang = voice.lang;
        } else {
            utterance.lang = langCode;
        }

        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        this.synth.speak(utterance);
    }

    /**
     * Stop all current speech.
     */
    stop() {
        if (this.synth) this.synth.cancel();
    }
}

export const speechService = new SpeechService();
