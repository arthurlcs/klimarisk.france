import pandas as pd
import json

file = "./scripts/kommunerangering+2024+-+datasett.xlsx"
out_path = "./frontend/public/data/kommune_data.json"
out_path_model = "./frontend/public/data/kommune_data_model.json"


# Workaround column names containg year, TODO: possibly define changed excel norm
def fixKey(key: str, year: str):
    if year == "2000": return key
    return key.replace("2000", year)

# Load data model
dm = json.load(open("./scripts/kommune_data_model.json", 'r', encoding='utf-8'))

kommune_data = {
    "years": {}
}

for year in dm["years"]:
    df = pd.read_excel(file, sheet_name=year["sheet_name"])

    kommune_data_year = {
        "byKommune": {},
        "byMetric": {},
    }
    for index, row in df.iterrows():
        iKomNr = str(row["iKomNr"]).zfill(4) # Ensure 4-digit kommune number

        kommune_data_year_byKommune = {
            "name": row["KomNavn"],
        }
        for determinant in dm["determinants"]:
            for indicator in determinant["indicators"]:
                indicator_value = row[fixKey(indicator["col_name"], year["name"])]

                kommune_data_year_byKommune[indicator["key"]] = indicator_value

                # Add metric [] to byMetric dictionary if it doesnt exist
                if indicator["key"] not in kommune_data_year["byMetric"]:
                    kommune_data_year["byMetric"][indicator["key"]] = [indicator_value]
                else:
                    kommune_data_year["byMetric"][indicator["key"]].append(indicator_value)

        kommune_data_year["byKommune"][iKomNr] = kommune_data_year_byKommune

    # sort byMetric {} metrics
    for metric in kommune_data_year["byMetric"]:
        kommune_data_year["byMetric"][metric].sort()

    kommune_data["years"][year["name"]] = kommune_data_year

with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(kommune_data, f, ensure_ascii=False, indent=2)

# Recreate the data model with only useful information for the frontend
kommune_data_model = {
    "elements": [{
        "key": determinant["key"],
        "name": determinant["name"],
        **({"description": determinant["description"]} if "description" in determinant else {}),
        **({"invert": determinant["invert"]} if "invert" in determinant else {}),
        "metrics": [{
            "key": indicator["key"],
            "name": indicator["name"],
            **({"description": indicator["description"]} if "description" in indicator else {}),
            **({"invert": indicator["invert"]} if "invert" in indicator else {}),
        } for indicator in determinant["indicators"]],
    } for determinant in dm["determinants"]]
}

with open(out_path_model, "w", encoding="utf-8") as f:
    json.dump(kommune_data_model, f, ensure_ascii=False, indent=2)