import csv
import re

CSV_FILE = "mira_road_ultra_detailed.csv"
SQL_FILE = "insert.sql"

def parse_price(price_str):
    if not price_str or "Call" in price_str: return 0.00
    num = float(re.sub(r'[^\d.]', '', price_str))
    if "Cr" in price_str: return round(num * 10000000, 2)
    if "Lac" in price_str: return round(num * 100000, 2)
    return round(num, 2)

def clean_sql(val):
    if not val or val.strip() == "":
        return "null"
    # Escape single quotes for SQL
    val = val.replace("'", "''").strip()
    return f"'{val}'"

def main():
    unique_rows = []
    seen = set()

    with open(CSV_FILE, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Create a unique fingerprint to remove duplicates
            fingerprint = (row['title'], row['sale_value'], row['carpet_area'], row['super_area'], row['floor'])
            if fingerprint in seen:
                continue
            seen.add(fingerprint)
            unique_rows.append(row)

    print(f"Found {len(unique_rows)} unique properties after removing duplicates.")

    with open(SQL_FILE, "w", encoding='utf-8') as f:
        f.write("-- Generated import preview. New rows remain draft for individual PREM review.\n")
        f.write("-- This file has not been executed against any Supabase project.\n")
        f.write("begin;\n\n")
        f.write("insert into public.localities (name, slug, city, region)\n")
        f.write("values ('Mira Road', 'mira-road', 'Mira-Bhayandar', 'Maharashtra')\n")
        f.write("on conflict (slug) do nothing;\n\n")

        f.write("with incoming_data (title, price, area, beds, baths, furnishing, builder, status, possession, txn, floor, facing, overlooking, parking, balconies) as (\nvalues\n")

        values_list = []
        for row in unique_rows:
            title = clean_sql(row['title'])
            price = parse_price(row['sale_value'])
            
            # Use carpet_area if available, else super_area
            area = row['carpet_area'] if row['carpet_area'] else row['super_area']
            area = float(area) if area else "null"
            
            beds = row['bhk'] if row['bhk'] else "null"
            baths = row['bathrooms'] if row['bathrooms'] else "null"
            
            furnishing = row['furnishing'].lower() if row['furnishing'] else "null"
            if furnishing not in ("'unfurnished'", "'semi-furnished'", "'furnished'") and furnishing != "null":
                furnishing = f"'{furnishing}'"
            elif furnishing != "null":
                furnishing = furnishing # already has quotes
            else:
                furnishing = "null"

            # Ignore parser artifacts and quote source text safely.
            builder_value = row['building_name'].strip()
            if builder_value in ['Car Parking', 'Bathroom', 'Mira Road', 'Mira Road Mumbai', '']:
                builder = "null"
            else:
                builder = clean_sql(builder_value)

            status = clean_sql(row['status'])
            possession = clean_sql(row['possession_date'])
            txn = clean_sql(row['transaction_type'])
            floor = clean_sql(row['floor'])
            facing = clean_sql(row['facing'])
            overlooking = clean_sql(row['overlooking'])
            parking = clean_sql(row['parking'])
            balconies = row['balconies'] if row['balconies'] else "null"

            values_list.append(f"({title}, {price}, {area}, {beds}, {baths}, {furnishing}, {builder}, {status}, {possession}, {txn}, {floor}, {facing}, {overlooking}, {parking}, {balconies})")

        f.write(",\n".join(values_list))
        f.write("\n)\n")

        f.write("""
insert into public.properties (
    title, property_type, transaction_type, status, locality_id, address,
    price, area_sqft, bedrooms, bathrooms, furnishing, builder, features, source_name, source_url
)
select 
    i.title, 
    'apartment'::public.property_type,
    'sale'::public.transaction_type,
    'draft'::public.property_status,
    (select id from public.localities where slug = 'mira-road'),
    'Mira Road, Mumbai',
    i.price,
    i.area,
    i.beds::smallint,
    i.baths::smallint,
    i.furnishing,
    i.builder,
    array_remove(array[
        case when i.status is not null then i.status end,
        case when i.possession is not null then 'Possession: ' || i.possession end,
        case when i.txn is not null then 'Transaction: ' || i.txn end,
        case when i.floor is not null then 'Floor: ' || i.floor end,
        case when i.facing is not null then 'Facing: ' || i.facing end,
        case when i.overlooking is not null then 'Overlooking: ' || i.overlooking end,
        case when i.parking is not null then 'Parking: ' || i.parking end,
        case when i.balconies is not null then 'Balconies: ' || i.balconies end,
        case when i.baths is not null then 'Bathroom: ' || i.baths end
    ], null),
    'magicbricks',
    null
from incoming_data i
where not exists (
    select 1 from public.properties p
    where p.title = i.title
      and p.price = i.price
      and coalesce(p.area_sqft, -1) = coalesce(i.area, -1)
      and coalesce(p.builder, '') = coalesce(i.builder, '') 
      and coalesce(p.bedrooms, -1) = coalesce(i.beds::smallint, -1)
);

commit;
""")

    print(f"Successfully generated {SQL_FILE}!")

if __name__ == "__main__":
    main()
