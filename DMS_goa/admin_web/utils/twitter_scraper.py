import re, json
from datetime import datetime, timezone
from deep_translator import GoogleTranslator
from langdetect import detect
from admin_web.constants import KEYWORDS, PUNE_LOCATIONS, query

def is_ems_related(text):
    lower = text.lower()
    return any(re.search(rf'\b{k}\b', lower) for k in KEYWORDS)

def detect_region(text):
    lower = text.lower()
    for loc in PUNE_LOCATIONS:
        if loc in lower:
            return "Pune"
    return "Unknown"

def translate_if_needed(text):
    try:
        if not text.strip():
            return "", "und"
        lang = detect(text)
        if lang != 'en':
            translated = GoogleTranslator(source='auto', target='en').translate(text)
            return translated, lang
        return text, lang
    except:
        return text, "und"

def scrape_pune_ems_tweets(client, query, KEYWORDS, PUNE_LOCATIONS):
    final_results = []

    try:
        response = client.search_recent_tweets(
            query=query,
            max_results=50,
            tweet_fields=["created_at", "author_id", "text", "id"]
        )
    except Exception as e:
        return [], f"Twitter API error: {e}"

    if not response.data:
        return [], "No tweets found"

    today_str = datetime.now().strftime("%Y-%m-%d")

    for tweet in response.data:
        text = tweet.text
        translated_text, detected_lang = translate_if_needed(text)
        region = detect_region(translated_text, PUNE_LOCATIONS)

        if region != "Pune":
            continue
        if not is_ems_related(translated_text, KEYWORDS):
            continue

        created_at_utc = tweet.created_at.replace(tzinfo=timezone.utc)
        created_local = created_at_utc.astimezone()
        tweet_date = created_local.strftime("%Y-%m-%d")

        if tweet_date != today_str:
            continue

        tweet_data = {
            "text": text,
            "translated_text": translated_text,
            "user_id": tweet.author_id,
            "language": detected_lang,
            "region": region,
            "date_time": created_local.strftime("%Y-%m-%d %H:%M:%S"),
            "link": f"https://twitter.com/user/status/{tweet.id}",
            "media_status": "0",
            "tweet_id": str(tweet.id)
        }

        final_results.append(tweet_data)

    with open("Tweets_pune_dms.json", "w", encoding="utf-8") as f:
        json.dump(final_results, f, indent=2, ensure_ascii=False)

    return final_results, None