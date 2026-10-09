// استخدام بروكسي AllOrigins المتوافق
async function odooRpc(service, method, args) {
  const odooPayload = JSON.stringify({
    jsonrpc: "2.0",
    method: "call",
    params: { service, method, args }
  });

  const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://onesizee.odoo.com/jsonrpc");

  const res = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: odooPayload
  });

  const data = await res.json();
  if (data.error) throw data.error;
  return data.result;
}

const ODOO_CONFIG = {
  db: "onesizee",
  login: "mohamedhanysaad660@gmail.com",
  apiKey: "e3f7c615b7c17c356c8d828c2c02cad9a48d9920"
};

const state = {
  products: [],
  cart: [],
  wishlist: new Set(),
  category: 'all',
  query: '',
  lang: 'en',
  introOpened: false,
  currentProduct: null,
  odooUid: null
};

const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];

const I18N = {
  en: {
    shop: 'SHOP',
    story: 'STORY',
    contact: 'CONTACT',
    drag: 'DRAG TO OPEN',
    eyebrow: 'THE NEW STANDARD',
    heroText: 'A premium fashion identity built around clean form, confidence and attitude.',
    explore: 'EXPLORE COLLECTION →',
    collection: 'THE COLLECTION',
    managed: 'Products, prices, images, sizes, colors and stock are managed live from Odoo.',
    search: 'Search products...',
    all: 'ALL',
    catalogWaiting: 'NO PRODUCTS FOUND',
    catalogWaitingText: 'Add products in your Odoo Sales or Inventory app to see them live here.',
    storyText: 'ONE SIZE is a premium fashion concept where restraint becomes the statement. The storefront is built to let the products lead.',
    qualityText: 'Designed around clean silhouettes and a focused visual language.',
    experienceText: 'A fast, responsive shopping experience built for every screen.',
    contactText: 'Reach ONE SIZE directly through the channels below.',
    phone: 'CALL US',
    about: 'ABOUT',
    shipping: 'SHIPPING',
    returns: 'RETURNS',
    privacy: 'PRIVACY',
    terms: 'TERMS',
    yourBag: 'YOUR BAG',
    total: 'TOTAL',
    checkout: 'CHECKOUT',
    addBag: 'ADD TO BAG',
    yourOrder: 'YOUR ORDER',
    name: 'Full name',
    phoneInput: 'Phone',
    address: 'Address',
    cash: 'Cash on delivery',
    later: 'Payment handled by Odoo later',
    placeOrder: 'PLACE ORDER',
    orderSuccess: 'Your order has been sent to Odoo successfully!'
  },
  ar: {
    shop: 'المتجر',
    story: 'قصتنا',
    contact: 'تواصل معنا',
    drag: 'اسحب للفتح',
    eyebrow: 'المعيار الجديد',
    heroText: 'هوية أزياء راقية مبنية على البساطة والثقة والتميز.',
    explore: 'استكشف التشكيلة ←',
    collection: 'التشكيلة',
    managed: 'المنتجات، الأسعار، الصور والمخزون تدار مباشرة من أودو.',
    search: 'ابحث عن منتج...',
    all: 'الكل',
    catalogWaiting: 'لا توجد منتجات حالياً',
    catalogWaitingText: 'أضف منتجاتك في تطبيق المبيعات بأودو وستظهر هنا فوراً.',
    storyText: 'ONE SIZE هو مفهوم راقٍ للأزياء؛ حيث يصبح التصميم الهادئ هو عنوان التميز.',
    qualityText: 'تصميم يعتمد على القصات النظيفة واللغة البصرية الأنيقة.',
    experienceText: 'تجربة تسوق سريعة ومتجاوبة مصممة لكل الشاشات.',
    contactText: 'تواصل مع ONE SIZE مباشرة عبر القنوات التالية.',
    phone: 'اتصل بنا',
    about: 'عن المتجر',
    shipping: 'الشحن',
    returns: 'الإرجاع',
    privacy: 'الخصوصية',
    terms: 'الشروط',
    yourBag: 'حقيبتك',
    total: 'الإجمالي',
    checkout: 'إتمام الشراء',
    addBag: 'أضف للحقيبة',
    yourOrder: 'طلبك',
    name: 'الاسم بالكامل',
    phoneInput: 'رقم الهاتف',
    address: 'العنوان',
    cash: 'الدفع عند الاستلام',
    later: 'الدفع عبر أودو لاحقاً',
    placeOrder: 'تأكيد الطلب',
    orderSuccess: 'تم إرسال طلبك إلى أودو بنجاح!'
  }
};

async function syncProductsFromOdoo() {
  try {
    state.odooUid = await odooRpc('common', 'authenticate', [
      ODOO_CONFIG.db,
      ODOO_CONFIG.login,
      ODOO_CONFIG.apiKey,
      {}
    ]);

    if (!state.odooUid) {
      console.warn('Odoo auth failed');
      return;
    }

    const records = await odooRpc('object', 'execute_kw', [
      ODOO_CONFIG.db,
      state.odooUid,
      ODOO_CONFIG.apiKey,
      'product.template',
      'search_read',
      [[['sale_ok', '=', true]]],
      {
        fields: ['id', 'name', 'list_price', 'description_sale', 'categ_id', 'image_1920']
      }
    ]);

    state.products = records.map(item => {
      let cat = 'all';
      const cName = (item.categ_id && item.categ_id[1] ? item.categ_id[1] : '').toLowerCase();
      if (cName.includes('shirt')) cat = 'tshirts';
      else if (cName.includes('hood')) cat = 'hoodies';
      else if (cName.includes('pant')) cat = 'pants';

      return {
        id: item.id,
        name: item.name,
        price: item.list_price || 0,
        category: cat,
        description: item.description_sale || '',
        image: item.image_1920 ? `data:image/jpeg;base64,${item.image_1920}` : null,
        sizes: ['S', 'M', 'L', 'XL']
      };
    });

    renderProducts();
  } catch (err) {
    console.error('Odoo sync error:', err);
  }
}

function applyLang() {
  const d = I18N[state.lang];
  document.documentElement.lang = state.lang;
  document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach(el => el.textContent = d[el.dataset.i18n] || el.textContent);
  $$('[data-i18n-placeholder]').forEach(el => el.placeholder = d[el.dataset.i18nPlaceholder] || el.placeholder);
  $('#langBtn').textContent = state.lang === 'en' ? 'AR' : 'EN';
  renderProducts();
}

function renderProducts() {
  const list = state.products.filter(p =>
    (state.category === 'all' || p.category === state.category) &&
    (!state.query || String(p.name).toLowerCase().includes(state.query.toLowerCase()))
  );

  $('#products').innerHTML = list.map(p => `
    <article class="product" data-id="${p.id}">
      <div class="product-visual">
        ${p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}">` : '<div style="letter-spacing:.2em;color:#444">ONE SIZE</div>'}
        <button class="heart ${state.wishlist.has(p.id) ? 'active' : ''}" data-wish="${p.id}">
          ${state.wishlist.has(p.id) ? '♥' : '♡'}
        </button>
      </div>
      <div class="product-info">
        <small>${escapeHtml((p.category || 'COLLECTION').toUpperCase())}</small>
        <strong>${escapeHtml(p.name)}</strong>
        <b>EGP ${Number(p.price || 0).toLocaleString()}</b>
      </div>
    </article>
  `).join('');

  $('#empty').hidden = list.length > 0;

  $$('.product').forEach(el => el.onclick = e => {
    if (e.target.closest('[data-wish]')) return;
    openProduct(el.dataset.id);
  });

  $$('[data-wish]').forEach(b => b.onclick = e => {
    e.stopPropagation();
    const id = b.dataset.wish;
    state.wishlist.has(id) ? state.wishlist.delete(id) : state.wishlist.add(id);
    $('#wishCount').textContent = state.wishlist.size;
    renderProducts();
  });
}

function openProduct(id) {
  const p = state.products.find(x => String(x.id) === String(id));
  if (!p) return;
  state.currentProduct = p;
  $('#modalVisual').innerHTML = p.image ? `<img src="${p.image}" alt="${escapeHtml(p.name)}">` : `<span>ONE SIZE</span>`;
  $('#modalCat').textContent = (p.category || 'COLLECTION').toUpperCase();
  $('#modalName').textContent = p.name;
  $('#modalPrice').textContent = `EGP ${Number(p.price || 0).toLocaleString()}`;
  $('#modalDesc').textContent = p.description || '';
  $('#modalSizes').innerHTML = (p.sizes || []).map((s, i) => `<button class="size ${i === 0 ? 'selected' : ''}">${escapeHtml(s)}</button>`).join('');
  $('#productModal').classList.add('open');

  $$('.size').forEach(b => b.onclick = () => {
    $$('.size').forEach(x => x.classList.remove('selected'));
    b.classList.add('selected');
  });
}

function addToCart(p = state.currentProduct) {
  if (!p) return;
  const x = state.cart.find(i => String(i.id) === String(p.id));
  x ? x.qty++ : state.cart.push({ ...p, qty: 1 });
  updateCart();
  closeProduct();
  openDrawer();
}

function updateCart() {
  const count = state.cart.reduce((a, x) => a + x.qty, 0);
  const total = state.cart.reduce((a, x) => a + Number(x.price || 0) * x.qty, 0);
  $('#cartCount').textContent = count;
  $('#drawerTotal').textContent = `EGP ${total.toLocaleString()}`;
  $('#drawerItems').innerHTML = state.cart.length ? state.cart.map(x => `
    <div class="bag-row">
      <div class="bag-thumb">ONE</div>
      <div><strong>${escapeHtml(x.name)}</strong><br><small>Qty ${x.qty}</small></div>
      <div><b>EGP ${(Number(x.price || 0) * x.qty).toLocaleString()}</b><br><button data-remove="${x.id}">REMOVE</button></div>
    </div>
  `).join('') : `<div class="empty-bag">YOUR BAG IS EMPTY.</div>`;

  $$('[data-remove]').forEach(b => b.onclick = () => {
    state.cart = state.cart.filter(x => String(x.id) !== String(b.dataset.remove));
    updateCart();
  });
}

function openDrawer() {
  $('#drawer').classList.add('open');
  $('#overlay').classList.add('show');
  $('#drawer').setAttribute('aria-hidden', 'false');
}

function closeDrawer() {
  $('#drawer').classList.remove('open');
  $('#overlay').classList.remove('show');
  $('#drawer').setAttribute('aria-hidden', 'true');
}

function closeProduct() {
  $('#productModal').classList.remove('open');
}

function checkout() {
  if (!state.cart.length) return;
  $('#checkoutSummary').innerHTML = state.cart.map(x => `
    <div class="checkout-item">
      <span>${escapeHtml(x.name)} × ${x.qty}</span>
      <b>EGP ${(Number(x.price || 0) * x.qty).toLocaleString()}</b>
    </div>
  `).join('');
  $('#checkoutModal').classList.add('open');
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}

function openIntro() {
  const pull = $('#zipPull'), intro = $('#intro'), zipper = pull.closest('.zipper');
  let startY = null, startTop = 0, dragging = false, moved = false;
  const maxTravel = () => Math.max(0, (zipper?.clientHeight || 0) - pull.offsetHeight);
  const reset = () => { pull.style.top = '0px'; pull.classList.remove('dragging'); };
  const finish = () => {
    if (state.introOpened) return;
    state.introOpened = true;
    pull.style.top = maxTravel() + 'px';
    intro.classList.add('hide');
    document.body.classList.remove('lock');
  };

  pull.addEventListener('pointerdown', e => {
    if (state.introOpened) return;
    e.preventDefault();
    dragging = true;
    moved = false;
    startY = e.clientY;
    startTop = parseFloat(getComputedStyle(pull).top) || 0;
    pull.setPointerCapture(e.pointerId);
    pull.classList.add('dragging');
  });

  pull.addEventListener('pointermove', e => {
    if (!dragging || state.introOpened) return;
    e.preventDefault();
    const travel = maxTravel();
    const delta = e.clientY - startY;
    if (Math.abs(delta) > 8) moved = true;
    const next = Math.max(0, Math.min(travel, startTop + delta));
    pull.style.top = next + 'px';
    if (moved && next >= travel * .88) finish();
  });

  pull.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    if (!state.introOpened) reset();
  });

  pull.addEventListener('pointercancel', () => {
    dragging = false;
    if (!state.introOpened) reset();
  });
}

function bind() {
  openIntro();
  $('#langBtn').onclick = () => {
    state.lang = state.lang === 'en' ? 'ar' : 'en';
    applyLang();
  };
  $('#searchInput').oninput = e => {
    state.query = e.target.value;
    renderProducts();
  };
  $('#clearSearch').onclick = () => {
    $('#searchInput').value = '';
    state.query = '';
    renderProducts();
  };
  $('#searchSubmit').onclick = () => $('#searchInput').focus();
  $$('.filter').forEach(b => b.onclick = () => {
    $$('.filter').forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    state.category = b.dataset.cat;
    renderProducts();
  });
  $('#cartBtn').onclick = openDrawer;
  $('#closeDrawer').onclick = closeDrawer;
  $('#overlay').onclick = closeDrawer;
  $('#closeModal').onclick = closeProduct;
  $('#modalAdd').onclick = () => addToCart();
  $('#checkoutBtn').onclick = checkout;
  $('#closeCheckout').onclick = () => $('#checkoutModal').classList.remove('open');

  $('#checkoutForm').onsubmit = e => {
    e.preventDefault();
    alert(I18N[state.lang].orderSuccess);
    state.cart = [];
    updateCart();
    $('#checkoutModal').classList.remove('open');
  };

  $('#menuBtn').onclick = () => $('#mobileMenu').style.display = 'flex';
  $('#closeMenu').onclick = () => $('#mobileMenu').style.display = 'none';
  $$('#mobileMenu a').forEach(a => a.onclick = () => $('#mobileMenu').style.display = 'none');
  $('#wishBtn').onclick = () => { $('#shop').scrollIntoView({ behavior: 'smooth' }); };
}

window.addEventListener('DOMContentLoaded', () => {
  bind();
  applyLang();
  syncProductsFromOdoo();
  setTimeout(() => {
    $('#loader').style.opacity = '0';
    setTimeout(() => $('#loader').remove(), 650);
  }, 900);
});
