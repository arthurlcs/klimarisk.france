import pandas as pd
import json

file = "./scripts/Municipal _Ranking_Dataset_V1.xlsx"
# Chemins mis à jour pour les deux morceaux
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
        # Force la conversion en chaîne et s'assure des 5 caractères (ex: 1001 -> '01001')
        iMuniNr = str(row["iMuniNr"]).split('.')[0].zfill(5) 

        kommune_data_year_byKommune = {
            "name": row["MuniName"],
        }
        for determinant in dm["determinants"]:
            for indicator in determinant["indicators"]:
                indicator_value = row[fixKey(indicator["col_name"], year["key"])]
                
                # Remplacement des valeurs NaN (vides) d'Excel pour éviter les bugs de tri JS
                if pd.isna(indicator_value):
                    indicator_value = 0

                kommune_data_year_byKommune[indicator["key"]] = indicator_value

                # Construction du tableau des métriques globales
                if indicator["key"] not in kommune_data_year["byMetric"]:
                    kommune_data_year["byMetric"][indicator["key"]] = [indicator_value]
                else:
                    kommune_data_year["byMetric"][indicator["key"]].append(indicator_value)

        kommune_data_year["byKommune"][iMuniNr] = kommune_data_year_byKommune

    # Tri des tableaux de métriques
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

# Écriture sans "indent=2" pour compresser au maximum la taille du fichier texte brut
with open(out_path_part1, 'w', encoding='utf-8') as f:
    json.dump(kommune_data_part1, f, ensure_ascii=False)

with open(out_path_part2, 'w', encoding='utf-8') as f:
    json.dump(kommune_data_part2, f, ensure_ascii=False)
# --- FIN DU DECOUPAGE ---

# Recréation du modèle de données utile pour le frontend
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

print(f"Traitement terminé. Fichiers générés sous la limite Git :")
print(f" -> {out_path_part1}")
print(f" -> {out_path_part2}")
print(f" -> {out_path_model}")