// ---------- language switching ----------
(function () {
  var STORAGE_KEY = 'scg_lang';
  var SUPPORTED = ['en', 'ru', 'uz'];

  function detectLang() {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    var nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return SUPPORTED.indexOf(nav) !== -1 ? nav : 'en';
  }

  function applyLang(lang) {
    if (typeof TRANSLATIONS === 'undefined') return;
    document.documentElement.setAttribute('lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var entry = TRANSLATIONS[el.getAttribute('data-i18n')];
      if (entry && entry[lang]) el.textContent = entry[lang];
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var entry = TRANSLATIONS[el.getAttribute('data-i18n-placeholder')];
      if (entry && entry[lang]) el.setAttribute('placeholder', entry[lang]);
    });

    document.querySelectorAll('.lang-current').forEach(function (el) {
      el.textContent = lang.toUpperCase();
    });
    document.querySelectorAll('.lang-option').forEach(function (el) {
      el.classList.toggle('active', el.getAttribute('data-lang') === lang);
    });

    localStorage.setItem(STORAGE_KEY, lang);
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyLang(detectLang());

    document.querySelectorAll('.lang-switch').forEach(function (wrap) {
      var toggle = wrap.querySelector('.lang-toggle');
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = wrap.classList.toggle('open');
        wrap.querySelector('.lang-dropdown').classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen);
      });
      wrap.querySelectorAll('.lang-option').forEach(function (btn) {
        btn.addEventListener('click', function () {
          applyLang(btn.getAttribute('data-lang'));
          wrap.classList.remove('open');
          wrap.querySelector('.lang-dropdown').classList.remove('open');
        });
      });
    });
    document.addEventListener('click', function () {
      document.querySelectorAll('.lang-switch.open').forEach(function (wrap) {
        wrap.classList.remove('open');
        wrap.querySelector('.lang-dropdown').classList.remove('open');
      });
    });
  });
})();

document.addEventListener('DOMContentLoaded', function () {
  // Mobile nav toggle
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      var expanded = nav.classList.contains('open');
      toggle.setAttribute('aria-expanded', expanded);
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { nav.classList.remove('open'); });
    });
  }

  // Real form submission to Formspree (AJAX, stays on page)
  document.querySelectorAll('form[data-demo-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var success = form.parentElement.querySelector('.form-success');
      var submitBtn = form.querySelector('button[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '…'; }

      fetch(form.action, {
        method: form.method || 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (response) {
        if (response.ok) {
          if (success) {
            success.classList.remove('form-error');
            success.classList.add('show');
            success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
          form.reset();
        } else {
          response.json().then(function (data) {
            console.error('Form submission error:', data);
          }).catch(function () {});
          if (success) {
            success.classList.add('show', 'form-error');
            success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }).catch(function (err) {
        console.error('Network error submitting form:', err);
        if (success) {
          success.classList.add('show', 'form-error');
          success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }).finally(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
      });
    });
  });

  // Mascot: idle bubble prompt + click-to-speak greeting
  var mascotBtn = document.getElementById('mascotBtn');
  var mascotBubble = document.getElementById('mascotBubble');
  var mascotEyeL = document.getElementById('mascotEyeL');
  var mascotEyeR = document.getElementById('mascotEyeR');
  var mascotWrap = document.getElementById('mascotWrap');

  if (mascotEyeL && mascotEyeR && mascotWrap && window.matchMedia('(pointer: fine)').matches) {
    var targetX = 0, targetY = 0, curX = 0, curY = 0, rafRunning = false;
    document.addEventListener('mousemove', function (e) {
      var rect = mascotWrap.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height * 0.22;
      var dx = (e.clientX - cx) / Math.max(window.innerWidth * 0.5, 1);
      var dy = (e.clientY - cy) / Math.max(window.innerHeight * 0.5, 1);
      targetX = Math.max(-1.6, Math.min(1.6, dx * 3.2));
      targetY = Math.max(-1.1, Math.min(1.1, dy * 2.2));
      if (!rafRunning) { rafRunning = true; requestAnimationFrame(tick); }
    });
    function tick() {
      curX += (targetX - curX) * 0.18;
      curY += (targetY - curY) * 0.18;
      var t = 'translate(' + curX.toFixed(2) + 'px,' + curY.toFixed(2) + 'px)';
      mascotEyeL.style.transform = t;
      mascotEyeR.style.transform = t;
      if (Math.abs(targetX - curX) > 0.02 || Math.abs(targetY - curY) > 0.02) {
        requestAnimationFrame(tick);
      } else {
        rafRunning = false;
      }
    }
  }

  if (mascotBtn) {
    setTimeout(function () {
      if (mascotBubble) mascotBubble.classList.add('show');
    }, 1800);

    var hasSpeech = 'speechSynthesis' in window;
    var speechLangMap = { en: 'en-US', ru: 'ru-RU', uz: 'ru-RU' }; // uz falls back to ru voice (better TTS support)
    var cachedVoices = [];
    function loadVoices() { cachedVoices = window.speechSynthesis.getVoices() || []; }
    if (hasSpeech) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    function pickVoice(bcp47) {
      var base = bcp47.split('-')[0];
      var candidates = cachedVoices.filter(function (v) { return v.lang && v.lang.toLowerCase().indexOf(base) === 0; });
      if (!candidates.length) return null;
      var preferredNames = ['Google', 'Natural', 'Online', 'Neural', 'Microsoft'];
      for (var i = 0; i < preferredNames.length; i++) {
        var m = candidates.find(function (v) { return v.name.indexOf(preferredNames[i]) !== -1; });
        if (m) return m;
      }
      return candidates[0];
    }

    mascotBtn.addEventListener('click', function () {
      if (mascotBubble) mascotBubble.classList.remove('show');
      var lang = document.documentElement.getAttribute('lang') || 'en';
      var entry = (typeof TRANSLATIONS !== 'undefined') ? TRANSLATIONS['mascot.greeting'] : null;
      var text = entry ? (entry[lang] || entry.en) : 'Hello! Welcome to Solar Care Group.';

      mascotBtn.classList.add('talking');
      setTimeout(function () { mascotBtn.classList.remove('talking'); }, 1600);

      if (hasSpeech) {
        window.speechSynthesis.cancel();
        var bcp47 = speechLangMap[lang] || 'en-US';
        var utter = new SpeechSynthesisUtterance(text);
        utter.lang = bcp47;
        var voice = pickVoice(bcp47);
        if (voice) utter.voice = voice;
        utter.pitch = 1.05;
        utter.rate = 0.94;
        window.speechSynthesis.speak(utter);
      }

      if (mascotBubble) {
        mascotBubble.querySelector('.mascot-bubble-text').textContent = text;
        mascotBubble.classList.add('show');
        setTimeout(function () { mascotBubble.classList.remove('show'); }, 6000);
      }
    });
  }

  // Support tab
  var supportTab = document.getElementById('supportTab');
  var supportToggle = document.getElementById('supportToggle');
  if (supportTab && supportToggle) {
    supportToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      supportTab.classList.toggle('open');
    });
    document.addEventListener('click', function (e) {
      if (supportTab.classList.contains('open') && !supportTab.contains(e.target)) {
        supportTab.classList.remove('open');
      }
    });
  }

  // Subtle scroll-reveal for section headers and cards
  var revealTargets = document.querySelectorAll('.section-head, .card, .card-white, .team-card, .blog-post, .stat');
  if ('IntersectionObserver' in window && revealTargets.length) {
    revealTargets.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          var counters = entry.target.querySelectorAll('[data-count]');
          counters.forEach(animateCount);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('[data-count]').forEach(animateCount);
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    var suffix = el.getAttribute('data-suffix') || '';
    var pad2 = el.getAttribute('data-format') === 'pad2';
    var duration = 1100;
    var start = null;
    function ease(t) { return 1 - Math.pow(1 - t, 3); }
    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var value = Math.round(ease(progress) * target);
      var text = pad2 ? String(value).padStart(2, '0') : String(value);
      el.textContent = text + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Sticky quote bar — show after scrolling past the hero
  var stickyQuote = document.getElementById('stickyQuote');
  if (stickyQuote) {
    var ticking = false;
    function updateStickyQuote() {
      var threshold = window.innerHeight * 0.7;
      stickyQuote.classList.toggle('show', window.scrollY > threshold);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(updateStickyQuote);
        ticking = true;
      }
    });
    updateStickyQuote();
  }
});
