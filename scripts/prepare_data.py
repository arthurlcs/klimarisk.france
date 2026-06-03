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
        for element in dm["elements"]: #TODO: maybe rename element to indeks
            for metric in element["metrics"]: #TODO: maybe rename metric to indikator
                metric_value = row[fixKey(metric["col_name"], year["name"])]

                kommune_data_year_byKommune[metric["key"]] = metric_value

                # Add metric [] to byMetric dictionary if it doesnt exist
                if metric["key"] not in kommune_data_year["byMetric"]:
                    kommune_data_year["byMetric"][metric["key"]] = [metric_value]
                else:
                    kommune_data_year["byMetric"][metric["key"]].append(metric_value)

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
        "key": element["key"],
        "name": element["name"],
        **({"description": element["description"]} if "description" in element else {}),
        **({"invert": element["invert"]} if "invert" in element else {}),
        "metrics": [{
            "key": metric["key"],
            "name": metric["name"],
            **({"description": metric["description"]} if "description" in metric else {}),
            **({"invert": metric["invert"]} if "invert" in metric else {}),
        } for metric in element["metrics"]],
    } for element in dm["elements"]]
}

with open(out_path_model, "w", encoding="utf-8") as f:
    json.dump(kommune_data_model, f, ensure_ascii=False, indent=2)