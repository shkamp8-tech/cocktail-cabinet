/* ===== Ingredients Database ===== */
/* eslint-disable no-unused-vars */
const INGREDIENTS = [
  // === SPIRITS ===
  { id: 'bourbon', name: 'Bourbon', category: 'spirit', defaultUnit: 'ml' },
  { id: 'dark-rum', name: 'Dark Rum', category: 'spirit', defaultUnit: 'ml' },
  { id: 'gin', name: 'Gin', category: 'spirit', defaultUnit: 'ml' },
  { id: 'jack-daniels-apple', name: "Jack Daniel's Apple", category: 'spirit', defaultUnit: 'ml' },
  { id: 'mezcal', name: 'Mezcal', category: 'spirit', defaultUnit: 'ml' },
  { id: 'rye-whiskey', name: 'Rye Whiskey', category: 'spirit', defaultUnit: 'ml' },
  { id: 'tequila', name: 'Tequila', category: 'spirit', defaultUnit: 'ml' },
  { id: 'tequila-silver', name: 'Tequila Silver', category: 'spirit', defaultUnit: 'ml' },
  { id: 'vanilla-vodka', name: 'Vanilla Vodka', category: 'spirit', defaultUnit: 'ml' },
  { id: 'vodka', name: 'Vodka', category: 'spirit', defaultUnit: 'ml' },
  { id: 'whiskey', name: 'Whiskey', category: 'spirit', defaultUnit: 'ml' },
  { id: 'white-rum', name: 'White Rum', category: 'spirit', defaultUnit: 'ml' },

  // === LIQUEURS (by flavour type) ===
  { id: 'almond-liqueur', name: 'Almond Liqueur (Amaretto)', category: 'liqueur', defaultUnit: 'ml' },
  { id: 'bitter-liqueur', name: 'Bitter Liqueur', category: 'liqueur', defaultUnit: 'ml' },
  { id: 'blackcurrant-liqueur', name: 'Blackcurrant Liqueur (Cassis)', category: 'liqueur', defaultUnit: 'ml' },
  { id: 'cherry-liqueur', name: 'Cherry Liqueur', category: 'liqueur', defaultUnit: 'ml' },
  { id: 'coconut-liqueur', name: 'Coconut Liqueur', category: 'liqueur', defaultUnit: 'ml' },
  { id: 'elderflower-liqueur', name: 'Elderflower Liqueur', category: 'liqueur', defaultUnit: 'ml' },
  { id: 'herbal-liqueur', name: 'Herbal Liqueur', category: 'liqueur', defaultUnit: 'ml' },
  { id: 'lemon-liqueur', name: 'Lemon Liqueur (Limoncello)', category: 'liqueur', defaultUnit: 'ml' },
  { id: 'melon-liqueur', name: 'Melon Liqueur', category: 'liqueur', defaultUnit: 'ml' },
  { id: 'orange-liqueur', name: 'Orange Liqueur', category: 'liqueur', defaultUnit: 'ml' },
  { id: 'passion-fruit-liqueur', name: 'Passion Fruit Liqueur', category: 'liqueur', defaultUnit: 'ml' },
  { id: 'vanilla-liqueur', name: 'Vanilla Liqueur', category: 'liqueur', defaultUnit: 'ml' },

  // === MIXERS ===
  { id: 'coca-cola', name: 'Coca Cola', category: 'mixer', defaultUnit: 'ml' },
  { id: 'egg-white', name: 'Egg White', category: 'mixer', defaultUnit: 'pcs' },
  { id: 'heavy-cream', name: 'Heavy Cream', category: 'mixer', defaultUnit: 'ml' },
  { id: 'soda-water', name: 'Soda Water', category: 'mixer', defaultUnit: 'ml' },
  { id: 'sprite', name: 'Sprite', category: 'mixer', defaultUnit: 'ml' },

  // === JUICES ===
  { id: 'apple-juice', name: 'Apple Juice', category: 'juice', defaultUnit: 'ml' },
  { id: 'lemon-juice', name: 'Lemon Juice', category: 'juice', defaultUnit: 'ml' },
  { id: 'lime-juice', name: 'Lime Juice', category: 'juice', defaultUnit: 'ml' },
  { id: 'orange-juice', name: 'Orange Juice', category: 'juice', defaultUnit: 'ml' },
  { id: 'pineapple-juice', name: 'Pineapple Juice', category: 'juice', defaultUnit: 'ml' },

  // === SYRUPS ===
  { id: 'agave', name: 'Agave', category: 'syrup', defaultUnit: 'ml' },
  { id: 'grenadine', name: 'Grenadine', category: 'syrup', defaultUnit: 'ml' },
  { id: 'maple-syrup', name: 'Maple Syrup', category: 'syrup', defaultUnit: 'ml' },
  { id: 'passion-fruit-syrup', name: 'Passion Fruit Syrup', category: 'syrup', defaultUnit: 'ml' },
  { id: 'simple-syrup', name: 'Simple Syrup', category: 'syrup', defaultUnit: 'ml' },
  { id: 'vanilla-syrup', name: 'Vanilla Syrup', category: 'syrup', defaultUnit: 'ml' },

  // === BITTERS ===
  { id: 'angostura-bitters', name: 'Angostura Bitters', category: 'bitters', defaultUnit: 'ml' },

  // === FRESH ===
  { id: 'jalapenos', name: 'Jalapenos', category: 'fresh', defaultUnit: 'pcs' },
  { id: 'lime', name: 'Lime', category: 'fresh', defaultUnit: 'pcs' },
  { id: 'mint', name: 'Mint', category: 'fresh', defaultUnit: 'pcs' },
  { id: 'passion-fruit-pulp', name: 'Passion Fruit Pulp', category: 'fresh', defaultUnit: 'ml' },
  { id: 'raspberries', name: 'Raspberries', category: 'fresh', defaultUnit: 'pcs' },
  { id: 'strawberry', name: 'Strawberry', category: 'fresh', defaultUnit: 'pcs' },
  { id: 'white-sugar', name: 'White Sugar', category: 'fresh', defaultUnit: 'g' },
];

const INGREDIENT_CATEGORIES = {
  'spirit': 'Spirits',
  'liqueur': 'Liqueurs',
  'mixer': 'Mixers',
  'juice': 'Juices',
  'syrup': 'Syrups',
  'bitters': 'Bitters',
  'fresh': 'Fresh Ingredients'
};

function getIngredientById(id) {
  return INGREDIENTS.find(i => i.id === id);
}

function getIngredientsByCategory(category) {
  return INGREDIENTS.filter(i => i.category === category);
}
