/* Shared behavior: scroll reveal + photo-strip galleries. No dependencies. */
(function () {
  // Scroll reveal: fade/slide sections in once as they enter the viewport.
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('inview'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('inview'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  // Galleries: prev/next buttons and an "n / total" counter for each strip.
  document.querySelectorAll('[data-gallery]').forEach(function (g) {
    var track = g.querySelector('.gallery-track');
    var slides = track.querySelectorAll('.slide');
    var count = g.querySelector('.gallery-count');
    var prev = g.querySelector('[data-dir="-1"]');
    var next = g.querySelector('[data-dir="1"]');
    var ticking = false;

    function current() {
      var left = track.getBoundingClientRect().left;
      var best = 0, bestDist = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(s.getBoundingClientRect().left - left - parseFloat(getComputedStyle(track).scrollPaddingLeft || 0));
        if (d < bestDist) { bestDist = d; best = i; }
      });
      return best;
    }

    function update() {
      ticking = false;
      var i = current();
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (atEnd) i = slides.length - 1;
      count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = atEnd;
    }

    function go(dir) {
      var i = Math.min(slides.length - 1, Math.max(0, current() + dir));
      var target = slides[i].offsetLeft - parseFloat(getComputedStyle(track).scrollPaddingLeft || 0);
      track.scrollTo({ left: target, behavior: 'smooth' });
    }

    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    track.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
