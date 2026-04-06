/* ===== Filter & Sort Logic ===== */
const Filters = (() => {

  const strengthMap = {
    'light': 1,
    'medium': 2,
    'strong': 3,
    'very-strong': 4
  };

  function apply(cocktails) {
    const { filters, sort } = AppState.get();
    let result = [...cocktails];
    const inventory = Storage.getInventory();

    // Text search (name + ingredient names)
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c => {
        if (c.name.toLowerCase().includes(q)) return true;
        return c.ingredients.some(ing => {
          const ingredient = getIngredientById(ing.ingredientId);
          return ingredient && ingredient.name.toLowerCase().includes(q);
        });
      });
    }

    // Flavor filter (match ANY selected flavor)
    if (filters.flavors.length > 0) {
      result = result.filter(c =>
        filters.flavors.some(f => c.flavors.includes(f))
      );
    }

    // Strength filter
    if (filters.strength) {
      const target = strengthMap[filters.strength];
      result = result.filter(c => c.strength === target);
    }

    // Availability filter
    if (filters.availability) {
      result = result.filter(c => {
        const avail = Availability.check(c, inventory);
        return avail.status === filters.availability;
      });
    }

    // Sort
    result = sortCocktails(result, sort, inventory);

    return result;
  }

  function sortCocktails(cocktails, sortKey, inventory) {
    const sorted = [...cocktails];
    switch (sortKey) {
      case 'name-asc':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'name-desc':
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case 'rating-desc':
        return sorted.sort((a, b) => (Storage.getRating(b.id) || 0) - (Storage.getRating(a.id) || 0));
      case 'strength-desc':
        return sorted.sort((a, b) => b.strength - a.strength);
      case 'strength-asc':
        return sorted.sort((a, b) => a.strength - b.strength);
      default:
        return sorted;
    }
  }

  return { apply };
})();
