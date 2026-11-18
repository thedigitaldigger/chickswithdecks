/* The question deck: forty cards, ten to a suit, numbered like the Spanish deck
   (1–7, then 10 sota, 11 caballo, 12 rey). Deal three, send the hand by email. */
(() => {
  const RANKS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
  const SUITS = {
    espadas: { label: 'Espadas', frame: 2, qs: [
      'Who is this not for?',
      'What would you stop doing tomorrow if you were brave?',
      'What can you say that no competitor could?',
      'Which rule in your category is only a habit?',
      'What is the one sentence you want people to repeat?',
      'If your brand disappeared, who would actually miss it?',
      'What are you pretending not to know?',
      'What would your harshest customer say, word for word?',
      'Which decision have you been putting off for a year?',
      'If you could keep only one product, which one?',
    ] },
    bastos: { label: 'Bastos', frame: 3, qs: [
      'What could you make by hand that everyone else outsources?',
      'What does your brand look like with the logo taken off?',
      'What would you make with a tenth of the budget?',
      'Which detail would someone only notice on the third look?',
      'What is the best thing you ever made that nobody saw?',
      'What would your product sound like?',
      'What should be heavier, slower or rougher?',
      'Who in your company makes things nobody asked for?',
      'What could you make this week instead of this quarter?',
      'What would you build if you were not allowed to advertise it?',
    ] },
    copas: { label: 'Copas', frame: 1, qs: [
      'Who already loves you without being asked?',
      'What would a fan get tattooed?',
      'Where are your people on a Saturday night?',
      'Who should be at your table and has never been invited?',
      'What would make someone tell a friend about you tonight?',
      'Which song is your brand?',
      'What does your community make that you could celebrate?',
      'Who in culture would never work with you, and why?',
      'What would you throw a party for?',
      'What would you do if nobody was allowed to film it?',
    ] },
    oros: { label: 'Oros', frame: 0, qs: [
      'What do people actually pay you for?',
      'Which number would change everything if it moved?',
      'What would you charge more for if you dared?',
      'Where are you losing money out of politeness?',
      'Which customer do you want ten thousand more of?',
      'What are you giving away that should be a product?',
      'What does growth look like without a discount?',
      'What would you sell if you had to start again tomorrow?',
      'Which promise could you put in writing?',
      'What would make this year worth it?',
    ] },
  };

  const DECK = [];
  Object.entries(SUITS).forEach(([suit, s]) => s.qs.forEach((q, i) => DECK.push({ suit, rank: RANKS[i], q })));

  const btn = document.getElementById('deal-btn');
  const send = document.getElementById('send-hand');
  const slots = [...document.querySelectorAll('.deal__slot')];
  const pileCount = document.getElementById('pile-count');
  const status = document.getElementById('hand-status');
  if (!btn || !slots.length) return;

  // The opening hand is already on the table; take it out of the pile.
  const opening = ['Who is this not for?', 'Which song is your brand?', 'What do people actually pay you for?'];
  let hand = opening.map((q) => DECK.find((c) => c.q === q));
  let pile = shuffle(DECK.filter((c) => !hand.includes(c)));

  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const esc = (t) => t.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  function cardHTML(c) {
    const s = SUITS[c.suit];
    return `<div class="card card--q card--${c.suit}">
      <svg class="card__frame" viewBox="0 0 63 98" aria-hidden="true"><use href="#frame-${s.frame}"/></svg>
      <span class="card__n" aria-hidden="true">${c.rank}</span><span class="card__n card__n--flip" aria-hidden="true">${c.rank}</span>
      <svg class="card__pip" viewBox="0 0 100 100" aria-hidden="true"><use href="#pip-${c.suit}"/></svg>
      <p class="card__q">${esc(c.q)}</p>
      <span class="card__suit">${s.label}</span>
    </div>`;
  }

  function updateMail() {
    const body = 'We drew three cards from your deck:\n\n'
      + hand.map((c) => `- ${c.q} (${SUITS[c.suit].label} ${c.rank})`).join('\n')
      + '\n\nOur answers:\n\n';
    send.href = 'mailto:hola@chickswithdecks.com?subject=' + encodeURIComponent('Our hand') + '&body=' + encodeURIComponent(body);
    status.textContent = 'Your hand: ' + hand.map((c) => c.q).join(' ');
    pileCount.textContent = pile.length === 1 ? '1 card left in the deck' : `${pile.length} cards left in the deck`;
  }

  function deal() {
    if (pile.length < 3) pile = shuffle(DECK.filter((c) => !hand.includes(c)));
    hand = pile.splice(0, 3);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    slots.forEach((slot, i) => {
      slot.innerHTML = cardHTML(hand[i]);
      const card = slot.firstElementChild;
      if (reduce) return;
      card.style.setProperty('--i', i);
      card.classList.add('is-out');
      void card.offsetWidth;
      card.classList.add('is-in');
      card.classList.remove('is-out');
    });
    updateMail();
  }

  btn.addEventListener('click', deal);
  updateMail();
})();
