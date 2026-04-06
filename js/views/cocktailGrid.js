/* ===== Cocktail Grid View ===== */
const CocktailGrid = (() => {

  function renderStars(rating) {
    if (!rating) {
      return '<span class="star no-rating">Not rated</span>';
    }
    let html = '';
    for (let i = 1; i <= 5; i++) {
      html += `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`;
    }
    return html;
  }

  function renderStrengthDots(strength) {
    let dots = '';
    for (let i = 1; i <= 4; i++) {
      dots += `<span class="strength-dot ${i <= strength ? 'filled' : ''}"></span>`;
    }
    return `<div class="strength-dots">${dots}</div>`;
  }

  function renderFlavorBadges(flavors) {
    return flavors.map(f =>
      `<span class="flavor-badge badge-${f}">${f.replace('-', ' ')}</span>`
    ).join('');
  }

  function renderAvailabilityBadge(availability) {
    const labels = {
      'available': '✓ Can make',
      'partial': '~ Almost',
      'unavailable': ''
    };
    if (availability.status === 'unavailable') return '';
    return `<span class="card-availability availability-${availability.status}">${labels[availability.status]}${availability.missing > 0 ? ` (${availability.missing} missing)` : ''}</span>`;
  }

  function renderCard(cocktail) {
    const rating = Storage.getRating(cocktail.id);
    const made = Storage.isMade(cocktail.id);
    const inventory = Storage.getInventory();
    const availability = Availability.check(cocktail, inventory);

    return `
      <article class="cocktail-card strength-${cocktail.strength}" data-cocktail-id="${cocktail.id}" tabindex="0" role="button" aria-label="View ${cocktail.name} details">
        ${made ? '<span class="card-made-badge">Made ✓</span>' : ''}
        <div class="card-icon">
          ${GlassIcons.render(cocktail.glass, cocktail.ice, 'sm')}
        </div>
        <h3 class="card-name">${cocktail.name}</h3>
        <div class="card-rating">${renderStars(rating)}</div>
        <div class="card-flavors">${renderFlavorBadges(cocktail.flavors)}</div>
        <div class="card-strength">
          ${renderStrengthDots(cocktail.strength)}
          <span>${STRENGTH_LABELS[cocktail.strength]}</span>
        </div>
        ${renderAvailabilityBadge(availability)}
      </article>`;
  }

  function render(cocktails) {
    const container = document.getElementById('main-content');
    if (!cocktails.length) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="deco-diamond">◆</span>
          <h3>No cocktails found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>`;
      return;
    }

    container.innerHTML = `<div class="cocktail-grid">${cocktails.map(renderCard).join('')}</div>`;

    // Staggered fade-in with Intersection Observer
    requestAnimationFrame(() => {
      const cards = container.querySelectorAll('.cocktail-card');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

      cards.forEach((card, i) => {
        card.style.transitionDelay = `${i * 0.04}s`;
        observer.observe(card);
      });
    });
  }

  return { render };
})();
