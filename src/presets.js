// Real catalogue selections, normalized and checked by verify-summary-reachability.cjs.
const packagePresets=[
  {
    "id": "rich",
    "name": "Rikkaat talkoisiin",
    "model": {
      "selectedIds": [
        "income",
        "income-index",
        "dividends",
        "tax-capital-low",
        "tax-capital-high",
        "tax-land-values",
        "tax-land-min",
        "tax-transfer-shares",
        "tax-inheritance",
        "fw-succession-abolish",
        "sorsa-million-inheritance",
        "fw-wealth-minimum",
        "fw-dividend-withholding",
        "fw-treaty-dividends",
        "tax-forest",
        "fw-property-funds",
        "fw-deemed-cost",
        "corporate",
        "tax-entrepreneur-remove",
        "cut-7-52",
        "cut-1-55",
        "cut-1-58"
      ],
      "name": "Rikkaat talkoisiin",
      "includeLater": false,
      "yleCutPercent": 20,
      "taxIncreasesPP": {
        "income": 3,
        "corporate": 3
      },
      "unitSteps": {
        "income": 3,
        "tax-capital-low": 3,
        "tax-capital-high": 3,
        "corporate": 3,
        "tax-transfer-shares": 3,
        "tax-inheritance": 3,
        "tax-land-min": 3
      },
      "cutPercents": {
        "cut-7-52": 15
      },
      "dividendMode": "abolish",
      "fundingChoices": {
        "yle": "keep-tax",
        "farm": "save"
      }
    }
  },
  {
    "id": "poor",
    "name": "Kannustinpaketti",
    "model": {
      "selectedIds": [
        "health",
        "benefits",
        "cut-3-51",
        "vat",
        "cut-3-8",
        "cut-3-10"
      ],
      "name": "Kannustinpaketti",
      "includeLater": false,
      "yleCutPercent": 20,
      "taxIncreasesPP": {
        "income": 3,
        "corporate": 3
      },
      "unitSteps": {},
      "cutPercents": {},
      "dividendMode": "abolish",
      "fundingChoices": {
        "yle": "keep-tax",
        "farm": "save"
      }
    }
  },
  {
    "id": "all",
    "name": "Kaikille paha mieli",
    "model": {
      "selectedIds": [
        "health",
        "benefits",
        "income",
        "corporate",
        "dividends",
        "vat",
        "cut-1-25",
        "tax-tobacco"
      ],
      "name": "Kaikille paha mieli",
      "includeLater": false,
      "yleCutPercent": 20,
      "taxIncreasesPP": {
        "income": 2,
        "corporate": 3
      },
      "unitSteps": {
        "income": 3,
        "corporate": 3
      },
      "cutPercents": {
        "cut-1-25": 100
      },
      "dividendMode": "abolish",
      "fundingChoices": {
        "yle": "keep-tax",
        "farm": "save"
      }
    }
  },
  {
    "id": "companies",
    "name": "Yritykset silppuriin",
    "model": {
      "selectedIds": [
        "corporate",
        "cut-1-6",
        "cut-1-69",
        "cut-3-68",
        "cut-3-28",
        "tax-entrepreneur-remove",
        "tax-electric2",
        "tax-van",
        "tax-heat",
        "vm-machine-fuel",
        "sorsa-bank",
        "fw-corporate-gaps",
        "cut-5-64",
        "cut-1-30",
        "cut-1-75",
        "cut-3-27",
        "cut-1-16",
        "dividends",
        "tax-capital-low",
        "tax-capital-high",
        "tax-land-values",
        "tax-land-min",
        "tax-transfer-shares",
        "tax-inheritance",
        "fw-succession-abolish",
        "sorsa-million-inheritance",
        "fw-wealth-minimum",
        "fw-dividend-withholding",
        "fw-treaty-dividends",
        "tax-forest",
        "fw-property-funds",
        "fw-deemed-cost",
        "income-index",
        "income",
        "tax-transfer-land",
        "tax-donation"
      ],
      "name": "Yritykset silppuriin",
      "includeLater": false,
      "yleCutPercent": 20,
      "taxIncreasesPP": {
        "income": 2,
        "corporate": 3
      },
      "unitSteps": {
        "income": 3,
        "tax-capital-low": 3,
        "tax-capital-high": 3,
        "corporate": 3,
        "tax-transfer-land": 3,
        "tax-transfer-shares": 3,
        "tax-inheritance": 3,
        "tax-electric2": 3,
        "tax-land-min": 3
      },
      "cutPercents": {
        "cut-1-69": 100
      },
      "dividendMode": "abolish",
      "fundingChoices": {
        "yle": "keep-tax",
        "farm": "save"
      }
    }
  },
  {
    "id": "consumption",
    "name": "Elintaso silppuriin",
    "model": {
      "selectedIds": [
        "vat",
        "tax-vat-standard",
        "tax-vehicle",
        "tax-tickets",
        "tax-car-all",
        "tax-insurance",
        "tax-electric1",
        "tax-fuel",
        "vm-alcohol",
        "tax-excise-index",
        "tax-tobacco",
        "tax-softdrink",
        "income",
        "cut-3-51"
      ],
      "name": "Elintaso silppuriin",
      "includeLater": false,
      "yleCutPercent": 20,
      "taxIncreasesPP": {
        "income": 3,
        "corporate": 3
      },
      "unitSteps": {
        "income": 3,
        "tax-vat-standard": 3,
        "tax-insurance": 3,
        "tax-softdrink": 15,
        "tax-vehicle": 3,
        "tax-fuel": 3,
        "tax-electric1": 3,
        "tax-car-all": 3
      },
      "cutPercents": {},
      "dividendMode": "abolish",
      "fundingChoices": {
        "yle": "keep-tax",
        "farm": "save"
      }
    }
  }
];
