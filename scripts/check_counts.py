import os
import glob
import csv

def count_lines(filepath, is_tsv=False):
    sep = '\t' if is_tsv else ','
    try:
        with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
            reader = csv.reader(f, delimiter=sep)
            return sum(1 for row in reader)
    except Exception as e:
        return f"Error: {e}"

def main():
    data_dir = "d:/My office/Projects/Flashcard/data"
    files = glob.glob(os.path.join(data_dir, "*.[ct]sv"))
    print(f"{'File':<30} | {'Lines':<10}")
    print("-" * 45)
    for f in sorted(files):
        name = os.path.basename(f)
        is_tsv = f.endswith('.tsv')
        lines = count_lines(f, is_tsv)
        print(f"{name:<30} | {lines:<10}")

if __name__ == "__main__":
    main()
