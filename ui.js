// ═══════════════════════════════════════════
// GLOBAL STATE
// ═══════════════════════════════════════════
let cart      = [];
let wishlist  = [];
let curFilter = 'All';
let curPM     = null;
let selSz     = 'S';

// Hero slider state
let hsIdx=0, hsDur=5000, hsTimer=null, hsProgTimer=null, hsProg=0;

// ═══════════════════════════════════════════
// PAGE NAVIGATION
// ═══════════════════════════════════════════
const pageMap = {
  home:'homePage', shop:'shopPage', collections:'collectionsPage',
  new:'newPage', editorial:'editorialPage', about:'aboutPage',
  sustain:'sustainPage', contact:'contactPage', sizeguide:'sizePage',
  shipping:'shippingPage', returns:'returnsPage', journal:'journalPage',
};

function showPage(p) {
  document.querySelectorAll('.page').forEach(s => s.classList.remove('active'));
  const id = pageMap[p];
  if(id) document.getElementById(id).classList.add('active');
  if(p === 'home') renderGrid('homeGrid', products.slice(0,8));
  if(p === 'shop' || p === 'new') {
    const gridId = p === 'shop' ? 'shopGrid' : 'newGrid';
    renderGrid(gridId, products);
    document.querySelectorAll('.f-btn').forEach((b,i) => b.classList.toggle('active', i===0));
    curFilter = 'All';
  }
  window.scrollTo(0, 0);
}

function filterAndGo(tag) {
  showPage('shop');
  setTimeout(() => {
    curFilter = tag;
    const list = products.filter(p => p.cat===tag || p.tags.includes(tag));
    renderGrid('shopGrid', list);
    document.querySelectorAll('.f-btn').forEach(b => {
      b.classList.toggle('active',
        b.textContent.trim() === tag ||
        (tag==='New'     && b.textContent.trim()==='New Arrivals') ||
        (tag==='Women'   && b.textContent.trim()==='Women') ||
        (tag==='Men'     && b.textContent.trim()==='Men') ||
        (tag==='Accessories' && b.textContent.trim()==='Accessories')
      );
    });
  }, 50);
}

// ═══════════════════════════════════════════
// HERO SLIDER
// ═══════════════════════════════════════════

function startSlider() {
  clearTimeout(hsTimer); clearInterval(hsProgTimer);
  hsProg = 0;
  document.getElementById('hsBar').style.width = '0%';
  hsProgTimer = setInterval(() => {
    hsProg += 100/(hsDur/100);
    if(hsProg > 100) hsProg = 100;
    document.getElementById('hsBar').style.width = hsProg + '%';
  }, 100);
  hsTimer = setTimeout(() => heroSlide(1), hsDur);
}

function goSlide(i) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hs-dot');
  slides[hsIdx].classList.remove('active');
  dots[hsIdx].classList.remove('active');
  hsIdx = (i + slides.length) % slides.length;
  slides[hsIdx].classList.add('active');
  dots[hsIdx].classList.add('active');
  document.getElementById('hsNum').textContent = String(hsIdx+1).padStart(2,'0');
  startSlider();
}
function heroSlide(d) { goSlide(hsIdx + d); }

// Hero slider init — runs after DOM ready
let txStart = 0;
function initHeroSlider() {
  const sl = document.getElementById('heroSlider');
  if(!sl) return;
  sl.addEventListener('mouseenter', () => { clearTimeout(hsTimer); clearInterval(hsProgTimer); });
  sl.addEventListener('mouseleave', startSlider);
  sl.addEventListener('touchstart', e => { txStart = e.touches[0].clientX; }, {passive:true});
  sl.addEventListener('touchend',   e => {
    const d = txStart - e.changedTouches[0].clientX;
    if(Math.abs(d) > 50) heroSlide(d > 0 ? 1 : -1);
  });
}

// ═══════════════════════════════════════════
// RENDER PRODUCTS
// ═══════════════════════════════════════════
function renderGrid(id, list) {
  const g = document.getElementById(id);
  if(!g) return;
  if(!list || list.length === 0) {
    g.innerHTML = '<div class="empty"><div class="eico">👗</div><p>No products found</p></div>';
    return;
  }
  g.innerHTML = list.map(p => `
    <div class="card">
      <div class="card-img">
        <img src="${p.img}" alt="${p.name}" loading="lazy">
        <button class="wish-btn${wishlist.some(w=>w.id===p.id)?' active':''}" onclick="toggleWish(${p.id},event)">
          ${wishlist.some(w=>w.id===p.id)?'♥':'♡'}
        </button>
        <div class="card-overlay">
          <button class="qv-btn" onclick="openPM(${p.id},event)">Quick View</button>
          <button class="atc-btn" onclick="addCart(${p.id},event)">Add to Bag</button>
        </div>
      </div>
      <div class="card-info">
        <h3>${p.name}</h3>
        <div class="price"><strong>$${p.price}</strong></div>
      </div>
    </div>`).join('');
}

function filterProducts(f, btn) {
  curFilter = f;
  if(btn) {
    document.querySelectorAll('.f-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  const list = f==='All' ? products : products.filter(p => p.cat===f || p.tags.includes(f));
  renderGrid('shopGrid', list);
  renderGrid('newGrid',  list);
  if(document.getElementById('homePage').classList.contains('active'))
    renderGrid('homeGrid', products.slice(0,8));
}

// ═══════════════════════════════════════════
// PRODUCT MODAL
// ═══════════════════════════════════════════
function openPM(id, e) {
  if(e) e.stopPropagation();
  const p = products.find(x => x.id===id);
  if(!p) return;
  curPM = p;
  document.getElementById('pmName').textContent  = p.name;
  document.getElementById('pmPrice').textContent = '$' + p.price;
  document.getElementById('pmMain').src          = p.img;
  document.getElementById('pmThumbs').innerHTML  =
    ['?w=600','?w=600&q=70','?w=400','?w=600&fit=crop'].map((s,i) =>
      `<img src="${p.img}${s}" class="pm-thumb${i===0?' active':''}" onclick="changePMImg('${p.img}${s}',this)">`
    ).join('');
  const inW = wishlist.some(w => w.id===p.id);
  document.getElementById('pmWishBtn').textContent = inW ? '♥ Remove from Wishlist' : '♡ Add to Wishlist';
  document.querySelectorAll('.sz-opt').forEach((b,i) => b.classList.toggle('active', i===1));
  selSz = 'S';
  document.getElementById('productModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closePM() {
  document.getElementById('productModal').classList.remove('open');
  document.body.style.overflow = '';
  curPM = null;
}
function changePMImg(src, thumb) {
  document.getElementById('pmMain').src = src;
  document.querySelectorAll('.pm-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}
function selSize(btn) {
  document.querySelectorAll('.sz-opt').forEach(s => s.classList.remove('active'));
  btn.classList.add('active');
  selSz = btn.textContent.trim();
}
function pmAddCart()     { if(curPM){ addCart(curPM.id); closePM(); } }
function pmToggleWish()  {
  if(!curPM) return;
  toggleWish(curPM.id);
  const inW = wishlist.some(w => w.id===curPM.id);
  document.getElementById('pmWishBtn').textContent = inW ? '♥ Remove from Wishlist' : '♡ Add to Wishlist';
}

// ═══════════════════════════════════════════
// CART
// ═══════════════════════════════════════════
function addCart(id, e) {
  if(e) e.stopPropagation();
  const p = products.find(x => x.id===id);
  if(!p) return;
  const ex = cart.find(i => i.id===id);
  if(ex) ex.qty++;
  else cart.push({...p, qty:1, size:selSz});
  updateCart();
  showToast(p.name + ' added to bag ✓');
}
function rmCart(id)  { cart = cart.filter(i => i.id!==id); updateCart(); }
function updQty(id, d) {
  const item = cart.find(i => i.id===id);
  if(!item) return;
  item.qty += d;
  if(item.qty <= 0) rmCart(id);
  else updateCart();
}
function updateCart() {
  const total = cart.reduce((s,i) => s + i.price*i.qty, 0);
  document.getElementById('cartCount').textContent = cart.reduce((s,i) => s+i.qty, 0);
  document.getElementById('cartTotal').textContent = '$' + total.toFixed(2);
  document.getElementById('cartItems').innerHTML = cart.length === 0
    ? `<div class="empty"><div class="eico">🛍️</div><p>Your bag is empty</p></div>`
    : cart.map(item => `
      <div class="cart-item">
        <img src="${item.img}" class="ci-img" alt="${item.name}">
        <div class="ci-info">
          <h4>${item.name}</h4>
          <div class="ci-price">$${item.price} · Size ${item.size||'S'}</div>
          <div class="qty-row">
            <button class="qty-btn" onclick="updQty(${item.id},-1)">−</button>
            <span class="qty-n">${item.qty}</span>
            <button class="qty-btn" onclick="updQty(${item.id},1)">+</button>
          </div>
        </div>
        <button class="rm-btn" onclick="rmCart(${item.id})">Remove</button>
      </div>`).join('');
}

// ═══════════════════════════════════════════
// WISHLIST
// ═══════════════════════════════════════════
function toggleWish(id, e) {
  if(e) e.stopPropagation();
  const p = products.find(x => x.id===id);
  if(!p) return;
  const idx = wishlist.findIndex(w => w.id===id);
  if(idx > -1) { wishlist.splice(idx,1); showToast(p.name+' removed from wishlist'); }
  else         { wishlist.push(p);        showToast(p.name+' added to wishlist ♥'); }
  updateWish();
  if(document.getElementById('homePage').classList.contains('active'))  renderGrid('homeGrid',products.slice(0,8));
  if(document.getElementById('shopPage').classList.contains('active'))  filterProducts(curFilter);
  if(document.getElementById('newPage').classList.contains('active'))   renderGrid('newGrid',products);
}
function updateWish() {
  document.getElementById('wishCount').textContent = wishlist.length;
  document.getElementById('wishItems').innerHTML = wishlist.length === 0
    ? `<div class="empty"><div class="eico">♡</div><p>No items saved</p></div>`
    : wishlist.map(item => `
      <div class="wish-item">
        <span>${item.name} — $${item.price}</span>
        <button onclick="toggleWish(${item.id})">×</button>
      </div>`).join('');
}

// ═══════════════════════════════════════════
// DRAWERS  ← these were missing!
// ═══════════════════════════════════════════
function openDrawer(t) {
  const drawerId = t==='cart' ? 'cartDrawer' : 'wishDrawer';
  document.getElementById(drawerId).classList.add('active');
  document.getElementById('overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeDrawer(t) {
  const drawerId = t==='cart' ? 'cartDrawer' : 'wishDrawer';
  document.getElementById(drawerId).classList.remove('active');
  document.getElementById('overlay').classList.remove('show');
  document.body.style.overflow = '';
}
function closeAllDrawers() {
  document.querySelectorAll('.drawer').forEach(d => d.classList.remove('active'));
  document.getElementById('overlay').classList.remove('show');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════
// MODALS  ← these were missing!
// ═══════════════════════════════════════════
function openModal(t)  { document.getElementById(t+'Modal').classList.add('open');    }
function closeModal(t) { document.getElementById(t+'Modal').classList.remove('open'); }

// ═══════════════════════════════════════════
// SEARCH  ← this was missing!
// ═══════════════════════════════════════════
function openSearch() {
  document.getElementById('searchOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('searchInput').focus(), 80);
}
function closeSearch() {
  document.getElementById('searchOverlay').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('sClear').style.display = 'none';
  resetSResults();
}
function resetSResults() {
  document.getElementById('sResults').innerHTML = `
    <div class="s-empty">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.2" opacity=".3">
        <circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <p>Start typing to search</p>
    </div>`;
}
function clearSearch() {
  document.getElementById('searchInput').value = '';
  document.getElementById('sClear').style.display = 'none';
  resetSResults();
  document.getElementById('searchInput').focus();
}
function quickSearch(q) {
  document.getElementById('searchInput').value = q;
  runSearch(q);
}
function runSearch(q) {
  q = q.trim();
  document.getElementById('sClear').style.display = q ? 'block' : 'none';
  if(!q){ resetSResults(); return; }
  const ql = q.toLowerCase();
  const matched = products.filter(p =>
    p.name.toLowerCase().includes(ql) ||
    p.cat.toLowerCase().includes(ql)  ||
    p.tags.some(t => t.toLowerCase().includes(ql))
  );
  if(!matched.length) {
    document.getElementById('sResults').innerHTML =
      `<div class="s-noresult">No results for "<em>${q}</em>"</div>`;
    return;
  }
  document.getElementById('sResults').innerHTML = matched.map(p => `
    <div class="s-item" onclick="openFromSearch(${p.id})">
      <img src="${p.img}" class="s-item-img" alt="${p.name}">
      <div class="s-item-info">
        <div class="s-item-cat">${p.cat} · ${p.tags[0]}</div>
        <div class="s-item-name">${highlight(p.name, q)}</div>
        <div class="s-item-price">$${p.price}</div>
      </div>
      <button class="s-item-btn" onclick="cartFromSearch(${p.id},event)">Add to Bag</button>
    </div>`).join('');
}
function highlight(text, q) {
  const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return text.replace(re, '<em style="color:var(--accent);font-style:italic">$1</em>');
}
function openFromSearch(id)     { closeSearch(); showPage('shop'); setTimeout(() => openPM(id), 180); }
function cartFromSearch(id, e)  { e.stopPropagation(); addCart(id); closeSearch(); }

// ═══════════════════════════════════════════
// GALLERY LIGHTBOX
// ═══════════════════════════════════════════
const lbImgs = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200',
  'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=1200',
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200',
  'https://images.unsplash.com/photo-1551232864-3f0890e1777d?w=1200',
  'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=1200',
];
let lbIdx = 0;
function openLightbox(i) {
  lbIdx = i;
  document.getElementById('lbImg').src = lbImgs[i];
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}
function closeLb(e) { if(e.target===document.getElementById('lightbox')) closeLightbox(); }
function lbNav(d, e) {
  e.stopPropagation();
  lbIdx = (lbIdx + d + lbImgs.length) % lbImgs.length;
  const img = document.getElementById('lbImg');
  img.style.opacity = '0';
  setTimeout(() => { img.src = lbImgs[lbIdx]; img.style.opacity = '1'; }, 150);
}

// ═══════════════════════════════════════════
// SIZE GUIDE TABS
// ═══════════════════════════════════════════
function switchSzTab(tab, el) {
  document.querySelectorAll('.sg-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sg-tbl-wrap').forEach(w => w.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(tab==='women' ? 'womenSz' : 'menSz').classList.add('active');
}

// ═══════════════════════════════════════════
// FAQ
// ═══════════════════════════════════════════
function toggleFaq(el) { el.classList.toggle('open'); }

// ═══════════════════════════════════════════
// TOAST  ← this was missing!
// ═══════════════════════════════════════════
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ═══════════════════════════════════════════
// MOBILE NAV  ← this was missing!
// ═══════════════════════════════════════════
function toggleMobileNav() {
  document.getElementById('mobileNav').classList.toggle('open');
}

// ═══════════════════════════════════════════
// KEYBOARD NAVIGATION
// ═══════════════════════════════════════════
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') {
    closePM();
    closeModal('login');
    closeModal('otp');
    closeAllDrawers();
    closeSearch();
    closeLightbox();
  }
  if(document.getElementById('lightbox').classList.contains('open')) {
    if(e.key === 'ArrowLeft')  lbNav(-1, e);
    if(e.key === 'ArrowRight') lbNav(1,  e);
  } else {
    if(e.key === 'ArrowLeft')  heroSlide(-1);
    if(e.key === 'ArrowRight') heroSlide(1);
  }
});

// ═══════════════════════════════════════════
// ADMIN (triple-click logo)
// ═══════════════════════════════════════════
let lClicks=0, lTimer=null;
function initAdminPanel() {
  const logoEl = document.getElementById('logoEl');
  if(!logoEl) return;
  logoEl.addEventListener('click', () => {
  lClicks++;
  clearTimeout(lTimer);
  lTimer = setTimeout(() => lClicks=0, 900);
  if(lClicks === 3) {
    const p = document.getElementById('adminPanel');
    p.style.display = p.style.display==='block' ? 'none' : 'block';
    lClicks = 0;
  }
  });
}

async function addProduct() {
  const name  = document.getElementById('aName').value.trim();
  const price = parseInt(document.getElementById('aPrice').value);
  const img   = document.getElementById('aImg').value.trim();
  const cat   = document.getElementById('aCat')?.value || 'Women';
  if(!name||!price||!img){ showToast('Fill all fields'); return; }

  const newProduct = {id:Date.now(), name, price, img, cat, tags:['New'], desc:''};
  showToast('Saving product...');

  const saved = await saveProductToSupabase(newProduct);
  if(saved && saved[0]) {
    newProduct.id = saved[0].id;
    showToast('✓ Product saved to Supabase!');
  } else {
    showToast('✓ Product added locally!');
  }

  products.push(newProduct);
  document.getElementById('aName').value  = '';
  document.getElementById('aPrice').value = '';
  document.getElementById('aImg').value   = '';
  renderGrid('homeGrid', products.slice(0,8));
  renderGrid('shopGrid', products);
  renderGrid('newGrid',  products);
}
