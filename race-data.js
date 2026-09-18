// electy.org — race record loader.
// Two source-scoped files are merged per district:
//   data/house-2026.json  — from the state's Wikipedia 2026 House elections article
//                           (candidates, ratings, finance, endorsements, 2024 winner's share)
//   data/districts.json   — from district-level sources (Ballotpedia, all-district tables)
//                           (pres24, counties, tenure, history, redistricted, house24 split)
// A district-file value overrides the election-file value ONLY when it is not null,
// so an unfilled district field can never blank out a verified election field.
(function () {
  var cache = null;

  // Data lives next to this script, whatever depth the PAGE is at — so a page at
  // /house/ia-01/ and one at / both reach the same files, with no absolute paths.
  var HERE = (function () {
    var el = document.currentScript ||
      (function () { var s = document.getElementsByTagName('script'); return s[s.length - 1]; }());
    try { return new URL('.', el.src).href; } catch (e) { return ''; }
  }());

  function get(url) {
    return fetch(url).then(function (r) { return r.json(); }).catch(function () { return {}; });
  }

  function load() {
    if (!cache) {
      cache = Promise.all([
        get(HERE + 'data/house-2026.json'),
        get(HERE + 'data/districts.json')
      ]).then(function (both) {
        return { races: both[0].races || {}, districts: both[1].districts || {} };
      });
    }
    return cache;
  }

  window.electyLoadRace = function (key) {
    return load().then(function (d) {
      var race = d.races[key];
      if (!race) return null;
      var extra = d.districts[key] || {};
      var out = Object.assign({}, race);
      Object.keys(extra).forEach(function (k) {
        var v = extra[k];
        if (v === null || v === undefined) return;
        if (Array.isArray(v) && !v.length) return;
        out[k] = v;
      });
      if (extra.sources) out.sources = Object.assign({}, race.sources, extra.sources);
      if (extra.checked) out.checked = extra.checked;
      return out;
    });
  };
}());
