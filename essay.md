# The narrow recession: essay

**URL:** https://ruruma2.github.io/narrative-viz/

---

## Messaging

The message is that the 2008 recession was narrow, not broad, and that the recovery went to a
different economy than the one that shrank.

The headline number, 8.7 million payroll jobs lost between January 2008 and February 2010, invites
the reading that the downturn happened to everyone at once. It did not. Construction and
manufacturing alone account for 44 percent of every job lost, from a base that was only about 15
percent of total employment. Education and health services never recorded a single down month and
finished the period 17.6 percent larger. Eight years after the peak, construction was still 11.3
percent short of where it started. When the same period is drawn as geography rather than as
industry, the dark counties are the auto belt, the textile and furniture South, and the inland
farm and construction counties of California and Arizona, which is the industry story again in a
different projection.

So the visualization argues three linked claims in order: the aggregate hole was deep and slow to
fill; the hole was concentrated in a few industries; and those industries were concentrated in
particular places. The closing line of the argument is that the country got its job count back in
May 2014 but did not get the same jobs back.

## Narrative structure

The visualization follows an **interactive slide show**.

The four scenes run in a fixed order and each carries a written argument in the side rail, so the
author's path through the data is always the primary one. Within each scene, however, the reader is
given exploration that is scoped to the point that scene is making, and the scope widens as the story
progresses:

- Scene 1 allows inspection only. There are no filters, because the point of the first scene is the
  shape of the aggregate before it gets taken apart.
- Scene 2 adds a parameter that changes the argument, the choice between counting the fall in jobs
  and counting it in percent, plus selection of an individual supersector.
- Scene 3 adds focus, letting the reader pull any one of the eleven supersectors forward and rewrite
  the annotations around it.
- Scene 4 hands over the most control. The reader sets the threshold that defines what counts as hard
  hit and can read any of 3,134 counties.

This widening is deliberate. A martini glass would have withheld all interaction until the end, which
would waste the fact that scenes 2 and 3 are genuinely more persuasive when the reader operates them
personally, in particular the measure toggle in scene 2. A drill down story would have opened with an
overview and let the reader choose a branch, but this argument is a chain rather than a menu: the
industry finding in scene 2 is what makes the geography in scene 4 mean anything, and reading them out
of order would break the causal claim.

The reader can still move freely. The stepper at the top of the page is always active, the Back and
Next buttons persist, and the left and right arrow keys page through the scenes. Parameters set in one
scene survive into the others, so backtracking never destroys work.

## Visual structure

Every scene is a **statistical plate**: a bordered figure on a fine ruled grid, with the chart drawn
in a single ink weight, a body face for names and prose, and a monospace face with tabular figures for
every number. This template is what makes four different chart types read as one publication. The
frame around the plate, the caption underneath, the side rail to the right, and the position of the
stepper above never move between scenes.

Colour is strictly semantic and is the main highlighting device. Oxide red means jobs were lost, pine
teal means jobs were gained, and amber is reserved entirely for annotations and the measuring rule.
Nothing is coloured for decoration. In scene 3, the eleven supersector lines are drawn in a light grey
by default and only the lines the scene is arguing about take a colour, so the reader's eye is pulled
to the story without the other ten lines being hidden. In scene 4, the counties below the reader's
threshold fade back to 22 percent opacity while the ones above it keep full saturation and take a thin
ink outline, which turns the slider into a highlighting instrument rather than a filter that destroys
context.

The shared time frame is what carries the reader between scenes. Scenes 1 and 3 use exactly the same
plot rectangle, the same x scale from January 2006 to December 2015, the same year ticks in the same
positions, and the same faint NBER recession band from December 2007 to June 2009. When the reader
moves from scene 1 to scene 3, the x axis does not move, so the fanning out of the sector lines can be
compared directly against the aggregate line they just left. Scene 2 sits between them as the bridge:
its two endpoints, January 2008 and February 2010, are exactly the two dates annotated in scene 1, so
the bars are legibly a decomposition of the drop the reader has already been shown. Scene 4 changes
projection entirely, from time to space, and the side rail prose names the handoff explicitly: scene 2
named the industries, scene 4 shows where those industries lived.

The signature device is a **measuring rule**, an amber surveyor's bracket with end ticks laid between
January 2008 and May 2014 in scene 1 and labelled "76 months to get back to even". It is the one bold
element on the page and it states the thesis of the first scene without prose. Scene 3 rhymes with it
by laying the same amber label style against the index line at 100.

Reading is supported by a persistent readout panel in the side rail, which shows a summary of the
scene when nothing is hovered and switches to the hovered or selected item's exact figures when
something is. Every number in it is set in tabular monospace so the digits align down the column.

## Scenes

**Scene 1, "The hole".** Total nonfarm payroll employment, monthly, January 2006 to December 2015,
as a single line with a dashed reference rule at the January 2008 level and the 76 month measuring
rule above it.

**Scene 2, "Who fell".** Change in employment by supersector between January 2008 and February 2010,
as diverging horizontal bars sorted by the current measure, with a heavy zero line.

**Scene 3, "Who came back".** All eleven supersectors indexed so that January 2008 equals 100, run
through December 2015, with the December 2015 index labelled at the end of every line.

**Scene 4, "Where it landed".** A county choropleth of unemployment rates at levels generally
consistent with 2009, drawn from a TopoJSON US Atlas boundary file.

The order is an argument rather than a sequence of topics. Scene 1 establishes the fact everybody
already believes, which is that the recession was enormous, and does it in the single number that
journalism uses. Scene 2 then breaks that number apart, which is the only place the surprise can land,
because the reader has to accept the aggregate before the decomposition means anything. Scene 3 runs
the same eleven categories forward past the trough, and is placed third because the recovery claim
depends on the reader already knowing which categories fell; showing the indexed lines first would be
eleven lines with no reason to care about any of them. Scene 4 is last because it is the payoff and
because it is where the visualization stops arguing and hands over control. Ending on the map also
lets the reader test the claim personally, county by county, which is a stronger close than one more
assertion.

## Annotations

**The template.** Every annotation in every scene has the same four parts in the same order: a mark on
the data item, a leader line, a short title in amber monospace small caps that names the moment, and
one sentence in the body face that says why it matters. Notes carry a near opaque plate background so
they stay legible over gridlines and over the map. All of this is produced by one function,
`NV.annotate`, in `js/annotations.js`, which every scene calls, so consistency is enforced by the code
rather than by discipline.

Only one thing varies, and it varies for a reason: the cartesian scenes use `d3.annotationCalloutElbow`,
whose leader runs along the grid, while the map uses `d3.annotationCalloutCircle`, because on a map the
subject is an area rather than a point and a circle is the honest way to say "this region" instead of
"this pixel". The template was chosen for this split. A callout with a titled note is the smallest
annotation form that can carry both a label and a claim, and the elbow leader lets a note be placed in
empty plate a long way from a crowded data region without the reader losing track of what it points
at, which matters in scene 3 where eleven lines converge.

**How they support the message.** The annotations carry the argument, not decoration of it. Scene 1
annotates exactly the three dates the story turns on, the peak, the trough and the return, so the
reader leaves with the cycle in three numbers. Scene 2 annotates the two extremes of the
decomposition, construction and education and health, because the contrast between them is the claim.
Scene 3 annotates the same two categories at December 2015, which is the moment the "different
economy" claim is settled. Scene 4 annotates one county and two states, chosen because each is a named
instance of a mechanism already established: Imperial County for construction and farm labour,
Michigan for the manufacturing losses of scene 2, South Carolina for the textile and furniture South.

**Do they change within a scene?** In two scenes, yes, and in both cases the change is driven by a
parameter.

In scene 2, the two annotations keep their subjects but their placement is computed from the scales at
render time rather than hard coded, so when the reader flips from jobs to percent and the bars re sort
underneath them, both notes follow their bars into the new ordering and stay inside the frame. The
construction note also rewrites its sentence, because in percent the interesting statement is "one in
four construction jobs" and in jobs it is "just under 2.0 million from an industry of only 7.5
million".

In scene 3 the annotations are replaced outright. With no focus set, the scene shows two annotations
arguing the contrast between construction and education and health. As soon as the reader focuses a
supersector, those two are removed and two new ones appear on the focused line, reporting its own low
point and its own December 2015 position, with the sentence chosen by whether the sector finished
above or below its 2008 level. The annotation layer is therefore a function of the focus parameter in
the same way the lines are, which keeps the guided reading available at every state of the scene
rather than only the default one.

Scenes 1 and 4 hold their annotations fixed. In scene 1 there is no parameter for them to respond to,
and in scene 4 the three regional annotations are deliberately independent of the threshold slider, so
that the guided reading stays in place underneath the reader's exploration and does not disappear when
they drag the control.

## Parameters

The state of the visualization is fully described by `NV.state` in `js/main.js`. Scene functions keep
no state of their own; they are functions of `(state, data)` and are re-executed from scratch whenever
any parameter changes.

| Parameter | Range | Role |
| --- | --- | --- |
| `scene` | 1 to 4 | which step of the story is on screen |
| `measure` | `'jobs'`, `'percent'` | how scene 2 counts the fall |
| `selectedSector` | supersector key or `null` | the bar the reader picked in scene 2 |
| `focusSector` | supersector key or `null` | the line scene 3 pulls forward |
| `threshold` | 0.04 to 0.25 | the county rate scene 4 treats as hard hit |
| `visited` | set of scene ids | which scenes have been seen, used by the stepper |

A **state** of the visualization is one complete assignment of these six. `scene` selects which render
function runs and therefore which chart type, scales and copy appear. The remaining parameters shape
the scene they belong to: `measure` chooses the value accessor, the axis format and the sort order in
scene 2, and also selects which of two sentences the construction annotation uses; `selectedSector`
controls the selected bar outline, the readout contents and whether the "follow into scene 3" button
exists; `focusSector` decides which line in scene 3 is drawn in colour at triple weight while the rest
fall back to grey, and it chooses between the two entirely different annotation sets described above;
`threshold` decides which counties keep full saturation and drives the counts in the readout.

Parameters persist across scene changes rather than resetting, which is what allows scene 2 and scene
3 to be coupled. Selecting manufacturing in scene 2 and pressing the follow button writes
`focusSector` and then moves `scene` to 3, so the reader arrives in the next scene with their own
choice already applied.

## Triggers

Every user action funnels into a single function, `NV.set(patch)`, which writes the new parameter
values and calls `NV.render()`. There is no other path by which the state can change, which is what
keeps the scenes consistent no matter which control was used.

| Trigger | Event | Parameter changed | Affordance offered to the reader |
| --- | --- | --- | --- |
| Stepper tabs | `click` | `scene` | Four labelled tabs across the top, numbered "Scene 01" to "Scene 04", with the current one inverted to solid ink and visited ones marked |
| Back and Next | `click` | `scene` | Persistent buttons in the side rail; Back is disabled on scene 1 and Next reads "End of the story" on scene 4 |
| Arrow keys | `keydown` | `scene` | Standard slide show convention; ignored while a form control has focus so the slider still works |
| Jobs / Percent | `click` | `measure` | A two segment toggle under the label "Measure the fall in", with the active segment filled |
| Bar selection | `click` on a full width row target | `selectedSector` | Pointer cursor on the row, plus a tooltip line reading "Click to carry into scene 3"; the figure caption states it too |
| Follow into scene 3 | `click` | `focusSector` and `scene` | An amber button that appears only once a bar is selected, naming the chosen industry |
| Sector chips | `click` | `focusSector` | Eleven labelled chips under "Pull one supersector forward", each with a colour swatch showing whether that sector finished above or below its 2008 level; the active chip inverts |
| Line selection | `click` on a wide transparent stroke over each line | `focusSector` | Pointer cursor on every line, plus a tooltip line reading "Click to pull this line forward" |
| Clear focus | `click` | `focusSector` to `null` | A "Show the contrast again" button that appears only while a focus is set; clicking an active chip also clears it |
| Threshold slider | `input` and `change` | `threshold` | A range input under "Highlight counties at or above", with the current value shown in large monospace beside it and a caret marker on the map legend that sits at the same value |
| Hover readouts | `mousemove` and `mouseleave` | none | The side rail readout carries a standing hint naming what hovering will do in that scene, and every scene's figure caption repeats it |

The hover interactions are deliberately kept out of the parameter set. They write to the tooltip and
the readout panel directly rather than through `NV.set`, because they are transient inspection rather
than a change of state, and routing them through a full re-render would be both wrong and slow. The
threshold slider is a hybrid for the same reason: while it is being dragged it updates the map by
toggling classes on the county paths and rewrites the readout, and it commits the value to
`NV.state.threshold` only on `change`, so dragging stays smooth across 3,142 paths while the parameter
still persists if the reader leaves the scene and comes back.

## Sources

Payroll employment by supersector, seasonally adjusted, monthly, January 2006 to December 2015: U.S.
Bureau of Labor Statistics, Current Employment Statistics. County unemployment rates at levels
generally consistent with 2009: U.S. Bureau of Labor Statistics, Local Area Unemployment Statistics.
Both redistributed through the vega-datasets collection. BLS cannot vouch for analyses derived from
its data after retrieval. County boundaries: TopoJSON US Atlas, derived from U.S. Census Bureau
cartographic boundary files. Recession dating: National Bureau of Economic Research.

Built with D3 v7.9.0, d3-annotation 2.5.1 and topojson-client 3.1.0, all served from the project
repository. No other visualization library is used.
