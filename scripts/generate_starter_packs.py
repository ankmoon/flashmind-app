import sqlite3, json, os, datetime, zipfile, uuid
import pandas as pd
from tqdm import tqdm

def create_flashcard_file(name, lang_display, csv_path, short_lang, front_col, back_col, reading_col=None, tags=['starter']):
    """
    Creates a .flashcard (SQLite + ZIP) file from a CSV/TSV.
    """
    db_path = f'./{name}_db.sqlite'
    if os.path.exists(db_path): os.remove(db_path)
    
    conn = sqlite3.connect(db_path)
    current_time = int(datetime.datetime.now().timestamp() * 1000)
    deck_id = str(uuid.uuid4())
    
    # Create Tables (precise FlashMind schema)
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS decks (id TEXT PRIMARY KEY, name TEXT NOT NULL, parent_id TEXT, color TEXT, icon TEXT, position INTEGER, created_at INTEGER, updated_at INTEGER);
        CREATE TABLE IF NOT EXISTS cards (id TEXT PRIMARY KEY, deck_id TEXT NOT NULL, front TEXT NOT NULL, back TEXT NOT NULL, card_type TEXT, tags TEXT, position INTEGER, created_at INTEGER, updated_at INTEGER);
        CREATE TABLE IF NOT EXISTS card_reviews (card_id TEXT PRIMARY KEY, easiness REAL, interval INTEGER, repetitions INTEGER, due_date INTEGER, last_review INTEGER);
        CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    ''')
    
    # Meta
    conn.execute('INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)', ('schema_version', '1'))
    
    # Deck
    conn.execute('INSERT INTO decks VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
                 (deck_id, f'{name}', None, '#7c5cfc', '🌟', 0, current_time, current_time))
    
    # Load Data
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(f"Error reading {csv_path}: {e}")
        return
    
    # Cards
    print(f"Packaging {name} ({len(df)} cards)...")
    for i, row in df.iterrows():
        card_id = str(uuid.uuid4())
        
        # Robust column access
        def get_val(col):
            if col is None: return ""
            if isinstance(col, int) and col < len(df.columns): return str(row.iloc[col])
            if isinstance(col, str) and col in df.columns: return str(row[col])
            return ""

        front = get_val(front_col)
        meaning_vn = get_val(back_col)
        reading = get_val(reading_col)
        
        # Format back: Meaning (Vietnamese) + Reading (Furigana/Pinyin)
        back_content = meaning_vn
        if reading:
            back_content = f"{meaning_vn}<br><small style='color: #888;'>[{reading}]</small>"
        
        # Audio URL generation (using Google TTS)
        audio_url = f'https://translate.google.com/translate_tts?ie=UTF-8&q={front}&tl={short_lang}&client=tw-ob'
        
        # Combine back with audio icon
        full_back = f"{back_content} <a href='{audio_url}' target='_blank' style='text-decoration:none; font-size:1.2em;'>🔊</a>"
        
        card_tags = json.dumps(tags + [lang_display])
        
        conn.execute('INSERT INTO cards (id, deck_id, front, back, card_type, tags, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                     (card_id, deck_id, front, full_back, 'basic', card_tags, i, current_time, current_time))
        # Default SRS data
        conn.execute('INSERT INTO card_reviews (card_id, easiness, interval, repetitions, due_date, last_review) VALUES (?, ?, ?, ?, ?, ?)',
                     (card_id, 2.5, 0, 0, 0, 0))
    
    conn.commit()
    conn.close()
    
    # Zip it into .flashcard (ZIP folder containing database.sqlite + meta.json)
    zip_path = f'./{name}.flashcard'
    with zipfile.ZipFile(zip_path, 'w') as zf:
        zf.write(db_path, 'database.sqlite')
        meta = {
            'app': 'FlashMind',
            'version': '1.0.0',
            'created_at': datetime.datetime.now().isoformat(),
            'updated_at': datetime.datetime.now().isoformat(),
            'name': name
        }
        zf.writestr('meta.json', json.dumps(meta, indent=2))
        zf.writestr('media/', '')
    
    if os.path.exists(db_path): os.remove(db_path)
    print(f"Generated: {zip_path}")

def main():
    translated_dir = "d:/My office/Projects/Flashcard/data/translated"
    output_dir = "d:/My office/Projects/Flashcard/" # Output flashcards to root
    
    # 1. HSK (Chinese -> Vietnamese)
    # File format: expression, reading, meaning_en, meaning_vi
    for i in range(1, 7):
        csv_path = os.path.join(translated_dir, f"hsk{i}_vn.csv")
        if os.path.exists(csv_path):
            create_flashcard_file(f"HSK_Level_{i}", "Tiếng Trung", csv_path, "zh-CN", 
                                  front_col='expression', back_col='meaning_vi', reading_col='reading')

    # 2. JLPT (Japanese -> Vietnamese)
    # File format: expression, reading, meaning, tags, guid, meaning_vi
    for i in range(1, 6):
        csv_path = os.path.join(translated_dir, f"jlpt_n{i}_vn.csv")
        if os.path.exists(csv_path):
            create_flashcard_file(f"JLPT_N{i}", "Tiếng Nhật", csv_path, "ja", 
                                  front_col='expression', back_col='meaning_vi', reading_col='reading')

    # 3. Oxford 5000 (English -> Vietnamese)
    # File format: Unnamed: 0, word, type, cefr, phon_br, phon_n_am, definition, example, uk, us, meaning_vi
    csv_path = os.path.join(translated_dir, "oxford5000_vn.csv")
    if os.path.exists(csv_path):
        create_flashcard_file("Oxford_5000", "Tiếng Anh", csv_path, "en", 
                              front_col='word', back_col='meaning_vi')

    # 4. TOPIK (Korean -> Vietnamese)
    # File format: rank,word,part_of_speech,hanja,explanation,nikl_level,topik_level,meaning_vi
    csv_path = os.path.join(translated_dir, "topik_vn.csv")
    if os.path.exists(csv_path):
        create_flashcard_file("TOPIK_Vocabulary", "Tiếng Hàn", csv_path, "ko", 
                              front_col='word', back_col='meaning_vi', reading_col='hanja')

if __name__ == "__main__":
    main()
