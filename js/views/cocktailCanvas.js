/* ===== Cocktail Canvas / Taste Map View ===== */
const CocktailCanvas = (() => {

  /* ---------- flavour helpers ---------- */

  const FLAVOR_X = {
    sweet: 0.08, creamy: 0.14, tropical: 0.24, fruity: 0.32,
    refreshing: 0.42, sour: 0.52, herbal: 0.62,
    spicy: 0.74, bitter: 0.84, 'spirit-forward': 0.92
  };

  const FLAVOR_COLORS = {
    sweet: '#f7c948', creamy: '#ffe4b0', tropical: '#25d9be',
    fruity: '#ff6b6b', refreshing: '#5bc9f5', sour: '#a8e06e',
    herbal: '#7acb7a', spicy: '#ff8c42', bitter: '#c96b4f',
    'spirit-forward': '#e8c547'
  };

  function cocktailX(c) {
    if (!c.flavors || c.flavors.length === 0) return 0.5;
    return c.flavors.reduce((s, f) => s + (FLAVOR_X[f] ?? 0.5), 0) / c.flavors.length;
  }

  function cocktailY(c) {
    const s = c.strength || 2;
    return 1 - ((s - 1) / 3) * 0.75 - 0.10;
  }

  /* ---------- axis modes ---------- */

  let currentAxis = 'flavor-strength';
  const AXES = {
    'flavor-strength': { label: 'Flavor × Strength', xLabel: 'Sweet → Bold', yLabel: 'Light → Strong', xFn: cocktailX, yFn: cocktailY },
    'strength-only':   { label: 'Strength',          xLabel: '',              yLabel: 'Light → Strong', xFn: (_c, i) => ((i % 6) + 1) / 7, yFn: cocktailY },
    'flavor-only':     { label: 'Flavor Profile',    xLabel: 'Sweet → Bold', yLabel: '',               xFn: cocktailX, yFn: (_c, i) => 0.15 + (Math.floor(i / 6) * 0.12) }
  };

  /* ---------- render ---------- */

  function render(cocktails) {
    const container = document.getElementById('main-content');
    if (!container) return;

    const axis = AXES[currentAxis];
    const inventory = Storage.getInventory();

    const cards = cocktails.map((c, i) => {
      const rawX = axis.xFn(c, i, cocktails.length);
      const rawY = axis.yFn(c, i, cocktails.length);
      const avail = Availability.check(c, inventory);
      return { cocktail: c, x: rawX, y: rawY, avail };
    });

    deOverlap(cards);

    const xMarkers = axis.xLabel ? [
      { label: 'Sweet', color: FLAVOR_COLORS.sweet },
      { label: 'Tropical', color: FLAVOR_COLORS.tropical },
      { label: 'Fruity', color: FLAVOR_COLORS.fruity },
      { label: 'Sour', color: FLAVOR_COLORS.sour },
      { label: 'Herbal', color: FLAVOR_COLORS.herbal },
      { label: 'Spicy', color: FLAVOR_COLORS.spicy },
      { label: 'Bitter', color: FLAVOR_COLORS.bitter },
      { label: 'Bold', color: FLAVOR_COLORS['spirit-forward'] }
    ] : [];

    container.innerHTML = `
      <div class="canvas-controls">
        <label class="canvas-axis-label">View:</label>
        <select id="canvas-axis-select" class="canvas-axis-select">
          ${Object.keys(AXES).map(k => `<option value="${k}" ${k === currentAxis ? 'selected' : ''}>${AXES[k].label}</option>`).join('')}
        </select>
      </div>
      <div class="canvas-wrapper">
        ${axis.yLabel ? `<div class="canvas-y-axis"><span>${axis.yLabel}</span></div>` : ''}
        <div class="canvas-area" id="canvas-area">
          ${cards.map(c => renderCard(c)).join('')}
        </div>
      </div>
      ${xMarkers.length ? `<div class="canvas-x-markers">${xMarkers.map(m => `<span class="canvas-x-marker" style="color:${m.color}">${m.label}</span>`).join('')}</div>` : ''}
      ${axis.xLabel ? `<div class="canvas-x-axis"><span>${axis.xLabel}</span></div>` : ''}
    `;

    const sel = document.getElementById('canvas-axis-select');
    if (sel) sel.addEventListener('change', () => { currentAxis = sel.value; render(cocktails); });

    document.querySelectorAll('.canvas-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        if (id) document.dispatchEvent(new CustomEvent('open-cocktail', { detail: { id } }));
      });
    });

    requestAnimationFrame(() => {
      document.querySelectorAll('.canvas-card').forEach((d, i) => {
        setTimeout(() => d.classList.add('visible'), i * 35);
      });
    });
  }

  /* ---------- small card ---------- */

  function renderCard(card) {
    const c = card.cocktail;
    const left = (card.x * 100).toFixed(1);
    const top  = (card.y * 100).toFixed(1);
    const availClass = card.avail.status === 'available' ? 'can-make' :
                       card.avail.status === 'partial' ? 'partial' : 'missing';
    const primaryFlavor = c.flavors && c.flavors[0] ? c.flavors[0] : 'sweet';
    const accentColor = FLAVOR_COLORS[primaryFlavor] || '#e8c547';
    const strengthDots = '●'.repeat(c.strength || 2) + '○'.repeat(4 - (c.strength || 2));
    const topFlavors = (c.flavors || []).slice(0, 2);
    const flavorBadges = topFlavors.map(f =>
      `<span class="canvas-card-flavor" style="background:${FLAVOR_COLORS[f] || '#555'}25;color:${FLAVOR_COLORS[f] || '#aaa'}">${f}</span>`
    ).join('');

    return `
      <div class="canvas-card ${availClass}" data-id="${c.id}"
           style="left:${left}%;top:${top}%;--accent:${accentColor}">
        <div class="canvas-card-accent"></div>
        <div class="canvas-card-name">${c.name}</div>
        <div class="canvas-card-meta">
          <span class="canvas-card-strength">${strengthDots}</span>
          <div class="canvas-card-flavors">${flavorBadges}</div>
        </div>
      </div>`;
  }

  /* ---------- de-overlap (tuned for cards) ---------- */

  function deOverlap(cards) {
    const MIN_X = 0.09;
    const MIN_Y = 0.07;
    for (let pass = 0; pass < 12; pass++) {
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const dx = cards[j].x - cards[i].x;
          const dy = cards[j].y - cards[i].y;
          const overlapX = Math.abs(dx) < MIN_X;
          const overlapY = Math.abs(dy) < MIN_Y;
          if (overlapX && overlapY) {
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist === 0) {
              cards[j].x = clamp(cards[j].x + (Math.random() - 0.5) * 0.10, 0.01, 0.92);
              cards[j].y = clamp(cards[j].y + (Math.random() - 0.5) * 0.08, 0.02, 0.95);
            } else {
              const pushX = (MIN_X - Math.abs(dx)) / 2 * Math.sign(dx || 1);
              const pushY = (MIN_Y - Math.abs(dy)) / 2 * Math.sign(dy || 1);
              cards[i].x = clamp(cards[i].x - pushX, 0.01, 0.92);
              cards[i].y = clamp(cards[i].y - pushY, 0.02, 0.95);
              cards[j].x = clamp(cards[j].x + pushX, 0.01, 0.92);
              cards[j].y = clamp(cards[j].y + pushY, 0.02, 0.95);
            }
          }
        }
      }
    }
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  return { render };
})();
