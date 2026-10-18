const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const motionToggle = document.getElementById('motion-toggle');
const visual = document.getElementById('hero-visual');
let userPaused = false;
let scrollFrame = 0;
let sceneVisible = true;
const motionAllowed = () => !reduceMotion.matches && !userPaused && !document.hidden;

function updateMotion() {
  const paused = !motionAllowed();
  root.classList.toggle('motion-paused', paused);
  if (motionToggle) {
    motionToggle.hidden = false;
    motionToggle.disabled = reduceMotion.matches;
    motionToggle.setAttribute('aria-pressed', String(userPaused || reduceMotion.matches));
    motionToggle.querySelector('.motion-icon').textContent = paused ? '▷' : 'Ⅱ';
    motionToggle.querySelector('.motion-label').textContent = reduceMotion.matches ? '動きを抑えています' : userPaused ? '動きを再開する' : '動きを止める';
  }
  if (paused) {
    for (const element of document.querySelectorAll('.hero-visual,.price-card')) {
      for (const property of ['--tilt-x','--tilt-y','--shift-x','--shift-y','--scroll-depth','--light-x','--light-y']) element.style.removeProperty(property);
    }
  }
}
root.classList.add('effects-ready');
updateMotion();
motionToggle?.addEventListener('click', () => { userPaused = !userPaused; updateMotion(); });
reduceMotion.addEventListener('change', updateMotion);
document.addEventListener('visibilitychange', updateMotion);

function addTilt(element, strength, shift) {
  let frame = 0;
  let pointer;
  element.addEventListener('pointermove', (event) => {
    if (!finePointer.matches || !motionAllowed()) return;
    pointer = {x:event.clientX, y:event.clientY};
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!pointer || !motionAllowed()) return;
      const bounds = element.getBoundingClientRect();
      const x = Math.max(-.5, Math.min(.5, (pointer.x - bounds.left) / bounds.width - .5));
      const y = Math.max(-.5, Math.min(.5, (pointer.y - bounds.top) / bounds.height - .5));
      element.style.setProperty('--tilt-x', `${-y * strength}deg`);
      element.style.setProperty('--tilt-y', `${x * strength}deg`);
      element.style.setProperty('--shift-x', `${x * shift}px`);
      element.style.setProperty('--shift-y', `${y * shift}px`);
      element.style.setProperty('--light-x', `${(x + .5) * 100}%`);
      element.style.setProperty('--light-y', `${(y + .5) * 100}%`);
    });
  });
  element.addEventListener('pointerleave', () => {
    pointer = null;
    cancelAnimationFrame(frame);
    frame = 0;
    for (const property of ['--tilt-x','--tilt-y','--shift-x','--shift-y','--light-x','--light-y']) element.style.removeProperty(property);
  });
}
if (visual) addTilt(visual, 12, 20);
for (const card of document.querySelectorAll('.price-card')) addTilt(card, 7, 0);

if ('IntersectionObserver' in window) {
  const entryObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      if (motionAllowed()) entry.target.classList.add('effect-entered');
      observer.unobserve(entry.target);
    }
  }, {threshold:.12});
  for (const element of document.querySelectorAll('.price-card,.section-heading,.story-year,.address-card,.step')) entryObserver.observe(element);
  const sceneObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      entry.target.classList.toggle('scene-outside', !entry.isIntersecting);
      if (entry.target === visual) sceneVisible = entry.isIntersecting;
    }
  });
  for (const scene of document.querySelectorAll('.hero-visual,.phone-stage')) sceneObserver.observe(scene);
}
window.addEventListener('scroll', () => {
  if (scrollFrame || !sceneVisible || !motionAllowed() || !visual) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    if (!motionAllowed()) return;
    const bounds = visual.getBoundingClientRect();
    const depth = Math.max(-18, Math.min(18, -bounds.top * .045));
    visual.style.setProperty('--scroll-depth', `${depth}px`);
  });
}, {passive:true});

for (const button of document.querySelectorAll('.button,.header-contact,.mobile-bar a')) {
  button.addEventListener('pointerdown', (event) => {
    if (!motionAllowed()) return;
    const bounds = button.getBoundingClientRect();
    const ring = document.createElement('span');
    ring.className = 'tap-ring';
    ring.setAttribute('aria-hidden', 'true');
    ring.style.left = `${event.clientX - bounds.left}px`;
    ring.style.top = `${event.clientY - bounds.top}px`;
    button.append(ring);
    ring.addEventListener('animationend', () => ring.remove(), {once:true});
    setTimeout(() => ring.remove(), 750);
  });
}
const copyButton = document.getElementById('copy-address');
copyButton?.addEventListener('click', async () => {
  const address = '〒669-3311\n兵庫県丹波市柏原町母坪408-2\nリサイクルショップ オーディン丹波店\n店長 大西一輝\n電話：0795-71-5028';
  const status = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(address);
    status.textContent = '送り先をコピーしました。';
  } catch {
    status.textContent = 'コピーできませんでした。上の送り先を選択してコピーしてください。';
  }
});

// The hero remains a static first image when JavaScript is unavailable.
if (visual) {
  const slides = [...visual.querySelectorAll('.hero-slide')];
  const panel = document.getElementById('hero-carousel-panel');
  const dots = [...visual.querySelectorAll('[data-carousel-dot]')];
  const titles = ['ゲーム・思い出の品','CD・映画DVD','携帯・スマートフォン'];
  let slideIndex = 0;
  let timer = 0;
  let manual = false;
  let hovered = false;
  let focused = false;
  let visible = true;
  let touchStart = null;
  function scheduleSlide() {
    clearTimeout(timer);
    if (manual || hovered || focused || !visible || !motionAllowed()) return;
    timer = setTimeout(() => { showSlide(slideIndex + 1, false); }, 7000);
  }
  function showSlide(index, fromUser = true) {
    slideIndex = ((index % slides.length) + slides.length) % slides.length;
    if (fromUser) manual = true;
    slides.forEach((slide, i) => { slide.hidden = i !== slideIndex; });
    dots.forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === slideIndex)));
    document.getElementById('hero-carousel-title').textContent = titles[slideIndex];
    document.getElementById('hero-carousel-count').textContent = `${slideIndex + 1} / ${slides.length}`;
    scheduleSlide();
  }
  if (slides.length > 1 && panel) {
    panel.hidden = false;
    visual.querySelector('[data-carousel-prev]').addEventListener('click', () => showSlide(slideIndex - 1));
    visual.querySelector('[data-carousel-next]').addEventListener('click', () => showSlide(slideIndex + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));
    visual.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); showSlide(slideIndex + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); showSlide(slideIndex - 1); }
    });
    visual.addEventListener('pointerenter', () => { hovered = true; scheduleSlide(); });
    visual.addEventListener('pointerleave', () => { hovered = false; scheduleSlide(); });
    visual.addEventListener('focusin', () => { focused = true; scheduleSlide(); });
    visual.addEventListener('focusout', (event) => { if (!visual.contains(event.relatedTarget)) { focused = false; scheduleSlide(); } });
    visual.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'touch' || event.target.closest('button,a')) return;
      touchStart = {x:event.clientX,y:event.clientY};
    });
    visual.addEventListener('pointerup', (event) => {
      if (!touchStart) return;
      const x = event.clientX - touchStart.x;
      const y = event.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(x) > 45 && Math.abs(x) > Math.abs(y) * 1.4) showSlide(slideIndex + (x < 0 ? 1 : -1));
    });
    visual.addEventListener('pointercancel', () => { touchStart = null; });
    motionToggle?.addEventListener('click', scheduleSlide);
    reduceMotion.addEventListener('change', scheduleSlide);
    document.addEventListener('visibilitychange', scheduleSlide);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; scheduleSlide(); }, {threshold:.15});
      observer.observe(visual);
    }
    scheduleSlide();
  }
}

// Reviews are checked against the cited public source before being added.
// Static HTML keeps the sourced excerpts readable if JavaScript or fetch fails.
async function loadReviewCarousel() {
  const track = document.getElementById('review-track');
  if (!track) return;
  let reviews;
  try {
    const response = await fetch('./reviews.json');
    if (!response.ok) return;
    const payload = await response.json();
    reviews = Array.isArray(payload) ? payload.filter((review) => {
      if (!review || review.verified !== true || typeof review.text !== 'string' || !review.text.trim() || typeof review.author !== 'string' || !review.author.trim()) return false;
      try {
        const source = new URL(review.source);
        return source.protocol === 'https:' && ['www.google.com', 'google.com', 'maps.google.com', 'www.google.co.jp', 'map.yahoo.co.jp', 'www.ekiten.jp', 'hikakaku.com'].includes(source.hostname) && typeof review.sourceLabel === 'string' && review.sourceLabel.trim();
      } catch { return false; }
    }) : [];
  } catch { return; }
  if (!reviews.length) return;
  const dots = document.getElementById('review-dots');
  const fragment = document.createDocumentFragment();
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  reviews.forEach((review, i) => {
    const card = element('article', 'review-card');
    card.id = `customer-review-${i + 1}`;
    card.setAttribute('role', 'group');
    card.setAttribute('aria-label', `${i + 1} / ${reviews.length}`);
    const author = element('div', 'review-author');
    const avatar = element('span', 'review-avatar', review.author.slice(0, 1));
    avatar.setAttribute('aria-hidden', 'true');
    author.append(avatar);
    const person = element('div', 'review-person');
    person.append(element('p', 'review-author-name', `${review.author} さん`));
    if (typeof review.date === 'string') person.append(element('p', 'review-date', review.date));
    author.append(person);
    card.append(author);
    if (typeof review.context === 'string') card.append(element('p', 'review-context', review.context));
    if (Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5) {
      const stars = element('p', 'review-stars', `★ ${review.rating.toFixed(1)} / 5`);
      stars.setAttribute('aria-label', `5点中${review.rating}点`);
      card.append(stars);
    }
    card.append(element('blockquote', 'review-quote', review.text));
    if (review.excerpt === true) card.append(element('span', 'review-excerpt', '投稿の一部を抜粋'));
    const source = element('a', 'review-source', `出典：${review.sourceLabel} ↗`);
    source.href = review.source;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    card.append(source);
    fragment.append(card);
    const dot = element('button', 'review-dot');
    dot.type = 'button';
    dot.setAttribute('aria-label', `${i + 1}件目の口コミを表示`);
    dot.setAttribute('aria-controls', card.id);
    dot.setAttribute('aria-pressed', String(i === 0));
    dots.append(dot);
  });
  track.replaceChildren(fragment);
  const cards = [...track.children];
  const controls = document.getElementById('review-controls');
  controls.hidden = reviews.length < 2;
  document.getElementById('review-disclosure').hidden = false;
  let active = 0;
  const update = () => {
    active = Math.max(0, Math.min(cards.length - 1, Math.round(track.scrollLeft / (track.clientWidth + 20))));
    [...dots.children].forEach((dot, i) => dot.setAttribute('aria-pressed', String(i === active)));
    document.getElementById('review-position').textContent = `${active + 1} / ${cards.length}`;
  };
  const show = (index) => {
    const next = ((index % cards.length) + cards.length) % cards.length;
    track.scrollTo({left:next * (track.clientWidth + 20), behavior:reduceMotion.matches ? 'auto' : 'smooth'});
  };
  document.getElementById('review-prev').addEventListener('click', () => show(active - 1));
  document.getElementById('review-next').addEventListener('click', () => show(active + 1));
  [...dots.children].forEach((dot, i) => dot.addEventListener('click', () => show(i)));
  track.addEventListener('scroll', update, {passive:true});
  track.addEventListener('keydown', (event) => {
    if (event.target !== track) return;
    if (event.key === 'ArrowRight') {event.preventDefault();show(active + 1);}
    if (event.key === 'ArrowLeft') {event.preventDefault();show(active - 1);}
  });
  if ('ResizeObserver' in window) new ResizeObserver(() => track.scrollTo({left:active * (track.clientWidth + 20),behavior:'auto'})).observe(track);
  update();
}
loadReviewCarousel();
