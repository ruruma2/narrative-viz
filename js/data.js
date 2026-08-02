// loads the three source files and derives the series each scene needs
(function () {
  'use strict';

  var parseMonth = d3.timeParse('%Y-%m-%d');

  function sameMonth(a, b) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  }

  function findMonth(rows, date) {
    return rows.find(function (r) { return sameMonth(r.month, date); });
  }

  NV.load = function () {
    return Promise.all([
      d3.csv('data/us-employment.csv', function (d) {
        var row = { month: parseMonth(d.month), nonfarm: +d.nonfarm, nonfarm_change: +d.nonfarm_change };
        NV.SECTORS.forEach(function (s) { row[s.key] = +d[s.key]; });
        return row;
      }),
      d3.tsv('data/county-unemployment.tsv', function (d) {
        return { id: String(d.id).padStart(5, '0'), rate: +d.rate };
      }),
      d3.json('data/counties-albers-10m.json')
    ]).then(function (res) {
      var employment = res[0];
      var rates = res[1];
      var topology = res[2];

      employment.sort(function (a, b) { return a.month - b.month; });

      var peakRow = findMonth(employment, NV.DATES.peak);
      var troughRow = findMonth(employment, NV.DATES.trough);
      var lastRow = employment[employment.length - 1];

      // scene 2: peak -> trough change, in jobs and in percent
      var peakToTrough = NV.SECTORS.map(function (s) {
        var a = peakRow[s.key];
        var b = troughRow[s.key];
        return {
          key: s.key,
          label: s.label,
          short: s.short,
          start: a,
          end: b,
          jobs: b - a,
          percent: (b / a - 1) * 100,
          share: 0
        };
      });
      var totalLost = d3.sum(peakToTrough, function (d) { return d.jobs < 0 ? d.jobs : 0; });
      peakToTrough.forEach(function (d) { d.share = d.jobs < 0 ? d.jobs / totalLost : 0; });

      // scene 3: rebase everything to Jan 2008 = 100
      var indexed = {};
      NV.SECTORS.forEach(function (s) {
        var base = peakRow[s.key];
        indexed[s.key] = employment.map(function (r) {
          return { month: r.month, value: r[s.key], index: (r[s.key] / base) * 100 };
        });
      });

      // summary used by the annotations and the readout panel
      var sectorStats = {};
      NV.SECTORS.forEach(function (s) {
        var series = indexed[s.key];
        var afterPeak = series.filter(function (p) { return p.month >= NV.DATES.peak; });
        var low = afterPeak.reduce(function (m, p) { return p.index < m.index ? p : m; }, afterPeak[0]);
        sectorStats[s.key] = {
          key: s.key,
          label: s.label,
          short: s.short,
          peakJobs: peakRow[s.key],
          troughDate: low.month,
          troughIndex: low.index,
          troughJobs: low.value,
          maxDrawdownPct: low.index - 100,
          endIndex: series[series.length - 1].index,
          endJobs: lastRow[s.key],
          netJobs: lastRow[s.key] - peakRow[s.key],
          netPct: (lastRow[s.key] / peakRow[s.key] - 1) * 100,
          recovered: series.some(function (p) { return p.month > low.month && p.index >= 100; })
        };
      });

      // scene 4: join rates onto the topology by 5 digit FIPS, add state names
      var counties = topojson.feature(topology, topology.objects.counties);
      var states = topojson.feature(topology, topology.objects.states);
      var stateName = {};
      states.features.forEach(function (f) { stateName[f.id] = f.properties.name; });

      var rateById = new Map(rates.map(function (r) { return [r.id, r.rate]; }));
      counties.features.forEach(function (f) {
        f.properties.rate = rateById.has(f.id) ? rateById.get(f.id) : null;
        f.properties.stateName = stateName[String(f.id).slice(0, 2)] || '';
      });

      var withRate = counties.features.filter(function (f) { return f.properties.rate !== null; });

      NV.data = {
        employment: employment,
        peakRow: peakRow,
        troughRow: troughRow,
        lastRow: lastRow,
        peakToTrough: peakToTrough,
        indexed: indexed,
        sectorStats: sectorStats,
        topology: topology,
        counties: counties,
        countiesWithRate: withRate,
        stateMesh: topojson.mesh(topology, topology.objects.states, function (a, b) { return a !== b; }),
        nation: topojson.feature(topology, topology.objects.nation),
        countyById: new Map(counties.features.map(function (f) { return [f.id, f]; })),
        rateExtent: d3.extent(withRate, function (f) { return f.properties.rate; })
      };

      return NV.data;
    });
  };

  NV.findMonth = findMonth;
})();
