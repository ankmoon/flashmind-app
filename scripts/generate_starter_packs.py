import sqlite3, json, os, datetime, zipfile, uuid
import pandas as pd
from tqdm import tqdm

def create_flashcard_file(name, lang_display, csv_path, short_lang, front_col, back_col, reading_col=None, tags=['starter'], output_dir='./', diff_col=None, force_diff=None):
    """
    Creates a .flashcard (SQLite + ZIP) file from a CSV/TSV.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)
    db_path = os.path.join(output_dir, f'{name}_db.sqlite')
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
        # Fix: Remove BOM from column headers which can cause dictionary lookup failures
        df.rename(columns=lambda x: x.strip('\ufeff').strip(), inplace=True)
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
        
        import re
        if short_lang == "ko":
            # Some words have numbers like '가게03', or '-가13', remove trailing digits and spaces
            front = re.sub(r'\d+$', '', str(front).strip()).strip()
            
        if str(reading).lower() in ["nan", "none"]:
            reading = ""
        
        # Difficulty Tagging logic
        diff_tag = None
        if force_diff:
            diff_tag = f"{force_diff}"
        elif diff_col:
            val = get_val(diff_col)
            if val and val.lower() not in ["nan", "none", ""]:
                diff_tag = f"{val}"
        
        if diff_tag:
            # We map specific difficulties so they look nice
            if short_lang == "ko" and diff_col == "topik_level":
                if diff_tag == "A": diff_tag = "TOPIK 1-2"
                elif diff_tag == "B": diff_tag = "TOPIK 3-4"
                elif diff_tag == "C": diff_tag = "TOPIK 5-6"
        
        final_tags = tags + [lang_display]
        if diff_tag:
            final_tags.append(f"diff:{diff_tag}")
            
        # Format back: Meaning (Vietnamese) + Reading (Furigana/Pinyin/Hanja)
        back_content = meaning_vn
        if reading:
            back_content = f"{meaning_vn}<br><small style='color: #888;'>[{reading}]</small>"
        
        # Audio icon generation (semantic format for SpeechService interception)
        # Remove voice icon logic as per user request
        full_back = f"{back_content}"
        
        card_tags = json.dumps(final_tags)
        
        conn.execute('INSERT INTO cards (id, deck_id, front, back, card_type, tags, position, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                     (card_id, deck_id, front, full_back, 'basic', card_tags, i, current_time, current_time))
        # Default SRS data
        conn.execute('INSERT INTO card_reviews (card_id, easiness, interval, repetitions, due_date, last_review) VALUES (?, ?, ?, ?, ?, ?)',
                     (card_id, 2.5, 0, 0, 0, 0))
    
    conn.commit()
    conn.close()
    
    # Zip it into .flashcard (ZIP folder containing database.sqlite + meta.json)
    zip_path = os.path.join(output_dir, f'{name}.flashcard')
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
    output_dir = "d:/My office/Projects/Flashcard/data/packs" # Output flashcards to data/packs
    
    # 1. HSK (Chinese -> Vietnamese)
    hsk_dfs = []
    for i in range(1, 7):
        csv_path = os.path.join(translated_dir, f"hsk{i}_vn.csv")
        if os.path.exists(csv_path):
            try:
                tdf = pd.read_csv(csv_path)
                tdf.rename(columns=lambda x: x.strip('\ufeff').strip(), inplace=True)
                tdf['auto_diff'] = f"HSK {i}"
                hsk_dfs.append(tdf)
            except Exception as e:
                pass
    if hsk_dfs:
        hsk_full = pd.concat(hsk_dfs, ignore_index=True)
        hsk_out = os.path.join(translated_dir, "hsk_full_tmp.csv")
        hsk_full.to_csv(hsk_out, index=False)
        create_flashcard_file("HSK_Full", "Tiếng Trung", hsk_out, "zh-CN", 
                              front_col='expression', back_col='meaning_vi', reading_col='reading', output_dir=output_dir, diff_col='auto_diff')
        os.remove(hsk_out)

    # 2. JLPT (Japanese -> Vietnamese)
    jlpt_dfs = []
    # N5 to N1 order is better for progression
    for i in range(5, 0, -1):
        csv_path = os.path.join(translated_dir, f"jlpt_n{i}_vn.csv")
        if os.path.exists(csv_path):
            try:
                tdf = pd.read_csv(csv_path)
                tdf.rename(columns=lambda x: x.strip('\ufeff').strip(), inplace=True)
                tdf['auto_diff'] = f"N{i}"
                jlpt_dfs.append(tdf)
            except Exception as e:
                pass
    if jlpt_dfs:
        jlpt_full = pd.concat(jlpt_dfs, ignore_index=True)
        jlpt_out = os.path.join(translated_dir, "jlpt_full_tmp.csv")
        jlpt_full.to_csv(jlpt_out, index=False)
        create_flashcard_file("JLPT_Full", "Tiếng Nhật", jlpt_out, "ja", 
                              front_col='expression', back_col='meaning_vi', reading_col='reading', output_dir=output_dir, diff_col='auto_diff')
        os.remove(jlpt_out)

    # 3. Oxford 5000 (English -> Vietnamese)
    csv_path = os.path.join(translated_dir, "oxford5000_vn.csv")
    if os.path.exists(csv_path):
        create_flashcard_file("Oxford_5000", "Tiếng Anh", csv_path, "en", 
                              front_col='word', back_col='meaning_vi', output_dir=output_dir, diff_col='cefr')

    # 4. TOPIK (Korean -> Vietnamese)
    csv_path = os.path.join(translated_dir, "topik_vn.csv")
    if os.path.exists(csv_path):
        create_flashcard_file("TOPIK_Vocabulary", "Tiếng Hàn", csv_path, "ko", 
                              front_col='word', back_col='meaning_vi', reading_col='hanja', output_dir=output_dir, diff_col='topik_level')

if __name__ == "__main__":
    main()
