/* ===== Inventory View ===== */
const InventoryView = (() => {

  const BOTTLE_SIZES = { ml: 700, pcs: 10, g: 200, dash: 30 };

  /* Standard staples — always show on restock list when not in inventory */
  const STAPLE_INGREDIENTS = [
    'lemon-juice', 'lime-juice', 'simple-syrup', 'egg-white', 'lime', 'mint'
  ];

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
  let summaryView = ''; // '' | 'lowstock' | 'restock'
  const collapsedCats = new Set();

  /* ---------- Restock calculator ----------
     Finds ingredients you're SHORT on to make cocktails.
     Only counts missing amounts, not "running low in general". */

  function buildRestockList(inventory) {
    const allCocktails = [...COCKTAILS, ...(Storage.getCustomRecipes ? Storage.getCustomRecipes() : [])];

    // Sum available amounts per ingredientId
    const invMap = {};
    inventory.forEach(i => {
      if (!invMap[i.ingredientId]) invMap[i.ingredientId] = 0;
      invMap[i.ingredientId] += i.amount;
    });

    // For each cocktail, find which ingredients are short
    const shortMap = {}; // ingredientId → { needed (total gap), cocktails: Set }

    allCocktails.forEach(cocktail => {
      if (!cocktail.ingredients) return;
      cocktail.ingredients.forEach(ing => {
        const ingredient = getIngredientById(ing.ingredientId);
        if (ingredient && ingredient.category === 'garnish') return;

        const have = invMap[ing.ingredientId] || 0;
        if (have < ing.amount) {
          const gap = ing.amount - have;
          if (!shortMap[ing.ingredientId]) {
            shortMap[ing.ingredientId] = { needed: 0, cocktails: new Set() };
          }
          shortMap[ing.ingredientId].needed += gap;
          shortMap[ing.ingredientId].cocktails.add(cocktail.name);
        }
      });
    });

    // Always include staples that are either missing or very low
    STAPLE_INGREDIENTS.forEach(id => {
      const have = invMap[id] || 0;
      const ingredient = getIngredientById(id);
      if (!ingredient) return;
      // Consider "low" based on typical usage
      const threshold = ingredient.defaultUnit === 'pcs' ? 2 : 100;
      if (have < threshold && !shortMap[id]) {
        shortMap[id] = { needed: threshold - have, cocktails: new Set(['Staple']) };
      }
    });

    // Convert to sorted array
    const list = Object.entries(shortMap).map(([ingredientId, data]) => {
      const ingredient = getIngredientById(ingredientId);
      return {
        ingredientId,
        ingredient,
        needed: data.needed,
        cocktailCount: data.cocktails.size,
        cocktailNames: [...data.cocktails].slice(0, 4),
        isStaple: STAPLE_INGREDIENTS.includes(ingredientId),
        have: invMap[ingredientId] || 0
      };
    }).filter(x => x.ingredient);

    // Sort: most cocktails blocked first, then staples, then by needed amount
    list.sort((a, b) => {
      if (b.cocktailCount !== a.cocktailCount) return b.cocktailCount - a.cocktailCount;
      if (a.isStaple !== b.isStaple) return a.isStaple ? -1 : 1;
      return b.needed - a.needed;
    });

    return list;
  }

  function render() {
    const container = document.getElementById('main-content');
    const inventory = Storage.getInventory();

    const bottleCats = ['spirit', 'liqueur', 'syrup', 'bitters'];
    const bottleItems = inventory.filter(item => {
      const ing = getIngredientById(item.ingredientId);
      return ing && bottleCats.includes(ing.category);
    });

    // Restock count (ingredients SHORT for cocktails) and low stock count
    const restockList = buildRestockList(inventory);
    let restockCount = restockList.length;
    let lowCount = 0;
    bottleItems.forEach(item => {
      const bs = getBottleSize(item);
      const pct = getFillPercent(item.amount, bs);
      if (pct <= 25 && pct > 0) lowCount++;
    });



    container.innerHTML = `
      <div class="inventory-page">
        <div class="inventory-header">
          <h2>Your Inventory</h2>
          <div class="inventory-actions">
            <button class="inventory-btn scan-btn" id="inv-scan-btn">📷 Scan Bottle</button>
            <button class="inventory-btn" id="inv-add-toggle">+ Add</button>
          </div>
        </div>

        <div class="inv-summary">
          <div class="inv-summary-stat clickable" data-summary="items">
            <div class="stat-number">${bottleItems.length}</div>
            <div class="stat-label">Items</div>
          </div>
          <div class="inv-summary-stat clickable${summaryView === 'restock' ? ' active' : ''}" data-summary="restock">
            <div class="stat-number" style="color:var(--turquoise)">${restockCount}</div>
            <div class="stat-label">Restock</div>
          </div>
          <div class="inv-summary-stat clickable${summaryView === 'lowstock' ? ' active' : ''}" data-summary="lowstock">
            <div class="stat-number" style="color:var(--coral)">${lowCount}</div>
            <div class="stat-label">Low Stock</div>
          </div>
        </div>

        <div class="inv-toolbar">
          <div class="inv-search-wrap">
            <input type="text" id="inv-search" class="inv-search" placeholder="Search inventory..." value="${searchTerm}">
          </div>
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
          <label>Variant / Flavor</label>
          <input type="text" id="inv-add-variant" value="Origineel" placeholder="e.g. Vanilla, Original">
        </div>
        <button type="submit" class="inventory-btn">Add</button>
      </form>
    `;
  }

  function renderCategories(inventory) {
    // Restock view: ingredients needed to make cocktails
    if (summaryView === 'restock') {
      const restockList = buildRestockList(inventory);
      const filtered = searchTerm
        ? restockList.filter(r => {
            const q = searchTerm.toLowerCase();
            return r.ingredient.name.toLowerCase().includes(q) ||
                   r.cocktailNames.some(n => n.toLowerCase().includes(q));
          })
        : restockList;
      if (filtered.length === 0) return '<div class="empty-state"><p>Nothing to restock — you can make everything!</p></div>';

      return `
        <div class="inv-category">
          <div class="inv-category-label">Restock List <span class="inv-category-count">${filtered.length}</span></div>
          <div class="restock-list">
            ${filtered.map(r => renderRestockItem(r)).join('')}
          </div>
        </div>`;
    }

    // Low stock summary view: flat sorted list of spirits/liqueurs/syrups
    if (summaryView === 'lowstock') {
      const bottleCats = ['spirit', 'liqueur', 'syrup', 'bitters'];
      let items = [];
      inventory.forEach(item => {
        const ingredient = getIngredientById(item.ingredientId);
        if (!ingredient || !bottleCats.includes(ingredient.category)) return;
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const haystack = (ingredient.name + ' ' + (item.brand || '') + ' ' + (item.variant || '')).toLowerCase();
          if (!haystack.includes(q)) return;
        }
        const bs = getBottleSize(item);
        const pct = getFillPercent(item.amount, bs);
        items.push({ ...item, ingredient, _pct: pct });
      });
      items.sort((a, b) => a._pct - b._pct);
      if (items.length === 0) return '';
      return `
        <div class="inv-category">
          <div class="inv-category-label">Low Stock <span class="inv-category-count">${items.length}</span></div>
          <div class="inv-category-body inv-grid">
            ${items.map(renderItem).join('')}
          </div>
        </div>`;
    }

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
        const items = grouped[cat].sort((a, b) => {
          if (a.ingredientId !== b.ingredientId) return a.ingredient.name.localeCompare(b.ingredient.name);
          return (a.brand || '').localeCompare(b.brand || '') || (a.variant || '').localeCompare(b.variant || '');
        });
        const collapsed = collapsedCats.has(cat);
        const chevron = collapsed ? '&#9656;' : '&#9662;';
        return `
          <div class="inv-category${collapsed ? ' collapsed' : ''}" id="inv-cat-${cat}" data-category="${cat}">
            <div class="inv-category-label" data-cat-toggle="${cat}">
              <span class="inv-cat-chevron">${chevron}</span>
              ${INGREDIENT_CATEGORIES[cat]} <span class="inv-category-count">${items.length}</span>
            </div>
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

    const isSyrup = item.ingredient.category === 'syrup';
    const variantLabel = item.variant && item.variant !== 'Origineel' ? item.variant : '';
    const brandLabel = item.brand || '';
    const sub = isSyrup
      ? [variantLabel, brandLabel].filter(Boolean).join(' · ')
      : [brandLabel, variantLabel].filter(Boolean).join(' · ');

    const fullClass = percent >= 100 ? ' inv-item-full' : '';
    return `
      <div class="inv-item${fullClass}" data-uid="${uid}">
        <div class="inv-item-compact">
          <div class="inv-item-info">
            <div class="inv-item-name">${item.ingredient.name}</div>
            ${sub ? `<div class="inv-item-sub">${sub}</div>` : ''}
          </div>
          <span class="inv-item-pct" style="color:${fillColor}" data-uid="${uid}">${percent}%</span>
          <span class="inv-item-ml" data-uid="${uid}">${item.amount}/${bottleSize}</span>
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
            <button class="inv-delete-btn" data-uid="${uid}" title="Remove">\u2715 Remove</button>
          </div>
        </div>
      </div>`;
  }

  function renderRestockItem(r) {
    const unitLabel = r.ingredient.defaultUnit || 'ml';
    const haveLabel = r.have > 0 ? `${r.have} ${unitLabel}` : 'None';
    const stapleTag = r.isStaple ? '<span class="restock-staple">Staple</span>' : '';
    const cocktailList = r.cocktailNames.filter(n => n !== 'Staple');
    const cocktailLabel = cocktailList.length > 0
      ? cocktailList.join(', ') + (r.cocktailCount > cocktailList.length ? ` +${r.cocktailCount - cocktailList.length} more` : '')
      : '';
    const catLabel = INGREDIENT_CATEGORIES[r.ingredient.category] || r.ingredient.category;

    return `
      <div class="restock-item">
        <div class="restock-item-main">
          <div class="restock-item-name">${r.ingredient.name} ${stapleTag}</div>
          <div class="restock-item-cat">${catLabel}</div>
        </div>
        <div class="restock-item-detail">
          <div class="restock-item-have">Have: <strong>${haveLabel}</strong></div>
          <div class="restock-item-need">Need: <strong>~${Math.ceil(r.needed)} ${unitLabel}</strong></div>
        </div>
        ${cocktailLabel ? `<div class="restock-item-cocktails">Needed for: ${cocktailLabel}</div>` : ''}
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

    // Summary stat clicks
    document.querySelectorAll('.inv-summary-stat.clickable').forEach(stat => {
      stat.addEventListener('click', () => {
        const view = stat.dataset.summary;
        if (view === 'items') {
          summaryView = '';
        } else if (view === 'lowstock') {
          summaryView = summaryView === 'lowstock' ? '' : 'lowstock';
        } else if (view === 'restock') {
          summaryView = summaryView === 'restock' ? '' : 'restock';
        }
        const catContainer = document.getElementById('inv-categories');
        if (catContainer) catContainer.innerHTML = renderCategories(Storage.getInventory());
        document.querySelectorAll('.inv-summary-stat.clickable').forEach(s => {
          const sv = s.dataset.summary;
          s.classList.toggle('active', sv === summaryView);
        });
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

  function bindCategoryToggles() {
    document.querySelectorAll('.inv-category-label[data-cat-toggle]').forEach(label => {
      label.addEventListener('click', () => {
        const cat = label.dataset.catToggle;
        const section = label.closest('.inv-category');
        if (collapsedCats.has(cat)) {
          collapsedCats.delete(cat);
          section.classList.remove('collapsed');
        } else {
          collapsedCats.add(cat);
          section.classList.add('collapsed');
        }
        const chevron = label.querySelector('.inv-cat-chevron');
        if (chevron) chevron.innerHTML = collapsedCats.has(cat) ? '&#9656;' : '&#9662;';
      });
    });
  }

  function rebindItemEvents() {
    bindCategoryToggles();
    // Tap item to expand/collapse
    document.querySelectorAll('.inv-item-compact').forEach(compact => {
      compact.addEventListener('click', (e) => {
        e.stopPropagation();
        const item = compact.closest('.inv-item');
        const wasOpen = item.classList.contains('expanded');
        document.querySelectorAll('.inv-item.expanded').forEach(el => el.classList.remove('expanded'));
        if (!wasOpen) item.classList.add('expanded');
      });
    });

    // Click outside expanded item to collapse
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.inv-item.expanded')) {
        document.querySelectorAll('.inv-item.expanded').forEach(el => el.classList.remove('expanded'));
      }
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
            <label>Variant / Flavor <input type="text" class="inv-edit-input" data-field="variant" value="${item.variant || ''}"></label>
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
    const mlEl = row.querySelector('.inv-item-ml');
    if (mlEl) mlEl.textContent = amount + '/' + bottleSize;
    if (expandPct) { expandPct.textContent = percent + '%'; }
    if (miniFill) { miniFill.style.width = percent + '%'; miniFill.style.background = fillColor; }
    if (detail) detail.textContent = amount + ' / ' + bottleSize + ' ' + unit;
  }

  return { render };
})();
