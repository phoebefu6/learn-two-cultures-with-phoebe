# Agent brief - shared by every fan-out page of learn-two-cultures-with-phoebe

Filled from course-builder/references/agent-brief.template.md on 2026-09-29. Internal build
document: never link it from an audience page.

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page. Copy its structure, classes, SVG grammar and quiz markup EXACTLY, including
   FOUR options per quiz question:
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-two-cultures-with-phoebe/courses/01-two-ways-to-ask-the-data.html`
   (For rhythm only, the bench page: `.../courses/04-the-two-cultures-bench.html`. Do not copy its bench markup.)
2. The source map: every verified number, its evidence tier, per-session coverage, the seams. Use
   ONLY its numbers and quotations; never invent a statistic or a quote; if a fact is missing,
   teach the uncertainty.
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-two-cultures-with-phoebe/materials/official-course-map.md`
3. The stylesheet `:root` block for the palette tokens:
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-two-cultures-with-phoebe/assets/style.css`

## Page skeleton (keep every component)

toolbar (crumb EXACTLY "learn-two-cultures-with-phoebe / Session N of 6" with the repo name linked
to ../index.html, #toggle-all, #zoom-toggle) · masthead (eyebrow "Learn The Two Cultures with
Phoebe · Session N of 6", h1 with one `<span class="accent">`, .sub, .chip-row with the level chip
`🟠 Advanced` then two audience chips then `45 min`, .agenda a1-a4) · main.wrap · section#intro
(Part 0: kicker, .lede, .legend pills, .callout.win "★ What you walk out with tonight") · 3 Parts,
each `section.section#part-N` with section-kicker (klabel "Part N · covers ...", h2,
`.tag.concept "N min live"`), a `.lede`, ONE figure, `details.card` accordions (summary:
`.mode.live` or `.mode.self`, title, `.mini`, `.caret ▶`), at least one `.callout.example` with
`span.ex-pill` "Real world" on the page · section#demo-1 Build-along (kicker `.tag.demo
"★ 22 min · everyone builds"`, .lede, ONE figure, `.steps > .step`, each with a
`.prompt-box.good` carrying a `span.label`; see your outline for the build-along content) ·
section#exercise Homework (ol, 4 items) · section#quiz (3 x `.quiz-q data-answer="0-based"`,
`p.qtext`, FOUR `button.qopt` "A · ...", `p.qwhy`; one `p.quiz-score` after the last; vary the
correct letter across the three) · section#official, h2 EXACTLY "What this session teaches, and
where it came from", `.covered > .covered-row` (pill solid ✓ / light ◐ + name + note), then the
`.mono` line EXACTLY "Every fact on this page, and its verification tier, is recorded in the
course's source map." · section.cheat#cheatsheet (h3 "Session N cheat sheet <span>· pin
this</span>", .grid-2 of six .cheat-item) · `.callout.next` with `.nx-pill` "Next session" ·
footer.pagefoot · `<script src="../assets/app.js?v=1"></script>`.

Head: the template's social meta block with this page's own title/description/url;
`<title>Session N · <Title> - learn two cultures with phoebe</title>`;
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.

First `details.card` in the FIRST Part is `open`; no other. Sentence case headings. Warm
practitioner voice, concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines
is guidance about depth, never a target: never collapse whitespace, dissolve a list into a
paragraph, or drop a component to fit.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "session 5" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map or is labelled constructed. For constructed data print "your
  numbers will differ", never invented outputs as if run. Build-along code whose printed outputs
  are real MUST have been run: the outputs you may print are ONLY those listed in your outline or
  in the map. Anything else: write the code, print nothing, and say what to look for.
- Contested or missing evidence: teach the disagreement; never resolve what the literature has not.
- Quotations: verbatim from the map, in double quotes, attributed with year. Anything the map marks
  "reported" is written as reported ("Box and Draper's 1987 book is widely quoted as ..., reported").
- NEVER "lottery" or "lotteries"; say the mechanism ("decided by row order", "arbitrary", "a
  random draw"). A verbatim quoted title in curly quotes is the only exception.
- Default to the English word. No Chinese on these pages.
- Titles, widget ids and class names must not collide with siblings: never title anything "Look
  before you model" (learn-data-thinking s3) or "Equally good, differently wrong"; never use ids
  `tc-bench` or classes starting `tcb-` (the bench owns them).
- SEAMS, one line and a link each, never taught: Rashomon/multiplicity/underspecification
  (ML Epistemology a2), why believe a model / benchmarks / veridical data science (ML
  Epistemology), frequentist vs Bayesian and priors (Bayesian a5), random forest mechanics
  (Ensemble Methods s2). URLs in Cross-links below.
- The two culture colours are fixed on EVERY figure: data modelling culture = ochre family
  (`#7A5C00` primary, `#4A3800` deep text, `#FBF5E3` fill, `#E6D39A` soft); algorithmic culture =
  violet family (`#6A5ACD` primary, `#3F3294` deep text, `#F3F1FC` fill, `#D2CCF2` soft). Never swap
  them, never use one for the other. Terracotta is the "one thing the figure is about" contrast.
- Light surfaces only: no dark-filled panels or boxes in figures (no ink or deep fills behind
  text except small solid ochre/violet boxes carrying white text, as in the template).

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): `#7A5C00` ochre · `#4A3800` ochre-deep · `#9C7A1E`
ochre-mid (strokes only, never under white text) · `#E6D39A` ochre-soft · `#FBF5E3` ochre-50 ·
`#6A5ACD` violet · `#3F3294` violet-deep · `#8B7FD9` violet-mid (strokes only) · `#D2CCF2`
violet-soft · `#F3F1FC` violet-50 · `#241F14` ink · `#665D4B` muted · `#D6CDB8` faint · `#ECE5D6`
hairline · `#A8431F` terracotta · `#7A2E12` terracotta-ink · `#FBEDE6` terracotta-50 · `#FFFDF8`
paper · `#FFFFFF` · universal reds `#991B1B` `#FEF2F2` `#FCA5A5` only for a wrong-way panel.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns="http://www.w3.org/2000/svg"
  role="img" aria-label="the data, not the shape">` > `<defs>` + `<style>` + content, then
  `<figcaption>🔍 Click to zoom - takeaway</figcaption>`. Grow H, never W.
- Prefix unique per figure, used for every class and id: session 2 `s2a`, `s2b`, `s2c`, `s2d`;
  session 3 `s3a`...; session 5 `s5a`...; session 6 `s6a`... Never reuse `s1*` or `s4*`.
- `<defs>` holds, with the figure prefix P: a wobble filter `id="PSk"` (`feTurbulence
  type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="<int>"` + `feDisplacementMap
  scale="2.4" xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%" width="106%"
  height="106%"`), hachure patterns `id="PHc"` (ochre line) and/or `id="PHv"` (violet line) (7x7
  userSpaceOnUse, rotate(-38) or rotate(38), one line, opacity .5), an open arrowhead `id="PAr"`
  (path `M1 1 L9 5 L1 9`, fill none, ink stroke 1.6). ALL shapes sit inside ONE `<g
  filter="url(#PSk)" fill="none" stroke="#241F14" stroke-width="2" stroke-linecap="round"
  stroke-linejoin="round">`; rects carry a tiny rotation (-4 to 4 degrees for hand-placed items,
  under 1 for panels). Fills: white, the culture 50-tints, the hachures for "the pile" or "the
  data", and terracotta ONLY for the one thing the figure is about. One doodle anchor per figure,
  simple strokes, never a mascot. Text classes: `.PH` 800 12px ink heading · `.PL` 600 12px ink
  label · `.PS` 400 11px muted · `.PB` 800 11px terracotta-ink · `.PO` 800 12px ochre-deep ·
  `.PP` 800 12px violet-deep · `.PV` 800 16-20px value in the culture's deep colour · `.PW` 800
  12px white on a solid ochre or violet fill · `.PN` 400 12px muted note. Hand-stacked items must
  not overlap as painted rects (the gate flags a pile).
- ALL `<text>` outside any filtered group, sans stack, never below 10.5px. Never a `style=`
  attribute on text; use classes.
- Fit: max chars ≈ (box width - 20) / 7 at 12px, 6.4px/char at 11px; full-width note under 110
  chars; 40px between neighbouring point labels; bottom note 22px below the last row, H clears it
  by 8px. When in doubt, shorten.
- Floor: one figure per Part plus one in the build-along. Draw the MECHANISM (listed per page in
  your outline), never a metaphor literally, never decoration.

## Voice and honesty

Every Part gets a real-world story from the map's cases (Breiman's projects, Box's Rothamsted and
ideal gas, Hoadley's Fair, Isaac scorecards, Donoho's CTF history, Netflix, Cox's v-CJD and X-ray
examples). Nothing constructed except build-along exercises on the WDBC data, and those print only
outputs given in your outline. The bench numbers are canon: quote them only as they appear in the
map's Canon table (e.g. 170 of 171, 99.4 percent; 7 of 30 sign surprises; 1,647 questions).

## Cross-links (absolute URLs)

- ML Epistemology hub: https://phoebefu6.github.io/learn-ml-epistemology-with-phoebe/
- Rashomon / multiplicity: https://phoebefu6.github.io/learn-ml-epistemology-with-phoebe/courses/a2-equally-good-differently-wrong.html
- What a test score entitles you to: https://phoebefu6.github.io/learn-ml-epistemology-with-phoebe/courses/a1-what-a-test-score-entitles-you-to.html
- What a benchmark licenses: https://phoebefu6.github.io/learn-ml-epistemology-with-phoebe/courses/a4-what-a-benchmark-licenses.html
- Bayesian, the prior argument: https://phoebefu6.github.io/learn-bayesian-with-phoebe/courses/a5-the-prior-argument.html
- Random forests: https://phoebefu6.github.io/learn-ensemble-methods-with-phoebe/courses/02-random-forests.html
- Data Thinking s3: https://phoebefu6.github.io/learn-data-thinking-with-phoebe/courses/03-look-before-you-model.html
- Data Literacy: https://phoebefu6.github.io/learn-data-literacy-with-phoebe/
- Causal Inference: https://phoebefu6.github.io/learn-causal-inference-with-phoebe/
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chain and session titles

01-two-ways-to-ask-the-data.html → 02-all-models-are-wrong.html → 03-explore-first-confirm-once.html
→ 04-the-two-cultures-bench.html → 05-fifty-years-of-data-science.html →
06-which-culture-is-this-question.html
Footer left: "Session N of 6 · learn-two-cultures-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: "<a href="prev.html">← Prev: <title></a> &nbsp;·&nbsp; <a href="next.html">Next: <title> →</a>" (session 6: "← Prev" and "<a href="../index.html">Course home</a>").

Session titles (exact, sentence case, one accent span in h1):
1 Two ways to ask the data · 2 All models are wrong, some are useful · 3 Explore first, confirm
once · 4 The two-cultures bench · 5 Fifty years of data science · 6 Which culture is this question?
