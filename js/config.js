// shared constants: palette, sector list, key dates, formatters
var NV = window.NV || {};
window.NV = NV;

// red = jobs lost, teal = jobs gained, amber = annotations only
NV.color = {
  paper: '#E9EAE5',
  plate: '#FBFBF8',
  ink: '#161A15',
  ink2: '#4C5348',
  ink3: '#7C8377',
  rule: '#D2D5CC',
  muted: '#B6BAAF',
  loss: '#8C2F1E',
  loss2: '#B4593C',
  gain: '#1F6F6B',
  gain2: '#4E9993',
  signal: '#C07C08',
  ramp: ['#F1EDE4', '#E4CFBD', '#D3AB91', '#C08468', '#A55A41', '#8C2F1E']
};

// the 11 supersectors that sum to total nonfarm.
// goods_producing / service_providing / private / private_service_providing
// are roll-ups of these, so leave them out or you double count.
NV.SECTORS = [
  { key: 'construction',                       label: 'Construction',                 short: 'Construction' },
  { key: 'manufacturing',                      label: 'Manufacturing',                short: 'Manufacturing' },
  { key: 'information',                        label: 'Information',                  short: 'Information' },
  { key: 'mining_and_logging',                 label: 'Mining and logging',           short: 'Mining, logging' },
  { key: 'professional_and_business_services', label: 'Professional and business services', short: 'Prof. and business' },
  { key: 'trade_transportation_utilties',      label: 'Trade, transportation and utilities', short: 'Trade and transport' },
  { key: 'financial_activities',               label: 'Financial activities',         short: 'Finance' },
  { key: 'leisure_and_hospitality',            label: 'Leisure and hospitality',      short: 'Leisure' },
  { key: 'other_services',                     label: 'Other services',               short: 'Other services' },
  { key: 'government',                         label: 'Government',                   short: 'Government' },
  { key: 'education_and_health_services',      label: 'Education and health services', short: 'Education, health' }
];

NV.sectorByKey = {};
NV.SECTORS.forEach(function (s) { NV.sectorByKey[s.key] = s; });

// all checked against the series itself
NV.DATES = {
  peak:       new Date(2008, 0, 1),   // payroll peak, 138,419,000 jobs
  worst:      new Date(2009, 2, 1),   // worst single month, minus 802,000
  trough:     new Date(2010, 1, 1),   // payroll trough, 129,726,000 jobs
  recovered:  new Date(2014, 4, 1),   // first month back above the peak
  nberStart:  new Date(2007, 11, 1),  // NBER business cycle peak
  nberEnd:    new Date(2009, 5, 1)    // NBER business cycle trough
};

NV.FACTS = {
  peakJobs: 138419,
  troughJobs: 129726,
  lostJobs: 8693,
  lostPct: 6.28,
  monthsToRecover: 76,
  worstMonthChange: -802,
  countiesMapped: 3134,
  medianCountyRate: 0.084
};

// order of this array = order of the story
NV.SCENES = [
  { id: 1, name: 'The hole',        render: function () { return NV.scene1.apply(null, arguments); } },
  { id: 2, name: 'Who fell',        render: function () { return NV.scene2.apply(null, arguments); } },
  { id: 3, name: 'Who came back',   render: function () { return NV.scene3.apply(null, arguments); } },
  { id: 4, name: 'Where it landed', render: function () { return NV.scene4.apply(null, arguments); } }
];

NV.fmt = {
  thousandsToMillions: function (v) { return (v / 1000).toFixed(2) + 'M'; },
  jobs: function (v) {
    // v arrives in thousands of jobs
    var a = Math.abs(v);
    if (a >= 1000) return (v / 1000).toFixed(2) + 'M';
    return d3.format(',.0f')(v * 1000);
  },
  signedJobs: function (v) { return (v > 0 ? '+' : v < 0 ? '\u2212' : '') + NV.fmt.jobs(Math.abs(v)); },
  signedPct: function (v) { return (v > 0 ? '+' : v < 0 ? '\u2212' : '') + Math.abs(v).toFixed(1) + '%'; },
  pct1: function (v) { return v.toFixed(1) + '%'; },
  signedPts: function (v) { return (v > 0 ? '+' : v < 0 ? '\u2212' : '') + Math.abs(v).toFixed(1) + ' pts'; },
  rate: function (v) { return (v * 100).toFixed(1) + '%'; },
  count: d3.format(','),
  monthYear: d3.timeFormat('%b %Y'),
  monYr: d3.timeFormat("%b '%y"),
  year: d3.timeFormat('%Y')
};

// scenes 1 and 3 share this so the x axis lines up between them
NV.frame = {
  width: 960,
  height: 520,
  margin: { top: 34, right: 132, bottom: 54, left: 78 }
};
NV.frame.inner = {
  w: NV.frame.width - NV.frame.margin.left - NV.frame.margin.right,
  h: NV.frame.height - NV.frame.margin.top - NV.frame.margin.bottom
};
