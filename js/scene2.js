// scene 2: change by supersector, Jan 2008 -> Feb 2010
(function () {
  'use strict';

  var FRAME = {
    width: 960,
    height: 520,
    margin: { top: 34, right: 92, bottom: 56, left: 236 }
  };
  FRAME.inner = {
    w: FRAME.width - FRAME.margin.left - FRAME.margin.right,
    h: FRAME.height - FRAME.margin.top - FRAME.margin.bottom
  };

  NV.scene2 = function (state, data) {
    var s = NV.util.stage(FRAME);
    var g = s.plot;
    var measure = state.measure;               // 'jobs' or 'percent'
    var isPct = measure === 'percent';

    var rows = data.peakToTrough.slice().sort(function (a, b) {
      return a[measure] - b[measure];
    });

    var vals = rows.map(function (d) { return d[measure]; });
    var lo = d3.min(vals);
    var hi = d3.max(vals);
    var pad = (hi - lo) * 0.14;

    var x = d3.scaleLinear().domain([lo - pad, hi + pad]).nice().range([0, s.w]);
    var yb = d3.scaleBand().domain(rows.map(function (d) { return d.key; }))
      .range([0, s.h]).paddingInner(0.34).paddingOuter(0.12);

    var fmtVal = isPct ? NV.fmt.signedPct : NV.fmt.signedJobs;

    /* ---------------------------------------------------------------- frame */

    g.append('g').attr('class', 'grid')
      .selectAll('line').data(x.ticks(8)).enter().append('line')
      .attr('class', 'gridline')
      .attr('y1', 0).attr('y2', s.h)
      .attr('x1', x).attr('x2', x);

    g.append('g').attr('class', 'axis')
      .attr('transform', 'translate(0,' + s.h + ')')
      .call(d3.axisBottom(x).ticks(8).tickFormat(function (v) {
        return isPct ? v + '%' : (v === 0 ? '0' : (v / 1000).toFixed(1) + 'M');
      }).tickSizeOuter(0));

    NV.util.axisTitle(g,
      isPct ? 'Percent change, Jan 2008 to Feb 2010' : 'Change in jobs, Jan 2008 to Feb 2010',
      0, -14);

    /* ----------------------------------------------------------------- bars */

    var bw = yb.bandwidth();

    var bars = g.selectAll('g.row').data(rows, function (d) { return d.key; })
      .enter().append('g')
      .attr('class', 'row')
      .attr('transform', function (d) { return 'translate(0,' + yb(d.key) + ')'; });

    bars.append('rect')
      .attr('class', function (d) { return 'bar' + (state.selectedSector === d.key ? ' is-selected' : ''); })
      .attr('x', function (d) { return Math.min(x(0), x(d[measure])); })
      .attr('y', 0)
      .attr('width', function (d) { return Math.abs(x(d[measure]) - x(0)); })
      .attr('height', bw)
      .attr('fill', function (d) { return d[measure] < 0 ? NV.color.loss : NV.color.gain; });

    // names in the body face, numbers in mono
    bars.append('text')
      .attr('class', 'cat-label')
      .attr('x', -12).attr('y', bw / 2 + 4)
      .attr('text-anchor', 'end')
      .attr('font-weight', function (d) { return state.selectedSector === d.key ? 600 : 400; })
      .text(function (d) { return d.label; });

    bars.append('text')
      .attr('class', 'value-label')
      .attr('x', function (d) { return x(d[measure]) + (d[measure] < 0 ? -8 : 8); })
      .attr('y', bw / 2 + 4)
      .attr('text-anchor', function (d) { return d[measure] < 0 ? 'end' : 'start'; })
      .attr('fill', function (d) { return d[measure] < 0 ? NV.color.loss : NV.color.gain; })
      .text(function (d) { return fmtVal(d[measure]); });

    // drawn last so it sits on top of the bars
    g.append('line').attr('class', 'zero-line')
      .attr('x1', x(0)).attr('x2', x(0)).attr('y1', -4).attr('y2', s.h);

    /* --------------------------------------------------------- annotations */
    var WRAP = 200;

    // notes go right of the zero line. loss bars point left and put their value
    // label left of the tip, so that half is always clear. pick the vertical band
    // explicitly, otherwise the notes jump around when the measure flips.
    function anchor(key, preferTop) {
      var d = rows.find(function (r) { return r.key === key; });
      var rowY = yb(d.key) + bw / 2;
      var H = 88;

      var ax = x(0) + 52;
      ax = Math.min(ax, s.w + FRAME.margin.right - 14 - WRAP);
      ax = Math.max(ax, 8);

      var minTop = -FRAME.margin.top + 8;
      var maxTop = s.h + FRAME.margin.bottom - 8 - H;
      var top = Math.max(minTop, Math.min(maxTop, preferTop));

      var dy;
      if (rowY <= top) dy = top - rowY;                       // note below the bar
      else if (rowY >= top + H) dy = (top + H) - rowY;        // note above the bar
      else if (rowY - H - 10 >= minTop) dy = -10;             // tuck it above
      else dy = 10;                                           // otherwise just below

      return {
        x: x(d[measure]),
        y: rowY,
        dx: ax - x(d[measure]),
        dy: dy,
        align: 'left',
        wrap: WRAP
      };
    }

    var con = anchor('construction', 30);
    var edu = anchor('education_and_health_services', 260);

    NV.annotate(g, [
      Object.assign(con, {
        title: 'Construction',
        label: isPct
          ? 'One in four construction jobs went with the housing boom that had created them.'
          : 'Just under 2.0 million jobs, from an industry that employed only 7.5 million to begin with.'
      }),
      Object.assign(edu, {
        title: 'Education and health',
        label: 'The one supersector with no down cycle at all. It added 861,000 jobs while everything around it fell.'
      })
    ]);

    /* --------------------------------------------------- free exploration */

    bars.append('rect')
      .attr('class', 'bar-hit')
      .attr('x', -FRAME.margin.left).attr('y', -yb.step() * 0.17)
      .attr('width', FRAME.margin.left + s.w).attr('height', yb.step())
      .on('mousemove', function (event, d) {
        NV.util.tipShow(
          '<span class="tt-title">' + d.label + '</span>' +
          '<span class="tt-row"><span>Jan 2008</span><span>' + NV.fmt.jobs(d.start) + '</span></span>' +
          '<span class="tt-row"><span>Feb 2010</span><span>' + NV.fmt.jobs(d.end) + '</span></span>' +
          '<span class="tt-row"><span>Change</span><span>' + NV.fmt.signedJobs(d.jobs) + '</span></span>' +
          '<span class="tt-row"><span>Percent</span><span>' + NV.fmt.signedPct(d.percent) + '</span></span>' +
          '<span class="tt-note">Click to carry into scene 3</span>',
          event);
      })
      .on('mouseleave', NV.util.tipHide)
      .on('click', function (event, d) {
        NV.set({ selectedSector: state.selectedSector === d.key ? null : d.key });
      });

    /* ------------------------------------------------------------ controls */

    var host = NV.util.controls();

    host.append('span').attr('class', 'control-label').text('Measure the fall in');
    var toggle = host.append('div').attr('class', 'toggle');
    [['jobs', 'Jobs'], ['percent', 'Percent']].forEach(function (o) {
      toggle.append('button')
        .attr('type', 'button')
        .classed('is-on', measure === o[0])
        .text(o[1])
        .on('click', function () { NV.set({ measure: o[0] }); });
    });

    if (state.selectedSector) {
      var picked = data.sectorStats[state.selectedSector];
      host.append('button')
        .attr('class', 'btn btn-follow')
        .attr('type', 'button')
        .text('Follow ' + picked.short + ' into scene 3')
        .on('click', function () {
          NV.state.focusSector = state.selectedSector;
          NV.goTo(3);
        });
    }

    /* ------------------------------------------------------------- readout */

    if (state.selectedSector) {
      var d = data.peakToTrough.find(function (r) { return r.key === state.selectedSector; });
      NV.util.readout(d.label, [
        ['Jan 2008', NV.fmt.jobs(d.start)],
        ['Feb 2010', NV.fmt.jobs(d.end)],
        ['Change', NV.fmt.signedJobs(d.jobs), NV.util.tone(d.jobs)],
        ['Percent change', NV.fmt.signedPct(d.percent), NV.util.tone(d.jobs)],
        ['Share of all losses', d.jobs < 0 ? (d.share * 100).toFixed(1) + '%' : 'none']
      ], 'Click the bar again to clear the selection.');
    } else {
      NV.util.readout('Where the 8.7 million went', [
        ['Manufacturing', NV.fmt.signedJobs(-2272), 'loss'],
        ['Trade and transport', NV.fmt.signedJobs(-2176), 'loss'],
        ['Construction', NV.fmt.signedJobs(-1976), 'loss'],
        ['Those three together', '67% of the losses'],
        ['Education and health', NV.fmt.signedJobs(861), 'gain']
      ], 'Hover a bar for detail, click to select it.');
    }

    /* ------------------------------------------------------- copy and note */

    NV.util.prose(
      '<p>Eleven supersectors add up to total nonfarm payrolls. Between the peak and the trough, ' +
      'nine of them shrank and two grew. Construction and manufacturing alone account for ' +
      '<span class="num">44%</span> of every job lost.</p>' +
      '<p>Counted in <strong>jobs</strong>, the fall looks widely shared, because the biggest ' +
      'industries naturally shed the biggest numbers. Counted in <strong>percent</strong>, it ' +
      'collapses onto two: construction lost <span class="num">26.4%</span> of its workforce and ' +
      'manufacturing <span class="num">16.6%</span>. Nothing else lost more than a tenth.</p>' +
      '<p>Flip the measure and watch the ranking rearrange. That rearrangement is the argument.</p>'
    );

    NV.util.figureNote(
      'Employment by supersector, seasonally adjusted, change from January 2008 to February 2010. ' +
      'The eleven supersectors shown sum to total nonfarm payrolls; broader aggregates such as goods ' +
      'producing are omitted to avoid double counting. Select any bar to carry that industry into ' +
      'scene 3. Source: U.S. Bureau of Labor Statistics, Current Employment Statistics.'
    );
  };
})();
