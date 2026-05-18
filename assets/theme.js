/* ============================================
   JUGUETAZO - JavaScript Principal
   ============================================ */

'use strict';

// ============ HEADER SCROLL ============
const header = document.querySelector('.site-header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }, { passive: true });
}

// ============ MOBILE MENU ============
const menuBtn = document.querySelector('.btn-menu');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileOverlay = document.querySelector('.mobile-menu-overlay');
const mobileClose = document.querySelector('.mobile-close');

function openMobileMenu() {
  mobileMenu?.classList.add('open');
  mobileOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  mobileMenu?.classList.remove('open');
  mobileOverlay?.classList.remove('active');
  document.body.style.overflow = '';
}

menuBtn?.addEventListener('click', openMobileMenu);
mobileClose?.addEventListener('click', closeMobileMenu);
mobileOverlay?.addEventListener('click', closeMobileMenu);

// ============ CART DRAWER ============
const cartBtns = document.querySelectorAll('[data-cart-open]');
const cartDrawer = document.querySelector('.cart-drawer');
const cartOverlay = document.querySelector('.cart-overlay');
const cartClose = document.querySelector('.cart-close');

function openCart() {
  cartDrawer?.classList.add('open');
  cartOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartDrawer?.classList.remove('open');
  cartOverlay?.classList.remove('active');
  document.body.style.overflow = '';
}

cartBtns.forEach(btn => btn.addEventListener('click', openCart));
cartClose?.addEventListener('click', closeCart);
cartOverlay?.addEventListener('click', closeCart);

// ============ SCROLL TO TOP ============
const scrollTopBtn = document.querySelector('.scroll-top');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ============ TOAST NOTIFICATIONS ============
function showToast(message, type = 'success', duration = 3000) {
  const container = document.querySelector('.toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toast-in 0.3s cubic-bezier(.4,0,.2,1) reverse forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// ============ ADD TO CART ============
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-add-to-cart]');
  if (!btn) return;

  const productId = btn.dataset.addToCart;
  const productTitle = btn.dataset.productTitle || 'Producto';
  const originalText = btn.innerHTML;

  btn.disabled = true;
  btn.innerHTML = '<span style="display:inline-block;animation:spin 0.8s linear infinite">⏳</span> Agregando...';

  // Simulate Shopify cart AJAX
  fetch('/cart/add.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: productId, quantity: 1 })
  })
  .then(r => r.json())
  .then(() => {
    showToast(`${productTitle} agregado al carrito`);
    updateCartCount();
    openCart();
  })
  .catch(() => {
    showToast('Error al agregar el producto', 'error');
  })
  .finally(() => {
    btn.disabled = false;
    btn.innerHTML = originalText;
  });
});

// ============ CART COUNT ============
function updateCartCount() {
  fetch('/cart.js')
    .then(r => r.json())
    .then(cart => {
      const badges = document.querySelectorAll('.cart-badge');
      badges.forEach(badge => {
        badge.textContent = cart.item_count;
        badge.style.display = cart.item_count > 0 ? 'flex' : 'none';
      });
    })
    .catch(() => {});
}

// Update on load
updateCartCount();

// ============ QTY CONTROLS ============
document.addEventListener('click', (e) => {
  const decreaseBtn = e.target.closest('.qty-btn[data-action="decrease"]');
  const increaseBtn = e.target.closest('.qty-btn[data-action="increase"]');

  if (decreaseBtn || increaseBtn) {
    const control = (decreaseBtn || increaseBtn).closest('.qty-control');
    const input = control?.querySelector('.qty-value');
    if (!input) return;

    let val = parseInt(input.value) || 1;
    if (decreaseBtn) val = Math.max(1, val - 1);
    if (increaseBtn) val = Math.min(99, val + 1);
    input.value = val;

    const lineKey = control.dataset.lineKey;
    if (lineKey) updateLineItem(lineKey, val);
  }
});

function updateLineItem(key, qty) {
  fetch('/cart/change.js', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: key, quantity: qty })
  })
  .then(r => r.json())
  .then(() => {
    updateCartCount();
    updateCartDrawer();
  })
  .catch(() => {});
}

function updateCartDrawer() {
  fetch('/cart.js')
    .then(r => r.json())
    .then(cart => {
      const subtotal = document.querySelector('[data-cart-subtotal]');
      if (subtotal) {
        subtotal.textContent = formatMoney(cart.total_price);
      }
    })
    .catch(() => {});
}

function formatMoney(cents) {
  return '$' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' MXN';
}

// ============ COUNTDOWN TIMER ============
function initCountdown() {
  const countdowns = document.querySelectorAll('[data-countdown]');
  countdowns.forEach(el => {
    const endDate = new Date(el.dataset.countdown);

    function tick() {
      const now = new Date();
      const diff = endDate - now;

      if (diff <= 0) {
        el.innerHTML = '<span class="countdown-ended">¡Oferta terminada!</span>';
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      const h = el.querySelector('[data-hours]');
      const m = el.querySelector('[data-minutes]');
      const s = el.querySelector('[data-seconds]');

      if (h) h.textContent = String(hours).padStart(2, '0');
      if (m) m.textContent = String(minutes).padStart(2, '0');
      if (s) s.textContent = String(seconds).padStart(2, '0');
    }

    tick();
    setInterval(tick, 1000);
  });
}

initCountdown();

// ============ WISHLIST ============
const wishlistOverlay = document.querySelector('.wishlist-overlay');
const wishlistDrawer  = document.querySelector('.wishlist-drawer');
const wishlistClose   = document.querySelector('.wishlist-close');
const wishlistOpenBtn = document.querySelector('[data-wishlist-open]');

function openWishlist() {
  renderWishlistDrawer();
  wishlistDrawer?.classList.add('open');
  wishlistOverlay?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeWishlist() {
  wishlistDrawer?.classList.remove('open');
  wishlistOverlay?.classList.remove('active');
  document.body.style.overflow = '';
}

wishlistOpenBtn?.addEventListener('click', openWishlist);
wishlistClose?.addEventListener('click', closeWishlist);
wishlistOverlay?.addEventListener('click', closeWishlist);

function renderWishlistDrawer() {
  const body = document.getElementById('wishlist-body');
  if (!body) return;
  const list = getWishlist();

  if (list.length === 0) {
    body.innerHTML = `
      <div style="text-align:center;padding:60px 20px;color:var(--color-text-light);">
        <div style="font-size:3.5rem;margin-bottom:16px;">🤍</div>
        <h3 style="font-weight:800;margin-bottom:8px;color:var(--color-text);">Aún no tienes favoritos</h3>
        <p style="font-size:0.88rem;">Toca el ❤️ en cualquier producto para guardarlo aquí</p>
      </div>`;
    return;
  }

  body.innerHTML = list.map(item => `
    <div class="cart-item" style="align-items:center;">
      <img class="cart-item-img" src="${item.image}" alt="${item.title}" onerror="this.src=''">
      <div class="cart-item-info">
        <p class="cart-item-title">${item.title}</p>
        <p style="font-size:0.9rem;font-weight:900;color:var(--color-primary-dark);margin:4px 0 8px;">${item.price}</p>
        <div style="display:flex;gap:8px;">
          <a href="${item.url}" class="btn btn-primary btn-sm" style="font-size:0.78rem;padding:6px 14px;">Ver producto</a>
          <button onclick="removeFromWishlistAndRefresh('${item.id}')" style="background:none;border:1.5px solid #eee;border-radius:9999px;padding:6px 10px;font-size:0.75rem;cursor:pointer;color:var(--color-text-light);">✕ Quitar</button>
        </div>
      </div>
    </div>`).join('');
}

function removeFromWishlistAndRefresh(id) {
  removeFromWishlist(id);
  document.querySelectorAll(`[data-wishlist="${id}"]`).forEach(btn => {
    btn.classList.remove('wishlisted');
    btn.style.color = '';
  });
  updateWishlistBadge();
  renderWishlistDrawer();
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-wishlist]');
  if (!btn) return;

  const productId  = btn.dataset.wishlist;
  const productTitle = btn.closest('.product-card')?.querySelector('.product-title')?.textContent?.trim() || '';
  const productPrice = btn.closest('.product-card')?.querySelector('.price-current')?.textContent?.trim() || '';
  const productImage = btn.closest('.product-card')?.querySelector('.product-image')?.src || '';
  const productUrl   = btn.closest('.product-card')?.querySelector('.product-title a')?.href || '#';

  btn.classList.toggle('wishlisted');
  if (btn.classList.contains('wishlisted')) {
    btn.style.color = '#FF3B3B';
    showToast('Agregado a favoritos ❤️');
    addToWishlist({ id: productId, title: productTitle, price: productPrice, image: productImage, url: productUrl });
  } else {
    btn.style.color = '';
    showToast('Eliminado de favoritos');
    removeFromWishlist(productId);
  }
  updateWishlistBadge();
});

function addToWishlist(item) {
  const list = getWishlist();
  if (!list.find(i => i.id === item.id)) {
    list.push(item);
    localStorage.setItem('juguetazo_wishlist', JSON.stringify(list));
  }
}

function removeFromWishlist(id) {
  const list = getWishlist().filter(i => i.id !== id);
  localStorage.setItem('juguetazo_wishlist', JSON.stringify(list));
}

function getWishlist() {
  try { return JSON.parse(localStorage.getItem('juguetazo_wishlist') || '[]'); }
  catch { return []; }
}

function updateWishlistBadge() {
  const count = getWishlist().length;
  const badge = document.querySelector('.wishlist-badge');
  if (!badge) return;
  badge.textContent = count;
  badge.style.display = count > 0 ? 'flex' : 'none';
}

function applyWishlistState() {
  const list = getWishlist();
  document.querySelectorAll('[data-wishlist]').forEach(btn => {
    if (list.find(i => i.id === btn.dataset.wishlist)) {
      btn.classList.add('wishlisted');
      btn.style.color = '#FF3B3B';
    }
  });
  updateWishlistBadge();
}
applyWishlistState();

// ============ SEARCH ============
const searchInput = document.querySelector('.search-input');
const searchForm = document.querySelector('.search-form');

searchForm?.addEventListener('submit', (e) => {
  const query = searchInput?.value.trim();
  if (!query) e.preventDefault();
});

// ============ LAZY IMAGES ============
if ('IntersectionObserver' in window) {
  const lazyImages = document.querySelectorAll('img[data-src]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  lazyImages.forEach(img => observer.observe(img));
}

// ============ ANNOUNCEMENT MARQUEE ============
const announcementBar = document.querySelector('.announcement-bar');
if (announcementBar) {
  announcementBar.setAttribute('aria-label', 'Anuncios de la tienda');
}

// CSS spin animation
const style = document.createElement('style');
style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
document.head.appendChild(style);

// ============ CARD IMAGE SLIDER ============
function initCardSliders() {
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const slides = slider.querySelectorAll('.card-slide');
    const dots   = slider.querySelectorAll('.card-dot');
    const prev   = slider.querySelector('.card-arrow-prev');
    const next   = slider.querySelector('.card-arrow-next');
    if (slides.length < 2) return;

    let current = 0;

    function goTo(index) {
      slides[current].classList.remove('active');
      slides[current].setAttribute('aria-hidden', 'true');
      dots[current]?.classList.remove('active');

      current = (index + slides.length) % slides.length;

      slides[current].classList.add('active');
      slides[current].removeAttribute('aria-hidden');
      dots[current]?.classList.add('active');
    }

    prev?.addEventListener('click', (e) => { e.preventDefault(); goTo(current - 1); });
    next?.addEventListener('click', (e) => { e.preventDefault(); goTo(current + 1); });

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    // Swipe touch support
    let touchStartX = 0;
    slider.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    }, { passive: true });
  });
}

initCardSliders();
