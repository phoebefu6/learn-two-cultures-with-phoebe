from common import *
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
three = ["worst area", "worst smoothness", "mean texture"]
cols = [names.index(n) for n in three]
sc = StandardScaler().fit(X[train][:, cols])
lr = LogisticRegression(C=1.0, tol=1e-10, max_iter=10000).fit(sc.transform(X[train][:, cols]), y[train])
print("held out", (lr.predict(sc.transform(X[test][:, cols])) == y[test]).sum(), "of", len(test))
print(f"score = {lr.intercept_[0]:+.2f}")
for n, w, m, s in zip(three, lr.coef_[0], sc.mean_, sc.scale_):
    print(f"   {w:+.2f} x ({n} - {m:.4g}) / {s:.4g}")
print("benign if score > 0")
