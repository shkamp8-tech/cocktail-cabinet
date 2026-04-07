/* ===== Cocktail Quiz — Find Your Drink ===== */
const CocktailQuiz = (() => {

  const QUESTIONS = [
    {
      q: 'How do you like your drinks?',
      answers: [
        { label: 'A', text: 'Sweet & smooth', tags: { flavors: ['sweet', 'creamy'], strength: [1, 2] } },
        { label: 'B', text: 'Fruity & fresh', tags: { flavors: ['fruity', 'tropical', 'refreshing'], strength: [1, 2, 3] } },
        { label: 'C', text: 'Sour & tangy', tags: { flavors: ['sour'], strength: [2, 3] } },
        { label: 'D', text: 'Strong & bold', tags: { flavors: ['spirit-forward', 'bitter'], strength: [3, 4] } }
      ]
    },
    {
      q: 'Pick a vibe:',
      answers: [
        { label: 'A', text: 'Beach sunset', tags: { flavors: ['tropical', 'fruity', 'refreshing'] } },
        { label: 'B', text: 'Cozy evening', tags: { flavors: ['sweet', 'creamy', 'spirit-forward'] } },
        { label: 'C', text: 'Party night', tags: { flavors: ['sour', 'fruity', 'refreshing'] } },
        { label: 'D', text: 'Classy lounge', tags: { flavors: ['bitter', 'herbal', 'spirit-forward'] } }
      ]
    },
    {
      q: 'How strong should it be?',
      answers: [
        { label: 'A', text: 'Light — barely there', tags: { strength: [1] } },
        { label: 'B', text: 'Medium — nicely balanced', tags: { strength: [2] } },
        { label: 'C', text: 'Strong — I can handle it', tags: { strength: [3] } },
        { label: 'D', text: 'Very strong — no ice needed', tags: { strength: [4] } }
      ]
    },
    {
      q: 'Pick a flavor direction:',
      answers: [
        { label: 'A', text: 'Herbal & botanical', tags: { flavors: ['herbal'] } },
        { label: 'B', text: 'Citrusy & bright', tags: { flavors: ['sour', 'refreshing'] } },
        { label: 'C', text: 'Spicy & warm', tags: { flavors: ['spicy'] } },
        { label: 'D', text: 'Rich & indulgent', tags: { flavors: ['creamy', 'sweet'] } }
      ]
    },
    {
      q: 'What matters most?',
      answers: [
        { label: 'A', text: 'Easy to drink', tags: { strength: [1, 2], flavors: ['sweet', 'fruity'] } },
        { label: 'B', text: 'Complex flavors', tags: { flavors: ['herbal', 'bitter', 'spicy'] } },
        { label: 'C', text: 'Refreshing & cold', tags: { flavors: ['refreshing', 'sour', 'tropical'] } },
        { label: 'D', text: 'Classic & timeless', tags: { flavors: ['spirit-forward', 'bitter'] } }
      ]
    }
  ];

  let currentStep = 0;
  let answers = [];
  let allCocktails = [];

  function render(cocktails) {
    allCocktails = cocktails;
    currentStep = 0;
    answers = [];
    renderStep();
  }

  function renderStep() {
    const container = document.getElementById('main-content');
    if (!container) return;

    if (currentStep >= QUESTIONS.length) {
      renderResults();
      return;
    }

    const q = QUESTIONS[currentStep];
    const progress = ((currentStep / QUESTIONS.length) * 100).toFixed(0);

    container.innerHTML = `
      <div class="quiz-page">
        <div class="quiz-progress">
          <div class="quiz-progress-bar" style="width:${progress}%"></div>
        </div>
        <div class="quiz-step">${currentStep + 1} / ${QUESTIONS.length}</div>
        <h2 class="quiz-question">${q.q}</h2>
        <div class="quiz-answers">
          ${q.answers.map((a, i) => `
            <button class="quiz-answer" data-idx="${i}">
              <span class="quiz-answer-label">${a.label}</span>
              <span class="quiz-answer-text">${a.text}</span>
            </button>
          `).join('')}
        </div>
        ${currentStep > 0 ? `<button class="quiz-back" id="quiz-back">← Back</button>` : ''}
      </div>
    `;

    container.querySelectorAll('.quiz-answer').forEach(btn => {
      btn.addEventListener('click', () => {
        answers[currentStep] = parseInt(btn.dataset.idx);
        currentStep++;
        renderStep();
      });
    });

    const backBtn = container.querySelector('#quiz-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        currentStep--;
        renderStep();
      });
    }
  }

  function renderResults() {
    const container = document.getElementById('main-content');
    if (!container) return;

    // Score cocktails
    const flavorScore = {};
    const strengthScore = {};

    answers.forEach((ansIdx, qIdx) => {
      const tags = QUESTIONS[qIdx].answers[ansIdx].tags;
      if (tags.flavors) {
        tags.flavors.forEach(f => { flavorScore[f] = (flavorScore[f] || 0) + 1; });
      }
      if (tags.strength) {
        tags.strength.forEach(s => { strengthScore[s] = (strengthScore[s] || 0) + 1; });
      }
    });

    const inventory = Storage.getInventory();
    const scored = allCocktails.map(c => {
      let score = 0;
      (c.flavors || []).forEach(f => { score += (flavorScore[f] || 0) * 2; });
      score += (strengthScore[c.strength] || 0) * 3;
      const avail = Availability.check(c, inventory);
      if (avail.status === 'available') score += 4;
      else if (avail.status === 'partial') score += 1;
      return { cocktail: c, score, avail };
    });

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 6);

    container.innerHTML = `
      <div class="quiz-page">
        <div class="quiz-progress">
          <div class="quiz-progress-bar" style="width:100%"></div>
        </div>
        <h2 class="quiz-question">Your Perfect Matches</h2>
        <div class="quiz-results">
          ${top.map((r, i) => {
            const c = r.cocktail;
            const avail = r.avail;
            const availClass = avail.status === 'available' ? 'can-make' :
                               avail.status === 'partial' ? 'partial' : 'missing';
            const strengthDots = '●'.repeat(c.strength || 2) + '○'.repeat(4 - (c.strength || 2));
            const flavors = (c.flavors || []).map(f => `<span class="quiz-flavor">${f}</span>`).join('');
            return `
              <div class="quiz-result-card ${availClass}" data-id="${c.id}">
                <div class="quiz-result-rank">#${i + 1}</div>
                <div class="quiz-result-info">
                  <div class="quiz-result-name">${c.name}</div>
                  <div class="quiz-result-meta">
                    <span class="quiz-result-strength">${strengthDots}</span>
                    ${flavors}
                  </div>
                  <div class="quiz-result-avail">${avail.status === 'available' ? '✓ Can make' : avail.status === 'partial' ? '~ Almost' : '✗ Missing ingredients'}</div>
                </div>
              </div>`;
          }).join('')}
        </div>
        <button class="quiz-restart" id="quiz-restart">Try Again</button>
      </div>
    `;

    container.querySelectorAll('.quiz-result-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const cocktail = getCocktailById(id);
        if (cocktail) CocktailDetail.render(cocktail);
      });
    });

    container.querySelector('#quiz-restart').addEventListener('click', () => {
      render(allCocktails);
    });
  }

  return { render };
})();
