const state={products:[],cart:[],wishlist:new Set(),category:'all',query:'',lang:'en',introOpened:false,currentProduct:null};
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const I18N={en:{shop:'SHOP',story:'STORY',contact:'CONTACT',drag:'DRAG TO OPEN',eyebrow:'THE NEW STANDARD',heroText:'A premium fashion identity built around clean form, confidence and attitude.',explore:'EXPLORE COLLECTION ↗',collection:'THE COLLECTION',managed:'Products, prices, images, sizes, colors and stock will be managed from Odoo.',search:'Search products...',all:'ALL',catalogWaiting:'COLLECTION COMING SOON',catalogWaitingText:'Products will appear here automatically after the Odoo connection is enabled.',storyText:'ONE SIZE is a premium fashion concept where restraint becomes the statement. The storefront is built to let the products lead.',qualityText:'Designed around clean silhouettes and a focused visual language.',experienceText:'A fast, responsive shopping experience built for every screen.',contactText:'Reach ONE SIZE directly through the channels below.',phone:'CALL US',about:'ABOUT',shipping:'SHIPPING',returns:'RETURNS',privacy:'PRIVACY',terms:'TERMS',yourBag:'YOUR BAG',total:'TOTAL',checkout:'CHECKOUT',addBag:'ADD TO BAG',yourOrder:'YOUR ORDER',name:'Full name',phoneInput:'Phone',address:'Address',cash:'Cash on delivery',later:'Payment — handled by Odoo later',placeOrder:'PLACE ORDER'},ar:{shop:'المتجر',story:'قصتنا',contact:'تواصل معنا',drag:'اسحب للفتح',eyebrow:'المعيار الجديد',heroText:'هوية أزياء فاخرة مبنية على البساطة والثقة والحضور.',explore:'استكشف المجموعة ↗',collection:'المجموعة',managed:'المنتجات والأسعار والصور والمقاسات والألوان والمخزون ستُدار من Odoo.',search:'ابحث عن المنتجات...',all:'الكل',catalogWaiting:'المجموعة قريبًا',catalogWaitingText:'ستظهر المنتجات هنا تلقائيًا بعد تفعيل الربط مع Odoo.',storyText:'ONE SIZE مفهوم أزياء فاخر تتحول فيه البساطة إلى هوية. صُمم المتجر ليجعل المنتجات هي العنصر الأساسي.',qualityText:'تصميمات بخطوط نظيفة وهوية بصرية واضحة.',experienceText:'تجربة سريعة ومتجاوبة مصممة لكل الشاشات.',contactText:'تواصل مع ONE SIZE مباشرة من خلال القنوات التالية.',phone:'اتصل بنا',about:'عن البراند',shipping:'الشحن',returns:'الاستبدال والاسترجاع',privacy:'الخصوصية',terms:'الشروط',yourBag:'حقيبتك',total:'الإجمالي',checkout:'الدفع',addBag:'أضف للحقيبة',yourOrder:'طلبك',name:'الاسم بالكامل',phoneInput:'رقم الهاتف',address:'العنوان',cash:'الدفع عند الاستلام',later:'الدفع — تتم إدارته من Odoo لاحقًا',placeOrder:'إتمام الطلب'}};
function applyLang(){const d=I18N[state.lang];document.documentElement.lang=state.lang;document.documentElement.dir=state.lang==='ar'?'rtl':'ltr';$$('[data-i18n]').forEach(el=>el.textContent=d[el.dataset.i18n]||el.textContent);$$('[data-i18n-placeholder]').forEach(el=>el.placeholder=d[el.dataset.i18nPlaceholder]||el.placeholder);$('#langBtn').textContent=state.lang==='en'?'AR':'EN';renderProducts();}
function renderProducts(){const list=state.products.filter(p=>(state.category==='all'||p.category===state.category)&&(!state.query||String(p.name).toLowerCase().includes(state.query.toLowerCase())));$('#products').innerHTML=list.map(p=>`<article class="product" data-id="${p.id}"><div class="product-visual">${p.image?`<img src="${p.image}" alt="${escapeHtml(p.name)}">`:''}<button class="heart ${state.wishlist.has(p.id)?'active':''}" data-wish="${p.id}">${state.wishlist.has(p.id)?'♥':'♡'}</button></div><div class="product-info"><small>${escapeHtml((p.category||'').toUpperCase())}</small><strong>${escapeHtml(p.name)}</strong><b>EGP ${Number(p.price||0).toLocaleString()}</b></div></article>`).join('');$('#empty').hidden=list.length>0;$$('.product').forEach(el=>el.onclick=e=>{if(e.target.closest('[data-wish]'))return;openProduct(el.dataset.id)});$$('[data-wish]').forEach(b=>b.onclick=e=>{e.stopPropagation();const id=b.dataset.wish;state.wishlist.has(id)?state.wishlist.delete(id):state.wishlist.add(id);$('#wishCount').textContent=state.wishlist.size;renderProducts()});}
function openProduct(id){const p=state.products.find(x=>String(x.id)===String(id));if(!p)return;state.currentProduct=p;$('#modalVisual').innerHTML=p.image?`<img src="${p.image}" alt="${escapeHtml(p.name)}">`:`<span>ONE SIZE</span>`;$('#modalCat').textContent=(p.category||'').toUpperCase();$('#modalName').textContent=p.name;$('#modalPrice').textContent=`EGP ${Number(p.price||0).toLocaleString()}`;$('#modalDesc').textContent=p.description||'';$('#modalSizes').innerHTML=(p.sizes||[]).map((s,i)=>`<button class="size ${i===0?'selected':''}">${escapeHtml(s)}</button>`).join('');$('#productModal').classList.add('open');$$('.size').forEach(b=>b.onclick=()=>{$$('.size').forEach(x=>x.classList.remove('selected'));b.classList.add('selected')})}
function addToCart(p=state.currentProduct){if(!p)return;const x=state.cart.find(i=>String(i.id)===String(p.id));x?x.qty++:state.cart.push({...p,qty:1});updateCart();closeProduct();openDrawer()}
function updateCart(){const count=state.cart.reduce((a,x)=>a+x.qty,0),total=state.cart.reduce((a,x)=>a+Number(x.price||0)*x.qty,0);$('#cartCount').textContent=count;$('#drawerTotal').textContent=`EGP ${total.toLocaleString()}`;$('#drawerItems').innerHTML=state.cart.length?state.cart.map(x=>`<div class="bag-row"><div class="bag-thumb">ONE</div><div><strong>${escapeHtml(x.name)}</strong><br><small>Qty ${x.qty}</small></div><div><b>EGP ${(Number(x.price||0)*x.qty).toLocaleString()}</b><br><button data-remove="${x.id}">REMOVE</button></div></div>`).join(''):`<div class="empty-bag">YOUR BAG IS EMPTY.</div>`;$$('[data-remove]').forEach(b=>b.onclick=()=>{state.cart=state.cart.filter(x=>String(x.id)!==String(b.dataset.remove));updateCart()})}
function openDrawer(){$('#drawer').classList.add('open');$('#overlay').classList.add('show');$('#drawer').setAttribute('aria-hidden','false')};function closeDrawer(){$('#drawer').classList.remove('open');$('#overlay').classList.remove('show');$('#drawer').setAttribute('aria-hidden','true')};function closeProduct(){$('#productModal').classList.remove('open')}
function checkout(){if(!state.cart.length)return;$('#checkoutSummary').innerHTML=state.cart.map(x=>`<div class="checkout-item"><span>${escapeHtml(x.name)} × ${x.qty}</span><b>EGP ${(Number(x.price||0)*x.qty).toLocaleString()}</b></div>`).join('');$('#checkoutModal').classList.add('open')}
function escapeHtml(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function openIntro(){const pull=$('#zipPull'),intro=$('#intro'),zipper=pull.closest('.zipper');let startY=null,startTop=0,dragging=false;const maxTravel=()=>Math.max(0,(zipper?.clientHeight||0)-pull.offsetHeight);const reset=()=>{pull.style.top='0px';pull.classList.remove('dragging')};const finish=()=>{if(state.introOpened)return;state.introOpened=true;pull.style.top=maxTravel()+'px';intro.classList.add('hide');document.body.classList.remove('lock')};pull.addEventListener('pointerdown',e=>{if(state.introOpened)return;e.preventDefault();dragging=true;startY=e.clientY;startTop=parseFloat(getComputedStyle(pull).top)||0;pull.setPointerCapture(e.pointerId);pull.classList.add('dragging')});pull.addEventListener('pointermove',e=>{if(!dragging||state.introOpened)return;e.preventDefault();const travel=maxTravel();const next=Math.max(0,Math.min(travel,startTop+(e.clientY-startY)));pull.style.top=next+'px';if(next>=travel*.88)finish()});pull.addEventListener('pointerup',()=>{if(!dragging)return;dragging=false;if(!state.introOpened)reset()});pull.addEventListener('pointercancel',()=>{dragging=false;if(!state.introOpened)reset()});}
function bind(){openIntro();$('#langBtn').onclick=()=>{state.lang=state.lang==='en'?'ar':'en';applyLang()};$('#searchInput').oninput=e=>{state.query=e.target.value;renderProducts()};$('#clearSearch').onclick=()=>{$('#searchInput').value='';state.query='';renderProducts()};$('#searchSubmit').onclick=()=>$('#searchInput').focus();$$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.category=b.dataset.cat;renderProducts()});$('#cartBtn').onclick=openDrawer;$('#closeDrawer').onclick=closeDrawer;$('#overlay').onclick=closeDrawer;$('#closeModal').onclick=closeProduct;$('#modalAdd').onclick=()=>addToCart();$('#checkoutBtn').onclick=checkout;$('#closeCheckout').onclick=()=>$('#checkoutModal').classList.remove('open');$('#checkoutForm').onsubmit=e=>{e.preventDefault();alert(state.lang==='ar'?'تم تجهيز الطلب كعرض تجريبي. عند ربط Odoo سيتم إنشاء الطلب هناك.':'Demo order ready. After the Odoo connection, the order will be created there.');$('#checkoutModal').classList.remove('open')};$('#menuBtn').onclick=()=>$('#mobileMenu').style.display='flex';$('#closeMenu').onclick=()=>$('#mobileMenu').style.display='none';$$('#mobileMenu a').forEach(a=>a.onclick=()=>$('#mobileMenu').style.display='none');$('#wishBtn').onclick=()=>{$('#shop').scrollIntoView({behavior:'smooth'});};}
window.addEventListener('DOMContentLoaded',()=>{bind();applyLang();setTimeout(()=>{$('#loader').style.opacity='0';setTimeout(()=>$('#loader').remove(),650)},900)});
// بيانات الربط مع أودو الخاصة بمتجرك
const ODOO_URL = "https://onesizee.odoo.com/jsonrpc";
const ODOO_DB = "onesizee";
const ODOO_EMAIL = "mohamedhanysaad660@gmail.com";
const ODOO_API_KEY = "e3f7c615b7c17c356c8d828c2c02cad9a48d9920";

// دالة لجلب المنتجات من قاعدة بيانات أودو
async function loadProducts() {
  try {
    // 1. تسجيل الدخول والتحقق
    const authResponse = await fetch(ODOO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "common",
          method: "authenticate",
          args: [ODOO_DB, ODOO_EMAIL, ODOO_API_KEY, {}]
        }
      })
    });

    const authData = await authResponse.json();
    const uid = authData.result;

    if (!uid) {
      console.error("فشل تسجيل الدخول لأودو");
      return;
    }

    // 2. سحب المنتجات وأسعارها ومخزونها
    const dataResponse = await fetch(ODOO_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            ODOO_DB,
            uid,
            ODOO_API_KEY,
            "product.template",
            "search_read",
            [[["sale_ok", "=", true]]], // جلب المنتجات القابلة للبيع
            { fields: ["id", "name", "list_price", "description_sale", "qty_available"] }
          ]
        }
      })
    });

    const productsData = await dataResponse.json();
    const products = productsData.result;

    console.log("المنتجات التي تم جلبها من أودو:", products);
    // من هنا يمكنك عرض المنتجات داخل صفحة الويب في الـ HTML
    return products;

  } catch (error) {
    console.error("حدث خطأ أثناء الاتصال بأودو:", error);
  }
}

// تشغيل الدالة لجلب المنتجات
loadProducts();
