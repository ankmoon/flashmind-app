import pandas as pd

progress_path = "data/translated/oxford5000_vn_progress.csv"
df = pd.read_csv(progress_path, encoding='utf-8')

placeholder = (df['meaning_vi'].astype(str) == 'Cần cập nhật').sum()
nan_count = df['meaning_vi'].isnull().sum()
nan_str = (df['meaning_vi'].astype(str) == 'nan').sum()
empty_str = (df['meaning_vi'].astype(str).str.strip() == '').sum()

total_missing = placeholder + nan_count + nan_str + empty_str
completed = len(df) - total_missing

print(f"=== Progress File Analysis ===")
print(f"Total rows: {len(df)}")
print(f"Completed: {completed} / {len(df)} ({completed/len(df)*100:.1f}%)")
print(f"Missing breakdown:")
print(f"  Placeholder: {placeholder}")
print(f"  NaN: {nan_count}")
print(f"  nan string: {nan_str}")
print(f"  Empty: {empty_str}")

if completed > 0:
    good = df[~((df['meaning_vi'].astype(str) == 'Cần cập nhật') | df['meaning_vi'].isnull() | (df['meaning_vi'].astype(str) == 'nan') | (df['meaning_vi'].astype(str).str.strip() == ''))]
    print(f"\nSample translated (first 10):")
    print(good[['word', 'type', 'meaning_vi']].head(10).to_string())
    print(f"\nSample translated (last 10):")
    print(good[['word', 'type', 'meaning_vi']].tail(10).to_string())
    
    # Find where translation stopped
    last_good_idx = good.index.max()
    first_bad_after = df.loc[last_good_idx+1:][df['meaning_vi'].astype(str) == 'Cần cập nhật'].index.min() if last_good_idx < len(df)-1 else None
    print(f"\nLast translated row index: {last_good_idx}")
    print(f"Last translated word: {df.at[last_good_idx, 'word']}")
    if first_bad_after is not None:
        print(f"First untranslated after: index {first_bad_after}, word: {df.at[first_bad_after, 'word']}")
else:
    print("\nProgress file also has NO translations!")
