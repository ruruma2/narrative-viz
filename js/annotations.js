// one annotation style for the whole thing, see NV.annotate below
(function () {
  'use strict';

  var TEMPLATE = {
    wrap: 190,
    bgPadding: { top: 5, bottom: 5, left: 6, right: 6 },
    padding: 6
  };

  // specs are { x, y, dx, dy, title, label, align, subject }
  NV.annotate = function (parent, specs, opts) {
    opts = opts || {};
    var type = opts.type || d3.annotationCalloutElbow;

    var annotations = specs.map(function (s) {
      return {
        note: {
          title: s.title,
          label: s.label,
          wrap: s.wrap || TEMPLATE.wrap,
          bgPadding: TEMPLATE.bgPadding,
          padding: TEMPLATE.padding,
          align: s.align || 'dynamic',
          orientation: s.orientation || 'topBottom',
          lineType: s.lineType || 'horizontal'
        },
        x: s.x,
        y: s.y,
        dx: s.dx,
        dy: s.dy,
        color: NV.color.ink,
        subject: s.subject || {},
        connector: { end: s.end || 'dot', endScale: 1.7 },
        className: s.className || ''
      };
    });

    var maker = d3.annotation()
      .type(type)
      .notePadding(8)
      .annotations(annotations);

    parent.selectAll('g.nv-annotation').remove();
    parent.append('g')
      .attr('class', 'nv-annotation')
      .style('pointer-events', 'none')
      .call(maker);
  };

  // map version: circle the region instead of dotting a point
  NV.annotateCircle = function (parent, specs) {
    NV.annotate(parent, specs, { type: d3.annotationCalloutCircle });
  };
})();
