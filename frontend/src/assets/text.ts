const text = {
  common: {
    loading: {
      en: "Loading...",
      fr: "Chargement...",
    },
    totalRisk: {
      en: "Total Risk",
      fr: "Risque Total",
    },
  },
  header: {
    layout: {
      l1: {
        en: "Nationwide overview",
        fr: "Aperçu national",
      },
      l2: {
        en: "Municipality analysis",
        fr: "Analyse des communes",
      },
      label: {
        en: "Analysis mode",
        fr: "Mode d'analyse",
      }
    },
    year: {
      label: {
        en: "Selected time",
        fr: "Horizon sélectionné",
      },
    },
  },
  panels: {
    tree: {
      en: "Risk Customization Tree",
      fr: "Personnalisation du risque",
      tooltip: {
        en: "This tree shows how the overall risk is built up from the different determinants and their indicators. By default all indicators are included in the overall risk, but you can exclude specific indicators by clicking on them in the tree. The determinants and overall risk are calculated with only the included indicators. Each determinant is calculated as a sum of its indicators, normalized from 0 to 100. The overall risk is the sum of the determinants, with no normalization. Note that some determinants and indicators might be inverted, to make sure that a higher value always means a higher risk.",
        fr: "Cet arbre montre comment le risque global est construit à partir des différents déterminants et de leurs indicateurs. Par défaut, tous les indicateurs sont inclus dans le risque global, mais vous pouvez exclure des indicateurs spécifiques en cliquant sur eux dans l'arbre. Les déterminants et le risque global sont calculés avec seulement les indicateurs inclus. Chaque déterminant est calculé comme une somme de ses indicateurs, normalisée de 0 à 100. Le risque global est la somme des déterminants, sans normalisation. Notez que certains déterminants et indicateurs peuvent être inversés, pour s'assurer qu'une valeur plus élevée signifie toujours un risque plus élevé.",
      },
    },
    map: {
      en: "Map View",
      fr: "Vue Cartographique",
      tooltip: {
        en: "This map shows the selected metric for all municipalities in Norway. The selected municipality is highlighted with a black outline. You can zoom and pan the map to explore different areas, and click on municipalities to select them. The colors represent the relative values of the currently selected metric, where stronger colors indicate higher values.",
        fr: "Ce carte montre la métrique sélectionnée pour toutes les communes en Norvège. La commune sélectionnée est mise en évidence avec un contour noir. Vous pouvez zoomer et déplacer la carte pour explorer différentes zones, et cliquer sur les communes pour les sélectionner. Les couleurs représentent les valeurs relatives de la métrique actuellement sélectionnée, où les couleurs plus fortes indiquent des valeurs plus élevées.",
      },
    },
    chart: {
      en: "Municipality Distribution Chart",
      fr: "Diagramme de Distribution des Communes",
      tooltip: {
        en: "This chart shows the distribution of the chosen metric accross all municipalities in the nation and in the selected municipality's county. The possible metrics are the overall risk, the determinants, and the indicators. The mean and median values for the nation and county can be toggled by clicking their values below the chart. By hovering over the chart, you can see the number of municipalities that have a value within the hovered bin. Above the chart, you can change the metric that is shown in the chart.",
        fr: "Ce diagramme montre la distribution de la métrique choisie parmi toutes les communes du pays et dans le comté de la commune sélectionnée. Les métriques possibles sont le risque global, les déterminants et les indicateurs. Les valeurs moyennes et médianes pour le pays et le comté peuvent être basculées en cliquant sur leurs valeurs sous le diagramme. En survolant le diagramme, vous pouvez voir le nombre de communes ayant une valeur dans la case survolée. Au-dessus du diagramme, vous pouvez changer la métrique affichée.",
      },
    },
    table: {
      en: "Data Table",
      fr: "Tableau de Données",
      tooltip: {
        en: "This table displays the selected municipality together with all municipalities in the country. Click a column header to sort and rank the municipalities by that value, and click again to reverse the sorting direction. All determinants and indicators are included in the table only in the 'Municipality analysis' analysis mode. Click a municipality row to select it throughout the dashboard. The colored square at the beginning of each row matches the municipality's color on the map for the currently selected metric.",
        fr: "Ce tableau affiche la commune sélectionnée ainsi que toutes les communes du pays. Cliquez sur un en-tête de colonne pour trier et classer les communes par cette valeur, et cliquez à nouveau pour inverser la direction du tri. Tous les déterminants et indicateurs sont inclus dans le tableau uniquement en mode d'analyse 'Analyse de la commune'. Cliquez sur une ligne de commune pour la sélectionner dans l'ensemble du tableau de bord. Le carré coloré au début de chaque ligne correspond à la couleur de la commune sur la carte pour la métrique actuellement sélectionnée.",
      },
    },
    details: {
      en: "Municipality Rankings",
      fr: "Classement des communes",
      tooltip: {
        en: "This panel shows the selected municipality's rankings for all determinants and indicators. The rankings are displayed both nationally and within the municipality's county. A ranking of 1 means the municipality has the highest climate risk for that metric within the selected group, so lower ranking numbers indicate higher relative risk. The colored square beside each metric matches the municipality's color on the map when that metric is selected. Clicking a determinant or indicator selects it throughout the dashboard. The determinants are sorted by their contribution to the overall risk, while the indicators within each determinant are sorted by their contribution to that determinant.",
        fr: "Ce paneau affiche les classements de la commune sélectionnée pour tous les déterminants et indicateurs. Les classements sont affichés à la fois au niveau national et au sein du comté de la commune. Un classement de 1 signifie que la commune a le risque climatique le plus élevé pour ce indicateur au sein du groupe sélectionné, donc des numéros de classement plus bas indiquent un risque relatif plus élevé. Le carré coloré à côté de chaque indicateur correspond à la couleur de la commune sur la carte lorsque cet indicateur est sélectionné. En cliquant sur un déterminant ou un indicateur, celui-ci est sélectionné dans l'ensemble du tableau de bord. Les déterminants sont triés par leur contribution au risque global, tandis que les indicateurs au sein de chaque déterminant sont triés par leur contribution à ce déterminant.",
      },
    },
  },
  chart: {
    tooltip: {
      value: {
        en: "Value",
        fr: "Valeur",
      },
      norway: {
        en: "France",
        fr: "France",
      },
      county: {
        en: "Department",
        fr: "Département",
      },
      kommuner: {
        en: "municipalities",
        fr: "communes",
      },
      interval: {
        en: "Interval",
        fr: "Intervalle",
      },
    },
    stats: {
      mean: {
        en: "Mean",
        fr: "Moyenne",
      },
      median: {
        en: "Median",
        fr: "Médiane",
      },
      tooltip: {
        norge: {
          en: "This column shows the mean and median value of all municipalities in the nation.",
          fr: "Cette colonne affiche la moyenne et la médiane de toutes les communes dans le pays.",
        },
        fylke: {
          en: "This column shows the mean and median value of all municipalities in the selected municipality's county.",
          fr: "Cette colonne affiche la moyenne et la médiane de toutes les communes dans le comté de la commune sélectionnée.",
        },
      },
    },
  },
  table: {
    kommune: {
      en: "Municipality",
      fr: "Commune",
    },
    risk: {
      en: "Risk",
      fr: "Risque",
    },
  },
  details: {
    selectSomething: {
      en: "Select a municipality.",
      fr: "Sélectionnez une commune.",
    },
    tooltip: {
      norge: {
        en: "The number represents the selected municipality's placement among all municipalities in the nation. Ranking number 1 means the selected municipality is the worst, with no other municipalities having a worse value.",
        fr: "Le nombre représente la position de la commune sélectionnée parmi toutes les communes dans le pays. Un classement de 1 signifie que la commune sélectionnée est la plus mauvaise, sans autres communes ayant une valeur plus mauvaise.",
      },
      fylke: {
        en: "The number represents the selected municipality's placement among all municipalities in its own county. Ranking number 1 means the selected municipality is the worst in its county, with no other municipalities in the county having a worse value.",
        fr: "Le nombre représente la position de la commune sélectionnée parmi toutes les communes dans le comté de la commune sélectionnée. Un classement de 1 signifie que la commune sélectionnée est la plus mauvaise dans son comté, sans autres communes dans le comté ayant une valeur plus mauvaise.",
      },
    }
  },
};

export default text;