import pandas as pd
import json

file = "./scripts/Municipal _Ranking_Dataset_V1.xlsx"
out_path_part1 = "./frontend/public/data/kommune_data_part1.json"
out_path_part2 = "./frontend/public/data/kommune_data_part2.json"
out_path_model = "./frontend/public/data/kommune_data_model.json"

def fixKey(key: str, year: str):
    if year == "Ref": return key
    return key.replace("Ref", year)

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
        iMuniNr = str(row["iMuniNr"]).split('.')[0].zfill(5) 

        epci_val = row["iEpci"]
        epci_code = str(epci_val).split('.')[0] if pd.notna(epci_val) else ""
        
        epci_name_val = row["EpciName"]
        epci_name = str(epci_name_val).strip() if pd.notna(epci_name_val) else "EPCI Inconnu"
        
        dept_code = iMuniNr[:3] if iMuniNr.startswith('97') else iMuniNr[:2]

        kommune_data_year_byKommune = {
            "name": row["MuniName"],
            "codes_siren_des_epci": epci_code,
            "nom_epci": epci_name,
            "departement": dept_code
        }
        
        for determinant in dm["determinants"]:
            for indicator in determinant["indicators"]:
                indicator_value = row[fixKey(indicator["col_name"], year["key"])]
                
                if pd.isna(indicator_value):
                    indicator_value = 0

                kommune_data_year_byKommune[indicator["key"]] = indicator_value

                if indicator["key"] not in kommune_data_year["byMetric"]:
                    kommune_data_year["byMetric"][indicator["key"]] = [indicator_value]
                else:
                    kommune_data_year["byMetric"][indicator["key"]].append(indicator_value)

        kommune_data_year["byKommune"][iMuniNr] = kommune_data_year_byKommune

    for metric in kommune_data_year["byMetric"]:
        kommune_data_year["byMetric"][metric].sort()

    kommune_data["years"][year["key"]] = kommune_data_year

# --- DEBUT DU DECOUPAGE EN DEUX PARTIES ---
years_keys = list(kommune_data["years"].keys())
years_keys.sort()

mid = len(years_keys) // 2
years_part1 = years_keys[:mid]
years_part2 = years_keys[mid:]

kommune_data_part1 = {
    "years": {year: kommune_data["years"][year] for year in years_part1}
}

kommune_data_part2 = {
    "years": {year: kommune_data["years"][year] for year in years_part2}
}

with open(out_path_part1, 'w', encoding='utf-8') as f:
    json.dump(kommune_data_part1, f, ensure_ascii=False)

with open(out_path_part2, 'w', encoding='utf-8') as f:
    json.dump(kommune_data_part2, f, ensure_ascii=False)
# --- FIN DU DECOUPAGE ---

kommune_data_model = {
    "elements": [{
        "key": determinant["key"],
        "name": determinant["name"],
        **({"description": determinant["description"]} if "description" in determinant else {}),
        **({"invert": determinant["inverted"]} if "inverted" in determinant else {}),
        "metrics": [{
            "key": indicator["key"],
            "name": indicator["name"],
            **({"description": indicator["description"]} if "description" in indicator else {}),
            **({"invert": indicator["invert"]} if "invert" in indicator else {}),
        } for indicator in determinant["indicators"]],
    } for determinant in dm["determinants"]],

    "years": [{
        "key": year["key"],
        "name": year["name"],
        "description": year["description"],
    } for year in dm["years"]],
}

with open(out_path_model, "w", encoding="utf-8") as f:
    json.dump(kommune_data_model, f, ensure_ascii=False, indent=2)

print(f"Traitement terminé.")