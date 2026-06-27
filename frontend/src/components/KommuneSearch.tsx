import { useState, useMemo, useRef, useEffect } from "react";
import useDataStore, { type KommuneNr } from "../hooks/useDataStore";
import useLanguageStore from "../hooks/useLanguageStore";
import { normalizeString } from "../hooks/statistics";
import { getDataFileJSON } from "../hooks/getPublicUrl";
import "./KommuneSearch.css";

// Correspondance officielle pour remplacer "Département XX" par le vrai nom
const DEPARTEMENTS_MAP: Record<string, string> = {
    "01": "Ain", "02": "Aisne", "03": "Allier", "04": "Alpes-de-Haute-Provence", "05": "Hautes-Alpes",
    "06": "Alpes-Maritimes", "07": "Ardèche", "08": "Ardennes", "09": "Ariège", "10": "Aube",
    "11": "Aude", "12": "Aveyron", "13": "Bouches-du-Rhône", "14": "Calvados", "15": "Cantal",
    "16": "Charente", "17": "Charente-Maritime", "18": "Cher", "19": "Corrèze", "2A": "Corse-du-Sud",
    "2B": "Haute-Corse", "21": "Côte-d'Or", "22": "Côtes-d'Armor", "23": "Creuse", "24": "Dordogne",
    "25": "Doubs", "26": "Drôme", "27": "Eure", "28": "Eure-et-Loir", "29": "Finistère",
    "30": "Gard", "31": "Haute-Garonne", "32": "Gers", "33": "Gironde", "34": "Hérault",
    "35": "Ille-et-Vilaine", "36": "Indre", "37": "Indre-et-Loire", "38": "Isère", "39": "Jura",
    "40": "Landes", "41": "Loir-et-Cher", "42": "Loire", "43": "Haute-Loire", "44": "Loire-Atlantique",
    "45": "Loiret", "46": "Lot", "47": "Lot-et-Garonne", "48": "Lozère", "49": "Maine-et-Loire",
    "50": "Manche", "51": "Marne", "52": "Haute-Marne", "53": "Mayenne", "54": "Meurthe-et-Moselle",
    "55": "Meuse", "56": "Morbihan", "57": "Moselle", "58": "Nièvre", "59": "Nord",
    "60": "Oise", "61": "Orne", "62": "Pas-de-Calais", "63": "Puy-de-Dôme", "64": "Pyrénées-Atlantiques",
    "65": "Hautes-Pyrénées", "66": "Pyrénées-Orientales", "67": "Bas-Rhin", "68": "Haut-Rhin",
    "69": "Rhône", "70": "Haute-Saône", "71": "Saône-et-Loire", "72": "Sarthe", "73": "Savoie",
    "74": "Haute-Savoie", "75": "Paris", "76": "Seine-Maritime", "77": "Seine-et-Marne", "78": "Yvelines",
    "79": "Deux-Sèvres", "80": "Somme", "81": "Tarn", "82": "Tarn-et-Garonne", "83": "Var",
    "84": "Vaucluse", "85": "Vendée", "86": "Vienne", "87": "Haute-Vienne", "88": "Vosges",
    "89": "Yonne", "90": "Territoire de Belfort", "91": "Essonne", "92": "Hauts-de-Seine",
    "93": "Seine-Saint-Denis", "94": "Val-de-Marne", "95": "Val-d'Oise",
    "971": "Guadeloupe", "972": "Martinique", "973": "Guyane", "974": "La Réunion", "976": "Mayotte"
};

interface SearchItem {
    id: string;
    name: string;
    normalized: string;
    type: "current_scale" | "commune_shortcut";
    deptCode: string;
}

function KommuneSearch() {
    const { setSelectedKommune, selectedKommune, entityMapping, aggregationLevel, data, selectedYear } = useDataStore();
    const { language } = useLanguageStore();

    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [allCommunes, setAllCommunes] = useState<SearchItem[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Chargement du référentiel national des communes
    useEffect(() => {
        getDataFileJSON('kommune.geojson').then((geo: any) => {
            if (geo?.features) {
                const list = geo.features.map((f: any) => {
                    const code = String(f.properties.code_insee).padStart(5, '0');
                    return {
                        id: code,
                        name: f.properties.nom_officiel || "",
                        normalized: normalizeString(f.properties.nom_officiel || ""),
                        type: "commune_shortcut",
                        deptCode: code.slice(0, 2)
                    };
                });
                setAllCommunes(list);
            }
        });
    }, []);

    // Extraction stable du code départemental
    const resolveDeptCode = (id: string, item: any, aggLevel: string): string => {
        if (aggLevel === "departement") return id;

        const checkOutreMer = (code: string) => code.startsWith("97") ? code.slice(0, 3) : code.slice(0, 2);
        if (aggLevel === "commune") return checkOutreMer(id);

        if (aggLevel === "epci") {
            if (item?.departement) return String(item.departement);

            const sampleCommuneInsee = Object.keys(entityMapping || {}).find(
                (communeInsee) => String(entityMapping[communeInsee]) === String(id)
            );
            if (sampleCommuneInsee) {
                return checkOutreMer(sampleCommuneInsee);
            }
        }
        return checkOutreMer(id);
    };
    
    // 2. Construction de la base de recherche (Pool unifié)
    const searchPool = useMemo(() => {
        const pool: SearchItem[] = [];
        const seenIds = new Set<string>();

        if (data?.years && selectedYear) {
            const yearStr = String(selectedYear);
            const yearData = data.years[yearStr];

            if (yearData?.byKommune) {
                Object.entries(yearData.byKommune).forEach(([id, item]: [string, any]) => {
                    if (!seenIds.has(id)) {
                        const dCode = resolveDeptCode(id, item, aggregationLevel);
                        // Remplacement dynamique du nom par le dictionnaire si échelle département
                        const displayName = aggregationLevel === "departement"
                            ? (DEPARTEMENTS_MAP[dCode] || item.name)
                            : item.name;

                        pool.push({
                            id,
                            name: displayName,
                            normalized: normalizeString(displayName),
                            type: "current_scale",
                            deptCode: dCode
                        });
                        seenIds.add(id);
                    }
                });
            }
        }

        // Raccourcis communes
        if (aggregationLevel !== "commune") {
            allCommunes.forEach(c => {
                if (!seenIds.has(c.id)) {
                    pool.push(c);
                    seenIds.add(c.id);
                }
            });
        }
        return pool;
    }, [data, selectedYear, allCommunes, aggregationLevel, entityMapping]);

    // 3. Filtrage
    const suggestions = useMemo(() => {
        const q = normalizeString(query);
        if (q.length < 2) return [];
        const matches = searchPool.filter(k => k.normalized.includes(q));

        return matches
            .sort((a, b) => {
                if (a.normalized === q) return -1;
                if (b.normalized === q) return 1;
                const aStarts = a.normalized.startsWith(q);
                const bStarts = b.normalized.startsWith(q);
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;
                return a.name.localeCompare(b.name);
            }).slice(0, 15);
    }, [query, searchPool]);

    // 4. Synchronisation sélection -> champ texte
    useEffect(() => {
        if (!selectedKommune) {
            setQuery("");
        } else if (data?.years && selectedYear) {
            const yearStr = String(selectedYear);
            const item = data.years[yearStr]?.byKommune[String(selectedKommune)];
            if (item) {
                const dCode = resolveDeptCode(String(selectedKommune), item, aggregationLevel);
                const displayName = aggregationLevel === "departement"
                    ? (DEPARTEMENTS_MAP[dCode] || item.name)
                    : item.name;

                setQuery(`${displayName} (${dCode})`);
            }
        }
    }, [selectedKommune, data, selectedYear, aggregationLevel, entityMapping]);

    // Gestion clic extérieur
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (item: SearchItem) => {
        const targetEntity = entityMapping[item.id] || item.id;
        setSelectedKommune(targetEntity as KommuneNr);
        setIsOpen(false);
    };

    return (
        <div className="kommuneSearchContainer" ref={containerRef}>
            <input
                type="text"
                className="searchBarInput"
                placeholder={language === "en" ? "Search..." : "Rechercher..."}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                onFocus={() => setIsOpen(true)}
            />

            {isOpen && suggestions.length > 0 && (
                <ul className="suggestionsList">
                    {suggestions.map((k, i) => (
                        <li key={`${k.id}-${i}`}>
                            <button type="button" onClick={() => handleSelect(k)}>
                                <span className="suggestionName">{k.name}</span>
                                <span className="suggestionDept" style={{ opacity: 0.6, fontSize: "0.85em", marginLeft: "8px" }}>
                                    ({k.deptCode})
                                </span>

                                {k.type === "current_scale" && aggregationLevel !== "commune" && (
                                    <span style={{ opacity: 0.5, fontSize: "0.8em", marginLeft: "5px" }}>
                                        [{aggregationLevel === "epci" ? "EPCI" : "Dép"}]
                                    </span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default KommuneSearch;