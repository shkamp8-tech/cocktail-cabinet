/* ===== App State Management ===== */
const AppState = (() => {
  let state = {
    currentView: 'cocktails',   // 'cocktails' | 'inventory' | 'add-recipe'
    filters: {
      search: '',
      flavors: [],              // active flavor filters
      strength: '',             // '' | 'light' | 'medium' | 'strong' | 'very-strong'
      availability: '',         // '' | 'available' | 'partial' | 'unavailable'
    },
    sort: 'name-asc'           // 'name-asc' | 'name-desc' | 'rating-desc' | 'strength-desc' | 'strength-asc'
  };

  const listeners = [];

  function get() {
    return state;
  }

  function set(updates) {
    state = { ...state, ...updates };
    listeners.forEach(fn => fn(state));
  }

  function setFilter(key, value) {
    state.filters = { ...state.filters, [key]: value };
    listeners.forEach(fn => fn(state));
  }

  function toggleFlavor(flavor) {
    const idx = state.filters.flavors.indexOf(flavor);
    if (idx >= 0) {
      state.filters.flavors = state.filters.flavors.filter(f => f !== flavor);
    } else {
      state.filters.flavors = [...state.filters.flavors, flavor];
    }
    listeners.forEach(fn => fn(state));
  }

  function setSort(sortKey) {
    state.sort = sortKey;
    listeners.forEach(fn => fn(state));
  }

  function setView(view) {
    state.currentView = view;
    listeners.forEach(fn => fn(state));
  }

  function onChange(fn) {
    listeners.push(fn);
  }

  return { get, set, setFilter, toggleFlavor, setSort, setView, onChange };
})();
