from common import *
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
sc = StandardScaler().fit(X[train])
lr = LogisticRegression(C=1.0, tol=1e-10, max_iter=10000).fit(sc.transform(X[train]), y[train])
print("held out", (lr.predict(sc.transform(X[test])) == y[test]).sum())
r = np.array([np.corrcoef(X[train][:, j], y[train])[0, 1] for j in range(30)])
flip = [(names[j], round(r[j], 2), round(lr.coef_[0][j], 2)) for j in range(30) if r[j] * lr.coef_[0][j] < 0]
print(len(flip)); [print(f) for f in flip]
c = np.corrcoef(X[train].T)
for a, b in [("mean radius","mean perimeter"),("mean radius","mean area"),("worst radius","worst perimeter"),("worst radius","worst area")]:
    print(a, b, round(c[names.index(a), names.index(b)], 3))
print("pairs above 0.9:", sum(1 for i in range(30) for j in range(i+1,30) if abs(c[i,j]) > 0.9))
three = [names.index(n) for n in ("worst area", "worst smoothness", "mean texture")]
sc3 = StandardScaler().fit(X[train][:, three])
lr3 = LogisticRegression(C=1.0, tol=1e-10, max_iter=10000).fit(sc3.transform(X[train][:, three]), y[train])
print("three held out", (lr3.predict(sc3.transform(X[test][:, three])) == y[test]).sum())
print("intercept", round(lr3.intercept_[0], 2), [round(v, 2) for v in lr3.coef_[0]])
print([round(r[j],2) for j in three])
for n in ("mean radius","mean perimeter","mean area","worst radius","worst perimeter","worst area","worst texture"):
    j=names.index(n); print(n, round(lr.coef_[0][j],2), round(r[j],2))
one = [names.index("worst area")]
sc1 = StandardScaler().fit(X[train][:, one]); l1 = LogisticRegression(C=1.0, tol=1e-10, max_iter=10000).fit(sc1.transform(X[train][:, one]), y[train])
print("worst area alone", round(l1.coef_[0][0],2), (l1.predict(sc1.transform(X[test][:, one]))==y[test]).sum())
