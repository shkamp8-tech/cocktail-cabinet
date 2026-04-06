/* ===== Add Custom Recipe View ===== */
const AddRecipeView = (() => {

  const FLAVOR_OPTIONS = ['sour', 'sweet', 'bitter', 'herbal', 'fruity', 'spicy', 'creamy', 'spirit-forward', 'refreshing', 'tropical'];

  function render() {
    const container = document.getElementById('main-content');

    container.innerHTML = `
      <div class="inventory-page">
        <div class="inventory-header">
          <h2>Add Custom Recipe</h2>
        </div>

        <form id="add-recipe-form" class="add-recipe-form">
          <div class="inv-add-panel">
            <h3>Basic Info</h3>
            <div class="recipe-form-grid">
              <div class="inv-add-field" style="flex:2;min-width:200px">
                <label>Cocktail Name *</label>
                <input type="text" id="recipe-name" required placeholder="e.g. My Special Mule">
              </div>

              <div class="inv-add-field">
                <label>Glass Type *</label>
                <div class="glass-selector" id="glass-selector">
                  ${Object.keys(GlassIcons.GLASS_NAMES).map(g => `
                    <button type="button" class="glass-option" data-glass="${g}" title="${GlassIcons.GLASS_NAMES[g]}">
                      ${GlassIcons.render(g, 'none', 'sm')}
                      <span class="glass-option-label">${GlassIcons.GLASS_NAMES[g]}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="inv-add-field">
                <label>Ice Type *</label>
                <select id="recipe-ice" required>
                  ${Object.keys(GlassIcons.ICE_NAMES).map(i => `<option value="${i}">${GlassIcons.ICE_NAMES[i]}</option>`).join('')}
                </select>
              </div>

              <div class="inv-add-field">
                <label>Strength *</label>
                <select id="recipe-strength" required>
                  <option value="1">Light</option>
                  <option value="2" selected>Medium</option>
                  <option value="3">Strong</option>
                  <option value="4">Very Strong</option>
                </select>
              </div>
            </div>
          </div>

          <div class="inv-add-panel">
            <h3>Flavor Profile</h3>
            <div class="filter-chips">
              ${FLAVOR_OPTIONS.map(f => `
                <button type="button" class="filter-chip recipe-flavor-chip" data-flavor="${f}">${f.replace('-', ' ')}</button>
              `).join('')}
            </div>
          </div>

          <div class="inv-add-panel">
            <h3>Ingredients</h3>
            <div id="recipe-ingredients">
              <div class="recipe-ingredient-row">
                ${renderIngredientRow(0)}
              </div>
            </div>
            <button type="button" class="inventory-btn inventory-btn--secondary" id="add-ingredient-row" style="margin-top:var(--space-sm)">
              + Add Ingredient
            </button>
          </div>

          <div class="inv-add-panel">
            <h3>Instructions</h3>
            <div class="modal-notes">
              <textarea id="recipe-instructions" placeholder="Describe how to make this cocktail..." rows="4"></textarea>
            </div>
          </div>

          <div class="inv-add-panel">
            <h3>Garnish</h3>
            <div class="inv-add-field" style="width:100%">
              <input type="text" id="recipe-garnish" placeholder="e.g. Lime wheel and mint sprig">
            </div>
          </div>

          <div style="display:flex;gap:var(--space-md);justify-content:center;padding:var(--space-lg) 0">
            <button type="submit" class="inventory-btn">Save Recipe</button>
            <button type="button" class="inventory-btn inventory-btn--secondary" id="recipe-cancel">Cancel</button>
          </div>
        </form>
      </div>
    `;

    bindEvents();
  }

  function renderIngredientRow(index) {
    const options = INGREDIENTS.map(i =>
      `<option value="${i.id}" data-unit="${i.defaultUnit}">${i.name}</option>`
    ).join('');

    return `
      <div class="inv-add-form recipe-ingredient-row" data-row="${index}">
        <div class="inv-add-field" style="flex:2;min-width:150px">
          <label>Ingredient</label>
          <select class="recipe-ing-select" required>
            <option value="">Select...</option>
            ${options}
          </select>
        </div>
        <div class="inv-add-field" style="flex:1;min-width:60px">
          <label>Amount</label>
          <input type="number" class="recipe-ing-amount" min="0" step="1" value="30" required>
        </div>
        <div class="inv-add-field" style="min-width:50px">
          <label>Unit</label>
          <input type="text" class="recipe-ing-unit" value="ml" readonly style="width:50px">
        </div>
        <button type="button" class="inv-delete-btn recipe-remove-row" style="opacity:1;align-self:flex-end;margin-bottom:4px" title="Remove">✕</button>
      </div>`;
  }

  let rowCounter = 1;

  function bindEvents() {
    const form = document.getElementById('add-recipe-form');
    let selectedGlass = '';
    const selectedFlavors = new Set();

    // Glass selector
    document.querySelectorAll('.glass-option').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.glass-option').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedGlass = btn.dataset.glass;
      });
    });

    // Flavor chips
    document.querySelectorAll('.recipe-flavor-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        chip.classList.toggle('active');
        const f = chip.dataset.flavor;
        if (selectedFlavors.has(f)) selectedFlavors.delete(f);
        else selectedFlavors.add(f);
      });
    });

    // Add ingredient row
    document.getElementById('add-ingredient-row').addEventListener('click', () => {
      const container = document.getElementById('recipe-ingredients');
      const div = document.createElement('div');
      div.innerHTML = renderIngredientRow(rowCounter++);
      container.appendChild(div.firstElementChild);
      bindIngredientRowEvents();
    });

    // Update units on ingredient select change
    bindIngredientRowEvents();

    // Remove ingredient row
    function bindIngredientRowEvents() {
      document.querySelectorAll('.recipe-ing-select').forEach(sel => {
        sel.removeEventListener('change', updateUnit);
        sel.addEventListener('change', updateUnit);
      });
      document.querySelectorAll('.recipe-remove-row').forEach(btn => {
        btn.addEventListener('click', () => {
          const rows = document.querySelectorAll('.recipe-ingredient-row');
          if (rows.length > 1) btn.closest('.recipe-ingredient-row').remove();
        });
      });
    }

    function updateUnit(e) {
      const sel = e.target;
      const row = sel.closest('.recipe-ingredient-row');
      const opt = sel.selectedOptions[0];
      if (opt && opt.dataset.unit) {
        const unitInput = row.querySelector('.recipe-ing-unit');
        const amountInput = row.querySelector('.recipe-ing-amount');
        unitInput.value = opt.dataset.unit;
        amountInput.value = opt.dataset.unit === 'pcs' ? '1' : '30';
      }
    }

    // Cancel
    document.getElementById('recipe-cancel').addEventListener('click', () => {
      AppState.setView('cocktails');
    });

    // Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('recipe-name').value.trim();
      if (!name) return alert('Please enter a cocktail name');
      if (!selectedGlass) return alert('Please select a glass type');
      if (selectedFlavors.size === 0) return alert('Please select at least one flavor');

      // Collect ingredients
      const ingredientRows = document.querySelectorAll('.recipe-ingredient-row');
      const ingredients = [];
      for (const row of ingredientRows) {
        const sel = row.querySelector('.recipe-ing-select');
        const amount = row.querySelector('.recipe-ing-amount');
        const unit = row.querySelector('.recipe-ing-unit');
        if (sel.value && amount.value) {
          ingredients.push({
            ingredientId: sel.value,
            amount: parseFloat(amount.value),
            unit: unit.value
          });
        }
      }

      if (ingredients.length === 0) return alert('Please add at least one ingredient');

      const recipe = {
        name,
        glass: selectedGlass,
        ice: document.getElementById('recipe-ice').value,
        strength: parseInt(document.getElementById('recipe-strength').value),
        flavors: [...selectedFlavors],
        ingredients,
        instructions: document.getElementById('recipe-instructions').value.trim(),
        garnish: document.getElementById('recipe-garnish').value.trim()
      };

      Storage.addCustomRecipe(recipe);
      AppState.setView('cocktails');
    });
  }

  return { render };
})();
