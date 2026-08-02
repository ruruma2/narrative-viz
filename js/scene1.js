// scene 1: total nonfarm payrolls, 2006-2015
(function () {
  'use strict';

  NV.scene1 = function (state, data) {
    var s = NV.util.stage();
    var g = s.plot;

    var rows = data.employment;
    var peakVal = data.peakRow.nonfarm;
    var troughVal = data.troughRow.nonfarm;
    var recoveredRow = NV.findMonth(rows, NV.DATES.recovered);

    var x = d3.scaleTime()
      .domain(d3.extent(rows, function (d) { return d.month; }))
      .range([0, s.w]);

    var y = d3.scaleLinear()
      .domain([126000, 144500])
      .range([s.h, 0]);

    /* ---------------------------------------------------------------- frame */

    NV.util.yGrid(g, y, s.w, 7);
    NV.util.recessionBand(g, x, s.h);

    g.append('g').attr('class', 'axis')
      .attr('transform', 'translate(0,' + s.h + ')')
      .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)).tickFormat(NV.fmt.year).tickSizeOuter(0));

    g.append('g').attr('class', 'axis')
      .call(d3.axisLeft(y)
        .tickValues(d3.range(128000, 145000, 2000))
        .tickFormat(function (v) { return (v / 1000).toFixed(0) + 'M'; })
        .tickSize(0));

    NV.util.axisTitle(g, 'Payroll jobs, seasonally adjusted', -66, -14);

    // dashed rule at the Jan 2008 peak level
    g.append('line')
      .attr('class', 'reference-line')
      .attr('x1', 0).attr('x2', s.w)
      .attr('y1', y(peakVal)).attr('y2', y(peakVal));

    g.append('text')
      .attr('class', 'axis-label')
      .attr('x', s.w + 6).attr('y', y(peakVal) + 4)
      .text('Jan 2008 level');

    // measuring rule between the peak and the month payrolls got back to it

    var ruleY = y(peakVal) - 22;
    var rx0 = x(NV.DATES.peak);
    var rx1 = x(NV.DATES.recovered);
    var rule = g.append('g').attr('class', 'measure-rule');

    rule.append('line').attr('class', 'rule-line')
      .attr('x1', rx0).attr('x2', rx1).attr('y1', ruleY).attr('y2', ruleY);
    [rx0, rx1].forEach(function (px) {
      rule.append('line').attr('class', 'rule-tick')
        .attr('x1', px).attr('x2', px).attr('y1', ruleY - 6).attr('y2', y(peakVal));
    });

    var ruleMid = (rx0 + rx1) / 2;
    var ruleText = rule.append('text').attr('class', 'rule-text')
      .attr('x', ruleMid).attr('y', ruleY + 4).attr('text-anchor', 'middle')
      .text('76 months to get back to even');

    // measure the label instead of guessing, so the knockout fits whatever font loads
    var tb = ruleText.node().getBBox();
    rule.insert('rect', 'text')
      .attr('class', 'rule-text-bg')
      .attr('x', tb.x - 7).attr('y', tb.y - 2)
      .attr('width', tb.width + 14).attr('height', tb.height + 4);

    /* ---------------------------------------------------------------- line */

    var line = d3.line()
      .x(function (d) { return x(d.month); })
      .y(function (d) { return y(d.nonfarm); });

    g.append('path').datum(rows).attr('class', 'series-line').attr('d', line);

    // dots on the three dates the story turns on
    var marks = [
      { m: NV.DATES.peak, v: peakVal },
      { m: NV.DATES.trough, v: troughVal },
      { m: NV.DATES.recovered, v: recoveredRow.nonfarm }
    ];
    g.selectAll('circle.turn').data(marks).enter().append('circle')
      .attr('class', 'turn')
      .attr('cx', function (d) { return x(d.m); })
      .attr('cy', function (d) { return y(d.v); })
      .attr('r', 4)
      .attr('fill', NV.color.plate)
      .attr('stroke', NV.color.ink)
      .attr('stroke-width', 2);

    /* --------------------------------------------------------- annotations */

    NV.annotate(g, [
      {
        x: x(NV.DATES.peak), y: y(peakVal),
        dx: 14, dy: -30, wrap: 148, align: 'left',
        title: 'Jan 2008 / peak',
        label: '138.4 million payroll jobs, the highest count the country had ever recorded.'
      },
      {
        x: x(NV.DATES.trough), y: y(troughVal),
        dx: 60, dy: 8, wrap: 200, align: 'left',
        title: 'Feb 2010 / trough',
        label: '129.7 million. Down 8.7 million jobs in 25 months, a fall of 6.3 percent.'
      },
      {
        x: x(NV.DATES.recovered), y: y(recoveredRow.nonfarm),
        dx: 34, dy: 104, wrap: 150, align: 'left',
        title: 'May 2014 / back to even',
        label: 'Payrolls clear the January 2008 line again. The country waited more than six years.'
      }
    ]);

    /* --------------------------------------------------- free exploration */

    var guide = g.append('g').style('display', 'none');
    var guideLine = guide.append('line').attr('class', 'hover-guide').attr('y1', 0).attr('y2', s.h);
    var guideDot = guide.append('circle').attr('class', 'hover-dot').attr('r', 5);

    var bisect = d3.bisector(function (d) { return d.month; }).center;

    g.append('rect')
      .attr('width', s.w).attr('height', s.h)
      .attr('fill', 'transparent')
      .on('mousemove', function (event) {
        var mx = d3.pointer(event, this)[0];
        var row = rows[bisect(rows, x.invert(mx))];
        if (!row) return;
        guide.style('display', null);
        guideLine.attr('x1', x(row.month)).attr('x2', x(row.month));
        guideDot.attr('cx', x(row.month)).attr('cy', y(row.nonfarm));

        var vsPeak = row.nonfarm - peakVal;
        NV.util.tipShow(
          '<span class="tt-title">' + NV.fmt.monthYear(row.month) + '</span>' +
          '<span class="tt-row"><span>Payroll jobs</span><span>' + NV.fmt.thousandsToMillions(row.nonfarm) + '</span></span>' +
          '<span class="tt-row"><span>Month over month</span><span>' + NV.fmt.signedJobs(row.nonfarm_change) + '</span></span>' +
          '<span class="tt-row"><span>Versus Jan 2008</span><span>' + NV.fmt.signedJobs(vsPeak) + '</span></span>',
          event);

        NV.util.readout(NV.fmt.monthYear(row.month), [
          ['Payroll jobs', NV.fmt.thousandsToMillions(row.nonfarm)],
          ['Change on the month', NV.fmt.signedJobs(row.nonfarm_change), NV.util.tone(row.nonfarm_change)],
          ['Versus Jan 2008 peak', NV.fmt.signedJobs(vsPeak), NV.util.tone(vsPeak)]
        ]);
      })
      .on('mouseleave', function () {
        guide.style('display', 'none');
        NV.util.tipHide();
        resetReadout();
      });

    function resetReadout() {
      NV.util.readout('The cycle in three dates', [
        ['Peak, Jan 2008', NV.fmt.thousandsToMillions(peakVal)],
        ['Trough, Feb 2010', NV.fmt.thousandsToMillions(troughVal), 'loss'],
        ['Jobs lost', NV.fmt.signedJobs(-NV.FACTS.lostJobs), 'loss'],
        ['Worst single month', 'Mar 2009'],
        ['Back to even', 'May 2014']
      ], 'Move across the chart to read any month.');
    }
    resetReadout();

    /* ------------------------------------------------------- copy and note */

    NV.util.prose(
      '<p>Total nonfarm payrolls are the number economists reach for when they want one number ' +
      'for the labour market. Read on its own it tells a simple story: a long climb, a cliff, ' +
      'a long climb back.</p>' +
      '<p>The fall was <span class="num">8.69 million</span> jobs. The worst single month was ' +
      'March 2009, when payrolls dropped by <span class="num">802,000</span>. The climb back took ' +
      '<span class="num">76 months</span>, longer than the fall itself by a factor of three.</p>' +
      '<p>That is the aggregate. It is also the last point in this story at which the recession ' +
      'looks like it happened to everyone.</p>'
    );

    NV.util.figureNote(
      'Total nonfarm payroll employment, seasonally adjusted, monthly. Shaded band marks the NBER ' +
      'recession, December 2007 to June 2009. Source: U.S. Bureau of Labor Statistics, Current ' +
      'Employment Statistics.'
    );

    NV.util.controls().append('p')
      .attr('class', 'readout-hint')
      .text('Scene 1 has no filters. Hover the chart to inspect any of the 120 months in the series.');
  };
})();
