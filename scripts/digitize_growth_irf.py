"""Digitise the median impulse responses of the Finnish fiscal multiplier study (2026).

Reads the BVAR full-sample VAR(4) figures 9, 10 and 12 (pages 82, 83 and 85) from the
study PDF and prints quarterly median responses of real GDP and of the shocked fiscal
variable, horizons 1-20, in the figures' own units. The solid median line is tracked
between the dashed 68 % bands; values are read against each panel's zero line and its
symmetric axis label. Paste the output into data/growth-model.json
(fiscalMultipliers.impulseResponses) after checking the overlays it saves.

Usage: python scripts/digitize_growth_irf.py tmp/growth-evidence-fiscal-2026.pdf out-dir
"""
import io
import json
import sys

from PIL import Image, ImageDraw
from pypdf import PdfReader

DARK = 110
# page, image index, instrument, GDP panel side, GDP axis label, fiscal axis label
PANELS = [
    (82, 0, 'total', 'right', 0.08, 0.2),
    (83, 0, 'intermediate', 'right', 0.12, 0.09),
    (83, 1, 'wages', 'right', 0.04, 0.07),
    (83, 2, 'investment', 'right', 0.05, 0.10),
    (83, 3, 'pensions', 'right', 0.06, 0.07),
    (85, 0, 'consumptionTaxes', 'left', 0.04, 0.09),
    (85, 1, 'householdTaxes', 'left', 0.03, 0.14),
    (85, 2, 'corporateTax', 'left', 0.05, 0.14),
]


def panel_curve(im, x0, x1, draw):
    """Median response at horizons 1..20 as a share of the panel's half-axis."""
    w, h = im.size
    px = im.load()
    ys = [y for y in range(h) if px[x0, y] < DARK]
    top, bottom = min(ys), max(ys)
    grids = []
    for x in range(x0 + 3, x1):
        col = [px[x, y] for y in range(top + 5, bottom - 5)]
        if sum(1 for v in col if 150 <= v <= 235) > 0.6 * len(col):
            if grids and x - grids[-1][-1] <= 2:
                grids[-1].append(x)
            else:
                grids.append([x])
    grids = [sum(g) / len(g) for g in grids][:5]
    assert len(grids) == 5, grids
    step = (grids[4] - grids[0]) / 16
    hx = lambda q: grids[0] + (q - 4) * step

    def longest(y):
        best = cur = 0
        for x in range(x0 + 2, int(grids[4])):
            cur = cur + 1 if px[x, y] < 175 else 0
            best = max(best, cur)
        return best
    zero = max(range(top + 2, bottom - 2), key=longest)
    assert longest(zero) > 0.7 * (grids[4] - x0)
    # Every panel has a symmetric axis, so the plot top mirrors the bottom; titles may reach lower.
    top = max(top, 2 * zero - bottom - 2)
    zrows = {y for y in range(zero - 1, zero + 2) if sum(1 for x in range(x0 + 2, int(grids[4])) if px[x, y] < DARK) > 0.5 * (grids[4] - x0)}
    start, end = int(round(hx(1))), int(round(hx(20)))

    def runs(x):
        out, cur = [], []
        for y in range(top + 1, bottom - 1):
            if px[x, y] < DARK and y not in zrows:
                cur.append(y)
            elif cur:
                out.append(cur)
                cur = []
        if cur:
            out.append(cur)
        return [(r[0] + r[-1]) / 2 for r in out]

    # The solid median lies between the two dashed bands where all three are visible.
    anchor = next(x for x in range(end - 2, start, -1) if len(runs(x)) == 3)
    track = {anchor: runs(anchor)[1]}
    for direction in (-1, 1):
        prev, x = track[anchor], anchor + direction
        while start - 1 <= x <= end + 1:
            candidates = runs(x)
            if candidates:
                best = min(candidates, key=lambda c: abs(c - prev))
                if abs(best - prev) <= 40:
                    prev = best
            track[x] = prev
            x += direction
    values = []
    for q in range(1, 21):
        xq = hx(q)
        xa = int(xq)
        ya = track[xa]
        y = ya + (track.get(xa + 1, ya) - ya) * (xq - xa)
        values.append((zero - y) / (bottom - zero))
        draw.ellipse([xq - 2, y - 2, xq + 2, y + 2], outline='red')
    return values


def main(pdf_path, out_dir):
    reader = PdfReader(pdf_path)
    result = {}
    for page, index, name, gdp_side, gdp_label, fiscal_label in PANELS:
        data = reader.pages[page].images[index].data
        rgb = Image.open(io.BytesIO(data)).convert('RGB')
        im = rgb.convert('L')
        draw = ImageDraw.Draw(rgb)
        w, h = im.size
        px = im.load()
        axes = [x for x in range(w) if sum(1 for y in range(h) if px[x, y] < DARK) > 0.6 * h]
        axes = [x for i, x in enumerate(axes) if i == 0 or x - axes[i - 1] > 3]
        assert len(axes) == 2, (name, axes)
        left = panel_curve(im, axes[0], axes[1] - 30, draw)
        right = panel_curve(im, axes[1], w, draw)
        gdp, fiscal = (left, right) if gdp_side == 'left' else (right, left)
        result[name] = {'gdp': [round(v * gdp_label, 5) for v in gdp], 'fiscal': [round(v * fiscal_label, 5) for v in fiscal]}
        rgb.save(f'{out_dir}/irf-check-{name}.png')
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
