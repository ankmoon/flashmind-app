from deep_translator import GoogleTranslator

def test():
    translator = GoogleTranslator(source='en', target='vi')
    test_cases = [
        "bank: a financial institution",
        "bank: to deposit money in a bank",
        "lead: a chemical element",
        "lead: to show the way",
    ]
    
    for case in test_cases:
        translated = translator.translate(case)
        print(f"Original: {case}")
        print(f"Translated: {translated}")
        print("-" * 20)

if __name__ == "__main__":
    test()
