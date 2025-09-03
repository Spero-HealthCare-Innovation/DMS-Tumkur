from deep_translator import GoogleTranslator
from langdetect import detect
from admin_web.constants import RSS_BLOCKLIST_KEYWORDS, RSS_KEYWORDS, RSS_FEEDS
import re
import feedparser
from datetime import datetime

# ------------------------ PLACEHOLDER REGION ------------------------

def detected_region(text):
    return "Pune"

# ------------------------ UTILITIES ------------------------

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

    #  Hard skip if any junk keyword appears
    if any(bl_word in lower for bl_word in RSS_BLOCKLIST_KEYWORDS):
        return False

    #  Must match at least 2 EMS keywords to be valid (stricter)
    ems_match_count = sum(1 for k in RSS_KEYWORDS if re.search(rf"\b{k}\b", lower))
    return ems_match_count >= 2


# ------------------------ FORMAT WRAPPER ------------------------

def standardize_post(media_status, text, translated_text, user, language, region, date_time, link):
    return {
        "media_status": "3",
        "text": text,
        "translated_text": translated_text,
        "user": user,
        "language": language,
        "region": region,
        "date_time": date_time,
        "link": link
    }
    
def scrape_rss_feeds():
    ems_news = []
    for url in RSS_FEEDS:
        feed = feedparser.parse(url)
        for e in feed.entries:
            content = f"{e.get('title','')} {e.get('summary','')}".strip()
            tr, lang = translate_if_needed(content)
            if not is_ems_related(tr, e.get('link','')):
                continue
            dt = e.get("published_parsed")
            date_time = datetime(*dt[:6]) if dt else None
            data = {
                'title': e.get('title',''),
                'summary': e.get('summary',''),
                'author': e.get('author','Unknown'),
                'language': lang,
                'region': detected_region(content),
                'date_time': date_time,
                'media_status': '3',
                'translated_text': tr,
                'link': e.get('link',''),
            }
            ems_news.append(data)
    return ems_news