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
  let stockFilter = ''; // '' | 'low' | 'empty' | 'full'

  function render() {
    const container = document.getElementById('main-content');
    const inventory = Storage.getInventory();

    const allCocktails = [...COCKTAILS, ...Storage.getCustomRecipes()];
    let canMake = 0;
    allCocktails.forEach(c => {
      if (Availability.check(c, inventory).status === 'available') canMake++;
    });

    // Low stock count
    let lowCount = 0;
    inventory.forEach(item => {
      const bs = getBottleSize(item);
      const pct = getFillPercent(item.amount, bs);
      if (pct <= 25 && pct > 0) lowCount++;
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
            <div class="stat-number" style="color:var(--coral)">${lowCount}</div>
            <div class="stat-label">Low Stock</div>
          </div>
        </div>

        <div class="inv-toolbar">
          <div class="inv-search-wrap">
            <input type="text" id="inv-search" class="inv-search" placeholder="Search inventory..." value="${searchTerm}">
          </div>
          <div class="inv-stock-filters">
            <button class="inv-stock-chip${stockFilter === '' ? ' active' : ''}" data-stock="">Alles</button>
            <button class="inv-stock-chip${stockFilter === 'low' ? ' active' : ''}" data-stock="low">⚠ Bijhalen</button>
            <button class="inv-stock-chip${stockFilter === 'almost' ? ' active' : ''}" data-stock="almost">Bijna leeg</button>
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
      // Stock filter
      if (stockFilter) {
        const bs = getBottleSize(item);
        const pct = getFillPercent(item.amount, bs);
        if (stockFilter === 'low' && pct > 25) return;
        if (stockFilter === 'almost' && pct > 45) return;
      }
      const cat = ingredient.category;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push({ ...item, ingredient });
    });

    const categoryOrder = ['spirit', 'liqueur', 'mixer', 'juice', 'syrup', 'bitters', 'fresh'];

    return categoryOrder
      .filter(cat => grouped[cat] && grouped[cat].length > 0)
      .map(cat => {
        const items = grouped[cat].sort((a, b) => {
          if (a.ingredientId !== b.ingredientId) return a.ingredient.name.localeCompare(b.ingredient.name);
          return (a.brand || '').localeCompare(b.brand || '') || (a.variant || '').localeCompare(b.variant || '');
        });
        return `
          <div class="inv-category" id="inv-cat-${cat}" data-category="${cat}">
            <div class="inv-category-label">${INGREDIENT_CATEGORIES[cat]} <span class="inv-category-count">${items.length}</span></div>
            <div class="inv-category-body inv-grid">
              ${items.map(renderItem).join('')}
            </div>
          </div>`;
      }).join('');
  }

  function renderItem(item) {
    const bottleSize = getBottleSize(item);
    const percent = getFillPercent(item.amount, bottleSize);
    const fillColor = getFillColor(percent);
    const uid = item.uid;

    const variantLabel = item.variant && item.variant !== 'Origineel' ? item.variant : '';
    const brandLabel = item.brand || '';
    const sub = [brandLabel, variantLabel].filter(Boolean).join(' · ');

    return `
      <div class="inv-item" data-uid="${uid}">
        <div class="inv-item-compact">
          <div class="inv-item-info">
            <div class="inv-item-name">${item.ingredient.name}</div>
            ${sub ? `<div class="inv-item-sub">${sub}</div>` : ''}
          </div>
          <span class="inv-item-pct" style="color:${fillColor}" data-uid="${uid}">${percent}%</span>
          <div class="inv-mini-bar"><div class="inv-mini-fill" style="width:${percent}%;background:${fillColor}"></div></div>
        </div>
        <div class="inv-item-expand" data-uid="${uid}">
          <div class="inv-expand-controls">
            <button class="inv-pct-btn" data-action="decrease" data-uid="${uid}">\u2212</button>
            <span class="inv-expand-pct" data-uid="${uid}">${percent}%</span>
            <button class="inv-pct-btn" data-action="increase" data-uid="${uid}">+</button>
          </div>
          <div class="inv-bottle-detail">${item.amount} / ${bottleSize} ${item.unit}</div>
          <div class="inv-expand-actions">
            <button class="inv-edit-btn" data-uid="${uid}" title="Edit">\u270e Edit</button>
            <button class="inv-delete-btn" data-uid="${uid}" title="Remove">\u2715 Verwijderen</button>
          </div>
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

    // Stock filter chips
    document.querySelectorAll('.inv-stock-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        stockFilter = chip.dataset.stock;
        const catContainer = document.getElementById('inv-categories');
        if (catContainer) catContainer.innerHTML = renderCategories(Storage.getInventory());
        document.querySelectorAll('.inv-stock-chip').forEach(c => c.classList.toggle('active', c.dataset.stock === stockFilter));
        rebindItemEvents();
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
    // Tap item to expand/collapse
    document.querySelectorAll('.inv-item-compact').forEach(compact => {
      compact.addEventListener('click', () => {
        const item = compact.closest('.inv-item');
        const wasOpen = item.classList.contains('expanded');
        document.querySelectorAll('.inv-item.expanded').forEach(el => el.classList.remove('expanded'));
        if (!wasOpen) item.classList.add('expanded');
      });
    });

    // Inline +/- percentage buttons (in expanded view)
    document.querySelectorAll('.inv-pct-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const uid = btn.dataset.uid;
        const action = btn.dataset.action;
        const inventory = Storage.getInventory();
        const item = inventory.find(i => i.uid === uid);
        if (!item) return;
        const bottleSize = getBottleSize(item);
        const currentPct = getFillPercent(item.amount, bottleSize);
        const newPct = action === 'increase' ? Math.min(100, currentPct + 5) : Math.max(0, currentPct - 5);
        const newAmount = Math.round(bottleSize * newPct / 100);
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
        const expandArea = row.querySelector('.inv-item-expand');
        const form = document.createElement('div');
        form.className = 'inv-edit-form';
        form.innerHTML = `
          <div class="inv-edit-fields">
            <label>Brand <input type="text" class="inv-edit-input" data-field="brand" value="${item.brand || ''}"></label>
            <label>Variant / Smaak <input type="text" class="inv-edit-input" data-field="variant" value="${item.variant || ''}"></label>
            <button class="inv-edit-save inventory-btn">Save</button>
            <button class="inv-edit-cancel inv-amount-btn">&#10005;</button>
          </div>`;
        expandArea.appendChild(form);
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
    const pctEl = row.querySelector('.inv-item-pct');
    const expandPct = row.querySelector('.inv-expand-pct');
    const miniFill = row.querySelector('.inv-mini-fill');
    const detail = row.querySelector('.inv-bottle-detail');
    if (pctEl) { pctEl.textContent = percent + '%'; pctEl.style.color = fillColor; }
    if (expandPct) { expandPct.textContent = percent + '%'; }
    if (miniFill) { miniFill.style.width = percent + '%'; miniFill.style.background = fillColor; }
    if (detail) detail.textContent = amount + ' / ' + bottleSize + ' ' + unit;
  }

  return { render };
})();
