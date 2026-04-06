/* ===== Cocktail Detail Modal ===== */
const CocktailDetail = (() => {

  function renderRatingStars(cocktailId) {
    const rating = Storage.getRating(cocktailId);
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<button class="star-btn ${i <= rating ? 'filled' : ''}" data-rating="${i}" data-cocktail="${cocktailId}" aria-label="Rate ${i} stars">★</button>`;
    }
    return html;
  }

  function renderIngredientList(cocktail) {
    const inventory = Storage.getInventory();
    return cocktail.ingredients.map(ing => {
      const ingredient = getIngredientById(ing.ingredientId);
      if (!ingredient) return '';
      const invItem = inventory.find(i => i.ingredientId === ing.ingredientId);
      const hasEnough = invItem && invItem.amount >= ing.amount;
      const hasAny = !!invItem;
      const cssClass = hasEnough ? 'ingredient-available' : (hasAny ? 'ingredient-partial' : 'ingredient-missing');
      return `
        <li class="ingredient-item ${cssClass}">
          <span class="ingredient-name">${ingredient.name}</span>
          <span class="ingredient-amount">${ing.amount} ${ing.unit}</span>
        </li>`;
    }).join('');
  }

  function render(cocktail) {
    const made = Storage.isMade(cocktail.id);
    const madeDate = Storage.getMadeDate(cocktail.id);
    const note = Storage.getNote(cocktail.id);
    const inventory = Storage.getInventory();
    const availability = Availability.check(cocktail, inventory);

    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    content.innerHTML = `
      <button class="modal-close" aria-label="Close">&times;</button>

      <div class="modal-header">
        ${GlassIcons.render(cocktail.glass, cocktail.ice, 'md')}
        <h2 class="modal-title">${cocktail.name}</h2>
        <p class="modal-glass-info">${GlassIcons.GLASS_NAMES[cocktail.glass] || cocktail.glass} · ${GlassIcons.ICE_NAMES[cocktail.ice] || 'No Ice'}</p>
      </div>

      <div class="modal-section">
        <p class="modal-section-title">Your Rating</p>
        <div class="modal-rating">${renderRatingStars(cocktail.id)}</div>
      </div>

      <div class="modal-section">
        <div class="made-toggle">
          <button class="made-toggle-btn ${made ? 'active' : ''}" data-cocktail="${cocktail.id}">
            ${made ? '✓ Made it!' : 'Mark as Made'}
          </button>
          ${madeDate ? `<span class="made-date">First made: ${new Date(madeDate).toLocaleDateString()}</span>` : ''}
        </div>
      </div>

      <div class="modal-section">
        <p class="modal-section-title">Flavor Profile & Strength</p>
        <div class="modal-meta">
          ${cocktail.flavors.map(f => `<span class="flavor-badge badge-${f}">${f.replace('-', ' ')}</span>`).join('')}
          <span class="flavor-badge" style="--badge-bg: ${getStrengthColor(cocktail.strength, true)}; --badge-color: ${getStrengthColor(cocktail.strength, false)}">
            ${STRENGTH_LABELS[cocktail.strength]}
          </span>
        </div>
      </div>

      <div class="modal-section">
        <p class="modal-section-title">Ingredients ${availability.status !== 'available' && availability.missing > 0 ? `<span style="color:var(--unavailable);font-size:0.75rem;font-family:var(--font-body)">(${availability.missing} missing)</span>` : ''}</p>
        <ul class="ingredient-list">${renderIngredientList(cocktail)}</ul>
      </div>

      <div class="modal-section">
        <p class="modal-section-title">Instructions</p>
        <p class="modal-instructions">${cocktail.instructions}</p>
        ${cocktail.garnish && cocktail.garnish !== 'None' ? `<p class="modal-instructions" style="margin-top:8px;"><strong style="color:var(--gold)">Garnish:</strong> ${cocktail.garnish}</p>` : ''}
      </div>

      <div class="modal-section modal-notes">
        <p class="modal-section-title">Personal Notes</p>
        <textarea placeholder="Add your personal notes about this cocktail..." data-cocktail="${cocktail.id}">${note}</textarea>
      </div>

      ${cocktail.isCustom ? `
        <div class="modal-footer">
          <button class="delete-recipe-btn" data-cocktail="${cocktail.id}">Delete Custom Recipe</button>
        </div>
      ` : ''}
    `;

    // Show modal
    overlay.classList.remove('hidden');
    requestAnimationFrame(() => overlay.classList.add('active'));
    document.body.style.overflow = 'hidden';

    // Bind events
    bindModalEvents(cocktail, overlay, content);
  }

  function bindModalEvents(cocktail, overlay, content) {
    // Close
    const closeBtn = content.querySelector('.modal-close');
    closeBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    // Rating stars
    content.querySelectorAll('.star-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rating = parseInt(e.target.dataset.rating);
        Storage.setRating(cocktail.id, rating);
        // Update stars visually
        content.querySelectorAll('.star-btn').forEach((s, i) => {
          s.classList.toggle('filled', i < rating);
          if (i + 1 === rating) {
            s.style.transform = 'scale(1.3)';
            setTimeout(() => s.style.transform = '', 200);
          }
        });
        // Refresh grid
        if (typeof App !== 'undefined') App.refreshView();
      });
    });

    // Made toggle
    const madeBtn = content.querySelector('.made-toggle-btn');
    if (madeBtn) {
      madeBtn.addEventListener('click', () => {
        const newStatus = !Storage.isMade(cocktail.id);
        Storage.setMade(cocktail.id, newStatus);
        madeBtn.classList.toggle('active', newStatus);
        madeBtn.textContent = newStatus ? '✓ Made it!' : 'Mark as Made';
        if (typeof App !== 'undefined') App.refreshView();
      });
    }

    // Notes (debounced save)
    const textarea = content.querySelector('textarea');
    if (textarea) {
      let saveTimeout;
      textarea.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          Storage.setNote(cocktail.id, textarea.value);
        }, 500);
      });
    }

    // Delete custom recipe
    const deleteBtn = content.querySelector('.delete-recipe-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        if (confirm('Delete this custom recipe?')) {
          Storage.removeCustomRecipe(cocktail.id);
          closeModal();
          if (typeof App !== 'undefined') App.refreshView();
        }
      });
    }

    // Escape key
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    setTimeout(() => {
      overlay.classList.add('hidden');
      document.getElementById('modal-content').innerHTML = '';
    }, 300);
  }

  function getStrengthColor(strength, isBg) {
    const colors = {
      1: isBg ? 'var(--turquoise-dim)' : 'var(--strength-light)',
      2: isBg ? 'var(--yellow-dim)' : 'var(--strength-medium)',
      3: isBg ? 'rgba(255,159,67,0.15)' : 'var(--strength-strong)',
      4: isBg ? 'var(--coral-dim)' : 'var(--strength-very-strong)'
    };
    return colors[strength] || colors[2];
  }

  return { render, closeModal };
})();
