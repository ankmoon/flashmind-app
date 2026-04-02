import pandas as pd
from deep_translator import GoogleTranslator
import os
import time
from tqdm import tqdm
import sys

def translate_batch(batch, src='en', dest='vi'):
    translator = GoogleTranslator(source=src, target=dest)
    try:
        # deep-translator handles list of strings
        return translator.translate_batch(batch)
    except Exception as e:
        print(f"\nError translating batch: {e}")
        return None

def process_file(input_file, output_file, meaning_col_idx, src_lang='en', is_tsv=False, limit=None):
    if os.path.exists(output_file):
        print(f"Skipping {input_file}, output already exists: {output_file}")
        return

    print(f"\nProcessing {os.path.basename(input_file)}...")
    sep = '\t' if is_tsv else ','
    try:
        df = pd.read_csv(input_file, sep=sep)
    except Exception as e:
        df = pd.read_csv(input_file, sep=sep, header=None)
    
    # Identify meaning column
    if isinstance(meaning_col_idx, int):
        col_name = df.columns[meaning_col_idx]
    else:
        col_name = meaning_col_idx

    if limit:
        df = df.head(limit).copy()
    else:
        df = df.copy()

    print(f"Translating {len(df)} rows from '{col_name}' ({src_lang} -> vi)...")
    
    translated_meanings = []
    batch_size = 50 # deep-translator is quite fast
    
    for i in tqdm(range(0, len(df), batch_size)):
        batch = [str(x) for x in df[col_name].iloc[i:i+batch_size].tolist()]
        # Filter out empty/NaN
        batch = [x if x and x != 'nan' else " " for x in batch]
        
        result = translate_batch(batch, src=src_lang, dest='vi')
        
        if result:
            translated_meanings.extend(result)
        else:
            # Fallback on failure
            print(f"Batch {i//batch_size} failed, using original text.")
            translated_meanings.extend(batch)
        
        time.sleep(0.5) # Still be a bit gentle

    df['meaning_vi'] = translated_meanings
    
    output_dir = os.path.dirname(output_file)
    os.makedirs(output_dir, exist_ok=True)
    df.to_csv(output_file, index=False, encoding='utf-8-sig')
    print(f"Saved {len(df)} rows to {output_file}")

def main():
    data_dir = "d:/My office/Projects/Flashcard/data"
    output_dir = "d:/My office/Projects/Flashcard/data/translated"
    
    # Check if we are in test mode
    test_mode = "--test" in sys.argv
    limit = 20 if test_mode else None
    
    # 1. HSK 1-6 (English -> Vietnamese because sources already have English meanings)
    for i in range(1, 7):
        input_f = os.path.join(data_dir, f"hsk{i}.csv")
        output_f = os.path.join(output_dir, f"hsk{i}_vn.csv")
        if os.path.exists(input_f):
            process_file(input_f, output_f, meaning_col_idx=2, src_lang='en', limit=limit)
            
    # 2. JLPT N1-N5 (English -> Vietnamese)
    for i in range(1, 6):
        input_f = os.path.join(data_dir, f"jlpt_n{i}.csv")
        output_f = os.path.join(output_dir, f"jlpt_n{i}_vn.csv")
        if os.path.exists(input_f):
            process_file(input_f, output_f, meaning_col_idx='meaning', src_lang='en', limit=limit)
            
    # 3. Oxford 5000 (English -> Vietnamese)
    input_f = os.path.join(data_dir, "oxford5000.csv")
    output_f = os.path.join(output_dir, "oxford5000_vn.csv")
    if os.path.exists(input_f):
        # Oxford 5000 has word, type, level, definition
        process_file(input_f, output_f, meaning_col_idx=3, src_lang='en', limit=limit)
        
    # 4. TOPIK (Korean -> Vietnamese)
    input_f = os.path.join(data_dir, "topik.tsv")
    output_f = os.path.join(output_dir, "topik_vn.csv")
    if os.path.exists(input_f):
        process_file(input_f, output_f, meaning_col_idx='explanation', src_lang='ko', is_tsv=True, limit=limit)

if __name__ == "__main__":
    main()
