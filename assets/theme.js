/**
 * Frostbyte Core Theme Script - State Management, Cart Drawer, Currency & PDP
 */

(function () {
  'use strict';

  // Store Currency Data
  const CURRENCIES = {
    USD: { symbol: '$', rate: 1.0, flag: '🇺🇸', name: 'United States', freeShippingThreshold: 60 },
    GBP: { symbol: '£', rate: 0.79, flag: '🇬🇧', name: 'United Kingdom', freeShippingThreshold: 50 },
    EUR: { symbol: '€', rate: 0.92, flag: '🇪🇺', name: 'European Union', freeShippingThreshold: 55 },
    CAD: { symbol: 'CA$', rate: 1.36, flag: '🇨🇦', name: 'Canada', freeShippingThreshold: 80 },
    AUD: { symbol: 'AU$', rate: 1.52, flag: '🇦🇺', name: 'Australia', freeShippingThreshold: 90 }
  };

  let currentCurrency = 'USD';

  // Cart State
  const cart = {
    items: [
      {
        id: 'orb-lamp',
        title: 'Levitating Galaxy Orb Ambient Lamp',
        priceUSD: 49.99,
        quantity: 1,
        image: 'assets/product-orb-lamp.jpg'
      }
    ],
    giftBoxAdded: false,
    giftBoxPriceUSD: 3.99
  };

  // Helper: Format Price
  function formatMoney(amountUSD) {
    const cur = CURRENCIES[currentCurrency] || CURRENCIES.USD;
    const converted = amountUSD * cur.rate;
    return `${cur.symbol}${converted.toFixed(2)}`;
  }

  // 1. Navigation Drawer Toggle
  function initNavDrawer() {
    const trigger = document.querySelector('[data-drawer-trigger="nav"]');
    const drawer = document.getElementById('NavDrawer');
    const overlay = document.getElementById('DrawerOverlay');
    const closeBtns = document.querySelectorAll('[data-drawer-close="nav"]');

    function openDrawer() {
      drawer?.classList.add('is-active');
      overlay?.classList.add('is-active');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer?.classList.remove('is-active');
      if (!document.getElementById('CartDrawer')?.classList.contains('is-active')) {
        overlay?.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    }

    trigger?.addEventListener('click', openDrawer);
    closeBtns.forEach(b => b.addEventListener('click', closeDrawer));
    overlay?.addEventListener('click', closeDrawer);
  }

  // 2. Cart Drawer State & Rendering
  function updateCartUI() {
    const cartCountEl = document.querySelectorAll('.cart-badge-count');
    const itemsListEl = document.getElementById('CartDrawerItems');
    const subtotalEl = document.getElementById('CartSubtotalValue');
    const freeShippingBarEl = document.getElementById('FreeShippingProgressBar');
    const freeShippingTextEl = document.getElementById('FreeShippingText');

    let totalQty = 0;
    let subtotalUSD = 0;

    cart.items.forEach(item => {
      totalQty += item.quantity;
      subtotalUSD += item.priceUSD * item.quantity;
    });

    if (cart.giftBoxAdded) {
      subtotalUSD += cart.giftBoxPriceUSD;
    }

    // Badge count
    cartCountEl.forEach(el => {
      el.textContent = totalQty;
      el.style.display = totalQty > 0 ? 'flex' : 'none';
    });

    // Subtotal
    if (subtotalEl) {
      subtotalEl.textContent = formatMoney(subtotalUSD);
    }

    // Free Shipping Progress
    const cur = CURRENCIES[currentCurrency];
    const thresholdUSD = cur.freeShippingThreshold / cur.rate;
    const diffUSD = thresholdUSD - subtotalUSD;

    if (freeShippingBarEl && freeShippingTextEl) {
      if (diffUSD <= 0) {
        freeShippingBarEl.style.width = '100%';
        freeShippingTextEl.innerHTML = `🎉 <strong>Congratulations! You unlocked Free Worldwide Express Shipping!</strong>`;
      } else {
        const percent = Math.min(100, Math.max(10, (subtotalUSD / thresholdUSD) * 100));
        freeShippingBarEl.style.width = `${percent}%`;
        freeShippingTextEl.innerHTML = `Add <strong>${formatMoney(diffUSD)}</strong> more for <strong>Free Worldwide Express Shipping!</strong>`;
      }
    }

    // Render Items
    if (itemsListEl) {
      if (cart.items.length === 0) {
        itemsListEl.innerHTML = `
          <div style="text-align:center; padding: 40px 10px; color: var(--color-text-muted);">
            <div style="font-size: 2.5rem; margin-bottom: 8px;">🎁</div>
            <p style="font-weight: 700;">Your winter gadget bag is empty.</p>
            <p style="font-size: 0.8rem; margin-top: 4px;">Explore our holiday boredom busters!</p>
          </div>
        `;
      } else {
        itemsListEl.innerHTML = cart.items.map(item => `
          <div class="cart-item-row" data-item-id="${item.id}">
            <img class="cart-item-img" src="${item.image}" alt="${item.title}">
            <div class="cart-item-details">
              <div class="cart-item-name">${item.title}</div>
              <div class="cart-item-price">${formatMoney(item.priceUSD * item.quantity)}</div>
              <div class="cart-qty-control">
                <button class="cart-qty-btn" data-action="decrease" data-id="${item.id}">−</button>
                <span class="cart-qty-val">${item.quantity}</span>
                <button class="cart-qty-btn" data-action="increase" data-id="${item.id}">+</button>
              </div>
            </div>
            <button class="cart-remove-item" data-action="remove" data-id="${item.id}" aria-label="Remove item">✕</button>
          </div>
        `).join('');
      }
    }
  }

  function initCartDrawer() {
    const triggerBtns = document.querySelectorAll('[data-drawer-trigger="cart"]');
    const drawer = document.getElementById('CartDrawer');
    const overlay = document.getElementById('DrawerOverlay');
    const closeBtns = document.querySelectorAll('[data-drawer-close="cart"]');
    const upsellCheckbox = document.getElementById('GiftBoxUpsellCheckbox');

    function openCart() {
      drawer?.classList.add('is-active');
      overlay?.classList.add('is-active');
      document.body.style.overflow = 'hidden';
      updateCartUI();
    }

    function closeCart() {
      drawer?.classList.remove('is-active');
      if (!document.getElementById('NavDrawer')?.classList.contains('is-active')) {
        overlay?.classList.remove('is-active');
        document.body.style.overflow = '';
      }
    }

    triggerBtns.forEach(b => b.addEventListener('click', openCart));
    closeBtns.forEach(b => b.addEventListener('click', closeCart));

    // Upsell checkbox toggle
    upsellCheckbox?.addEventListener('change', (e) => {
      cart.giftBoxAdded = e.target.checked;
      updateCartUI();
    });

    // Cart items delegation
    document.getElementById('CartDrawerItems')?.addEventListener('click', (e) => {
      const target = e.target.closest('[data-action]');
      if (!target) return;

      const action = target.getAttribute('data-action');
      const id = target.getAttribute('data-id');
      const item = cart.items.find(i => i.id === id);

      if (!item) return;

      if (action === 'increase') {
        item.quantity += 1;
      } else if (action === 'decrease') {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          cart.items = cart.items.filter(i => i.id !== id);
        }
      } else if (action === 'remove') {
        cart.items = cart.items.filter(i => i.id !== id);
      }

      updateCartUI();
    });

    // Global Quick Add buttons
    document.querySelectorAll('[data-quick-add]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = btn.getAttribute('data-product-id') || 'orb-lamp';
        const title = btn.getAttribute('data-product-title') || 'Holiday Gadget';
        const price = parseFloat(btn.getAttribute('data-product-price') || '39.99');
        const img = btn.getAttribute('data-product-image') || 'assets/product-orb-lamp.jpg';

        const existing = cart.items.find(i => i.id === id);
        if (existing) {
          existing.quantity += 1;
        } else {
          cart.items.push({ id, title, priceUSD: price, quantity: 1, image: img });
        }

        openCart();
      });
    });

    updateCartUI();
  }

  // 3. Currency & Country Switcher
  function initCurrencySwitcher() {
    const selects = document.querySelectorAll('.country-currency-select');
    const flagEls = document.querySelectorAll('.announcement-flag, .current-country-flag');
    const countryNameEls = document.querySelectorAll('.current-country-name');

    function setCurrency(code) {
      if (!CURRENCIES[code]) return;
      currentCurrency = code;
      const c = CURRENCIES[code];

      flagEls.forEach(el => el.textContent = c.flag);
      countryNameEls.forEach(el => el.textContent = c.name);

      // Convert all dynamic price tags on page
      document.querySelectorAll('[data-price-usd]').forEach(el => {
        const usd = parseFloat(el.getAttribute('data-price-usd'));
        el.textContent = formatMoney(usd);
      });

      updateCartUI();
    }

    selects.forEach(select => {
      select.value = currentCurrency;
      select.addEventListener('change', (e) => {
        setCurrency(e.target.value);
        selects.forEach(s => s.value = e.target.value);
      });
    });
  }

  // 4. Delivery Countdown Estimator Widget
  function initDeliveryEstimator() {
    const hoursEl = document.getElementById('CountdownHours');
    const minsEl = document.getElementById('CountdownMins');
    const secsEl = document.getElementById('CountdownSecs');
    if (!hoursEl || !minsEl) return;

    // Daily deadline countdown (set to 8 hours 42 mins from initial session)
    let totalSeconds = 8 * 3600 + 42 * 60 + 15;

    function tick() {
      if (totalSeconds > 0) {
        totalSeconds--;
      } else {
        totalSeconds = 12 * 3600; // Reset
      }

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      hoursEl.textContent = String(h).padStart(2, '0');
      minsEl.textContent = String(m).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(s).padStart(2, '0');
    }

    setInterval(tick, 1000);
    tick();
  }

  // 5. Sticky Bottom Bar Observer on PDP
  function initStickyBottomBar() {
    const triggerSection = document.querySelector('.pdp-pricing-card') || document.querySelector('.hero-section');
    const stickyBar = document.querySelector('.sticky-bottom-bar');
    if (!triggerSection || !stickyBar) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        // When the primary buy section scrolls above the screen, show sticky bar
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          stickyBar.classList.add('is-visible');
        } else {
          stickyBar.classList.remove('is-visible');
        }
      });
    }, { threshold: 0 });

    observer.observe(triggerSection);
  }

  // 6. Collapsible Accordions
  function initAccordions() {
    const triggers = document.querySelectorAll('.accordion-trigger');
    triggers.forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const body = item?.querySelector('.accordion-body');
        if (!item || !body) return;

        const isOpen = item.classList.contains('is-open');

        // Optional: close other sibling accordions in same group
        const parent = item.parentElement;
        if (parent?.hasAttribute('data-accordion-single')) {
          parent.querySelectorAll('.accordion-item').forEach(other => {
            if (other !== item) {
              other.classList.remove('is-open');
              const ob = other.querySelector('.accordion-body');
              if (ob) ob.style.maxHeight = null;
            }
          });
        }

        if (isOpen) {
          item.classList.remove('is-open');
          body.style.maxHeight = null;
        } else {
          item.classList.add('is-open');
          body.style.maxHeight = body.scrollHeight + 'px';
        }
      });
    });
  }

  // 7. PDP Image Slider Dot Tracker
  function initPdpGallery() {
    const slider = document.querySelector('.pdp-swipe-slider');
    const dots = document.querySelectorAll('.pdp-dot');
    if (!slider || !dots.length) return;

    slider.addEventListener('scroll', () => {
      const width = slider.offsetWidth;
      const index = Math.round(slider.scrollLeft / width);
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === index);
      });
    }, { passive: true });
  }

  // 8. Track Order Simulation Form
  function initTrackOrder() {
    const form = document.getElementById('TrackOrderForm');
    const resultBox = document.getElementById('TrackOrderResult');
    if (!form || !resultBox) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const num = document.getElementById('TrackOrderNumber')?.value || 'FB-88392';
      const orderSpan = document.getElementById('TrackedOrderCode');
      if (orderSpan) orderSpan.textContent = num;
      resultBox.classList.add('is-active');
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // Document Ready
  document.addEventListener('DOMContentLoaded', () => {
    initNavDrawer();
    initCartDrawer();
    initCurrencySwitcher();
    initDeliveryEstimator();
    initStickyBottomBar();
    initAccordions();
    initPdpGallery();
    initTrackOrder();
  });

  window.FrostbyteTheme = {
    cart,
    formatMoney,
    updateCartUI
  };
})();
