/* ===== LocalStorage Persistence ===== */
const Storage = (() => {
  const STORAGE_KEY = 'cocktail-cabinet-data';

  const defaultData = {
    inventory: [],        // [{ uid, ingredientId, amount, unit, brand?, variant? }]
    ratings: {},          // { cocktailId: number (1-5) }
    made: {},             // { cocktailId: true }
    notes: {},            // { cocktailId: string }
    customRecipes: [],    // Full cocktail objects
    madeDate: {}          // { cocktailId: ISO date string }
  };

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultData };
      const parsed = JSON.parse(raw);
      return { ...defaultData, ...parsed };
    } catch {
      return { ...defaultData };
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      console.error('Failed to save to localStorage');
    }
  }

  // === Public API ===

  function getUserData() {
    return load();
  }

  function saveUserData(data) {
    save(data);
  }

  function makeUid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  // Migration maps
  const ID_RENAMES = {
    'amaretto': 'almond-liqueur',
    'campari': 'bitter-liqueur',
    'creme-de-cassis': 'blackcurrant-liqueur',
    'jagermeister': 'herbal-liqueur',
    'licor-43': 'vanilla-liqueur',
    'limoncello': 'lemon-liqueur',
    'malibu': 'coconut-liqueur',
    'midori': 'melon-liqueur',
    'passoa': 'passion-fruit-liqueur'
  };

  // Ensure every inventory item has a uid + migrate renamed ingredient IDs
  function migrateInventory(data) {
    let changed = false;
    data.inventory.forEach(item => {
      if (!item.uid) { item.uid = makeUid(); changed = true; }
      if (ID_RENAMES[item.ingredientId]) {
        item.ingredientId = ID_RENAMES[item.ingredientId];
        changed = true;
      }
    });
    if (changed) save(data);
    return data;
  }

  // Inventory
  function getInventory() {
    const data = migrateInventory(load());
    return data.inventory;
  }

  function setInventory(inventory) {
    const data = load();
    data.inventory = inventory;
    save(data);
  }

  function addInventoryItem(ingredientId, amount, unit, brand, bottleSize, variant) {
    const data = load();
    const item = { uid: makeUid(), ingredientId, amount, unit, brand: brand || '', variant: variant || '' };
    if (bottleSize) item.bottleSize = bottleSize;
    if (amount > 0) data.inventory.push(item);
    save(data);
    return data.inventory;
  }

  function updateInventoryItem(uid, amount, unit, brand, bottleSize, variant) {
    const data = migrateInventory(load());
    const idx = data.inventory.findIndex(i => i.uid === uid);
    if (idx < 0) return data.inventory;
    if (amount <= 0) {
      data.inventory.splice(idx, 1);
    } else {
      const old = data.inventory[idx];
      const item = {
        uid, ingredientId: old.ingredientId, amount,
        unit: unit || old.unit,
        brand: brand !== undefined ? brand : old.brand,
        variant: variant !== undefined ? variant : (old.variant || '')
      };
      item.bottleSize = bottleSize || old.bottleSize;
      data.inventory[idx] = item;
    }
    save(data);
    return data.inventory;
  }

  function removeInventoryItem(uid) {
    const data = migrateInventory(load());
    data.inventory = data.inventory.filter(i => i.uid !== uid);
    save(data);
    return data.inventory;
  }

  // Ratings
  function getRating(cocktailId) {
    return load().ratings[cocktailId] || 0;
  }

  function setRating(cocktailId, rating) {
    const data = load();
    data.ratings[cocktailId] = rating;
    save(data);
  }

  // Made status
  function isMade(cocktailId) {
    return !!load().made[cocktailId];
  }

  function setMade(cocktailId, madeStatus) {
    const data = load();
    data.made[cocktailId] = madeStatus;
    if (madeStatus && !data.madeDate[cocktailId]) {
      data.madeDate[cocktailId] = new Date().toISOString();
    }
    save(data);
  }

  function getMadeDate(cocktailId) {
    return load().madeDate[cocktailId] || null;
  }

  // Notes
  function getNote(cocktailId) {
    return load().notes[cocktailId] || '';
  }

  function setNote(cocktailId, note) {
    const data = load();
    data.notes[cocktailId] = note;
    save(data);
  }

  // Custom recipes
  function getCustomRecipes() {
    return load().customRecipes;
  }

  function addCustomRecipe(recipe) {
    const data = load();
    recipe.id = 'custom-' + Date.now();
    recipe.isCustom = true;
    data.customRecipes.push(recipe);
    save(data);
    return recipe;
  }

  function removeCustomRecipe(id) {
    const data = load();
    data.customRecipes = data.customRecipes.filter(r => r.id !== id);
    save(data);
  }

  // Export / Import
  function exportJSON() {
    const data = load();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cocktail-cabinet-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          const merged = { ...defaultData, ...imported };
          // Validate structure
          if (!Array.isArray(merged.inventory)) merged.inventory = [];
          if (typeof merged.ratings !== 'object') merged.ratings = {};
          if (typeof merged.made !== 'object') merged.made = {};
          if (typeof merged.notes !== 'object') merged.notes = {};
          if (!Array.isArray(merged.customRecipes)) merged.customRecipes = [];
          save(merged);
          resolve(merged);
        } catch {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  return {
    getUserData, saveUserData,
    getInventory, setInventory, addInventoryItem, updateInventoryItem, removeInventoryItem,
    getRating, setRating,
    isMade, setMade, getMadeDate,
    getNote, setNote,
    getCustomRecipes, addCustomRecipe, removeCustomRecipe,
    exportJSON, importJSON
  };
})();
