# keywords
KEYWORDS = [
    "ambulance", "fire", "emergency", "rescue", "flood", "landslide",
    "injured","death","explosion", "blast", "crash","heavy rain",
    "disaster", "earthquake", "cyclone", "storm", "108", "burn", "collision"
]

# Pune-specific location indicators
PUNE_LOCATIONS = [
    "pune", "pcmc", "pmc", "pimpri", "chinchwad", "baner", "hinjawadi",
    "kothrud", "wakad", "hadapsar", "kharadi", "warje", "nanded", "swargate",
    "pune station","katraj depot", "swargate", "singhgad road", "MIDC"
]

# Query format: (EMS terms + location terms) + filters
query = "(" + " OR ".join(KEYWORDS) + ") (" + " OR ".join(PUNE_LOCATIONS) + ") lang:en -is:retweet"


BLOCKLIST = [
    "ipl", "cricket", "exam", "student", "movie", "admission", "festival"
]

pages = [
    # Pune
    "https://www.facebook.com/PuneCityPolice",
    "https://www.facebook.com/punemuncorp",
    "https://www.facebook.com/TOIPune",
    "https://www.facebook.com/lokmat",
    "https://www.facebook.com/SakalMediaGroup",
    "https://www.facebook.com/TV9Marathi",
    "https://www.facebook.com/ABPMajha",
    "https://www.facebook.com/SaamTV",
    "https://www.facebook.com/lokmat/posts",
    "https://www.facebook.com/Zee24Taas/posts",
    "https://www.facebook.com/DDNational/",
    "https://www.facebook.com/SaamTV",
    "https://www.facebook.com/Lokshevay",    
    "https://www.facebook.com/EkmatMarathi/posts",

    # # Goa
    # "https://www.facebook.com/GoaPolice",
    # "https://www.facebook.com/goagovt",
    # "https://www.facebook.com/TOIGoa",
    # "https://www.facebook.com/heraldgoa",
    # "https://www.facebook.com/gomantaktimes",
    # "https://www.facebook.com/navhindtimes",
    # "https://www.facebook.com/goa365tv",
    # "https://www.facebook.com/prudentmediagoa",
]
fb_keywords = [
    # Fire/Explosion
    "fire", "blast", "explosion", "burning", "short circuit", "chemical fire", "gas leak",

    # Medical Emergency
    "ambulance", "medical emergency", "injured", "critical",
     "accidental poisoning"

    # Road/Vehicle Accidents
    "accident", "road mishap", "road blocked", "traffic jam",

    # Natural Disaster / Climate Events
    "flood", "flooded", "landslide", "earthquake", "tremors", "cyclone", "storm", "heavy rain",
    "building collapse", "tree fall", "waterlogging", "overflowing river",


    # General Casualties
    "died", "dead", "death", "fatal", "killed", "critical injury", "dead body", "deceased",

    # Rescue & Response
    "rescue", "evacuation", "relief", "disaster response", "alert issued", "warning", "red alert", "search operation",
]
fb_location_keywords = [

    # ---- Pune Region (Urban + Fringe) ----
    "pune", "pmc", "pcmc", "punekar", "puneri", "pune city", "mh12", "mh14",
    "pimpri", "chinchwad", "kothrud", "shivajinagar", "kasba peth", "kharadi", "hadapsar", "bibwewadi",
    "swargate", "aundh", "baner", "balewadi", "bhosari", "nigdi", "wakad", "warje", "katraj", "dhayari",
    "hinjewadi", "it park", "magarpatta", "nana peth", "sadashiv peth", "deccan", "mundhwa", "sus",
    "karvenagar", "moshi", "alandi", "chakan", "talegaon", "uruli", "manjari", "fursungi", "ravet",
    "pirangut", "paud", "lavasa", "panshet", "maval", "mulshi", "bhandarkar road", "shivajinagar station",
    "pune station", "katraj depot", "swargate bus stand", "singhgad road", "fatima nagar", "nanded city",



#     # ---- Goa State (North + South + Beaches + Towns) ----
#     "goa", "north goa", "south goa", "panaji", "panjim", "vasco", "margao", "mapusa", "calangute", "candolim",
#     "baga", "anjuna", "morjim", "arambol", "dona paula", "porvorim", "sanquelim", "bicholim", "ponda",
#     "canacona", "curchorem", "quepem", "cortalim", "mollem", "salcete", "mormugao", "chapora", "siolim",
#     "colva", "palolem", "miramar", "taligao", "taleigao", "assagao", "caranzalem", "old goa", "church of bom jesus",
#     "madgaon", "betalbatim", "verna", "raia", "nuvem", "curtorim", "shiroda", "mollem", "sanguem", "dhargalim",
#     "gauravaddo", "mandrem", "parra", "goan", "gaonkars", "gauravaddo"
# 

]
api_key = "6def2a5e5f1b470eb186cf10a7a3bc73"

NEWS_EMS_KEYWORDS = [
    "accident", "ambulance", "emergency", "fire", "explosion", "rescue", "flood", "landslide",
    "earthquake", "cyclone", "storm", "heavy rain", "warning", "red alert", "gas leak",
    "building collapse", "tree fall", "waterlogging", "overflowing river", "burning",
    "injured", "injury", "death", "crash", "blast", "burn", "chemical fire"
]

NEWS_BLOCKLIST_KEYWORDS = [
    "exam", "student", "ipl", "cricket", "movie", "film", "education", "college", "school",
    "recruitment", "admission", "result", "festival", "ticket"
]

NEWS_LOCATIONS = [
    "pune", "pcmc", "pmc", "hinjewadi", "baner", "kothrud", "shivajinagar", "pune city",
    "kasba peth", "kharadi", "hadapsar", "bibwewadi", "pune station", "katraj depot",
    "swargate", "singhgad road", "midc"
    # Add Goa location strings here as needed
]

# RSS Feeds for PUNE and GOA regions
RSS_FEEDS = [
    "https://www.esakal.com/rss-feed",
    "https://www.abplive.com/rss/maharashtra.xml",
    "https://www.loksatta.com/rss/maharashtra.xml",
    "https://www.tv9marathi.com/feed",
    "https://www.lokmat.com/rss/maharashtra-news.xml",
    "https://www.sakalmedia.in/rss.xml",
    "https://www.news18.com/rss/maharashtra.xml"
    # Facebook pages not supported in feedparser (ignored)
]

# Expanded Disaster/EMS Keywords
RSS_KEYWORDS = [
    "accident", "collision", "road mishap","ambulance", "emergency", "injury", "injured", 
    "critical", "hospital", "108", "dead", "death","fire", "blast", "explosion", "short circuit",
    "gas leak", "burning","flood", "flooded", "landslide", "earthquake", "cyclone", "storm", "heavy rain",
     "building collapse","rescue", "alert", "evacuation", "died", "fatal", "police", "crime", "dead body"
]


# Blocklisted terms (irrelevant to DMS context)
RSS_BLOCKLIST_KEYWORDS = [
    "exam", "student", "university", "college", "admission", "bus fare", "train", "ipl", "cricket",
    "movie", "film", "box office", "cinema", "festival", "celebrity", "reality show", "match",
    "job", "recruitment", "hostel", "education", "school", "result"
]

# Maharashtra RSS feeds (state-level news sources)
REDDIT_RSS_FEEDS = [
    "https://www.lokmat.com/rss/maharashtra-news.xml",
    "https://www.sakalmedia.in/rss.xml",
    "https://www.esakal.com/rss-feed",
    "https://www.abplive.com/rss/maharashtra.xml",
    "https://www.loksatta.com/rss/maharashtra.xml",
    "https://www.tv9marathi.com/feed",
    "https://www.news18.com/rss/maharashtra.xml",
]

# EMS-specific keywords
REDDIT_EMS_KEYWORDS = [
    "accident", "ambulance", "emergency", "fire", "explosion", "rescue", "flood", "landslide",
    "earthquake", "cyclone", "storm", "heavy rain", "warning", "red alert", "gas leak",
    "building collapse", "tree fall", "waterlogging", "overflowing river", "burning",
    "injured", "injury", "death", "crash", "blast", "burn", "chemical fire",
]

# Blocklist
REDDIT_BLOCKLIST_KEYWORDS = [
    "campus", "admission", "exam", "fees", "university", "education", 
    "student", "result", "job", "recruitment", "ipl", "match"
]
