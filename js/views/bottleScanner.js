/* ===== Bottle Scanner — Camera + AI Recognition ===== */
const BottleScanner = (() => {
  const API_KEY_STORAGE = 'cocktail-cabinet-openai-key';
  const _k = atob('c2stcHJvai1jcjRzSlI4THgtVWU0QnUtVlR6QkVfTngzaVh3UXdZWnlyWk5LWnRlNlNxZVVadmpRU0RmMndUNWk5VVI1R1FNOGcwalN2elJ0RlQzQmxia0ZKTlpJMjJLY3dQRDhQN055NlJFZzNqbnhUNG9jZzQyVTFzbjc0a0g5TC1CLXRfU1k5cHpBemZjV193TTZMMWxlTFVUN3ZoS2FRb0E=');
  let stream = null;

  /* ---------- Public ---------- */

  function open() {
    showCamera();
  }

  function getApiKey() {
    return localStorage.getItem(API_KEY_STORAGE) || _k;
  }

  function setApiKey(key) {
    localStorage.setItem(API_KEY_STORAGE, key.trim());
  }

  /* ---------- API Key Prompt ---------- */

  function showApiKeyPrompt(onSuccess) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div class="scanner-apikey-prompt">
        <button class="modal-close" id="scanner-close-key">&times;</button>
        <h3>OpenAI API Key</h3>
        <p>To scan bottles, enter your OpenAI API key. This is stored locally on your device only.</p>
        <input type="password" id="scanner-key-input" class="scanner-input" placeholder="sk-..." value="${getApiKey()}">
        <div class="scanner-actions">
          <button class="scanner-btn secondary" id="scanner-cancel-key">Cancel</button>
          <button class="scanner-btn primary" id="scanner-save-key">Save & Continue</button>
        </div>
      </div>
    `;
    openModal();

    document.getElementById('scanner-close-key').onclick =
    document.getElementById('scanner-cancel-key').onclick = () => {
      closeModal();
    };

    document.getElementById('scanner-save-key').onclick = () => {
      const val = document.getElementById('scanner-key-input').value.trim();
      if (!val) return;
      setApiKey(val);
      closeModal();
      if (onSuccess) setTimeout(onSuccess, 350);
    };
  }

  /* ---------- Camera ---------- */

  function showCamera() {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');
    content.innerHTML = `
      <div class="scanner-camera">
        <button class="modal-close" id="scanner-close-cam">&times;</button>
        <h3>Scan Bottle</h3>
        <p class="scanner-hint">Take a clear photo of the bottle label</p>
        <div class="scanner-viewfinder">
          <video id="scanner-video" autoplay playsinline></video>
          <canvas id="scanner-canvas" style="display:none"></canvas>
          <div class="scanner-frame"></div>
        </div>
        <div class="scanner-actions">
          <button class="scanner-btn secondary" id="scanner-cancel-cam">Cancel</button>
          <button class="scanner-btn primary" id="scanner-capture">
            <span class="capture-circle"></span> Capture
          </button>
        </div>
        <label class="scanner-upload-label">
          Or upload a photo
          <input type="file" accept="image/*" id="scanner-upload" hidden>
        </label>
      </div>
    `;
    openModal();

    // Start camera
    startCamera();

    document.getElementById('scanner-close-cam').onclick =
    document.getElementById('scanner-cancel-cam').onclick = () => {
      stopCamera();
      closeModal();
    };

    document.getElementById('scanner-capture').onclick = capturePhoto;

    document.getElementById('scanner-upload').onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        stopCamera();
        processImage(ev.target.result);
      };
      reader.readAsDataURL(file);
    };
  }

  async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } }
      });
      const video = document.getElementById('scanner-video');
      if (video) video.srcObject = stream;
    } catch (err) {
      console.error('Camera error:', err);
      // Fallback: show upload only
      const vf = document.querySelector('.scanner-viewfinder');
      if (vf) vf.innerHTML = '<p class="scanner-error">Camera not available.<br>Please upload a photo instead.</p>';
      const captureBtn = document.getElementById('scanner-capture');
      if (captureBtn) captureBtn.style.display = 'none';
    }
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      stream = null;
    }
  }

  function capturePhoto() {
    const video = document.getElementById('scanner-video');
    const canvas = document.getElementById('scanner-canvas');
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 960;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    processImage(dataUrl);
  }

  /* ---------- AI Recognition ---------- */

  async function processImage(base64DataUrl) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    // Show loading
    content.innerHTML = `
      <div class="scanner-loading">
        <div class="scanner-spinner"></div>
        <h3>Analyzing bottle...</h3>
        <p>AI is identifying the brand, type, and fill level</p>
      </div>
    `;

    try {
      const result = await callOpenAI(base64DataUrl);
      showReview(result, base64DataUrl);
    } catch (err) {
      content.innerHTML = `
        <div class="scanner-error-screen">
          <button class="modal-close" id="scanner-close-err">&times;</button>
          <h3>Error</h3>
          <p>${escapeHtml(err.message)}</p>
          <div class="scanner-actions">
            <button class="scanner-btn secondary" id="scanner-retry">Try Again</button>
            <button class="scanner-btn secondary" id="scanner-close-err2">Close</button>
          </div>
        </div>
      `;
      document.getElementById('scanner-close-err').onclick =
      document.getElementById('scanner-close-err2').onclick = () => closeModal();
      document.getElementById('scanner-retry').onclick = () => showCamera();
    }
  }

  async function callOpenAI(base64DataUrl) {
    const apiKey = getApiKey();
    if (!apiKey) throw new Error('No API key configured');

    // Build the ingredient list for context
    const ingredientList = INGREDIENTS
      .filter(i => i.category === 'spirit' || i.category === 'liqueur' || i.category === 'syrup')
      .map(i => `${i.id}: ${i.name} (${i.category})`)
      .join('\n');

    const systemPrompt = `You are an expert bartender and bottle recognition AI. The user sends a photo of a bottle — this can be a spirit, liqueur, or syrup (e.g. Monin, Teisseire). Analyze the photo and return a JSON object with the following fields:

- "ingredientId": The best matching ID from the ingredient list below. If no exact match, pick the closest category or return null.
- "name": The display name (e.g. "Melon Liqueur", "Bourbon", "Gin", "Simple Syrup", "Vanilla Syrup")
- "category": Either "spirit", "liqueur", or "syrup"
- "brand": The brand name visible on the bottle (e.g. "Midori", "Hendrick's", "Monin", "Teisseire")
- "variant": The specific variant/edition/flavor (e.g. "Honey", "Apple", "Vanilla", "Peach"). For syrups the flavor IS the variant — always fill this in. Use "Origineel" only if it's a plain/unflavored standard version.
- "fillPercent": Estimated fill level of the bottle as a number 0-100, rounded to nearest 5. Estimate based on liquid visible in the bottle.
- "bottleSize": Estimated bottle size in ml (common: 350, 500, 700, 750, 1000)
- "confidence": Your confidence level: "high", "medium", or "low"

Known ingredient IDs:
${ingredientList}

If the bottle doesn't match any known ingredient, still fill in category, brand, variant, and estimate fill. Set ingredientId to the closest match or null.

IMPORTANT: Only return valid JSON, no markdown, no explanation.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        max_tokens: 500,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Identify this bottle and estimate how full it is.' },
              { type: 'image_url', image_url: { url: base64DataUrl, detail: 'low' } }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody?.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    // Strip markdown fences if present
    const cleaned = text.replace(/```json\s*/g, '').replace(/```/g, '').trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      throw new Error('Could not parse AI response: ' + text.slice(0, 200));
    }
  }

  /* ---------- Review Screen ---------- */

  function showReview(result, imageDataUrl) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    // Build ingredient options
    const scannable = INGREDIENTS.filter(i => i.category === 'spirit' || i.category === 'liqueur' || i.category === 'syrup');
    const optionsHtml = scannable.map(i => {
      const sel = i.id === result.ingredientId ? 'selected' : '';
      return `<option value="${i.id}" ${sel}>${i.name} (${i.category})</option>`;
    }).join('');

    const fillPct = Math.round((result.fillPercent || 50) / 5) * 5;
    const bottleSize = result.bottleSize || 700;

    content.innerHTML = `
      <div class="scanner-review">
        <button class="modal-close" id="scanner-close-review">&times;</button>
        <h3>Review Scan Result</h3>
        ${result.confidence === 'low' ? '<p class="scanner-warning">⚠ Low confidence — please verify</p>' : ''}

        <div class="scanner-review-split">
          <div class="scanner-preview">
            <img src="${imageDataUrl}" alt="Bottle photo">
          </div>
          <div class="scanner-review-fields">
            <label>
              Ingredient
              <select id="sr-ingredient" class="scanner-input">${optionsHtml}</select>
            </label>
            <label>
              Brand
              <input type="text" id="sr-brand" class="scanner-input" value="${escapeAttr(result.brand || '')}">
            </label>
            <label>
              Variant / Smaak
              <input type="text" id="sr-variant" class="scanner-input" value="${escapeAttr(result.variant || 'Origineel')}">
            </label>
            <label>
              Bottle Size (ml)
              <input type="number" id="sr-bottle-size" class="scanner-input" value="${bottleSize}" step="50" min="50" max="3000">
            </label>
            <label>
              Fill Level: <strong id="sr-fill-label">${fillPct}%</strong>
              <input type="range" id="sr-fill" class="scanner-range" min="0" max="100" step="5" value="${fillPct}">
            </label>
          </div>
        </div>

        <div class="scanner-actions">
          <button class="scanner-btn danger" id="sr-cancel">Cancel</button>
          <button class="scanner-btn secondary" id="sr-rescan">Rescan</button>
          <button class="scanner-btn primary" id="sr-confirm">Add to Inventory</button>
        </div>
      </div>
    `;

    // Fill slider label sync
    document.getElementById('sr-fill').oninput = (e) => {
      document.getElementById('sr-fill-label').textContent = e.target.value + '%';
    };

    document.getElementById('scanner-close-review').onclick =
    document.getElementById('sr-cancel').onclick = () => {
      closeModal();
    };

    document.getElementById('sr-rescan').onclick = () => showCamera();

    document.getElementById('sr-confirm').onclick = () => {
      const ingredientId = document.getElementById('sr-ingredient').value;
      const brand = document.getElementById('sr-brand').value.trim();
      const variant = document.getElementById('sr-variant').value.trim() || 'Origineel';
      const bottleSizeVal = parseInt(document.getElementById('sr-bottle-size').value) || 700;
      const fillVal = parseInt(document.getElementById('sr-fill').value) || 50;
      const amount = Math.round(bottleSizeVal * fillVal / 100);
      const ing = getIngredientById(ingredientId);
      const unit = ing ? ing.defaultUnit : 'ml';

      Storage.addInventoryItem(ingredientId, amount, unit, brand, bottleSizeVal, variant);

      closeModal();

      // Refresh inventory if we're on that view
      if (typeof InventoryView !== 'undefined') {
        InventoryView.render();
      }
    };
  }

  /* ---------- Helpers ---------- */

  function openModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => overlay.classList.add('active'));
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => overlay.classList.add('hidden'), 300);
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  return { open, getApiKey, setApiKey, showApiKeyPrompt };
})();
