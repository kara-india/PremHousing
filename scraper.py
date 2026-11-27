#!/usr/bin/env python3
import csv
import time
import re
import random
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright

BASE = "https://www.magicbricks.com"
SEARCH_URL = (
    "https://www.magicbricks.com/property-for-sale/residential-real-estate"
    "?proptype=Multistorey-Apartment,Builder-Floor-Apartment,Penthouse,"
    "Studio-Apartment,Service-Apartment,Residential-House,Villa"
    "&cityName=Mumbai&Locality=Mira-Road"
)
OUTPUT_CSV = "mira_road_ultra_detailed.csv"
MAX_PAGES = 10 
DELAY = 3.0

def parse_summary(summary_text: str, title: str) -> dict:
    """Extracts rich data points from the raw summary string."""
    data = {
        "building_name": "", "bhk": "", "carpet_area": "", "super_area": "",
        "status": "", "possession_date": "", "transaction_type": "",
        "furnishing": "", "floor": "", "facing": "", "bathrooms": "", 
        "balconies": "", "overlooking": "", "parking": ""
    }
    
    # 1. Building Name (from "Society | XYZ" or Title)
    society_match = re.search(r'Society\s*\|\s*([^|]+)', summary_text)
    if society_match:
        data["building_name"] = society_match.group(1).strip()
    else:
        title_match = re.search(r'in\s+([^,]+)', title)
        if title_match:
            data["building_name"] = title_match.group(1).strip()

    # 2. BHK
    bhk_match = re.search(r'(\d+)\s*BHK', title, re.I)
    if bhk_match:
        data["bhk"] = bhk_match.group(1)

    # 3. Area
    carpet = re.search(r'Carpet Area\s*\|\s*([\d,]+)\s*sqft', summary_text, re.I)
    if carpet: data["carpet_area"] = carpet.group(1).replace(",", "")
    super_a = re.search(r'Super Area\s*\|\s*([\d,]+)\s*sqft', summary_text, re.I)
    if super_a: data["super_area"] = super_a.group(1).replace(",", "")

    # 4. Status & Possession
    if "Ready to Move" in summary_text:
        data["status"] = "Ready to Move"
    elif "Under Construction" in summary_text:
        data["status"] = "Under Construction"
    poss_date = re.search(r'Poss\. by\s*([^|]+)', summary_text)
    if poss_date: data["possession_date"] = poss_date.group(1).strip()

    # 5. Transaction Type
    if "New Property" in summary_text:
        data["transaction_type"] = "New Property"
    elif "Resale" in summary_text:
        data["transaction_type"] = "Resale"

    # 6. Furnishing
    furnishing = re.search(r'Furnishing\s*\|\s*([^|]+)', summary_text, re.I)
    if furnishing: data["furnishing"] = furnishing.group(1).strip()

    # 7. Floor & Facing
    floor = re.search(r'Floor\s*\|\s*([^|]+)', summary_text)
    if floor: data["floor"] = floor.group(1).strip()
    facing = re.search(r'facing\s*\|\s*([^|]+)', summary_text, re.I)
    if facing: data["facing"] = facing.group(1).strip()

    # 8. Bathrooms & Balconies
    bath = re.search(r'Bathroom\s*\|\s*(\d+)', summary_text, re.I)
    if bath: data["bathrooms"] = bath.group(1)
    balcony = re.search(r'Balcony\s*\|\s*(\d+)', summary_text, re.I)
    if balcony: data["balconies"] = balcony.group(1)

    # 9. Overlooking & Parking
    overlook = re.search(r'overlooking\s*\|\s*([^|]+)', summary_text, re.I)
    if overlook: data["overlooking"] = overlook.group(1).strip()
    parking = re.search(r'Car Parking\s*\|\s*([^|]+)', summary_text, re.I)
    if parking: data["parking"] = parking.group(1).strip()

    return data

def main():
    all_rows = []
    print("=== Launching browser ===")
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080}, locale="en-IN", timezone_id="Asia/Kolkata"
        )
        page = context.new_page()

        for page_num in range(1, MAX_PAGES + 1):
            url = SEARCH_URL if page_num == 1 else f"{SEARCH_URL}&page={page_num}"
            print(f"[*] Loading Search Page {page_num}")
            
            response = page.goto(url, timeout=60000)
            if response and response.status in (401, 403, 429):
                print(f"[!] Access denied or rate limited (HTTP {response.status}); stopping without retry.")
                break
            time.sleep(random.uniform(2.0, 4.0))
            page.mouse.wheel(0, 500)
            time.sleep(random.uniform(1.0, 2.0))
            
            try:
                page.wait_for_selector("div.mb-srp__card", timeout=15000)
            except Exception:
                break

            soup = BeautifulSoup(page.content(), "html.parser")
            cards = soup.select("div.mb-srp__card")
            print(f"  -> Found {len(cards)} cards")
            
            for card in cards:
                try:
                    title_tag = card.select_one("h2")
                    title = title_tag.get_text(" ", strip=True) if title_tag else ""
                    
                    price_tag = card.select_one(".mb-srp__card__price--amount")
                    price = price_tag.get_text(" ", strip=True) if price_tag else ""
                    
                    summary_tag = card.select_one(".mb-srp__card__summary")
                    summary = summary_tag.get_text(" | ", strip=True) if summary_tag else ""
                    
                    # Parse the rich data from the summary text
                    parsed_data = parse_summary(summary, title)
                    
                    row = {
                        "title": title,
                        "sale_value": price,
                        "raw_summary": summary,
                        **parsed_data
                    }
                    all_rows.append(row)
                except Exception as e:
                    pass
            
            time.sleep(DELAY)
        browser.close()

    if not all_rows: return

    fieldnames = ["title", "sale_value", "building_name", "bhk", "carpet_area", "super_area", "status", "possession_date", "transaction_type", "furnishing", "floor", "facing", "bathrooms", "balconies", "overlooking", "parking", "raw_summary"]
    
    with open(OUTPUT_CSV, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for row in all_rows:
            writer.writerow(row)

    print(f"\n[✓] Successfully wrote {len(all_rows)} richly detailed properties to {OUTPUT_CSV}")

if __name__ == "__main__":
    main()
