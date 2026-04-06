/* ===== SVG Glass & Ice Icon Generator ===== */
const GlassIcons = (() => {

  // Ice rendering helpers — drawn inside the glass
  function renderIce(iceType, glassWidth, liquidY, liquidH) {
    const cx = glassWidth / 2;
    switch (iceType) {
      case 'cubed':
        return `
          <rect class="ice-fill" x="${cx - 8}" y="${liquidY + 2}" width="7" height="6" rx="1"/>
          <rect class="ice-fill" x="${cx + 1}" y="${liquidY + 4}" width="6" height="5" rx="1"/>
          <rect class="ice-fill" x="${cx - 4}" y="${liquidY + 8}" width="7" height="5" rx="1"/>`;
      case 'crushed':
        return `
          <circle class="ice-fill" cx="${cx - 5}" cy="${liquidY + 5}" r="2.5"/>
          <circle class="ice-fill" cx="${cx + 4}" cy="${liquidY + 4}" r="2"/>
          <circle class="ice-fill" cx="${cx}" cy="${liquidY + 8}" r="2.5"/>
          <circle class="ice-fill" cx="${cx - 3}" cy="${liquidY + 11}" r="1.5"/>
          <circle class="ice-fill" cx="${cx + 5}" cy="${liquidY + 9}" r="2"/>
          <circle class="ice-fill" cx="${cx + 1}" cy="${liquidY + 3}" r="1.5"/>`;
      case 'sphere':
        return `<circle class="ice-fill" cx="${cx}" cy="${liquidY + liquidH / 2}" r="${Math.min(liquidH / 2.5, 7)}" style="fill:rgba(255,255,255,0.2);stroke:rgba(255,255,255,0.45);stroke-width:0.8"/>`;
      case 'shaved':
        return `
          <line class="ice-fill" x1="${cx - 6}" y1="${liquidY + 3}" x2="${cx - 2}" y2="${liquidY + 5}" style="stroke:rgba(255,255,255,0.3);stroke-width:1"/>
          <line class="ice-fill" x1="${cx + 1}" y1="${liquidY + 2}" x2="${cx + 5}" y2="${liquidY + 6}" style="stroke:rgba(255,255,255,0.3);stroke-width:1"/>
          <line class="ice-fill" x1="${cx - 4}" y1="${liquidY + 7}" x2="${cx + 3}" y2="${liquidY + 9}" style="stroke:rgba(255,255,255,0.3);stroke-width:1"/>
          <line class="ice-fill" x1="${cx - 1}" y1="${liquidY + 4}" x2="${cx + 2}" y2="${liquidY + 8}" style="stroke:rgba(255,255,255,0.25);stroke-width:0.8"/>`;
      case 'none':
      default:
        return '';
    }
  }

  // Liquid fill (subtle color at bottom of glass)
  function renderLiquid(path, color = 'var(--gold-dim)') {
    return `<path class="liquid-fill" d="${path}" style="fill:${color};opacity:0.3"/>`;
  }

  // === GLASS TYPES ===

  function martini(iceType) {
    // Classic inverted triangle on stem
    const w = 48, h = 56;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${renderLiquid('M12,18 L24,36 L36,18 Z')}
      ${renderIce(iceType, w, 20, 14)}
      <path class="glass-stroke" d="M6,14 L24,36 L24,48 M42,14 L24,36"/>
      <line class="glass-stroke" x1="6" y1="14" x2="42" y2="14"/>
      <line class="glass-stroke" x1="16" y1="52" x2="32" y2="52"/>
      <line class="glass-stroke" x1="24" y1="48" x2="24" y2="52"/>
    </svg>`;
  }

  function coupe(iceType) {
    const w = 48, h = 56;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${renderLiquid('M10,16 Q14,32 24,34 Q34,32 38,16 Z')}
      ${renderIce(iceType, w, 18, 14)}
      <path class="glass-stroke" d="M8,14 Q12,34 24,36 Q36,34 40,14"/>
      <line class="glass-stroke" x1="8" y1="14" x2="40" y2="14"/>
      <line class="glass-stroke" x1="24" y1="36" x2="24" y2="48"/>
      <line class="glass-stroke" x1="16" y1="52" x2="32" y2="52"/>
      <line class="glass-stroke" x1="24" y1="48" x2="24" y2="52"/>
    </svg>`;
  }

  function highball(iceType) {
    const w = 36, h = 56;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${renderLiquid('M9,22 L9,50 L27,50 L27,22 Z')}
      ${renderIce(iceType, w, 22, 20)}
      <rect class="glass-stroke" x="8" y="8" width="20" height="44" rx="2"/>
    </svg>`;
  }

  function collins(iceType) {
    const w = 32, h = 60;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${renderLiquid('M8,24 L8,52 L24,52 L24,24 Z')}
      ${renderIce(iceType, w, 24, 20)}
      <rect class="glass-stroke" x="7" y="6" width="18" height="48" rx="2"/>
    </svg>`;
  }

  function oldFashioned(iceType) {
    const w = 44, h = 44;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${renderLiquid('M10,20 L10,38 L34,38 L34,20 Z')}
      ${renderIce(iceType, w, 18, 16)}
      <path class="glass-stroke" d="M8,8 L8,38 Q8,40 10,40 L34,40 Q36,40 36,38 L36,8"/>
      <line class="glass-stroke" x1="8" y1="8" x2="36" y2="8"/>
    </svg>`;
  }

  function hurricane(iceType) {
    const w = 40, h = 60;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${renderLiquid('M10,24 Q8,36 12,42 Q16,48 20,48 Q24,48 28,42 Q32,36 30,24 Z')}
      ${renderIce(iceType, w, 26, 16)}
      <path class="glass-stroke" d="M12,8 Q8,20 8,28 Q8,40 14,46 Q18,50 20,50 Q22,50 26,46 Q32,40 32,28 Q32,20 28,8"/>
      <line class="glass-stroke" x1="12" y1="8" x2="28" y2="8"/>
      <line class="glass-stroke" x1="20" y1="50" x2="20" y2="54"/>
      <line class="glass-stroke" x1="14" y1="56" x2="26" y2="56"/>
      <line class="glass-stroke" x1="20" y1="54" x2="20" y2="56"/>
    </svg>`;
  }

  function champagneFlute(iceType) {
    const w = 32, h = 60;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${renderLiquid('M12,18 Q12,34 16,38 L16,38 Q16,38 16,38 Z')}
      ${renderIce(iceType, w, 20, 12)}
      <path class="glass-stroke" d="M10,6 Q10,36 16,40 L16,50"/>
      <path class="glass-stroke" d="M22,6 Q22,36 16,40"/>
      <line class="glass-stroke" x1="10" y1="6" x2="22" y2="6"/>
      <line class="glass-stroke" x1="10" y1="52" x2="22" y2="52"/>
      <line class="glass-stroke" x1="16" y1="50" x2="16" y2="52"/>
    </svg>`;
  }

  function margaritaGlass(iceType) {
    const w = 48, h = 56;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${renderLiquid('M14,20 L20,34 L28,34 L34,20 Z')}
      ${renderIce(iceType, w, 22, 10)}
      <path class="glass-stroke" d="M4,14 L14,14 L20,34 L28,34 L34,14 L44,14"/>
      <path class="glass-stroke" d="M14,14 L18,14 Q20,14 20,16"/>
      <path class="glass-stroke" d="M34,14 L30,14 Q28,14 28,16"/>
      <line class="glass-stroke" x1="24" y1="34" x2="24" y2="48"/>
      <line class="glass-stroke" x1="16" y1="52" x2="32" y2="52"/>
      <line class="glass-stroke" x1="24" y1="48" x2="24" y2="52"/>
    </svg>`;
  }

  function nickNora(iceType) {
    const w = 40, h = 56;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${renderLiquid('M12,14 Q12,30 20,32 Q28,30 28,14 Z')}
      ${renderIce(iceType, w, 16, 14)}
      <path class="glass-stroke" d="M10,10 Q10,32 20,34 Q30,32 30,10"/>
      <line class="glass-stroke" x1="10" y1="10" x2="30" y2="10"/>
      <line class="glass-stroke" x1="20" y1="34" x2="20" y2="48"/>
      <line class="glass-stroke" x1="13" y1="52" x2="27" y2="52"/>
      <line class="glass-stroke" x1="20" y1="48" x2="20" y2="52"/>
    </svg>`;
  }

  function snifter(iceType) {
    const w = 44, h = 52;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${renderLiquid('M10,22 Q10,34 22,36 Q34,34 34,22 Z')}
      ${renderIce(iceType, w, 22, 12)}
      <path class="glass-stroke" d="M14,10 Q6,18 8,28 Q10,38 22,40 Q34,38 36,28 Q38,18 30,10"/>
      <line class="glass-stroke" x1="14" y1="10" x2="30" y2="10"/>
      <line class="glass-stroke" x1="22" y1="40" x2="22" y2="46"/>
      <line class="glass-stroke" x1="15" y1="48" x2="29" y2="48"/>
      <line class="glass-stroke" x1="22" y1="46" x2="22" y2="48"/>
    </svg>`;
  }

  function shot(iceType) {
    const w = 28, h = 36;
    return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
      ${renderLiquid('M8,14 L8,30 L20,30 L20,14 Z')}
      ${renderIce(iceType, w, 14, 12)}
      <path class="glass-stroke" d="M6,6 L6,30 Q6,32 8,32 L20,32 Q22,32 22,30 L22,6"/>
      <line class="glass-stroke" x1="6" y1="6" x2="22" y2="6"/>
    </svg>`;
  }

  // Glass type map
  const glassMap = {
    'martini': martini,
    'coupe': coupe,
    'highball': highball,
    'collins': collins,
    'old-fashioned': oldFashioned,
    'hurricane': hurricane,
    'champagne-flute': champagneFlute,
    'margarita': margaritaGlass,
    'nick-nora': nickNora,
    'snifter': snifter,
    'shot': shot
  };

  // Glass display names
  const GLASS_NAMES = {
    'martini': 'Martini Glass',
    'coupe': 'Coupe',
    'highball': 'Highball',
    'collins': 'Collins',
    'old-fashioned': 'Old Fashioned',
    'hurricane': 'Hurricane',
    'champagne-flute': 'Champagne Flute',
    'margarita': 'Margarita Glass',
    'nick-nora': 'Nick & Nora',
    'snifter': 'Snifter',
    'shot': 'Shot Glass'
  };

  const ICE_NAMES = {
    'cubed': 'Cubed Ice',
    'crushed': 'Crushed Ice',
    'sphere': 'Ice Sphere',
    'shaved': 'Shaved Ice',
    'none': 'No Ice'
  };

  /**
   * Render a glass icon with ice
   * @param {string} glassType - Glass type key
   * @param {string} iceType - Ice type key
   * @param {string} size - 'sm', 'md', or 'lg'
   * @returns {string} HTML string
   */
  function render(glassType, iceType, size = 'sm') {
    const fn = glassMap[glassType] || martini;
    const svg = fn(iceType || 'none');
    return `<div class="glass-icon glass-icon--${size}" title="${GLASS_NAMES[glassType] || glassType} — ${ICE_NAMES[iceType] || 'No Ice'}">${svg}</div>`;
  }

  return { render, GLASS_NAMES, ICE_NAMES, glassMap };
})();
