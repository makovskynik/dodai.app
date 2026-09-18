#!/usr/bin/env python3
import re, json, time, html, urllib.request
from html.parser import HTMLParser
from concurrent.futures import ThreadPoolExecutor, as_completed

SERVICES = [
  ("1+1 media", "https://marketer.ua/ru/website/1-1-media/"),
  ("Admitad", "https://marketer.ua/ru/website/admitad/"),
  ("ADMIXER", "https://marketer.ua/ru/website/admixer/"),
  ("AppsFlyer", "https://marketer.ua/ru/website/appsflyer/"),
  ("Diia.City United", "https://marketer.ua/ru/website/diia-city-united/"),
  ("EASE", "https://marketer.ua/ru/website/ease/"),
  ("Education.ua", "https://marketer.ua/ru/website/education-ua/"),
  ("Factum Group", "https://marketer.ua/ru/website/factum-group/"),
  ("finmap", "https://marketer.ua/ru/website/finmap/"),
  ("FRACTAL", "https://marketer.ua/ru/website/netpeak-group/"),
  ("GetProspect", "https://marketer.ua/ru/website/getprospect/"),
  ("GetResponse", "https://marketer.ua/ru/website/getresponse/"),
  ("GlobalLogic", "https://marketer.ua/ru/website/globallogic/"),
  ("Gradus Research", "https://marketer.ua/ru/website/gradus-research/"),
  ("GRC", "https://marketer.ua/ru/website/grc/"),
  ("HAPP", "https://marketer.ua/ru/website/happ/"),
  ("Headway Inc", "https://marketer.ua/ru/website/headway/"),
  ("I-PM.Education", "https://marketer.ua/ru/website/i-pm-education/"),
  ("ICM", "https://marketer.ua/ru/website/icm/"),
  ("Indigo Tech Recruiters", "https://marketer.ua/ru/website/indigo-tech-recruiters/"),
  ("Infobip", "https://marketer.ua/ru/website/infobip/"),
  ("Integrity Vision", "https://marketer.ua/ru/website/integrity-vision/"),
  ("keyapp", "https://marketer.ua/ru/website/keyapp/"),
  ("Kiss My Apps", "https://marketer.ua/ru/website/kiss-my-apps/"),
  ("Linkos Group", "https://marketer.ua/ru/website/linkos-group/"),
  ("LIONCOM", "https://marketer.ua/ru/website/lioncom-event-agency/"),
  ("LOOQME", "https://marketer.ua/ru/website/looqme/"),
  ("LP-CRM", "https://marketer.ua/ru/website/lp-crm/"),
  ("MacPaw", "https://marketer.ua/ru/website/macpaw/"),
  ("MAMI", "https://marketer.ua/ru/website/mami/"),
  ("MGID", "https://marketer.ua/ru/website/mgid/"),
  ("MK:translations", "https://marketer.ua/ru/website/mk-translations/"),
  ("NetHunt CRM", "https://marketer.ua/ru/website/nethunt-crm/"),
  ("NetSolid Investments", "https://marketer.ua/ru/website/netsolid-investments/"),
  ("On News", "https://marketer.ua/ru/website/on-news/"),
  ("Payoneer Ukraine", "https://marketer.ua/ru/website/payoneer-ukraine/"),
  ("PRNEWS.IO", "https://marketer.ua/ru/website/prnews-io/"),
  ("Ringostat", "https://marketer.ua/ru/website/ringostat/"),
  ("Rocket", "https://marketer.ua/ru/website/rocket/"),
  ("SalesDoubler", "https://marketer.ua/ru/website/salesdoubler/"),
  ("SE Ranking", "https://marketer.ua/ru/website/se-ranking/"),
  ("Serpstat", "https://marketer.ua/ru/website/serpstat/"),
  ("SMMboost", "https://marketer.ua/ru/website/smmboost/"),
  ("Snov.io", "https://marketer.ua/ru/website/snov-io/"),
  ("SOM", "https://marketer.ua/ru/website/som/"),
  ("Traffic Jack Team", "https://marketer.ua/ru/website/traffic-jack-team/"),
  ("TrendHERO", "https://marketer.ua/ru/website/trendhero/"),
  ("UKAD", "https://marketer.ua/ru/website/ukad/"),
  ("WayForPay", "https://marketer.ua/ru/website/wayforpay/"),
  ("Work.ua", "https://marketer.ua/ru/website/work-ua/"),
  ("ВРК", "https://marketer.ua/ru/website/all-ukrainian-advertising-coalition/"),
]

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"

def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "uk,ru;q=0.9,en;q=0.8"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", errors="replace")

def clean(t):
    t = html.unescape(re.sub(r"<[^>]+>", " ", t or ""))
    return re.sub(r"\s+", " ", t).strip()

def parse_page(name, url, html_text):
    # official site: look for common patterns
    site = None
    patterns = [
        r'(?:Сайт|Website|Официальный сайт|Офіційний сайт)[^<]{0,80}<a[^>]+href=["\'](https?://[^"\']+)["\']',
        r'class=["\'][^"\']*website[^"\']*["\'][^>]*href=["\'](https?://[^"\']+)["\']',
        r'rel=["\']noopener["\'][^>]*href=["\'](https?://(?!marketer\.ua)[^"\']+)["\']',
        r'href=["\'](https?://(?!marketer\.ua|facebook|instagram|linkedin|twitter|t\.me|youtube|tiktok)[^"\']+)["\'][^>]*>\s*(?:Сайт|Website|Перейти|Перейти на сайт)',
    ]
    for p in patterns:
        m = re.search(p, html_text, re.I)
        if m:
            site = m.group(1)
            break
    # fallback: first external link in content that looks like homepage
    if not site:
        externals = re.findall(r'href=["\'](https?://(?!marketer\.ua|www\.facebook|instagram|linkedin|twitter|t\.me|youtube|tiktok|doubleclick|google|mc\.yandex)[^"\']+)["\']', html_text, re.I)
        # prefer links that appear early in article body
        for e in externals:
            low = e.lower()
            if any(x in low for x in ["cdn.", "wp-content", "gravatar", "schema.org", "w3.org", "fonts."]):
                continue
            site = e
            break
    # description: og:description or meta description
    desc = None
    m = re.search(r'property=["\']og:description["\']\s+content=["\']([^"\']+)', html_text, re.I)
    if not m:
        m = re.search(r'content=["\']([^"\']+)["\']\s+property=["\']og:description["\']', html_text, re.I)
    if not m:
        m = re.search(r'name=["\']description["\']\s+content=["\']([^"\']+)', html_text, re.I)
    if m:
        desc = clean(m.group(1))[:400]
    # category breadcrumbs / tags
    cats = re.findall(r'/website/[^"\']*?["\'][^>]*>(Tech & Products|Company & Services|Media & Community)', html_text)
    # try class taxonomy
    tax = re.findall(r'website[_-]?(?:type|category|cat)[^>]*>\s*([^<]{3,40})', html_text, re.I)
    category = cats[0] if cats else (tax[0].strip() if tax else None)
    # body excerpt
    body_m = re.search(r'<article[^>]*>(.*?)</article>', html_text, re.I|re.S)
    if not body_m:
        body_m = re.search(r'class=["\'][^"\']*entry-content[^"\']*["\'][^>]*>(.*?)</div>', html_text, re.I|re.S)
    excerpt = None
    if body_m:
        paras = re.findall(r'<p[^>]*>(.*?)</p>', body_m.group(1), re.I|re.S)
        texts = [clean(p) for p in paras if clean(p) and len(clean(p)) > 40]
        if texts:
            excerpt = texts[0][:500]
    return {
        "name": name,
        "marketer_url": url,
        "website": site,
        "description": desc or excerpt,
        "category_hint": category,
    }

def one(item):
    name, url = item
    try:
        html_text = fetch(url)
        return parse_page(name, url, html_text)
    except Exception as e:
        return {"name": name, "marketer_url": url, "website": None, "description": None, "category_hint": None, "error": str(e)}

results = []
with ThreadPoolExecutor(max_workers=6) as ex:
    futs = {ex.submit(one, s): s for s in SERVICES}
    for fut in as_completed(futs):
        r = fut.result()
        results.append(r)
        print(f"OK: {r['name']} -> {r.get('website') or r.get('error')}", flush=True)

results.sort(key=lambda x: x["name"].lower())
with open("marketer-services-seed.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f"\nSaved {len(results)} items")
