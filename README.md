# Learn The Two Cultures with Phoebe

Six 45-minute sessions on how data science thinks, read from the papers that argued it and
tested on real rows. By Phoebe Fu.

1. Two ways to ask the data - Breiman (2001), Statistical Modeling: The Two Cultures
2. All models are wrong, some are useful - Box (1976, 1979)
3. Explore first, confirm once - Tukey (1962), exploratory and confirmatory analysis
4. The two-cultures bench - a logistic regression and a random forest computed in the browser
5. Fifty years of data science - Donoho (2017), the common task framework, greater data science
6. Which culture is this question? - Cox, Efron, Hoadley, Parzen and Breiman's rejoinder

## The bench

`assets/two-cultures-bench.js` fits both models from scratch on the 569 real biopsies of the UCI
Breast Cancer Wisconsin (Diagnostic) dataset (Wolberg, Mangasarian, Street and Street, 1993,
doi 10.24432/C5DW2B, CC BY 4.0), shipped exactly in `assets/two-cultures-data.js`. The JavaScript
engine is the canon; `materials/two-cultures-reference.py` reimplements the same seeded algorithm
in Python and reproduces every number, and cross-checks against scikit-learn.

```bash
python3 materials/build-wdbc-sample.py        # regenerate the data file
node materials/run-ladder-node.js . /tmp/node-ladder.json    # run the ladder in node
python3 materials/two-cultures-reference.py /tmp/node-ladder.json   # reimplement it in Python and assert agreement
```

Static site: open `index.html`, or serve the folder with `python3 -m http.server`.
