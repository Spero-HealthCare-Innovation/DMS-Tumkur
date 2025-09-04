import re
from deep_translator import GoogleTranslator
from admin_web.constants import pages, fb_keywords, fb_location_keywords
import hashlib
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import NoSuchElementException
from deep_translator import GoogleTranslator
from langdetect import detect
from datetime import datetime, timezone, timedelta
import json
import time

def extract_hashtags(text):
    return re.findall(r"#(\w+)", text)

def match_any(text, fb_keywords):
    return any(kw.lower() in text for kw in fb_keywords)

def is_relevant_post(post_text):
    try:
        translated = GoogleTranslator(source='auto', target='en').translate(post_text)
    except:
        translated = ""

    combined_text = f"{post_text} {translated}".lower()
    hashtags = extract_hashtags(post_text)
    full_text = combined_text + ' ' + ' '.join(hashtags).lower()

    matched_emergency = [kw for kw in fb_keywords if kw in full_text]
    matched_location = [loc for loc in fb_location_keywords if loc in full_text]

    has_emergency_word = len(matched_emergency) > 0
    has_location = len(matched_location) > 0

    print(" POST TEXT:", post_text[:80].replace("\n", " "))
    print(" Emergency Matches:", matched_emergency)
    print(" Location Matches:", matched_location)
    print(f" Emergency: {has_emergency_word} |  Location: {has_location}")

    return has_emergency_word and has_location

def detect_language(text):
    try:
        return detect(text)
    except:
        return "unknown"

def detect_location_tags(text):
    text = text.lower()
    return [loc for loc in fb_location_keywords if loc in text]

def has_media(article):
    try:
        if article.find_element(By.TAG_NAME, "img").get_attribute("src"):
            return 1
    except:
        pass
    try:
        if article.find_element(By.TAG_NAME, "video").get_attribute("src"):
            return 1
    except:
        pass
    return 0

def convert_relative_time(relative):
    now = datetime.now()
    match = re.match(r"(\d+)\s*(m|h|d)", relative.lower())
    if match:
        value, unit = int(match.group(1)), match.group(2)
        if unit == 'm':
            return (now - timedelta(minutes=value)).strftime('%Y-%m-%d %H:%M:%S')
        elif unit == 'h':
            return (now - timedelta(hours=value)).strftime('%Y-%m-%d %H:%M:%S')
        elif unit == 'd':
            return (now - timedelta(days=value)).strftime('%Y-%m-%d %H:%M:%S')
    return relative

def extract_date(article):
    try:
        abbr_tag = article.find_element(By.TAG_NAME, "abbr")
        date_time = abbr_tag.get_attribute("title")
        if date_time:
            return date_time
    except:
        pass
    try:
        spans = article.find_elements(By.XPATH, ".//span")
        for span in spans:
            text = span.text.strip().lower()
            if re.match(r"^\d+\s*(m|h|d)$", text):
                return convert_relative_time(text)
    except:
        pass
    try:
        lines = article.text.split('\n')
        for line in lines:
            if re.search(r"\d+\s*(m|h|d)", line.lower()) and not any(x in line for x in ["Like", "Comment", "Share", ".com"]):
                return convert_relative_time(line.strip())
    except:
        pass
    return "Unknown"

def extract_user(text):
    lines = text.strip().split("\n")
    return lines[0].strip() if lines else "None"

def create_post_link(page_url, content):
    hash_id = hashlib.md5(content.encode()).hexdigest()[:8]
    return f"{page_url}#{hash_id}"

def setup_driver():
    options = Options()
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("user-agent=Mozilla/5.0")
    return webdriver.Chrome(service=Service(), options=options)

# ----------------------- SCRAPER -----------------------

def scrape_facebook_posts():
    driver = setup_driver()
    final_posts = []
    partial_matches = []

    for url in pages:
        print(f"\n Opening: {url}")
        try:
            driver.get(url)
            time.sleep(5)
            for _ in range(5):
                driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(2)

            articles = driver.find_elements(By.XPATH, '//div[@role="article"]')
            print(f" Found {len(articles)} articles")

            for article in articles:
                try:
                    text = article.text.strip()
                    if not text or len(text) < 20:
                        continue
                    if not is_relevant_post(text):
                        partial_matches.append({
                            "link": create_post_link(url, text),
                            "text": text
                        })
                        continue

                    lang = detect_language(text)
                    media = has_media(article)
                    user = extract_user(text)
                    date_time = extract_date(article)

                    try:
                        post_time_obj = datetime.strptime(date_time, "%Y-%m-%d %H:%M:%S")
                        if datetime.now() - post_time_obj > timedelta(hours=24):
                            continue
                    except:
                        print(" Could not parse date. Skipping.")
                        continue

                    post_link = create_post_link(url, text)
                    location_tags = detect_location_tags(text)

                    # Translate text:
                    translated_text = ""
                    try:
                        translated_text = GoogleTranslator(source='auto', target='en').translate(text)
                    except:
                        translated_text = text

                    # Standardize format
                    post_data = {
                        "text": text,
                        "translated_text": translated_text,
                        "user": user,
                        "language": lang,
                        "region": location_tags[0] if location_tags else "Unknown",
                        "date_time": date_time,
                        "link": post_link,
                        "media_status": "1"  # Facebook
                    }

                    final_posts.append(post_data)

                except Exception as e:
                    print(f" Post parse error: {e}")

        except Exception as e:
            print(f" Failed to visit {url}: {e}")

    driver.quit()

    with open("filtered_fb_posts_dms.json", "w", encoding="utf-8") as f:
        json.dump(final_posts, f, ensure_ascii=False, indent=2)

    with open("partial_matches.json", "w", encoding="utf-8") as f:
        json.dump(partial_matches, f, ensure_ascii=False, indent=2)

    print(f"\n Saved {len(final_posts)} relevant posts to filtered_fb_posts_dms.json")
    return final_posts


