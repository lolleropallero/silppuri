// Real catalogue selections, normalized and checked by verify-summary-reachability.cjs.
const packagePresets=[]/*PRESET_DATA*/.map(preset=>({...preset,model:{
  name:preset.name,
  includeLater:false,
  yleCutPercent:20,
  taxIncreasesPP:{income:3,corporate:3},
  dividendMode:'abolish',
  fundingChoices:{yle:'keep-tax',farm:'save'},
  ...preset.model
}}));
