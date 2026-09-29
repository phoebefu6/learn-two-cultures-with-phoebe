"""Independent Python reference for assets/two-cultures-bench.js.

Two jobs:
1. Reimplement the bench's seeded algorithm (mulberry32 generator, bootstrap, sqrt(p) candidate
   features, Gini gain at midpoints, grow to purity; Newton-fitted L2 logistic regression) in
   plain Python and print every ladder number. These must equal the node/browser numbers
   EXACTLY (counts are integers; the page quotes counts and percentages of 171 or 398).
2. Cross-check against scikit-learn 1.9.0: LogisticRegression(C=1) must give the same
   held-out count and coefficients within 1e-4; RandomForestClassifier uses its own random
   stream, so it is run over 20 seeds and the range is reported as the cross-engine tolerance.

Run from the repo root:  python3 materials/two-cultures-reference.py [node-ladder.json]
With a node ladder JSON (from the node runner), it asserts agreement and exits non-zero if not.
"""
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
raw = (ROOT / "assets" / "two-cultures-data.js").read_text()
D = json.loads(re.search(r"window\.TC_DATA = (\{.*\});", raw, re.S).group(1))

FOREST_SEED, SHUFFLE_SEED, PERM_SEED, PERM_REPEATS = 2001, 1962, 1976, 3
M32 = 0xFFFFFFFF


def imul(a, b):
    return (a * b) & M32


def mulberry32(seed):
    st = [seed & M32]

    def r():
        st[0] = (st[0] + 0x6D2B79F5) & M32
        a = st[0]
        t = imul(a ^ (a >> 15), 1 | a)
        t = ((t + imul(t ^ (t >> 7), 61 | t)) & M32) ^ t
        return ((t ^ (t >> 14)) & M32) / 4294967296

    return r


n, p = D["n"], D["p"]
X = [[D["X"][i][j] / 10 ** D["dec"][j] for j in range(p)] for i in range(n)]
Y = list(D["y"])
test_set = set(D["test"])
TRAIN = [i for i in range(n) if i not in test_set]
TEST = [i for i in range(n) if i in test_set]
NAMES = D["names"]


def shuffled_labels():
    rng = mulberry32(SHUFFLE_SEED)
    lab = [Y[i] for i in TRAIN]
    for k in range(len(lab) - 1, 0, -1):
        r = math.floor(rng() * (k + 1))
        lab[k], lab[r] = lab[r], lab[k]
    y = list(Y)
    for k, i in enumerate(TRAIN):
        y[i] = lab[k]
    return y


def solve(A, b):
    m = len(b)
    M = [row[:] + [b[i]] for i, row in enumerate(A)]
    for c in range(m):
        piv = c
        for r in range(c + 1, m):
            if abs(M[r][c]) > abs(M[piv][c]):
                piv = r
        M[c], M[piv] = M[piv], M[c]
        for r2 in range(c + 1, m):
            f = M[r2][c] / M[c][c]
            for k in range(c, m + 1):
                M[r2][k] -= f * M[c][k]
    x = [0.0] * m
    for i in range(m - 1, -1, -1):
        s = M[i][m]
        for j in range(i + 1, m):
            s -= M[i][j] * x[j]
        x[i] = s / M[i][i]
    return x


def fit_logistic(cols, y):
    rows = TRAIN
    mu, sd = [], []
    for c in cols:
        s = 0.0
        for i in rows:
            s += X[i][c]
        m = s / len(rows)
        v = 0.0
        for i in rows:
            e = X[i][c] - m
            v += e * e
        mu.append(m)
        sd.append(math.sqrt(v / len(rows)))
    q = len(cols)
    Z = [[(X[i][c] - mu[k]) / sd[k] for k, c in enumerate(cols)] for i in rows]
    YY = [y[i] for i in rows]
    w = [0.0] * (q + 1)
    for _ in range(100):
        g = [0.0] * (q + 1)
        H = [[0.0] * (q + 1) for _ in range(q + 1)]
        for r in range(len(Z)):
            x = [1.0] + Z[r]
            s = 0.0
            for k in range(q + 1):
                s += w[k] * x[k]
            pr = 1 / (1 + math.exp(-s))
            wt = pr * (1 - pr)
            e = pr - YY[r]
            for a in range(q + 1):
                g[a] += e * x[a]
                for b in range(q + 1):
                    H[a][b] += wt * x[a] * x[b]
        for k in range(1, q + 1):
            g[k] += w[k]
            H[k][k] += 1
        step = solve(H, g)
        mx = 0.0
        for k in range(q + 1):
            w[k] -= step[k]
            mx = max(mx, abs(step[k]))
        if mx < 1e-10:
            break

    def score(i):
        s = w[0]
        for k in range(q):
            s += w[k + 1] * (X[i][cols[k]] - mu[k]) / sd[k]
        return s

    return w, score


def grow_tree(cols, y, boot, rng, mtry):
    nodes = []

    def build(idx):
        n1 = sum(y[a] for a in idx)
        me = len(nodes)
        nodes.append(None)
        if n1 == 0 or n1 == len(idx) or len(idx) < 2:
            nodes[me] = {"leaf": n1 / len(idx)}
            return me
        pool = list(cols)
        cand = []
        for k in range(mtry):
            r = k + math.floor(rng() * (len(pool) - k))
            pool[k], pool[r] = pool[r], pool[k]
            cand.append(pool[k])
        best, bf, bt = -1.0, -1, 0.0
        N, N1 = len(idx), n1
        N0 = N - n1
        for f in cand:
            order = sorted(idx, key=lambda u: X[u][f])
            l1 = l0 = 0
            for s in range(N - 1):
                if y[order[s]] == 1:
                    l1 += 1
                else:
                    l0 += 1
                va, vb = X[order[s]][f], X[order[s + 1]][f]
                if va == vb:
                    continue
                nl = s + 1
                nr = N - nl
                r1, r0 = N1 - l1, N0 - l0
                gain = (l1 * l1 + l0 * l0) / nl + (r1 * r1 + r0 * r0) / nr
                if gain > best:
                    best, bf, bt = gain, f, (va + vb) / 2
        if bf < 0:
            nodes[me] = {"leaf": n1 / len(idx)}
            return me
        L = [i for i in idx if X[i][bf] <= bt]
        R = [i for i in idx if not X[i][bf] <= bt]
        node = {"f": bf, "t": bt, "l": -1, "r": -1}
        nodes[me] = node
        node["l"] = build(L)
        node["r"] = build(R)
        return me

    build(boot)
    return nodes


def tree_share(nodes, row):
    k = 0
    while "leaf" not in nodes[k]:
        nd = nodes[k]
        k = nd["l"] if row[nd["f"]] <= nd["t"] else nd["r"]
    return nodes[k]["leaf"]


def fit_forest(cols, y, T):
    rng = mulberry32(FOREST_SEED)
    mtry = max(1, math.floor(math.sqrt(len(cols))))
    trees = []
    m = len(TRAIN)
    for _ in range(T):
        boot = [TRAIN[math.floor(rng() * m)] for _ in range(m)]
        trees.append(grow_tree(cols, y, boot, rng, mtry))

    def share(row):
        s = 0.0
        for tr in trees:
            s += tree_share(tr, row)
        return s / len(trees)

    return trees, share


def depth(tr, k=0, d=0):
    if "leaf" in tr[k]:
        return d
    return max(depth(tr, tr[k]["l"], d + 1), depth(tr, tr[k]["r"], d + 1))


def evaluate(features, trees, shuffle, peek):
    cols = list(D["named3"]) if features == "named3" else list(range(p))
    ytr = shuffled_labels() if shuffle else Y
    rows = TRAIN if peek else TEST
    ytruth = ytr if peek else Y
    w, score = fit_logistic(cols, ytr)
    forest, share = fit_forest(cols, ytr, trees)
    lr_pred = lambda i: 1 if score(i) > 0 else 0
    rf_pred = lambda i: 1 if share(X[i]) > 0.5 else 0
    nb = sum(ytruth[i] for i in rows)
    base = max(nb, len(rows) - nb)
    lr_ok = sum(lr_pred(i) == ytruth[i] for i in rows)
    rf_ok = sum(rf_pred(i) == ytruth[i] for i in rows)
    nodes = sum(1 for tr in forest for nd in tr if "leaf" not in nd)
    dmax = max(depth(tr) for tr in forest)
    coefs = sorted(((c, w[k + 1]) for k, c in enumerate(cols)), key=lambda t: (-abs(t[1]), t[0]))
    surprises = 0
    for k, c in enumerate(cols):
        mx = sum(X[i][c] for i in TRAIN) / len(TRAIN)
        my = sum(ytr[i] for i in TRAIN) / len(TRAIN)
        cov = sum((X[i][c] - mx) * (ytr[i] - my) for i in TRAIN)
        if cov * w[k + 1] < 0:
            surprises += 1
    prng = mulberry32(PERM_SEED)
    imp = []
    for c in cols:
        drop = 0
        for _ in range(PERM_REPEATS):
            vals = [X[i][c] for i in rows]
            for k in range(len(vals) - 1, 0, -1):
                r = math.floor(prng() * (k + 1))
                vals[k], vals[r] = vals[r], vals[k]
            ok = 0
            for q, i in enumerate(rows):
                row = list(X[i])
                row[c] = vals[q]
                if (1 if share(row) > 0.5 else 0) == ytruth[i]:
                    ok += 1
            drop += rf_ok - ok
        imp.append((c, drop / PERM_REPEATS))
    imp.sort(key=lambda t: (-t[1], t[0]))
    dis = lro = rfo = 0
    for i in rows:
        a, b = lr_pred(i), rf_pred(i)
        if a != b:
            dis += 1
            if a == ytruth[i]:
                lro += 1
            else:
                rfo += 1
    return {
        "n": len(rows), "base": base, "lr_ok": lr_ok, "rf_ok": rf_ok, "lr_numbers": len(cols) + 1,
        "rf_nodes": nodes, "rf_depth": dmax, "dis": [dis, lro, rfo], "lr_surprises": surprises,
        "lr_top": [[NAMES[c], round(v, 4)] for c, v in coefs[:3]],
        "rf_top": [[NAMES[c], round(v, 4)] for c, v in imp[:3]],
        "lr_w": w,
    }


LADDER = [
    ("all30", ("all30", 100, False, False)),
    ("named3", ("named3", 100, False, False)),
    ("tree1", ("all30", 1, False, False)),
    ("tree10", ("all30", 10, False, False)),
    ("peek", ("all30", 100, False, True)),
    ("broken", ("all30", 100, True, False)),
]


def sklearn_check(py):
    import numpy as np
    import sklearn
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.linear_model import LogisticRegression
    from sklearn.preprocessing import StandardScaler

    Xa, ya = np.array(X), np.array(Y)
    out = {"sklearn": sklearn.__version__}
    for feats in ("all30", "named3"):
        cols = list(D["named3"]) if feats == "named3" else list(range(p))
        sc = StandardScaler().fit(Xa[TRAIN][:, cols])
        Ztr, Zte = sc.transform(Xa[TRAIN][:, cols]), sc.transform(Xa[TEST][:, cols])
        lr = LogisticRegression(C=1.0, max_iter=10000, tol=1e-12).fit(Ztr, ya[TRAIN])
        ok = int((lr.predict(Zte) == ya[TEST]).sum())
        w = [float(lr.intercept_[0])] + [float(v) for v in lr.coef_[0]]
        dmax = max(abs(a - b) for a, b in zip(w, py[feats]["lr_w"]))
        rf_oks = []
        for s in range(20):
            rf = RandomForestClassifier(n_estimators=100, max_features="sqrt", random_state=s).fit(Xa[TRAIN][:, cols], ya[TRAIN])
            rf_oks.append(int((rf.predict(Xa[TEST][:, cols]) == ya[TEST]).sum()))
        out[feats] = {"lr_ok": ok, "lr_max_coef_diff": dmax, "rf_ok_min": min(rf_oks), "rf_ok_max": max(rf_oks),
                      "rf_ok_median": float(np.median(rf_oks))}
    return out


def main():
    py = {}
    for k, args in LADDER:
        py[k] = evaluate(*args)
        r = py[k]
        print(f"{k:7s} n={r['n']} base={r['base']} LR={r['lr_ok']} RF={r['rf_ok']} nodes={r['rf_nodes']} "
              f"depth={r['rf_depth']} disagree={r['dis']} surprises={r['lr_surprises']}")
        print(f"        LR top {r['lr_top']}\n        RF top {r['rf_top']}")
    sk = sklearn_check(py)
    print("sklearn cross-check:", json.dumps(sk))
    bad = 0
    if len(sys.argv) > 1:
        node = json.loads(Path(sys.argv[1]).read_text())
        for k in py:
            for f in ("n", "base", "lr_ok", "rf_ok", "lr_numbers", "rf_nodes", "rf_depth", "dis", "lr_surprises", "lr_top", "rf_top"):
                if py[k][f] != node[k][f]:
                    print(f"MISMATCH {k}.{f}: python {py[k][f]} node {node[k][f]}")
                    bad += 1
            if "lr_w" in node[k]:
                d = max(abs(a - b) for a, b in zip(py[k]["lr_w"], node[k]["lr_w"]))
                print(f"{k} max |coef python - node| = {d:.2e}")
                if d > 1e-6:
                    bad += 1
        for f in ("all30", "named3"):
            if sk[f]["lr_ok"] != py[f]["lr_ok"] or sk[f]["lr_max_coef_diff"] > 1e-4:
                print("MISMATCH sklearn logistic", f, sk[f])
                bad += 1
        print("AGREE: python reference == node engine on every ladder number" if not bad else f"{bad} mismatches")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
