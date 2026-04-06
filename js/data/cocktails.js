/* ===== Cocktail Recipes Database ===== */
/* eslint-disable no-unused-vars */

/*
  strength: 1=light, 2=medium, 3=strong, 4=very-strong
  glass: martini, coupe, highball, collins, old-fashioned, hurricane, champagne-flute, margarita, nick-nora, snifter, shot
  ice: cubed, crushed, sphere, shaved, none
  flavors: sour, sweet, bitter, herbal, fruity, spicy, creamy, spirit-forward, refreshing, tropical
*/

const COCKTAILS = [
  {
    id: 'amaretto-sour',
    name: 'Amaretto Sour',
    glass: 'old-fashioned',
    ice: 'cubed',
    strength: 2,
    flavors: ['sour', 'sweet'],
    ingredients: [
      { ingredientId: 'almond-liqueur', amount: 45, unit: 'ml' },
      { ingredientId: 'bourbon', amount: 30, unit: 'ml' },
      { ingredientId: 'lemon-juice', amount: 30, unit: 'ml' },
      { ingredientId: 'simple-syrup', amount: 15, unit: 'ml' },
      { ingredientId: 'egg-white', amount: 1, unit: 'pcs' }
    ],
    garnish: 'None',
    instructions: 'Dry shake amaretto, bourbon, lemon juice, syrup, and egg white. Add ice and shake again vigorously. Strain into an old fashioned glass over ice.'
  },
  {
    id: 'apple-whisky-sour',
    name: 'Apple Whisky Sour',
    glass: 'old-fashioned',
    ice: 'cubed',
    strength: 3,
    flavors: ['sour', 'fruity'],
    ingredients: [
      { ingredientId: 'whiskey', amount: 45, unit: 'ml' },
      { ingredientId: 'apple-juice', amount: 30, unit: 'ml' },
      { ingredientId: 'lemon-juice', amount: 25, unit: 'ml' },
      { ingredientId: 'simple-syrup', amount: 15, unit: 'ml' },
      { ingredientId: 'egg-white', amount: 1, unit: 'pcs' }
    ],
    garnish: 'None',
    instructions: 'Dry shake whiskey, apple juice, lemon juice, syrup, and egg white. Add ice and shake again. Strain into an old fashioned glass over ice.'
  },
  {
    id: 'bourbon-renewal',
    name: 'Bourbon Renewal',
    glass: 'old-fashioned',
    ice: 'cubed',
    strength: 3,
    flavors: ['sour', 'fruity', 'spirit-forward'],
    ingredients: [
      { ingredientId: 'bourbon', amount: 60, unit: 'ml' },
      { ingredientId: 'lemon-juice', amount: 25, unit: 'ml' },
      { ingredientId: 'simple-syrup', amount: 15, unit: 'ml' },
      { ingredientId: 'blackcurrant-liqueur', amount: 15, unit: 'ml' }
    ],
    garnish: 'Lemon wheel',
    instructions: 'Shake bourbon, lemon juice, and simple syrup with ice. Strain into an old fashioned glass over fresh ice. Drizzle creme de cassis over the top. Garnish with a lemon wheel.'
  },
  {
    id: 'clover-club',
    name: 'Clover Club',
    glass: 'coupe',
    ice: 'none',
    strength: 2,
    flavors: ['sour', 'fruity'],
    ingredients: [
      { ingredientId: 'gin', amount: 60, unit: 'ml' },
      { ingredientId: 'lemon-juice', amount: 20, unit: 'ml' },
      { ingredientId: 'raspberries', amount: 6, unit: 'pcs' },
      { ingredientId: 'simple-syrup', amount: 15, unit: 'ml' },
      { ingredientId: 'egg-white', amount: 1, unit: 'pcs' }
    ],
    garnish: 'Raspberries',
    instructions: 'Muddle raspberries in a shaker. Add gin, lemon juice, syrup, and egg white. Dry shake, then add ice and shake again. Double strain into a chilled coupe. Garnish with raspberries.'
  },
  {
    id: 'courtside',
    name: 'Courtside',
    glass: 'highball',
    ice: 'cubed',
    strength: 2,
    flavors: ['refreshing', 'fruity', 'sweet'],
    ingredients: [
      { ingredientId: 'vodka', amount: 45, unit: 'ml' },
      { ingredientId: 'melon-liqueur', amount: 15, unit: 'ml' },
      { ingredientId: 'lime-juice', amount: 20, unit: 'ml' },
      { ingredientId: 'simple-syrup', amount: 10, unit: 'ml' },
      { ingredientId: 'soda-water', amount: 60, unit: 'ml' }
    ],
    garnish: 'Lime wedge',
    instructions: 'Shake vodka, Midori, lime juice, and syrup with ice. Strain into an ice-filled highball glass. Top with soda water and stir gently. Garnish with a lime wedge.'
  },
  {
    id: 'henrita',
    name: 'Henrita',
    glass: 'coupe',
    ice: 'none',
    strength: 2,
    flavors: ['sour', 'herbal', 'sweet'],
    ingredients: [
      { ingredientId: 'gin', amount: 45, unit: 'ml' },
      { ingredientId: 'elderflower-liqueur', amount: 20, unit: 'ml' },
      { ingredientId: 'lemon-juice', amount: 25, unit: 'ml' },
      { ingredientId: 'simple-syrup', amount: 10, unit: 'ml' }
    ],
    garnish: 'Lemon twist',
    instructions: 'Shake all ingredients with ice until well-chilled. Strain into a chilled coupe glass. Garnish with a lemon twist.'
  },
  {
    id: 'jagerita',
    name: 'Jägerita',
    glass: 'old-fashioned',
    ice: 'cubed',
    strength: 3,
    flavors: ['herbal', 'sour', 'bitter'],
    ingredients: [
      { ingredientId: 'herbal-liqueur', amount: 30, unit: 'ml' },
      { ingredientId: 'tequila', amount: 30, unit: 'ml' },
      { ingredientId: 'orange-liqueur', amount: 20, unit: 'ml' },
      { ingredientId: 'lime-juice', amount: 25, unit: 'ml' }
    ],
    garnish: 'Lime wheel',
    instructions: 'Shake all ingredients with ice vigorously. Strain into an old fashioned glass over fresh ice. Garnish with a lime wheel.'
  },
  {
    id: 'jungle-bird',
    name: 'Jungle Bird',
    glass: 'old-fashioned',
    ice: 'cubed',
    strength: 2,
    flavors: ['bitter', 'tropical'],
    ingredients: [
      { ingredientId: 'dark-rum', amount: 45, unit: 'ml' },
      { ingredientId: 'bitter-liqueur', amount: 22, unit: 'ml' },
      { ingredientId: 'pineapple-juice', amount: 45, unit: 'ml' },
      { ingredientId: 'lime-juice', amount: 15, unit: 'ml' },
      { ingredientId: 'simple-syrup', amount: 15, unit: 'ml' }
    ],
    garnish: 'Pineapple wedge',
    instructions: 'Shake all ingredients with ice. Strain into an old fashioned glass over fresh ice. Garnish with a pineapple wedge.'
  },
  {
    id: 'jungle-cat',
    name: 'Jungle Cat',
    glass: 'old-fashioned',
    ice: 'cubed',
    strength: 3,
    flavors: ['bitter', 'tropical', 'herbal'],
    ingredients: [
      { ingredientId: 'mezcal', amount: 30, unit: 'ml' },
      { ingredientId: 'dark-rum', amount: 15, unit: 'ml' },
      { ingredientId: 'bitter-liqueur', amount: 22, unit: 'ml' },
      { ingredientId: 'pineapple-juice', amount: 45, unit: 'ml' },
      { ingredientId: 'lime-juice', amount: 15, unit: 'ml' },
      { ingredientId: 'simple-syrup', amount: 10, unit: 'ml' }
    ],
    garnish: 'Pineapple wedge',
    instructions: 'Shake all ingredients with ice. Strain into an old fashioned glass over fresh ice. Garnish with a pineapple wedge.'
  },
  {
    id: 'key-lime-mojito',
    name: 'Key Lime Mojito',
    glass: 'highball',
    ice: 'crushed',
    strength: 2,
    flavors: ['refreshing', 'herbal', 'sour'],
    ingredients: [
      { ingredientId: 'white-rum', amount: 60, unit: 'ml' },
      { ingredientId: 'lime', amount: 1, unit: 'pcs' },
      { ingredientId: 'lime-juice', amount: 15, unit: 'ml' },
      { ingredientId: 'mint', amount: 8, unit: 'pcs' },
      { ingredientId: 'simple-syrup', amount: 20, unit: 'ml' },
      { ingredientId: 'soda-water', amount: 60, unit: 'ml' }
    ],
    garnish: 'Lime wheel and mint sprig',
    instructions: 'Muddle lime wedges, mint, and syrup in a highball glass. Add rum and extra lime juice. Fill with crushed ice and top with soda water. Stir gently. Garnish with a lime wheel and mint sprig.'
  },
  {
    id: 'long-island-iced-tea',
    name: 'Long Island Iced Tea',
    glass: 'highball',
    ice: 'cubed',
    strength: 4,
    flavors: ['sweet', 'sour', 'refreshing'],
    ingredients: [
      { ingredientId: 'vodka', amount: 15, unit: 'ml' },
      { ingredientId: 'gin', amount: 15, unit: 'ml' },
      { ingredientId: 'white-rum', amount: 15, unit: 'ml' },
      { ingredientId: 'tequila', amount: 15, unit: 'ml' },
      { ingredientId: 'orange-liqueur', amount: 15, unit: 'ml' },
      { ingredientId: 'lemon-juice', amount: 25, unit: 'ml' },
      { ingredientId: 'simple-syrup', amount: 15, unit: 'ml' },
      { ingredientId: 'coca-cola', amount: 30, unit: 'ml' }
    ],
    garnish: 'Lemon wedge',
    instructions: 'Build all spirits, lemon juice, and syrup in an ice-filled highball glass. Stir briefly. Top with a splash of Coca Cola. Garnish with a lemon wedge.'
  },
  {
    id: 'midori-splice',
    name: 'Midori Splice',
    glass: 'hurricane',
    ice: 'crushed',
    strength: 1,
    flavors: ['sweet', 'tropical', 'creamy'],
    ingredients: [
      { ingredientId: 'melon-liqueur', amount: 30, unit: 'ml' },
      { ingredientId: 'coconut-liqueur', amount: 30, unit: 'ml' },
      { ingredientId: 'pineapple-juice', amount: 90, unit: 'ml' },
      { ingredientId: 'heavy-cream', amount: 30, unit: 'ml' }
    ],
    garnish: 'None',
    instructions: 'Blend all ingredients with crushed ice until smooth. Pour into a hurricane glass.'
  },
  {
    id: 'mojito',
    name: 'Mojito',
    glass: 'highball',
    ice: 'crushed',
    strength: 2,
    flavors: ['refreshing', 'herbal', 'sweet'],
    ingredients: [
      { ingredientId: 'white-rum', amount: 60, unit: 'ml' },
      { ingredientId: 'lime', amount: 1, unit: 'pcs' },
      { ingredientId: 'mint', amount: 8, unit: 'pcs' },
      { ingredientId: 'white-sugar', amount: 10, unit: 'g' },
      { ingredientId: 'soda-water', amount: 60, unit: 'ml' }
    ],
    garnish: 'Mint sprig',
    instructions: 'Cut lime into wedges and muddle with sugar and mint in a highball glass. Add rum and crushed ice. Top with soda water and stir gently. Garnish with a mint sprig.'
  },
  {
    id: 'orange-amaretto-whiskey-sour',
    name: 'Orange Amaretto Whiskey Sour',
    glass: 'old-fashioned',
    ice: 'cubed',
    strength: 3,
    flavors: ['sour', 'sweet', 'fruity'],
    ingredients: [
      { ingredientId: 'whiskey', amount: 30, unit: 'ml' },
      { ingredientId: 'almond-liqueur', amount: 30, unit: 'ml' },
      { ingredientId: 'orange-juice', amount: 30, unit: 'ml' },
      { ingredientId: 'lemon-juice', amount: 20, unit: 'ml' },
      { ingredientId: 'simple-syrup', amount: 10, unit: 'ml' },
      { ingredientId: 'egg-white', amount: 1, unit: 'pcs' }
    ],
    garnish: 'Orange peel',
    instructions: 'Dry shake whiskey, amaretto, orange juice, lemon juice, syrup, and egg white. Add ice and shake again vigorously. Strain into an old fashioned glass over ice. Garnish with an orange peel.'
  },
  {
    id: 'orange-dreamsicle-martini',
    name: 'Orange Dreamsicle Martini',
    glass: 'martini',
    ice: 'none',
    strength: 2,
    flavors: ['creamy', 'sweet', 'fruity'],
    ingredients: [
      { ingredientId: 'vanilla-vodka', amount: 45, unit: 'ml' },
      { ingredientId: 'orange-liqueur', amount: 20, unit: 'ml' },
      { ingredientId: 'orange-juice', amount: 30, unit: 'ml' },
      { ingredientId: 'heavy-cream', amount: 30, unit: 'ml' },
      { ingredientId: 'vanilla-syrup', amount: 10, unit: 'ml' }
    ],
    garnish: 'Orange peel',
    instructions: 'Shake all ingredients vigorously with ice until well-chilled. Strain into a chilled martini glass. Garnish with an orange peel.'
  },
  {
    id: 'passion-fruit-mezcalita',
    name: 'Passion Fruit Mezcalita',
    glass: 'coupe',
    ice: 'none',
    strength: 3,
    flavors: ['tropical', 'sour', 'spirit-forward'],
    ingredients: [
      { ingredientId: 'mezcal', amount: 60, unit: 'ml' },
      { ingredientId: 'passion-fruit-pulp', amount: 30, unit: 'ml' },
      { ingredientId: 'lime-juice', amount: 25, unit: 'ml' },
      { ingredientId: 'agave', amount: 15, unit: 'ml' }
    ],
    garnish: 'Lime wheel',
    instructions: 'Shake all ingredients with ice vigorously. Strain into a chilled coupe glass. Garnish with a lime wheel.'
  },
  {
    id: 'pornstar-margarita',
    name: 'Pornstar Margarita',
    glass: 'coupe',
    ice: 'none',
    strength: 3,
    flavors: ['tropical', 'sour', 'sweet'],
    ingredients: [
      { ingredientId: 'tequila', amount: 45, unit: 'ml' },
      { ingredientId: 'passion-fruit-pulp', amount: 30, unit: 'ml' },
      { ingredientId: 'passion-fruit-syrup', amount: 15, unit: 'ml' },
      { ingredientId: 'lime-juice', amount: 25, unit: 'ml' },
      { ingredientId: 'orange-liqueur', amount: 15, unit: 'ml' }
    ],
    garnish: 'Passion fruit half',
    instructions: 'Shake all ingredients with ice vigorously. Strain into a chilled coupe glass. Garnish with a passion fruit half.'
  },
  {
    id: 'pornstar-martini',
    name: 'Pornstar Martini',
    glass: 'martini',
    ice: 'none',
    strength: 2,
    flavors: ['sweet', 'tropical', 'fruity'],
    ingredients: [
      { ingredientId: 'vanilla-vodka', amount: 45, unit: 'ml' },
      { ingredientId: 'passion-fruit-liqueur', amount: 30, unit: 'ml' },
      { ingredientId: 'passion-fruit-pulp', amount: 30, unit: 'ml' },
      { ingredientId: 'lime-juice', amount: 15, unit: 'ml' },
      { ingredientId: 'vanilla-syrup', amount: 15, unit: 'ml' }
    ],
    garnish: 'Passion fruit half',
    instructions: 'Shake all ingredients with ice vigorously. Double strain into a chilled martini glass. Garnish with a passion fruit half.'
  },
  {
    id: 'spicy-pineapple-tequila-sour',
    name: 'Spicy Pineapple Tequila Sour',
    glass: 'old-fashioned',
    ice: 'cubed',
    strength: 3,
    flavors: ['spicy', 'tropical', 'sour'],
    ingredients: [
      { ingredientId: 'tequila', amount: 60, unit: 'ml' },
      { ingredientId: 'pineapple-juice', amount: 45, unit: 'ml' },
      { ingredientId: 'lime-juice', amount: 20, unit: 'ml' },
      { ingredientId: 'agave', amount: 15, unit: 'ml' },
      { ingredientId: 'jalapenos', amount: 3, unit: 'pcs' }
    ],
    garnish: 'Pineapple wedge and jalapeno slice',
    instructions: 'Muddle jalapeno slices in a shaker. Add tequila, pineapple juice, lime juice, and agave. Shake vigorously with ice. Strain into an old fashioned glass over ice. Garnish with a pineapple wedge and jalapeno slice.'
  },
  {
    id: 'the-los-altos',
    name: 'The Los Altos',
    glass: 'old-fashioned',
    ice: 'sphere',
    strength: 3,
    flavors: ['spirit-forward', 'sour', 'sweet'],
    ingredients: [
      { ingredientId: 'tequila', amount: 60, unit: 'ml' },
      { ingredientId: 'lime-juice', amount: 20, unit: 'ml' },
      { ingredientId: 'agave', amount: 15, unit: 'ml' },
      { ingredientId: 'angostura-bitters', amount: 2, unit: 'ml' }
    ],
    garnish: 'Lime peel',
    instructions: 'Stir tequila, lime juice, agave, and bitters with ice. Strain into an old fashioned glass over a large ice sphere. Express a lime peel over the drink and drop it in.'
  },
  {
    id: 'jack-daniels-apple',
    name: "Jack Daniel's Apple",
    glass: 'highball',
    ice: 'cubed',
    strength: 2,
    flavors: ['fruity', 'sweet', 'refreshing'],
    ingredients: [
      { ingredientId: 'jack-daniels-apple', amount: 45, unit: 'ml' },
      { ingredientId: 'apple-juice', amount: 60, unit: 'ml' },
      { ingredientId: 'lime-juice', amount: 10, unit: 'ml' },
      { ingredientId: 'sprite', amount: 60, unit: 'ml' }
    ],
    garnish: 'Lime wedge',
    instructions: 'Fill a highball glass with ice. Pour in Jack Daniels Apple, apple juice, and lime juice. Top with Sprite and stir gently. Garnish with a lime wedge.'
  },
  {
    id: 'lemon-cheesecake-martini',
    name: 'Lemon Cheesecake Martini',
    glass: 'martini',
    ice: 'none',
    strength: 2,
    flavors: ['creamy', 'sweet', 'sour'],
    ingredients: [
      { ingredientId: 'lemon-liqueur', amount: 45, unit: 'ml' },
      { ingredientId: 'vanilla-vodka', amount: 30, unit: 'ml' },
      { ingredientId: 'lemon-juice', amount: 20, unit: 'ml' },
      { ingredientId: 'heavy-cream', amount: 20, unit: 'ml' },
      { ingredientId: 'vanilla-syrup', amount: 15, unit: 'ml' }
    ],
    garnish: 'Lemon twist',
    instructions: 'Shake all ingredients vigorously with ice. Strain into a chilled martini glass. Garnish with a lemon twist.'
  },
  {
    id: 'halekulani',
    name: 'Halekulani',
    glass: 'coupe',
    ice: 'none',
    strength: 2,
    flavors: ['sour', 'fruity', 'tropical'],
    ingredients: [
      { ingredientId: 'bourbon', amount: 45, unit: 'ml' },
      { ingredientId: 'pineapple-juice', amount: 30, unit: 'ml' },
      { ingredientId: 'lemon-juice', amount: 20, unit: 'ml' },
      { ingredientId: 'grenadine', amount: 15, unit: 'ml' },
      { ingredientId: 'orange-juice', amount: 15, unit: 'ml' }
    ],
    garnish: 'None',
    instructions: 'Shake all ingredients with ice until well-chilled. Strain into a chilled coupe glass.'
  },
  {
    id: 'the-ward-eight',
    name: 'The Ward Eight',
    glass: 'coupe',
    ice: 'none',
    strength: 3,
    flavors: ['sour', 'fruity', 'spirit-forward'],
    ingredients: [
      { ingredientId: 'rye-whiskey', amount: 60, unit: 'ml' },
      { ingredientId: 'lemon-juice', amount: 20, unit: 'ml' },
      { ingredientId: 'orange-juice', amount: 20, unit: 'ml' },
      { ingredientId: 'grenadine', amount: 10, unit: 'ml' }
    ],
    garnish: 'Lemon twist',
    instructions: 'Shake all ingredients with ice. Strain into a chilled coupe glass. Garnish with a lemon twist.'
  },
  {
    id: 'detroit-daisy',
    name: 'Detroit Daisy',
    glass: 'coupe',
    ice: 'none',
    strength: 3,
    flavors: ['sour', 'fruity'],
    ingredients: [
      { ingredientId: 'rye-whiskey', amount: 45, unit: 'ml' },
      { ingredientId: 'lime-juice', amount: 25, unit: 'ml' },
      { ingredientId: 'simple-syrup', amount: 15, unit: 'ml' },
      { ingredientId: 'raspberries', amount: 4, unit: 'pcs' },
      { ingredientId: 'strawberry', amount: 2, unit: 'pcs' }
    ],
    garnish: 'Raspberries',
    instructions: 'Muddle raspberries and strawberries in a shaker. Add rye whiskey, lime juice, and syrup. Shake with ice. Double strain into a chilled coupe. Garnish with fresh raspberries.'
  }
];

// Strength labels
const STRENGTH_LABELS = {
  1: 'Light',
  2: 'Medium',
  3: 'Strong',
  4: 'Very Strong'
};

function getCocktailById(id) {
  const allCocktails = [...COCKTAILS, ...Storage.getCustomRecipes()];
  return allCocktails.find(c => c.id === id);
}
