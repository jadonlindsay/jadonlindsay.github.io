/* Gentle entrances: each .rise fades up once. Content is visible without this file. */
(function () {
  var rises = document.querySelectorAll('.rise');
  if (!('IntersectionObserver' in window)) {
    rises.forEach(function (e) { e.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.1 });
  rises.forEach(function (e) { io.observe(e); });
})();
