// scene 3: supersectors indexed to Jan 2008 = 100
(function () {
  'use strict';

  var FRAME = {
    width: 960,
    height: 520,
    margin: { top: 34, right: 170, bottom: 54, left: 78 }
  };
  FRAME.inner = {
    w: FRAME.width - FRAME.margin.left - FRAME.margin.right,
    h: FRAME.height - FRAME.margin.top - FRAME.margin.bottom
  };

  // the default contrast
  var STORY = ['construction', 'education_and_health_services'];

  NV.scene3 = function (state, data) {
    var s = NV.util.stage(FRAME);
    var g = s.plot;
    var focus = state.focusSector;

    var months = data.employment.map(function (d) { return d.month; });

    var x = d3.scaleTime().domain(d3.extent(months)).range([0, s.w]);
    var y = d3.scaleLinear().domain([70, 122]).range([s.h, 0]);

    function toneOf(key) {
      return data.sectorStats[key].endIndex < 100 ? NV.color.loss : NV.color.gain;
    }
    function isLit(key) {
      return focus ? key === focus : STORY.indexOf(key) !== -1;
    }

    /* ---------------------------------------------------------------- frame */

    NV.util.yGrid(g, y, s.w, 6);
    // no label: scene 1 already explains the shading and both corners are needed
    NV.util.recessionBand(g, x, s.h, false);

    g.append('g').attr('class', 'axis')
      .attr('transform', 'translate(0,' + s.h + ')')
      .call(d3.axisBottom(x).ticks(d3.timeYear.every(1)).tickFormat(NV.fmt.year).tickSizeOuter(0));

    g.append('g').attr('class', 'axis')
      .call(d3.axisLeft(y).ticks(6).tickSize(0));

    NV.util.axisTitle(g, 'Employment index, Jan 2008 = 100', -66, -14);

    g.append('line').attr('class', 'reference-line')
      .attr('x1', 0).attr('x2', s.w).attr('y1', y(100)).attr('y2', y(100));

    g.append('text').attr('class', 'rule-text')
      .attr('x', 6).attr('y', y(100) - 8)
      .text('Jan 2008 level');

    /* ------------------------------------------------------------ the lines */

    var line = d3.line()
      .x(function (d) { return x(d.month); })
      .y(function (d) { return y(d.index); });

    // sits under the lines, catches the month hover
    var guide = g.append('g').style('display', 'none');
    var guideLine = guide.append('line').attr('class', 'hover-guide').attr('y1', 0).attr('y2', s.h);

    var catcher = g.append('rect')
      .attr('width', s.w).attr('height', s.h)
      .attr('fill', 'transparent');

    // draw muted first so the lit ones end up on top
    var order = NV.SECTORS.map(function (d) { return d.key; })
      .sort(function (a, b) { return (isLit(a) ? 1 : 0) - (isLit(b) ? 1 : 0); });

    order.forEach(function (key) {
      var lit = isLit(key);
      g.append('path')
        .datum(data.indexed[key])
        .attr('class', 'sector-line ' + (lit ? 'is-focus' : 'is-dim'))
        .attr('stroke', lit ? toneOf(key) : null)
        .attr('d', line);

      // fat invisible stroke to make the line clickable
      g.append('path')
        .datum(data.indexed[key])
        .attr('fill', 'none')
        .attr('stroke', 'transparent')
        .attr('stroke-width', 11)
        .style('cursor', 'pointer')
        .attr('d', line)
        .on('mousemove', function (event) { hoverSector(event, key); })
        .on('mouseleave', clearHover)
        .on('click', function () {
          NV.set({ focusSector: focus === key ? null : key });
        });
    });

    // end labels, nudged apart so they don't stack
    var ends = NV.SECTORS.map(function (d) {
      var st = data.sectorStats[d.key];
      return { key: d.key, short: d.short, index: st.endIndex, y: y(st.endIndex), lit: isLit(d.key) };
    }).sort(function (a, b) { return a.y - b.y; });

    for (var i = 1; i < ends.length; i++) {
      if (ends[i].y - ends[i - 1].y < 13) ends[i].y = ends[i - 1].y + 13;
    }

    g.selectAll('text.end-label').data(ends).enter().append('text')
      .attr('class', 'end-label')
      .attr('x', s.w + 8)
      .attr('y', function (d) { return d.y + 4; })
      .attr('fill', function (d) { return d.lit ? toneOf(d.key) : NV.color.muted; })
      .attr('font-weight', function (d) { return d.lit ? 600 : 400; })
      .text(function (d) { return d.short + ' ' + d.index.toFixed(0); });

    /* --------------------------------------------------------- annotations */
    // same annotation style, but the content depends on the focus parameter

    // d3-annotation puts the note below the subject when dy > 0 and above when
    // dy < 0. easier to name the box you want and work backwards to dy.
    function dyToBox(anchorY, preferTop, H) {
      H = H || 84;
      var minTop = -FRAME.margin.top + 8;
      var maxTop = s.h + FRAME.margin.bottom - 8 - H;
      var top = Math.max(minTop, Math.min(maxTop, preferTop));
      if (anchorY <= top) return top - anchorY;            // note sits below the subject
      if (anchorY >= top + H) return (top + H) - anchorY;  // note sits above the subject
      if (anchorY - H - 10 >= minTop) return -10;          // no room in the box, tuck it above
      return Math.min(maxTop, anchorY + 10) - anchorY;     // otherwise just below
    }

    if (!focus) {
      var con = data.sectorStats.construction;
      var edu = data.sectorStats.education_and_health_services;
      NV.annotate(g, [
        {
          x: s.w, y: y(edu.endIndex),
          dx: -434, dy: 10, align: 'right', wrap: 172,
          title: 'Education and health',
          label: 'Up 17.6% on 2008. It grew straight through the recession without pausing.'
        },
        {
          x: s.w, y: y(con.endIndex),
          dx: 10 - s.w, dy: dyToBox(y(con.endIndex), 340), align: 'left', wrap: 172,
          title: 'Construction',
          label: 'Still 11.3% below its 2008 level at the end of 2015, eight years on.'
        }
      ]);
    } else {
      // reuse the same two empty pockets the default pair uses. with 11 lines
      // bunched in the middle a long leader beats a note dropped on the bundle.
      var st = data.sectorStats[focus];
      NV.annotate(g, [
        {
          x: s.w, y: y(st.endIndex),
          dx: 300 - s.w, dy: dyToBox(y(st.endIndex), 40), align: 'right', wrap: 172,
          title: st.short + ' / Dec 2015',
          label: st.netJobs >= 0
            ? 'Back above the line and then some, up ' + NV.fmt.signedPct(st.netPct) + ' on January 2008.'
            : 'Still short of where it started, ' + Math.abs(st.netPct).toFixed(1) + '% below January 2008.'
        },
        {
          x: x(st.troughDate), y: y(st.troughIndex),
          dx: 10 - x(st.troughDate), dy: dyToBox(y(st.troughIndex), 340), align: 'left', wrap: 172,
          title: st.short + ' / low point',
          label: NV.fmt.monthYear(st.troughDate) + '. Down ' + Math.abs(st.maxDrawdownPct).toFixed(1) +
                 '% from January 2008, a fall of ' + NV.fmt.jobs(st.peakJobs - st.troughJobs) + ' jobs.'
        }
      ]);
    }

    /* --------------------------------------------------- free exploration */

    var bisect = d3.bisector(function (d) { return d.month; }).center;

    function monthAt(event, node) {
      var mx = d3.pointer(event, node)[0];
      var i = bisect(data.indexed.construction, x.invert(mx));
      return { i: i, month: data.indexed.construction[i].month };
    }

    function hoverSector(event, key) {
      var m = monthAt(event, g.node());
      var p = data.indexed[key][m.i];
      var stt = data.sectorStats[key];
      guide.style('display', null);
      guideLine.attr('x1', x(p.month)).attr('x2', x(p.month));
      NV.util.tipShow(
        '<span class="tt-title">' + stt.label + '</span>' +
        '<span class="tt-row"><span>' + NV.fmt.monthYear(p.month) + '</span><span>index ' + p.index.toFixed(1) + '</span></span>' +
        '<span class="tt-row"><span>Jobs</span><span>' + NV.fmt.jobs(p.value) + '</span></span>' +
        '<span class="tt-row"><span>Versus Jan 2008</span><span>' + NV.fmt.signedPct(p.index - 100) + '</span></span>' +
        '<span class="tt-note">Click to pull this line forward</span>',
        event);
    }

    function clearHover() {
      guide.style('display', 'none');
      NV.util.tipHide();
    }

    catcher.on('mousemove', function (event) {
      var m = monthAt(event, g.node());
      guide.style('display', null);
      guideLine.attr('x1', x(m.month)).attr('x2', x(m.month));
      var keys = focus ? [focus] : STORY;
      NV.util.tipShow(
        '<span class="tt-title">' + NV.fmt.monthYear(m.month) + '</span>' +
        keys.map(function (k) {
          var p = data.indexed[k][m.i];
          return '<span class="tt-row"><span>' + data.sectorStats[k].short + '</span><span>' + p.index.toFixed(1) + '</span></span>';
        }).join('') +
        '<span class="tt-note">Hover a line for its own numbers</span>',
        event);
    }).on('mouseleave', clearHover);

    /* ------------------------------------------------------------ controls */

    var host = NV.util.controls();
    host.append('span').attr('class', 'control-label').text('Pull one supersector forward');

    var chips = host.append('div').attr('class', 'chips');
    NV.SECTORS.forEach(function (sec) {
      var chip = chips.append('button')
        .attr('class', 'chip' + (focus === sec.key ? ' is-on' : ''))
        .attr('type', 'button')
        .on('click', function () { NV.set({ focusSector: focus === sec.key ? null : sec.key }); });
      chip.append('span').attr('class', 'swatch').style('background', toneOf(sec.key));
      chip.append('span').text(sec.short);
    });

    if (focus) {
      host.append('button')
        .attr('class', 'btn btn-ghost')
        .attr('type', 'button')
        .style('width', '100%')
        .text('Show the contrast again')
        .on('click', function () { NV.set({ focusSector: null }); });
    }

    /* ------------------------------------------------------------- readout */

    if (focus) {
      var f = data.sectorStats[focus];
      NV.util.readout(f.label, [
        ['Low point', NV.fmt.monthYear(f.troughDate)],
        ['Worst drawdown', NV.fmt.signedPct(f.maxDrawdownPct), 'loss'],
        ['Dec 2015 index', f.endIndex.toFixed(1), NV.util.tone(f.endIndex - 100)],
        ['Net jobs since 2008', NV.fmt.signedJobs(f.netJobs), NV.util.tone(f.netJobs)],
        ['Back above 2008?', f.recovered ? 'Yes' : 'No']
      ], 'Click the chip again to clear the focus.');
    } else {
      NV.util.readout('Index at December 2015', [
        ['Education and health', '117.6', 'gain'],
        ['Leisure and hospitality', '113.8', 'gain'],
        ['Professional services', '110.3', 'gain'],
        ['Manufacturing', '90.1', 'loss'],
        ['Construction', '88.7', 'loss']
      ], 'Hover any line, or pick a supersector below.');
    }

    /* ------------------------------------------------------- copy and note */

    NV.util.prose(
      '<p>Rebasing every supersector to 100 at the January 2008 peak strips out size and leaves only ' +
      'trajectory. The lines fan out and never come back together.</p>' +
      '<p>Eight years after the peak, construction was still <span class="num">11.3%</span> short and ' +
      'manufacturing <span class="num">9.9%</span> short. Education and health, which never had a down ' +
      'month, was <span class="num">17.6%</span> ahead, and leisure and hospitality ' +
      '<span class="num">13.8%</span> ahead.</p>' +
      '<p>The country got its job count back in May 2014. It did not get the same jobs back.</p>'
    );

    NV.util.figureNote(
      'Employment by supersector, seasonally adjusted, indexed to January 2008 = 100. Grey lines are ' +
      'the supersectors not currently in focus; end labels give the December 2015 index. Shaded band ' +
      'marks the NBER recession. Source: U.S. Bureau of Labor Statistics, Current Employment Statistics.'
    );
  };
})();
