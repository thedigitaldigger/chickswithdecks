/* Chicks with Decks — shared behaviour */
(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = matchMedia('(hover: hover) and (min-width: 701px)');
  const fontsReady = (document.fonts && document.fonts.ready) || Promise.resolve();

  /* ── Madrid clock ── */
  const clock = document.getElementById('clock');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' });
    const tick = () => {
      const now = new Date();
      clock.textContent = fmt.format(now);
      clock.setAttribute('datetime', now.toISOString());
    };
    tick();
    setInterval(tick, 15000);
  }

  /* ── Home: split the sentence into words, fit it to the screen, deal cards ── */
  const manifesto = document.getElementById('manifesto');
  if (manifesto) {
    let d = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const s = document.createElement('span');
            s.className = 'w';
            s.style.setProperty('--d', d++);
            s.textContent = p;
            frag.appendChild(s);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(manifesto);

    const foot = document.querySelector('.home-foot');
    const fit = () => {
      const avail = window.innerHeight - (foot ? foot.offsetHeight : 0);
      let lo = 22, hi = 260;
      for (let k = 0; k < 18; k++) {
        const mid = (lo + hi) / 2;
        manifesto.style.fontSize = mid + 'px';
        if (manifesto.scrollHeight <= avail) lo = mid; else hi = mid;
      }
      manifesto.style.fontSize = Math.floor(lo * 10) / 10 + 'px';
    };
    fit();
    fontsReady.then(() => {
      fit();
      requestAnimationFrame(() => manifesto.classList.add('is-in'));
    });
    setTimeout(() => manifesto.classList.add('is-in'), 1200);
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(fit, 80); });

    /* Dealing */
    const hands = new Map([...document.querySelectorAll('.table .hand')].map((h) => [h.dataset.hand, h]));
    let current = null;
    const show = (link) => {
      if (!canHover.matches) return;
      const h = hands.get(link.dataset.hand);
      if (!h) return;
      if (current && current !== h) current.classList.remove('is-dealt');
      manifesto.querySelectorAll('a.is-on').forEach((a) => a.classList.remove('is-on'));
      link.classList.add('is-on');
      h.classList.add('is-dealt');
      current = h;
    };
    const hide = (link) => {
      link.classList.remove('is-on');
      if (current) current.classList.remove('is-dealt');
      current = null;
    };
    manifesto.querySelectorAll('a[data-hand]').forEach((a) => {
      a.addEventListener('pointerenter', () => show(a));
      a.addEventListener('pointerleave', () => hide(a));
      a.addEventListener('focus', () => show(a));
      a.addEventListener('blur', () => hide(a));
    });
  }

  /* ── Footer wordmark: run the name edge to edge ── */
  const marks = document.querySelectorAll('.foot__mark');
  const fitMarks = () => marks.forEach((m) => {
    const w = m.parentElement.clientWidth - parseFloat(getComputedStyle(m.parentElement).paddingLeft) - parseFloat(getComputedStyle(m.parentElement).paddingRight);
    m.style.fontSize = '100px';
    const ratio = w / m.scrollWidth;
    m.style.fontSize = Math.floor(100 * ratio * 10) / 10 + 'px';
  });
  if (marks.length) {
    fitMarks();
    fontsReady.then(fitMarks);
    addEventListener('resize', fitMarks);
  }

  /* ── Entrances ── */
  const reveals = document.querySelectorAll('[data-reveal]');
  reveals.forEach((el) => [...el.children].forEach((c, i) => c.style.setProperty('--r', i)));
  if ('IntersectionObserver' in window && !reduce.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ── Photographs drift slowly against the scroll ── */
  const drifts = [...document.querySelectorAll('.drift')];
  if (drifts.length && !reduce.matches) {
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      drifts.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const p = (r.top + r.height / 2 - vh / 2) / vh; // -1 … 1
        el.style.setProperty('--py', (p * -36).toFixed(1) + 'px');
      });
      ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ── Work: turn a card for each title, open the story on click ── */
  const list = document.querySelector('.work__list');
  const slot = document.querySelector('.slot');
  if (list) {
    let shown = null;
    const turn = (proj) => {
      if (!slot || !canHover.matches || shown === proj) return;
      shown = proj;
      const src = proj.querySelector('.proj__card');
      if (!src) return;
      const next = src.cloneNode(true);
      next.className = src.className.replace('proj__card', '').trim();
      next.removeAttribute('role');
      next.removeAttribute('aria-label');
      next.classList.add('is-coming');
      slot.querySelectorAll(':scope > *').forEach((old) => {
        old.classList.add('is-leaving');
        setTimeout(() => old.remove(), 520);
      });
      slot.appendChild(next);
      requestAnimationFrame(() => requestAnimationFrame(() => next.classList.remove('is-coming')));
    };
    list.querySelectorAll('.proj').forEach((proj) => {
      const btn = proj.querySelector('.proj__btn');
      btn.addEventListener('pointerenter', () => turn(proj));
      btn.addEventListener('focus', () => turn(proj));
      btn.addEventListener('click', () => {
        const open = !proj.classList.contains('is-open');
        proj.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
        turn(proj);
      });
    });
  }
})();
