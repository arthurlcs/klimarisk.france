import { useState, useMemo, useRef, useEffect } from "react";
import useDataStore, { type KommuneNr } from "../hooks/useDataStore";
import { normalizeString } from "../hooks/statistics";
import "./KommuneSearch.css";

function KommuneSearch() {
    const { data, selectedYear, setSelectedKommune, selectedKommune } = useDataStore();

    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Indexation de la liste des communes
    const communesList = useMemo(() => {
        if (!data || !selectedYear || !data.years[selectedYear]) return [];
        return Object.entries(data.years[selectedYear].byKommune).map(([nr, k]) => ({
            nr: nr as KommuneNr,
            name: k.name,
            normalized: normalizeString(k.name),
        }));
    }, [data, selectedYear]);

    // Filtrage dynamique avec système de score/priorité
    const suggestions = useMemo(() => {
        const cleanQuery = normalizeString(query);
        if (cleanQuery.length < 2) return [];

        // 1. Filtrer d'abord pour ne garder que les correspondances
        const matches = communesList.filter(k => k.normalized.includes(cleanQuery));

        // 2. Trier pour donner la priorité aux correspondances les plus pertinentes
        return matches
            .sort((a, b) => {
                if (a.normalized === cleanQuery) return -1;
                if (b.normalized === cleanQuery) return 1;
                const aStarts = a.normalized.startsWith(cleanQuery);
                const bStarts = b.normalized.startsWith(cleanQuery);
                if (aStarts && !bStarts) return -1;
                if (!aStarts && bStarts) return 1;

                // Sinon, tri alphabétique classique sur le nom d'origine
                return a.name.localeCompare(b.name);
            })
            .slice(0, 15);
    }, [query, communesList]);

    // Fermeture au clic extérieur
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Synchronisation bidirectionnelle du champ de saisie
    useEffect(() => {
        if (!selectedKommune) {
            setQuery("");
        } else if (data && selectedYear) {
            const name = data.years[selectedYear].byKommune[selectedKommune]?.name;
            if (name && name !== query) setQuery(name);
        }
    }, [selectedKommune, data, selectedYear]);

    function handleSelect(nr: KommuneNr, name: string) {
        setSelectedKommune(nr);
        setQuery(name);
        isOpen && setIsOpen(false);
    }

    return (
        <div className="kommuneSearchContainer" ref={containerRef}>
            <input
                type="text"
                className="searchBarInput"
                placeholder="Rechercher une commune..."
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
            />

            {isOpen && suggestions.length > 0 && (
                <ul className="suggestionsList">
                    {suggestions.map((k) => (
                        <li key={k.nr}>
                            <button type="button" onClick={() => handleSelect(k.nr, k.name)}>
                                <span className="suggestionName">{k.name}</span>
                                <span className="suggestionDept">({String(k.nr).slice(0, 2)})</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default KommuneSearch;