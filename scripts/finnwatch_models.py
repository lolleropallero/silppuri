"""Conditional fiscal scenarios. Monetary quantities are million EUR.

These are reproducible sensitivity calculations, not estimated confidence
intervals. Observed anchors and chosen assumptions live in finnwatch-estimates.
The wrapper model compares taxes in the SAME year under two tax treatments;
it never counts the whole accrued tax liability as recurring revenue.
"""
from itertools import product
from math import floor, ceil


def outward(values, step=5):
    return [floor(min(values) / step) * step, ceil(max(values) / step) * step]


def wrapper_path(p, annual_return, withdrawal, taxable_share, annual_tax):
    assets = p['assetsMillion']
    basis = assets * (1 - p['initialGainShare'])
    rows = []
    for year in range(p['startYear'], p['lastYear'] + 1):
        gain = assets * annual_return
        # Tax-paid gains increase basis: they must never be taxed again on exit.
        realised = gain * taxable_share if annual_tax else 0
        current_tax = realised * p['capitalTaxRate']
        assets += gain - current_tax
        basis += realised - current_tax
        withdrawn_gain = max(0, assets - basis) * withdrawal
        withdrawal_tax = withdrawn_gain * p['capitalTaxRate']
        assets *= 1 - withdrawal
        basis *= 1 - withdrawal
        rows.append({'year': year, 'tax': current_tax + withdrawal_tax,
                     'currentTax': current_tax, 'withdrawalTax': withdrawal_tax,
                     'assets': assets, 'basis': basis})
    return rows


def calculate(inputs):
    interest = inputs['interest']
    base = interest['referenceStaticLossMillion'] / interest['referenceTaxRate']
    interest_values = [base * scale * interest['corporateTaxRate'] *
                       (1 - interest['carryforwardOffset']) * (1 - erosion)
                       for scale, erosion in product(interest['reverseBaseMultipliers'],
                                                     interest['additionalErosion'])]
    succession = inputs['succession']
    succession_values = [succession['wholeReliefTaxExpenditureMillion'] * share *
                         (1 - erosion) - cost
                         for share, erosion, cost in product(succession['affectedReliefShare'],
                                                             succession['behaviouralErosion'],
                                                             succession['annualPublicCostMillion'])]
    p = {**inputs['wrappers'],'lastYear':2200}
    cases = []
    for r, w, q, retained, cost in product(p['assumedReturn'], p['annualWithdrawal'],
                                          p['annuallyTaxableReturnShare'],
                                          p['retainedReformExposure'], p['annualPublicCostMillion']):
        baseline = wrapper_path(p, r, w, q, False)
        reform = wrapper_path(p, r, w, q, True)
        net = [(b['tax'] - a['tax']) * retained - cost for a, b in zip(baseline, reform)]
        cases.append({'return': r, 'withdrawal': w, 'taxableShare': q,
                      'retained': retained, 'publicCost': cost, 'net': net})
    series = {}
    for i, year in enumerate(range(p['startYear'], p['lastYear'] + 1)):
        values = [c['net'][i] for c in cases]
        series[str(year)] = {'raw': [min(values), max(values)], 'range': outward(values, 10)}
    pv=[sum(v/(1.03**(i+1)) for i,v in enumerate(c['net'])) for c in cases]
    return {
        'interest': {'range': outward(interest_values), 'raw': [min(interest_values), max(interest_values)],
                     'newInterestBase': [base * s for s in interest['reverseBaseMultipliers']]},
        'succession': {'range': outward(succession_values), 'raw': [min(succession_values), max(succession_values)]},
        'wrappers': {'range': series[str(p['displayYear'])]['range'], 'byYear': series,
                     'caseCount': len(cases), 'cashFlowOnly': True,
                     'presentValue3pct':[min(pv),max(pv)],
                     'annualEquivalent3pct':[min(pv)*.03,max(pv)*.03]}
    }


def apply_estimates(proposals, results):
    for d in proposals:
        e = d['estimate']
        key = e.get('model')
        if not key:
            continue
        result = results[key]
        low, high = result['range']
        e.update(amount=low, range=[low, high], display=f'{low}–{high} milj. €',
                 footnote=f'Oma skenaario; piirakkaan {low} milj. €.')
        if key == 'wrappers':
            # The card is an explicit 2031 cash-flow scenario, not a promise of
            # a permanent annual yield. Later mode must not pick its early peak.
            e.update(amount=None,display='Pysyvä netto avoin',caption='Veron aikaistuminen',footnote=f'2031 kassavirta {low}–{high} milj. €; ei pysyvä vuosituotto.')
            d['unquantifiedNet']=True
            e['money']=f'Vuoden 2031 kassavirta on omassa mallissa {low}–{high} milj. €. Veron aikaistuminen vähentää myöhempiä nostoveroja, joten summaa ei lasketa pysyväksi sopeutukseksi eikä piirakkaan.'
            lo,hi=result['annualEquivalent3pct']
            e['calculation']=[x for x in e['calculation'] if 'piirakkaan' not in x.lower()]+[f'Malli jatketaan vuoteen 2200 ja tulevat erot diskontataan 3 prosentilla vuoden 2027 loppuun. Nykyarvon ikuinen vuosivastine on noin {lo:.1f}–{hi:.1f} milj. €. Vuosittaiset hallintokulut 2–5 milj. € jatkuvat tässä koko laskentajakson, vaikka nykyinen sijoituskanta pienenee. Tämä on rahoituksellinen vertailu, ei jonkin vuoden verotuotto. Uusia sijoituksia ei ole mallinnettu; todellinen pysyvä tuotto jää siksi avoimeksi.']
            e['sensitivity'] = [{'label': str(year), 'range': result['byYear'][str(year)]['range']}
                                for year in (2031, 2035, 2050)]
