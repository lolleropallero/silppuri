"""Explicit sensitivity calculations, in EUR million, not confidence intervals.

The parameters are stored beside their empirical anchors and explanations.
No extrapolation from one country's aggregate tax receipts to Finland by GDP.
"""
from itertools import product
from math import floor, ceil


def calculate(inputs):
    results = {}
    for key, p in inputs.items():
        cases = []
        if p['formula'] == 'reference':
            cases = [{'tax': n, 'net': n} for n in p['referenceRange']]
        elif p['formula'] == 'realizations':
            for share, uplift, elasticity, cost in product(p['affectedShare'], p['baseUplift'], p['elasticity'], p['cost']):
                # Include the loss of EXISTING tax from deferred sales, not just
                # an arbitrary haircut on the mechanical additional tax.
                tax = p['gains'] * share * p['rate'] * ((1 + uplift)**(1-elasticity) - 1)
                cases.append({'tax': tax, 'net': tax-cost})
        else:
            for factors in product(*p['factors']):
                tax = p['anchor']
                for f in factors:
                    tax *= f
                for cost in p['cost']:
                    cases.append({'tax': tax, 'net': tax-cost})
        values = [c['net'] for c in cases]
        step = p.get('roundTo', 5)
        results[key] = {'raw': [min(values), max(values)],
                        'range': [floor((min(values)+1e-10)/step)*step, ceil((max(values)-1e-10)/step)*step],
                        'taxRange': [min(c['tax'] for c in cases), max(c['tax'] for c in cases)],
                        'caseCount': len(cases)}
    return results


def apply(actions, results):
    for d in actions:
        r = results[d['id']]
        low, high = r['range']
        e = d['estimate']
        e.update(amount=low, range=r['range'], display=f'{low}–{high} milj. €')
        e['footnote'] = e.get('condition', 'Oma skenaario') + f'; piirakkaan {low} milj. €.'


def extend_incidence(model, actions, results, references):
    for d in actions:
        p = d['incidence']
        keys = d['research']['sources']
        model['sources'].update({key: references[key] for key in keys})
        if p.get('outsideResidents'):
            model['actions'][d['id']] = dict(kind='separate', group='foreign',
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
