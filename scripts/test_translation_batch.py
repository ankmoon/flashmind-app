from deep_translator import GoogleTranslator

def test_batch():
    translator = GoogleTranslator(source='en', target='vi')
    batch = [
        ("bank", "a financial institution"),
        ("bank", "to deposit money in a bank"),
        ("lead", "a chemical element"),
        ("lead", "to show the way"),
    ]
    
    prompt = " [NEXT] ".join([f"{w}: {d}" for w, d in batch])
    print(f"Prompt: {prompt}")
    translated = translator.translate(prompt)
    print(f"Translated: {translated}")
    
    parts = translated.split("[NEXT]")
    for i, part in enumerate(parts):
        # Extract word part
        if ":" in part:
            meaning = part.split(":")[0].strip()
        elif "：" in part:
            meaning = part.split("：")[0].strip()
        else:
            meaning = part.strip()
        print(f"Item {i}: {meaning}")

if __name__ == "__main__":
    test_batch()
