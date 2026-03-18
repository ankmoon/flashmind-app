/**
 * fileManager.js — File System Access API + JSZip handler
 * Manages .flashcard file format (ZIP containing SQLite + meta.json + media/)
 * FlashMind App
 */

import { dbManager as globalDbManager } from '../db/database.js';

const FILE_EXTENSION = '.flashcard';
const MIME_TYPE      = 'application/x-flashcard';
const META_FILENAME  = 'meta.json';
const DB_FILENAME    = 'database.sqlite';
const MEDIA_DIR      = 'media/';

export class FileManager {
    /**
     * @param {import('../db/database.js').DatabaseManager} [injectedDb]
     *   Optional DB instance for testing. Defaults to global singleton.
     */
    constructor(injectedDb = null) {
        /** @type {FileSystemFileHandle|null} */
        this.fileHandle = null;
        this.fileName   = 'Untitled.flashcard';
        this.isDirty    = false;
        this.meta       = null;
        // Dependency injection: use provided DB or fall back to global singleton
        this._db = injectedDb || globalDbManager;
    }

    /** Check if browser supports File System Access API */
    static isSupported() {
        return 'showOpenFilePicker' in window && 'showSaveFilePicker' in window;
    }

    // ─── CREATE NEW FILE ─────────────────────────────────────────

    /**
     * Initialize a brand-new .flashcard file in memory.
     * @param {string} [name] - Display name
     */
    async createNew(name = 'Untitled') {
        await this._db.createNew();

        this.fileHandle = null;
        this.fileName   = name.endsWith(FILE_EXTENSION) ? name : `${name}${FILE_EXTENSION}`;
        this.isDirty    = true;

        this.meta = {
            app: 'FlashMind',
            version: '1.0.0',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            name: name,
        };

        return this;
    }

    // ─── OPEN FILE ───────────────────────────────────────────────

    /**
     * Show file picker and open a .flashcard file.
     * @returns {boolean} true if file was opened
     */
    async openFile() {
        try {
            let fileHandle;

            if (FileManager.isSupported()) {
                try {
                    // Use modern File System Access API
                    const [handle] = await window.showOpenFilePicker({
                        types: [{
                            description: 'FlashMind Files',
                            accept: { [MIME_TYPE]: [FILE_EXTENSION] },
                        }],
                        multiple: false,
                    });
                    fileHandle = handle;
                } catch (fsaErr) {
                    if (fsaErr.name === 'AbortError') return false;
                    // FSA API blocked (SecurityError, etc.) — fall back to input
                    console.warn('[FileManager] FSA API blocked, falling back:', fsaErr.message);
                    fileHandle = await this._fallbackOpenPicker();
                    if (!fileHandle) return false;
                }
            } else {
                // Fallback: regular file input
                fileHandle = await this._fallbackOpenPicker();
                if (!fileHandle) return false;
            }

            await this._loadFromHandle(fileHandle);
            return true;
        } catch (err) {
            if (err.name === 'AbortError') return false;
            throw err;
        }
    }

    /**
     * Load database from a file handle.
     * @param {FileSystemFileHandle|{file: File, name: string}} handle
     */
    async _loadFromHandle(handle) {
        let file;
        if (handle.getFile) {
            file = await handle.getFile();
            this.fileHandle = handle;
            this.fileName   = handle.name;
        } else {
            // fallback object
            file = handle.file;
            this.fileHandle = null;
            this.fileName   = handle.name;
        }

        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Extract meta.json
        const metaFile = zip.file(META_FILENAME);
        if (metaFile) {
            const metaStr = await metaFile.async('string');
            this.meta = JSON.parse(metaStr);
        }

        // Extract database.sqlite
        const dbFile = zip.file(DB_FILENAME);
        if (!dbFile) throw new Error('Invalid .flashcard file: missing database.sqlite');

        const dbBytes = await dbFile.async('uint8array');
        await this._db.loadFromBytes(dbBytes);

        this.isDirty = false;
    }

    // ─── SAVE FILE ───────────────────────────────────────────────

    /**
     * Save to current file handle (if exists), otherwise prompt save-as.
     */
    async save() {
        if (this.fileHandle) {
            await this._writeTo(this.fileHandle);
            this.isDirty = false;
        } else {
            await this.saveAs();
        }
    }

    /**
     * Show save picker and write file.
     */
    async saveAs() {
        try {
            if (FileManager.isSupported()) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: this.fileName,
                        types: [{
                            description: 'FlashMind Files',
                            accept: { [MIME_TYPE]: [FILE_EXTENSION] },
                        }],
                    });
                    this.fileHandle = handle;
                    this.fileName   = handle.name;
                    await this._writeTo(handle);
                } catch (fsaErr) {
                    if (fsaErr.name === 'AbortError') return false;
                    // FSA blocked — fall back to download
                    console.warn('[FileManager] Save FSA blocked, downloading:', fsaErr.message);
                    await this._fallbackDownload();
                }
            } else {
                // Fallback: trigger download
                await this._fallbackDownload();
            }
            this.isDirty = false;
            return true;
        } catch (err) {
            if (err.name === 'AbortError') return false;
            throw err;
        }
    }

    /**
     * Write ZIP bundle to a file system handle.
     * @param {FileSystemFileHandle} handle
     */
    async _writeTo(handle) {
        const blob = await this._buildZip();
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
    }

    /**
     * Fallback download for browsers without File System Access API.
     */
    async _fallbackDownload() {
        const blob = await this._buildZip();
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = this.fileName;
        a.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Build ZIP blob from current DB state.
     * @returns {Blob}
     */
    async _buildZip() {
        const zip = new JSZip();

        // Export SQLite bytes
        const dbBytes = this._db.exportBytes();
        zip.file(DB_FILENAME, dbBytes);

        // meta.json
        this.meta = {
            ...this.meta,
            updated_at: new Date().toISOString(),
        };
        zip.file(META_FILENAME, JSON.stringify(this.meta, null, 2));

        // Media folder placeholder
        zip.folder(MEDIA_DIR);

        return zip.generateAsync({
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 },
        });
    }

    /**
     * Fallback file picker using <input type="file">.
     * Returns { file, name } or null.
     */
    _fallbackOpenPicker() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type  = 'file';
            input.accept = FILE_EXTENSION;
            input.onchange = () => {
                const file = input.files?.[0];
                if (file) resolve({ file, name: file.name });
                else resolve(null);
            };
            input.oncancel = () => resolve(null);
            input.click();
        });
    }

    // ─── HELPERS ─────────────────────────────────────────────────

    markDirty() { this.isDirty = true; }

    getFileName() {
        return this.fileName.replace(FILE_EXTENSION, '');
    }
}

// Global singleton uses globalDbManager
export const fileManager = new FileManager(globalDbManager);
