/* ===== Main Application ===== */
const App = (() => {

  let displayMode = 'grid'; // 'grid' | 'canvas'

  async function init() {
    // Pull remote data before rendering
    await Storage.initSync();

    bindNav();
    bindFilters();
    bindExportImport();
    bindCardClicks();
    bindViewToggle();

    // Listen to state changes
    AppState.onChange(onStateChange);

    // Listen for open-cocktail events from canvas dots
    document.addEventListener('open-cocktail', (e) => {
      const id = e.detail && e.detail.id;
      if (id) {
        const cocktail = getCocktailById(id);
        if (cocktail) CocktailDetail.render(cocktail);
      }
    });

    // Initial render
    renderCurrentView();
  }

  function onStateChange(state) {
    renderCurrentView();
    updateNavActive(state.currentView);
    updateFilterBar(state.currentView);
    updateFilterUI(state);
  }

  function renderCurrentView() {
    const state = AppState.get();
    switch (state.currentView) {
      case 'cocktails':
        renderCocktailsView();
        break;
      case 'inventory':
        InventoryView.render();
        break;
      case 'add-recipe':
        AddRecipeView.render();
        break;
    }
  }

  function renderCocktailsView() {
    const allCocktails = [...COCKTAILS, ...Storage.getCustomRecipes()];
    const filtered = Filters.apply(allCocktails);
    if (displayMode === 'canvas') {
      CocktailCanvas.render(filtered);
    } else {
      CocktailGrid.render(filtered);
    }
  }

  // Exposed for child views to trigger grid refresh
  function refreshView() {
    if (AppState.get().currentView === 'cocktails') {
      renderCocktailsView();
    }
  }

  // === Navigation ===
  function bindNav() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        AppState.setView(tab.dataset.view);
      });
    });
  }

  function updateNavActive(view) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.view === view);
    });
  }

  function updateFilterBar(view) {
    const bar = document.getElementById('filter-bar');
    if (view === 'cocktails') {
      bar.classList.remove('hidden');
    } else {
      bar.classList.add('hidden');
    }
  }

  function updateFilterUI(state) {
    // Sync chip active states
    document.querySelectorAll('#flavor-filters .filter-chip').forEach(chip => {
      chip.classList.toggle('active', state.filters.flavors.includes(chip.dataset.flavor));
    });

    // Sync dropdowns
    const strengthSel = document.getElementById('strength-filter');
    const availSel = document.getElementById('availability-filter');
    const sortSel = document.getElementById('sort-select');
    if (strengthSel) strengthSel.value = state.filters.strength;
    if (availSel) availSel.value = state.filters.availability;
    if (sortSel) sortSel.value = state.sort;
  }

  // === Filter Bindings ===
  function bindFilters() {
    // Search
    const searchInput = document.getElementById('search-input');
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        AppState.setFilter('search', searchInput.value.trim());
      }, 250);
    });

    // Flavor chips
    document.querySelectorAll('#flavor-filters .filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        AppState.toggleFlavor(chip.dataset.flavor);
      });
    });

    // Strength select
    document.getElementById('strength-filter').addEventListener('change', (e) => {
      AppState.setFilter('strength', e.target.value);
    });

    // Availability select
    document.getElementById('availability-filter').addEventListener('change', (e) => {
      AppState.setFilter('availability', e.target.value);
    });

    // Sort select
    document.getElementById('sort-select').addEventListener('change', (e) => {
      AppState.setSort(e.target.value);
    });
  }

  // === View Toggle (Grid ↔ Canvas) ===
  function bindViewToggle() {
    const group = document.getElementById('view-toggle');
    if (!group) return;
    group.querySelectorAll('.view-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.display;
        if (mode === displayMode) return;
        displayMode = mode;
        group.querySelectorAll('.view-toggle-btn').forEach(b => b.classList.toggle('active', b.dataset.display === mode));
        if (AppState.get().currentView === 'cocktails') {
          renderCocktailsView();
        }
      });
    });
  }

  // === Card Click Delegation ===
  function bindCardClicks() {
    document.getElementById('main-content').addEventListener('click', (e) => {
      const card = e.target.closest('.cocktail-card');
      if (!card) return;
      const id = card.dataset.cocktailId;
      const cocktail = getCocktailById(id);
      if (cocktail) {
        CocktailDetail.render(cocktail);
      }
    });

    // Keyboard support
    document.getElementById('main-content').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const card = e.target.closest('.cocktail-card');
        if (card) {
          e.preventDefault();
          card.click();
        }
      }
    });
  }

  // === Export / Import ===
  function bindExportImport() {
    document.getElementById('export-btn').addEventListener('click', () => {
      Storage.exportJSON();
    });

    document.getElementById('import-input').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        await Storage.importJSON(file);
        alert('Data imported successfully!');
        renderCurrentView();
      } catch (err) {
        alert('Failed to import: ' + err.message);
      }
      e.target.value = ''; // Allow re-import of same file
    });

    const apiKeyBtn = document.getElementById('api-key-btn');
    if (apiKeyBtn) {
      apiKeyBtn.addEventListener('click', () => BottleScanner.showApiKeyPrompt());
    }
  }

  return { init, refreshView };
})();

// Start the app (behind login gate)
document.addEventListener('DOMContentLoaded', () => {
  const needsLogin = Login.show();
  if (!needsLogin) {
    App.init();
  } else {
    // Wait for login to complete, then init
    const observer = new MutationObserver(() => {
      if (!document.getElementById('login-overlay')) {
        observer.disconnect();
        App.init();
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
});
