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
});
