// scene 4: county unemployment choropleth
(function () {
  'use strict';

  var FRAME = {
    width: 975,
    height: 610,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  };
  FRAME.inner = { w: 975, h: 610 };

  var BREAKS = [0.04, 0.07, 0.10, 0.13, 0.16];

  NV.scene4 = function (state, data) {
    var s = NV.util.stage(FRAME);
    var g = s.plot;
    var threshold = state.threshold;

    var path = d3.geoPath().projection(null);
    var color = d3.scaleThreshold().domain(BREAKS).range(NV.color.ramp);

    /* ------------------------------------------------------------ counties */

    var counties = g.append('g').attr('class', 'counties');

    var paths = counties.selectAll('path')
      .data(data.counties.features, function (d) { return d.id; })
      .enter().append('path')
      .attr('class', function (d) { return 'county' + (d.properties.rate === null ? ' no-data' : ''); })
      .attr('d', path)
      .attr('fill', function (d) {
        return d.properties.rate === null ? '#DCDDD7' : color(d.properties.rate);
      });

    g.append('path')
      .attr('class', 'state-mesh')
      .attr('d', path(data.stateMesh));

    g.append('path')
      .attr('class', 'nation-outline')
      .attr('d', path(data.nation.features[0]));

    var hoverOutline = g.append('path').attr('class', 'county-hover');

    // class toggle rather than a redraw, otherwise the slider drags badly
    function applyThreshold(t) {
      paths
        .classed('is-dim', function (d) { return d.properties.rate === null || d.properties.rate < t; })
        .classed('is-hit', function (d) { return d.properties.rate !== null && d.properties.rate >= t; });
    }
    applyThreshold(threshold);

    /* -------------------------------------------------------------- legend */

    var lg = g.append('g').attr('transform', 'translate(524,556)');
    var sw = 35;
    var lgW = NV.color.ramp.length * sw;

    lg.append('text').attr('class', 'legend-title')
      .attr('x', 0).attr('y', -12)
      .text('County unemployment rate');

    NV.color.ramp.forEach(function (c, i) {
      lg.append('rect')
        .attr('x', i * sw).attr('y', 0)
        .attr('width', sw).attr('height', 11)
        .attr('fill', c).attr('stroke', '#FBFBF8').attr('stroke-width', 0.5);
    });

    BREAKS.forEach(function (b, i) {
      lg.append('text').attr('class', 'legend-tick')
        .attr('x', (i + 1) * sw).attr('y', 24).attr('text-anchor', 'middle')
        .text((b * 100).toFixed(0) + '%');
    });

    // caret ties the slider value back to the colour ramp
    var tx = Math.max(0, Math.min(1, (threshold - 0.01) / 0.18)) * lgW;
    lg.append('path')
      .attr('d', 'M' + tx + ',-3 l5,-8 l-10,0 Z')
      .attr('fill', NV.color.ink);

    /* --------------------------------------------------------- annotations */

    function centroidOf(id) {
      var f = data.countyById.get(id);
      return f ? path.centroid(f) : [0, 0];
    }
    function stateCentroid(name) {
      var f = topojson.feature(data.topology, data.topology.objects.states)
        .features.find(function (d) { return d.properties.name === name; });
      return f ? path.centroid(f) : [0, 0];
    }

    var imperial = centroidOf('06025');
    var michigan = stateCentroid('Michigan');
    var carolina = stateCentroid('South Carolina');

    // positions checked against the rendered geometry so nothing covers a county
    NV.annotateCircle(g, [
      {
        x: imperial[0], y: imperial[1],
        dx: 6 - imperial[0], dy: 15, align: 'left', wrap: 190,
        subject: { radius: 14, radiusPadding: 3 },
        title: 'Imperial County',
        label: "California's border county, 30.1%, the highest in the country."
      },
      {
        x: michigan[0], y: michigan[1],
        dx: 606 - michigan[0], dy: 78 - michigan[1], align: 'left', wrap: 182,
        subject: { radius: 44, radiusPadding: 3 },
        title: 'Michigan',
        label: 'Median county rate 13.7%, the manufacturing losses of scene 2 on the ground.'
      },
      {
        x: carolina[0], y: carolina[1],
        dx: 832 - carolina[0], dy: 38, align: 'left', wrap: 128,
        subject: { radius: 30, radiusPadding: 3 },
        title: 'South Carolina',
        label: 'The highest statewide median in the country, 13.8% across all 46 counties.'
      }
    ]);

    /* --------------------------------------------------- free exploration */

    paths
      .on('mousemove', function (event, d) {
        hoverOutline.attr('d', path(d));
        var r = d.properties.rate;
        NV.util.tipShow(
          '<span class="tt-title">' + d.properties.name + '</span>' +
          '<span class="tt-row"><span>' + d.properties.stateName + '</span><span>' +
          (r === null ? 'no data' : NV.fmt.rate(r)) + '</span></span>' +
          (r === null ? '' :
            '<span class="tt-row"><span>Versus national median</span><span>' +
            NV.fmt.signedPts((r - NV.FACTS.medianCountyRate) * 100) + '</span></span>'),
          event);
      })
      .on('mouseleave', function () {
        hoverOutline.attr('d', null);
        NV.util.tipHide();
      });

    /* ------------------------------------------------------------ controls */

    var host = NV.util.controls();
    host.append('span').attr('class', 'control-label').text('Highlight counties at or above');

    var row = host.append('div').attr('class', 'slider-row');
    var valueText = row.append('span').attr('class', 'slider-value').text(NV.fmt.rate(threshold));

    row.insert('input', '.slider-value')
      .attr('type', 'range')
      .attr('min', 4).attr('max', 25).attr('step', 0.5)
      .attr('aria-label', 'Unemployment rate threshold')
      .property('value', threshold * 100)
      .on('input', function () {
        var t = +this.value / 100;
        valueText.text(NV.fmt.rate(t));
        applyThreshold(t);
        writeReadout(t);
      })
      .on('change', function () {
        NV.state.threshold = +this.value / 100;
      });

    host.append('p').attr('class', 'readout-hint')
      .style('margin', '0')
      .text('Counties below the line fade back. Hover any county for its rate.');

    /* ------------------------------------------------------------- readout */

    var rates = data.countiesWithRate;

    function writeReadout(t) {
      var above = rates.filter(function (f) { return f.properties.rate >= t; });
      var byState = d3.rollup(above, function (v) { return v.length; },
        function (f) { return f.properties.stateName; });
      var top = Array.from(byState, function (kv) { return { state: kv[0], n: kv[1] }; })
        .sort(function (a, b) { return b.n - a.n; })
        .slice(0, 3)
        .map(function (d) { return d.state + ' ' + d.n; })
        .join(', ');

      NV.util.readout('At or above ' + NV.fmt.rate(t), [
        ['Counties', NV.fmt.count(above.length) + ' of 3,134'],
        ['Share of counties', (above.length / rates.length * 100).toFixed(1) + '%'],
        ['National median', NV.fmt.rate(NV.FACTS.medianCountyRate)],
        ['Highest county', '30.1%'],
        ['Most counties in', top || 'none']
      ], 'Drag the slider to change the line.');
    }
    writeReadout(threshold);

    /* ------------------------------------------------------- copy and note */

    NV.util.prose(
      '<p>The same recession, drawn as geography. Each county is shaded by its unemployment rate, and ' +
      'the median county sat at <span class="num">8.4%</span>.</p>' +
      '<p>The dark patches are not random. They are the auto belt through Michigan, Indiana and Ohio, ' +
      'the furniture and textile counties of the Carolinas and Alabama, the farm and construction ' +
      'counties of inland California and Arizona, and the housing boom coasts of Florida and Nevada.</p>' +
      '<p>Scene 2 named the industries. This is where those industries lived.</p>'
    );

    NV.util.figureNote(
      'County unemployment rates, not seasonally adjusted, at levels generally consistent with 2009. ' +
      '3,134 of 3,142 counties carry a rate; the eight without one are shown in grey. Puerto Rico is ' +
      'present in the source file but not on this map. Boundaries are drawn in an Albers equal area ' +
      'projection of the United States. Source: U.S. Bureau of Labor Statistics, Local Area ' +
      'Unemployment Statistics, and the TopoJSON US Atlas.'
    );
  };
})();
