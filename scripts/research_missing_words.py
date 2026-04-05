import pandas as pd
import os
from deep_translator import GoogleTranslator

def analyze_missing():
    filepath = "data/translated/oxford5000_vn.csv"
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    df = pd.read_csv(filepath)
    missing = df[df['meaning_vi'] == 'Cần cập nhật']
    print(f"Total rows in CSV: {len(df)}")
    print(f"Total missing meanings: {len(missing)}")
    
    # Group by first letter
    if not missing.empty:
        letter_counts = missing['word'].dropna().str[0].str.lower().value_counts().sort_index()
        print("\nMissing words by letter:")
        print(letter_counts)
        
        # Sample 'O' words
        o_missing = missing[missing['word'].str.lower().str.startswith('o', na=False)]['word'].unique()[:10]
        print(f"\nSample 'O' words: {o_missing}")
        
        # Test translation
        translator = GoogleTranslator(source='en', target='vi')
        print("\nTesting translation for first 5 'O' words:")
        for word in o_missing[:5]:
            try:
                translated = translator.translate(word)
                print(f"{word}: {translated}")
            except Exception as e:
                print(f"Failed to translate {word}: {e}")

if __name__ == "__main__":
    analyze_missing()
