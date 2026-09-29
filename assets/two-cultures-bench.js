/* two-cultures-bench.js - the two-cultures bench for learn-two-cultures-with-phoebe
 *
 * The same 569 real biopsies (two-cultures-data.js, UCI Breast Cancer Wisconsin Diagnostic),
 * the same fixed held-out 171, two cultures:
 *   data modelling  - a logistic regression you can read, one coefficient per feature
 *   algorithmic     - a random forest, a vote of many fully grown trees
 *
 * Everything is computed here, in the browser, on real rows. Nothing is simulated.
 * This engine is the CANON. materials/two-cultures-reference.py reimplements the same seeded
 * algorithm in Python and must reproduce every count below; it also runs scikit-learn 1.9.0 as
 * an independent cross-check (same numbers for the regression; for the forest, sklearn's own
 * random stream differs, so the page states a cross-engine range, not a match).
 *
 * Logistic regression: features standardised on the training rows (population sd), L2 penalty
 *   0.5*||w||^2 on the weights and none on the intercept (the scikit-learn C = 1 objective),
 *   fitted by Newton's method to a step below 1e-10. Predict benign when the score is > 0.
 * Random forest: T trees; each tree sees a bootstrap of the training rows drawn with a
 *   mulberry32 generator (seed 2001); at every node floor(sqrt(p)) candidate features are drawn
 *   without replacement; the split maximises the Gini gain (thresholds at midpoints between
 *   consecutive distinct values, first best wins); trees grow until pure. The forest averages
 *   leaf shares of benign and predicts benign when the average is > 0.5.
 * Break button: training labels shuffled with a fixed permutation (seed 1962). The held-out
 *   labels are untouched, so an honest bench must fall to about the base rate.
 * Peek: score on the training rows instead of the held-out rows.
 */
(function (root) {
  "use strict";

  var FOREST_SEED = 2001, SHUFFLE_SEED = 1962, PERM_SEED = 1976, PERM_REPEATS = 3;

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /* ---------- data ---------- */
  function prepare(D) {
    var n = D.n, p = D.p, X = new Array(n);
    for (var i = 0; i < n; i++) {
      var row = new Array(p);
      for (var j = 0; j < p; j++) row[j] = D.X[i][j] / Math.pow(10, D.dec[j]);
      X[i] = row;
    }
    var isTest = new Array(n).fill(false);
    D.test.forEach(function (i) { isTest[i] = true; });
    var train = [], test = [];
    for (var k = 0; k < n; k++) (isTest[k] ? test : train).push(k);
    return { X: X, y: D.y.slice(), train: train, test: test, names: D.names, named3: D.named3, p: p };
  }

  function shuffledLabels(d) {
    /* Fisher-Yates over the TRAINING rows' labels only */
    var rng = mulberry32(SHUFFLE_SEED), lab = d.train.map(function (i) { return d.y[i]; });
    for (var k = lab.length - 1; k > 0; k--) {
      var r = Math.floor(rng() * (k + 1)), t = lab[k]; lab[k] = lab[r]; lab[r] = t;
    }
    var y = d.y.slice();
    d.train.forEach(function (i, k) { y[i] = lab[k]; });
    return y;
  }

  /* ---------- the data-modelling culture: logistic regression ---------- */
  function solve(A, b) {
    var m = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); });
    for (var c = 0; c < m; c++) {
      var piv = c;
      for (var r = c + 1; r < m; r++) if (Math.abs(M[r][c]) > Math.abs(M[piv][c])) piv = r;
      var tmp = M[c]; M[c] = M[piv]; M[piv] = tmp;
      for (var r2 = c + 1; r2 < m; r2++) {
        var f = M[r2][c] / M[c][c];
        for (var k = c; k <= m; k++) M[r2][k] -= f * M[c][k];
      }
    }
    var x = new Array(m);
    for (var i = m - 1; i >= 0; i--) {
      var s = M[i][m];
      for (var j = i + 1; j < m; j++) s -= M[i][j] * x[j];
      x[i] = s / M[i][i];
    }
    return x;
  }

  function fitLogistic(d, cols, y) {
    var rows = d.train, q = cols.length, mu = [], sd = [];
    cols.forEach(function (c) {
      var s = 0; rows.forEach(function (i) { s += d.X[i][c]; });
      var m = s / rows.length, v = 0;
      rows.forEach(function (i) { var e = d.X[i][c] - m; v += e * e; });
      mu.push(m); sd.push(Math.sqrt(v / rows.length));
    });
    function z(i) { return cols.map(function (c, k) { return (d.X[i][c] - mu[k]) / sd[k]; }); }
    var Z = rows.map(z), Y = rows.map(function (i) { return y[i]; });
    var w = new Array(q + 1).fill(0);   /* w[0] intercept */
    for (var it = 0; it < 100; it++) {
      var g = new Array(q + 1).fill(0), H = [];
      for (var a = 0; a <= q; a++) H.push(new Array(q + 1).fill(0));
      for (var r = 0; r < Z.length; r++) {
        var x = [1].concat(Z[r]), s = 0;
        for (var k = 0; k <= q; k++) s += w[k] * x[k];
        var pr = 1 / (1 + Math.exp(-s)), wt = pr * (1 - pr), e = pr - Y[r];
        for (var a2 = 0; a2 <= q; a2++) {
          g[a2] += e * x[a2];
          for (var b2 = 0; b2 <= q; b2++) H[a2][b2] += wt * x[a2] * x[b2];
        }
      }
      for (var k2 = 1; k2 <= q; k2++) { g[k2] += w[k2]; H[k2][k2] += 1; }
      var step = solve(H, g), mx = 0;
      for (var k3 = 0; k3 <= q; k3++) { w[k3] -= step[k3]; mx = Math.max(mx, Math.abs(step[k3])); }
      if (mx < 1e-10) break;
    }
    return {
      cols: cols, w: w, mu: mu, sd: sd,
      score: function (i) {
        var s = w[0];
        for (var k = 0; k < q; k++) s += w[k + 1] * (d.X[i][cols[k]] - mu[k]) / sd[k];
        return s;
      }
    };
  }

  /* ---------- the algorithmic culture: random forest ---------- */
  function growTree(d, cols, y, boot, rng, mtry) {
    var nodes = [];   /* {f, t, l, r} internal or {leaf: share} */
    function build(idx) {
      var n1 = 0;
      for (var a = 0; a < idx.length; a++) n1 += y[idx[a]];
      var me = nodes.length; nodes.push(null);
      if (n1 === 0 || n1 === idx.length || idx.length < 2) { nodes[me] = { leaf: n1 / idx.length }; return me; }
      /* draw mtry candidate features without replacement (partial Fisher-Yates) */
      var pool = cols.slice(), cand = [];
      for (var k = 0; k < mtry; k++) {
        var r = k + Math.floor(rng() * (pool.length - k)), t = pool[k]; pool[k] = pool[r]; pool[r] = t;
        cand.push(pool[k]);
      }
      var best = -1, bf = -1, bt = 0, N = idx.length, N1 = n1, N0 = N - n1;
      for (var c = 0; c < cand.length; c++) {
        var f = cand[c];
        var order = idx.slice().sort(function (u, v) { return d.X[u][f] - d.X[v][f]; });
        var l1 = 0, l0 = 0;
        for (var s = 0; s < N - 1; s++) {
          if (y[order[s]] === 1) l1++; else l0++;
          var va = d.X[order[s]][f], vb = d.X[order[s + 1]][f];
          if (va === vb) continue;
          var nl = s + 1, nr = N - nl, r1 = N1 - l1, r0 = N0 - l0;
          var gain = (l1 * l1 + l0 * l0) / nl + (r1 * r1 + r0 * r0) / nr;
          if (gain > best) { best = gain; bf = f; bt = (va + vb) / 2; }
        }
      }
      if (bf < 0) { nodes[me] = { leaf: n1 / idx.length }; return me; }
      var L = [], R = [];
      for (var q = 0; q < idx.length; q++) (d.X[idx[q]][bf] <= bt ? L : R).push(idx[q]);
      var node = { f: bf, t: bt, l: -1, r: -1 };
      nodes[me] = node;
      node.l = build(L);
      node.r = build(R);
      return me;
    }
    build(boot);
    return nodes;
  }

  function treeShare(nodes, row) {
    var k = 0;
    while (nodes[k].leaf === undefined) k = row[nodes[k].f] <= nodes[k].t ? nodes[k].l : nodes[k].r;
    return nodes[k].leaf;
  }

  function fitForest(d, cols, y, T) {
    var rng = mulberry32(FOREST_SEED), mtry = Math.max(1, Math.floor(Math.sqrt(cols.length)));
    var trees = [], n = d.train.length;
    for (var t = 0; t < T; t++) {
      var boot = new Array(n);
      for (var k = 0; k < n; k++) boot[k] = d.train[Math.floor(rng() * n)];
      trees.push(growTree(d, cols, y, boot, rng, mtry));
    }
    return {
      trees: trees,
      share: function (row) { var s = 0; for (var t2 = 0; t2 < trees.length; t2++) s += treeShare(trees[t2], row); return s / trees.length; }
    };
  }

  /* ---------- evaluation ---------- */
  function accuracy(rows, y, predict) {
    var ok = 0;
    for (var k = 0; k < rows.length; k++) if (predict(rows[k]) === y[rows[k]]) ok++;
    return ok;
  }

  function evaluate(d, opts) {
    var cols = opts.features === "named3" ? d.named3.slice() : d.names.map(function (_, j) { return j; });
    var yTrain = opts.shuffle ? shuffledLabels(d) : d.y;
    var rows = opts.peek ? d.train : d.test;
    var yTruth = opts.peek ? yTrain : d.y;

    var lr = fitLogistic(d, cols, yTrain);
    var rf = fitForest(d, cols, yTrain, opts.trees);
    var lrPred = function (i) { return lr.score(i) > 0 ? 1 : 0; };
    var rfPred = function (i) { return rf.share(d.X[i]) > 0.5 ? 1 : 0; };

    var nBenign = 0;
    rows.forEach(function (i) { nBenign += yTruth[i]; });
    var base = Math.max(nBenign, rows.length - nBenign);

    /* readouts */
    var coefs = cols.map(function (c, k) { return { f: c, w: lr.w[k + 1] }; })
      .sort(function (a, b) { return Math.abs(b.w) - Math.abs(a.w) || a.f - b.f; });
    var nodes = 0, depthMax = 0;
    rf.trees.forEach(function (tr) {
      tr.forEach(function (nd) { if (nd.leaf === undefined) nodes++; });
      (function dep(k, dd) { if (tr[k].leaf !== undefined) { depthMax = Math.max(depthMax, dd); return; } dep(tr[k].l, dd + 1); dep(tr[k].r, dd + 1); })(0, 0);
    });
    /* sign surprises: a standardised coefficient pointing against the feature's own
     * correlation with "benign" on the training rows */
    var surprises = 0;
    cols.forEach(function (c, k) {
      var mx = 0, my = 0, rowsT = d.train;
      rowsT.forEach(function (i) { mx += d.X[i][c]; my += yTrain[i]; });
      mx /= rowsT.length; my /= rowsT.length;
      var cov = 0; rowsT.forEach(function (i) { cov += (d.X[i][c] - mx) * (yTrain[i] - my); });
      if (cov * lr.w[k + 1] < 0) surprises++;
    });
    /* forest permutation importance on the scored rows (Breiman 2001, section 11.1, done on
     * the held-out rows instead of out-of-bag rows) */
    var baseOk = accuracy(rows, yTruth, rfPred), imp = [];
    var prng = mulberry32(PERM_SEED);
    cols.forEach(function (c) {
      var drop = 0;
      for (var rep = 0; rep < PERM_REPEATS; rep++) {
        var vals = rows.map(function (i) { return d.X[i][c]; });
        for (var k = vals.length - 1; k > 0; k--) { var r = Math.floor(prng() * (k + 1)), t = vals[k]; vals[k] = vals[r]; vals[r] = t; }
        var ok = 0;
        rows.forEach(function (i, q) {
          var row = d.X[i].slice(); row[c] = vals[q];
          if ((rf.share(row) > 0.5 ? 1 : 0) === yTruth[i]) ok++;
        });
        drop += baseOk - ok;
      }
      imp.push({ f: c, drop: drop / PERM_REPEATS });
    });
    imp.sort(function (a, b) { return b.drop - a.drop || a.f - b.f; });

    /* the biopsies on which the two cultures disagree: the whole argument, on this data */
    var disagree = 0, lrOnly = 0, rfOnly = 0;
    rows.forEach(function (i) {
      var a = lrPred(i), b = rfPred(i);
      if (a !== b) { disagree++; if (a === yTruth[i]) lrOnly++; else rfOnly++; }
    });

    return {
      opts: opts, nRows: rows.length, base: base, nBenign: nBenign,
      disagree: disagree, lrOnly: lrOnly, rfOnly: rfOnly,
      lr: { ok: accuracy(rows, yTruth, lrPred), numbers: cols.length + 1, top: coefs.slice(0, 3), surprises: surprises, nCoef: cols.length, w: lr.w },
      rf: { ok: baseOk, nodes: nodes, depth: depthMax, trees: opts.trees, top: imp.slice(0, 3) }
    };
  }

  /* the ladder every page quotes, in order */
  var LADDER = [
    { id: "all30", label: "All 30 features, 100 trees", opts: { features: "all30", trees: 100, shuffle: false, peek: false } },
    { id: "named3", label: "The creators' 3 features, 100 trees", opts: { features: "named3", trees: 100, shuffle: false, peek: false } },
    { id: "tree1", label: "All 30, a forest of 1 tree", opts: { features: "all30", trees: 1, shuffle: false, peek: false } },
    { id: "tree10", label: "All 30, 10 trees", opts: { features: "all30", trees: 10, shuffle: false, peek: false } },
    { id: "peek", label: "All 30, 100 trees, graded on the training rows", opts: { features: "all30", trees: 100, shuffle: false, peek: true } },
    { id: "broken", label: "All 30, 100 trees, training labels shuffled", opts: { features: "all30", trees: 100, shuffle: true, peek: false } }
  ];

  var api = { mulberry32: mulberry32, prepare: prepare, evaluate: evaluate, LADDER: LADDER, fitLogistic: fitLogistic, fitForest: fitForest, shuffledLabels: shuffledLabels };

  /* ---------- UI ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function pct(ok, n) { return (100 * ok / n).toFixed(1) + "%"; }
  function fmt(x) { return x.toLocaleString("en-US"); }

  var el, data, state = { features: "all30", trees: 100, shuffle: false, peek: false }, cache = {};

  function key(o) { return o.features + "|" + o.trees + "|" + (o.shuffle ? 1 : 0) + "|" + (o.peek ? 1 : 0); }
  function result(o) { var k = key(o); if (!cache[k]) cache[k] = evaluate(data, o); return cache[k]; }

  function seg(name, label, options) {
    return '<div class="tcb-seg" role="group" aria-label="' + esc(label) + '"><span class="tcb-seglabel">' + esc(label) + "</span>" +
      options.map(function (o) {
        return '<button type="button" class="tcb-opt' + (String(state[name]) === String(o[0]) ? " is-on" : "") + (o[2] ? " is-anti" : "") +
          '" data-k="' + name + '" data-v="' + esc(o[0]) + '">' + esc(o[1]) + "</button>";
      }).join("") + "</div>";
  }

  function nm(f) { return data.names[f]; }

  function render() {
    var r = result(state), n = r.nRows;
    var lrAcc = pct(r.lr.ok, n), rfAcc = pct(r.rf.ok, n), baseAcc = pct(r.base, n);
    var verdict, cls;
    if (state.shuffle) { cls = "bad"; verdict = "Labels shuffled: both cultures fall to about the base rate of " + baseAcc + ". The bench measures signal, not luck."; }
    else if (state.peek) { cls = "bad"; verdict = "Graded on the rows it was fitted to. The forest's " + rfAcc + " is a memory test, not a prediction."; }
    else if (r.lr.ok === r.rf.ok) { cls = "ok"; verdict = "A tie on the held-out rows. Only the second number separates the cultures here."; }
    else if (r.lr.ok > r.rf.ok) { cls = "ok"; verdict = "The readable model is ahead by " + (r.lr.ok - r.rf.ok) + " of " + n + " held-out biopsies."; }
    else { cls = "ok"; verdict = "The forest is ahead by " + (r.rf.ok - r.lr.ok) + " of " + n + " held-out biopsies."; }

    var lrTop = r.lr.top.map(function (t) { return esc(nm(t.f)) + " <b>" + (t.w > 0 ? "+" : "") + t.w.toFixed(2) + "</b>"; }).join("<br>");
    var rfTop = r.rf.top.map(function (t) { return esc(nm(t.f)) + " <b>" + t.drop.toFixed(1) + "</b>"; }).join("<br>");

    el.innerHTML =
      '<div class="tcb-controls">' +
        seg("features", "Features allowed", [["all30", "All 30"], ["named3", "The creators' 3"]]) +
        seg("trees", "Forest size", [[1, "1 tree"], [10, "10"], [100, "100"]]) +
        seg("peek", "Graded on", [[false, "Held-out 171"], [true, "Training rows (the peek)", true]]) +
        seg("shuffle", "Training labels", [[false, "Real"], [true, "Shuffled (break it)", true]]) +
      "</div>" +
      '<div class="tcb-verdict is-' + cls + '">' + esc(verdict) + ' <span class="tcb-kind">measured</span></div>' +
      '<div class="tcb-grid">' +
        '<div class="tcb-col tcb-dm"><div class="tcb-head">Data modelling culture<span>logistic regression</span></div>' +
          '<div class="tcb-num">' + lrAcc + '<small>' + r.lr.ok + " of " + n + " correct</small></div>" +
          '<div class="tcb-num2">' + r.lr.numbers + '<small>numbers to read the whole model</small></div>' +
          '<div class="tcb-list"><span>Largest standardised coefficients (+ leans benign)</span>' + lrTop + "</div>" +
          '<div class="tcb-note">' + r.lr.surprises + " of " + r.lr.nCoef + " coefficients point against their own feature's correlation with benign</div>" +
        "</div>" +
        '<div class="tcb-col tcb-alg"><div class="tcb-head">Algorithmic culture<span>random forest, ' + r.rf.trees + (r.rf.trees === 1 ? " tree" : " trees") + "</span></div>" +
          '<div class="tcb-num">' + rfAcc + '<small>' + r.rf.ok + " of " + n + " correct</small></div>" +
          '<div class="tcb-num2">' + fmt(r.rf.nodes) + '<small>yes/no questions inside it, deepest path ' + r.rf.depth + "</small></div>" +
          '<div class="tcb-list"><span>Most important by shuffling one feature (biopsies lost)</span>' + rfTop + "</div>" +
          '<div class="tcb-note">importance says which features matter, never which way</div>' +
        "</div>" +
      "</div>" +
      '<div class="tcb-base">The two cultures disagree on <b>' + r.disagree + "</b> of " + n + " biopsies: the regression is right on " + r.lrOnly + ", the forest on " + r.rfOnly + ". Every other biopsy gets the same answer from both.</div>" +
      '<div class="tcb-base">Base rate: calling every biopsy benign scores <b>' + baseAcc + "</b> (" + r.base + " of " + n + "). Any culture has to beat that line to have learned anything.</div>";

    Array.prototype.forEach.call(el.querySelectorAll(".tcb-opt"), function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-k"), v = b.getAttribute("data-v");
        state[k] = k === "trees" ? parseInt(v, 10) : (k === "features" ? v : v === "true");
        render();
      });
    });
  }

  function init() {
    el = document.getElementById("tc-bench");
    if (!el || !root.TC_DATA) return;
    data = prepare(root.TC_DATA);
    render();
    root.TC_BENCH = {
      set: function (o) { Object.keys(o).forEach(function (k) { state[k] = o[k]; }); render(); return result(state); },
      ladder: function () { return LADDER.map(function (L) { var r = result(L.opts); return { id: L.id, n: r.nRows, lr: r.lr.ok, rf: r.rf.ok, base: r.base, nodes: r.rf.nodes, disagree: r.disagree, lrOnly: r.lrOnly, rfOnly: r.rfOnly }; }); },
      get state() { return state; }
    };
  }

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof window !== "undefined" ? window : this);
