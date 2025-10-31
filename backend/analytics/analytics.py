BAD_WORDS = ['плохо', 'хейт', 'спам', 'bad', 'hate', 'spam']

def analyze_content(text: str):
    if not text:
        return {"is_safe": True, "bad_count": 0, "suggestion": "Empty"}
    words = text.lower().split()
    bad_count = sum(1 for word in words if any(bw in word for bw in BAD_WORDS))
    is_safe = bad_count == 0
    return {
        "is_safe": is_safe,
        "bad_count": bad_count,
        "suggestion": "Safe" if is_safe else "Review for bad words"
    }