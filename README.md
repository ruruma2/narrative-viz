# The narrow recession

A narrative visualization of U.S. payroll employment, 2006 to 2015, built with D3.

**Message.** The 2008 recession cost 8.7 million payroll jobs, but the losses were narrow rather than
broad. Construction and manufacturing absorbed 44 percent of them, education and health never had a
down month, and the places that fell hardest were the counties that made things and built things. The
country got its job count back in May 2014. It did not get the same jobs back.

Four scenes, structured as an interactive slide show.

| Scene | Chart | What the reader can do |
| --- | --- | --- |
| 1. The hole | Total nonfarm payrolls, monthly line | Inspect any of the 120 months |
| 2. Who fell | Diverging bars, peak to trough by supersector | Switch between jobs and percent, select a supersector |
| 3. Who came back | Eleven lines indexed to Jan 2008 = 100 | Pull any supersector forward, inspect any month |
| 4. Where it landed | County choropleth of unemployment rates | Set the hard hit threshold, read any of 3,134 counties |

## Running it locally

The page loads three data files with `fetch`, so it will not work from `file://`. Serve the folder:

```bash
cd narrative-viz
python3 -m http.server 8000
# open http://localhost:8000
```

## Publishing to GitHub Pages

1. Create a new public repository on GitHub, for example `narrative-viz`.
2. From this folder:

   ```bash
   git init
   git add .
   git commit -m "Narrative visualization: the narrow recession"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/narrative-viz.git
   git push -u origin main
   ```

3. On GitHub, open **Settings**, then **Pages**. Under **Build and deployment**, set **Source** to
   *Deploy from a branch*, choose branch `main` and folder `/ (root)`, then click **Save**.
4. Wait for the first build (a minute or two). The site will be live at
   `https://YOUR-USERNAME.github.io/narrative-viz/`. That URL is what gets submitted.

If the page loads but the charts do not appear, open the browser console. The most common cause is a
case mismatch in a path, since GitHub Pages is case sensitive and most local filesystems are not.

## Structure

```
index.html              page shell, side rail, stepper, colophon
css/style.css           the visual identity, all colour and type tokens
js/config.js            palette, supersector list, key dates, scene registry, formatters
js/data.js              loads the three sources once, derives every series the scenes need
js/util.js              shared drawing helpers: svg frame, recession band, tooltip, readout
js/annotations.js       the single annotation template used by all four scenes
js/scene1.js ... scene4.js
js/main.js              parameters, triggers, scene dispatch
lib/                    d3 v7.9.0, d3-annotation 2.5.1, topojson-client 3.1.0
data/                   us-employment.csv, county-unemployment.tsv, counties-albers-10m.json
essay.md                the required essay
```

The three libraries are vendored into `lib/` rather than loaded from a CDN, so the page keeps working
if a CDN is unreachable. No other visualization library is used, as required.

Note on `d3-annotation` with D3 v7: the library's only uses of the removed `d3.event` API are inside
its drag handlers, which are attached only when `editMode` is on. This project never enables edit
mode, so the static annotations render correctly under v7.

## Data

**Payroll employment.** U.S. Bureau of Labor Statistics, Current Employment Statistics. Monthly,
seasonally adjusted, in thousands, January 2006 to December 2015. The eleven supersectors used here
sum to total nonfarm payrolls; the broader aggregates in the file (`private`, `goods_producing`,
`service_providing`, `private_service_providing`) are deliberately excluded because they are roll ups
of those eleven and would double count.

**County unemployment.** U.S. Bureau of Labor Statistics, Local Area Unemployment Statistics. Rates
at levels generally consistent with 2009. 3,134 of the 3,142 counties in the boundary file carry a
rate; the eight without one are drawn in grey. Puerto Rico appears in the source file but not in the
boundary file, so it is not mapped.

Both series are redistributed through the [vega-datasets](https://github.com/vega/vega-datasets)
collection. BLS cannot vouch for analyses derived from its data after retrieval.

**Boundaries.** [TopoJSON US Atlas](https://github.com/topojson/us-atlas) `counties-albers-10m.json`,
derived from U.S. Census Bureau cartographic boundary files. The file is already projected into an
Albers USA layout, so scene 4 draws it with `d3.geoPath().projection(null)`.

## Key figures, all computed from the source files

| Figure | Value |
| --- | --- |
| Payroll peak | January 2008, 138.42 million |
| Payroll trough | February 2010, 129.73 million |
| Jobs lost | 8.69 million, down 6.3 percent |
| Worst single month | March 2009, down 802,000 |
| Back above the peak | May 2014, 76 months later |
| Construction, peak to trough | down 26.4 percent, 1.98 million jobs |
| Manufacturing, peak to trough | down 16.6 percent, 2.27 million jobs |
| Education and health, peak to trough | up 861,000, no down month |
| Construction at December 2015 | still 11.3 percent below January 2008 |
| Education and health at December 2015 | 17.6 percent above January 2008 |
| Median county unemployment rate | 8.4 percent |
| Highest county | Imperial County, California, 30.1 percent |
| Highest statewide median | South Carolina, 13.8 percent |
