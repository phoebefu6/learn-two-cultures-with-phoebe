from common import *
import pandas as pd
df = pd.DataFrame(X[train], columns=names); df["benign"] = y[train]
# explore: class means of three features, training rows only
print(df.groupby("benign")[["worst area", "worst concave points", "mean texture"]].mean().round(3))
# explore: which single feature separates best on the training rows, by best threshold
def best_rule(rows, j):
    v, t = X[rows, j], y[rows]
    best = (0, None, None)
    for c in np.unique(v):
        for side in (0, 1):
            pred = (v <= c).astype(int) if side == 0 else (v > c).astype(int)
            ok = (pred == t).sum()
            if ok > best[0]: best = (ok, c, side)
    return best
res = sorted(((best_rule(train, j), names[j], j) for j in range(30)), key=lambda z: -z[0][0])[:3]
for (ok, c, side), n, j in res: print(n, ok, "of", len(train), "cut", c, "benign if <=" if side == 0 else "benign if >")
(ok, c, side), n, j = res[0]
pred = (X[test, j] <= c).astype(int) if side == 0 else (X[test, j] > c).astype(int)
print("confirm once:", n, "<=", c, (pred == y[test]).sum(), "of", len(test))
# the peek: choose the cut on the held-out rows instead
okp, cp, sp = best_rule(test, j)
print("peek cut", cp, okp, "of", len(test))
# the bigger peek: search every feature and every cut on the held-out rows
allp = max(((best_rule(test, k)[0], names[k]) for k in range(30)))
print("best of 30 features chosen on held-out:", allp)
# what that rule scores on the training rows it never chose from
k = names.index(allp[1]); okk, ck, sk = best_rule(test, k)
predtr = (X[train, k] <= ck).astype(int) if sk == 0 else (X[train, k] > ck).astype(int)
print("same rule on training rows:", (predtr == y[train]).sum(), "of", len(train), "cut", ck)
