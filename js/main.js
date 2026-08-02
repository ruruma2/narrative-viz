// state + triggers + scene dispatch
(function () {
  'use strict';

  NV.state = {
    scene: 1,
    measure: 'jobs',
    selectedSector: null,
    focusSector: null,
    threshold: 0.15,
    visited: { 1: true }
  };

  var META = {
    1: {
      title: 'An 8.7 million job hole, and six years to climb out',
      dek: 'Total nonfarm payrolls, monthly, January 2006 to December 2015.'
    },
    2: {
      title: 'Two industries took nearly half the losses',
      dek: 'Change in employment by supersector between the payroll peak in January 2008 and the payroll trough in February 2010.'
    },
    3: {
      title: 'The recovery went to a different economy',
      dek: 'Employment by supersector, indexed so that January 2008 equals 100, through December 2015.'
    },
    4: {
      title: 'The deepest holes were where things get made and built',
      dek: 'County unemployment rates at levels generally consistent with 2009. Hover any county, and move the slider to change what counts as hard hit.'
    }
  };

  /* ------------------------------------------------------------ rendering */

  NV.render = function () {
    var st = NV.state;
    st.visited[st.scene] = true;

    d3.select('#scene-num').text('0' + st.scene);
    d3.select('#scene-title').text(META[st.scene].title);
    d3.select('#scene-dek').text(META[st.scene].dek);

    d3.selectAll('.step')
      .classed('is-current', function (d) { return d.id === st.scene; })
      .classed('is-visited', function (d) { return !!st.visited[d.id]; })
      .attr('aria-current', function (d) { return d.id === st.scene ? 'step' : null; });

    d3.select('#btn-prev').property('disabled', st.scene === 1);
    d3.select('#btn-next')
      .property('disabled', st.scene === NV.SCENES.length)
      .text(st.scene === NV.SCENES.length ? 'End of the story' : 'Next scene');

    NV.util.tipHide();
    NV.SCENES[st.scene - 1].render(st, NV.data);
  };

  // only place parameters change
  NV.set = function (patch) {
    Object.keys(patch).forEach(function (k) { NV.state[k] = patch[k]; });
    NV.render();
  };

  NV.goTo = function (n) {
    n = Math.max(1, Math.min(NV.SCENES.length, n));
    if (n === NV.state.scene) return;
    NV.set({ scene: n });
    document.getElementById('stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* -------------------------------------------------------------- chrome */

  function buildStepper() {
    var steps = d3.select('#stepper').selectAll('button.step')
      .data(NV.SCENES)
      .enter().append('button')
      .attr('class', 'step')
      .attr('type', 'button')
      .on('click', function (event, d) { NV.goTo(d.id); });

    steps.append('span').attr('class', 'step-num').text(function (d) { return 'Scene 0' + d.id; });
    steps.append('span').attr('class', 'step-name').text(function (d) { return d.name; });
  }

  function wireNav() {
    d3.select('#btn-prev').on('click', function () { NV.goTo(NV.state.scene - 1); });
    d3.select('#btn-next').on('click', function () { NV.goTo(NV.state.scene + 1); });

    d3.select(window).on('keydown', function (event) {
      if (event.target && /input|select|textarea/i.test(event.target.tagName)) return;
      if (event.key === 'ArrowRight') NV.goTo(NV.state.scene + 1);
      if (event.key === 'ArrowLeft') NV.goTo(NV.state.scene - 1);
    });
  }

  /* ---------------------------------------------------------------- start */

  function start() {
    buildStepper();
    wireNav();
    NV.load().then(function () {
      NV.render();
      window.NV_READY = true;
    }).catch(function (err) {
      d3.select('#scene-title').text('The data could not be loaded');
      d3.select('#scene-dek').text('Open this page over http rather than from the file system, then reload. Detail: ' + err.message);
      window.NV_READY = 'error';
      console.error(err);
    });
  }

  // d3-annotation wraps text with getBBox, so let the webfonts settle first.
  // bail out after 1.2s if the font API is missing or the fonts never load.
  if (document.fonts && document.fonts.ready) {
    Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1200); })]).then(start);
  } else {
    start();
  }
})();
