(function () {
  var count = 247;
  var emailEl, counterEl, confirmEl;

  function join() {
    var email = emailEl.value;
    if (!email || email.indexOf('@') === -1) {
      emailEl.style.borderColor = '#dc2626';
      return;
    }
    emailEl.style.borderColor = '';
    count++;
    counterEl.textContent = count;
    emailEl.value = '';
    confirmEl.classList.add('show');
  }

  function init() {
    emailEl = document.getElementById('email');
    counterEl = document.getElementById('counter');
    confirmEl = document.getElementById('confirm');
    var btn = document.getElementById('joinBtn');
    if (btn) btn.addEventListener('click', join);
    if (emailEl) {
      emailEl.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') join();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
