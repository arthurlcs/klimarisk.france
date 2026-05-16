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
      en: "Switch Layout",
      no: "Bytt Oppsett",
      l1: {
        en: "Spatial overview",
        no: "",
      },
      l2: {
        en: "Municipality analysis",
        no: "",
      },
    },
  },
  panels: {
    tree: {
      en: "Risk Customization Tree",
      no: "Risikoens oppbygning",
    },
    map: {
      en: "Map View",
      no: "Kartvindu",
    },
    chart: {
      en: "Municipality Distribution Chart",
      no: "Kommune-fordeling",
    },
    table: {
      en: "Data Table",
      no: "Datatabell",
    },
    details: {
      en: "Municipality Rankings",
      no: "Rangering av kommunen",
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