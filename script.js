// Amai Schilderwerken — interacties
(() => {
  const CONTACT_EMAIL = 'info@amaischilderwerken.be'; // TODO: vervang door je echte adres
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // Nav: achtergrond bij scrollen + sticky CTA op mobiel
  const nav = $('#nav');
  const sticky = $('.sticky-cta');
  const quote = $('#offerte');
  const onScroll = () => {
    nav.classList.toggle('is-stuck', scrollY > 20);
    const nearForm = quote.getBoundingClientRect().top < innerHeight * 0.9;
    sticky.classList.toggle('is-on', scrollY > 500 && !nearForm);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobiel menu
  const burger = $('#burger');
  const menu = $('#menu');
  const setMenu = (open) => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.addEventListener('click', (e) => e.target.closest('a') && setMenu(false));
  addEventListener('keydown', (e) => e.key === 'Escape' && setMenu(false));

  // Hero: titelregels exact even breed maken (blokvorm)
  const lines = $$('.hero__title .line');
  const fitTitle = () => {
    lines.forEach((l) => (l.style.fontSize = ''));
    const target = lines[0].getBoundingClientRect().width;
    lines.slice(1).forEach((l) => {
      const size = parseFloat(getComputedStyle(l).fontSize);
      l.style.fontSize = `${(size * target) / l.getBoundingClientRect().width}px`;
    });
  };
  fitTitle();
  document.fonts?.ready.then(fitTitle);
  addEventListener('resize', fitTitle);

  // Scroll reveal, met lichte stagger per groep
  const items = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.filter((e) => e.isIntersecting).forEach((e, n) => {
        e.target.style.setProperty('--d', `${n * 80}ms`);
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add('is-in'));
  }

  // Diensten: paneel klapt open bij aanwijzen, tikken of focus
  const accItems = $$('.acc__item');
  const openAcc = (item) => accItems.forEach((el) => el.classList.toggle('is-active', el === item));
  accItems.forEach((item) => ['mouseenter', 'click', 'focus'].forEach((ev) => item.addEventListener(ev, () => openAcc(item))));

  // Amai Factor: rij openklappen bij klikken, één tegelijk
  const factorRows = $$('.factor__row');
  factorRows.forEach((row) => row.addEventListener('click', () => {
    const open = !row.classList.contains('is-open');
    factorRows.forEach((r) => {
      r.classList.toggle('is-open', r === row && open);
      $('.factor__toggle', r).setAttribute('aria-expanded', r === row && open);
    });
  }));

  // Menu: een dienst kiezen opent meteen het juiste fotopaneel
  $$('[data-dienst]').forEach((link) => link.addEventListener('click', () => openAcc(accItems[Number(link.dataset.dienst)])));

  // Uitklaplijsten (Amai Factor en FAQ): per lijst één tegelijk open
  ['.afx__list', '.faq__list'].forEach((sel) => {
    const group = $$(`${sel} details`);
    group.forEach((d) => d.addEventListener('toggle', () => {
      if (d.open) group.forEach((o) => o !== d && (o.open = false));
    }));
  });

  // Offerteformulier: opent het mailprogramma met een ingevulde aanvraag
  const form = $('#form');
  const note = $('#note');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = form.elements;
    const bad = [f.naam, f.email].filter((el) => !el.checkValidity());
    [f.naam, f.email].forEach((el) => el.classList.toggle('is-bad', bad.includes(el)));
    if (bad.length) {
      note.textContent = 'Vul zeker je naam en een geldig e-mailadres in.';
      note.classList.add('is-err');
      bad[0].focus();
      return;
    }
    const diensten = $$('input[name="dienst"]:checked', form).map((c) => c.value).join(', ') || '—';
    const body = [
      `Naam: ${f.naam.value}`,
      `Telefoon: ${f.telefoon.value || '—'}`,
      `E-mail: ${f.email.value}`,
      `Gemeente: ${f.gemeente.value || '—'}`,
      `Diensten: ${diensten}`,
      '',
      f.bericht.value,
    ].join('\n');
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Offerteaanvraag — ${f.naam.value}`)}&body=${encodeURIComponent(body)}`;
    note.classList.remove('is-err');
    note.textContent = 'Je mailprogramma opent met je aanvraag. Even op verzenden klikken en wij doen de rest.';
  });

  // Hero: postcode invullen en doorspringen naar het offerteformulier
  $('#zip').addEventListener('submit', (e) => {
    e.preventDefault();
    const zip = $('#zipcode').value.trim();
    if (zip) form.elements.gemeente.value = zip;
    quote.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    setTimeout(() => form.elements.naam.focus({ preventScroll: true }), 700);
  });

  $('#year').textContent = new Date().getFullYear();
})();
