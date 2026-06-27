import { useState, useEffect } from 'react';

export function useDesktopMode() {
    const [isDesktopForced, setIsDesktopForced] = useState<boolean>(false);

    useEffect(() => {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) return;

        if (isDesktopForced) {
            // On force une largeur fixe de 1200px et on laisse le navigateur mobile dézoomer
            viewport.setAttribute('content', 'width=1200, initial-scale=0.3, maximum-scale=3.0');
        } else {
            // Configuration responsive mobile standard
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }

        // Nettoyage au démontage du composant
        return () => {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        };
    }, [isDesktopForced]);

    return { isDesktopForced, toggleDesktopMode: () => setIsDesktopForced(!isDesktopForced) };
}