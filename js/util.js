// small drawing helpers shared by the scenes
(function () {
  'use strict';

  NV.util = {};

  // wipe the svg and hand back a fresh plot group
  NV.util.stage = function (frame) {
    frame = frame || NV.frame;
    var svg = d3.select('#chart');
    svg.selectAll('*').remove();
    svg.attr('viewBox', '0 0 ' + frame.width + ' ' + frame.height)
       .attr('preserveAspectRatio', 'xMidYMid meet')
       .style('max-height', frame.height + 'px');
    return {
      svg: svg,
      plot: svg.append('g').attr('transform', 'translate(' + frame.margin.left + ',' + frame.margin.top + ')'),
      w: frame.inner.w,
      h: frame.inner.h
    };
  };

  // NBER recession band, same everywhere time is on x
  NV.util.recessionBand = function (g, x, h, labelPos) {
    var x0 = x(NV.DATES.nberStart);
    var x1 = x(NV.DATES.nberEnd);
    var band = g.append('g').attr('class', 'recession');
    band.append('rect')
      .attr('class', 'recession-band')
      .attr('x', x0).attr('y', 0)
      .attr('width', Math.max(0, x1 - x0)).attr('height', h);
    if (labelPos !== false) {
      band.append('text')
        .attr('class', 'recession-label')
        .attr('x', (x0 + x1) / 2)
        .attr('y', labelPos === 'bottom' ? h - 8 : 13)
        .attr('text-anchor', 'middle')
        .text('Recession');
    }
    return band;
  };

  NV.util.yGrid = function (g, y, w, ticks) {
    g.append('g').attr('class', 'grid')
      .selectAll('line').data(y.ticks(ticks || 6)).enter().append('line')
      .attr('class', 'gridline')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', y).attr('y2', y);
  };

  NV.util.axisTitle = function (g, text, x, y, anchor) {
    g.append('text')
      .attr('class', 'axis-title')
      .attr('x', x).attr('y', y)
      .attr('text-anchor', anchor || 'start')
      .text(text);
  };

    // tooltip

  var tip = null;
  function tipEl() {
    if (!tip) tip = d3.select('#tooltip');
    return tip;
  }

  NV.util.tipShow = function (html, event) {
    tipEl().html(html).classed('is-on', true);
    NV.util.tipMove(event);
  };

  NV.util.tipMove = function (event) {
    if (!event) return;
    var el = tipEl();
    var node = el.node();
    var pad = 14;
    var w = node.offsetWidth;
    var h = node.offsetHeight;
    var left = event.clientX + pad;
    var top = event.clientY + pad;
    if (left + w > window.innerWidth - 8) left = event.clientX - w - pad;
    if (top + h > window.innerHeight - 8) top = event.clientY - h - pad;
    el.style('left', left + 'px').style('top', Math.max(8, top) + 'px');
  };

  NV.util.tipHide = function () {
    tipEl().classed('is-on', false);
  };

    // readout

  // rows are [label, value, tone], tone is 'loss' | 'gain' | undefined
  NV.util.readout = function (title, rows, note) {
    var host = d3.select('#readout');
    host.html('');
    if (!title && !rows) {
      host.append('p').attr('class', 'readout-hint').text(note || 'Hover the chart to inspect any point.');
      return;
    }
    if (title) host.append('p').attr('class', 'readout-title').text(title);
    var dl = host.append('dl');
    rows.forEach(function (r) {
      dl.append('dt').text(r[0]);
      dl.append('dd').attr('class', r[2] ? 'val-' + r[2] : null).text(r[1]);
    });
    if (note) host.append('p').attr('class', 'readout-hint').style('margin-top', '10px').text(note);
  };

  NV.util.tone = function (v) { return v > 0 ? 'gain' : v < 0 ? 'loss' : null; };

    // misc

  NV.util.prose = function (html) { d3.select('#rail-prose').html(html); };

  NV.util.figureNote = function (text) { d3.select('#figure-note').text(text); };

  NV.util.controls = function () {
    var host = d3.select('#controls');
    host.html('');
    return host;
  };
})();
