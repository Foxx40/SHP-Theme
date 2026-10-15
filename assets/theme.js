/* Native Shopify storefront interactions. */
(function () {
  'use strict';

  const config = window.FrostbyteTheme || { routes: {} };
  const routes = config.routes;
  const cartJsonUrl = `${routes.cartUrl || '/cart'}.js`;
  const addUrl = `${routes.cartAddUrl || '/cart/add'}.js`;
  const changeUrl = `${routes.cartChangeUrl || '/cart/change'}.js`;

  const money = (cents) => new Intl.NumberFormat(document.documentElement.lang || 'en', {
    style: 'currency', currency: window.Shopify?.currency?.active || window.Shopify?.currency?.shop || 'USD'
  }).format((cents || 0) / 100);

  const openDrawer = (name) => {
    document.getElementById(name === 'cart' ? 'CartDrawer' : 'NavDrawer')?.classList.add('is-active');
    document.getElementById('DrawerOverlay')?.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };
  const closeDrawers = () => {
    document.querySelectorAll('.cart-drawer, .nav-drawer').forEach((drawer) => drawer.classList.remove('is-active'));
    document.getElementById('DrawerOverlay')?.classList.remove('is-active');
    document.body.style.overflow = '';
  };

  async function getCart() {
    const response = await fetch(cartJsonUrl, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Unable to load cart');
    return response.json();
  }

  function renderCart(cart) {
    document.querySelectorAll('.cart-badge-count').forEach((badge) => {
      badge.textContent = cart.item_count;
      badge.style.display = cart.item_count ? 'flex' : 'none';
    });
    const subtotal = document.getElementById('CartSubtotalValue');
    if (subtotal) subtotal.textContent = money(cart.total_price);

    const list = document.getElementById('CartDrawerItems');
    if (list) {
      list.innerHTML = cart.items.length ? cart.items.map((item) => `
        <div class="cart-item-row" data-item-key="${item.key}">
          ${item.image ? `<img class="cart-item-img" src="${item.image}" alt="${item.title.replace(/"/g, '&quot;')}">` : ''}
          <div class="cart-item-details">
            <div class="cart-item-name">${item.product_title}</div>
            <div class="cart-item-price">${money(item.final_line_price)}</div>
            <div class="cart-qty-control">
              <button class="cart-qty-btn" type="button" data-cart-change="${item.key}" data-quantity="${item.quantity - 1}" aria-label="Decrease quantity">−</button>
              <span class="cart-qty-val">${item.quantity}</span>
              <button class="cart-qty-btn" type="button" data-cart-change="${item.key}" data-quantity="${item.quantity + 1}" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <button class="cart-remove-item" type="button" data-cart-change="${item.key}" data-quantity="0" aria-label="Remove item">×</button>
        </div>`).join('') : '<div style="text-align:center; padding:40px 10px; color:var(--color-text-muted)">Your cart is empty.</div>';
    }

    const threshold = Number(document.getElementById('CartDrawer')?.dataset.freeShippingThreshold || 0) * 100;
    const progress = document.getElementById('FreeShippingProgressBar');
    const message = document.getElementById('FreeShippingText');
    if (threshold && progress && message) {
      const remaining = threshold - cart.total_price;
      progress.style.width = `${Math.min(100, Math.max(0, (cart.total_price / threshold) * 100))}%`;
      message.innerHTML = remaining > 0 ? `Add <strong>${money(remaining)}</strong> more for free shipping.` : '<strong>You unlocked free shipping!</strong>';
    }
  }

  async function refreshCart() {
    try { renderCart(await getCart()); } catch (error) { console.error(error); }
  }
  async function addToCart(variantId, quantity = 1) {
    const response = await fetch(addUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: [{ id: Number(variantId), quantity }] })
    });
    if (!response.ok) throw new Error('This product could not be added to the cart.');
    await refreshCart();
    openDrawer('cart');
  }
  async function changeCart(key, quantity) {
    const response = await fetch(changeUrl, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ id: key, quantity: Math.max(0, Number(quantity)) })
    });
    if (!response.ok) throw new Error('Unable to update cart.');
    renderCart(await response.json());
  }

  function initDrawers() {
    document.querySelectorAll('[data-drawer-trigger]').forEach((trigger) => trigger.addEventListener('click', () => openDrawer(trigger.dataset.drawerTrigger)));
    document.querySelectorAll('[data-drawer-close]').forEach((button) => button.addEventListener('click', closeDrawers));
    document.getElementById('DrawerOverlay')?.addEventListener('click', closeDrawers);
  }
  function initCart() {
    refreshCart();
    document.querySelectorAll('.pdp-action-group select[name="id"]').forEach((select) => select.addEventListener('change', () => {
      document.querySelectorAll('[data-quick-add]').forEach((button) => {
        if (button.closest('.pdp-action-group') || button.classList.contains('sticky-bar-atc')) button.dataset.productId = select.value;
      });
    }));
    document.addEventListener('click', async (event) => {
      const quickAdd = event.target.closest('[data-quick-add]');
      if (quickAdd) {
        event.preventDefault();
        const selectedVariant = quickAdd.closest('.pdp-action-group')?.querySelector('select[name="id"]')?.value;
        try { await addToCart(selectedVariant || quickAdd.dataset.productId); } catch (error) { alert(error.message); }
      }
      const change = event.target.closest('[data-cart-change]');
      if (change) {
        try { await changeCart(change.dataset.cartChange, change.dataset.quantity); } catch (error) { alert(error.message); }
      }
    });
  }
  function initAccordions() {
    document.querySelectorAll('.accordion-trigger').forEach((trigger) => trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item'); const body = item?.querySelector('.accordion-body');
      if (!item || !body) return;
      const group = item.parentElement;
      if (group?.hasAttribute('data-accordion-single')) group.querySelectorAll('.accordion-item').forEach((other) => {
        if (other !== item) { other.classList.remove('is-open'); const otherBody = other.querySelector('.accordion-body'); if (otherBody) otherBody.style.maxHeight = null; }
      });
      item.classList.toggle('is-open'); body.style.maxHeight = item.classList.contains('is-open') ? `${body.scrollHeight}px` : null;
    }));
  }
  function initGallery() {
    const slider = document.querySelector('.pdp-swipe-slider'); const dots = document.querySelectorAll('.pdp-dot');
    slider?.addEventListener('scroll', () => dots.forEach((dot, index) => dot.classList.toggle('is-active', index === Math.round(slider.scrollLeft / slider.offsetWidth))), { passive: true });
  }
  function initTrackingDemo() {
    const form = document.getElementById('TrackOrderForm'); const result = document.getElementById('TrackOrderResult');
    form?.addEventListener('submit', (event) => { event.preventDefault(); const code = document.getElementById('TrackOrderNumber')?.value; const target = document.getElementById('TrackedOrderCode'); if (target) target.textContent = code; result?.classList.add('is-active'); });
  }

  document.addEventListener('DOMContentLoaded', () => { initDrawers(); initCart(); initAccordions(); initGallery(); initTrackingDemo(); });
  window.FrostbyteTheme = { ...config, refreshCart, addToCart };
})();
