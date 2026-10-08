"""Draws the README model charts (values traced from the Roboflow training report).

Usage: python docs/model/charts.py docs/model
"""
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

OUT = Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)

PINK, PEACH, ORCHID, PLUM = "#FF8DA1", "#FFC2BA", "#FF9CE9", "#AD56C4"
INK, MUTED, GRID = "#2b2230", "#7a6f80", "#efe8f1"

plt.rcParams.update({
    "font.family": "DejaVu Sans",
    "font.size": 10,
    "axes.edgecolor": GRID,
    "axes.labelcolor": MUTED,
    "axes.titlecolor": INK,
    "axes.titleweight": "bold",
    "axes.titlesize": 12,
    "axes.titlelocation": "left",
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "axes.grid": True,
    "grid.color": GRID,
    "grid.linewidth": 0.8,
    "axes.spines.top": False,
    "axes.spines.right": False,
    "legend.frameon": False,
    "svg.fonttype": "path",
})


def curve(points, x):
    xs, ys = zip(*sorted(points.items()))
    y = np.interp(x, xs, ys)
    # Light smoothing so the traced points read as a curve, not a polyline.
    kernel = np.ones(3) / 3
    return np.convolve(np.pad(y, 1, mode="edge"), kernel, mode="valid")


def save(fig, name):
    fig.savefig(OUT / name, format="svg", bbox_inches="tight", facecolor="white")
    plt.close(fig)


# ── Confidence threshold vs F1 / precision / recall ──
x = np.linspace(0, 100, 401)
precision = curve({0: .24, 1: .24, 2: .32, 4: .40, 6: .47, 8: .52, 10: .55, 13: .59, 16: .61, 20: .65,
                   24: .69, 27: .737, 30: .75, 35: .77, 40: .79, 45: .81, 50: .82, 55: .83, 60: .84,
                   65: .85, 70: .86, 75: .87, 80: .89, 85: .91, 88: .93, 91: .95, 92: .89, 94: .89,
                   95: .91, 96: .86, 97: .78, 98: .40, 99: .02, 100: 0}, x)
recall = curve({0: .89, 1: .89, 5: .85, 10: .81, 15: .79, 20: .77, 25: .755, 27: .748, 30: .73,
                35: .72, 40: .70, 45: .68, 50: .67, 55: .66, 60: .65, 65: .62, 70: .59, 75: .57,
                78: .56, 80: .53, 85: .49, 88: .46, 90: .42, 92: .38, 94: .32, 96: .22, 97: .13,
                98: .03, 99: 0, 100: 0}, x)
f1 = np.where(precision + recall > 0, 2 * precision * recall / np.maximum(precision + recall, 1e-9), 0)

fig, ax = plt.subplots(figsize=(9, 4))
ax.plot(x, f1 * 100, color=PINK, lw=2.2, label="F1")
ax.plot(x, precision * 100, color=PLUM, lw=2.2, label="Precision")
ax.plot(x, recall * 100, color="#E8A13A", lw=2.2, label="Recall")
ax.axvline(27, color=MUTED, lw=1, ls="--")
ax.plot([27], [74.5], "o", color=INK, ms=5, zorder=5)
ax.annotate("Optimal: 27%\nF1 72.9% · P 73.7% · R 74.8%", xy=(27, 74), xytext=(29, 18),
            color=INK, fontsize=9,
            bbox={"boxstyle": "round,pad=0.4", "fc": "white", "ec": GRID})
ax.set(xlim=(0, 100), ylim=(0, 102), xlabel="Confidence threshold (%)", ylabel="%")
ax.set_title("Confidence threshold")
ax.legend(loc="lower left", ncols=3)
save(fig, "confidence.svg")

# ── mAP over epochs ──
epochs = np.arange(0, 83)
map50 = curve({0: 0, 2: .08, 3: .15, 4: .19, 5: .245, 6: .28, 7: .315, 8: .32, 9: .345, 10: .375,
               11: .38, 12: .41, 13: .43, 14: .43, 15: .445, 16: .455, 17: .47, 18: .48, 20: .48,
               21: .525, 22: .545, 23: .55, 24: .535, 25: .55, 26: .555, 27: .575, 28: .575, 29: .595,
               30: .605, 32: .62, 33: .62, 34: .635, 35: .63, 36: .64, 38: .645, 40: .655, 42: .67,
               43: .665, 44: .68, 46: .685, 48: .695, 49: .69, 50: .68, 52: .69, 53: .685, 54: .705,
               55: .69, 56: .695, 58: .715, 59: .705, 62: .715, 65: .715, 66: .72, 68: .72, 69: .73,
               71: .715, 72: .72, 74: .725, 76: .73, 78: .74, 80: .745, 82: .74}, epochs)
map5095 = curve({0: 0, 2: .035, 3: .09, 4: .12, 5: .16, 6: .18, 7: .22, 8: .23, 10: .27, 11: .28,
                 12: .30, 13: .32, 14: .325, 15: .33, 16: .345, 17: .365, 18: .375, 20: .38, 21: .41,
                 22: .425, 23: .435, 24: .43, 25: .44, 26: .44, 27: .455, 28: .465, 29: .475, 30: .49,
                 32: .50, 33: .50, 34: .515, 35: .51, 36: .52, 38: .525, 40: .535, 42: .55, 43: .545,
                 44: .555, 46: .565, 48: .575, 50: .565, 52: .575, 53: .57, 54: .58, 55: .575,
                 56: .585, 58: .59, 60: .595, 62: .60, 65: .60, 66: .605, 70: .605, 74: .61,
                 76: .615, 78: .625, 80: .63, 82: .625}, epochs)

fig, ax = plt.subplots(figsize=(9, 4))
ax.fill_between(epochs, map50 * 100, color=PLUM, alpha=0.08, lw=0)
ax.plot(epochs, map50 * 100, color=PLUM, lw=2.2, label="mAP@50")
ax.plot(epochs, map5095 * 100, color=ORCHID, lw=2.2, label="mAP@50:95")
ax.set(xlim=(0, 82), ylim=(0, 80), xlabel="Epoch", ylabel="%")
ax.set_title("Model performance")
ax.legend(loc="lower right")
save(fig, "map.svg")

# ── Training losses ──
losses = {
    "Box loss": {0: 3.45, 1: 2.6, 2: 2.0, 3: 1.5, 4: 1.42, 5: 1.28, 6: 1.25, 7: 1.12, 8: 1.08, 10: 1.03,
                 12: .98, 14: .95, 15: 1.02, 16: .92, 18: .89, 20: .9, 25: .84, 30: .8, 35: .78, 40: .76,
                 45: .73, 50: .71, 55: .69, 60: .67, 65: .66, 70: .65, 75: .64, 80: .63, 82: .62},
    "Class loss": {0: 3.75, 1: 3.2, 2: 2.7, 3: 2.2, 4: 1.95, 5: 1.8, 6: 1.7, 8: 1.58, 10: 1.48, 12: 1.4,
                   14: 1.33, 15: 1.35, 16: 1.28, 18: 1.24, 20: 1.22, 22: 1.15, 25: 1.1, 30: 1.02,
                   35: .97, 40: .94, 45: .9, 50: .89, 55: .88, 60: .87, 65: .86, 70: .85, 75: .84,
                   80: .83, 82: .82},
    "Object loss": {0: .122, 1: .09, 2: .07, 3: .05, 4: .048, 5: .043, 6: .042, 7: .037, 8: .035,
                    10: .034, 12: .032, 14: .031, 15: .034, 16: .03, 18: .029, 20: .029, 25: .026,
                    30: .025, 35: .024, 40: .024, 45: .023, 50: .022, 55: .021, 60: .021, 65: .02,
                    70: .02, 75: .02, 80: .019, 82: .019},
}
fig, axes = plt.subplots(1, 3, figsize=(12, 3.4))
for ax, (title, points), color in zip(axes, losses.items(), (PLUM, PINK, ORCHID)):
    y = curve(points, epochs)
    ax.fill_between(epochs, y, color=color, alpha=0.12, lw=0)
    ax.plot(epochs, y, color=color, lw=2)
    ax.set(xlim=(0, 82), ylim=(0, None), xlabel="Epoch")
    ax.set_title(title)
fig.tight_layout(w_pad=2.5)
save(fig, "losses.svg")
print("ok")
