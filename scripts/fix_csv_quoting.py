import pandas as pd
import glob
import os

def fix_csv_quoting(filepath):
    try:
        # Read the CSV (handling the potential errors during reading)
        # We'll use a more flexible parser if needed, but standard should work if we quote correctly later
        df = pd.read_csv(filepath, quotechar='"', skipinitialspace=True)
        # Save it back with proper quoting
        df.to_csv(filepath, index=False, quoting=1) # csv.QUOTE_ALL
        print(f"Fixed quoting for: {filepath}")
    except Exception as e:
        print(f"Error fixing {filepath}: {e}")

def main():
    files = glob.glob("data/translated/*.csv")
    for f in files:
        fix_csv_quoting(f)

if __name__ == "__main__":
    main()
