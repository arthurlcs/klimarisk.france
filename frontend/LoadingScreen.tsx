import React from 'react';

// 🎯 AJOUTÉ : Injection de l'animation CSS directement dans le DOM pour ne pas toucher aux fichiers CSS globaux
const animationStyles = `
@keyframes loading {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0); }
  100% { transform: translateX(100%); }
}
`;

// 🎯 AJOUTÉ : Interface pour accepter un message personnalisé en prop
interface LoadingScreenProps {
    message?: string;
}

// 🎯 MODIFIÉ : Le composant accepte maintenant la prop "message" avec une valeur par défaut
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
    message = "Calcul des risques climatiques des 34 000 communes"
}) => {
    return (
        <div style={styles.container}>
            {/* Balise style injectée dynamiquement */}
            <style>{animationStyles}</style>

            <div style={styles.card}>
                <h2 style={styles.title}>Chargement de la Carte...</h2>
                {/* 🎯 MODIFIÉ : Affichage du texte dynamique ici */}
                <p style={styles.subtitle}>{message}</p>
                <div style={styles.progressContainer}>
                    <div style={styles.progressBar} />
                </div>
            </div>
        </div>
    );
};

const styles = {
    // 🎯 MODIFIÉ : Changement des dimensions pour s'adapter à la carte et positionnement absolu centré
    container: {
        position: 'absolute' as const, // S'aligne sur le parent .mapContainer
        top: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%', // Épouse 100% de la hauteur de la carte
        width: '100%',  // Épouse 100% de la largeur de la carte
        backgroundColor: '#ffffff',
        fontFamily: 'sans-serif',
        zIndex: 9999,   // Passe au-dessus des contrôles de la carte
    },
    card: {
        textAlign: 'center' as const,
        color: '#ffffff',
    },
    title: {
        fontSize: '1.5rem',
        marginBottom: '0.5rem',
        color: '#040404',
        fontWeight: 600,
    },
    subtitle: {
        fontSize: '0.9rem',
        color: '#040404',
        marginBottom: '1.5rem',
    },
    progressContainer: {
        width: '300px',
        height: '6px',
        backgroundColor: '#ffedd5',
        borderRadius: '3px',
        overflow: 'hidden',
        margin: '0 auto',
    },
    progressBar: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f97316', // Bleu moderne
        borderRadius: '3px',
        animation: 'loading 2s infinite ease-in-out', // L'animation fonctionne maintenant de manière autonome
    },
};

export default LoadingScreen;