import numpy as np
from sklearn.datasets import load_breast_cancer
data = load_breast_cancer()
X, y = data.data, data.target
names = list(data.feature_names)
rng = np.random.default_rng(2001)
test = []
for cls in (0, 1):
    idx = np.flatnonzero(y == cls)
    test += list(rng.permutation(idx)[: round(0.30 * len(idx))])
test = np.array(sorted(test))
train = np.setdiff1d(np.arange(len(y)), test)
