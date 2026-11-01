"""Compile the audited evidence and explicit scenario assumptions separately."""
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def build_growth(catalogue, research_sources):
    def read(name):
        return json.loads((ROOT / 'data' / name).read_text(encoding='utf8'))

    growth = read('growth-model.json')
    growth['baseline'] = read('growth-baselines.json')
    growth['actions'] = {}
    known_ids = {d['id'] for d in catalogue}
    for profile in growth.pop('profiles'):
        for action_id in profile['actions']:
            assert action_id in known_ids, ('Unknown growth action', action_id)
            assert action_id not in growth['actions'], ('Duplicate growth action', action_id)
            growth['actions'][action_id] = {
                'profile': profile['id'], 'effects': profile['effects'],
                **{key: profile[key] for key in ['publicDemand', 'researchShare'] if key in profile},
            }
    for overrides in [growth.pop('overrides'), read('growth-evidence-estimates.json')]:
        for action_id, override in overrides.items():
            assert action_id in known_ids, ('Unknown growth override', action_id)
            previous = growth['actions'].get(action_id, {'effects': {}})
            growth['actions'][action_id] = {
                **previous, **override,
                'effects': {**previous['effects'], **override.get('effects', {})},
            }
    sources = set(growth['sources']) | set(research_sources)
    assert set(growth['education']['sourceIds']) <= sources
    for entry in growth['actions'].values():
        for metric, effect in entry['effects'].items():
            assert metric in growth['metrics'], ('Unknown growth metric', metric)
            assert set(effect.get('sourceIds', [])) <= sources
            for estimate in effect.get('estimates', []):
                assert estimate['metric'] == metric
                assert estimate['scope'] == 'national-structural'
                assert estimate['unit'] in ['persons', 'fte']
                assert estimate['year'] is None, 'Source evidence has no published timing'
                assert all(math.isfinite(estimate[k]) for k in ['low', 'value', 'high'])
                assert estimate['low'] <= estimate['value'] <= estimate['high']
                assert set(estimate['sourceIds']) <= sources
                assert estimate['limit'] and estimate['page']
    for parameter in growth['parameters'].values():
        assert math.isfinite(parameter['value']) and parameter['basis']
        assert parameter.get('low', parameter['value']) <= parameter['value'] <= parameter.get('high', parameter['value'])
        assert set(parameter.get('sourceIds', [])) <= sources
    incentive = growth['earnedIncomeIncentive']
    assert set(incentive['actions']) <= known_ids, 'Unknown earned-income action'
    share = incentive['netShare']
    assert 0 < share['low'] <= share['value'] <= share['high'] < 1
    # VM's net share must leave a labour response after the consumption-tax part.
    assert all(1 - share[k] > incentive['mpc'] * incentive['consumptionTaxRate'] for k in share)
    assert incentive['costPerPerson'] > 0 and incentive['basis'] and incentive['limit'] and incentive['page']
    assert set(incentive['sourceIds']) <= sources
    profile = growth['consumptionProfile']
    assert len(profile['quintiles']) == 5 and all(v > 0 for v in profile['quintiles']) and profile['average'] > 0
    assert profile['basis'] and set(profile['sourceIds']) <= sources
    multipliers = growth['fiscalMultipliers']
    assert multipliers['horizon'] <= growth['maxYear'] and multipliers['basis'] and multipliers['limit'] and multipliers['page']
    assert set(multipliers['sourceIds']) <= sources
    calibrated = [action_id for group in multipliers['groups'].values() for action_id in group['actions']]
    unestimated = [action_id for kind in multipliers['unestimated'].values() for action_id in kind['actions']]
    listed = calibrated + unestimated
    assert set(listed) <= known_ids, 'Unknown multiplier action'
    assert len(listed) == len(set(listed)), 'An action has one multiplier treatment'
    kinds = {d['id']: d['type'] for d in catalogue}
    for group in multipliers['groups'].values():
        # Ranges are the study's own minimum and maximum across specifications.
        for horizon in ['twoYear', 'fiveYear']:
            assert group[horizon]['low'] <= group[horizon]['value'] <= group[horizon]['high'], horizon
        assert group['label'] and group['note']
        # Fees are typed as taxes in the catalogue, so spending groups take only cuts.
        assert group['kind'] == 'tax' or all(kinds[action_id] == 'cut' for action_id in group['actions'])
    assert all(kind['label'] and kind['note'] for kind in multipliers['unestimated'].values())
    kela = multipliers['kelaPensions']['actions']
    assert set(kela) <= known_ids and not set(kela) & set(listed) and multipliers['kelaPensions']['note']
    responses = multipliers['impulseResponses']['responses']
    for group in multipliers['groups'].values():
        assert group['irf'] in responses and group['base'] in ['gross', 'funds', 'grossAndFunds']
    for response in responses.values():
        # Quarterly horizons 1-20; the fiscal variable responds on impact, so a lasting measure is solvable.
        assert len(response['gdp']) == len(response['fiscal']) == 4 * multipliers['horizon'] and response['fiscal'][0] > 0
        assert len(response['reported']) == 2 and response['label']
    for key in ['gdpMillion', 'consumptionMillion', 'investmentMillion', 'capitalMillion', 'hoursMillion', 'persons']:
        assert growth['baseline'][key] > 0, key
    return growth
