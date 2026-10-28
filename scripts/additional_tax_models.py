"""Explicit sensitivity calculations, in EUR million, not confidence intervals.

The parameters are stored beside their empirical anchors and explanations.
No extrapolation from one country's aggregate tax receipts to Finland by GDP.
"""
from itertools import product
from math import floor, ceil


def number(value):
    return f'{value:,.6f}'.rstrip('0').rstrip('.').replace(',', ' ').replace('.', ',')


def calculate(inputs):
    results = {}
    for key, p in inputs.items():
        cases = []
        if p['formula'] == 'unquantified':
            results[key]={'raw':None,'range':None,'taxRange':None,'caseCount':0}
            continue
        if p['formula'] == 'reference':
            cases = [{'tax': n, 'net': n} for n in p['referenceRange']]
        elif p['formula'] == 'realizations':
            for share, uplift, elasticity, cost in product(p['affectedShare'], p['baseUplift'], p['elasticity'], p['cost']):
                # Include the loss of EXISTING tax from deferred sales, not just
                # an arbitrary haircut on the mechanical additional tax.
                tax = p['gains'] * share * p['rate'] * ((1 + uplift)**(1-elasticity) - 1)
                expression = (f"{number(p['gains'])} × {number(share)} × {number(p['rate'])} × "
                              f"[(1 + {'1/3' if abs(uplift-1/3)<1e-10 else number(uplift)})^"
                              f"(1 − {number(elasticity)}) − 1] − {number(cost)}")
                cases.append({'tax': tax, 'net': tax-cost, 'expression': expression})
        else:
            for factors in product(*p['factors']):
                tax = p['anchor']
                for f in factors:
                    tax *= f
                for cost in p['cost']:
                    terms = ([p['anchor']] if p['anchor'] != 1 else []) + list(factors)
                    expression = ' × '.join(number(n) for n in terms) + ' − ' + number(cost)
                    cases.append({'tax': tax, 'net': tax-cost, 'expression': expression})
        values = [c['net'] for c in cases]
        step = p.get('roundTo', 5)
        results[key] = {'raw': [min(values), max(values)],
                        'range': [floor((min(values)+1e-10)/step)*step, ceil((max(values)-1e-10)/step)*step],
                        'taxRange': [min(c['tax'] for c in cases), max(c['tax'] for c in cases)],
                        'caseCount': len(cases)}
        if p['formula'] != 'reference':
            results[key]['bounds'] = [
                {'label': label, 'expression': case['expression'], 'value': case['net']}
                for label, case in [('Alaraja', min(cases, key=lambda c: c['net'])),
                                    ('Yläraja', max(cases, key=lambda c: c['net']))]]
            results[key]['roundTo'] = step
    return results


def apply(actions, results):
    for d in actions:
        r = results[d['id']]
        if r['range'] is None:
            continue
        low, high = r['range']
        e = d['estimate']
        e.update(amount=low, range=r['range'], display=f'{low}–{high} milj. €')
        if r.get('bounds'):
            e.update(bounds=r['bounds'], roundTo=r['roundTo'])
        e['footnote'] = e.get('condition', 'Oma skenaario') + f'; piirakkaan {low} milj. €.'


def extend_incidence(model, actions, results, references):
    for d in actions:
        p = d['incidence']
        keys = d['research']['sources']
        model['sources'].update({key: references[key] for key in keys})
        if p.get('outsideResidents') or results[d['id']]['range'] is None:
            model['actions'][d['id']] = dict(kind='separate', group='foreign' if p.get('outsideResidents') else 'unpriced',
                method=p['method'], sources=keys)
            continue
        amounts = results[d['id']]['taxRange']
        cases = [{'million': a, 'shares': shares} for a, shares in product(amounts, p['allocations'])]
        totals = [c['million']*sum(c['shares'].values()) for c in cases]
        model['actions'][d['id']] = dict(kind='scenarios', channel=p['channel'], scenarios=cases,
            profiles=sorted({key for shares in p['allocations'] for key in shares}),
            method=p['method'], calculation=[
                'Laskelman verotulon muutos ennen hallintokuluja toimii rasituksen suuruusluokan sijaismittarina. Siinä on jo veropohjan ja joidenkin muiden verojen muutoksia: se ei ole kotitalouksien havaittu verolasku. Alla olevat osuudet ovat tämän nettomuutoksen vaihtoehtoisia kohdentumisia, eivät erillinen lisävähennys piirakan summasta.',
                p['assumptions'],
                'Omistusjakaumat ovat Tilastokeskuksen tulokymmenyksittäin ryhmitellystä vuoden 2023 varallisuustilastosta; palkka-, pääomatulo- ja kulutusjakaumat mallin lähdetaulukoista. Ne ovat sijaisjakaumia, eivät tämän lain verovelvollisten rekisterisimulaatio.',
                'Ryhmäosuus kerrotaan verorasituksella, jaetaan ryhmän vuoden 2024 kulutusyksiköillä ja suhteutetaan nettovuosituloihin. Täysi palkki on kokonaisten vaihtoehtojen keskiarvo, viivoitus niiden vaihteluväli. Vaihtoehdoille ei ole annettu todennäköisyyksiä.'
            ], note=p.get('note', 'Suhde vuosituloihin ei ennusta vastaavaa kulutuksen vähenemistä. Veroa voidaan maksaa myös varallisuudesta.'),
            sources=keys, partial=True, householdMillion=[min(totals), max(totals)])
