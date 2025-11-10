# image_scraper.py (with exclusion list support)
import re
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import json
import os

MIN_YEAR = 2024
MAX_YEAR = 2028

def load_exclusions(filename="exclude.txt"):
    """Load names to exclude from output (one per line)."""
    if not os.path.exists(filename):
        return set()
    with open(filename, "r", encoding="utf-8") as f:
        # strip whitespace and ignore empty/commented lines
        return {line.strip() for line in f if line.strip() and not line.strip().startswith("#")}


def scrape_members(html: str, excluded: set, base_url="https://www.thecube.llc",
                   min_year=MIN_YEAR, max_year=MAX_YEAR):
    soup = BeautifulSoup(html, "html.parser")

    # Find all "Class of ####" headers
    def match_class_header(tag):
        if not hasattr(tag, "get_text"):
            return None
        text = tag.get_text(strip=True)
        m = re.fullmatch(r"Class of\s+(\d{4})", text, flags=re.I)
        return int(m.group(1)) if m else None

    all_headers = []
    for t in soup.find_all(True):
        y = match_class_header(t)
        if y is not None:
            all_headers.append((t, y))

    results = {}

    def pick_best_src(img):
        srcset = (img.get("srcset") or "").split(",")
        for cand in srcset:
            url = cand.strip().split(" ")[0]
            if url and not url.startswith("data:"):
                return url
        for attr in ("data-src", "data-original", "data-url", "src"):
            val = img.get(attr)
            if val:
                return val
        return None

    for i, (header, year) in enumerate(all_headers):
        next_header = all_headers[i + 1][0] if i + 1 < len(all_headers) else None
        process = (min_year <= year <= max_year)

        node = header.next_element
        while node and node is not next_header:
            if process and getattr(node, "name", None) == "img":
                alt = node.get("alt") or ""
                if re.search(r"\s-\s*Photo\s*$", alt, flags=re.I):
                    name = re.sub(r"\s*-\s*Photo\s*$", "", alt, flags=re.I).strip()
                    if name in excluded:
                        node = getattr(node, "next_element", None)
                        continue
                    raw = pick_best_src(node)
                    if raw:
                        url = raw if raw.startswith("http") else urljoin(base_url, raw)
                        results.setdefault(name, url)
            node = getattr(node, "next_element", None)

    return results


if __name__ == "__main__":
    # Load exclusion list
    excluded_names = load_exclusions("exclude.txt")
    print(f"Loaded {len(excluded_names)} excluded names.")

    # Load HTML file
    with open("members.html", "r", encoding="utf-8") as f:
        html = f.read()

    data = scrape_members(html, excluded=excluded_names)

    # Save to JSON file
    output_filename = "members_2024_2028.json"
    with open(output_filename, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✅ Scraped {len(data)} members (Class of 2024–2028).")
    print(f"💾 Saved results to {output_filename}.")
    if excluded_names:
        print(f"🧹 Excluded: {', '.join(sorted(excluded_names))}")
