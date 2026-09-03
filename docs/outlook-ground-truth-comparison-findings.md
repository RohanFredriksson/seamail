# Outlook ground-truth comparison findings

Comparing tools/outlook-ground-truth/captures/<slug>.png (real Outlook desktop)
against tools/outlook-ground-truth/renders/snapshots/<slug>__outlook-classic@v1__light.png
(seamail's outlook-classic@v1 simulation). Going through the 236 gimmick
fixtures alphabetically in batches of ~10.

Legend: MATCH (close enough) / MISMATCH (needs fix) / NOTE (minor/cosmetic only)

## Batch 1 (1-10) - DONE

1. css-accent-color - MISMATCH. Real Outlook renders `<input type="checkbox">`
   as a plain TEXT placeholder "[X]" (checked) / "[ ]" (unchecked), not a real
   widget - no color, no accent-color applied (matches gimmicks.json: all "n").
   Our sim renders an actual native-style Chromium checkbox AND applies
   accent-color:#e11d48 (red), because `accent-color` isn't in
   STRIPPED_DECLARATIONS. Two stacked issues: (a) accent-color not stripped,
   (b) bigger issue - Word doesn't render real form controls at all, it shows
   bracket-notation placeholder text instead. This affects every
   html-input-*/html-button-*/html-select/html-textarea/html-form fixture,
   not just this one - worth a dedicated pass.
2. css-align-items - MISMATCH (needs more data). Fixture: outer
   `display:flex;align-items:center;height:80px;background:#f1f5f9;border:1px
   solid #cbd5e1` div wrapping a red inner div. Real Outlook: only the red
   inner bar is visible, spanning full width, no visible outer
   box/border/80px height. Sim: flex stripped correctly but outer div still
   shows its own 80px height + border + light bg as a distinct box under the
   red bar. Suspect real Outlook collapses block <div> height to content
   height when `display:flex` is neutralized (explicit `height` on plain divs
   not reliably honored by Word engine) - consistent with finding in
   css-aspect-ratio below. Needs corroboration from more height/flex fixtures
   before changing code.
3. css-animation - MISMATCH (confirmed, high confidence, see also #6).
   Fixture only sets background-color via `@keyframes` (from/to), no static
   background-color on `.anim-box`; text is white. Real Outlook: totally
   blank/white - Outlook doesn't run the animation AND doesn't statically
   apply either keyframe's declarations, so there's no background at all and
   white text on white/transparent bg is invisible. Sim: Chromium actually
   executes the CSS animation (nothing strips `animation`/`@keyframes`), so a
   solid, fully-opaque magenta/pink box renders - wrong on two counts (wrong
   color, and Outlook should show nothing here). ACTION: strip `@keyframes`
   blocks and `animation`/`animation-*` properties in outlook-classic@v1 (like
   @font-face/@media are already stripped) so neither engine applies any
   keyframe-only styling.
4. css-aspect-ratio - MISMATCH. Fixture div has explicit `width:200px` (not
   just aspect-ratio). Real Outlook: bar spans FULL viewport width, i.e.
   `width:200px` on a plain `<div>` is not honored - defaults to block
   width:auto/100%. Sim: honors width:200px exactly (200x112 box), plus
   ignores aspect-ratio (correct to ignore aspect-ratio itself, per
   gimmicks). ACTION candidate: Word engine may not reliably honor explicit
   width/height set via inline style on non-table elements (<div>/<span>) -
   classic real-world Outlook email dev gotcha (why table-based layouts with
   width= attributes are used instead of CSS width). Same pattern suspected
   in #2 above. Worth testing against css-width/css-height fixtures directly
   before changing STRIPPED_DECLARATIONS/capability map - if confirmed, may
   need to strip/ignore inline `width`/`height` on div/span (but NOT on
   table/td, and NOT the width= HTML attribute).
5. css-at-font-face - MATCH. Both fall back to Times New Roman bold serif;
   custom @font-face ignored in both.
6. css-at-keyframes - MISMATCH, same root cause as #3. `.kf-box` DOES have a
   static `background:#2563eb`, only `opacity` is animated (0.2 -> 1.0). Real
   Outlook: solid, fully opaque #2563eb (opacity never becomes non-1, static
   background honored). Sim: lighter/periwinkle-tinted version of the blue -
   Chromium is executing the animation and captured mid-cycle at partial
   opacity, blending with the white page background. Confirms the
   animation/@keyframes stripping fix from #3 - this is the second
   independent fixture demonstrating the exact same bug category.
7. css-at-media-device-pixel-ratio - MATCH. Both show base blue (`@media`
   override never applied) - @media stripping working correctly.
8. css-at-media-hover - MATCH. Both show base red - hover media query never
   applied in either engine.
9. css-at-media-orientation - MATCH. Both show base red - orientation media
   query never applied in either engine.
10. css-at-media-prefers-color-scheme - MATCH. Both show light/base styling,
    dark-mode override never applied in either engine.

## Batch 2 (11-20) - DONE

11. css-at-media-prefers-reduced-motion - MATCH. Base red in both.
12. css-at-media - MATCH. Both rules live inside `@media` blocks (even
    `@media all`); neither engine applies either background, so both show
    plain unstyled text. Confirms stripAtMediaBlocks correctly nukes
    `@media all { ... }` too, not just conditional media queries.
13. css-at-supports - MATCH (both red, verified via pixel sampling:
    rgb(225,29,72) / #e11d48 in both - not the #10b981 `@supports` override
    color). Interesting: outlook-classic@v1 has NO `@supports` stripping
    logic at all, and Chromium *does* support `display: grid` so the
    `@supports (display: grid)` block should normally win with its
    `!important`. It doesn't here (possibly a specificity/parse quirk with
    node-html-parser's `style.set_content` roundtrip, not investigated
    further since the visual result happens to match real Outlook). Low
    priority - flagging in case `@supports` behavior regresses unexpectedly
    elsewhere, but no action needed for this fixture.
14. css-backdrop-filter - MISMATCH (confirmed bug). Real Outlook: plain black
    text, no visible box at all (outer `background: linear-gradient(45deg,
    #2563eb, #e11d48)` never renders - gradients totally unsupported).
    Sim: full, crisp blue-to-red gradient bar behind the text - the gradient
    is NOT stripped. Root cause: STRIPPED_DECLARATIONS only matches the
    `background-image:` longhand via regex, not gradients written inside the
    `background:` *shorthand* (`background: linear-gradient(...)`). ACTION:
    extend stripping to catch `linear-gradient|radial-gradient|conic-gradient`
    used inside a `background:` shorthand value too (see css-background.png
    for a case that must keep working: `background:#2563eb url(...) ...`
    solid-color-first shorthand should still render its color).
15. css-background-blend-mode - MATCH, but uninformative: both totally
    blank/white (white text on nothing). Fixture has no `background-color`
    fallback, only `background-image` (2 sources) + `background-blend-mode`.
    See fixture-reliability note below.
16. css-background-clip - MATCH. Dashed blue outer border + solid red
    content-box bar identical in both.
17. css-background-image - MATCH, but uninformative: both blank/white. Same
    root cause as #15 (no `background-color` fallback declared).
18. css-background-origin - MATCH. Blue border box, no visible image effect
    either way (see note below) but layout/border identical.
19. css-background-position - MATCH. Light gray fallback box + border
    identical (image itself never renders in either).
20. css-background-repeat - MATCH. Same as #19.

### Fixture reliability note (affects ~17/236 fixtures, not a renderer bug)
`fixture-templates.mjs` uses `https://via.placeholder.com/...` for every
image-dependent fixture (background-image, srcset, object-fit, list-style-
image, html-background/height/width, etc. - 17 occurrences). That service is
defunct, so the image never loads in EITHER engine, which happens to still
produce matching screenshots when there's a `background-color`/border
fallback (#16, #18-20 above), but produces uninformative blank-vs-blank
matches when there isn't one (#15, #17) - we can't actually tell if our
image-handling simulation is correct in those cases, only that both sides
failed to load an image. Not fixing now (out of scope for this comparison
pass) but worth swapping to a local/data-URI image at some point so these
fixtures are deterministic and actually test image-rendering fidelity.

## Batch 3 (21-30) - DONE

21. css-background-size - MATCH. Same dead-placeholder-URL story as batch 2:
    light-gray fallback box + border identical in both, image itself never
    loads either side.
22. css-background - MATCH (already reviewed earlier this session: solid
    blue banner via `background:#2563eb url(...) no-repeat right center`
    shorthand renders identically in both - the color portion of the
    shorthand is honored even though the url() part never loads).
23. css-block-inline-size - MISMATCH (confirmed bug). Fixture uses logical
    sizing props only: `block-size:60px; inline-size:180px` (no physical
    width/height at all). Real Outlook: thin, full-width bar - both logical
    props totally ignored (as expected, gimmicks marks this "n" - these are
    modern CSS Word's parser doesn't recognize). Sim: proper 180x60ish
    fixed-size red box - Chromium honors `block-size`/`inline-size` fully,
    and outlook-classic@v1 never strips them.
24. css-border-image - MISMATCH (confirmed bug). Fixture: `border:10px solid
    transparent; border-image: linear-gradient(...) 1`. Real Outlook: NO
    border visible at all (border-image unsupported, and the fallback
    `border` is transparent so nothing shows). Sim: full blue-to-red
    gradient border rendered - `border-image` isn't in
    STRIPPED_DECLARATIONS.
25. css-border-inline-block-individual - MISMATCH (confirmed bug). Fixture:
    `border-block-start: 3px solid #e11d48; border-inline-end: 3px solid
    #2563eb`. Real Outlook: no border at all. Sim: renders both a red top
    border and blue right-side border. Logical border shorthands not
    stripped.
26. css-border-inline-block-longhand - MISMATCH (confirmed bug). Fixture:
    `border-block-start-color/-style/-width` (fully longhand). Real Outlook:
    no border. Sim: renders the red top border anyway. Even the fully
    spelled-out longhand logical border properties aren't stripped.
27. css-border-inline-block - MISMATCH (confirmed bug). Fixture:
    `border-block: 3px solid #e11d48; border-inline: 3px solid #2563eb`.
    Real Outlook: no border. Sim: renders a full 4-side box (red top+bottom
    from border-block, blue left+right from border-inline).
28. css-border-radius-logical - MISMATCH (confirmed bug). Fixture:
    `border-start-start-radius: 16px; border-end-end-radius: 16px` (logical
    corner radius, distinct from the physical `border-radius` shorthand
    which IS already stripped). Real Outlook: sharp square corners. Sim:
    two corners visibly rounded - logical radius corner properties aren't
    in STRIPPED_DECLARATIONS (only the physical `border-radius` shorthand
    is).
29. css-border-radius - MATCH. Physical `border-radius: 12px` correctly
    stripped in both -> sharp corners in both. Confirms the existing
    stripping rule works; good baseline sanity check against #28's gap.
30. css-border-spacing - MATCH. Table `border-collapse:separate;
    border-spacing:15px` honored identically in both (visible gap between
    cells, light table background showing through) - Outlook DOES support
    table border-spacing, unlike the div-based logical properties above.

### Major finding: CSS Logical Properties are a whole unhandled category
Batch 3 surfaced a clear, systemic gap distinct from anything in batches 1-2:
outlook-classic@v1 does not strip ANY CSS logical properties (block-size,
inline-size, border-block*, border-inline*, logical border-radius corners),
even though real Outlook ignores all of them uniformly (matches
gimmicks.json "n" for every one of these). Chromium supports them all, so
the sim currently renders sized/bordered/rounded boxes real Outlook never
would. Given 5 of 10 fixtures in this batch hit this exact bug, and the
fixture list still has more logical-property fixtures ahead (css-inset,
css-margin-block-*, css-margin-inline-*, css-padding-block-*,
css-padding-inline-*, css-max-block-size, css-min-inline-size,
css-writing-mode, etc.), this is probably best fixed as ONE broad rule
(e.g. strip any declaration whose property name matches
`(block|inline)-size`, `border-(block|inline)...`, `margin-(block|inline)...`,
`padding-(block|inline)...`, `inset-(block|inline)...`,
`border-(start|end)-(start|end)-radius`) rather than one-off regexes per
fixture - confirm against the remaining logical-property fixtures in later
batches before implementing, to get full coverage in one pass.

## Batch 4 (31-40) - DONE

Note: directory/glob order isn't pure alpha-sort (`-` sorts before `.` in
filenames), so "css-border.png" appears after "css-border-spacing.png" etc.
Numbering below follows the actual capture/render file order encountered.

31. css-border - MATCH. Full-width red 3px solid border box, identical (no
    explicit width set in this fixture, so both default to same full-width
    block - doesn't contradict the width/height-on-div finding below).
32. css-box-shadow - MATCH. No shadow in either (correctly stripped/
    unsupported), plain thin-border box in both.
33. css-box-sizing - MATCH. Blue-bordered box identical in both.
34. css-caption-side - MISMATCH (confirmed bug). Fixture:
    `<caption style="caption-side:bottom">`. Real Outlook: caption renders
    on TOP (default position - `caption-side` ignored). Sim: caption
    correctly moved to the bottom - Chromium honors `caption-side`, and
    outlook-classic@v1 doesn't strip it. ACTION: add `caption-side` to
    STRIPPED_DECLARATIONS.
35. css-clear - MATCH. Float+clear:both stacks the two boxes identically in
    both (widely-supported basic CSS, not surprising).
36. css-clip-path - MISMATCH (confirmed bug, important - read carefully).
    Fixture: `clip-path: polygon(50% 0%, 100% 100%, 0% 100%); width:100px;
    height:100px`. Real Outlook: renders as a plain, unclipped, FULL-WIDTH,
    thin horizontal red bar with "Triangle" text - i.e. NEITHER clip-path
    NOR the explicit width/height are honored on this plain `<div>`. Sim:
    renders a perfect 100x100 red triangle (Chromium honors both clip-path
    and the explicit sizing, and outlook-classic@v1 strips neither).
    ACTION: add `clip-path` to STRIPPED_DECLARATIONS. This is also the
    THIRD independent fixture (after css-align-items, css-aspect-ratio)
    showing physical `width`/`height` on a plain `<div>` not being honored
    by real Outlook - upgrading that from "needs more data" to "confirmed,
    high confidence" (see updated action item below).
37. css-color-scheme - MATCH. `:root{color-scheme:light dark}` alone (no
    matching `@media`) has no visible effect in either engine.
38. css-column-count - MATCH, but inconclusive: fixture text is too short
    to actually overflow into a second column in either engine, so this
    doesn't really prove/disprove `column-count` support either way.
39. css-column-layout-properties - MATCH, same inconclusive caveat as #38.
40. css-conic-gradient - MISMATCH (confirmed bug). Fixture:
    `background: conic-gradient(#2563eb, #e11d48, #10b981, #2563eb);
    width:120px; height:120px; border-radius:50%`. Real Outlook: totally
    blank (nothing renders - no gradient, and, consistent with #36, the
    width/height/border-radius are also apparently not creating any visible
    box since there's no text content to force a line box). Sim: renders a
    full, crisp conic-gradient pinwheel circle. Confirms the earlier
    "gradients inside the `background:` shorthand aren't stripped" bug
    (css-backdrop-filter) extends to `conic-gradient` too, not just
    `linear-gradient`.

## Batch 5 (41-50) - DONE

41. css-display-flex - MATCH. Both stack "Flex Item A"/"Flex Item B" full-
    width blocks - existing `display:flex` stripping works correctly.
42. css-display-grid - MATCH. Same as #41 for `display:grid` - existing
    stripping works correctly.
43. css-display-none - MATCH. Both hide the `display:none` element and only
    show "Visible element" (basic, universally-supported CSS).
44. css-display - MISMATCH (confirmed bug). Fixture: two divs with
    `display:inline-block`. Real Outlook: each renders as its own
    full-width block (stacked, NOT side-by-side) - `display:inline-block`
    isn't honored, falls back to the div's normal block default. Sim: two
    compact boxes rendered properly side-by-side - Chromium honors
    `inline-block` and outlook-classic@v1 only strips `inline-flex`/
    `inline-grid`, not `inline-block`. ACTION: add
    `display:\s*inline-block` to STRIPPED_DECLARATIONS.
45. css-empty-cells - MATCH. "Filled Cell" bordered box + adjacent empty
    cell render the same way in both.
46. css-filter - MISMATCH (confirmed bug). Fixture:
    `filter: blur(2px) grayscale(80%)` (+ `-webkit-filter`). Real Outlook:
    solid, crisp, full-color red bar - filter completely unsupported (as
    expected). Sim: visibly blurred, desaturated/muted maroon bar - Chromium
    fully applies the filter, and `filter`/`-webkit-filter` aren't in
    STRIPPED_DECLARATIONS. ACTION: add `filter`/`-webkit-filter` to
    STRIPPED_DECLARATIONS.
47. css-flex-direction - MATCH. `flex-direction:column-reverse` irrelevant
    once `display:flex` itself is stripped - both stack in source order.
48. css-flex-wrap - MISMATCH, but root cause is the width issue, not
    flex-wrap itself. Fixture: outer container `display:flex;
    flex-wrap:wrap; width:140px` with two `width:80px` children. Real
    Outlook: both items render as full-width stacked bars, no visible 140px
    container at all. Sim: proper 140px-wide light-gray container with two
    80px items stacked inside it (flex correctly stripped, but the explicit
    widths ARE honored by Chromium). Another (5th) data point for the
    width-on-div pattern below, not a new distinct bug.
49. css-float - MISMATCH, same width root cause. Fixture: `float:left;
    width:80px` box followed by a `<p>` meant to wrap beside it. Real
    Outlook: the float box spans the FULL viewport width (width:80px
    ignored) so the paragraph has no room and drops to the next line
    entirely below it. Sim: compact 80px float box with the paragraph text
    correctly wrapping beside it on the same line. 6th data point for the
    width-on-div pattern (can't fully rule out float itself also being
    partially unsupported, but the full-width box alone fully explains what
    we see - no need to treat this as a separate float-specific bug).
50. css-font-kerning - MATCH. Identical plain serif text in both (kerning
    differences aren't meaningfully visible in a screenshot anyway).

### Width/height-on-`<div>` finding: now very high confidence
Two more fixtures this batch (css-flex-wrap, css-float) reproduce the same
symptom as css-align-items/css-aspect-ratio/css-clip-path/css-conic-gradient
from earlier batches: explicit inline `width`/`height` on a plain `<div>` is
not honored by real Outlook - the element always expands to the full
available container width instead. Six independent fixtures now agree. Still
recommend a final direct check against the dedicated css-width/css-height
fixtures before writing the fix, but this is essentially confirmed at this
point.

## Batch 6 (51-60) - DONE

51. css-font-size-adjust - MATCH. Identical plain text, `font-size-adjust`
    has no visible screenshot effect either way.
52. css-font-size - MATCH. Identical bold blue 24px text in both.
53. css-font-stretch - MATCH. Identical bold text, `font-stretch` has no
    visible effect on Times New Roman fallback in either engine.
54. css-font-weight - MATCH. Identical bold red text in both.
55. css-function-clamp - MATCH, but coincidental/uninformative: `clamp(12px,
    4vw, 28px)` used as `font-size`, and separately no explicit width is set
    on the div, so both engines just render a full-width bar regardless of
    whether `clamp()` itself is understood - doesn't actually prove clamp()
    support either way.
56. css-function-light-dark - MISMATCH (confirmed bug). Fixture:
    `background: light-dark(#2563eb, #e11d48)` (no fallback color), white
    text. Real Outlook: totally blank (unsupported `light-dark()` function
    means the whole background declaration is dropped, so white-on-nothing
    text is invisible - consistent with how other unsupported-value cases
    behaved in earlier batches, e.g. css-animation). Sim: solid blue box -
    Chromium evaluates `light-dark()` and picks the light-mode value. ACTION:
    treat `light-dark(...)` like the gradient functions - strip/neutralize
    it wherever it appears in a value.
57. css-function-max - MATCH, but coincidental: `width: max(50%, 150px)`
    picks 50% (= full container width) in both engines, so this doesn't
    distinguish whether `max()` itself is supported.
58. css-function-min - MISMATCH (confirmed, and informative this time).
    Fixture: `width: min(100%, 180px)` (background separately still
    renders correctly as solid blue - so this ISN'T a "whole style
    attribute dropped" case, just this one declaration). Real Outlook:
    full-width blue bar (180px result never applied - min() unsupported,
    declaration dropped, width falls back to block default). Sim: correct
    ~180px-wide box. This is the 7th fixture confirming the "explicit
    width/height on a plain `<div>` isn't honored" pattern, AND it shows the
    pattern holds even when the value uses a modern CSS function
    (`min()`/`max()`/`clamp()`), not just plain px values - the eventual fix
    should ignore/strip `width`/`height` on divs regardless of value syntax.
59. css-gap - MISMATCH, and a NEW, distinct finding (read carefully). Fixture:
    outer div `display:flex; gap:20px; background:#f1f5f9; padding:10px`
    wrapping "Box A"/"Box B". Real Outlook: "Box A"/"Box B" render flush
    against the page edges with NO visible light-gray backdrop or 10px
    padding around them at all - not just the flex/gap layout being ignored
    (expected), but the container's own `background`/`padding` - completely
    ordinary, otherwise-well-supported properties - are ALSO not rendered.
    Sim: shows the correct light-gray padded backdrop around the two boxes.
    Compare to css-aspect-ratio/css-clip-path/css-conic-gradient (batches
    1/4), where the SAME div's `background` rendered fine even though its
    `width`/`height` didn't - i.e. those cases show per-declaration
    graceful degradation (unsupported width dropped, everything else on the
    same element still works). css-gap (and, in hindsight, likely
    css-align-items and css-flex-wrap from earlier batches too - worth
    re-checking) instead show the WHOLE style attribute apparently getting
    dropped for elements that have `display:flex` in their inline style,
    losing background/padding/border/sizing that would otherwise render
    fine. TENTATIVE HYPOTHESIS: Word's parser may reject the entire inline
    `style` attribute when it contains `display:flex` (or possibly
    `display:grid`), rather than just skipping that one unrecognized
    declaration - a stricter, more consequential bug than plain
    "flex is ignored". Needs verification: re-examine css-align-items and
    css-flex-wrap captures specifically for whether the flex CONTAINER's own
    background/border/padding rendered or not (not just its children), and
    check css-display-flex/css-display-grid too. If confirmed, the fix is
    NOT simply "strip display:flex" (current behavior) but "when an element
    has display:flex/grid, drop its ENTIRE inline style attribute" - a much
    bigger behavioral change than anything else found so far.
60. css-grid-template - MATCH, but uninformative for the hypothesis above:
    this particular grid container has no background/padding of its own to
    lose, so it can't confirm or refute the css-gap finding.

## Batch 7 (61-70) - DONE

61. css-height - MISMATCH. The single cleanest, most direct test of the
    width/height-on-div finding: fixture is just `height:60px` on a red div
    with text. Real Outlook: thin, content-height-only bar. Sim: proper
    60px+ box. 8th confirmation, and the most on-the-nose one - this
    fixture alone would have been enough to confirm the pattern.
62. css-hyphenate-character - MATCH. Plain unhyphenated text box, identical.
63. css-hyphenate-limit-chars - MATCH. Same as #62.
64. css-hyphens - MATCH (roughly). Both show unhyphenated wrapped text in a
    bordered box; some minor apparent box-width difference between the two
    but not the main focus of this fixture (hyphens:auto itself has no
    effect in either, as expected).
65. css-important - MATCH. `!important` inline-style override wins in both
    (blue text in both).
66. css-inert-attribute - MATCH. Identical bordered/backgrounded button
    box in both.
67. css-inline-size - MISMATCH (confirmed). `inline-size:160px` alone (no
    physical width). Real Outlook: full-width bar (ignored, as expected -
    matches css-block-inline-size from batch 3). Sim: proper 160px box.
    Same logical-properties gap already tracked.
68. css-inset - MISMATCH (confirmed). `position` + `inset:10px 20px` fixture.
    Real Outlook: full-width bar, no visible positioned/sized box, and (like
    css-gap/css-justify-content below) the outer relatively-positioned
    container's own light-gray background is also invisible. Sim: correct
    narrat narrower red box properly inset within a visible light-gray
    container. ACTION: add `inset`(-block/-inline too) to the properties
    that need stripping - not a "logical property" per se but equally
    unrecognized by Word.
69. css-intrinsic-size - MISMATCH (confirmed). `width: fit-content`. Real
    Outlook: full-width bar (unsupported `fit-content` keyword value drops
    the whole `width` declaration, same bucket as css-function-min's
    `min()` and css-clip-path's plain px width - width on divs just isn't
    reliable in Word regardless of value syntax). Sim: correct narrow
    fit-content box.
70. css-justify-content - MISMATCH, and IMPORTANT - upgrades batch 6's
    tentative hypothesis to confirmed. Fixture: outer div
    `display:flex; justify-content:space-between; background:#f1f5f9;
    padding:10px` wrapping "A"/"B" (NO explicit width/height on the
    container at all this time). Real Outlook: "A"/"B" stack as full-width
    bars completely flush against the page edge - the container's
    `background`/`padding` are ALSO completely absent, exactly like
    css-gap. Sim: shows the correct light-gray padded backdrop.
    CONFIRMED (2 clean fixtures now, css-gap and css-justify-content,
    neither involving width/height at all): elements with `display:flex` in
    their inline `style` attribute have their ENTIRE style attribute
    dropped by real Outlook, not just the flex-specific declarations. This
    is distinct from (and more severe than) the width/height-on-div issue.
    Should re-check css-align-items/css-flex-wrap/css-display-flex/
    css-display-grid/css-flex-direction captures specifically for whether
    THEIR containers' background/border/padding rendered, to see how far
    this extends (e.g. does it require `display:flex` specifically, or also
    `display:grid`?).

## Batch 8 (71-80) - DONE

71. css-left-right-top-bottom - MISMATCH, and extends the "whole style
    attribute dropped" hypothesis to `position` too. Fixture: outer div
    `position:relative; width:200px; height:80px; background:#f1f5f9`
    wrapping an inner `position:absolute; top:10px; left:30px;
    background:#2563eb...`. Real Outlook: only a full-width blue bar is
    visible (flush top-left) - the outer container's `background`/`width`/
    `height` are ALL gone (not just the position offset being ignored), and
    the inner element's absolute positioning is also ignored. Sim: correct
    light-gray 200x80 container with the blue box properly offset 10px/30px
    inside it via `position:absolute`. This is the SAME symptom as
    css-gap/css-justify-content's flex containers (batch 6/7) but here
    triggered by `position:relative`/`position:absolute` instead of
    `display:flex` - broadens the "unsupported property VALUE causes the
    whole style attribute to be dropped" hypothesis beyond just
    `display:flex`.
72. css-letter-spacing - MATCH. `letter-spacing:4px` visibly applied
    identically in both (Word DOES support this).
73. css-line-height - MATCH. Both show 2-line text with generous spacing AND
    the container's own light-gray `background`/padding IS visible in both -
    useful control case: plain supported properties (line-height, no
    flex/position involved) do NOT lose their container styling, narrowing
    the "whole style dropped" bug specifically to elements using
    `display:flex` or `position:absolute/relative`, not a general rule.
74. css-linear-gradient - MISMATCH, reinforces already-tracked bug (not new).
    `background: linear-gradient(135deg, ...)` with no fallback color/white
    text. Real Outlook: totally blank (gradient + text both invisible, same
    as css-backdrop-filter/css-conic-gradient/css-function-light-dark). Sim:
    full crisp gradient bar. Same "strip gradients/light-dark from any
    value" action item already tracked - linear-gradient is the most common
    case and this just re-confirms it.
75. css-list-style-image - MATCH. Both show default bullet (dead placeholder
    URL never loads either side) - fixture-reliability note, not a bug.
76. css-list-style-position - MATCH, useful control case like #73: the `<ul>`
    here has `background:#f1f5f9;padding:10px` (ordinary properties, no
    flex/position) and that background/padding DOES render in both -
    further narrows the "whole style dropped" bug to flex/position
    specifically, not a general "any div with an unsupported sibling
    property loses everything" rule.
77. css-list-style - MATCH. `list-style:square inside` renders identically
    (small square marker, inside positioning) in both.
78. css-margin-block-start-end - MISMATCH (confirmed, logical properties
    bucket). `margin-block-start/-end:20px`. Real Outlook: bar flush at the
    very top of the viewport, no vertical margin at all. Sim: correct 20px
    gap above/below the bar. Same already-tracked logical-properties fix.
79. css-margin-inline-block - MISMATCH (confirmed, logical properties
    bucket). `margin-inline:30px` shorthand. Real Outlook: full-width bar
    flush to both edges, no horizontal margin. Sim: correctly inset 30px on
    both sides. Same already-tracked logical-properties fix.
80. css-margin-inline-start-end - MISMATCH (confirmed, logical properties
    bucket). `margin-inline-start:40px`. Real Outlook: full-width bar flush
    left. Sim: correctly indented 40px from the left only. Same
    already-tracked logical-properties fix.

### Logical properties fix: now fully confirmed, ready to implement
Combined with batch 3 and 7 findings, we now have ~10 independent logical-
property fixtures (block-size, inline-size, border-block*, border-inline*
x3, logical border-radius, margin-block-start-end, margin-inline (shorthand
and -start) all showing the exact same "real Outlook ignores it entirely,
sim renders it" pattern. No longer needs "confirm in later batches" caveat -
ready to implement as one broad rule whenever code changes happen (still
worth a quick scan of the remaining padding-block/inline and max/min-block/
inline-size fixtures in later batches, but confidence is very high already).

### "Whole style attribute dropped" hypothesis: narrowed and refined
Batch 8 adds css-left-right-top-bottom (triggered by `position:relative`/
`position:absolute`) as a second trigger alongside `display:flex` (css-gap,
css-justify-content from batch 6/7), AND provides two clean control cases
(css-line-height, css-list-style-position) proving this does NOT happen for
ordinary supported properties - only elements using `display:flex` or
`position:absolute/relative` in their inline style seem to lose their whole
style attribute in real Outlook. Still need to verify css-position directly
(coming up in a later batch) and re-check css-align-items/css-flex-wrap/
css-display-flex/css-display-grid specifically for whether their flex
containers' own background/border/padding rendered, to fully map which
`display`/`position` values trigger this vs. which don't.

## Batch 9 (81-90) - DONE

81. css-margin - MATCH. Physical `margin:20px` shorthand renders identically
    in both (visible white gap around the bar in both) - good control case
    confirming ordinary physical `margin` works fine in Word; only the
    logical `margin-inline`/`margin-block` variants are broken (batch 8).
82. css-mask-image - MISMATCH (confirmed bug). Fixture:
    `mask-image: linear-gradient(black, transparent)` (+ `-webkit-` prefix)
    on a solid red box. Real Outlook: solid, fully opaque red bar, no fade
    (mask-image unsupported, as expected). Sim: visible gradient fade-to-
    transparent effect - Chromium applies the mask fully, and
    `mask-image`/`-webkit-mask-image` aren't in STRIPPED_DECLARATIONS.
    ACTION: add `mask-image`/`-webkit-mask-image` to STRIPPED_DECLARATIONS.
83. css-max-block-size - MATCH, but inconclusive/uninformative: content is a
    single short line that doesn't visibly overflow 40px either way, so this
    doesn't clearly prove or disprove whether `max-block-size` is ignored
    (though per the logical-properties bucket it should be).
84. css-max-height - MATCH, same inconclusive caveat as #83 (35px vs. a
    single line of text - no visible overflow/clipping difference to judge
    by in a screenshot).
85. css-max-inline-size - MISMATCH (confirmed, logical properties bucket).
    Real Outlook: full-width bar (ignored). Sim: correct ~140px box.
86. css-max-width - MISMATCH (confirmed bug, NEW and important - this is a
    PHYSICAL property, not a logical one). Fixture: plain `max-width:150px`
    on a div. Real Outlook: FULL WIDTH bar - `max-width` is completely
    ignored on this plain `<div>`, just like `width`/`height` themselves.
    Sim: correctly constrained ~150px box. This extends the "sizing
    properties on divs aren't honored by Word" pattern beyond plain
    `width`/`height` to `max-width` too - despite `max-width` being widely
    believed/used as a "safe" property in real-world email HTML (usually on
    `<table>`/`<img>`, which may behave differently than plain `<div>` -
    not tested here).
87. css-min-block-size - MISMATCH (confirmed, logical properties bucket).
    Real Outlook: thin single-line bar (min-block-size:70px ignored). Sim:
    correct tall 70px box.
88. css-min-height - MISMATCH (confirmed bug, NEW - PHYSICAL property).
    Fixture: plain `min-height:80px` on a div. Real Outlook: thin,
    content-height-only bar - `min-height` ignored entirely. Sim: correct
    80px-tall box. Second physical sizing property (after max-width) shown
    to be ignored on plain divs, beyond just `width`/`height` themselves.
89. css-min-inline-size - MISMATCH (confirmed, logical properties bucket).
    Real Outlook: thin full-width bar (ignored, plus `display:inline-block`
    also ignored - consistent with the batch 5 css-display finding). Sim:
    correct ~200px inline-block box.
90. css-min-width - MISMATCH (confirmed bug, NEW - PHYSICAL property).
    Fixture: `min-width:220px; display:inline-block`. Real Outlook: FULL
    WIDTH bar (both `min-width` AND `inline-block` ignored - two already-
    tracked bugs compounding). Sim: correct compact ~220px inline-block box.

### Sizing-properties-on-`<div>` finding: broader than width/height alone
Batch 9 shows the previously-tracked "width/height on divs ignored" bug
extends to the full family of physical sizing properties - `max-width`,
`min-width`, `min-height` are now also confirmed ignored on plain `<div>`
elements in real Outlook (in addition to `width`/`height` from earlier
batches; `max-height`/`max-block-size` were inconclusive here only because
the test content didn't overflow enough to reveal it either way). Updating
the existing action item to cover the whole family rather than just
width/height.

## Batch 10 (91-100) - DONE

91. css-mix-blend-mode - MISMATCH, plus an unexplained anomaly worth
    flagging. Fixture: outer `<div style="background:#2563eb;padding:15px">`
    wrapping inner `<div style="mix-blend-mode:difference;
    background:#ffffff;color:#000000;padding:10px;font-weight:bold">`. Real
    Outlook: plain black text with NO visible background/border/padding at
    all - not just the inner white box (which would be invisible against a
    white page anyway, so that part isn't surprising), but the OUTER div's
    perfectly ordinary `background:#2563eb;padding:15px` is ALSO completely
    absent, which is NOT explained by any pattern found so far (outer div
    has no flex/position/other exotic property - just plain background,
    which has rendered fine in many other unrelated fixtures). Sim: shows
    correct nested boxes, with the inner box rendered as a shifted
    gold/tan color - confirming Chromium is actually APPLYING
    `mix-blend-mode:difference` for real (spec-correct blend against the
    blue backdrop), which real Outlook obviously doesn't do. ACTION: add
    `mix-blend-mode` to STRIPPED_DECLARATIONS (safe, direct fix for the
    sim's over-rendering). The outer-background mystery is logged as an
    open, low-priority question (mix-blend-mode is a rare/obscure feature)
    rather than acted on now.
92. css-modern-color - MISMATCH (confirmed, fits existing pattern). Fixture:
    `background: oklch(0.6 0.25 25); color:#ffffff` only. Real Outlook:
    totally blank (unsupported `oklch()` drops the background declaration,
    leaving white text on a white page - same mechanism already seen with
    `light-dark()`/gradients/animations, not a new bug category). Sim:
    solid red box with white text - Chromium evaluates `oklch()` fully.
    Folds into the existing "strip unsupported color functions from any
    value" action item - add `oklch(...)` to the list of functions to
    strip alongside `light-dark`/gradients.
93. css-nesting - MISMATCH (confirmed, NEW category, harder to fix). Fixture
    uses native CSS nesting: `.nest-parent { background:#f1f5f9; padding:
    10px; & .nest-child { background:#e11d48; ... } }`. Real Outlook: the
    outer `.nest-parent`'s own un-nested declarations DO apply (pale
    background visible), but the nested `& .nest-child` rule does NOT apply
    (no red visible on the child) - native CSS nesting syntax isn't
    understood by Word's CSS parser, but gracefully leaves the rest of the
    parent rule intact. Sim: full nesting supported by Chromium, child
    renders red as authored. ACTION: this needs actual nested-block-aware
    CSS parsing to strip `& .selector {...}` blocks (not a simple flat
    regex like the other stripped declarations) - flag as a separate,
    lower-priority task from the simple regex-based fixes above, since it
    requires real brace-matching logic (similar to stripAtMediaBlocks but
    for nested rules).
94. css-object-fit - MATCH, uninformative (dead placeholder URL - broken
    image icon in both).
95. css-object-position - MATCH, same as #94.
96. css-opacity - MISMATCH (confirmed bug, clean). Fixture: `opacity:0.35`
    on a solid blue box. Real Outlook: FULLY OPAQUE blue bar - `opacity` is
    completely ignored. Sim: correctly semi-transparent (lighter blue,
    blended with the white page). ACTION: add `opacity` to
    STRIPPED_DECLARATIONS.
97. css-orphans - MATCH. `orphans:3` has no visible effect either way (no
    actual column overflow occurs). The apparent line-wrap difference
    between capture (1 line) and sim (2 lines) is just due to the very
    different viewport widths (1920px real capture vs 640px fixed sim
    viewport), not a CSS behavior difference - not a bug.
98. css-outline-offset - MISMATCH (confirmed, same bug as #99). Real
    Outlook: no outline visible at all. Sim: correct blue outline with
    visible 6px offset gap. Reinforces the `outline`/`outline-offset`
    stripping gap.
99. css-outline - MISMATCH (confirmed bug, clean). Fixture:
    `outline:3px solid #e11d48`. Real Outlook: no outline at all (plain
    text, no border-like decoration). Sim: correct solid red 3px outline
    box. ACTION: add `outline`/`outline-offset`/`outline-color`/
    `outline-style`/`outline-width` to STRIPPED_DECLARATIONS.
100. css-overflow-wrap - MISMATCH, driven by the already-tracked
     width-on-block-element bug, now extended to `<p>` tags too. Fixture:
     `<p style="overflow-wrap:break-word; width:100px; ...">` with a long
     unbroken word. Real Outlook: renders as ONE long line spanning far
     beyond 100px - `width:100px` is ignored on this `<p>`, same as it's
     ignored on `<div>` elements in many earlier fixtures. Sim: correctly
     constrained to a ~100px box with the word broken across 4 lines via
     `overflow-wrap:break-word`. Can't fully isolate whether
     `overflow-wrap` itself would also be unsupported, since the width
     failure alone fully explains the one-line result. Extends the
     width-ignored-on-block-elements finding to `<p>`, not just `<div>`.

## Batch 11 (101-110) - DONE

101. css-overflow - MISMATCH, driven by the already-tracked width/height-on-
     div bug, plus a separate, minor testing-methodology note. Fixture:
     `overflow:scroll; width:150px; height:50px` with long text. Real
     Outlook: text fits on one line inside a FULL-WIDTH bordered box (width/
     height ignored, as already tracked - nothing new). Sim: correct
     ~150x50 bordered box, BUT the overflowing text visibly spills out
     below the box border in the screenshot rather than being clipped by
     `overflow:scroll` - this looks like a Playwright/Chromium full-page-
     screenshot quirk with scrollable overflow (scrollbars/clipping don't
     always render as expected in a single full-page capture), not an
     outlook-classic@v1 CSS-stripping bug to fix - noting separately from
     the main findings, low priority.
102. css-padding-block-start-end - MISMATCH (confirmed, logical properties
     bucket, 14th+ data point). Real Outlook: bar hugs text tightly, no
     vertical padding. Sim: correct generous 20px top/bottom padding.
103. css-padding-inline-block - MISMATCH (confirmed, logical properties
     bucket). Real Outlook: text flush to left edge, no horizontal padding.
     Sim: correct 30px padding on both sides.
104. css-padding-inline-start-end - MISMATCH (confirmed, logical properties
     bucket). Real Outlook: text flush left. Sim: correct 35px left inset.
105. css-padding - MATCH. Physical `padding:25px` shorthand renders
     identically (visible space around text in both) - good control case,
     same conclusion as css-margin: ordinary physical box-model properties
     work fine in Word, only the logical variants are broken.
106. css-position - MISMATCH, and this is the clean, direct confirmation of
     the "position triggers whole style loss" hypothesis from batches 6-8.
     Fixture: exactly like css-left-right-top-bottom - outer
     `position:relative;width:200px;height:80px;background:#f1f5f9` wrapping
     inner `position:absolute;top:15px;right:15px;background:#e11d48;...`.
     Real Outlook: only a full-width red bar, flush top-left, no visible
     light-gray container, no positioning offset at all. Sim: correct
     light-gray 200x80 container with the red label positioned near the
     top-right as authored. UPGRADING the "verify against css-position"
     caveat from earlier batches - this is now fully confirmed, not just
     tentative.
107. css-pseudo-class-active - MISMATCH, and reinforces the existing
     "real form controls render as plain text" finding (batch 1) with a new
     angle: NOT just checkboxes - `<button>` elements themselves lose ALL
     their own styling in real Outlook. Real Outlook: "Active Pseudo Class
     Button" as bare, unstyled black text - the button's own
     `background:#2563eb;color:#fff;padding:8px 16px` (completely ordinary,
     nothing exotic) doesn't render at all. Sim: proper styled blue button.
     `:active` itself is untestable via a static screenshot either way
     (needs real user interaction) - the real finding here is that
     `<button>` loses its inline styling entirely, not specifically about
     `:active`.
108. css-pseudo-class-checked - MISMATCH (confirmed, NEW bucket - CSS
     selector-based pseudo-classes). Fixture: `input:checked + label {
     color:#e11d48; font-weight:bold }`. Real Outlook: checkbox shows as a
     "[X]" text placeholder (consistent with the forms finding) AND the
     label text is PLAIN BLACK, not red - the `:checked` selector rule
     doesn't apply at all. Sim: correct native checkbox widget AND red bold
     label text - Chromium fully supports `:checked` + sibling combinator.
     Unlike the property-stripping fixes tracked so far, fixing this would
     require stripping/neutralizing whole CSS RULES that use unsupported
     pseudo-class selectors, not just individual declarations - a
     different, more complex category of fix.
109. css-pseudo-class-default - MISMATCH, mostly folds into the forms
     finding (#107/#1) plus the new pseudo-class-selector bucket (#108).
     Real Outlook: "[Default Button]" bracket-placeholder text, no outline.
     Sim: real styled button with a visible blue `:default`-triggered
     outline. Both root causes (form controls not rendered as widgets, AND
     `:default` selector rule not stripped) are already tracked elsewhere.
110. css-pseudo-class-first-child - MISMATCH (confirmed, NEW bucket, same
     as #108 - and an important one, since there's a large block of
     `css-pseudo-class-*`/`css-pseudo-element-*` fixtures coming up in
     later batches that will likely hit this same category repeatedly).
     Fixture: `.fc-list li:first-child { color:#e11d48; font-weight:bold }`.
     Real Outlook: BOTH list items render in plain black text - `:first-
     child` is not applied at all. Sim: "First Child (Red)" correctly
     styled red/bold - Chromium fully supports `:first-child`. Confirms
     structural/interactive pseudo-class selectors broadly aren't
     recognized by Word's CSS engine, and our sim doesn't account for any
     of them.

### NEW major bucket: CSS pseudo-class selectors need whole-rule stripping
css-pseudo-class-checked and css-pseudo-class-first-child both show that
real Outlook's CSS engine doesn't apply rules keyed on pseudo-class
selectors (`:checked`, `:first-child`, and almost certainly most others -
`:hover`, `:active`, `:focus`, `:nth-child`, `:not`, `:has`, etc., many of
which have their own dedicated upcoming fixtures). This is structurally
different from every fix tracked so far: those are all about stripping
individual property VALUES/DECLARATIONS; this needs stripping/ignoring
entire CSS RULES based on their SELECTOR containing an unsupported pseudo-
class - much closer in complexity to the css-nesting fix (batch 10) than to
a simple STRIPPED_DECLARATIONS regex entry. Given there's an entire block of
~20 more pseudo-class/pseudo-element fixtures coming up, DON'T design the fix
yet - let those batches establish exactly which pseudo-classes are
unsupported (likely most/all of them) before implementing, since a single
broad rule ("strip any CSS rule whose selector contains a pseudo-class,
except maybe `:hover`/`:link`/`:visited` which email clients sometimes DO
support") may end up being the right approach.

## Batch 12 (111-120) - DONE

This batch is the start of the big pseudo-class/pseudo-element block and
provides overwhelming confirmation of the new bucket flagged in batch 11.

111. css-pseudo-class-first-of-type - MISMATCH (confirmed, pseudo-class
     selector bucket). Real Outlook: "First paragraph of type (Blue)" in
     plain black text - `:first-of-type` rule not applied. Sim: correctly
     blue.
112. css-pseudo-class-focus-visible - MATCH/uninformative, folds into the
     forms-styling finding, not new info about the pseudo-class itself
     (`:focus-visible` requires actual interactive focus state that neither
     a real-Outlook screenshot nor our static Playwright screenshot can
     produce - both just show the unfocused base state). Real Outlook:
     plain unstyled text (no button box at all - consistent with
     `<button>` losing its own styling, per batch 11 #107). Sim: proper
     styled gray button. Root cause is the forms-rendering issue, not
     `:focus-visible` specifically.
113. css-pseudo-class-focus-within - MISMATCH, mostly folds into the forms
     finding too, but ALSO refines it usefully (see note after #114 below).
     Real Outlook: text input renders as an empty "[   ]" bracket
     placeholder with no visible label text. Sim: proper text input box
     with orange-ish placeholder text.
114. css-pseudo-class-focus - MATCH, and this REFINES the forms-rendering
     finding: unlike `<button>`/checkbox/radio/submit inputs (which lose
     all styling or become bracket placeholders), a plain
     `<input type="text">` DOES render as a proper bordered box with its
     placeholder-ish text visible in real Outlook, matching the sim closely
     here. So the "form controls render as bracket text" issue is NOT
     universal across all form elements - text inputs render fairly
     normally, while checkboxes/radios/buttons/submit inputs are the ones
     that collapse to bracket-notation or unstyled text. Important nuance
     for whenever the forms investigation item gets picked up.
115. css-pseudo-class-has - MISMATCH (confirmed, pseudo-class selector
     bucket). Real Outlook: checkbox as "[X]" bracket, plain black label,
     no green row highlight - `:has()` not applied. Sim: real checkbox +
     light green background highlighting the row (Chromium fully supports
     `:has()`).
116. css-pseudo-class-hover - MATCH/uninformative. Neither screenshot
     simulates an actual hover interaction, so both just show the base
     (unhovered) blue bar identically - doesn't test `:hover` support
     either way.
117. css-pseudo-class-lang - MISMATCH (confirmed, pseudo-class selector
     bucket). Real Outlook: plain black text. Sim: blue bold italic
     (`:lang(fr)` rule applied by Chromium).
118. css-pseudo-class-last-child - MISMATCH (confirmed, pseudo-class
     selector bucket). Real Outlook: both list items plain black. Sim:
     "Last Child Item (Red)" correctly red/bold.
119. css-pseudo-class-last-of-type - MISMATCH (confirmed, pseudo-class
     selector bucket). Real Outlook: plain black text. Sim: correctly blue.
120. css-pseudo-class-not - MISMATCH (confirmed, pseudo-class selector
     bucket). Real Outlook: both items plain black. Sim: "Match :not (Red)"
     correctly red/bold.

### Pseudo-class selector bucket: now fully confirmed across 8 selectors
Combined with batch 11 (`:checked`, `:first-child`), this batch adds
`:first-of-type`, `:has()`, `:lang()`, `:last-child`, `:last-of-type`, and
`:not()` - EVERY structural/functional pseudo-class selector tested so far
(8 of 8) is completely unapplied by real Outlook, while our sim (via
Chromium) applies all of them correctly. `:active`/`:focus`/`:focus-visible`/
`:focus-within`/`:hover` are untestable via static screenshots (no real
interaction state in either capture method) so they don't confirm or refute
anything about interactivity-based pseudo-classes specifically - only the
structural/functional ones tested here. Given the 8/8 hit rate, recommend
treating this as effectively CONFIRMED for structural/functional pseudo-
classes: outlook-classic@v1 should strip/neutralize any CSS rule whose
selector contains a structural or functional pseudo-class (`:first-child`,
`:last-child`, `:nth-child`, `:nth-of-type`, `:only-child`, `:first-of-type`,
`:last-of-type`, `:not()`, `:has()`, `:lang()`, `:checked`, `:default`,
`:target`, `:visited`, etc.) rather than just individual property values.
Still want the remaining upcoming pseudo-class fixtures (nth-child variants,
only-child/only-of-type, target, visited) to fill out the picture, but no
counterexamples have appeared yet.

### Forms-rendering finding refined (batch 11 + 12 combined)
Not all form controls behave the same in real Outlook: `<button>` and
`<input type="submit">` lose ALL inline styling (render as bare unstyled
text); `<input type="checkbox">`/`<input type="radio">` render as bracket-
notation placeholders (`[X]`/`[ ]`); but plain `<input type="text">` renders
fairly normally as a bordered box with visible content (css-pseudo-class-
focus). The eventual forms fix will need different handling per control
type, not one uniform rule.

## Batch 13 (121-130) - DONE

121. css-pseudo-class-nth-child - MISMATCH (pseudo-class selector bucket).
     Real Outlook: all 3 list items plain black. Sim: "Item 2" correctly
     blue (`:nth-child(2)`).
122. css-pseudo-class-nth-last-child - MISMATCH (pseudo-class selector
     bucket). Real Outlook: both items plain black. Sim: "Item B" correctly
     red (`:nth-last-child(1)`).
123. css-pseudo-class-nth-last-of-type - MISMATCH (pseudo-class selector
     bucket). Real Outlook: both paragraphs plain black. Sim: "Para 2"
     correctly blue.
124. css-pseudo-class-nth-of-type - MISMATCH (pseudo-class selector bucket).
     Real Outlook: all 3 paragraphs plain black (odd/even styling not
     applied). Sim: paragraphs 1 and 3 correctly red (`:nth-of-type(odd)`).
125. css-pseudo-class-only-child - MISMATCH (pseudo-class selector bucket).
     Real Outlook: plain black "Only Child Span". Sim: correctly blue.
126. css-pseudo-class-only-of-type - MISMATCH (pseudo-class selector
     bucket). Real Outlook: plain black paragraph. Sim: correctly red.
127. css-pseudo-class-target - MATCH, uninformative. Neither capture method
     actually navigates to the `#target-sec` fragment, so `:target` styling
     is never triggered in either engine - both just show the plain,
     un-highlighted link/section. Doesn't test `:target` support either way.
128. css-pseudo-class-visited - MATCH for the tested part (base, non-visited
     link color matches - blue in both, since neither engine can simulate
     "visited" state anyway), but real Outlook's capture has an odd, plain
     black horizontal bar spanning the full width right at the very top of
     the image that doesn't correspond to anything in the fixture markup
     (`a:visited{color:#7c3aed}` + a single plain link - nothing that
     should produce this). Likely a one-off capture/crop artifact for this
     specific fixture rather than a real rendering behavior - flagged for
     awareness, not acted on.
129. css-pseudo-element-after - MISMATCH (NEW: extends the bucket to
     pseudo-ELEMENTS, not just pseudo-classes). Fixture:
     `.p-after::after { content:' [AFTER PSEUDO]'; color:#e11d48; ... }`.
     Real Outlook: only "Base Content" visible - the `::after` generated
     content never renders at all. Sim: "Base Content [AFTER PSEUDO]" with
     the red bracketed text correctly appended - Chromium fully supports
     `::after` generated content.
130. css-pseudo-element-before - MISMATCH (confirms #129's finding).
     Real Outlook: only "Base Content", no generated text. Sim: "[BEFORE
     PSEUDO] Base Content" correctly rendered with the blue bracketed
     prefix. 2/2 pseudo-elements tested so far both fail identically in
     real Outlook - expect the same for `::first-letter`/`::first-line`/
     `::marker`/`::placeholder` in upcoming fixtures.

### Pseudo-class bucket: 14/14 structural/functional selectors confirmed
Adding this batch's 6 (`:nth-child`, `:nth-last-child`, `:nth-last-of-type`,
`:nth-of-type`, `:only-child`, `:only-of-type`) to batches 11-12's 8 makes
14 consecutive confirmations with zero counterexamples. Treat as fully
confirmed for all structural/functional pseudo-classes.

### NEW: pseudo-ELEMENTS (`::before`/`::after`) also unsupported
Distinct from (but likely needing similar whole-rule-stripping treatment as)
the pseudo-class bucket: CSS generated content via `::before`/`::after` is
never rendered by real Outlook, but Chromium renders it fully in the sim.
Expect this to extend to `::first-letter`, `::first-line`, `::marker`, and
`::placeholder` (all have dedicated upcoming fixtures) - wait for those
before finalizing the fix design, but it looks like the same general
"strip/ignore CSS rules using unsupported pseudo-selectors" fix could cover
both pseudo-classes AND pseudo-elements in one implementation.

## Batch 14 (131-140) - DONE

131. css-pseudo-element-first-letter - MISMATCH (confirms pseudo-element
     bucket, 3/3 now). Real Outlook: plain black text, no drop-cap. Sim:
     first letter "F" rendered large and red via `::first-letter`.
132. css-pseudo-element-first-line - MISMATCH (confirms bucket, 4/4). Real
     Outlook: plain black text. Sim: first line rendered blue/bold via
     `::first-line`.
133. css-pseudo-element-marker - MISMATCH (confirms bucket, 5/5). Real
     Outlook: default black bullet. Sim: custom red/pink bullet via
     `::marker`.
134. css-pseudo-element-placeholder - MISMATCH, but mostly folds into the
     forms-rendering finding rather than being new info about
     `::placeholder` itself. Real Outlook: empty "[   ]" bracket
     placeholder (no visible text at all - consistent with input fields
     that aren't plain type="text"; this one may be styled/typed
     differently). Sim: proper text input showing "Custom Placeholder
     Style" in blue italic via `::placeholder`.
135. css-radial-gradient - MISMATCH, reinforces the already-tracked gradient
     bug (not new). Real Outlook: totally blank (no fallback color
     declared). Sim: full radial gradient box with text. Same
     "strip gradients/color-functions from any value" action item.
136. css-resize - MISMATCH, and a new data point for the forms-rendering
     investigation. Real Outlook: only the plain label text, NO textarea
     box rendered at all (not even a bracket placeholder - just absent).
     Sim: proper textarea with visible border and resize handle. Adds
     `<textarea>` to the list of form controls that don't render as real
     widgets in Outlook (this one renders as nothing, not brackets).
137. css-rgb - MATCH. `rgb(225,29,72)` renders identically (solid red bar)
     in both - plain opaque `rgb()` is well supported.
138. css-rgba - MISMATCH (confirmed, new and notable). Fixture:
     `background: rgba(37,99,235,0.7)`, white text, no fallback. Real
     Outlook: totally blank (background+text both invisible) - `rgba()`
     with an alpha channel is NOT supported (unlike opaque `rgb()` in
     #137), consistent with `opacity` itself also being unsupported
     (batch 10) - alpha transparency in general seems to be a gap in
     Word's rendering engine. Sim: correct semi-transparent blue bar.
     ACTION: add `rgba(...)` to the list of color/value functions that get
     stripped (alongside gradients/`light-dark`/`oklch`).
139. css-scroll-snap - MATCH, uninformative. Scroll-snap only affects actual
     scroll interaction, which neither capture method performs - both show
     the same static stacked boxes regardless of support.
140. css-selector-adjacent-sibling - MISMATCH (confirmed, and extends the
     "whole rule stripping" bucket beyond pseudo-classes to CSS
     COMBINATORS). Fixture: `h2 + p { color:#e11d48 }` (adjacent-sibling
     combinator). Real Outlook: "Adjacent Sibling Paragraph (Red)" renders
     in plain black - the `+` combinator rule never applies. Sim: correctly
     red. This suggests the fix needed isn't just "strip rules using
     pseudo-classes" but more broadly "strip rules using selector
     combinators/features Word's primitive CSS parser doesn't understand"
     - there are more combinator-specific fixtures coming up
     (child `>`, general sibling `~`, chaining, attribute, universal) that
     should confirm/refine the exact scope.

## Batch 15 (141-150) - DONE

141. css-selector-attribute - MISMATCH (extends selector bucket to
     attribute selectors). Real Outlook: plain black text - `[data-test=
     "highlight"]` attribute selector never applies. Sim: correct blue bar.
142. css-selector-chaining - MISMATCH (extends selector bucket, and
     IMPORTANT - this is basic, old CSS, not some modern feature). Real
     Outlook: plain black text - a chained/compound class selector
     (`.box.primary.active`, i.e. 3 classes on one element) never applies.
     Sim: correct red bar. This is notable because compound class selectors
     have been valid CSS since CSS2 - it's not "modern" CSS Word doesn't
     understand, it's apparently ANY selector beyond a single simple
     class/type/ID selector.
143. css-selector-child - MISMATCH (extends bucket). Real Outlook: both
     paragraphs plain black - child combinator (`>`) never applies. Sim:
     "Direct Child Paragraph (Blue)" correctly blue.
144. css-selector-general-sibling - MISMATCH (extends bucket). Real Outlook:
     plain black text - general sibling combinator (`~`) never applies.
     Sim: correctly red.
145. css-selector-universal - MISMATCH (extends bucket, notably even `*`).
     Real Outlook: plain text, no border - the universal selector (`*`)
     rule (giving every element a dashed border) never applies. Sim: both
     spans show the dashed blue border correctly.
146. css-shape-margin - MISMATCH, folds into already-tracked findings (not
     new). Real Outlook: plain wrapped text, no floated circle at all
     (consistent with the "float+explicit width/height on div ignored"
     finding - the shape/circle relies on border-radius, already stripped,
     AND float dimensions, already known to be ignored). Sim: floated red
     SQUARE (border-radius already correctly stripped by existing code)
     with text wrapping beside it.
147. css-shape-outside - MISMATCH, same as #146, folds into existing float/
     sizing findings.
148. css-sytem-ui - MATCH. Both render a similar bold sans-serif fallback
     for the `system-ui` font stack - close enough, no real discrepancy.
149. css-tab-size - MATCH, uninformative (no literal tab character to
     visibly compare in a static screenshot either way).
150. css-table-layout - MATCH. `table-layout:fixed` with 50px/150px column
     widths renders with correct proportions in both - useful confirmation
     that TABLES (unlike plain divs) reliably honor explicit sizing in
     real Outlook, consistent with the existing width/height-on-div finding
     being specific to non-table elements.

### Selector bucket: now spans pseudo-classes, pseudo-elements, combinators,
### attribute selectors, AND compound/chained selectors
This batch adds attribute selectors, compound class selectors, `>` (child),
and `~` (general sibling) to the already-confirmed pseudo-class (14),
pseudo-element (5), and `+` (adjacent-sibling) findings. Notably, compound
class selectors (`.a.b.c`) failing is NOT a "modern CSS" issue - it's very
old, basic CSS - suggesting real Outlook's selector matching is broadly
primitive rather than just missing newer features. Total confirmed selector
failures across batches 11-15: ~25 fixtures, zero counterexamples for
anything beyond a single simple type/class/ID selector. This strongly
supports a blanket fix approach: outlook-classic@v1 should probably only
apply CSS rules whose selector is a single simple selector (one tag name,
one class, or one ID - no combinators, no compound selectors, no
pseudo-classes/elements, no attribute selectors), and drop/ignore all
others, rather than trying to enumerate every unsupported selector feature
individually.

## Batch 16 (151-160) - DONE

151. css-text-align-last - MATCH. Justified text with centered last line
     renders consistently (line-wrap differences are just due to differing
     viewport widths between capture/sim, not a CSS support gap).
152. css-text-align - MATCH. Centered text identical in both.
153. css-text-decoration-color - MISMATCH (confirmed via pixel sampling).
     Fixture: `text-decoration:underline; text-decoration-color:#2563eb`
     (blue) on plain black text. Real Outlook: underline is BLACK (matches
     text color, `text-decoration-color` ignored - verified: no blue pixels
     anywhere in the capture). Sim: underline pixels sampled at exactly
     rgb(37,99,235) = #2563eb - Chromium correctly applies the color. ACTION:
     add `text-decoration-color` to STRIPPED_DECLARATIONS.
154. css-text-decoration-line - MATCH. `text-decoration-line:line-through`
     (used alone, not as part of the shorthand) renders identically in both.
155. css-text-decoration-skip-ink - MATCH. Underline behavior around
     descenders (p,g,q,j,y) looks consistent in both.
156. css-text-decoration-style - MISMATCH (confirmed). Fixture:
     `text-decoration:underline; text-decoration-style:wavy`. Real Outlook:
     plain SOLID underline (style ignored). Sim: correct wavy underline.
     ACTION: add `text-decoration-style` to STRIPPED_DECLARATIONS.
157. css-text-decoration-thickness - MATCH (roughly). Both show a
     noticeably thick red underline; can't confidently distinguish an exact
     4px vs. default thickness at this resolution, not flagging as a clear
     mismatch.
158. css-text-decoration - MISMATCH (confirmed, and reveals an important
     nuance about the shorthand). Fixture:
     `text-decoration: underline double #e11d48` (multi-part shorthand:
     line + style + color together). Real Outlook: PLAIN BLACK text, NO
     underline at all, NO red color - the entire shorthand declaration
     appears to be dropped/ignored when it has multiple space-separated
     values, unlike `text-decoration:underline` used ALONE elsewhere in
     this batch (css-text-decoration-color/-skip-ink/-style fixtures),
     which DOES produce a plain underline in real Outlook. Sim: correct red
     double-underline. ACTION: strip the complex multi-value
     `text-decoration` shorthand (or normalize it down to just `underline`/
     `line-through` etc. keyword alone) since Word can't parse the
     style+color extensions, but keep the plain single-keyword form
     (`underline`, `line-through`, `none`) since that DOES work.
159. css-text-emphasis-position - MISMATCH (confirmed, new). Real Outlook:
     plain text, no emphasis marks. Sim: small red dot marks under each
     character via `text-emphasis`+`text-emphasis-position`. `text-emphasis`
     (CJK-style emphasis marks) entirely unsupported by Word, as expected -
     quite an obscure/modern feature.
160. css-text-emphasis - MISMATCH (confirms #159, 2/2). Real Outlook: plain
     text, no marks. Sim: blue triangle marks above each character.

## Batch 17 (161-170) - DONE

161. css-text-justify - MISMATCH, but mostly folds into the already-tracked
     width-on-div finding rather than testing `text-justify` itself. Real
     Outlook: single line, box spans full available width (the `<p>`'s
     `width:200px` is ignored, so with no wrapping there's no last-line to
     visibly justify). Sim: correct ~200px box with 3 wrapped, justified
     lines. Can't isolate `text-justify` support from the width failure.
162. css-text-orientation - MISMATCH (confirmed, new). Real Outlook: plain
     horizontal text "Upright Text" (vertical writing-mode + text-
     orientation entirely ignored - falls back to normal horizontal flow).
     Sim: text rendered vertically, one letter per line, as authored via
     `writing-mode:vertical-rl; text-orientation:upright`. Confirms vertical
     writing modes aren't supported by Word - there's a dedicated
     css-writing-mode fixture later that should reinforce this.
163. css-text-overflow - MISMATCH, folds into the width-on-div finding (not
     new). Real Outlook: full text visible on one line, box spans full
     width (width/overflow ignored, nothing to truncate). Sim: correct
     narrow box showing "Very Long Text T…" with ellipsis.
164. css-text-shadow - MISMATCH (confirmed, new). Real Outlook: crisp text,
     no shadow. Sim: visible gray drop-shadow behind the text (matches
     `box-shadow` already being unsupported - shadows in general aren't
     rendered by Word). ACTION: add `text-shadow` to STRIPPED_DECLARATIONS.
165. css-text-transform - MISMATCH, and this is a CONFIRMED BUG IN OUR OWN
     CODE, not a real-Outlook fidelity gap (important, read carefully). Real
     Outlook: text correctly renders as "UPPERCASE TEXT TRANSFORM TEST" (all
     caps, `text-transform:uppercase` works fine in real Outlook - this is
     old, basic CSS). Sim: renders as lowercase "uppercase text transform
     test" - text-transform is NOT applied, even though it should be
     supported. ROOT CAUSE: the existing `STRIPPED_DECLARATIONS` regex for
     the `transform` property - `/transform\s*:[^;]+;?/gi` - has no word
     boundary/prefix check, so it also matches the substring "transform:"
     inside "text-transform:", incorrectly stripping the whole
     `text-transform:uppercase;` declaration (leaving a dangling "text-"
     fragment). This is a false-positive over-stripping bug that actively
     makes our simulation LESS accurate for a property real Outlook
     actually supports. ACTION (bug fix, distinct from all the "add missing
     stripped declaration" items): fix the `transform` regex to not match
     when preceded by "text-" (e.g. a negative lookbehind
     `(?<!text-)transform\s*:`, or better, anchor to a declaration boundary
     like `(?:^|;)\s*transform\s*:`).
166. css-text-underline-offset - MATCH. Underline offset gap looks
     consistent in both.
167. css-text-underline-position - MATCH. `under` position renders
     similarly in both.
168. css-text-wrap - MATCH, largely uninformative (content too short in
     this fixture to meaningfully test `text-wrap:balance` wrapping
     behavior either way).
169. css-transform - MATCH, and a useful positive control: plain
     `transform:rotate(5deg)` (not prefixed with "text-") is correctly
     stripped in the sim and correctly ignored in real Outlook - both show
     an un-rotated bar. Confirms the `transform` stripping rule itself is
     correct for its intended target; the bug in #165 is specifically about
     it ALSO incorrectly matching `text-transform`.
170. css-transition - MATCH, uninformative (no property is actively
     transitioning in either static screenshot, so nothing to compare).

## Batch 18 (171-180) - DONE

Process note: several of this batch's fixtures look deceptively similar at
thumbnail size (small width differences are easy to misjudge visually) -
verified actual bar widths via pixel sampling (find rightmost non-white
pixel per row) rather than relying on the resized preview images. Worth
doing this for any future width-sensitive comparison rather than eyeballing.

171. css-unit-calc - MISMATCH (confirmed via pixel measurement, folds into
     the width-on-div bucket). Fixture: `width: calc(100% - 40px)`. Real
     Outlook: bar spans 98.5% of viewport width (calc() ignored, same as
     plain `width` always being ignored). Sim: bar spans 599/640 = 93.6%
     (calc() correctly computed to ~600px against the 640px viewport) -
     visually close to the real capture's 98.5% (calc(100%-40px) is
     naturally close to 100%), but functionally a real mismatch, just a
     coincidentally small visual gap. Not a new bug category.
172. css-unit-ch - MISMATCH (confirmed via pixel measurement). Fixture:
     `width: 20ch`. Real Outlook: bar spans 98.5% of viewport (ignored).
     Sim: bar is genuinely narrow, only 182/640 = 28% width (`ch` unit
     correctly computed by Chromium). Same width-on-div bucket.
173. css-unit-initial - MATCH. `color: initial` resets to default black
     text identically in both - not a sizing test, no discrepancy.
174. css-unit-rem - MATCH. `font-size`/`padding` in `rem` units render
     consistently in both (well-supported, old unit).
175. css-unit-vh - MISMATCH (confirmed, width-on-div bucket, this time
     height). Fixture: `height: 15vh`. Real Outlook: thin, content-height-
     only bar. Sim: correctly tall (~135px, matching 15% of the 900px
     viewport height).
176. css-unit-vmax - MISMATCH (confirmed, width-on-div bucket). Real
     Outlook: full-width bar. Sim: correct narrow ~200px box (`20vmax`).
177. css-unit-vmin - MISMATCH (confirmed, width-on-div bucket). Real
     Outlook: full-width bar. Sim: correct narrow ~150px box (`20vmin`).
178. css-unit-vw - MISMATCH (confirmed, width-on-div bucket). Real Outlook:
     full-width bar. Sim: correct ~256px box (`40vw` of 640px viewport).
179. css-user-select - MATCH, uninformative (selection state isn't visible
     in a static screenshot either way).
180. css-variables - MISMATCH (confirmed, NEW bucket - not previously
     tracked). Fixture: `:root{--main-color:#2563eb} .var-box{background:
     var(--main-color);color:#fff;...}`. Real Outlook: plain black text on
     white background - the CSS custom property (`--main-color`) and its
     `var()` reference are never resolved, so the background declaration is
     effectively dropped (consistent with how other unresolvable/unknown
     values behave elsewhere). Sim: correct solid blue background with
     white text - Chromium fully resolves CSS custom properties. ACTION:
     CSS Custom Properties (`--foo: ...` declarations and `var(--foo)`
     references) are entirely unsupported by real Outlook and need to be
     neutralized - a genuinely new category not covered by any existing
     STRIPPED_DECLARATIONS entry (this fix is different in kind: rather
     than stripping the whole declaration, either resolve `var()` at
     process()-time to a static fallback/inherited value, or strip any
     declaration whose value contains `var(`).

Batch 18 confirmed unit_calc/ch/vmax/vmin/vw/vh all fold into the existing,
already-massively-confirmed "sizing properties on plain block elements
ignored by real Outlook" finding - no changes needed to that action item's
wording, just further corroboration (now well past a dozen confirming
fixtures). The one new, actionable finding this batch is CSS custom
properties (`--var`/`var()`).

## Batch 19 (181-190) - DONE

This batch includes css-width, the single most direct test of the
width-on-div finding - now unambiguously confirmed with no caveats.

181. css-visibility - MISMATCH (confirmed, new). Fixture: two stacked divs,
     first has `visibility:hidden`. Real Outlook: BOTH bars fully visible,
     including the "Invisible (visibility: hidden)" text - `visibility`
     is completely ignored, the element renders normally. Sim: correctly
     hides the first div's content while still reserving its layout space
     (only "Visible Below" shows, with a gap above matching the hidden
     bar's height) - proper CSS-spec behavior. ACTION: add `visibility` to
     STRIPPED_DECLARATIONS (stripping it will make the sim show the
     content normally, matching real Outlook).
182. css-white-space-collapse - MATCH. Multiple spaces collapsed to single
     spaces identically in both.
183. css-white-space - MATCH. `white-space:pre-wrap` preserves multiple
     spaces identically (monospace) in both.
184. css-widows - MATCH, uninformative (no actual column overflow occurs in
     either engine to test the property against).
185. css-width - MISMATCH (the cleanest, most direct confirmation of the
     width-on-div finding, no caveats). Fixture: plain `width:180px` on a
     div, nothing else exotic. Real Outlook: bar spans the FULL viewport
     width (98%+), `width:180px` completely ignored. Sim: correct, exact
     ~180px box. This fixture alone would have been sufficient to confirm
     the pattern - now backed by 15+ fixtures across many batches.
186. css-word-spacing - MATCH. `word-spacing:12px` renders identically
     (wide gaps between words) in both.
187. css-word-wrap - MISMATCH, folds into the width-on-div finding (not
     new). Real Outlook: full-width bordered box, long word fits on one
     line (no wrapping needed since box isn't constrained). Sim: correct
     narrow box with the word broken across lines via `word-wrap`.
188. css-writing-mode - MISMATCH (confirmed, 2nd data point alongside
     css-text-orientation from batch 17). Real Outlook: plain horizontal
     text - `writing-mode:vertical-rl` ignored entirely. Sim: text
     correctly rendered vertically. Confirms vertical writing modes aren't
     supported by Word.
189. css-z-index - MISMATCH, folds into the already-tracked
     `position:absolute` finding (not new). Real Outlook: two bars stacked
     normally in document order, no overlap (position:absolute ignored, so
     z-index has nothing to act on). Sim: two boxes genuinely overlapping
     with correct z-index stacking (position:absolute honored by Chromium).
190. html-abbr - MISMATCH, AND an unexplained rendering anomaly worth
     flagging for investigation. Fixture is just
     `<abbr title="HyperText Markup Language">HTML</abbr> abbreviation
     test.` Real Outlook: plain text, no dotted underline (abbr styling
     unsupported, matches expectations - not itself surprising). Sim: shows
     an extra, unexplained line of text reading "element" ABOVE the main
     "HTML abbreviation test." line, plus a dotted underline under "HTML".
     Nothing in the fixture source produces the word "element" - this looks
     like a stray browser tooltip/accessibility artifact leaking into the
     Playwright screenshot (not something in our HTML/CSS processing).
     Flagging as an anomaly to watch for across other upcoming `title=`-
     bearing fixtures (acronym, dfn, abbr-adjacent html-* fixtures) rather
     than something to fix immediately - if it recurs, investigate whether
     `page.screenshot()`/`newSecurePage()` needs a setting to suppress
     native tooltips or force a specific accessibility/focus state.

## Batch 20 (191-200) - DONE

This batch resolved the "element" render artifact first seen in batch 19
(html-abbr) - root cause confirmed, see below. It's a bug in our OWN fixture
generation, not a real-Outlook fidelity gap, but worth fixing since it adds
visual noise to sim screenshots for many html-* fixtures going forward.

### ROOT CAUSE CONFIRMED: stray "element" text in sim renders
`generate-fixtures.mjs` interpolates `gimmick.title` unescaped into
`<title>${gimmick.title}</title>` in the generated fixture HTML. Many
Can I Email gimmick titles for HTML tag features are literally formatted
like `<abbr> element`, `<audio> element`, `<bdi> element`, `<button
type="reset"> element` (confirmed by reading the actual generated fixture
files) - i.e. the title text itself contains a raw, unescaped `<tag>`.
Per the HTML spec, `<title>` content should be parsed as raw text/RCDATA
(no nested tags possible), but `node-html-parser` (used in
`outlook-classic@v1`'s `process()`) appears to parse the literal "<abbr>"
etc. inside `<title>` as a real nested element, corrupting the DOM and
causing the trailing " element" text to leak out and render as a stray
text node at the top of the visible page. Confirmed present whenever the
gimmick's title contains a raw `<tag>` (css/html-abbr, html-audio, html-bdi,
html-button-reset, html-button-submit all confirmed via direct read of the
generated `.html` fixture); confirmed ABSENT for html-command-attribute
(title "Command attribute button", no raw tag). html-aria-describedby
showed the artifact too despite its title ("aria-describedby attribute")
having no raw tag - doesn't fit the confirmed mechanism, worth
re-verifying in a future pass rather than concluding a second cause exists.
ACTION (fixture-generation bug, not an outlook-classic@v1 rendering fix):
HTML-escape `gimmick.title` when interpolating it into `<title>` in
generate-fixtures.mjs (e.g. replace `<`/`>` with `&lt;`/`&gt;`), or simply
drop the `<title>` element from the generated fixtures entirely since its
content has no bearing on the visible screenshot. This will likely affect
MANY more of the remaining html-* fixtures (most Can I Email HTML feature
titles follow the "<tag> element" convention) - expect to see it recur
until fixed, and don't re-flag every individual occurrence going forward
now that the root cause is understood.

191. html-acronym - MATCH. Plain text, no dotted underline in either
     (acronym styling unsupported, as expected - consistent).
192. html-aria-describedby - MISMATCH, folds into the already-tracked
     forms-styling finding (button loses all styling in real Outlook -
     plain text only, no button box). Also shows the "element" artifact
     (see root-cause note above; doesn't fit the confirmed mechanism for
     this specific fixture, flagged for re-verification).
193. html-aria-labelledby - MATCH. "Section Title" (red bold) + content
     renders identically in both, no artifact.
194. html-aria-live - MATCH. Plain bordered/backgrounded live region text,
     identical in both.
195. html-audio - MISMATCH (confirmed). Real Outlook: plain fallback text
     "Audio playback not supported." (audio element unsupported, matches
     expectations). Sim: full native audio player widget rendered (plus the
     "element" artifact, explained by the title-tag bug above).
196. html-background - MATCH, uninformative (both totally blank - dead
     placeholder URL, no fallback background-color, same fixture-
     reliability issue tracked since batch 2).
197. html-bdi - MISMATCH, and a NEW, distinct, valuable finding (separate
     from the "element" artifact). Fixture: `<bdi>` wrapping Arabic text
     "إبراهيم". Real Outlook: renders as GARBLED MOJIBAKE
     ("Ø¥Ø¨Ø±Ø§Ù‡ÙŠÙ...") - a text ENCODING bug, not a bdi-support
     question per se; looks like the Arabic UTF-8 bytes got misinterpreted
     as a single-byte Windows codepage when Outlook received the HTMLBody.
     Sim: renders the Arabic text correctly via `<bdi>`. SUSPECTED ROOT
     CAUSE: this is likely a `capture.ps1` issue (not setting UTF-8/body
     format explicitly on the `MailItem` before assigning `.HTMLBody`)
     rather than a genuine Outlook rendering limitation - worth revisiting
     capture.ps1's encoding handling before re-capturing, rather than
     something to "fix" in outlook-classic@v1 itself. (Also shows the
     "element" artifact, explained above.)
198. html-button-reset - MISMATCH (confirmed, forms-styling bucket). Real
     Outlook: plain concatenated text "Default Value Reset Button", no
     input border, no button box at all. Sim: proper text input + gray
     "Reset Button" widget (plus "element" artifact, explained above).
199. html-button-submit - MISMATCH (confirmed, forms-styling bucket). Real
     Outlook: plain "Submit Button" text. Sim: proper blue button widget
     (plus "element" artifact, explained above).
200. html-command-attribute - MISMATCH (confirmed, forms-styling bucket,
     and a clean control case with NO "element" artifact - title has no
     raw tag, consistent with the confirmed root cause). Real Outlook:
     plain "Command attribute button" text. Sim: proper bordered button
     widget.

## Batch 21 (201-210) - DONE

201. html-dfn - MATCH. "HTML" renders italicized (dfn's default UA style)
     identically in both (plus the now-understood "element" artifact from
     the title-tag bug, not re-flagging individually).
202. html-dialog - MISMATCH (confirmed). Real Outlook: plain bold text, no
     visible border/box. Sim: text inside a proper blue-bordered box
     (`<dialog open>` styled/positioned by Chromium). `<dialog>` styling is
     unsupported by Word, as expected for a modern HTML5 element.
203. html-dir - MATCH. Deprecated `<dir>` tag renders as a plain bulleted
     list identically in both engines.
204. html-doctype - MATCH. Solid red bar with bold white text, identical in
     both (doctype recognition itself has no visible effect either way).
205. html-form - MISMATCH (confirmed, forms-styling bucket). Real Outlook:
     plain concatenated text "Form Text: Form value [Submit]" - no input
     border, no button box, submit button shown as `[Submit]` bracket
     notation. Sim: proper bordered form with a real text input and
     "Submit" button widget.
206. html-height - MATCH/uninformative. Both fail to load the dead
     placeholder image (fixture-reliability issue, tracked since batch 2);
     the two engines just show visually different default "broken image"
     icons (expected UA difference, not actionable).
207. html-hidden - MISMATCH (confirmed, NEW finding - distinct from CSS
     `visibility`/`display:none`, batch 19/5 respectively). Fixture: a div
     with the HTML5 boolean `hidden` attribute, plus a normal visible div.
     Real Outlook: BOTH divs render fully visible, including the one marked
     `hidden` - the `hidden` attribute is completely ignored. Sim: correctly
     hides the `hidden` div, only shows the visible one (standard browser
     behavior). ACTION: this is an HTML ATTRIBUTE, not a CSS declaration, so
     it's a different kind of fix than everything in STRIPPED_DECLARATIONS
     - outlook-classic@v1's `process()` needs to strip/ignore the `hidden`
       attribute (e.g. remove it from elements) so Chromium renders the
       content normally, matching real Outlook.
208. html-input-checkbox - MISMATCH (confirmed, forms-styling bucket). Real
     Outlook: "[X] Checked Checkbox Input" bracket placeholder. Sim: real
     checked checkbox widget.
209. html-input-hidden - MATCH. `<input type="hidden">` is correctly
     invisible in both (standard behavior, not a discrepancy).
210. html-input-radio - MISMATCH (confirmed, forms-styling bucket, and adds
     a nice detail). Real Outlook: "(X) Radio A ( ) Radio B" - note ROUND
     brackets/parentheses for radio inputs, vs. SQUARE brackets `[X]` for
     checkboxes (#208) - real Outlook's placeholder notation differs by
     input type. Sim: real radio button widgets.

## Batch 22 (211-220) - DONE

211. html-input-reset - MISMATCH (confirmed, forms-styling bucket). Real
     Outlook: "Text to reset [Reset Input]" - value shown as plain text,
     reset button as `[Reset Input]` bracket notation. Sim: real bordered
     text input + gray "Reset Input" button widget.
212. html-input-submit - MISMATCH (confirmed, forms-styling bucket). Real
     Outlook: "[Submit Input Button]" bracket text. Sim: real blue button
     widget. Confirms: `<input type="submit">`/`<input type="reset">` both
     get bracket-notation placeholders (like checkbox/radio), whereas plain
     `<button>` elements (batch 11/20) get NO brackets, just bare unstyled
     text - a further, useful refinement of the forms-styling bucket's
     per-control-type behavior.
213. html-input-text - MISMATCH, and IMPORTANT - contradicts/refines the
     batch 12 (#114) finding that plain `<input type="text">` "renders
     fairly normally as a bordered box" in real Outlook. Fixture: `<input
     type="text" value="Sample Text Field" style="padding:6px;border:1px
     solid #94a3b8;">`. Real Outlook: PLAIN TEXT ONLY, "Sample Text Field"
     with NO border/box at all - the explicit `border` inline style is NOT
     rendered (consistent with the broader "border/sizing on non-table
     elements ignored" pattern extending to `<input>` too). Sim: proper
     bordered input box. REVISE the batch-12 conclusion: text inputs don't
     reliably keep their border either - batch 12's example may have
     looked bordered for a different/coincidental reason. Net effect is
     still the same practical guidance (text inputs show their literal
     value/content as plain text, unlike checkbox/radio/submit/reset which
     use bracket placeholders) - just don't assume text inputs keep a
     visible border in real Outlook.
214. html-lists - MISMATCH, mostly structural MATCH (bullets/numbers/
     definition list layout is consistent enough) but the sim render shows
     an extra stray text fragment ", and" at the very top of the image that
     isn't part of the fixture's visible body content - almost certainly
     another manifestation of the same generate-fixtures.mjs
     unescaped-metadata-leak bug identified in batch 20 (unescaped `<title>`
     content, or possibly the HTML comment header, corrupting
     `node-html-parser`'s DOM and leaking stray text) rather than a new
     distinct issue. Not treating as a new bug category, just another
     symptom of the already-tracked one.
215. html-loading-attribute - MATCH, uninformative (dead placeholder URL,
     `loading="lazy"` isn't visually distinguishable in either a real or
     simulated static screenshot anyway).
216. html-marquee - MISMATCH (confirmed). Real Outlook: plain static text
     "Scrolling Marquee Text", no special styling (expected - `<marquee>`
     itself is long-deprecated, and any scrolling animation obviously can't
     show in a static screenshot either way). Sim: text rendered inside a
     styled light-gray/bordered box with red bold font (whatever CSS
     targets `.marquee`-like styling in the fixture is retained), plus the
     "element" artifact. The core marquee-specific finding: real Outlook
     doesn't apply the CSS styling intended to decorate the marquee text.
217. html-meta-color-scheme - MATCH. Plain text on a light gray box,
     identical in both (the `<meta name="color-scheme">` tag has no visible
     rendering effect on its own).
218. html-meter - MISMATCH (confirmed, new). Real Outlook: plain text "75%"
     (the fallback/text-content value), no meter/progress bar widget at
     all. Sim: real native green meter bar widget rendered. `<meter>` is
     entirely unsupported by Word, falls back to showing only its
     text-node content (consistent with other unsupported HTML5 form-like
     elements).
219. html-object - MISMATCH (confirmed, new, and notable). Real Outlook:
     TOTALLY BLANK - not just the `<object>`'s `data` failing to load, but
     its FALLBACK TEXT CONTENT ("Object fallback text") is also completely
     absent. Sim: shows "Object fallback text" (Chromium's standard
     fallback-content behavior when the `data` URL fails to load, which it
     does here due to the dead placeholder host). Real Outlook appears to
     drop the entire `<object>` element, including its fallback content -
     more aggressive than just failing to load the embedded resource.
220. html-picture - MATCH, uninformative (both show a broken-image icon due
     to the dead placeholder URL; fixture-reliability issue, not a real
     rendering difference for the `<picture>`/`<source>` mechanism itself).

## Batch 23 (221-230) - DONE

This batch confirms a SYSTEMIC encoding bug (not an Outlook fidelity issue)
across 3 more fixtures, and surfaces a major, high-value NEW finding about
HTML5 semantic elements losing their default block-level display.

221. html-popover - MISMATCH (confirmed, new). Real Outlook: BOTH the
     "Toggle Popover" button AND the popover's content ("Popover content")
     are visible simultaneously - the Popover API's default-hidden state is
     completely ignored. Sim: correctly shows only the button, popover
     content hidden by default (matches real browser behavior). `popover`
     attribute/API entirely unsupported by Word, as expected for a very
     modern feature.
222. html-progress - MISMATCH (confirmed). Real Outlook: plain fallback
     text "65%", no progress bar. Sim: real native progress bar widget
     (plus "element" artifact). `<progress>` unsupported, falls back to
     text content only - same pattern as `<meter>` (batch 22).
223. html-required - MISMATCH (confirmed, forms-styling bucket). Real
     Outlook: "[    ] [Send]" - empty bracket placeholder for the text
     input, bracket text for the Send button. Sim: proper "Required Field"
     placeholder input + "Send" button widget.
224. html-rp - MISMATCH (confirmed, and part of a SYSTEMIC issue - see
     below). Real Outlook: renders as garbled mojibake (e.g. "â□‹ã‚"æ¼é")
     instead of the intended CJK ruby annotation text. Sim: correct CJK
     characters render fine (plus "element" artifact).
225. html-rt - MISMATCH, same mojibake pattern as #224.
226. html-ruby - MISMATCH, same mojibake pattern as #224/#225 (shows
     "明日" with furigana correctly in the sim, garbled in the real capture).

### SYSTEMIC FINDING: non-ASCII/Unicode text renders as mojibake in real
### Outlook captures (capture.ps1 issue, NOT an outlook-classic@v1 gap)
Combined with html-bdi (batch 20), FOUR fixtures now show real Outlook
captures rendering non-Latin Unicode text (Arabic in html-bdi; CJK in
html-rp/html-rt/html-ruby) as garbled mojibake, while the simulation
renders the same text correctly. This is almost certainly a `capture.ps1`
encoding bug (not setting UTF-8/appropriate body format before assigning
`$mail.HTMLBody`), not a real Outlook rendering limitation - Outlook
desktop has supported Unicode HTML email for a very long time. ACTION (not
an outlook-classic@v1 fix): investigate and fix capture.ps1's handling of
non-ASCII characters (e.g. explicitly read the fixture file as UTF-8 and/or
set an appropriate `MailItem` property before assigning `.HTMLBody`) and
recapture bdi/rp/rt/ruby (and any other non-Latin-script fixtures) once
fixed, rather than treating these as real fidelity findings.

227. html-select - MISMATCH (confirmed, forms-styling bucket). Real
     Outlook: "[Option B (Selected) ∨]" bracket-notation placeholder shown
     TWICE (possibly two `<select>`s in the fixture, or a rendering
     quirk not investigated further). Sim: single real native dropdown
     widget showing "Option B (Selected)".
228. html-semantics - MISMATCH (confirmed, MAJOR NEW finding, high
     practical value). Fixture: `<header>Header</header><article>Article
     </article><section>Section</section><aside>Aside</aside><footer>
     Footer</footer>` (or similar) with no explicit CSS display overrides.
     Real Outlook: ALL FIVE render as one unbroken run of concatenated text
     with ZERO spacing - "HeaderArticleSectionAsideFooter" all on one line.
     Word's rendering engine does NOT give HTML5 semantic sectioning
     elements (`<header>`, `<article>`, `<section>`, `<aside>`, `<footer>`,
     likely also `<nav>`, `<main>`, `<figure>`, etc.) their default
     `display:block` UA-stylesheet treatment - it treats them as unknown/
     inline elements. Sim: Chromium correctly applies default block-level
     styling (each on its own line, background bars for header/footer).
     This matches well-known real-world Outlook email development folklore
     (HTML5 semantic tags are notoriously unreliable in Outlook; the common
     workaround is `<div>`s or explicit `display:block` CSS on every
     semantic tag). ACTION: outlook-classic@v1 should force these semantic
     elements to behave as Word does - likely by explicitly setting
     `display:inline` on `header/article/section/aside/footer/nav/main/
     figure` etc. (unless the fixture's own CSS already sets a display
     value) so they lose their default block behavior, matching real
     Outlook. This is a distinct, high-value fix, likely relevant to many
     real-world templates that use semantic HTML for structure.
229. html-srcset - MATCH, uninformative (both totally blank - dead
     placeholder URL for every srcset candidate, no visible fallback in
     either engine - fixture-reliability issue, not a real discrepancy).
230. html-style - MATCH. `<style>` tag basic usage (coloring specific
     words) renders identically in both.

## Batch 24 (231-236) - DONE - FINAL BATCH, SURVEY COMPLETE (236/236)

231. html-svg - MISMATCH (confirmed, new). Real Outlook: plain text "Inline
     SVG" only - the SVG element leaves NO visual trace at all, not even a
     placeholder box. Sim: shows "Embedded image" text plus a dashed-border
     gray placeholder box reading "[svg unsupported]" - this placeholder is
     `outlook-classic@v1`'s own intentional SVG-replacement logic (see
     `process()`), but it doesn't match how real Outlook actually behaves
     (which is to render nothing at all for the `<svg>`). ACTION: consider
     removing the SVG element entirely (no placeholder box) instead of
     substituting a visible dashed-border div, to match real Outlook's
     actual "leaves no trace" behavior.
232. html-target - MATCH. `target="_blank"` isn't visually distinguishable
     in a static screenshot either way (link text/styling identical); minor
     rendering nuance in how the underscore in `_blank` looks next to the
     underline in each engine's font rendering, not a functional difference.
233. html-textarea - MISMATCH (confirms css-resize from batch 14, 2nd data
     point). Real Outlook: plain text "Sample Textarea Content", NO
     textarea box/border at all. Sim: proper bordered textarea widget (plus
     "element" artifact). `<textarea>` renders as nothing (not even a
     bracket placeholder) in real Outlook - distinct from checkbox/radio/
     submit/reset's bracket-notation behavior.
234. html-video - MISMATCH (confirmed). Real Outlook: plain fallback text
     "Video playback unsupported". Sim: full native video player widget
     (plus "element" artifact). Consistent with `<audio>` (batch 20) -
     HTML5 media elements entirely unsupported, fall back to their text
     content only.
235. html-wbr - MISMATCH, folds into the already-tracked width-on-element
     bucket (not a new distinct `<wbr>` finding). Real Outlook: bordered
     box spans the full available width (box's own width constraint
     ignored), so the long word fits on one line without ever needing to
     break at the `<wbr>` point. Sim: correctly narrow, constrained box
     forces the word to wrap at the `<wbr>` across 3 lines. Can't isolate
     `<wbr>` support from the width failure since the real capture never
     needed to wrap in the first place.
236. html-width - MATCH/inconclusive (fixture-reliability issue, same as
     many other image-based fixtures). Both show a small, generically-
     sized "broken image" icon (dead placeholder URL never loads in either
     engine) - can't cleanly tell whether the `width="200"` HTML ATTRIBUTE
     (as opposed to CSS `width`) is honored for reserving space, since
     neither engine's default broken-image placeholder appears to use it.

## SURVEY COMPLETE: all 236 gimmick fixtures reviewed (batches 1-24)
Final tally across the full survey: the overwhelming majority of mismatches
fall into a small number of well-understood, high-confidence buckets (full
details and exact fixture citations are in each batch section above):
1. Missing STRIPPED_DECLARATIONS entries for ~20 individual CSS properties
   (accent-color, filter, opacity, outline*, text-shadow, text-decoration-
   color/-style, text-emphasis*, mask-image, mix-blend-mode, clip-path,
   caption-side, visibility, writing-mode, border-image, display:inline-
   block, and color/gradient functions used in any value: linear/radial/
   conic-gradient, light-dark(), oklch(), rgba()).
2. A confirmed BUG in existing code: the `transform` stripping regex
   over-matches `text-transform` (batch 17) - fix before adding new
   declarations so it doesn't compound.
3. ALL CSS logical properties (block/inline-size, margin/padding/border/
   inset -block/-inline variants, logical border-radius corners) - one
   broad rule, ~16+ fixtures confirm.
4. Explicit sizing (width/height/min/max-width/min/max-height) on non-
   table/non-image block elements is never honored by real Outlook,
   regardless of value syntax - the single most-confirmed finding (20+
   fixtures across nearly every batch).
5. Elements with `display:flex` or `position:absolute/relative` lose their
   ENTIRE inline style attribute in real Outlook, not just the
   flex/position declarations - 4 confirming fixtures, needs a different
   implementation approach than simple property stripping.
6. CSS selector matching is extremely primitive - only single simple type/
   class/ID selectors work; pseudo-classes, pseudo-elements, combinators,
   attribute selectors, the universal selector, and even compound/chained
   class selectors are ALL ignored (~30 confirming fixtures) - needs real
   selector parsing, recommend "keep only single-simple-selector rules".
7. Native CSS nesting (`&`) unsupported - needs the same real-parsing
   approach as #6.
8. CSS Custom Properties (`--var`/`var()`) entirely unresolved.
9. Form controls behave differently by type: `<button>`/`<input
   type=submit/reset>` show as plain/bracket text; checkbox/radio show as
   `[X]`/`(X)` bracket/paren placeholders; `<textarea>` shows as nothing;
   plain `<input type=text>` shows its literal value as plain text (no
   border). Needs a dedicated, per-control-type fix.
10. HTML5 semantic sectioning elements (header/article/section/aside/
    footer/etc.) don't get default `display:block` - render as one run-on
    line. High real-world practical value.
11. HTML5 media elements (`<audio>`/`<video>`) and `<meter>`/`<progress>`/
    `<object>`/`<dialog>`/popover fall back to plain text or nothing.
12. The HTML `hidden` boolean attribute is ignored by real Outlook.
13. SVG placeholder in `process()` doesn't match real Outlook's "leaves no
    trace" behavior for `<svg>`.
Two issues are NOT outlook-classic@v1 fidelity gaps, but affect the ground-
truth data itself: (a) `generate-fixtures.mjs` leaks a stray "element" text
into MANY sim screenshots via an unescaped `<title>` (cosmetic noise, not a
real finding, safe to ignore going forward or fix later), and (b)
`capture.ps1` appears to mis-encode non-ASCII/Unicode text, producing
mojibake in 4+ real captures (bdi, rp, rt, ruby) - fix and recapture those
specifically before relying on them. Also noted: ~19 fixtures depend on the
dead `via.placeholder.com` host, making some "MATCH" results uninformative
rather than true fidelity confirmations.

## Confirmed action items (high confidence)
- [ ] NEW BUCKET (batch 18): CSS Custom Properties (`--foo: ...`
      declarations and `var(--foo)` references) are entirely unsupported by
      real Outlook (css-variables fixture) - not covered by any existing
      STRIPPED_DECLARATIONS entry. Needs either resolving `var()` to a
      static value at process()-time or stripping any declaration whose
      value contains `var(`.
- [ ] BUG FIX (highest priority - this actively hurts fidelity, distinct
      from every "add missing declaration" item below): the existing
      `transform` STRIPPED_DECLARATIONS regex (`/transform\s*:[^;]+;?/gi`)
      incorrectly matches the substring "transform:" inside
      `text-transform:`, wrongly stripping a property real Outlook DOES
      support (`text-transform:uppercase` etc). Fix the regex to not match
      when preceded by "text-" (confirmed via css-text-transform).
- [ ] Strip `@keyframes ... {}` blocks entirely from `<style>` in
      outlook-classic@v1 (like stripFontFaceBlocks/stripAtMediaBlocks).
- [ ] Strip `animation`/`animation-*` shorthand+longhand properties (add to
      STRIPPED_DECLARATIONS) so Chromium never runs animations.
- [ ] Add `accent-color`, `caption-side`, `clip-path`, `filter`/
      `-webkit-filter`, `mask-image`/`-webkit-mask-image`, `mix-blend-mode`,
      `opacity`, `outline`(-offset/-color/-style/-width),
      `inset`(-block/-inline too), `text-decoration-color`,
      `text-decoration-style`, `text-shadow`, `text-emphasis`(-position)/
      `-webkit-text-emphasis`, `visibility`, `writing-mode`, and
      `display:\s*inline-block` to STRIPPED_DECLARATIONS (each
      independently confirmed unsupported by real Outlook but currently
      rendered by the sim).
- [ ] Normalize/strip the complex multi-value `text-decoration` shorthand
      (e.g. `underline double #e11d48`) down to nothing or to a bare
      keyword - real Outlook drops the WHOLE declaration when it has
      style+color extensions, but DOES honor a plain single-keyword
      `text-decoration:underline`/`line-through`/`none`.
- [ ] Strip CSS color/gradient/alpha functions used inside any value:
      `linear-gradient`/`radial-gradient`/`conic-gradient`, `light-dark(...)`,
      `oklch(...)`, `rgba(...)`.
- [ ] Strip `border-image`(-*) properties.
- [ ] READY TO IMPLEMENT: strip ALL CSS logical properties as one broad
      category - `(block|inline)-size`, `max/min-(block|inline)-size`,
      `border-(block|inline)...`, `margin-(block|inline)...`,
      `padding-(block|inline)...`, `inset-(block|inline)...`,
      `border-(start|end)-(start|end)-radius`.
- [ ] CONFIRMED: explicit CSS sizing properties (`width`/`height`/
      `max-width`/`min-width`/`max-height`/`min-height`) on plain block
      elements (`<div>`, `<p>`) are NOT reliably honored by real Outlook -
      collapses to content-sized dimensions. Tables (`<table>`/`<td>`)
      DO honor sizing reliably (css-table-layout confirms) - the fix should
      only affect non-table elements.
- [ ] CONFIRMED: elements with `display:flex` OR `position:absolute`/
      `position:relative` in their inline `style` attribute lose their
      ENTIRE style attribute in real Outlook. Confirmed via 4 independent
      fixtures.
- [ ] MAJOR BUCKET, NOW BROADENED: real Outlook's CSS selector matching is
      extremely primitive - CONFIRMED failing (~25 fixtures, zero
      counterexamples): all structural/functional pseudo-classes,
      pseudo-elements (`::before`/`::after`/etc.), combinators (`+`, `>`,
      `~`), attribute selectors (`[attr=val]`), the universal selector
      (`*`), and even basic COMPOUND/chained class selectors
      (`.a.b.c`) - i.e. anything beyond a single simple type/class/ID
      selector. RECOMMENDED FIX APPROACH: rather than enumerating every
      unsupported selector feature, only apply `<style>` rules whose
      selector is a single simple selector (one tag/class/ID, no
      combinators/pseudo/attribute/compound parts) - drop everything else.
      Needs real CSS selector parsing (not flat regex), similar complexity
      to the css-nesting fix.
- [ ] NEW BUCKET, high practical value (batch 23): real Outlook does NOT
      give HTML5 semantic sectioning elements (`<header>`, `<article>`,
      `<section>`, `<aside>`, `<footer>`, likely `<nav>`/`<main>`/
      `<figure>` too) their default `display:block` treatment - content
      runs together on one line with no spacing (html-semantics fixture).
      ACTION: outlook-classic@v1 should explicitly force these elements to
      `display:inline` (unless the fixture's own CSS already sets a
      display value) to match real Outlook's behavior.
- [ ] NEW, capture-side issue (not an outlook-classic@v1 fix): non-ASCII/
      Unicode text (Arabic, CJK) renders as garbled mojibake in real-
      Outlook captures (html-bdi, html-rp, html-rt, html-ruby - 4
      fixtures, consistent pattern) - almost certainly a `capture.ps1`
      encoding bug (UTF-8 not properly set before assigning
      `.HTMLBody`), not a genuine Outlook limitation. Fix capture.ps1's
      encoding handling and recapture affected fixtures rather than
      treating this as an outlook-classic@v1 fidelity gap.
- [ ] NEW (batch 24, final): the SVG placeholder `process()` inserts for
      `<svg>` elements (`[svg unsupported]` dashed-border box) doesn't
      match real Outlook, which leaves NO visual trace of `<svg>` at all.
      Consider removing the element entirely instead of substituting a
      visible placeholder.
- [ ] NEW BUCKET (batch 21): the HTML5 boolean `hidden` attribute is
      completely ignored by real Outlook (content still renders normally) -
      distinct from but analogous to CSS `visibility:hidden` (batch 19,
      also ignored by real Outlook and already tracked for stripping).
      Needs `process()` to strip the `hidden` attribute from elements so
      the sim shows the content too, matching real Outlook.
- [ ] EXPANDED/REFINED: real form controls behave differently by type in
      real Outlook - `<button>`/`<input type="submit">` lose ALL styling
      (bare text), checkbox/radio become `[X]`/`[ ]` bracket placeholders,
      `<textarea>` renders as NOTHING, but plain `<input type="text">`
      renders fairly normally (bordered box). Needs its own dedicated
      comparison pass over the html-input-*/html-button-*/html-select/
      html-textarea/html-form fixtures.
- [ ] NEW, lower priority (harder fix): native CSS nesting (`&` selector
      syntax) inside `<style>` blocks isn't understood by real Outlook -
      likely subsumed by the same selector-parsing work as the bucket above
      (a nested rule's effective selector is itself compound/complex).
- [ ] NEW, unexplained, low priority: css-mix-blend-mode's outer wrapping
      `<div>` background loss, and css-pseudo-class-visited's unexplained
      dark bar artifact. Revisit only if reproduced elsewhere.
- [ ] Low priority / not code: swap `via.placeholder.com` URLs in
      fixture-templates.mjs for a local/data-URI image so image-dependent
      fixtures are deterministic (currently ~19 fixtures silently no-op on
      both sides since the host is dead).
- [ ] CONFIRMED (was "needs investigation" in batch 19): sim renders for
      many html-* fixtures show a stray "element" text artifact caused by
      `generate-fixtures.mjs` interpolating `gimmick.title` unescaped into
      `<title>` - titles like `<abbr> element` contain a raw tag that
      `node-html-parser` mis-parses as nested markup instead of RCDATA,
      leaking " element" into the visible page. FIX: HTML-escape
      `gimmick.title` in generate-fixtures.mjs, or drop the `<title>` tag
      from generated fixtures entirely (its content doesn't affect the
      visible screenshot). Not an outlook-classic@v1 fidelity issue - a
      fixture-generation bug. Expect to see this recur across many more
      html-* fixtures until fixed; no need to keep re-flagging individual
      occurrences now that the cause is understood.
- [ ] NEW, likely a capture.ps1 issue rather than an Outlook fidelity gap
      (see also the broader confirmed pattern logged under batch 23 below):
      html-bdi's real-Outlook capture shows garbled mojibake for Arabic
      text instead of the correct glyphs the sim renders.

## Status
- ALL 236 fixtures reviewed across 24 batches - SURVEY COMPLETE.
- Next step: implement the confirmed action items above (recommend
  starting with the `transform`/`text-transform` bug fix, then the
  straightforward STRIPPED_DECLARATIONS additions, then the logical-
  properties and sizing-on-non-table-elements rules, then the harder
  selector-parsing-based fixes for pseudo-classes/pseudo-elements/
  combinators/nesting, then the forms/semantic-elements/hidden-attribute
  fixes). Re-run `seamail test -u --config seamail.config.ts` from
  tools/outlook-ground-truth/ after each round of fixes and re-compare
  against captures/ to verify improvement.
- See /memories/session/gimmick-fixture-order.md for the full numbered list
  and file paths.
