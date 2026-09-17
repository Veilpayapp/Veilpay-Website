// Deferred stylesheet loader.
//
// Replaces the inline `onload="this.media='all'"` pattern for non-render-
// blocking stylesheets so the Content-Security-Policy can stay strict
// (script-src without 'unsafe-inline'). Behavior is identical: the sheet loads
// in media="print" (never blocks first paint), then flips to media="all" as
// soon as it has loaded.
(function () {
  'use strict';
  var flip = function (link) {
    link.addEventListener('load', function () {
      link.media = 'all';
    });
  };
  var links = document.querySelectorAll('link[rel="stylesheet"][media="print"]');
  for (var i = 0; i < links.length; i++) flip(links[i]);

  // Safety net: if a stylesheet's load event never fires (e.g. cached edge
  // case), force-flip once the window has loaded so styles always apply.
  var flipAll = function () {
    var pending = document.querySelectorAll('link[rel="stylesheet"][media="print"]');
    for (var i = 0; i < pending.length; i++) pending[i].media = 'all';
  };
  window.addEventListener('load', flipAll);
  setTimeout(flipAll, 1500);
})();
