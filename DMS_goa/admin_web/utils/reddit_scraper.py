import feedparser, re
from datetime import datetime
from langdetect import detect
from deep_translator import GoogleTranslator
from admin_web.constants import REDDIT_RSS_FEEDS, REDDIT_EMS_KEYWORDS, REDDIT_BLOCKLIST_KEYWORDS
# from myapp.models import RssPost

def detected_region(text):
    try:
        if not text.strip():
            return "Other"

        # Detect and translate if needed
        lang = detect(text)
        if lang != 'en':
            text = GoogleTranslator(source='auto', target='en').translate(text)

        # Define Pune-related keywords (English + translated equivalents)
        pune_keywords = [
            "pune", "pimpri", "chinchwad", "hadapsar", "kothrud", "shivajinagar",
            "nigdi", "wakad", "hinjewadi", "baner", "bavdhan", "singhad", "yerwada",
            "vadgaon", "fursungi"
        ]

        lower = text.lower()
        return "Pune" if any(k in lower for k in pune_keywords) else "Other"

    except Exception as e:
        print(f"[Region Detection Error]: {e}")
        return "Other"


def translate_if_needed(text):
    try:
        if not text.strip():
            return "", "und"
        lang = detect(text)
        if lang != 'en':
            translated = GoogleTranslator(source='auto', target='en').translate(text)
            return translated, lang
        return text, lang
    except Exception as e:
        print(f"  Translation failed: {e}")
        return text, "und"

def is_ems_related(text, link):
    lower = (text + " " + link).lower()
    if any(b in lower for b in REDDIT_BLOCKLIST_KEYWORDS):
        return False
    return any(re.search(rf'\b{k}\b', lower) for k in REDDIT_EMS_KEYWORDS)


def scrape_reddit_feeds():
    results = []
    for url in REDDIT_RSS_FEEDS:
        feed = feedparser.parse(url)
        for e in feed.entries:
            content = f"{e.get('title','')} {e.get('summary','')}".strip()
            tr, lang = translate_if_needed(content)
            if not is_ems_related(tr, e.get('link','')):
                continue
            dt = e.get("published_parsed") or e.get("updated_parsed")
            date_time = datetime(*dt[:6]) if dt else None
            region = detected_region(content)
            if region != "Pune":
                continue
            results.append({
                'title': e.get('title',''),
                'summary': e.get('summary',''),
                'author': e.get('author','Unknown'),
                'language': lang,
                'region': region,
                'date_time': date_time,
                'media_status': 4,
                'translated_text': tr,
                'link': e.get('link',''),
            })
    # print(results)
    return results