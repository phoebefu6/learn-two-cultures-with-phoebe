import numpy as np
from sklearn.datasets import load_breast_cancer

data = load_breast_cancer()
X, y = data.data, data.target            # y: 1 = benign, 0 = malignant
print(X.shape, np.bincount(y))           # (569, 30) [212 357]

rng = np.random.default_rng(2001)
test = []
for cls in (0, 1):
    idx = np.flatnonzero(y == cls)
    test += list(rng.permutation(idx)[: round(0.30 * len(idx))])
test = np.array(sorted(test))
train = np.setdiff1d(np.arange(len(y)), test)
print(len(train), len(test))             # 398 171

base = max(y[test].mean(), 1 - y[test].mean())
print(f"base rate {base:.3f}")           # 0.626

from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
sc = StandardScaler().fit(X[train])
lr = LogisticRegression(C=1.0, tol=1e-10, max_iter=10000).fit(sc.transform(X[train]), y[train])
lr_pred = lr.predict(sc.transform(X[test]))
print("logistic", (lr_pred == y[test]).sum(), "of", len(test))

from sklearn.ensemble import RandomForestClassifier
rf = RandomForestClassifier(n_estimators=100, random_state=0).fit(X[train], y[train])
rf_pred = rf.predict(X[test])
print("forest  ", (rf_pred == y[test]).sum(), "of", len(test))

coef = sorted(zip(lr.coef_[0], data.feature_names), key=lambda t: -abs(t[0]))[:3]
for w, name in coef: print(f"{name:22s} {w:+.2f}")
nodes = sum(t.tree_.node_count - t.tree_.n_leaves for t in rf.estimators_)
print("forest yes/no questions:", nodes)
print("disagree:", (lr_pred != rf_pred).sum())
for s in range(5):
    r = RandomForestClassifier(n_estimators=100, random_state=s).fit(X[train], y[train])
    print(s, (r.predict(X[test]) == y[test]).sum())
