/* ===== Availability Calculator ===== */
const Availability = (() => {

  /**
   * Check if a cocktail can be made from current inventory
   * @param {Object} cocktail
   * @param {Array} inventory - [{ ingredientId, amount, unit }]
   * @returns {{ status: 'available'|'partial'|'unavailable', missing: number, missingIngredients: string[] }}
   */
  function check(cocktail, inventory) {
    if (!cocktail.ingredients || cocktail.ingredients.length === 0) {
      return { status: 'available', missing: 0, missingIngredients: [] };
    }

    // Sum amounts per ingredientId across all bottles
    const invMap = {};
    inventory.forEach(i => {
      if (!invMap[i.ingredientId]) invMap[i.ingredientId] = 0;
      invMap[i.ingredientId] += i.amount;
    });

    let missing = 0;
    const missingIngredients = [];

    cocktail.ingredients.forEach(ing => {
      const totalAmount = invMap[ing.ingredientId] || 0;
      const ingredient = getIngredientById(ing.ingredientId);
      if (ingredient && ingredient.category === 'garnish') return;

      if (totalAmount < ing.amount) {
        missing++;
        const name = ingredient ? ingredient.name : ing.ingredientId;
        missingIngredients.push(name);
      }
    });

    let status;
    if (missing === 0) {
      status = 'available';
    } else if (missing <= 2) {
      status = 'partial';
    } else {
      status = 'unavailable';
    }

    return { status, missing, missingIngredients };
  }

  /**
   * Deduct ingredients from inventory (when marking a cocktail as "just made")
   * @param {Object} cocktail
   * @returns {boolean} success
   */
  function deduct(cocktail) {
    const inventory = Storage.getInventory();

    cocktail.ingredients.forEach(ing => {
      let remaining = ing.amount;
      // Deduct from bottles of this ingredient in order
      const bottles = inventory.filter(i => i.ingredientId === ing.ingredientId);
      bottles.forEach(bottle => {
        if (remaining <= 0) return;
        const take = Math.min(remaining, bottle.amount);
        remaining -= take;
        Storage.updateInventoryItem(bottle.uid, bottle.amount - take, bottle.unit, bottle.brand, bottle.bottleSize, bottle.variant);
      });
    });

    return true;
  }

  return { check, deduct };
})();
