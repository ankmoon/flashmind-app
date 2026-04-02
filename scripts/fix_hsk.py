import pandas as pd
from deep_translator import GoogleTranslator
import os
import time
from tqdm import tqdm

def translate_dataset(input_f, output_f, src_lang='en'):
    if os.path.exists(output_f):
        print(f"Skipping {output_f}...")
        return

    print(f"Translating {input_f}...")
    df = pd.read_csv(input_f, header=None)
    # HSK structure: [word, pinyin, meaning_en]
    # We want to translate meaning_en (index 2)
    
    meanings = df[2].astype(str).tolist()
    translated = []
    batch_size = 50
    
    translator = GoogleTranslator(source=src_lang, target='vi')
    
    for i in tqdm(range(0, len(meanings), batch_size)):
        batch = meanings[i : i + batch_size]
        try:
            res = translator.translate_batch(batch)
            translated.extend(res)
        except Exception as e:
            print(f"Error: {e}")
            translated.extend(batch)
        time.sleep(0.5)
        
    df[3] = translated # Add meaning_vi at index 3
    df.columns = ['expression', 'reading', 'meaning_en', 'meaning_vi']
    
    os.makedirs(os.path.dirname(output_f), exist_ok=True)
    df.to_csv(output_f, index=False, encoding='utf-8-sig')

def main():
    data_dir = "d:/My office/Projects/Flashcard/data"
    output_dir = "d:/My office/Projects/Flashcard/data/translated"
    
    for i in range(1, 6):
        input_f = os.path.join(data_dir, f"hsk{i}.csv")
        output_f = os.path.join(output_dir, f"hsk{i}_vn.csv")
        if os.path.exists(input_f):
            translate_dataset(input_f, output_f)

if __name__ == "__main__":
    main()
