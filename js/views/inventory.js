/* ===== Inventory View ===== */
const InventoryView = (() => {

  const BOTTLE_SIZES = { ml: 700, pcs: 10, g: 200, dash: 30 };

  function getBottleSize(item) {
    return item.bottleSize || BOTTLE_SIZES[item.unit] || 700;
  }

  function getFillPercent(amount, bottleSize) {
    if (bottleSize <= 0) return 0;
    const raw = (amount / bottleSize) * 100;
    return Math.min(100, Math.round(raw / 5) * 5);
  }

  function getFillLabel(percent) {
    if (percent >= 100) return 'Full';
    if (percent <= 0) return 'Empty';
    return percent + '%';
  }

  function getFillColor(percent) {
    if (percent >= 50) return 'var(--turquoise)';
    if (percent >= 25) return 'var(--gold)';
    return 'var(--coral)';
  }

  let searchTerm = '';

  function render() {
    const container = document.getElementById('main-content');
    const inventory = Storage.getInventory();

    const allCocktails = [...COCKTAILS, ...Storage.getCustomRecipes()];
    let canMake = 0;
    allCocktails.forEach(c => {
      if (Availability.check(c, inventory).status === 'available') canMake++;
    });

    // Category counts for nav
    const catCounts = {};
    inventory.forEach(item => {
      const ing = getIngredientById(item.ingredientId);
      if (ing) catCounts[ing.category] = (catCounts[ing.category] || 0) + 1;
    });

    const categoryOrder = ['spirit', 'liqueur', 'mixer', 'juice', 'syrup', 'bitters', 'fresh'];
    const catNav = categoryOrder
      .filter(c => catCounts[c])
      .map(c => `<a class="inv-nav-link" href="#inv-cat-${c}">${INGREDIENT_CATEGORIES[c]} <span class="inv-nav-count">${catCounts[c]}</span></a>`)
      .join('');

    container.innerHTML = `
      <div class="inventory-page">
        <div class="inventory-header">
          <h2>Your Inventory</h2>
          <div class="inventory-actions">
            <button class="inventory-btn scan-btn" id="inv-scan-btn">📷 Scan Fles</button>
            <button class="inventory-btn" id="inv-add-toggle">+ Add</button>
          </div>
        </div>

        <div class="inv-summary">
          <div class="inv-summary-stat">
            <div class="stat-number">${inventory.length}</div>
            <div class="stat-label">Items</div>
          </div>
          <div class="inv-summary-stat">
            <div class="stat-number" style="color:var(--turquoise)">${canMake}</div>
            <div class="stat-label">Can Make</div>
          </div>
          <div class="inv-summary-stat">
            <div class="stat-number">${allCocktails.length}</div>
            <div class="stat-label">Recipes</div>
          </div>
        </div>

        <div class="inv-toolbar">
          <div class="inv-search-wrap">
            <input type="text" id="inv-search" class="inv-search" placeholder="Search inventory..." value="${searchTerm}">
          </div>
          ${catNav ? `<div class="inv-cat-nav">${catNav}</div>` : ''}
        </div>

        <div id="inv-add-panel" class="inv-add-panel hidden">
          ${renderAddForm()}
        </div>

        <div id="inv-categories">
          ${renderCategories(inventory)}
        </div>

        ${inventory.length === 0 ? `
          <div class="empty-state">
            <span class="deco-diamond">&#9670;</span>
            <h3>Your inventory is empty</h3>
            <p>Add ingredients to see which cocktails you can make!</p>
          </div>
        ` : ''}
      </div>
    `;

    bindEvents();
  }

  function renderAddForm() {
    const options = INGREDIENTS
      .map(i => `<option value="${i.id}" data-unit="${i.defaultUnit}">${i.name}</option>`)
      .join('');

    return `
      <h3>Add to Inventory</h3>
      <form class="inv-add-form" id="inv-add-form">
        <div class="inv-add-field" style="flex:2;min-width:200px">
          <label>Ingredient</label>
          <select id="inv-add-ingredient" required>
            <option value="">Select...</option>
            ${options}
          </select>
        </div>
        <div class="inv-add-field" style="flex:1;min-width:80px">
          <label>Bottle Size</label>
          <input type="number" id="inv-add-bottle" min="1" step="1" value="700">
        </div>
        <div class="inv-add-field" style="min-width:60px">
          <label>Unit</label>
          <input type="text" id="inv-add-unit" value="ml" readonly style="width:50px">
        </div>
        <div class="inv-add-field" style="flex:1;min-width:130px">
          <label>How full? <span id="inv-add-fill-val">100%</span></label>
          <input type="range" id="inv-add-fill" min="0" max="100" step="5" value="100" class="inv-range-slider">
        </div>
        <div class="inv-add-field" style="flex:1;min-width:100px">
          <label>Brand</label>
          <input type="text" id="inv-add-brand" placeholder="e.g. Hendrick's">
        </div>
        <div class="inv-add-field" style="flex:1;min-width:100px">
          <label>Variant / Smaak</label>
          <input type="text" id="inv-add-variant" value="Origineel" placeholder="e.g. Vanille, Origineel">
        </div>
        <button type="submit" class="inventory-btn">Add</button>
      </form>
    `;
  }

  function renderCategories(inventory) {
    const grouped = {};
    inventory.forEach(item => {
      const ingredient = getIngredientById(item.ingredientId);
      if (!ingredient) return;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const haystack = (ingredient.name + ' ' + (item.brand || '') + ' ' + (item.variant || '')).toLowerCase();
        if (!haystack.includes(q)) return;
      }
      const cat = ingredient.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({ ...item, ingredient });
    });

    const categoryOrder = ['spirit', 'liqueur', 'mixer', 'juice', 'syrup', 'bitters', 'fresh'];

    return categoryOrder
      .filter(cat => grouped[cat] && grouped[cat].length > 0)
      .map(cat => {
        const items = grouped[cat];
        return `
          <div class="inv-category" id="inv-cat-${cat}" data-category="${cat}">
            <div class="inv-category-header">
              <span class="inv-category-title">
                ${INGREDIENT_CATEGORIES[cat]}
                <span class="inv-category-count">${items.length}</span>
              </span>
              <span class="inv-category-toggle">&#9660;</span>
            </div>
            <div class="inv-category-body">
              ${items.map(renderItem).join('')}
            </div>
          </div>`;
      }).join('');
  }

  function renderItem(item) {
    const bottleSize = getBottleSize(item);
    const percent = getFillPercent(item.amount, bottleSize);
    const fillColor = getFillColor(percent);
    const fillLabel = getFillLabel(percent);
    const uid = item.uid;

    const subtitleParts = [];
    if (item.brand) subtitleParts.push(item.brand);
    if (item.variant) subtitleParts.push(item.variant);
    const subtitle = subtitleParts.join(' \u00b7 ');

    return `
      <div class="inv-item" data-uid="${uid}">
        <div class="inv-item-left">
          <div class="inv-item-name">
            ${item.ingredient.name}
            ${subtitle ? `<span class="inv-item-brand">${subtitle}</span>` : ''}
          </div>
          <div class="inv-bottle-bar">
            <div class="inv-bottle-track">
              <div class="inv-bottle-fill" style="width:${percent}%;background:${fillColor}"></div>
            </div>
            <span class="inv-bottle-label" style="color:${fillColor}">${fillLabel} \u00b7 ${percent}%</span>
          </div>
          <div class="inv-bottle-detail">${item.amount} / ${bottleSize} ${item.unit}</div>
        </div>
        <div class="inv-item-right">
          <div class="inv-fill-slider-wrap" data-uid="${uid}" data-bottle="${bottleSize}">
            <input type="range" class="inv-range-slider inv-fill-range" min="0" max="100" step="5" value="${percent}" data-uid="${uid}">
          </div>
          <div class="inv-amount-controls">
            <button class="inv-amount-btn" data-action="decrease" data-uid="${uid}" data-step="5">\u2212</button>
            <input class="inv-amount-input" type="number" min="0" max="100" step="5" value="${percent}" data-uid="${uid}" data-bottle="${bottleSize}">
            <span class="inv-amount-unit">%</span>
            <button class="inv-amount-btn" data-action="increase" data-uid="${uid}" data-step="5">+</button>
          </div>
          <button class="inv-edit-btn" data-uid="${uid}" title="Edit">\u270e</button>
          <button class="inv-delete-btn" data-uid="${uid}" title="Remove">\u2715</button>
        </div>
      </div>`;
  }

  function bindEvents() {
    // Search
    const searchInput = document.getElementById('inv-search');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          searchTerm = searchInput.value.trim();
          const catContainer = document.getElementById('inv-categories');
          if (catContainer) catContainer.innerHTML = renderCategories(Storage.getInventory());
          rebindItemEvents();
        }, 200);
      });
    }

    // Category nav smooth scroll
    document.querySelectorAll('.inv-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const id = link.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Toggle add panel
    const addToggle = document.getElementById('inv-add-toggle');
    const addPanel = document.getElementById('inv-add-panel');
    if (addToggle && addPanel) {
      addToggle.addEventListener('click', () => addPanel.classList.toggle('hidden'));
    }

    // Scan bottle button
    const scanBtn = document.getElementById('inv-scan-btn');
    if (scanBtn) {
      scanBtn.addEventListener('click', () => BottleScanner.open());
    }

    // Add form
    const form = document.getElementById('inv-add-form');
    if (form) {
      const ingredientSelect = document.getElementById('inv-add-ingredient');
      const unitInput = document.getElementById('inv-add-unit');
      const bottleInput = document.getElementById('inv-add-bottle');
      const fillSlider = document.getElementById('inv-add-fill');
      const fillValLabel = document.getElementById('inv-add-fill-val');

      ingredientSelect.addEventListener('change', () => {
        const opt = ingredientSelect.selectedOptions[0];
        if (opt && opt.dataset.unit) {
          unitInput.value = opt.dataset.unit;
          bottleInput.value = opt.dataset.unit === 'pcs' ? '10' : opt.dataset.unit === 'g' ? '200' : '700';
        }
      });

      if (fillSlider && fillValLabel) {
        fillSlider.addEventListener('input', () => fillValLabel.textContent = fillSlider.value + '%');
      }

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const ingredientId = ingredientSelect.value;
        const bottleSize = parseFloat(bottleInput.value) || 700;
        const fillPct = parseInt(fillSlider.value) || 100;
        const amount = Math.round(bottleSize * fillPct / 100);
        const unit = unitInput.value;
        const brand = document.getElementById('inv-add-brand').value.trim();
        const variant = document.getElementById('inv-add-variant').value.trim();
        if (!ingredientId || amount <= 0) return;
        Storage.addInventoryItem(ingredientId, amount, unit, brand, bottleSize, variant);
        render();
      });
    }

    rebindItemEvents();
  }

  function rebindItemEvents() {
    // Category collapse toggle
    document.querySelectorAll('.inv-category-header').forEach(header => {
      header.addEventListener('click', () => header.parentElement.classList.toggle('collapsed'));
    });

    // Fill range sliders
    document.querySelectorAll('.inv-fill-range').forEach(slider => {
      slider.addEventListener('input', () => {
        const uid = slider.dataset.uid;
        const wrap = slider.closest('.inv-fill-slider-wrap');
        const bottleSize = parseInt(wrap.dataset.bottle);
        const fillPct = parseInt(slider.value);
        const newAmount = Math.round(bottleSize * fillPct / 100);
        Storage.updateInventoryItem(uid, newAmount);
        updateItemRow(uid, newAmount, bottleSize);
        if (newAmount <= 0) render();
      });
    });

    // Amount buttons (+/- in percentage steps)
    document.querySelectorAll('.inv-amount-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.uid;
        const action = btn.dataset.action;
        const step = parseInt(btn.dataset.step) || 5;
        const inventory = Storage.getInventory();
        const item = inventory.find(i => i.uid === uid);
        if (!item) return;
        const bottleSize = getBottleSize(item);
        const currentPct = getFillPercent(item.amount, bottleSize);
        const newPct = action === 'increase' ? Math.min(100, currentPct + step) : Math.max(0, currentPct - step);
        const newAmount = Math.round(bottleSize * newPct / 100);
        Storage.updateInventoryItem(uid, newAmount);
        updateItemRow(uid, newAmount, bottleSize);
        if (newAmount <= 0) render();
      });
    });

    // Direct input change (percentage-based)
    document.querySelectorAll('.inv-amount-input').forEach(input => {
      input.addEventListener('change', () => {
        const uid = input.dataset.uid;
        const pct = Math.min(100, Math.max(0, Math.round((parseFloat(input.value) || 0) / 5) * 5));
        const bottleSize = parseInt(input.dataset.bottle) || 700;
        const newAmount = Math.round(bottleSize * pct / 100);
        Storage.updateInventoryItem(uid, newAmount);
        updateItemRow(uid, newAmount, bottleSize);
        if (newAmount <= 0) render();
      });
    });

    // Edit buttons
    document.querySelectorAll('.inv-edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const uid = btn.dataset.uid;
        const inventory = Storage.getInventory();
        const item = inventory.find(i => i.uid === uid);
        if (!item) return;
        const row = document.querySelector(`.inv-item[data-uid="${uid}"]`);
        if (!row || row.querySelector('.inv-edit-form')) return;
        const left = row.querySelector('.inv-item-left');
        const form = document.createElement('div');
        form.className = 'inv-edit-form';
        form.innerHTML = `
          <div class="inv-edit-fields">
            <label>Brand <input type="text" class="inv-edit-input" data-field="brand" value="${item.brand || ''}"></label>
            <label>Variant / Smaak <input type="text" class="inv-edit-input" data-field="variant" value="${item.variant || ''}"></label>
            <button class="inv-edit-save inventory-btn">Save</button>
            <button class="inv-edit-cancel inv-amount-btn">&#10005;</button>
          </div>`;
        left.appendChild(form);
        form.querySelector('.inv-edit-save').addEventListener('click', () => {
          const brand = form.querySelector('[data-field="brand"]').value.trim();
          const variant = form.querySelector('[data-field="variant"]').value.trim();
          Storage.updateInventoryItem(uid, item.amount, item.unit, brand, item.bottleSize, variant);
          render();
        });
        form.querySelector('.inv-edit-cancel').addEventListener('click', () => form.remove());
      });
    });

    // Delete buttons
    document.querySelectorAll('.inv-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Storage.removeInventoryItem(btn.dataset.uid);
        render();
      });
    });
  }

  function updateItemRow(uid, amount, bottleSize) {
    const row = document.querySelector(`.inv-item[data-uid="${uid}"]`);
    if (!row) return;
    const inventory = Storage.getInventory();
    const item = inventory.find(i => i.uid === uid);
    const unit = item ? item.unit : 'ml';
    const percent = getFillPercent(amount, bottleSize);
    const fillColor = getFillColor(percent);
    const fillLabel = getFillLabel(percent);
    const fill = row.querySelector('.inv-bottle-fill');
    const label = row.querySelector('.inv-bottle-label');
    const detail = row.querySelector('.inv-bottle-detail');
    const input = row.querySelector('.inv-amount-input');
    const slider = row.querySelector('.inv-fill-range');
    if (fill) { fill.style.width = percent + '%'; fill.style.background = fillColor; }
    if (label) { label.textContent = fillLabel + ' \u00b7 ' + percent + '%'; label.style.color = fillColor; }
    if (detail) detail.textContent = amount + ' / ' + bottleSize + ' ' + unit;
    if (input) input.value = percent;
    if (slider) slider.value = percent;
  }

  return { render };
})();
