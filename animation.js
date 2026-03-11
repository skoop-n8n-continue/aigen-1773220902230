/* ================================================================
   NEA Flash Deal Template — animation.js
   Northeast Alternatives | New Bedford, MA
   Canvas: 1920 × 1080
   ================================================================ */

gsap.registerPlugin(SplitText, CustomEase, DrawSVGPlugin, MotionPathPlugin);

// ── Custom eases ──────────────────────────────────────────────
CustomEase.create('nea-in',   'M0,0 C0.15,0 0.25,1 1,1');
CustomEase.create('nea-snap', 'M0,0 C0,0 0.05,0.99 1,1');
CustomEase.create('nea-out',  'M0,0 C0.6,0 1,0.4 1,1');

// ── DOM refs ──────────────────────────────────────────────────
const productImg       = document.getElementById('product-img');
const categoryBadge    = document.getElementById('category-badge');
const strainBadge      = document.getElementById('strain-badge');
const productBrand     = document.getElementById('product-brand');
const productFullName  = document.getElementById('product-full-name');
const originalPriceText= document.getElementById('original-price-text');
const strikethroughLine= document.getElementById('strikethrough-line');
const newPriceBig      = document.getElementById('new-price-big');
const savingsPct       = document.getElementById('savings-pct');
const savingsAmtText   = document.getElementById('savings-amount-text');
const flashOverlay     = document.getElementById('flash-overlay');
const bgStar           = document.getElementById('bg-star');
const savingsBadgeInner= document.getElementById('savings-badge-inner');
const glowRingOuter    = document.getElementById('glow-ring-outer');
const glowRingInner    = document.getElementById('glow-ring-inner');
const glowRingCore     = document.getElementById('glow-ring-core');
const accentLineTop    = document.getElementById('accent-line-top');
const accentLineBottom = document.getElementById('accent-line-bottom');
const mainArea         = document.getElementById('main-area');
const topBar           = document.getElementById('top-bar');
const bottomBar        = document.getElementById('bottom-bar');
const cornerTL         = document.getElementById('corner-tl');
const cornerBR         = document.getElementById('corner-br');
const dealEyebrow      = document.getElementById('deal-eyebrow');
const dealTitle        = document.getElementById('deal-title');
const productDetailsWrap = document.getElementById('product-details-wrap');
const priceSection     = document.getElementById('price-section');
const imageWrap        = document.getElementById('product-image-wrap');
const imageBadges      = document.getElementById('image-badges');
const savingsRow       = document.getElementById('savings-row');
const newPriceRow      = document.getElementById('new-price-row');
const originalPriceRow = document.getElementById('original-price-row');

// ── Particle system ───────────────────────────────────────────
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');

const particles = [];
const PARTICLE_COUNT = 60;

for (let i = 0; i < PARTICLE_COUNT; i++) {
  particles.push({
    x:    Math.random() * 1920,
    y:    Math.random() * 1080,
    size: Math.random() * 2.5 + 0.5,
    vx:   (Math.random() - 0.5) * 0.4,
    vy:   (Math.random() - 0.5) * 0.25 - 0.15,
    alpha: Math.random() * 0.5 + 0.1,
    color: Math.random() < 0.6 ? '#00B5AD' : '#FFD700',
  });
}

function drawParticles() {
  ctx.clearRect(0, 0, 1920, 1080);
  particles.forEach(p => {
    p.x  += p.vx;
    p.y  += p.vy;
    if (p.x < 0)    p.x = 1920;
    if (p.x > 1920) p.x = 0;
    if (p.y < 0)    p.y = 1080;
    if (p.y > 1080) p.y = 0;
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle   = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();

// ── Ambient loops (run forever, independent of product cycle) ─
gsap.to(bgStar, {
  rotation: 360,
  duration: 80,
  repeat: -1,
  ease: 'none',
  transformOrigin: '50% 50%',
});

gsap.to(savingsBadgeInner, {
  rotation: 15,
  duration: 2.4,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut',
});

gsap.to([glowRingOuter, glowRingInner, glowRingCore], {
  scale: 1.06,
  duration: 3,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut',
  stagger: 0.5,
  transformOrigin: '50% 50%',
});

// ── Strain badge colours ──────────────────────────────────────
function getStrainStyle(strain) {
  switch ((strain || '').toLowerCase()) {
    case 'indica':
      return { bg: 'rgba(123,60,175,0.25)', border: 'rgba(123,60,175,0.8)', color: '#CF9FFF' };
    case 'sativa':
      return { bg: 'rgba(255,140,0,0.20)',   border: 'rgba(255,140,0,0.8)',   color: '#FFB347' };
    case 'hybrid':
    default:
      return { bg: 'rgba(0,181,173,0.18)',   border: 'rgba(0,181,173,0.7)',   color: '#00E5D9' };
  }
}

// ── Price formatting ──────────────────────────────────────────
function fmt(num) {
  const n = parseFloat(num);
  if (isNaN(n)) return num;
  return Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`;
}

function pct(orig, disc) {
  const o = parseFloat(orig);
  const d = parseFloat(disc);
  if (!o || !d || o <= 0) return 0;
  return Math.round(((o - d) / o) * 100);
}

// ── Set product content (instant, before animation) ──────────
function applyProduct(product) {
  const origPrice  = parseFloat(product.price) || 0;
  const salePrice  = parseFloat(product.discounted_price) || 0;
  const savingsAmt = origPrice - salePrice;
  const discount   = pct(origPrice, salePrice);
  const strain     = getStrainStyle(product.strain_type || product.strain);

  productImg.src              = product.image_url || '';
  productBrand.textContent    = product.brand || '';
  productFullName.textContent = product.name || '';
  categoryBadge.textContent   = product.category || '';
  strainBadge.textContent     = product.strain_type || product.strain || '';

  strainBadge.style.background   = strain.bg;
  strainBadge.style.border        = `1.5px solid ${strain.border}`;
  strainBadge.style.color         = strain.color;

  originalPriceText.textContent = fmt(origPrice);
  newPriceBig.textContent       = fmt(salePrice);
  savingsPct.textContent        = `${discount}%`;
  savingsAmtText.textContent    = `SAVE ${fmt(savingsAmt.toFixed(2))}`;
}

// ─────────────────────────────────────────────────────────────
//  INITIAL STATE (all hidden, waiting for first cycle)
// ─────────────────────────────────────────────────────────────
function setInitialState() {
  gsap.set(mainArea,            { autoAlpha: 0, y: 30 });
  gsap.set(topBar,              { autoAlpha: 0, y: -40 });
  gsap.set(bottomBar,           { autoAlpha: 0, y: 40 });
  gsap.set(imageWrap,           { autoAlpha: 0, scale: 0.75, x: -60 });
  gsap.set(imageBadges,         { autoAlpha: 0, y: 20 });
  gsap.set(dealEyebrow,         { autoAlpha: 0, x: -30 });
  gsap.set(dealTitle,           { autoAlpha: 0, x: -40 });
  gsap.set(productDetailsWrap,  { autoAlpha: 0, x: -30 });
  gsap.set(originalPriceRow,    { autoAlpha: 0, x: -20 });
  gsap.set(newPriceRow,         { autoAlpha: 0, x: -40, scale: 0.8 });
  gsap.set(savingsRow,          { autoAlpha: 0, y: 20 });
  gsap.set(strikethroughLine,   { scaleX: 0 });
  gsap.set(savingsBadgeInner,   { scale: 0 });
  gsap.set(accentLineTop,       { scaleX: 0 });
  gsap.set(accentLineBottom,    { scaleX: 0 });
  gsap.set([cornerTL, cornerBR],{ autoAlpha: 0 });
  gsap.set(flashOverlay,        { opacity: 0 });
}

// ─────────────────────────────────────────────────────────────
//  INTRO: runs once on first load
// ─────────────────────────────────────────────────────────────
function introScene() {
  const tl = gsap.timeline();

  tl.to(topBar,    { autoAlpha: 1, y: 0, duration: 0.7, ease: 'nea-in' })
    .to(bottomBar, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'nea-in' }, '-=0.4')
    .to(accentLineTop,    { scaleX: 1, duration: 0.9, ease: 'nea-snap' }, '-=0.5')
    .to(accentLineBottom, { scaleX: 1, duration: 0.9, ease: 'nea-snap' }, '-=0.8')
    .to([cornerTL, cornerBR], { autoAlpha: 1, duration: 0.5, ease: 'nea-in' }, '-=0.3');

  return tl;
}

// ─────────────────────────────────────────────────────────────
//  PRODUCT IN  (each product entrance)
// ─────────────────────────────────────────────────────────────
function buildEntranceTL() {
  const tl = gsap.timeline();

  // Product image panel slides in from left
  tl.to(mainArea, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'power2.out' })
    .to(imageWrap, {
        autoAlpha: 1, scale: 1, x: 0,
        duration: 0.8, ease: 'back.out(1.4)',
      }, '-=0.3')
    .to(imageBadges, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'nea-in' }, '-=0.2')

    // Right side — deal header
    .to(dealEyebrow, { autoAlpha: 1, x: 0, duration: 0.55, ease: 'nea-snap' }, '-=0.6')
    .to(dealTitle,   { autoAlpha: 1, x: 0, duration: 0.55, ease: 'nea-snap' }, '-=0.45')

    // Product name/brand
    .to(productDetailsWrap, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')

    // Original price + strikethrough reveal
    .to(originalPriceRow, { autoAlpha: 1, x: 0, duration: 0.5, ease: 'nea-snap' }, '-=0.2')
    .to(strikethroughLine, { scaleX: 1, duration: 0.55, ease: 'nea-snap' }, '-=0.1')

    // New price — big slam
    .to(newPriceRow, {
        autoAlpha: 1, x: 0, scale: 1,
        duration: 0.55, ease: 'back.out(1.6)',
      }, '-=0.1')

    // Savings row
    .to(savingsRow, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'nea-in' }, '-=0.2')
    .to(savingsBadgeInner, { scale: 1, duration: 0.6, ease: 'back.out(2.2)' }, '-=0.35');

  return tl;
}

// ─────────────────────────────────────────────────────────────
//  IDLE: gentle floating while product is on screen
// ─────────────────────────────────────────────────────────────
function buildIdleTL(idleDuration) {
  const tl = gsap.timeline({ repeat: -1, yoyo: false });

  tl.to(imageWrap, {
      y: -18, duration: idleDuration / 2,
      ease: 'sine.inOut', yoyo: true, repeat: 1,
    }, 0)
    .to(newPriceBig, {
        textShadow: '0 0 60px rgba(255,215,0,1), 0 0 120px rgba(255,215,0,0.7), 0 0 200px rgba(255,215,0,0.35)',
        duration: idleDuration / 2,
        ease: 'sine.inOut', yoyo: true, repeat: 1,
      }, 0)
    .to(glowRingCore, {
        scale: 1.12, opacity: 0.9,
        duration: idleDuration / 2,
        ease: 'sine.inOut', yoyo: true, repeat: 1,
        transformOrigin: '50% 50%',
      }, 0);

  return tl;
}

// ─────────────────────────────────────────────────────────────
//  PRODUCT OUT (each product exit)
// ─────────────────────────────────────────────────────────────
function buildExitTL() {
  const tl = gsap.timeline();

  // Flash transition
  tl.to(flashOverlay, { opacity: 0.75, duration: 0.18, ease: 'power3.in' })
    .to(flashOverlay, { opacity: 0,    duration: 0.40, ease: 'power2.out' })

    // Reset all content invisibly during flash peak
    .set(imageWrap,          { autoAlpha: 0, scale: 0.75, x: -60 }, '-=0.55')
    .set(imageBadges,        { autoAlpha: 0, y: 20 }, '-=0.55')
    .set(dealEyebrow,        { autoAlpha: 0, x: -30 }, '-=0.55')
    .set(dealTitle,          { autoAlpha: 0, x: -40 }, '-=0.55')
    .set(productDetailsWrap, { autoAlpha: 0, x: -30 }, '-=0.55')
    .set(originalPriceRow,   { autoAlpha: 0, x: -20 }, '-=0.55')
    .set(newPriceRow,        { autoAlpha: 0, x: -40, scale: 0.8 }, '-=0.55')
    .set(savingsRow,         { autoAlpha: 0, y: 20 }, '-=0.55')
    .set(strikethroughLine,  { scaleX: 0 }, '-=0.55')
    .set(savingsBadgeInner,  { scale: 0 }, '-=0.55');

  return tl;
}

// ─────────────────────────────────────────────────────────────
//  PRODUCT CYCLE DURATION SETTINGS
// ─────────────────────────────────────────────────────────────
const ENTRANCE_DURATION = 2.0;   // seconds for animation to play in
const IDLE_DURATION     = 7.0;   // seconds product is prominently on screen
const EXIT_DURATION     = 0.8;   // seconds for flash/exit

// ─────────────────────────────────────────────────────────────
//  ANIMATE ONE PRODUCT THEN CHAIN NEXT
// ─────────────────────────────────────────────────────────────
function animateProduct(products, index, isFirst) {
  const product = products[index];
  const nextIndex = (index + 1) % products.length;

  // Apply content
  applyProduct(product);

  const master = gsap.timeline({
    onComplete: () => {
      // Idle tween is separate and needs to be killed
      idleTween.kill();
      animateProduct(products, nextIndex, false);
    },
  });

  // entrance
  master.add(buildEntranceTL());

  // slight pause to let entrance settle
  master.addLabel('idle', `+=${ENTRANCE_DURATION}`);

  // start idle (will be killed in onComplete)
  let idleTween;
  master.call(() => {
    idleTween = buildIdleTL(IDLE_DURATION);
  }, [], 'idle');

  // wait idle duration then exit
  master.to({}, { duration: IDLE_DURATION }, 'idle');

  // exit
  master.add(buildExitTL());
}

// ─────────────────────────────────────────────────────────────
//  LOAD PRODUCTS & START
// ─────────────────────────────────────────────────────────────
async function loadProducts() {
  let products = [];

  try {
    const response = await fetch('./products.json', { cache: 'no-store' });
    const data     = await response.json();
    products = Array.isArray(data) ? data : (data.products || []);
  } catch (err) {
    console.error('[NEA] Failed to load products.json:', err);
  }

  if (products.length === 0) {
    console.warn('[NEA] No products found — nothing to animate.');
    return;
  }

  console.log(`[NEA] Loaded ${products.length} product(s). Starting animation.`);

  setInitialState();

  // Run the one-time intro (bars slide in), then start cycling products
  const introTL = introScene();
  introTL.eventCallback('onComplete', () => {
    animateProduct(products, 0, true);
  });
}

window.addEventListener('DOMContentLoaded', loadProducts);
