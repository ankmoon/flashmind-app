import requests
import time
import os

def download_file(url, dest):
    print(f"Downloading {url} to {dest}...")
    for i in range(5):
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                with open(dest, 'wb') as f:
                    f.write(response.content)
                print(f"Success: {dest}")
                return True
            else:
                print(f"Failed: {response.status_code}")
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(2)
    return False

data_dir = "d:/My office/Projects/Flashcard/data"
os.makedirs(data_dir, exist_ok=True)

DATA_DIR = "d:/My office/Projects/Flashcard/data"

SOURCES = {
    "hsk": "https://raw.githubusercontent.com/clemtoy/hsk-vocabulary/master/data/hsk_words.csv",
    "oxford": "https://raw.githubusercontent.com/k9982874/oxford-5000/main/oxford5000.csv",
    "topik": "https://raw.githubusercontent.com/julienshim/combined_korean_vocabulary_list/master/results.tsv"
}

# Separate list for JLPT to handle multiple levels if needed
JLPT_SOURCES = {
    "jlpt_n5": "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/master/src/n5.csv",
    "jlpt_n4": "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/master/src/n4.csv",
    "jlpt_n3": "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/master/src/n3.csv",
    "jlpt_n2": "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/master/src/n2.csv",
    "jlpt_n1": "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/master/src/n1.csv",
}

def download_file(url, destination):
    print(f"Downloading {url} to {destination}...")
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        with open(destination, 'wb') as f:
            f.write(response.content)
        print(f"Success: {destination}")
        return True
    except Exception as e:
        print(f"Failed: {e}")
        return False

def main():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    # Download main sources
    for name, url in SOURCES.items():
        ext = ".tsv" if name == "topik" else ".csv"
        dest = os.path.join(DATA_DIR, f"{name}{ext}")
        if not os.path.exists(dest):
            download_file(url, dest)
            time.sleep(1)
        else:
            print(f"File already exists: {dest}")
            
    # Download JLPT sources
    for name, url in JLPT_SOURCES.items():
        dest = os.path.join(DATA_DIR, f"{name}.csv")
        if not os.path.exists(dest):
            download_file(url, dest)
            time.sleep(1)
        else:
            print(f"File already exists: {dest}")

if __name__ == "__main__":
    main()
