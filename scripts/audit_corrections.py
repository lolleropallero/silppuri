"""Reviewed source corrections, applied by every catalogue regeneration path.

Production corrections, source references and limits are maintained in
data/audit-corrections.json independently of local review reports.
"""
import copy
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def corrections():
    return json.loads((ROOT / 'data/audit-corrections.json').read_text(encoding='utf8'))


def apply_research(id, review):
    patch = corrections()['actions'].get(id, {})
    review.update(copy.deepcopy(patch.get('research', {})))
    review['sources'] = list(dict.fromkeys([s for s in review.get('sources', [])
        if s not in patch.get('removeSources', [])] + patch.get('addSources', [])))
    return review


def apply_actions(actions):
    patches = corrections()['actions']
    for action in actions:
        patch = patches.get(action['id'], {})
        for key,value in patch.items():
            if key in ['research','addSources','removeSources']: continue
            if key in ['estimate','incidence']:
                action.setdefault(key,{}).update(copy.deepcopy(value))
            else: action[key]=copy.deepcopy(value)
        if 'research' in action:
            apply_research(action['id'], action['research'])


def apply_inputs(inputs):
    for key, value in corrections().get('additionalInputs', {}).items():
        inputs[key] = copy.deepcopy(value)


def apply_sources(sources, summaries):
    patch = corrections()
    for key, value in patch['sources'].items():
        sources.setdefault(key, {}).update(value)
    for key, value in patch['summaries'].items():
        summaries[key] = copy.deepcopy(value)
