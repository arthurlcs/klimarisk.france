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
    yr = year["name"]

    df = pd.read_excel(file, sheet_name=year["sheet_name"])

    kommune_data_year = {
        "byKommune": {}
    }

    for index, row in df.iterrows():
        iKomNr = str(row["iKomNr"]).zfill(4) # Ensure 4-digit kommune number #TODO: settle on format, keep consistent with frontend
        row_data = {
            "name": row["KomNavn"],
        }
        for element in dm["elements"]: #TODO: maybe rename element to indeks
            #TODO: add element weighting, as well as metric weightings
            for metric in element["metrics"]: #TODO: maybe rename metric to indikator
                row_data[metric["key"]] = row[fixKey(metric["col_name"], yr)]

        kommune_data_year["byKommune"][iKomNr] = row_data

    kommune_data["years"][yr] = kommune_data_year

print(df)
print(df.columns)
print(df.iloc[0])

# print(kommune_data)

with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(kommune_data, f, ensure_ascii=False, indent=2)


# Recreate the data model with only useful information for the frontend
kommune_data_model = {
    "elements": [{
        "name": element["name"],
        "key": element["key"],
        **({"invert": element["invert"]} if "invert" in element else {}),
        "metrics": [{
            "name": metric["name"],
            "key": metric["key"],
            **({"invert": metric["invert"]} if "invert" in metric else {}),
        } for metric in element["metrics"]],
    } for element in dm["elements"]]
}

with open(out_path_model, "w", encoding="utf-8") as f:
    json.dump(kommune_data_model, f, ensure_ascii=False, indent=2)