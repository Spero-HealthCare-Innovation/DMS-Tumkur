import re, json, requests
from datetime import datetime
from langdetect import detect
from deep_translator import GoogleTranslator
from admin_web.constants import NEWS_EMS_KEYWORDS, NEWS_BLOCKLIST_KEYWORDS, NEWS_LOCATIONS

def translate_if_needed(text):
    try:
        lang = detect(text)
        if lang != 'en':
            translated = GoogleTranslator(source='auto', target='en').translate(text)
            return translated, lang
        return text, lang
    except:
        return text, "und"

def is_ems_related(text):
    text = text.lower()
    if any(b in text for b in NEWS_BLOCKLIST_KEYWORDS):
        return False
    return any(re.search(rf"\b{kw}\b", text) for kw in NEWS_EMS_KEYWORDS)

def detect_region(text):
    text = text.lower()
    for loc in NEWS_LOCATIONS:
        if loc in text:
            if "pune" in loc or loc in ["pcmc", "baner", "shivajinagar"]:  # add more
                return "Pune"
    return "Unknown"

def standardize_post(media_status, text, translated_text, user, language, region, date_time, link):
    return {
        "media_status": str(media_status),
        "text": text,
        "translated_text": translated_text,
        "user": user,
        "language": language,
        "region": region,
        "date_time": date_time,
        "link": link
    }

def news_dms_scraper(api_key):
    url = f"https://newsapi.org/v2/everything?q=rain OR accident OR fire&language=en&sortBy=publishedAt&pageSize=50&apiKey={api_key}"

    try:
        response = requests.get(url)
        response.raise_for_status()
        articles = response.json().get("articles", [])
    except:
        return [], "API Error"

    results = []
    print(articles)
    for article in articles:
        title = article.get("title", "")
        desc = article.get("description", "")
        text = f"{title} {desc}".strip()

        translated, lang = translate_if_needed(text)
        if is_ems_related(translated):
            region = detect_region(translated)
            if region == "Pune":
                results.append(standardize_post(
                    media_status=2,
                    text=text,
                    translated_text=translated,
                    user=article.get("author", "Unknown"),
                    language=lang,
                    region=region,
                    date_time=article.get("publishedAt", ""),
                    link=article.get("url", "")
                ))
    return results, None
# print('test',news_dms_scraper('6def2a5e5f1b470eb186cf10a7a3bc73'))