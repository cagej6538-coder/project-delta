(() => {
  'use strict';
  const config = window.TASTY_CRIB;
  const money = value => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(value);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const products = config.products;
  const byId = id => products.find(product => product.id === id);
  const $ = selector => document.querySelector(selector);
  let filter = 'all', selectedProduct = null, selectedSize = 'Regular', toastTimer;
  let cart = [];
  try {
    const saved = JSON.parse(localStorage.getItem('tasty-crib-bag') || '[]');
    if (Array.isArray(saved)) cart = saved.filter(item => item && byId(item.id) && ['Regular','Large'].includes(item.size) && Number.isInteger(item.quantity) && item.quantity > 0 && item.quantity <= 99 && !(byId(item.id).category === 'bakery' && item.size === 'Large')).slice(0, 100);
  } catch (_) { /* A private browser or damaged saved bag should not prevent browsing. */ }
  function save() { try { localStorage.setItem('tasty-crib-bag', JSON.stringify(cart)); } catch (_) {} }
  const unitPrice = item => { const product = byId(item.id); return product.price + (item.size === 'Large' ? product.largeExtra : 0); };
  const total = () => cart.reduce((sum, item) => sum + unitPrice(item) * item.quantity, 0);
  function art(product) {
    const kind = ['latte','espresso','iced','cold','roll','mocha'].includes(product.kind) ? product.kind : 'latte';
    return `<div class="drink-art ${kind}" aria-hidden="true">${kind === 'roll' ? '<div class="pastry"></div>' : `${['iced','cold'].includes(kind) ? '<div class="straw"></div>' : ''}<div class="drink-cup">${['iced','cold'].includes(kind) ? '<i class="ice"></i>' : ''}<span>tasty crib</span></div>`}</div>`;
  }
  function renderProducts() {
    const query = $('#search').value.trim().toLowerCase();
    const visible = products.filter(product => (filter === 'all' || product.category === filter) && `${product.name} ${product.description}`.toLowerCase().includes(query));
    $('#products').innerHTML = visible.map(product => `<article class="product"><button class="product-visual" data-product="${escape(product.id)}" aria-label="View ${escape(product.name)}">${art(product)}</button><div class="product-meta"><button class="product-name" data-product="${escape(product.id)}">${escape(product.name)}</button><span class="product-price">${money(product.price)}</span></div><p class="product-label">${escape(product.label)}</p></article>`).join('');
    $('#no-results').hidden = visible.length > 0;
  }
  function notify(message) { clearTimeout(toastTimer); $('#toast').textContent = message; $('#toast').classList.add('visible'); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2500); }
  function openProduct(id) {
    selectedProduct = byId(id); if (!selectedProduct) return;
    selectedSize = 'Regular';
    $('#product-detail').innerHTML = `<div class="detail-art">${art(selectedProduct)}</div><h2 id="product-title">${escape(selectedProduct.name)}</h2><p class="detail-description">${escape(selectedProduct.description)}</p>${selectedProduct.category !== 'bakery' ? '<span class="size-label" id="size-label">Choose your size</span><div class="sizes" role="group" aria-labelledby="size-label"><button data-size="Regular" aria-pressed="true">Regular</button><button data-size="Large" aria-pressed="false">Large</button></div>' : '<p class="detail-description">One pastry per serving.</p>'}<button class="add-button" id="add-product"><span>Add to bag</span><span id="detail-price">${money(selectedProduct.price)}</span></button>`;
    $('#product-dialog').showModal();
  }
  function updateCart() {
    $('#cart-count').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    $('#cart-items').innerHTML = cart.length ? cart.map((item, index) => `<div class="cart-row"><div>${escape(byId(item.id).name)}<small>${byId(item.id).category === 'bakery' ? 'One pastry' : item.size} · ${money(unitPrice(item))} each</small></div><div class="quantity"><button data-quantity="${index}" data-change="-1" aria-label="Decrease ${escape(byId(item.id).name)} quantity">−</button><span>${item.quantity}</span><button data-quantity="${index}" data-change="1" aria-label="Increase ${escape(byId(item.id).name)} quantity" ${item.quantity >= 99 ? 'disabled' : ''}>+</button></div><button class="remove" data-remove="${index}">Remove</button><span>${money(unitPrice(item) * item.quantity)}</span></div>`).join('') : '<p class="checkout-note">A little empty, a lot of possibilities. Pick something you love from the menu.</p><button class="add-button" data-browse>Explore menu ↗</button>';
    const ready = !config.demoMode && /^[1-9]\d{7,14}$/.test(config.whatsapp);
    $('#cart-summary').innerHTML = cart.length ? `<div class="total"><span>Subtotal</span><strong>${money(total())}</strong></div><p class="checkout-note">Delivery charges, availability and any additional charges must be confirmed with the shop.</p>${ready ? '<a class="checkout" id="whatsapp-order" target="_blank" rel="noopener noreferrer">Send bag to WhatsApp ↗</a><p class="checkout-note">Opens WhatsApp with your bag details. Review and send the message yourself. No payment is collected here.</p>' : '<button class="checkout" disabled>Ordering not yet open</button><p class="checkout-note">Sample menu. This bag does not place an order or charge you.</p>'}` : '';
    if (ready && cart.length) {
      const message = `Hello Tasty Crib! I would like to confirm this order:\n${cart.map(item => `${item.quantity} × ${byId(item.id).name} (${item.size}) - ${money(unitPrice(item) * item.quantity)}`).join('\n')}\nSubtotal: ${money(total())}\nPlease confirm availability and the final total.`;
      $('#whatsapp-order').href = `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(message)}`;
    }
    save();
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('button'); if (!target) return;
    if (target.dataset.product) openProduct(target.dataset.product);
    if (target.dataset.filter) { filter = target.dataset.filter; document.querySelectorAll('[data-filter]').forEach(button => { const active = button.dataset.filter === filter; button.classList.toggle('selected', active); button.setAttribute('aria-pressed', String(active)); }); renderProducts(); }
    if (target.dataset.close) document.getElementById(target.dataset.close).close();
    if (target.dataset.size && selectedProduct) { selectedSize = target.dataset.size; document.querySelectorAll('[data-size]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.size === selectedSize))); $('#detail-price').textContent = money(selectedProduct.price + (selectedSize === 'Large' ? selectedProduct.largeExtra : 0)); }
    if (target.id === 'add-product' && selectedProduct) {
      const existing = cart.find(item => item.id === selectedProduct.id && item.size === selectedSize);
      if (existing && existing.quantity >= 99) { notify('Maximum 99 per item.'); return; }
      if (existing) existing.quantity++; else cart.push({ id: selectedProduct.id, size: selectedSize, quantity: 1 });
      updateCart(); $('#product-dialog').close(); notify(`${selectedProduct.name} added to your bag`);
    }
    if (target.id === 'open-cart') { updateCart(); $('#cart-dialog').showModal(); }
    if (target.dataset.quantity !== undefined) { const index = Number(target.dataset.quantity); if (cart[index]) { cart[index].quantity += Number(target.dataset.change); if (cart[index].quantity <= 0) cart.splice(index, 1); updateCart(); } }
    if (target.dataset.remove !== undefined) { cart.splice(Number(target.dataset.remove), 1); updateCart(); }
    if (target.hasAttribute('data-browse')) { $('#cart-dialog').close(); location.hash = 'menu'; }
  });
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }));
  $('#search').addEventListener('input', renderProducts);
  $('#year').textContent = new Date().getFullYear();
  if (config.address || config.openingHours) { const contact = [config.address, config.openingHours].filter(Boolean).join(' · '); $('#contact-details').textContent = contact; $('#location-answer').textContent = contact; }
  if (!config.demoMode) { $('#demo-note').textContent = 'Find your favourite. Make it yours.'; if (/^[1-9]\d{7,14}$/.test(config.whatsapp)) $('#order-answer').textContent = 'Build your bag, then send it to the shop on WhatsApp to confirm availability, the total and collection or delivery.'; }
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let ticking = false;
  function updateMotion() { ticking = false; document.documentElement.style.setProperty('--scroll', motion.matches ? '0' : String(Math.min(window.scrollY / 650, 1))); }
  window.addEventListener('scroll', () => { if (!ticking && !motion.matches) { ticking = true; requestAnimationFrame(updateMotion); } }, { passive: true });
  motion.addEventListener('change', updateMotion);
  renderProducts(); updateCart(); updateMotion();
})();
