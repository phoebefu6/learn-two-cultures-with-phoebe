from common import *
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import make_pipeline
SEALED = set(test.tolist())          # the referee's rows; competitors get only X[train], y[train]
def referee(predict_fn):
    rows = sorted(SEALED)
    return int((predict_fn(X[rows]) == y[rows]).sum())
board = []
board.append(("everyone benign", referee(lambda Z: np.ones(len(Z), dtype=int))))
j = names.index("worst radius")
board.append(("worst radius <= 16.76", referee(lambda Z: (Z[:, j] <= 16.76).astype(int))))
lr = make_pipeline(StandardScaler(), LogisticRegression(C=1.0, tol=1e-10, max_iter=10000)).fit(X[train], y[train])
board.append(("logistic, 30 features", referee(lr.predict)))
rf = RandomForestClassifier(n_estimators=100, random_state=0).fit(X[train], y[train])
board.append(("forest, 100 trees", referee(rf.predict)))
for name, ok in sorted(board, key=lambda b: -b[1]): print(f"{name:24s} {ok} of {len(SEALED)}")
# leaderboard hill-climbing: submit 20 forest seeds, keep the best score
scores = [referee(RandomForestClassifier(n_estimators=100, random_state=s).fit(X[train], y[train]).predict) for s in range(20)]
print("20 submissions:", min(scores), "to", max(scores), "median", np.median(scores), "best kept", max(scores))
