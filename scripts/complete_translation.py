"""
Oxford 5000 Context-Aware Translation — Multithreaded v4
- Resumes from progress file
- Multithreaded translation (5-10 workers)
- Handles Google Translate API limits via backoff
- Retries on failure
"""
import pandas as pd
import os
import time
import concurrent.futures
from concurrent.futures import ThreadPoolExecutor
from deep_translator import GoogleTranslator
from tqdm import tqdm
import threading

INPUT_PATH = "data/translated/oxford5000_vn.csv"
PROGRESS_PATH = "data/translated/oxford5000_vn_progress.csv"
WORKERS = 8  # Parallel workers
MAX_RETRIES = 5

# Thread-local storage for translators
thread_local = threading.local()

def get_translator():
    if not hasattr(thread_local, "translator"):
        thread_local.translator = GoogleTranslator(source='en', target='vi')
    return thread_local.translator

def translate_single(item):
    idx, word, word_type, definition = item
    
    if pd.isna(definition) or str(definition).strip() == "" or str(definition) == "nan":
        prompt = f"{word} ({word_type})"
    else:
        prompt = f"{word}: {definition}"

    translator = get_translator()
    
    for attempt in range(MAX_RETRIES):
        try:
            translated = translator.translate(prompt)
            if not translated:
                return idx, None

            if ":" in translated:
                result = translated.split(":")[0].strip()
            elif "：" in translated:
                result = translated.split("：")[0].strip()
            else:
                result = translated.strip()

            if result and result.lower() != word.lower():
                return idx, result
            elif result:
                return idx, result
            return idx, None

        except Exception as e:
            if attempt < MAX_RETRIES - 1:
                wait_time = (attempt + 1) * 3
                time.sleep(wait_time)
            else:
                return idx, None
    return idx, None

def main():
    if not os.path.exists(INPUT_PATH):
        print(f"✗ File not found: {INPUT_PATH}")
        return

    df = pd.read_csv(INPUT_PATH, encoding='utf-8')
    print(f"📂 Loaded {len(df)} rows from {INPUT_PATH}")

    if os.path.exists(PROGRESS_PATH):
        dfp = pd.read_csv(PROGRESS_PATH, encoding='utf-8')
        if len(dfp) == len(df):
            completed_mask = (dfp['meaning_vi'].astype(str) != 'Cần cập nhật') & dfp['meaning_vi'].notna() & (dfp['meaning_vi'].astype(str) != 'nan') & (dfp['meaning_vi'].astype(str).str.strip() != '')
            df.loc[completed_mask, 'meaning_vi'] = dfp.loc[completed_mask, 'meaning_vi']
            already_done = completed_mask.sum()
            print(f"📥 Resumed {already_done} translations from progress file")

    if 'meaning_vi' not in df.columns:
        df['meaning_vi'] = 'Cần cập nhật'

    needs_translation = (
        (df['meaning_vi'].astype(str) == 'Cần cập nhật') |
        df['meaning_vi'].isnull() |
        (df['meaning_vi'].astype(str) == 'nan') |
        (df['meaning_vi'].astype(str).str.strip() == '')
    )
    remaining = needs_translation.sum()
    print(f"🔄 Remaining to translate: {remaining} / {len(df)}")

    if remaining == 0:
        print("✅ All translations complete!")
        return

    rows_to_translate = df[needs_translation].index.tolist()
    
    # Prepare items
    items = []
    for idx in rows_to_translate:
        row = df.loc[idx]
        items.append((idx, str(row['word']), str(row['type']), row['definition']))

    print(f"🚀 Starting MT ThreadPool with {WORKERS} workers...")
    
    translated_count = 0
    save_counter = 0

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {executor.submit(translate_single, item): item for item in items}
        
        for future in tqdm(concurrent.futures.as_completed(futures), total=len(items), desc="Translating"):
            idx, meaning = future.result()
            if meaning:
                df.at[idx, 'meaning_vi'] = meaning
                translated_count += 1
            
            save_counter += 1
            # Save every 200 completed items
            if save_counter % 200 == 0:
                df.to_csv(PROGRESS_PATH, index=False, encoding='utf-8')

    # Final save
    df.to_csv(PROGRESS_PATH, index=False, encoding='utf-8')
    df.to_csv(INPUT_PATH, index=False, encoding='utf-8')

    print(f"\n✅ Translation complete!")
    print(f"   Translated this run: {translated_count}")
    
if __name__ == "__main__":
    main()
