const text = {
  common: {
    loading: {
      en: "Loading...",
      no: "Laster...",
    },
    totalRisk: {
      en: "Total Risk",
      no: "Total Risk",
    },
  },
  header: {
    layout: {
      l1: {
        en: "Nationwide overview",
        no: "Landsdekkende oversikt",
      },
      l2: {
        en: "Municipality analysis",
        no: "Kommuneanalyse",
      },
      label: {
        en: "Analysis mode",
        no: "Analysemodus",
      }
    },
    year: {
      label: {
        en: "Selected time",
        no: "Valgt tidspunkt",
      },
    },
  },
  panels: {
    tree: {
      en: "Risk Customization Tree",
      no: "Risikoens oppbygning",
      tooltip: {
        en: "This tree shows how the overall risk is built up from the different determinants and their indicators. By default all indicators are included in the overall risk, but you can exclude specific indicators by clicking on them in the tree. The determinants and overall risk are calculated with only the included indicators. Each determinant is calculated as a sum of its indicators, normalized from 0 to 100. The overall risk is the sum of the determinants, with no normalization. Note that some determinants and indicators might be inverted, to make sure that a higher value always means a higher risk.",
        no: "Dette treet viser hvordan den overordnede risikoen er bygget opp av de forskjellige determinantene og deres indikatorer. Som standard er alle indikatorer inkludert i den overordnede risikoen, men du kan ekskludere spesifikke indikatorer ved å klikke på dem i treet. Determinantene og den overordnede risikoen beregnes med kun de inkluderte indikatorene. Hver determinant beregnes som en sum av sine indikatorer, normalisert fra 0 til 100. Den overordnede risikoen er summen av determinantene, uten normalisering. Merk at noen determinanter og indikatorer kan være invertert, for å sikre at en høyere verdi alltid betyr en høyere risiko.",
      },
    },
    map: {
      en: "Map View",
      no: "Kartvindu",
      tooltip: {
        en: "This map shows the selected metric for all municipalities in Norway. The selected municipality is highlighted with a black outline. You can zoom and pan the map to explore different areas, and click on municipalities to select them. The colors represent the relative values of the currently selected metric, where stronger colors indicate higher values.",
        no: "Dette kartet viser den valgte metrikken for alle kommuner i Norge. Den valgte kommunen er markert med en svart kantlinje. Du kan zoome og flytte kartet for å utforske ulike områder, og klikke på kommuner for å velge dem. Fargene representerer de relative verdiene til den valgte metrikken, der sterkere farger indikerer høyere verdier.",
      },
    },
    chart: {
      en: "Municipality Distribution Chart",
      no: "Kommune-fordeling",
      tooltip: {
        en: "This chart shows the distribution of the chosen metric accross all municipalities in the nation and in the selected municipality's county. The possible metrics are the overall risk, the determinants, and the indicators. The mean and median values for the nation and county can be toggled by clicking their values below the chart. By hovering over the chart, you can see the number of municipalities that have a value within the hovered bin. Above the chart, you can change the metric that is shown in the chart.",
        no: "Dette diagrammet viser fordelingen av den valgte metrikken blant alle kommuner i landet og innenfor fylket til den valgte kommunen. Metrikkene som kan vises inkluderer samlet risiko, determinantene og indikatorene. Gjennomsnitts- og medianverdier for både landet og fylket kan vises eller skjules ved å klikke på verdiene under diagrammet. Ved å holde musepekeren over diagrammet kan du se hvor mange kommuner som ligger innenfor det aktuelle intervallet. Over diagrammet kan du velge hvilken metrikk som skal vises.",
      },
    },
    table: {
      en: "Data Table",
      no: "Datatabell",
      tooltip: {
        en: "This table displays the selected municipality together with all municipalities in the country. Click a column header to sort and rank the municipalities by that value, and click again to reverse the sorting direction. All determinants and indicators are included in the table only in the 'Municipality analysis' analysis mode. Click a municipality row to select it throughout the dashboard. The colored square at the beginning of each row matches the municipality's color on the map for the currently selected metric.",
        no: "Denne tabellen viser den valgte kommunen sammen med alle kommuner i landet. Klikk på en kolonneoverskrift for å sortere og rangere kommunene etter den verdien, og klikk igjen for å bytte sorteringsretning. Alle determinanter og indikatorer er inkludert i tabellen kun i analysemodusen 'Kommuneanalyse'. Klikk på en kommunerad for å velge kommunen i hele dashbordet. Den fargede ruten i starten av hver rad tilsvarer kommunens farge på kartet for den valgte metrikken.",
      },
    },
    details: {
      en: "Municipality Rankings",
      no: "Rangering av kommunen",
      tooltip: {
        en: "This panel shows the selected municipality's rankings for all determinants and indicators. The rankings are displayed both nationally and within the municipality's county. A ranking of 1 means the municipality has the highest climate risk for that metric within the selected group, so lower ranking numbers indicate higher relative risk. The colored square beside each metric matches the municipality's color on the map when that metric is selected. Clicking a determinant or indicator selects it throughout the dashboard. The determinants are sorted by their contribution to the overall risk, while the indicators within each determinant are sorted by their contribution to that determinant.",
        no: "Dette panelet viser rangeringene til den valgte kommunen for alle determinanter og indikatorer. Rangeringene vises både nasjonalt og innenfor kommunens fylke. En rangering på 1 betyr at kommunen har høyest klimarisiko for den metrikken innenfor den valgte gruppen, så lave rangeringsverdier indikerer høyere relativ risiko. Den fargede ruten ved siden av hver metrikk tilsvarer kommunens farge på kartet når den metrikken er valgt. Ved å klikke på en determinant eller indikator velges den i hele dashbordet. Determinantene er sortert etter hvor mye de bidrar til den overordnede risikoen, mens indikatorene innenfor hver determinant er sortert etter hvor mye de bidrar til determinantens verdi.",
      },
    },
  },
  chart: {
    tooltip: {
      value: {
        en: "Value",
        no: "Verdi",
      },
      norway: {
        en: "Norway",
        no: "Norge",
      },
      county: {
        en: "County",
        no: "Fylke",
      },
      kommuner: {
        en: "municipalities",
        no: "kommuner",
      },
      interval: {
        en: "Interval",
        no: "Intervall",
      },
    },
    stats: {
      mean: {
        en: "Mean",
        no: "Gjennomsnitt",
      },
      median: {
        en: "Median",
        no: "Median",
      },
      tooltip: {
        norge: {
          en: "This column shows the mean and median value of all municipalities in the nation.",
          no: "Denne kolonnen viser gjennomsnitt og median for alle kommunene i landet.",
        },
        fylke: {
          en: "This column shows the mean and median value of all municipalities in the selected municipality's county.",
          no: "Denne kolonnen viser gjennomsnitt og median for alle kommunene i den valgte kommuens fylke.",
        },
      },
    },
  },
  table: {
    kommune: {
      en: "Municipality",
      no: "Kommune",
    },
    risk: {
      en: "Risk",
      no: "Risk",
    },
  },
  details: {
    selectSomething: {
      en: "Select a municipality.",
      no: "Velg en kommune.",
    },
    tooltip: {
      norge: {
        en: "The number represents the selected municipality's placement among all municipalities in the nation. Ranking number 1 means the selected municipality is the worst, with no other municipalities having a worse value.",
        no: "Nummeret representerer den valgte kommunens plassering blant alle kommunene i landet. Å være rangert nummer 1 betyr at den valgte kommunen er verst, og at ingen andre kommuner har en verre verdi.",
      },
      fylke: {
        en: "The number represents the selected municipality's placement among all municipalities in its own county. Ranking number 1 means the selected municipality is the worst in its county, with no other municipalities in the county having a worse value.",
        no: "Nummeret representerer den valgte kommunens plassering blant alle kommunene i fylket sitt. Å være rangert nummer 1 betyr at den valgte kommunen er verst i fylket, og at ingen andre kommuner i fylket har en verre verdi.",
      },
    }
  },
};

export default text;