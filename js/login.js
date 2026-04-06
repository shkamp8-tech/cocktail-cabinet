/* ===== PIN Login Gate ===== */
const Login = (() => {
  const PIN = '0000';
  const SESSION_KEY = 'cocktail-cabinet-auth';

  function isAuthenticated() {
    return sessionStorage.getItem(SESSION_KEY) === 'ok';
  }

  function show() {
    if (isAuthenticated()) return false; // already logged in

    const overlay = document.createElement('div');
    overlay.className = 'login-overlay';
    overlay.id = 'login-overlay';
    overlay.innerHTML = `
      <div class="login-card">
        <span class="logo-diamond">◆</span>
        <h1>The Cocktail Cabinet</h1>
        <p>Enter PIN to continue</p>
        <div class="pin-inputs">
          <input type="number" inputmode="numeric" maxlength="1" min="0" max="9" autocomplete="off">
          <input type="number" inputmode="numeric" maxlength="1" min="0" max="9" autocomplete="off">
          <input type="number" inputmode="numeric" maxlength="1" min="0" max="9" autocomplete="off">
          <input type="number" inputmode="numeric" maxlength="1" min="0" max="9" autocomplete="off">
        </div>
        <div class="login-error" id="login-error">Incorrect PIN</div>
      </div>
    `;
    document.body.prepend(overlay);
    bindPinInputs(overlay);
    // Focus first input
    setTimeout(() => overlay.querySelector('.pin-inputs input').focus(), 100);
    return true; // showed login
  }

  function bindPinInputs(overlay) {
    const inputs = overlay.querySelectorAll('.pin-inputs input');

    inputs.forEach((inp, i) => {
      inp.addEventListener('input', () => {
        // Keep only last digit
        if (inp.value.length > 1) inp.value = inp.value.slice(-1);
        if (inp.value && i < inputs.length - 1) {
          inputs[i + 1].focus();
        }
        // Check if all filled
        const code = [...inputs].map(el => el.value).join('');
        if (code.length === 4) {
          if (code === PIN) {
            sessionStorage.setItem(SESSION_KEY, 'ok');
            overlay.style.transition = 'opacity 0.3s ease';
            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
          } else {
            // Wrong PIN
            const err = document.getElementById('login-error');
            err.classList.add('visible');
            inputs.forEach(el => el.classList.add('shake'));
            setTimeout(() => {
              inputs.forEach(el => {
                el.classList.remove('shake');
                el.value = '';
              });
              inputs[0].focus();
              err.classList.remove('visible');
            }, 800);
          }
        }
      });

      inp.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !inp.value && i > 0) {
          inputs[i - 1].focus();
        }
      });

      // Handle paste
      inp.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 4);
        pasted.split('').forEach((ch, idx) => {
          if (inputs[idx]) inputs[idx].value = ch;
        });
        const last = Math.min(pasted.length, 4) - 1;
        if (inputs[last]) inputs[last].focus();
        inputs[last]?.dispatchEvent(new Event('input'));
      });
    });
  }

  return { show, isAuthenticated };
})();
