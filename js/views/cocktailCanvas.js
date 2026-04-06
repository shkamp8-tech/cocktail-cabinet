/* ===== Cocktail Canvas / Taste Map View ===== */
const CocktailCanvas = (() => {

  /* ---------- flavour-axis layout helpers ---------- */

  // Map each flavour to a position on the X-axis (0 = sweet/soft, 1 = bitter/bold)
  const FLAVOR_X = {
    sweet: 0.10, creamy: 0.15, tropical: 0.25, fruity: 0.30,
    refreshing: 0.40, sour: 0.50, herbal: 0.60,
    spicy: 0.70, bitter: 0.80, 'spirit-forward': 0.90
  };

  // Map each flavour to a visual colour for the dot/badge (CSS variable fallback)
  const FLAVOR_COLORS = {
    sweet: '#f7c948', creamy: '#ffe4b0', tropical: '#25d9be',
    fruity: '#ff6b6b', refreshing: '#5bc9f5', sour: '#a8e06e',
    herbal: '#7acb7a', spicy: '#ff8c42', bitter: '#c96b4f',
    'spirit-forward': '#e8c547'
  };

  /* Position helpers */

  function cocktailX(cocktail) {
    // Average x position of all its flavours
    if (!cocktail.flavors || cocktail.flavors.length === 0) return 0.5;
    const total = cocktail.flavors.reduce((sum, f) => sum + (FLAVOR_X[f] ?? 0.5), 0);
    return total / cocktail.flavors.length;
  }

  function cocktailY(cocktail) {
    // strength 1-4  →  y 0.85 (bottom, light) → 0.10 (top, strong)
    const s = cocktail.strength || 2;
    return 1 - ((s - 1) / 3) * 0.75 - 0.10;
  }

  /* ---------- axis selector ---------- */

  let currentAxis = 'flavor-strength'; // default
  const AXES = {
    'flavor-strength': { label: 'Smaak × Sterkte', xLabel: 'Zacht → Bold', yLabel: 'Light → Strong', xFn: cocktailX, yFn: cocktailY },
    'strength-only': { label: 'Sterkte', xLabel: '', yLabel: 'Light → Very Strong', xFn: (_c, i, n) => ((i % 5) + 1) / 6, yFn: cocktailY },
    'flavor-only': { label: 'Smaakprofiel', xLabel: 'Zacht → Bold', yLabel: '', xFn: cocktailX, yFn: (_c, i, n) => 0.2 + (Math.floor(i / 5) * 0.15) }
  };

  /* ---------- render ---------- */

  function render(cocktails) {
    const container = document.getElementById('main-content');
    if (!container) return;

    const axis = AXES[currentAxis];
    const inventory = Storage.getInventory();

    // Build positioned cards
    const cards = cocktails.map((c, i) => {
      const rawX = axis.xFn(c, i, cocktails.length);
      const rawY = axis.yFn(c, i, cocktails.length);
      const avail = Availability.check(c, inventory);
      return { cocktail: c, x: rawX, y: rawY, avail };
    });

    // De-overlap: nudge cards that are too close
    deOverlap(cards);

    container.innerHTML = `
      <div class="canvas-controls">
        <label class="canvas-axis-label">Weergave:</label>
        <select id="canvas-axis-select" class="canvas-axis-select">
          ${Object.keys(AXES).map(k => `<option value="${k}" ${k === currentAxis ? 'selected' : ''}>${AXES[k].label}</option>`).join('')}
        </select>
      </div>
      <div class="canvas-wrapper">
        ${axis.yLabel ? `<div class="canvas-y-axis"><span>${axis.yLabel}</span></div>` : ''}
        <div class="canvas-area" id="canvas-area">
          ${cards.map(c => renderDot(c)).join('')}
        </div>
        ${axis.xLabel ? `<div class="canvas-x-axis"><span>${axis.xLabel}</span></div>` : ''}
      </div>
    `;

    // Bind axis select
    const sel = document.getElementById('canvas-axis-select');
    if (sel) {
      sel.addEventListener('change', () => {
        currentAxis = sel.value;
        render(cocktails);
      });
    }

    // Bind card clicks (open detail modal)
    document.querySelectorAll('.canvas-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        const id = dot.dataset.id;
        if (id) {
          document.dispatchEvent(new CustomEvent('open-cocktail', { detail: { id } }));
        }
      });
    });

    // Stagger animation
    requestAnimationFrame(() => {
      document.querySelectorAll('.canvas-dot').forEach((d, i) => {
        setTimeout(() => d.classList.add('visible'), i * 30);
      });
    });
  }

  /* ---------- card dot ---------- */

  function renderDot(card) {
    const c = card.cocktail;
    const left = (card.x * 100).toFixed(1);
    const top = (card.y * 100).toFixed(1);
    const availClass = card.avail.status === 'available' ? 'can-make' :
                       card.avail.status === 'partial' ? 'partial' : 'missing';
    const primaryFlavor = c.flavors && c.flavors[0] ? c.flavors[0] : 'sweet';
    const dotColor = FLAVOR_COLORS[primaryFlavor] || '#e8c547';
    const strengthDots = '●'.repeat(c.strength || 2) + '○'.repeat(4 - (c.strength || 2));
    const flavorBadges = (c.flavors || []).map(f =>
      `<span class="canvas-flavor" style="background:${FLAVOR_COLORS[f] || '#555'}30;color:${FLAVOR_COLORS[f] || '#aaa'}">${f}</span>`
    ).join('');

    return `
      <div class="canvas-dot ${availClass}" data-id="${c.id}"
           style="left:${left}%;top:${top}%;">
        <div class="canvas-dot-ring" style="border-color:${dotColor}"></div>
        <div class="canvas-tooltip">
          <strong>${c.name}</strong>
          <span class="canvas-strength">${strengthDots}</span>
          <div class="canvas-flavors">${flavorBadges}</div>
        </div>
      </div>`;
  }

  /* ---------- de-overlap ---------- */

  function deOverlap(cards) {
    // Simple iterative push-apart
    const MIN_DIST = 0.06; // 6% of canvas
    for (let pass = 0; pass < 8; pass++) {
      for (let i = 0; i < cards.length; i++) {
        for (let j = i + 1; j < cards.length; j++) {
          const dx = cards[j].x - cards[i].x;
          const dy = cards[j].y - cards[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MIN_DIST && dist > 0) {
            const push = (MIN_DIST - dist) / 2;
            const nx = dx / dist;
            const ny = dy / dist;
            cards[i].x = clamp(cards[i].x - nx * push, 0.02, 0.98);
            cards[i].y = clamp(cards[i].y - ny * push, 0.02, 0.98);
            cards[j].x = clamp(cards[j].x + nx * push, 0.02, 0.98);
            cards[j].y = clamp(cards[j].y + ny * push, 0.02, 0.98);
          } else if (dist === 0) {
            // Identical positions — scatter randomly
            cards[j].x = clamp(cards[j].x + (Math.random() - 0.5) * 0.08, 0.02, 0.98);
            cards[j].y = clamp(cards[j].y + (Math.random() - 0.5) * 0.08, 0.02, 0.98);
          }
        }
      }
    }
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  return { render };
})();
